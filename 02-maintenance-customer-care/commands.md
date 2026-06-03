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
curl -X POST http://localhost:3000/api/maintenance/prepare-request \
  -H "Authorization: Bearer local_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "maint_0001",
    "reservation_id": "AIRBNB-2026-0001",
    "apartment_id": "apt_01",
    "apartment_name": "Riyadh Apartment 1",
    "guest_name": "Ahmed",
    "guest_phone": "9665XXXXXXXX",
    "issue_type": "AC",
    "priority": "urgent",
    "description": "AC not cooling",
    "handler_phone": "9665XXXXXXXX"
  }'
```

## GitHub

```bash
git init
git add .
git commit -m "Build maintenance customer care automation"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/maintenance-customer-care.git
git push -u origin main
```

