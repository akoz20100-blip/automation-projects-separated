# Apartment Guest Messaging — Cloud API

Automatic guest messaging for Airbnb apartments:

- **OCR intake** — read a booking screenshot (name, phone, dates) via an
  OpenAI-compatible vision model (provider-agnostic; use any cheap accurate
  model such as a Qwen2.5-VL variant through OpenRouter or your own aggregator).
- **WhatsApp sending** — send approved WhatsApp Cloud API templates for the
  access, checkout-reminder and review messages. Falls back to `wa.me` links
  (`WHATSAPP_MODE=manual_link`) until your templates are approved.
- **Landing page** — a lightweight, brand-themeable per-apartment guide page
  (entrance photo + how-to-enter video + building info) linked from the messages.
- **Smart locks (TTLock)** — on each new booking, issue a time-limited keyboard
  passcode (the guest's last-4 phone digits) valid check-in 16:00 → checkout 12:00.
- **Google Sheets** — Reservations / Apartments / MessageLog as the data store.

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | – | liveness + current mode |
| POST | `/api/intake/ocr` | Bearer | extract reservation fields from a screenshot |
| POST | `/api/reservations/prepare-messages` | Bearer | render all 3 messages from a payload (preview) |
| POST | `/api/reservations/due-message` | Bearer | render one message by type |
| POST | `/api/messages/send` | Bearer | send one message for a reservation (sheets) |
| GET | `/api/messages/due?type=checkout\|review` | Bearer | list reservations due today |
| GET | `/api/landing/:apartment_id?lang=ar\|en` | public | guest guide page |
| GET/POST | `/api/webhooks/whatsapp` | Meta sig | verification + delivery status |
| POST | `/api/telegram/webhook` | secret token | intake bot (screenshot → reservation → passcode) |
| GET | `/api/ttlock/locks` | Bearer | list TTLock locks (to fill `TTLOCK_LOCKS`) |

## Run locally

```bash
cp .env.example .env     # fill in values; manual_link works with no credentials
npm install
npm run dev              # http://localhost:3000
npm test                 # unit tests
npm run typecheck
```

Quick check (no external services needed, `manual_link` mode):

```bash
curl -s localhost:3000/api/reservations/prepare-messages \
  -H "Authorization: Bearer local_secret" -H "Content-Type: application/json" \
  -d '{"reservation_id":"R1","apartment_id":"apt_01","apartment_name":"Riyadh Apartment 1",
       "guest_name":"Ahmed","guest_phone":"+966 512345678","guest_language":"ar",
       "check_in_date":"2026-06-10","check_out_date":"2026-06-13",
       "access_guideline":"رمز الباب 1234","checkout_guideline":"اطفئ المكيف"}'
```

## Modes

- `WHATSAPP_MODE=manual_link` (default): every send returns a `wa.me` link. No
  WhatsApp credentials required. Use this until templates are approved.
- `WHATSAPP_MODE=cloud_api`: sends approved templates via the Meta Graph API.
  Requires `WHATSAPP_CLOUD_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and the six
  approved template names (see `../whatsapp-templates.md`).

## Configuration

All variables are documented in `.env.example`. The OCR provider is configured
with `OCR_API_BASE_URL`, `OCR_API_KEY`, `OCR_MODEL` — point them at your existing
model aggregator and pick the cheapest accurate Arabic+English vision model.

## Smart locks (TTLock)

When the four TTLock credentials are set, the Telegram intake bot issues a
per-guest keyboard passcode the moment a booking is registered:

- **Code** = the last 4 digits of the guest's phone (`966502305331` → `5331`). TTLock
  rejects "too simple" codes (consecutive/repeated, errcode -2032); when the last-4
  is one of those, the next 4-digit window of the phone is used instead.
- **Window** = check-in `16:00` → checkout `12:00` in `DEFAULT_TIMEZONE`
  (uses the reservation's own times when present, else `TTLOCK_CHECKIN_TIME` /
  `TTLOCK_CHECKOUT_TIME`). The code auto-expires at checkout.
- The issued code is saved on the reservation (`door_code`) and rendered in the
  guest's WhatsApp access message + on the landing page.

Setup:

1. Create an app on the TTLock Open Platform (EU console: `euopen.ttlock.com`)
   and copy `client_id` / `client_secret` into `TTLOCK_CLIENT_ID` /
   `TTLOCK_CLIENT_SECRET`.
2. Set `TTLOCK_USERNAME` / `TTLOCK_PASSWORD` to the TTLock **app account** that
   owns the locks.
3. Call `GET /api/ttlock/locks` once to read each `lockId`, then map them with
   `TTLOCK_LOCKS=apt_01:1234567,apt_02:7654321`.

> **Gateway requirement.** Writing a *custom* code (the last-4-of-phone) remotely
> uses `keyboardPwd/add` with `addType=2`, which needs the lock to be **online and
> bound to a TTLock WiFi gateway** (G2/G3/G5) — confirm via `GET /api/ttlock/locks`
> (each lock shows `hasGateway`). If a lock has no gateway, the API returns
> errcode `-2012` ("not connected to a gateway") and no custom code can be pushed;
> set `TTLOCK_FALLBACK_TO_GENERATED=true` to instead issue a gateway-free,
> system-generated period code (works offline, but it is **not** the last-4 code).

## Deploy

Vercel is the simplest target (serves both API and landing page from one
domain). See `../../shared/deployment-options.md`. Set the same env vars in the
deployment, and point `LANDING_BASE_URL` at the deployed domain so message links
resolve correctly.

## Safety gates

- **Human confirmation before auto-send**: a reservation with
  `ocr_needs_review=true` is refused by `/api/messages/send`. The operator
  verifies the phone/name first.
- **Idempotency**: `MessageLog` prevents sending the same
  `(reservation_id, message_type)` twice (pass `force:true` to override).
