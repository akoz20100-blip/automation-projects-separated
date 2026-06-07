/**
 * Phone normalization + validation.
 *
 * WhatsApp Cloud API and wa.me links both expect an international number in
 * E.164 *digits only* (no leading `+`, no spaces, no dashes). e.g. 9665XXXXXXXX.
 */

const MIN_DIGITS = 8;
const MAX_DIGITS = 15;
/** Default country calling code for local numbers (Saudi Arabia). */
const DEFAULT_CC = "966";

/**
 * Normalize a raw phone string to digits-only international format.
 * Strips `+`, spaces, dashes, parentheses and Arabic-Indic digits are mapped
 * to Latin digits. Returns null if the result is not a plausible number.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;

  // Map Arabic-Indic (٠-٩) and Eastern Arabic-Indic (۰-۹) digits to Latin.
  const latin = raw.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0);
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });

  let digits = latin.replace(/[^\d+]/g, "");
  // Convert a leading 00 international prefix to nothing (we keep digits only).
  digits = digits.replace(/^\+/, "").replace(/^00/, "");
  digits = digits.replace(/\D/g, "");

  // Convert local Saudi mobile formats to international (e.g. 0502305331 ->
  // 966502305331, 502305331 -> 966502305331). Numbers already in international
  // form (starting with the country code) are left untouched.
  if (/^05\d{8}$/.test(digits)) digits = DEFAULT_CC + digits.slice(1);
  else if (/^5\d{8}$/.test(digits)) digits = DEFAULT_CC + digits;

  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) return null;
  return digits;
}

/** True when the value is already a valid digits-only international number. */
export function isValidPhone(raw: string | null | undefined): boolean {
  if (!raw) return false;
  return /^\d{8,15}$/.test(raw);
}

/**
 * Validate + normalize, throwing a descriptive error when invalid. Use at the
 * boundary before sending so we never message a malformed number.
 */
export function requireValidPhone(raw: string | null | undefined): string {
  const normalized = normalizePhone(raw);
  if (!normalized) {
    throw new Error(
      "guest_phone must be a valid international number in digits-only format without '+'",
    );
  }
  return normalized;
}
