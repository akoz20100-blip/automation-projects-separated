# Make.com Scenarios

Exported blueprints live in `templates/blueprints/`. Validate any edited
blueprint with the Make MCP (`validate_blueprint_schema`,
`validate_module_configuration`, `validate_scheduling_schema`) before importing.

## Scenario 0: OCR Intake (optional)

Name:

```text
APT - OCR Intake
```

Trigger:

```text
Make custom webhook (host uploads a booking screenshot, e.g. from Telegram/phone)
```

Steps:

1. Receive the image.
2. HTTP POST (multipart) to Cloud API `/api/intake/ocr`.
3. Create a `Reservations` row with the extracted fields,
   `ocr_needs_review = true`, `access_message_status = pending`.
4. Notify the host to review/confirm (especially the phone number).

> If the host enters bookings directly into the sheet, this scenario is not needed.

## Scenario 1: New Reservation

Name:

```text
APT - New Reservation - Prepare Messages
```

Trigger:

```text
Google Sheets > Watch New Rows
Sheet: Reservations
```

Filters:

- `status = confirmed`
- `guest_phone is not empty`
- `ocr_needs_review = false`  (human-confirm gate)
- `access_message_status = pending`

Steps:

1. Watch new/updated row in `Reservations`.
2. HTTP POST to Cloud API `/api/messages/send` with
   `{ "reservation_id": ..., "message_type": "access" }`.
3. Update reservation row:
   - `wa_access_message_id`
   - `access_message_status = accepted` (or `ready` in manual_link mode)
4. The Cloud API writes the `MessageLog` row itself.
5. (Optional) Notify owner/admin.

## Scenario 2: Checkout Reminder

Name:

```text
APT - Checkout Reminder - Prepare WhatsApp Link
```

Trigger:

```text
Make Scheduler
Run: every day at 09:00 Asia/Riyadh
```

Filters:

- `check_out_date = tomorrow`
- `checkout_message_status = pending OR ready`
- `status != cancelled`

Steps:

1. HTTP GET Cloud API `/api/messages/due?type=checkout`.
2. Iterate the returned reservations.
3. For each, HTTP POST `/api/messages/send` with `message_type = checkout`.
4. Update `wa_checkout_message_id` and `checkout_message_status`.

## Scenario 3: Review Reminder

Name:

```text
APT - Review Reminder - Prepare WhatsApp Link
```

Trigger:

```text
Make Scheduler
Run: every day at 10:00 Asia/Riyadh
```

Filters:

- `check_out_date = yesterday`
- `review_message_status = pending OR ready`
- `status != cancelled`

Steps:

1. HTTP GET Cloud API `/api/messages/due?type=review`.
2. Iterate the returned reservations.
3. For each, HTTP POST `/api/messages/send` with `message_type = review`.
4. Update `wa_review_message_id` and `review_message_status`.

## Scenario 4: Delivery Status / Failure Alert

Name:

```text
APT - Delivery Status
```

Trigger:

```text
Google Sheets > Watch Updated Rows (MessageLog)
```

Steps:

1. Delivery-status callbacks land on the Cloud API webhook
   (`/api/webhooks/whatsapp`), which updates `MessageLog` status
   (`accepted -> sent -> delivered -> read`, or `failed`).
2. This scenario watches `MessageLog` for `status = failed` and alerts the host.
3. Idempotency is handled by the Cloud API, so re-runs never double-send.

