import { describe, it, expect } from "vitest";
import {
  addDays,
  todayInTz,
  tomorrowInTz,
  yesterdayInTz,
  isCheckoutAfterCheckin,
  dueCheckoutDate,
  epochMsInTz,
} from "../src/domain/dates.js";

const TZ = "Asia/Riyadh";

describe("addDays", () => {
  it("adds and subtracts days across month boundaries", () => {
    expect(addDays("2026-06-30", 1)).toBe("2026-07-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("timezone day calculations", () => {
  // 2026-06-03T22:30:00Z is 2026-06-04 01:30 in Riyadh (UTC+3).
  const now = new Date("2026-06-03T22:30:00Z");
  it("computes today in Riyadh", () => {
    expect(todayInTz(TZ, now)).toBe("2026-06-04");
  });
  it("computes tomorrow and yesterday", () => {
    expect(tomorrowInTz(TZ, now)).toBe("2026-06-05");
    expect(yesterdayInTz(TZ, now)).toBe("2026-06-03");
  });
});

describe("isCheckoutAfterCheckin", () => {
  it("requires checkout strictly after checkin", () => {
    expect(isCheckoutAfterCheckin("2026-06-10", "2026-06-13")).toBe(true);
    expect(isCheckoutAfterCheckin("2026-06-10", "2026-06-10")).toBe(false);
    expect(isCheckoutAfterCheckin("2026-06-13", "2026-06-10")).toBe(false);
  });
});

describe("epochMsInTz", () => {
  it("converts a Riyadh (UTC+3) wall-clock time to epoch ms", () => {
    // Check-in 16:00 Riyadh == 13:00 UTC; checkout 12:00 Riyadh == 09:00 UTC.
    expect(epochMsInTz("2026-06-10", "16:00", TZ)).toBe(Date.parse("2026-06-10T13:00:00Z"));
    expect(epochMsInTz("2026-06-13", "12:00", TZ)).toBe(Date.parse("2026-06-13T09:00:00Z"));
  });
  it("matches plain UTC for the UTC zone", () => {
    expect(epochMsInTz("2026-06-10", "16:00", "UTC")).toBe(Date.parse("2026-06-10T16:00:00Z"));
  });
});

describe("dueCheckoutDate", () => {
  const now = new Date("2026-06-03T22:30:00Z"); // Riyadh 2026-06-04
  it("checkout reminder targets tomorrow's checkout", () => {
    expect(dueCheckoutDate("checkout", TZ, now)).toBe("2026-06-05");
  });
  it("review targets yesterday's checkout", () => {
    expect(dueCheckoutDate("review", TZ, now)).toBe("2026-06-03");
  });
});
