/**
 * OCR intake: POST /api/intake/ocr
 * Accepts ONE OR MORE booking screenshots (multipart field `image` — repeatable,
 * or JSON {image_base64} / {images_base64: [...]}). Merges them into one result.
 * Returns extracted fields + warnings + needs_review. Does NOT write to Sheets —
 * the operator confirms before sending.
 */

import { Router, type Request, type Response } from "express";
import multer from "multer";
import { extractFromImages, type OcrImage } from "../services/ocr.js";

export const intakeRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 5 }, // up to 5 images, 8 MB each
});

const stripPrefix = (s: string) => s.replace(/^data:[^;]+;base64,/, "");

intakeRouter.post("/ocr", upload.array("image", 5), async (req: Request, res: Response) => {
  const images: OcrImage[] = [];

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  for (const f of files) {
    images.push({ base64: f.buffer.toString("base64"), mime: f.mimetype || "image/png" });
  }

  // JSON fallbacks: single image_base64 or an images_base64 array.
  if (typeof req.body?.image_base64 === "string") {
    images.push({ base64: stripPrefix(req.body.image_base64), mime: req.body?.mime });
  }
  if (Array.isArray(req.body?.images_base64)) {
    for (const b of req.body.images_base64) {
      if (typeof b === "string") images.push({ base64: stripPrefix(b) });
    }
  }

  if (images.length === 0) {
    res.status(400).json({ error: "no image provided (field 'image', or 'image_base64' / 'images_base64')" });
    return;
  }

  const result = await extractFromImages(images);
  res.json(result);
});
