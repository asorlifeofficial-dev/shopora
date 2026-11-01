"use strict";
/* ============ অ্যাকাউন্ট, কার্ট, চেকআউট, অর্ডার ============ */
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
async function hashPw(pw, salt) {
  if (!(window.crypto && crypto.subtle)) throw new Error("nosub");
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 120000, hash: "SHA-256" }, k, 256));
}
const newId = () => hex(crypto.getRandomValues(new Uint8Array(8)));
const findUser = ident => { const e = String(ident || "").trim().toLowerCase(), p = phoneOk(ident); return users.find(u => (e && u.email === e) || (p && u.phone === p)); };
const login = u => { sessId = u.id; DB.set("sess", sessId); badges(); };
const stars_pts = u => orders.filter(o => o.uid === u.id && o.status === "delivered").reduce((a, o) => a + Math.floor(o.total / SITE.starPerTaka), 0);

V.account = r => {
  const u = me(); if (!u) return authView(r.q.get("tab") === "up");
  const my = orders.filter(o => o.uid === u.id), a = u.addr || {};
  return `<h1>আমার অ্যাকাউন্ট</h1>
  <div class="box"><b>${esc(u.name)}</b><p class="sub">${esc(u.email || "")} ${u.phone ? "· " + bn(u.phone) : ""}</p>
   <div class="tiles" style="margin-top:10px"><a class="tile2" href="#/orders"><span data-i="box"></span><b>${bn(my.length)}</b><small>অর্ডার</small></a><a class="tile2" href="#/wishlist"><span data-i="heart"></span><b>${bn(wish.length)}</b><small>উইশলিস্ট</small></a>
   <a class="tile2" href="#/star"><span data-i="star"></span><b>${bn(stars_pts(u))}</b><small>স্টার পয়েন্ট</small></a><a class="tile2" href="#/foryou"><span data-i="sparkle"></span><b>আপনার জন্য</b><small>সাজেশন</small></a></div></div>
  <div class="box"><h2>প্রোফাইল ও ঠিকানা</h2><form data-form="profile">
   <label class="f">নাম</label><input class="fi" name="name" value="${esc(u.name)}" required maxlength="60">
   <div class="row2"><div><label class="f">মোবাইল</label><input class="fi" name="phone" inputmode="tel" value="${esc(u.phone || "")}" placeholder="০১৭XXXXXXXX"></div><div><label class="f">ইমেইল</label><input class="fi" name="email" type="email" value="${esc(u.email || "")}"></div></div>
   <label class="f">জেলা/শহর</label><input class="fi" name="city" value="${esc(a.city || "")}" placeholder="যেমন ঢাকা"><label class="f">এলাকা</label><input class="fi" name="area" value="${esc(a.area || "")}">
   <label class="f">পূর্ণ ঠিকানা</label><textarea class="fi" name="address">${esc(a.address || "")}</textarea><label class="f">পোস্টাল কোড</label><input class="fi" name="postal" inputmode="numeric" value="${esc(a.postal || "")}">
   <div class="err" id="perr"></div><button class="btn" type="submit">সেভ করুন</button></form></div>
  <div class="box"><h2>নোটিফিকেশন</h2><p class="sub">অর্ডারের অবস্থা বদলালে এই ডিভাইসে জানাব।</p><button class="btn ghost sm" data-act="notif">চালু করুন</button></div>
  <div class="box"><h2>পাসওয়ার্ড বদলান</h2><form data-form="chpw"><input class="fi" type="password" name="old" placeholder="বর্তমান পাসওয়ার্ড" autocomplete="current-password"><input class="fi" style="margin-top:8px" type="password" name="new" placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)" autocomplete="new-password"><div class="err" id="cperr"></div><button class="btn sm" type="submit">বদলান</button></form></div>
  <button class="btn ghost full" data-act="logout">সাইন আউট</button>`;
};
function authView(up) {
  const g = SITE.googleClientId, fb = SITE.facebookAppId;
  return `<h1>${up ? "নতুন অ্যাকাউন্ট" : "সাইন ইন"}</h1><div class="box">
  <div class="tabs"><a class="${up ? "" : "on"}" href="#/account">সাইন ইন</a><a class="${up ? "on" : ""}" href="#/account?tab=up">সাইন আপ</a></div>
  <form id="authf" data-form="${up ? "signup" : "signin"}">
   ${up ? '<label class="f">আপনার নাম</label><input class="fi" name="name" required maxlength="60" autocomplete="name">' : ""}
   <label class="f">ইমেইল অথবা মোবাইল নম্বর</label><input class="fi" name="ident" required autocomplete="username" inputmode="email">
   <label class="f">পাসওয়ার্ড${up ? " (কমপক্ষে ৮ অক্ষর)" : ""}</label><input class="fi" type="password" name="pw" required autocomplete="${up ? "new-password" : "current-password"}">
   <div class="err" id="aerr"></div><button class="btn full" type="submit">${up ? "অ্যাকাউন্ট খুলুন" : "সাইন ইন"}</button></form>
  <p class="sub" style="text-align:center;margin:12px 0">অথবা</p>
  <div class="sendb"><button class="btn ghost ${g ? "" : "off"}" data-act="social" data-p="google">Google দিয়ে</button><button class="btn ghost ${fb ? "" : "off"}" data-act="social" data-p="facebook">Facebook দিয়ে</button></div>
  ${g || fb ? "" : '<p class="sub">Google/Facebook লগইন চালু করতে দোকানের মালিককে data.js-এ নিজের Google/Facebook অ্যাপ আইডি বসাতে হবে।</p>'}
  <div class="note warn">এখন অ্যাকাউন্ট শুধু এই ফোনের ব্রাউজারে সেভ হয়। অন্য ফোনে একই অ্যাকাউন্ট পেতে সার্ভার যুক্ত করতে হবে।</div></div>`;
}
ACT.social = el => { const p = el.dataset.p; if (!(p === "google" ? SITE.googleClientId : SITE.facebookAppId)) { toast((p === "google" ? "Google" : "Facebook") + " লগইন এখনো চালু হয়নি"); return; } toast("এই লগইন চালু করতে সার্ভার প্রয়োজন"); };
FORM.signup = async f => {
  const d = new FormData(f), name = String(d.get("name")).trim(), id = String(d.get("ident")).trim(), pw = String(d.get("pw")), er = $("#aerr");
  const ph = phoneOk(id), em = emailOk(id) ? id.toLowerCase() : "";
  if (name.length < 2) return er.textContent = "নাম লিখুন"; if (!ph && !em) return er.textContent = "সঠিক ইমেইল বা মোবাইল নম্বর দিন";
  if (pw.length < 8) return er.textContent = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে"; if (findUser(id)) return er.textContent = "এই ইমেইল/মোবাইল দিয়ে আগেই অ্যাকাউন্ট আছে";
  try { const salt = newId(), u = { id: newId(), name, email: em, phone: ph, salt, hash: await hashPw(pw, salt), created: Date.now(), addr: {}, ref: DB.get("ref", "") }; users.push(u); DB.set("users", users); login(u); toast("স্বাগতম, " + name.split(" ")[0]); go(DB.get("after", "/account")); DB.set("after", "/account"); }
  catch (e) { er.textContent = "এই ব্রাউজারে নিরাপদ সাইন আপ চলছে না। https লিংকে খুলুন।"; }
};
FORM.signin = async f => {
  const d = new FormData(f), er = $("#aerr"), u = findUser(String(d.get("ident")));
  const fails = DB.get("fails", { n: 0, t: 0 }); if (fails.n >= 5 && Date.now() - fails.t < 60000) return er.textContent = "অনেকবার ভুল হয়েছে। এক মিনিট পরে চেষ্টা করুন";
  try { if (!u || (await hashPw(String(d.get("pw")), u.salt)) !== u.hash) { DB.set("fails", { n: fails.n + 1, t: Date.now() }); return er.textContent = "ইমেইল/মোবাইল বা পাসওয়ার্ড মেলেনি"; } }
  catch (e) { return er.textContent = "এই ব্রাউজারে নিরাপদ সাইন ইন চলছে না। https লিংকে খুলুন।"; }
  DB.set("fails", { n: 0, t: 0 }); login(u); toast("সাইন ইন হয়েছে"); const a = DB.get("after", "/account"); DB.set("after", "/account"); go(a);
};
FORM.profile = f => {
  const u = me(), d = new FormData(f), er = $("#perr"), ph = String(d.get("phone")).trim(), em = String(d.get("email")).trim().toLowerCase();
  if (ph && !phoneOk(ph)) return er.textContent = "মোবাইল নম্বর ঠিক নয়"; if (em && !emailOk(em)) return er.textContent = "ইমেইল ঠিক নয়";
  const other = users.find(x => x.id !== u.id && ((em && x.email === em) || (ph && x.phone === phoneOk(ph)))); if (other) return er.textContent = "এই ইমেইল/মোবাইল অন্য অ্যাকাউন্টে আছে";
  if (!ph && !em) return er.textContent = "ইমেইল বা মোবাইলের একটি অন্তত রাখুন";
  u.name = String(d.get("name")).trim() || u.name; u.phone = phoneOk(ph); u.email = em; u.addr = { city: String(d.get("city")).trim(), area: String(d.get("area")).trim(), address: String(d.get("address")).trim(), postal: en(String(d.get("postal")).trim()) };
  DB.set("users", users); badges(); toast("প্রোফাইল সেভ হয়েছে"); er.textContent = "";
};
FORM.chpw = async f => {
  const u = me(), d = new FormData(f), er = $("#cperr"); const nw = String(d.get("new"));
  try { if ((await hashPw(String(d.get("old")), u.salt)) !== u.hash) return er.textContent = "বর্তমান পাসওয়ার্ড মেলেনি"; if (nw.length < 8) return er.textContent = "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষর"; u.salt = newId(); u.hash = await hashPw(nw, u.salt); DB.set("users", users); f.reset(); er.textContent = ""; toast("পাসওয়ার্ড বদলেছে"); } catch (e) { er.textContent = "বদলানো যায়নি"; }
};
ACT.logout = () => { sessId = null; DB.set("sess", null); badges(); toast("সাইন আউট হয়েছে"); go("/"); };
ACT.notif = async () => { if (!("Notification" in window)) return toast("এই ব্রাউজারে নোটিফিকেশন নেই"); const p = await Notification.requestPermission(); toast(p === "granted" ? "নোটিফিকেশন চালু হয়েছে" : "অনুমতি দেওয়া হয়নি"); };
const notify = (t, b) => { try { if ("Notification" in window && Notification.permission === "granted") new Notification(t, { body: b, icon: "icon-192.png" }); } catch (e) { } };

/* ---- কার্ট ---- */
V.cart = () => {
  const t = totals(), cp = DB.get("coupon", "");
  if (!t.lines.length) return '<div class="empty"><b>কার্ট খালি</b><p>পছন্দের পণ্য কার্টে যোগ করুন।</p><a class="btn" href="#/">কেনাকাটা শুরু করুন</a></div>';
  const cr = t.cp, need = SITE.freeShipMin - (t.sub - t.dsc);
  return `<h1>কার্ট (${bn(t.lines.reduce((a, x) => a + x.q, 0))}টি)</h1><div class="box">${t.lines.map(({ p, q }) => `<div class="ci"><a class="pic" href="#/p/${p.id}">${art(p)}</a><div class="m"><a href="#/p/${p.id}"><h3>${esc(p.name)}</h3></a><span class="br">${esc(p.type === "book" ? p.author : p.brand)}</span><div class="price"><b>${tk(p.price * q)}</b>${q > 1 ? `<small class="sub"> (${tk(p.price)} × ${bn(q)})</small>` : ""}</div>
   <div class="buyrow" style="margin:4px 0"><div class="qty"><button data-act="cq" data-id="${p.id}" data-d="-1" aria-label="কমান">−</button><span>${bn(q)}</span><button data-act="cq" data-id="${p.id}" data-d="1" aria-label="বাড়ান">+</button></div><button class="btn ghost sm" data-act="crm" data-id="${p.id}" aria-label="সরান"><span data-i="trash"></span></button></div></div></div>`).join("")}</div>
  <div class="box"><h3>কুপন কোড</h3><form data-form="coupon" class="nl" style="margin:6px 0"><input class="fi" name="c" value="${esc(cp)}" placeholder="যেমন WELCOME10" autocapitalize="characters"><button class="btn sm" type="submit">প্রয়োগ</button></form>
   ${cr ? `<div class="${cr.ok ? "ok" : "err"}">${esc(cr.ok ? "✓ " + cr.msg : cr.msg)}</div>` : ""}<p class="sub">কুপন: ${Object.keys(SITE.coupons).join(", ")}</p></div>
  ${need > 0 ? `<div class="note">আর ${tk(need)} কিনলে ফ্রি ডেলিভারি!</div>` : '<div class="note">আপনি ফ্রি ডেলিভারি পাচ্ছেন (ঢাকায় সাধারণ ডেলিভারি)</div>'}
  <div class="box tot"><div><span>সাবটোটাল</span><span>${tk(t.sub)}</span></div>${t.dsc ? `<div class="d"><span>কুপন ছাড়</span><span>− ${tk(t.dsc)}</span></div>` : ""}<div><span>ডেলিভারি</span><span class="sub">চেকআউটে হিসাব হবে</span></div><div class="g"><span>মোট</span><span>${tk(t.total)}</span></div></div>
  <a class="btn full" href="#/checkout">চেকআউটে যান</a>`;
};
ACT.cq = el => { const id = +el.dataset.id; setQty(id, (cart[id] || 0) + +el.dataset.d); render(); };
ACT.crm = el => { setQty(+el.dataset.id, 0); render(); };
FORM.coupon = f => { const c = String(new FormData(f).get("c")).trim().toUpperCase(); DB.set("coupon", c); if (c && !SITE.coupons[c]) toast("কুপন কোডটি ঠিক নয়"); render(); };

/* ---- চেকআউট ---- */
const CK = { step: 1, info: null, express: false, pay: "cod", trx: "" };
const PAYS = [["cod", "ক্যাশ অন ডেলিভারি", "পণ্য হাতে পেয়ে টাকা দিন", () => true], ["bkash", "বিকাশ", "", () => !!SITE.pay.bkash], ["nagad", "নগদ", "", () => !!SITE.pay.nagad], ["rocket", "রকেট", "", () => !!SITE.pay.rocket], ["bank", "ব্যাংক পেমেন্ট", "", () => !!SITE.pay.bank], ["card", "ভিসা / মাস্টারকার্ড / আমেরিকান এক্সপ্রেস", "", () => false]];
const payName = k => (PAYS.find(x => x[0] === k) || [])[1] || k;
V.checkout = () => {
  const lines = cartLines(); if (!lines.length) return V.cart();
  const u = me(); const stepNames = ["কার্ট", "ঠিকানা", "শিপিং ও পেমেন্ট", "নিশ্চিত"];
  const bar = `<div class="steps">${stepNames.map((n, i) => `<div class="${i + 1 === CK.step ? "on" : i + 1 < CK.step ? "done" : ""}"><b>${bn(i + 1)}</b>${n}</div>`).join("")}</div>`;
  if (!u && CK.step === 1) { }
  const city = CK.info ? CK.info.zone : null, t = totals(city, CK.express);
  const summary = `<div class="box tot"><div><span>সাবটোটাল</span><span>${tk(t.sub)}</span></div>${t.dsc ? `<div class="d"><span>কুপন ছাড়</span><span>− ${tk(t.dsc)}</span></div>` : ""}<div><span>ডেলিভারি</span><span>${city ? (t.ship ? tk(t.ship) : "ফ্রি") : "—"}</span></div><div class="g"><span>মোট</span><span>${tk(t.total)}</span></div></div>`;
  if (CK.step === 1) return `<h1>চেকআউট</h1>${bar}<div class="box">${t.lines.map(({ p, q }) => `<div class="ci"><div class="pic">${art(p)}</div><div class="m"><h3>${esc(p.name)}</h3><span class="sub">${bn(q)} × ${tk(p.price)}</span></div><b>${tk(p.price * q)}</b></div>`).join("")}</div>${summary}
   ${u ? "" : `<div class="note">সাইন ইন না করেও অর্ডার করা যায়, তবে অর্ডার হিস্টরি দেখতে <a href="#/account" data-act="after" style="text-decoration:underline">সাইন ইন করুন</a>।</div>`}
   <div class="sendb"><a class="btn ghost" href="#/cart">কার্টে ফিরুন</a><button class="btn" data-act="cks" data-s="2">পরের ধাপ</button></div>`;
  if (CK.step === 2) { const a = CK.info || { name: u ? u.name : "", phone: u ? u.phone : "", email: u ? u.email : "", ...(u && u.addr || {}), zone: "ঢাকা" }; return `<h1>ঠিকানা</h1>${bar}<form data-form="ckinfo" class="box">
   <label class="f">নাম *</label><input class="fi" name="name" required value="${esc(a.name || "")}" autocomplete="name" maxlength="60">
   <div class="row2"><div><label class="f">মোবাইল নম্বর *</label><input class="fi" name="phone" required inputmode="tel" value="${esc(a.phone || "")}" autocomplete="tel" placeholder="০১৭XXXXXXXX"></div><div><label class="f">ইমেইল (ঐচ্ছিক)</label><input class="fi" name="email" type="email" value="${esc(a.email || "")}"></div></div>
   <label class="f">ডেলিভারি এলাকা *</label><select class="fi" name="zone"><option ${a.zone === "ঢাকা" ? "selected" : ""}>ঢাকা</option><option ${a.zone === "ঢাকার বাইরে" ? "selected" : ""}>ঢাকার বাইরে</option></select>
   <div class="row2"><div><label class="f">জেলা/শহর *</label><input class="fi" name="city" required value="${esc(a.city || "")}"></div><div><label class="f">এলাকা/থানা *</label><input class="fi" name="area" required value="${esc(a.area || "")}"></div></div>
   <label class="f">পূর্ণ ঠিকানা (বাড়ি, রোড) *</label><textarea class="fi" name="address" required maxlength="300">${esc(a.address || "")}</textarea>
   <label class="f">পোস্টাল কোড</label><input class="fi" name="postal" inputmode="numeric" value="${esc(a.postal || "")}">
   <label class="f">অর্ডারের নোট (ঐচ্ছিক)</label><input class="fi" name="note" maxlength="200" value="${esc(a.note || "")}">
   <div class="err" id="cerr"></div><div class="sendb"><button type="button" class="btn ghost" data-act="cks" data-s="1">পেছনে</button><button class="btn" type="submit">পরের ধাপ</button></div></form>`; }
  if (CK.step === 3) { const z = CK.info.zone === "ঢাকা" ? SITE.shipping.dhaka : SITE.shipping.outside; return `<h1>শিপিং ও পেমেন্ট</h1>${bar}<form data-form="ckpay">
   <div class="box"><h3>ডেলিভারি পদ্ধতি</h3>
    <label class="opt"><input type="radio" name="ship" value="reg" ${CK.express ? "" : "checked"}><span><b>সাধারণ ডেলিভারি</b><br><small class="sub">${z.days} · ${t.ship === 0 && !CK.express ? "ফ্রি" : tk(z.fee)}</small></span></label>
    <label class="opt"><input type="radio" name="ship" value="exp" ${CK.express ? "checked" : ""}><span><b>এক্সপ্রেস ডেলিভারি</b><br><small class="sub">${CK.info.zone === "ঢাকা" ? "আজ/কাল" : "২–৩ দিন"} · ${tk(z.fee + SITE.shipping.expressExtra)}</small></span></label></div>
   <div class="box"><h3>পেমেন্ট পদ্ধতি</h3>${PAYS.map(([k, n, d, on]) => `<label class="opt" style="${on() ? "" : "opacity:.5"}"><input type="radio" name="pay" value="${k}" ${CK.pay === k ? "checked" : ""} ${on() ? "" : "disabled"}><span><b>${n}</b>${on() ? "" : '<br><small class="sub">শীঘ্রই আসছে</small>'}${d ? `<br><small class="sub">${d}</small>` : ""}${on() && k !== "cod" ? `<br><small class="sub">${esc(k === "bank" ? SITE.pay.bank : "পার্সোনাল নম্বর: " + bn(SITE.pay[k]) + " (সেন্ড মানি)")}</small>` : ""}</span></label>`).join("")}
    <div id="trxbox" ${CK.pay === "cod" ? "hidden" : ""}><label class="f">ট্রানজেকশন আইডি / রেফারেন্স (টাকা পাঠানোর পর)</label><input class="fi" name="trx" maxlength="40" value="${esc(CK.trx)}" autocapitalize="characters"></div>
    <p class="sub">কার্ড বা অনলাইন গেটওয়ে পেমেন্ট চালু করতে পেমেন্ট প্রোভাইডারের অ্যাকাউন্ট ও সার্ভার লাগে। এই সাইটে কার্ডের তথ্য কখনো নেওয়া হয় না।</p><div class="err" id="cerr"></div></div>
   ${summary}<div class="sendb"><button type="button" class="btn ghost" data-act="cks" data-s="2">পেছনে</button><button class="btn" type="submit">রিভিউ করুন</button></div></form>`; }
  const i = CK.info; return `<h1>অর্ডার নিশ্চিত করুন</h1>${bar}<div class="box"><h3>ঠিকানা</h3><p>${esc(i.name)} · ${bn(i.phone)}<br>${esc(i.address)}, ${esc(i.area)}, ${esc(i.city)} ${i.postal ? "- " + bn(i.postal) : ""}</p><button class="btn ghost sm" data-act="cks" data-s="2">বদলান</button></div>
   <div class="box"><h3>পণ্য</h3>${t.lines.map(({ p, q }) => `<div style="display:flex;justify-content:space-between;gap:8px;padding:3px 0"><span>${esc(p.name)} × ${bn(q)}</span><b>${tk(p.price * q)}</b></div>`).join("")}</div>
   <div class="box"><p>ডেলিভারি: <b>${CK.express ? "এক্সপ্রেস" : "সাধারণ"}</b> (${t.days}) · পেমেন্ট: <b>${payName(CK.pay)}</b>${CK.trx ? " · " + esc(CK.trx) : ""}</p><button class="btn ghost sm" data-act="cks" data-s="3">বদলান</button></div>
   ${summary}<p class="sub">অর্ডার করলে আপনি আমাদের <a href="#/terms" style="color:var(--v)">শর্ত</a> ও <a href="#/returns" style="color:var(--v)">রিটার্ন নীতি</a> মেনে নিচ্ছেন।</p><button class="btn full" data-act="place">অর্ডার করুন · ${tk(t.total)}</button>`;
};
ACT.cks = el => { CK.step = +el.dataset.s; render(); };
ACT.after = () => DB.set("after", "/checkout");
FORM.ckinfo = f => {
  const d = Object.fromEntries(new FormData(f)), er = $("#cerr"), ph = phoneOk(d.phone);
  if (!ph) return er.textContent = "সঠিক মোবাইল নম্বর দিন (০১৭XXXXXXXX)"; if (d.email && !emailOk(d.email)) return er.textContent = "ইমেইল ঠিক নয়";
  CK.info = { name: d.name.trim(), phone: ph, email: d.email.trim(), zone: d.zone, city: d.city.trim(), area: d.area.trim(), address: d.address.trim(), postal: en(d.postal.trim()), note: d.note.trim() };
  CK.step = 3; render();
};
FORM.ckpay = f => {
  const d = Object.fromEntries(new FormData(f)), er = $("#cerr"); CK.express = d.ship === "exp"; CK.pay = d.pay || "cod"; CK.trx = (d.trx || "").trim();
  if (CK.pay !== "cod" && CK.trx.length < 4) return er.textContent = "টাকা পাঠিয়ে ট্রানজেকশন আইডি দিন";
  CK.step = 4; render();
};
document.addEventListener("change", e => { if (e.target.name === "pay") { const b = $("#trxbox"); if (b) b.hidden = e.target.value === "cod"; } });
const STATUS = [["placed", "অর্ডার গৃহীত"], ["confirmed", "অর্ডার নিশ্চিত"], ["packed", "প্যাকিং হয়েছে"], ["shipped", "ডেলিভারিতে আছে"], ["delivered", "পৌঁছে গেছে"]];
const stName = s => ({ cancelled: "বাতিল", returnreq: "রিটার্নের অনুরোধ" }[s] || (STATUS.find(x => x[0] === s) || [])[1] || s);
ACT.place = () => {
  const t = totals(CK.info.zone, CK.express); if (!t.lines.length) return go("/cart");
  for (const { p, q } of t.lines) if (!canBuy(p) || (!p.pre && q > p.stock)) return toast("“" + p.name + "” এর স্টক কম");
  const id = "SH" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + String(Math.floor(1000 + Math.random() * 9000));
  const o = { id, uid: sessId, at: Date.now(), items: t.lines.map(({ p, q }) => ({ id: p.id, name: p.name, price: p.price, q })), info: CK.info, express: CK.express, pay: CK.pay, trx: CK.trx, coupon: t.cp && t.cp.ok ? t.cp.code : "", sub: t.sub, dsc: t.dsc, ship: t.ship, total: t.total, days: t.days, status: "placed", log: [{ s: "placed", at: Date.now() }], ref: DB.get("ref", "") };
  orders.push(o); if (!DB.set("orders", orders)) { orders.pop(); return; }
  cart = {}; saveCart(); DB.set("coupon", ""); CK.step = 1; CK.trx = ""; CK.pay = "cod"; CK.express = false;
  if (!sessId) DB.set("guest", [...new Set([...DB.get("guest", []), id])]);
  postEndpoint("order", { order: o }); go("/done/" + id);
};
const orderMsg = o => `নতুন অর্ডার ${o.id}\nনাম: ${o.info.name}\nমোবাইল: ${o.info.phone}\nঠিকানা: ${o.info.address}, ${o.info.area}, ${o.info.city}\n` + o.items.map(i => `• ${i.name} × ${i.q} = ${tk(i.price * i.q)}`).join("\n") + `\nডেলিভারি: ${tk(o.ship)} · ছাড়: ${tk(o.dsc)}\nমোট: ${tk(o.total)}\nপেমেন্ট: ${payName(o.pay)}${o.trx ? " (" + o.trx + ")" : ""}`;
V.done = r => {
  const o = orders.find(x => x.id === r.segs[1]); if (!o) return V.nf();
  return `<div class="box" style="text-align:center"><div class="hi" style="font-size:44px;color:var(--m)" data-i="check"></div><h1>অর্ডার গৃহীত হয়েছে</h1><p>অর্ডার নম্বর: <b>${o.id}</b></p><p class="sub">মোট ${tk(o.total)} · ${payName(o.pay)}</p></div>
  <div class="note warn"><b>গুরুত্বপূর্ণ:</b> এই সাইটে এখনো সার্ভার নেই, তাই অর্ডারটি এই ফোনে সেভ আছে। দোকানের কাছে পৌঁছাতে নিচের বোতামে চেপে অর্ডারের বার্তা পাঠান।${SITE.endpoint ? " (আপনার অর্ডার স্বয়ংক্রিয়ভাবেও পাঠানো হয়েছে)" : ""}</div>
  ${sendButtons(orderMsg(o), "অর্ডার " + o.id)}
  <div class="sendb"><a class="btn ghost" href="#/orders/${o.id}">অর্ডার দেখুন</a><a class="btn ghost" href="#/">কেনাকাটা চালিয়ে যান</a></div>`;
};

/* ---- অর্ডার তালিকা, বিস্তারিত, ট্র্যাকিং ---- */
const myOrders = () => orders.filter(o => (sessId && o.uid === sessId) || (!o.uid && DB.get("guest", []).includes(o.id)) || (o.uid === null && DB.get("guest", []).includes(o.id)));
V.orders = r => {
  if (r.segs[1]) return orderDetail(r.segs[1]);
  const l = myOrders().slice().reverse();
  return `<h1>আমার অর্ডার</h1>${l.length ? l.map(o => `<a class="box" style="display:block" href="#/orders/${o.id}"><div style="display:flex;justify-content:space-between"><b>${o.id}</b><span class="tag">${stName(o.status)}</span></div><p class="sub">${fdate(o.at)} · ${bn(o.items.reduce((a, i) => a + i.q, 0))}টি পণ্য · ${tk(o.total)}</p></a>`).join("") : '<div class="empty"><b>কোনো অর্ডার নেই</b><a class="btn" href="#/">কেনাকাটা শুরু করুন</a></div>'}<div class="box"><b>অর্ডার খুঁজে পাচ্ছেন না?</b><p class="sub">আইডি ও মোবাইল দিয়ে <a href="#/track" style="color:var(--v)">ট্র্যাক করুন</a>।</p></div>`;
};
function trackHtml(o) {
  if (o.status === "cancelled") return `<div class="tl"><div class="on">অর্ডার বাতিল হয়েছে</div></div>`;
  const idx = STATUS.findIndex(x => x[0] === o.status);
  return `<div class="tl">${STATUS.map(([k, n], i) => { const l = o.log.find(x => x.s === k); return `<div class="${i <= idx || o.status === "returnreq" ? "on" : ""}">${n}${l ? `<br><small class="sub">${fdate(l.at)}</small>` : ""}</div>`; }).join("")}${o.status === "returnreq" ? '<div class="on">রিটার্নের অনুরোধ জমা হয়েছে</div>' : ""}</div>`;
}
function orderDetail(id, pub) {
  const o = orders.find(x => x.id === id); if (!o) return V.nf();
  const canCancel = ["placed", "confirmed"].includes(o.status), del = o.log.find(x => x.s === "delivered");
  const canRet = o.status === "delivered" && del && Date.now() - del.at <= SITE.returnDays * 864e5;
  return `<div class="crumb"><a href="#/orders">অর্ডার</a> › ${o.id}</div><h1>অর্ডার ${o.id}</h1><p class="sub">${fdate(o.at)} · <span class="tag">${stName(o.status)}</span></p>
  <div class="box"><h3>অর্ডারের অবস্থা</h3>${trackHtml(o)}<p class="sub">আনুমানিক ডেলিভারি: ${o.days}</p>${SITE.demo && !["delivered", "cancelled", "returnreq"].includes(o.status) ? '<button class="btn ghost sm" data-act="advance" data-id="' + o.id + '">ডেমো: পরের ধাপে নিন</button><p class="sub">আসল সাইটে দোকান এই ধাপ বদলাবে। এই বোতাম শুধু ডেমোতে।</p>' : ""}</div>
  <div class="box"><h3>পণ্য</h3>${o.items.map(i => `<div style="display:flex;justify-content:space-between;gap:8px;padding:3px 0"><a href="#/p/${i.id}">${esc(i.name)} × ${bn(i.q)}</a><b>${tk(i.price * i.q)}</b></div>`).join("")}
   <div class="tot"><div><span>সাবটোটাল</span><span>${tk(o.sub)}</span></div>${o.dsc ? `<div class="d"><span>ছাড় (${esc(o.coupon)})</span><span>− ${tk(o.dsc)}</span></div>` : ""}<div><span>ডেলিভারি</span><span>${o.ship ? tk(o.ship) : "ফ্রি"}</span></div><div class="g"><span>মোট</span><span>${tk(o.total)}</span></div></div></div>
  <div class="box"><h3>ডেলিভারি তথ্য</h3><p>${esc(o.info.name)} · ${bn(o.info.phone)}<br>${esc(o.info.address)}, ${esc(o.info.area)}, ${esc(o.info.city)}</p><p class="sub">পেমেন্ট: ${payName(o.pay)}${o.trx ? " · " + esc(o.trx) : ""} · ${o.express ? "এক্সপ্রেস" : "সাধারণ"} ডেলিভারি</p></div>
  ${sendButtons(orderMsg(o), "অর্ডার " + o.id)}
  <div class="sendb">${canCancel ? `<button class="btn ghost" data-act="cancel" data-id="${o.id}">অর্ডার বাতিল করুন</button>` : ""}${canRet ? `<a class="btn coral" href="#/return/${o.id}">রিটার্ন/রিপ্লেসমেন্ট</a>` : ""}</div>`;
}
const advanceOrder = (o, s) => { o.status = s; o.log.push({ s, at: Date.now() }); DB.set("orders", orders); notify("অর্ডার " + o.id, stName(s)); };
ACT.advance = el => { const o = orders.find(x => x.id === el.dataset.id), i = STATUS.findIndex(x => x[0] === o.status); if (i < STATUS.length - 1) advanceOrder(o, STATUS[i + 1][0]); render(); };
ACT.cancel = el => { const o = orders.find(x => x.id === el.dataset.id); if (!confirm("অর্ডারটি বাতিল করবেন?")) return; advanceOrder(o, "cancelled"); const m = "অর্ডার " + o.id + " বাতিল করতে চাই।"; toast("বাতিল হয়েছে। দোকানকে জানাতে বার্তা পাঠান"); render(); };
V.track = r => {
  const id = (r.q.get("id") || "").toUpperCase(), ph = r.q.get("phone") || "";
  const o = id && orders.find(x => x.id === id && x.info.phone === phoneOk(ph));
  return `<h1>অর্ডার ট্র্যাক করুন</h1><form class="box" data-form="track"><label class="f">অর্ডার নম্বর</label><input class="fi" name="id" value="${esc(id)}" placeholder="SH২৬১১০১১২৩৪" required autocapitalize="characters"><label class="f">মোবাইল নম্বর</label><input class="fi" name="phone" value="${esc(ph)}" inputmode="tel" required><button class="btn full" style="margin-top:12px">ট্র্যাক করুন</button></form>
  ${id ? (o ? `<div class="box"><b>${o.id}</b> · <span class="tag">${stName(o.status)}</span>${trackHtml(o)}<a class="btn ghost sm" href="#/orders/${o.id}">বিস্তারিত</a></div>` : '<div class="note warn">মেলেনি। এই ফোনে দেওয়া অর্ডারই এখানে দেখা যায়। অন্য ডিভাইসের অর্ডারের জন্য সাপোর্টে যোগাযোগ করুন।</div>') : ""}`;
};
FORM.track = f => { const d = Object.fromEntries(new FormData(f)); go("/track?id=" + encodeURIComponent(en(d.id).trim()) + "&phone=" + encodeURIComponent(d.phone)); };

/* ---- রিটার্ন / রিপ্লেসমেন্ট / রিফান্ড ---- */
V.return = r => {
  const o = orders.find(x => x.id === r.segs[1]); if (!o) return V.nf();
  return `<div class="crumb"><a href="#/orders/${o.id}">অর্ডার ${o.id}</a> › রিটার্ন</div><h1>রিটার্ন / রিপ্লেসমেন্ট</h1><div class="note">ডেলিভারির ${bn(SITE.returnDays)} দিনের মধ্যে ত্রুটির প্রমাণসহ জানাতে হবে। পছন্দ বদলের কারণে সব পণ্য ফেরত হয় না।</div>
  <form class="box" data-form="return" data-id="${o.id}"><label class="f">পণ্য</label><select class="fi" name="item">${o.items.map(i => `<option value="${i.id}">${esc(i.name)}</option>`).join("")}</select>
  <label class="f">সমস্যা</label><select class="fi" name="why"><option>ত্রুটিযুক্ত পণ্য</option><option>ভুল পণ্য এসেছে</option><option>বইয়ের পৃষ্ঠা মিসিং</option><option>পণ্য নষ্ট বা ভাঙা</option><option>অন্য</option></select>
  <label class="f">কী চান</label><select class="fi" name="want"><option>রিপ্লেসমেন্ট (পরিবর্তন)</option><option>রিফান্ড (টাকা ফেরত, ${payName(o.pay)} মাধ্যমে)</option></select>
  <label class="f">বিস্তারিত *</label><textarea class="fi" name="text" required maxlength="500"></textarea><p class="sub">ছবি থাকলে বার্তা পাঠানোর পর হোয়াটসঅ্যাপে সংযুক্ত করুন।</p><div class="err" id="rerr"></div><button class="btn full">অনুরোধ তৈরি করুন</button></form>`;
};
FORM.return = f => {
  const o = orders.find(x => x.id === f.dataset.id), d = Object.fromEntries(new FormData(f)), it = o.items.find(i => i.id === +d.item);
  if (d.text.trim().length < 5) return $("#rerr").textContent = "সমস্যাটা লিখুন";
  advanceOrder(o, "returnreq"); const msg = `রিটার্ন অনুরোধ — অর্ডার ${o.id}\nপণ্য: ${it.name}\nসমস্যা: ${d.why}\nচাই: ${d.want}\nবিবরণ: ${d.text.trim()}\nনাম: ${o.info.name}, মোবাইল: ${o.info.phone}`;
  postEndpoint("return", { order: o.id, msg });
  openSheet(`<button class="sx" data-act="close" data-i="close"></button><h2>অনুরোধ তৈরি হয়েছে</h2><p class="sub">দোকানকে জানাতে বার্তা পাঠান। সাপোর্ট টিম যোগাযোগ করবে।</p>${sendButtons(msg, "রিটার্ন " + o.id)}`);
};
V.returns = () => `<h1>রিটার্ন ও রিপ্লেসমেন্ট নীতি</h1><div class="box"><ul style="padding-left:18px;line-height:1.9"><li>ত্রুটিযুক্ত পণ্য ফেরত দেওয়া যায়।</li><li>ভুল পণ্য এলে অভিযোগ করা যায়।</li><li>বইয়ের পৃষ্ঠা মিসিং থাকলে অভিযোগ করা যায়।</li><li>পণ্য নষ্ট বা ভাঙা এলে অভিযোগ করা যায়।</li><li>নির্দিষ্ট শর্তে পণ্য পরিবর্তন করা যায়।</li></ul><div class="note">ডেলিভারির <b>${bn(SITE.returnDays)} দিনের</b> মধ্যে ত্রুটির প্রমাণসহ অভিযোগ করতে হবে। পছন্দ বদলের কারণে সব পণ্য ফেরত নেওয়া হয় না।</div><a class="btn" href="#/orders">আমার অর্ডার থেকে অনুরোধ করুন</a></div>`;
V.refund = () => `<h1>রিফান্ড নীতি</h1><div class="box"><p>অগ্রিম পেমেন্ট করা অর্ডার সরবরাহ করা সম্ভব না হলে নির্দিষ্ট শর্তে যে মাধ্যমে টাকা দিয়েছেন সেই একই মাধ্যমে ফেরত দেওয়া হবে।</p><p class="sub" style="margin-top:8px">রিফান্ডের সময় ও শর্ত দোকান আসল তথ্য দিয়ে এখানে হালনাগাদ করবে। রিফান্ড চাইতে অর্ডার পাতা থেকে রিটার্ন অনুরোধ করুন।</p></div>`;
V.delivery = () => `<h1>ডেলিভারি তথ্য</h1><div class="box"><div class="tot"><div><span>ঢাকা</span><span>${tk(SITE.shipping.dhaka.fee)} · ${SITE.shipping.dhaka.days}</span></div><div><span>ঢাকার বাইরে</span><span>${tk(SITE.shipping.outside.fee)} · ${SITE.shipping.outside.days}</span></div><div><span>এক্সপ্রেস (অতিরিক্ত)</span><span>${tk(SITE.shipping.expressExtra)}</span></div><div><span>ফ্রি ডেলিভারি</span><span>${tk(SITE.freeShipMin)}+ অর্ডারে</span></div></div><p class="sub" style="margin-top:8px">সারা বাংলাদেশে ডেলিভারি, ক্যাশ অন ডেলিভারি সহ। ট্র্যাক করুন <a href="#/track" style="color:var(--v)">এখানে</a>।</p></div>`;
V.star = () => { const u = me(); return `<h1>শপোরা স্টার</h1><div class="hero2 c-violet"><h2 style="color:#fff">কেনাকাটায় পয়েন্ট জমান</h2><p>প্রতি ${tk(SITE.starPerTaka)} কেনায় ১ স্টার পয়েন্ট (অর্ডার পৌঁছানোর পর যোগ হয়)</p></div>${u ? `<div class="box"><b style="font-size:30px;color:var(--v)">${bn(stars_pts(u))}</b> পয়েন্ট<p class="sub">অপেক্ষমাণ: ${bn(orders.filter(o => o.uid === u.id && !["delivered", "cancelled"].includes(o.status)).reduce((a, o) => a + Math.floor(o.total / SITE.starPerTaka), 0))} পয়েন্ট</p></div>` : '<a class="btn" href="#/account">সাইন ইন করে দেখুন</a>'}<div class="note">পয়েন্ট দিয়ে কী পাওয়া যাবে (ছাড়/রিডিম) তা দোকান ঠিক করে জানাবে। এখনো রিডিম চালু হয়নি।</div>`; };
