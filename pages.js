"use strict";
/* ============ মেনু, চ্যাট, ফুটার ও বাকি পাতা ============ */
const C = SITE.contact;
const telLink = n => phoneOk(n) ? "tel:+88" + phoneOk(n) : "";
const waTo = (n, msg) => phoneOk(n) ? `https://wa.me/88${phoneOk(n)}?text=${encodeURIComponent(msg || "হ্যালো")}` : "";
function contactItem(ic, title, sub, href) {
  return href ? `<a class="ct-i" href="${esc(href)}" ${/^https/.test(href) ? 'target="_blank" rel="noopener"' : ""}><span data-i="${ic}"></span><div><b>${title}</b><small>${sub}</small></div></a>`
    : `<div class="ct-i off"><span data-i="${ic}"></span><div><b>${title}</b><small>শীঘ্রই আসছে</small></div></div>`;
}
function chatHtml() {
  const fb = C.messenger ? "https://m.me/" + encodeURIComponent(C.messenger) : "", ig = C.instagram ? "https://instagram.com/" + encodeURIComponent(C.instagram) : "";
  return `<button class="sx" data-act="close" data-i="close" aria-label="বন্ধ"></button><h2>যোগাযোগ করুন</h2><p class="sub">সাপোর্ট সময়: ${esc(C.hours)}</p>
  ${contactItem("chat", "হোয়াটসঅ্যাপ", "সরাসরি চ্যাট করুন", waTo(C.whatsapp, "হ্যালো, " + SITE.name + " থেকে জানতে চাই"))}
  ${contactItem("chat", "মেসেঞ্জার", "ফেসবুক পেজে বার্তা", fb)}
  ${contactItem("phone", "হটলাইন", C.phone ? bn(C.phone) : "", telLink(C.phone))}
  ${contactItem("mail", "ইমেইল", esc(C.email), emailOk(C.email) ? "mailto:" + C.email : "")}
  ${contactItem("fb", "ফেসবুক পেজ", "আমাদের পেজ", /^https:\/\//.test(C.facebook) ? C.facebook : "")}
  ${contactItem("camera", "ইনস্টাগ্রাম", "@" + esc(C.instagram), ig)}
  <a class="btn ghost full" href="#/support">হেল্প ডেস্ক ও FAQ</a>`;
}
function menuHtml() {
  const u = me(), L = (h, ic, t) => `<a class="mi" href="#${h}" data-act="close"><span data-i="${ic}"></span>${t}</a>`;
  return `<button class="sx" data-act="close" data-i="close" aria-label="বন্ধ"></button><h2 style="color:var(--v)">${SITE.name}</h2>
  <a class="btn full" href="#/account" data-act="close">${u ? esc(u.name) : "সাইন ইন / সাইন আপ"}</a>
  <div class="mh">কেনাকাটা</div>${L("/books", "books", "বই")}${L("/electronics", "electronics", "ইলেকট্রনিক্স")}${L("/store", "grocery", "সুপার স্টোর")}${L("/kids", "baby", "কিডস জোন")}${L("/best", "trophy", "বেস্ট সেলার")}${L("/offers", "percent", "আজকের অফার")}${L("/foryou", "sparkle", "আপনার জন্য")}${L("/admission", "grad", "ভর্তি পরীক্ষা")}${L("/preorder", "clock", "প্রি-অর্ডার")}${L("/foreign", "globe", "বিদেশি বই")}
  <div class="mh">আমার</div>${L("/orders", "box", "আমার অর্ডার")}${L("/track", "truck", "অর্ডার ট্র্যাক")}${L("/wishlist", "heart", "উইশলিস্ট")}${L("/star", "star", "শপোরা স্টার")}
  <div class="mh">আরও</div>${L("/bulk", "users", "বাল্ক অর্ডার")}${L("/affiliate", "link", "অ্যাফিলিয়েট")}${L("/donate", "gifts", "বই দান")}${L("/quiz", "trophy", "কুইজ")}${L("/support", "help", "সাপোর্ট ও FAQ")}${L("/install", "download", "অ্যাপ ইনস্টল")}`;
}
function footer() {
  return `<footer class="ft"><div class="ftg"><div><h4>${SITE.name}</h4><a href="#/about">আমাদের সম্পর্কে</a><a href="#/support">যোগাযোগ</a><a href="#/seller">বিক্রেতা হোন</a><a href="#/retailer">রিটেইলার অনুরোধ</a></div>
  <div><h4>সাহায্য</h4><a href="#/faq">FAQ</a><a href="#/track">অর্ডার ট্র্যাক</a><a href="#/delivery">ডেলিভারি তথ্য</a><a href="#/returns">রিটার্ন নীতি</a><a href="#/refund">রিফান্ড নীতি</a></div>
  <div><h4>আরও</h4><a href="#/bulk">বাল্ক অর্ডার</a><a href="#/affiliate">অ্যাফিলিয়েট</a><a href="#/donate">বই দান</a><a href="#/request">বইয়ের অনুরোধ</a><a href="#/install">অ্যাপ ইনস্টল</a></div>
  <div><h4>নিউজলেটার</h4><p style="font-size:13px;opacity:.85">নতুন পণ্য ও অফারের খবর পান</p><form class="nl" data-form="news"><input type="email" name="email" placeholder="আপনার ইমেইল" required aria-label="ইমেইল"><button class="btn sm coral">সাবস্ক্রাইব</button></form></div></div>
  <p class="cp"><a href="#/terms" style="display:inline">শর্তাবলি</a> · <a href="#/privacy" style="display:inline">গোপনীয়তা</a> · © ${bn(new Date().getFullYear())} ${SITE.name}</p></footer>`;
}
FORM.news = f => {
  const em = String(new FormData(f).get("email")).trim().toLowerCase(); if (!emailOk(em)) return toast("সঠিক ইমেইল দিন");
  const l = DB.get("news", []); if (!l.includes(em)) { l.push(em); DB.set("news", l); } postEndpoint("newsletter", { email: em }); f.reset();
  toast(SITE.endpoint ? "সাবস্ক্রাইব হয়েছে। ধন্যবাদ!" : "সেভ হয়েছে। আসল সাইটে সার্ভার যুক্ত হলে পাঠানো শুরু হবে");
};

/* ---- সাধারণ ফর্ম পাতা (বার্তা তৈরি → হোয়াটসঅ্যাপ/ইমেইল) ---- */
function msgPage(r, kind, title, intro, fields, subject, to) {
  const u = me(), pre = { title: r.q.get("title") || "" };
  return `<h1>${title}</h1><p class="sub">${intro}</p><form class="box" data-form="msg" data-kind="${kind}" data-subject="${esc(subject)}" data-to="${esc(to || "")}">
  ${fields.map(([n, l, t, req]) => `<label class="f">${l}${req ? " *" : ""}</label>${t === "area" ? `<textarea class="fi" name="${n}" ${req ? "required" : ""} maxlength="700"></textarea>` : `<input class="fi" name="${n}" ${req ? "required" : ""} ${t === "tel" ? 'inputmode="tel"' : ""} ${t === "email" ? 'type="email"' : ""} maxlength="120" value="${esc(n === "name" && u ? u.name : n === "phone" && u ? u.phone || "" : n === "email" && u ? u.email || "" : n === "title" ? pre.title : "")}">`}`).join("")}
  <div class="err" id="merr"></div><button class="btn full" style="margin-top:12px">বার্তা তৈরি করুন</button></form><div id="mout"></div>`;
}
FORM.msg = f => {
  const d = Object.fromEntries(new FormData(f)), er = $("#merr");
  if (d.phone && !phoneOk(d.phone)) return er.textContent = "মোবাইল নম্বর ঠিক নয়"; if (d.email && !emailOk(d.email)) return er.textContent = "ইমেইল ঠিক নয়";
  const msg = f.dataset.subject + "\n" + Object.entries(d).filter(([, v]) => String(v).trim()).map(([k, v]) => `${LBL[k] || k}: ${String(v).trim()}`).join("\n");
  postEndpoint(f.dataset.kind, d); er.textContent = "";
  $("#mout").innerHTML = `<div class="box"><b>বার্তা তৈরি হয়েছে</b><p class="sub">${SITE.endpoint ? "আপনার অনুরোধ জমা হয়েছে। চাইলে নিচ থেকেও পাঠাতে পারেন।" : "দোকানকে পাঠাতে নিচের বোতাম চাপুন।"}</p>${sendButtons(msg, f.dataset.subject, f.dataset.to)}</div>`; hydrate($("#mout"));
};
const LBL = { name: "নাম", phone: "মোবাইল", email: "ইমেইল", org: "প্রতিষ্ঠান", qty: "সংখ্যা", items: "প্রয়োজনীয় পণ্য", note: "বিবরণ", title: "বইয়ের নাম", author: "লেখক", publisher: "প্রকাশনী", city: "এলাকা", why: "বিবরণ", shop: "দোকান/প্রতিষ্ঠান", link: "লিংক/পেজ", count: "বইয়ের সংখ্যা", cond: "বইয়ের অবস্থা", addr: "ঠিকানা", subject: "বিষয়", orderid: "অর্ডার নম্বর" };
V.bulk = r => `<div class="hero2 c-navy"><h1>বাল্ক অর্ডার</h1><p>স্কুল, কলেজ, বিশ্ববিদ্যালয়, লাইব্রেরি, প্রতিষ্ঠান ও কর্পোরেট ক্রেতাদের জন্য বিশেষ দাম</p></div>
 <div class="tiles"><div class="tile2"><span data-i="grad"></span><b>স্কুল/কলেজ</b></div><div class="tile2"><span data-i="books"></span><b>লাইব্রেরি</b></div><div class="tile2"><span data-i="bag"></span><b>কর্পোরেট</b></div><div class="tile2"><span data-i="users"></span><b>প্রতিষ্ঠান</b></div></div>
 ${C.salesPhone ? `<div class="sendb"><a class="btn wa" href="${esc(waTo(C.salesPhone, "বাল্ক অর্ডার সম্পর্কে জানতে চাই"))}" target="_blank" rel="noopener">কর্পোরেট বিক্রয়ে হোয়াটসঅ্যাপ</a></div>` : ""}
 ${msgPage(r, "bulk", "কোটেশন চান", "আপনার প্রয়োজন জানান, আমরা দাম জানাব।", [["name", "নাম", "t", 1], ["org", "প্রতিষ্ঠানের নাম", "t", 1], ["phone", "মোবাইল", "tel", 1], ["email", "ইমেইল", "email"], ["items", "কী কী পণ্য/বই এবং কত সংখ্যা", "area", 1]], "বাল্ক অর্ডারের কোটেশন", C.salesEmail || C.email).replace("<h1>কোটেশন চান</h1>", "<h2>কোটেশন চান</h2>")}`;
V.request = r => msgPage(r, "bookreq", "বইয়ের অনুরোধ", "পছন্দের বই বা লেখক/প্রকাশনী খুঁজে পাচ্ছেন না? জানান, আমরা আনানোর চেষ্টা করব।", [["name", "নাম", "t", 1], ["phone", "মোবাইল", "tel", 1], ["title", "বই/পণ্যের নাম", "t", 1], ["author", "লেখক/ব্র্যান্ড", "t"], ["publisher", "প্রকাশনী", "t"], ["note", "অন্য কিছু", "area"]], "বা পণ্যের অনুরোধ");
V.retailer = r => msgPage(r, "retailer", "রিটেইলার অনুরোধ", "আপনার দোকান থেকে আমাদের পণ্য বিক্রি করতে চান? তথ্য দিন।", [["name", "নাম", "t", 1], ["shop", "দোকানের নাম", "t", 1], ["phone", "মোবাইল", "tel", 1], ["city", "এলাকা", "t", 1], ["note", "বিবরণ", "area"]], "রিটেইলার অনুরোধ", C.retailEmail || C.email);
V.seller = r => msgPage(r, "seller", "বিক্রেতা হোন", "আপনার পণ্য আমাদের প্ল্যাটফর্মে বিক্রি করতে চান?", [["name", "নাম", "t", 1], ["shop", "প্রতিষ্ঠান/ব্র্যান্ড", "t", 1], ["phone", "মোবাইল", "tel", 1], ["email", "ইমেইল", "email"], ["note", "কী পণ্য বিক্রি করবেন", "area", 1]], "বিক্রেতা হওয়ার আবেদন", C.sellerEmail || C.email);
V.donate = r => `<div class="hero2 c-mint"><h1>বই দান করুন</h1><p>আপনার পড়া বই অন্যের হাতে পৌঁছে দিন। লাইব্রেরি, স্কুল ও শিশুদের কাছে বই পৌঁছাতে সাহায্য করুন।</p></div>${msgPage(r, "donate", "দানের তথ্য", "কোন বই, কতগুলো আর কোথা থেকে নিতে হবে জানান।", [["name", "নাম", "t", 1], ["phone", "মোবাইল", "tel", 1], ["count", "বইয়ের সংখ্যা", "t", 1], ["cond", "বইয়ের অবস্থা (ভালো/পুরনো)", "t"], ["addr", "ঠিকানা", "area", 1]], "বই দানের আবেদন").replace("<h1>দানের তথ্য</h1>", "<h2>দানের তথ্য</h2>")}`;
V.support = r => `<h1>সাপোর্ট ও হেল্প ডেস্ক</h1><p class="sub">সময়: ${esc(C.hours)}</p><div class="box">${contactItem("chat", "হোয়াটসঅ্যাপ", "সরাসরি চ্যাট", waTo(C.whatsapp))}${contactItem("chat", "মেসেঞ্জার", "ফেসবুক পেজ", C.messenger ? "https://m.me/" + encodeURIComponent(C.messenger) : "")}${contactItem("phone", "হটলাইন", bn(C.phone || ""), telLink(C.phone))}${contactItem("mail", "ইমেইল", esc(C.email), emailOk(C.email) ? "mailto:" + C.email : "")}<p class="sub">ঠিকানা: ${esc(C.address)}</p></div>
 <div class="tiles"><a class="tile2" href="#/track"><span data-i="truck"></span><b>অর্ডার ট্র্যাক</b></a><a class="tile2" href="#/faq"><span data-i="help"></span><b>FAQ</b></a><a class="tile2" href="#/request"><span data-i="search"></span><b>পণ্য খুঁজে দিন</b></a><a class="tile2" href="#/returns"><span data-i="ret"></span><b>রিটার্ন</b></a></div>
 ${msgPage(r, "contact", "বার্তা পাঠান", "আপনার সমস্যা বা প্রশ্ন লিখুন।", [["name", "নাম", "t", 1], ["phone", "মোবাইল", "tel", 1], ["orderid", "অর্ডার নম্বর (থাকলে)", "t"], ["note", "বিবরণ", "area", 1]], "সাপোর্ট অনুরোধ").replace("<h1>বার্তা পাঠান</h1>", "<h2>বার্তা পাঠান</h2>")}`;
const FAQS = [["কীভাবে অর্ডার করব?", "পণ্য কার্টে দিন → চেকআউটে ঠিকানা দিন → ডেলিভারি ও পেমেন্ট বেছে অর্ডার করুন।"], ["সাইন ইন ছাড়া অর্ডার করা যায়?", "হ্যাঁ। তবে অর্ডার হিস্টরি ও স্টার পয়েন্টের জন্য সাইন ইন করুন।"], ["ডেলিভারি চার্জ কত?", `ঢাকায় ${tk(SITE.shipping.dhaka.fee)}, ঢাকার বাইরে ${tk(SITE.shipping.outside.fee)}। ${tk(SITE.freeShipMin)} বা বেশি অর্ডারে সাধারণ ডেলিভারি ফ্রি।`], ["কী কী পেমেন্ট পদ্ধতি আছে?", "ক্যাশ অন ডেলিভারি, বিকাশ, নগদ, রকেট ও ব্যাংক পেমেন্ট। কার্ড পেমেন্ট শীঘ্রই।"], ["অর্ডার ট্র্যাক করব কীভাবে?", "‘অর্ডার ট্র্যাক’ পাতায় অর্ডার নম্বর ও মোবাইল নম্বর দিন।"], [`রিটার্ন কত দিনের মধ্যে?`, `ডেলিভারির ${bn(SITE.returnDays)} দিনের মধ্যে ত্রুটির প্রমাণসহ অভিযোগ করতে হবে।`], ["অর্ডার বাতিল করা যায়?", "পণ্য ডেলিভারিতে যাওয়ার আগ পর্যন্ত অর্ডার পাতা থেকে বাতিল করা যায়।"], ["প্রি-অর্ডার কী?", "যেসব বই এখনো প্রকাশিত হয়নি সেগুলো আগেই অর্ডার করে রাখা, প্রকাশের পর পাঠানো হয়।"], ["কুপন কীভাবে ব্যবহার করব?", "কার্ট পাতায় কুপন কোড লিখে ‘প্রয়োগ’ চাপুন।"], ["অ্যাপ কীভাবে ইনস্টল করব?", "‘অ্যাপ ইনস্টল’ পাতায় ধাপ দেওয়া আছে।"]];
V.faq = () => `<h1>সচরাচর জিজ্ঞাসা</h1><div class="faq">${FAQS.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div><a class="btn ghost" href="#/support">উত্তর পাননি? সাপোর্টে লিখুন</a>`;
V.admission = r => `<div class="hero2 c-navy"><h1>ভর্তি পরীক্ষা ও চাকরির প্রস্তুতি</h1><p>মেডিকেল, ইঞ্জিনিয়ারিং, বিশ্ববিদ্যালয়, বিসিএস ও চাকরির বই এক জায়গায়</p></div><div class="cats">${cats(ACAD_CATS)}</div>${listPage(r, "একাডেমিক ও প্রস্তুতির বই", PRODUCTS.filter(p => p.acad), {})}`;
V.affiliate = () => {
  const u = me(), code = u ? (u.refcode || (u.refcode = u.id.slice(0, 6).toUpperCase(), DB.set("users", users), u.refcode)) : "", link = code ? location.href.split("#")[0].split("?")[0] + "?ref=" + code : "";
  return `<div class="hero2 c-violet"><h1>অ্যাফিলিয়েট প্রোগ্রাম</h1><p>ঘরে বসে আয় করুন: লিংক শেয়ার করুন, বিক্রি হলে কমিশন পান</p></div>
  <div class="box"><h2>চারটি ধাপ</h2><ol style="padding-left:20px;line-height:1.9"><li>সাইন ইন করে নিজের লিংক নিন</li><li>পছন্দের পণ্যের লিংক সংগ্রহ করুন</li><li>ফেসবুক, হোয়াটসঅ্যাপে শেয়ার করুন</li><li>লিংক থেকে বিক্রি হলে নির্ধারিত কমিশন পান</li></ol></div>
  ${u ? `<div class="box"><h3>আপনার লিংক</h3><input class="fi" readonly value="${esc(link)}"><div class="sendb"><button class="btn sm" data-act="copy" data-t="${esc(link)}">কপি</button>${waNum() ? "" : ""}<a class="btn wa sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(SITE.name + " থেকে কেনাকাটা করুন: " + link)}">শেয়ার</a></div></div>` : '<a class="btn" href="#/account" data-act="after">সাইন ইন করে লিংক নিন</a>'}
  <div class="note warn">কমিশনের হার ও পেআউট দোকান ঠিক করবে। লিংকের ক্লিক ও বিক্রি গণনা করতে সার্ভার লাগে, তাই এখন শুধু রেফারেল কোড তৈরি হচ্ছে, আয়ের হিসাব হচ্ছে না।</div>`;
};
const QZ = [["বাংলাদেশের জাতীয় ফুল কোনটি?", ["শাপলা", "গোলাপ", "জবা", "বেলি"], 0], ["‘গীতাঞ্জলি’ কাব্যের রচয়িতা কে?", ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "জীবনানন্দ দাশ", "মাইকেল মধুসূদন দত্ত"], 1], ["বাংলাদেশের স্বাধীনতা দিবস কবে?", ["১৬ ডিসেম্বর", "২১ ফেব্রুয়ারি", "২৬ মার্চ", "১৭ এপ্রিল"], 2], ["‘লালসালু’ উপন্যাসের লেখক কে?", ["সৈয়দ ওয়ালীউল্লাহ", "জহির রায়হান", "হুমায়ূন আহমেদ", "মানিক বন্দ্যোপাধ্যায়"], 0], ["বাংলাদেশের রাজধানী কোনটি?", ["চট্টগ্রাম", "রাজশাহী", "ঢাকা", "সিলেট"], 2], ["পৃথিবীর বৃহত্তম মহাসাগর কোনটি?", ["আটলান্টিক", "ভারত", "উত্তর মহাসাগর", "প্রশান্ত"], 3], ["বাংলাদেশের জাতীয় পশু কোনটি?", ["হাতি", "রয়েল বেঙ্গল টাইগার", "হরিণ", "ভাল্লুক"], 1], ["‘নন্দিত নরকে’ কার লেখা?", ["হুমায়ূন আহমেদ", "সাদাত হোসাইন", "আরিফ আজাদ", "শরৎচন্দ্র"], 0]];
let QS = { i: 0, s: 0, done: false };
V.quiz = () => {
  if (QS.done) return `<h1>কুইজ</h1><div class="box" style="text-align:center"><div class="hi" style="font-size:44px" data-i="trophy"></div><h2>আপনার স্কোর: ${bn(QS.s)}/${bn(QZ.length)}</h2><p class="sub">${QS.s === QZ.length ? "চমৎকার!" : QS.s >= QZ.length / 2 ? "ভালো করেছেন!" : "আরও পড়ুন, আবার চেষ্টা করুন"}</p><button class="btn" data-act="qre">আবার খেলুন</button> <a class="btn ghost" href="#/books">বই দেখুন</a></div>`;
  const [q, o] = QZ[QS.i];
  return `<h1>কুইজ</h1><div class="box quiz"><div class="bar"><i style="width:${QS.i / QZ.length * 100}%"></i></div><p class="sub">প্রশ্ন ${bn(QS.i + 1)}/${bn(QZ.length)}</p><div class="q">${q}</div>${o.map((t, k) => `<button class="o" data-act="qa" data-k="${k}">${t}</button>`).join("")}</div>`;
};
ACT.qa = el => { if ($(".quiz .right")) return; const k = +el.dataset.k, c = QZ[QS.i][2]; $$(".quiz .o").forEach((b, i) => { if (i === c) b.classList.add("right"); else if (i === k) b.classList.add("wrong"); }); if (k === c) QS.s++; setTimeout(() => { QS.i++; if (QS.i >= QZ.length) QS.done = true; render(); }, 900); };
ACT.qre = () => { QS = { i: 0, s: 0, done: false }; render(); };
V.install = () => {
  const ios = /iphone|ipad/i.test(navigator.userAgent), inst = matchMedia("(display-mode: standalone)").matches;
  return `<h1>অ্যাপ ইনস্টল করুন</h1>${inst ? '<div class="note">আপনি অ্যাপ হিসেবেই খুলেছেন ✓</div>' : ""}<div class="box"><p class="sub">ব্রাউজার থেকেই অ্যাপের মতো ফোনের হোম স্ক্রিনে যোগ করা যায়, আলাদা ডাউনলোড লাগে না।</p>${window._ip ? '<button class="btn full" data-act="doinstall"><span data-i="download"></span>এখনই ইনস্টল করুন</button>' : ""}
  <h3 style="margin-top:12px">${ios ? "iPhone (Safari)" : "Android (Chrome)"}</h3><ol style="padding-left:20px;line-height:1.9">${ios ? "<li>Safari-তে সাইট খুলুন</li><li>নিচের Share বোতাম চাপুন</li><li>‘Add to Home Screen’ বেছে নিন</li>" : "<li>Chrome-এ সাইট খুলুন</li><li>ডানে ওপরে ⋮ মেনু চাপুন</li><li>‘Install app’ বা ‘Add to Home screen’ চাপুন</li>"}</ol><p class="sub">অ্যাপ সাইটের নিজের লিংক (https) থেকে খুললে তবেই ইনস্টল হয়।</p></div>`;
};
ACT.doinstall = async () => { if (!window._ip) return; window._ip.prompt(); await window._ip.userChoice; window._ip = null; };
V.about = () => `<h1>আমাদের সম্পর্কে</h1><div class="box"><p>${SITE.name} বই, ইলেকট্রনিক্স, প্রতিদিনের সামগ্রী ও শিশুদের পণ্যের অনলাইন দোকান। এই লেখা দোকানের আসল পরিচয় দিয়ে বদলে নেওয়া হবে।</p><p class="sub">ঠিকানা: ${esc(C.address)}</p></div>`;
V.terms = () => `<h1>শর্তাবলি</h1><div class="box"><p class="sub">এটি নমুনা পাতা। ব্যবসা চালুর আগে আইনজীবীর সাহায্যে আসল শর্তাবলি বসান।</p><p>অর্ডার নিশ্চিত হওয়ার পর স্টক, দাম বা ঠিকানা সংক্রান্ত সমস্যা হলে দোকান গ্রাহককে জানিয়ে অর্ডার সংশোধন বা বাতিল করতে পারবে। রিটার্ন ও রিফান্ড আলাদা নীতি অনুযায়ী প্রযোজ্য।</p></div>`;
V.privacy = () => `<h1>গোপনীয়তা নীতি</h1><div class="box"><p class="sub">এটি নমুনা পাতা। চালুর আগে আসল নীতি বসান।</p><p>এই সাইট আপনার নাম, মোবাইল ও ঠিকানা শুধু অর্ডার সম্পন্ন করতে ব্যবহার করে। এখন এসব তথ্য আপনার নিজের ফোনের ব্রাউজারে থাকে। অর্ডার পাঠালে আপনার দেওয়া বার্তা দোকানের কাছে যায়। কার্ডের তথ্য নেওয়া হয় না।</p></div>`;
