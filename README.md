# Automation Projects Separated

**Three independent automation projects — guest messaging, maintenance care, and accounting — sharing one Make.com → Cloud API backbone.**

> **At a glance** — **Status:** Phase 1 across all projects · **Orchestration:** Make.com · **Business logic:** Cloud Code / Cloud API · **Messaging:** manual `wa.me` links first

This folder separates the automation work into three independent projects.

Each project can be copied into GitHub or handed to Cloud Code/Codex separately.

## Projects

```text
automation-projects-separated/
  01-apartment-guest-messaging/
  02-maintenance-customer-care/
  03-accounting-invoices-and-margin/
  shared/
```

## Recommended Build Order

1. [`01-apartment-guest-messaging`](01-apartment-guest-messaging/README.md)
2. [`02-maintenance-customer-care`](02-maintenance-customer-care/README.md)
3. [`03-accounting-invoices-and-margin`](03-accounting-invoices-and-margin/README.md)

## Shared Architecture

```text
Google Sheets / manual input / PMS later
        |
        v
Make.com scenarios
        |
        v
Cloud API / Cloud Code
        |
        v
WhatsApp links, WhatsApp Cloud API later, Zoho Books later
```

## Current Important Constraints

- Use manual WhatsApp `wa.me` links first.
- Do not automate the regular WhatsApp app.
- Use WhatsApp Business Cloud API only after the official Meta setup is ready.
- Do not assume direct Airbnb API access.
- Put business rules in Cloud Code.
- Keep Make.com as the orchestration layer.

## How To Hand Off To Cloud Code

For each project, start with:

```text
Read the project README first, then follow prompts/cloud-code-prompt.md.
Build only the project in this folder unless explicitly asked to connect the other projects.
```

