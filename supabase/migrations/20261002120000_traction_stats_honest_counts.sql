-- traction_stats_honest_counts (Oct 2 2026)
--
-- Founder board (/stats) counts, made honest:
--   returned       - members with two or more distinct days in public.visit_days.
--                    The old proxy was profiles.updated_at, which moved on every
--                    background token refresh (17 "returned" vs about 7 by the ledger).
--   returned_since - the first day in the ledger, so the board can say what the
--                    count covers. History before it cannot be rebuilt.
--   checked_action - at least one action marked done, not merely in progress.
--
-- Token gate, SECURITY DEFINER and search_path are unchanged; the function still
-- returns aggregates only, plus the earliest ledger date. Commit 8 replaces this
-- function again to add the partner fields (they depend on partner_codes).
--
-- Apply before the front-end push that reads returned_since. The board renders
-- fine without it (the label just drops the "counted since" suffix).

create or replace function public.traction_stats(p_token text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  expected text;
  out_json json;
begin
  select value into expected from public.app_secrets where key = 'stats_token';
  if expected is null or p_token is null or length(p_token) < 16
     or p_token <> expected then
    raise exception 'not found' using errcode = '42501';
  end if;

  select json_build_object(
    'generated_at', now(),
    'accounts',        (select count(*) from auth.users),
    'new_7d',          (select count(*) from auth.users where created_at >= now() - interval '7 days'),
    'new_30d',         (select count(*) from auth.users where created_at >= now() - interval '30 days'),
    'last_signup',     (select max(created_at)::date from auth.users),
    'gameplans',       (select count(*) from public.profiles
                         where profile->'gameplan' is not null
                           and profile->'gameplan' <> 'null'::jsonb),
    'pathfinder',      (select count(*) from public.profiles
                         where jsonb_typeof(profile->'assessment') = 'object'
                           and profile->'assessment' <> '{}'::jsonb),
    -- At least one action actually marked done, not merely in progress.
    'checked_action',  (select count(*) from public.profiles
                         where case when jsonb_typeof(profile->'statuses') = 'object'
                                    then exists (select 1 from jsonb_each_text(profile->'statuses') e
                                                  where e.value = 'done')
                                    else false end),
    -- Two or more distinct days in the visit ledger (the old updated_at proxy
    -- moved on every background token refresh).
    'returned',        (select count(*) from (select user_id from public.visit_days
                                               group by user_id having count(*) >= 2) r),
    'returned_since',  (select min(day) from public.visit_days),
    'opted_in',        (select count(*) from public.profiles where marketing_opt_in),
    'by_week',         (select coalesce(json_agg(w order by w.week_start), '[]'::json)
                         from (
                           select date_trunc('week', created_at)::date as week_start,
                                  count(*)                             as signups
                           from auth.users
                           group by 1
                         ) w),
    'emails_sent',     (select count(*) from public.email_log),
    'last_email_run',  (select max(sent_at)::date from public.email_log),
    'feedback_notes',  (select count(*) from public.feedback)
  ) into out_json;

  return out_json;
end;
$$;
-- create or replace keeps the existing grants (PUBLIC revoked; anon/authenticated execute).
