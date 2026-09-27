(function(){
 const path=location.pathname;
 function addBottomNav(){
  if(document.querySelector('.brave-bottom-nav,.bottom')||path.startsWith('/admin'))return;
  const nav=document.createElement('nav');nav.className='brave-bottom-nav';
  nav.innerHTML='<a href="/dashboard.html"><span>⌂</span>Home</a><a href="/marketplace.html"><span>🛍️</span>Market</a><a href="/dashboard.html#timeline"><span>📰</span>Timeline</a><a href="#" id="braveMenuOpen"><span>☰</span>Menu</a>';
  document.body.appendChild(nav);
  const sheet=document.createElement('div');sheet.className='brave-menu-sheet';sheet.id='braveMenuSheet';
  sheet.innerHTML='<div class="brave-menu-card"><div style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0;color:#32105f">UNIQUE BRAVE Menu</h2><button id="braveMenuClose" style="border:0;border-radius:50%;width:38px;height:38px">×</button></div><div class="brave-menu-grid"><a href="/dashboard.html"><span>⌂</span>Dashboard</a><a href="/marketplace.html"><span>🛍️</span>Marketplace</a><a href="/dashboard.html#timeline"><span>📰</span>Timeline</a><a href="/dashboard.html#messages"><span>💬</span>Messages</a><a href="/dashboard.html#products"><span>📦</span>Products</a><a href="/dashboard.html#services"><span>🧑‍💼</span>Services</a><a href="/workshop.html"><span>🧰</span>Workshop</a><a href="/dashboard.html#receipts"><span>🧾</span>Receipts</a><a href="/dashboard.html#company"><span>🏢</span>Business</a><a href="/dashboard.html#plans"><span>💎</span>Plans</a><a href="/dashboard.html#wallet"><span>👛</span>Wallet · Soon</a><a href="/dashboard.html#settings"><span>⚙️</span>Settings</a><a href="/u/" id="braveMyProfile"><span>👤</span>My Profile</a></div></div>';
  document.body.appendChild(sheet);
  document.getElementById('braveMenuOpen').onclick=e=>{e.preventDefault();sheet.classList.add('open')};
  sheet.querySelectorAll('a[href="/dashboard.html#plans"]').forEach(a=>a.onclick=e=>{e.preventDefault();sheet.classList.remove('open');openPlans()});document.getElementById('braveMenuClose').onclick=()=>sheet.classList.remove('open');sheet.onclick=e=>{if(e.target===sheet)sheet.classList.remove('open')};
  try{const u=JSON.parse(localStorage.getItem('braveUser')||'{}');if(u.username)document.getElementById('braveMyProfile').href='/u/'+encodeURIComponent(u.username)}catch{}
 }
 function addPasswordEyes(){document.querySelectorAll('input[type="password"]').forEach(input=>{if(input.parentElement.classList.contains('password-wrap'))return;const wrap=document.createElement('div');wrap.className='password-wrap';input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);const b=document.createElement('button');b.type='button';b.className='password-eye';b.setAttribute('aria-label','Show password');b.textContent='◉';b.onclick=()=>{const show=input.type==='password';input.type=show?'text':'password';b.textContent=show?'◉':'◌';b.setAttribute('aria-label',show?'Hide password':'Show password')};wrap.appendChild(b)})}

 async function restoreSession(){
  try{
    const saved=localStorage.getItem('braveToken')||'';
    const headers=saved?{Authorization:'Bearer '+saved}:{ };
    const r=await fetch('/api/session/bootstrap',{credentials:'include',cache:'no-store',headers});
    if(r.ok){
      const d=await r.json();
      if(d.user) localStorage.setItem('braveUser',JSON.stringify(d.user));
      if(d.token) localStorage.setItem('braveToken',d.token);
      window.braveSessionReady=true;
      return true;
    }
  }catch(_){}
  window.braveSessionReady=false;
  return false;
 }

 function addLiveAccountHub(){
  if(document.getElementById('braveLiveHub')||path.startsWith('/admin'))return;
  const hub=document.createElement('div');hub.id='braveLiveHub';hub.style.cssText='position:fixed;right:14px;top:12px;z-index:9996;display:flex;gap:7px;align-items:center';
  hub.innerHTML='<a href="/dashboard.html#notifications" id="braveBell" style="text-decoration:none;background:#fff;border:1px solid #eadff2;border-radius:999px;padding:9px 12px;color:#32105f;font-weight:900;box-shadow:0 6px 18px #32105f18">🔔 <span id="braveBellCount">0</span></a><a href="/dashboard.html#requests" id="braveReqBell" style="display:none;text-decoration:none;background:#ffd83d;border-radius:999px;padding:9px 12px;color:#32105f;font-weight:900;box-shadow:0 6px 18px #32105f18">💬 <span id="braveReqCount">0</span></a>';
  document.body.appendChild(hub);
  const refresh=async()=>{
    const token=localStorage.getItem('braveToken'); if(!token)return;
    try{
      const [a,b,c]=await Promise.all([fetch('/api/notifications/unread-count',{headers:{Authorization:'Bearer '+token},credentials:'include',cache:'no-store'}),fetch('/api/chat-requests/unread-count',{headers:{Authorization:'Bearer '+token},credentials:'include',cache:'no-store'}),fetch('/api/customer-service/me',{headers:{Authorization:'Bearer '+token},credentials:'include',cache:'no-store'})]);
      if(a.ok){const d=await a.json();const n=Number(d.count||0);document.getElementById('braveBellCount').textContent=n;document.getElementById('braveBell').style.background=n?'#fff1a8':'#fff';}
      if(b.ok){const d=await b.json();const n=Number(d.count||0);document.getElementById('braveReqCount').textContent=n;document.getElementById('requestBadge')&&(document.getElementById('requestBadge').textContent=n);document.getElementById('braveReqBell').style.display=n?'inline-block':'none';}
      if(c.ok && path.includes('dashboard')){const nav=document.getElementById('customerCareNav');if(nav)nav.hidden=false;}
    }catch(_){ }
  };
  refresh();window.braveLiveRefresh=refresh;setInterval(refresh,5000);
 }
 function addInstallBanner(){
  if(location.pathname.startsWith('/admin')||document.getElementById('braveInstallBar'))return;
  let deferred=null;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;const bar=document.getElementById('braveInstallBar');if(bar)bar.hidden=false;});
  const bar=document.createElement('div');bar.id='braveInstallBar';bar.hidden=true;bar.innerHTML='<div><b>📲 Get UNIQUE BRAVE as an app</b><small>Install it on this device without an app store.</small></div><button id="braveInstallBtn">Install</button><button id="braveInstallClose" aria-label="Close">×</button>';document.body.appendChild(bar);
  bar.querySelector('#braveInstallBtn').onclick=async()=>{if(!deferred){location.href='/download.html';return}deferred.prompt();await deferred.userChoice;deferred=null;bar.hidden=true};bar.querySelector('#braveInstallClose').onclick=()=>bar.remove();
 }
 async function openPlans(){
  let m=document.getElementById('bravePlansSheet');if(!m){m=document.createElement('div');m.id='bravePlansSheet';m.className='brave-menu-sheet';document.body.appendChild(m)}
  m.innerHTML='<div class="brave-menu-card"><div style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0;color:#32105f">💎 BRAVE Plans</h2><button id="bravePlansClose" style="border:0;border-radius:50%;width:38px;height:38px">×</button></div><p class="muted">Choose a plan for the tools you actually use. Paid plans remain pending until payment is verified by BRAVE Admin.</p><div id="bravePlanCards">Loading plans…</div></div>';m.classList.add('open');document.getElementById('bravePlansClose').onclick=()=>m.classList.remove('open');
  try{const [a,b]=await Promise.all([fetch('/api/plans'),fetch('/api/account/entitlements',{credentials:'include'})]);const plans=(await a.json()).plans||[];const ent=b.ok?(await b.json()):null;document.getElementById('bravePlanCards').innerHTML=plans.map(p=>`<div style="background:#fff;border:1px solid #eadff2;border-radius:18px;padding:14px;margin:10px 0"><div style="display:flex;justify-content:space-between;gap:10px"><h3 style="margin:0;color:#32105f">${p.name}</h3><b>${Number(p.price)?'₦'+Number(p.price).toLocaleString('en-NG'):'Free'}</b></div><p class="muted">${escText(p.tagline||p.billing||'Monthly')}</p><ul>${(p.features||[]).map(f=>`<li>${escText(f)}</li>`).join('')}</ul>${ent?.plan?.code===p.code?'<span class="brave-badge">Current plan</span>':''}</div>`).join('')+`<div class="safe-banner">👛 Wallet: Coming Soon — no wallet balance or withdrawal is available.</div>`}catch{document.getElementById('bravePlanCards').innerHTML='<p>Plans could not be loaded right now.</p>'}
 }
 function escText(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 function installControlToken(){const q=new URLSearchParams(location.search);const c=q.get('control');if(c){sessionStorage.setItem('braveControlToken',c);history.replaceState(null,'',location.pathname+location.search.replace(/([?&])control=[^&]*&?/,'$1').replace(/[?&]$/,''))}const original=window.fetch.bind(window);window.fetch=(input,init={})=>{const c=sessionStorage.getItem('braveControlToken');if(c){init.headers=new Headers(init.headers||{});if(!init.headers.has('x-admin-control-token'))init.headers.set('x-admin-control-token',c)}return original(input,init)}}
 function inject(){installControlToken();restoreSession();const e=document.createElement('script');e.src='/brave-enhancements.js';document.head.appendChild(e);const f=document.createElement('script');f.src='/brave-final-layer.js';document.head.appendChild(f);if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});const l=document.createElement('link');l.rel='stylesheet';l.href='/app.css';document.head.appendChild(l);addBottomNav();addPasswordEyes();addInstallBanner();addLiveAccountHub();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();
