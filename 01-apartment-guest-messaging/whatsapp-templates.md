# WhatsApp Cloud API Templates

All three guest messages are **business-initiated**, so they must be sent as
**pre-approved templates** (free-form text is only allowed within 24h of an
inbound message from the guest). Create these in Meta Business Manager →
WhatsApp Manager → Message Templates. Category: **UTILITY**. Languages: Arabic
(`ar`) and English (`en`).

> Approval takes a few hours up to ~2 business days. Start this on day one — all
> automatic sending depends on it. Approved templates cannot be edited; you
> create a new one. Until approval, run the service in `WHATSAPP_MODE=manual_link`.

WhatsApp uses **positional** parameters (`{{1}}`, `{{2}}`, …). The links are
passed as plain **body text parameters** (not dynamic URL buttons) to avoid
Meta's same-base-domain constraint and keep a single template per language.

## Template names (env)

| Type | Arabic | English |
| --- | --- | --- |
| access | `WA_TEMPLATE_ACCESS_AR` (apt_access_ar) | `WA_TEMPLATE_ACCESS_EN` (apt_access_en) |
| checkout | `WA_TEMPLATE_CHECKOUT_AR` (apt_checkout_ar) | `WA_TEMPLATE_CHECKOUT_EN` (apt_checkout_en) |
| review | `WA_TEMPLATE_REVIEW_AR` (apt_review_ar) | `WA_TEMPLATE_REVIEW_EN` (apt_review_en) |

## 1) apt_access_ar — UTILITY, ar (on booking / morning of check-in)

Body:

```
أهلا {{1}}، تم تأكيد حجزك في {{2}}.

تاريخ الدخول: {{3}}
وقت الدخول: {{4}}

إرشادات الدخول:
{{5}}

دليل الدخول والمبنى (صورة المدخل وفيديو الشرح):
{{6}}
```

Parameters: `{{1}}=guest_name`, `{{2}}=apartment_name`, `{{3}}=check_in_date`,
`{{4}}=check_in_time`, `{{5}}=access_guideline`, `{{6}}=landing_url`.

## 2) apt_checkout_ar — UTILITY, ar (one night before checkout)

Body:

```
أهلا {{1}}، تذكير بسيط بأن موعد الخروج من {{2}} هو {{3}} الساعة {{4}}.

إرشادات الخروج:
{{5}}

شكرا لاختيارك الإقامة معنا.
```

Parameters: `{{1}}=guest_name`, `{{2}}=apartment_name`, `{{3}}=check_out_date`,
`{{4}}=check_out_time`, `{{5}}=checkout_guideline`.

## 3) apt_review_ar — UTILITY, ar (one day after checkout)

Body:

```
أهلا {{1}}، سعدنا باستضافتك في {{2}}.

إذا كانت تجربتك جيدة، نقدر تكتب لنا تقييمك في Airbnb:
{{3}}

شكرا لك.
```

Parameters: `{{1}}=guest_name`, `{{2}}=apartment_name`, `{{3}}=airbnb_review_url`.

## English variants

Create `apt_access_en`, `apt_checkout_en`, `apt_review_en` with the same
positional mapping, using the English strings in
`templates/message_templates.json`.

## Sent payload (cloud_api)

The service builds this Graph API request (`services/whatsapp.ts`):

```json
{
  "messaging_product": "whatsapp",
  "to": "9665XXXXXXXX",
  "type": "template",
  "template": {
    "name": "apt_access_ar",
    "language": { "code": "ar" },
    "components": [
      { "type": "body", "parameters": [
        { "type": "text", "text": "Ahmed" },
        { "type": "text", "text": "Riyadh Apartment 1" },
        { "type": "text", "text": "2026-06-10" },
        { "type": "text", "text": "15:00" },
        { "type": "text", "text": "رمز الباب 1234" },
        { "type": "text", "text": "https://your-app.vercel.app/api/landing/apt_01?lang=ar" }
      ] }
    ]
  }
}
```

## Prerequisites checklist

- [ ] Meta Business account + Business **verification** (raises limits beyond the
      ~250 conversations/24h unverified cap).
- [ ] WhatsApp Business Account + a phone number (or the free test number first).
- [ ] Permanent system-user access token → `WHATSAPP_CLOUD_TOKEN`.
- [ ] `WHATSAPP_PHONE_NUMBER_ID`.
- [ ] Six approved templates (ar/en × 3).
- [ ] Webhook configured to `/api/webhooks/whatsapp` with `WHATSAPP_VERIFY_TOKEN`
      and `WHATSAPP_APP_SECRET`.
- [ ] Guest consent to WhatsApp contact (Airbnb messaging consent is not the same
      as WhatsApp opt-in).
