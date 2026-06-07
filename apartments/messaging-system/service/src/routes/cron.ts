/**
 * Scheduled-job entrypoints, triggered by Vercel Cron (see vercel.json).
 *
 * Vercel automatically adds `Authorization: Bearer <CRON_SECRET>` to cron
 * invocations when the CRON_SECRET env var is set; we verify it (falling back to
 * API_SECRET). A `?key=<secret>` query param is also accepted so you can trigger
 * a run manually or from an external scheduler.
 *
 * Schedules (UTC; Asia/Riyadh = UTC+3, no DST):
 *   /api/cron/evening  "0 20 * * *"  -> 23:00 Riyadh  (night-before checkout)
 *   /api/cron/midday   "0 9 * * *"   -> 12:00 Riyadh  (checkout day + review)
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { env } from "../config/env.js";
import { runSlot } from "../services/scheduler.js";

export const cronRouter = Router();

function requireCron(req: Request, res: Response, next: NextFunction): void {
  const secret = env.cron.secret || env.apiSecret;
  const header = req.header("authorization") ?? "";
  const fromQuery = typeof req.query.key === "string" ? req.query.key : "";
  if (header === `Bearer ${secret}` || (secret && fromQuery === secret)) {
    next();
    return;
  }
  res.status(401).json({ error: "unauthorized" });
}

cronRouter.get("/evening", requireCron, async (_req: Request, res: Response) => {
  res.json(await runSlot("evening"));
});

cronRouter.get("/midday", requireCron, async (_req: Request, res: Response) => {
  res.json(await runSlot("midday"));
});
