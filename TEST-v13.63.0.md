# Test Plan v13.63.0 / Core 4.63.0

Nach Deployment schrittweise testen.

1. Schema: neue Capability-Spalten, beide Audit-Tabellen und beide Readiness-Views prüfen.
2. Capability Matrix: Zenchef Modify=true; OpenTable/SevenRooms/Resy Cancel=true; keine erfundenen Quandoo/TheFork-Mutationsfähigkeiten.
3. Browser Global: `window.LuviaBookingReservationMutation` und Methoden `modify`, `cancel`, `readiness`.
4. Reference Guard: Booking ohne Provider Reservation Reference muss kontrolliert mit `PROVIDER_RESERVATION_REFERENCE_REQUIRED` blockieren.
5. Modify Expected State: echte Testbuchung mit Provider Reference, aber ohne Partnerzugang → erwarteter Readiness-Block, kein Provider-Fake-Erfolg.
6. Modify Audit: Request vorhanden, `state=blocked`, `expected_state=true`, keine lokale Statusänderung.
7. Cancel Expected State: analog, kein lokales `cancelled`.
8. Cancel Audit: Request vorhanden, Reservation Reference bleibt erhalten und Bookingstatus unverändert.
9. Double Submit: identischer in-progress Request wird mit `RESERVATION_MUTATION_IN_PROGRESS` blockiert.
10. Ambiguous retry safety: timeout/failed Request mit gleicher Idempotency darf nicht blind erneut gesendet werden; `RESERVATION_MUTATION_RECONCILIATION_REQUIRED`.
11. Regression: Availability + Create Globals weiterhin vorhanden; Places-Kategorien/Booking-Discovery nicht verändert.

Bei unbekannten Spaltennamen zuerst `information_schema.columns` abfragen; nicht raten.
