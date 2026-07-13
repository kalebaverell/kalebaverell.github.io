# Accounts & data (Supabase) — how it works

The live site at **https://kalebaverell.github.io/** now has real user accounts. Testers can
create an account, stay logged in across sessions and devices, and their plan is saved to a
private database row. Newsletter consent is captured at signup.

## The setup at a glance
- **Backend:** Supabase project **VetPath** (`evoswsnsjoslcqllefgc`, region us-west-2, free tier).
- **Auth:** email + password, handled by Supabase Auth (passwords are hashed server-side — we
  never see or store them). Email confirmation is **off** so testers get in instantly during the
  pilot. Sessions persist in the browser, so people stay logged in.
- **Database:** one table, `public.profiles`, with **Row-Level Security** — each person can only
  read/write their own row. Columns: `id`, `email`, `full_name`, `profile` (their whole plan as
  JSON), `marketing_opt_in`, `marketing_opt_in_at`, timestamps.
- **Hosting is unchanged:** still the static GitHub Pages site. It just talks to Supabase from the
  browser using the public **publishable/anon key** (safe to expose; protected by RLS). The
  **secret key is never used in the app** and never in the repo.

## Config / where the keys live
- Two public values are set as **GitHub → repo Settings → Secrets and variables → Actions →
  Variables**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The deploy workflow
  passes them into the build.
- Local dev uses `.env.local` (gitignored) with the same two values. Run `npm run dev`.
- The code is **feature-flagged**: if those vars are ever missing, the site still builds and runs
  as the local-only demo (no accounts) — it can't break from a missing key.

## Exporting your newsletter list
1. Supabase dashboard → **Table Editor → profiles**.
2. Filter `marketing_opt_in = true`.
3. Export CSV, then import into a real email sender (Mailchimp / Buttondown / ConvertKit) which
   handles compliant sending + one-click unsubscribe. Don't blast email straight from Supabase.

## Deleting data
- Signed-in users can delete their saved plan/profile row from the app (removes their `profiles`
  row via RLS). To also remove the login record entirely, delete the user under **Authentication →
  Users** in the dashboard. A one-click full self-serve delete is a pre-launch to-do.

## Before real testers (recommended)
- Clear the test accounts I created while verifying (emails starting `tester…@vetpathdemo.com`
  and `livetest…@vetpathdemo.com`) from **Authentication → Users** and the `profiles` table.
- Have counsel review `/privacy` and the consent language before any wider launch.
- When you add a custom `.com`, add it to Supabase **Authentication → URL Configuration → Site URL
  / Redirect URLs** alongside the current `https://kalebaverell.github.io`.

## What's intentionally deferred (told to you, not hidden)
- **Google / magic-link sign-in:** email+password was chosen for reliability (Supabase's free
  email is rate-limited/spammy, and Google needs a separate Google Cloud OAuth setup). Both can be
  layered on later without changing the data model.
- **Sending** newsletters: we capture consent + the list now; wiring an email provider is a
  separate step.
