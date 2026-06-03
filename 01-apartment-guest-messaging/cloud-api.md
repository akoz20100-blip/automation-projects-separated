# Cloud API For Apartment Guest Messaging

## Endpoints

### POST /api/reservations/prepare-messages

Purpose:

- Prepare access, checkout, and review messages.

Required input:

```json
{
  "reservation_id": "AIRBNB-2026-0001",
  "source": "airbnb",
  "apartment_id": "apt_01",
  "apartment_name": "Riyadh Apartment 1",
  "guest_name": "Ahmed",
  "guest_phone": "9665XXXXXXXX",
  "guest_language": "ar",
  "check_in_date": "2026-06-10",
  "check_out_date": "2026-06-13",
  "check_in_time": "15:00",
  "check_out_time": "12:00",
  "access_guideline": "Door code and parking details",
  "checkout_guideline": "Switch off AC and leave the key",
  "airbnb_review_url": "https://airbnb.com/"
}
```

Expected output:

```json
{
  "reservation_id": "AIRBNB-2026-0001",
  "messages": [
    {
      "type": "access",
      "status": "ready",
      "channel": "whatsapp_link",
      "recipient_phone": "9665XXXXXXXX",
      "text": "Generated message",
      "whatsapp_link": "https://wa.me/9665XXXXXXXX?text=..."
    }
  ]
}
```

### POST /api/reservations/due-message

Purpose:

- Prepare one due message by type.

Message types:

```text
access
checkout
review
```

### POST /api/intake/ocr

Purpose:

- Read a booking screenshot and extract reservation fields (OpenAI-compatible
  vision model; provider/model via env). See `prompts/ocr-extraction-prompt.md`.

Input: `multipart/form-data` field `image` (PNG/JPG), or JSON
`{ "image_base64": "...", "mime": "image/png" }`.

Output:

```json
{
  "extracted": {
    "guest_name": "محمد",
    "guest_phone": "966512345678",
    "guest_phone_confidence": "high",
    "check_in_date": "2026-06-10",
    "check_out_date": "2026-06-13",
    "check_in_time": "15:00",
    "check_out_time": "12:00",
    "reservation_code": "HMABCDEFG",
    "source": "airbnb"
  },
  "warnings": [],
  "needs_review": false
}
```

### POST /api/messages/send

Purpose:

- Send one message (`access` | `checkout` | `review`) for a reservation stored in
  Google Sheets. Validates, enforces the human-confirm gate
  (`ocr_needs_review`), dedupes via `MessageLog`, sends via WhatsApp Cloud API (or
  returns a `wa.me` link in `manual_link` mode), and logs the result.

Input:

```json
{ "reservation_id": "AIRBNB-2026-0001", "message_type": "access", "force": false }
```

Output:

```json
{
  "type": "access",
  "status": "accepted",
  "channel": "whatsapp_cloud_api",
  "recipient_phone": "9665XXXXXXXX",
  "message_id": "wamid....",
  "template_name": "apt_access_ar"
}
```

(`status` is `already_sent` when a non-failed log row already exists.)

### GET /api/messages/due?type=checkout|review

Purpose:

- List reservations due for a checkout reminder (check_out_date = tomorrow) or
  review request (check_out_date = yesterday) in the configured timezone. Make's
  scheduler iterates the result and calls `/api/messages/send`.

### GET /api/landing/:apartment_id?lang=ar|en

Purpose:

- Public guest guide page (entrance photo + how-to-enter video + building info),
  brand-themeable. See `landing-page.md`. No bearer auth.

### GET/POST /api/webhooks/whatsapp

Purpose:

- Meta verification handshake (GET) and delivery-status callbacks (POST,
  signature-verified with `WHATSAPP_APP_SECRET`).

## Validation Rules

- `guest_phone` must be international format without `+` (digits only).
- `check_out_date` must be after `check_in_date`.
- `reservation_id` must be unique.
- Arabic and English templates must be supported.
- If `WHATSAPP_MODE=manual_link`, only return a WhatsApp link.
- A reservation with `ocr_needs_review = true` must not be auto-sent.
- `MessageLog` enforces idempotency on `(reservation_id, message_type)`.

## Environment Variables

See `service/.env.example` for the full list. Key groups:

```text
APP_ENV=development
API_SECRET=local_secret
DEFAULT_TIMEZONE=Asia/Riyadh
WHATSAPP_MODE=manual_link            # cloud_api | manual_link

# WhatsApp Cloud API
WHATSAPP_GRAPH_VERSION=v21.0
WHATSAPP_CLOUD_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_APP_SECRET=
WHATSAPP_VERIFY_TOKEN=
WA_TEMPLATE_ACCESS_AR=apt_access_ar  # + EN and checkout/review variants

# OCR (OpenAI-compatible provider, e.g. OpenRouter / your aggregator)
OCR_API_BASE_URL=https://openrouter.ai/api/v1
OCR_API_KEY=
OCR_MODEL=qwen/qwen2.5-vl-72b-instruct

# Google Sheets
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

# Landing page + branding (you provide)
LANDING_BASE_URL=https://your-app.vercel.app
BRAND_LOGO_URL=
BRAND_PRIMARY_COLOR=#0E7C66
BRAND_SECONDARY_COLOR=#F4F1EA
```

