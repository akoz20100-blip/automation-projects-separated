# Commands

Use these after Cloud Code creates the actual API project.

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

## Test

```bash
npm test
```

## Curl Test

```bash
curl -X POST http://localhost:3000/api/accounting/monthly-summary \
  -H "Authorization: Bearer local_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "month": "2026-06",
    "reservations": [
      {
        "apartment_id": "apt_01",
        "check_in_date": "2026-06-10",
        "check_out_date": "2026-06-13",
        "total_amount": 1200,
        "platform_fee": 180,
        "cleaning_fee": 100
      }
    ],
    "maintenance_requests": [
      {
        "apartment_id": "apt_01",
        "cost": 300,
        "closed_at": "2026-06-15T10:00:00+03:00"
      }
    ],
    "expenses": [
      {
        "apartment_id": "apt_01",
        "category": "supplies",
        "amount": 200,
        "date": "2026-06-20"
      }
    ]
  }'
```

## GitHub

```bash
git init
git add .
git commit -m "Build accounting invoices and margin automation"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/accounting-invoices-margin.git
git push -u origin main
```

