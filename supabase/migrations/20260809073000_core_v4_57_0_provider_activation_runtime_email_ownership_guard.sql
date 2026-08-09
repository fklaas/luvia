-- Luvia v13.57.0 / Core 4.57.0
-- Provider Activation Gates V1 + Venue Contact Ownership Guard
begin;

alter table public.booking_provider_connections
  add column if not exists activation_state text,
  add column if not exists activation_reason text,
  add column if not exists probe_state text,
  add column if not exists last_probe jsonb not null default '{}'::jsonb,
  add column if not exists last_probe_at timestamptz;

update public.booking_provider_connections set
 activation_state=coalesce(activation_state,case when connection_state='connected' then 'active' when credential_state='configured' then 'ready_to_activate' when credential_state in ('missing','partial') then 'waiting_credentials' else 'blocked' end),
 activation_reason=coalesce(activation_reason,case when connection_state='connected' then 'CAPABILITY_ALREADY_CONNECTED' when credential_state='configured' then 'CREDENTIALS_CONFIGURED_PROBE_REQUIRED' when credential_state='partial' then 'PARTIAL_CREDENTIALS' when credential_state='missing' then 'CREDENTIALS_MISSING' else 'PARTNER_CREDENTIAL_SCHEMA_REQUIRED' end),
 probe_state=coalesce(probe_state,case when connection_state='connected' then 'healthy' when credential_state='configured' then 'ready' else 'not_run' end);

alter table public.booking_provider_connections drop constraint if exists booking_provider_connections_activation_state_check;
alter table public.booking_provider_connections add constraint booking_provider_connections_activation_state_check check (activation_state is null or activation_state = any(array['blocked','waiting_credentials','waiting_contract','ready_to_activate','active','degraded']::text[]));
alter table public.booking_provider_connections drop constraint if exists booking_provider_connections_probe_state_check;
alter table public.booking_provider_connections add constraint booking_provider_connections_probe_state_check check (probe_state is null or probe_state = any(array['not_run','not_applicable','blocked','ready','healthy','degraded','failed']::text[]));

create or replace view public.booking_provider_connection_readiness_v3 as
select c.provider_id,c.display_name,c.luvia_access_state,c.booking_mode,
 pc.connection_state,pc.credential_state,pc.contract_state,pc.availability_transport_state,pc.status_return_state,
 pc.activation_state,pc.activation_reason,pc.probe_state,pc.last_probe,pc.last_probe_at,
 pc.required_secret_keys,pc.last_health,pc.last_checked_at,pc.connected_at,
 coalesce((select jsonb_agg(jsonb_build_object('transport',sc.transport,'contractVersion',sc.contract_version,'verificationState',sc.verification_state,'autoApply',sc.auto_apply,'active',sc.active) order by sc.transport) from public.booking_provider_status_contracts sc where sc.provider_id=c.provider_id and sc.active=true),'[]'::jsonb) as return_contracts
from public.booking_provider_capabilities c
left join public.booking_provider_connections pc on pc.provider_id=c.provider_id
where c.active=true;

grant select on public.booking_provider_connection_readiness_v3 to authenticated,service_role;

create table if not exists public.booking_provider_connection_events (
 id uuid primary key default gen_random_uuid(),
 provider_id text not null references public.booking_provider_capabilities(provider_id) on delete cascade,
 event_type text not null check(event_type = any(array['health_checked','activation_ready','activation_blocked','connected','degraded','disabled']::text[])),
 previous_state text,
 next_state text,
 reason text,
 evidence jsonb not null default '{}'::jsonb,
 occurred_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
alter table public.booking_provider_connection_events enable row level security;
drop policy if exists booking_provider_connection_events_read on public.booking_provider_connection_events;
create policy booking_provider_connection_events_read on public.booking_provider_connection_events for select to authenticated using(true);
revoke all on public.booking_provider_connection_events from anon;
grant select on public.booking_provider_connection_events to authenticated;
grant all on public.booking_provider_connection_events to service_role;


create or replace function public.luvia_booking_is_provider_email_domain(p_email text)
returns boolean language sql immutable as $$
 select lower(split_part(coalesce(p_email,''),'@',2)) ~ '(^|\.)(zenchef\.com|thefork\.(com|fr|de)|lafourchette\.com|opentable\.com|sevenrooms\.com|resy\.com|exploretock\.com|tockhq\.com|quandoo\.com|formitable\.com|resdiary\.com|covermanager\.com|simpleerb\.com|tablecheck\.com)$';
$$;

create or replace function public.luvia_booking_candidate_auto_usable(
 p_kind text,p_contact_value text,p_source_url text,p_is_public boolean,p_is_official boolean,p_verification_status text
) returns boolean language plpgsql immutable as $$
declare v_kind text:=lower(coalesce(p_kind,''));v_value text:=trim(coalesce(p_contact_value,''));v_source text:=trim(coalesce(p_source_url,''));
begin
 if coalesce(p_verification_status,'')<>'verified' or not coalesce(p_is_public,false) or v_source !~* '^https?://' then return false; end if;
 if v_kind in ('public_reservation_email','public_contact_email') then
  if public.luvia_booking_is_provider_email_domain(v_value) then return false; end if;
  return coalesce(p_is_official,false) and v_value ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$';
 elsif v_kind='official_api' then
  return coalesce(p_is_official,false) and v_value ~* '^https?://';
 elsif v_kind in ('booking_provider','reservation_link') then
  return (coalesce(p_is_official,false) or v_kind='booking_provider') and v_value ~* '^https?://';
 end if;
 return false;
end $$;

update public.booking_contact_candidates
set auto_usable=false,
    verification_status='rejected',
    evidence=coalesce(evidence,'{}'::jsonb)||jsonb_build_object('rejectedBy','core-4.57.0','rejectionReason','BOOKING_PROVIDER_EMAIL_DOMAIN')
where kind in ('public_reservation_email','public_contact_email')
  and public.luvia_booking_is_provider_email_domain(contact_value);

update public.bookings
set contact=contact-'email',
    metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('contactGuard',jsonb_build_object('version','4.57.0','reason','BOOKING_PROVIDER_EMAIL_REMOVED')),
    updated_at=now()
where coalesce(contact->>'email','')<>''
  and public.luvia_booking_is_provider_email_domain(contact->>'email');

commit;
