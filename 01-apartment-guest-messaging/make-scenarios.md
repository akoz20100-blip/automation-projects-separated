# Make.com Scenarios

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
- `access_message_status = pending`

Steps:

1. Watch new row in `Reservations`.
2. Search `Apartments` by `apartment_id`.
3. HTTP POST to Cloud API:
   - `/api/reservations/prepare-messages`
4. Update reservation row:
   - `access_whatsapp_link`
   - `checkout_whatsapp_link`
   - `review_whatsapp_link`
   - message statuses to `ready`
5. Add rows to `MessageLog`.
6. Notify owner/admin with access message WhatsApp link.

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

1. Search due reservation rows.
2. HTTP POST to Cloud API:
   - `/api/reservations/due-message`
   - `message_type = checkout`
3. Update `checkout_whatsapp_link`.
4. Set `checkout_message_status = ready`.
5. Notify owner/admin with WhatsApp link.

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

1. Search due reservation rows.
2. HTTP POST to Cloud API:
   - `/api/reservations/due-message`
   - `message_type = review`
3. Update `review_whatsapp_link`.
4. Set `review_message_status = ready`.
5. Notify owner/admin with WhatsApp link.

## Scenario 4: Manual Send Confirmation

Name:

```text
APT - Message Sent Confirmation
```

Trigger:

```text
Google Sheets > Watch Updated Rows
Sheet: Reservations or MessageLog
```

Steps:

1. Detect message status changed to `sent`.
2. Save `sent_at`.
3. Prevent duplicate reminders.

