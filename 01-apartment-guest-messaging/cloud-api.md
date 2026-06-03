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

## Validation Rules

- `guest_phone` must be international format without `+`.
- `check_out_date` must be after `check_in_date`.
- `reservation_id` must be unique.
- Arabic and English templates must be supported.
- If `WHATSAPP_MODE=manual_link`, only return a WhatsApp link.

## Environment Variables

```text
APP_ENV=development
API_SECRET=local_secret
DEFAULT_TIMEZONE=Asia/Riyadh
WHATSAPP_MODE=manual_link
GOOGLE_SHEETS_ID=
```

