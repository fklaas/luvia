-- Durable, user-scoped Intelligence work for long-running trip composition.
-- The Edge Function is the only public boundary; browser clients never receive
-- direct table access and completed input is discarded as soon as the result is stored.
begin;

create table if not exists public.intelligence_trip_plan_workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null,
  input_fingerprint text not null,
  status text not null default 'active' check (status in ('active', 'ready_for_review', 'failed', 'confirmed', 'expired')),
  phase text not null default 'understanding',
  phase_state jsonb not null default '{}'::jsonb,
  aggregate_usage jsonb not null default '{"inputTokens":0,"outputTokens":0,"totalTokens":0,"cachedTokens":0,"latencyMs":0,"modelCalls":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  unique (user_id, idempotency_key)
);

create table if not exists public.intelligence_trip_plan_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workflow_id uuid not null references public.intelligence_trip_plan_workflows(id) on delete cascade,
  idempotency_key text not null,
  capability text not null check (capability in ('planning.dialogue', 'trip.compose', 'trip.compose-day-repair', 'trip.audit')),
  tier text not null check (tier in ('fast', 'default', 'deep')),
  input_fingerprint text not null,
  request_payload jsonb,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed')),
  result jsonb,
  meta jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  attempt_count integer not null default 0 check (attempt_count between 0 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  unique (user_id, idempotency_key)
);

create index if not exists intelligence_trip_plan_jobs_user_status_idx
  on public.intelligence_trip_plan_jobs (user_id, status, updated_at desc);

create index if not exists intelligence_trip_plan_jobs_expiry_idx
  on public.intelligence_trip_plan_jobs (expires_at);

alter table public.intelligence_trip_plan_jobs enable row level security;
alter table public.intelligence_trip_plan_jobs force row level security;
alter table public.intelligence_trip_plan_workflows enable row level security;
alter table public.intelligence_trip_plan_workflows force row level security;

revoke all on table public.intelligence_trip_plan_jobs from anon, authenticated;
grant all on table public.intelligence_trip_plan_jobs to service_role;
revoke all on table public.intelligence_trip_plan_workflows from anon, authenticated;
grant all on table public.intelligence_trip_plan_workflows to service_role;

comment on table public.intelligence_trip_plan_jobs is
  'Transient Intelligence-owned state for resumable trip compose, day repair and audit calls. Access is exclusively mediated by luvia-intelligence.';

comment on table public.intelligence_trip_plan_workflows is
  'Transient parent workflow for semantic brief, candidate snapshots, composition, targeted repair and audit checkpoints.';

commit;
