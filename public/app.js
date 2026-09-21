(function(){
 const path=location.pathname;
 function addBottomNav(){
  if(document.querySelector('.brave-bottom-nav,.bottom')||path.startsWith('/admin'))return;
  const nav=document.createElement('nav');nav.className='brave-bottom-nav';
  nav.innerHTML='<a href="/dashboard.html"><span>⌂</span>Home</a><a href="/marketplace.html"><span>🛍️</span>Market</a><a href="/dashboard.html#timeline"><span>📰</span>Timeline</a><a href="#" id="braveMenuOpen"><span>☰</span>Menu</a>';
  document.body.appendChild(nav);
  const sheet=document.createElement('div');sheet.className='brave-menu-sheet';sheet.id='braveMenuSheet';
  sheet.innerHTML='<div class="brave-menu-card"><div style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0;color:#32105f">UNIQUE BRAVE Menu</h2><button id="braveMenuClose" style="border:0;border-radius:50%;width:38px;height:38px">×</button></div><div class="brave-menu-grid"><a href="/dashboard.html"><span>⌂</span>Dashboard</a><a href="/marketplace.html"><span>🛍️</span>Marketplace</a><a href="/dashboard.html#timeline"><span>📰</span>Timeline</a><a href="/dashboard.html#messages"><span>💬</span>Messages</a><a href="/dashboard.html#products"><span>📦</span>Products</a><a href="/dashboard.html#services"><span>🧑‍💼</span>Services</a><a href="/workshop.html"><span>🧰</span>Workshop</a><a href="/dashboard.html#wallet"><span>👛</span>Wallet · Soon</a><a href="/dashboard.html#receipts"><span>🧾</span>Receipts</a><a href="/dashboard.html#company"><span>🏢</span>Business</a><a href="/dashboard.html#settings"><span>⚙️</span>Settings</a><a href="/u/" id="braveMyProfile"><span>👤</span>My Profile</a></div></div>';
  document.body.appendChild(sheet);
  document.getElementById('braveMenuOpen').onclick=e=>{e.preventDefault();sheet.classList.add('open')};document.getElementById('braveMenuClose').onclick=()=>sheet.classList.remove('open');sheet.onclick=e=>{if(e.target===sheet)sheet.classList.remove('open')};
  try{const u=JSON.parse(localStorage.getItem('braveUser')||'{}');if(u.username)document.getElementById('braveMyProfile').href='/u/'+encodeURIComponent(u.username)}catch{}
 }
 function addPasswordEyes(){document.querySelectorAll('input[type="password"]').forEach(input=>{if(input.parentElement.classList.contains('password-wrap'))return;const wrap=document.createElement('div');wrap.className='password-wrap';input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);const b=document.createElement('button');b.type='button';b.className='password-eye';b.setAttribute('aria-label','Show password');b.textContent='◉';b.onclick=()=>{const show=input.type==='password';input.type=show?'text':'password';b.textContent=show?'◉':'◌';b.setAttribute('aria-label',show?'Hide password':'Show password')};wrap.appendChild(b)})}

 async function restoreSession(){
  try{
    const r=await fetch('/api/session/check',{credentials:'include'});
    if(r.ok){
      const d=await r.json();
      if(d.user) localStorage.setItem('braveUser',JSON.stringify(d.user));
    }
  }catch(_){}
 }
 function addInstallBanner(){
  if(location.pathname.startsWith('/admin')||document.getElementById('braveInstallBar'))return;
  let deferred=null;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;const bar=document.getElementById('braveInstallBar');if(bar)bar.hidden=false;});
  const bar=document.createElement('div');bar.id='braveInstallBar';bar.hidden=true;bar.innerHTML='<div><b>📲 Get UNIQUE BRAVE as an app</b><small>Install it on this device without an app store.</small></div><button id="braveInstallBtn">Install</button><button id="braveInstallClose" aria-label="Close">×</button>';document.body.appendChild(bar);
  bar.querySelector('#braveInstallBtn').onclick=async()=>{if(!deferred){location.href='/download.html';return}deferred.prompt();await deferred.userChoice;deferred=null;bar.hidden=true};bar.querySelector('#braveInstallClose').onclick=()=>bar.remove();
 }
 function inject(){restoreSession();const e=document.createElement('script');e.src='/brave-enhancements.js';document.head.appendChild(e);const f=document.createElement('script');f.src='/brave-final-layer.js';document.head.appendChild(f);if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});const l=document.createElement('link');l.rel='stylesheet';l.href='/app.css';document.head.appendChild(l);addBottomNav();addPasswordEyes();addInstallBanner();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();
