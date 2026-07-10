# Video credits & license verification

All footage in this folder is a U.S. federal government work and therefore in the
public domain (17 U.S.C. § 105). The video's DVIDS source page was fetched and verified
on **2026-07-10** to carry DVIDS' explicit **"PUBLIC DOMAIN"** license label before use.
This follows the same sourcing standard as `public/img/CREDITS.md`.

---

## career-summit-loop.mp4 (+ career-summit-poster.jpg)

- **Intended use:** Homepage hero — muted, looping ambient backdrop under the navy scrim.
- **Title:** "Hiring Our Heroes B-Roll Package" (DVIDS video 987785, DoD asset ID DOD_111401891)
- **Videographer:** Sgt. Scyrrus Corregidor, AFN Bavaria (U.S. government work)
- **Date taken:** 10.14.2025 — Hiring Our Heroes career summit, U.S. Army Garrison Bavaria
- **Source page:** https://www.dvidshub.net/video/987785/hiring-our-heroes-b-roll-package
- **License line on source page (verified 2026-07-10):** "PUBLIC DOMAIN"
- **File fetched:** DVIDS CDN public HLS stream (960×540 variant),
  https://d34w7g4gy10iej.cloudfront.net/video/2511/DOD_111401891/DOD_111401891-960x540-1918k-hls_4.m3u8
  (segments 7–18 sampled; final shot from ~t=141.9–145.2 of the source).
- **Processing (ffmpeg, no content edits within frames):**
  - Extracted one continuous 3.3 s shot: transitioning service members and civilian
    recruiters mingling and shaking hands after a career-summit session, bright window light.
  - Native 960×540, audio removed; palindrome concat (forward + reverse) → 6.6 s seamless loop.
  - H.264 (libx264, CRF 26, preset veryslow, yuv420p, `+faststart`) → **436 KB**.
  - `career-summit-poster.jpg` is the first frame, JPEG q3 (**45 KB**).
- **Content review:** no combat, no weapons, no ceremonial flag displays (a U.S. flag
  shoulder patch on one uniform is incidental); event signage/TV screens with third-party
  sponsor logos were deliberately cut around — none appear in the shipped clip; no readable
  name tapes at 540p; candid mid-distance crowd at a public, DoD-covered press event.

---

## hero-loop.mp4 (+ hero-poster.jpg)

- **Intended use:** Homepage "On the ground" mission band — muted, looping video
  (distinct from the hero clip above, per design direction 2026-07-10).
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
