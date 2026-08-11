begin;
select set_config('request.jwt.claim.role','service_role',true);

create temporary table tmp_v1375(k text primary key,v text) on commit drop;
insert into tmp_v1375(k,v) select 'trip_id',id::text from public.trips order by created_at limit 1;

with ins as (
 insert into public.bookings(trip_id,booking_type,status,channel,title,party_size,contact,request,metadata)
 select v::uuid,'restaurant','requested','manual','v13.75 Failover Smoke',2,'{}'::jsonb,'{}'::jsonb,jsonb_build_object('test','v13.75.0') from tmp_v1375 where k='trip_id'
 returning id
) insert into tmp_v1375(k,v) select 'booking_id',id::text from ins;

-- Route A: verified external link (the route that will fail).
with c as (
 insert into public.booking_contact_candidates(booking_id,kind,channel,provider,contact_value,source_url,is_public,is_official,verification_status,confidence,auto_usable,evidence,metadata,last_verified_at)
 select v::uuid,'reservation_link','external_link','smoke-provider','https://example.test/booking','https://example.test',true,true,'verified',0.95,true,'{}','{}',now() from tmp_v1375 where k='booking_id'
 returning id,booking_id
), d as (
 insert into public.booking_route_decisions(booking_id,channel,provider,target,source_type,source_id,route_rank,requires_user_action,reason,decision,policy_version)
 select c.booking_id,'external_link','smoke-provider','https://example.test/booking','contact_candidate',c.id,350,true,'SMOKE_INITIAL_ROUTE',jsonb_build_object('policy','user_interest_first','decisionMode','runtime_adaptive'),'1.3.0' from c
 returning id,booking_id
) insert into tmp_v1375(k,v) select 'decision_id',id::text from d;

insert into public.booking_route_state(booking_id,current_decision_id,state,retry_count,last_error)
select (select v::uuid from tmp_v1375 where k='booking_id'),(select v::uuid from tmp_v1375 where k='decision_id'),'planned',0,'{}';

-- Route B: verified email fallback.
insert into public.booking_contact_candidates(booking_id,kind,channel,provider,contact_value,source_url,is_public,is_official,verification_status,confidence,auto_usable,evidence,metadata,last_verified_at)
select v::uuid,'public_reservation_email','email','email','venue@example.com','https://venue.example.test',true,true,'verified',0.90,true,'{}','{}',now() from tmp_v1375 where k='booking_id';

-- Start and permanently fail route A. Complete must request failover, not retry.
with x as (
 select public.luvia_booking_start_route_attempt((select v::uuid from tmp_v1375 where k='decision_id'),'v1375-attempt-1',jsonb_build_object('test','v13.75.0')) as j
) insert into tmp_v1375(k,v) select 'attempt_id',j->>'attemptId' from x;

select public.luvia_booking_complete_route_attempt((select v::uuid from tmp_v1375 where k='attempt_id'),false,'permanent','SMOKE_PROVIDER_REJECTED','synthetic permanent failure',2,jsonb_build_object('test','v13.75.0')) as failed_attempt;

-- Safe failover must preserve booking identity and choose the email route.
select public.luvia_booking_failover_route(
 (select v::uuid from tmp_v1375 where k='booking_id'),
 (select v::uuid from tmp_v1375 where k='attempt_id'),
 'v1375-failover-1',4,jsonb_build_object('test','v13.75.0')
) as failover_result;

-- Same failover key must be idempotent.
select public.luvia_booking_failover_route(
 (select v::uuid from tmp_v1375 where k='booking_id'),
 (select v::uuid from tmp_v1375 where k='attempt_id'),
 'v1375-failover-1',4,jsonb_build_object('test','v13.75.0 duplicate')
) as duplicate_failover;

-- Decision replay is read-only.
select public.luvia_booking_replay_route_decision((select v::uuid from tmp_v1375 where k='decision_id')) as decision_replay;

-- One consolidated proof row.
select
 b.id as booking_id,
 b.status as booking_status,
 b.channel as current_channel,
 s.state as orchestration_state,
 s.current_decision_id,
 (select count(*) from public.booking_route_failover_events f where f.booking_id=b.id and f.action='failed_over') as failover_rows,
 (select count(*) from public.booking_route_decisions d where d.booking_id=b.id) as decision_rows,
 (select count(*) from public.booking_route_attempts a where a.booking_id=b.id) as attempt_rows,
 (select count(*) from public.booking_route_attempts a where a.booking_id=b.id and a.status='superseded') as superseded_attempts,
 (select to_channel from public.booking_route_failover_runtime_v1 f where f.booking_id=b.id order by created_at desc limit 1) as failover_to_channel,
 (select booking_status_changed_by_failover from public.booking_route_failover_runtime_v1 f where f.booking_id=b.id order by created_at desc limit 1) as booking_status_changed_by_failover
from public.bookings b join public.booking_route_state s on s.booking_id=b.id
where b.id=(select v::uuid from tmp_v1375 where k='booking_id');

select public.luvia_booking_orchestration_policy_snapshot() as policy_snapshot;
select check_key,status,details,checked_at from public.booking_health_checks where check_key='booking_orchestration_v4_75';
rollback;
