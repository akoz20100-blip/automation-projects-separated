/**
 * Date helpers. All "today / tomorrow / yesterday" logic is computed in the
 * configured timezone (Asia/Riyadh by default) so scheduled reminders fire on
 * the correct local day regardless of where the server runs.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDateString(value: string | null | undefined): value is string {
  return !!value && DATE_RE.test(value);
}

/** Current date (YYYY-MM-DD) in the given IANA timezone. */
export function todayInTz(timezone: string, now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Add a number of whole days to a YYYY-MM-DD string (UTC-safe arithmetic). */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, (m! - 1), d!));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function tomorrowInTz(timezone: string, now: Date = new Date()): string {
  return addDays(todayInTz(timezone, now), 1);
}

export function yesterdayInTz(timezone: string, now: Date = new Date()): string {
  return addDays(todayInTz(timezone, now), -1);
}

/** True when check_out is strictly after check_in. */
export function isCheckoutAfterCheckin(checkIn: string, checkOut: string): boolean {
  if (!isDateString(checkIn) || !isDateString(checkOut)) return false;
  return checkOut > checkIn;
}

/**
 * The target check_out_date for a given due message type, relative to "now".
 *  - checkout reminder: sent the night before, so check_out_date === tomorrow.
 *  - review request: sent the day after, so check_out_date === yesterday.
 */
export function dueCheckoutDate(
  type: "checkout" | "review",
  timezone: string,
  now: Date = new Date(),
): string {
  return type === "checkout" ? tomorrowInTz(timezone, now) : yesterdayInTz(timezone, now);
}
