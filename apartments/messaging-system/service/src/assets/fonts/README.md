# Thmanyah font (خط ثمانية)

Self-hosted brand font used by the Dimora guest-guide landing page.

- **Source**: `akoz20100-blip/eddah-design-reference` → `fonts/thmanyah`.
- **License**: see `Thmanyah-Font-License.pdf` in this folder (ترخيص خط ثمانية).
- **Weights kept here**: Sans 400/700, Serif Display 700.
- **How it's loaded**: the `.woff2` files are embedded as base64 `@font-face`
  rules in `src/assets/thmanyahFonts.ts` (generated), so the page loads with
  **zero external font requests** (no Google Fonts / CDN). Headings use
  *Thmanyah Serif Display*; body/UI uses *Thmanyah Sans*.
- **To refresh / add weights**: drop the `.woff2` here and re-run the font
  generator (recreates `thmanyahFonts.ts`).
