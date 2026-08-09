-- Luvia v13.68.1 / Core 4.68.1
-- Email Recipient Validation & Readiness Guard Fix
begin;

create or replace function public.luvia_booking_email_recipient_validation(p_email text)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  v_email text := lower(trim(coalesce(p_email,'')));
  v_domain text;
begin
  if v_email='' then
    return jsonb_build_object('ok',false,'reason','BOOKING_CONTACT_EMAIL_MISSING');
  end if;

  -- Deliberately stricter than the legacy extractor. A candidate that merely contains
  -- "@" is not sufficient for an outbound booking recipient.
  if length(v_email)>254
     or v_email !~ '^[a-z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$' then
    return jsonb_build_object('ok',false,'reason','EMAIL_INVALID');
  end if;

  v_domain := split_part(v_email,'@',2);

  -- Web assets were historically mis-detected as email contacts (for example
  -- logo-le-point@2x.jpg). Never allow asset/file extensions as recipient domains.
  if v_domain ~ '\.(jpg|jpeg|png|gif|webp|svg|ico|bmp|tif|tiff|pdf|css|js|mjs|map|xml|json|zip|gz|woff|woff2|ttf|otf|eot)$' then
    return jsonb_build_object('ok',false,'reason','EMAIL_ASSET_OR_FILE_REFERENCE');
  end if;

  if public.luvia_booking_is_provider_email_domain(v_email) then
    return jsonb_build_object('ok',false,'reason','BOOKING_PROVIDER_EMAIL_DOMAIN');
  end if;

  return jsonb_build_object('ok',true,'reason','VALID','email',v_email,'domain',v_domain);
end $$;

revoke all on function public.luvia_booking_email_recipient_validation(text) from public,anon;
grant execute on function public.luvia_booking_email_recipient_validation(text) to authenticated,service_role;

create or replace function public.luvia_booking_email_verified_candidate(p_booking_id uuid,p_email text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  c public.booking_contact_candidates;
  v_email text:=lower(trim(coalesce(p_email,'')));
  v_trip uuid;
  v_validation jsonb;
begin
  select trip_id into v_trip from public.bookings where id=p_booking_id;
  if v_trip is null then return jsonb_build_object('ok',false,'reason','BOOKING_NOT_FOUND'); end if;
  if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' and not public.luvia_booking_is_trip_member(v_trip) then raise exception 'TRIP_ACCESS_DENIED'; end if;

  v_validation := public.luvia_booking_email_recipient_validation(v_email);
  if coalesce((v_validation->>'ok')::boolean,false) is not true then
    return v_validation;
  end if;

  select * into c from public.booking_contact_candidates
  where booking_id=p_booking_id
    and kind in ('public_reservation_email','public_contact_email')
    and lower(trim(contact_value))=v_email
    and verification_status='verified'
    and is_public=true and is_official=true and auto_usable=true
  order by confidence desc,last_verified_at desc nulls last,discovered_at desc limit 1;

  if not found then return jsonb_build_object('ok',false,'reason','VENUE_EMAIL_NOT_VERIFIED'); end if;
  return jsonb_build_object('ok',true,'reason','READY','candidateId',c.id,'email',c.contact_value,'kind',c.kind,'sourceUrl',c.source_url,'confidence',c.confidence,'lastVerifiedAt',c.last_verified_at);
end $$;

revoke all on function public.luvia_booking_email_verified_candidate(uuid,text) from public,anon;
grant execute on function public.luvia_booking_email_verified_candidate(uuid,text) to authenticated,service_role;

create or replace view public.booking_email_readiness_v2 as
select
  b.id as booking_id,
  b.trip_id,
  b.status,
  b.booking_type,
  b.title,
  b.contact->>'email' as contact_email,
  case
    when coalesce((v.validation->>'ok')::boolean,false) is not true then 'blocked'
    when exists(
      select 1 from public.booking_contact_candidates c
      where c.booking_id=b.id
        and c.kind in ('public_reservation_email','public_contact_email')
        and lower(trim(c.contact_value))=lower(trim(b.contact->>'email'))
        and c.verification_status='verified'
        and c.is_public=true and c.is_official=true and c.auto_usable=true
    ) then 'ready'
    else 'verification_required'
  end as email_runtime_state,
  case
    when coalesce((v.validation->>'ok')::boolean,false) is not true then coalesce(v.validation->>'reason','EMAIL_INVALID')
    when exists(
      select 1 from public.booking_contact_candidates c
      where c.booking_id=b.id
        and c.kind in ('public_reservation_email','public_contact_email')
        and lower(trim(c.contact_value))=lower(trim(b.contact->>'email'))
        and c.verification_status='verified'
        and c.is_public=true and c.is_official=true and c.auto_usable=true
    ) then 'READY'
    else 'VENUE_EMAIL_NOT_VERIFIED'
  end as email_runtime_reason
from public.bookings b
cross join lateral (
  select public.luvia_booking_email_recipient_validation(b.contact->>'email') as validation
) v;

alter view public.booking_email_readiness_v2 set (security_invoker=true);
grant select on public.booking_email_readiness_v2 to authenticated,service_role;

comment on function public.luvia_booking_email_recipient_validation(text) is
'Central Email Booking V2 recipient validator used by readiness and send verification. Rejects malformed addresses, asset/file lookalikes, and generic booking-provider domains.';

commit;
