import { describe, it, expect, afterEach, vi } from "vitest";
import type { Reservation } from "../src/types.js";

const baseReservation: Reservation = {
  reservation_id: "R1",
  source: "airbnb",
  apartment_id: "apt_01",
  apartment_name: "Dimora D1",
  guest_name: "Sara",
  guest_phone: "966502305331",
  guest_language: "ar",
  check_in_date: "2026-06-10",
  check_out_date: "2026-06-13",
  check_in_time: "16:00",
  check_out_time: "12:00",
  status: "confirmed",
};

const TTLOCK_KEYS = [
  "TTLOCK_CLIENT_ID",
  "TTLOCK_CLIENT_SECRET",
  "TTLOCK_USERNAME",
  "TTLOCK_PASSWORD",
  "TTLOCK_LOCKS",
  "TTLOCK_ADD_TYPE",
  "TTLOCK_FALLBACK_TO_GENERATED",
  "DEFAULT_TIMEZONE",
];

function setEnv(over: Record<string, string> = {}): void {
  process.env.TTLOCK_CLIENT_ID = "cid";
  process.env.TTLOCK_CLIENT_SECRET = "secret";
  process.env.TTLOCK_USERNAME = "user";
  process.env.TTLOCK_PASSWORD = "pass";
  process.env.TTLOCK_LOCKS = "apt_01:111";
  process.env.DEFAULT_TIMEZONE = "Asia/Riyadh";
  Object.assign(process.env, over);
}

/** Reload the module so it re-reads the (just-set) env. */
async function loadTtlock() {
  vi.resetModules();
  return import("../src/services/ttlock.js");
}

/** Mock fetch that records calls and replies per TTLock endpoint. */
function mockFetch(handlers: Record<string, unknown>) {
  const calls: { url: string; body: string }[] = [];
  const fn = vi.fn(async (url: string, init?: { body?: string }) => {
    const u = String(url);
    calls.push({ url: u, body: String(init?.body ?? "") });
    const key = Object.keys(handlers).find((k) => u.endsWith(k));
    const payload = key ? handlers[key] : {};
    return new Response(JSON.stringify(payload), { status: 200 });
  });
  vi.stubGlobal("fetch", fn);
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
  for (const k of TTLOCK_KEYS) delete process.env[k];
});

describe("issueGuestPasscode", () => {
  it("adds a custom passcode = last 4 of phone, valid check-in 16:00 -> checkout 12:00", async () => {
    setEnv();
    const calls = mockFetch({
      "/oauth2/token": { access_token: "tok", expires_in: 7200 },
      "/v3/keyboardPwd/add": { keyboardPwdId: 999, errcode: 0 },
    });
    const { issueGuestPasscode } = await loadTtlock();

    const issued = await issueGuestPasscode(baseReservation);
    expect(issued?.mode).toBe("custom");
    expect(issued?.passcode).toBe("5331");
    expect(issued?.keyboardPwdId).toBe(999);

    const add = calls.find((c) => c.url.endsWith("/v3/keyboardPwd/add"));
    expect(add).toBeTruthy();
    const p = new URLSearchParams(add!.body);
    expect(p.get("lockId")).toBe("111");
    expect(p.get("keyboardPwd")).toBe("5331");
    expect(p.get("addType")).toBe("2");
    expect(Number(p.get("startDate"))).toBe(Date.parse("2026-06-10T13:00:00Z"));
    expect(Number(p.get("endDate"))).toBe(Date.parse("2026-06-13T09:00:00Z"));
  });

  it("uses the EU API host by default", async () => {
    setEnv();
    const calls = mockFetch({
      "/oauth2/token": { access_token: "tok", expires_in: 7200 },
      "/v3/keyboardPwd/add": { keyboardPwdId: 1, errcode: 0 },
    });
    const { issueGuestPasscode } = await loadTtlock();
    await issueGuestPasscode(baseReservation);
    expect(calls[0]!.url.startsWith("https://euapi.ttlock.com/")).toBe(true);
  });

  it("skips a 'too simple' code (-2032) and uses the next phone-derived candidate", async () => {
    setEnv();
    const json = (o: unknown) => new Response(JSON.stringify(o), { status: 200 });
    const fn = vi.fn(async (url: string, init?: { body?: string }) => {
      const u = String(url);
      if (u.endsWith("/oauth2/token")) return json({ access_token: "tok", expires_in: 7200 });
      if (u.endsWith("/v3/keyboardPwd/add")) {
        const p = new URLSearchParams(String(init?.body ?? ""));
        if (p.get("keyboardPwd") === "5331") return json({ errcode: -2032, errmsg: "too simple" });
        return json({ keyboardPwdId: 7, errcode: 0 });
      }
      return json({});
    });
    vi.stubGlobal("fetch", fn);
    const { issueGuestPasscode } = await loadTtlock();

    const issued = await issueGuestPasscode(baseReservation);
    expect(issued?.mode).toBe("custom");
    expect(issued?.passcode).toBe("0533"); // next 4-digit window after the rejected "5331"
  });

  it("propagates a TTLock errcode (e.g. no gateway) when fallback is off", async () => {
    setEnv();
    mockFetch({
      "/oauth2/token": { access_token: "tok", expires_in: 7200 },
      "/v3/keyboardPwd/add": { errcode: -3007, errmsg: "lock is not connected to a gateway" },
    });
    const { issueGuestPasscode } = await loadTtlock();
    await expect(issueGuestPasscode(baseReservation)).rejects.toThrow(/-3007/);
  });

  it("falls back to a system-generated period code when enabled", async () => {
    setEnv({ TTLOCK_FALLBACK_TO_GENERATED: "true" });
    mockFetch({
      "/oauth2/token": { access_token: "tok", expires_in: 7200 },
      "/v3/keyboardPwd/add": { errcode: -3007, errmsg: "no gateway" },
      "/v3/keyboardPwd/get": { keyboardPwd: "847261", keyboardPwdId: 5 },
    });
    const { issueGuestPasscode } = await loadTtlock();
    const issued = await issueGuestPasscode(baseReservation);
    expect(issued?.mode).toBe("generated");
    expect(issued?.passcode).toBe("847261");
  });

  it("skips (returns null) when no lock is mapped to the apartment", async () => {
    setEnv({ TTLOCK_LOCKS: "apt_02:222" });
    const { issueGuestPasscode } = await loadTtlock();
    expect(await issueGuestPasscode(baseReservation)).toBeNull();
  });

  it("skips when TTLock is not configured", async () => {
    setEnv({ TTLOCK_CLIENT_ID: "" });
    const { issueGuestPasscode, ttlockEnabled } = await loadTtlock();
    expect(ttlockEnabled()).toBe(false);
    expect(await issueGuestPasscode(baseReservation)).toBeNull();
  });

  it("throws when the phone has fewer than 4 digits", async () => {
    setEnv();
    mockFetch({ "/oauth2/token": { access_token: "tok", expires_in: 7200 } });
    const { issueGuestPasscode } = await loadTtlock();
    await expect(issueGuestPasscode({ ...baseReservation, guest_phone: "12" })).rejects.toThrow(/4 digits/);
  });
});
