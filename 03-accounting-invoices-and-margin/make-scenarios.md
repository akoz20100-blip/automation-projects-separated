# Make.com Scenarios

## Scenario 1: Monthly Sales And Margin Summary

Name:

```text
ACC - Monthly Sales And Margin Summary
```

Trigger:

```text
Make Scheduler
Run: first day of month at 09:00 Asia/Riyadh
```

Steps:

1. Pull previous month rows from `Reservations`.
2. Pull previous month rows from `MaintenanceRequests`.
3. Pull previous month rows from `Expenses`.
4. HTTP POST to Cloud API:
   - `/api/accounting/monthly-summary`
5. Update `MonthlySales`.
6. Notify owner/admin with summary.

## Scenario 2: Zoho Books Sync

Name:

```text
ACC - Zoho Books - Sync Monthly Records
```

Trigger:

```text
Manual or after Scenario 1
```

Run only after Zoho is ready.

Steps:

1. Read approved monthly summary.
2. Create/update Zoho Books invoice records if needed.
3. Create expense records for platform fees and maintenance.
4. Save Zoho record IDs back to Google Sheets.

