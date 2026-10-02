-- send-checkins v5 refuses any call without header x-checkins-secret. The secret
-- lives in Vault (never in this file, never in the cron job text): generated here,
-- read by the cron job at run time, and by the function through a service-role-only
-- getter. Applied to production 2026-10-02.

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'checkins_cron_secret') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'checkins_cron_secret',
      'Shared secret: vetpath-checkins cron job -> send-checkins (v5+).'
    );
  end if;
end $$;

create or replace function public.get_checkins_secret()
returns text
language sql
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'checkins_cron_secret' limit 1;
$$;

revoke all on function public.get_checkins_secret() from public, anon, authenticated;
grant execute on function public.get_checkins_secret() to service_role;

-- The cron job reads the secret from Vault on every run, so rotating the secret
-- (vault.update_secret) needs no job edit and no function redeploy.
do $$
declare
  j record;
  auth_header text;
begin
  select jobid, command into j from cron.job where jobname = 'vetpath-checkins';
  if j.jobid is null then
    raise notice 'vetpath-checkins job not found; skipping header update';
    return;
  end if;
  auth_header := substring(j.command from $re$'Authorization',\s*'([^']*)'$re$);
  perform cron.alter_job(
    j.jobid,
    command := format($cmd$
      select net.http_post(
        url := 'https://evoswsnsjoslcqllefgc.supabase.co/functions/v1/send-checkins',
        headers := jsonb_build_object(
          'Authorization', %L,
          'Content-Type', 'application/json',
          'x-checkins-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'checkins_cron_secret')
        ),
        body := '{}'::jsonb
      );
    $cmd$, auth_header)
  );
end $$;
