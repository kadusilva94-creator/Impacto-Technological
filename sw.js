/* Impacto Premium 3 — offline cache scoped to this application. */
const CACHE='levantamento-v3-premium';
const ARQUIVOS=['./','./index.html','./manifest.webmanifest','./icone-192.png','./icone-512.png','./icone-maskable.png'];
self.addEventListener('install',ev=>{
  ev.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARQUIVOS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',ev=>{
  ev.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>/^levantamento-v/.test(k)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',ev=>{
  const req=ev.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  if(req.mode==='navigate'){
    ev.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      try{
        const r=await fetch(req);
        if(r.ok){await cache.put(req,r.clone());return r;}
        const saved=await cache.match(req);return saved||r;
      }catch(e){return await cache.match(req)||await cache.match('./index.html')||Response.error();}
    })());return;
  }
  ev.respondWith((async()=>{
    const cache=await caches.open(CACHE),saved=await cache.match(req);
    if(saved)return saved;
    const r=await fetch(req);
    if(r.ok&&ARQUIVOS.some(p=>new URL(p,self.registration.scope).href===url.href))await cache.put(req,r.clone());
    return r;
  })());
});

