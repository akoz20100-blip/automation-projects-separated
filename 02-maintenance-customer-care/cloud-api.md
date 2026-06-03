# Cloud API For Maintenance Customer Care

## Endpoint

### POST /api/maintenance/prepare-request

Purpose:

- Validate maintenance request.
- Build a clear handler message.
- Return WhatsApp link for `msool` or handler.

Input:

```json
{
  "request_id": "maint_0001",
  "reservation_id": "AIRBNB-2026-0001",
  "apartment_id": "apt_01",
  "apartment_name": "Riyadh Apartment 1",
  "guest_name": "Ahmed",
  "guest_phone": "9665XXXXXXXX",
  "issue_type": "AC",
  "priority": "urgent",
  "description": "AC not cooling",
  "handler_phone": "9665XXXXXXXX"
}
```

Output:

```json
{
  "request_id": "maint_0001",
  "status": "ready",
  "message_text": "Generated handler message",
  "handler_whatsapp_link": "https://wa.me/9665XXXXXXXX?text=..."
}
```

## Handler Message Template

```text
New maintenance request

Apartment: {{apartment_name}}
Priority: {{priority}}
Issue: {{issue_type}}
Description: {{description}}
Guest: {{guest_name}}
Guest phone: {{guest_phone}}
Reservation: {{reservation_id}}
```

## Environment Variables

```text
APP_ENV=development
API_SECRET=local_secret
DEFAULT_TIMEZONE=Asia/Riyadh
WHATSAPP_MODE=manual_link
GOOGLE_SHEETS_ID=
```

## Validation Rules

- `request_id` is required.
- `apartment_id` is required.
- `issue_type` is required.
- `priority` must be `low`, `normal`, or `urgent`.
- `handler_phone` must be international format without `+`.

