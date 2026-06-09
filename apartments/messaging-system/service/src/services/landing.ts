/**
 * Dimora guest-guide landing page — light, editorial, Apple-grade.
 *
 * Design language follows the Dimora design system (.claude/skills/dimora-design):
 * an Apple-style LIGHT canvas with generous whitespace, Thmanyah serif display +
 * clean sans, ONE sage-green accent, browser-style mock framing, a pill segmented
 * toggle and a big-number highlights strip — now elevated with:
 *
 *  - a fixed glass local-nav (appears after the hero, scroll-spy highlights)
 *  - a cinematic hero: Ken-Burns backdrop, staged reveals, gradient brand word,
 *    and a soft parallax on the showcase mock
 *  - staggered scroll-reveals for every grid (steps, services, rules, places)
 *  - a swipeable snap-scroll photo gallery ("a look inside")
 *  - a device-framed vertical check-in video
 *  - a floating glass action dock on mobile (video + WhatsApp)
 *
 * Mobile-first, RTL Arabic-first, server-rendered HTML + inline CSS (no
 * framework, no build step, NO external fonts/assets). Linked from guest
 * WhatsApp messages. All motion honours prefers-reduced-motion.
 *
 * Per-apartment fields come from the `Apartments` sheet row; all shared Dimora
 * content (brand, services, rules, nearby places, check-in steps, D1/D2 details)
 * lives in `src/data/guestGuide.ts` — edit copy there, not here.
 */

import { env } from "../config/env.js";
import { guide, resolveCode, type ApartmentCode } from "../data/guestGuide.js";
import { FONT_CSS } from "../assets/thmanyahFonts.js";
import type { Apartment, Language } from "../types.js";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Convert common video URLs to an embeddable iframe src; null if not embeddable. */
export function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

const pick = (lang: Language, ar: string, en: string) => (lang === "ar" ? ar : en);

/** Arabic primary + English secondary inline. */
function bi(ar: string, en: string): string {
  return `<span class="bi"><span class="ar">${escapeHtml(ar)}</span><span class="en" dir="auto">${escapeHtml(en)}</span></span>`;
}

/** Escape text, wrapping the first occurrence of the brand word in a gradient em. */
function accentBrand(text: string, brand: string): string {
  const i = text.toLowerCase().indexOf(brand.toLowerCase());
  if (i === -1) return escapeHtml(text);
  const word = text.slice(i, i + brand.length);
  return `${escapeHtml(text.slice(0, i))}<em class="grad">${escapeHtml(word)}</em>${escapeHtml(text.slice(i + brand.length))}`;
}

const COPY = {
  ar: {
    dir: "rtl",
    cta: "شاهد فيديو الدخول",
    selector: "اختر شقتك",
    yourUnit: "وحدتك",
    checkinTitle: "تعليمات الدخول",
    howToEnter: "طريقة الدخول للشقة",
    videoTitle: "فيديو طريقة الدخول",
    videoDesc: "شاهد الخطوات قبل الوصول لتسهيل الدخول.",
    videoFallback: "سيتم إضافة فيديو الدخول هنا",
    galleryTitle: "جولة داخل الشقة",
    galleryAlt: "من داخل ديمورا",
    infoTitle: "معلومات الشقة",
    wifi: "الواي فاي",
    wifiName: "اسم الشبكة",
    wifiPass: "كلمة السر",
    checkIn: "وقت الدخول",
    checkOut: "وقت الخروج",
    support: "دعم على مدار الساعة",
    services: "الخدمات والمزايا",
    rulesTitle: "إرشادات الإقامة",
    nearbyTitle: "حولك في حي لبن",
    helpTitle: "تحتاج مساعدة؟",
    helpDesc: "نحن في خدمتك على مدار الساعة.",
    email: "البريد الإلكتروني",
    locationTitle: "الموقع",
    directions: "الاتجاهات عبر خرائط جوجل",
    whatsapp: "تواصل عبر واتساب",
    whatsappSoon: "سيتم إضافة رقم التواصل هنا",
    maintenance: "للطوارئ والصيانة",
    unit: "رقم الوحدة",
    entry: "رمز الدخول",
    entrySoon: "يصلك رمز الدخول الخاص بك عبر واتساب",
    buildingInfo: "معلومات العمارة",
    checkoutInfo: "إرشادات الخروج",
    imgSoon: "سيتم إضافة الصورة هنا",
    eyebrow: "إقامة بوتيكية في الرياض",
    mockTitle: "ديمورا · دليل الضيف",
    navVideo: "الفيديو",
    navCheckin: "الدخول",
    navLocation: "الموقع",
    navUnit: "وحدتك",
    navInfo: "الخدمات",
    navContact: "تواصل",
  },
  en: {
    dir: "ltr",
    cta: "Watch the check-in video",
    selector: "Choose your apartment",
    yourUnit: "Your unit",
    checkinTitle: "Check-in Instructions",
    howToEnter: "How to enter",
    videoTitle: "Check-in Video",
    videoDesc: "Watch the steps before arrival for an easier check-in.",
    videoFallback: "The check-in video will be added here",
    galleryTitle: "A Look Inside",
    galleryAlt: "Inside Dimora",
    infoTitle: "Apartment Information",
    wifi: "Wi-Fi",
    wifiName: "Network",
    wifiPass: "Password",
    checkIn: "Check-in",
    checkOut: "Check-out",
    support: "Around-the-clock support",
    services: "Services & Amenities",
    rulesTitle: "Stay Guidelines",
    nearbyTitle: "Around You in Laban",
    helpTitle: "Need Help?",
    helpDesc: "We are here for you around the clock.",
    email: "Email",
    locationTitle: "Location",
    directions: "Open in Google Maps",
    whatsapp: "Contact on WhatsApp",
    whatsappSoon: "A contact number will be added here",
    maintenance: "Maintenance & emergencies",
    unit: "Unit number",
    entry: "Entry code",
    entrySoon: "Your entry code will be sent to you via WhatsApp",
    buildingInfo: "Building information",
    checkoutInfo: "Checkout instructions",
    imgSoon: "Image will be added here",
    eyebrow: "A boutique stay in Riyadh",
    mockTitle: "Dimora · Guest Guide",
    navVideo: "Video",
    navCheckin: "Check-in",
    navLocation: "Location",
    navUnit: "Your unit",
    navInfo: "Amenities",
    navContact: "Contact",
  },
} as const;

/** Minimal inline-SVG icon set (stroke = currentColor). No external assets. */
const ICONS: Record<string, string> = {
  building: '<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 21V9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3"/>',
  door: '<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M3 21h18M14 12h.01"/>',
  parking: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 16V8h3.5a2.5 2.5 0 0 1 0 5H9"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="m10 9 5 3-5 3V9Z"/>',
  tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
  coffee: '<path d="M4 8h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8ZM17 9h2a2 2 0 0 1 0 4h-2M6 2v2M10 2v2M14 2v2"/>',
  ac: '<rect x="3" y="5" width="18" height="8" rx="2"/><path d="M6 9h.01M9 9h6M7 17c1 0 1.5-1 2.5-1M12 18c1 0 1.5-1 2.5-1M16 16c1 0 1.5-1 2.5-1"/>',
  towel: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18M9 7h6"/>',
  key: '<circle cx="8" cy="8" r="4"/><path d="m11 11 9 9M17 17l2-2M14 14l2-2"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8 16a5 5 0 0 1 8 0M12 20h.01"/>',
  landmark: '<path d="M3 21h18M5 21V10M19 21V10M9 21v-6M15 21v-6M12 3 4 8h16l-8-5Z"/>',
  bag: '<path d="M6 8h12l-1 12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8ZM9 8V6a3 3 0 0 1 6 0v2"/>',
  food: '<path d="M5 3v8a2 2 0 0 0 2 2v8M5 7h4M9 3v8a2 2 0 0 1-2 2M17 3c-2 0-3 2-3 5s1 4 3 4v9"/>',
  store: '<path d="M4 9h16l-1-5H5L4 9ZM4 9v11h16V9M9 20v-5h6v5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  phone: '<path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  whatsapp: '<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Z"/><path d="M8.5 8.5c0 4 3 6.5 6.5 6.5.7 0 1-.4 1-1l-.3-1.4-1.7-.6-.9 1c-1.2-.5-2.1-1.4-2.6-2.6l1-.9-.6-1.7L9.5 7.5c-.6 0-1 .3-1 1Z"/>',
  pin: '<path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  shield: '<path d="M12 3 5 6v6c0 4 3 6.5 7 9 4-2.5 7-5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>',
  photo: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4 3 2 4-3 4 4"/>',
};

const icon = (name: string, cls = "ic") =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ""}</svg>`;

/** Section header: accent icon chip + serif Arabic title with muted English. */
function secHead(iconName: string, ar: string, en: string, extra = ""): string {
  return `<div class="sec-head">
    <span class="chip">${icon(iconName, "chip-ic")}</span>
    <div class="sec-text"><h2 class="sec-title">${escapeHtml(ar)}${extra}</h2><span class="sec-sub" dir="auto">${escapeHtml(en)}</span></div>
  </div>`;
}

/** A media block: image if a URL exists, else an elegant placeholder. */
function media(url: string, alt: string, placeholder: string, cls: string): string {
  if (url) {
    return `<img class="${cls}" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">`;
  }
  return `<div class="${cls} ph" role="img" aria-label="${escapeHtml(alt)}">${icon("pin", "ph-ic")}<span>${escapeHtml(placeholder)}</span></div>`;
}

/** Wrap an inner media node in a browser-style mock window on a gradient pad. */
function mockFrame(inner: string, title: string): string {
  return `<div class="pad art-hero"><figure class="mock">
    <div class="mock-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="mock-title">${escapeHtml(title)}</span></div>
    ${inner}
  </figure></div>`;
}

/** A built-in apartment (from guestGuide) so the page renders even before the
 * Google Sheet is configured — used as a fallback by the landing route. */
export function defaultApartment(apartmentId: string): Apartment {
  const code = resolveCode(apartmentId);
  const u = guide.apartments[code];
  return {
    apartment_id: apartmentId,
    apartment_name: u.nameEn,
    default_check_in_time: guide.checkInTime,
    default_check_out_time: guide.checkOutTime,
    access_guideline:
      "الشقة في الدور الأول.\nرمز الباب يصلك عبر واتساب قبل وصولك.\nالمدخل من الباب المحدد في الصورة بالأعلى.",
    checkout_guideline: "اترك المفتاح في الدرج، أطفئ المكيف والأنوار، وتأكد من إغلاق الباب.",
    building_info: "حي لبن — الرياض. مدخل الشقق من الباب المحدد في الصورة، والمواقف على اليسار.",
    entrance_photo_url: "",
    video_url: "",
    maintenance_contact_phone: "",
    landing_lang_default: "ar",
  };
}

export function renderLandingPage(apartment: Apartment, lang: Language): string {
  const t = COPY[lang];
  const code: ApartmentCode = resolveCode(apartment.apartment_id);
  const unit = guide.apartments[code];

  const brandName = pick(lang, guide.brand.nameAr, guide.brand.nameEn);
  const heroImg = guide.media.heroImageUrl || apartment.entrance_photo_url || "";
  const heroBgUrl = guide.media.heroBackgroundUrl || "";
  const wayImg = guide.media.wayfindingImageUrl || apartment.entrance_photo_url || "";
  const videoUrl = guide.media.videoUrl || apartment.video_url || "";
  const mapImg = guide.media.mapImageUrl || "";
  const checkInTime = apartment.default_check_in_time || guide.checkInTime;
  const checkOutTime = apartment.default_check_out_time || guide.checkOutTime;

  // ---- Fixed glass local-nav (appears after the hero; scroll-spy) ----
  const navItems: Array<[string, string]> = [
    ["video", t.navVideo],
    ["checkin", t.navCheckin],
    ["unit", t.navUnit],
    ["info", t.navInfo],
    ["location", t.navLocation],
    ["help", t.navContact],
  ];
  const lnav = `
  <div class="lnav" id="lnav" aria-hidden="true">
    <span class="lnav-brand">${escapeHtml(guide.brand.nameEn)}</span>
    <nav>${navItems.map(([id, label]) => `<a href="#${id}">${escapeHtml(label)}</a>`).join("")}</nav>
  </div>`;

  // ---- Section 1: Hero (cinematic, light, editorial) ----
  const logo = guide.brand.logoUrl
    ? `<img class="logo" src="${escapeHtml(guide.brand.logoUrl)}" alt="${escapeHtml(brandName)}">`
    : `<span class="wordmark">${escapeHtml(guide.brand.nameEn)}</span>`;
  const heroShowcase = heroImg
    ? mockFrame(
        `<img class="show-img" src="${escapeHtml(heroImg)}" alt="${escapeHtml(brandName)}" loading="eager" decoding="async">`,
        t.mockTitle,
      )
    : "";
  const welcome = accentBrand(
    pick(lang, guide.brand.welcomeAr, guide.brand.welcomeEn),
    pick(lang, guide.brand.nameAr, guide.brand.nameEn),
  );
  const hero = `
  <header class="hero${heroBgUrl ? " hero--bg" : ""}"${heroBgUrl ? ` style="--hero-bg:url('${escapeHtml(heroBgUrl)}')"` : ""}>
    <div class="hero-inner">
      <div class="brandbar up" style="--d:.04s">${logo}</div>
      <span class="eyebrow up" style="--d:.16s">${escapeHtml(t.eyebrow)}</span>
      <h1 class="up" style="--d:.26s">${welcome}</h1>
      <p class="lede up" style="--d:.38s">${escapeHtml(pick(lang, guide.brand.subtitleAr, guide.brand.subtitleEn))}</p>
      <a class="btn up" style="--d:.5s" href="#video">${escapeHtml(t.cta)} ${icon("chevron", "btn-ic")}</a>
      ${heroShowcase ? `<div class="showcase up" style="--d:.62s"><div class="plx">${heroShowcase}</div></div>` : ""}
    </div>
  </header>`;

  // ---- Highlights strip (true facts, big-number style) ----
  const highlights = `
  <section class="wrap reveal">
    <div class="stats">
      <div class="stat"><b>${escapeHtml(checkInTime)}</b><span>${escapeHtml(t.checkIn)}</span></div>
      <div class="stat"><b>${escapeHtml(checkOutTime)}</b><span>${escapeHtml(t.checkOut)}</span></div>
      <div class="stat"><b>24/7</b><span>${escapeHtml(t.support)}</span></div>
    </div>
  </section>`;

  // ---- Section 2: Check-in video (vertical Shorts get a device frame) ----
  const embed = videoUrl ? toEmbedUrl(videoUrl) : null;
  let videoBody: string;
  const isVertical = /youtube\.com\/shorts\//i.test(videoUrl);
  if (embed) {
    const embedSrc = `${embed}${embed.includes("?") ? "&" : "?"}rel=0&playsinline=1&modestbranding=1`;
    videoBody = `<div class="video${isVertical ? " vertical" : ""}"><iframe src="${embedSrc}" title="${escapeHtml(t.videoTitle)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`;
  } else if (videoUrl && /\.mp4(\?|$)/i.test(videoUrl)) {
    videoBody = `<video class="video-el" controls preload="metadata" playsinline ${guide.media.videoPoster ? `poster="${escapeHtml(guide.media.videoPoster)}"` : ""}><source src="${escapeHtml(videoUrl)}" type="video/mp4"></video>`;
  } else if (videoUrl) {
    videoBody = `<p><a class="btn ghost" href="${escapeHtml(videoUrl)}" target="_blank" rel="noopener">${escapeHtml(t.videoTitle)}</a></p>`;
  } else {
    videoBody = `<div class="video-ph ph">${icon("play", "ph-ic")}<span>${escapeHtml(t.videoFallback)}</span></div>`;
  }
  const video = `
  <section id="video" class="wrap reveal">
    ${secHead("play", COPY.ar.videoTitle, COPY.en.videoTitle)}
    <p class="sec-desc">${escapeHtml(pick(lang, COPY.ar.videoDesc, COPY.en.videoDesc))}</p>
    ${videoBody}
  </section>`;

  // ---- Section 3: Check-in instructions (mock-framed image + feature grid) ----
  const stepCards = guide.steps
    .map(
      (s, i) =>
        `<div class="step"><span class="num">${i + 1}</span><span class="tile-ic">${icon(s.icon)}</span>${bi(s.ar, s.en)}</div>`,
    )
    .join("");
  const accessBody = apartment.access_guideline
    ? `<div class="card access"><h3>${escapeHtml(t.howToEnter)}</h3><p>${escapeHtml(apartment.access_guideline).replace(/\n/g, "<br>")}</p></div>`
    : "";
  const checkin = `
  <section id="checkin" class="wrap reveal">
    ${secHead("door", COPY.ar.checkinTitle, COPY.en.checkinTitle)}
    <div class="way">${mockFrame(media(wayImg, pick(lang, "صورة توضيح المدخل والمواقف", "Entrance & parking guide"), t.imgSoon, "way-img"), t.mockTitle)}</div>
    <div class="steps stagger">${stepCards}</div>
    ${accessBody}
  </section>`;

  // ---- Section 4: Apartment selector (pill toggle, like the reference) ----
  const selBtn = (c: ApartmentCode) =>
    `<button type="button" class="seg${c === code ? " on" : ""}" data-code="${c}">${escapeHtml(guide.apartments[c].nameEn)}</button>`;
  const selector = `
  <section id="unit" class="wrap reveal" aria-label="${escapeHtml(t.selector)}">
    <div class="seg-row"><div class="seg-wrap">${selBtn("D1")}${selBtn("D2")}</div></div>
    <div class="card unit-card">
      <span class="kicker">${escapeHtml(t.yourUnit)}</span>
      <h2 class="unit-name" id="u-name">${escapeHtml(pick(lang, unit.nameAr, unit.nameEn))}</h2>
      <div class="kv"><span>${escapeHtml(t.unit)}</span><b id="u-unit">${escapeHtml(pick(lang, unit.unitAr, unit.unitEn))}</b></div>
      <div class="kv"><span>${escapeHtml(t.entry)}</span><b id="u-entry" class="code">${unit.entryCode ? escapeHtml(unit.entryCode) : `<i class="soft">${escapeHtml(t.entrySoon)}</i>`}</b></div>
      <p class="note" id="u-note">${escapeHtml(pick(lang, unit.noteAr, unit.noteEn))}</p>
    </div>
  </section>`;

  // ---- Section 5: Apartment information ----
  const serviceCards = guide.services
    .map((s) => `<div class="svc"><span class="tile-ic">${icon(s.icon)}</span>${bi(s.ar, s.en)}</div>`)
    .join("");
  const info = `
  <section id="info" class="wrap reveal">
    ${secHead("building", COPY.ar.infoTitle, COPY.en.infoTitle, ` <span class="apt-name">· ${escapeHtml(apartment.apartment_name)}</span>`)}
    <div class="grid2 stagger">
      <div class="card wifi">
        <div class="card-h"><span class="chip sm">${icon("wifi", "chip-ic")}</span><span>${escapeHtml(t.wifi)}</span></div>
        <div class="kv"><span>${escapeHtml(t.wifiName)}</span><b id="u-wifi-name">${escapeHtml(unit.wifiName || guide.wifi.name)}</b></div>
        <div class="kv"><span>${escapeHtml(t.wifiPass)}</span><b id="u-wifi-pass" class="code">${escapeHtml(unit.wifiPassword || guide.wifi.password)}</b></div>
      </div>
      <div class="card times">
        <div class="kv"><span>${icon("clock", "mini")} ${escapeHtml(t.checkIn)}</span><b>${escapeHtml(checkInTime)}</b></div>
        <div class="kv"><span>${icon("clock", "mini")} ${escapeHtml(t.checkOut)}</span><b>${escapeHtml(checkOutTime)}</b></div>
      </div>
    </div>
    <h3 class="sub">${escapeHtml(t.services)}</h3>
    <div class="svc-grid stagger">${serviceCards}</div>
    ${apartment.building_info ? `<div class="card"><h3>${escapeHtml(t.buildingInfo)}</h3><p>${escapeHtml(apartment.building_info).replace(/\n/g, "<br>")}</p></div>` : ""}
  </section>`;

  // ---- Gallery: swipeable snap-scroll photos ("a look inside") ----
  const galleryImgs = guide.media.gallery.filter(Boolean);
  const gallery = galleryImgs.length
    ? `
  <section id="gallery" class="wrap reveal">
    ${secHead("photo", COPY.ar.galleryTitle, COPY.en.galleryTitle)}
    <div class="gal stagger">${galleryImgs
      .map(
        (src, i) =>
          `<figure class="gal-item"><img src="${escapeHtml(src)}" alt="${escapeHtml(t.galleryAlt)} ${i + 1}" loading="lazy" decoding="async"></figure>`,
      )
      .join("")}</div>
  </section>`
    : "";

  // ---- Section 6: House rules ----
  const ruleCards = guide.rules.map((r) => `<li>${bi(r.ar, r.en)}</li>`).join("");
  const rules = `
  <section class="wrap reveal">
    ${secHead("shield", COPY.ar.rulesTitle, COPY.en.rulesTitle)}
    <ul class="rules stagger">${ruleCards}</ul>
    ${apartment.checkout_guideline ? `<div class="card"><h3>${escapeHtml(t.checkoutInfo)}</h3><p>${escapeHtml(apartment.checkout_guideline).replace(/\n/g, "<br>")}</p></div>` : ""}
  </section>`;

  // ---- Section 7: Nearby places ----
  const cats = guide.nearby
    .map((c) => {
      const items = c.items
        .map((it) => {
          const label = bi(it.ar, it.en);
          return it.mapUrl
            ? `<li><a href="${escapeHtml(it.mapUrl)}" target="_blank" rel="noopener">${label}${icon("pin", "li-ic")}</a></li>`
            : `<li>${label}</li>`;
        })
        .join("");
      return `<div class="card cat"><div class="card-h"><span class="chip sm">${icon(c.icon, "chip-ic")}</span><span>${escapeHtml(pick(lang, c.titleAr, c.titleEn))}</span></div><ul class="cat-list">${items}</ul></div>`;
    })
    .join("");
  const nearby = `
  <section class="wrap reveal">
    ${secHead("pin", COPY.ar.nearbyTitle, COPY.en.nearbyTitle)}
    <div class="cats stagger">${cats}</div>
  </section>`;

  // ---- Section 8: Contact / help ----
  const waLink = guide.whatsapp ? `https://wa.me/${escapeHtml(guide.whatsapp.replace(/[^\d]/g, ""))}` : "";
  const waBtn = waLink
    ? `<a class="btn wa" href="${waLink}" target="_blank" rel="noopener">${icon("whatsapp", "btn-ic")} ${escapeHtml(t.whatsapp)}</a>`
    : `<div class="btn wa disabled" aria-disabled="true">${icon("whatsapp", "btn-ic")} ${escapeHtml(t.whatsappSoon)}</div>`;
  const maint = apartment.maintenance_contact_phone
    ? `<a class="btn ghost" href="tel:${escapeHtml(apartment.maintenance_contact_phone)}">${icon("phone", "btn-ic")} ${escapeHtml(t.maintenance)}</a>`
    : "";
  const dirText = pick(lang, COPY.ar.directions, COPY.en.directions);
  const emailLine = guide.email
    ? `<a class="contact-line" href="mailto:${escapeHtml(guide.email)}">${icon("mail", "cl-ic")}<span>${escapeHtml(guide.email)}</span></a>`
    : "";
  const dirBtn = guide.mapsUrl
    ? `<a class="btn ghost" href="${escapeHtml(guide.mapsUrl)}" target="_blank" rel="noopener">${icon("pin", "btn-ic")} ${escapeHtml(dirText)}</a>`
    : "";
  const help = `
  <section id="help" class="wrap reveal contact">
    ${secHead("phone", COPY.ar.helpTitle, COPY.en.helpTitle)}
    <p class="sec-desc">${escapeHtml(pick(lang, COPY.ar.helpDesc, COPY.en.helpDesc))}</p>
    <div class="actions stagger">${waBtn}${maint}${dirBtn}</div>
    ${emailLine}
  </section>`;

  // ---- Location (near the top): map image + directions ----
  const location = guide.mapsUrl
    ? `
  <section id="location" class="wrap reveal">
    ${secHead("pin", COPY.ar.locationTitle, COPY.en.locationTitle)}
    <a class="map-card" href="${escapeHtml(guide.mapsUrl)}" target="_blank" rel="noopener" aria-label="${escapeHtml(dirText)}">
      ${mapImg ? `<img class="map-img" src="${escapeHtml(mapImg)}" alt="${escapeHtml(pick(lang, COPY.ar.locationTitle, COPY.en.locationTitle))}" loading="lazy" decoding="async">` : ""}
      <span class="map-cta">${icon("pin", "btn-ic")} ${escapeHtml(dirText)}</span>
    </a>
  </section>`
    : "";

  // Client data for the D1/D2 selector.
  const unitData = JSON.stringify(
    Object.fromEntries(
      (Object.keys(guide.apartments) as ApartmentCode[]).map((c) => {
        const u = guide.apartments[c];
        return [
          c,
          {
            name: pick(lang, u.nameAr, u.nameEn),
            unit: pick(lang, u.unitAr, u.unitEn),
            entry: u.entryCode || `<i class="soft">${escapeHtml(t.entrySoon)}</i>`,
            wifiName: u.wifiName || guide.wifi.name,
            wifiPass: u.wifiPassword || guide.wifi.password,
            note: pick(lang, u.noteAr, u.noteEn),
          },
        ];
      }),
    ),
  );

  // Sage green is the brand accent. A custom BRAND_PRIMARY_COLOR (anything other
  // than the legacy default) still overrides it, so the page stays themeable.
  const customPrimary =
    env.landing.brandPrimaryColor && env.landing.brandPrimaryColor !== "#0E7C66"
      ? env.landing.brandPrimaryColor
      : "";
  const accent = escapeHtml(customPrimary || "#889970");

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#f4f4f6">
<meta name="description" content="${escapeHtml(pick(lang, guide.brand.subtitleAr, guide.brand.subtitleEn))}">
<title>${escapeHtml(brandName)} — ${escapeHtml(apartment.apartment_name)}</title>
<style>
${FONT_CSS}
  :root{
    --accent:${accent};--accent-dk:#5F6B4E;
    --accent-soft:color-mix(in srgb, var(--accent) 12%, #fff);
    --accent-ring:color-mix(in srgb, var(--accent) 18%, transparent);
    --ink:#1D1D1F;--body:#3F3F43;--muted:#86868B;--faint:#AEAEB2;
    --bg:#F4F4F6;--card:#FFFFFF;--line:rgba(0,0,0,.07);--line-2:rgba(0,0,0,.12);
    --serif:"Thmanyah Serif Display","Iowan Old Style",Palatino,"Noto Naskh Arabic",Georgia,serif;
    --sans:"Thmanyah Sans",system-ui,-apple-system,"Segoe UI","Noto Sans Arabic",Tahoma,Arial,sans-serif;
    --ease:cubic-bezier(.16,1,.3,1);
    --r-sm:14px;--r:20px;--r-lg:26px;--r-xl:32px;
    --sh-sm:0 1px 2px rgba(17,20,24,.05);
    --sh:0 8px 26px rgba(17,20,24,.06);
    --sh-lg:0 26px 60px rgba(17,20,24,.12);
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  ::selection{background:var(--accent-ring)}
  a:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:8px}
  body{margin:0;background:var(--bg);
    background-image:radial-gradient(60% 30% at 50% 0%,rgba(136,153,112,.06),transparent 70%),
                     radial-gradient(50% 24% at 100% 4%,rgba(125,177,255,.08),transparent 70%);
    background-attachment:fixed;color:var(--body);line-height:1.6;font-family:var(--sans);
    -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
  img{max-width:100%;display:block}
  .wrap{max-width:680px;margin:0 auto;padding:40px 20px}
  @media (min-width:560px){.wrap{padding:56px 24px}}
  section[id]{scroll-margin-top:70px}

  /* Scroll reveals — section-level + staggered children */
  .reveal{opacity:0;transform:translateY(20px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
  .reveal.in{opacity:1;transform:none}
  .stagger>*{opacity:0;transform:translateY(18px);transition:opacity .7s var(--ease),transform .7s var(--ease)}
  .stagger.in>*{opacity:1;transform:none}
  .stagger.in>*:nth-child(1){transition-delay:.05s}
  .stagger.in>*:nth-child(2){transition-delay:.12s}
  .stagger.in>*:nth-child(3){transition-delay:.19s}
  .stagger.in>*:nth-child(4){transition-delay:.26s}
  .stagger.in>*:nth-child(5){transition-delay:.33s}
  .stagger.in>*:nth-child(6){transition-delay:.4s}
  .stagger.in>*:nth-child(7){transition-delay:.47s}
  .stagger.in>*:nth-child(8){transition-delay:.54s}
  .up{opacity:0;transform:translateY(20px);animation:up .9s var(--ease) forwards;animation-delay:var(--d,0s)}
  @keyframes up{to{opacity:1;transform:none}}

  /* Fixed glass local-nav (Apple product-page style) */
  .lnav{position:fixed;top:0;inset-inline:0;z-index:70;display:flex;align-items:center;gap:10px;
    padding:9px 16px;background:rgba(244,244,246,.8);
    -webkit-backdrop-filter:saturate(1.8) blur(18px);backdrop-filter:saturate(1.8) blur(18px);
    border-bottom:1px solid var(--line);transform:translateY(-110%);transition:transform .5s var(--ease)}
  .lnav.show{transform:none}
  .lnav-brand{font-family:var(--serif);font-weight:700;letter-spacing:.24em;font-size:.8rem;color:var(--ink);white-space:nowrap;flex:none}
  .lnav nav{display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .lnav nav::-webkit-scrollbar{display:none}
  .lnav a{flex:none;text-decoration:none;color:var(--muted);font-size:.82rem;font-weight:600;
    padding:7px 13px;border-radius:999px;transition:color .25s,background .25s}
  .lnav a:hover{color:var(--ink)}
  .lnav a.on{background:var(--accent-soft);color:var(--accent-dk)}

  /* Colourful gradient pad + browser mock window */
  .pad{padding:16px;border-radius:var(--r-xl);position:relative;isolation:isolate}
  .art-hero{background:
      radial-gradient(62% 80% at 18% 12%,rgba(136,153,112,.42),transparent 62%),
      radial-gradient(58% 72% at 86% 16%,rgba(170,186,142,.40),transparent 62%),
      radial-gradient(70% 80% at 74% 96%,rgba(118,138,96,.30),transparent 62%),
      #eef1ea}
  .mock{border-radius:var(--r-lg);overflow:hidden;background:#fff;border:1px solid rgba(255,255,255,.7);box-shadow:var(--sh-lg);margin:0}
  .mock-bar{display:flex;align-items:center;gap:7px;padding:11px 15px;background:#fbfbfd;border-bottom:1px solid var(--line)}
  .dot{width:11px;height:11px;border-radius:50%;flex:none}
  .dot.r{background:#ff5f57}.dot.y{background:#febc2e}.dot.g{background:#28c840}
  .mock-title{margin-inline-start:9px;font-size:.76rem;color:var(--muted);letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .show-img{width:100%;aspect-ratio:16/10;object-fit:cover}
  .way-img{width:100%;height:auto;display:block}

  /* Hero — cinematic: Ken-Burns backdrop + light veil + staged reveal */
  .hero{position:relative;overflow:hidden;padding:54px 20px 10px;text-align:center}
  .hero.hero--bg::before{content:"";position:absolute;inset:-2%;z-index:0;background-image:var(--hero-bg);
    background-size:cover;background-position:center;filter:blur(3px) saturate(1.12);opacity:.6;
    transform:scale(1.06);animation:kb 26s var(--ease) infinite alternate}
  @keyframes kb{from{transform:scale(1.06) translateY(0)}to{transform:scale(1.13) translateY(-1.6%)}}
  .hero.hero--bg::after{content:"";position:absolute;inset:0;z-index:0;background:linear-gradient(180deg,rgba(244,244,246,.62),rgba(244,244,246,.40) 46%,rgba(244,244,246,.80) 86%,var(--bg))}
  .hero-inner{position:relative;z-index:1;max-width:640px;margin:0 auto}
  .brandbar{margin-bottom:20px}
  .hero .logo{filter:brightness(0);opacity:.9;max-height:118px;width:auto;max-width:64%;margin:0 auto}
  .wordmark{font-family:var(--serif);font-size:1.7rem;font-weight:700;letter-spacing:.34em;color:var(--ink)}
  .eyebrow{display:inline-block;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;font-weight:700;
    color:var(--accent);background:var(--accent-soft);padding:7px 16px;border-radius:999px;margin-bottom:18px;
    border:1px solid color-mix(in srgb,var(--accent) 22%,transparent)}
  .hero h1{font-family:var(--serif);font-size:clamp(2.5rem,9vw,3.7rem);margin:0 0 14px;font-weight:700;
    line-height:1.06;letter-spacing:-.024em;color:var(--ink)}
  .hero h1 .grad{font-style:normal;background:linear-gradient(115deg,var(--accent-dk),var(--accent) 60%,color-mix(in srgb,var(--accent) 60%,#fff));
    -webkit-background-clip:text;background-clip:text;color:transparent}
  .hero .lede{font-size:1.16rem;color:var(--muted);margin:0 auto 26px;max-width:36ch}
  .showcase{margin-top:34px}
  .plx{will-change:transform}

  /* Buttons */
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;
    background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 72%,#fff),var(--accent));color:#fff;text-decoration:none;
    font-weight:700;font-size:1rem;padding:15px 26px;border-radius:999px;border:0;cursor:pointer;
    box-shadow:0 10px 24px var(--accent-ring),inset 0 1px 0 rgba(255,255,255,.4);
    transition:transform .25s var(--ease),box-shadow .25s var(--ease),filter .2s}
  .btn:hover{transform:translateY(-2px);filter:brightness(1.04);box-shadow:0 14px 30px var(--accent-ring),inset 0 1px 0 rgba(255,255,255,.4)}
  .btn:active{transform:translateY(0) scale(.985)}
  .btn .btn-ic{width:18px;height:18px}
  html[dir=rtl] .btn .btn-ic{transform:scaleX(-1)}
  .btn.ghost{background:#fff;color:var(--ink);border:1px solid var(--line-2);box-shadow:var(--sh-sm)}
  .btn.ghost:hover{background:#fafafa;filter:none}
  .btn.wa{background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 72%,#fff),var(--accent));box-shadow:0 10px 24px var(--accent-ring)}
  .btn.wa.disabled{background:#d6d6da;color:#fff;cursor:default;box-shadow:none}

  /* Section heads (accent chip + serif two-tone) */
  .sec-head{display:flex;align-items:flex-start;gap:13px;margin:0 0 18px}
  .chip{flex:none;width:42px;height:42px;border-radius:13px;display:grid;place-items:center;
    background:var(--accent-soft);color:var(--accent)}
  .chip.sm{width:34px;height:34px;border-radius:10px}
  .chip-ic{width:22px;height:22px}
  .chip.sm .chip-ic{width:18px;height:18px}
  .sec-text{min-width:0}
  .sec-title{font-family:var(--serif);font-size:clamp(1.6rem,6vw,2.15rem);font-weight:700;
    color:var(--ink);letter-spacing:-.02em;line-height:1.12;margin:0}
  .sec-sub{display:block;color:var(--muted);font-size:.92rem;margin-top:4px}
  .apt-name{font-family:var(--sans);font-size:.9rem;color:var(--muted);font-weight:500}
  .sec-desc{color:var(--muted);margin:-8px 0 22px}
  .sub{font-family:var(--serif);font-size:1.24rem;color:var(--ink);font-weight:700;margin:30px 0 14px;letter-spacing:-.01em}

  /* Highlights strip (big numbers) */
  .stats{display:grid;grid-template-columns:repeat(3,1fr);background:var(--card);border:1px solid var(--line);
    border-radius:var(--r);box-shadow:var(--sh);overflow:hidden}
  .stat{padding:22px 12px;text-align:center;border-inline-end:1px solid var(--line)}
  .stat:last-child{border-inline-end:0}
  .stat b{font-family:var(--serif);font-size:1.9rem;color:var(--ink);display:block;letter-spacing:-.01em;font-variant-numeric:tabular-nums}
  .stat span{color:var(--muted);font-size:.8rem;display:block;margin-top:3px}

  /* Cards */
  .card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:20px;margin:14px 0;box-shadow:var(--sh)}
  .card-h{display:flex;align-items:center;gap:11px;font-weight:700;color:var(--ink);margin-bottom:12px}
  .card h3{margin:0 0 8px;color:var(--ink);font-family:var(--serif);font-size:1.12rem;font-weight:700}
  .card p{margin:0;color:var(--body)}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .grid2 .card{margin:0}
  .kv{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line)}
  .kv:last-child{border-bottom:0}
  .kv span{color:var(--muted);display:inline-flex;align-items:center;gap:6px;font-size:.92rem}
  .kv b{color:var(--ink);font-variant-numeric:tabular-nums;text-align:end;letter-spacing:.01em}
  .kv b.code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--accent-soft);color:var(--accent-dk);
    padding:3px 10px;border-radius:8px;font-weight:700}
  .kv b.code .soft{background:none;padding:0;color:var(--muted)}
  .kv b.code:has(.soft){background:none;padding:0;font-family:var(--sans);font-weight:500}
  .mini{width:15px;height:15px}
  .soft{color:var(--muted);font-style:italic;font-weight:500;font-size:.86rem}

  /* Bilingual line items */
  .bi{display:flex;flex-direction:column;min-width:0}
  .bi .ar{font-weight:600;color:var(--ink)}
  .bi .en{font-size:.78rem;color:var(--muted);font-weight:500}

  /* Selector pill toggle */
  .seg-row{display:flex;justify-content:center;margin-bottom:16px}
  .seg-wrap{display:inline-flex;gap:4px;background:#e9e9ed;padding:5px;border-radius:999px;box-shadow:inset 0 1px 2px rgba(0,0,0,.05)}
  .seg{border:0;background:transparent;color:var(--muted);font-weight:700;font-size:.94rem;letter-spacing:.02em;padding:9px 28px;border-radius:999px;cursor:pointer;transition:.25s var(--ease)}
  .seg.on{background:#fff;color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.14),0 0 0 .5px rgba(0,0,0,.02)}
  .unit-card .kicker{display:inline-block;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:var(--accent);margin-bottom:6px}
  .unit-card .unit-name{margin:0 0 12px;color:var(--ink);font-family:var(--serif);font-size:1.34rem;font-weight:700;letter-spacing:-.01em}
  .unit-card .note{margin:12px 0 0;color:var(--muted);font-size:.92rem}

  /* Check-in steps (feature grid + accent tiles) */
  .way{margin:4px 0 18px}
  .steps{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .step{position:relative;background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px 15px;box-shadow:var(--sh);display:flex;flex-direction:column;gap:10px;transition:transform .3s var(--ease),box-shadow .3s var(--ease)}
  .step:hover{transform:translateY(-4px);box-shadow:var(--sh-lg)}
  .step .num{position:absolute;top:13px;inset-inline-end:14px;width:25px;height:25px;border-radius:50%;background:var(--accent);color:#fff;font-size:.8rem;font-weight:700;display:grid;place-items:center;font-variant-numeric:tabular-nums;box-shadow:0 4px 10px var(--accent-ring)}

  /* Accent gradient icon tiles */
  .tile-ic{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;color:#fff;flex:none;
    background:linear-gradient(150deg,color-mix(in srgb,var(--accent) 76%,#fff),var(--accent));
    box-shadow:inset 0 1px 2px rgba(255,255,255,.5),0 6px 16px rgba(17,20,24,.12)}
  .tile-ic .ic{width:22px;height:22px;filter:drop-shadow(0 1px 1px rgba(0,0,0,.18))}
  .access{margin-top:16px;border-inline-start:3px solid var(--accent)}

  /* Video — vertical Shorts get a light device frame */
  .video{position:relative;padding-top:56.25%;border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh-lg);background:#000}
  .video.vertical{max-width:330px;margin-inline:auto;padding-top:min(177.78%,586px);
    border-radius:44px;border:10px solid #fff;
    box-shadow:0 0 0 1px var(--line-2),0 34px 80px rgba(17,20,24,.2)}
  .video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  .video-el{width:100%;border-radius:var(--r-lg);box-shadow:var(--sh-lg);background:#000}

  /* Gallery — swipeable snap-scroll */
  .gal{display:grid;grid-auto-flow:column;grid-auto-columns:min(78%,420px);gap:14px;
    overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 2px 18px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .gal::-webkit-scrollbar{display:none}
  .gal-item{margin:0;scroll-snap-align:center;border-radius:var(--r-lg);overflow:hidden;
    border:1px solid var(--line);box-shadow:var(--sh-lg);background:#fff}
  .gal-item img{width:100%;aspect-ratio:4/3;object-fit:cover;transition:transform .6s var(--ease)}
  .gal-item:hover img{transform:scale(1.04)}

  /* Placeholders */
  .ph{background:#f3f3f5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--muted);border:1px dashed var(--line-2);text-align:center;padding:30px;aspect-ratio:16/10}
  .video-ph{border-radius:var(--r);padding:52px 24px;aspect-ratio:auto}
  .ph-ic{width:30px;height:30px;color:var(--faint)}

  /* Services */
  .svc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
  .svc{display:flex;align-items:center;gap:13px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;box-shadow:var(--sh);transition:transform .3s var(--ease),box-shadow .3s var(--ease)}
  .svc:hover{transform:translateY(-4px);box-shadow:var(--sh-lg)}

  /* Rules */
  .rules{list-style:none;margin:0;padding:0;display:grid;gap:10px}
  .rules li{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;box-shadow:var(--sh);position:relative;padding-inline-start:44px}
  .rules li::before{content:"";position:absolute;inset-inline-start:17px;top:50%;transform:translateY(-50%);width:9px;height:9px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px var(--accent-soft)}

  /* Nearby */
  .cat-list{list-style:none;margin:0;padding:0;display:grid;gap:2px}
  .cat-list li{padding:10px 0;border-bottom:1px solid var(--line)}
  .cat-list li:last-child{border-bottom:0}
  .cat-list a{display:flex;align-items:center;justify-content:space-between;gap:8px;text-decoration:none;color:inherit}
  .li-ic{width:17px;height:17px;color:var(--accent);flex:none}

  /* Contact */
  .contact .actions{display:flex;flex-direction:column;gap:12px;max-width:420px}
  .contact-line{display:inline-flex;align-items:center;gap:9px;margin-top:14px;color:var(--muted);text-decoration:none;font-size:.95rem;word-break:break-all}
  .contact-line .cl-ic{width:20px;height:20px;color:var(--accent);flex:none}
  .contact-line:hover{color:var(--ink)}
  .map-card{display:block;position:relative;margin:18px auto 0;max-width:520px;border-radius:var(--r-lg);overflow:hidden;border:1px solid var(--line);box-shadow:var(--sh-lg);text-decoration:none}
  .map-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;transition:transform .6s var(--ease)}
  .map-card:hover .map-img{transform:scale(1.03)}
  .map-cta{position:absolute;inset-inline:14px;bottom:14px;display:flex;align-items:center;justify-content:center;gap:9px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 72%,#fff),var(--accent));color:#fff;font-weight:700;font-size:.98rem;padding:13px 18px;border-radius:14px;box-shadow:0 12px 26px var(--accent-ring)}
  .map-cta .btn-ic{width:18px;height:18px}

  /* Floating glass action dock (mobile) */
  .dock{position:fixed;inset-inline:12px;bottom:12px;z-index:60;display:none;gap:10px;
    padding:10px;border-radius:26px;background:rgba(255,255,255,.78);
    -webkit-backdrop-filter:saturate(1.6) blur(20px);backdrop-filter:saturate(1.6) blur(20px);
    border:1px solid rgba(255,255,255,.65);box-shadow:var(--sh-lg)}
  .dock .btn{flex:1;padding:13px 14px;font-size:.92rem;white-space:nowrap}

  footer{text-align:center;color:var(--muted);font-size:.82rem;padding:40px 18px 50px;border-top:1px solid var(--line);margin-top:24px}
  footer .logo{filter:brightness(0);opacity:.45;max-height:46px;width:auto;margin:0 auto 12px}
  footer .fnote{font-family:var(--serif);letter-spacing:.03em}

  @media (max-width:560px){
    .dock{display:flex}
    body{padding-bottom:88px}
  }
  @media (max-width:430px){
    .grid2{grid-template-columns:1fr}
  }
  @media (prefers-reduced-motion:reduce){
    html{scroll-behavior:auto}
    .reveal,.up,.stagger>*{opacity:1!important;transform:none!important;transition:none!important;animation:none!important}
    .hero.hero--bg::before{animation:none}
    .plx{transform:none!important}
    .btn:hover,.svc:hover,.step:hover{transform:none}
    .gal-item:hover img,.map-card:hover .map-img{transform:none}
  }
</style>
</head>
<body>
${lnav}
${hero}
<main>
${video}
${checkin}
${location}
${highlights}
${selector}
${info}
${gallery}
${rules}
${nearby}
${help}
</main>
<div class="dock"><a class="btn" href="#video">${escapeHtml(t.cta)}</a>${waLink ? `<a class="btn wa" href="${waLink}" target="_blank" rel="noopener">${icon("whatsapp", "btn-ic")} ${escapeHtml(t.navContact)}</a>` : ""}</div>
<footer>${logo}<div class="fnote">${escapeHtml(brandName)} · ${escapeHtml(apartment.apartment_name)}</div></footer>
<script>
(function(){
  var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveals (sections + staggered grids).
  var els=document.querySelectorAll('.reveal,.stagger');
  if('IntersectionObserver' in window && !rm){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.1});
    els.forEach(function(el){io.observe(el);});
  } else { els.forEach(function(el){el.classList.add('in');}); }

  // Glass local-nav: show after the hero; scroll-spy the section links.
  var nav=document.getElementById('lnav');
  var hero=document.querySelector('.hero');
  function onScroll(){
    if(nav){var on=(window.scrollY||0)>((hero?hero.offsetHeight:520)-120);nav.classList.toggle('show',on);nav.setAttribute('aria-hidden',on?'false':'true');}
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  if(nav&&'IntersectionObserver' in window){
    var links={};nav.querySelectorAll('a[href^="#"]').forEach(function(a){links[a.getAttribute('href').slice(1)]=a;});
    var spy=new IntersectionObserver(function(es){es.forEach(function(e){
      var l=links[e.target.id];if(!l||!e.isIntersecting)return;
      Object.keys(links).forEach(function(k){links[k].classList.remove('on');});l.classList.add('on');
    });},{rootMargin:'-38% 0px -55% 0px'});
    Object.keys(links).forEach(function(id){var s=document.getElementById(id);if(s)spy.observe(s);});
  }

  // Soft parallax on the hero showcase.
  var plx=document.querySelector('.showcase .plx');
  if(plx&&!rm){
    var tick=false;
    addEventListener('scroll',function(){
      if(tick)return;tick=true;
      requestAnimationFrame(function(){
        var y=Math.min(window.scrollY||0,900);
        plx.style.transform='translateY('+(y*-0.06).toFixed(1)+'px)';
        tick=false;
      });
    },{passive:true});
  }

  // D1/D2 unit selector.
  var data=${unitData};
  function set(c){
    var d=data[c]; if(!d) return;
    document.querySelectorAll('.seg').forEach(function(b){b.classList.toggle('on', b.dataset.code===c);});
    var m={'u-name':d.name,'u-unit':d.unit,'u-entry':d.entry,'u-note':d.note,'u-wifi-name':d.wifiName,'u-wifi-pass':d.wifiPass};
    Object.keys(m).forEach(function(id){var el=document.getElementById(id); if(el) el.innerHTML=m[id];});
  }
  document.querySelectorAll('.seg').forEach(function(b){b.addEventListener('click',function(){set(b.dataset.code);});});
})();
</script>
</body>
</html>`;
}
