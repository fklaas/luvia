-- Luvia v13.68.5 / Core 4.68.5
-- Placeholder Email Detection & Verified Candidate Ranking Fix
begin;

create or replace function public.luvia_booking_is_placeholder_email(p_email text)
returns boolean
language plpgsql
immutable
as $$
declare
  v_email text := lower(trim(coalesce(p_email,'')));
  v_local text := split_part(lower(trim(coalesce(p_email,''))),'@',1);
  v_domain text := split_part(lower(trim(coalesce(p_email,''))),'@',2);
begin
  if v_email='' or position('@' in v_email)=0 then return false; end if;
  if v_domain in ('example.com','example.org','example.net','domain.com','domain.org','domain.net','domaine.com','domaine.fr','example.fr','example.de') then return true; end if;
  if v_local in ('user','username','utilisateur','name','nom','email','e-mail','mail','test','testing','example','exemple','yourname','your.name','votrenom','votre.nom','firstname','lastname','first.last') then return true; end if;
  if v_local ~ '^(user|username|utilisateur|example|exemple|test|testing)[._+-]?[0-9]*$' then return true; end if;
  return false;
end $$;

revoke all on function public.luvia_booking_is_placeholder_email(text) from public,anon;
grant execute on function public.luvia_booking_is_placeholder_email(text) to authenticated,service_role;

create or replace function public.luvia_booking_candidate_auto_usable(
 p_kind text,p_contact_value text,p_source_url text,p_is_public boolean,p_is_official boolean,p_verification_status text
) returns boolean language plpgsql immutable as $$
declare v_kind text:=lower(coalesce(p_kind,''));v_value text:=trim(coalesce(p_contact_value,''));v_source text:=trim(coalesce(p_source_url,''));
begin
 if coalesce(p_verification_status,'')<>'verified' or not coalesce(p_is_public,false) or v_source !~* '^https?://' then return false; end if;
 if v_kind in ('public_reservation_email','public_contact_email') then
  if public.luvia_booking_is_placeholder_email(v_value) then return false; end if;
  if public.luvia_booking_is_provider_email_domain(v_value) then return false; end if;
  return coalesce(p_is_official,false) and v_value ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$';
 elsif v_kind='official_api' then
  return coalesce(p_is_official,false) and v_value ~* '^https?://';
 elsif v_kind in ('booking_provider','reservation_link') then
  return (coalesce(p_is_official,false) or v_kind='booking_provider') and v_value ~* '^https?://';
 end if;
 return false;
end $$;


create or replace function public.luvia_booking_upsert_candidate(
 p_booking_id uuid,p_discovery_run_id uuid,p_kind text,p_provider text,p_contact_value text,p_source_url text,
 p_is_public boolean,p_is_official boolean,p_verification_status text,p_confidence numeric,p_evidence jsonb default '{}'::jsonb,p_metadata jsonb default '{}'::jsonb
) returns uuid language plpgsql security definer set search_path=public as $$
declare
 v_id uuid;v_channel text;v_auto boolean;v_verification text:=coalesce(p_verification_status,'unverified');v_evidence jsonb:=coalesce(p_evidence,'{}'::jsonb);v_metadata jsonb:=coalesce(p_metadata,'{}'::jsonb);
begin
 if p_kind not in ('official_api','booking_provider','reservation_link','public_reservation_email','public_contact_email','manual') then raise exception 'INVALID_DISCOVERY_KIND'; end if;
 if not exists(select 1 from public.bookings where id=p_booking_id) then raise exception 'BOOKING_NOT_FOUND'; end if;
 if p_kind in ('public_reservation_email','public_contact_email') and public.luvia_booking_is_placeholder_email(p_contact_value) then
   v_verification:='rejected';
   v_evidence:=v_evidence||jsonb_build_object('rejectionReason','PLACEHOLDER_EMAIL');
   v_metadata:=v_metadata||jsonb_build_object('candidateSafety','placeholder_email_rejected');
 end if;
 v_channel:=public.luvia_booking_candidate_channel(p_kind);
 v_auto:=public.luvia_booking_candidate_auto_usable(p_kind,p_contact_value,p_source_url,p_is_public,p_is_official,v_verification);
 insert into public.booking_contact_candidates(booking_id,discovery_run_id,kind,channel,provider,contact_value,source_url,is_public,is_official,verification_status,confidence,auto_usable,evidence,metadata,last_verified_at)
 values(p_booking_id,p_discovery_run_id,p_kind,v_channel,nullif(trim(coalesce(p_provider,'')),''),nullif(trim(coalesce(p_contact_value,'')),''),nullif(trim(coalesce(p_source_url,'')),''),coalesce(p_is_public,false),coalesce(p_is_official,false),v_verification,greatest(0,least(1,coalesce(p_confidence,0))),v_auto,v_evidence,v_metadata,case when v_verification='verified' then now() end)
 on conflict(booking_id,kind,contact_value,source_url) do update set discovery_run_id=excluded.discovery_run_id,channel=excluded.channel,provider=excluded.provider,is_public=excluded.is_public,is_official=excluded.is_official,verification_status=excluded.verification_status,confidence=excluded.confidence,auto_usable=excluded.auto_usable,evidence=excluded.evidence,metadata=excluded.metadata,last_verified_at=excluded.last_verified_at
 returning id into v_id;
 return v_id;
end $$;
revoke all on function public.luvia_booking_upsert_candidate(uuid,uuid,text,text,text,text,boolean,boolean,text,numeric,jsonb,jsonb) from public;
grant execute on function public.luvia_booking_upsert_candidate(uuid,uuid,text,text,text,text,boolean,boolean,text,numeric,jsonb,jsonb) to service_role;

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
  if v_email='' then return jsonb_build_object('ok',false,'reason','BOOKING_CONTACT_EMAIL_MISSING'); end if;
  if length(v_email)>254
     or v_email !~ '^[a-z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$' then
    return jsonb_build_object('ok',false,'reason','EMAIL_INVALID');
  end if;
  v_domain := split_part(v_email,'@',2);
  if v_domain ~ '\.(jpg|jpeg|png|gif|webp|svg|ico|bmp|tif|tiff|pdf|css|js|mjs|map|xml|json|zip|gz|woff|woff2|ttf|otf|eot)$' then
    return jsonb_build_object('ok',false,'reason','EMAIL_ASSET_OR_FILE_REFERENCE');
  end if;
  if public.luvia_booking_is_placeholder_email(v_email) then
    return jsonb_build_object('ok',false,'reason','PLACEHOLDER_EMAIL');
  end if;
  if public.luvia_booking_is_provider_email_domain(v_email) then
    return jsonb_build_object('ok',false,'reason','BOOKING_PROVIDER_EMAIL_DOMAIN');
  end if;
  return jsonb_build_object('ok',true,'reason','VALID','email',v_email,'domain',v_domain);
end $$;

revoke all on function public.luvia_booking_email_recipient_validation(text) from public,anon;
grant execute on function public.luvia_booking_email_recipient_validation(text) to authenticated,service_role;

-- Invalidate already persisted placeholder email candidates.
update public.booking_contact_candidates
set verification_status='rejected',
    auto_usable=false,
    evidence=coalesce(evidence,'{}'::jsonb)||jsonb_build_object('rejectionReason','PLACEHOLDER_EMAIL','rejectedBy','core-4.68.5'),
    metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('candidateSafety','placeholder_email_rejected'),
    last_verified_at=null
where kind in ('public_reservation_email','public_contact_email')
  and public.luvia_booking_is_placeholder_email(contact_value);

-- Candidate selection: same channel priority first, but when equally eligible prefer the
-- legacy booking contact only after it was independently rediscovered on an official source.
create or replace function public.luvia_booking_resolve_channel(p_booking_id uuid,p_discovery_run_id uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_booking public.bookings;v_candidate public.booking_contact_candidates;v_resolution public.booking_channel_resolutions;v_result jsonb;
begin
 select * into v_booking from public.bookings where id=p_booking_id for update;
 if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
 select * into v_candidate from public.booking_contact_candidates c
 where c.booking_id=p_booking_id and c.auto_usable=true and (p_discovery_run_id is null or c.discovery_run_id=p_discovery_run_id)
 order by public.luvia_booking_candidate_priority(c.kind) desc,
          case when coalesce((c.evidence->>'legacyContactMatch')::boolean,false) then 1 else 0 end desc,
          c.confidence desc,c.is_official desc,c.last_verified_at desc nulls last,c.discovered_at desc limit 1;
 if found then
  insert into public.booking_channel_resolutions(booking_id,discovery_run_id,candidate_id,resolved,channel,provider,contact_value,reason,resolution)
  values(p_booking_id,p_discovery_run_id,v_candidate.id,true,v_candidate.channel,v_candidate.provider,v_candidate.contact_value,'HIGHEST_PRIORITY_VERIFIED_PUBLIC_CHANNEL',jsonb_build_object('kind',v_candidate.kind,'sourceUrl',v_candidate.source_url,'confidence',v_candidate.confidence,'isOfficial',v_candidate.is_official,'legacyContactMatch',coalesce((v_candidate.evidence->>'legacyContactMatch')::boolean,false))) returning * into v_resolution;
  update public.bookings set channel=v_candidate.channel,provider=coalesce(v_candidate.provider,provider),contact=case when v_candidate.channel='email' then contact||jsonb_build_object('email',v_candidate.contact_value) when v_candidate.channel='external_link' then contact||jsonb_build_object('bookingUrl',v_candidate.contact_value) when v_candidate.channel='api' then contact||jsonb_build_object('apiEndpoint',v_candidate.contact_value) else contact end,metadata=metadata||jsonb_build_object('discovery',jsonb_build_object('resolved',true,'candidateId',v_candidate.id,'kind',v_candidate.kind,'sourceUrl',v_candidate.source_url,'version','0.5.1')),updated_at=now() where id=p_booking_id;
  v_result:=jsonb_build_object('resolved',true,'channel',v_candidate.channel,'provider',v_candidate.provider,'value',v_candidate.contact_value,'kind',v_candidate.kind,'candidateId',v_candidate.id,'reason','HIGHEST_PRIORITY_VERIFIED_PUBLIC_CHANNEL');
 else
  insert into public.booking_channel_resolutions(booking_id,discovery_run_id,resolved,channel,reason,resolution)
  values(p_booking_id,p_discovery_run_id,false,'manual','NO_VERIFIED_PUBLIC_BOOKING_CHANNEL',jsonb_build_object('requiresUserAction',true)) returning * into v_resolution;
  update public.bookings set channel='manual',metadata=metadata||jsonb_build_object('discovery',jsonb_build_object('resolved',false,'reason','NO_VERIFIED_PUBLIC_BOOKING_CHANNEL','version','0.5.1')),updated_at=now() where id=p_booking_id;
  v_result:=jsonb_build_object('resolved',false,'channel','manual','provider',null,'value',null,'kind','manual','candidateId',null,'reason','NO_VERIFIED_PUBLIC_BOOKING_CHANNEL','requiresUserAction',true);
 end if;
 if p_discovery_run_id is not null then
  update public.booking_discovery_runs set status=case when (v_result->>'resolved')::boolean then 'resolved' else 'unresolved' end,finished_at=now(),source_count=(select count(*) from public.booking_contact_candidates where discovery_run_id=p_discovery_run_id),result=v_result where id=p_discovery_run_id;
 end if;
 insert into public.booking_events(booking_id,trip_id,event_type,payload) values(v_booking.id,v_booking.trip_id,'booking.discovery.resolved',v_result);
 return v_result;
end $$;
revoke all on function public.luvia_booking_resolve_channel(uuid,uuid) from public;
grant execute on function public.luvia_booking_resolve_channel(uuid,uuid) to service_role;

-- Repair bookings whose selected contact email is now known to be a placeholder.
with replacement as (
  select distinct on (b.id)
    b.id as booking_id,
    c.contact_value
  from public.bookings b
  join public.booking_contact_candidates c on c.booking_id=b.id
  where public.luvia_booking_is_placeholder_email(b.contact->>'email')
    and c.kind in ('public_reservation_email','public_contact_email')
    and c.auto_usable=true
    and c.verification_status='verified'
    and c.is_public=true and c.is_official=true
  order by b.id,
           public.luvia_booking_candidate_priority(c.kind) desc,
           case when coalesce((c.evidence->>'legacyContactMatch')::boolean,false) then 1 else 0 end desc,
           c.confidence desc,c.last_verified_at desc nulls last,c.discovered_at desc
)
update public.bookings b
set contact=coalesce(b.contact,'{}'::jsonb)||jsonb_build_object('email',r.contact_value),
    updated_at=now()
from replacement r
where b.id=r.booking_id;

insert into public.booking_health_checks(check_key,status,details,checked_at)
values(
  'release','ok',
  jsonb_build_object(
    'version','1.0.12','integration_ready',true,
    'luvia_core','4.68.5','luvia_build','13.68.5',
    'feature','Placeholder Email Detection & Verified Candidate Ranking Fix',
    'placeholder_email_guard',true,'placeholder_candidate_cleanup',true,
    'verified_legacy_ranking',true,'booking_contact_repair',true,
    'checked_at',now()
  ),now()
)
on conflict(check_key) do update set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

comment on function public.luvia_booking_is_placeholder_email(text) is 'Rejects documentation/example/placeholder email addresses before they can become auto-usable booking contacts.';
comment on function public.luvia_booking_resolve_channel(uuid,uuid) is 'Priority: channel kind, independently verified legacy contact match, confidence, official evidence and recency.';

commit;
