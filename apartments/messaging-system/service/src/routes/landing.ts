/**
 * Public landing page: GET /api/landing/:apartment_id?lang=ar|en
 * No auth (it is shared with guests). Renders the per-apartment guide HTML.
 */

import { Router, type Request, type Response } from "express";
import { getApartment } from "../services/sheets.js";
import { renderLandingPage } from "../services/landing.js";
import type { Language } from "../types.js";

export const landingRouter = Router();

landingRouter.get("/:apartment_id", async (req: Request, res: Response) => {
  const apartment = await getApartment(req.params.apartment_id ?? "");
  if (!apartment) {
    res.status(404).type("html").send("<h1>Not found</h1>");
    return;
  }
  const langParam = String(req.query.lang ?? "");
  const lang: Language =
    langParam === "en" || langParam === "ar"
      ? langParam
      : apartment.landing_lang_default ?? "ar";

  res.type("html").send(renderLandingPage(apartment, lang));
});
