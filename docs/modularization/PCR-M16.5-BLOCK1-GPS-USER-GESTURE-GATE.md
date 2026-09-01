# PCR M16.5 Block 1 — GPS User-Gesture Gate

**PCR ID:** `PCR-M16.5-BLOCK1-GPS-USER-GESTURE-GATE`

**Requester stream:** Integration / Places

**Owning reviewer:** Platform

**Status:** implemented locally; Integration release pending

## Problem

The public Integration console reproducibly reports that geolocation was
requested without a user gesture. Two boot paths could initiate the request:
`presence-visit-core.init()` resumed a saved preference after 500 ms, while
`global-location-bootstrap` scheduled location reads on boot, auth, trip,
session and visibility events. A saved preference is durable consent state,
but it is not a fresh browser user gesture and must not silently trigger a
device permission request.

## Requested shared change

- `core/places/presence-visit-core.js` hydrates visit state and permission
  diagnostics but never starts GPS from `init()`.
- A previously enabled preference projects `resumeRequired` and emits a
  sanitized `luvia:gps-resume-required` status without coordinates.
- `core/location/global-location-bootstrap.js` removes every automatic boot,
  auth, trip, session and visibility trigger.
- Its public `start()` fails closed unless called with the explicit
  `{userGesture:true}` context.

No second location owner, persistence store or device adapter is introduced.
The existing `LocationPort`, `PermissionPort` and Places visit owner remain
canonical.

## Ownership and contract impact

- contract IDs/versions: no public contract major-version change;
- domains/streams affected: Platform and Places;
- DB views/functions/migrations affected: none;
- Edge Functions affected: none;
- UI/design/navigation/runtime affected: boot-time location lifecycle only.

## Backward compatibility

Explicit settings and refresh controls continue to use the existing
`LuviaPresenceVisitCore` commands. Confirmed visit, pending confirmation,
Journey projection and persisted preference semantics are unchanged. A saved
enabled preference now requires a new visible user gesture after reload before
device tracking resumes.

## Test plan

- focused VM regression proving that init/boot/reload never calls
  `getCurrent`, `watch` or `setGlobalEnabled`;
- explicit `start({userGesture:true})` path remains callable;
- existing GPS pending-confirmation → reload → Timeline boundary remains green;
- M6 Places native-readiness and NFR-0 guards remain green;
- visible local reload verifies zero browser geolocation-policy violations;
- public Integration verification follows only in a coherent immutable client
  release.

## Rollout / feature gate

No feature flag is required. This is a fail-closed privacy correction. Existing
GPS behavior remains available behind the existing visible user controls.

## Rollback

Redeploy the immediately preceding immutable Integration client version. No
data compensation, migration rollback, Edge Function rollback or secret change
is required.

## Approval

- Platform owner: integration PCR boundary recorded
- impacted domain owners: Places
- approved commit/PR: pending coherent Integration commit
