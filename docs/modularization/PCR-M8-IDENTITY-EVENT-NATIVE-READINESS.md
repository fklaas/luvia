# PCR M8 — Identity / Event Contracts / Native Readiness

Date: 2026-08-23

Owner stream: `feature/platform-core`

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED**

## Source lock

M8 started from the synchronized M7 closeout marker `7dd23bffe497f5cd780c816f0bb9400d40b78af8`. All eight registered streams were Local = Tracking = Live, divergence `0/0`, and clean before mutation.

## Measured baseline

- no physical `core/identity/` or `core/events/` owner root;
- `identity.v1` existed as a Web compatibility adapter but contained its own projection and write-policy rules;
- `profile-service.js` owned a second local mutable state object and four direct `localStorage` references;
- `auth/session.js` contained 23 direct `localStorage` / `sessionStorage` references for pending-upgrade, signed-out and module-cleanup metadata;
- profile writes directly inspected/refreshed the Supabase Auth session rather than consuming `AuthSessionPort`;
- `StoragePort`, `SecureStoragePort`, `AuthSessionPort` and `NotificationPort` were declared by NFR-0 but had no active Web implementation;
- Kernel events had an internal Web event shape, while cross-core Domain Events had no browserless common envelope/versioning contract;
- Notification capabilities existed as browser globals, but no policy boundary prevented accidental Domain Event → browser notification coupling;
- explicit global preferences and observed Intelligence signals were visibly distinguished in the Profile Foundation, but that distinction was not locked in a browserless Identity rule surface;
- global profile persistence still carries legacy Trip compatibility metadata. Those fields are excluded from `identity.v1` and are not reclassified as Identity truth;
- Timeline/Journey remained separately reserved and was not part of the ordinary Identity/Event consumer scope.

## Bundled implementation scope

1. Establish `core/identity/identity-domain-contract-core.js` as the browserless physical Identity state, projection and write-policy core.
2. Keep global viewer identity and explicitly confirmed preferences as Identity truth; reject Trip fields and observed signal collections at the public Identity write boundary.
3. Establish `core/events/event-contract-core.js` as the browserless `events.v1` envelope/versioning foundation with owner, source, subject, correlation and causation metadata.
4. Define the canonical example events `booking.confirmed`, `place.saved`, `trip.completed` and `memory.created` without moving their Domain ownership.
5. Keep notification eligibility as event metadata only. Notification delivery requires an explicit `NotificationPort` command and user/platform permission.
6. Implement Web `StoragePort`, `SecureStoragePort`, `AuthSessionPort` and `NotificationPort` adapters in `app/adapters/identity-platform-web-adapter.js`.
7. Preserve Supabase Auth as session/token owner. The Web SecureStorage adapter stores only Luvia compatibility metadata and reports `web-origin-storage` / non-hardware-backed protection honestly.
8. Replace all 27 direct Profile/Auth browser-storage references with Platform Port calls.
9. Route profile-session readiness through `AuthSessionPort`; keep DB/RPC persistence in the existing Web profile persistence adapter.
10. Make `identity.v1` delegate projection/write rules to the browserless core and publish sanitized Domain Events through `events.v1` while preserving its v1 compatibility events.
11. Register Media, Identity and Events as explicit current core roots in the architecture registry.
12. Add a visible, responsive Identity & Privacy Center to the Control Center and App Shell. The surface consumes public contracts and diagnostics only; it owns no Identity, Trip, Intelligence or notification-delivery truth.
13. Add the focused M8 exit guard and raise controlled Safe Regression from 47 to 48 tests.

## Ownership result

- Identity owns global viewer identity and explicit preference truth.
- Trip owns active/global trip context; legacy profile compatibility fields do not enter Identity projections.
- Intelligence owns inferred/observed learning signals until a user explicitly confirms a preference.
- Events owns envelope semantics but no business-domain truth.
- Platform owns adapters for storage, secure storage, auth sessions and notification delivery.
- Experience/Consumer owns the Identity Center presentation and interaction semantics only.
- Supabase remains the Web persistence/auth provider behind the adapter boundaries.
- Timeline/Journey remains a separately reserved cross-domain aggregator.

## Native First result

The Identity and Event cores contain no DOM, device API, browser storage, browser navigation, Supabase, DB or remote-service dependency. Future iOS and Android runtimes can bind the same rules to Keychain/Keystore, native auth sessions, APNs/FCM and platform storage without rewriting Identity or Event semantics.

The Web adapter makes no false security claim: browser secure storage is origin-scoped and not hardware-backed. Supabase tokens are not copied into a second Luvia token store.

## Visible product result

The new `control-center-identity` route provides:

- profile-completion visualization;
- explicit preference summary;
- a clear explicit-vs-observed data-origin model;
- Auth Session and token-owner status;
- Web security-level transparency and native Keychain/Keystore path;
- four-port Native Readiness status;
- explicit, user-gesture-only notification permission activation;
- a visible `events.v1` delivery-policy explanation;
- direct access to the existing Reisekompass and Security/Data surfaces.

## Local verification

- browserless Identity State/Contract Core: **PASS**;
- browserless `events.v1` Core: **PASS**;
- Identity viewer private/Trip-field leakage: **0**;
- Profile direct browser-storage references: **4 -> 0**;
- Auth direct browser-storage references: **23 -> 0**;
- Profile direct Auth-provider session calls: **2 -> 0**;
- Web Platform Ports: **4/4**;
- notification automatic Domain Event delivery: **0**;
- Identity Center route/assets/responsive/reduced-motion checks: **PASS**;
- Timeline/Journey reservation: **PRESERVED**;
- focused M8 exit guard: **PASS**;
- M3.4 Identity Contract regression: **PASS**;
- NFR-0 Foundation Regression: **3/3 PASS**;
- controlled Safe Regression on the feature candidate: **48/48 PASS**.

## Explicit non-scope

- no database migration, schema/RPC/RLS/bucket change;
- no Edge Function, secret or manual Cloudflare configuration change;
- no Supabase token duplication or replacement of the provider-managed Web session;
- no Trip compatibility-field migration or Trip truth move;
- no observed-signal/AI Memory ownership move before M8.5;
- no Booking, Places, Media or Trip event-producer rewrite in this Platform-owner block;
- no APNs/FCM rollout; native delivery adapters remain later platform work;
- no broad App visual redesign outside the focused Control Center surface;
- no Timeline/Journey mutation, adoption or reclassification;
- no rewrite of the historical NFR-0 debt baseline.

## Rollback

Rollback is code-only: remove the two browserless cores, four Web port bindings and Identity Center, restore the previous Web profile/auth metadata paths, and restore the Identity adapter runtime surface. No canonical DB data or cloud configuration rollback is required.

## Release acceptance

- runtime release commit: `34808b0f35352e16d36040ae2090e976a08cb0b8`;
- App/Core: **13.82.23 / 4.82.23**;
- Platform, Integration and Main Safe Regression: **48/48 PASS**;
- Integration Preview: **21/21 byte exact**, **5/5 private-path SPA fallback**, authenticated Identity Center, active Trip, **25/25 authenticated F5**, console **0 warnings/errors**;
- Integration version/build/check: `d36c6bb8-541d-4a77-b6b6-13ccb6ac2cb4` / `d28bf78e-6bd8-48b1-90e6-3e36cb0c0a23` / `97178357197`, **SUCCESS**;
- Production: **21/21 byte exact**, **5/5 private-path SPA fallback**, **25/25 public F5**, console **0 warnings/errors**;
- Production version/deployment/build/check: `1472c0d6-d390-4a4d-b613-301399a5b620` / `18b1524e-1f8b-40c7-8821-bc09940f13b9` / `330ed0ca-9962-40b8-9638-ea2af03df70b` / `97179308782`, **SUCCESS**, **100% traffic**.

The selected Production browser had no authenticated Production-origin session. Authenticated product behavior was therefore measured in Integration, and Production equality was established by exact comparison of 21 Git blobs. No authenticated-Production result is claimed or inferred from HTTP status alone.

No database migration, schema/RPC/RLS/bucket mutation, Edge Function, secret, manual Production deployment or manual Cloudflare configuration change occurred. M8 is **COMPLETE / CLOSED**; M8.5 starts with a fresh read-only Intelligence classification and reachability baseline.
