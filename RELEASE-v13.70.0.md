# Luvia v13.70.0 / Core 4.70.0

## Conversion Runtime & Commercial Event Ingestion

v13.70.0 productionizes the inbound commercial side of the existing attribution/correlation foundation without changing reservation truth.

### Added

- `booking_commercial_events`: server-only raw commercial event inbox.
- Idempotency by `provider_id + source + external_event_id`.
- Explicit callback verification gate before commercial evidence can be applied.
- Fail-closed partner activation gate: inactive/non-commercial providers cannot create conversion revenue evidence.
- Correlation resolution by canonical `correlation_token`, correlation id, or an already linked booking.
- Pending states for events that arrive before verification, partner activation, or correlation.
- Replay bridge for later verification/correlation resolution.
- Canonical conversion report creation through the existing `luvia_booking_report_conversion` path.
- Existing commission reconciliation reused for commission lifecycle events.
- Defensive booking-status before/after assertion. Commercial processing aborts if reservation status changes.
- Monetization runtime now exposes aggregate commercial-event processing health.

### Safety contract

`commercial event != reservation confirmation`

`conversion != reservation confirmation`

`commission != reservation confirmation`

Commercial callbacks are stored as revenue/attribution evidence only. Provider reservation truth continues to flow through Booking Status Provenance / trusted provider status / trusted email reply sources.

### Not part of this build

- No provider-specific public webhook endpoint.
- No guessed provider commission rates or partner terms.
- No hotel/activity monetization.
- No Booking UX V1 changes.
- No provider-orchestration scoring changes.

Provider-specific adapters will later verify each provider's webhook/postback/API authenticity and feed normalized events into the canonical v13.70 ingestion RPC.
