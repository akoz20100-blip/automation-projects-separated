# Check-in Video Setup (Dimora Guest Guide)

The landing page (`service/src/services/landing.ts`) plays a check-in video in
**Section 4**. It supports three sources, picked automatically from the video
URL — you only set a URL, no code change needed.

## Where the video URL comes from

The page uses the first non-empty value of:

1. `media.videoUrl` in **`service/src/data/guestGuide.ts`** (applies to all units), or
2. the `video_url` column of the apartment's row in the **`Apartments`** sheet
   (per-unit; falls back to this when `media.videoUrl` is empty).

So to set ONE video for everything, edit `guestGuide.ts`:

```ts
media: {
  videoUrl: "https://youtu.be/XXXXXXXXXXX",   // or a direct .mp4 URL
  videoPoster: "https://.../poster.jpg",       // optional thumbnail
}
```

## Which hosting to use

| Your situation | Recommended source | What to paste |
|---|---|---|
| Any size, easiest, free | **YouTube (Unlisted)** or **Vimeo** | the share link → auto-embedded |
| Small clip **under ~20 MB**, self-hosted | MP4 in the repo | `"/videos/check-in.mp4"` *(see note)* |
| Large/HD, fast streaming | **Cloudinary** / Cloudflare Stream / R2 | the direct `.mp4` (or HLS) URL |

How the page reacts to the URL:

- **YouTube/Vimeo link** → rendered as a lazy `<iframe>` embed.
- **URL ending in `.mp4`** → rendered as a native
  `<video controls preload="metadata" playsinline poster=...>` (no autoplay, no sound).
- **Any other link** → a tasteful "Watch video" button.
- **Empty** → graceful placeholder: *"سيتم إضافة فيديو الدخول هنا / The check-in
  video will be added here."*

## Self-hosting an MP4 (the under-20MB option)

> ⚠️ Note: this service is a Node/Express API deployed on **Vercel serverless**,
> which does **not** reliably serve large static files from the function. For
> self-hosted MP4 prefer Cloudinary/Cloudflare. If you still want a file in the
> repo, the cleanest path is to commit it and serve it from a CDN/storage bucket,
> then paste that public URL into `videoUrl`.

- Recommended file name: **`check-in.mp4`**
- Recommended location if you add a static folder later: **`public/videos/check-in.mp4`**

## When to use Cloudinary instead of GitHub/repo

Use **Cloudinary** (or Cloudflare Stream / R2) when:

- the video is **larger than ~20 MB**, or
- playback feels slow, or
- you want adaptive streaming / a generated poster.

Do **not** use a Google Drive "preview" embed — it is slow and unreliable on
mobile.

## Recommended compression (mobile-optimized)

- Container/codec: **MP4 (H.264)**, audio AAC.
- Resolution: **720p** is plenty for a how-to clip (1080p only if needed).
- Bitrate: ~1.5–2.5 Mbps; target **well under 20 MB** for a 30–60s clip.
- Add `+faststart` so it streams while loading. Example (ffmpeg):

```bash
ffmpeg -i input.mov -vf "scale=-2:720" -c:v libx264 -crf 24 -preset slow \
  -movflags +faststart -c:a aac -b:a 96k check-in.mp4
```

## Performance guarantees already in the page

- The video is in Section 4 (after the instructions) — **never** the first thing loaded.
- Embeds use `loading="lazy"`; native `<video>` uses `preload="metadata"`.
- No autoplay, no sound, `playsInline` on mobile.
- A `poster` image (when set) shows before the video bytes load.
