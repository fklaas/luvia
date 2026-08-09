# Luvia v13.65.0 / Booking Core 4.65.0

## Reservation Mutation Recovery / Reconciliation / Runtime Completion

Dieser Build schließt den technischen Modify-/Cancel-Runtime-Pfad ab: ambige oder noch offene Provider-Mutationen können jetzt gezielt gefunden, auditiert und über einen reinen Status-Read-Pfad reconciled werden, **ohne die ursprüngliche Mutation erneut zu senden**.

### Neu
- persistente `booking_reservation_mutation_reconciliation_attempts`
- zentrale Queue-View `booking_reservation_mutation_reconciliation_queue_v1`
- Reconciliation-Metadaten an Modify-/Cancel-Requests: Attempt Count, letzter Reconciliation-Zustand/-Fehler, letzter/ nächster Check
- neuer Request-State `reconciled`
- terminale Lifecycle-Events können eine zuvor ambige Mutation automatisch als reconciled abschließen
- neue Edge Function `booking-provider-reservation-reconcile`
- Browser Runtime `window.LuviaBookingReservationRecovery` mit `get()`, `list()`, `reconcile()`, `history()`
- Reconciliation prüft Status-Polling/Webhook-Fähigkeit, Connection, Probe und Status-Return-Readiness
- Provider-Polling nutzt ausschließlich `get_reservation`; `modify`, `cancel` oder `create` werden im Recovery-Pfad niemals erneut ausgelöst
- Polling-Ergebnisse laufen erneut durch `luvia_booking_ingest_reservation_mutation_status(...)` und damit durch Lifecycle + Booking-Provenance
- bereits aufgelöste Requests werden idempotent zurückgegeben und nie wieder mutiert

### Recovery-Strategien
- `polling`: Provider besitzt einen verifizierbaren Status-Read-Pfad
- `await_webhook`: kein Polling, aber Status-Webhook vorhanden
- `manual_review`: kein belastbarer automatischer Rückkanal

### Sicherheitsregeln
- Recovery liest Status; Recovery replayt **niemals** Reservation-Mutationen.
- `unknown`/`pending` bleiben offen, bis ein belastbarer terminaler Provider-Ausgang vorliegt.
- `accepted`, `rejected`, `alternative_proposed`, `cancelled`, `failed` können Reconciliation abschließen.
- Booking-Statusänderungen bleiben ausschließlich Aufgabe des bestehenden Status-Provenance-Cores.
- Nicht verbundene Provider bleiben `PARTNER_REQUIRED`; für Tests wird nichts künstlich aktiviert.

### Nächster regulärer Block
Mit 13.63–13.65 ist der Provider-Reservation-Mutationskern geschlossen. Danach folgt planmäßig v13.66–v13.68 Email Booking V2; Attribution/Commission/Monetarisierung bleibt der besonders wichtige Block v13.69–v13.71.

### Version
- Luvia App: `13.65.0`
- Booking Core: `4.65.0`
