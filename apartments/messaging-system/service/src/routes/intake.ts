/**
 * OCR intake: POST /api/intake/ocr
 * Accepts a booking screenshot (multipart field `image`, or JSON {image_base64}).
 * Returns extracted fields + warnings + needs_review. Does NOT write to Sheets —
 * the operator (via Make or a form) creates the row and confirms before sending.
 */

import { Router, type Request, type Response } from "express";
import multer from "multer";
import { extractFromImage } from "../services/ocr.js";

export const intakeRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
});

intakeRouter.post("/ocr", upload.single("image"), async (req: Request, res: Response) => {
  let base64: string | undefined;
  let mime = "image/png";

  if (req.file) {
    base64 = req.file.buffer.toString("base64");
    mime = req.file.mimetype || mime;
  } else if (typeof req.body?.image_base64 === "string") {
    base64 = req.body.image_base64.replace(/^data:[^;]+;base64,/, "");
    if (typeof req.body?.mime === "string") mime = req.body.mime;
  }

  if (!base64) {
    res.status(400).json({ error: "no image provided (field 'image' or 'image_base64')" });
    return;
  }

  const result = await extractFromImage(base64, mime);
  res.json(result);
});
