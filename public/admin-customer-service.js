(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const T=()=>localStorage.getItem('braveAdminToken')||'';
  async function api(u,o={}){
    try{
      o.headers={...(o.headers||{}),'x-admin-token':T()};
      if(o.body&&!o.headers['Content-Type'])o.headers['Content-Type']='application/json';
      const r=await fetch(u,o);let d={};try{d=await r.json()}catch{}
      return {r,d};
    }catch(e){return {r:{ok:false,status:0},d:{message:'Customer Service request could not reach the server.'}}}
  }
  function add(){
    const nav=document.querySelector('.nav'),main=document.querySelector('.main');
    if(!nav||!main)return;
    let b=document.getElementById('liveCustomerServiceNav');
    if(!b){
      b=document.createElement('button');b.textContent='🛟 Live Customer Service';b.id='liveCustomerServiceNav';
      nav.insertBefore(b,nav.querySelector('.danger')||null);
    }
    b.onclick=()=>show();
    let s=document.getElementById('liveCustomerService');
    if(!s){
      s=document.createElement('section');s.id='liveCustomerService';s.className='page';
      s.innerHTML='<div class="hero"><h1>🛟 Live Customer Service</h1><p>Administration receives customer messages here, then selects an available Customer Care agent or takes the conversation personally.</p></div><div id="csAdminBody"></div>';
      main.appendChild(s);
    }
  }
  function show(){
    add();
    const section=document.getElementById('liveCustomerService');
    const navButton=document.getElementById('liveCustomerServiceNav');
    if(!section||!navButton)return;
    document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
    section.classList.add('active');
    document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
    navButton.classList.add('active');
    load();
  }
  async function load(){
    const body=document.getElementById('csAdminBody');if(!body)return;
    body.innerHTML='<div class="card">Loading Customer Service…</div>';
    const x=await api('/api/admin/customer-service/live');
    if(!x.r.ok){body.innerHTML='<div class="card"><b>Customer Service could not load.</b><p>'+esc(x.d.message||'Please refresh and try again.')+'</p></div>';return;}
    const agents=x.d.agents||[],threads=x.d.threads||[],online=agents.filter(a=>a.online);
    body.innerHTML='<div class="card"><b>Available Customer Care agents: '+online.length+'</b><p class="muted">An agent is considered online when their Customer Care workspace has checked in recently.</p><div style="display:flex;gap:8px;flex-wrap:wrap">'+agents.map(a=>'<span class="pill" style="background:'+(a.online?'#dff6e5':'#eee3f8')+'">'+(a.online?'🟢':'⚪')+' '+esc(a.fullname)+' · @'+esc(a.username)+'</span>').join('')+'</div></div><h2>Customer conversations</h2>'+(threads.map(t=>'<div class="card"><h3>'+esc(t.subject)+'</h3><p><b>'+esc(t.requester_name)+'</b> '+(t.requester_email?'· '+esc(t.requester_email):'')+' · <span class="pill">'+esc(t.status)+'</span></p><p class="muted">Assigned: '+esc(t.assigned_role==='administrator'?'UNIQUE BRAVE Administration':(agents.find(a=>a.user_id===t.assigned_to)?.fullname||'Waiting for selection'))+'</p><p>'+esc(t.messages?.[0]?.message||'No message')+'</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" onclick="csOpen(\''+esc(t.public_id)+'\')">Open conversation</button><select id="cs-'+esc(t.public_id)+'"><option value="ADMIN">👑 UNIQUE BRAVE Administration</option>'+online.map(a=>'<option value="'+esc(a.user_id)+'">🟢 '+esc(a.fullname)+' (online)</option>').join('')+'</select><button class="btn secondary" onclick="csAssign(\''+esc(t.public_id)+'\')">Assign selected</button><button class="btn secondary" onclick="csClose(\''+esc(t.public_id)+'\')">Close</button></div></div>').join('')||'<div class="card">No waiting or assigned Customer Service conversations.</div>');
  }
  window.csAssign=async id=>{const sel=document.getElementById('cs-'+id);if(!sel)return;const x=await api('/api/admin/customer-service/live/'+encodeURIComponent(id)+'/assign',{method:'POST',body:JSON.stringify({assignee:sel.value})});alert(x.d.message||'Done');if(x.r.ok)load();};
  window.csClose=async id=>{if(!confirm('Close this Customer Service conversation?'))return;const x=await api('/api/admin/customer-service/live/'+encodeURIComponent(id)+'/close',{method:'POST'});alert(x.d.message||'Done');if(x.r.ok)load();};
  window.csOpen=async id=>{const x=await api('/api/admin/customer-service/live/'+encodeURIComponent(id));if(!x.r.ok)return alert(x.d.message||'Could not open conversation.');const m=(x.d.messages||[]).map(v=>'<div style="padding:9px 12px;background:'+(v.sender_type==='user'?'#fff':'#dcf8c6')+';border-radius:12px;margin:7px 0"><b>'+esc(v.sender_name||'UNIQUE BRAVE')+'</b><div>'+esc(v.message)+'</div><small>'+esc(v.created_at)+'</small></div>').join('');const el=document.getElementById('csAdminBody');if(!el)return;document.getElementById('csOpenBox')?.remove();const box=document.createElement('div');box.id='csOpenBox';box.className='card';box.innerHTML='<h2>💬 '+esc(x.d.thread.requester_name)+' · '+esc(x.d.thread.subject)+'</h2><div style="background:#efe7dc;padding:12px;border-radius:14px;max-height:420px;overflow:auto">'+m+'</div><textarea id="csAdminMsg" rows="3" placeholder="Reply as UNIQUE BRAVE Administration"></textarea><button class="btn" onclick="csSend(\''+esc(id)+'\')">Send as Administrator</button>';el.prepend(box);};
  window.csSend=async id=>{const input=document.getElementById('csAdminMsg'),msg=input?.value.trim();if(!msg)return alert('Enter a message first.');const x=await api('/api/admin/customer-service/live/'+encodeURIComponent(id)+'/message',{method:'POST',body:JSON.stringify({message:msg})});if(!x.r.ok)return alert(x.d.message||'Could not send message.');if(input)input.value='';await csOpen(id);load();};
  window.openLiveCustomerService=()=>show();
  function init(){add();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
