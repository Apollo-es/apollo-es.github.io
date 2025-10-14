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
  const list = document.querySelector('#items');
  if(!list) return;

  const cards = Array.from(list.querySelectorAll('.card'));
  if(!cards.length) return;

  const q = document.querySelector('#q');
  const selects = {
    console: document.getElementById('filter-console'),
    developer: document.getElementById('filter-developer'),
    genre: document.getElementById('filter-genre')
  };
  const resetBtn = document.getElementById('filter-reset');

  const normalise = str => (str || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const splitTokens = str => (str || '').split(/[,/]/).map(t => t.trim()).filter(Boolean);

  const filters = {term:'', console:'', developer:'', genre:''};
  const valueSets = {console:new Set(), developer:new Set(), genre:new Set()};

  cards.forEach(card => {
    card.dataset.search = normalise(card.innerText);

    const consoleName = card.dataset.console;
    if(consoleName){
      valueSets.console.add(consoleName.trim());
    }

    const developerName = card.dataset.developer;
    if(developerName){
      valueSets.developer.add(developerName.trim());
    }

    const genreName = card.dataset.genre;
    if(genreName){
      const tokens = splitTokens(genreName);
      card.dataset.genreTokens = tokens.map(normalise).join('|');
      tokens.forEach(token => valueSets.genre.add(token));
    } else {
      card.dataset.genreTokens = '';
    }
  });

  function populateSelect(select, values){
    if(!select || !values.size) return;
    const placeholder = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if(placeholder){
      select.appendChild(placeholder);
    } else {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = select.dataset.placeholder || 'Todos';
      select.appendChild(opt);
    }
    Array.from(values)
      .sort((a,b) => a.localeCompare(b, 'es', {sensitivity:'base'}))
      .forEach(value => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        select.appendChild(opt);
      });
  }

  populateSelect(selects.console, valueSets.console);
  populateSelect(selects.developer, valueSets.developer);
  populateSelect(selects.genre, valueSets.genre);

  function applyFilters(){
    cards.forEach(card => {
      let visible = true;

      if(filters.term){
        visible = (card.dataset.search || '').includes(filters.term);
      }

      if(visible && filters.console){
        visible = normalise(card.dataset.console).includes(filters.console);
      }

      if(visible && filters.developer){
        visible = normalise(card.dataset.developer).includes(filters.developer);
      }

      if(visible && filters.genre){
        const tokens = card.dataset.genreTokens ? card.dataset.genreTokens.split('|') : [];
        visible = tokens.includes(filters.genre);
      }

      card.style.display = visible ? '' : 'none';
    });
  }

  q?.addEventListener('input', () => {
    filters.term = normalise(q.value);
    applyFilters();
  });

  Object.entries(selects).forEach(([key, select]) => {
    select?.addEventListener('change', () => {
      filters[key] = normalise(select.value);
      applyFilters();
    });
  });

  resetBtn?.addEventListener('click', () => {
    filters.term = filters.console = filters.developer = filters.genre = '';
    if(q) q.value = '';
    Object.values(selects).forEach(select => {
      if(select) select.value = '';
    });
    applyFilters();
    q?.focus();
  });

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
