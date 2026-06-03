# Project 02: Maintenance Customer Care

**Capture every maintenance request and hand it to the right person as a ready-to-send WhatsApp message.**

> **At a glance** — **Status:** Phase 1, manual `wa.me` links · **Stack:** Make.com → Cloud API → WhatsApp · **Feeds:** accounting project (maintenance costs)

↩ Back to [all projects](../README.md)

## Goal

Capture maintenance requests and route them to the responsible local person or provider.

Current business context:

- `msool` probably has no API.
- Temporary solution is to prepare a WhatsApp message/link for the handler.
- Maintenance costs later feed the accounting project.

## Phase 1 Output

When a maintenance request is added:

1. Make.com detects the request.
2. Make.com calls Cloud API.
3. Cloud API validates and formats the issue.
4. Cloud API returns a WhatsApp link for the handler.
5. Make.com updates Google Sheets.

## Files

- [`README.md`](README.md) — this overview
- [`project-plan.md`](project-plan.md) — phased build plan
- [`make-scenarios.md`](make-scenarios.md) — Make.com scenario setup
- [`cloud-api.md`](cloud-api.md) — Cloud API contract
- [`commands.md`](commands.md) — Cloud Code commands
- [`prompts/cloud-code-prompt.md`](prompts/cloud-code-prompt.md) — Cloud Code handoff prompt
- [`templates/maintenance_requests.csv`](templates/maintenance_requests.csv) — maintenance request input sheet

