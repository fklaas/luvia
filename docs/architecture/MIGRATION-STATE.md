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

### M8.5 Intelligence Contract Foundation

M8.5 is complete, closed and Production-verified at App/Core `13.82.25 / 4.82.25`.

The browserless `core/intelligence/intelligence-domain-contract-core.js` now owns capability, domain/tool metadata, model tiers, policy, validation, context-envelope, Intelligence signal/proposal and evidence semantics. The active Web boundary is `LuviaIntelligenceContractV1`.

The current AI dashboard, Tool Registry, Memory and proposal identity/Trip lookups consume public contracts. The visible dashboard no longer exposes the private Timeline execution path and adds Intelligence Transparency.

This is a classification-first foundation, not a bulk move. Timeline/Journey remains separately reserved; foreign-domain mutation remains outside `intelligence.v1`. Controlled Safe Regression is 49/49 PASS, and Integration plus Production each passed 21/21 byte-exact runtime assets, 25/25 authenticated F5, the visible Intelligence Transparency flow and a clean console.

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
<!-- LUVIA:M5.4.1:CLOSEOUT:START -->
## 2026-08-21 – M5.4.1 Active Foreign Trip Truth Isolation / Destination Service

**State:** COMPLETE / CLOSED

- Runtime source: `c36a68b9a7abfca5f3d804dac98f96b72148a7ba`.
- Added Trip-owned narrow command `applyResolvedDestination(tripId, destination)` in `core/platform/trip-contract-adapter.js`.
- Migrated active `intelligence/destination-service.js` private `LuviaTripStore` references from 8 to 0.
- Destination Service now uses public Trip Contract reads/subscription plus the Trip-owned command boundary.
- Existing Legacy destination compatibility mirror and Trip Context refresh behavior remain preserved.
- No `TripExperience.update` path is used by the new narrow owner command.
- No new `luvia_save_trip_profile` write exists in Destination Service or the narrow owner command.
- Integration and Main Safe Regression: 35/35 PASS.
- Integration Preview static provenance and authenticated F5 smoke: PASS.
- Production static byte provenance and authenticated F5 smoke: PASS.
- Native/Web compatibility globals remain explicitly classified debt for subsequent M5.4 work; their existence is not treated as final Native architecture.
- No Runtime App/Core bump; remains 13.82.12 / 4.82.12.
- No DB migration, Edge Function change, Secret change or manual Cloudflare change.
- M5 remains IN PROGRESS.
<!-- LUVIA:M5.4.1:CLOSEOUT:END -->

## M5.4.2 Runtime / Bootstrap Trip Boundary — COMPLETE / CLOSED

Runtime implementation commit:

`5b6af89ba061e9638fc12be3268767e6d681c1b9`

App/Core:

13.82.12 / 4.82.12

Migration outcome:
- Boot Coordinator private Trip Store access: 7 -> 0.
- Shared Runtime private Trip Store access: 3 -> 0.
- Trip owner adapter now exposes runtime state/initialize/loadRemote operations.
- Active Trip boot selection preserves owner options through the public command boundary.
- Trip Store remains sole Trip Truth.
- No duplicate truth.
- No DB migration.
- No Edge Function change.
- No Secret change.
- No manual Cloudflare change.

Validation:
- focused M5.4.2 PASS
- retained M5.4.1 PASS
- Safe Regression 36/36 PASS
- Integration Preview byte provenance PASS
- Integration authenticated F5 PASS
- Production byte provenance PASS
- Production authenticated F5 PASS
- Production static privacy PASS

Retained debt:
- owner-internal Web compatibility bindings remain classified
- `luvia-trip-context.js` is not claimed migrated in M5.4.2
- Tracking Prevention and geolocation user-gesture warnings remain
- remaining Trip-owned runtime/legacy paths continue in later M5.4 work
- physical Trip Core isolation remains required before M5 exit

Evidence rule:
Main promotion causation is not retroactively reconstructed beyond the currently proven Git, reflog, Cloudflare and byte-provenance evidence.

M5.4.2 closes only with its documentation marker and final 8/8 synchronization.

## M5.4.3 — Active TripStore Consumer Isolation — CLOSED

Runtime Commit: `cf4a6b32c0ef11f4ac798766a38996bd4973e5b3`

The active non-owner private TripStore consumer debt identified for this stage has been reduced from six direct references to zero.

Migrated runtime consumers:

- Join Flow
- Trip Creator
- Trip Experience
- Timeline Core

The owner boundary remains `core/platform/trip-contract-adapter.js` and the canonical Web Trip Truth remains `core/trips/trip-store.js`.

`luvia-trip-context.js` remains an explicit Web compatibility binding and is deferred to the bundled M5.4 FINAL architecture block.

No duplicate Trip Truth was introduced.

No DB migration, Edge Function, secret or manual Cloudflare change was required.

M5.4 remains IN PROGRESS. M5 remains IN PROGRESS.


---

## M5.4 FINAL — Trip Web Compatibility Boundary

Status: **COMPLETE / CLOSED**

Runtime release:
- App 13.82.13
- Core 4.82.13
- Runtime Commit `4c1827aa122ae5ba91b4ada845ad919fd273edf4`

Migration result:
- Remaining active non-owner TripStore consumers are isolated behind public Trip boundaries.
- Web Trip Context no longer directly accesses private TripStore.
- `LuviaTripStateReaderV1` provides read-only `snapshot` / `subscribe`.
- Owner adapter retains exactly one private Store mutation access.
- Travel Context secondary AppState Trip fallback removed.
- Active Trip Context core remains browserless.
- TripStore remains sole domain truth.

M5 status:
- M5.1: COMPLETE
- M5.2: COMPLETE
- M5.3: COMPLETE
- M5.4: COMPLETE
- M5 overall: **IN PROGRESS**
- Remaining exit work: physical Trip Core isolation and final Native Readiness / ownership exit proof.

<!-- LUVIA:M5:FINAL:CLOSEOUT:START -->
## M5 FINAL — Physical Trip Core Isolation — COMPLETE / CLOSED

Runtime Release Commit: `579e72c9419fc4456ce724bc63ba15d8f24233c7`
Physical Isolation Feature Commit: `d3a13e829ea1eca4fbbeff38b16ecf52e2eec58e`
App/Core: **13.82.14 / 4.82.14**

Migration outcome:

- active consumer TripStore isolation from M5.1 through M5.4 remains preserved;
- runtime-neutral `core/trips/trip-state-core.js` now owns the in-memory Trip state;
- `core/trips/trip-store.js` is reduced to the Web compatibility adapter around that state core;
- physical Trip state core browser coupling is measured at **0**;
- Web Trip Store contains **no second local Trip state declaration**;
- `LuviaTripStateReaderV1` remains read-only with `snapshot` / `subscribe`;
- Active Trip Context remains browserless;
- no duplicate Trip Truth was introduced;
- Web compatibility globals remain compatibility surfaces, not the native target API.

Native-readiness baseline handling:

- `config/luvia-native-readiness-debt.json` remains the historical NFR-0 baseline and is not retroactively rewritten;
- its original Trip Store `DOMAIN_VIOLATION` entry therefore describes the pre-migration baseline, while current runtime ownership is proven by the physical state core, focused guardrail and deployed byte provenance.

Validation:

- final Safe Regression: **39/39 PASS**;
- Integration Preview runtime provenance: **11/11 EXACT**;
- Integration authenticated F5: **25/25 PASS**;
- Integration visual acceptance: **UI PASS**;
- Main FF-only promotion: **PASS**;
- Production runtime provenance: **11/11 EXACT**;
- Production Static Privacy: **PASS**;
- Production authenticated F5: **25/25 PASS**;
- Production visual acceptance: **UI PASS**;
- Production Physical Trip Core / Native-readiness semantics: **PASS**.

Infrastructure:

- DB migration: **NONE**;
- Edge Function change: **NONE**;
- Secret change: **NONE**;
- manual Cloudflare configuration change: **NONE**.

M5 status: **COMPLETE / CLOSED**.
Next milestone: **M6**.
<!-- LUVIA:M5:FINAL:CLOSEOUT:END -->

<!-- LUVIA:M6.1:CLOSEOUT:START -->
## M6.1 Places State Core Foundation — COMPLETE / PRODUCTION VERIFIED

Feature Commit: `9b9b782baa3fa58ed8bc9be5e96214da084a52e4`

Runtime Release Commit: `f4adb8b07cc131166241bfa3051c1ea3119c1bfb`

App/Core: **13.82.15 / 4.82.15**

Migration outcome:

- the pre-existing `place-core.js` record map is physically isolated in runtime-neutral `core/places/place-state-core.js`;
- the physical Places State Core has zero browser, DOM, storage, network, Supabase, DB, RPC, or device coupling;
- `core/places/place-core.js` is the Web compatibility/orchestration adapter and owns no second record map;
- the `LuviaPlaceCore` / `LuviaPlacesCore` Web API surface remains compatible;
- public `places.v1` remains unchanged;
- Timeline/Journey remains reserved, separately classified, and unchanged;
- runtime/collection projection maps remain retained debt under explicit later audit rather than being silently declared duplicate-free;
- no Category, Discovery, Intelligence, Location, Permission, Deep Link, External Navigation, Offline/Cache, Experience, DB, RPC, or schema migration was bundled into the state slice.

Validation:

- maintained focused Places regression: **7/7 PASS**;
- Platform, Integration, and Main Safe Regression: **40/40 PASS** each;
- Integration Preview runtime provenance: **12/12 EXACT**;
- Integration Preview static privacy: **5/5 PASS**;
- Integration authenticated F5 and Places UI: **PASS**;
- Production runtime provenance: **12/12 EXACT**;
- Production static privacy: **5/5 PASS**;
- Production authenticated F5 and Places UI: **PASS**;
- Places discovery categories visible in Preview and Production: **10/10 PASS**;
- Browser console warnings/errors: **0/0** in both accepted environments.

Infrastructure:

- DB migration: **NONE**;
- RPC/schema change: **NONE**;
- Edge Function change: **NONE**;
- Secret change: **NONE**;
- manual Cloudflare configuration change: **NONE**.

M6.1 is **COMPLETE / PRODUCTION VERIFIED**. M6 remains **IN PROGRESS**.

Next controlled work begins with a read-only proof of runtime/collection projection ownership before another Places state mutation. Location/Permission port adoption remains a separate slice.
<!-- LUVIA:M6.1:CLOSEOUT:END -->

<!-- LUVIA:M6.2:CLOSEOUT:START -->
## M6.2 Places Runtime Projection Core — COMPLETE / PRODUCTION VERIFIED

Feature Commit: `ecd94eac7f5c97b68be74c13097aad1a9086164b`

Runtime Release Commit: `d1c45cbb0fe357a061dffc8f52bef29e9593c612`

App/Core: **13.82.16 / 4.82.16**

Migration outcome:

- the trip/type-scoped Place/TripPlace runtime projection is physically owned by browserless `core/places/place-runtime-projection-core.js`;
- the Web runtime adapter contains zero projection maps;
- the Collection service contains zero Place/TripPlace record maps and delegates to the single runtime projection;
- the Collection `pending` map remains command concurrency state, not Domain Truth;
- cloud services remain authoritative for persisted Place, TripPlace, lifecycle, favorite, and TripPlace-data rows;
- Timeline/Journey remains separately classified and unchanged;
- public `places.v1` remains unchanged and its later alignment is not pre-claimed.

Validation:

- focused M6.2 guardrail: **PASS**;
- Platform, Integration, and Main Safe Regression: **41/41 PASS**;
- Integration Preview: **10/10 exact assets**, **5/5 privacy**, authenticated F5/UI, ten categories, console **0/0**;
- Production: **10/10 exact assets**, **5/5 privacy**, authenticated F5/UI, ten categories, console **0/0**;
- Main promotion: **FF-only PASS**.

Integration Preview Cloudflare version: `a7294e57-baf5-42b7-80d9-efeb6aabda38`.

Production Cloudflare version at 100% traffic: `98b38643-2d9e-46cc-a032-1fddeae77788`.

Both associated GitHub checks remained stuck at `in_progress` without conclusions or errors. This check-reporting fault is preserved explicitly; successful version/deployment state plus exact bytes and authenticated acceptance supply the independent environment proof.

Infrastructure:

- DB migration: **NONE**;
- RPC/schema change: **NONE**;
- Edge Function change: **NONE**;
- Secret change: **NONE**;
- manual Cloudflare configuration change: **NONE**.

M6 remains **IN PROGRESS**. Remaining exit work is locked only after a fresh read-only contract/routing/Platform Port/Intelligence/offline/browserless gap audit.
<!-- LUVIA:M6.2:CLOSEOUT:END -->

<!-- LUVIA:M6:FINAL:CLOSEOUT:START -->
## M6 Places Core Isolation — COMPLETE / CLOSED

Feature Commit: `be839773659039692d5d4b69586490f2584593de`

Runtime Release Commit: `2917bc055409b05fb57199031cb91db7d7f66f73`

App/Core: **13.82.17 / 4.82.17**

Migration outcome:

- Places catalog state and trip-scoped runtime projections each have one measured physical owner;
- `places.v1` exposes the stabilized search/get/saved/recommend/lifecycle/category/deep-link surface through the owner adapter;
- browserless Places domain projections and category/discovery routing are centralized in `places-domain-contract-core.js`;
- the ten Category definitions have one declarative Domain Registry;
- Web device, permission, network, deep-link, external-navigation, and offline-cache behavior is supplied through formal Platform Ports;
- Places/Intelligence discovery composition is isolated without moving Place truth to Intelligence;
- active Places Trip coupling uses the public Trip Contract rather than private Trip Context or Trip Store access;
- Timeline/Journey remains a reserved cross-domain aggregator and was not reclassified or migrated.

Validation:

- focused M6 exit guard: **PASS**;
- canonical Categories: **10/10**;
- direct navigator use in locked Places device paths: **0**;
- Platform, Integration, and Main Safe Regression: **42/42 PASS**;
- Integration Preview: **18/18 exact assets**, **5/5 privacy**, authenticated F5/UI, ten categories, console **0/0**;
- Production: **18/18 exact assets**, **5/5 privacy**, authenticated F5/UI, ten categories, console **0/0**;
- Main promotion: **FF-only PASS**.

Integration Preview Cloudflare version: `c996a818-5b79-47ac-9f7a-3897596b2d1f`.

Production Cloudflare version at 100% traffic: `9962d8e5-8c3e-4eb1-bf42-de9df9917c50`.

Production build/check: `1cec3007-675c-4c4b-8772-ac01982db0ed` / `97018298435`, **SUCCESS**.

Infrastructure:

- DB migration: **NONE**;
- RPC/schema change: **NONE**;
- Edge Function change: **NONE**;
- Secret change: **NONE**;
- manual Cloudflare configuration change: **NONE**.

M6 is **COMPLETE / CLOSED**. M7 starts with a read-only baseline derived from the normative roadmap and current repository evidence.
<!-- LUVIA:M6:FINAL:CLOSEOUT:END -->

<!-- LUVIA:M7.1:CLOSEOUT:START -->
## M7.1 Media Acquisition Native Ports — COMPLETE / CLOSED

Date: 2026-08-22

Runtime App/Core: **13.82.18 / 4.82.18**

Feature commit: `b2792df68a89b45f886c021be7c05404e33d1f4d`

Runtime release commit: `625dc47cb36427a0f28586d28e65eab344bc1ae9`

Measured result:

- Gallery direct `navigator`, browser-storage, embedded file-input, and `new File` bypasses: **0**;
- Web Media acquisition/device ports: **5/5**, including the existing LocationPort;
- browser and DOM capability ownership: Web Platform adapter only;
- Platform adapter Media truth/Supabase ownership: **0**;
- Media Readiness Contract/Port diagnostics: **PASS**;
- Safe Regression on Platform, Integration, Main: **43/43 PASS**;
- Integration Preview: **9/9 exact assets**, **5/5 privacy**, authenticated F5/Gallery, console **0/0**;
- Production: **9/9 exact assets**, **5/5 privacy**, authenticated F5/Gallery, console **0/0**;
- Main promotion: **FF-only PASS**.

Integration Preview version: `708bc5e4-0ab2-4335-945e-95dadc7f8310`.

Production version at 100%: `97d5674b-db5d-43b0-8eee-ce8700acf6f2`.

Production build/check: `9e5a19ef-ed16-4042-a046-8557a6ef1087` / `97020481096`, **SUCCESS**.

No database, RPC/schema, bucket/RLS, Edge Function, secret, or manual Production deployment/configuration mutation occurred. Timeline/Journey remains separately reserved and unchanged. M7 continues with the measured Media Contract, owner, Realtime/hydration, storage, offline, Memory Experience, and browserless-core debt.
<!-- LUVIA:M7.1:CLOSEOUT:END -->

<!-- LUVIA:M7.2:CLOSEOUT:START -->
## M7.2 Gallery Media Contract Adoption — COMPLETE / CLOSED

Date: 2026-08-22

Runtime App/Core: **13.82.19 / 4.82.19**

Feature commit: `eaf505fdc715825a862c0d1dd733feb1330367a2`

Runtime release commit: `54eb8d16cf94a92cc8b77e1442dfe88bb44f4144`

Measured result:

- Gallery direct private Media Core refs: **19 -> 0**;
- `media.v1` runtime surface: **1.1.0**, Contract major remains v1;
- raw Media metadata/storage/DB projection leakage: **0**;
- signed assets, Polaroids, Media commands, rendered previews, Gallery clear, and Media Realtime: public Contract path;
- Media Core persistence and Realtime channel ownership: unchanged;
- Clustering 8, AI Memory 3, Timeline/Journey 1 direct references: retained as separately classified later scopes;
- Safe Regression on Platform, Integration, Main: **44/44 PASS**;
- Integration Preview: **10/10 exact assets**, **5/5 privacy**, authenticated F5/Gallery, console **0/0**;
- Production: **10/10 exact assets**, **5/5 privacy**, authenticated F5/Gallery, console **0/0**;
- Main promotion: **FF-only PASS**.

Integration Preview version: `5c94df43-a9c9-4ea8-9687-44243348ea5c`.

Production version at 100%: `bd7b5df9-667d-4a8e-93a5-d00f4583d5f0`.

Production build/check: `aaa26d29-24cf-4ad1-abd8-3abdee9b9153` / `97022054088`, **SUCCESS**.

No database, schema/RPC, bucket/RLS, Edge Function, secret, manual Production deployment, or Cloudflare configuration mutation occurred. M7 remains in progress.
<!-- LUVIA:M7.2:CLOSEOUT:END -->

<!-- LUVIA:M7.3:CLOSEOUT:START -->
## M7.3 Memory Asset Delivery Contract Adoption — COMPLETE / CLOSED

Date: 2026-08-22

Runtime App/Core: **13.82.20 / 4.82.20**

Feature commit: `21ef490c30dc2cc0ddc011300ef0e3b638321d10`

Runtime release commit: `63a73bcd3b39de723b97c86887b866e488659d60`

Measured result:

- locked Memory Experience direct private Media Core refs: **6 -> 0**;
- signed asset requests: lazy public `media.v1`, **Media ID-only**;
- Contract version/projection change: **NONE**;
- Media/Album/Card/Journey/Trip truth move: **NONE**;
- JavaScript/TypeScript source mirrors: aligned;
- Smart Photo Moments 3, Clustering 2, AI Memory 5, Memory owners 4, Timeline/Journey 2, and legacy sync 10 direct references: retained as separately classified later scopes;
- Safe Regression on Platform, Integration, Main: **45/45 PASS**;
- Integration Preview: **11/11 exact assets**, **5/5 privacy**, authenticated F5/Memory Albums, console **0/0**;
- Production: **11/11 exact assets**, **5/5 privacy**, authenticated F5/Memory Albums, console **0/0**;
- Main promotion: **FF-only PASS**.

Integration Preview version: `805b8187-86f9-4b43-8254-7f574b11c6ae`, alias `integration`, `has_preview=true`.

Production version at 100%: `476ec499-830d-4cbb-87a3-e9e32a79cd4d`.

Production build/check: `7df7ffbb-7f30-43aa-bd9c-76335dba88a4` / `97023989740`, **SUCCESS**.

No database, schema/RPC, bucket/RLS, Edge Function, secret, manual Production deployment, or Cloudflare configuration mutation occurred. M7 remains in progress.
<!-- LUVIA:M7.3:CLOSEOUT:END -->

<!-- LUVIA:M7.4:CLOSEOUT:START -->
## M7.4 Remaining Media Consumer Contract Adoption — COMPLETE / CLOSED

Date: 2026-08-23

Runtime App/Core: **13.82.21 / 4.82.21**

Feature commit: `dfbeffbe7bbbd003f1a3e72220cd5d1f666768b0`

Runtime release commit: `2f8fe62b71f93643cef474ff002a90bd267bac01`

Measured result:

- Smart Photo Moments direct private Media Core refs: **3 -> 0**;
- AI Memory direct private Media Core refs: **5 -> 0**;
- Smart Photo reads/assets: public `media.v1`, ID-only signed asset requests;
- AI Memory evidence: sanitized public Media projection;
- AI Media-to-Place writes: public Media-owned `linkPlace` command;
- Contract version/projection change: **NONE**;
- Media/Memory/Place/Trip/Intelligence truth move: **NONE**;
- Media Clustering and Memory owner internals: unchanged;
- Timeline/Journey: separately classified and unchanged;
- Safe Regression on Platform, Integration, Main: **46/46 PASS**;
- Integration Preview: **13/13 exact assets**, **5/5 privacy**, authenticated F5/Gallery, 51 photos, 10 moments, Realtime active, console **0/0**;
- Production: **13/13 exact assets**, **5/5 privacy**, authenticated F5/Gallery, 51 photos, 10 moments, Realtime active, console **0/0**;
- Main promotion: **FF-only PASS**.

Integration Preview version: `0541fd51-4bd3-4e10-8ac0-3bc0d16aafb9`.

Production version at 100%: `2ad42346-348b-4fbe-ba10-e32ede4e71ef`.

Production deployment/build/check: `36f63a2a-8e5e-438e-8323-12f698d8d195` / `193a43c1-3021-46f6-89ff-a417fb3ed1d3` / `97170830238`, **SUCCESS**.

No database, schema/RPC, bucket/RLS, Edge Function, secret, manual Production deployment, or Cloudflare configuration mutation occurred. M7 remains in progress.
<!-- LUVIA:M7.4:CLOSEOUT:END -->

<!-- LUVIA:M7:FINAL:CLOSEOUT:START -->
## M7 Media Core Isolation — COMPLETE / CLOSED

Date: 2026-08-23

Runtime App/Core: **13.82.22 / 4.82.22**

Feature commit: `48e496aec0605d2dc8650f25692539010b67ca10`

Runtime release commit: `2e87a9fcce31d15fa73c2abf2c183b413154c606`

Measured M7 exit result:

- browserless Media Domain Contract Core: **PASS**, with zero browser/device/storage/Supabase dependencies;
- canonical Media owner direct Supabase Storage calls: **7 -> 0**;
- dedicated Web MediaStoragePort: remote object operations plus persistent IndexedDB command queue;
- NetworkPort transition subscription and LifecyclePort: **PASS**;
- upload coordinator: offline staging plus online/foreground drain through injected capabilities;
- `media.v1` runtime surface: **1.2.0**, Contract major remains **v1**;
- legacy Gallery compatibility bridge direct private Media Core refs: **10 -> 0**;
- canonical Realtime owner: **Media Core**; public hydration/subscription boundary: **media.v1**;
- Media Clustering direct owner refs: **2**, unchanged same-owner internals;
- Memory Album/Card/Journey owner refs: **4**, unchanged same-owner internals;
- Timeline/Journey direct Media refs: **2**, separately classified and unchanged;
- Safe Regression on Platform, Integration, and Main: **47/47 PASS**;
- NFR-0: **3/3 PASS**;
- Integration Preview and Production: **15/15 exact runtime assets**, **5/5 privacy**, authenticated F5/Gallery, 51 photos, 10 moments, Realtime active, native actions, console **0 entries**;
- Main promotion: **FF-only PASS**.

Integration Preview version/build/check: `689f9a78-f0b9-46ac-a690-78ac7678d797` / `64bfe8b8-2f64-4634-9b04-3b9071fdf2ef` / `97173988989`, **SUCCESS**.

Production version at 100%: `e1477e68-d8d1-4cfd-a7a4-c28a73f905dd`.

Production deployment/build/check: `83b155fc-58a5-4d4f-a12d-1e3347333d29` / `c2fed981-7394-44d5-8af5-1107dadd8687` / `97174286216`, **SUCCESS**.

No database, schema/RPC, bucket/RLS, Edge Function, secret, manual Production deployment, or Cloudflare configuration mutation occurred. The Web queue is pending-command state, not a second Media truth. Native adapters can reuse the same Media rules and provide native background-transfer capabilities without a Domain-Core rewrite.

M7 is **COMPLETE / CLOSED**. M8 requires a new read-only baseline and explicit scope lock from this final synchronized marker.
<!-- LUVIA:M7:FINAL:CLOSEOUT:END -->

<!-- LUVIA:M9.3:CLOSEOUT:START -->
## M9.3 History, Back and Deep-Link Policy — COMPLETE / CLOSED / PRODUCTION VERIFIED

Date: 2026-08-23

Runtime App/Core: **13.82.30 / 4.82.30**

Platform foundation: `965c231263d0554105e0bf8364dad1ab1323eb28`

Consumer adoption: `9a9108f4c3ff85a4d06e24fadeaf8c795ad4d432`

Runtime release: `6648f41c6f831645dc79c6cd5463fe8cc945765e`

Measured result:

- browserless `navigation-history.v1`: PASS, owns no route or Domain Truth;
- one Web History adapter: push/replace/restore plus Back/Forward bridge;
- canonical route/intent owner: unchanged `navigation.v1`;
- Consumer screen commit: only after successful module mount;
- authenticated direct Places Deep Link and sanitized category parameters: PASS;
- active App Shell external Maps navigation: `ExternalNavigationPort`;
- Auth, Join and Booking URL owners: separately classified and unchanged;
- Timeline/Journey: separately reserved and unchanged;
- NFR-0: **3/3 PASS**;
- Safe Regression on Platform, Consumer, Integration and Main: **52/52 PASS**;
- Integration Preview `2fd3416e-703a-4bc6-9172-3cc86f4b9714`: **11/11 exact**, **5/5 privacy**, Deep-Link/Back/Forward, **25/25 authenticated F5**, active Trip retained, console **0**;
- Production version/deployment `5c966e7f-1685-4976-9af1-d94871869954` / `32291cf2-f7c4-4ec7-bd11-f88d46520b77`: **100%**, same exact/private/contract gates, **25/25 F5**, 3.1–5.1 seconds, console **0**;
- Main promotion: **FF-only PASS**.

One Preview observer timed out at 15 seconds while the same reload subsequently reached the correct state without a console error. Read-only diagnosis was completed before the remaining runs used a 30-second window aligned to the bounded runtime contract.

No database, schema/RPC, bucket/RLS, Edge Function, secret, manual Production deployment, manual Cloudflare configuration or Domain Truth mutation occurred. Rollback is code-only to M9.2 runtime `740f127041cb275cf8a5716965bf9c20d4158d04`.

M9 remains in progress. Remaining App Shell orchestration, lifecycle/resume and legacy URL-owner work requires a fresh measured scope lock.
<!-- LUVIA:M9.3:CLOSEOUT:END -->

<!-- LUVIA:M9.4:CLOSEOUT:START -->
## M9.4 Runtime Signals and Resume Coordination — COMPLETE / CLOSED / PRODUCTION VERIFIED

Date: 2026-08-23

Runtime App/Core: **13.82.33 / 4.82.33**

Platform / Consumer / Runtime: `c9377153ff8e6a95e592293745640c2ff058b31b` / `e9dd548e0e8a4841ead1f6d956612eff51f1e4e1` / `236f32c1072d6e0e5d5ef8978d906289db7156cc`

Measured result:

- browserless `app-runtime-signals.v1`: PASS, no session/token or Domain Truth;
- Web binding: AuthSessionPort + LifecyclePort + NetworkPort only;
- direct App Shell Auth render subscription: `1 -> 0`;
- session/resume/reconnect orchestration: serialized;
- eligible Resume/Reconnect: current Navigation Intent retained, History length unchanged;
- visible Offline/Reconnect/Resume `aria-live` projection: PASS;
- NFR-0: **3/3 PASS**;
- Safe Regression: **53/53 PASS**;
- final Preview `44cd8304-0063-4605-b711-2420a9f9ee91`: **12/12 exact**, **5/5 privacy**, Runtime Actions, **25/25 F5**, console **0**;
- Production version/deployment `93f9bc43-e25e-45c5-b727-15d31e41a33d` / `f2ae2af2-2c39-48a7-9060-02a3a0eadb12`: **100%**, same gates, **25/25 F5**, console **0**;
- Main promotion: **FF-only PASS**.

Candidates `13.82.31` and `13.82.32` were explicitly rejected for Release Identity defects. No database, schema/RPC, bucket/RLS, Edge Function, secret, manual Production deployment/configuration or Domain Truth mutation occurred. Timeline/Journey and owner-specific Auth/Join/Booking URL flows remain separate.

M9 remains in progress. Real login/logout environment acceptance, remaining owner-specific URL boundaries and inactive legacy-shell deletion proof require a new read-only scope lock.
<!-- LUVIA:M9.4:CLOSEOUT:END -->
