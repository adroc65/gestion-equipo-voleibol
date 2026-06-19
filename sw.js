const CACHE="gestion-equipo-v2";
const ARCHIVOS=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARCHIVOS).catch(()=>{})).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

// Network-first para HTML (siempre descarga la versión más reciente);
// cache-first para el resto (íconos, manifest).
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.mode==="navigate"||req.url.endsWith(".html")){
    e.respondWith(
      fetch(req.url,{cache:"no-store"})
        .then(r=>{ const c=r.clone(); caches.open(CACHE).then(ca=>ca.put("./index.html",c)); return r; })
        .catch(()=>caches.match(req).then(r=>r||caches.match("./index.html")))
    );
  } else {
    e.respondWith(caches.match(req).then(r=>r||fetch(req)));
  }
});
