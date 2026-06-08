/**
 * Typed environment loading. Reads process.env once at boot and exposes a
 * validated, strongly-typed config object. Missing optional values fall back to
 * sensible defaults so the service can boot in `manual_link` mode without any
 * external credentials.
 */

export type WhatsAppMode = "cloud_api" | "manual_link" | "wasender";

function str(name: string, fallback = ""): string {
  const v = process.env[name];
  // Trim accidental surrounding whitespace/newlines that creep in when values
  // are copy-pasted into a hosting dashboard (e.g. a trailing newline on a
  // Sheets ID or secret breaks the request).
  return v === undefined || v.trim() === "" ? fallback : v.trim();
}

function bool(name: string, fallback = false): boolean {
  const v = process.env[name];
  if (v === undefined || v === "") return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

/** Parse "apt_01:1234567,apt_02:7654321" -> { apt_01: "1234567", apt_02: "7654321" }. */
function parseLockMap(raw: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const [key, value] = pair.split(":").map((s) => s.trim());
    if (key && value) map[key.toLowerCase()] = value;
  }
  return map;
}

export interface Env {
  appEnv: string;
  port: number;
  apiSecret: string;
  timezone: string;
  whatsappMode: WhatsAppMode;

  whatsapp: {
    graphVersion: string;
    token: string;
    phoneNumberId: string;
    businessAccountId: string;
    appSecret: string;
    verifyToken: string;
    templates: {
      access: { ar: string; en: string };
      checkout: { ar: string; en: string };
      review: { ar: string; en: string };
      owner: { ar: string };
    };
  };

  wasender: {
    apiKey: string;
    apiUrl: string;
  };

  ocr: {
    baseUrl: string;
    apiKey: string;
    model: string;
  };

  sheets: {
    spreadsheetId: string;
    serviceAccountEmail: string;
    privateKey: string;
  };

  landing: {
    baseUrl: string;
    brandLogoUrl: string;
    brandPrimaryColor: string;
    brandSecondaryColor: string;
  };

  owner: {
    notifyEnabled: boolean;
    phone: string;
  };

  cleaner: {
    notifyEnabled: boolean;
    phone: string;
    name: string;
  };

  cron: {
    secret: string;
  };

  telegram: {
    botToken: string;
    webhookSecret: string;
    /** Chat IDs allowed to use the intake bot. Empty -> allow anyone. */
    allowedChatIds: string[];
    /** Apartment used when the screenshot caption doesn't specify D1/D2. */
    defaultApartmentId: string;
  };

  ttlock: {
    /** EU console (euopen.ttlock.com) -> https://euapi.ttlock.com ; global -> https://api.ttlock.com */
    baseUrl: string;
    clientId: string;
    clientSecret: string;
    username: string;
    /** Plain account password; MD5-hashed by the client before the OAuth call. */
    password: string;
    /** apartment_id -> TTLock lockId (from TTLOCK_LOCKS). */
    locks: Record<string, string>;
    /** Passcode validity window (local timezone). Defaults: check-in 16:00 -> checkout 12:00. */
    checkInTime: string;
    checkOutTime: string;
    /** addType for keyboardPwd/add: 2 = via WiFi gateway (remote, required for custom codes). */
    addType: number;
    /** If the custom (last-4-of-phone) add fails, fall back to a system-generated period code. */
    fallbackToGenerated: boolean;
  };
}

export function loadEnv(): Env {
  const rawMode = str("WHATSAPP_MODE", "manual_link");
  const whatsappMode: WhatsAppMode =
    rawMode === "cloud_api" || rawMode === "wasender" ? rawMode : "manual_link";

  return {
    appEnv: str("APP_ENV", "development"),
    port: Number(str("PORT", "3000")),
    apiSecret: str("API_SECRET", "local_secret"),
    timezone: str("DEFAULT_TIMEZONE", "Asia/Riyadh"),
    whatsappMode,

    whatsapp: {
      graphVersion: str("WHATSAPP_GRAPH_VERSION", "v21.0"),
      token: str("WHATSAPP_CLOUD_TOKEN"),
      phoneNumberId: str("WHATSAPP_PHONE_NUMBER_ID"),
      businessAccountId: str("WHATSAPP_BUSINESS_ACCOUNT_ID"),
      appSecret: str("WHATSAPP_APP_SECRET"),
      verifyToken: str("WHATSAPP_VERIFY_TOKEN"),
      templates: {
        access: { ar: str("WA_TEMPLATE_ACCESS_AR", "apt_access_ar"), en: str("WA_TEMPLATE_ACCESS_EN", "apt_access_en") },
        checkout: { ar: str("WA_TEMPLATE_CHECKOUT_AR", "apt_checkout_ar"), en: str("WA_TEMPLATE_CHECKOUT_EN", "apt_checkout_en") },
        review: { ar: str("WA_TEMPLATE_REVIEW_AR", "apt_review_ar"), en: str("WA_TEMPLATE_REVIEW_EN", "apt_review_en") },
        owner: { ar: str("WA_TEMPLATE_OWNER_AR", "apt_owner_notify_ar") },
      },
    },

    wasender: {
      apiKey: str("WASENDER_API_KEY"),
      apiUrl: str("WASENDER_API_URL", "https://www.wasenderapi.com/api/send-message"),
    },

    ocr: {
      baseUrl: str("OCR_API_BASE_URL", "https://openrouter.ai/api/v1"),
      apiKey: str("OCR_API_KEY"),
      model: str("OCR_MODEL", "google/gemini-3.5-flash"),
    },

    sheets: {
      spreadsheetId: str("GOOGLE_SHEETS_ID"),
      serviceAccountEmail: str("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
      // Support keys pasted with literal \n sequences.
      privateKey: str("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    },

    landing: {
      baseUrl: str("LANDING_BASE_URL", "http://localhost:3000"),
      brandLogoUrl: str("BRAND_LOGO_URL"),
      brandPrimaryColor: str("BRAND_PRIMARY_COLOR", "#0E7C66"),
      brandSecondaryColor: str("BRAND_SECONDARY_COLOR", "#F4F1EA"),
    },

    owner: {
      notifyEnabled: bool("OWNER_NOTIFY_ENABLED", false),
      phone: str("OWNER_PHONE"),
    },

    cleaner: {
      notifyEnabled: bool("CLEANER_NOTIFY_ENABLED", false),
      phone: str("CLEANER_PHONE"),
      name: str("CLEANER_NAME", "Sara"),
    },

    cron: {
      secret: str("CRON_SECRET"),
    },

    telegram: {
      botToken: str("TELEGRAM_BOT_TOKEN"),
      webhookSecret: str("TELEGRAM_WEBHOOK_SECRET"),
      allowedChatIds: str("TELEGRAM_ALLOWED_CHAT_IDS")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      defaultApartmentId: str("TELEGRAM_DEFAULT_APARTMENT_ID", "apt_01"),
    },

    ttlock: {
      baseUrl: str("TTLOCK_API_BASE_URL", "https://euapi.ttlock.com").replace(/\/$/, ""),
      clientId: str("TTLOCK_CLIENT_ID"),
      clientSecret: str("TTLOCK_CLIENT_SECRET"),
      username: str("TTLOCK_USERNAME"),
      password: str("TTLOCK_PASSWORD"),
      locks: parseLockMap(str("TTLOCK_LOCKS")),
      checkInTime: str("TTLOCK_CHECKIN_TIME", "16:00"),
      checkOutTime: str("TTLOCK_CHECKOUT_TIME", "12:00"),
      addType: Number(str("TTLOCK_ADD_TYPE", "2")) || 2,
      fallbackToGenerated: bool("TTLOCK_FALLBACK_TO_GENERATED", false),
    },
  };
}

export const env = loadEnv();
