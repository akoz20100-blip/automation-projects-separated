/**
 * Sending endpoints.
 *  POST /api/messages/send       — send one message (access|checkout|review) for a reservation
 *  GET  /api/messages/due        — list reservations due for a checkout/review message today
 */

import { Router, type Request, type Response } from "express";
import { sendMessageSchema } from "../domain/reservation.js";
import { getApartment, getReservation, listDueReservations, appendMessageLog } from "../services/sheets.js";
import { checkAlreadySent } from "../services/idempotency.js";
import { sendMessage } from "../services/whatsapp.js";
import { isCheckoutAfterCheckin, dueCheckoutDate } from "../domain/dates.js";
import { env } from "../config/env.js";
import type { MessageType, PreparedMessage } from "../types.js";

export const messagesRouter = Router();

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
        channel: env.whatsappMode === "cloud_api" ? "whatsapp_cloud_api" : "whatsapp_link",
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

messagesRouter.get("/due", async (req: Request, res: Response) => {
  const type = String(req.query.type ?? "");
  if (type !== "checkout" && type !== "review") {
    res.status(400).json({ error: "type must be 'checkout' or 'review'" });
    return;
  }
  const date = typeof req.query.date === "string" && req.query.date
    ? req.query.date
    : dueCheckoutDate(type, env.timezone);

  const due = await listDueReservations(date);
  const messageStatusKey = type === "checkout" ? "checkout" : "review";
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
      message_type: messageStatusKey,
    })),
  });
});
