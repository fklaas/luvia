# Luvia v13.73.0 / Core 4.73.0
## Booking Decision Evidence & Diagnostics Integrity

### Booking Intelligence
- Client- und Server-Route-Policy jetzt identisch: `api → external_link → affiliate → email → manual`.
- Basis-Ranks: API 500, External Link 350, Affiliate 300, Email 200, Manual 0.
- Commercial Weight bleibt strikt auf 8 begrenzt.
- Neue clientseitige Decision Evidence (`explainDecision`) zeigt Gewinner, Score-Breakdown, Alternativen und Score-Abstand.
- Neue DB-View `booking_route_decision_runtime_v1` macht reale Route Decisions, Policy Evidence, Attempt-/Retry-State auditierbar.
- Neue `luvia_booking_orchestration_policy_snapshot()` als serverseitige Policy-Wahrheit.

### Booking Core Diagnostics Fix
- Foundation erkennt die bestehende produktive `window.LuviaBooking` Integration korrekt.
- Gesamtstatus `healthy/ready` gilt nur noch, wenn **alle verpflichtenden Diagnosegruppen UND Checks** bereit sind.
- Ein `incomplete` Teilbereich kann nicht mehr gleichzeitig als „Gesund“ erscheinen.
- Client-/Server-Route-Order wird als eigener Diagnosecheck geprüft.
- Backend-Readiness hat jetzt explizite Zustände `not_checked / ready / failed`; lokaler Test kennzeichnet Remote korrekt als `REMOTE_NOT_REQUESTED`.
- Backend-Test umfasst Provider Connection, Monetization, Orchestration Readiness und Route Decision Runtime.

### Safety
- User interest first.
- Commercial/Commission bestätigen niemals Reservation Truth.
- Keine Fake-Provider-Aktivierung.
- Email bleibt verifizierter Fallback.
