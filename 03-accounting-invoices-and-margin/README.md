# Project 03: Accounting, Invoices, And Margin

**Roll monthly reservations, costs, and expenses into sales, profit, and margin per apartment.**

> **At a glance** — **Status:** Phase 1, Google Sheets · **Stack:** Make.com → Cloud API → `MonthlySales` · **Next:** Zoho Books

↩ Back to [all projects](../README.md)

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

- [`README.md`](README.md) — this overview
- [`project-plan.md`](project-plan.md) — phased build plan
- [`make-scenarios.md`](make-scenarios.md) — Make.com scenario setup
- [`cloud-api.md`](cloud-api.md) — Cloud API contract
- [`commands.md`](commands.md) — Cloud Code commands
- [`prompts/cloud-code-prompt.md`](prompts/cloud-code-prompt.md) — Cloud Code handoff prompt
- [`templates/monthly_sales.csv`](templates/monthly_sales.csv) — monthly sales output sheet
- [`templates/expenses.csv`](templates/expenses.csv) — expenses input sheet

