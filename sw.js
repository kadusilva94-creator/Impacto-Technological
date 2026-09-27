/* Premium 4.2: complete offline shell, navigation network-first. */
const CACHE='impacto-campo-premium-v4-2';
const ARQUIVOS=['./','./index.html','./manifest.webmanifest','./icone-192.png','./icone-512.png','./icone-maskable.png','./jspdf.umd.min.js','./fflate.min.js','./pdf-report.js','./export-center.js','./DejaVuSans.ttf','./DejaVuSans-Bold.ttf'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARQUIVOS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&(['levantamento-v1','levantamento-v2','levantamento-v3-premium'].includes(k)||k.startsWith('impacto-campo-premium-'))).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const req=e.request,u=new URL(req.url);if(req.method!=='GET'||u.origin!==self.location.origin||!u.href.startsWith(self.registration.scope))return;
 e.respondWith((async()=>{const c=await caches.open(CACHE);if(req.mode==='navigate'){
  try{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);let r;try{r=await fetch(req,{signal:controller.signal});}finally{clearTimeout(timer);}if(r.ok){await c.put(req,r.clone());return r;}return await c.match(req)||await c.match('./index.html')||r;}catch(e){return await c.match(req)||await c.match('./index.html')||Response.error();}
 }const saved=await c.match(req);if(saved)return saved;const r=await fetch(req);if(r.ok&&ARQUIVOS.some(p=>new URL(p,self.registration.scope).href===u.href))await c.put(req,r.clone());return r;})());
});
