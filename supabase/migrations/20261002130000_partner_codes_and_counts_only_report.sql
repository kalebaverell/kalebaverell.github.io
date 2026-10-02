-- partner_codes_and_counts_only_report (Oct 2 2026)
--
-- Partner offices (county/state VSOs, accredited reps, TAP counselors) hand out
-- VetPath links tagged utm_source=partner&utm_campaign=<code>. Codes are
-- opaque; the office's name lives only here, never in the public repo. Reports
-- are COUNTS ONLY: a true 0 shows as 0, and every count from 1 to 4 is
-- returned as "<5". The report is live (no weekly cohort cut).
--
-- SECURITY: RLS on with zero policies, and explicit revokes. Supabase default
-- privileges grant anon/authenticated on new public tables and EXECUTE on new
-- public functions, so every revoke below is load-bearing. Only SHA-256 hashes
-- of report tokens are stored. Malformed, wrong and revoked tokens all return
-- the same 42501. Run the security advisor (get_advisors, security) after
-- applying.
--
-- ORDER: apply this BEFORE 20261002130100_traction_stats_with_partner_fields.sql
-- (it uses partner_codes and partner_code_of), and both BEFORE the front-end
-- push that ships /partner and the founder-board partner fields.

-- ------------------------------------------------------------ the code table
create table public.partner_codes (
  code        text primary key check (code ~ '^[a-hjkmnp-z2-9]{6}$'),
  label       text not null check (char_length(label) between 2 and 120),
  token_hash  bytea not null unique check (octet_length(token_hash) = 32),
  created_at  timestamptz not null default now(),
  revoked_at  timestamptz
);
comment on table public.partner_codes is
  'Opaque partner codes. label is visible only here and on that partner''s own report. token_hash = sha256 of the report token; the token itself is shown once by mint_partner_code and never stored. RLS on, zero policies, no client grants: read only through partner_stats() and traction_stats().';
alter table public.partner_codes enable row level security;
revoke all on public.partner_codes from anon, authenticated;

-- ------------------------------------------------- attribution (one place)
-- Which partner code, if any, an account's first_touch credits. Tolerates any
-- JSON a user could write to their own row (own_update RLS allows it): a
-- malformed capture returns null instead of breaking a report. Ignores a code
-- first seen more than a day after signup, because ProfileSync back-fills a
-- device capture onto older accounts on their next login.
create or replace function public.partner_code_of(ft jsonb, signed_up timestamptz)
returns text
language plpgsql
stable
set search_path = pg_catalog
as $$
declare
  v_code text;
  v_at   timestamptz;
begin
  if ft is null or jsonb_typeof(ft) <> 'object' then return null; end if;
  v_code := lower(coalesce(nullif(ft->>'partner', ''),
                  case when lower(ft->>'source') = 'partner' then ft->>'campaign' end));
  if v_code is null or v_code !~ '^[a-hjkmnp-z2-9]{6}$' then return null; end if;
  begin
    v_at := coalesce(nullif(ft->>'partnerAt', ''), ft->>'at')::timestamptz;
  exception when others then
    return null;
  end;
  if v_at is null or v_at >= signed_up + interval '1 day' then return null; end if;
  return v_code;
end;
$$;
revoke all on function public.partner_code_of(jsonb, timestamptz) from public, anon, authenticated;

-- --------------------------------------------------- small-cell suppression
-- A true 0 stays 0 (it tells a new partner nothing has happened yet and
-- singles no one out); 1 to 4 becomes "<5".
create or replace function public.partner_cell(n bigint)
returns json
language sql
immutable
set search_path = pg_catalog
as $$
  select case when n between 1 and 4 then to_json('<5'::text) else to_json(n) end
$$;
revoke all on function public.partner_cell(bigint) from public, anon, authenticated;

-- ------------------------------------------------------------ the endpoint
-- Live report: every account credited to the code counts as soon as it exists.
create or replace function public.partner_stats(p_token text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_code   text;
  v_label  text;
  v_since  timestamptz;
  c        record;
begin
  -- Anything that is not a 48-character hex token gets the same answer as a
  -- wrong one, so a prober learns nothing.
  if p_token is null or p_token !~ '^[0-9a-f]{48}$' then
    raise exception 'not found' using errcode = '42501';
  end if;

  select pc.code, pc.label, pc.created_at
    into v_code, v_label, v_since
    from public.partner_codes pc
   where pc.token_hash = sha256(convert_to(p_token, 'UTF8'))
     and pc.revoked_at is null;

  if v_code is null then
    raise exception 'not found' using errcode = '42501';
  end if;

  select
    count(*)                                                       as signups,
    count(*) filter (where x.profile->'gameplan' is not null
                       and x.profile->'gameplan' <> 'null'::jsonb) as plans_built,
    count(*) filter (where x.done_steps > 0)                       as checked_a_step,
    coalesce(sum(x.done_steps), 0)                                 as steps_checked,
    count(*) filter (where x.eas is not null)                      as separation_date_given,
    -- Inside the BDD window (180 to 90 days before separation) at some point
    -- since signing up: the window has opened by today and had not closed
    -- before they joined.
    count(*) filter (where x.eas is not null
                       and x.eas - 180 <= current_date
                       and x.eas - 90  >= x.signed_up::date)       as bdd_window,
    count(*) filter (where x.opened_help)                          as opened_free_help,
    count(*) filter (where x.opted_in)                             as email_opt_in
  into c
  from (
    select
      p.profile,
      u.created_at                        as signed_up,
      coalesce(p.marketing_opt_in, false) as opted_in,
      case when jsonb_typeof(p.profile->'statuses') = 'object'
           then (select count(*) from jsonb_each_text(p.profile->'statuses') e where e.value = 'done')
           else 0 end                     as done_steps,
      -- easDate is "YYYY-MM"; a longer value (one live row is YYYY-MM-DD) still
      -- counts by its prefix. Mid-month anchor matches lib/timeline.ts.
      case when (p.profile->'answers'->>'easDate') ~ '^(19|20)[0-9]{2}-(0[1-9]|1[0-2])'
           then make_date(substr(p.profile->'answers'->>'easDate', 1, 4)::int,
                          substr(p.profile->'answers'->>'easDate', 6, 2)::int, 15)
           end                            as eas,
      case when jsonb_typeof(p.profile->'handoffs') = 'object'
           then p.profile->'handoffs' <> '{}'::jsonb
           else false end                 as opened_help
    from public.profiles p
    join auth.users u on u.id = p.id
    where public.partner_code_of(p.first_touch, u.created_at) = v_code
  ) x;

  return json_build_object(
    'generated_at',          now(),
    'code',                  v_code,
    'label',                 v_label,
    'since',                 v_since::date,
    'signups',               public.partner_cell(c.signups),
    'plans_built',           public.partner_cell(c.plans_built),
    'checked_a_step',        public.partner_cell(c.checked_a_step),
    -- A total is only shown once 5 or more people stand behind it.
    'steps_checked',         case when c.checked_a_step >= 5 then to_json(c.steps_checked) else 'null'::json end,
    'separation_date_given', public.partner_cell(c.separation_date_given),
    'bdd_window',            public.partner_cell(c.bdd_window),
    'opened_free_help',      public.partner_cell(c.opened_free_help),
    'email_opt_in',          public.partner_cell(c.email_opt_in)
  );
end;
$$;
revoke all on function public.partner_stats(text) from public;
grant execute on function public.partner_stats(text) to anon, authenticated;

-- ------------------------------------------- minting and rotation (owner only)
-- Run in the Supabase SQL editor:  select * from public.mint_partner_code('<office name>');
-- The report token is shown ONCE in the result; only its hash is stored.
create or replace function public.mint_partner_code(p_label text)
returns table (code text, report_token text, landing_url text, report_url text)
language plpgsql
security invoker
set search_path = public, extensions, pg_temp
as $$
#variable_conflict use_column
declare
  v_alpha constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
  v_code  text;
  v_token text := encode(extensions.gen_random_bytes(24), 'hex');
  v_bytes bytea;
  v_tries int := 0;
begin
  if p_label is null or char_length(btrim(p_label)) not between 2 and 120 then
    raise exception 'label must be 2 to 120 characters';
  end if;
  loop
    v_bytes := extensions.gen_random_bytes(6);
    select string_agg(substr(v_alpha, 1 + (get_byte(v_bytes, g.i) % 31), 1), '' order by g.i)
      into v_code
      from generate_series(0, 5) as g(i);
    begin
      insert into public.partner_codes (code, label, token_hash)
      values (v_code, btrim(p_label), sha256(convert_to(v_token, 'UTF8')));
      exit;
    exception when unique_violation then
      v_tries := v_tries + 1;
      if v_tries > 5 then raise; end if;
    end;
  end loop;
  code         := v_code;
  report_token := v_token;
  landing_url  := 'https://vetpathusa.com/?utm_source=partner&utm_campaign=' || v_code;
  report_url   := 'https://vetpathusa.com/partner/#k=' || v_token;
  return next;
end;
$$;
revoke all on function public.mint_partner_code(text) from public, anon, authenticated;

-- New report link for one partner; the old link stops working at once.
-- select public.rotate_partner_token('k7m3qx');
create or replace function public.rotate_partner_token(p_code text)
returns text
language plpgsql
security invoker
set search_path = public, extensions, pg_temp
as $$
declare
  v_token text := encode(extensions.gen_random_bytes(24), 'hex');
begin
  update public.partner_codes
     set token_hash = sha256(convert_to(v_token, 'UTF8'))
   where code = lower(p_code);
  if not found then raise exception 'no partner code %', p_code; end if;
  return v_token;
end;
$$;
revoke all on function public.rotate_partner_token(text) from public, anon, authenticated;

-- Retire a code (its report link stops working; its history still counts for founders):
-- update public.partner_codes set revoked_at = now() where code = 'k7m3qx';

-- Read-only checks after applying:
--   select has_table_privilege('anon', 'public.partner_codes', 'select');                           -- false
--   select has_function_privilege('anon', 'public.partner_code_of(jsonb, timestamptz)', 'execute'); -- false
--   select has_function_privilege('anon', 'public.mint_partner_code(text)', 'execute');             -- false
--   select has_function_privilege('anon', 'public.partner_stats(text)', 'execute');                 -- true
