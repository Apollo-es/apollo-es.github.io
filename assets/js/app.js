// --- Background FX: simple moving stars on canvas (no deps) ---
(function stars(){
  const c = document.getElementById('bgfx'); if(!c) return;
  const ctx = c.getContext('2d');
  let W,H,stars=[];
  function resize(){ W= c.width = innerWidth; H= c.height = innerHeight; stars = Array.from({length: Math.min(220, Math.floor(W*H/12000))}, ()=>({x:Math.random()*W,y:Math.random()*H,z:Math.random()*0.8+0.2,s:Math.random()*1.5+0.2})); }
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

// --- Human verification gating ---
async function onHumanVerified(token) {
  try {
    const resp = await fetch("https://verificador-apollo.apollo-es-contact.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    const data = await resp.json();
    if (data.success) {
      sessionStorage.setItem("human","1");
      unlockLinks();
    } else {
      alert("Verificación fallida. Inténtalo de nuevo.");
    }
  } catch (e) {
    alert("Error al verificar: " + e.message);
  }
}

function isHuman(){ return sessionStorage.getItem('human') === '1'; }
function unlockLinks(){
  document.querySelectorAll('.direct-links .alt').forEach(a => a.classList.remove('hidden'));
  document.querySelectorAll('.btn.dl').forEach(b => b.classList.add('hidden'));
  const modal = document.getElementById('verifyModal');
  if(modal) modal.setAttribute('aria-hidden', 'true');
}


(function(){
  if(isHuman()) unlockLinks();
  const modal = document.getElementById('verifyModal');
  const close = document.getElementById('verifyClose');
  const confirm = document.getElementById('verifyConfirm');
  const demo = document.getElementById('demoHuman');

  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn.dl.gated');
    if(!btn) return;
    e.preventDefault();
    if(isHuman()) {
      const url = btn.dataset.finalUrl;
      window.open(url, '_blank', 'noopener');
    } else {
      modal?.setAttribute('aria-hidden','false');
    }
  });

  close?.addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
  modal?.addEventListener('click', (e)=>{ if(e.target === modal) modal.setAttribute('aria-hidden','true'); });

  confirm?.addEventListener('click', ()=>{
    if(demo && demo.checked){
      sessionStorage.setItem('human','1');
      unlockLinks();
      return;
    }
    alert('Integra Cloudflare Turnstile o hCaptcha (ver comentario en el modal) y su callback desbloqueará los enlaces.');
  });
})();
