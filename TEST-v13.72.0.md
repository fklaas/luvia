# Testplan v13.72.0

## Automatisiert lokal
`node tests/v13.72.0-booking-intelligence-provider-orchestration-diagnostics.test.cjs`
Erwartung: `LUVIA_V13_72_0_BOOKING_INTELLIGENCE_PROVIDER_ORCHESTRATION_DIAGNOSTICS_OK`

Zusätzliche Adapter Regression:
- `booking-quandoo-adapter-v13.42.0.test.cjs`
- `booking-thefork-adapter-v13.41.0.test.cjs`

Hinweis: historische Tests, die eine alte feste Core-/Build-Version erwarten, sind nach einem legitimen Version-Bump erwartungsgemäß rot und werden nicht als v13.72 Regression gewertet.

## Runtime SQL
`SMOKE-v13.72.0.sql`
Erwartungen:
- Readiness View liefert Provider
- Rank: API 500, External Link 350, Affiliate 300, Email 200, Manual 0
- `max_commercial_score <= 8`
- `commercial_never_confirms_reservation = true`
- Planner wählt bei ausgeschlossener API den verifizierten External-Link-Weg vor Email/Affiliate
- Health Marker `booking_orchestration_v4_72 = ok`

## Developer Console
- eigener Tab `Booking Core`
- Gesamtstatus sichtbar
- sinnvolle Teilbereiche, keine künstliche Core-Zersplitterung
- lokaler Booking-Core-Test grün
- Provider-/Orchestration Snapshot sichtbar
- Safety Policies sichtbar
