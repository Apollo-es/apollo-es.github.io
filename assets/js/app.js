document.documentElement.classList.add('has-js');

// --- Background FX: simple moving stars on canvas (no deps) ---
(function stars(){
  let c = document.getElementById('bgfx');
  if(!c){
    c = document.createElement('canvas');
    c.id = 'bgfx';
    c.setAttribute('aria-hidden', 'true');
    document.body?.prepend?.(c);
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
  var list = document.getElementById('items');
  if(!list) return;

  var cards = Array.prototype.slice.call(list.querySelectorAll('.card'));
  if(!cards.length) return;

  var q = document.getElementById('q');
  var selects = {
    console: document.getElementById('filter-console'),
    developer: document.getElementById('filter-developer'),
    genre: document.getElementById('filter-genre')
  };
  var resetBtn = document.getElementById('filter-reset');

  function normalise(str){
    if(!str) return '';
    var value = String(str).toLowerCase().trim();
    if(typeof value.normalize === 'function'){
      value = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return value;
  }

  function toTokens(str){
    if(!str) return [];
    return String(str)
      .split(/[,/|]/)
      .map(function(token){ return token.trim(); })
      .filter(Boolean);
  }

  var dataset = cards.map(function(card){
    var rawText = card.textContent || '';
    var consoleLabel = card.getAttribute('data-console') || '';
    var developerLabel = card.getAttribute('data-developer') || '';
    var genreLabel = card.getAttribute('data-genre') || '';
    var tokens = toTokens(genreLabel);

    return {
      card: card,
      text: normalise(rawText),
      consoleLabel: consoleLabel.trim(),
      developerLabel: developerLabel.trim(),
      genreLabels: tokens,
      consoleValue: normalise(consoleLabel),
      developerValue: normalise(developerLabel),
      genreValues: tokens.map(normalise)
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
      valueSets.genre.add(label);
    });
  });

  function populateSelect(select, values){
    if(!select) return;
    var doc = select.ownerDocument;
    var fragment = doc.createDocumentFragment();
    var placeholderText = select.getAttribute('data-placeholder') || 'Todos';
    var placeholder = doc.createElement('option');
    placeholder.value = '';
    placeholder.textContent = placeholderText;
    fragment.appendChild(placeholder);

    Array.from(values)
      .sort(function(a, b){ return a.localeCompare(b, 'es', {sensitivity: 'base'}); })
      .forEach(function(value){
        var opt = doc.createElement('option');
        opt.value = value;
        opt.textContent = value;
        fragment.appendChild(opt);
      });

    select.innerHTML = '';
    select.appendChild(fragment);
    select.value = '';
  }

  populateSelect(selects.console, valueSets.console);
  populateSelect(selects.developer, valueSets.developer);
  populateSelect(selects.genre, valueSets.genre);

  var state = {
    term: '',
    console: '',
    developer: '',
    genre: ''
  };

  function applyFilters(){
    dataset.forEach(function(entry){
      var visible = true;

      if(state.term && entry.text.indexOf(state.term) === -1){
        visible = false;
      }

      if(visible && state.console && entry.consoleValue !== state.console){
        visible = false;
      }

      if(visible && state.developer && entry.developerValue !== state.developer){
        visible = false;
      }

      if(visible && state.genre && entry.genreValues.indexOf(state.genre) === -1){
        visible = false;
      }

      entry.card.style.display = visible ? '' : 'none';
    });
  }

  if(q){
    q.addEventListener('input', function(){
      state.term = normalise(q.value);
      applyFilters();
    });
  }

  Object.keys(selects).forEach(function(key){
    var select = selects[key];
    if(!select) return;
    select.addEventListener('change', function(){
      state[key] = normalise(select.value);
      applyFilters();
    });
  });

  if(resetBtn){
    resetBtn.addEventListener('click', function(){
      state.term = state.console = state.developer = state.genre = '';
      if(q) q.value = '';
      Object.keys(selects).forEach(function(key){
        if(selects[key]){
          selects[key].value = '';
        }
      });
      applyFilters();
      if(q){
        q.focus();
      }
    });
  }

  applyFilters();
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
  const submitBtn = form?.querySelector('button[type="submit"]');
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

    const target = tier.targets?.[targetKey] || tier.targets?.general || null;
    const warnRam = typeof tier.min_ram === 'number' && ram && ram < tier.min_ram;
    const notes = Array.isArray(tier.notes) ? tier.notes : [];

    const summary = target ? `
      <div class="hardware-summary">
        <span><i class="ti ti-screen-share"></i>Resolución: ${target.resolution || '—'}</span>
        <span><i class="ti ti-activity"></i>FPS objetivo: ${target.fps || '—'}</span>
        <span><i class="ti ti-adjustments-horizontal"></i>Preset: ${target.preset || '—'}</span>
      </div>
    ` : '';

    const tips = target?.tips && target.tips.length ? `
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

    const sourceLabel = source?.name ? `<span><i class="ti ti-database"></i>Fuente: ${source.name}</span>` : '';

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
    evt?.preventDefault();
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
      const list = Array.isArray(data) ? data : Array.isArray(data?.tiers) ? data.tiers : [];
      if(!list.length) throw new Error('Dataset vacío');
      tiers = list;
      source = data?.source || {};

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

// --- Responsive navigation toggle ---
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('site-menu');
  if(!toggle || !menu) return;

  const nav = toggle.closest('.nav');
  const overlay = document.querySelector('.nav-overlay');
  const mq = window.matchMedia('(max-width: 768px)');

  function setState(open){
    if(open){
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      if(mq.matches){
        nav?.classList.add('menu-open');
        overlay?.classList.add('active');
        overlay?.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
      }
    } else {
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      nav?.classList.remove('menu-open');
      overlay?.classList.remove('active');
      overlay?.setAttribute('aria-hidden', 'true');
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
      nav?.classList.remove('menu-open');
      overlay?.classList.remove('active');
      overlay?.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    }
  }

  toggle.addEventListener('click', () => {
    if(mq.matches){
      const isOpen = menu.classList.contains('open');
      setState(!isOpen);
    }
  });

  overlay?.addEventListener('click', () => {
    if(mq.matches){
      setState(false);
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

// --- Foros interactivos ---
(function(){
  const container = document.querySelector('.forum-live');
  if(!container) return;

  const shortname = container.dataset.shortname;
  const requiresAuth = container.dataset.requiresAuth === 'true';
  const basePath = container.dataset.base || '/foros/';
  const tabs = Array.from(container.querySelectorAll('.forum-tab'));
  const tablist = container.querySelector('.forum-tablist');
  const titleEl = container.querySelector('.forum-title');
  const descEl = container.querySelector('.forum-desc');
  const authBox = container.querySelector('#forum-auth');
  const threadBox = container.querySelector('#forum-thread');
  const openers = Array.from(document.querySelectorAll('.forum-open'));

  if(!tabs.length){
    return;
  }

  let active = tabs[0].dataset.thread;
  let authed = !requiresAuth || sessionStorage.getItem('apolloForumAuth') === '1';
  let scriptInjected = false;

  function focusArea(){
    const nav = document.querySelector('.nav');
    const offset = (nav?.offsetHeight || 0) + 16;
    const top = container.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({top: Math.max(top, 0), behavior: 'smooth'});
  }

  function activateThread(identifier, focusTab){
    if(!identifier) return;
    const tab = tabs.find(btn => btn.dataset.thread === identifier);
    if(!tab) return;
    if(!tab.classList.contains('active')){
      tab.click();
    }
    if(focusTab){
      tab.focus();
    }
  }

  function canonical(identifier){
    const clean = identifier.replace(/[^a-z0-9\-]/gi,'');
    const base = basePath.endsWith('/') ? basePath : basePath + '/';
    return `${window.location.origin}${base}#${clean}`;
  }

  function loadThread(identifier){
    if(!shortname || !identifier || !threadBox) return;
    const pageIdentifier = `foros-${identifier}`;
    const pageUrl = canonical(identifier);

    if(window.DISQUS){
      window.DISQUS.reset({
        reload: true,
        config: function(){
          this.page.identifier = pageIdentifier;
          this.page.url = pageUrl;
        }
      });
    } else {
      window.disqus_config = function(){
        this.page.identifier = pageIdentifier;
        this.page.url = pageUrl;
      };
      if(!scriptInjected){
        scriptInjected = true;
        const d = document;
        const script = d.createElement('script');
        script.src = `https://${shortname}.disqus.com/embed.js`;
        script.setAttribute('data-timestamp', Date.now().toString());
        (d.head || d.body).appendChild(script);
      }
    }
  }

  function updateAuthState(){
    if(authed){
      container.classList.add('forum-authed');
      authBox?.setAttribute('aria-hidden', 'true');
      if(shortname && active){
        loadThread(active);
      }
    } else {
      container.classList.remove('forum-authed');
      authBox?.setAttribute('aria-hidden', 'false');
    }
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      if(btn.classList.contains('active')) return;
      tabs.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
        b.setAttribute('tabindex', '-1');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      btn.setAttribute('tabindex', '0');
      active = btn.dataset.thread;
      if(titleEl) titleEl.textContent = btn.dataset.name;
      if(descEl) descEl.textContent = btn.dataset.summary;
      if(authed){
        loadThread(active);
      }
    });
  });

  openers.forEach(btn => {
    btn.addEventListener('click', evt => {
      evt.preventDefault();
      const thread = btn.dataset.openThread;
      activateThread(thread, true);
      focusArea();
      if(authed){
        loadThread(active);
      }
    });
  });

  tablist?.addEventListener('keydown', evt => {
    if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(evt.key)) return;
    evt.preventDefault();
    const currentIndex = tabs.findIndex(tab => tab.classList.contains('active'));
    let targetIndex = currentIndex;
    if(evt.key === 'ArrowRight' || evt.key === 'ArrowDown'){
      targetIndex = (currentIndex + 1) % tabs.length;
    } else if(evt.key === 'ArrowLeft' || evt.key === 'ArrowUp'){
      targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if(evt.key === 'Home'){
      targetIndex = 0;
    } else if(evt.key === 'End'){
      targetIndex = tabs.length - 1;
    }
    const target = tabs[targetIndex];
    if(target){
      target.focus();
      target.click();
    }
  }

  function updateAuthState(){
    if(authed){
      container.classList.add('forum-authed');
      authBox?.setAttribute('aria-hidden', 'true');
      if(shortname && active){
        loadThread(active);
      }
    } else {
      container.classList.remove('forum-authed');
      authBox?.setAttribute('aria-hidden', 'false');
    }
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      if(btn.classList.contains('active')) return;
      tabs.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
        b.setAttribute('tabindex', '-1');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      btn.setAttribute('tabindex', '0');
      active = btn.dataset.thread;
      if(titleEl) titleEl.textContent = btn.dataset.name;
      if(descEl) descEl.textContent = btn.dataset.summary;
      if(authed){
        loadThread(active);
      }
    });
  });

  updateAuthState();

  window.handleForumCredentialResponse = function(response){
    if(!response || !response.credential) return;
    authed = true;
    sessionStorage.setItem('apolloForumAuth', '1');
    updateAuthState();
  };

  if(!requiresAuth && shortname && active){
    loadThread(active);
  }
})();

// --- Sistema interno de reportes de enlaces ---
(function(){
  const storageKey = 'apolloStaffMode';
  const reportKey = 'apolloLinkReports';

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
    if(typeof window.history?.replaceState === 'function'){
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
  let toastTimer = null;
  let toastEl = null;

  function loadReports(){
    try {
      const raw = localStorage.getItem(reportKey);
      if(!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch(err){
      console.warn('No se pudieron leer los reportes almacenados', err);
      return [];
    }
  }

  function saveReports(reports){
    try {
      localStorage.setItem(reportKey, JSON.stringify(reports));
    } catch(err){
      console.error('No se pudieron guardar los reportes', err);
    }
  }

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

  function ensurePanel(){
    if(panel){
      panel.hidden = false;
    }
  }

  function showToast(message){
    if(!message) return;
    if(!toastEl){
      toastEl = document.createElement('div');
      toastEl.className = 'report-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('visible');
    if(toastTimer){
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(() => {
      toastEl?.classList.remove('visible');
    }, 2600);
  }

  function renderReports(){
    const reports = loadReports();
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
    ensurePanel();
  }

  function addReport(detail){
    const reports = loadReports();
    reports.push(detail);
    saveReports(reports);
    renderReports();
    showToast(`Se reportó ${detail.host || 'el enlace'} de ${detail.title || detail.item || 'contenido'}.`);
  }

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

    const confirmation = window.confirm(`¿Reportar enlace caído en ${detail.host || 'host desconocido'}?`);
    if(!confirmation){
      return;
    }

    addReport(detail);
  });

  clearBtn?.addEventListener('click', () => {
    if(!window.confirm('¿Vaciar la bandeja de reportes?')){
      return;
    }
    saveReports([]);
    renderReports();
    showToast('Se limpiaron los reportes registrados.');
  });

  renderReports();
})();

// --- Compartir noticias ---
(function(){
  if(typeof navigator === 'undefined' || typeof navigator.share !== 'function'){
    return;
  }

  const blocks = document.querySelectorAll('[data-share]');
  if(!blocks.length) return;

  blocks.forEach(block => {
    block.addEventListener('click', evt => {
      const link = evt.target.closest('a.share');
      if(!link) return;
      evt.preventDefault();

      const shareUrl = block.getAttribute('data-share-url') || link.href;
      const shareTitle = block.getAttribute('data-share-title') || document.title;
      const shareText = block.getAttribute('data-share-text') || link.textContent?.trim() || '';

      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      }).catch(() => {
        window.open(link.href, '_blank', 'noopener');
      });
    });
  });
})();
