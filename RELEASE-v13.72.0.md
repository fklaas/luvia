# Luvia v13.72.0 / Core 4.72.0
## Booking Intelligence, Provider Orchestration & Booking Core Diagnostics

### Ziel
Der Booking Core entscheidet Buchungswege nicht mehr primär nach einer starren Channel-Reihenfolge. Die Orchestration berücksichtigt technische/providerbezogene Qualität, bleibt fail-closed und stellt das Nutzerinteresse vor kommerzielle Optimierung. Gleichzeitig wird der gesamte Booking Core erstmals als eigener, zusammenhängender Core in der Developer Console sichtbar und testbar.

### Provider Orchestration
- neues `booking_provider_orchestration_readiness_v1`
- technische Readiness, Availability Readiness, Connection/Probe State und Commercial Readiness in einem sanitisierten Read Model
- `luvia_booking_provider_intelligence_score(...)`
- Route Policy: API > verified external/provider route > affiliate > verified email > manual
- Commercial Score strikt auf 8 Punkte begrenzt
- Commercial Signals können Reservation Truth niemals bestätigen
- Provider-/Channel-Entscheidungen erhalten Policy- und Score-Audit im Decision JSON
- clientseitige `LuviaBookingOrchestration` auf Intelligence Ranking V1 erweitert
- technisch ausgefallene API-Routen können sauber auf einen verifizierten Fallback fallen

### Developer Console / Diagnostics
Der **Booking Core bleibt ein Core**. In der Detailansicht werden nur diagnostisch sinnvolle Teilbereiche dargestellt:
- Foundation
- Reservation Lifecycle
- Email Booking
- Provider & Orchestration
- Commercial / Attribution / Commission

Neu:
- eigener `Booking Core` Tab in der Developer Console
- Gesamtstatus und Build/Core-Version
- Provider Registry / Orchestration Snapshot
- verbindliche Safety Policies
- lokale Booking-Core-Smoke-Tests
- optionaler Backend-Readiness-Test
- neue `LuviaBookingCoreDiagnostics`

### Sicherheitsregeln
- User interest first
- Commercial darf keinen besseren technischen/nutzerfreundlichen Booking-Weg verdrängen
- Commercial/Commission ≠ Reservation Confirmation
- keine Fake-Provider-Aktivierung
- Email bleibt echter verifizierter Fallback
- bestehender Reservation-, Email- und Commercial-Core bleibt erhalten
