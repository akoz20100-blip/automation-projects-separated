import { describe, it, expect } from "vitest";
import { normalizePhone, isValidPhone, requireValidPhone } from "../src/domain/phone.js";

describe("normalizePhone", () => {
  it("keeps a clean international number", () => {
    expect(normalizePhone("966512345678")).toBe("966512345678");
  });

  it("strips +, spaces and dashes", () => {
    expect(normalizePhone("+966 51-234-5678")).toBe("966512345678");
  });

  it("drops a leading 00 international prefix", () => {
    expect(normalizePhone("00966512345678")).toBe("966512345678");
  });

  it("converts Arabic-Indic digits", () => {
    expect(normalizePhone("٩٦٦٥١٢٣٤٥٦٧٨")).toBe("966512345678");
  });

  it("rejects too-short and empty values", () => {
    expect(normalizePhone("123")).toBeNull();
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone(null)).toBeNull();
  });
});

describe("isValidPhone", () => {
  it("accepts digits-only intl numbers", () => {
    expect(isValidPhone("966512345678")).toBe(true);
  });
  it("rejects numbers with +", () => {
    expect(isValidPhone("+966512345678")).toBe(false);
  });
});

describe("requireValidPhone", () => {
  it("returns normalized value", () => {
    expect(requireValidPhone("+966 512345678")).toBe("966512345678");
  });
  it("throws on invalid", () => {
    expect(() => requireValidPhone("abc")).toThrow();
  });
});
