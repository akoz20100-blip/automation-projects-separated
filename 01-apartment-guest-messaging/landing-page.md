# Landing Page (Guest Guide)

A single, lightweight, brand-themeable page per apartment, linked from the guest
messages. Served by the Cloud API at `GET /api/landing/:apartment_id?lang=ar|en`
and rendered from the `Apartments` sheet row (`services/landing.ts`).

## Contents

- Building **entrance photo** (`entrance_photo_url`).
- Embedded **"how to enter" video** (`video_url`) — YouTube/Vimeo auto-embed.
- **Access instructions** (`access_guideline`).
- **Building info / directions / Wi-Fi** (`building_info`).
- **Checkout instructions** (`checkout_guideline`).
- **Maintenance contact** (`maintenance_contact_phone`).

## Branding (you provide)

The page is themed with CSS variables and a logo slot — supply:

- `BRAND_LOGO_URL` — your logo image URL (shown in the header).
- `BRAND_PRIMARY_COLOR` — header/accent color (e.g. `#0E7C66`).
- `BRAND_SECONDARY_COLOR` — page background (e.g. `#F4F1EA`).

The layout is mobile-first, server-rendered HTML + inline CSS, RTL for Arabic,
`noindex`. No framework, no build step → the link stays light and fast.

## Media hosting

You have a "how to enter" video to upload. Recommended:

- **Video**: upload to **YouTube (unlisted)** or **Vimeo** and paste the share
  link into `video_url`. The page auto-converts it to an embed. This streams
  reliably on mobile and costs nothing. (Avoid self-hosting the MP4.)
  - Alternatives without a third party: Cloudflare Stream / R2, or Google Cloud
    Storage with a direct `.mp4` URL (shown via a `<video>` tag fallback).
- **Entrance photo**: any public image URL (storage bucket or a direct Drive
  link). Keep it optimized (< ~300 KB) for fast mobile loads.

## URL shape

```
https://<your-vercel-domain>/api/landing/apt_01?lang=ar
```

`vercel.json` also rewrites the clean form `/apt_01` to the same handler.
`LANDING_BASE_URL` must point at the deployed domain so message links resolve.

## How to upload the video to YouTube (unlisted)

1. youtube.com → Create → Upload video → choose your file.
2. Set **Visibility = Unlisted** (only people with the link can view).
3. Publish, copy the share link (e.g. `https://youtu.be/XXXXXXXXXXX`).
4. Put that link in the apartment's `video_url` cell in the `Apartments` sheet.
