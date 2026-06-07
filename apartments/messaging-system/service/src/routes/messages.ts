/**
 * Sending endpoints.
 *  POST /api/messages/send       — send one message (access|checkout|review) for a reservation
 *  GET  /api/messages/due        — list reservations due for a checkout/review message today
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { sendMessageSchema } from "../domain/reservation.js";
import { getApartment, getReservation, listDueReservations, appendMessageLog } from "../services/sheets.js";
import { checkAlreadySent } from "../services/idempotency.js";
import { sendMessage, sendText } from "../services/whatsapp.js";
import { renderNotify } from "../services/templates.js";
import { isCheckoutAfterCheckin, dueCheckoutDate, todayInTz } from "../domain/dates.js";
import { env } from "../config/env.js";
import type { Channel, MessageType, NotifyType, PreparedMessage } from "../types.js";

const notifySchema = z.object({
  reservation_id: z.string().min(1),
  notify_type: z.enum(["owner_new", "owner_checkout", "owner_check", "cleaner_checkout", "cleaner_check"]),
  force: z.boolean().default(false),
});

/** Recipient phone for a notification type (owner vs cleaner). */
function notifyRecipient(type: NotifyType): { phone: string; who: string } {
  if (type.startsWith("cleaner")) return { phone: env.cleaner.phone, who: "cleaner" };
  return { phone: env.owner.phone, who: "owner" };
}

export const messagesRouter = Router();

/** The channel implied by the current send mode. */
export function currentChannel(): Channel {
  if (env.whatsappMode === "cloud_api") return "whatsapp_cloud_api";
  if (env.whatsappMode === "wasender") return "whatsapp_wasender";
  return "whatsapp_link";
}

/** Core orchestration: validate, dedupe, send, log. Reused by send + due loop. */
export async function sendForReservation(
  reservationId: string,
  messageType: MessageType,
  apartmentIdHint: string | undefined,
  force: boolean,
): Promise<PreparedMessage> {
  const reservation = await getReservation(reservationId);
  if (!reservation) throw new Error(`reservation not found: ${reservationId}`);

  if (reservation.ocr_needs_review) {
    throw new Error("reservation needs human review before sending (ocr_needs_review=true)");
  }
  if (!isCheckoutAfterCheckin(reservation.check_in_date, reservation.check_out_date)) {
    throw new Error("check_out_date must be after check_in_date");
  }

  const apartment = await getApartment(apartmentIdHint || reservation.apartment_id);
  if (!apartment) throw new Error(`apartment not found: ${reservation.apartment_id}`);

  if (!force) {
    const dup = await checkAlreadySent(reservationId, messageType);
    if (dup.alreadySent) {
      return {
        type: messageType,
        status: "already_sent",
        channel: currentChannel(),
        recipient_phone: reservation.guest_phone,
        text: "",
        message_id: dup.messageId,
      };
    }
  }

  const result = await sendMessage(messageType, reservation, apartment);

  await appendMessageLog({
    timestamp: new Date().toISOString(),
    reservation_id: reservationId,
    message_type: messageType,
    channel: result.channel,
    recipient_phone: reservation.guest_phone,
    template_name: result.template_name ?? "",
    language: reservation.guest_language,
    wa_message_id: result.message_id,
    status: result.status,
    error_code: "",
    rendered_text: result.text,
    sent_at: result.status === "accepted" ? new Date().toISOString() : "",
  });

  return {
    type: messageType,
    status: result.status,
    channel: result.channel,
    recipient_phone: reservation.guest_phone,
    text: result.text,
    whatsapp_link: result.whatsapp_link,
    message_id: result.message_id,
    template_name: result.template_name,
  };
}

messagesRouter.post("/send", async (req: Request, res: Response) => {
  const body = sendMessageSchema.parse(req.body);
  const out = await sendForReservation(
    body.reservation_id,
    body.message_type,
    body.apartment_id,
    body.force,
  );
  res.json(out);
});

messagesRouter.post("/notify", async (req: Request, res: Response) => {
  const body = notifySchema.parse(req.body);
  const { phone, who } = notifyRecipient(body.notify_type);
  if (!phone) {
    res.status(400).json({ error: `no ${who} phone configured (set OWNER_PHONE / CLEANER_PHONE)` });
    return;
  }

  const reservation = await getReservation(body.reservation_id);
  if (!reservation) throw new Error(`reservation not found: ${body.reservation_id}`);
  const apartment = await getApartment(reservation.apartment_id);
  if (!apartment) throw new Error(`apartment not found: ${reservation.apartment_id}`);

  if (!body.force) {
    const dup = await checkAlreadySent(body.reservation_id, body.notify_type);
    if (dup.alreadySent) {
      res.json({ notify_type: body.notify_type, status: "already_sent", recipient: who });
      return;
    }
  }

  const text = renderNotify(body.notify_type, reservation, apartment);
  const result = await sendText(phone, text);

  await appendMessageLog({
    timestamp: new Date().toISOString(),
    reservation_id: body.reservation_id,
    message_type: body.notify_type,
    channel: result.channel,
    recipient_phone: phone,
    template_name: "",
    language: "ar",
    wa_message_id: result.message_id,
    status: result.status,
    error_code: "",
    rendered_text: result.text,
    sent_at: result.status === "accepted" ? new Date().toISOString() : "",
  });

  res.json({
    notify_type: body.notify_type,
    status: result.status,
    recipient: who,
    recipient_phone: phone,
    channel: result.channel,
    text: result.text,
    whatsapp_link: result.whatsapp_link,
  });
});

messagesRouter.get("/due", async (req: Request, res: Response) => {
  const type = String(req.query.type ?? "");
  // checkout = tomorrow's checkouts; review = yesterday's; checkout_today = today's
  if (type !== "checkout" && type !== "review" && type !== "checkout_today") {
    res.status(400).json({ error: "type must be 'checkout', 'review' or 'checkout_today'" });
    return;
  }
  const date =
    typeof req.query.date === "string" && req.query.date
      ? req.query.date
      : type === "checkout_today"
        ? todayInTz(env.timezone)
        : dueCheckoutDate(type, env.timezone);

  const due = await listDueReservations(date);
  res.json({
    message_type: type,
    target_check_out_date: date,
    count: due.length,
    reservations: due.map((r) => ({
      reservation_id: r.reservation_id,
      apartment_id: r.apartment_id,
      guest_name: r.guest_name,
      guest_phone: r.guest_phone,
      check_out_date: r.check_out_date,
    })),
  });
});
