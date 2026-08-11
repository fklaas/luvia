# Runtime test · v13.74.0

Expected SQL smoke:
- policy snapshot core/build = 4.74.0 / 13.74.0
- health adjustments = healthy 20, ready 10, unknown -220, degraded -300, unavailable -500
- provider runtime health rows are readable
- `commercial_signal_can_confirm_reservation = false`
- `booking_orchestration_v4_74 = ok`

Expected Developer Console:
- Booking Core healthy / 5 of 5 groups ready
- decision mode `runtime-adaptive`
- `Degraded Direct fällt zurück = Ja`
- Backend Readiness = ready and runtime health rows > 0
- local assertions include degraded direct fallback, stale probe degradation and healthy direct recovery
