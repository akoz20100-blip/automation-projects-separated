/**
 * OCR intake using an OpenAI-compatible vision model.
 *
 * Provider-agnostic: point OCR_API_BASE_URL at any OpenAI-compatible aggregator
 * (e.g. OpenRouter) and choose a cheap accurate vision model via OCR_MODEL
 * (e.g. a Qwen2.5-VL variant). No vendor lock-in.
 */

import OpenAI from "openai";
import { z } from "zod";
import { env } from "../config/env.js";
import { OCR_SYSTEM_PROMPT } from "../prompts/ocrSystemPrompt.js";
import { normalizePhone } from "../domain/phone.js";
import type { ExtractedReservation } from "../types.js";

export const extractedSchema = z.object({
  guest_name: z.string().nullable(),
  guest_phone: z.string().nullable(),
  guest_phone_confidence: z.enum(["high", "medium", "low"]).default("low"),
  check_in_date: z.string().nullable(),
  check_out_date: z.string().nullable(),
  check_in_time: z.string().nullable(),
  check_out_time: z.string().nullable(),
  reservation_code: z.string().nullable(),
  source: z.string().nullable(),
});

export interface OcrResult {
  extracted: ExtractedReservation;
  warnings: string[];
  needs_review: boolean;
}

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: env.ocr.apiKey, baseURL: env.ocr.baseUrl });
  }
  return client;
}

/** Strip markdown fences and pull the first JSON object from model output. */
export function parseModelJson(content: string): unknown {
  const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("OCR model did not return JSON");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

/**
 * Turn raw model output into a validated, normalized result with warnings and a
 * human-review flag. Exported separately so it can be unit-tested without the
 * network.
 */
export function buildResult(raw: unknown): OcrResult {
  const parsed = extractedSchema.parse(raw);
  const normalizedPhone = normalizePhone(parsed.guest_phone);

  const extracted: ExtractedReservation = {
    ...parsed,
    guest_phone: normalizedPhone,
  };

  const warnings: string[] = [];
  if (!normalizedPhone) warnings.push("phone not readable in screenshot — manual entry required");
  if (parsed.guest_phone_confidence !== "high") warnings.push("low/medium phone confidence — verify before sending");
  if (!parsed.check_in_date || !parsed.check_out_date) warnings.push("check-in/out dates incomplete");
  if (!parsed.guest_name) warnings.push("guest name not detected");

  const needs_review = warnings.length > 0;
  return { extracted, warnings, needs_review };
}

/**
 * Run extraction against a booking screenshot.
 * @param imageBase64 base64 (no data: prefix) of a PNG/JPG image
 * @param mime e.g. "image/png"
 */
export async function extractFromImage(
  imageBase64: string,
  mime = "image/png",
): Promise<OcrResult> {
  const completion = await getClient().chat.completions.create({
    model: env.ocr.model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: OCR_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract the reservation fields from this booking screenshot." },
          { type: "image_url", image_url: { url: `data:${mime};base64,${imageBase64}` } },
        ],
      },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";
  return buildResult(parseModelJson(content));
}
