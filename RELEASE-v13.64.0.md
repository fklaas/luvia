# Luvia v13.64.0 / Booking Core 4.64.0

## Reservation Lifecycle Synchronization / Provider Mutation Status Runtime

Dieser Build trennt den technischen Verlauf einer Reservation-Mutation vom fachlichen Booking-Status und synchronisiert beide ausschließlich über den bestehenden Status-Provenance-Core.

### Neu
- persistente `booking_reservation_mutation_status_events` als Mutation-Lifecycle-Eventstream
- Lifecycle-Zustände: `pending`, `accepted`, `rejected`, `alternative_proposed`, `cancelled`, `failed`, `unknown`
- Modify-/Cancel-Auditrequests erhalten zusätzlich `mutation_lifecycle_state`, `reconciliation_required`, `provider_outcome_known`, `last_lifecycle_source`, `last_lifecycle_at`
- zentrale service-role RPC `luvia_booking_ingest_reservation_mutation_status(...)`
- einheitliche Service-View `booking_reservation_mutation_lifecycle_v1`
- neue read-only Edge Function `booking-provider-reservation-mutation-status`
- Browser Runtime `window.LuviaBookingReservationMutationStatus` mit `get()` und `history()`
- Mutation Runtime v1.1.0 schreibt beim tatsächlichen Provider-Call zunächst `pending`, bei Timeout/Netzwerk-Ambiguität `unknown + reconciliation_required`
- belastbare Providerantworten werden als Lifecycle-Event erfasst und nur bei explizitem fachlichem Status über `booking_status_signals` angewendet
- Cancel `cancelled` darf bei vertrauenswürdiger Providerquelle auf Booking `cancelled` gemappt werden
- Modify `accepted` bedeutet ausdrücklich **nicht** automatisch `confirmed`

### Architekturregeln
- Mutation Lifecycle ≠ Booking Status
- Booking-Statusänderungen nur über `luvia_booking_ingest_status_signal`
- keine direkte `bookings.status`-Mutation aus Modify/Cancel
- Provider API/Webhook/Polling bleiben autoritative Quellen; `system` darf Lifecycle dokumentieren, aber keinen Booking-Status anwenden
- idempotente Lifecycle-Events über `(source, source_event_id)`
- Provider-Reference bleibt Korrelationsanker
- ambige Provider-Outcomes bleiben reconciliation-pflichtig

### Vorbereitung v13.65
`pending` und `unknown` markieren jetzt zuverlässig die Requests, die Recovery/Reconciliation benötigen. v13.65 kann diese Fälle gezielt pollend/korrelierend auflösen, ohne Mutationen blind zu wiederholen.

### Version
- Luvia App: `13.64.0`
- Booking Core: `4.64.0`
