# Cloud Code Prompt

```text
You are building Project 03: Accounting, Invoices, And Margin.

Read every file in this folder before coding.

Goal:
Build a Node.js + TypeScript Cloud API endpoint that calculates monthly sales, costs, profit, and margin by apartment.

Constraints:
- Start with Google Sheets data.
- Zoho Books is phase 2, not phase 1.
- Do not create Zoho records unless explicitly asked and credentials exist.
- Make.com will run the monthly schedule and call the Cloud API.

Build:
- POST /api/accounting/monthly-summary
- Numeric validation.
- Month filtering helpers.
- Profit and margin calculations.
- Unit tests for calculations.
- .env.example.
- README for local run and deployment.

Acceptance:
- Valid monthly payload returns summary by apartment.
- Costs are grouped by apartment.
- Margin handles zero gross sales without crashing.
- All endpoints require Authorization: Bearer API_SECRET.
```

