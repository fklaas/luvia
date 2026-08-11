# Runtime Tests v13.75.0

## A. SQL Editor
Run `SMOKE-v13.75.0.sql` as one block.
Expected consolidated row:
- `booking_status = requested`
- `current_channel = email`
- `orchestration_state = planned`
- `failover_rows = 1`
- `decision_rows = 2`
- `attempt_rows = 1`
- `superseded_attempts = 1`
- `failover_to_channel = email`
- `booking_status_changed_by_failover = false`
The duplicate failover response must contain `duplicate=true`.
The failed attempt response must contain `action=fallback_next_route`, not retry.
Decision replay must contain `readOnly=true` and `reservationStatusChanged=false`.

## B. Developer Console
Open `/console.html`, hard refresh, Booking Core:
- Core 4.75.0 / Build 13.75.0
- Gesamtstatus ready / 5 of 5 groups
- Backend Readiness ready
- Decision mode `runtime-adaptive-failover`
- Adaptive Failover active
- Decision Replay active
- Retry != Failover yes
- Security invariants remain active

## C. Browser console
After login and with the Developer Console loaded:
```js
LuviaBookingOrchestration.failoverPolicySnapshot()
```
Expected: `preservesBookingIdentity:true`, `blocksOnUnknownProviderOutcome:true`, `neverConfirmsReservation:true`.

```js
LuviaBookingOrchestration.canFailover({attemptStatus:'failed',state:'fallback_required',providerOutcomeKnown:false,reconciliationRequired:true,bookingStatus:'requested'})
```
Expected: `{allowed:false, reason:'RECONCILIATION_REQUIRED'}`.

```js
LuviaBookingOrchestration.nextAfterFailure({attemptNo:1,maxRetries:2,error:{status:503}})
```
Expected: `retry_same_route`.

```js
LuviaBookingOrchestration.nextAfterFailure({attemptNo:1,maxRetries:2,error:{status:400}})
```
Expected: `fallback_next_route`.

```js
await LuviaBooking.routeFailoverDiagnostics({limit:10})
```
May legitimately return `[]` after the SQL smoke rollback. It must not throw.
