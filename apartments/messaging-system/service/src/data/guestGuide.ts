/**
 * Dimora guest-guide content — the SINGLE place to edit landing-page copy & data.
 *
 * Everything the guest sees that is NOT pulled from the per-apartment sheet row
 * lives here: brand, Wi-Fi, services, house rules, nearby places, check-in steps,
 * and the per-unit details for D1 / D2.
 *
 * Per-apartment dynamic fields (name, access_guideline, entrance photo, video,
 * building_info) still come from the `Apartments` sheet row so the WhatsApp
 * messages and the landing page stay in sync.
 */

export type ApartmentCode = "D1" | "D2";

/** A bilingual line item (Arabic primary, English secondary). */
export interface BiItem {
  ar: string;
  en: string;
  /** Optional Google Maps (or any) link. Leave empty to render plain text. */
  mapUrl?: string;
}

export interface ServiceItem extends BiItem {
  /** Inline-SVG icon key, see ICONS in landing.ts. */
  icon: string;
}

export interface NearbyCategory {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  items: BiItem[];
}

/** Per-unit details shown in the apartment selector / info section. */
export interface GuideApartment {
  code: ApartmentCode;
  nameAr: string;
  nameEn: string;
  unitAr: string;
  unitEn: string;
  /**
   * Static fallback entry code. In production each guest gets a unique smart-lock
   * code (last 4 digits of their phone) delivered via WhatsApp, so leave empty
   * to show the "will be sent" placeholder.
   */
  entryCode: string;
  wifiName: string;
  wifiPassword: string;
  noteAr: string;
  noteEn: string;
}

export const guide = {
  brand: {
    nameAr: "ديمورا",
    nameEn: "DIMORA",
    headerAr: "دليل دخول ضيف ديمورا",
    headerEn: "Dimora Guest Check-in Guide",
    welcomeAr: "أهلًا بك في ديمورا",
    welcomeEn: "Welcome to Dimora",
    subtitleAr: "كل ما تحتاجه للدخول والإقامة بسهولة.",
    subtitleEn: "Everything you need for a smooth stay.",
    /** Optional logo image URL. Empty -> a clean text wordmark is shown. */
    logoUrl: "",
  },

  /** WhatsApp help number in intl format e.g. "9665XXXXXXXX". Empty -> placeholder, no fake number. */
  whatsapp: "",

  /** Default times (overridden by the sheet row when present). 24h format. */
  checkInTime: "16:00",
  checkOutTime: "12:00",

  /** Default Wi-Fi (per-unit overrides below win when set). */
  wifi: {
    name: "DIMORA_5G",
    password: "11223344",
  },

  /**
   * Media. All optional — empty values render an elegant placeholder.
   * Use public, optimized URLs (storage bucket / Cloudinary / unlisted YouTube).
   */
  media: {
    /** Exterior building image for the hero. Falls back to the apartment entrance photo. */
    heroImageUrl: "",
    /** The ANNOTATED exterior image (entrance/parking/first-floor labels) for check-in. */
    wayfindingImageUrl: "",
    /** Check-in video. YouTube/Vimeo link -> embed; a direct .mp4 -> <video>. Falls back to the sheet video_url. */
    videoUrl: "",
    /** Poster shown before the video loads (recommended for performance). */
    videoPoster: "",
    /** A few interior photos for a small gallery. */
    gallery: [] as string[],
  },

  /** Section 3 — the four key check-in instruction cards. */
  steps: [
    { ar: "الشقق في الدور الأول", en: "Apartments on the first floor", icon: "building" },
    { ar: "المدخل من الباب المحدد في الصورة", en: "Use the marked entrance", icon: "door" },
    { ar: "المواقف من جهة اليسار", en: "Parking is on the left", icon: "parking" },
    {
      ar: "إذا لم تجد موقفًا، يمكنك الوقوف في الأرض المقابلة",
      en: "If parking is full, use the opposite lot",
      icon: "map",
    },
  ] as ServiceItem[],

  /** Section 5 — apartment services & amenities. */
  services: [
    { ar: "نتفلكس", en: "Netflix", icon: "play" },
    { ar: "تلفزيون ذكي", en: "Smart TV", icon: "tv" },
    { ar: "ركن قهوة", en: "Coffee corner", icon: "coffee" },
    { ar: "تكييف", en: "Air conditioning", icon: "ac" },
    { ar: "مناشف نظيفة", en: "Clean towels", icon: "towel" },
    { ar: "دخول ذاتي", en: "Self check-in", icon: "key" },
    { ar: "قفل ذكي", en: "Smart lock", icon: "lock" },
    { ar: "واي فاي عالي السرعة", en: "High-speed Wi-Fi", icon: "wifi" },
  ] as ServiceItem[],

  /** Section 6 — concise stay guidelines. */
  rules: [
    { ar: "حافظ على نظافة الشقة", en: "Keep the apartment clean" },
    { ar: "ممنوع التدخين داخل الوحدة", en: "No smoking inside the unit" },
    { ar: "تجنّب الإزعاج والأصوات العالية", en: "Avoid loud noise" },
    { ar: "لا تتجاوز عدد الضيوف المسموح", en: "Do not exceed the allowed number of guests" },
    { ar: "استخدم المرافق بعناية", en: "Use the facilities carefully" },
    { ar: "خذ أغراضك الشخصية قبل الخروج", en: "Remove personal belongings before checkout" },
  ] as BiItem[],

  /** Section 7 — nearby places (from the Dimora Guest Guide). No invented links. */
  nearby: [
    {
      id: "attractions",
      titleAr: "معالم الرياض",
      titleEn: "Riyadh Attractions",
      icon: "landmark",
      items: [
        { ar: "برج المملكة", en: "Kingdom Tower" },
        { ar: "بوليفارد رياض سيتي", en: "Boulevard Riyadh City" },
        { ar: "مركز الملك عبدالعزيز التاريخي", en: "King Abdulaziz Historical Center" },
        { ar: "الدرعية", en: "Diriyah" },
        { ar: "وادي حنيفة", en: "Wadi Hanifah" },
        { ar: "المتحف الوطني السعودي", en: "Saudi National Museum" },
      ],
    },
    {
      id: "malls",
      titleAr: "مراكز التسوق",
      titleEn: "Shopping Centers",
      icon: "bag",
      items: [
        { ar: "النخيل مول", en: "Al Nakheel Mall" },
        { ar: "بانوراما مول", en: "Panorama Mall" },
        { ar: "الرياض بارك", en: "Riyadh Park" },
      ],
    },
    {
      id: "restaurants",
      titleAr: "مطاعم في حي لبن",
      titleEn: "Restaurants in Laban",
      icon: "food",
      items: [
        { ar: "البيك", en: "Albaik" },
        { ar: "الرومانسية", en: "Al Romansiah" },
        { ar: "بيت الشاورما", en: "Bayt Al Shawarma" },
        { ar: "برجرايزر", en: "Burgerizzr" },
      ],
    },
    {
      id: "cafes",
      titleAr: "كافيهات مختصة في حي لبن",
      titleEn: "Specialty Cafes in Laban",
      icon: "coffee",
      items: [
        { ar: "طريق الشاي", en: "Tea Road" },
        { ar: "أون أوف", en: "On Off Coffee" },
        { ar: "دوبامين", en: "Dopamine Café" },
        { ar: "دانكن", en: "Dunkin" },
      ],
    },
    {
      id: "services",
      titleAr: "خدمات يومية قريبة",
      titleEn: "Daily Services Nearby",
      icon: "store",
      items: [
        { ar: "بقالة وسوبرماركت — شارع نارجان", en: "Daily market — Narjan St" },
        { ar: "مغسلة ملابس قريبة", en: "Nearby laundry" },
        { ar: "توصيل مياه", en: "Water delivery" },
      ],
    },
  ] as NearbyCategory[],

  /** Per-unit details. Entry codes are sent per-guest, so kept empty here. */
  apartments: {
    D1: {
      code: "D1",
      nameAr: "ديمورا D1",
      nameEn: "Dimora D1",
      unitAr: "الدور الأول — الشقة الأولى",
      unitEn: "First floor — Unit 1",
      entryCode: "",
      wifiName: "DIMORA_5G",
      wifiPassword: "11223344",
      noteAr: "المدخل من الباب المحدد في الصورة، والشقة في الدور الأول.",
      noteEn: "Use the marked entrance; the unit is on the first floor.",
    },
    D2: {
      code: "D2",
      nameAr: "ديمورا D2",
      nameEn: "Dimora D2",
      unitAr: "الدور الأول — الشقة الثانية",
      unitEn: "First floor — Unit 2",
      entryCode: "",
      wifiName: "DIMORA_5G",
      wifiPassword: "11223344",
      noteAr: "المدخل من الباب المحدد في الصورة، والشقة في الدور الأول.",
      noteEn: "Use the marked entrance; the unit is on the first floor.",
    },
  } as Record<ApartmentCode, GuideApartment>,

  /** Map sheet apartment_id -> D1/D2 so the existing per-apartment route works. */
  apartmentIdToCode: {
    apt_01: "D1",
    apt_02: "D2",
    d1: "D1",
    d2: "D2",
  } as Record<string, ApartmentCode>,
};

/** Resolve which unit (D1/D2) an apartment_id maps to; defaults to D1. */
export function resolveCode(apartmentId: string): ApartmentCode {
  return guide.apartmentIdToCode[apartmentId.toLowerCase()] ?? "D1";
}
