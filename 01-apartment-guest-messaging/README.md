# Project 01: Apartment Guest Messaging

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

```text
README.md
project-plan.md
make-scenarios.md
cloud-api.md
commands.md
prompts/cloud-code-prompt.md
templates/reservations.csv
templates/apartments.csv
templates/message_templates.json
```

