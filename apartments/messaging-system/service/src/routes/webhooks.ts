/**
 * WhatsApp webhook:
 *  GET  /api/webhooks/whatsapp  — Meta verification handshake
 *  POST /api/webhooks/whatsapp  — delivery status callbacks (signature-verified)
 *
 * Status updates (sent/delivered/read/failed) are surfaced in the response and
 * can be mirrored to MessageLog by Make or a follow-up handler. The signature is
 * verified against WHATSAPP_APP_SECRET over the raw request body.
 */

import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import { env } from "../config/env.js";

export const webhooksRouter = Router();

webhooksRouter.get("/whatsapp", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === env.whatsapp.verifyToken) {
    res.status(200).send(String(challenge ?? ""));
    return;
  }
  res.sendStatus(403);
});

function verifySignature(req: Request): boolean {
  if (!env.whatsapp.appSecret) return true; // not configured -> skip (dev)
  const sig = req.header("x-hub-signature-256");
  const raw = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!sig || !raw) return false;
  const expected =
    "sha256=" + crypto.createHmac("sha256", env.whatsapp.appSecret).update(raw).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

webhooksRouter.post("/whatsapp", (req: Request, res: Response) => {
  if (!verifySignature(req)) {
    res.sendStatus(401);
    return;
  }
  // Acknowledge immediately; parse statuses for logging/forwarding.
  const statuses: Array<{ id: string; status: string; recipient_id?: string }> = [];
  try {
    const entries = req.body?.entry ?? [];
    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        for (const s of change.value?.statuses ?? []) {
          statuses.push({ id: s.id, status: s.status, recipient_id: s.recipient_id });
        }
      }
    }
  } catch {
    /* tolerate malformed payloads */
  }
  res.status(200).json({ received: true, statuses });
});
