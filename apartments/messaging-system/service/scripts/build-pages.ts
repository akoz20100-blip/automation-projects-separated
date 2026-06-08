/**
 * Build the self-contained static pages from the live renderer.
 *
 *   npm run build:pages
 *
 * Renders `renderLandingPage` (the SAME code the server serves) for ar + en,
 * inlines the shared Dimora images as optimised base64 data-URIs (so the page
 * needs zero external requests and works the moment it is opened anywhere), and
 * writes:
 *   - docs/index.html                         (published via GitHub Pages, ar)
 *   - apartments/landing-page/preview/dimora-ar.html
 *   - apartments/landing-page/preview/dimora-en.html
 *
 * Edit the design in src/services/landing.ts (and copy in src/data/guestGuide.ts),
 * then re-run this script to refresh all three artifacts together.
 */

import { fileURLToPath } from "node:url";
import { dirname, resolve, basename } from "node:path";
import { writeFileSync, mkdirSync, statSync } from "node:fs";
import sharp from "sharp";
import { renderLandingPage, defaultApartment } from "../src/services/landing.js";
import { guide } from "../src/data/guestGuide.js";

const here = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(here, "../../../..");
const IMAGES = resolve(REPO, "apartments/landing-page/images");
const DOCS = resolve(REPO, "docs");
const PREVIEW = resolve(REPO, "apartments/landing-page/preview");

const kb = (n: number) => `${Math.round(n / 1024)} KB`;

/** Optimise a logo (keep PNG transparency) into a base64 data-URI. */
async function logoUri(file: string): Promise<string> {
  const buf = await sharp(resolve(IMAGES, file))
    .resize({ width: 520, withoutEnlargement: true })
    .png({ compressionLevel: 9, effort: 9 })
    .toBuffer();
  return `data:image/png;base64,${buf.toString("base64")}`;
}

/** Optimise a photo (flatten onto white, JPEG) into a base64 data-URI. */
async function photoUri(file: string, width = 1200, quality = 72): Promise<string> {
  const buf = await sharp(resolve(IMAGES, file))
    .resize({ width, withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

async function main() {
  // Map the renderer's image URLs -> inlined, optimised data-URIs.
  const map = new Map<string, string>();
  map.set(guide.brand.logoUrl, await logoUri(basename(guide.brand.logoUrl)));
  map.set(guide.media.heroImageUrl, await photoUri(basename(guide.media.heroImageUrl)));
  // Hero backdrop is now clearly visible, so encode it at a decent quality.
  map.set(guide.media.heroBackgroundUrl, await photoUri(basename(guide.media.heroBackgroundUrl), 1200, 72));
  // Wayfinding is now shown full-size, so encode it sharper.
  map.set(guide.media.wayfindingImageUrl, await photoUri(basename(guide.media.wayfindingImageUrl), 1280, 78));
  map.set(guide.media.mapImageUrl, await photoUri(basename(guide.media.mapImageUrl), 1000, 72));

  const inline = (html: string): string => {
    for (const [url, uri] of map) html = html.split(url).join(uri);
    return html;
  };

  const apt = defaultApartment("apt_01");
  const ar = inline(renderLandingPage(apt, "ar"));
  const en = inline(renderLandingPage(apt, "en"));

  mkdirSync(DOCS, { recursive: true });
  writeFileSync(resolve(DOCS, "index.html"), ar);
  writeFileSync(resolve(DOCS, ".nojekyll"), "");
  mkdirSync(PREVIEW, { recursive: true });
  writeFileSync(resolve(PREVIEW, "dimora-ar.html"), ar);
  writeFileSync(resolve(PREVIEW, "dimora-en.html"), en);

  console.log("Built:");
  for (const p of [
    resolve(DOCS, "index.html"),
    resolve(PREVIEW, "dimora-ar.html"),
    resolve(PREVIEW, "dimora-en.html"),
  ]) {
    console.log(`  ${p.replace(REPO + "/", "")}  (${kb(statSync(p).size)})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
