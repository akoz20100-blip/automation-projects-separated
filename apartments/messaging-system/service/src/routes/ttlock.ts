/**
 * TTLock helper endpoints (authenticated).
 *
 *  GET /api/ttlock/locks   — list the locks on the configured TTLock account so
 *                            the operator can copy each lockId into TTLOCK_LOCKS
 *                            (e.g. "apt_01:1234567,apt_02:7654321").
 *
 * Pure read/diagnostic — does not create passcodes.
 */

import { Router, type Request, type Response } from "express";
import { ttlockEnabled, listLocks } from "../services/ttlock.js";
import { env } from "../config/env.js";

export const ttlockRouter = Router();

ttlockRouter.get("/locks", async (_req: Request, res: Response) => {
  if (!ttlockEnabled()) {
    res.status(400).json({
      error: "TTLock is not configured (set TTLOCK_CLIENT_ID, TTLOCK_CLIENT_SECRET, TTLOCK_USERNAME, TTLOCK_PASSWORD)",
    });
    return;
  }
  const locks = await listLocks();
  res.json({
    count: locks.length,
    mapped: env.ttlock.locks,
    locks: locks.map((l) => ({
      lockId: l.lockId,
      lockAlias: l.lockAlias ?? "",
      lockName: l.lockName ?? "",
      battery: l.electricQuantity ?? null,
    })),
  });
});
