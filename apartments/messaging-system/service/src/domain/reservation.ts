/** Zod schemas + validation rules for reservation payloads. */

import { z } from "zod";
import { normalizePhone } from "./phone.js";
import { isCheckoutAfterCheckin, isDateString } from "./dates.js";

export const languageSchema = z.enum(["ar", "en"]).default("ar");
export const messageTypeSchema = z.enum(["access", "checkout", "review"]);

/**
 * Full reservation input accepted by /api/reservations/prepare-messages.
 * Phone is normalized; dates are validated for ordering.
 */
export const reservationInputSchema = z
  .object({
    reservation_id: z.string().min(1),
    source: z.string().default("airbnb"),
    apartment_id: z.string().min(1),
    apartment_name: z.string().min(1),
    guest_name: z.string().min(1),
    guest_phone: z.string().min(1),
    guest_language: languageSchema,
    check_in_date: z.string().refine(isDateString, "check_in_date must be YYYY-MM-DD"),
    check_out_date: z.string().refine(isDateString, "check_out_date must be YYYY-MM-DD"),
    check_in_time: z.string().default("15:00"),
    check_out_time: z.string().default("12:00"),
    access_guideline: z.string().default(""),
    checkout_guideline: z.string().default(""),
    airbnb_review_url: z.string().default("https://airbnb.com/"),
  })
  .superRefine((val, ctx) => {
    if (!normalizePhone(val.guest_phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["guest_phone"],
        message: "guest_phone must be a valid international number without '+'",
      });
    }
    if (!isCheckoutAfterCheckin(val.check_in_date, val.check_out_date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["check_out_date"],
        message: "check_out_date must be after check_in_date",
      });
    }
  });

export type ReservationInput = z.infer<typeof reservationInputSchema>;

/** Body for POST /api/messages/send. */
export const sendMessageSchema = z.object({
  reservation_id: z.string().min(1),
  message_type: messageTypeSchema,
  apartment_id: z.string().min(1).optional(),
  force: z.boolean().default(false),
});

export type SendMessageBody = z.infer<typeof sendMessageSchema>;
