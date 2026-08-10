-- Luvia Core 4.72.0 · Booking Intelligence / Provider Orchestration
-- User-interest-first routing. Commercial readiness is observable but never allowed to dominate
-- a technically healthier/direct booking route and never confirms a reservation.

begin;

create or replace view public.booking_provider_orchestration_readiness_v1 with (security_invoker=true) as
select
  c.provider_id,
  c.display_name,
  c.integration_tier,
  c.booking_mode,
  c.luvia_access_state,
  c.supports_availability,
  c.supports_create_reservation,
  c.supports_modify_reservation,
  c.supports_cancel_reservation,
  ar.availability_runtime_state,
  cr.connection_state,
  cr.probe_state,
  cr.consecutive_probe_failures,
  cr.last_probe_at,
  mr.commercial_status,
  mr.monetization_mode,
  coalesce(mr.commercial_active,false) as commercial_active,
  case
    when c.provider_id='email' then 60
    when c.luvia_access_state='connected' and cr.connection_state='connected' and cr.probe_state='healthy' then 100
    when c.luvia_access_state='connected' and cr.connection_state='connected' then 85
    when c.luvia_access_state='partner_required' then 45
    when c.luvia_access_state='discovery' then 30
    else 20
  end as reliability_score,
  case
    when ar.availability_runtime_state='ready' then 30
    when ar.availability_runtime_state in ('partner_required','unsupported') then 0
    when ar.availability_runtime_state is null then 0
    else -20
  end as availability_score,
  case when c.supports_create_reservation=true and c.luvia_access_state='connected' then 30 else 0 end as direct_booking_score,
  case when coalesce(mr.commercial_active,false) then 8 else 0 end as commercial_score,
  false as commercial_signal_can_confirm_reservation
from public.booking_provider_capabilities c
left join public.booking_provider_availability_readiness_v1 ar on ar.provider_id=c.provider_id
left join public.booking_provider_connection_readiness_v6 cr on cr.provider_id=c.provider_id
left join public.booking_monetization_provider_readiness_v1 mr on mr.provider_id=c.provider_id
where c.active=true;

grant select on public.booking_provider_orchestration_readiness_v1 to authenticated,service_role;

comment on view public.booking_provider_orchestration_readiness_v1 is
'Luvia Booking Core provider intelligence read model. Technical/user value signals dominate; commercial score is capped at 8 and cannot confirm reservations.';

create or replace function public.luvia_booking_route_rank(p_channel text)
returns integer language sql immutable as $$
 select case lower(coalesce(p_channel,''))
  when 'api' then 500
  when 'external_link' then 350
  when 'affiliate' then 300
  when 'email' then 200
  else 0 end
$$;

create or replace function public.luvia_booking_provider_intelligence_score(p_provider text,p_channel text)
returns integer language plpgsql stable security definer set search_path=public as $$
declare r public.booking_provider_orchestration_readiness_v1;v integer:=0;
begin
 if lower(coalesce(p_channel,''))='email' then return 60; end if;
 if coalesce(trim(p_provider),'')='' then return 0; end if;
 select * into r from public.booking_provider_orchestration_readiness_v1 where provider_id=lower(trim(p_provider));
 if not found then return 0; end if;
 v:=coalesce(r.reliability_score,0)+coalesce(r.availability_score,0)+coalesce(r.direct_booking_score,0)+least(8,greatest(0,coalesce(r.commercial_score,0)));
 return v;
end $$;

revoke all on function public.luvia_booking_provider_intelligence_score(text,text) from public;
grant execute on function public.luvia_booking_provider_intelligence_score(text,text) to authenticated,service_role;

-- Channel resolution after discovery now ranks equally valid public candidates by user value / technical health.
create or replace function public.luvia_booking_resolve_channel(p_booking_id uuid,p_discovery_run_id uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_booking public.bookings;v_candidate public.booking_contact_candidates;v_resolution public.booking_channel_resolutions;v_result jsonb;v_score integer;
begin
 select * into v_booking from public.bookings where id=p_booking_id for update;
 if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
 select c.* into v_candidate from public.booking_contact_candidates c
 where c.booking_id=p_booking_id and c.auto_usable=true and (p_discovery_run_id is null or c.discovery_run_id=p_discovery_run_id)
 order by
   public.luvia_booking_route_rank(c.channel) desc,
   public.luvia_booking_provider_intelligence_score(c.provider,c.channel) desc,
   public.luvia_booking_candidate_priority(c.kind) desc,
   case when coalesce((c.evidence->>'legacyContactMatch')::boolean,false) then 1 else 0 end desc,
   c.confidence desc,c.is_official desc,c.last_verified_at desc nulls last,c.discovered_at desc limit 1;
 if found then
  v_score:=public.luvia_booking_route_rank(v_candidate.channel)+public.luvia_booking_provider_intelligence_score(v_candidate.provider,v_candidate.channel);
  insert into public.booking_channel_resolutions(booking_id,discovery_run_id,candidate_id,resolved,channel,provider,contact_value,reason,resolution)
  values(p_booking_id,p_discovery_run_id,v_candidate.id,true,v_candidate.channel,v_candidate.provider,v_candidate.contact_value,'INTELLIGENCE_RANKED_VERIFIED_CHANNEL',jsonb_build_object('kind',v_candidate.kind,'sourceUrl',v_candidate.source_url,'confidence',v_candidate.confidence,'isOfficial',v_candidate.is_official,'orchestrationScore',v_score,'policy','user_interest_first','commercialWeightCap',8)) returning * into v_resolution;
  update public.bookings set channel=v_candidate.channel,provider=coalesce(v_candidate.provider,provider),contact=case when v_candidate.channel='email' then contact||jsonb_build_object('email',v_candidate.contact_value) when v_candidate.channel='external_link' then contact||jsonb_build_object('bookingUrl',v_candidate.contact_value) when v_candidate.channel='api' then contact||jsonb_build_object('apiEndpoint',v_candidate.contact_value) else contact end,metadata=metadata||jsonb_build_object('discovery',jsonb_build_object('resolved',true,'candidateId',v_candidate.id,'kind',v_candidate.kind,'sourceUrl',v_candidate.source_url,'version','4.72.0','orchestrationScore',v_score,'policy','user_interest_first')),updated_at=now() where id=p_booking_id;
  v_result:=jsonb_build_object('resolved',true,'channel',v_candidate.channel,'provider',v_candidate.provider,'value',v_candidate.contact_value,'kind',v_candidate.kind,'candidateId',v_candidate.id,'reason','INTELLIGENCE_RANKED_VERIFIED_CHANNEL','orchestrationScore',v_score,'policy','user_interest_first','commercialWeightCap',8);
 else
  insert into public.booking_channel_resolutions(booking_id,discovery_run_id,resolved,channel,reason,resolution)
  values(p_booking_id,p_discovery_run_id,false,'manual','NO_VERIFIED_PUBLIC_BOOKING_CHANNEL',jsonb_build_object('requiresUserAction',true,'policy','user_interest_first')) returning * into v_resolution;
  update public.bookings set channel='manual',metadata=metadata||jsonb_build_object('discovery',jsonb_build_object('resolved',false,'reason','NO_VERIFIED_PUBLIC_BOOKING_CHANNEL','version','4.72.0')),updated_at=now() where id=p_booking_id;
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

-- Route planning policy: direct API first, then verified official/provider link, then tracked affiliate,
-- then verified email fallback. Commercial tracking never buys priority over a better booking route.
create or replace function public.luvia_booking_plan_route(
 p_booking_id uuid,
 p_excluded_channels text[] default array[]::text[]
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
 b public.bookings;c public.booking_contact_candidates;l public.booking_affiliate_links;p public.booking_affiliate_partners;d public.booking_route_decisions;
 v_channel text:='manual';v_provider text;v_target text;v_source_type text:='manual_fallback';v_source_id uuid;v_reason text:='NO_AUTOMATED_ROUTE_AVAILABLE';v_requires boolean:=true;v_rank integer:=0;v_excluded text[]:=coalesce(p_excluded_channels,array[]::text[]);v_result jsonb;v_intelligence integer:=0;
begin
 select * into b from public.bookings where id=p_booking_id for update;
 if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
 if auth.uid() is not null and not public.luvia_booking_is_trip_member(b.trip_id) then raise exception 'BOOKING_FORBIDDEN'; end if;

 if not ('api'=any(v_excluded)) then
  select x.* into c from public.booking_contact_candidates x where x.booking_id=b.id and x.auto_usable=true and x.kind='official_api' and x.channel='api'
  order by public.luvia_booking_provider_intelligence_score(x.provider,x.channel) desc,x.confidence desc,x.is_official desc,x.discovered_at desc limit 1;
  if found then v_channel:='api';v_provider:=c.provider;v_target:=c.contact_value;v_source_type:='contact_candidate';v_source_id:=c.id;v_reason:='INTELLIGENCE_DIRECT_API_AVAILABLE';v_requires:=false;v_rank:=500; end if;
 end if;

 if v_channel='manual' and not ('external_link'=any(v_excluded)) then
  select x.* into c from public.booking_contact_candidates x where x.booking_id=b.id and x.auto_usable=true and x.channel='external_link' and x.kind in ('booking_provider','reservation_link')
  order by public.luvia_booking_provider_intelligence_score(x.provider,x.channel) desc,public.luvia_booking_candidate_priority(x.kind) desc,x.confidence desc,x.is_official desc,x.discovered_at desc limit 1;
  if found then v_channel:='external_link';v_provider:=c.provider;v_target:=c.contact_value;v_source_type:='contact_candidate';v_source_id:=c.id;v_reason:='INTELLIGENCE_VERIFIED_EXTERNAL_ROUTE_AVAILABLE';v_requires:=true;v_rank:=350; end if;
 end if;

 if v_channel='manual' and not ('affiliate'=any(v_excluded)) then
  select al.* into l from public.booking_affiliate_links al join public.booking_affiliate_partners ap on ap.id=al.partner_id where al.booking_id=b.id and al.status='active' and (al.expires_at is null or al.expires_at>now()) and ap.status='active' order by al.created_at desc limit 1;
  if found then select * into p from public.booking_affiliate_partners where id=l.partner_id;v_channel:='affiliate';v_provider:=p.partner_key;v_target:=l.affiliate_url;v_source_type:='affiliate_link';v_source_id:=l.id;v_reason:='TRACKED_ROUTE_AFTER_USER_VALUE_ROUTES';v_requires:=true;v_rank:=300; end if;
 end if;

 if v_channel='manual' and not ('email'=any(v_excluded)) then
  select x.* into c from public.booking_contact_candidates x where x.booking_id=b.id and x.auto_usable=true and x.channel='email' and x.kind in ('public_reservation_email','public_contact_email')
  order by public.luvia_booking_candidate_priority(x.kind) desc,x.confidence desc,x.is_official desc,x.discovered_at desc limit 1;
  if found then v_channel:='email';v_provider:=coalesce(c.provider,'email');v_target:=c.contact_value;v_source_type:='contact_candidate';v_source_id:=c.id;v_reason:='VERIFIED_EMAIL_FALLBACK_AVAILABLE';v_requires:=false;v_rank:=200; end if;
 end if;

 v_intelligence:=public.luvia_booking_provider_intelligence_score(v_provider,v_channel);
 insert into public.booking_route_decisions(booking_id,channel,provider,target,source_type,source_id,route_rank,requires_user_action,reason,excluded_channels,decision)
 values(b.id,v_channel,v_provider,v_target,v_source_type,v_source_id,v_rank+v_intelligence,v_requires,v_reason,to_jsonb(v_excluded),jsonb_build_object('policy','user_interest_first','baseRank',v_rank,'providerIntelligence',v_intelligence,'commercialWeightCap',8,'merchantOfRecord',false,'commercialCanConfirmReservation',false,'userNavigationRequired',v_requires)) returning * into d;
 insert into public.booking_route_state(booking_id,current_decision_id,state,retry_count,last_error,next_retry_at,updated_at) values(b.id,d.id,'planned',0,'{}'::jsonb,null,now()) on conflict(booking_id) do update set current_decision_id=excluded.current_decision_id,current_attempt_id=null,state='planned',retry_count=0,last_error='{}'::jsonb,next_retry_at=null,updated_at=now();
 update public.bookings set channel=v_channel,provider=case when v_channel='manual' then provider else coalesce(v_provider,provider) end,contact=case when v_channel='email' then contact||jsonb_build_object('email',v_target) when v_channel in ('affiliate','external_link') then contact||jsonb_build_object('bookingUrl',v_target) when v_channel='api' then contact||jsonb_build_object('apiEndpoint',v_target) else contact end,updated_at=now() where id=b.id;
 v_result:=jsonb_build_object('decisionId',d.id,'channel',v_channel,'provider',v_provider,'target',v_target,'sourceType',v_source_type,'sourceId',v_source_id,'routeRank',v_rank+v_intelligence,'baseRank',v_rank,'providerIntelligence',v_intelligence,'requiresUserAction',v_requires,'reason',v_reason,'policy','user_interest_first','commercialWeightCap',8,'merchantOfRecord',false,'commercialCanConfirmReservation',false);
 insert into public.booking_events(booking_id,trip_id,event_type,payload) values(b.id,b.trip_id,'booking.route.planned',v_result);
 return v_result;
end $$;

revoke all on function public.luvia_booking_plan_route(uuid,text[]) from public;
grant execute on function public.luvia_booking_plan_route(uuid,text[]) to authenticated,service_role;

insert into public.booking_health_checks(check_key,status,details,checked_at)
values('booking_orchestration_v4_72','ok',jsonb_build_object('core','4.72.0','build','13.72.0','policy','user_interest_first','commercialWeightCap',8,'bookingCoreDiagnostics',true,'reservationTruthSeparated',true),now())
on conflict(check_key) do update set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
