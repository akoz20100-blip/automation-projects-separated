# Dimora & Business Automation

Dimora guest messaging plus separate maintenance and accounting automation projects.

## Start here · ابدأ هنا

**Current merged version: [`main`](https://github.com/akoz20100-blip/automation-projects-separated/tree/main).**

- [Dimora service — edit here](apartments/messaging-system/service)
- [Service deployment guide](apartments/messaging-system/service/DEPLOY.md)
- [Published guest guide](docs/index.html)
- [Maintenance workflow](02-maintenance-customer-care)
- [Accounting workflow](03-accounting-invoices-and-margin)
- [Current handoff](HANDOFF.md)

Use `main`. The Dimora service work is already merged; the old handoff branch is no longer the place to start. Edit service source, then use its build process to regenerate the guest guide. Five unused duplicate source-photo copies were removed; the named photos remain in `apartments/landing-page/images/`.

<details>
<summary>Technical documentation and project background · التفاصيل التقنية</summary>

# Automation Projects Separated

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

1. `01-apartment-guest-messaging`
2. `02-maintenance-customer-care`
3. `03-accounting-invoices-and-margin`

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

</details>
