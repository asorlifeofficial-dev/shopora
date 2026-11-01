"use strict";
/* ============ সাধারণ সাহায্যকারী ============ */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const BDG = "০১২৩৪৫৬৭৮৯";
const bn = s => String(s).replace(/\d/g, d => BDG[d]);
const en = s => String(s ?? "").replace(/[০-৯]/g, d => BDG.indexOf(d));
const tk = n => "৳" + bn(Math.round(n).toLocaleString("en-US"));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = s => en(s).toLowerCase().normalize("NFC");
const MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const fdate = t => { const d = new Date(t); return bn(d.getDate()) + " " + MONTHS[d.getMonth()] + " " + bn(d.getFullYear()); };
const DB = {
  get(k, d) { try { const v = localStorage.getItem("shp_" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("shp_" + k, JSON.stringify(v)); return true; } catch (e) { toast("ফোনে জায়গা শেষ, সেভ হয়নি"); return false; } }
};
const safeUrl = s => /^(https:\/\/|data:image\/(jpeg|png|webp|gif);base64,|\.?\/?[\w\-\/.]+\.(jpg|jpeg|png|webp|svg)$)/i.test(String(s || "")) ? s : "";
const phoneOk = s => { const p = en(s).replace(/\D/g, ""); const m = p.match(/^(?:880|0)?(1[3-9]\d{8})$/); return m ? "0" + m[1] : ""; };
const emailOk = s => /^[^\s@<>"'&]+@[^\s@<>"'&]+\.[^\s@<>"'&]+$/.test(String(s || "").trim());

/* ============ আইকন ============ */
const IC = {
  grocery: '<path d="M8 20h32l-3.2 18.5a3 3 0 0 1-3 2.5H14.2a3 3 0 0 1-3-2.5z"/><path d="M16 20l7-11M32 20l-7-11"/><path d="M19 27v8M24 27v8M29 27v8"/>',
  fashion: '<path d="M17 7L6 14l4 8 5-3v21h18V19l5 3 4-8-11-7c-1 3.5-4 5.5-8 5.5S18 10.5 17 7z"/>',
  electronics: '<path d="M9 30v-6a15 15 0 0 1 30 0v6"/><rect x="7" y="28" width="9" height="13" rx="3"/><rect x="32" y="28" width="9" height="13" rx="3"/>',
  home: '<path d="M15 29h18l-2.2 13H17.2z"/><path d="M24 29V15"/><path d="M24 23c-7 0-11-4-11-11 7 0 11 4 11 11z"/><path d="M24 19c5.5 0 9-3 9-9-5.5 0-9 3-9 9z"/>',
  books: '<path d="M24 13c-4.5-3-10.5-4-17-3v28c6.5-1 12.5 0 17 3 4.5-3 10.5-4 17-3V10c-6.5-1-12.5 0-17 3z"/><path d="M24 13v28"/>',
  gifts: '<rect x="7" y="19" width="34" height="22" rx="2"/><rect x="5" y="13" width="38" height="6" rx="2"/><path d="M24 13v28"/><path d="M24 13c-3-7-11-6-10-1.5.5 2 4 1.5 10 1.5zM24 13c3-7 11-6 10-1.5-.5 2-4 1.5-10 1.5z"/>',
  beauty: '<rect x="17" y="20" width="14" height="22" rx="3"/><path d="M20 20v-6h8v6"/><path d="M22 14V7h4v7"/>',
  kitchen: '<path d="M6 22h27v7a9 9 0 0 1-9 9h-9a9 9 0 0 1-9-9z"/><path d="M33 25h10"/><path d="M14 16c0-3 3-3 3-6M21 16c0-3 3-3 3-6"/>',
  toys: '<rect x="6" y="28" width="15" height="14" rx="2"/><rect x="25" y="28" width="15" height="14" rx="2"/><rect x="15" y="12" width="15" height="14" rx="2"/>',
  bag: '<path d="M9 16h30l-2.5 24a3 3 0 0 1-3 2.7h-19a3 3 0 0 1-3-2.7z"/><path d="M17 20v-4a7 7 0 0 1 14 0v4"/>',
  box: '<path d="M6 15l18-9 18 9v18l-18 9-18-9z"/><path d="M6 15l18 9 18-9M24 24v18"/>',
  house: '<path d="M7 22L24 8l17 14"/><path d="M11 20v20h26V20"/><path d="M20 40V28h8v12"/>',
  grid: '<rect x="8" y="8" width="13" height="13" rx="3"/><rect x="27" y="8" width="13" height="13" rx="3"/><rect x="8" y="27" width="13" height="13" rx="3"/><rect x="27" y="27" width="13" height="13" rx="3"/>',
  bolt: '<path d="M27 5L10 27h12l-2 16 18-23H26z"/>',
  phone: '<path d="M13 6h8l3 10-5 3a24 24 0 0 0 10 10l3-5 10 3v8a4 4 0 0 1-4 4C22 39 9 26 9 10a4 4 0 0 1 4-4z"/>',
  user: '<circle cx="24" cy="16" r="8"/><path d="M8 42c0-9 7-14 16-14s16 5 16 14"/>',
  cart: '<path d="M5 8h6l5 22h21l4-16H13"/><circle cx="19" cy="38" r="3"/><circle cx="35" cy="38" r="3"/>',
  chat: '<path d="M8 10h32a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H22l-9 8v-8H8a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="5" y="10" width="38" height="28" rx="4"/><path d="M6 14l18 14 18-14"/>',
  menu: '<path d="M8 14h32M8 24h32M8 34h32"/>',
  camera: '<rect x="7" y="7" width="34" height="34" rx="10"/><circle cx="24" cy="24" r="8"/><circle cx="34.5" cy="13.5" r="1.5" fill="currentColor"/>',
  fb: '<path d="M28 42V26h5l1-6h-6v-4c0-2 1-3 3-3h3V8h-5c-5 0-8 3-8 8v4h-5v6h5v16z"/>',
  search: '<circle cx="21" cy="21" r="13"/><path d="M31 31l11 11"/>',
  heart: '<path d="M24 41S6 30 6 18a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 12-18 23-18 23z"/>',
  star: '<path d="M24 5l5.8 12 13.2 1.8-9.6 9.2 2.4 13L24 34.7 12.2 41l2.4-13L5 18.8 18.2 17z"/>',
  truck: '<path d="M4 12h26v22H4zM30 20h9l5 7v7H30z"/><circle cx="14" cy="36" r="4"/><circle cx="36" cy="36" r="4"/>',
  tag: '<path d="M6 24L24 6h16v16L22 40z"/><circle cx="33" cy="15" r="2.5"/>',
  percent: '<path d="M38 10L10 38"/><circle cx="14" cy="14" r="5"/><circle cx="34" cy="34" r="5"/>',
  computer: '<rect x="5" y="9" width="38" height="25" rx="3"/><path d="M16 42h16M24 34v8"/>',
  mobile: '<rect x="13" y="4" width="22" height="40" rx="4"/><path d="M21 38h6"/>',
  watch: '<rect x="13" y="12" width="22" height="24" rx="6"/><path d="M18 12l2-7h8l2 7M18 36l2 7h8l2-7M24 20v5l3 2"/>',
  gamepad: '<path d="M12 16h24a8 8 0 0 1 8 8v4a6 6 0 0 1-10 4l-4-3H18l-4 3A6 6 0 0 1 4 28v-4a8 8 0 0 1 8-8z"/><path d="M14 22v6M11 25h6"/><circle cx="32" cy="23" r="1.5"/><circle cx="36" cy="27" r="1.5"/>',
  wifi: '<path d="M5 18a28 28 0 0 1 38 0M11 25a19 19 0 0 1 26 0M17 32a10 10 0 0 1 14 0"/><circle cx="24" cy="38" r="2"/>',
  speaker: '<rect x="12" y="4" width="24" height="40" rx="4"/><circle cx="24" cy="29" r="7"/><circle cx="24" cy="12" r="2.5"/>',
  printer: '<rect x="9" y="16" width="30" height="20" rx="2"/><path d="M15 16V8h18v8M15 36v6h18v-6"/>',
  plug: '<rect x="10" y="5" width="28" height="38" rx="4"/><circle cx="24" cy="27" r="8"/><path d="M16 12h4"/>',
  calculator: '<rect x="10" y="4" width="28" height="40" rx="4"/><rect x="15" y="9" width="18" height="8"/><path d="M16 25h2M23 25h2M30 25h2M16 31h2M23 31h2M30 31h2M16 37h2M23 37h2M30 37h2"/>',
  flask: '<path d="M19 5h10M21 5v14L9 38a4 4 0 0 0 3.5 6h23a4 4 0 0 0 3.5-6L27 19V5"/><path d="M14 31h20"/>',
  pencil: '<path d="M8 40l2-9L33 8a4 4 0 0 1 6 6L16 37z"/><path d="M29 12l7 7"/>',
  notebook: '<rect x="10" y="5" width="28" height="38" rx="3"/><path d="M16 5v38M22 14h10M22 21h10"/>',
  brush: '<path d="M30 6l12 12-14 14-12-12z"/><path d="M16 20C10 26 8 32 6 42c10-2 16-4 22-10"/>',
  baby: '<circle cx="24" cy="24" r="16"/><path d="M18 22h.01M30 22h.01M19 29c3 3 7 3 10 0"/><path d="M24 8c0-3 3-4 5-3"/>',
  bottle: '<path d="M19 4h10v6l3 4v26a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V14l3-4z"/><path d="M16 22h16"/>',
  leaf: '<path d="M8 40C8 20 20 8 42 6c0 22-12 34-30 34"/><path d="M8 40l16-16"/>',
  drop: '<path d="M24 5s-14 16-14 25a14 14 0 0 0 28 0C38 21 24 5 24 5z"/>',
  pill: '<rect x="5" y="17" width="38" height="14" rx="7"/><path d="M24 17v14"/>',
  scissors: '<circle cx="12" cy="36" r="5"/><circle cx="12" cy="12" r="5"/><path d="M16 15l26 21M16 33L42 12"/>',
  mosque: '<path d="M10 42V24a14 14 0 0 1 28 0v18z"/><path d="M24 4v6M20 42v-8a4 4 0 0 1 8 0v8"/>',
  diaper: '<path d="M5 14h38v10c0 8-8 14-19 14S5 32 5 24z"/><path d="M5 20h38"/>',
  pacifier: '<circle cx="24" cy="31" r="9"/><circle cx="24" cy="12" r="6"/><path d="M24 18v4"/>',
  teether: '<circle cx="24" cy="18" r="12"/><circle cx="24" cy="18" r="5"/><path d="M24 30v14"/>',
  grad: '<path d="M3 18L24 8l21 10-21 10z"/><path d="M12 23v10c3 4 9 6 12 6s9-2 12-6V23M45 18v12"/>',
  trophy: '<path d="M14 6h20v14a10 10 0 0 1-20 0zM14 10H6v4a8 8 0 0 0 8 8M34 10h8v4a8 8 0 0 1-8 8"/><path d="M24 30v8M16 42h16"/>',
  users: '<circle cx="17" cy="16" r="7"/><circle cx="34" cy="18" r="5"/><path d="M4 40c0-8 6-12 13-12s13 4 13 12M32 28c6 0 12 3 12 11"/>',
  link: '<path d="M20 28a8 8 0 0 0 11 0l8-8a8 8 0 0 0-11-11l-3 3"/><path d="M28 20a8 8 0 0 0-11 0l-8 8a8 8 0 0 0 11 11l3-3"/>',
  help: '<circle cx="24" cy="24" r="19"/><path d="M18 19a6 6 0 1 1 8 5c-2 1-2 3-2 5M24 35h.01"/>',
  ret: '<path d="M10 18h20a10 10 0 0 1 0 20H14"/><path d="M18 10l-8 8 8 8"/>',
  close: '<path d="M10 10l28 28M38 10L10 38"/>',
  check: '<path d="M8 25l11 11L40 12"/>',
  clock: '<circle cx="24" cy="24" r="19"/><path d="M24 12v13l8 5"/>',
  globe: '<circle cx="24" cy="24" r="19"/><path d="M5 24h38M24 5c-9 10-9 28 0 38M24 5c9 10 9 28 0 38"/>',
  fire: '<path d="M24 4c2 8 12 12 12 24a12 12 0 0 1-24 0c0-6 3-9 5-12 1 4 3 5 4 5-2-8 1-12 3-17z"/>',
  sparkle: '<path d="M24 4l4 14 14 4-14 4-4 14-4-14-14-4 14-4z"/>',
  crown: '<path d="M6 36l-2-22 12 10 8-16 8 16 12-10-2 22z"/>',
  trash: '<path d="M8 12h32M18 12V6h12v6M12 12l2 30h20l2-30"/>',
  filter: '<path d="M5 10h38L28 26v14l-8 4V26z"/>',
  pin: '<path d="M24 44S9 30 9 19a15 15 0 0 1 30 0c0 11-15 25-15 25z"/><circle cx="24" cy="19" r="5"/>',
  download: '<path d="M24 6v26M12 22l12 12 12-12M8 42h32"/>',
  share: '<circle cx="36" cy="10" r="5"/><circle cx="12" cy="24" r="5"/><circle cx="36" cy="38" r="5"/><path d="M16 22l16-9M16 26l16 9"/>'
};
const ico = k => `<svg class="ico" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || IC.box}</svg>`;
function hydrate(root = document) { $$("[data-i]", root).forEach(e => { if (e.dataset.ih !== "1") { e.insertAdjacentHTML("afterbegin", ico(e.dataset.i)); e.dataset.ih = "1"; } }); }

/* ============ অবস্থা (ফোনের ব্রাউজারে সেভ) ============ */
let cart = DB.get("cart", {}), wish = DB.get("wish", []), hist = DB.get("hist", []);
let users = DB.get("users", []), orders = DB.get("orders", []), reviews = DB.get("reviews", {});
let sessId = DB.get("sess", null);
const me = () => users.find(u => u.id === sessId) || null;
const P = id => PRODUCTS.find(p => p.id === +id);
const saveCart = () => { DB.set("cart", cart); badges(); };
const canBuy = p => p.stock > 0 || !!p.pre;
const disc = p => p.old > p.price ? Math.round((p.old - p.price) / p.old * 100) : 0;
const rating = p => { const r = reviews[p.id] || []; return r.length ? { avg: r.reduce((a, x) => a + x.rate, 0) / r.length, n: r.length } : null; };
const stars = n => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
PRODUCTS.forEach(p => { p.hay = norm([p.name, p.author, p.publisher, p.brand, p.catName].filter(Boolean).join(" ")); });

/* ============ টোস্ট ও শিট ============ */
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove("on"), 2200); }
function openSheet(html, kind = "bottom") {
  closeSheet(); const s = kind === "drawer" ? $("#drawer") : $("#sheet");
  s.innerHTML = html; hydrate(s); s.classList.add("on"); $("#scrim").classList.add("on"); document.body.classList.add("noscroll");
}
function closeSheet() { $$(".sheet.on").forEach(s => s.classList.remove("on")); $("#scrim").classList.remove("on"); document.body.classList.remove("noscroll"); }

/* ============ ছবি/কভার ============ */
function hue(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
function art(p, big) {
  const im = safeUrl(p.img);
  if (im) return `<img class="pimg" src="${esc(im)}" alt="${esc(p.name)}" loading="lazy">`;
  if (p.type === "book") return `<div class="cover${big ? " big" : ""}" style="--h:${hue(p.name)}"><span class="ct">${esc(p.name)}</span><span class="ca">${esc(p.author)}</span></div>`;
  return `<div class="tile" style="--h:${hue(p.cat)}">${ico(CATMAP[p.cat].icon)}</div>`;
}

/* ============ কার্ট, উইশলিস্ট, কুপন ============ */
function addCart(id, q = 1, silent) {
  const p = P(id); if (!p) return false;
  if (!canBuy(p)) { toast("এই পণ্যের স্টক নেই"); return false; }
  const cur = cart[id] || 0, max = p.pre ? 20 : p.stock;
  if (cur + q > max) { toast("স্টকে মাত্র " + bn(max) + "টি আছে"); return false; }
  cart[id] = cur + q; saveCart(); if (!silent) toast("কার্টে যোগ হয়েছে"); return true;
}
function setQty(id, q) { const p = P(id); if (!p) return; const max = p.pre ? 20 : p.stock; if (q <= 0) delete cart[id]; else cart[id] = Math.min(q, max); saveCart(); }
function toggleWish(id) { const i = wish.indexOf(+id); if (i >= 0) { wish.splice(i, 1); toast("উইশলিস্ট থেকে সরানো হয়েছে"); } else { wish.push(+id); toast("উইশলিস্টে রাখা হয়েছে"); } DB.set("wish", wish); badges(); }
const cartLines = () => Object.keys(cart).map(id => ({ p: P(id), q: cart[id] })).filter(x => x.p);
function applyCoupon(code, sub) {
  code = String(code || "").trim().toUpperCase(); if (!code) return null;
  const c = SITE.coupons[code]; if (!c) return { ok: false, msg: "কুপন কোডটি ঠিক নয়" };
  if (sub < c.min) return { ok: false, msg: "এই কুপনে কমপক্ষে " + tk(c.min) + " এর অর্ডার লাগবে" };
  let d = 0; if (c.type === "percent") d = Math.min(Math.round(sub * c.value / 100), c.cap || 1e9); else if (c.type === "flat") d = c.value;
  return { ok: true, code, disc: d, freeShip: c.type === "ship", msg: c.note };
}
function totals(city, express) {
  const lines = cartLines(), sub = lines.reduce((a, x) => a + x.p.price * x.q, 0);
  const cp = applyCoupon(DB.get("coupon", ""), sub); const dsc = cp && cp.ok ? cp.disc : 0;
  let ship = 0, days = "";
  if (city) {
    const z = city === "ঢাকা" ? SITE.shipping.dhaka : SITE.shipping.outside; ship = z.fee; days = z.days;
    if (express) { ship += SITE.shipping.expressExtra; days = city === "ঢাকা" ? "আজ/কাল" : "২–৩ দিন"; }
    else if (sub - dsc >= SITE.freeShipMin || (cp && cp.ok && cp.freeShip)) ship = 0;
  }
  return { lines, sub, dsc, ship, days, total: sub - dsc + ship, cp };
}
function pushHist(id) { hist = [+id, ...hist.filter(x => x !== +id)].slice(0, 30); DB.set("hist", hist); }

/* ============ কার্ড ============ */
function card(p) {
  const d = disc(p), r = rating(p), w = wish.includes(p.id);
  const sub = p.type === "book" ? p.author : p.brand;
  const st = p.pre ? '<span class="stk">প্রি-অর্ডার</span>' : p.stock === 0 ? "" : p.stock <= 3 ? `<span class="stk low">মাত্র ${bn(p.stock)}টি বাকি</span>` : '<span class="stk">স্টকে আছে</span>';
  return `<article class="pc"><a class="pcl" href="#/p/${p.id}"><div class="pic">${art(p)}${d ? `<em>-${bn(d)}%</em>` : ""}${p.pre ? "<u class=pre>প্রি-অর্ডার</u>" : p.stock === 0 ? "<u>স্টক নেই</u>" : ""}</div>
  <div class="in"><h3>${esc(p.name)}</h3><span class="br">${esc(sub)}</span>${r ? `<span class="stars">${stars(r.avg)}<small>(${bn(r.n)})</small></span>` : ""}${st}
  <div class="price"><b>${tk(p.price)}</b>${p.old > p.price ? `<s>${tk(p.old)}</s>` : ""}</div></div></a>
  <button class="wb${w ? " on" : ""}" data-act="wish" data-id="${p.id}" aria-label="উইশলিস্ট" aria-pressed="${w}" data-i="heart"></button>
  <button class="add" data-act="add" data-id="${p.id}" ${canBuy(p) ? "" : "disabled"}>${p.pre ? "প্রি-অর্ডার করুন" : "কার্টে দিন"}</button></article>`;
}
const mini = p => `<a class="tr" href="#/p/${p.id}"><div class="pic">${art(p)}</div><span>${esc(p.name)}</span></a>`;
const rail = (list, n = 12) => `<div class="hs">${list.slice(0, n).map(p => `<div class="hsi">${card(p)}</div>`).join("")}</div>`;
const grid = list => list.length ? `<div class="pgrid">${list.map(card).join("")}</div>` : '<div class="empty"><b>কোনো পণ্য মেলেনি</b><p>অন্য শব্দে খুঁজুন বা ফিল্টার বদলান।</p></div>';
function sec(title, inner, more, ic) {
  return `<section class="sec"><div class="sech"><h2>${ic ? `<span class="hi" data-i="${ic}"></span>` : ""}${title}</h2>${more ? `<a class="more" href="#${more}">সব দেখুন ›</a>` : ""}</div>${inner}</section>`;
}

/* ============ সার্চ ============ */
function searchProducts(q, scope) {
  const t = norm(q).split(/\s+/).filter(Boolean); if (!t.length) return [];
  return PRODUCTS.filter(p => {
    let h = p.hay;
    if (scope === "author") h = norm(p.author); else if (scope === "publisher") h = norm(p.publisher); else if (scope === "brand") h = norm(p.brand);
    else if (scope === "book") h = p.type === "book" ? p.hay : ""; else if (scope === "product") h = p.type !== "book" ? p.hay : "";
    return t.every(x => (h || "").includes(x));
  });
}
const uniq = (arr, f) => { const m = new Map(); arr.forEach(p => { const k = f(p); if (k) m.set(k, (m.get(k) || 0) + 1); }); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
function suggestions(q) {
  const t = norm(q).trim(); const out = [];
  if (!t) return SITE.popularSearches.map(s => ({ k: "pop", label: s, go: "/search?q=" + encodeURIComponent(s), ic: "search" }));
  PRODUCTS.filter(p => p.hay.includes(t)).sort((a, b) => b.pop - a.pop).slice(0, 5).forEach(p => out.push({ k: p.type === "book" ? "বই" : "পণ্য", label: p.name, go: "/p/" + p.id, ic: p.type === "book" ? "books" : "box" }));
  uniq(PRODUCTS, p => p.author).filter(([a]) => norm(a).includes(t)).slice(0, 2).forEach(([a]) => out.push({ k: "লেখক", label: a, go: "/list?author=" + encodeURIComponent(a), ic: "user" }));
  uniq(PRODUCTS, p => p.publisher).filter(([a]) => norm(a).includes(t)).slice(0, 2).forEach(([a]) => out.push({ k: "প্রকাশনী", label: a, go: "/list?publisher=" + encodeURIComponent(a), ic: "books" }));
  uniq(PRODUCTS, p => p.brand).filter(([a]) => norm(a).includes(t)).slice(0, 2).forEach(([a]) => out.push({ k: "ব্র্যান্ড", label: a, go: "/list?brand=" + encodeURIComponent(a), ic: "tag" }));
  return out;
}
function drawSug() {
  const box = $("#sug"), q = $("#q").value, list = suggestions(q);
  if (!list.length) { box.hidden = true; return; }
  box.innerHTML = (q.trim() ? "" : '<div class="sugh">জনপ্রিয় খোঁজ</div>') + list.map(s => `<a class="sugi" href="#${s.go}" data-act="sugclose"><span data-i="${s.ic}"></span><b>${esc(s.label)}</b>${s.k === "pop" ? "" : `<small>${s.k}</small>`}</a>`).join("");
  hydrate(box); box.hidden = false;
}

/* ============ বার্তা পাঠানো (হোয়াটসঅ্যাপ / ইমেইল / ফর্ম-এন্ডপয়েন্ট) ============ */
const waNum = () => { const n = phoneOk(SITE.contact.whatsapp); return n ? "88" + n : ""; };
const waLink = msg => waNum() ? `https://wa.me/${waNum()}?text=${encodeURIComponent(msg)}` : "";
const mailLink = (msg, sub, to) => { const e = to || SITE.contact.email; return emailOk(e) ? `mailto:${e.trim()}?subject=${encodeURIComponent(sub || "বার্তা")}&body=${encodeURIComponent(msg)}` : ""; };
async function postEndpoint(kind, data) {
  if (!SITE.endpoint) return false;
  try { const r = await fetch(SITE.endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ kind, site: SITE.name, at: new Date().toISOString(), ...data }) }); return r.ok; } catch (e) { return false; }
}
// ফর্মের বার্তা দোকানে পাঠানোর বোতাম (ফর্ম-এন্ডপয়েন্ট থাকলে নিজে পাঠায়, নইলে হোয়াটসঅ্যাপ/ইমেইল খোলে)
function sendButtons(msg, subject, to) {
  const w = waLink(msg), m = mailLink(msg, subject, to);
  return `<div class="sendb">${w ? `<a class="btn wa" href="${esc(w)}" target="_blank" rel="noopener"><span data-i="chat"></span>হোয়াটসঅ্যাপে পাঠান</a>` : `<button class="btn off" type="button" data-act="na" data-n="হোয়াটসঅ্যাপ"><span data-i="chat"></span>হোয়াটসঅ্যাপে পাঠান</button>`}
  ${m ? `<a class="btn ghost" href="${esc(m)}"><span data-i="mail"></span>ইমেইলে পাঠান</a>` : `<button class="btn ghost off" type="button" data-act="na" data-n="ইমেইল"><span data-i="mail"></span>ইমেইলে পাঠান</button>`}</div>`;
}

/* ============ রাউটার ============ */
const V = {};       // V.নাম = (r) => html
const AFTER = [];   // রেন্ডারের পর চালানোর কাজ
function parseHash() { const h = location.hash.slice(1) || "/"; const [p, q] = h.split("?"); return { path: p, segs: p.split("/").filter(Boolean), q: new URLSearchParams(q || ""), raw: h }; }
function go(path) { location.hash = "#" + path; }
let lastKey = "";
function render() {
  const r = parseHash(), name = r.segs[0] || "home", f = V[name] || V.nf;
  closeSheet(); $("#sug").hidden = true; $("#filtp") && $("#filtp").classList.remove("show");
  AFTER.length = 0;
  try { $("#view").innerHTML = f(r) + (typeof footer === "function" ? footer() : ""); } catch (e) { console.error(e); $("#view").innerHTML = '<div class="empty"><b>পাতাটি খুলতে সমস্যা হয়েছে</b><p><a href="#/">হোমে ফিরুন</a></p></div>'; }
  hydrate($("#view")); AFTER.forEach(fn => { try { fn(r); } catch (e) { console.error(e); } });
  if (r.raw !== lastKey) { window.scrollTo(0, 0); lastKey = r.raw; }
  $$("#nav a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#/" + name));
  document.title = (V.title ? V.title(r) : "") + SITE.name + " — সব কেনাকাটা এক জায়গায়";
}
function badges() {
  const n = Object.values(cart).reduce((a, b) => a + b, 0);
  $("#cartN").textContent = bn(n); $("#cartN").hidden = !n;
  $("#wishN").textContent = bn(wish.length); $("#wishN").hidden = !wish.length;
  const u = me(); $("#accTxt").textContent = u ? u.name.split(" ")[0] : "সাইন ইন";
}

/* ============ ইভেন্ট (data-act দিয়ে) ============ */
const ACT = {}, FORM = {};
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) { if (!e.target.closest(".sbar")) $("#sug").hidden = true; return; }
  const a = el.dataset.act; if (ACT[a]) { if (el.tagName === "A" && !el.getAttribute("href")) e.preventDefault(); ACT[a](el, e); }
});
document.addEventListener("submit", e => { const f = e.target.closest("form[data-form]"); if (f && FORM[f.dataset.form]) { e.preventDefault(); FORM[f.dataset.form](f, e); } });
ACT.add = el => { if (addCart(+el.dataset.id)) { const b = el; b.classList.add("pop"); setTimeout(() => b.classList.remove("pop"), 300); } };
ACT.wish = el => { toggleWish(el.dataset.id); el.classList.toggle("on"); el.setAttribute("aria-pressed", el.classList.contains("on")); if (parseHash().segs[0] === "wishlist") render(); };
ACT.close = () => closeSheet();
ACT.sugclose = () => { $("#sug").hidden = true; };
ACT.na = el => toast((el.dataset.n || "এটা") + " এখনো সেট করা হয়নি");
ACT.menu = () => openSheet(menuHtml(), "drawer");
ACT.chat = () => openSheet(chatHtml());
ACT.copy = el => { const t = el.dataset.t; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast("কপি হয়েছে"), () => toast(t)); };

/* ============ শুরু ============ */
function boot() {
  if (SITE.demo) $("#demo").hidden = false;
  hydrate(); badges();
  const q = $("#q");
  q.addEventListener("input", drawSug); q.addEventListener("focus", drawSug);
  $("#sf").addEventListener("submit", e => { e.preventDefault(); const v = q.value.trim(); if (!v) return; $("#sug").hidden = true; q.blur(); go("/search?q=" + encodeURIComponent(v) + "&scope=" + $("#sscope").value); });
  $("#scrim").addEventListener("click", closeSheet);
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeSheet(); $("#sug").hidden = true; } });
  window.addEventListener("hashchange", render);
  const ref = new URLSearchParams(location.hash.split("?")[1] || "").get("ref") || new URLSearchParams(location.search).get("ref");
  if (ref && /^[A-Za-z0-9]{4,12}$/.test(ref)) DB.set("ref", ref.toUpperCase());
  render();
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => { }));
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); window._ip = e; });
}
