# Project 01: Apartment Guest Messaging

**Turn each Airbnb booking into ready-to-send guest WhatsApp messages — access, checkout, and review — without manual copy-paste.**

> **At a glance** — **Status:** Phase 1, manual `wa.me` links · **Stack:** Google Sheets → Make.com → Cloud API → WhatsApp · **Next:** WhatsApp Business Cloud API

↩ Back to [all projects](../README.md)

## Goal

Prepare guest WhatsApp messages for Airbnb apartment reservations.

Current business context:

- Two apartments.
- Reservations come from Airbnb.
- Guest phone number is visible after booking.
- No WhatsApp Business Cloud API yet.
- Start with manual WhatsApp links from Google Sheets and Make.com.

## Phase 1 Output

When a reservation is added to Google Sheets:

1. Make.com detects the new row.
2. Make.com calls Cloud API.
3. Cloud API validates data.
4. Cloud API returns WhatsApp links for:
   - Access guideline.
   - Checkout reminder.
   - Review reminder.
5. Make.com updates Google Sheets and logs messages.

## Future Upgrade

After WhatsApp Business Cloud API is ready, switch from `manual_link` to `cloud_api`.

## Files

- [`README.md`](README.md) — this overview
- [`project-plan.md`](project-plan.md) — phased build plan
- [`make-scenarios.md`](make-scenarios.md) — Make.com scenario setup
- [`cloud-api.md`](cloud-api.md) — Cloud API contract
- [`commands.md`](commands.md) — Cloud Code commands
- [`prompts/cloud-code-prompt.md`](prompts/cloud-code-prompt.md) — Cloud Code handoff prompt
- [`templates/reservations.csv`](templates/reservations.csv) — reservation input sheet
- [`templates/apartments.csv`](templates/apartments.csv) — apartment reference data
- [`templates/message_templates.json`](templates/message_templates.json) — message templates

