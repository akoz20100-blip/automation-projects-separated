# Accounting, Invoices, And Margin Plan

## Workflow

```text
Reservations + MaintenanceRequests + Expenses
        |
        v
Make.com monthly scheduler
        |
        v
Cloud API /api/accounting/monthly-summary
        |
        v
MonthlySales sheet + owner summary
```

## Phase 1 Calculations

- Nights booked.
- Gross sales.
- Platform fees.
- Cleaning costs.
- Maintenance costs.
- Other costs.
- Net sales.
- Profit.
- Margin percentage.
- Occupancy by apartment later.

## Formula Definitions

```text
net_sales = gross_sales - platform_fees
total_costs = cleaning_costs + maintenance_costs + other_costs
profit = net_sales - total_costs
margin_percent = profit / gross_sales * 100
```

## Phase 2 Zoho Books

Add after phase 1 is stable:

- Create invoices for direct bookings.
- Create expenses for platform fees.
- Create expenses for maintenance.
- Sync monthly accounting summary.

