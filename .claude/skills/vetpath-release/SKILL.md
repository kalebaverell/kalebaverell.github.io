---
name: vetpath-release
description: Rebuild and refresh every VetPath shareable deliverable — the email zip, Desktop copies, static site zip, and the claude.ai artifact page — from the current demo and app. Use after the demo file or app changes and deliverables need to catch up.
---

# VetPath release refresh

Prereq: run vetpath-verify first (or confirm the demo boots and the app builds).

## 1. Shareable interactive file (email attachment)
- Copy demo/vetpath-demo.html → share/VetPath-Interactive-App.html
- Rebuild share/VetPath-Interactive-App.zip containing that file + README-FOR-FRANK.txt (PowerShell Compress-Archive)
- Copy the zip to the user's Desktop ([Environment]::GetFolderPath('Desktop')) — note: Desktop is OneDrive-redirected

## 2. Static site zip (for Netlify Drop → public link)
- Kill dev servers (ports 3000–3002 + stray `next dev` node processes), `rm -rf .next out`, `npm run build`
- If `out/` is EBUSY-locked: kill any `python -m http.server` still serving it, retry; OneDrive locks resolve after killing the holder
- Copy out/ to %TEMP%, zip as share/VetPath-Website.zip (bypasses OneDrive file locks)
- Restart `npm run dev` afterward

## 3. claude.ai artifact (interactive link in chat)
- Run: `python C:\Users\KALEBA~1\AppData\Local\Temp\vetpath-artifact\build.py` (subsets the icon font,
  inlines everything, shims localStorage, writes share/vetpath-artifact.html). If the temp dir is gone,
  the script needs: tabler CSS+woff2 downloads, fontTools+brotli pip packages — see script source.
- Copy to share/VetPath-Interactive-Preview.html
- Test render: wrap in doctype shell, headless-Edge screenshot, confirm hero renders and app boots
- Publish with the Artifact tool to the SAME URL (pass the existing artifact url) — favicon 🧭

## 4. Verify + commit
- Spot-check the new zip's HTML boots via headless Edge (file:// works)
- `git add -A && git commit` with a dated release message

Report: what was refreshed, file sizes, the artifact URL.
