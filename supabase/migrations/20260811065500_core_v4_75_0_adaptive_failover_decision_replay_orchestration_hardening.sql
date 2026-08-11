-- Luvia v13.75.0 / Core 4.75.0
-- Adaptive Failover, Decision Replay & Orchestration Hardening
-- Commercial/commission signals never confirm reservation truth.
begin;

create table if not exists public.booking_route_failover_events(
 id uuid primary key default gen_random_uuid(),
 booking_id uuid not null references public.bookings(id) on delete cascade,
 from_decision_id uuid references public.booking_route_decisions(id) on delete set null,
 from_attempt_id uuid references public.booking_route_attempts(id) on delete set null,
 to_decision_id uuid references public.booking_route_decisions(id) on delete set null,
 action text not null check(action in ('failed_over','blocked_reconciliation','blocked_terminal','exhausted')),
 reason text not null,
 error_class text,
 idempotency_key text not null unique,
 evidence jsonb not null default '{}'::jsonb check(jsonb_typeof(evidence)='object'),
 created_at timestamptz not null default now()
);
create index if not exists booking_route_failover_events_booking_idx on public.booking_route_failover_events(booking_id,created_at desc);

alter table public.booking_route_failover_events enable row level security;
grant select on public.booking_route_failover_events to authenticated;
grant select,insert,update,delete on public.booking_route_failover_events to service_role;
drop policy if exists booking_route_failover_events_trip_member_select on public.booking_route_failover_events;
create policy booking_route_failover_events_trip_member_select on public.booking_route_failover_events for select to authenticated
 using(exists(select 1 from public.bookings b where b.id=booking_id and public.luvia_booking_is_trip_member(b.trip_id)));

-- Dry-run preview. Failed route signatures are excluded only when requested; a failed API does not poison an official link of the same provider.
create or replace function public.luvia_booking_route_preview(
 p_booking_id uuid,
 p_exclude_failed boolean default false
) returns jsonb language plpgsql security definer set search_path=public as $$
declare b public.bookings;v_choice record;v_runtime jsonb;
begin
 select * into b from public.bookings where id=p_booking_id;
 if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
 if auth.uid() is not null and not public.luvia_booking_is_trip_member(b.trip_id) then raise exception 'BOOKING_FORBIDDEN'; end if;

 with route_candidates as (
  select c.channel,c.provider,c.contact_value as target,'contact_candidate'::text as source_type,c.id as source_id,
         case when c.channel='external_link' then true else false end as requires_user_action,
         public.luvia_booking_route_rank(c.channel) as base_rank,
         public.luvia_booking_provider_intelligence_score(c.provider,c.channel) as provider_intelligence,
         round(c.confidence*10)::integer as confidence_score,c.is_official,c.confidence,c.discovered_at
  from public.booking_contact_candidates c
  where c.booking_id=b.id and c.auto_usable=true and c.channel in ('api','external_link','email')
    and public.luvia_booking_provider_route_eligible(c.provider,c.channel)
    and (not p_exclude_failed or not exists(
      select 1 from public.booking_route_attempts fa
      join public.booking_route_decisions fd on fd.id=fa.decision_id
      where fa.booking_id=b.id and fa.status='failed'
        and fd.channel=c.channel and coalesce(fd.provider,'')=coalesce(c.provider,'') and coalesce(fd.target,'')=coalesce(c.contact_value,'')
    ))
  union all
  select 'affiliate',ap.partner_key,al.affiliate_url,'affiliate_link',al.id,true,
         public.luvia_booking_route_rank('affiliate'),public.luvia_booking_provider_intelligence_score(ap.partner_key,'affiliate'),0,true,1::numeric,al.created_at
  from public.booking_affiliate_links al join public.booking_affiliate_partners ap on ap.id=al.partner_id
  where al.booking_id=b.id and al.status='active' and (al.expires_at is null or al.expires_at>now()) and ap.status='active'
    and (not p_exclude_failed or not exists(
      select 1 from public.booking_route_attempts fa join public.booking_route_decisions fd on fd.id=fa.decision_id
      where fa.booking_id=b.id and fa.status='failed' and fd.channel='affiliate' and coalesce(fd.provider,'')=coalesce(ap.partner_key,'') and coalesce(fd.target,'')=coalesce(al.affiliate_url,'')
    ))
  union all
  select 'manual',null,'manual','manual_fallback',null,true,0,0,0,true,1::numeric,now()
 ), ranked as (
  select *,base_rank+provider_intelligence+confidence_score as total_score from route_candidates
 )
 select * into v_choice from ranked order by total_score desc,base_rank desc,is_official desc,confidence desc,discovered_at desc limit 1;
 v_runtime:=public.luvia_booking_provider_runtime_snapshot(v_choice.provider);
 return jsonb_build_object('bookingId',b.id,'channel',v_choice.channel,'provider',v_choice.provider,'target',v_choice.target,'sourceType',v_choice.source_type,'sourceId',v_choice.source_id,'routeRank',v_choice.total_score,'baseRank',v_choice.base_rank,'providerIntelligence',v_choice.provider_intelligence,'confidenceScore',v_choice.confidence_score,'runtimeHealth',v_runtime,'requiresUserAction',v_choice.requires_user_action,'excludeFailed',p_exclude_failed,'policy','user_interest_first','decisionMode','runtime_adaptive_failover','commercialWeightCap',8,'commercialCanConfirmReservation',false,'preservesBookingIdentity',true);
end $$;
revoke all on function public.luvia_booking_route_preview(uuid,boolean) from public;
grant execute on function public.luvia_booking_route_preview(uuid,boolean) to authenticated,service_role;

-- Decision replay is read-only. It compares stored evidence with what the current runtime would select now.
create or replace function public.luvia_booking_replay_route_decision(p_decision_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare d public.booking_route_decisions;b public.bookings;v_preview jsonb;
begin
 select * into d from public.booking_route_decisions where id=p_decision_id;
 if not found then raise exception 'ROUTE_DECISION_NOT_FOUND'; end if;
 select * into b from public.bookings where id=d.booking_id;
 if auth.uid() is not null and not public.luvia_booking_is_trip_member(b.trip_id) then raise exception 'BOOKING_FORBIDDEN'; end if;
 v_preview:=public.luvia_booking_route_preview(b.id,false);
 return jsonb_build_object(
  'decisionId',d.id,'bookingId',d.booking_id,'replayedAt',now(),'readOnly',true,
  'stored',jsonb_build_object('channel',d.channel,'provider',d.provider,'target',d.target,'routeRank',d.route_rank,'reason',d.reason,'decision',d.decision),
  'current',v_preview,
  'sameRoute',d.channel=coalesce(v_preview->>'channel','') and coalesce(d.provider,'')=coalesce(v_preview->>'provider','') and coalesce(d.target,'')=coalesce(v_preview->>'target',''),
  'reservationStatusChanged',false
 );
end $$;
revoke all on function public.luvia_booking_replay_route_decision(uuid) from public;
grant execute on function public.luvia_booking_replay_route_decision(uuid) to authenticated,service_role;

-- Safe automatic failover. Only a failed attempt in fallback_required may advance.
-- Unknown provider outcome / reconciliation-required mutations block failover to avoid duplicate reservations.
create or replace function public.luvia_booking_failover_route(
 p_booking_id uuid,
 p_failed_attempt_id uuid,
 p_idempotency_key text,
 p_max_failovers integer default 4,
 p_evidence jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
 b public.bookings;s public.booking_route_state;a public.booking_route_attempts;fd public.booking_route_decisions;nd public.booking_route_decisions;fe public.booking_route_failover_events;
 v_preview jsonb;v_count integer:=0;v_uncertain integer:=0;v_key text:=trim(coalesce(p_idempotency_key,''));v_max integer:=greatest(0,least(10,coalesce(p_max_failovers,4)));v_action text;v_reason text;
begin
 if v_key='' then raise exception 'FAILOVER_IDEMPOTENCY_KEY_REQUIRED'; end if;
 select * into fe from public.booking_route_failover_events where idempotency_key=v_key;
 if found then return jsonb_build_object('duplicate',true,'failoverEventId',fe.id,'bookingId',fe.booking_id,'fromDecisionId',fe.from_decision_id,'toDecisionId',fe.to_decision_id,'action',fe.action,'reason',fe.reason,'reservationStatusChanged',false); end if;

 select * into b from public.bookings where id=p_booking_id for update;
 if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
 select * into s from public.booking_route_state where booking_id=b.id for update;
 select * into a from public.booking_route_attempts where id=p_failed_attempt_id and booking_id=b.id for update;
 if not found then raise exception 'ROUTE_ATTEMPT_NOT_FOUND'; end if;
 select * into fd from public.booking_route_decisions where id=a.decision_id;
 if a.status<>'failed' or coalesce(s.state,'')<>'fallback_required' or s.current_attempt_id<>a.id then raise exception 'FAILOVER_NOT_REQUIRED'; end if;

 if b.status in ('confirmed','cancelled') then
  v_action:='blocked_terminal';v_reason:='BOOKING_TERMINAL';
  insert into public.booking_route_failover_events(booking_id,from_decision_id,from_attempt_id,action,reason,error_class,idempotency_key,evidence)
  values(b.id,fd.id,a.id,v_action,v_reason,a.error_class,v_key,coalesce(p_evidence,'{}'::jsonb)) returning * into fe;
  return jsonb_build_object('duplicate',false,'failoverEventId',fe.id,'action',v_action,'reason',v_reason,'reservationStatusChanged',false);
 end if;

 -- Dynamic guard keeps migration compatible while still protecting production booking_mutations when present.
 if to_regclass('public.booking_mutations') is not null then
  execute 'select count(*) from public.booking_mutations where booking_id=$1 and (coalesce(provider_outcome_known,false)=false or coalesce(reconciliation_required,false)=true)' into v_uncertain using b.id;
 end if;
 if v_uncertain>0 then
  v_action:='blocked_reconciliation';v_reason:='RECONCILIATION_REQUIRED';
  update public.booking_route_state set state='fallback_required',last_error=last_error||jsonb_build_object('failoverBlocked',v_reason),updated_at=now() where booking_id=b.id;
  insert into public.booking_route_failover_events(booking_id,from_decision_id,from_attempt_id,action,reason,error_class,idempotency_key,evidence)
  values(b.id,fd.id,a.id,v_action,v_reason,a.error_class,v_key,coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('uncertainMutations',v_uncertain)) returning * into fe;
  insert into public.booking_events(booking_id,trip_id,event_type,payload) values(b.id,b.trip_id,'booking.route.failover.blocked',jsonb_build_object('reason',v_reason,'attemptId',a.id,'decisionId',fd.id,'uncertainMutations',v_uncertain));
  return jsonb_build_object('duplicate',false,'failoverEventId',fe.id,'action',v_action,'reason',v_reason,'uncertainMutations',v_uncertain,'reservationStatusChanged',false);
 end if;

 select count(*) into v_count from public.booking_route_failover_events where booking_id=b.id and action='failed_over';
 if v_count>=v_max then
  update public.booking_route_state set state='exhausted',next_retry_at=null,updated_at=now() where booking_id=b.id;
  v_action:='exhausted';v_reason:='FAILOVER_LIMIT_REACHED';
  insert into public.booking_route_failover_events(booking_id,from_decision_id,from_attempt_id,action,reason,error_class,idempotency_key,evidence)
  values(b.id,fd.id,a.id,v_action,v_reason,a.error_class,v_key,coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('failoverCount',v_count,'maxFailovers',v_max)) returning * into fe;
  return jsonb_build_object('duplicate',false,'failoverEventId',fe.id,'action',v_action,'reason',v_reason,'failoverCount',v_count,'reservationStatusChanged',false);
 end if;

 v_preview:=public.luvia_booking_route_preview(b.id,true);
 insert into public.booking_route_decisions(booking_id,channel,provider,target,source_type,source_id,route_rank,requires_user_action,reason,excluded_channels,decision,policy_version)
 values(b.id,v_preview->>'channel',nullif(v_preview->>'provider',''),nullif(v_preview->>'target',''),v_preview->>'sourceType',nullif(v_preview->>'sourceId','')::uuid,coalesce((v_preview->>'routeRank')::integer,0),coalesce((v_preview->>'requiresUserAction')::boolean,true),'ADAPTIVE_FAILOVER_AFTER_ROUTE_FAILURE','[]'::jsonb,
   jsonb_build_object('policy','user_interest_first','decisionMode','runtime_adaptive_failover','failoverFromDecisionId',fd.id,'failoverFromAttemptId',a.id,'failedRoute',jsonb_build_object('channel',fd.channel,'provider',fd.provider,'target',fd.target),'preview',v_preview,'commercialWeightCap',8,'commercialCanConfirmReservation',false,'preservesBookingIdentity',true),'1.4.0') returning * into nd;

 update public.booking_route_attempts set status='superseded',updated_at=now(),metadata=metadata||jsonb_build_object('supersededByDecisionId',nd.id,'failoverCore','4.75.0') where id=a.id;
 update public.booking_route_state set current_decision_id=nd.id,current_attempt_id=null,state='planned',retry_count=0,last_error=last_error||jsonb_build_object('failedOverFromAttemptId',a.id,'failedOverAt',now()),next_retry_at=null,updated_at=now() where booking_id=b.id;
 update public.bookings set channel=nd.channel,provider=case when nd.channel='manual' then provider else coalesce(nd.provider,provider) end,
  contact=case when nd.channel='email' then contact||jsonb_build_object('email',nd.target) when nd.channel in ('affiliate','external_link') then contact||jsonb_build_object('bookingUrl',nd.target) when nd.channel='api' then contact||jsonb_build_object('apiEndpoint',nd.target) else contact end,
  metadata=metadata||jsonb_build_object('routing',jsonb_build_object('decisionId',nd.id,'channel',nd.channel,'provider',nd.provider,'reason','ADAPTIVE_FAILOVER_AFTER_ROUTE_FAILURE','core','4.75.0')),
  updated_at=now() where id=b.id;

 insert into public.booking_route_failover_events(booking_id,from_decision_id,from_attempt_id,to_decision_id,action,reason,error_class,idempotency_key,evidence)
 values(b.id,fd.id,a.id,nd.id,'failed_over','FAILED_ROUTE_SUPERSEDED',a.error_class,v_key,coalesce(p_evidence,'{}'::jsonb)||jsonb_build_object('fromChannel',fd.channel,'toChannel',nd.channel,'fromProvider',fd.provider,'toProvider',nd.provider,'preview',v_preview)) returning * into fe;
 insert into public.booking_events(booking_id,trip_id,event_type,payload) values(b.id,b.trip_id,'booking.route.failed_over',jsonb_build_object('failoverEventId',fe.id,'fromDecisionId',fd.id,'fromAttemptId',a.id,'toDecisionId',nd.id,'fromChannel',fd.channel,'toChannel',nd.channel,'reason',fe.reason,'reservationStatusChanged',false));
 return jsonb_build_object('duplicate',false,'failoverEventId',fe.id,'bookingId',b.id,'fromDecisionId',fd.id,'fromAttemptId',a.id,'toDecisionId',nd.id,'action','failed_over','reason',fe.reason,'channel',nd.channel,'provider',nd.provider,'target',nd.target,'requiresUserAction',nd.requires_user_action,'preservesBookingIdentity',true,'reservationStatusChanged',false);
end $$;
revoke all on function public.luvia_booking_failover_route(uuid,uuid,text,integer,jsonb) from public;
grant execute on function public.luvia_booking_failover_route(uuid,uuid,text,integer,jsonb) to service_role;

create or replace view public.booking_route_failover_runtime_v1 with (security_invoker=true) as
select f.id as failover_event_id,f.booking_id,b.trip_id,f.created_at,f.action,f.reason,f.error_class,f.idempotency_key,
 f.from_decision_id,fd.channel as from_channel,fd.provider as from_provider,fd.target as from_target,
 f.from_attempt_id,fa.attempt_no as from_attempt_no,fa.status as from_attempt_status,
 f.to_decision_id,td.channel as to_channel,td.provider as to_provider,td.target as to_target,
 s.state as orchestration_state,s.current_decision_id,s.current_attempt_id,s.retry_count,s.next_retry_at,
 b.status as booking_status,false as booking_status_changed_by_failover,f.evidence
from public.booking_route_failover_events f
join public.bookings b on b.id=f.booking_id
left join public.booking_route_decisions fd on fd.id=f.from_decision_id
left join public.booking_route_attempts fa on fa.id=f.from_attempt_id
left join public.booking_route_decisions td on td.id=f.to_decision_id
left join public.booking_route_state s on s.booking_id=f.booking_id;
grant select on public.booking_route_failover_runtime_v1 to authenticated,service_role;

create or replace function public.luvia_booking_orchestration_policy_snapshot()
returns jsonb language sql stable as $$
 select jsonb_build_object(
  'core','4.75.0','build','13.75.0','policy','user_interest_first','decisionMode','runtime_adaptive_failover',
  'routeOrder',jsonb_build_array('api','external_link','affiliate','email','manual'),
  'routeRanks',jsonb_build_object('api',500,'external_link',350,'affiliate',300,'email',200,'manual',0),
  'runtimeHealthAdjustments',jsonb_build_object('healthy',20,'ready',10,'unknown',-220,'degraded',-300,'unavailable',-500),
  'probeFreshnessSeconds',900,'commercialWeightCap',8,'commercialCanConfirmReservation',false,'commissionCanConfirmReservation',false,
  'failoverPolicy',jsonb_build_object('maxAutomaticRetries',2,'maxAutomaticFailovers',4,'requiresFailedAttempt',true,'blocksOnUnknownProviderOutcome',true,'preservesBookingIdentity',true,'failedRouteSignatureExcluded',true,'decisionReplayReadOnly',true)
 )
$$;
grant execute on function public.luvia_booking_orchestration_policy_snapshot() to authenticated,service_role;

insert into public.booking_health_checks(check_key,status,details,checked_at)
values('booking_orchestration_v4_75','ok',public.luvia_booking_orchestration_policy_snapshot()||jsonb_build_object('adaptiveFailover',true,'decisionReplay',true,'retryVsFailoverSeparated',true,'reconciliationGuard',true,'failoverAuditTimeline',true,'reservationTruthSeparated',true),now())
on conflict(check_key) do update set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

comment on table public.booking_route_failover_events is 'Audit-only Booking Core failover timeline. Failover preserves booking identity and never confirms reservation truth.';
comment on function public.luvia_booking_failover_route(uuid,uuid,text,integer,jsonb) is 'Advances only after failed/fallback_required route attempt. Blocks when provider outcome is unknown or reconciliation is required, preventing blind duplicate booking attempts.';
comment on function public.luvia_booking_replay_route_decision(uuid) is 'Read-only replay of a stored route decision against current runtime conditions; does not mutate booking or reservation truth.';

commit;
