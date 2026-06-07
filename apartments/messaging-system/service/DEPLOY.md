# 🚀 النشر على Vercel

الخدمة جاهزة للنشر: `api/index.ts` نقطة الدخول، و `vercel.json` يوجّه كل
الطلبات لها. Vercel يبني TypeScript تلقائياً (ما يحتاج `dist/` مبني مسبقاً).

## الخطوات
1. [vercel.com](https://vercel.com) → **Add New → Project** → استورد ريبو
   `automation-projects-separated`.
2. **Root Directory** = `apartments/messaging-system/service` ← مهم جداً.
3. Framework Preset = **Other**. (Build/Output اتركها فاضية.)
4. أضف متغيّرات البيئة (تحت) → **Deploy**.
5. بعد النشر، صفحة الدليل:
   `https://<مشروعك>.vercel.app/api/landing/apt_01?lang=ar`

## متغيّرات البيئة

### الحد الأدنى (لعرض صفحة الدليل فقط)
الصفحة تشتغل **بدون** Google Sheets (fallback لبيانات ديمورا الافتراضية):
```
LANDING_BASE_URL=https://<مشروعك>.vercel.app
BRAND_PRIMARY_COLOR=#2E5D4F
BRAND_SECONDARY_COLOR=#F6F1E7
```

### للنظام الكامل (رسائل + OCR + تخزين)
```
API_BEARER_TOKEN=<توكن تخترعه لحماية الـAPI>
WHATSAPP_MODE=wasender
WASENDER_API_KEY=<مفتاحك>
OCR_API_BASE_URL=https://openrouter.ai/api/v1
OCR_API_KEY=<مفتاحك>
OCR_MODEL=google/gemini-2.5-flash
GOOGLE_SHEETS_ID=<id الجدول>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<حساب الخدمة>
GOOGLE_PRIVATE_KEY=<المفتاح الخاص>
OWNER_PHONE=...   CLEANER_PHONE=...
```
> 🔐 جدّد المفاتيح المكشوفة سابقاً بالشات قبل استخدامها.

## ربط الصور (بعد جعل الريبو عاماً)
لما يصير الريبو عام والكود على `main`، تقدر تستخدم روابط raw مباشرة:
```
https://raw.githubusercontent.com/akoz20100-blip/automation-projects-separated/main/apartments/landing-page/images/wayfinding.png
```
ضعها في `src/data/guestGuide.ts` (`media.wayfindingImageUrl` / `heroImageUrl` /
`brand.logoUrl`). أو ارفعها على `akoz20100-blip.github.io/dimora/`.
