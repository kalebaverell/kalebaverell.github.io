# VetPath — live site & deployment

## ✅ The site is LIVE

**https://kalebaverell.github.io/**

Hand that URL to your first testers. It's a free HTTPS URL, no domain required.
Every inner page has a direct link too, e.g. `https://kalebaverell.github.io/trust/`,
`/pathfinder/`, `/timeline/`, `/benefits/`.

- **Repo:** <https://github.com/kalebaverell/kalebaverell.github.io> (public)
- **Hosting:** GitHub Pages, built by GitHub Actions from the static export (`out/`).
- **How it works:** the repo is named `kalebaverell.github.io`, so Pages serves it at
  the **root** — which is why the video, images, and styles all load correctly.

---

## Updating the site — just push

Any change you make locally goes live automatically:

```bash
git add -A
git commit -m "your change"
git push
```

That triggers the **Deploy VetPath to GitHub Pages** workflow (Actions tab), which
rebuilds and republishes in about a minute. Watch it at
<https://github.com/kalebaverell/kalebaverell.github.io/actions>.

To preview locally before pushing: `npm run dev` → <http://localhost:3000>.

---

## Adding a custom .com (optional, whenever you're ready)

GitHub doesn't sell domains — buy one from a registrar (cheapest at-cost is
**Cloudflare Registrar**, ~$10/yr; **Porkbun** and **Namecheap** are fine too). You
enter your own payment details there.

Once you own e.g. `vetpath.com`:

1. **Add a `CNAME` file** to the `public/` folder containing just your domain:
   ```
   vetpath.com
   ```
   Commit and push — it lands in the build and tells Pages your domain.
2. **Point DNS** at your registrar:
   - Apex `vetpath.com` → four `A` records: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `www` → `CNAME` to `kalebaverell.github.io`
3. In the repo: **Settings → Pages → Custom domain** → enter `vetpath.com`, then check
   **Enforce HTTPS** once the certificate provisions (can take up to an hour).

The `kalebaverell.github.io` URL keeps working the whole time; the `.com` just becomes
the pretty front door.

---

## Before real users see it — reminders
- The disclaimer ("planning tool, not the VA · sample data") and the **988** crisis
  line are on every page. Keep them.
- Benefit data is labeled **sample/demo** until independently verified — that boundary
  is intentional; don't drop it before a legal review.

## Notes
- The build runs on GitHub's servers; you don't need `out/` committed (it's gitignored).
- A harmless "Node.js 20 deprecated" warning may show in Actions logs — the build still
  succeeds. If you ever want to silence it, bump `node-version: 20` → `22` in
  `.github/workflows/deploy.yml`.
