# Project 02: Maintenance Customer Care

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

```text
README.md
project-plan.md
make-scenarios.md
cloud-api.md
commands.md
prompts/cloud-code-prompt.md
templates/maintenance_requests.csv
```

