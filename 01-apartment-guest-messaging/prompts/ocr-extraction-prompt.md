# OCR Extraction Prompt

The `/api/intake/ocr` endpoint reads an Airbnb booking screenshot and extracts
the reservation fields using an **OpenAI-compatible vision model**
(`services/ocr.ts`). The model is configurable and provider-agnostic — point
`OCR_API_BASE_URL` / `OCR_API_KEY` / `OCR_MODEL` at any cheap, accurate
Arabic+English vision model (e.g. a Qwen2.5-VL variant via OpenRouter).

## System prompt

The byte-stable system prompt lives in `service/src/prompts/ocrSystemPrompt.ts`
and instructs the model to return ONLY JSON in this shape:

```json
{
  "guest_name": "string|null",
  "guest_phone": "string|null",
  "guest_phone_confidence": "high|medium|low",
  "check_in_date": "YYYY-MM-DD|null",
  "check_out_date": "YYYY-MM-DD|null",
  "check_in_time": "HH:mm|null",
  "check_out_time": "HH:mm|null",
  "reservation_code": "string|null",
  "source": "string|null"
}
```

## Rules enforced

- Phone: digits-only international format **without `+`**; Arabic-Indic digits
  converted to Latin. Partial/masked → `confidence: low`. Missing → `null`.
- Dates normalized to `YYYY-MM-DD`.
- Never invent data; missing fields are `null`.
- Names keep their original script (Arabic stays Arabic).

## Post-processing (`buildResult`)

After extraction the service:

1. Validates the JSON (Zod) and **normalizes the phone** (`domain/phone.ts`).
2. Produces `warnings` and sets `needs_review = true` when the phone is missing
   / low-confidence, dates are incomplete, or the name is absent.

`needs_review = true` is a hard gate: the reservation cannot be auto-sent until a
human confirms it (the Make scenario filters on `ocr_needs_review = false`). This
protects against OCR mistakes and against messaging a wrong number.

## Request / response

Request: `multipart/form-data` with field `image` (PNG/JPG), or JSON
`{ "image_base64": "...", "mime": "image/png" }`.

Response:

```json
{
  "extracted": { "guest_name": "محمد", "guest_phone": "966512345678", "guest_phone_confidence": "high",
                 "check_in_date": "2026-06-10", "check_out_date": "2026-06-13",
                 "check_in_time": "15:00", "check_out_time": "12:00",
                 "reservation_code": "HMABCDEFG", "source": "airbnb" },
  "warnings": [],
  "needs_review": false
}
```
