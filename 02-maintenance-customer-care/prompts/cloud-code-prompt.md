# Cloud Code Prompt

```text
You are building Project 02: Maintenance Customer Care.

Read every file in this folder before coding.

Goal:
Build a Node.js + TypeScript Cloud API endpoint that prepares maintenance request messages and WhatsApp manual links for the responsible handler.

Constraints:
- `msool` is assumed to have no API.
- Phase 1 must generate manual `wa.me` links only.
- Do not automate the regular WhatsApp app.
- Make.com will detect Google Sheets rows and call the Cloud API.

Build:
- POST /api/maintenance/prepare-request
- Request validation.
- Priority normalization.
- Handler WhatsApp message generation.
- WhatsApp link URL encoding.
- Unit tests.
- .env.example.
- README for local run and deployment.

Acceptance:
- Valid maintenance request returns a handler message and WhatsApp link.
- Invalid priority returns HTTP 400.
- Handler phone is validated.
- All endpoints require Authorization: Bearer API_SECRET.
```

