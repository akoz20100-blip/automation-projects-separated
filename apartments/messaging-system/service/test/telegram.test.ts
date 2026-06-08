import { describe, it, expect } from "vitest";
import { pickApartmentId, detectLang, genReservationId } from "../src/routes/telegram.js";

describe("telegram intake helpers", () => {
  it("picks apartment id from the caption", () => {
    expect(pickApartmentId("D2").id).toBe("apt_02");
    expect(pickApartmentId("حجز جناح D2").id).toBe("apt_02");
    expect(pickApartmentId("apt_02").id).toBe("apt_02");
    expect(pickApartmentId("d1 studio").id).toBe("apt_01");
    expect(pickApartmentId("ستوديو").id).toBe("apt_01");
  });

  it("defaults the apartment when the caption is missing", () => {
    const r = pickApartmentId(undefined);
    expect(r.explicit).toBe(false);
    expect(r.id).toBe("apt_01");
  });

  it("detects language from the guest name", () => {
    expect(detectLang("محمد")).toBe("ar");
    expect(detectLang("John Smith")).toBe("en");
    expect(detectLang("")).toBe("ar");
  });

  it("builds a reservation id from the booking code or a fallback", () => {
    expect(genReservationId("HMABCD123")).toBe("HMABCD123");
    expect(genReservationId("HM-ABC 12")).toBe("HMABC12");
    expect(genReservationId(null)).toMatch(/^R[A-Z0-9]+$/);
  });
});
