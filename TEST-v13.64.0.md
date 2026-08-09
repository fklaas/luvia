# Test v13.64.0 / Core 4.64.0

## Ziel
Nachweis, dass Mutation-Lifecycle und Booking-Status getrennt, korreliert und provenance-sicher arbeiten.

## Smoke-Reihenfolge nach Deployment
1. Migration/Spalten/Eventtabelle prüfen.
2. Browser Global `window.LuviaBookingReservationMutationStatus` prüfen.
3. Bestehenden v13.63.1 `PARTNER_REQUIRED`-Guard erneut prüfen; dabei darf kein Lifecycle-Provider-Event entstehen, weil kein Provider-Call stattfand.
4. Lifecycle-RPC mit kontrolliertem Smoke-Request und `system/pending` testen: Request muss `pending`, `reconciliation_required=true`, Booking unverändert bleiben.
5. Kontrolliertes `provider_api/accepted` ohne `proposed_luvia_status`: Lifecycle `accepted`, Booking unverändert.
6. Kontrolliertes Modify-`alternative_proposed`: Lifecycle + Status-Signal prüfen.
7. Kontrolliertes Cancel-`cancelled`: Lifecycle + Status-Provenance + Provider-Reference-State prüfen, ohne direkten Booking-Write.
8. `get()` und `history()` über Browser Runtime prüfen.
9. Idempotenz über identische `source_event_id` prüfen.
10. Regression: Places, Availability, Create, Modify/Cancel Guards.

## Erwartete Sicherheitsregeln
- `accepted` bei Modify bestätigt nicht automatisch die Reservierung.
- `system`-Lifecycle-Events verändern niemals den Booking-Status.
- Timeout/Network-Ambiguität wird `unknown` und reconciliation-pflichtig.
- Booking Status wird ausschließlich via Status-Signal-Core geändert.
