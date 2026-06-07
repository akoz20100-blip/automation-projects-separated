import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/services/sheets.js", () => ({
  findMessageLog: vi.fn(),
}));

import { findMessageLog } from "../src/services/sheets.js";
import { checkAlreadySent } from "../src/services/idempotency.js";

const mockFind = vi.mocked(findMessageLog);

describe("checkAlreadySent", () => {
  beforeEach(() => mockFind.mockReset());

  it("treats a previously sent message as already sent", async () => {
    mockFind.mockResolvedValue({
      reservation_id: "R1",
      message_type: "access",
      status: "sent",
      wa_message_id: "wamid.123",
    } as never);
    const out = await checkAlreadySent("R1", "access");
    expect(out.alreadySent).toBe(true);
    expect(out.messageId).toBe("wamid.123");
  });

  it("allows sending when no log row exists", async () => {
    mockFind.mockResolvedValue(null as never);
    const out = await checkAlreadySent("R1", "checkout");
    expect(out.alreadySent).toBe(false);
  });

  it("allows resending when the prior attempt failed", async () => {
    mockFind.mockResolvedValue({
      reservation_id: "R1",
      message_type: "review",
      status: "failed",
      wa_message_id: "",
    } as never);
    const out = await checkAlreadySent("R1", "review");
    expect(out.alreadySent).toBe(false);
  });
});
