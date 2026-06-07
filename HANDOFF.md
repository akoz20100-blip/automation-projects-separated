# Dimora — ملخّص الحالة (Handoff)

> انسخ هذا الملف في بداية أي جلسة جديدة لاستئناف العمل.

## المستودع والفرع
- Repo: `akoz20100-blip/automation-projects-separated` (Public).
- فرع العمل: `claude/youthful-gates-QgDBw` → **Draft PR #4** (كل الشغل هنا).
- صفحة Pages المنشورة: تُحدّث تلقائياً عند كل push للفرع من مجلد `/docs`:
  **https://akoz20100-blip.github.io/automation-projects-separated/**

## ✅ المُنجَز
- **التصميم (معتمد):** فاتح أبل-ستايل + **أخضر سَيج `#889970` (لون شعار ديمورا)** كلون
  واحد للأيقونات/الأزرار/النقاط/CTA. خطوط ثمانية (Serif + Sans، مدمجة base64).
  خلفية صورة صالة واضحة خلف الهيرو، إطار نافذة متصفّح للصور، صورة المبنى/المواقف
  بالحجم الكامل، مبدّل D1/D2 بيل، شريط أرقام (16:00 · 12:00 · 24/7).
- **ترتيب الأقسام:** هيرو → فيديو → صورة العمارة → الموقع → أرقام → اختيار الوحدة →
  معلومات → قوانين → أماكن قريبة → تواصل.
- **التواصل:** واتساب `966548499870` + إيميل `Dimora.residence.sa@gmail.com` +
  بطاقة موقع بصورة خريطة (المباني أصلية، الشعار+النقطة بدرجة السَّيج) وزر
  «الاتجاهات عبر خرائط جوجل» → `https://maps.google.com/?q=24.643702,46.550613`.
- **مهارة تصميم قابلة لإعادة الاستخدام:** `.claude/skills/dimora-design/` (SKILL.md +
  fonts.css base64 + tokens.css + components.css + starter.html + الخطوط+الترخيص).
  تظهر مع `/dimora-design`. للاستخدام عالمياً: انسخ المجلد إلى `~/.claude/skills/`.
- **الجدولة التلقائية (Vercel Cron):** `/api/cron/evening` 23:00 و`/api/cron/midday` 12:00
  ترسل تذكيرات الضيف + إشعارات المالك + **رسائل سارة** (cleaner_checkout / cleaner_check)
  + طلب التقييم. idempotent. محميّة بـ `CRON_SECRET`.
- **الكود:** OCR (OpenRouter + gemini-3.5-flash)، WhatsApp (Wasender/Cloud/link)،
  Google Sheets، تحويل الأرقام السعودية، رموز الأبواب. **typecheck نظيف، 61 اختبار ناجح.**
- بناء الصفحة: `npm run build:pages` يولّد ويُزامن `docs/index.html` + ملفّي المعاينة (صور محسّنة base64 عبر sharp).
- إعداد افتراضي: موديل Opus 4.8 في `.claude/settings.json`.

## 🔴 يحتاجك (لا أقدر أسويها من الساندبوكس)
1. **🔐 تدوير المفتاحين المكشوفين** (OpenRouter + WasenderAPI) — أمان، الأهم.
2. **☁️ نشر Vercel**: Root = `apartments/messaging-system/service` + متغيّرات `.env` (انظر `service/DEPLOY.md`).
3. **📊 Google Sheet + Service Account** ومشاركته مع إيميل الحساب (البنية كاملة في DEPLOY.md).
4. **▶️ فيديو يوتيوب Unlisted** (الرابط مضبوط في `guestGuide.ts`).
5. **🔓 بقية الريبوهات**: الجلسة محصورة بهذا الريبو؛ لتطبيق المهارة على `akoz20100-blip.github.io`
   (موقع عدّة) افتح جلسة على ذاك الريبو أو أضِفه للجلسة.
6. **🔑 (اختياري) TTLock API** لرموز مؤقتة لكل ضيف.

## أين تعدّل
- التصميم/CSS: `apartments/messaging-system/service/src/services/landing.ts`
- المحتوى/الأرقام/الروابط/الصور: `…/src/data/guestGuide.ts`
- القوالب: `…/src/services/templates.ts` — رموز الأبواب: `…/src/data/doorCodes.ts`
- الجدولة: `…/src/services/scheduler.ts` + `…/src/routes/cron.ts` + `vercel.json`
- النشر/التشغيل: `…/service/DEPLOY.md` — نظام التصميم: `apartments/landing-page/DESIGN-SYSTEM.md`
