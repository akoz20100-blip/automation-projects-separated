# Cloud Code Prompt

The Phase 2 implementation lives in `service/` (Node.js + TypeScript). The
original Phase 1 brief is kept below for reference, followed by the Phase 2 brief
that the current service implements.

## Phase 1 (reference)

```text
Build a Node.js + TypeScript Cloud API that prepares WhatsApp messages.
- Phase 1 generates manual `wa.me` links only.
- POST /api/reservations/prepare-messages, POST /api/reservations/due-message
- Arabic and English templates; phone + date validation; unit tests; .env.example.
- All endpoints require Authorization: Bearer API_SECRET.
```

## Phase 2 (implemented in `service/`)

```text
You are building Project 01: Apartment Guest Messaging — automatic system.

Read every file in this folder before coding (especially whatsapp-templates.md,
landing-page.md, cloud-api.md, prompts/ocr-extraction-prompt.md).

Goal:
A Node.js + TypeScript Cloud API that intakes bookings via OCR, sends WhatsApp
Cloud API approved templates, and serves a per-apartment landing page.

Constraints:
- Do not automate the regular WhatsApp app; sending is via the official Cloud API.
- WHATSAPP_MODE=manual_link must still work (returns wa.me) as a fallback before
  templates are approved.
- No direct Airbnb API; booking intake is screenshot OCR (or manual entry).
- OCR uses an OpenAI-compatible vision model (provider/model via env) — not tied
  to any single vendor.
- A reservation with ocr_needs_review=true must NOT be auto-sent (human gate).
- Make.com orchestrates Sheets triggers + daily schedules.

Build:
- POST /api/intake/ocr (screenshot -> extracted fields + needs_review)
- POST /api/messages/send (access|checkout|review, with idempotency via MessageLog)
- GET  /api/messages/due?type=checkout|review
- POST /api/reservations/prepare-messages, POST /api/reservations/due-message (preview)
- GET  /api/landing/:apartment_id (brand-themeable guest guide)
- GET/POST /api/webhooks/whatsapp (verify + delivery status)
- Arabic + English; phone/date validation; unit tests; .env.example; README.

Acceptance:
- prepare-messages returns access, checkout, review for a payload.
- manual_link mode URL-encodes Arabic correctly; cloud_api mode sends templates.
- Authenticated endpoints require Authorization: Bearer API_SECRET.
- Idempotency: same (reservation_id, message_type) is not sent twice.
- OCR returns needs_review when phone is missing/low-confidence.
```

