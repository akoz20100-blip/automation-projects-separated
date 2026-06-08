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

/**
 * Epoch milliseconds for a local wall-clock time (`YYYY-MM-DD` + `HH:mm`) in the
 * given IANA timezone. DST-aware via the Intl offset trick; for a fixed-offset
 * zone (e.g. Asia/Riyadh, UTC+3) it is exact. Used to build the TTLock passcode
 * window (check-in 16:00 -> checkout 12:00) as the API expects ms timestamps.
 */
export function epochMsInTz(dateStr: string, timeStr: string, timezone: string): number {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = (timeStr || "00:00").split(":").map(Number);
  if (!y || !mo || !d) throw new Error(`invalid date: ${dateStr}`);

  // Treat the wall time as if it were UTC, then correct by the zone offset that
  // applies at that instant (offset is derived from how the zone renders it).
  const asUTC = Date.UTC(y, mo - 1, d, h ?? 0, mi ?? 0, 0);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(asUTC));

  const m: Record<string, number> = {};
  for (const p of parts) if (p.type !== "literal") m[p.type] = Number(p.value);
  const hour = m.hour === 24 ? 0 : (m.hour ?? 0); // Intl may emit hour "24" at midnight
  const tzAsUTC = Date.UTC(m.year!, (m.month ?? 1) - 1, m.day ?? 1, hour, m.minute ?? 0, m.second ?? 0);
  const offset = tzAsUTC - asUTC; // the zone is `offset` ms ahead of UTC at this instant
  return asUTC - offset;
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
