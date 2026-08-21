# Luvia Architecture Migration State

Date: 2026-08-19

## Parallel Development Foundation

M4: COMPLETE.

### M4.5 additive stream expansion

M4.5.1 Eight-Stream Topology Design Audit: COMPLETE.

M4.5.2 Experience + Intelligence Branch / Worktree Foundation: COMPLETE.

Eight active streams now exist locally and remotely.

M4.5.3 Core / Stream Registry + AGENTS + Architecture Map: IN PROGRESS.

M4.5.4 Ownership & Cross-Core Guardrail Extension: PENDING.

M4.5.5 8/8 Regression / Integration / Sync Proof: PENDING.

This additive M4.5 work does not invalidate the completed M4 milestone.

## M5 Trip Core Isolation

M5: IN PROGRESS.

M5.1a through M5.1k: COMPLETE.

Current shared baseline marker entering M4.5.3:

`e1661dfd013a5fd85369dd082dc2ce45d68848e7`

Current runtime release before M4.5.3:

App 13.82.6 / Core 4.82.6.

### M5.1h

Proposed next slice:

Discovery Modules Trip Contract Adoption.

The previous scope-lock audit did not pass because the audit expected 23 physical lines while the measured source contains 23 direct legacy token occurrences across 19 physical source lines.

That failed audit performed no file mutation and the repository remained clean.

M5.1h is COMPLETE.

The corrected scope-lock audit subsequently passed with the measured baseline of 23 direct legacy token occurrences across 19 physical source lines.

The seven scope-locked Discovery modules were migrated to Trip Contract v1 without extending the public Trip Contract merely to mirror LegacyTripContext. Timeline remained reserved and unchanged.

Implementation commit 69f1b7da691f9a1a0212d75748477018f0257408 was promoted Consumer -> Integration -> Main.

Integration Runtime Proof: exact committed Git blobs live for all seven Discovery modules.

Production Runtime Proof: TARGET_ALREADY_LIVE on App 13.82.7 / Core 4.82.7, with all seven Discovery modules matching the committed Git blobs exactly. No additional manual Wrangler deployment was required.

Historical protocol-evidence limitation: immediately before RED-test creation, immediately before the initial runtime mutation and immediately before the first Safe-Runner release mutation, live remote SHA and divergence were not captured. Later verification cannot retroactively prove those three mutation moments. Repository history was not reset or rewritten to manufacture evidence. The later release implementation commit did receive the complete immediate pre-mutation live-remote/divergence gate.

### M5.1i

M5.1i is COMPLETE.

App 13.82.8 / Core 4.82.8.

The approved active Diagnostics slice was migrated from direct legacy Trip Store / Trip Context reads to the canonical Trip Contract v1 boundary without extending the Trip Contract and without moving Timeline / Journey ownership.

Runtime / release implementation commit: `90f780188481365081d91f0ca3dd0a474f15bd50`.

Two minimal Platform lifecycle-support commits were subsequently required for deployed browser-origin CORS:

- Integration Preview CORS support: `4df3224dd4bb743eda09426b69f6f9fbd76a9806`
- Production Worker CORS support: `dee95f0dd89a26a029c5ba8840a9fecdc5ca076a`

Main, Integration and Platform reached the final accepted source marker `dee95f0dd89a26a029c5ba8840a9fecdc5ca076a`.

Production static provenance: 6 / 6 exact assets on App 13.82.8 / Core 4.82.8.

Production static classification: TARGET_ALREADY_LIVE. No additional manual Wrangler deployment was required.

Production Browser Runtime CORS Revalidation: 15 / 15 PASS.

Final Production Edge state:

- `luvia-gateway v111` – ACTIVE
- `luvia-intelligence v25` – ACTIVE
- Gateway CORS matrix: 4 / 4 PASS
- Intelligence CORS matrix: 4 / 4 PASS
- combined CORS matrix: 8 / 8 PASS
- authoritative Production Worker origin accepted by both Functions

No database migration or secret mutation was performed.

Timeline / Journey remained reserved and unchanged.

Historical protocol-evidence limitation remains retained for M5.1i. Later successful gates do not retroactively manufacture immediate live-remote/divergence evidence for earlier mutation moments where that evidence was not captured. No reset or history rewrite was performed to create retrospective proof.

The future M5.1i closeout-marker commit and subsequent eight-stream repository synchronization are not pre-claimed by this migration-state update.

M5 remains IN PROGRESS.

### M5.1j

M5.1j is COMPLETE.

App 13.82.9 / Core 4.82.9.

Profile Foundation was migrated from direct private LuviaTripStore access to the canonical public Trip Contract v1 boundary.

The migrated public reads are listTrips(), getActiveTrip() and getContext().

The migrated public activation command is selectActiveTrip(id).

No Trip Contract read or command extension was required. The private owner-internal store bridge remains behind the public Trip Contract command.

Runtime / release implementation commit: a76fae471f368f33a5e68c396f9e1778c1004e18.

The implementation commit was promoted Consumer -> Integration -> Main by controlled fast-forward and normal non-force pushes.

Consumer, Integration and Main reached the accepted source marker a76fae471f368f33a5e68c396f9e1778c1004e18.

Safe Regression: 30 / 30 PASS.

M5.1j targeted regression, M3.1 Trip Contract regression, release consistency and the controlled ownership / boundary / registry guardrails passed.

Integration Preview current static provenance: 6 / 6 exact assets on App 13.82.9 / Core 4.82.9.

Production static provenance: 6 / 6 exact assets on App 13.82.9 / Core 4.82.9.

Production index cache identity: 214 / 214 current App 13.82.9 tokens and zero stale 13.82.8 tokens.

Production Service Worker: luvia-shell-v13.82.9.

Production force-update identity: appv=13.82.9.

Static Asset Hardening smoke: PASS.

No manual Wrangler deployment was performed.

No Supabase deployment, database migration, Edge Function deployment or secret mutation was performed.

Timeline / Journey remained reserved and unchanged.

The current Integration Preview and Production provenance checks were executed after Main promotion. A pre-Main Preview HTTP gate is not retroactively claimed.

Historical protocol-evidence limitation remains retained. Later verification does not retroactively create live-remote or divergence evidence for earlier mutation moments where that evidence was not captured. No reset, history rewrite or destructive operation was performed to manufacture retrospective proof.

The future M5.1j closeout-marker commit and subsequent eight-stream repository synchronization are not pre-claimed by this migration-state update.

M5 remains IN PROGRESS.

### M5.1k

M5.1k is COMPLETE.

App 13.82.10 / Core 4.82.10.

Recommendations Trip Contract Adoption migrated the six approved Recommendations runtime services away from direct private LuviaTripStore and LuviaTripContext reads to the existing public Trip Contract v1 boundary.

Migrated runtime files:

- core/recommendations/cross-module-recommendation-service.js
- core/recommendations/live-day-companion-service.js
- core/recommendations/recommendation-service.js
- core/recommendations/restaurant-intelligence-service.js
- core/recommendations/schedule-intelligence-service.js
- core/recommendations/today-intelligence-service.js

Private LuviaTripStore reads changed from 6 to 0.

Direct LuviaTripContext dependencies changed from 6 to 0.

Public Trip Contract adoption changed from 0 / 6 to 6 / 6.

The existing getActiveTrip() and getContext() public reads were sufficient. No Trip Contract read extension and no Trip Contract command extension were required.

No private Trip Store mutation was introduced.

Runtime / release implementation commit: 792d049d27b896a838e0ce6e8b34329c87ca20f6.

The implementation commit was promoted feature/intelligence-core -> integration -> main by controlled fast-forward and normal non-force pushes.

Safe Regression: 31 / 31 PASS.

M5.1k targeted regression, M5.1j regression, M3.1 Trip Contract regression, release consistency and the controlled ownership / boundary / registry guardrails passed.

Integration Preview pre-Main static provenance: 11 / 11 exact assets on App 13.82.10 / Core 4.82.10.

The Integration Preview provenance gate was completed before Main mutation.

Production static provenance: 11 / 11 exact assets on App 13.82.10 / Core 4.82.10.

Production index cache identity: 214 / 214 current App 13.82.10 tokens and zero stale 13.82.9 tokens.

Production Service Worker: luvia-shell-v13.82.10.

Production force-update appv: 13.82.10.

Static Asset Hardening remained active. CURRENT-BUILD.md, the M5.1k targeted test and the Safe Regression runner were not exposed as direct static repository source.

No manual Cloudflare / Wrangler deployment was performed.

No Supabase deployment, database migration, Edge Function deployment or secret mutation was performed.

Booking, Media, Preferences, Theme Service, Runtime lifecycle, Trip Context bridge, legacy destination-service and Timeline / Journey remained outside M5.1k.

Timeline / Journey remained reserved and unchanged.

The earlier failed curl Preview harness attempts are retained as failed test-harness executions and are not counted as accepted Preview evidence. The accepted pre-Main Preview and Production proofs used the .NET HttpClient harness.

Historical protocol-evidence limitation remains retained. Later verification cannot retroactively create live-remote or divergence evidence for earlier mutation moments where that evidence was not captured. No reset, clean, amend, force operation or history rewrite was performed to manufacture retrospective proof.

pre-Main Preview gate retroactively claimed = NO.

M5.1k establishes logical Recommendations isolation only. Physical relocation of domain implementation into the final core-oriented repository topology remains pending as part of the larger M5 completion and exit-gate work.

The future M5.1k closeout-marker commit and subsequent eight-stream repository synchronization are not pre-claimed by this migration-state update.

M5 remains IN PROGRESS.
### M5.2

M5.2 runtime and Production acceptance is COMPLETE.

App 13.82.11 / Core 4.82.11.

Remaining Trip Consumer Isolation migrated the seven approved Platform and Booking runtime consumers to the public Trip Contract v1 boundary.

Platform consumers migrated: 5 / 5.

Booking consumers migrated: 2 / 2.

Total approved consumer set: 7 / 7.

Direct private LuviaTripStore references after migration: 0.

Direct LuviaTripContext references after migration: 0.

The existing getActiveTrip() public read was sufficient.

No Trip Contract read extension and no Trip Contract command extension were required.

No private Trip mutation and no Trip database mutation were introduced.

Platform implementation commit: 221bceb89f2ba927f58e7e076c1769169115373c.

Booking and final runtime target: a2098a1188b40edbe60573322c6eec2d936ad28a.

Safe Regression: 32 / 32 PASS.

Integration Preview pre-Main static provenance: 12 / 12 byte-exact assets on App 13.82.11 / Core 4.82.11.

Integration Preview M5.2 consumer boundary: 7 / 7 PASS.

Integration Preview Static Asset Hardening: 3 / 3 PASS.

Production static provenance: 12 / 12 byte-exact assets on App 13.82.11 / Core 4.82.11.

Production authenticated runtime navigate and reload: PASS.

Production M5.2 consumer boundary: 7 / 7 PASS.

Production Static Asset Hardening: 3 / 3 PASS.

Production Service Worker: luvia-shell-v13.82.11.

A genuine current M5.2 pre-Main Preview gate was executed and accepted before Main mutation.

Main local, tracking and live remote reached a2098a1188b40edbe60573322c6eec2d936ad28a with divergence 0 / 0.

No manual Cloudflare deployment was performed.

No Supabase deployment, database migration, Edge Function deployment or secret mutation was performed.

The known tests/user-preference-core.test.cjs failure remains PREEXISTING FAIL / RETAINED / NOT PASS.

The geolocation user-gesture and Tracking Prevention warnings remain retained.

The initial text Preview failure remains retained as harness evidence.

The initial Booking push harness failure remains retained as post-push harness evidence after remote success proof.

Main Pre-flight V1 remains retained as comparison-harness evidence. Main Pre-flight V2 passed.

Historical protocol-evidence limitations remain retained.

pre-Main Preview gate retroactively claimed = NO.

This historical statement does not negate the genuine current M5.2 pre-Main Preview acceptance.

M5.2 establishes logical isolation for the approved remaining Trip consumers only.

Final physical Trip Core isolation remains later M5 work.

M5.2 closeout documentation is PREPARED.

M5.2 final eight-stream synchronization remains pending.

M5.2 overall remains CLOSEOUT PENDING until the Docs Marker and final eight-stream synchronization are proven.

M5 remains IN PROGRESS.

NFR-0 begins only after final M5.2 closeout and eight-stream synchronization.
## Journey / Timeline

`core/places/timeline-core.js` remains explicitly reserved for the later Journey / Timeline Aggregation Architecture Audit.

## Intelligence

New permanent stream:

`feature/intelligence-core`

New foundation root:

`core/intelligence/`

No current AI or Intelligence runtime implementation has been moved by M4.5.1-M4.5.3.

Future migration is classification-first, not a big-bang move.

## Experience

New permanent stream:

`feature/experience-core`

New foundation root:

`core/experience/`

No current UI or CSS implementation has been moved by M4.5.1-M4.5.3.

Future work will establish the Design System Foundation before Global Experience Recomposition.

<!-- NFR-0 MIGRATION CLOSEOUT BEGIN -->
## NFR-0 Native First Ready migration state

NFR-0 establishes the runtime-neutral Native First Ready architecture foundation between M5.2 and M5.3.

Foundation Commit: a64e6c0fd3bd5954fe29571f8c4ea128f265a201

Static Asset Hardening / Production Accepted Head: c57aec1912578e3b4e5ea31e1a8e9f4ed5b75a27

Runtime App/Core remains 13.82.11 / 4.82.11.

Project-wide browser dependency inventory and debt classification are registered.

The 16 Platform Port boundaries are registered.

New domain-browser dependency growth is guarded.

Browserless core smoke foundation is active.

window.LuviaTripContractV1 remains a temporary Web Runtime Compatibility Binding and is not final native transport.

M5.3 consumes NFR-0 with priority on Active Trip Context, runtime-neutral Trip access, Trip Store browser coupling, travel context and Web bootstrap compatibility boundaries.

NFR-0 becomes COMPLETE / CLOSED after this exact Docs Marker reaches Local = Tracking = Live on all eight active streams with 0/0 divergence and clean worktrees.

M5.3 is UNBLOCKED / READY only after that final synchronization gate.
<!-- NFR-0 MIGRATION CLOSEOUT END -->

<!-- M5.3 MIGRATION CLOSEOUT BEGIN -->
## M5.3 Active Trip Context migration state

M5.3 runtime and Production acceptance is COMPLETE.

Runtime App 13.82.12 / Core 4.82.12.

Runtime Release Commit: 1dc39b0b034e09aebfab3737598c2f2ac393cacd.

Foundation Commit: 464ec0b48306beb40ec05f8c8c5f966e19d22c90.

Web Compatibility Binding Commit: abbe3334d08cd30ac5cd82c80cb7e2ff953dcc29.

core/trips/active-trip-context.mjs now owns the runtime-neutral Active Trip read and subscription projection.

TripStore remains the canonical Trip Truth provider.

No duplicate persisted Trip Truth was introduced.

luvia-trip-context.js is the Web Runtime Compatibility Binding (`web-runtime-compatibility`) for the runtime-neutral core.

window.LuviaTripContext remains a temporary Web compatibility surface, not final native transport.

window.LuviaTripStore, window.LuviaTripContractV1 and window.LuviaTravelContext remain later compatibility/runtime debt.

The correct Travel Context implementation path is core/context/travel-context-service.js.

The historical core/services/travel-context-service.js reference is stale and is not the authoritative M5.3 path.

Integration and Production browser acceptance proved TripStore = TripContext = TripContract = TravelContext for the active Trip before and after F5.

The ES module scheduling / boot-order risk identified before Main promotion was explicitly accepted on Integration and Production.

M5.3 focused regression: 2 / 2 PASS.

NFR Foundation: 3 / 3 PASS.

Safe Regression: 34 / 34 PASS.

M5.2 targeted regression: 7 / 7 PASS.

Integration Static Asset Privacy: 5 / 5 PASS.

Production Static Asset Privacy: 5 / 5 PASS.

Authenticated Production Browser Smoke and F5: PASS.

No database migration, Edge Function deployment, secret mutation or manual Cloudflare deployment was required.

Earlier M5.2 and NFR-0 pre-sync wording remains historical point-in-time evidence and is not the current repository synchronization state.

This Docs Marker does not pre-claim its own cross-stream synchronization.

M5.3 becomes COMPLETE / CLOSED only after this exact Docs Marker is synchronized to all eight active streams.

M5 remains IN PROGRESS.

Next: M5.4 Remaining Trip Web Compatibility / Runtime Dependency Reduction.
<!-- M5.3 MIGRATION CLOSEOUT END -->
