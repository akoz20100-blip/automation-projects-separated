/**
 * TTLock Open Platform integration — issues per-guest, time-limited keyboard
 * passcodes on an apartment's smart lock the moment a booking is registered.
 *
 * Per booking: the passcode is the LAST 4 DIGITS of the guest's phone, valid
 * from check-in (16:00) to checkout (12:00) in the configured timezone, pushed
 * to the lock via POST /v3/keyboardPwd/add.
 *
 * IMPORTANT — gateway requirement: a CUSTOM passcode added remotely (addType=2)
 * needs the lock to be reachable from the cloud, i.e. paired with a TTLock WiFi
 * gateway (G2/G3) or a WiFi lock model. Without a gateway the cloud cannot write
 * a custom code; set TTLOCK_FALLBACK_TO_GENERATED=true to instead generate a
 * gateway-free, system-computed period code via /v3/keyboardPwd/get (that code
 * is NOT the last-4-of-phone, but works fully offline).
 *
 * Region: the EU developer console (euopen.ttlock.com) talks to the EU API host
 * https://euapi.ttlock.com (TTLOCK_API_BASE_URL); the global cloud is
 * https://api.ttlock.com. TTLock returns HTTP 200 even on logical errors, with a
 * non-zero `errcode` — we surface those as thrown errors.
 *
 * Docs: https://euopen.ttlock.com/document
 */

import { createHash } from "node:crypto";
import { env } from "../config/env.js";
import { epochMsInTz } from "../domain/dates.js";
import { normalizePhone, lastDigits } from "../domain/phone.js";
import type { Reservation } from "../types.js";

export interface TtlockLock {
  lockId: number;
  lockName?: string;
  lockAlias?: string;
  electricQuantity?: number;
}

export interface IssuedPasscode {
  passcode: string;
  keyboardPwdId?: number;
  lockId: string;
  /** "custom" = last-4-of-phone (gateway); "generated" = system period code (offline fallback). */
  mode: "custom" | "generated";
  startMs: number;
  endMs: number;
}

interface TtlockError {
  errcode?: number;
  errmsg?: string;
  description?: string;
}

/** True when the four core TTLock credentials are configured. */
export function ttlockEnabled(): boolean {
  const t = env.ttlock;
  return Boolean(t.clientId && t.clientSecret && t.username && t.password);
}

/** Resolve the TTLock lockId mapped to an apartment (via TTLOCK_LOCKS), or null. */
export function resolveLockId(apartmentId: string): string | null {
  return env.ttlock.locks[apartmentId.toLowerCase()] ?? null;
}

function md5(s: string): string {
  return createHash("md5").update(s, "utf8").digest("hex");
}

/** POST application/x-www-form-urlencoded and parse the JSON body. */
async function form<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) body.set(k, String(v));

  const res = await fetch(`${env.ttlock.baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`TTLock ${path} HTTP ${res.status}: ${text}`);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`TTLock ${path}: non-JSON response: ${text}`);
  }
}

/** TTLock returns HTTP 200 with errcode != 0 on logical errors. */
function assertOk(path: string, data: TtlockError): void {
  if (typeof data.errcode === "number" && data.errcode !== 0) {
    const detail = data.errmsg || data.description || "";
    throw new Error(`TTLock ${path} error ${data.errcode}: ${detail}`.trim());
  }
}

// --- access-token cache (module-scoped; refreshed ~1 min before expiry) ---
let tokenCache: { accessToken: string; expiresAt: number } | null = null;

/** OAuth2 password grant. The password is MD5-hashed (lowercase hex) per TTLock. */
export async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.accessToken;

  const t = env.ttlock;
  const data = await form<{ access_token?: string; expires_in?: number; errmsg?: string; error?: string }>(
    "/oauth2/token",
    {
      clientId: t.clientId,
      clientSecret: t.clientSecret,
      username: t.username,
      password: md5(t.password),
      grant_type: "password",
    },
  );
  if (!data.access_token) {
    throw new Error(`TTLock token request failed: ${data.errmsg || data.error || JSON.stringify(data)}`);
  }
  const ttlMs = (Number(data.expires_in) || 7200) * 1000;
  tokenCache = { accessToken: data.access_token, expiresAt: Date.now() + ttlMs - 60_000 };
  return data.access_token;
}

/** List the locks visible to the configured account (used to discover lockIds). */
export async function listLocks(): Promise<TtlockLock[]> {
  const accessToken = await getAccessToken();
  const data = await form<{ list?: TtlockLock[] } & TtlockError>("/v3/lock/list", {
    clientId: env.ttlock.clientId,
    accessToken,
    pageNo: 1,
    pageSize: 100,
    date: Date.now(),
  });
  assertOk("/v3/lock/list", data);
  return data.list ?? [];
}

/** Add a CUSTOM keyboard passcode for a period (requires a gateway, addType=2). */
async function addCustomPasscode(
  lockId: string,
  passcode: string,
  name: string,
  startMs: number,
  endMs: number,
): Promise<number> {
  const accessToken = await getAccessToken();
  const data = await form<{ keyboardPwdId?: number } & TtlockError>("/v3/keyboardPwd/add", {
    clientId: env.ttlock.clientId,
    accessToken,
    lockId,
    keyboardPwd: passcode,
    keyboardPwdName: name,
    startDate: startMs,
    endDate: endMs,
    addType: env.ttlock.addType,
    date: Date.now(),
  });
  assertOk("/v3/keyboardPwd/add", data);
  return Number(data.keyboardPwdId);
}

/** Generate a SYSTEM period passcode via the offline algorithm (no gateway needed). */
async function generatePeriodPasscode(
  lockId: string,
  name: string,
  startMs: number,
  endMs: number,
): Promise<{ keyboardPwd: string; keyboardPwdId: number }> {
  const accessToken = await getAccessToken();
  const data = await form<{ keyboardPwd?: string; keyboardPwdId?: number } & TtlockError>(
    "/v3/keyboardPwd/get",
    {
      clientId: env.ttlock.clientId,
      accessToken,
      lockId,
      keyboardPwdType: 3, // 3 = period
      keyboardPwdName: name,
      startDate: startMs,
      endDate: endMs,
      date: Date.now(),
    },
  );
  assertOk("/v3/keyboardPwd/get", data);
  return { keyboardPwd: String(data.keyboardPwd ?? ""), keyboardPwdId: Number(data.keyboardPwdId) };
}

/** Compute the passcode validity window [start, end] in epoch ms for a reservation. */
export function passcodeWindow(reservation: Reservation): { startMs: number; endMs: number } {
  const tz = env.timezone;
  const checkIn = reservation.check_in_time || env.ttlock.checkInTime;
  const checkOut = reservation.check_out_time || env.ttlock.checkOutTime;
  return {
    startMs: epochMsInTz(reservation.check_in_date, checkIn, tz),
    endMs: epochMsInTz(reservation.check_out_date, checkOut, tz),
  };
}

/**
 * Issue the access passcode for a reservation. Returns null (skip) when TTLock
 * is disabled or no lock is mapped to the apartment. Throws on API errors so the
 * caller can surface a clear message to the operator.
 */
export async function issueGuestPasscode(reservation: Reservation): Promise<IssuedPasscode | null> {
  if (!ttlockEnabled()) return null;
  const lockId = resolveLockId(reservation.apartment_id);
  if (!lockId) return null;

  const phone = normalizePhone(reservation.guest_phone) ?? reservation.guest_phone;
  const passcode = lastDigits(phone, 4);
  if (!passcode) throw new Error("guest phone has fewer than 4 digits — cannot derive a passcode");

  const { startMs, endMs } = passcodeWindow(reservation);
  if (!(endMs > startMs)) throw new Error("checkout must be after check-in for the passcode window");

  const name = `Dimora ${reservation.guest_name || reservation.reservation_id}`.slice(0, 40);

  try {
    const keyboardPwdId = await addCustomPasscode(lockId, passcode, name, startMs, endMs);
    return { passcode, keyboardPwdId, lockId, mode: "custom", startMs, endMs };
  } catch (e) {
    if (!env.ttlock.fallbackToGenerated) throw e;
    const gen = await generatePeriodPasscode(lockId, name, startMs, endMs);
    return {
      passcode: gen.keyboardPwd,
      keyboardPwdId: gen.keyboardPwdId,
      lockId,
      mode: "generated",
      startMs,
      endMs,
    };
  }
}
