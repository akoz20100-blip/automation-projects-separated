import { describe, it, expect } from "vitest";
import { renderText, bodyParams, landingUrl } from "../src/services/templates.js";
import type { Apartment, Reservation } from "../src/types.js";

const reservation: Reservation = {
  reservation_id: "AIRBNB-2026-0001",
  source: "airbnb",
  apartment_id: "apt_01",
  apartment_name: "Riyadh Apartment 1",
  guest_name: "Ahmed",
  guest_phone: "966512345678",
  guest_language: "ar",
  check_in_date: "2026-06-10",
  check_out_date: "2026-06-13",
  check_in_time: "15:00",
  check_out_time: "12:00",
  status: "confirmed",
  airbnb_review_url: "https://airbnb.com/review",
};

const apartment: Apartment = {
  apartment_id: "apt_01",
  apartment_name: "Riyadh Apartment 1",
  default_check_in_time: "15:00",
  default_check_out_time: "12:00",
  access_guideline: "رمز الباب 1234",
  checkout_guideline: "اطفئ المكيف واترك المفتاح",
  airbnb_review_url: "https://airbnb.com/review",
};

describe("renderText", () => {
  it("renders the Arabic access message with guest name and landing link", () => {
    const text = renderText("access", reservation, apartment);
    expect(text).toContain("Ahmed");
    expect(text).toContain("Riyadh Apartment 1");
    expect(text).toContain("رمز الباب 1234");
    expect(text).toContain("/api/landing/apt_01");
  });

  it("includes a rotating D1 door code in the access message", () => {
    const text = renderText("access", reservation, apartment);
    expect(text).toContain("🔐");
    // the code is one of the D1 pool entries
    expect(text).toMatch(/رمز الباب الذكي: (0555|4050|5060|6070)/);
  });

  it("omits the door-code block for an apartment without a pool", () => {
    const r2 = { ...reservation, apartment_id: "apt_02" };
    const a2 = { ...apartment, apartment_id: "apt_02" };
    const text = renderText("access", r2, a2);
    expect(text).not.toContain("🔐");
  });

  it("renders the checkout reminder with checkout date/time", () => {
    const text = renderText("checkout", reservation, apartment);
    expect(text).toContain("2026-06-13");
    expect(text).toContain("12:00");
    expect(text).toContain("اطفئ المكيف");
  });

  it("renders the review request with the review url", () => {
    const text = renderText("review", reservation, apartment);
    expect(text).toContain("https://airbnb.com/review");
  });

  it("supports English templates", () => {
    const en = { ...reservation, guest_language: "en" as const };
    const text = renderText("access", en, apartment);
    expect(text).toContain("Welcome");
    expect(text).toContain("reservation at");
  });
});

describe("bodyParams positional mapping", () => {
  it("maps access params {{1}}..{{6}} in order", () => {
    const params = bodyParams("access", reservation, apartment);
    expect(params).toHaveLength(6);
    expect(params[0]).toBe("Ahmed");
    expect(params[1]).toBe("Riyadh Apartment 1");
    expect(params[2]).toBe("2026-06-10");
    expect(params[3]).toBe("15:00");
    expect(params[4]).toBe("رمز الباب 1234");
    expect(params[5]).toContain("/api/landing/apt_01");
  });

  it("maps checkout params {{1}}..{{5}}", () => {
    const params = bodyParams("checkout", reservation, apartment);
    expect(params).toHaveLength(5);
    expect(params[2]).toBe("2026-06-13");
  });

  it("maps review params {{1}}..{{3}}", () => {
    const params = bodyParams("review", reservation, apartment);
    expect(params).toHaveLength(3);
    expect(params[2]).toBe("https://airbnb.com/review");
  });
});

describe("landingUrl", () => {
  it("includes apartment id and language", () => {
    expect(landingUrl("apt_02", "en")).toContain("/api/landing/apt_02?lang=en");
  });
});
