# Email check-ins - activation runbook

*Return Loop Phase 3. The whole engine is deployed and dormant: cron fires weekly, the
sender computes who would get what, and sends nothing until the Resend key exists.
Two steps activate it - both are Kaleb's, by standing rule (credentials never pass
through Claude).*

## What's already live (built + deployed 2026-08-25)

- **Database:** `profiles.prefs` (tminus / verification flags, seeded from each user's
  signup marketing opt-in - 14 of 20 users opted in), `profiles.unsub_token` (per-user
  unsubscribe capability), `email_log` (unique per user + kind + period - the sender's
  idempotency lock; RLS: owner-read, service-role-write only).
- **Edge function `send-checkins`** (JWT-required): weekly logic - per user, at most ONE
  email per run, first match wins:
  1. *T-minus check-in* - when a synced EAS date exists: phase-transition note with the
     two items that matter that stretch, each linked to its official source. Buckets:
     long runway (>24mo), approach (12-24), then the timeline's T-12 phases through
     six months post-separation.
  2. *Progress check-in* - no EAS date: plan-age windows (30/60/90 days, then quarterly),
     personalized with the user's real checked-action count. Encourage, never shame.
  3. *Verification note* - quarterly, confirming the data re-check rhythm (real figures;
     update the `VERIFIED` constant in the function when the quarterly data refresh runs).
- **Edge function `unsubscribe`** (public, token-gated): one click from any email footer
  flips both prefs off, touches nothing else, and says so. Re-enable lives on /profile.
- **Cron:** `vetpath-checkins`, Mondays 15:00 UTC (pg_cron → the function, anon-key auth;
  safe because the email_log lock makes every invocation idempotent).
- **Profile page:** "Email check-ins" card - both toggles, owner-row RLS.

Verified in dry-run: 20 users scanned, 14 candidates computed, 0 sent, 0 errors;
unauthorized calls rejected (401); bogus unsubscribe tokens rejected.

## Kaleb's two activation steps

1. **Verify the domain in Resend** (resend.com → Domains → Add vetpathusa.com): add the
   SPF and DKIM records Resend shows you at your DNS host, wait for "Verified".
2. **Set the function secrets** (supabase.com dashboard → project → Edge Functions →
   Secrets): add `RESEND_API_KEY` (create the key in Resend → API Keys, sending access
   only). Optional: `RESEND_FROM` to override the default
   `VetPath <plans@vetpathusa.com>` sender.

That's it - the next Monday run goes live. No deploys needed.

## Testing after activation

Fire one run manually instead of waiting for Monday (safe - the log prevents any
double-sends when Monday comes):

```bash
curl -X POST "https://evoswsnsjoslcqllefgc.supabase.co/functions/v1/send-checkins" -H "Authorization: Bearer <anon key from the dashboard>"
```

Expect `{"configured":true, ...}` with a `sent` count. Check your own inbox (you're
opted in), click the unsubscribe link to test the flow, then flip yourself back on
at vetpathusa.com/profile.

## Operating notes

- **Volume:** at 20 users this is at most ~20 emails/week - far inside Resend's free
  tier (100/day). Revisit only past ~500 users.
- **Cadence changes:** edit the `vetpath-checkins` schedule via SQL
  (`select cron.alter_job(...)`) or ask Claude.
- **Quarterly data refresh:** when the data re-verification runs, update `VERIFIED`
  in `send-checkins` (label + counts) in the same session - it's the source for the
  verification note's claims.
- **Compliance posture:** every email carries the opted-in reason, a working one-click
  unsubscribe, and a human reply path. A postal address in the footer is the remaining
  formal CAN-SPAM nicety - fold it in once the LLC exists (it's on the attorney list
  adjacent items; don't publish a home address before then).
- **Standing tone rule:** encourage, never shame. No guilt-trip subject lines, ever.
