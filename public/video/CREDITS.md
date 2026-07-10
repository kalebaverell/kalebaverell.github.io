# Video credits & license verification

All footage in this folder is a U.S. federal government work and therefore in the
public domain (17 U.S.C. § 105). The video's DVIDS source page was fetched and verified
on **2026-07-10** to carry DVIDS' explicit **"PUBLIC DOMAIN"** license label before use.
This follows the same sourcing standard as `public/img/CREDITS.md`.

---

## hero-loop.mp4 (+ hero-poster.jpg)

- **Intended use:** Homepage band — muted, looping background video (integration handled
  in the main app; this folder only ships the asset).
- **Title:** "Transition Assistance Program prepares soldiers for life outside the military"
  (DVIDS video 872406, DoD asset ID DOD_109438622)
- **Videographer:** Sgt. Charlie Duke, 24th Theater Public Affairs Support Element
  (U.S. government work)
- **Date taken:** 01.27.2023 — SFL-TAP Center, Fort Bliss, Texas
- **Source page:** https://www.dvidshub.net/video/872406/transition-assistance-program-prepares-soldiers-life-outside-military
- **License line on source page (verified 2026-07-10):** "PUBLIC DOMAIN" — page footer reads:
  *"This work, Transition Assistance Program prepares soldiers for life outside the
  military, by SGT Charlie Duke, identified by DVIDS, must comply with the restrictions
  shown on https://www.dvidshub.net/about/copyright"* (those restrictions confirm
  DVIDS-labeled public-domain works are free to use without permission).
- **File fetched:** the page's own public player stream (DVIDS' logged-out "Download"
  endpoint requires an account; the player HLS stream is served anonymously from the
  same DVIDS CDN). 720p variant playlist:
  https://d34w7g4gy10iej.cloudfront.net/video/2302/DOD_109438622/DOD_109438622-1280x720-3066k-hls_3.m3u8
  (segments 1–2 only, ~2.1 MB transferred for the shot used).
- **Processing (ffmpeg, no content edits within frames):**
  - Extracted one continuous 5.75 s shot (source timecode ≈ 0:08.8–0:14.55): close-up of
    a transitioning soldier annotating a workbook at a classroom desk, laptops beyond.
  - Scaled 1280×720 → 960×540, audio track removed.
  - Concatenated forward + reversed copies (palindrome) so the clip loops seamlessly —
    final duration 11.51 s.
  - Encoded H.264 (libx264, CRF 26, preset veryslow, yuv420p, `+faststart`) → **348 KB**.
  - `hero-poster.jpg` is the first frame of the loop, JPEG q3 (**50 KB**).
- **Content review:** no combat, no weapons, no ceremony/flag-display clichés, no
  readable screens, no third-party logos, no legible name tapes, no faces in frame.
  The standard U.S. flag shoulder patch on the soldier's uniform sleeve is visible
  (incidental uniform item, not a ceremonial flag display). No VA/DoD seals or unit
  insignia are legible at the shipped resolution.
