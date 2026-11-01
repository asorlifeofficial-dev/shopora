"use strict";
/* ============ হাব, তালিকা, সার্চ, বিস্তারিত ============ */
const TYPE_NAME = { book: "বই", gadget: "ইলেকট্রনিক্স ও স্টেশনারি", store: "সুপার স্টোর", kids: "কিডস জোন" };
const TYPE_HUB = { book: "books", gadget: "electronics", store: "store", kids: "kids" };
const SORTS = { pop: "জনপ্রিয়", new: "নতুন আগে", pl: "দাম: কম থেকে বেশি", ph: "দাম: বেশি থেকে কম", disc: "বেশি ছাড়", name: "নাম (অ-হ)" };
const PER = 20;
const bySort = (list, s) => {
  const a = [...list];
  if (s === "new") a.sort((x, y) => x.age - y.age); else if (s === "pl") a.sort((x, y) => x.price - y.price);
  else if (s === "ph") a.sort((x, y) => y.price - x.price); else if (s === "disc") a.sort((x, y) => disc(y) - disc(x));
  else if (s === "name") a.sort((x, y) => x.name.localeCompare(y.name, "bn")); else a.sort((x, y) => y.pop - x.pop);
  return a;
};
const hq = (path, o) => { const s = new URLSearchParams(); Object.entries(o).forEach(([k, v]) => { if (v !== "" && v != null && v !== false) s.set(k, v === true ? "1" : v); }); const t = s.toString(); return "#" + path + (t ? "?" + t : ""); };
const cats = list => list.map(c => `<a class="cat" href="#/list?cat=${c[0]}"><span data-i="${c[2]}"></span>${c[1]}</a>`).join("");

/* ---- ফিল্টার প্রয়োগ ---- */
function applyFilters(base, q) {
  let l = base;
  const g = k => q.get(k) || "";
  if (g("type")) l = l.filter(p => p.type === g("type"));
  if (g("cat")) l = l.filter(p => p.cat === g("cat"));
  if (g("author")) l = l.filter(p => p.author === g("author"));
  if (g("publisher")) l = l.filter(p => p.publisher === g("publisher"));
  if (g("brand")) l = l.filter(p => p.brand === g("brand"));
  if (g("min")) l = l.filter(p => p.price >= +en(g("min")));
  if (g("max")) l = l.filter(p => p.price <= +en(g("max")));
  if (g("avail")) l = l.filter(p => p.stock > 0);
  if (g("off")) l = l.filter(p => disc(p) > 0);
  if (g("acad")) l = l.filter(p => p.acad);
  if (g("foreign")) l = l.filter(p => p.foreign);
  if (g("pre")) l = l.filter(p => p.pre);
  return l;
}
function listPage(r, title, base, opt = {}) {
  const q = r.q, filt = applyFilters(base, q), sorted = bySort(filt, q.get("sort") || "pop");
  const pg = Math.max(1, +q.get("page") || 1), pages = Math.ceil(sorted.length / PER) || 1, cur = Math.min(pg, pages);
  const slice = sorted.slice((cur - 1) * PER, cur * PER);
  const cp = new URLSearchParams(q); const mk = (k, v) => { const c = new URLSearchParams(cp); if (v === "" || v == null) c.delete(k); else c.set(k, v); if (k !== "page") c.delete("page"); return "#" + r.path + "?" + c.toString(); };
  const active = ["min", "max", "avail", "off", "author", "publisher", "brand"].filter(k => q.get(k));
  const sortSel = `<select aria-label="সাজান" data-act="sort" data-base="${esc(r.path)}">${Object.entries(SORTS).map(([k, v]) => `<option value="${k}" ${k === (q.get("sort") || "pop") ? "selected" : ""}>${v}</option>`).join("")}</select>`;
  let nums = "";
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - cur) <= 1) nums += `<button data-act="goto" data-href="${esc(mk("page", i))}" class="${i === cur ? "on" : ""}">${bn(i)}</button>`; else if (Math.abs(i - cur) === 2) nums += "<span>…</span>";
  AFTER.push(() => { const s = $("[data-act=sort]"); if (s) s.onchange = () => { const c = new URLSearchParams(location.hash.split("?")[1] || ""); c.set("sort", s.value); c.delete("page"); location.hash = "#" + s.dataset.base + "?" + c.toString(); }; });
  window._lf = { r, base };
  return `${opt.crumb || ""}<h1>${esc(title)}</h1><p class="sub">${bn(filt.length)}টি পণ্য${opt.sub ? " · " + opt.sub : ""}</p>
  ${opt.top || ""}
  <div class="lhead">${sortSel}<button class="btn ghost sm" data-act="filter"><span data-i="filter"></span>ফিল্টার${active.length ? " (" + bn(active.length) + ")" : ""}</button></div>
  ${active.length ? `<div class="chips">${active.map(k => `<a class="chip on" href="${mk(k, "")}">${{ min: "ন্যূনতম " + bn(q.get("min") || ""), max: "সর্বোচ্চ " + bn(q.get("max") || ""), avail: "স্টকে আছে", off: "ছাড়ে", author: q.get("author"), publisher: q.get("publisher"), brand: q.get("brand") }[k]} ✕</a>`).join("")}</div>` : ""}
  ${grid(slice)}${pages > 1 ? `<div class="pager">${cur > 1 ? `<button data-act="goto" data-href="${esc(mk("page", cur - 1))}">‹</button>` : ""}${nums}${cur < pages ? `<button data-act="goto" data-href="${esc(mk("page", cur + 1))}">›</button>` : ""}</div>` : ""}`;
}
ACT.goto = el => { location.hash = el.dataset.href; };
ACT.filter = () => {
  const { r, base } = window._lf, q = r.q, bs = applyFilters(base, new URLSearchParams([...q].filter(([k]) => ["type", "cat", "q", "scope"].includes(k))));
  const opts = (k, label) => { const l = uniq(bs, p => p[k]).slice(0, 15); return l.length ? `<label class="f">${label}</label><select class="fi" name="${k}"><option value="">সব</option>${l.map(([n, c]) => `<option value="${esc(n)}" ${q.get(k) === n ? "selected" : ""}>${esc(n)} (${bn(c)})</option>`).join("")}</select>` : ""; };
  openSheet(`<button class="sx" data-act="close" data-i="close" aria-label="বন্ধ"></button><h2>ফিল্টার</h2><form data-form="filter">
  <div class="row2"><div><label class="f">সর্বনিম্ন দাম</label><input class="fi" name="min" inputmode="numeric" value="${esc(q.get("min") || "")}" placeholder="০"></div><div><label class="f">সর্বোচ্চ দাম</label><input class="fi" name="max" inputmode="numeric" value="${esc(q.get("max") || "")}" placeholder="যেমন ৫০০"></div></div>
  ${opts("author", "লেখক")}${opts("publisher", "প্রকাশনী")}${opts("brand", "ব্র্যান্ড")}
  <label class="opt"><input type="checkbox" name="avail" ${q.get("avail") ? "checked" : ""}> শুধু স্টকে থাকা পণ্য</label>
  <label class="opt"><input type="checkbox" name="off" ${q.get("off") ? "checked" : ""}> শুধু ছাড়ের পণ্য</label>
  <div class="sendb"><button class="btn" type="submit">প্রয়োগ করুন</button><button class="btn ghost" type="button" data-act="fclear">মুছুন</button></div></form>`);
};
FORM.filter = f => {
  const { r } = window._lf, c = new URLSearchParams(r.q), d = new FormData(f);
  ["min", "max", "author", "publisher", "brand"].forEach(k => { const v = String(d.get(k) || "").trim(); v ? c.set(k, en(v)) : c.delete(k); });
  ["avail", "off"].forEach(k => d.get(k) ? c.set(k, "1") : c.delete(k)); c.delete("page");
  closeSheet(); location.hash = "#" + r.path + "?" + c.toString();
};
ACT.fclear = () => { const { r } = window._lf, c = new URLSearchParams(r.q); ["min", "max", "author", "publisher", "brand", "avail", "off", "page"].forEach(k => c.delete(k)); closeSheet(); location.hash = "#" + r.path + "?" + c.toString(); };

/* ---- রাউট: তালিকা, সার্চ ---- */
V.list = r => {
  const q = r.q, cat = q.get("cat"), c = cat && CATMAP[cat], type = q.get("type");
  let title = "সব পণ্য", base = PRODUCTS, crumb = '<div class="crumb"><a href="#/">হোম</a>';
  if (c) { title = c.name; base = PRODUCTS.filter(p => p.cat === cat); crumb += ` › <a href="#/${TYPE_HUB[c.type]}">${TYPE_NAME[c.type]}</a> › ${esc(c.name)}`; }
  else if (q.get("author")) { title = q.get("author"); crumb += " › লেখক"; }
  else if (q.get("publisher")) { title = q.get("publisher"); crumb += " › প্রকাশনী"; }
  else if (q.get("brand")) { title = q.get("brand"); crumb += " › ব্র্যান্ড"; }
  else if (type) { title = TYPE_NAME[type]; crumb += ` › ${TYPE_NAME[type]}`; base = PRODUCTS.filter(p => p.type === type); }
  return listPage(r, title, base, { crumb: crumb + "</div>" });
};
V.search = r => {
  const q = (r.q.get("q") || "").trim(), scope = r.q.get("scope") || "all", res = searchProducts(q, scope);
  if (!q) return '<div class="empty"><b>কী খুঁজছেন?</b><p>ওপরের সার্চ বারে লিখুন।</p></div>';
  const body = listPage(r, "“" + q + "” এর ফলাফল", res, {});
  if (!res.length) return body + sec("হয়তো পছন্দ হবে", rail(bySort(PRODUCTS, "pop"))) + `<div class="box"><b>পছন্দের বই পাচ্ছেন না?</b><p class="sub">আমাদের জানান, আমরা আনানোর চেষ্টা করব।</p><a class="btn ghost sm" href="#/request?title=${encodeURIComponent(q)}">বইয়ের অনুরোধ পাঠান</a></div>`;
  return body;
};
V.new = r => listPage(r, "নতুন আগমন", PRODUCTS.filter(p => p.age < 30), { sub: "গত ৩০ দিনে যোগ হয়েছে" });
V.foreign = r => listPage(r, "বিদেশি বই (ইংরেজি)", PRODUCTS.filter(p => p.foreign), {});
V.preorder = r => listPage(r, "প্রি-অর্ডার", PRODUCTS.filter(p => p.pre), { sub: "প্রকাশের আগেই সংগ্রহ করুন" });
V.best = r => listPage(r, "বেস্ট সেলার", PRODUCTS.filter(p => p.pop >= 70), { sub: "সবচেয়ে বেশি চাহিদার পণ্য" });
V.offers = r => {
  const l = PRODUCTS.filter(p => disc(p) > 0);
  AFTER.push(() => tickCd());
  const top = `<div class="hero2 c-coral"><h1>আজকের অফার</h1><p>আজ রাত ১২টায় শেষ</p><div class="cd" id="cd"></div></div><div class="chips"><a class="chip" href="#/offers?off=1&type=book">বই</a><a class="chip" href="#/offers?off=1&type=gadget">ইলেকট্রনিক্স</a><a class="chip" href="#/offers?off=1&type=store">সুপার স্টোর</a><a class="chip" href="#/offers?off=1&type=kids">কিডস</a></div>`;
  const q = r.q.get("type"); return listPage(r, "ছাড়ের পণ্য", q ? l.filter(p => p.type === q) : l, { top });
};
let _cd = null;
function tickCd() {
  clearInterval(_cd);
  const f = () => { const el = $("#cd"); if (!el) { clearInterval(_cd); return; } const n = new Date(), e = new Date(n); e.setHours(24, 0, 0, 0); let s = Math.floor((e - n) / 1000); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); s %= 60; el.innerHTML = [[h, "ঘণ্টা"], [m, "মিনিট"], [s, "সেকেন্ড"]].map(([v, l]) => `<div><b>${bn(String(v).padStart(2, "0"))}</b><small>${l}</small></div>`).join(""); };
  f(); _cd = setInterval(f, 1000);
}

/* ---- হাব পাতা ---- */
const hubBanner = (cls, t, s, ic) => `<div class="hero2 ${cls}"><h1>${t}</h1><p>${s}</p></div>`;
V.books = r => `${hubBanner("c-violet", "বই", "সব ধরনের বই এক জায়গায়")}
 <div class="chips"><a class="chip" href="#/new">নতুন আগমন</a><a class="chip" href="#/preorder">প্রি-অর্ডার</a><a class="chip" href="#/foreign">বিদেশি বই</a><a class="chip" href="#/best">বেস্ট সেলার</a><a class="chip" href="#/admission">ভর্তি ও চাকরি</a><a class="chip" href="#/request">বই খুঁজে পাচ্ছেন না?</a></div>
 ${sec("বইয়ের বিভাগ", `<div class="cats">${cats(BOOK_CATS)}</div>`)}
 ${sec("একাডেমিক", `<div class="cats">${cats(ACAD_CATS)}</div>`)}
 ${sec("জনপ্রিয় লেখক", `<div class="chips">${uniq(PRODUCTS.filter(p => p.type === "book" && !p.foreign), p => p.author).slice(0, 14).map(([a]) => `<a class="chip" href="#/list?author=${encodeURIComponent(a)}"><span data-i="user"></span>${esc(a)}</a>`).join("")}</div>`)}
 ${sec("প্রকাশনী", `<div class="chips">${uniq(PRODUCTS.filter(p => p.type === "book"), p => p.publisher).map(([a]) => `<a class="chip" href="#/list?publisher=${encodeURIComponent(a)}">${esc(a)}</a>`).join("")}</div>`)}
 ${sec("বেস্ট সেলার বই", rail(bySort(PRODUCTS.filter(p => p.type === "book"), "pop")), "/best")}`;
V.electronics = r => `${hubBanner("c-navy", "ইলেকট্রনিক্স ও স্টেশনারি", "গ্যাজেট, অফিস ও পড়ার সরঞ্জাম")}
 ${sec("বিভাগ", `<div class="cats">${cats(ELEC_CATS)}</div>`)}
 ${sec("ব্র্যান্ড", `<div class="chips">${uniq(PRODUCTS.filter(p => p.type === "gadget"), p => p.brand).map(([a]) => `<a class="chip" href="#/list?brand=${encodeURIComponent(a)}">${esc(a)}</a>`).join("")}</div>`)}
 ${sec("জনপ্রিয়", rail(bySort(PRODUCTS.filter(p => p.type === "gadget"), "pop")), "/list?type=gadget")}`;
V.store = r => `${hubBanner("c-mint", "সুপার স্টোর", "প্রতিদিনের দরকারি সব জিনিস")}
 ${sec("বিভাগ", `<div class="cats">${cats(STORE_CATS)}</div>`)}
 ${sec("ব্র্যান্ড", `<div class="chips">${uniq(PRODUCTS.filter(p => p.type === "store"), p => p.brand).map(([a]) => `<a class="chip" href="#/list?brand=${encodeURIComponent(a)}">${esc(a)}</a>`).join("")}</div>`)}
 ${sec("জনপ্রিয়", rail(bySort(PRODUCTS.filter(p => p.type === "store"), "pop")), "/list?type=store")}`;
V.kids = r => `${hubBanner("c-coral", "কিডস জোন", "ছোটদের খেলনা, যত্ন ও শেখার জিনিস")}
 ${sec("বিভাগ", `<div class="cats">${cats(KIDS_CATS)}</div>`)}
 ${sec("জনপ্রিয়", rail(bySort(PRODUCTS.filter(p => p.type === "kids"), "pop")), "/list?type=kids")}
 ${sec("শিশুদের বই", rail(PRODUCTS.filter(p => p.cat === "kidsbook")), "/list?cat=kidsbook")}`;

/* ---- হোম ---- */
let _bn = null;
V.home = r => {
  const bs = SITE.banners;
  AFTER.push(() => {
    clearInterval(_bn); const t = $("#bnt"); if (!t) return; let i = 0;
    const set = n => { i = (n + bs.length) % bs.length; t.style.transform = `translateX(-${i * 100}%)`; $$("#bnd i").forEach((d, k) => d.classList.toggle("on", k === i)); };
    _bn = setInterval(() => { if ($("#bnt")) set(i + 1); else clearInterval(_bn); }, 4500);
    $$("#bnd i").forEach((d, k) => d.onclick = () => set(k));
    let x0 = null; t.addEventListener("touchstart", e => x0 = e.touches[0].clientX, { passive: true });
    t.addEventListener("touchend", e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) set(i + (d < 0 ? 1 : -1)); x0 = null; });
    tickCd();
  });
  const recs = recommend(8), seen = hist.map(P).filter(Boolean);
  return `<div class="bn"><div class="bn-t" id="bnt">${bs.map(b => `<div class="bn-s c-${b.c}"><h2>${esc(b.t)}</h2><p>${esc(b.s)}</p><a class="pill" href="#${b.link}">${esc(b.pill)}</a>${ico(b.i)}</div>`).join("")}</div></div>
  <div class="dots" id="bnd">${bs.map((b, k) => `<i class="${k ? "" : "on"}"></i>`).join("")}</div>
  <div class="cats" style="margin-top:14px">
   <a class="cat big" href="#/books"><span data-i="books"></span>বই</a><a class="cat big" href="#/electronics"><span data-i="electronics"></span>ইলেকট্রনিক্স</a>
   <a class="cat big" href="#/store"><span data-i="grocery"></span>সুপার স্টোর</a><a class="cat big" href="#/kids"><span data-i="baby"></span>কিডস জোন</a>
   <a class="cat big" href="#/offers"><span data-i="percent"></span>অফার</a><a class="cat big" href="#/best"><span data-i="trophy"></span>বেস্ট সেলার</a>
   <a class="cat big" href="#/preorder"><span data-i="clock"></span>প্রি-অর্ডার</a><a class="cat big" href="#/bulk"><span data-i="users"></span>বাল্ক অর্ডার</a></div>
  <section class="sec"><div class="hero2 c-coral" style="margin:0"><div class="sech" style="margin:0"><h2 style="color:#fff"><span class="hi" style="color:#fff" data-i="bolt"></span>ফ্ল্যাশ অফার</h2><a class="more" style="color:#fff" href="#/offers">সব দেখুন ›</a></div><div class="cd" id="cd" style="margin:8px 0 2px"></div></div>${rail(bySort(PRODUCTS.filter(p => disc(p) >= 15), "disc"), 10)}</section>
  ${sec("বেস্ট সেলার", rail(bySort(PRODUCTS, "pop")), "/best", "trophy")}
  ${sec("নতুন আগমন", rail(bySort(PRODUCTS, "new"), 10), "/new", "sparkle")}
  ${PRODUCTS.some(p => p.pre) ? sec("প্রি-অর্ডার", rail(PRODUCTS.filter(p => p.pre)), "/preorder", "clock") : ""}
  ${seen.length ? sec("সম্প্রতি দেখেছেন", `<div class="hs">${seen.slice(0, 10).map(mini).join("")}</div>`) : ""}
  ${sec(me() || hist.length || wish.length ? "আপনার জন্য" : "জনপ্রিয় বাছাই", rail(recs), "/foryou", "heart")}
  ${sec("ভর্তি ও চাকরির প্রস্তুতি", `<div class="cats">${cats(ACAD_CATS.slice(4))}</div>`, "/admission", "grad")}
  <section class="sec"><div class="tiles">
   <a class="tile2" href="#/bulk"><span data-i="users"></span><b>বাল্ক অর্ডার</b><small>প্রতিষ্ঠান ও লাইব্রেরির জন্য</small></a>
   <a class="tile2" href="#/donate"><span data-i="gifts"></span><b>বই দান করুন</b><small>অন্যের হাতে পৌঁছে দিন</small></a>
   <a class="tile2" href="#/quiz"><span data-i="trophy"></span><b>কুইজ</b><small>খেলুন, জানুন</small></a>
   <a class="tile2" href="#/affiliate"><span data-i="link"></span><b>অ্যাফিলিয়েট</b><small>শেয়ার করে আয় করুন</small></a></div></section>
  <section class="sec"><div class="tiles">
   <div class="tile2"><span data-i="truck"></span><b>দ্রুত ডেলিভারি</b><small>ঢাকায় ${SITE.shipping.dhaka.days}</small></div>
   <div class="tile2"><span data-i="ret"></span><b>${bn(SITE.returnDays)} দিনে রিটার্ন</b><small>শর্ত সাপেক্ষে</small></div>
   <div class="tile2"><span data-i="check"></span><b>নিরাপদ পেমেন্ট</b><small>ক্যাশ অন ডেলিভারি আছে</small></div>
   <div class="tile2"><span data-i="chat"></span><b>সাপোর্ট</b><small>${esc(SITE.contact.hours)}</small></div></div></section>`;
};
function recommend(n) {
  const seed = [...hist.map(P), ...wish.map(P), ...(orders.filter(o => o.uid === sessId).flatMap(o => o.items.map(i => P(i.id))))].filter(Boolean);
  const cs = {}; seed.forEach(p => { cs[p.cat] = (cs[p.cat] || 0) + 2; });
  const owned = new Set(seed.map(p => p.id));
  const scored = PRODUCTS.filter(p => !owned.has(p.id)).map(p => ({ p, s: (cs[p.cat] || 0) * 10 + (seed.some(x => x.author && x.author === p.author) ? 25 : 0) + (seed.some(x => x.brand && x.brand === p.brand) ? 8 : 0) + p.pop / 10 }));
  return scored.sort((a, b) => b.s - a.s).slice(0, n).map(x => x.p);
}
V.foryou = r => {
  const has = hist.length || wish.length;
  return `<h1>আপনার জন্য</h1><p class="sub">${has ? "আপনার দেখা ও পছন্দের ওপর ভিত্তি করে বাছাই" : "কিছু পণ্য দেখলে বা উইশলিস্টে রাখলে এখানে আপনার পছন্দমতো বাছাই আসবে। আপাতত জনপ্রিয়গুলো:"}</p>${grid(recommend(20))}`;
};
V.wishlist = r => {
  const l = wish.map(P).filter(Boolean);
  return `<h1>উইশলিস্ট</h1>${l.length ? `<div class="sendb"><button class="btn ghost sm" data-act="wishall">সবগুলো কার্টে দিন</button></div>${grid(l)}` : '<div class="empty"><b>উইশলিস্ট খালি</b><p>পছন্দের পণ্যে ♥ চাপুন।</p><a class="btn" href="#/">কেনাকাটা শুরু করুন</a></div>'}`;
};
ACT.wishall = () => { let n = 0; wish.map(P).filter(Boolean).forEach(p => { if (canBuy(p) && addCart(p.id, 1, true)) n++; }); toast(bn(n) + "টি পণ্য কার্টে গেছে"); };
V.nf = () => '<div class="empty"><b>পাতাটি পাওয়া যায়নি</b><a class="btn" href="#/">হোমে যান</a></div>';

/* ---- পণ্যের বিস্তারিত ---- */
V.p = r => {
  const p = P(r.segs[1]); if (!p) return V.nf();
  pushHist(p.id);
  const d = disc(p), rs = reviews[p.id] || [], rt = rating(p), w = wish.includes(p.id), u = me();
  const sameCat = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id), sameAuth = p.author ? PRODUCTS.filter(x => x.author === p.author && x.id !== p.id) : [];
  const dist = [5, 4, 3, 2, 1].map(s => [s, rs.filter(x => x.rate === s).length]);
  const kv = p.type === "book"
    ? [["লেখক", `<a href="#/list?author=${encodeURIComponent(p.author)}" style="color:var(--v)">${esc(p.author)}</a>`], ["প্রকাশনী", `<a href="#/list?publisher=${encodeURIComponent(p.publisher)}" style="color:var(--v)">${esc(p.publisher)}</a>`], ["বিভাগ", `<a href="#/list?cat=${p.cat}" style="color:var(--v)">${esc(p.catName)}</a>`], ["ভাষা", p.foreign ? "ইংরেজি" : "বাংলা"]]
    : [["ব্র্যান্ড", `<a href="#/list?brand=${encodeURIComponent(p.brand)}" style="color:var(--v)">${esc(p.brand)}</a>`], ["বিভাগ", `<a href="#/list?cat=${p.cat}" style="color:var(--v)">${esc(p.catName)}</a>`]];
  if (p.pre) kv.push(["প্রকাশের তারিখ", fdate(p.pre)]);
  const myrev = u ? rs.find(x => x.uid === u.id) : null;
  return `<div class="crumb"><a href="#/">হোম</a> › <a href="#/${TYPE_HUB[p.type]}">${TYPE_NAME[p.type]}</a> › <a href="#/list?cat=${p.cat}">${esc(p.catName)}</a></div>
  <div class="pd"><div class="box" style="margin:0"><div class="pic">${art(p, 1)}${d ? `<em>-${bn(d)}%</em>` : ""}</div></div>
  <div><h1>${esc(p.name)}</h1>
   <p class="sub">${p.type === "book" ? "লেখক: " + esc(p.author) : "ব্র্যান্ড: " + esc(p.brand)}</p>
   ${rt ? `<p class="stars">${stars(rt.avg)} <small>${bn(rt.avg.toFixed(1))} (${bn(rt.n)} রিভিউ)</small></p>` : '<p class="sub">এখনো কোনো রিভিউ নেই</p>'}
   <div class="price" style="margin:8px 0"><b>${tk(p.price)}</b>${p.old > p.price ? `<s>${tk(p.old)}</s> <span class="tag">${bn(d)}% ছাড়</span>` : ""}</div>
   <p>${p.pre ? `<span class="tag">প্রি-অর্ডার · প্রকাশ ${fdate(p.pre)}</span>` : p.stock === 0 ? '<span class="tag" style="background:#ffe8f0;color:#d6336c">স্টক নেই</span>' : p.stock <= 3 ? `<span class="tag" style="background:var(--cl);color:var(--c)">মাত্র ${bn(p.stock)}টি বাকি</span>` : '<span class="tag" style="background:var(--ml);color:var(--m)">স্টকে আছে</span>'}</p>
   <div class="buyrow"><div class="qty"><button data-act="pq" data-d="-1" aria-label="কমান">−</button><span id="pqn">১</span><button data-act="pq" data-d="1" aria-label="বাড়ান">+</button></div>
    <button class="btn" data-act="padd" data-id="${p.id}" ${canBuy(p) ? "" : "disabled"}><span data-i="cart"></span>${p.pre ? "প্রি-অর্ডার" : "কার্টে দিন"}</button>
    <button class="btn coral" data-act="pbuy" data-id="${p.id}" ${canBuy(p) ? "" : "disabled"}>এখনই কিনুন</button></div>
   <div class="buyrow" style="margin-top:0"><button class="btn ghost sm" data-act="wish" data-id="${p.id}" aria-pressed="${w}"><span data-i="heart"></span>${w ? "উইশলিস্টে আছে" : "উইশলিস্টে রাখুন"}</button><button class="btn ghost sm" data-act="share" data-id="${p.id}"><span data-i="share"></span>শেয়ার</button></div>
   <div class="box"><dl class="kv">${kv.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl></div>
   <div class="box"><b>ডেলিভারি</b><p class="sub">ঢাকায় ${SITE.shipping.dhaka.days} (${tk(SITE.shipping.dhaka.fee)}), ঢাকার বাইরে ${SITE.shipping.outside.days} (${tk(SITE.shipping.outside.fee)}). ${tk(SITE.freeShipMin)} বা বেশি দামের অর্ডারে ফ্রি।<br>${bn(SITE.returnDays)} দিনের মধ্যে রিটার্নের সুযোগ (<a href="#/returns" style="color:var(--v)">শর্ত দেখুন</a>)। শপোরা স্টার: প্রতি ${tk(SITE.starPerTaka)} এ ১ পয়েন্ট।</p></div>
  </div></div>
  <section class="sec"><div class="box"><h2>রিভিউ ও রেটিং</h2>
   ${rt ? `<div class="bars">${dist.map(([s, n]) => `<div><span>${bn(s)}★</span><i><b style="width:${n / rt.n * 100}%"></b></i><span>${bn(n)}</span></div>`).join("")}</div>` : ""}
   ${rs.slice().reverse().map(x => `<div class="rv"><b>${esc(x.name)}</b><span class="stars">${stars(x.rate)}</span><small class="sub"> ${fdate(x.at)}</small><p>${esc(x.text)}</p></div>`).join("")}
   ${u ? `<form data-form="review" data-id="${p.id}"><label class="f">${myrev ? "আপনার রিভিউ বদলান" : "আপনার মতামত দিন"}</label><div class="rate" id="rate">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-act="rate" data-v="${i}" class="${myrev && i <= myrev.rate ? "on" : ""}" aria-label="${bn(i)} তারা">★</button>`).join("")}</div><input type="hidden" name="rate" value="${myrev ? myrev.rate : ""}"><textarea class="fi" name="text" maxlength="600" placeholder="পণ্যটি কেমন লাগল?">${esc(myrev ? myrev.text : "")}</textarea><div class="err" id="rverr"></div><button class="btn sm" type="submit">${myrev ? "আপডেট করুন" : "রিভিউ দিন"}</button></form>` : `<p class="sub">রিভিউ দিতে <a href="#/account" style="color:var(--v)">সাইন ইন করুন</a>।</p>`}
   <p class="sub" style="margin-top:8px">নোট: রিভিউ এখন শুধু এই ফোন/ব্রাউজারে সেভ হয়। সবাইকে দেখাতে সার্ভার যুক্ত করতে হবে।</p></div></section>
  ${sameAuth.length ? sec("এই লেখকের আরও বই", rail(sameAuth)) : ""}
  ${sameCat.length ? sec("একই বিভাগের পণ্য", rail(bySort(sameCat, "pop"))) : ""}
  ${sec("আপনার জন্য", rail(recommend(8)))}`;
};
V.title = r => { if (r.segs[0] === "p") { const p = P(r.segs[1]); return p ? p.name + " — " : ""; } return ""; };
let _pq = 1;
AFTER.reset = 0;
ACT.pq = el => { const p = P(parseHash().segs[1]); _pq = Math.max(1, Math.min(_pq + +el.dataset.d, p.pre ? 20 : Math.max(1, p.stock))); $("#pqn").textContent = bn(_pq); };
ACT.padd = el => { if (addCart(+el.dataset.id, _pq)) { _pq = 1; $("#pqn").textContent = "১"; } };
ACT.pbuy = el => { if (addCart(+el.dataset.id, _pq, true)) { _pq = 1; go("/checkout"); } };
ACT.share = async el => {
  const p = P(el.dataset.id), url = location.href.split("#")[0] + "#/p/" + p.id;
  if (navigator.share) { try { await navigator.share({ title: p.name, text: p.name + " — " + tk(p.price), url }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
  try { await navigator.clipboard.writeText(url); toast("লিংক কপি হয়েছে"); } catch (e) { toast(url); }
};
ACT.rate = el => { const v = +el.dataset.v; $$("#rate button").forEach((b, i) => b.classList.toggle("on", i < v)); $("input[name=rate]").value = v; };
FORM.review = f => {
  const id = +f.dataset.id, d = new FormData(f), rate = +d.get("rate"), text = String(d.get("text") || "").trim(), u = me();
  if (!u) return; if (!rate) { $("#rverr").textContent = "তারা বেছে নিন"; return; } if (text.length < 3) { $("#rverr").textContent = "দু-এক লাইন লিখুন"; return; }
  const l = reviews[id] || (reviews[id] = []), i = l.findIndex(x => x.uid === u.id), rec = { uid: u.id, name: u.name, rate, text: text.slice(0, 600), at: Date.now() };
  if (i >= 0) l[i] = rec; else l.push(rec); DB.set("reviews", reviews); toast("রিভিউ সেভ হয়েছে"); render();
};
