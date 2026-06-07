/**
 * Public landing page: GET /api/landing/:apartment_id?lang=ar|en
 * No auth (it is shared with guests). Renders the per-apartment guide HTML.
 *
 * Falls back to built-in Dimora defaults when the Google Sheet is not configured
 * or the row is missing, so the page is viewable immediately after deploy.
 */

import { Router, type Request, type Response } from "express";
import { getApartment } from "../services/sheets.js";
import { renderLandingPage, defaultApartment } from "../services/landing.js";
import type { Apartment, Language } from "../types.js";

export const landingRouter = Router();

landingRouter.get("/:apartment_id", async (req: Request, res: Response) => {
  const id = req.params.apartment_id ?? "";

  let apartment: Apartment | null = null;
  try {
    apartment = await getApartment(id);
  } catch {
    // Sheet not configured / unreachable — fall through to defaults.
  }
  if (!apartment) apartment = defaultApartment(id);

  const langParam = String(req.query.lang ?? "");
  const lang: Language =
    langParam === "en" || langParam === "ar"
      ? langParam
      : apartment.landing_lang_default ?? "ar";

  res.type("html").send(renderLandingPage(apartment, lang));
});
