const CACHE='unique-brave-v3';
const SHELL=['/','/home','/marketplace.html','/login.html','/register','/dashboard.html','/forgot-password.html','/reset-password.html','/download.html','/manifest.json','/app.css','/app.js','/brave-enhancements.js','/brave-final-layer.js','/admin-addons.js','/images/brave-lion.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==location.origin)return;event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});}return response;}).catch(()=>caches.match(event.request).then(r=>r||caches.match('/home'))));});
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();});
