document.documentElement.classList.add('has-js');

// --- Background FX: simple moving stars on canvas (no deps) ---
(function stars(){
  const c = document.getElementById('bgfx'); if(!c) return;
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

// --- Search (client) ---
(function(){
  const q = document.querySelector('#q');
  const list = document.querySelector('#items');
  if(!q || !list) return;

  q.addEventListener('input', () => {
    const term = q.value.trim().toLowerCase();
    list.querySelectorAll('.card').forEach(card => {
      const txt = card.innerText.toLowerCase();
      card.style.display = txt.includes(term) ? '' : 'none';
    });
  });
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

  if(!tabs.length){
    return;
  }

  let active = tabs[0].dataset.thread;
  let authed = !requiresAuth || sessionStorage.getItem('apolloForumAuth') === '1';
  let scriptInjected = false;

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
