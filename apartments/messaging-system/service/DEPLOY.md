# 🚀 النشر على Vercel + التشغيل الكامل (Go-Live)

الخدمة جاهزة للنشر: `api/index.ts` نقطة الدخول، و`vercel.json` يوجّه كل الطلبات لها
ويعرّف مهام الجدولة (Cron). Vercel يبني TypeScript تلقائياً (ما يحتاج `dist/`).

## 1) النشر
1. [vercel.com](https://vercel.com) → **Add New → Project** → استورد ريبو `automation-projects-separated`.
2. **Root Directory** = `apartments/messaging-system/service` ← مهم جداً.
3. Framework Preset = **Other** (اترك Build/Output فاضية).
4. أضف متغيّرات البيئة (القسم 2) → **Deploy**.
5. بعد النشر، جرّب صفحة الدليل: `https://<مشروعك>.vercel.app/api/landing/apt_01?lang=ar`

> الصفحة تعمل **بدون** Google Sheets (fallback لبيانات ديمورا الافتراضية). الشيت
> مطلوب فقط للرسائل التلقائية وتخزين الحجوزات.

## 2) متغيّرات البيئة
انسخ من `.env.example`. أهمها للتشغيل الحي:
```
WHATSAPP_MODE=wasender
WASENDER_API_KEY=<جديد بعد التدوير>
API_SECRET=<توكن تخترعه لحماية الـAPI>      # يُرسَل كـ Bearer مع /api/intake و/messages و/reservations
CRON_SECRET=<توكن تخترعه>                   # يحمي /api/cron/* (Vercel يرسله تلقائياً)
OCR_API_BASE_URL=https://openrouter.ai/api/v1
OCR_API_KEY=<OpenRouter جديد>
OCR_MODEL=google/gemini-3.5-flash
GOOGLE_SHEETS_ID=<id الجدول>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<...@...iam.gserviceaccount.com>
GOOGLE_PRIVATE_KEY=<المفتاح الخاص — اقتبسه أو استبدل الأسطر بـ \n>
OWNER_NOTIFY_ENABLED=true   OWNER_PHONE=9665XXXXXXXX
CLEANER_NOTIFY_ENABLED=true CLEANER_PHONE=966578090132  CLEANER_NAME=Sara
LANDING_BASE_URL=https://<مشروعك>.vercel.app
DEFAULT_TIMEZONE=Asia/Riyadh
```
> 🔐 **جدّد المفاتيح المكشوفة سابقاً بالشات (OpenRouter + WasenderAPI) قبل استخدامها.**

## 3) الجدولة التلقائية (Vercel Cron) — رسائل سارة والتذكيرات
معرّفة في `vercel.json` وتشتغل تلقائياً بعد النشر (بتوقيت UTC، والرياض = UTC+3):
| المهمة | الوقت (الرياض) | ترسل |
|---|---|---|
| `/api/cron/evening` | 23:00 | تذكير خروج للضيف + `owner_checkout` + `cleaner_checkout` (لحجوزات الغد) |
| `/api/cron/midday` | 12:00 | `owner_check` + `cleaner_check` (خروج اليوم) + طلب تقييم (خروج أمس) |

- كل إرسال **idempotent** (لا يتكرر) عبر سجل `MessageLog`.
- لتشغيل يدوي للاختبار: `GET /api/cron/evening?key=<CRON_SECRET>`.
- تحتاج Google Sheets مهيّأ ليجد الحجوزات المستحقّة (وإلا يرجع نتيجة فاضية بسلام).

## 4) بنية Google Sheet (٣ تبويبات، الصف الأول = العناوين)
**Reservations**:
`reservation_id, source, apartment_id, apartment_name, guest_name, guest_phone,
guest_language, check_in_date, check_out_date, check_in_time, check_out_time,
status, ocr_needs_review, guest_phone_confidence, airbnb_review_url, door_code`

**Apartments**:
`apartment_id, apartment_name, default_check_in_time, default_check_out_time,
access_guideline, checkout_guideline, airbnb_listing_url, airbnb_review_url,
maintenance_contact_phone, entrance_photo_url, video_url, building_info,
landing_lang_default`

**MessageLog** (يكتبه النظام تلقائياً):
`timestamp, reservation_id, message_type, channel, recipient_phone, template_name,
language, wa_message_id, status, error_code, rendered_text, sent_at`

> قوالب جاهزة في `../templates/reservations.csv` و`../templates/apartments.csv`.
> التواريخ `YYYY-MM-DD`، الأوقات `HH:mm`، الجوال دولي `9665XXXXXXXX`.

### إنشاء Service Account
1. Google Cloud Console → مشروع جديد → فعّل **Google Sheets API**.
2. **IAM → Service Accounts** → أنشئ حساباً → أنشئ مفتاح **JSON**.
3. خذ `client_email` و`private_key` من ملف JSON → ضعهما في `GOOGLE_SERVICE_ACCOUNT_EMAIL` و`GOOGLE_PRIVATE_KEY`.
4. **شارك** ملف الشيت مع `client_email` (صلاحية Editor). ضع معرّف الشيت في `GOOGLE_SHEETS_ID`.

## 5) الصور
الصور مدمجة base64 في `docs/index.html` (صفحة Pages مكتفية ذاتياً). للباك-إند،
روابط `src/data/guestGuide.ts` تشير لـ `raw.githubusercontent.com/.../main/...`
— تعمل بعد دمج الفرع إلى `main` (الريبو عام). أو غيّر `MEDIA_BASE` لمسار github.io.

## 6) بقي عليك
- ▶️ فيديو الدخول Unlisted على يوتيوب (الرابط مضبوط في `guestGuide.ts`).
- 🔑 (اختياري) TTLock API لرموز أبواب مؤقتة لكل ضيف بدل المجمّع الدائم في `doorCodes.ts`.
- 🧪 OCR: ارفع لقطة حجز عبر `POST /api/intake/ocr` (Bearer) لاستخراج الاسم/الجوال/التواريخ.
