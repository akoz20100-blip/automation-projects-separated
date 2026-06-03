# Project 03: Accounting, Invoices, And Margin

## Goal

Calculate monthly sales, costs, invoices, and profit margin.

Current business context:

- Start with Google Sheets.
- Zoho Books is planned but not launched.
- Apartment reservation revenue and maintenance costs should feed monthly reporting.

## Phase 1 Output

At the start of every month:

1. Make.com pulls previous month reservations.
2. Make.com pulls maintenance costs and expenses.
3. Make.com calls Cloud API.
4. Cloud API returns sales, costs, profit, and margin by apartment.
5. Make.com updates `MonthlySales`.

## Future Upgrade

Add Zoho Books after the monthly calculations are stable.

## Files

```text
README.md
project-plan.md
make-scenarios.md
cloud-api.md
commands.md
prompts/cloud-code-prompt.md
templates/monthly_sales.csv
templates/expenses.csv
```

