-- Luvia v13.74.0 / Core 4.74.0
-- Runtime Provider Health & Adaptive Booking Decisions
-- Runtime connection/probe/availability evidence now affects route selection.
-- Commercial influence remains capped and reservation truth remains separate.
begin;

create or replace view public.booking_provider_runtime_health_v1 with (security_invoker=true) as
select
  c.provider_id,
  c.display_name,
  c.luvia_access_state,
  c.booking_mode,
  c.supports_availability,
  c.supports_create_reservation,
  cr.connection_state,
  cr.probe_state,
  cr.probe_reason,
  cr.last_probe_at,
  case when cr.last_probe_at is null then null else greatest(0,extract(epoch from (now()-cr.last_probe_at))::bigint) end as probe_age_seconds,
  cr.consecutive_probe_failures,
  cr.orchestration_state,
  cr.orchestration_reason,
  cr.next_probe_at,
  ar.availability_runtime_state,
  ar.availability_runtime_reason,
  case
    when c.provider_id='email' then 'healthy'
    when c.luvia_access_state in ('partner_required','discovery') then 'unavailable'
    when cr.connection_state in ('disabled','failed') or cr.probe_state='failed' then 'unavailable'
    when cr.orchestration_state='backoff' or cr.connection_state='degraded' or cr.probe_state='degraded' or coalesce(cr.consecutive_probe_failures,0)>=2 then 'degraded'
    when cr.probe_state='healthy' and cr.last_probe_at is not null and cr.last_probe_at < now()-interval '15 minutes' then 'degraded'
    when cr.connection_state='connected' and cr.probe_state='healthy' and coalesce(ar.availability_runtime_state,'ready') in ('ready','unsupported') then 'healthy'
    when cr.connection_state='connected' and cr.probe_state in ('healthy','ready','not_applicable') then 'ready'
    else 'unknown'
  end as runtime_health_state,
  case
    when c.provider_id='email' then 'INTERNAL_TRANSPORT'
    when c.luvia_access_state in ('partner_required','discovery') then 'PARTNER_NOT_CONNECTED'
    when cr.connection_state in ('disabled','failed') or cr.probe_state='failed' then 'RUNTIME_PROVIDER_UNAVAILABLE'
    when cr.orchestration_state='backoff' then 'PROVIDER_BACKOFF_ACTIVE'
    when cr.connection_state='degraded' or cr.probe_state='degraded' or coalesce(cr.consecutive_probe_failures,0)>=2 then 'RUNTIME_PROVIDER_DEGRADED'
    when cr.probe_state='healthy' and cr.last_probe_at is not null and cr.last_probe_at < now()-interval '15 minutes' then 'LIVE_PROBE_STALE'
    when cr.connection_state='connected' and cr.probe_state='healthy' and coalesce(ar.availability_runtime_state,'ready') in ('ready','unsupported') then 'RUNTIME_PROVIDER_HEALTHY'
    when cr.connection_state='connected' and cr.probe_state in ('healthy','ready','not_applicable') then 'RUNTIME_PROVIDER_READY'
    else 'RUNTIME_HEALTH_UNKNOWN'
  end as runtime_health_reason,
  case
    when c.provider_id='email' then 20
    when c.luvia_access_state in ('partner_required','discovery') then -500
    when cr.connection_state in ('disabled','failed') or cr.probe_state='failed' then -500
    when cr.orchestration_state='backoff' or cr.connection_state='degraded' or cr.probe_state='degraded' or coalesce(cr.consecutive_probe_failures,0)>=2 then -220
    when cr.probe_state='healthy' and cr.last_probe_at is not null and cr.last_probe_at < now()-interval '15 minutes' then -220
    when cr.connection_state='connected' and cr.probe_state='healthy' and coalesce(ar.availability_runtime_state,'ready') in ('ready','unsupported') then 20
    when cr.connection_state='connected' and cr.probe_state in ('healthy','ready','not_applicable') then 10
    else -40
  end as runtime_health_score,
  case
    when c.provider_id='email' then false
    when c.luvia_access_state <> 'connected' then false
    when cr.connection_state in ('disabled','failed') or cr.probe_state='failed' then false
    else coalesce(c.supports_create_reservation,false)
  end as api_route_eligible
from public.booking_provider_capabilities c
left join public.booking_provider_connection_readiness_v6 cr on cr.provider_id=c.provider_id
left join public.booking_provider_availability_readiness_v1 ar on ar.provider_id=c.provider_id
where c.active=true;

grant select on public.booking_provider_runtime_health_v1 to authenticated,service_role;
comment on view public.booking_provider_runtime_health_v1 is
'Runtime health truth for Booking provider routing. Uses live connection, probe freshness/failures, activation orchestration and availability readiness; does not alter reservation truth.';

create or replace function public.luvia_booking_runtime_health_adjustment(p_state text)
returns integer language sql immutable as $$
 select case lower(coalesce(p_state,''))
  when 'healthy' then 20
  when 'ready' then 10
  when 'degraded' then -300
  when 'unavailable' then -500
  else -220 end
$$;
grant execute on function public.luvia_booking_runtime_health_adjustment(text) to authenticated,service_role;

create or replace function public.luvia_booking_provider_route_eligible(p_provider text,p_channel text)
returns boolean language plpgsql stable security definer set search_path=public as $$
declare r public.booking_provider_runtime_health_v1;
begin
 if lower(coalesce(p_channel,'')) <> 'api' then return true; end if;
 if coalesce(trim(p_provider),'')='' then return false; end if;
 select * into r from public.booking_provider_runtime_health_v1 where provider_id=lower(trim(p_provider));
 if not found then return false; end if;
 return coalesce(r.api_route_eligible,false) and r.runtime_health_state <> 'unavailable';
end $$;
revoke all on function public.luvia_booking_provider_route_eligible(text,text) from public,anon;
grant execute on function public.luvia_booking_provider_route_eligible(text,text) to authenticated,service_role;

create or replace function public.luvia_booking_provider_runtime_snapshot(p_provider text)
returns jsonb language sql stable security definer set search_path=public as $$
 select coalesce((select jsonb_build_object(
  'providerId',r.provider_id,
  'state',r.runtime_health_state,
  'reason',r.runtime_health_reason,
  'score',r.runtime_health_score,
  'apiEligible',r.api_route_eligible,
  'connectionState',r.connection_state,
  'probeState',r.probe_state,
  'probeAgeSeconds',r.probe_age_seconds,
  'consecutiveProbeFailures',r.consecutive_probe_failures,
  'orchestrationState',r.orchestration_state,
  'availabilityRuntimeState',r.availability_runtime_state,
  'nextProbeAt',r.next_probe_at
 ) from public.booking_provider_runtime_health_v1 r where r.provider_id=lower(trim(coalesce(p_provider,'')))),'{}'::jsonb)
$$;
revoke all on function public.luvia_booking_provider_runtime_snapshot(text) from public,anon;
grant execute on function public.luvia_booking_provider_runtime_snapshot(text) to authenticated,service_role;

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
  false as commercial_signal_can_confirm_reservation,
  rh.runtime_health_state,
  rh.runtime_health_reason,
  rh.runtime_health_score,
  rh.api_route_eligible,
  rh.probe_age_seconds,
  cr.orchestration_state,
  cr.orchestration_reason,
  cr.next_probe_at
from public.booking_provider_capabilities c
left join public.booking_provider_availability_readiness_v1 ar on ar.provider_id=c.provider_id
left join public.booking_provider_connection_readiness_v6 cr on cr.provider_id=c.provider_id
left join public.booking_monetization_provider_readiness_v1 mr on mr.provider_id=c.provider_id
left join public.booking_provider_runtime_health_v1 rh on rh.provider_id=c.provider_id
where c.active=true;

grant select on public.booking_provider_orchestration_readiness_v1 to authenticated,service_role;

create or replace function public.luvia_booking_provider_intelligence_score(p_provider text,p_channel text)
returns integer language plpgsql stable security definer set search_path=public as $$
declare r public.booking_provider_orchestration_readiness_v1;v integer:=0;v_channel text:=lower(coalesce(p_channel,''));v_runtime integer:=0;
begin
 if v_channel='email' then return 60; end if;
 if coalesce(trim(p_provider),'')='' then return 0; end if;
 select * into r from public.booking_provider_orchestration_readiness_v1 where provider_id=lower(trim(p_provider));
 if not found then return 0; end if;
 if v_channel='api' and coalesce(r.api_route_eligible,false)=false then return -500; end if;
 -- Live API health must influence direct API routing only. A provider's degraded API must not
 -- poison a verified external handoff URL for the same venue/provider.
 v_runtime:=case when v_channel='api' then coalesce(r.runtime_health_score,0) else 0 end;
 v:=coalesce(r.reliability_score,0)+case when v_channel='api' then coalesce(r.availability_score,0)+coalesce(r.direct_booking_score,0) else 0 end+least(8,greatest(0,coalesce(r.commercial_score,0)))+v_runtime;
 return v;
end $$;
revoke all on function public.luvia_booking_provider_intelligence_score(text,text) from public;
grant execute on function public.luvia_booking_provider_intelligence_score(text,text) to authenticated,service_role;

-- Discovery resolution now compares all verified public contact routes by adaptive runtime score.
create or replace function public.luvia_booking_resolve_channel(p_booking_id uuid,p_discovery_run_id uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
 v_booking public.bookings;v_candidate public.booking_contact_candidates;v_resolution public.booking_channel_resolutions;v_result jsonb;v_score integer;v_runtime jsonb;
begin
 select * into v_booking from public.bookings where id=p_booking_id for update;
 if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
 select c.* into v_candidate
 from public.booking_contact_candidates c
 where c.booking_id=p_booking_id and c.auto_usable=true
   and (p_discovery_run_id is null or c.discovery_run_id=p_discovery_run_id)
   and public.luvia_booking_provider_route_eligible(c.provider,c.channel)
 order by
   public.luvia_booking_route_rank(c.channel)+public.luvia_booking_provider_intelligence_score(c.provider,c.channel)+round(c.confidence*10)::integer desc,
   public.luvia_booking_candidate_priority(c.kind) desc,
   c.is_official desc,c.last_verified_at desc nulls last,c.discovered_at desc
 limit 1;
 if found then
  v_score:=public.luvia_booking_route_rank(v_candidate.channel)+public.luvia_booking_provider_intelligence_score(v_candidate.provider,v_candidate.channel)+round(v_candidate.confidence*10)::integer;
  v_runtime:=public.luvia_booking_provider_runtime_snapshot(v_candidate.provider);
  insert into public.booking_channel_resolutions(booking_id,discovery_run_id,candidate_id,resolved,channel,provider,contact_value,reason,resolution)
  values(p_booking_id,p_discovery_run_id,v_candidate.id,true,v_candidate.channel,v_candidate.provider,v_candidate.contact_value,'ADAPTIVE_RUNTIME_RANKED_VERIFIED_CHANNEL',jsonb_build_object('kind',v_candidate.kind,'sourceUrl',v_candidate.source_url,'confidence',v_candidate.confidence,'isOfficial',v_candidate.is_official,'orchestrationScore',v_score,'policy','user_interest_first','decisionMode','runtime_adaptive','runtimeHealth',v_runtime,'commercialWeightCap',8)) returning * into v_resolution;
  update public.bookings set channel=v_candidate.channel,provider=coalesce(v_candidate.provider,provider),contact=case when v_candidate.channel='email' then contact||jsonb_build_object('email',v_candidate.contact_value) when v_candidate.channel='external_link' then contact||jsonb_build_object('bookingUrl',v_candidate.contact_value) when v_candidate.channel='api' then contact||jsonb_build_object('apiEndpoint',v_candidate.contact_value) else contact end,metadata=metadata||jsonb_build_object('discovery',jsonb_build_object('resolved',true,'candidateId',v_candidate.id,'kind',v_candidate.kind,'sourceUrl',v_candidate.source_url,'version','4.74.0','orchestrationScore',v_score,'policy','user_interest_first','decisionMode','runtime_adaptive','runtimeHealth',v_runtime)),updated_at=now() where id=p_booking_id;
  v_result:=jsonb_build_object('resolved',true,'channel',v_candidate.channel,'provider',v_candidate.provider,'value',v_candidate.contact_value,'kind',v_candidate.kind,'candidateId',v_candidate.id,'reason','ADAPTIVE_RUNTIME_RANKED_VERIFIED_CHANNEL','orchestrationScore',v_score,'policy','user_interest_first','decisionMode','runtime_adaptive','runtimeHealth',v_runtime,'commercialWeightCap',8);
 else
  insert into public.booking_channel_resolutions(booking_id,discovery_run_id,resolved,channel,reason,resolution)
  values(p_booking_id,p_discovery_run_id,false,'manual','NO_RUNTIME_ELIGIBLE_VERIFIED_BOOKING_CHANNEL',jsonb_build_object('requiresUserAction',true,'policy','user_interest_first','decisionMode','runtime_adaptive')) returning * into v_resolution;
  update public.bookings set channel='manual',metadata=metadata||jsonb_build_object('discovery',jsonb_build_object('resolved',false,'reason','NO_RUNTIME_ELIGIBLE_VERIFIED_BOOKING_CHANNEL','version','4.74.0')),updated_at=now() where id=p_booking_id;
  v_result:=jsonb_build_object('resolved',false,'channel','manual','provider',null,'value',null,'kind','manual','candidateId',null,'reason','NO_RUNTIME_ELIGIBLE_VERIFIED_BOOKING_CHANNEL','requiresUserAction',true,'decisionMode','runtime_adaptive');
 end if;
 if p_discovery_run_id is not null then
  update public.booking_discovery_runs set status=case when (v_result->>'resolved')::boolean then 'resolved' else 'unresolved' end,finished_at=now(),source_count=(select count(*) from public.booking_contact_candidates where discovery_run_id=p_discovery_run_id),result=v_result where id=p_discovery_run_id;
 end if;
 insert into public.booking_events(booking_id,trip_id,event_type,payload) values(v_booking.id,v_booking.trip_id,'booking.discovery.resolved',v_result);
 return v_result;
end $$;
revoke all on function public.luvia_booking_resolve_channel(uuid,uuid) from public;
grant execute on function public.luvia_booking_resolve_channel(uuid,uuid) to service_role;

-- Adaptive route planner evaluates every currently valid route instead of stopping at channel precedence.
create or replace function public.luvia_booking_plan_route(
 p_booking_id uuid,
 p_excluded_channels text[] default array[]::text[]
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
 b public.bookings;d public.booking_route_decisions;v_excluded text[]:=coalesce(p_excluded_channels,array[]::text[]);v_choice record;v_result jsonb;v_runtime jsonb;
begin
 select * into b from public.bookings where id=p_booking_id for update;
 if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
 if auth.uid() is not null and not public.luvia_booking_is_trip_member(b.trip_id) then raise exception 'BOOKING_FORBIDDEN'; end if;

 with route_candidates as (
  select c.channel,c.provider,c.contact_value as target,'contact_candidate'::text as source_type,c.id as source_id,
         case when c.channel in ('external_link') then true else false end as requires_user_action,
         public.luvia_booking_route_rank(c.channel) as base_rank,
         public.luvia_booking_provider_intelligence_score(c.provider,c.channel) as provider_intelligence,
         round(c.confidence*10)::integer as confidence_score,
         c.kind as source_kind,c.is_official,c.confidence,c.discovered_at
  from public.booking_contact_candidates c
  where c.booking_id=b.id and c.auto_usable=true and not(c.channel=any(v_excluded))
    and c.channel in ('api','external_link','email')
    and public.luvia_booking_provider_route_eligible(c.provider,c.channel)
  union all
  select 'affiliate',ap.partner_key,al.affiliate_url,'affiliate_link',al.id,true,
         public.luvia_booking_route_rank('affiliate'),public.luvia_booking_provider_intelligence_score(ap.partner_key,'affiliate'),0,
         'affiliate_link',true,1::numeric,al.created_at
  from public.booking_affiliate_links al join public.booking_affiliate_partners ap on ap.id=al.partner_id
  where al.booking_id=b.id and al.status='active' and (al.expires_at is null or al.expires_at>now()) and ap.status='active' and not('affiliate'=any(v_excluded))
  union all
  select 'manual',null,'manual','manual_fallback',null,true,0,0,0,'manual',true,1::numeric,now()
 ), ranked as (
  select *,base_rank+provider_intelligence+confidence_score as total_score
  from route_candidates
 )
 select * into v_choice from ranked
 order by total_score desc,base_rank desc,is_official desc,confidence desc,discovered_at desc
 limit 1;

 v_runtime:=public.luvia_booking_provider_runtime_snapshot(v_choice.provider);
 insert into public.booking_route_decisions(booking_id,channel,provider,target,source_type,source_id,route_rank,requires_user_action,reason,excluded_channels,decision)
 values(b.id,v_choice.channel,v_choice.provider,v_choice.target,v_choice.source_type,v_choice.source_id,v_choice.total_score,v_choice.requires_user_action,
   case when v_choice.channel='manual' then 'NO_AUTOMATED_ROUTE_AVAILABLE' else 'ADAPTIVE_RUNTIME_RANKED_ROUTE' end,
   to_jsonb(v_excluded),jsonb_build_object('policy','user_interest_first','decisionMode','runtime_adaptive','baseRank',v_choice.base_rank,'providerIntelligence',v_choice.provider_intelligence,'confidenceScore',v_choice.confidence_score,'runtimeHealth',v_runtime,'commercialWeightCap',8,'merchantOfRecord',false,'commercialCanConfirmReservation',false,'userNavigationRequired',v_choice.requires_user_action)) returning * into d;
 insert into public.booking_route_state(booking_id,current_decision_id,state,retry_count,last_error,next_retry_at,updated_at) values(b.id,d.id,'planned',0,'{}'::jsonb,null,now()) on conflict(booking_id) do update set current_decision_id=excluded.current_decision_id,current_attempt_id=null,state='planned',retry_count=0,last_error='{}'::jsonb,next_retry_at=null,updated_at=now();
 update public.bookings set channel=v_choice.channel,provider=case when v_choice.channel='manual' then provider else coalesce(v_choice.provider,provider) end,contact=case when v_choice.channel='email' then contact||jsonb_build_object('email',v_choice.target) when v_choice.channel in ('affiliate','external_link') then contact||jsonb_build_object('bookingUrl',v_choice.target) when v_choice.channel='api' then contact||jsonb_build_object('apiEndpoint',v_choice.target) else contact end,updated_at=now() where id=b.id;
 v_result:=jsonb_build_object('decisionId',d.id,'channel',v_choice.channel,'provider',v_choice.provider,'target',v_choice.target,'sourceType',v_choice.source_type,'sourceId',v_choice.source_id,'routeRank',v_choice.total_score,'baseRank',v_choice.base_rank,'providerIntelligence',v_choice.provider_intelligence,'confidenceScore',v_choice.confidence_score,'runtimeHealth',v_runtime,'requiresUserAction',v_choice.requires_user_action,'reason',case when v_choice.channel='manual' then 'NO_AUTOMATED_ROUTE_AVAILABLE' else 'ADAPTIVE_RUNTIME_RANKED_ROUTE' end,'policy','user_interest_first','decisionMode','runtime_adaptive','commercialWeightCap',8,'merchantOfRecord',false,'commercialCanConfirmReservation',false);
 insert into public.booking_events(booking_id,trip_id,event_type,payload) values(b.id,b.trip_id,'booking.route.planned',v_result);
 return v_result;
end $$;
revoke all on function public.luvia_booking_plan_route(uuid,text[]) from public;
grant execute on function public.luvia_booking_plan_route(uuid,text[]) to authenticated,service_role;

-- Extend decision read model with adaptive runtime evidence already persisted in decision JSON.
create or replace view public.booking_route_decision_runtime_v1 with (security_invoker=true) as
select
 d.id as decision_id,d.booking_id,b.trip_id,d.created_at,d.channel,d.provider,d.target,d.source_type,d.source_id,d.route_rank,d.requires_user_action,d.reason,d.excluded_channels,d.decision,
 coalesce(d.decision->>'policy','legacy') as policy,
 coalesce((d.decision->>'baseRank')::integer,public.luvia_booking_route_rank(d.channel)) as base_rank,
 coalesce((d.decision->>'providerIntelligence')::integer,0) as provider_intelligence,
 least(8,greatest(0,coalesce((d.decision->>'commercialWeightCap')::integer,8))) as commercial_weight_cap,
 coalesce((d.decision->>'commercialCanConfirmReservation')::boolean,false) as commercial_can_confirm_reservation,
 s.state as orchestration_state,s.retry_count,s.next_retry_at,s.last_error,s.current_attempt_id,a.status as current_attempt_status,a.error_class as current_attempt_error_class,a.retry_at as current_attempt_retry_at,
 coalesce(d.decision->>'decisionMode','legacy') as decision_mode,
 d.decision->'runtimeHealth' as runtime_health,
 coalesce(d.decision#>>'{runtimeHealth,state}','unknown') as runtime_health_state,
 coalesce((d.decision#>>'{runtimeHealth,score}')::integer,0) as runtime_health_score
from public.booking_route_decisions d
join public.bookings b on b.id=d.booking_id
left join public.booking_route_state s on s.current_decision_id=d.id
left join public.booking_route_attempts a on a.id=s.current_attempt_id;

grant select on public.booking_route_decision_runtime_v1 to authenticated,service_role;

create or replace function public.luvia_booking_orchestration_policy_snapshot()
returns jsonb language sql stable as $$
 select jsonb_build_object(
  'core','4.74.0','build','13.74.0','policy','user_interest_first','decisionMode','runtime_adaptive',
  'routeOrder',jsonb_build_array('api','external_link','affiliate','email','manual'),
  'routeRanks',jsonb_build_object('api',500,'external_link',350,'affiliate',300,'email',200,'manual',0),
  'runtimeHealthAdjustments',jsonb_build_object('healthy',20,'ready',10,'unknown',-220,'degraded',-300,'unavailable',-500),
  'probeFreshnessSeconds',900,'commercialWeightCap',8,'commercialCanConfirmReservation',false,'commissionCanConfirmReservation',false
 )
$$;
grant execute on function public.luvia_booking_orchestration_policy_snapshot() to authenticated,service_role;

insert into public.booking_health_checks(check_key,status,details,checked_at)
values('booking_orchestration_v4_74','ok',public.luvia_booking_orchestration_policy_snapshot()||jsonb_build_object('runtimeProviderHealth',true,'adaptiveBookingDecisions',true,'staleProbeDegrades',true,'providerBackoffObserved',true,'reservationTruthSeparated',true),now())
on conflict(check_key) do update set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
