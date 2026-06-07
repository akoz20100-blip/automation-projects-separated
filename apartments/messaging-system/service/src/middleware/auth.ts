/** Bearer token auth. Every API route except the public landing page and the
 * WhatsApp webhook (which uses Meta's own signature) requires this. */

import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.header("authorization") ?? "";
  const expected = `Bearer ${env.apiSecret}`;
  if (header !== expected) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}
