# Project 01: Apartment Guest Messaging

## Goal

Prepare guest WhatsApp messages for Airbnb apartment reservations.

Current business context:

- Two apartments.
- Reservations come from Airbnb.
- Airbnb has no public API exposing the guest's full phone number (iCal gives
  dates only). So booking intake is a **screenshot read by OCR** (or manual
  entry), with a human confirmation step.
- Sending is **automatic via the WhatsApp Business Cloud API** using approved
  templates, with `wa.me` manual links as a fallback until templates are approved.

## Phase 2 — Automatic Sending (current)

When a booking arrives:

1. The host uploads a booking **screenshot** → `POST /api/intake/ocr` extracts
   guest name, phone and dates (OpenAI-compatible vision model; provider/model
   configurable). Result is flagged `needs_review` when anything is uncertain.
2. A `Reservations` row is created; the host **confirms** it
   (`ocr_needs_review = false`).
3. Make.com detects the confirmed row → `POST /api/messages/send` sends the
   **access** message (WhatsApp template) with the **landing page** link.
4. Daily schedules send the **checkout reminder** (night before) and the
   **review** request (day after) via `GET /api/messages/due` + send.
5. Every send is recorded in `MessageLog` (idempotent — no double sends).

The **landing page** (`GET /api/landing/:apartment_id`) is a lightweight,
brand-themeable guide with the building entrance photo, a how-to-enter video, and
building info.

The working implementation is in **`service/`** (Node.js + TypeScript).

## Modes

- `WHATSAPP_MODE=manual_link` — returns `wa.me` links (no credentials needed);
  use until templates are approved.
- `WHATSAPP_MODE=cloud_api` — sends approved templates via the Meta Graph API.

## Files

```text
README.md
project-plan.md
make-scenarios.md
cloud-api.md
commands.md
whatsapp-templates.md
landing-page.md
prompts/cloud-code-prompt.md
prompts/ocr-extraction-prompt.md
templates/reservations.csv
templates/apartments.csv
templates/message_templates.json
templates/blueprints/*.json        (Make.com scenario blueprints)
service/                            (the Cloud API implementation)
```

