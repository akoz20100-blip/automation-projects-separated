---
name: dimora-design
description: Apply the Dimora design system to any website, landing page, or web UI in any repo — a light, editorial, Apple-style aesthetic with a single brand accent (Dimora's sage green #889970, overridable), the Thmanyah (ثمانية) serif-display + sans fonts (embedded offline), browser-mock framing, pill segmented toggles, and big-number highlight strips. RTL Arabic-first. Use whenever building or restyling a web page/landing page, or when the user asks for "the design", "my design system", "Dimora style", "نظام التصميم", "خطوط ثمانية", or consistent on-brand styling. This is the single source of truth so the look stays stable across all projects.
---

# Dimora Design System

A portable, framework-free design system. Goal: **every site looks the same on
purpose** — stable, predictable, premium. Built on the owner's design references
(light Apple/SaaS aesthetic) + the **Thmanyah (ثمانية)** fonts + Dimora's brand
**sage green**.

## Use this skill when
Building or restyling any landing page / marketing site / web UI, or when the
user references "the design", "نظام التصميم", "Dimora/ديمورا style", "خطوط ثمانية",
or wants consistent branding. Works in **any repo** — it carries its own assets.

## How to apply (always do this)
1. **Wire the three stylesheets, in order**, from this skill's `assets/`:
   - `fonts.css` — Thmanyah Serif Display + Sans, embedded as base64 (offline, zero external requests).
   - `tokens.css` — colours, type, radius, shadow, gradient art (CSS variables on `:root`).
   - `components.css` — the reusable building blocks.

   For a **self-contained single file** (e.g. a page shared or served from GitHub
   Pages), inline the three files into one `<style>` block instead of linking.
   Copy the needed `assets/*` into the target project (or paste their contents).

2. **Use the tokens — never hard-code colours/fonts.** `var(--ink)`, `var(--muted)`,
   `var(--accent)`, `var(--serif)`, `var(--r)`, `var(--sh)`, etc.

3. **Rebrand by overriding one line:** set `--accent` (and optionally `--accent-dk`)
   on `:root`. Everything accented re-tints. Keep the canvas light.

## Design principles (the "stable" rules)
- **Light canvas, generous whitespace.** Background `--bg` (#F4F4F6), white cards. No dark theme.
- **Serif display headings** (`--serif`, Thmanyah Serif Display) + **clean sans** body (`--sans`).
  Tight heading tracking (`-0.02em`). Two-tone titles: Arabic in `--ink`, English/subtitle in `--muted`.
- **One accent only** — the brand colour (`--accent`, Dimora = sage green `#889970`).
  Use it for the primary CTA/buttons, eyebrow pills, icon chips & tiles, list dots,
  numbers, code pills. **Icons and buttons share this one shade** — no rainbow.
- **Browser-mock framing** (`.pad` + `.mock` with traffic-light dots) for any
  screenshot/photo/product shot, on a soft brand-tinted gradient pad (`--art-hero`).
- **Pill segmented toggle** (`.seg-wrap`/`.seg`) for switching options/plans/units.
- **Big-number strip** (`.stats`) for key facts — use TRUE numbers, never invented.
- **Soft, flat cards**: `--sh` shadow + `--line` hairline border, rounded `--r`.
- **RTL Arabic-first**: `dir="rtl"`, logical properties (`inset-inline`, `padding-inline`,
  `margin-inline`). Mirror directional icons (`html[dir=rtl] .btn .ic{transform:scaleX(-1)}`).
- **Mobile-first**, `max-width:680px` content column.
- **Motion** is subtle; always honour `prefers-reduced-motion`.

## Don't
- ❌ No dark theme, no earth-tones / brown / gold / terracotta, no heavy frosted glass
  everywhere, no Google Fonts / CDN font requests, no invented statistics, no second
  bright accent competing with the brand colour, no multicolour icon tiles (one shade).

## Components (in components.css)
`.wrap` page column · `.btn` / `.btn.ghost` · `.eyebrow` pill · `.sec-head`+`.chip`+`.sec-title`+`.sec-sub`
· `.card` · `.pad`+`.mock`(+`.dot.r/.y/.g`,`.mock-title`) · `.seg-wrap`/`.seg`(+`.on`)
· `.stats`/`.stat` · `.tile-grid`+`.tile`+`.tile-ic` (single brand-accent tiles;
optional multicolour `--art1..4` available if ever needed).

## Scaffold
`assets/starter.html` is a ready RTL page wiring fonts + tokens + components with a
hero, highlights strip, brand-green tiles, and a pill toggle. Start from it, then
replace copy/imagery. Keep section order calm: hero → highlights → content sections → contact.

## Reference implementation
A full production page built with this system lives in this repo at
`apartments/messaging-system/service/src/services/landing.ts` (rendered to
`docs/index.html`). It also shows real patterns: hero background photo behind a
light veil, full-size mock-framed images, an email line, and a brand-tinted
Google-Maps location card. Mirror its structure for richer pages.

## Fonts & licence
Thmanyah (ثمانية). Raw `.woff2` + the licence are in `assets/fonts/`
(`Thmanyah-Font-License.pdf`). Respect the licence when shipping to new domains.
