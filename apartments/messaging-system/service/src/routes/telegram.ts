/**
 * Telegram intake bot webhook: POST /api/telegram/webhook
 *
 * Flow: the owner forwards an Airbnb booking screenshot (optionally with a
 * "D1"/"D2" caption) -> OCR -> append a row to the Reservations sheet -> reply
 * with a summary, the guest landing link, and a ready-to-forward WhatsApp link.
 *
 * Security: at setWebhook time Telegram is given a secret token which it returns
 * in the `X-Telegram-Bot-Api-Secret-Token` header; we verify it. The bot can be
 * further restricted to known chat IDs via TELEGRAM_ALLOWED_CHAT_IDS.
 */

import { Router, type Request, type Response } from "express";
import { env } from "../config/env.js";
import { extractFromImages } from "../services/ocr.js";
import { appendReservation } from "../services/sheets.js";
import { tgSendMessage, downloadTelegramPhoto } from "../services/telegram.js";
import { guide, resolveCode } from "../data/guestGuide.js";
import { buildWaLink } from "../services/whatsapp.js";
import type { Language, Reservation } from "../types.js";

export const telegramRouter = Router();

interface TgPhoto {
  file_id: string;
  file_size?: number;
  width?: number;
}
interface TgMessage {
  message_id: number;
  chat: { id: number };
  text?: string;
  caption?: string;
  photo?: TgPhoto[];
}
interface TgUpdate {
  update_id?: number;
  message?: TgMessage;
  edited_message?: TgMessage;
}

/** Map a screenshot caption to an apartment id (defaults when unspecified). */
export function pickApartmentId(caption?: string): { id: string; explicit: boolean } {
  const c = (caption || "").toLowerCase();
  if (/apt_?0?2|d\s*2|الثاني|جناح|suite/.test(c)) return { id: "apt_02", explicit: true };
  if (/apt_?0?1|d\s*1|الأول|ستوديو|studio/.test(c)) return { id: "apt_01", explicit: true };
  return { id: env.telegram.defaultApartmentId, explicit: false };
}

/** Arabic name -> ar, otherwise en. Empty -> ar. */
export function detectLang(name: string): Language {
  if (!name) return "ar";
  return /[؀-ۿ]/.test(name) ? "ar" : "en";
}

/** Build a reservation id from the booking code, else a timestamp id. */
export function genReservationId(code: string | null): string {
  const base = (code || "").replace(/[^A-Za-z0-9]/g, "");
  return base || "R" + Date.now().toString(36).toUpperCase();
}

telegramRouter.post("/webhook", async (req: Request, res: Response) => {
  // Verify the secret token configured at setWebhook time.
  if (env.telegram.webhookSecret) {
    const got = req.header("x-telegram-bot-api-secret-token") ?? "";
    if (got !== env.telegram.webhookSecret) {
      res.status(401).json({ ok: false });
      return;
    }
  }

  const update = (req.body ?? {}) as TgUpdate;
  const msg = update.message ?? update.edited_message;
  if (!msg) {
    res.json({ ok: true });
    return;
  }

  const chatId = msg.chat.id;
  const allowed = env.telegram.allowedChatIds;
  if (allowed.length && !allowed.includes(String(chatId))) {
    await tgSendMessage(chatId, `عذراً، هذا البوت خاص.\nchat id الخاص بك: ${chatId}`);
    res.json({ ok: true });
    return;
  }

  try {
    if (msg.text && msg.text.trim().startsWith("/start")) {
      await tgSendMessage(
        chatId,
        "👋 أهلاً بك في بوت حجوزات ديمورا.\n\n" +
          "أرسل لقطة حجز Airbnb (صورة) 📸، وأضف في تعليق الصورة D1 أو D2 لتحديد الوحدة.\n" +
          "بقرأ اللقطة تلقائياً وأسجّل الحجز وأرجع لك ملخص + رابط صفحة الضيف.\n\n" +
          `chat id الخاص بك: ${chatId}`,
      );
      res.json({ ok: true });
      return;
    }

    if (!msg.photo || msg.photo.length === 0) {
      await tgSendMessage(chatId, "أرسل صورة لقطة الحجز 📸 (واكتب D1 أو D2 في تعليق الصورة).");
      res.json({ ok: true });
      return;
    }

    if (!env.ocr.apiKey) {
      await tgSendMessage(chatId, "⚠️ خدمة قراءة الصور (OCR) غير مفعّلة بعد — لازم إضافة OCR_API_KEY.");
      res.json({ ok: true });
      return;
    }

    await tgSendMessage(chatId, "📥 استلمت اللقطة، جاري القراءة…");

    // Largest rendition is the last photo size.
    const photo = msg.photo[msg.photo.length - 1];
    if (!photo) {
      await tgSendMessage(chatId, "ما قدرت أقرأ الصورة، حاول مرة ثانية.");
      res.json({ ok: true });
      return;
    }

    const img = await downloadTelegramPhoto(photo.file_id);
    const ocr = await extractFromImages([img]);

    const { id: apartmentId, explicit } = pickApartmentId(msg.caption);
    const code = resolveCode(apartmentId);
    const ga = guide.apartments[code];
    const lang = detectLang(ocr.extracted.guest_name || "");

    const reservation: Reservation = {
      reservation_id: genReservationId(ocr.extracted.reservation_code),
      source: ocr.extracted.source || "airbnb",
      apartment_id: apartmentId,
      apartment_name: ga.nameAr,
      guest_name: ocr.extracted.guest_name || "",
      guest_phone: ocr.extracted.guest_phone || "",
      guest_language: lang,
      check_in_date: ocr.extracted.check_in_date || "",
      check_out_date: ocr.extracted.check_out_date || "",
      check_in_time: ocr.extracted.check_in_time || guide.checkInTime,
      check_out_time: ocr.extracted.check_out_time || guide.checkOutTime,
      status: "confirmed",
      ocr_needs_review: ocr.needs_review,
      guest_phone_confidence: ocr.extracted.guest_phone_confidence,
      airbnb_review_url: "",
      door_code: ocr.extracted.door_code || "",
    };

    await appendReservation(reservation);

    const base = env.landing.baseUrl.replace(/\/$/, "");
    const landing = `${base}/api/landing/${apartmentId}?lang=${lang}`;

    const lines: string[] = [];
    lines.push(ocr.needs_review ? "⚠️ سُجّل الحجز — يحتاج مراجعة" : "✅ تم تسجيل الحجز");
    lines.push(`🆔 ${reservation.reservation_id}`);
    lines.push(
      `🏠 ${ga.nameAr} (${apartmentId})` + (explicit ? "" : " — لم تُحدّد الوحدة، استخدمت الافتراضية"),
    );
    lines.push(`👤 ${reservation.guest_name || "—"}`);
    lines.push(
      `📱 ${reservation.guest_phone || "—"}` +
        (reservation.guest_phone && reservation.guest_phone_confidence !== "high"
          ? " (تأكد من الرقم)"
          : ""),
    );
    lines.push(`📅 ${reservation.check_in_date || "—"} ← ${reservation.check_out_date || "—"}`);
    if (ocr.warnings.length) lines.push("\n⚠️ " + ocr.warnings.join("\n⚠️ "));
    lines.push(`\n🔗 صفحة الضيف:\n${landing}`);
    if (reservation.guest_phone) {
      const wa = buildWaLink(
        reservation.guest_phone,
        `أهلاً ${reservation.guest_name || ""} 👋\nرابط دليل دخولك إلى ديمورا:\n${landing}`,
      );
      lines.push(`\n📲 رابط واتساب جاهز للضيف:\n${wa}`);
    }
    await tgSendMessage(chatId, lines.join("\n"));
  } catch (e) {
    await tgSendMessage(chatId, "❌ صار خطأ أثناء المعالجة: " + (e as Error).message);
  }

  res.json({ ok: true });
});
