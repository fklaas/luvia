-- Luvia v13.66.0 / Core 4.66.0
-- Email Booking V2 · Verified Venue Request Runtime
begin;

create table if not exists public.booking_email_requests(
 id uuid primary key default gen_random_uuid(),
 booking_id uuid not null references public.bookings(id) on delete cascade,
 trip_id uuid not null references public.trips(id) on delete cascade,
 requested_by uuid,
 contact_candidate_id uuid references public.booking_contact_candidates(id) on delete set null,
 intended_recipient text,
 actual_recipient text,
 transport_provider text not null default 'resend',
 mode text not null default 'test' check(mode in ('test','production')),
 idempotency_key text not null,
 request_fingerprint text not null,
 state text not null default 'received' check(state in ('received','blocked','sending','sent','failed','delivery_failed')),
 expected_state boolean not null default false,
 error_code text,
 provider_message_id text,
 message_id uuid references public.booking_messages(id) on delete set null,
 reply_alias text,
 attempt_count integer not null default 1,
 evidence jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 finished_at timestamptz,
 unique(booking_id,idempotency_key)
);
create index if not exists booking_email_requests_booking_created_idx on public.booking_email_requests(booking_id,created_at desc);
create index if not exists booking_email_requests_state_idx on public.booking_email_requests(state,created_at desc);
alter table public.booking_email_requests enable row level security;
grant select on public.booking_email_requests to authenticated;
grant all on public.booking_email_requests to service_role;
drop policy if exists booking_email_requests_trip_member_select on public.booking_email_requests;
create policy booking_email_requests_trip_member_select on public.booking_email_requests for select to authenticated
using(public.luvia_booking_is_trip_member(trip_id));

create or replace function public.luvia_booking_email_verified_candidate(p_booking_id uuid,p_email text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare c public.booking_contact_candidates; v_email text:=lower(trim(coalesce(p_email,'')));v_trip uuid;
begin
 select trip_id into v_trip from public.bookings where id=p_booking_id;
 if v_trip is null then return jsonb_build_object('ok',false,'reason','BOOKING_NOT_FOUND'); end if;
 if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' and not public.luvia_booking_is_trip_member(v_trip) then raise exception 'TRIP_ACCESS_DENIED'; end if;
 if v_email='' or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
  return jsonb_build_object('ok',false,'reason','EMAIL_INVALID');
 end if;
 if public.luvia_booking_is_provider_email_domain(v_email) then
  return jsonb_build_object('ok',false,'reason','BOOKING_PROVIDER_EMAIL_DOMAIN');
 end if;
 select * into c from public.booking_contact_candidates
 where booking_id=p_booking_id
   and kind in ('public_reservation_email','public_contact_email')
   and lower(trim(contact_value))=v_email
   and verification_status='verified'
   and is_public=true and is_official=true and auto_usable=true
 order by confidence desc,last_verified_at desc nulls last,discovered_at desc limit 1;
 if not found then return jsonb_build_object('ok',false,'reason','VENUE_EMAIL_NOT_VERIFIED'); end if;
 return jsonb_build_object('ok',true,'candidateId',c.id,'email',c.contact_value,'kind',c.kind,'sourceUrl',c.source_url,'confidence',c.confidence,'lastVerifiedAt',c.last_verified_at);
end $$;
revoke all on function public.luvia_booking_email_verified_candidate(uuid,text) from public,anon;
grant execute on function public.luvia_booking_email_verified_candidate(uuid,text) to authenticated,service_role;

create or replace view public.booking_email_readiness_v2 as
select b.id as booking_id,b.trip_id,b.status,b.booking_type,b.title,b.contact->>'email' as contact_email,
       case
        when coalesce(b.contact->>'email','')='' then 'contact_required'
        when public.luvia_booking_is_provider_email_domain(b.contact->>'email') then 'blocked'
        when exists(select 1 from public.booking_contact_candidates c where c.booking_id=b.id and c.kind in ('public_reservation_email','public_contact_email') and lower(trim(c.contact_value))=lower(trim(b.contact->>'email')) and c.verification_status='verified' and c.is_public=true and c.is_official=true and c.auto_usable=true) then 'ready'
        else 'verification_required' end as email_runtime_state,
       case
        when coalesce(b.contact->>'email','')='' then 'BOOKING_CONTACT_EMAIL_MISSING'
        when public.luvia_booking_is_provider_email_domain(b.contact->>'email') then 'BOOKING_PROVIDER_EMAIL_DOMAIN'
        when exists(select 1 from public.booking_contact_candidates c where c.booking_id=b.id and c.kind in ('public_reservation_email','public_contact_email') and lower(trim(c.contact_value))=lower(trim(b.contact->>'email')) and c.verification_status='verified' and c.is_public=true and c.is_official=true and c.auto_usable=true) then 'READY'
        else 'VENUE_EMAIL_NOT_VERIFIED' end as email_runtime_reason
from public.bookings b;
alter view public.booking_email_readiness_v2 set (security_invoker=true);
grant select on public.booking_email_readiness_v2 to authenticated,service_role;

comment on table public.booking_email_requests is 'Email Booking V2 outbound request audit. Productive recipient must be a verified official venue-owned contact candidate.';
commit;
