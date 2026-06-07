# Apartment Guest Messaging Plan

## Main Workflow (Phase 2)

```text
Booking screenshot
        |
        v
POST /api/intake/ocr  (OCR extract: name, phone, dates)
        |
        v
Reservations row created  ->  HOST CONFIRMS  (ocr_needs_review = false)
        |
        v
Make.com Watch Rows (confirmed)
        |
        v
POST /api/messages/send {access}  ->  WhatsApp Cloud API template + landing link
        |
        v
MessageLog (idempotent)  +  delivery status via webhook

Daily schedulers:
  09:00  GET /api/messages/due?type=checkout -> send {checkout}  (night before)
  10:00  GET /api/messages/due?type=review   -> send {review}    (day after)
```

## Messages

### Access Guideline

Trigger:

- After booking is added, or morning of check-in.

Purpose:

- Confirm booking.
- Share access instructions.
- Share check-in time.

### Checkout Reminder

Trigger:

- One day before checkout.

Purpose:

- Remind guest of checkout time.
- Share checkout instructions.

### Review Reminder

Trigger:

- One day after checkout.

Purpose:

- Ask guest to leave Airbnb review.

## Phase 1 Rules (fallback)

- `WHATSAPP_MODE=manual_link` generates `wa.me` links only.
- Owner or responsible person manually sends the message.
- Do not use unofficial WhatsApp automation.

## Phase 2 Rules (current)

- Sending uses the official **WhatsApp Business Cloud API** with approved
  **templates** (all three messages are business-initiated → templates required;
  free-form text only within a guest's 24h window).
- Booking intake is **screenshot OCR** (provider/model configurable) — Airbnb
  exposes no phone API.
- **Human-confirm gate**: a reservation with `ocr_needs_review = true` is not
  auto-sent.
- **Idempotency**: `MessageLog` prevents sending the same
  `(reservation_id, message_type)` twice.
- Keep the manual `wa.me` link fallback.
- Save every send in `MessageLog`.

## Required Google Sheets

- `Reservations`
- `Apartments`
- `MessageLog`

