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

// --- Human verification gating (solo cliente, sin Worker) ---
function isHuman(){ return sessionStorage.getItem('human') === '1'; }
function unlockLinks(){
  document.querySelectorAll('.direct-links .alt').forEach(a => a.classList.remove('hidden'));
  document.querySelectorAll('.btn.dl').forEach(b => b.classList.add('hidden'));
  const modal = document.getElementById('verifyModal');
  if(modal) modal.setAttribute('aria-hidden', 'true');
}

// Callback real de Turnstile (ejecutado al verificar con éxito)
function onHumanVerified(/* token */) {
  console.log('Turnstile verificado');
  sessionStorage.setItem('human','1');
  unlockLinks();
}
window.onHumanVerified = onHumanVerified;

(function(){
  if(isHuman()) unlockLinks();
  const modal = document.getElementById('verifyModal');
  const close = document.getElementById('verifyClose');

  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn.dl.gated');
    if(!btn) return;
    e.preventDefault();
    if(isHuman()) {
      window.open(btn.dataset.finalUrl, '_blank', 'noopener');
    } else {
      modal?.setAttribute('aria-hidden','false');
    }
  });

  close?.addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
})();

// --- Responsive navigation toggle ---
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('site-menu');
  if(!toggle || !menu) return;

  const mq = window.matchMedia('(max-width: 768px)');

  function updateAria(){
    const open = menu.classList.contains('open');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function applyResponsive(initial = false){
    if(mq.matches){
      if(!initial){
        menu.classList.remove('open');
      }
      updateAria();
    } else {
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
    updateAria();
  });

  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    if(mq.matches){
      menu.classList.remove('open');
      updateAria();
    }
  }));

  mq.addEventListener('change', () => applyResponsive());

  applyResponsive(true);
})();
