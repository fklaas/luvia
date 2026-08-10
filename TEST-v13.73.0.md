# Testplan v13.73.0

## Lokal
`node tests/v13.73.0-booking-decision-evidence-diagnostics-integrity.test.cjs`
Erwartung: `LUVIA_V13_73_0_BOOKING_DECISION_EVIDENCE_DIAGNOSTICS_INTEGRITY_OK`

## Runtime SQL
`SMOKE-v13.73.0.sql`
Erwartung:
- Policy Snapshot Core 4.73.0 / Build 13.73.0
- Rank 500 / 350 / 300 / 200 / 0
- Decision Runtime View queryable
- Commercial Weight <= 8
- Commercial kann Reservation nicht bestätigen
- Health Marker `booking_orchestration_v4_73 = ok`

## Developer Console
1. Booking Core öffnen.
2. Foundation muss 3/3 `ready` sein.
3. Gesamtstatus nur bei 5/5 Teilbereichen `ready` = Gesund.
4. Route Order muss `api → external_link → affiliate → email → manual` anzeigen.
5. `Booking Core testen`: alle lokalen Checks grün.
6. `Backend-Readiness prüfen`: `remote.skipped` darf dann nicht true sein; Summary = ready.
