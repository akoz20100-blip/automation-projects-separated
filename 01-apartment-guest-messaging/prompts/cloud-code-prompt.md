# Cloud Code Prompt

```text
You are building Project 01: Apartment Guest Messaging.

Read every file in this folder before coding.

Goal:
Build a Node.js + TypeScript Cloud API that prepares WhatsApp messages for apartment reservations.

Constraints:
- Do not automate the regular WhatsApp app.
- Phase 1 must generate manual `wa.me` links only.
- Do not assume direct Airbnb API access.
- Make.com will orchestrate Google Sheets triggers and scheduled reminders.
- Cloud API owns validation, message generation, and WhatsApp link generation.

Build:
- POST /api/reservations/prepare-messages
- POST /api/reservations/due-message
- Arabic and English templates.
- Phone validation and normalization.
- Date validation.
- Unit tests.
- .env.example.
- README for local run and deployment.

Acceptance:
- New reservation payload returns access, checkout, and review messages.
- Arabic text is correctly URL-encoded in WhatsApp links.
- All endpoints require Authorization: Bearer API_SECRET.
- No automatic WhatsApp sending happens while WHATSAPP_MODE=manual_link.
```

