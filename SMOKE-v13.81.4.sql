-- Luvia v13.81.4 READ-ONLY Production Smoke
-- Run in Supabase SQL Editor. This file performs NO writes.
-- Regression booking: Green Farmer's

-- 1) Canonical booking truth / current contact
select
  id,
  trip_id,
  title,
  booking_type,
  status,
  channel,
  provider,
  contact,
  updated_at
from public.bookings
where id='046bcb5c-0942-48f7-b8e1-292eb4de60c7';

-- 2) Verified discovery candidates, newest first
select
  id,
  booking_id,
  discovery_run_id,
  kind,
  channel,
  provider,
  contact_value,
  source_url,
  is_public,
  is_official,
  verification_status,
  auto_usable,
  confidence,
  evidence,
  metadata,
  last_verified_at,
  discovered_at
from public.booking_contact_candidates
where booking_id='046bcb5c-0942-48f7-b8e1-292eb4de60c7'
order by discovered_at desc;

-- 3) Discovery runs / fetch-resolution result
select
  id,
  status,
  resolver_version,
  source_count,
  result,
  error,
  started_at,
  finished_at
from public.booking_discovery_runs
where booking_id='046bcb5c-0942-48f7-b8e1-292eb4de60c7'
order by started_at desc
limit 10;

-- 4) Email thread. Before bootstrap this may return zero rows.
select
  id,
  booking_id,
  trip_id,
  transport_provider,
  reply_alias,
  state,
  last_outbound_message_id,
  last_inbound_message_id,
  last_activity_at,
  created_at,
  updated_at
from public.booking_email_threads
where booking_id='046bcb5c-0942-48f7-b8e1-292eb4de60c7';

-- 5) Messages / correlation. After a bootstrap send expect outbound_mutation_thread_bootstrap.
select
  id,
  booking_id,
  email_thread_id,
  direction,
  channel,
  transport_provider,
  sender,
  recipient,
  intended_recipient,
  actual_recipient,
  subject,
  delivery_status,
  provider_message_id,
  correlation_method,
  idempotency_key,
  metadata,
  created_at
from public.booking_messages
where booking_id='046bcb5c-0942-48f7-b8e1-292eb4de60c7'
order by created_at desc
limit 30;

-- 6) Delivery evidence. Webhook delivery can arrive after message creation.
select
  id,
  booking_id,
  message_id,
  provider,
  provider_message_id,
  provider_event_id,
  event_type,
  delivery_state,
  evidence,
  occurred_at,
  received_at
from public.booking_email_delivery_events
where booking_id='046bcb5c-0942-48f7-b8e1-292eb4de60c7'
order by received_at desc
limit 30;

-- 7) Mutation lifecycle/audit. Verify pending/unknown provider outcome is preserved where applicable.
select
  id,
  booking_id,
  trip_id,
  provider_id,
  state,
  expected_state,
  provider_status,
  luvia_status,
  mutation_lifecycle_state,
  reconciliation_required,
  provider_outcome_known,
  last_lifecycle_source,
  last_lifecycle_at,
  evidence,
  finished_at
from public.booking_mutations
where booking_id='046bcb5c-0942-48f7-b8e1-292eb4de60c7'
order by coalesce(last_lifecycle_at,finished_at) desc nulls last
limit 30;

-- 8) Status provenance. A send must not manufacture a confirmed/cancelled provider signal.
select
  id,
  booking_id,
  source,
  provider_id,
  provider_reference,
  provider_status,
  proposed_luvia_status,
  confidence,
  evidence,
  occurred_at,
  received_at
from public.booking_status_signals
where booking_id='046bcb5c-0942-48f7-b8e1-292eb4de60c7'
order by received_at desc
limit 30;

-- 9) Booking audit/event truth
select
  id,
  booking_id,
  trip_id,
  event_type,
  payload,
  created_at
from public.booking_events
where booking_id='046bcb5c-0942-48f7-b8e1-292eb4de60c7'
order by created_at desc
limit 50;
