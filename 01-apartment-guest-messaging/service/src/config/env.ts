/**
 * Typed environment loading. Reads process.env once at boot and exposes a
 * validated, strongly-typed config object. Missing optional values fall back to
 * sensible defaults so the service can boot in `manual_link` mode without any
 * external credentials.
 */

export type WhatsAppMode = "cloud_api" | "manual_link";

function str(name: string, fallback = ""): string {
  const v = process.env[name];
  return v === undefined || v === "" ? fallback : v;
}

function bool(name: string, fallback = false): boolean {
  const v = process.env[name];
  if (v === undefined || v === "") return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
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
}

export function loadEnv(): Env {
  const whatsappMode = (str("WHATSAPP_MODE", "manual_link") as WhatsAppMode);

  return {
    appEnv: str("APP_ENV", "development"),
    port: Number(str("PORT", "3000")),
    apiSecret: str("API_SECRET", "local_secret"),
    timezone: str("DEFAULT_TIMEZONE", "Asia/Riyadh"),
    whatsappMode: whatsappMode === "cloud_api" ? "cloud_api" : "manual_link",

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

    ocr: {
      baseUrl: str("OCR_API_BASE_URL", "https://openrouter.ai/api/v1"),
      apiKey: str("OCR_API_KEY"),
      model: str("OCR_MODEL", "qwen/qwen2.5-vl-72b-instruct"),
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
  };
}

export const env = loadEnv();
