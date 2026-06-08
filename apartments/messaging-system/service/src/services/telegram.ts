/**
 * Telegram Bot API helpers for the booking-screenshot intake bot.
 *
 * The owner forwards an Airbnb booking screenshot to the bot; the webhook
 * (routes/telegram.ts) downloads the photo, runs OCR, and stores the reservation.
 */

import { env } from "../config/env.js";

const api = (method: string) =>
  `https://api.telegram.org/bot${env.telegram.botToken}/${method}`;

/** Send a plain-text message back to a chat (best-effort; never throws). */
export async function tgSendMessage(chatId: number | string, text: string): Promise<void> {
  if (!env.telegram.botToken) return;
  try {
    await fetch(api("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });
  } catch {
    /* best-effort notification */
  }
}

/** Resolve a Telegram file_id to its server file path. */
async function getFilePath(fileId: string): Promise<string> {
  const res = await fetch(api("getFile"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId }),
  });
  const data = (await res.json()) as { ok: boolean; result?: { file_path?: string } };
  if (!data.ok || !data.result?.file_path) throw new Error("Telegram getFile failed");
  return data.result.file_path;
}

/** Download a Telegram photo and return it as base64 (no data: prefix). */
export async function downloadTelegramPhoto(
  fileId: string,
): Promise<{ base64: string; mime: string }> {
  const path = await getFilePath(fileId);
  const res = await fetch(`https://api.telegram.org/file/bot${env.telegram.botToken}/${path}`);
  if (!res.ok) throw new Error(`Telegram file download failed (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = path.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
  return { base64: buf.toString("base64"), mime };
}
