// শপোরা সার্ভিস ওয়ার্কার: নেট থাকলে নতুন ফাইল, না থাকলে সেভ করা কপি।
// ফাইল বদলালে VERSION সংখ্যা বাড়িয়ে দিন।
const VERSION = "v6";
const CACHE = "shopora-" + VERSION;
const SHELL = ["./", "./index.html", "./style.css", "./data.js", "./core.js", "./shop.js", "./account.js", "./pages.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("shopora-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  if (new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); } return res; }).catch(() => caches.match(r).then(h => h || caches.match("./index.html"))));
});
