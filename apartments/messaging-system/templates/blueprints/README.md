# Make.com Blueprints

Import these into Make.com (Create a new scenario → ⋯ menu → Import Blueprint).
After import you must **wire the connections** (Google Sheets connection, and the
Cloud API base URL + bearer token in the HTTP modules) — connections are not
exported with blueprints.

| File | Scenario |
| --- | --- |
| `apt-new-reservation-send-access.json` | On confirmed reservation → send access message |
| `apt-checkout-reminder.json` | Daily 09:00 → send checkout reminders (night before) |
| `apt-review-reminder.json` | Daily 10:00 → send review requests (day after) |

Replace `https://YOUR-APP.vercel.app` and `Bearer YOUR_API_SECRET` with your
deployment values. Validate edits with the Make MCP
(`validate_blueprint_schema`, `validate_scheduling_schema`).
