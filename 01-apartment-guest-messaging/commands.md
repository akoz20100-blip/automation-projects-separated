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

## Type Check

```bash
npm run typecheck
```

## Curl Test

```bash
curl -X POST http://localhost:3000/api/reservations/prepare-messages \
  -H "Authorization: Bearer local_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "reservation_id": "AIRBNB-2026-0001",
    "source": "airbnb",
    "apartment_id": "apt_01",
    "apartment_name": "Riyadh Apartment 1",
    "guest_name": "Ahmed",
    "guest_phone": "9665XXXXXXXX",
    "guest_language": "ar",
    "check_in_date": "2026-06-10",
    "check_out_date": "2026-06-13",
    "check_in_time": "15:00",
    "check_out_time": "12:00",
    "access_guideline": "Door code and parking details",
    "checkout_guideline": "Switch off AC and leave the key",
    "airbnb_review_url": "https://airbnb.com/"
  }'
```

## GitHub

```bash
git init
git add .
git commit -m "Build apartment guest messaging automation"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/apartment-guest-messaging.git
git push -u origin main
```

