document.documentElement.classList.add('has-js');

// --- Background FX: simple moving stars on canvas (no deps) ---
(function stars(){
  let c = document.getElementById('bgfx');
  if(!c){
    c = document.createElement('canvas');
    c.id = 'bgfx';
    c.setAttribute('aria-hidden', 'true');
    if(document.body){
      if(typeof document.body.prepend === 'function'){
        document.body.prepend(c);
      } else {
        document.body.insertBefore(c, document.body.firstChild || null);
      }
    }
  }
  if(!c) return;
  const ctx = c.getContext('2d');
  let W,H,stars=[];
  function resize(){
    W = c.width = innerWidth;
    H = c.height = innerHeight;
    stars = Array.from(
      {length: Math.min(220, Math.floor(W*H/12000))},
      ()=>({x:Math.random()*W,y:Math.random()*H,z:Math.random()*0.8+0.2,s:Math.random()*1.5+0.2})
    );
  }
  addEventListener('resize', resize); resize();
  (function loop(){
    ctx.clearRect(0,0,W,H);
    for(const p of stars){
      p.y += p.s*0.35; p.x += Math.sin(p.y*0.01)*0.15;
      if(p.y>H) { p.y=0; p.x=Math.random()*W; }
      ctx.globalAlpha = p.z; ctx.fillStyle = '#8fd3ff';
      ctx.fillRect(p.x,p.y,p.s,p.s);
    }
    requestAnimationFrame(loop);
  })();
})();

// --- Catálogo de juegos: búsqueda + filtros ---
(function(){
  var roots = document.querySelectorAll('[data-catalog-root]');
  if(!roots.length) return;

  roots.forEach(function(root){
    var list = root.querySelector('[data-catalog-grid]');
    if(!list) return;

    var cards = Array.prototype.slice.call(list.querySelectorAll('.card'));
    if(!cards.length) return;

    var q = root.querySelector('#q');
    var inputs = {
      console: root.querySelector('#filter-console'),
      developer: root.querySelector('#filter-developer'),
      genre: root.querySelector('#filter-genre')
    };
    var sortSelect = root.querySelector('#filter-sort');
    var resetBtn = root.querySelector('#filter-reset');
    var emptyState = root.querySelector('[data-catalog-empty]');

    function normalise(str){
      if(!str) return '';
      var value = String(str).toLowerCase().trim();
      if(typeof value.normalize === 'function'){
        value = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }
      return value;
    }

    function parseNumber(value){
      var num = Number(value);
      return Number.isFinite(num) ? num : 0;
    }

    function parseDate(value){
      if(!value) return 0;
      var timestamp = Date.parse(value);
      return isNaN(timestamp) ? 0 : timestamp;
    }

    function toListTokens(str){
      if(!str) return [];
      return String(str)
        .split(/[,/|]/)
        .map(function(token){ return token.trim(); })
        .filter(Boolean);
    }

    function toWordTokens(str){
      if(!str) return [];
      return normalise(str)
        .replace(/[^a-z0-9]+/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
    }

    function collectText(card){
      var data = card.dataset || {};
      var parts = [data.title, data.desc, data.tags];
      var titleEl = card.querySelector('.card-title');
      var descEl = card.querySelector('.card-desc');
      if(titleEl) parts.push(titleEl.textContent);
      if(descEl) parts.push(descEl.textContent);
      parts.push(card.textContent);
      return parts.filter(Boolean).join(' ');
    }

    var dataset = cards.map(function(card, index){
      var data = card.dataset || {};
      var consoleLabel = data.console || '';
      var developerLabel = data.developer || '';
      var genreLabel = data.genre || '';
      var genres = toListTokens(genreLabel);
      var fullText = collectText(card);
      var textTokens = toWordTokens(fullText);
      var titleTokens = toWordTokens(data.title || '');

      return {
        card: card,
        text: normalise(fullText),
        tokenSet: new Set(textTokens),
        titleTokens: new Set(titleTokens),
        consoleLabel: consoleLabel.trim(),
        developerLabel: developerLabel.trim(),
        genreLabels: genres,
        consoleValue: normalise(consoleLabel),
        developerValue: normalise(developerLabel),
        genreValues: genres.map(normalise),
        interactionCount: parseNumber(data.clicks),
        searchCount: parseNumber(data.searches),
        publishedValue: parseDate(data.published),
        matchScore: 0,
        recencyScore: 0,
        originalIndex: index
      };
    });

    var valueSets = {
      console: new Set(),
      developer: new Set(),
      genre: new Set()
    };

    dataset.forEach(function(entry){
      if(entry.consoleLabel){
        valueSets.console.add(entry.consoleLabel);
      }
      if(entry.developerLabel){
        valueSets.developer.add(entry.developerLabel);
      }
      entry.genreLabels.forEach(function(label){
        if(label) valueSets.genre.add(label);
      });
    });

    function populateDatalist(input, values){
      if(!input) return;
      var listId = input.getAttribute('list');
      if(!listId) return;
      var doc = input.ownerDocument;
      var datalist = doc.getElementById(listId);
      if(!datalist) return;

      var fragment = doc.createDocumentFragment();
      Array.from(values)
        .sort(function(a, b){ return a.localeCompare(b, 'es', {sensitivity: 'base'}); })
        .forEach(function(value){
          var option = doc.createElement('option');
          option.value = value;
          fragment.appendChild(option);
        });

      datalist.innerHTML = '';
      datalist.appendChild(fragment);
    }

    populateDatalist(inputs.console, valueSets.console);
    populateDatalist(inputs.developer, valueSets.developer);
    populateDatalist(inputs.genre, valueSets.genre);

    var state = {
      term: '',
      termTokens: [],
      console: '',
      developer: '',
      genre: '',
      sort: sortSelect ? (sortSelect.value || 'relevance') : 'relevance'
    };

    function matchesTerm(entry){
      if(!state.termTokens.length) return true;
      return state.termTokens.every(function(token){
        return entry.tokenSet.has(token) || entry.text.indexOf(token) !== -1;
      });
    }

    function updateMatchScore(entry){
      if(!state.termTokens.length){
        entry.matchScore = 0;
        return;
      }
      var score = 0;
      state.termTokens.forEach(function(token){
        if(entry.titleTokens.has(token)){
          score += 30;
        } else if(entry.tokenSet.has(token)){
          score += 12;
        } else if(entry.text.indexOf(token) !== -1){
          score += 6;
        }
      });
      entry.matchScore = score;
    }

    function updateRecency(entry){
      entry.recencyScore = entry.publishedValue ? (entry.publishedValue / 86400000) : 0;
    }

    function computeRelevanceScore(entry){
      return (entry.matchScore || 0) * 12 + (entry.interactionCount || 0) * 5 + (entry.searchCount || 0) * 3 + (entry.recencyScore || 0);
    }

    function computeSearchScore(entry){
      return (entry.searchCount || 0) * 15 + (entry.interactionCount || 0) * 4 + (entry.recencyScore || 0);
    }

    function computeNewScore(entry){
      return (entry.publishedValue || 0) + (entry.interactionCount || 0) * 10000 + (entry.searchCount || 0) * 5000;
    }

    function sortEntries(entries){
      return entries.slice().sort(function(a, b){
        var diff;
        if(state.sort === 'searches'){
          diff = computeSearchScore(b) - computeSearchScore(a);
        } else if(state.sort === 'new'){
          diff = computeNewScore(b) - computeNewScore(a);
        } else {
          diff = computeRelevanceScore(b) - computeRelevanceScore(a);
        }
        if(diff === 0){
          return a.originalIndex - b.originalIndex;
        }
        return diff;
      });
    }

    function applyFilters(){
      var visibleEntries = [];

      dataset.forEach(function(entry){
        var visible = matchesTerm(entry);

        if(visible && state.console){
          visible = entry.consoleValue.indexOf(state.console) !== -1;
        }

        if(visible && state.developer){
          visible = entry.developerValue.indexOf(state.developer) !== -1;
        }

        if(visible && state.genre){
          visible = entry.genreValues.some(function(value){
            return value.indexOf(state.genre) !== -1;
          });
        }

        entry.card.style.display = visible ? '' : 'none';

        if(visible){
          updateMatchScore(entry);
          updateRecency(entry);
          visibleEntries.push(entry);
        }
      });

      var sortedEntries = sortEntries(visibleEntries);
      sortedEntries.forEach(function(entry, index){
        entry.card.style.order = index;
        list.appendChild(entry.card);
      });

      if(emptyState){
        emptyState.hidden = sortedEntries.length > 0;
      }
    }

    if(q){
      q.addEventListener('input', function(){
        state.term = normalise(q.value);
        state.termTokens = toWordTokens(q.value);
        applyFilters();
      });
    }

    Object.keys(inputs).forEach(function(key){
      var input = inputs[key];
      if(!input) return;
      var handler = function(){
        state[key] = normalise(input.value);
        applyFilters();
      };
      input.addEventListener('input', handler);
      input.addEventListener('change', handler);
    });

    if(sortSelect){
      sortSelect.addEventListener('change', function(){
        state.sort = sortSelect.value || 'relevance';
        applyFilters();
      });
    }

    if(resetBtn){
      resetBtn.addEventListener('click', function(){
        state.term = '';
        state.termTokens = [];
        state.console = '';
        state.developer = '';
        state.genre = '';
        if(q) q.value = '';
        Object.keys(inputs).forEach(function(key){
          if(inputs[key]){
            inputs[key].value = '';
          }
        });
        if(sortSelect){
          sortSelect.value = 'relevance';
          state.sort = 'relevance';
        }
        applyFilters();
        if(q){
          q.focus();
        }
      });
    }

    applyFilters();
  });
})();
// --- Calculadora de hardware para emuladores ---
(function(){
  const section = document.getElementById('hardware-advisor');
  if(!section) return;

  const form = section.querySelector('#hardware-form');
  const result = section.querySelector('#hardware-result');
  const status = section.querySelector('#hardware-status');
  const cpuInput = section.querySelector('#hw-cpu');
  const gpuInput = section.querySelector('#hw-gpu');
  const ramInput = section.querySelector('#hw-ram');
  const targetSelect = section.querySelector('#hw-target');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const cpuList = section.querySelector('#hw-cpu-list');
  const gpuList = section.querySelector('#hw-gpu-list');

  if(!form || !result || !status || !cpuInput || !gpuInput || !ramInput || !targetSelect || !submitBtn || !cpuList || !gpuList){
    return;
  }

  const datasetUrl = section.dataset.source || '/static/data/hardware-tiers.json';
  const normalise = str => (str || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();

  let tiers = [];
  let source = {};

  const controls = [cpuInput, gpuInput, ramInput, targetSelect, submitBtn];
  const toggleDisabled = state => controls.forEach(ctrl => ctrl.disabled = state);
  toggleDisabled(true);

  function optionList(values){
    return Array.from(values)
      .sort((a,b) => a.localeCompare(b, 'es', {sensitivity:'base'}))
      .map(value => `<option value="${value.replace(/"/g,'&quot;')}"></option>`)
      .join('');
  }

  function findTier(cpuNorm, gpuNorm, ram){
    const matchesCpu = tier => (tier.cpus || []).some(cpu => normalise(cpu) === cpuNorm);
    const matchesGpu = tier => (tier.gpus || []).some(gpu => normalise(gpu) === gpuNorm);

    let match = tiers.find(tier => matchesCpu(tier) && matchesGpu(tier));
    if(match) return match;

    match = tiers.find(tier => matchesGpu(tier));
    if(match) return match;

    match = tiers.find(tier => matchesCpu(tier));
    if(match) return match;

    const sorted = [...tiers].sort((a,b) => (a.score || 0) - (b.score || 0));
    let fallback = sorted[0] || null;
    for(const tier of sorted){
      if(ram >= (tier.min_ram || 0)){
        fallback = tier;
      }
    }
    return fallback;
  }

  function render(tier, targetKey, ram, cpuLabel, gpuLabel){
    if(!tier){
      result.hidden = true;
      status.innerHTML = '<p class="hardware-warn">No se encontró un perfil compatible. Intenta con otro componente similar.</p>';
      return;
    }

    const targets = tier && tier.targets ? tier.targets : null;
    let target = null;
    if(targets && typeof targets === 'object'){
      if(Object.prototype.hasOwnProperty.call(targets, targetKey)){
        target = targets[targetKey];
      } else if(Object.prototype.hasOwnProperty.call(targets, 'general')){
        target = targets.general;
      }
    }
    const warnRam = typeof tier.min_ram === 'number' && ram && ram < tier.min_ram;
    const notes = Array.isArray(tier.notes) ? tier.notes : [];

    const summary = target ? `
      <div class="hardware-summary">
        <span><i class="ti ti-screen-share"></i>Resolución: ${target.resolution || '—'}</span>
        <span><i class="ti ti-activity"></i>FPS objetivo: ${target.fps || '—'}</span>
        <span><i class="ti ti-adjustments-horizontal"></i>Preset: ${target.preset || '—'}</span>
      </div>
    ` : '';

    const tips = target && Array.isArray(target.tips) && target.tips.length ? `
      <div>
        <h4>Consejos rápidos</h4>
        <ul>${target.tips.map(tip => `<li>${tip}</li>`).join('')}</ul>
      </div>
    ` : '';

    const extraNotes = notes.length ? `
      <div class="hardware-notes">
        ${notes.map(note => `<span><i class="ti ti-info-circle"></i> ${note}</span>`).join('')}
      </div>
    ` : '';

    const ramWarning = warnRam ? `<p class="hardware-warn"><i class="ti ti-alert-triangle"></i> Tu RAM (${ram} GB) está por debajo de lo sugerido (${tier.min_ram} GB). Considera cerrar aplicaciones o activar el modo dock portátil.</p>` : '';

    const combos = `
      <div class="hardware-notes">
        <span><i class="ti ti-cpu"></i> CPU compatibles: ${(tier.cpus || []).join(', ') || 'N/D'}</span>
        <span><i class="ti ti-device-laptop"></i> GPU compatibles: ${(tier.gpus || []).join(', ') || 'N/D'}</span>
        <span><i class="ti ti-user"></i> Tu elección: ${cpuLabel || '—'} + ${gpuLabel || '—'} (${ram} GB RAM)</span>
      </div>
    `;

    const sourceLabel = source && source.name ? `<span><i class="ti ti-database"></i>Fuente: ${source.name}</span>` : '';

    result.hidden = false;
    result.innerHTML = `
      <h3>${tier.label}</h3>
      <div class="hardware-meta">
        <span><i class="ti ti-gauge"></i>Puntuación estimada: ${tier.score || 'N/D'}</span>
        <span><i class="ti ti-device-desktop"></i>RAM sugerida: ${tier.min_ram || '—'} GB</span>
        ${sourceLabel}
      </div>
      ${summary}
      ${tips}
      ${combos}
      ${extraNotes}
      ${ramWarning}
    `;

    status.innerHTML = '';
  }

  function evaluate(evt){
    if(evt && typeof evt.preventDefault === 'function'){
      evt.preventDefault();
    }
    if(!tiers.length){
      status.innerHTML = '<p class="hardware-warn">Aún no se han cargado los perfiles. Espera un momento e inténtalo de nuevo.</p>';
      return;
    }

    const cpuValue = cpuInput.value.trim();
    const gpuValue = gpuInput.value.trim();
    const ramValue = parseInt(ramInput.value, 10) || 0;
    const targetKey = targetSelect.value || 'general';

    if(!cpuValue || !gpuValue){
      result.hidden = true;
      status.innerHTML = '<p>Introduce tu CPU y GPU para calcular una recomendación.</p>';
      return;
    }

    const tier = findTier(normalise(cpuValue), normalise(gpuValue), ramValue);
    render(tier, targetKey, ramValue, cpuValue, gpuValue);
  }

  fetch(datasetUrl)
    .then(resp => {
      if(!resp.ok) throw new Error(resp.statusText || 'Network error');
      return resp.json();
    })
    .then(data => {
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.tiers) ? data.tiers : []);
      if(!list.length) throw new Error('Dataset vacío');
      tiers = list;
      source = data && typeof data.source === 'object' ? data.source : {};

      const cpuValues = new Set();
      const gpuValues = new Set();
      tiers.forEach(tier => {
        (tier.cpus || []).forEach(cpu => cpuValues.add(cpu));
        (tier.gpus || []).forEach(gpu => gpuValues.add(gpu));
      });

      cpuList.innerHTML = optionList(cpuValues);
      gpuList.innerHTML = optionList(gpuValues);

      toggleDisabled(false);
      status.innerHTML = `<p>Base actualizada ${data.updated ? 'el ' + data.updated : 'recientemente'}. Completa los campos y pulsa "Calcular recomendación".</p>`;
      cpuInput.focus();
    })
    .catch(() => {
      status.innerHTML = '<p class="hardware-warn">No se pudo cargar la base de datos de hardware. Comprueba tu conexión e inténtalo más tarde.</p>';
    });

  form.addEventListener('submit', evaluate);
  [cpuInput, gpuInput].forEach(input => {
    input.addEventListener('change', evaluate);
    input.addEventListener('blur', () => { if(input.value.trim()) evaluate(); });
  });
  ramInput.addEventListener('input', () => {
    if(!ramInput.checkValidity()) return;
    if(ramInput.value) evaluate();
  });
  targetSelect.addEventListener('change', evaluate);
})();

// --- Theme toggle (light / dark) ---
(function(){
  var toggle = document.querySelector('[data-theme-toggle]');
  if(!toggle) return;

  var root = document.documentElement;
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  var STORAGE_KEY = 'apollo-theme';

  function setMetaColor(theme){
    if(!metaTheme) return;
    metaTheme.setAttribute('content', theme === 'light' ? '#f5f7ff' : '#0b1020');
  }

  function setIcon(theme){
    var icon = toggle.querySelector('i');
    if(!icon) return;
    icon.className = 'ti ' + (theme === 'light' ? 'ti-sun' : 'ti-moon-stars');
    toggle.setAttribute('data-theme-icon', theme === 'light' ? 'sun' : 'moon');
  }

  function applyTheme(theme, persist){
    var next = theme === 'light' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    toggle.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false');
    setIcon(next);
    setMetaColor(next);
    if(persist){
      try{
        localStorage.setItem(STORAGE_KEY, next);
      }catch(err){/* ignore storage errors */}
    }
  }

  function resolveInitialTheme(){
    try{
      var saved = localStorage.getItem(STORAGE_KEY);
      if(saved === 'light' || saved === 'dark'){
        return saved;
      }
    }catch(err){/* storage unavailable */}
    if(window.matchMedia){
      var prefersLight = window.matchMedia('(prefers-color-scheme: light)');
      if(typeof prefersLight.matches === 'boolean'){
        return prefersLight.matches ? 'light' : 'dark';
      }
    }
    return 'dark';
  }

  applyTheme(resolveInitialTheme(), false);

  toggle.addEventListener('click', function(){
    var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light', true);
  });
})();

// --- Responsive navigation toggle ---
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('site-menu');
  if(!toggle || !menu) return;

  const nav = toggle.closest('.nav');
  const mq = window.matchMedia('(max-width: 768px)');

  function setState(open){
    if(open){
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      if(mq.matches){
        if(nav) nav.classList.add('menu-open');
        document.body.classList.add('no-scroll');
      }
    } else {
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      if(nav) nav.classList.remove('menu-open');
      document.body.classList.remove('no-scroll');
    }
  }

  function applyResponsive(){
    if(mq.matches){
      setState(false);
    } else {
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'false');
      if(nav) nav.classList.remove('menu-open');
      document.body.classList.remove('no-scroll');
    }
  }

  toggle.addEventListener('click', () => {
    if(mq.matches){
      const isOpen = menu.classList.contains('open');
      setState(!isOpen);
    }
  });

  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    if(mq.matches){
      setState(false);
    }
  }));

  document.addEventListener('keydown', evt => {
    if(evt.key === 'Escape' && mq.matches && menu.classList.contains('open')){
      setState(false);
    }
  });

  mq.addEventListener('change', applyResponsive);

  applyResponsive();
})();

// --- Scroll to top helper ---
(function(){
  const button = document.querySelector('[data-scroll-top]');
  if(!button) return;

  const root = document.documentElement;

  function toggleVisibility(){
    const shouldShow = (root.scrollTop || document.body.scrollTop || 0) > 240;
    button.classList.toggle('is-visible', shouldShow);
  }

  button.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  });

  document.addEventListener('scroll', toggleVisibility, {passive: true});
  toggleVisibility();
})();

// --- Foros comunitarios (almacenados en el navegador) ---
(function(){
  const board = document.getElementById('foro-tablero');
  if(!board) return;

  const storageKey = 'apolloCommunityPosts';
  const sessionKey = 'apolloForumSessionId';
  const topics = Array.from(board.querySelectorAll('.forum-topic'));
  const remoteSource = board.dataset.forumSource || '';
  let remoteData = null;
  let initialised = false;

  function createSessionId(){
    if(typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'){
      return crypto.randomUUID();
    }
    return 'sess-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function ensureSessionId(){
    try {
      let id = localStorage.getItem(sessionKey);
      if(!id){
        id = createSessionId();
        localStorage.setItem(sessionKey, id);
      }
      return id;
    } catch(err){
      console.warn('No se pudo asegurar el id de sesión del foro', err);
      return createSessionId();
    }
  }

  const sessionId = ensureSessionId();

  function readStore(){
    try {
      const raw = localStorage.getItem(storageKey);
      if(!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch(err){
      console.warn('No se pudieron leer los mensajes del foro', err);
      return {};
    }
  }

  function writeStore(data){
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      document.dispatchEvent(new CustomEvent('apollo:forum-updated', {detail: {data}}));
    } catch(err){
      console.error('No se pudieron guardar los mensajes del foro', err);
    }
  }

  function getPosts(store, key){
    const posts = store[key];
    return Array.isArray(posts) ? posts : [];
  }

  function normaliseRemotePost(raw){
    if(!raw || typeof raw !== 'object') return null;
    const post = {
      id: raw.id ? String(raw.id) : '',
      alias: raw.alias ? String(raw.alias) : '',
      contact: raw.contact ? String(raw.contact) : '',
      message: raw.message ? String(raw.message) : '',
      createdAt: raw.createdAt || null,
      updatedAt: raw.updatedAt || null,
      sessionId: raw.sessionId ? String(raw.sessionId) : 'remote'
    };

    if(!post.message){
      return null;
    }

    if(!post.createdAt){
      post.createdAt = new Date().toISOString();
    }

    if(!post.id){
      post.id = `remote-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    }

    if(!post.sessionId){
      post.sessionId = 'remote';
    }

    return post;
  }

  function mergeRemoteData(store){
    if(!remoteData || typeof remoteData !== 'object'){
      return store;
    }

    const next = { ...store };
    let changed = false;

    Object.keys(remoteData).forEach(key => {
      const remotePosts = Array.isArray(remoteData[key]) ? remoteData[key] : [];
      if(!remotePosts.length) return;

      const currentSource = getPosts(store, key);
      const current = currentSource.map(post => ({ ...post }));
      const byId = new Map(current.map(post => [post.id, post]));
      let keyChanged = false;

      remotePosts.forEach(raw => {
        const remotePost = normaliseRemotePost(raw);
        if(!remotePost) return;

        const existing = byId.get(remotePost.id);
        if(existing){
          let updated = false;
          if(!existing.alias && remotePost.alias){
            existing.alias = remotePost.alias;
            updated = true;
          }
          if(!existing.contact && remotePost.contact){
            existing.contact = remotePost.contact;
            updated = true;
          }
          if(!existing.message && remotePost.message){
            existing.message = remotePost.message;
            updated = true;
          }
          if(!existing.createdAt && remotePost.createdAt){
            existing.createdAt = remotePost.createdAt;
            updated = true;
          }
          if(!existing.updatedAt && remotePost.updatedAt){
            existing.updatedAt = remotePost.updatedAt;
            updated = true;
          }
          if(!existing.sessionId){
            existing.sessionId = remotePost.sessionId;
            updated = true;
          }
          if(updated){
            keyChanged = true;
          }
        } else {
          current.push(remotePost);
          byId.set(remotePost.id, remotePost);
          keyChanged = true;
        }
      });

      if(keyChanged){
        next[key] = current;
        changed = true;
      }
    });

    return changed ? next : store;
  }

  function readWithRemote(){
    const local = readStore();
    const merged = mergeRemoteData(local);
    if(merged !== local){
      writeStore(merged);
      return merged;
    }
    return local;
  }

  function ensureStatus(form){
    let status = form.querySelector('.form-status');
    if(!status){
      status = document.createElement('p');
      status.className = 'form-status';
      status.setAttribute('aria-live', 'polite');
      form.appendChild(status);
    }
    return status;
  }

  function showStatus(form, message, isError){
    const status = ensureStatus(form);
    status.textContent = message || '';
    status.classList.toggle('error', !!isError);
  }

  function formatDate(value){
    const date = new Date(value);
    if(Number.isNaN(date.getTime())){
      return new Date();
    }
    return date;
  }

  function renderTopic(topic, store){
    const key = topic.dataset.topicKey;
    const feed = topic.querySelector('[data-topic-feed]');
    if(!key || !feed) return;
    const data = store || readWithRemote();
    const posts = getPosts(data, key);
    feed.innerHTML = '';

    if(!posts.length){
      const empty = document.createElement('p');
      empty.className = 'forum-empty';
      empty.textContent = 'Todavía no hay mensajes aquí. Sé el primero en escribir.';
      feed.appendChild(empty);
      return;
    }

    const sorted = posts.slice().sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    let needsSync = false;

    sorted.forEach(post => {
      if(!post.sessionId){
        post.sessionId = sessionId;
        needsSync = true;
      }
      const ownsPost = post.sessionId === sessionId;

      const article = document.createElement('article');
      article.className = 'forum-post';
      article.dataset.postId = post.id;

      const header = document.createElement('div');
      header.className = 'forum-post-header';

      const alias = document.createElement('p');
      alias.className = 'forum-post-alias';
      alias.textContent = post.alias || 'Anónimo';
      header.appendChild(alias);

      const meta = document.createElement('div');
      meta.className = 'forum-post-meta';

      if(post.contact){
        const contact = document.createElement('span');
        contact.textContent = post.contact;
        meta.appendChild(contact);
      }

      const createdDate = formatDate(post.createdAt || Date.now());
      const time = document.createElement('time');
      time.dateTime = createdDate.toISOString();
      time.textContent = createdDate.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      meta.appendChild(time);

      if(post.updatedAt){
        const updatedDate = formatDate(post.updatedAt);
        const updated = document.createElement('span');
        updated.textContent = `Editado ${updatedDate.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}`;
        meta.appendChild(updated);
      }

      header.appendChild(meta);
      article.appendChild(header);

      const body = document.createElement('p');
      body.className = 'forum-post-body';
      body.textContent = post.message;
      article.appendChild(body);

      if(ownsPost){
        const actions = document.createElement('div');
        actions.className = 'forum-post-actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn alt';
        editBtn.textContent = 'Editar';
        editBtn.setAttribute('data-topic-action', 'edit');
        editBtn.setAttribute('data-post-id', post.id);
        actions.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn danger';
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.setAttribute('data-topic-action', 'delete');
        deleteBtn.setAttribute('data-post-id', post.id);
        actions.appendChild(deleteBtn);

        article.appendChild(actions);
      } else {
        const note = document.createElement('p');
        note.className = 'forum-post-note';
        note.textContent = 'Solo el autor puede editar o eliminar este mensaje.';
        article.appendChild(note);
      }

      feed.appendChild(article);
    });

    if(needsSync){
      data[key] = posts;
      setTimeout(() => writeStore(data), 0);
    }
  }

  function renderAll(store){
    const data = store || readWithRemote();
    topics.forEach(topic => renderTopic(topic, data));
  }

  function initialiseBoard(){
    const store = readWithRemote();
    renderAll(store);
    initialised = true;
  }

  initialiseBoard();

  if(remoteSource){
    fetch(remoteSource, {cache: 'no-store'})
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if(data && typeof data === 'object'){
          remoteData = data;
          const merged = readWithRemote();
          renderAll(merged);
        }
      })
      .catch(err => {
        console.warn('No se pudo cargar el feed remoto del foro', err);
      });
  }

  board.addEventListener('submit', evt => {
    const form = evt.target.closest('[data-topic-form]');
    if(!form) return;
    evt.preventDefault();

    const topic = form.closest('.forum-topic');
    const key = topic ? topic.dataset.topicKey : '';
    if(!key){
      showStatus(form, 'No se pudo identificar el hilo.', true);
      return;
    }

    const alias = (form.alias.value || '').trim();
    const contact = (form.contacto.value || '').trim();
    const message = (form.mensaje.value || '').trim();

    if(alias.length < 2){
      showStatus(form, 'Indica un alias de al menos 2 caracteres.', true);
      form.alias.focus();
      return;
    }

    if(message.length < 4){
      showStatus(form, 'El mensaje debe tener al menos 4 caracteres.', true);
      form.mensaje.focus();
      return;
    }

    let store = readWithRemote();
    const posts = getPosts(store, key);
    const now = new Date().toISOString();
    const editingId = form.dataset.editingId;

    if(editingId){
      const entry = posts.find(post => post.id === editingId);
      if(entry){
        if(entry.sessionId && entry.sessionId !== sessionId){
          showStatus(form, 'Solo puedes actualizar mensajes creados desde esta sesión.', true);
          form.classList.remove('is-editing');
          delete form.dataset.editingId;
          return;
        }
        entry.sessionId = entry.sessionId || sessionId;
        entry.alias = alias;
        entry.contact = contact;
        entry.message = message;
        entry.updatedAt = now;
      }
    } else {
      posts.push({
        id: Date.now().toString(),
        alias,
        contact,
        message,
        createdAt: now,
        sessionId
      });
    }

    store[key] = posts;
    writeStore(store);

    form.reset();
    form.classList.remove('is-editing');
    delete form.dataset.editingId;
    showStatus(form, editingId ? 'Mensaje actualizado.' : 'Mensaje publicado.');
    renderTopic(topic, store);
  });

  board.addEventListener('click', evt => {
    const clearBtn = evt.target.closest('[data-topic-clear]');
    if(clearBtn){
      const form = clearBtn.closest('[data-topic-form]');
      if(form){
        form.reset();
        form.classList.remove('is-editing');
        delete form.dataset.editingId;
        showStatus(form, 'Formulario limpio.');
      }
      return;
    }

    const actionBtn = evt.target.closest('[data-topic-action]');
    if(!actionBtn) return;

    const action = actionBtn.dataset.topicAction;
    const topic = actionBtn.closest('.forum-topic');
    if(!topic) return;
    const key = topic.dataset.topicKey;
    const form = topic.querySelector('[data-topic-form]');
    let store = readWithRemote();
    const posts = getPosts(store, key);
    const id = actionBtn.dataset.postId;
    const entry = posts.find(post => post.id === id);

    if(entry && !entry.sessionId){
      entry.sessionId = sessionId;
      store[key] = posts;
      writeStore(store);
    }

    const ownsPost = entry && entry.sessionId === sessionId;

    if(!ownsPost){
      window.alert('Solo puedes gestionar los mensajes creados desde esta sesión.');
      return;
    }

    if(action === 'edit'){
      if(!entry || !form) return;
      form.alias.value = entry.alias || '';
      form.contacto.value = entry.contact || '';
      form.mensaje.value = entry.message || '';
      form.dataset.editingId = entry.id;
      form.classList.add('is-editing');
      showStatus(form, 'Editando mensaje. Actualiza y pulsa "Publicar mensaje".');
      form.alias.focus();
    } else if(action === 'delete'){
      if(!entry) return;
      const confirmation = window.confirm('¿Eliminar este mensaje?');
      if(!confirmation){
        return;
      }
      const filtered = posts.filter(post => post.id !== id);
      store[key] = filtered;
      writeStore(store);
      if(form && form.dataset.editingId === id){
        form.reset();
        form.classList.remove('is-editing');
        delete form.dataset.editingId;
        showStatus(form, 'Mensaje eliminado.');
      }
      renderTopic(topic, store);
    }
  });

  document.addEventListener('apollo:forum-updated', () => {
    if(!initialised) return;
    renderAll();
  });

  window.addEventListener('storage', evt => {
    if(evt.key === storageKey){
      if(!initialised) return;
      renderAll();
    }
  });
})();

const REPORT_STORAGE_KEY = 'apolloLinkReports';

function readReports(){
  try {
    const raw = localStorage.getItem(REPORT_STORAGE_KEY);
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch(err){
    console.warn('No se pudieron leer los reportes almacenados', err);
    return [];
  }
}

function writeReports(reports){
  try {
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reports));
  } catch(err){
    console.error('No se pudieron guardar los reportes', err);
  }
  document.dispatchEvent(new CustomEvent('apollo:reports-updated', {detail: {reports}}));
}

function appendReport(detail){
  const reports = readReports();
  reports.push(detail);
  writeReports(reports);
  return reports;
}

function countReportsByItem(reports){
  const map = new Map();
  reports.forEach(report => {
    const key = report.item || 'desconocido';
    map.set(key, (map.get(key) || 0) + 1);
  });
  return map;
}

let reportToastEl = null;
let reportToastTimer = null;
function showReportToast(message){
  if(!message) return;
  if(!reportToastEl){
    reportToastEl = document.createElement('div');
    reportToastEl.className = 'report-toast';
    document.body.appendChild(reportToastEl);
  }
  reportToastEl.textContent = message;
  reportToastEl.classList.add('visible');
  if(reportToastTimer){
    clearTimeout(reportToastTimer);
  }
  reportToastTimer = setTimeout(() => {
    if(reportToastEl){
      reportToastEl.classList.remove('visible');
    }
  }, 2600);
}

// --- Reportes: contadores públicos y botones ---
(function(){
  function updateCounters(){
    const counters = document.querySelectorAll('[data-report-counter]');
    if(!counters.length) return;
    const reports = readReports();
    const grouped = countReportsByItem(reports);
    counters.forEach(counter => {
      const id = counter.getAttribute('data-report-counter');
      const total = grouped.get(id) || 0;
      const totalEl = counter.querySelector('[data-report-total]');
      if(totalEl){
        totalEl.textContent = total.toString();
      }
      counter.setAttribute('aria-label', `Reportes registrados: ${total}`);
    });
  }

  document.addEventListener('apollo:reports-updated', updateCounters);
  window.addEventListener('storage', evt => {
    if(evt.key === REPORT_STORAGE_KEY){
      updateCounters();
    }
  });
  updateCounters();

  document.addEventListener('click', evt => {
    const btn = evt.target.closest('[data-report-counter]');
    if(!btn) return;
    const totalEl = btn.querySelector('[data-report-total]');
    const total = totalEl ? Number(totalEl.textContent) || 0 : 0;
    const message = total === 1
      ? 'Hay 1 reporte registrado en este juego desde este navegador.'
      : `Hay ${total} reportes registrados en este juego desde este navegador.`;
    showReportToast(message);
  });
})();

// --- Reportes: envío desde botones de enlace ---
(function(){
  document.addEventListener('click', evt => {
    const button = evt.target.closest('.report-flag');
    if(!button) return;
    evt.preventDefault();

    const detail = {
      id: Date.now(),
      item: button.dataset.item || '',
      title: button.dataset.title || '',
      group: button.dataset.group || '',
      host: button.dataset.host || '',
      url: button.dataset.url || '',
      time: new Date().toISOString()
    };

    const confirmation = window.confirm(`¿Reportar enlace caído en ${detail.host || 'el host seleccionado'}?`);
    if(!confirmation){
      return;
    }

    appendReport(detail);
    showReportToast(`Gracias, registramos el reporte para ${detail.host || 'el enlace'}.`);
  });
})();

// --- Panel interno de reportes para staff ---
(function(){
  const storageKey = 'apolloStaffMode';

  const params = new URLSearchParams(window.location.search);
  const staffParam = params.get('staff');

  if(staffParam === '1'){
    localStorage.setItem(storageKey, '1');
  } else if(staffParam === '0'){
    localStorage.removeItem(storageKey);
  }

  if(staffParam !== null){
    params.delete('staff');
    const newQuery = params.toString();
    const newUrl = window.location.pathname + (newQuery ? '?' + newQuery : '') + window.location.hash;
    if(window.history && typeof window.history.replaceState === 'function'){
      window.history.replaceState({}, document.title, newUrl);
    }
  }

  if(localStorage.getItem(storageKey) !== '1'){
    return;
  }

  document.body.classList.add('is-staff');

  const panel = document.getElementById('report-panel');
  const list = document.getElementById('report-list');
  const count = document.getElementById('report-count');
  const clearBtn = document.getElementById('report-clear');

  function formatTime(iso){
    if(!iso) return 'Fecha desconocida';
    const date = new Date(iso);
    if(Number.isNaN(date.getTime())){
      return 'Fecha desconocida';
    }
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function renderReports(){
    const reports = readReports();
    if(count){
      count.textContent = reports.length.toString();
    }
    if(list){
      list.innerHTML = '';
      if(!reports.length){
        const empty = document.createElement('li');
        empty.className = 'report-empty';
        empty.textContent = 'Sin reportes registrados.';
        list.appendChild(empty);
      } else {
        reports.slice().reverse().forEach(report => {
          const item = document.createElement('li');
          item.className = 'report-item';

          const title = document.createElement('strong');
          title.textContent = report.title || report.item || 'Enlace sin título';
          item.appendChild(title);

          const meta = document.createElement('div');
          meta.className = 'report-item-meta';
          if(report.group){
            const spanGroup = document.createElement('span');
            spanGroup.textContent = `Paquete: ${report.group}`;
            meta.appendChild(spanGroup);
          }
          if(report.host){
            const spanHost = document.createElement('span');
            spanHost.textContent = `Host: ${report.host}`;
            meta.appendChild(spanHost);
          }
          const spanTime = document.createElement('span');
          spanTime.textContent = formatTime(report.time);
          meta.appendChild(spanTime);
          item.appendChild(meta);

          if(report.url){
            const link = document.createElement('a');
            link.href = report.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.className = 'report-item-url';
            link.textContent = report.url;
            item.appendChild(link);
          }

          list.appendChild(item);
        });
      }
    }
    if(panel){
      panel.hidden = false;
    }
  }

  document.addEventListener('apollo:reports-updated', renderReports);
  window.addEventListener('storage', evt => {
    if(evt.key === REPORT_STORAGE_KEY){
      renderReports();
    }
  });

  if(clearBtn){
    clearBtn.addEventListener('click', () => {
      if(!window.confirm('¿Vaciar la bandeja de reportes?')){
        return;
      }
      writeReports([]);
      renderReports();
      showReportToast('Se limpiaron los reportes registrados.');
    });
  }

  renderReports();
})();


// --- Compartir noticias ---
(function(){
  const blocks = document.querySelectorAll('[data-share]');
  if(!blocks.length) return;

  blocks.forEach(block => {
    const nativeBtn = block.querySelector('[data-share-native]');
    if(!nativeBtn) return;

    if(typeof navigator === 'undefined' || typeof navigator.share !== 'function'){
      nativeBtn.hidden = true;
      nativeBtn.setAttribute('aria-hidden', 'true');
      return;
    }

    nativeBtn.addEventListener('click', evt => {
      evt.preventDefault();

      const shareUrl = block.getAttribute('data-share-url') || window.location.href;
      const shareTitle = block.getAttribute('data-share-title') || document.title;
      const shareText = block.getAttribute('data-share-text') || '';

      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      }).catch(err => {
        if(err && err.name === 'AbortError'){
          return;
        }
        const fallbackLink = block.querySelector('a.share');
        if(fallbackLink && fallbackLink.href){
          window.open(fallbackLink.href, '_blank', 'noopener');
        }
      });
    });
  });
})();

