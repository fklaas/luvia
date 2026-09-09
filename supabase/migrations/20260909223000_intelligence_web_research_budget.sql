-- Additive Intelligence-only telemetry and bounded Integration research.
alter table public.intelligence_trip_plan_jobs drop constraint if exists intelligence_trip_plan_jobs_capability_check;
alter table public.intelligence_trip_plan_jobs add constraint intelligence_trip_plan_jobs_capability_check
  check (capability in ('planning.dialogue', 'trip.compose', 'trip.compose-day-repair', 'trip.audit', 'discovery.web-research'));

alter table public.ai_usage_events
  add column if not exists web_search_calls integer not null default 0 check (web_search_calls >= 0),
  add column if not exists web_tool_cost_usd numeric(12,6) not null default 0 check (web_tool_cost_usd >= 0),
  add column if not exists web_usage_known boolean not null default true;

comment on column public.ai_usage_events.web_tool_cost_usd is
  'Estimated web tool fee only, excluding model tokens. Not an invoice; web_usage_known=false means interrupted transport may have incurred unobserved charges.';

create unique index if not exists intelligence_web_research_one_per_workflow_idx
  on public.intelligence_trip_plan_jobs (workflow_id)
  where capability = 'discovery.web-research';

create or replace function public.intelligence_guard_web_research_budget()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare day_start timestamptz := date_trunc('day', now() at time zone 'UTC') at time zone 'UTC';
begin
  if new.capability <> 'discovery.web-research' then return new; end if;
  if new.attempt_count > 1 or (tg_op = 'UPDATE' and old.status = 'failed' and new.status in ('queued','running')) then
    raise exception 'WEB_RESEARCH_RETRY_FORBIDDEN' using errcode = 'P0001';
  end if;
  if tg_op <> 'INSERT' then return new; end if;
  -- Serialize the bounded global lane, including requests from different isolates.
  perform pg_advisory_xact_lock(hashtextextended('luvia:intelligence:web-research-budget', 0));
  -- Identical concurrent starts reach the unique key and reuse its existing job.
  if exists (select 1 from public.intelligence_trip_plan_jobs where workflow_id=new.workflow_id and capability=new.capability) then return new; end if;
  if (select count(*) from public.intelligence_trip_plan_jobs where capability=new.capability and created_at >= day_start) >= 100
    or (select count(*) from public.intelligence_trip_plan_jobs where capability=new.capability and user_id=new.user_id and created_at >= day_start) >= 5 then
    raise exception 'WEB_RESEARCH_DAILY_BUDGET_EXHAUSTED' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function public.intelligence_guard_web_research_budget() from public, anon, authenticated;
drop trigger if exists intelligence_web_research_budget on public.intelligence_trip_plan_jobs;
create trigger intelligence_web_research_budget before insert or update on public.intelligence_trip_plan_jobs
  for each row execute function public.intelligence_guard_web_research_budget();
