-- profiles_drop_retired_city_answer (Oct 12 2026) - NOT APPLIED YET.
--
-- HOLD: this changes production data. Run it only after Kaleb gives the
-- go-ahead, and only once the bundle without the city question is live.
--
-- Why: the intake used to ask an optional "What city or town?" that nothing
-- ever read. Kaleb removed it on Oct 12. The new client drops answers.city
-- when it loads saved state (lib/store.tsx dropRetired), and the next account
-- save writes the row back without it - but only for people who come back.
-- This clears it for everyone else, so the privacy page can stop carrying the
-- "earlier versions also asked for your city" line.
--
-- Order matters: a browser still running the old cached bundle could save a
-- city back after this runs. Apply after the new bundle has been live a few
-- days; it is safe to run again later (it only touches rows that still have
-- the key). updated_at is left alone on purpose - this is a cleanup, not
-- member activity.
--
-- After applying: in app/privacy/page.tsx, drop the sentence about earlier
-- versions asking for a city from the intake-answers bullet.

update public.profiles
set profile = jsonb_set(profile, '{answers}', (profile->'answers') - 'city')
where jsonb_typeof(profile->'answers') = 'object'
  and (profile->'answers') ? 'city';
