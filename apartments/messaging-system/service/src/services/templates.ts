/**
 * Message rendering + WhatsApp template parameter mapping.
 *
 * The free-form strings below mirror ../../templates/message_templates.json
 * (the documented source of truth). They are used directly for `manual_link`
 * mode and to PREVIEW the text. For `cloud_api` mode, WhatsApp uses positional
 * template parameters ({{1}}, {{2}}, ...) — `buildTemplateParams` maps the named
 * placeholders to those positions, kept in sync with whatsapp-templates.md.
 */

import type { Apartment, Language, MessageType, NotifyType, Reservation } from "../types.js";
import { env } from "../config/env.js";

/**
 * Internal notification templates (owner / cleaner), Arabic — these recipients
 * are the host's own team. Sent as free-form text (WasenderAPI / wa.me), so no
 * Meta template approval is required.
 */
export const NOTIFY_TEMPLATES: Record<NotifyType, string> = {
  owner_new:
    "📥 حجز جديد\nالعميل: {{guest_name}}\nالشقة: {{apartment_name}}\nالدخول: {{check_in_date}} {{check_in_time}}\nالخروج: {{check_out_date}} {{check_out_time}}\nجوال العميل: {{guest_phone}}",
  owner_checkout:
    "🔔 تذكير خروج بكرة\nالعميل {{guest_name}} يطلع من {{apartment_name}} بتاريخ {{check_out_date}} الساعة {{check_out_time}}.\nتابع جدول النظافة 🧹",
  owner_check:
    "❓ متابعة خروج\nهل طلع {{guest_name}} من {{apartment_name}}؟\n(موعد الخروج كان اليوم الساعة {{check_out_time}})\nرد: طلع ✅ / مدّد ⏰",
  cleaner_checkout:
    "🧹 تنظيف بكرة\nشقة {{apartment_name}} بتكون فاضية بعد خروج الضيف بتاريخ {{check_out_date}} الساعة {{check_out_time}}.\nنحتاج تجهيزها للضيف الجاي. شكراً 🤍",
};

type TemplateKey = `${MessageType}_${Language}`;

export const MESSAGE_TEMPLATES: Record<TemplateKey, string> = {
  access_ar:
    "أهلاً وسهلاً {{guest_name}} 🌟\nتم تأكيد حجزك في {{apartment_name}}، ويسعدنا استضافتك.\n\n📅 تاريخ الدخول: {{check_in_date}}\n🕒 وقت الدخول: {{check_in_time}}\n\n🔑 طريقة الدخول:\n{{access_guideline}}\n\n📲 دليل الدخول والمبنى (صورة المدخل وفيديو الشرح وكل التفاصيل):\n{{landing_url}}\n\nنتمنى لك إقامة سعيدة، وإذا احتجت أي شيء فنحن في خدمتك. 🌿",
  checkout_ar:
    "{{guest_name}}، نتمنى أن إقامتك في {{apartment_name}} كانت ممتعة 🌿\n\nتذكير ودّي بأن موعد تسجيل الخروج هو {{check_out_date}} الساعة {{check_out_time}}.\n\n✅ قبل المغادرة:\n{{checkout_guideline}}\n\nشكراً لاختيارك الإقامة معنا، ونسعد بعودتك دائماً. 🤍",
  review_ar:
    "{{guest_name}}، سعدنا كثيراً باستضافتك في {{apartment_name}} 🌟\n\nإذا كانت تجربتك جميلة، يشرّفنا تقييمك على Airbnb — رأيك يهمنا ويساعد ضيوفنا القادمين:\n{{airbnb_review_url}}\n\nشكراً لك، ونتمنى لك يوماً سعيداً. 🤍",
  access_en:
    "Welcome {{guest_name}}! 🌟\nYour reservation at {{apartment_name}} is confirmed and we're delighted to host you.\n\n📅 Check-in date: {{check_in_date}}\n🕒 Check-in time: {{check_in_time}}\n\n🔑 How to enter:\n{{access_guideline}}\n\n📲 Building & access guide (entrance photo, how-to-enter video & full details):\n{{landing_url}}\n\nEnjoy your stay — we're here if you need anything. 🌿",
  checkout_en:
    "{{guest_name}}, we hope you enjoyed your stay at {{apartment_name}} 🌿\n\nA friendly reminder that checkout is on {{check_out_date}} at {{check_out_time}}.\n\n✅ Before you leave:\n{{checkout_guideline}}\n\nThank you for staying with us — you're always welcome back. 🤍",
  review_en:
    "{{guest_name}}, it was a pleasure hosting you at {{apartment_name}} 🌟\n\nIf you enjoyed your stay, we'd be grateful for your Airbnb review — it really helps:\n{{airbnb_review_url}}\n\nThank you, and have a wonderful day. 🤍",
};

/** Build the public landing-page URL for an apartment. */
export function landingUrl(apartmentId: string, lang: Language): string {
  const base = env.landing.baseUrl.replace(/\/$/, "");
  return `${base}/api/landing/${encodeURIComponent(apartmentId)}?lang=${lang}`;
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

/** Variables available to every template, derived from reservation + apartment. */
export function templateVars(
  reservation: Reservation,
  apartment: Apartment,
): Record<string, string> {
  const lang = reservation.guest_language;
  return {
    guest_name: reservation.guest_name,
    apartment_name: reservation.apartment_name || apartment.apartment_name,
    check_in_date: reservation.check_in_date,
    check_out_date: reservation.check_out_date,
    check_in_time: reservation.check_in_time || apartment.default_check_in_time,
    check_out_time: reservation.check_out_time || apartment.default_check_out_time,
    access_guideline: apartment.access_guideline || "",
    checkout_guideline: apartment.checkout_guideline || "",
    airbnb_review_url:
      reservation.airbnb_review_url || apartment.airbnb_review_url || "https://airbnb.com/",
    landing_url: landingUrl(reservation.apartment_id, lang),
    guest_phone: reservation.guest_phone,
  };
}

/** Render the full free-form message text for preview / manual_link mode. */
export function renderText(
  type: MessageType,
  reservation: Reservation,
  apartment: Apartment,
): string {
  const lang = reservation.guest_language;
  const key = `${type}_${lang}` as TemplateKey;
  return fill(MESSAGE_TEMPLATES[key], templateVars(reservation, apartment));
}

/** Render an internal owner/cleaner notification (Arabic free-form text). */
export function renderNotify(
  type: NotifyType,
  reservation: Reservation,
  apartment: Apartment,
): string {
  return fill(NOTIFY_TEMPLATES[type], templateVars(reservation, apartment));
}

/** Resolve the approved WhatsApp template name for a type + language. */
export function templateName(type: MessageType, lang: Language): string {
  return env.whatsapp.templates[type][lang];
}

/**
 * Ordered body parameters for the WhatsApp template, matching the positional
 * {{1}}..{{n}} placeholders defined in whatsapp-templates.md.
 *
 * The landing/review link is passed as a plain text body parameter (not a
 * dynamic URL button) to avoid Meta's same-base-domain constraint on buttons
 * and to keep a single approvable template per apartment.
 */
export function bodyParams(
  type: MessageType,
  reservation: Reservation,
  apartment: Apartment,
): string[] {
  const v = templateVars(reservation, apartment);
  switch (type) {
    case "access":
      // {{1}}=guest_name {{2}}=apartment_name {{3}}=check_in_date
      // {{4}}=check_in_time {{5}}=access_guideline {{6}}=landing_url
      return [
        v.guest_name!,
        v.apartment_name!,
        v.check_in_date!,
        v.check_in_time!,
        v.access_guideline!,
        v.landing_url!,
      ];
    case "checkout":
      // {{1}}=guest_name {{2}}=apartment_name {{3}}=check_out_date
      // {{4}}=check_out_time {{5}}=checkout_guideline
      return [v.guest_name!, v.apartment_name!, v.check_out_date!, v.check_out_time!, v.checkout_guideline!];
    case "review":
      // {{1}}=guest_name {{2}}=apartment_name {{3}}=airbnb_review_url
      return [v.guest_name!, v.apartment_name!, v.airbnb_review_url!];
  }
}
