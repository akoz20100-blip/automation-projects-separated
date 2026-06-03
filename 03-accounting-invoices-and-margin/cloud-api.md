# Cloud API For Accounting, Invoices, And Margin

## Endpoint

### POST /api/accounting/monthly-summary

Purpose:

- Calculate monthly sales, costs, profit, and margin by apartment.

Input:

```json
{
  "month": "2026-06",
  "reservations": [],
  "maintenance_requests": [],
  "expenses": []
}
```

Output:

```json
{
  "month": "2026-06",
  "apartments": [
    {
      "apartment_id": "apt_01",
      "nights_booked": 12,
      "gross_sales": 5000,
      "platform_fees": 750,
      "cleaning_costs": 400,
      "maintenance_costs": 300,
      "other_costs": 200,
      "net_sales": 4250,
      "profit": 3350,
      "margin_percent": 67
    }
  ]
}
```

## Optional Endpoint Later

### POST /api/accounting/zoho-sync

Use only after Zoho Books credentials and process are ready.

## Environment Variables

```text
APP_ENV=development
API_SECRET=local_secret
DEFAULT_TIMEZONE=Asia/Riyadh
GOOGLE_SHEETS_ID=
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
ZOHO_ORGANIZATION_ID=
```

## Validation Rules

- `month` must be `YYYY-MM`.
- Reservation totals must be numeric.
- Costs must be numeric.
- Margin calculation must handle zero gross sales.
- Zoho sync must be disabled unless credentials exist.

