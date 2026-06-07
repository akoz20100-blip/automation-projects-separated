import { describe, it, expect } from "vitest";
import { renderNotify } from "../src/services/templates.js";
import type { Apartment, Reservation } from "../src/types.js";

const reservation: Reservation = {
  reservation_id: "AIRBNB-2026-0001",
  source: "airbnb",
  apartment_id: "apt_01",
  apartment_name: "شقة الرياض 1",
  guest_name: "محمد العتيبي",
  guest_phone: "966512345678",
  guest_language: "ar",
  check_in_date: "2026-06-10",
  check_out_date: "2026-06-13",
  check_in_time: "15:00",
  check_out_time: "12:00",
  status: "confirmed",
};

const apartment: Apartment = {
  apartment_id: "apt_01",
  apartment_name: "شقة الرياض 1",
  default_check_in_time: "15:00",
  default_check_out_time: "12:00",
  access_guideline: "",
  checkout_guideline: "",
};

describe("renderNotify", () => {
  it("owner_new includes guest, apartment, dates and phone", () => {
    const t = renderNotify("owner_new", reservation, apartment);
    expect(t).toContain("حجز جديد");
    expect(t).toContain("محمد العتيبي");
    expect(t).toContain("شقة الرياض 1");
    expect(t).toContain("2026-06-10");
    expect(t).toContain("966512345678");
  });

  it("owner_checkout mentions tomorrow checkout", () => {
    const t = renderNotify("owner_checkout", reservation, apartment);
    expect(t).toContain("خروج");
    expect(t).toContain("2026-06-13");
    expect(t).toContain("12:00");
  });

  it("owner_check asks whether the guest left", () => {
    const t = renderNotify("owner_check", reservation, apartment);
    expect(t).toContain("هل طلع");
    expect(t).toContain("مدّد");
  });

  it("cleaner_checkout mentions the apartment and checkout date", () => {
    const t = renderNotify("cleaner_checkout", reservation, apartment);
    expect(t).toContain("تنظيف");
    expect(t).toContain("شقة الرياض 1");
    expect(t).toContain("2026-06-13");
  });
});
