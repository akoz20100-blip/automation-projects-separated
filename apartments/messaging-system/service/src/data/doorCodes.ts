/**
 * Smart-lock (TTLock) door passcodes.
 *
 * Interim model: the owner pre-creates a small pool of permanent passcodes in
 * the TTLock app, and the system hands one to each guest (rotating through the
 * pool). This is a stopgap until per-guest, time-limited codes are issued via
 * the TTLock Open Platform API (which expires the code at checkout — the
 * preferred, more secure flow).
 *
 * Codes can be overridden per apartment via env, e.g. D1_DOOR_CODES="0555,4050".
 */

/** Built-in pools, keyed by apartment_id. D1 (apt_01) codes created by the owner. */
const DEFAULT_POOLS: Record<string, string[]> = {
  apt_01: ["0555", "4050", "5060", "6070"],
};

function parsePool(raw: string | undefined, fallback: string[]): string[] {
  const codes = (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return codes.length ? codes : fallback;
}

/** Active pools (env overrides built-ins). */
export const DOOR_CODE_POOLS: Record<string, string[]> = {
  apt_01: parsePool(process.env.D1_DOOR_CODES, DEFAULT_POOLS.apt_01!),
};

/** Stable non-negative 32-bit hash (FNV-1a) — used to derive a per-reservation seq. */
function hashSeq(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Pure rotation: the pool entry at sequence position `seq` (wraps around). */
export function rotateDoorCode(pool: string[], seq: number): string {
  if (!pool.length) return "";
  return pool[((seq % pool.length) + pool.length) % pool.length]!;
}

/**
 * Resolve the door code for a reservation.
 * - An explicit `doorCode` (e.g. a per-guest TTLock API code) always wins.
 * - Otherwise, for an apartment with a pool, rotate through it. A numeric `seq`
 *   gives strict sequential rotation (booking 1→2→3→4…); without one we derive a
 *   stable index from the reservation id so re-sends keep the same code.
 * - Apartments without a pool return "" (the landing then shows "sent via WhatsApp").
 */
export function resolveDoorCode(
  apartmentId: string,
  opts: { doorCode?: string | null; reservationId?: string; seq?: number } = {},
): string {
  if (opts.doorCode) return opts.doorCode;
  const pool = DOOR_CODE_POOLS[apartmentId];
  if (!pool || !pool.length) return "";
  const seq = opts.seq ?? hashSeq(opts.reservationId ?? "");
  return rotateDoorCode(pool, seq);
}
