import { describe, it, expect } from "vitest";
import { rotateDoorCode, resolveDoorCode, DOOR_CODE_POOLS } from "../src/data/doorCodes.js";

describe("rotateDoorCode", () => {
  const pool = ["0555", "4050", "5060", "6070"];
  it("rotates sequentially and wraps around", () => {
    expect(pool.map((_, i) => rotateDoorCode(pool, i))).toEqual(pool);
    expect(rotateDoorCode(pool, 4)).toBe("0555");
    expect(rotateDoorCode(pool, 5)).toBe("4050");
  });
  it("handles negative and empty", () => {
    expect(rotateDoorCode(pool, -1)).toBe("6070");
    expect(rotateDoorCode([], 3)).toBe("");
  });
});

describe("resolveDoorCode", () => {
  it("uses the D1 pool and is stable per reservation id", () => {
    const a = resolveDoorCode("apt_01", { reservationId: "RES-1" });
    const b = resolveDoorCode("apt_01", { reservationId: "RES-1" });
    expect(DOOR_CODE_POOLS.apt_01).toContain(a);
    expect(a).toBe(b); // re-sends keep the same code
  });
  it("supports strict sequential rotation via seq", () => {
    expect(resolveDoorCode("apt_01", { seq: 0 })).toBe("0555");
    expect(resolveDoorCode("apt_01", { seq: 1 })).toBe("4050");
  });
  it("an explicit code always wins (e.g. a TTLock API code)", () => {
    expect(resolveDoorCode("apt_01", { doorCode: "9999", seq: 0 })).toBe("9999");
  });
  it("returns empty for an apartment without a pool", () => {
    expect(resolveDoorCode("apt_02", { reservationId: "RES-9" })).toBe("");
  });
});
