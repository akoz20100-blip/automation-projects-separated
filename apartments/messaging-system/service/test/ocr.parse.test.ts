import { describe, it, expect } from "vitest";
import { parseModelJson, buildResult } from "../src/services/ocr.js";
import sample from "./fixtures/ocr-response-sample.json" assert { type: "json" };

describe("parseModelJson", () => {
  it("extracts JSON wrapped in markdown fences", () => {
    const raw = "```json\n{\"guest_name\":\"Ali\"}\n```";
    expect(parseModelJson(raw)).toEqual({ guest_name: "Ali" });
  });

  it("extracts JSON with surrounding prose", () => {
    const raw = 'Here you go: {"a":1} thanks';
    expect(parseModelJson(raw)).toEqual({ a: 1 });
  });

  it("throws when no JSON present", () => {
    expect(() => parseModelJson("no json here")).toThrow();
  });
});

describe("buildResult", () => {
  it("normalizes phone and marks high-confidence as ready", () => {
    const result = buildResult(sample);
    expect(result.extracted.guest_phone).toBe("966512345678");
    expect(result.extracted.guest_name).toBe("محمد العتيبي");
    expect(result.needs_review).toBe(false);
    expect(result.warnings).toHaveLength(0);
  });

  it("flags review when phone is missing", () => {
    const result = buildResult({ ...sample, guest_phone: null, guest_phone_confidence: "low" });
    expect(result.extracted.guest_phone).toBeNull();
    expect(result.needs_review).toBe(true);
    expect(result.warnings.join(" ")).toContain("phone");
  });

  it("flags review when dates are incomplete", () => {
    const result = buildResult({ ...sample, check_out_date: null });
    expect(result.needs_review).toBe(true);
  });
});
