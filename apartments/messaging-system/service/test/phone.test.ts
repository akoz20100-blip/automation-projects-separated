import { describe, it, expect } from "vitest";
import {
  normalizePhone,
  isValidPhone,
  requireValidPhone,
  lastDigits,
  isSimplePasscode,
  passcodeCandidates,
} from "../src/domain/phone.js";

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

  it("converts local Saudi mobile to international", () => {
    expect(normalizePhone("0502305331")).toBe("966502305331");
    expect(normalizePhone("502305331")).toBe("966502305331");
    expect(normalizePhone("٠٥٠٢٣٠٥٣٣١")).toBe("966502305331");
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

describe("lastDigits", () => {
  it("returns the last 4 digits for a smart-lock passcode", () => {
    expect(lastDigits("966502305331")).toBe("5331");
    expect(lastDigits("+966 50-230-5331")).toBe("5331");
  });
  it("maps Arabic-Indic digits", () => {
    expect(lastDigits("٩٦٦٥٠٢٣٠٥٣٣١")).toBe("5331");
  });
  it("preserves leading zeros within the slice", () => {
    expect(lastDigits("96650230" + "0042")).toBe("0042");
  });
  it("returns null when there aren't enough digits", () => {
    expect(lastDigits("12")).toBeNull();
    expect(lastDigits("")).toBeNull();
    expect(lastDigits(null)).toBeNull();
  });
});

describe("isSimplePasscode", () => {
  it("flags all-same and strictly consecutive codes", () => {
    expect(isSimplePasscode("1111")).toBe(true);
    expect(isSimplePasscode("0000")).toBe(true);
    expect(isSimplePasscode("1234")).toBe(true);
    expect(isSimplePasscode("4321")).toBe(true);
  });
  it("accepts ordinary codes", () => {
    expect(isSimplePasscode("5331")).toBe(false);
    expect(isSimplePasscode("8462")).toBe(false);
    expect(isSimplePasscode("0012")).toBe(false);
  });
});

describe("passcodeCandidates", () => {
  it("puts the last-4 first when it isn't too simple", () => {
    const c = passcodeCandidates("966502305331");
    expect(c[0]).toBe("5331");
  });
  it("prefers a non-simple window when the last-4 is too simple", () => {
    // ...001234 -> last-4 '1234' is consecutive, so it is deprioritised.
    const c = passcodeCandidates("966500001234");
    expect(c[0]).not.toBe("1234");
    expect(isSimplePasscode(c[0]!)).toBe(false);
    expect(c).toContain("1234"); // still kept as a last resort
  });
  it("returns empty when there aren't enough digits", () => {
    expect(passcodeCandidates("12")).toEqual([]);
    expect(passcodeCandidates(null)).toEqual([]);
  });
});
