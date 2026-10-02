-- profiles_first_touch_write_once (Oct 2 2026)
--
-- profiles.first_touch credits a partner code (partner_code_of). Members can
-- update their own row (own_update, no column limit), so without this an
-- account could re-point an existing attribution to any partner at any time.
-- The client only ever writes first_touch while it is null (ProfileSync), so
-- this changes nothing for real members.
--
-- LIMITATION: the first write is still self-reported. A brand-new account can
-- write any partner code once; partner_code_of ignores a capture stamped more
-- than a day after signup, which bounds but does not close that.
--
-- Server roles (service_role, postgres) are exempt so the founder can correct
-- a row by hand. Apply after 20261002130000_partner_codes_and_counts_only_report.sql.

create or replace function public.profiles_first_touch_write_once()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if old.first_touch is not null
     and new.first_touch is distinct from old.first_touch
     and current_user in ('anon', 'authenticated') then
    raise exception 'first_touch is write-once' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function public.profiles_first_touch_write_once() from public, anon, authenticated;

drop trigger if exists profiles_first_touch_write_once on public.profiles;
create trigger profiles_first_touch_write_once
  before update of first_touch on public.profiles
  for each row execute function public.profiles_first_touch_write_once();
