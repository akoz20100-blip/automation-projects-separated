/** Centralized error -> JSON shaping. Zod errors become 400; everything else 500. */

import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "not_found" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "validation_error", details: err.issues });
    return;
  }
  const message = err instanceof Error ? err.message : "internal_error";
  res.status(500).json({ error: "internal_error", message });
}
