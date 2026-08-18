# PCR – M5.1g Places Domain Trip Contract Adoption

## Objective

M5.1g isolates active Places-domain consumers from direct Trip truth ownership.

The objective is not a Places redesign and not a Timeline refactor. The objective is specifically to move approved read-only active-Trip dependencies behind the canonical Trip Contract v1 boundary.

## Candidate classification

The remaining Trip truth inventory identified multiple Places consumers with direct access to `LuviaTripStore` and/or `LuviaTripContext`.

A dedicated read-only candidate-lock audit reduced the M5.1g scope to exactly eight files:

1. `core/places/place-core.js`
2. `core/places/place-lifecycle-hub.js`
3. `core/places/place-collection-service.js`
4. `core/places/place-command-service.js`
5. `core/places/place-lifecycle-service.js`
6. `core/places/places-final-foundation.js`
7. `core/places/presence-visit-core.js`
8. `core/places/trip-place-data-service.js`

These files consume Trip identity but showed no direct Trip mutation responsibility.

## Previous direct Trip truth leakage

Before M5.1g the eight-file scope contained:

- 7 direct `LuviaTripStore` references
- 7 direct `LuviaTripContext` references
- 0 Trip Contract references

The direct accesses were used to derive active Trip identity for Places behavior.

Domain persistence signals were not treated as Trip ownership. Places services may legitimately persist Places-domain data while still remaining only consumers of Trip identity.

## M5.1g boundary

M5.1g changes only Trip truth acquisition.

It does not transfer:

- Places persistence
- Places lifecycle ownership
- Places collections
- Places commands
- presence/visit ownership
- Trip-place data ownership

into Trip Core.

Trip Core remains the source of canonical Trip truth; Places consumes that truth through the contract.

## Canonical contract adoption

The approved consumers now obtain active Trip truth lazily through:

`window.LuviaTripContractV1 || window.LuviaTripContract`

and `getActiveTrip()`.

Direct access to:

- `window.LuviaTripStore`
- `window.LuviaTripContext`

is removed from the eight-file M5.1g scope.

## Timeline decision

`core/places/timeline-core.js` was deliberately removed from the M5.1g Places slice before implementation.

The product direction for Timeline is cross-domain. Future Timeline events may originate from:

- Places
- photos
- media
- memories
- bookings
- activities
- travel actions
- recommendations
- check-ins
- other journey events

Treating Timeline as an ordinary Places consumer during M5.1g would risk strengthening an outdated domain boundary.

M5.1g therefore leaves Timeline untouched.

A later Journey/Timeline Aggregation slice will separately assess its architectural role and migrate only the Trip identity dependency required by that role.

## Test-first protection

M5.1g was implemented test-first.

The RED test first proved that direct Trip truth access still existed and that Trip Contract adoption was incomplete.

After implementation the same test became GREEN at 4/4.

The test also ensures that the Places slice does not acquire Trip mutation responsibility.

## Safe regression integration

The M5.1g test is added to the controlled M4.3 Safe Regression allowlist.

Safe Regression total increases:

23 -> 24

Measured local result before release preparation:

24 / 24 PASS.

## Guardrail result

Cross-core DB ownership guardrail remains unchanged:

- tracked JS/TS files: 327
- static DB calls: 316
- mapped cross-core debt: 26 / baseline 26
- unmapped DB-object debt: 39 / baseline 39
- dynamic DB calls: 27 / baseline 27

M5.1g therefore introduces no measured guardrail debt increase.

## Release target

Prepared release:

- App 13.82.6
- Core 4.82.6

The release bump is required because active browser runtime assets in the Places execution path changed.

## Deployment impact

No database migration is required.

No Supabase Edge Function change is required.

No secret change is required.

The runtime/static asset release still requires normal integration and production verification after commit/promotion.

## Exit state at release preparation

At this stage:

- candidate lock: PASS
- test-first RED: PASS
- local implementation GREEN: PASS
- M5.1g test: 4/4 PASS
- Safe Regression: 24/24 PASS
- Repository Guardrail: PASS
- Timeline excluded and untouched: PASS
- release target prepared: App 13.82.6 / Core 4.82.6

Not yet complete:

- implementation commit
- push
- integration promotion
- integration/runtime verification
- main promotion
- production deployment
- production runtime verification
- six-stream synchronization
- final M5.1g documentation closeout marker

Therefore:

- M5.1g: **RELEASE PREPARATION**
- M5: **IN PROGRESS**