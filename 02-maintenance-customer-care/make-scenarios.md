# Make.com Scenarios

## Scenario 1: New Maintenance Request

Name:

```text
MAINT - New Request - Route To Handler
```

Trigger:

```text
Google Sheets > Watch New Rows
Sheet: MaintenanceRequests
```

Filters:

- `status = new`
- `handler_phone is not empty`

Steps:

1. Watch new maintenance request.
2. HTTP POST to Cloud API:
   - `/api/maintenance/prepare-request`
3. Update row:
   - `handler_whatsapp_link`
   - `status = assigned`
4. Notify owner/admin with prepared WhatsApp link.

## Scenario 2: Maintenance Done

Name:

```text
MAINT - Request Done - Log Cost
```

Trigger:

```text
Google Sheets > Watch Updated Rows
Sheet: MaintenanceRequests
```

Filters:

- `status = done`
- `cost is not empty`

Steps:

1. Detect completed request.
2. Save `closed_at`.
3. Ensure cost is available for monthly accounting.
4. Optional: notify owner/admin.

