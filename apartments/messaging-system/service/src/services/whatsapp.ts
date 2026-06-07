/**
 * WhatsApp delivery. Two modes:
 *  - cloud_api: send an approved template message via the Meta Graph API.
 *  - manual_link: return a wa.me link (Phase 1 fallback, no auto-send).
 */

import { env } from "../config/env.js";
import type { Apartment, Channel, MessageType, Reservation } from "../types.js";
import { requireValidPhone } from "../domain/phone.js";
import { bodyParams, renderText, templateName } from "./templates.js";

export interface SendResult {
  channel: Channel;
  message_id: string; // wa message id (cloud_api) or "" (manual_link)
  whatsapp_link?: string;
  text: string;
  template_name?: string;
  status: "accepted" | "ready";
}

/** Build a wa.me link with URL-encoded prefilled text. */
export function buildWaLink(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Send free-form text via WasenderAPI (third-party WhatsApp gateway).
 * No Meta template approval needed — the rendered message text is sent directly.
 * Docs: POST /api/send-message { to: "+E164", text }.
 */
export async function sendViaWasender(toPhone: string, text: string): Promise<SendResult> {
  const res = await fetch(env.wasender.apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.wasender.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      // WasenderAPI sits behind Cloudflare, which blocks requests with no
      // browser-like User-Agent (HTTP 403, CF error 1010). Send one explicitly.
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
    body: JSON.stringify({ to: `+${toPhone}`, text }),
  });

  const bodyText = await res.text();
  if (!res.ok) {
    throw new Error(`WasenderAPI send failed (${res.status}): ${bodyText}`);
  }

  let messageId = "";
  try {
    const data = JSON.parse(bodyText) as {
      data?: { msgId?: string | number; id?: string | number };
      msgId?: string | number;
    };
    messageId = String(data.data?.msgId ?? data.data?.id ?? data.msgId ?? "");
  } catch {
    /* non-JSON success body — leave id empty */
  }

  return {
    channel: "whatsapp_wasender",
    message_id: messageId,
    text,
    status: "accepted",
  };
}

/** Build the Graph API request body for a template message. */
export function buildTemplatePayload(
  type: MessageType,
  reservation: Reservation,
  apartment: Apartment,
  toPhone: string,
): Record<string, unknown> {
  const lang = reservation.guest_language;
  const params = bodyParams(type, reservation, apartment).map((text) => ({
    type: "text",
    text,
  }));

  return {
    messaging_product: "whatsapp",
    to: toPhone,
    type: "template",
    template: {
      name: templateName(type, lang),
      language: { code: lang },
      components: [{ type: "body", parameters: params }],
    },
  };
}

/**
 * Send arbitrary free-form text to any recipient (owner / cleaner) via the
 * active channel. Used for internal notifications, which are never Meta
 * templates. In cloud_api mode (template-only), this falls back to a wa.me link.
 */
export async function sendText(toPhoneRaw: string, text: string): Promise<SendResult> {
  const toPhone = requireValidPhone(toPhoneRaw);
  if (env.whatsappMode === "wasender") {
    return sendViaWasender(toPhone, text);
  }
  // manual_link, or cloud_api (no free-form templates) -> provide a link.
  return {
    channel: "whatsapp_link",
    message_id: "",
    whatsapp_link: buildWaLink(toPhone, text),
    text,
    status: "ready",
  };
}

/**
 * Send (or prepare) a message for a reservation. Network errors propagate to
 * the caller; the caller decides whether to log a failure row.
 */
export async function sendMessage(
  type: MessageType,
  reservation: Reservation,
  apartment: Apartment,
): Promise<SendResult> {
  const toPhone = requireValidPhone(reservation.guest_phone);
  const text = renderText(type, reservation, apartment);

  if (env.whatsappMode === "manual_link") {
    return {
      channel: "whatsapp_link",
      message_id: "",
      whatsapp_link: buildWaLink(toPhone, text),
      text,
      status: "ready",
    };
  }

  if (env.whatsappMode === "wasender") {
    return sendViaWasender(toPhone, text);
  }

  const payload = buildTemplatePayload(type, reservation, apartment, toPhone);
  const url = `https://graph.facebook.com/${env.whatsapp.graphVersion}/${env.whatsapp.phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.whatsapp.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`WhatsApp send failed (${res.status}): ${errBody}`);
  }

  const data = (await res.json()) as { messages?: Array<{ id: string }> };
  const messageId = data.messages?.[0]?.id ?? "";

  return {
    channel: "whatsapp_cloud_api",
    message_id: messageId,
    text,
    template_name: templateName(type, reservation.guest_language),
    status: "accepted",
  };
}
