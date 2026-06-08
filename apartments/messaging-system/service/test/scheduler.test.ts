import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the data + dispatch layers so we can assert orchestration without network.
vi.mock("../src/services/sheets.js", () => ({
  listDueReservations: vi.fn(),
}));
vi.mock("../src/routes/messages.js", () => ({
  sendForReservation: vi.fn(async () => ({ status: "accepted" })),
  sendNotifyForReservation: vi.fn(async () => ({ status: "accepted" })),
}));

import { plannedGroups, runSlot } from "../src/services/scheduler.js";
import { listDueReservations } from "../src/services/sheets.js";
import { sendForReservation, sendNotifyForReservation } from "../src/routes/messages.js";

const TZ = "Asia/Riyadh";
// 2026-06-07T18:00:00Z == 21:00 on 2026-06-07 in Riyadh (UTC+3).
const NOW = new Date("2026-06-07T18:00:00Z");

describe("plannedGroups", () => {
  it("evening = the night before checkout (tomorrow): guest + owner + cleaner", () => {
    const g = plannedGroups("evening", TZ, NOW);
    expect(g).toHaveLength(1);
    expect(g[0]!.date).toBe("2026-06-08");
    expect(g[0]!.jobs).toEqual([
      { kind: "message", type: "checkout" },
      { kind: "notify", type: "owner_checkout" },
      { kind: "notify", type: "cleaner_checkout" },
    ]);
  });

  it("midday = today's checkouts (owner+cleaner check) + yesterday's review", () => {
    const g = plannedGroups("midday", TZ, NOW);
    expect(g).toHaveLength(2);
    expect(g[0]!.date).toBe("2026-06-07");
    expect(g[0]!.jobs).toEqual([
      { kind: "notify", type: "owner_check" },
      { kind: "notify", type: "cleaner_check" },
    ]);
    expect(g[1]!.date).toBe("2026-06-06");
    expect(g[1]!.jobs).toEqual([{ kind: "message", type: "review" }]);
  });
});

describe("runSlot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listDueReservations).mockResolvedValue([
      { reservation_id: "R1", apartment_id: "apt_01", check_out_date: "2026-06-08" } as never,
    ]);
  });

  it("evening: guest checkout + owner_checkout + cleaner_checkout per reservation", async () => {
    const summary = await runSlot("evening", NOW);
    expect(listDueReservations).toHaveBeenCalledTimes(1);
    expect(sendForReservation).toHaveBeenCalledTimes(1);
    expect(sendNotifyForReservation).toHaveBeenCalledTimes(2);
    expect(summary.results).toHaveLength(3);
    expect(summary.results.every((r) => r.status === "accepted")).toBe(true);
  });

  it("midday: owner_check + cleaner_check (today) and review (yesterday)", async () => {
    const summary = await runSlot("midday", NOW);
    expect(listDueReservations).toHaveBeenCalledTimes(2);
    expect(sendNotifyForReservation).toHaveBeenCalledTimes(2);
    expect(sendForReservation).toHaveBeenCalledTimes(1);
    expect(summary.results).toHaveLength(3);
  });

  it("captures a per-job error without aborting the rest of the run", async () => {
    vi.mocked(sendNotifyForReservation).mockRejectedValueOnce(new Error("boom"));
    const summary = await runSlot("evening", NOW);
    const errored = summary.results.filter((r) => r.status === "error");
    expect(errored).toHaveLength(1);
    expect(errored[0]!.error).toContain("boom");
    // The other two jobs still ran.
    expect(summary.results.filter((r) => r.status === "accepted")).toHaveLength(2);
  });
});
