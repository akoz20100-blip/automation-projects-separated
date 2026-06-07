# ✏️ دليل تعديل المحتوى

## الملف الرئيسي للمحتوى: `service/src/data/guestGuide.ts`

### رقم الواتساب
```ts
whatsapp: "9665XXXXXXXX",   // فاضي = يظهر placeholder، بدون رقم وهمي
```

### الواي فاي الافتراضي
```ts
wifi: { name: "DIMORA_5G", password: "11223344" },
```

### الصور والفيديو
```ts
media: {
  heroImageUrl: "https://akoz20100-blip.github.io/dimora/dimora-hero.jpg",
  wayfindingImageUrl: "https://akoz20100-blip.github.io/dimora/dimora-wayfinding.jpg",
  videoUrl: "https://youtu.be/XXXXXXXXXXX",
  videoPoster: "",
  gallery: [],
},
```

### الشعار
```ts
brand: { ..., logoUrl: "https://akoz20100-blip.github.io/dimora/dimora-logo.png" },
```

### تفاصيل D1 و D2 (كائنان منفصلان)
```ts
apartments: {
  D1: { nameAr, nameEn, unitAr, unitEn, entryCode, wifiName, wifiPassword, noteAr, noteEn },
  D2: { ... },
}
```
- `entryCode` فاضي = "يصلك رمز الدخول عبر واتساب" (الرمز يتولّد لكل ضيف من القفل الذكي).

### الخدمات / القوانين / الأماكن القريبة
عدّل المصفوفات `services` / `rules` / `nearby` (كلها ثنائية اللغة عربي/إنجليزي).
لإضافة رابط خرائط لمكان: أضف `mapUrl: "https://maps.google.com/..."` للعنصر.

---

## بيانات كل شقة: جدول `Apartments`
قالب: `templates/apartments.csv`. الأعمدة المهمة للصفحة:
`access_guideline` (نص الدخول) · `entrance_photo_url` · `video_url` ·
`building_info` · `checkout_guideline` · `maintenance_contact_phone`.

الربط: `apt_01 → D1` ، `apt_02 → D2` (معرّف في `guestGuide.ts`).
