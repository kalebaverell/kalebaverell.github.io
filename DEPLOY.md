# Getting VetPath online

The site is a **fully static** Next.js export (`npm run build` → `out/`). No server,
no database, no secrets. That makes it cheap and simple to host, and safe to hand to
first testers. This file is the runbook.

There are **three things only you can do** (I can't create accounts, log in as you, or
enter payment details): create the GitHub account/repo, connect a host, and — if you
want a custom `.com` — buy the domain. Everything else (build config, deploy workflow)
is already done and committed.

You do **not** need a domain to start testing. You'll have a free HTTPS URL first;
the `.com` is an optional layer you add later without rebuilding.

---

## Step 1 — Put the code on GitHub  (~3 min, one time)

1. Create a free account at <https://github.com/signup> if you don't have one.
2. Create a new **empty** repository at <https://github.com/new>:
   - Name it **`vetpath`** (or, for the cleanest URL, name it exactly
     `YOURUSERNAME.github.io` — see the note in Step 2).
   - Leave "Add a README / .gitignore / license" **unchecked** — the repo already has them.
   - Public or Private both work with Pages on the free plan.
3. Back in this project folder, connect and push (replace `YOURUSERNAME`):
   ```bash
   git remote add origin https://github.com/YOURUSERNAME/vetpath.git
   git push -u origin master
   ```
   On the first push, a browser window pops up to sign in to GitHub — that's the
   Windows Git Credential Manager; approve it and the push completes.

That's the only step that touches your credentials. After this, every future
`git push` redeploys the site automatically.

---

## Step 2 — Turn on hosting

You have two good options. **Option A (GitHub Pages)** is what you asked for —
fully GitHub-native. **Option B (Netlify)** is objectively smoother for this
particular site and still deploys from your GitHub repo. Pick one.

### Option A — GitHub Pages (native)
1. In the repo on github.com: **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. That's it. The workflow already committed at `.github/workflows/deploy.yml`
   builds and publishes on every push. Watch it run under the **Actions** tab;
   when it's green, your site is live.
4. **URL / root-path note:** Pages serves a repo named `vetpath` at
   `https://YOURUSERNAME.github.io/vetpath/` — a sub-path, which breaks some of
   the site's absolute links (video, images, the design previews). To serve at the
   **root** (where everything works), either:
   - name the repo **`YOURUSERNAME.github.io`** (free "user site", served at
     `https://YOURUSERNAME.github.io/`), **or**
   - attach a custom domain (Step 3) — a custom domain always serves at the root.

### Option B — Netlify (recommended for this site)
Serves at the root automatically, so nothing breaks, and it also deploys from your
GitHub repo on every push.
1. Go to <https://app.netlify.com/signup> and choose **"Sign up with GitHub"**
   (one click — reuses the account from Step 1, no new password).
2. **Add new site → Import an existing project → GitHub →** pick `vetpath`.
3. Netlify auto-detects Next.js. Confirm:
   - **Build command:** `npm run build`
   - **Publish directory:** `out`
4. **Deploy.** In ~2 minutes you get a live HTTPS URL like
   `https://vetpath-xxxx.netlify.app` — **share this with your first testers.**

---

## Step 3 — (Optional, later) Add a .com domain

GitHub does **not** sell domains. Buy one from a registrar — cheapest at-cost is
**Cloudflare Registrar** (~$10/yr), or **Porkbun / Namecheap**. You enter your own
payment details there; I can't do this part.

Once you own e.g. `vetpath.com`:

**If you chose Netlify (Option B):**
- Netlify → your site → **Domain settings → Add a domain** → enter `vetpath.com`,
  follow the DNS instructions it gives you. HTTPS is issued automatically.

**If you chose GitHub Pages (Option A):**
1. Add a file named `CNAME` to the `public/` folder containing just your domain:
   ```
   vetpath.com
   ```
   Commit and push — it lands in the build and tells Pages your domain.
2. At your registrar, point DNS at GitHub Pages:
   - Apex `vetpath.com` → four `A` records: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `www` → `CNAME` to `YOURUSERNAME.github.io`
3. Repo **Settings → Pages → Custom domain** → enter `vetpath.com`, check
   **Enforce HTTPS** once the certificate provisions (can take up to an hour).

---

## Redeploying after changes
Just `git push`. Both Pages and Netlify rebuild automatically. To preview locally
first: `npm run dev` → <http://localhost:3000>.

## Before real users see it — quick reminders
- The disclaimer ("planning tool, not the VA · sample data") and the 988 crisis
  line are already on every page. Keep them.
- Benefit data is labeled **sample/demo** until independently verified — that
  boundary is intentional; don't drop it before a legal review.
