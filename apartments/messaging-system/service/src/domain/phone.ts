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

/** Map Arabic-Indic / Eastern Arabic-Indic digits to Latin, then strip non-digits. */
function toLatinDigits(raw: string): string {
  const latin = raw.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0);
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });
  return latin.replace(/\D/g, "");
}

/**
 * The last `n` digits of a phone number, used to derive a guest's smart-lock
 * passcode (e.g. 966502305331 -> "5331"). Arabic-Indic digits are mapped first.
 * Returns null when there aren't at least `n` digits.
 */
export function lastDigits(raw: string | null | undefined, n = 4): string | null {
  if (!raw) return null;
  const digits = toLatinDigits(raw);
  if (digits.length < n) return null;
  return digits.slice(-n);
}

/**
 * True for passcodes TTLock rejects as "too simple" (errcode -2032): all-same
 * digits (1111) or a strictly consecutive run up/down (1234, 4321).
 */
export function isSimplePasscode(code: string): boolean {
  if (!/^\d{2,}$/.test(code)) return false;
  if (/^(\d)\1+$/.test(code)) return true; // all same
  let asc = true;
  let desc = true;
  for (let i = 1; i < code.length; i++) {
    const diff = code.charCodeAt(i) - code.charCodeAt(i - 1);
    if (diff !== 1) asc = false;
    if (diff !== -1) desc = false;
  }
  return asc || desc;
}

/**
 * Ordered passcode candidates derived from the phone. The guest is always TOLD
 * the actual code (it's in their WhatsApp message), so when the preferred last-4
 * is one TTLock rejects as "too simple", we slide the 4-digit window left through
 * the number and prefer the first non-simple window — staying phone-derived.
 * Simple windows are kept only as a last resort. Empty when too few digits.
 */
export function passcodeCandidates(raw: string | null | undefined, n = 4): string[] {
  if (!raw) return [];
  const digits = toLatinDigits(raw);
  if (digits.length < n) return [];

  const seen = new Set<string>();
  const windows: string[] = [];
  for (let end = digits.length; end >= n; end--) {
    const w = digits.slice(end - n, end); // last-n first, then slide left
    if (!seen.has(w)) {
      seen.add(w);
      windows.push(w);
    }
  }
  const nonSimple = windows.filter((c) => !isSimplePasscode(c));
  const simple = windows.filter((c) => isSimplePasscode(c));
  return [...nonSimple, ...simple];
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
