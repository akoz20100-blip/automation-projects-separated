# Commands

The implementation lives in `service/`. Run these from that folder.

## Install

```bash
cd service
npm install
```

## Development

```bash
npm run dev          # http://localhost:3000
```

## Test / Type Check

```bash
npm test
npm run typecheck
```

## Curl: preview messages (manual_link mode, no credentials needed)

```bash
curl -X POST http://localhost:3000/api/reservations/prepare-messages \
  -H "Authorization: Bearer local_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "reservation_id": "AIRBNB-2026-0001",
    "apartment_id": "apt_01",
    "apartment_name": "Riyadh Apartment 1",
    "guest_name": "Ahmed",
    "guest_phone": "+966 512345678",
    "guest_language": "ar",
    "check_in_date": "2026-06-10",
    "check_out_date": "2026-06-13",
    "check_in_time": "15:00",
    "check_out_time": "12:00",
    "access_guideline": "رمز الباب 1234",
    "checkout_guideline": "اطفئ المكيف واترك المفتاح",
    "airbnb_review_url": "https://airbnb.com/"
  }'
```

## Curl: OCR intake (booking screenshot)

```bash
curl -X POST http://localhost:3000/api/intake/ocr \
  -H "Authorization: Bearer local_secret" \
  -F "image=@booking.png"
```

## Curl: send one message (reads Google Sheets)

```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "Authorization: Bearer local_secret" -H "Content-Type: application/json" \
  -d '{ "reservation_id": "AIRBNB-2026-0001", "message_type": "access" }'
```

## Curl: due messages + landing page

```bash
curl "http://localhost:3000/api/messages/due?type=checkout" \
  -H "Authorization: Bearer local_secret"

open "http://localhost:3000/api/landing/apt_01?lang=ar"
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

