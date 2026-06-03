/**
 * Renders a lightweight, mobile-first, brand-themeable guide page per apartment.
 * Contains: entrance photo, an embedded "how to enter" video, building info and
 * access/checkout instructions. No framework, no build step — a single HTML
 * string the WhatsApp message links to.
 */

import { env } from "../config/env.js";
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
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

const COPY: Record<Language, Record<string, string>> = {
  ar: {
    dir: "rtl",
    access: "طريقة الدخول",
    checkout: "إرشادات الخروج",
    building: "معلومات العمارة",
    video: "فيديو شرح طريقة الدخول",
    entrance: "مدخل العمارة",
    maintenance: "للطوارئ والصيانة",
    welcome: "أهلاً بك",
  },
  en: {
    dir: "ltr",
    access: "How to enter",
    checkout: "Checkout instructions",
    building: "Building information",
    video: "How-to-enter video",
    entrance: "Building entrance",
    maintenance: "Maintenance & emergencies",
    welcome: "Welcome",
  },
};

function section(title: string, body: string): string {
  if (!body) return "";
  return `<section class="card"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body).replace(/\n/g, "<br>")}</p></section>`;
}

export function renderLandingPage(apartment: Apartment, lang: Language): string {
  const t = COPY[lang];
  const embed = apartment.video_url ? toEmbedUrl(apartment.video_url) : null;
  const logo = env.landing.brandLogoUrl
    ? `<img class="logo" src="${escapeHtml(env.landing.brandLogoUrl)}" alt="logo">`
    : "";

  const entrance = apartment.entrance_photo_url
    ? `<figure class="card"><img src="${escapeHtml(apartment.entrance_photo_url)}" alt="${escapeHtml(t.entrance!)}" loading="lazy"><figcaption>${escapeHtml(t.entrance!)}</figcaption></figure>`
    : "";

  const video = embed
    ? `<section class="card"><h2>${escapeHtml(t.video!)}</h2><div class="video"><iframe src="${embed}" title="${escapeHtml(t.video!)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div></section>`
    : apartment.video_url
      ? `<section class="card"><h2>${escapeHtml(t.video!)}</h2><p><a href="${escapeHtml(apartment.video_url)}" target="_blank" rel="noopener">${escapeHtml(t.video!)}</a></p></section>`
      : "";

  const maintenance = apartment.maintenance_contact_phone
    ? `<section class="card"><h2>${escapeHtml(t.maintenance!)}</h2><p><a href="tel:${escapeHtml(apartment.maintenance_contact_phone)}">${escapeHtml(apartment.maintenance_contact_phone)}</a></p></section>`
    : "";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(apartment.apartment_name)}</title>
<style>
  :root{
    --brand-primary:${escapeHtml(env.landing.brandPrimaryColor)};
    --brand-secondary:${escapeHtml(env.landing.brandSecondaryColor)};
    --ink:#1f2421; --muted:#5c6660; --card:#ffffff;
  }
  *{box-sizing:border-box}
  body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Tahoma,Arial,sans-serif;
    background:var(--brand-secondary);color:var(--ink);line-height:1.6}
  header{background:var(--brand-primary);color:#fff;padding:22px 16px;text-align:center}
  header .logo{max-height:46px;margin-bottom:10px;display:inline-block}
  header h1{margin:0;font-size:1.25rem}
  main{max-width:560px;margin:0 auto;padding:16px}
  .card{background:var(--card);border-radius:14px;padding:16px;margin:14px 0;
    box-shadow:0 1px 4px rgba(0,0,0,.06)}
  .card h2{margin:0 0 8px;font-size:1.05rem;color:var(--brand-primary)}
  .card img{width:100%;border-radius:10px;display:block}
  figure{margin:14px 0}figcaption{margin-top:8px;color:var(--muted);font-size:.9rem;text-align:center}
  .video{position:relative;padding-top:56.25%}
  .video iframe{position:absolute;inset:0;width:100%;height:100%;border-radius:10px}
  a{color:var(--brand-primary)}
  footer{text-align:center;color:var(--muted);font-size:.8rem;padding:18px}
</style>
</head>
<body>
<header>${logo}<h1>${escapeHtml(t.welcome!)} — ${escapeHtml(apartment.apartment_name)}</h1></header>
<main>
  ${entrance}
  ${video}
  ${section(t.access!, apartment.access_guideline ?? "")}
  ${section(t.building!, apartment.building_info ?? "")}
  ${section(t.checkout!, apartment.checkout_guideline ?? "")}
  ${maintenance}
</main>
<footer>${escapeHtml(apartment.apartment_name)}</footer>
</body>
</html>`;
}
