# 🖼️ صور وفيديو صفحة ديمورا

> ملاحظة مهمة: ريبو الأتمتة **خاص (private)**، فروابط الصور منه ما تفتح للضيوف.
> لذلك ارفع الصور في ريبو **عام** — الأفضل موقعك العام `akoz20100-blip.github.io`.

## 📋 الصور المطلوبة (الأسماء بالضبط)

| الصورة | اسم الملف | تستخدم في |
|---|---|---|
| الإرشادات الخارجية الموضّحة (المدخل/المواقف/الدور الأول) | `dimora-wayfinding.jpg` | قسم تعليمات الدخول |
| واجهة المبنى | `dimora-hero.jpg` | الهيرو (الخلفية) |
| الشعار | `dimora-logo.png` | رأس الهيرو |
| غرفة النوم | `dimora-room.jpg` | المعرض (اختياري) |
| الصالة | `dimora-living.jpg` | المعرض (اختياري) |
| ركن القهوة | `dimora-coffee.jpg` | المعرض (اختياري) |

## 🚀 طريقة الرفع
1. افتح `github.com/akoz20100-blip/akoz20100-blip.github.io`.
2. **Add file → Upload files** → اسحب الصور.
3. ضعها في مجلد `dimora/` (اكتب `dimora/` قبل اسم أول ملف عند الرفع).
4. **Commit**.

الروابط بتصير تلقائياً:
```
https://akoz20100-blip.github.io/dimora/dimora-hero.jpg
https://akoz20100-blip.github.io/dimora/dimora-wayfinding.jpg
https://akoz20100-blip.github.io/dimora/dimora-logo.png
...
```

ثم تُوضع في `service/src/data/guestGuide.ts` (راجع `../CONTENT-GUIDE.md`).

## ▶️ الفيديو
- ارفعه على **YouTube (Unlisted)** وضع الرابط في `media.videoUrl`.
- أو رابط `.mp4` عام (Cloudinary) — يعرض كـ `<video>` تلقائياً.
- التفاصيل والضغط الموصى به: `../../VIDEO_SETUP.md`.

## نصائح
- اضغط الصور (< ~300KB) للسرعة على الجوال.
- مقاس الهيرو الأفضل: عرضية (16:9 أو أوسع). صورة الإرشادات: 4:3.
- الجودة عالية بدون تكبير مبالغ.
