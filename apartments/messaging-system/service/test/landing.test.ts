import { describe, it, expect } from "vitest";
import { renderLandingPage, toEmbedUrl, escapeHtml } from "../src/services/landing.js";
import type { Apartment } from "../src/types.js";

const apartment: Apartment = {
  apartment_id: "apt_01",
  apartment_name: "Riyadh Apartment 1",
  default_check_in_time: "15:00",
  default_check_out_time: "12:00",
  access_guideline: "رمز الباب 1234 ثم المصعد للدور الثالث",
  checkout_guideline: "اطفئ المكيف واترك المفتاح في الدرج",
  entrance_photo_url: "https://example.com/entrance.jpg",
  video_url: "https://youtu.be/abc123XYZ",
  building_info: "العمارة بجانب الصيدلية، الموقف تحت المبنى",
  maintenance_contact_phone: "966500000000",
  landing_lang_default: "ar",
};

describe("toEmbedUrl", () => {
  it("converts youtu.be links", () => {
    expect(toEmbedUrl("https://youtu.be/abc123XYZ")).toBe("https://www.youtube.com/embed/abc123XYZ");
  });
  it("converts youtube watch links", () => {
    expect(toEmbedUrl("https://www.youtube.com/watch?v=abc123XYZ")).toBe(
      "https://www.youtube.com/embed/abc123XYZ",
    );
  });
  it("converts vimeo links", () => {
    expect(toEmbedUrl("https://vimeo.com/123456789")).toBe("https://player.vimeo.com/video/123456789");
  });
  it("returns null for non-embeddable urls", () => {
    expect(toEmbedUrl("https://example.com/video.mp4")).toBeNull();
  });
});

describe("escapeHtml", () => {
  it("escapes angle brackets and quotes", () => {
    expect(escapeHtml('<b>"x"</b>')).toBe("&lt;b&gt;&quot;x&quot;&lt;/b&gt;");
  });
});

describe("renderLandingPage", () => {
  it("renders an RTL Arabic page with entrance, video embed and sections", () => {
    const html = renderLandingPage(apartment, "ar");
    expect(html).toContain('dir="rtl"');
    expect(html).toContain("Riyadh Apartment 1");
    expect(html).toContain("https://example.com/entrance.jpg");
    expect(html).toContain("https://www.youtube.com/embed/abc123XYZ");
    expect(html).toContain("رمز الباب 1234");
    expect(html).toContain("tel:966500000000");
  });

  it("renders an LTR English page", () => {
    const html = renderLandingPage({ ...apartment }, "en");
    expect(html).toContain('dir="ltr"');
    expect(html).toContain("How to enter");
  });
});
