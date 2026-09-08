-- A resumed browser must attach to the running semantic step instead of
-- launching a second model call for the same capability and workflow.
begin;

create unique index if not exists intelligence_trip_plan_jobs_one_active_capability_idx
  on public.intelligence_trip_plan_jobs (workflow_id, capability)
  where status in ('queued', 'running');

comment on index public.intelligence_trip_plan_jobs_one_active_capability_idx is
  'Prevents concurrent duplicate model calls for one capability inside a resumable trip workflow.';

commit;
