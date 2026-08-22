# PCR M6 FINAL — Places Core Isolation

Status: **FEATURE IMPLEMENTATION COMPLETE / PROMOTION PENDING**

Baseline / source-lock marker: `ecf3fc25abc25d11a9a1fbe4c9bacf4b4fa77f21`

Owner stream: `feature/platform-core`

## Read-only exit audit

M6.1 and M6.2 established the physical Place catalog state owner and the single trip-scoped Place/TripPlace runtime projection owner. The remaining M6 exit gap was not another state move. It was the absence of one browserless domain surface that stabilized search, get, saved, recommend, lifecycle, category routing, and deep-link semantics while keeping Web/device capabilities outside Places domain code.

The measured pre-mutation gaps were:

- category definitions and routing were duplicated in the Places UI foundation instead of being supplied by a declarative Domain Registry;
- the active Places foundation reached provider, Intelligence, collection, storage, navigation, and device behavior through Web globals;
- location and lifecycle paths used direct browser capability checks instead of formal Platform Ports;
- the Places/Intelligence recommendation path was composed inside the Places UI foundation;
- the public `places.v1` surface did not expose saved, recommend, category routing, deep-link, or full import/lifecycle behavior needed by the active path;
- there was no browserless M6 exit test proving the combined Places contract and native-readiness boundary.

Timeline/Journey was separately classified as the reserved cross-domain aggregator and excluded from ordinary Places-consumer treatment.

## Locked implementation scope

The M6 exit block performs one contract-first boundary closure:

- add `core/places/places-domain-contract-core.js` as the browserless Places projection, category, discovery-route, and deep-link rule surface;
- make its ten-entry declarative Category Registry the single source for category semantics;
- extend the existing `places.v1` compatibility adapter with saved, recommend, category, routing, deep-link, import, plan, and lifecycle operations;
- register Web implementations of Location, Permission, Network, DeepLink, ExternalNavigation, and OfflineCache ports in `app/adapters/platform-port-adapters.mjs`;
- isolate provider lookup plus Intelligence interpretation/ranking in `app/adapters/places-discovery-adapter.js` without moving Places truth to Intelligence;
- migrate the active Places foundation to the public Places and Trip contracts plus injected Platform Ports;
- remove direct `navigator.geolocation` and online-state checks from the locked location, visit, and lifecycle core paths;
- retain asset order in the application shell, service worker, and Intelligence harness;
- add a browserless focused M6 exit guard and increment the controlled Safe Regression suite to 42 tests.

## Ownership and native-first result

Places remains the sole owner of Place truth, normalized Place projections, lifecycle semantics, and category/discovery rules. Intelligence owns interpretation and ranking only. Consumer/Experience owns the Category UI only. The Web adapter layer owns browser/device integration but no Domain Truth.

The new Places Domain Contract Core has no `window`, `document`, `navigator`, DOM event, browser storage, direct navigation, Supabase, private Trip store, or private Trip context dependency. Device location is supplied as context through LocationPort. Offline session caching, network state, Deep Links, and external navigation are supplied through formal ports.

`window.LuviaPlaces` remains a Web compatibility binding. It is not reclassified as the final platform-neutral contract target.

## Explicit non-scope

- no Timeline/Journey mutation or ownership reclassification;
- no database migration, schema/RPC change, Edge Function change, secret change, or Cloudflare configuration change;
- no Places persistence-truth move and no second Places store;
- no Experience redesign or Category UI ownership move;
- no Trip truth duplication or private Trip Store shortcut;
- no rewrite of the historical `config/luvia-native-readiness-debt.json` NFR-0 evidence snapshot.

## Local validation evidence

- focused M6 exit browserless/domain/port guard: **PASS**;
- canonical category registry: **10 / 10 PASS**;
- direct `navigator` dependencies in locked Places/location/lifecycle paths: **0**;
- Category UI private owner/device bypasses: **0**;
- Places Contract Adapter regression: **PASS**;
- NFR-0 Foundation Regression: **3 / 3 PASS**;
- controlled Safe Regression on `feature/platform-core`: **42 / 42 PASS**;
- cross-core database ownership debt: unchanged from the accepted NFR-0 baseline;
- browser-dependent additions under locked core roots: **0**;
- historical NFR-0 debt baseline edits: **0**.

The first guard run correctly rejected browser-dependent adapters placed under locked `core/` paths. They were moved to the Web app adapter layer, and the historical debt baseline was not widened or rewritten.

The non-allowlisted `tests/m3.2-places-contract-release-integration.test.cjs` remains a historical release-literal artifact: it hard-codes Core `4.81.6` while the accepted pre-M6-exit runtime is Core `4.82.16`. Its version assertion is not counted as a current architectural regression and is not rewritten into a passing claim.

## Promotion and release evidence

Pending feature commit, Integration runtime release, Preview acceptance, Main promotion, Production acceptance, and final eight-stream synchronization.

## Rollback

Rollback is commit-only: restore the prior Places foundation and contract adapter, remove the browserless Domain Contract Core and Web adapters, restore the prior location/lifecycle browser bindings, and remove the new asset-list and test entries. No database or data rollback is required.
