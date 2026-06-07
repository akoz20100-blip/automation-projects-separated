/**
 * Dimora guest-guide landing page — premium boutique-hospitality experience.
 * Mobile-first, RTL Arabic-first, server-rendered HTML + inline CSS (no
 * framework, no build step, NO external fonts). Linked from guest WhatsApp
 * messages. Aesthetic: refined, warm, editorial — system serif display +
 * earth-toned palette, subtle grain, staggered reveals.
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

const COPY = {
  ar: {
    dir: "rtl",
    cta: "شاهد فيديو الدخول",
    selector: "اختر شقتك",
    checkinTitle: "تعليمات الدخول",
    howToEnter: "طريقة الدخول للشقة",
    videoTitle: "فيديو طريقة الدخول",
    videoDesc: "شاهد الخطوات قبل الوصول لتسهيل الدخول.",
    videoFallback: "سيتم إضافة فيديو الدخول هنا",
    infoTitle: "معلومات الشقة",
    wifi: "الواي فاي",
    wifiName: "اسم الشبكة",
    wifiPass: "كلمة السر",
    checkIn: "وقت الدخول",
    checkOut: "وقت الخروج",
    services: "الخدمات والمزايا",
    rulesTitle: "إرشادات الإقامة",
    nearbyTitle: "حولك في حي لبن",
    helpTitle: "تحتاج مساعدة؟",
    helpDesc: "نحن في خدمتك على مدار الساعة.",
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
  },
  en: {
    dir: "ltr",
    cta: "Watch the check-in video",
    selector: "Choose your apartment",
    checkinTitle: "Check-in Instructions",
    howToEnter: "How to enter",
    videoTitle: "Check-in Video",
    videoDesc: "Watch the steps before arrival for an easier check-in.",
    videoFallback: "The check-in video will be added here",
    infoTitle: "Apartment Information",
    wifi: "Wi-Fi",
    wifiName: "Network",
    wifiPass: "Password",
    checkIn: "Check-in time",
    checkOut: "Check-out time",
    services: "Services & Amenities",
    rulesTitle: "Stay Guidelines",
    nearbyTitle: "Around You in Laban",
    helpTitle: "Need Help?",
    helpDesc: "We are here for you around the clock.",
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
  whatsapp: '<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Z"/><path d="M8.5 8.5c0 4 3 6.5 6.5 6.5.7 0 1-.4 1-1l-.3-1.4-1.7-.6-.9 1c-1.2-.5-2.1-1.4-2.6-2.6l1-.9-.6-1.7L9.5 7.5c-.6 0-1 .3-1 1Z"/>',
  pin: '<path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
};

const icon = (name: string, cls = "ic") =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ""}</svg>`;

/** A media block: image if a URL exists, else an elegant placeholder. */
function media(url: string, alt: string, placeholder: string, cls: string): string {
  if (url) {
    return `<img class="${cls}" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">`;
  }
  return `<div class="${cls} ph" role="img" aria-label="${escapeHtml(alt)}">${icon("pin", "ph-ic")}<span>${escapeHtml(placeholder)}</span></div>`;
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
  const wayImg = guide.media.wayfindingImageUrl || apartment.entrance_photo_url || "";
  const videoUrl = guide.media.videoUrl || apartment.video_url || "";
  const checkInTime = apartment.default_check_in_time || guide.checkInTime;
  const checkOutTime = apartment.default_check_out_time || guide.checkOutTime;

  // ---- Section 1: Hero ----
  const logo = guide.brand.logoUrl
    ? `<img class="logo" src="${escapeHtml(guide.brand.logoUrl)}" alt="${escapeHtml(brandName)}">`
    : `<span class="wordmark">${escapeHtml(guide.brand.nameEn)}</span>`;
  const hero = `
  <header class="hero" ${heroImg ? `style="background-image:linear-gradient(180deg,rgba(28,34,28,.18) 0%,rgba(28,34,28,.30) 45%,rgba(24,30,24,.78) 100%),url('${escapeHtml(heroImg)}')"` : ""}>
    <div class="grain"></div>
    <div class="hero-top up" style="--d:.05s">${logo}<span class="kicker">${escapeHtml(pick(lang, guide.brand.headerAr, guide.brand.headerEn))}</span></div>
    <div class="hero-mid">
      <span class="eyebrow up" style="--d:.15s">${escapeHtml(t.eyebrow)}</span>
      <h1 class="up" style="--d:.25s">${escapeHtml(pick(lang, guide.brand.welcomeAr, guide.brand.welcomeEn))}</h1>
      <p class="up" style="--d:.38s">${escapeHtml(pick(lang, guide.brand.subtitleAr, guide.brand.subtitleEn))}</p>
      <a class="btn up" style="--d:.5s" href="#video">${escapeHtml(t.cta)} ${icon("chevron", "btn-ic")}</a>
    </div>
  </header>`;

  // ---- Section 2: Apartment selector ----
  const selBtn = (c: ApartmentCode) =>
    `<button type="button" class="seg${c === code ? " on" : ""}" data-code="${c}">${escapeHtml(guide.apartments[c].nameEn)}</button>`;
  const selector = `
  <section class="wrap reveal" aria-label="${escapeHtml(t.selector)}">
    <div class="seg-wrap">${selBtn("D1")}${selBtn("D2")}</div>
    <div class="card unit-card">
      <h2 class="unit-name" id="u-name">${escapeHtml(pick(lang, unit.nameAr, unit.nameEn))}</h2>
      <div class="kv"><span>${escapeHtml(t.unit)}</span><b id="u-unit">${escapeHtml(pick(lang, unit.unitAr, unit.unitEn))}</b></div>
      <div class="kv"><span>${escapeHtml(t.entry)}</span><b id="u-entry">${unit.entryCode ? escapeHtml(unit.entryCode) : `<i class="soft">${escapeHtml(t.entrySoon)}</i>`}</b></div>
      <p class="note" id="u-note">${escapeHtml(pick(lang, unit.noteAr, unit.noteEn))}</p>
    </div>
  </section>`;

  // ---- Section 3: Check-in instructions ----
  const stepCards = guide.steps
    .map(
      (s, i) =>
        `<div class="step"><span class="num">${i + 1}</span>${icon(s.icon)}${bi(s.ar, s.en)}</div>`,
    )
    .join("");
  const accessBody = apartment.access_guideline
    ? `<div class="card access"><h3>${escapeHtml(t.howToEnter)}</h3><p>${escapeHtml(apartment.access_guideline).replace(/\n/g, "<br>")}</p></div>`
    : "";
  const checkin = `
  <section id="checkin" class="wrap reveal">
    <h2 class="sec-title">${icon("door", "sec-ic")} ${bi(COPY.ar.checkinTitle, COPY.en.checkinTitle)}</h2>
    <figure class="way">${media(wayImg, pick(lang, "صورة توضيح المدخل والمواقف", "Entrance & parking guide"), t.imgSoon, "way-img")}</figure>
    <div class="steps">${stepCards}</div>
    ${accessBody}
  </section>`;

  // ---- Section 4: Check-in video ----
  const embed = videoUrl ? toEmbedUrl(videoUrl) : null;
  let videoBody: string;
  const isVertical = /youtube\.com\/shorts\//i.test(videoUrl);
  if (embed) {
    videoBody = `<div class="video${isVertical ? " vertical" : ""}"><iframe src="${embed}" title="${escapeHtml(t.videoTitle)}" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  } else if (videoUrl && /\.mp4(\?|$)/i.test(videoUrl)) {
    videoBody = `<video class="video-el" controls preload="metadata" playsinline ${guide.media.videoPoster ? `poster="${escapeHtml(guide.media.videoPoster)}"` : ""}><source src="${escapeHtml(videoUrl)}" type="video/mp4"></video>`;
  } else if (videoUrl) {
    videoBody = `<p><a class="btn ghost" href="${escapeHtml(videoUrl)}" target="_blank" rel="noopener">${escapeHtml(t.videoTitle)}</a></p>`;
  } else {
    videoBody = `<div class="video-ph ph">${icon("play", "ph-ic")}<span>${escapeHtml(t.videoFallback)}</span></div>`;
  }
  const video = `
  <section id="video" class="wrap reveal">
    <h2 class="sec-title">${icon("play", "sec-ic")} ${bi(COPY.ar.videoTitle, COPY.en.videoTitle)}</h2>
    <p class="sec-desc">${escapeHtml(pick(lang, COPY.ar.videoDesc, COPY.en.videoDesc))}</p>
    ${videoBody}
  </section>`;

  // ---- Section 5: Apartment information ----
  const serviceCards = guide.services
    .map((s) => `<div class="svc">${icon(s.icon, "svc-ic")}${bi(s.ar, s.en)}</div>`)
    .join("");
  const info = `
  <section class="wrap reveal">
    <h2 class="sec-title">${icon("building", "sec-ic")} ${bi(COPY.ar.infoTitle, COPY.en.infoTitle)} <span class="apt-name">· ${escapeHtml(apartment.apartment_name)}</span></h2>
    <div class="grid2">
      <div class="card wifi">
        <div class="card-h">${icon("wifi", "card-ic")}<span>${escapeHtml(t.wifi)}</span></div>
        <div class="kv"><span>${escapeHtml(t.wifiName)}</span><b id="u-wifi-name">${escapeHtml(unit.wifiName || guide.wifi.name)}</b></div>
        <div class="kv"><span>${escapeHtml(t.wifiPass)}</span><b id="u-wifi-pass">${escapeHtml(unit.wifiPassword || guide.wifi.password)}</b></div>
      </div>
      <div class="card times">
        <div class="kv"><span>${icon("clock", "mini")} ${escapeHtml(t.checkIn)}</span><b>${escapeHtml(checkInTime)}</b></div>
        <div class="kv"><span>${icon("clock", "mini")} ${escapeHtml(t.checkOut)}</span><b>${escapeHtml(checkOutTime)}</b></div>
      </div>
    </div>
    <h3 class="sub">${escapeHtml(t.services)}</h3>
    <div class="svc-grid">${serviceCards}</div>
    ${apartment.building_info ? `<div class="card"><h3>${escapeHtml(t.buildingInfo)}</h3><p>${escapeHtml(apartment.building_info).replace(/\n/g, "<br>")}</p></div>` : ""}
  </section>`;

  // ---- Section 6: House rules ----
  const ruleCards = guide.rules.map((r) => `<li>${bi(r.ar, r.en)}</li>`).join("");
  const rules = `
  <section class="wrap reveal">
    <h2 class="sec-title">${icon("key", "sec-ic")} ${bi(COPY.ar.rulesTitle, COPY.en.rulesTitle)}</h2>
    <ul class="rules">${ruleCards}</ul>
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
      return `<div class="card cat"><div class="card-h">${icon(c.icon, "card-ic")}<span>${escapeHtml(pick(lang, c.titleAr, c.titleEn))}</span></div><ul class="cat-list">${items}</ul></div>`;
    })
    .join("");
  const nearby = `
  <section class="wrap reveal">
    <h2 class="sec-title">${icon("pin", "sec-ic")} ${bi(COPY.ar.nearbyTitle, COPY.en.nearbyTitle)}</h2>
    <div class="cats">${cats}</div>
  </section>`;

  // ---- Section 8: Contact / help ----
  const waBtn = guide.whatsapp
    ? `<a class="btn wa" href="https://wa.me/${escapeHtml(guide.whatsapp.replace(/[^\d]/g, ""))}" target="_blank" rel="noopener">${icon("whatsapp", "btn-ic")} ${escapeHtml(t.whatsapp)}</a>`
    : `<div class="btn wa disabled" aria-disabled="true">${icon("whatsapp", "btn-ic")} ${escapeHtml(t.whatsappSoon)}</div>`;
  const maint = apartment.maintenance_contact_phone
    ? `<a class="btn ghost" href="tel:${escapeHtml(apartment.maintenance_contact_phone)}">${icon("phone", "btn-ic")} ${escapeHtml(t.maintenance)}</a>`
    : "";
  const help = `
  <section class="wrap reveal contact">
    <h2 class="sec-title">${icon("phone", "sec-ic")} ${bi(COPY.ar.helpTitle, COPY.en.helpTitle)}</h2>
    <p class="sec-desc">${escapeHtml(pick(lang, COPY.ar.helpDesc, COPY.en.helpDesc))}</p>
    <div class="actions">${waBtn}${maint}</div>
  </section>`;

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

  const primary = escapeHtml(env.landing.brandPrimaryColor || "#2E5D4F");
  const cream = escapeHtml(env.landing.brandSecondaryColor || "#F6F1E7");

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" content="${primary}">
<title>${escapeHtml(brandName)} — ${escapeHtml(apartment.apartment_name)}</title>
<style>
${FONT_CSS}
  :root{
    --green:${primary};--cream:${cream};
    --beige:#EADFC9;--wood:#9A6B43;--wood-dk:#835636;--terra:#C2703D;--navy:#21384F;
    --ink:#2B2B26;--muted:#7A7264;--card:#FFFDF8;--line:#E7DDC9;
    --serif:"Thmanyah Serif Display","Iowan Old Style",Palatino,"Noto Naskh Arabic",Georgia,serif;
    --sans:"Thmanyah Sans",system-ui,-apple-system,"Segoe UI","Noto Sans Arabic",Tahoma,Arial,sans-serif;
    --ease:cubic-bezier(.16,1,.3,1);
    --r:24px;--r-lg:30px;--sh:0 14px 40px rgba(60,46,28,.13);--sh-sm:0 2px 12px rgba(60,46,28,.07);
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;background:var(--cream);color:var(--ink);line-height:1.65;font-family:var(--sans);
    -webkit-font-smoothing:antialiased;
    background-image:radial-gradient(circle at 12% -5%,rgba(46,93,79,.06),transparent 42%),
                     radial-gradient(circle at 95% 8%,rgba(194,112,61,.06),transparent 40%)}
  img{max-width:100%}
  .wrap{max-width:680px;margin:0 auto;padding:30px 18px}
  .reveal{opacity:0;transform:translateY(20px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
  .reveal.in{opacity:1;transform:none}

  /* Grain texture overlay */
  .grain{position:absolute;inset:0;pointer-events:none;opacity:.5;mix-blend-mode:overlay;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")}

  /* Hero */
  .hero{position:relative;min-height:88vh;display:flex;flex-direction:column;justify-content:space-between;
    padding:24px 20px calc(40px + env(safe-area-inset-bottom));color:#fff;overflow:hidden;
    background:#33433a center/cover no-repeat}
  .hero>*{position:relative;z-index:1}
  .hero-top{display:flex;align-items:center;gap:13px;flex-wrap:wrap}
  .hero .logo{max-height:44px}
  .wordmark{font-family:var(--serif);font-size:1.4rem;font-weight:600;letter-spacing:.42em;padding-inline-start:4px}
  .kicker{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;opacity:.95;
    background:rgba(255,255,255,.14);padding:6px 13px;border-radius:999px;border:1px solid rgba(255,255,255,.22)}
  .hero-mid{max-width:560px}
  .eyebrow{display:inline-block;font-size:.74rem;letter-spacing:.28em;text-transform:uppercase;
    color:#e9dcc4;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid rgba(233,220,196,.4)}
  .hero h1{font-family:var(--serif);font-size:clamp(2.3rem,8vw,3.4rem);margin:0 0 12px;font-weight:700;
    line-height:1.12;letter-spacing:-.01em;text-shadow:0 2px 24px rgba(0,0,0,.32)}
  .hero p{font-size:1.12rem;opacity:.96;margin:0 0 26px;max-width:30ch;text-shadow:0 1px 12px rgba(0,0,0,.4)}

  /* Load reveal (above the fold) */
  .up{opacity:0;transform:translateY(22px);animation:up .9s var(--ease) forwards;animation-delay:var(--d,0s)}
  @keyframes up{to{opacity:1;transform:none}}

  /* Buttons */
  .btn{display:inline-flex;align-items:center;gap:9px;background:var(--wood);color:#fff;text-decoration:none;
    font-weight:600;font-size:1rem;padding:15px 26px;border-radius:999px;border:0;cursor:pointer;
    box-shadow:0 6px 20px rgba(131,86,54,.32);transition:transform .25s ease,box-shadow .25s ease,background .2s}
  .btn:hover{transform:translateY(-2px);background:var(--wood-dk);box-shadow:0 10px 26px rgba(131,86,54,.4)}
  .btn .btn-ic{width:18px;height:18px}
  html[dir=rtl] .btn .btn-ic{transform:scaleX(-1)}
  .btn.ghost{background:transparent;color:var(--green);border:1.5px solid var(--green);box-shadow:none}
  .btn.ghost:hover{background:rgba(46,93,79,.08)}
  .btn.wa{background:#1f9d57;box-shadow:0 6px 20px rgba(31,157,87,.3)}
  .btn.wa.disabled{background:#cfc6b4;color:#fff;cursor:default;box-shadow:none}

  /* Section titles */
  .sec-title{display:flex;align-items:center;gap:11px;flex-wrap:wrap;font-family:var(--serif);
    font-size:1.5rem;font-weight:700;margin:0 0 8px;color:var(--navy);letter-spacing:-.01em}
  .sec-ic{width:26px;height:26px;color:var(--green);flex:none}
  .apt-name{font-family:var(--sans);font-size:.92rem;color:var(--muted);font-weight:500}
  .sec-desc{color:var(--muted);margin:0 0 20px}
  .sub{font-family:var(--serif);font-size:1.18rem;color:var(--green);margin:26px 0 14px}

  /* Cards */
  .card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px;
    margin:14px 0;box-shadow:var(--sh-sm)}
  .card-h{display:flex;align-items:center;gap:9px;font-weight:700;color:var(--green);margin-bottom:10px}
  .card-ic{width:22px;height:22px;flex:none}
  .card h3{margin:0 0 8px;color:var(--navy);font-family:var(--serif);font-size:1.12rem;font-weight:600}
  .card p{margin:0;color:var(--ink)}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .kv{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-bottom:1px dashed var(--line)}
  .kv:last-child{border-bottom:0}
  .kv span{color:var(--muted);display:inline-flex;align-items:center;gap:6px;font-size:.93rem}
  .kv b{color:var(--ink);font-variant-numeric:tabular-nums;text-align:end;letter-spacing:.02em}
  .mini{width:15px;height:15px}
  .soft{color:var(--muted);font-style:italic;font-weight:500;font-size:.88rem}

  /* Bilingual */
  .bi{display:flex;flex-direction:column}
  .bi .ar{font-weight:600}
  .bi .en{font-size:.8rem;color:var(--muted);font-weight:500;letter-spacing:.01em}

  /* Selector */
  .seg-wrap{display:flex;gap:6px;background:var(--beige);padding:6px;border-radius:999px;width:fit-content;margin:0 auto 18px;box-shadow:inset 0 1px 3px rgba(60,46,28,.08)}
  .seg{border:0;background:transparent;color:var(--muted);font-weight:700;font-size:.95rem;letter-spacing:.06em;padding:10px 30px;border-radius:999px;cursor:pointer;transition:.25s}
  .seg.on{background:var(--card);color:var(--green);box-shadow:var(--sh-sm)}
  .unit-card .unit-name{margin:0 0 12px;color:var(--navy);font-family:var(--serif);font-size:1.3rem;font-weight:600}
  .unit-card .note{margin:12px 0 0;color:var(--muted);font-size:.92rem}

  /* Check-in */
  .way{margin:16px 0 18px}
  .way-img{width:100%;border-radius:var(--r-lg);display:block;box-shadow:var(--sh);border:1px solid var(--line);aspect-ratio:4/3;object-fit:cover}
  .steps{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .step{position:relative;background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px 15px;box-shadow:var(--sh-sm);display:flex;flex-direction:column;gap:9px;transition:transform .25s ease,box-shadow .25s ease}
  .step:hover{transform:translateY(-3px);box-shadow:var(--sh)}
  .step .ic{width:28px;height:28px;color:var(--terra)}
  .step .num{position:absolute;top:12px;inset-inline-end:14px;width:25px;height:25px;border-radius:50%;background:var(--green);color:#fff;font-size:.8rem;font-weight:700;display:grid;place-items:center;font-variant-numeric:tabular-nums}
  .access{margin-top:16px;border-inline-start:4px solid var(--terra)}

  /* Video */
  .video{position:relative;padding-top:56.25%;border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh)}
  .video.vertical{max-width:340px;margin-inline:auto;padding-top:min(177.78%,604px)}
  .video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  .video-el{width:100%;border-radius:var(--r-lg);box-shadow:var(--sh);display:block;background:#000}

  /* Placeholders */
  .ph{background:repeating-linear-gradient(135deg,#f1ebdd,#f1ebdd 12px,#ece4d3 12px,#ece4d3 24px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--muted);border:1px dashed #d8cdb6;text-align:center;padding:24px}
  .video-ph{border-radius:var(--r);padding:52px 24px}
  .way-img.ph{aspect-ratio:4/3}
  .ph-ic{width:32px;height:32px;color:var(--wood)}

  /* Services */
  .svc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
  .svc{display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 15px;box-shadow:var(--sh-sm);transition:transform .25s ease,box-shadow .25s ease}
  .svc:hover{transform:translateY(-3px);box-shadow:var(--sh)}
  .svc-ic{width:27px;height:27px;color:var(--green);flex:none}

  /* Rules */
  .rules{list-style:none;margin:0;padding:0;display:grid;gap:10px}
  .rules li{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;box-shadow:var(--sh-sm);position:relative;padding-inline-start:44px}
  .rules li::before{content:"";position:absolute;inset-inline-start:16px;top:50%;transform:translateY(-50%);width:9px;height:9px;border-radius:50%;background:var(--terra);box-shadow:0 0 0 4px rgba(194,112,61,.16)}

  /* Nearby */
  .cat-list{list-style:none;margin:0;padding:0;display:grid;gap:8px}
  .cat-list li{padding:9px 0;border-bottom:1px dashed var(--line)}
  .cat-list li:last-child{border-bottom:0}
  .cat-list a{display:flex;align-items:center;justify-content:space-between;gap:8px;text-decoration:none;color:inherit}
  .li-ic{width:17px;height:17px;color:var(--green);flex:none}

  /* Contact */
  .contact .actions{display:flex;flex-direction:column;gap:12px;max-width:420px}
  .contact .btn{justify-content:center}

  /* Floating quick action (mobile) */
  .fab{position:fixed;inset-inline:0;bottom:0;display:none;justify-content:center;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(246,241,231,0),var(--cream) 38%);z-index:50}
  .fab .btn{width:100%;max-width:520px;justify-content:center}

  footer{text-align:center;color:var(--muted);font-size:.82rem;padding:30px 18px 44px;font-family:var(--serif);letter-spacing:.04em}

  @media (max-width:430px){
    .grid2{grid-template-columns:1fr}
    .fab{display:flex}
    body{padding-bottom:76px}
  }
  @media (prefers-reduced-motion:reduce){
    html{scroll-behavior:auto}
    .reveal,.up{opacity:1!important;transform:none!important;transition:none!important;animation:none!important}
    .btn:hover,.svc:hover,.step:hover{transform:none}
  }
</style>
</head>
<body>
${hero}
<main>
${video}
${selector}
${checkin}
${info}
${rules}
${nearby}
${help}
</main>
<div class="fab"><a class="btn" href="#video">${escapeHtml(t.cta)}</a></div>
<footer>${escapeHtml(brandName)} · ${escapeHtml(apartment.apartment_name)}</footer>
<script>
(function(){
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
    els.forEach(function(el){io.observe(el);});
  } else { els.forEach(function(el){el.classList.add('in');}); }

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
