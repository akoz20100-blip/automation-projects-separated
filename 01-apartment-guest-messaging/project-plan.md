# Apartment Guest Messaging Plan

## Main Workflow

```text
Reservation row in Google Sheets
        |
        v
Make.com Watch New Rows
        |
        v
Cloud API /api/reservations/prepare-messages
        |
        v
Google Sheets update + WhatsApp links
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

## Phase 1 Rules

- Generate `wa.me` links only.
- Owner or responsible person manually sends the message.
- Save every generated message in `MessageLog`.
- Do not use unofficial WhatsApp automation.

## Phase 2 Rules

- Add WhatsApp Business Cloud API.
- Use approved template messages for outbound reminders.
- Keep manual link fallback.

## Required Google Sheets

- `Reservations`
- `Apartments`
- `MessageLog`

