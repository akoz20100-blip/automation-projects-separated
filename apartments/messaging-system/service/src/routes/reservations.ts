/**
 * Stateless preview/preparation endpoints (kept from the original contract).
 *  POST /api/reservations/prepare-messages — render all three messages from a full payload
 *  POST /api/reservations/due-message       — render a single message by type
 *
 * These do not read Google Sheets; they work entirely from the request body so
 * Make.com (or a tester) can preview text + links/template params before sending.
 */

import { Router, type Request, type Response } from "express";
import { reservationInputSchema, messageTypeSchema, type ReservationInput } from "../domain/reservation.js";
import { normalizePhone } from "../domain/phone.js";
import { renderText, templateName, bodyParams } from "../services/templates.js";
import { buildWaLink } from "../services/whatsapp.js";
import { env } from "../config/env.js";
import type { Apartment, MessageType, PreparedMessage, Reservation } from "../types.js";

export const reservationsRouter = Router();

function toModels(input: ReservationInput): { reservation: Reservation; apartment: Apartment } {
  const reservation: Reservation = {
    reservation_id: input.reservation_id,
    source: input.source,
    apartment_id: input.apartment_id,
    apartment_name: input.apartment_name,
    guest_name: input.guest_name,
    guest_phone: normalizePhone(input.guest_phone) ?? input.guest_phone,
    guest_language: input.guest_language,
    check_in_date: input.check_in_date,
    check_out_date: input.check_out_date,
    check_in_time: input.check_in_time,
    check_out_time: input.check_out_time,
    status: "confirmed",
    airbnb_review_url: input.airbnb_review_url,
  };
  const apartment: Apartment = {
    apartment_id: input.apartment_id,
    apartment_name: input.apartment_name,
    default_check_in_time: input.check_in_time,
    default_check_out_time: input.check_out_time,
    access_guideline: input.access_guideline,
    checkout_guideline: input.checkout_guideline,
    airbnb_review_url: input.airbnb_review_url,
  };
  return { reservation, apartment };
}

function prepareOne(
  type: MessageType,
  reservation: Reservation,
  apartment: Apartment,
): PreparedMessage {
  const text = renderText(type, reservation, apartment);
  if (env.whatsappMode === "manual_link") {
    return {
      type,
      status: "ready",
      channel: "whatsapp_link",
      recipient_phone: reservation.guest_phone,
      text,
      whatsapp_link: buildWaLink(reservation.guest_phone, text),
    };
  }
  if (env.whatsappMode === "wasender") {
    return {
      type,
      status: "ready",
      channel: "whatsapp_wasender",
      recipient_phone: reservation.guest_phone,
      text,
    };
  }
  return {
    type,
    status: "ready",
    channel: "whatsapp_cloud_api",
    recipient_phone: reservation.guest_phone,
    text,
    template_name: templateName(type, reservation.guest_language),
  };
}

reservationsRouter.post("/prepare-messages", (req: Request, res: Response) => {
  const input = reservationInputSchema.parse(req.body);
  const { reservation, apartment } = toModels(input);
  const types: MessageType[] = ["access", "checkout", "review"];
  res.json({
    reservation_id: input.reservation_id,
    mode: env.whatsappMode,
    messages: types.map((t) => prepareOne(t, reservation, apartment)),
  });
});

reservationsRouter.post("/due-message", (req: Request, res: Response) => {
  const type = messageTypeSchema.parse(req.body?.message_type);
  const input = reservationInputSchema.parse(req.body);
  const { reservation, apartment } = toModels(input);
  res.json({
    reservation_id: input.reservation_id,
    mode: env.whatsappMode,
    message: prepareOne(type, reservation, apartment),
    // expose positional params so an operator can inspect the template mapping
    template_params: env.whatsappMode === "cloud_api" ? bodyParams(type, reservation, apartment) : undefined,
  });
});
