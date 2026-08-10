# Test v13.69.0 / Core 4.69.0

## A. Schema/readiness
```sql
select
  provider_id,
  commercial_status,
  monetization_mode,
  tracking_strategy,
  provider_connected,
  commercial_active,
  commercial_signal_can_confirm_reservation
from public.booking_monetization_provider_readiness_v1
where provider_id in ('quandoo','thefork','zenchef','opentable','sevenrooms','resy','tock','email')
order by provider_id;
```
Expected:
- rows exist for all listed providers;
- `commercial_signal_can_confirm_reservation = false` for every row;
- `quandoo` is `agent_attribution / agent_id` but still `partner_required` until a real agreement is activated;
- `email` is `none / none`.

## B. Browser contract
Run in the browser console after login:
```js
window.LuviaKernelVersion
window.LuviaBookingMonetization.diagnostics()
await window.LuviaBooking.monetizationProfiles()
```
Expected:
- build `13.69.0`, core `4.69.0`;
- all commercial-confirmation semantics are `false`;
- provider readiness returns without exposing `commercial_terms` or `evidence`.

## C. Real restaurant handoff
Open a restaurant Place that resolves to an external booking URL and press `Reservieren` once.
Then run:
```sql
select
  h.id as handoff_id,
  h.provider,
  h.venue_name,
  h.metadata->'monetization' as monetization,
  c.id as correlation_id,
  c.correlation_token,
  c.state,
  c.metadata->'monetization' as correlation_monetization
from public.booking_handoff_events h
join public.booking_correlations c on c.handoff_event_id=h.id
order by h.created_at desc
limit 5;
```
Expected:
- newest handoff has exactly one correlation;
- correlation token is set;
- both handoff and correlation contain a monetization snapshot;
- no booking status is changed by the handoff.

## D. Reservation-truth regression
```sql
select source, proposed_luvia_status, resolution_state, resolution_reason
from public.booking_status_signals
where source in ('handoff','affiliate_callback')
order by received_at desc
limit 20;
```
No handoff/affiliate commercial fact may become authoritative reservation confirmation.

## E. Existing Email Booking V2 regression
Re-run the existing v13.68.11 delivery-event replay/idempotency test only if desired; this build does not modify Email Booking V2.
