# Luvia v13.63.0 / Booking Core 4.63.0

## Reservation Modify & Cancel Runtime V1

Dieser Build erweitert den produktionsorientierten Restaurant-Reservation-Runtime nach Availability (13.61.x) und Create (13.62) um die erste serverseitig kontrollierte Modify-/Cancel-Schicht.

### Neu
- getrennte Provider-Capabilities `supports_modify_reservation` und `supports_cancel_reservation`
- getrennte Readiness-Views für Modify und Cancel
- getrennte persistente Audit-Tabellen für Modify- und Cancel-Requests
- neue Edge Function `booking-provider-reservation-mutation`
- Browser Runtime `window.LuviaBookingReservationMutation` mit `modify()`, `cancel()` und `readiness()`
- serverseitige Auflösung der Provider-Reservation-Reference; der Browser bestimmt weder Provider noch Reservation Reference
- Provider-Mismatch-, Booking-State- und Reference-Guards
- Idempotency Key + Request Fingerprint + Double-Submit-Schutz
- ambige Timeout-/Network-Ausgänge werden als reconciliation-pflichtig markiert und nicht blind erneut mutiert
- Providerantworten laufen weiterhin über den bestehenden Status-Provenance-Core (`provider_api`)
- `cancelled` wird nicht aufgrund eines lokalen Klicks gesetzt
- Provider-Reference wird erst bei belastbar bestätigtem Cancel auf `cancelled` gesetzt
- Shell-/PWA-Integration inkl. Precache und Cache-Bump

### Capability-Basis
Es werden ausschließlich Actions abgebildet, die im vorhandenen v13.62 Provider-Adapter bereits als Contract vorhanden waren:
- Zenchef: Modify (`update_reservation`)
- OpenTable: Cancel (`cancel_reservation`)
- SevenRooms: Cancel (`cancel_reservation`)
- Resy: Cancel (`cancel_reservation`)

Quandoo und TheFork erhalten bewusst keine erfundene Modify-/Cancel-Fähigkeit. Alle genannten Provider bleiben ohne echten Partnerzugang bzw. aktivierten Live-Transport erwartungsgemäß blockiert.

### Sicherheits-/Lifecycle-Regeln
- keine Provider Reservation Reference → kein Provider Call
- Booking muss per RLS für den Nutzer lesbar sein
- Booking-Provider und Provider-Reference-Provider müssen zusammenpassen
- bereits `cancelled` → keine weitere Mutation
- Mutation nur für vorhandene Provider-Reservierungen in zulässigen Lifecycle-Zuständen
- Expected States bleiben kontrollierte Business-Responses
- Timeout/Netzwerkfehler nach versuchtem Provider-Call werden nicht automatisch retried
- keine Fake-Erfolge, keine Fake-References, kein optimistisches `cancelled`

### Version
- Luvia App: `13.63.0`
- Booking Core: `4.63.0`
