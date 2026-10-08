/* App COP sin conexión: la app (index.html) va primero por la red, para coger siempre la última versión, y sin red sale la
   guardada; las librerías (jszip, pdf.js, lector de fotos, letras), que llevan versión fija, se guardan la primera vez. */
const V='cop-d5160d4af8';
const APP=['./','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable.png','apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(APP)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})
      .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./'))));
  }else if(/^(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.host)){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})));
  }
});
