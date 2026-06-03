# Maintenance Customer Care Plan

## Workflow

```text
Maintenance request row
        |
        v
Make.com Watch New Rows
        |
        v
Cloud API /api/maintenance/prepare-request
        |
        v
Handler WhatsApp link + status update
```

## Request Lifecycle

```text
new -> assigned -> in_progress -> done
```

Optional statuses:

```text
cancelled
waiting_for_guest
waiting_for_parts
```

## Priority Rules

Urgent:

- Electricity failure.
- Water leak.
- AC not working during guest stay.
- Door/access issue.

Normal:

- Minor repair.
- Furniture issue.
- Post-checkout maintenance.

Low:

- Improvement request.
- Non-urgent inspection.

## Accounting Link

When a request becomes `done`, save:

- Final cost.
- Apartment.
- Date.
- Category.

This cost feeds Project 03 monthly margin.

