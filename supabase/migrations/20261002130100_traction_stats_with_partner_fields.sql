-- traction_stats_with_partner_fields (Oct 2 2026)
--
-- Founder board (/stats): same body as 20261002120000_traction_stats_honest_counts.sql,
-- with three partner-programme counts appended after feedback_notes. They track
-- the Jan 15 2027 adjust-or-kill test:
--   partner_codes - live (not revoked) partner codes.
--   coded_signups - accounts credited to a partner code (public.partner_code_of).
--   active_codes  - codes that brought in at least one account in the trailing
--                   30 days.
--
-- DEPENDS ON 20261002130000_partner_codes_and_counts_only_report.sql (the
-- partner_codes table and the partner_code_of helper); apply it first. This
-- function is SECURITY DEFINER, so it can call the helper even though EXECUTE on
-- it is revoked from clients. Token gate, search_path and grants are unchanged
-- (create or replace keeps the existing grants). Apply before the front-end push
-- that reads the new fields.

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
    'feedback_notes',  (select count(*) from public.feedback),
    -- Partner programme (the Jan 15 2027 adjust-or-kill test reads these).
    'partner_codes',   (select count(*) from public.partner_codes where revoked_at is null),
    'coded_signups',   (select count(*)
                          from public.profiles p
                          join auth.users u on u.id = p.id
                          join public.partner_codes pc
                            on pc.code = public.partner_code_of(p.first_touch, u.created_at)),
    -- "Active code" = at least one coded signup in the trailing 30 days.
    'active_codes',    (select count(distinct pc.code)
                          from public.profiles p
                          join auth.users u on u.id = p.id
                          join public.partner_codes pc
                            on pc.code = public.partner_code_of(p.first_touch, u.created_at)
                         where u.created_at >= now() - interval '30 days')
  ) into out_json;

  return out_json;
end;
$$;
-- create or replace keeps the existing grants (PUBLIC revoked; anon/authenticated execute).
