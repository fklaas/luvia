# CURRENT BUILD

- App: **13.82.2**
- Core: **4.82.2**
- Name: **M5.1c Booking Inbox Trip Contract Adoption**
- Channel: **feature/platform-core release candidate**
- Datum: **2026-08-17**
- Milestone Status: **M5 IN PROGRESS**
- Parallel Development Status: **PARALLEL DEVELOPMENT READY**

## Current Scope

M5.1c lenkt die Trip-Liste und den Active-Trip-Read der produktiven Booking Inbox auf den bestehenden `trip.v1`-Contract.

`app/control-center/booking-inbox.js` liest die Trip-Liste über `listTrips()` und die aktive Reise über `getActiveTrip()`. Der Contract wird bei der tatsächlichen Nutzung lazy und V1-first aufgelöst; die Inbox besitzt weiterhin nur lokale UI-Auswahl und keine Trip-Truth, keinen Trip-Cache und keine Trip-Subscription.

Nicht Bestandteil dieses Slices sind Contract-/Adapteränderungen, DB/Functions, Membership-/Timeline-/Schedule-Projections, Booking Control Center, App-Shell/CSS, Legacy-Löschungen, Media-/OpenAI-Bereinigungen oder UI-Redesign.

Promotion bleibt verbindlich:

`feature/platform-core -> integration -> controlled regression -> integration preview -> main -> production`

## M5 Status

- M5.1a – Travel Identity Trip Contract Adoption: **COMPLETE / PRODUCTION VERIFIED / SIX STREAMS SYNCED**
- M5.1b – Gallery View Trip Contract Adoption: **COMPLETE / PRODUCTION VERIFIED / SIX STREAMS SYNCED**
- M5.1c – Booking Inbox Trip Contract Adoption: **IN PROGRESS / STAGING GATE PASS / NOT COMMITTED**
- M5 Durchführung Punkt 1 – weitere direkte Trip-Reads: **IN PROGRESS**
- M5 Durchführung Punkt 2 – Active Trip Context zentralisieren: **PENDING**
- M5 Durchführung Punkt 3 – Membership/Timeline/Schedule Reads: **PENDING**
- M5 Exit Gate: **NOT YET CLAIMED**

## M5.1c Feature Evidence

- Test-first boundary proof against unchanged Runtime: **EXPECTED RED — 0 / 3 PASS, caused by `LuviaTripStore`, `LuviaControlCenterTravelIdentity` and missing `trip.v1` usage**
- Existing controlled baseline before Runtime implementation: **18 / 18 PASS**
- JavaScript syntax checks for Runtime, focused test and controlled runner: **PASS**
- Targeted Booking Inbox Trip Contract regression after Runtime implementation: **3 / 3 PASS**
- Compatible Booking Actions / Intelligence boundary check: **PASS**
- Controlled safe regression on `feature/platform-core`: **19 / 19 PASS**
- Direct Inbox Store/Context/Travel-Identity references: **0**
- Direct Inbox DB/RPC, Trip-event, Trip-subscription and Trip-command references: **0**
- Cross-Core DB ownership debt growth: **NONE**
- Runtime diff: **3 insertions / 3 deletions in the approved Trip read helpers only**
- Controlled runner diff: **exactly one M5.1c entry; 19 unique paths; 0 duplicates**
- Release consistency (`13.82.2` / Core `4.82.2`): **PASS**
- Exact staged allowlist: **12 / 12 PASS; zero unstaged and zero untracked files; cached diff check PASS**
- Staged Runtime / runner / index gates: **3 / 3 Runtime numstat; one runner entry; 214 App cache tokens and unchanged asset/load order**
- Complete syntax, Contract, release, guardrail and controlled regression after staging: **PASS — 19 / 19**
- Implementation commit, Remote push, Integration, Preview, Main, Production and six-stream synchronization: **NOT YET CLAIMED**
- Database/Functions/Storage/Secrets impact: **NONE**

## M5.1b Release Evidence

- JavaScript syntax checks: **PASS**
- Targeted Gallery Trip Contract regression: **3 / 3 PASS**
- Controlled safe regression on feature, integration and main: **18 / 18 PASS on each branch**
- Direct Gallery TripStore/TripContext/AppState references: **0**
- Direct Gallery DB/RPC and legacy Trip-event references: **0**
- Cross-Core DB ownership debt growth: **NONE**
- Release consistency (`13.82.1` / Core `4.82.1`): **PASS**
- Implementation scope: **12 / 12 PCR-approved files**
- Implementation release commit: `68e7ff5433e4581eb3c19ef98934302736be84ec`
- Parent baseline: `0a2aa60564a75f4723ca11807905f669702e2437`
- Feature, integration and main promotion: **PASS — fast-forward only, no force push**
- Integration Preview static and authenticated runtime smoke: **PASS**
- Production static and authenticated runtime smoke: **PASS**
- Live browser evidence: active Trip, Gallery load/reload, 51 photos, 10 moments and console **0 errors / 0 warnings**
- Deterministic state-variation evidence: Trip switch, current-Trip download label and no-Trip fallback **3 / 3 PASS**
- Six active streams synchronized locally, in tracking refs and live on GitHub: **6 / 6 at `68e7ff54`, divergence `0 / 0`, clean trees**
- Database/Functions/Storage/Secrets impact: **NONE**

The 6 / 6 clean-tree statement records the runtime-release snapshot at `68e7ff54` before this four-file documentation closeout. The later closeout commit is not pre-claimed and must be inspected, promoted and synchronized separately.

## M5.1a Release Evidence

- Structural release gate: **PASS**
- JavaScript syntax checks: **PASS**
- Release consistency (`13.82.0` / Core `4.82.0`): **PASS**
- Targeted Travel Identity regression: **PASS**
- Safe Regression: **17 / 17 PASS**
- Cross-Core DB ownership debt growth: **NONE**
- Database/Functions/Storage/Secrets impact: **NONE**
- Release commit: `b4ffe88deddd726854f90e4fff48867deb3a91f9`
- Parent baseline: `de79c904a7aec99975acbf720abc3084714fb152`
- Feature, integration and main promotion: **PASS**
- Integration and main controlled regression: **17 / 17 PASS** on each branch
- Integration preview static and authenticated runtime smoke: **PASS**
- Production static and authenticated runtime smoke: **PASS**
- Six active streams synchronized locally and remotely: **6 / 6 at `b4ffe88d`, divergence `0 / 0`, clean trees**

## Previous M4 Baseline

- M4.1 – Parallel Repository Topology Foundation: **COMPLETE**
- M4.2 – Ownership & Cross-Core Repository Guardrails: **COMPLETE**
- M4.3 – Feature Flag & Regression Harness Foundation: **COMPLETE**
- M4.4 – Integration / Preview / Merge Proof: **COMPLETE**

**M4 – Parallel Development Foundation: COMPLETE**

**PARALLEL DEVELOPMENT READY: YES**

## Repository Topology

Verbindliche Branches:

- `main`
- `integration`
- `feature/platform-core`
- `feature/booking-core`
- `feature/consumer-experience`
- `feature/social-experience-graph`

Verbindlicher Promotionspfad:

`feature/* -> integration -> controlled regression -> integration preview -> main -> production`

Feature-Branches dürfen `integration` nicht umgehen.

## Current Production Runtime Release

App:

`13.82.1`

Core:

`4.82.1`

Production release commit:

`68e7ff5433e4581eb3c19ef98934302736be84ec`

Previous M5.1a Runtime Baseline (`13.82.0` / Core `4.82.0`):

`b4ffe88deddd726854f90e4fff48867deb3a91f9`

Previous M4.4 Runtime-/Hardening-Baseline (`13.81.9` / Core `4.81.9`):

`cc9a9c920f0163ecc0c102a7cece495c892b6249`

Darin enthalten:

- M4.1 Commit `52c70bd`
- M4.2 Commit `82497d7`
- M4.3 Commit `7963f6b`
- M4.4 Static Asset Hardening Commit `cc9a9c9`

## Safe Regression Baseline

Harness:

`tests/run-m4.3-safe-regression.cjs`

Bestätigter Umfang auf dem aktuellen Feature-Kandidaten:

- Total: **19**
- Passed: **19**
- Failed: **0**
- Suite: **PASS**

Der Harness wurde erfolgreich ausgeführt auf:

- `feature/platform-core`
- `integration`
- `main`

## Cross-Core Guardrail

Bestätigter Zustand:

- tracked JS/TS files: **327**
- static DB calls: **316**
- mapped cross-core debt: **26 / 26**
- unmapped DB-object debt: **39 / 39**
- dynamic DB calls: **27 / 27**

Es wurde kein Wachstum der bekannten Cross-Core-DB-Schuld festgestellt.

## Feature Flag Foundation

Platform besitzt die zentrale Feature-Flag-Mechanik.

Feature Flags:

- sind temporäre Rollout-Gates;
- besitzen Owner-Präfixe;
- sind bei unbekannten IDs fail-closed;
- ersetzen keine Capabilities;
- ersetzen keine Auth-/Privacy-/Permission-Entscheidungen;
- ersetzen keinen Product-Module-State;
- ersetzen keine Domain Truth;
- besitzen in M4.3/M4.4 keine frei veränderbare Runtime-Override-API.

## M5.1b Cloudflare Integration Preview

Preview:

`https://integration-luvia.njwnrvwbv5.workers.dev`

Confirmed for release commit `68e7ff5433e4581eb3c19ef98934302736be84ec`:

- Cloudflare Worker version: **184**;
- Cloudflare version ID: `5272ac11-6b95-4866-86fa-82b8dd610200`;
- HTTP 200;
- App 13.82.1 / Core 4.82.1;
- Service Worker `luvia-shell-v13.82.1`;
- `index.html`, kernel, Service Worker and Gallery source match the integration commit after line-ending normalization;
- Gallery source contains the `trip.v1` read path and zero direct `LuviaTripStore`, `LuviaTripContext` or `LuviaAppState` references;
- authenticated active Trip `Paris Hochzeitstag` and destination Paris loaded correctly;
- Gallery settled at 51 photos, 10 photo moments and Realtime active, with day counts 20 / 27 / 4 / 0;
- active Trip, Gallery content and release identity survived reload;
- browser console: zero errors and zero warnings;
- internal repository paths remain protected by the SPA fallback.

The authenticated browser smoke proves the deployed current-Trip, load and reload path. The focused 3 / 3 runtime test proves changed-Trip observation, current-Trip download labeling and the no-Trip fallback without mutating the cloud-synchronized user state.

Observed operationally: Gallery can temporarily show its loading state and zero photos before Realtime/media loading settles. On Preview it settled after roughly 9–15 seconds. M5.1b changes neither Gallery loading nor Media/Realtime behavior.

## Previous M5.1a Cloudflare Integration Preview Baseline

Preview:

`https://integration-luvia.njwnrvwbv5.workers.dev`

Confirmed for commit `b4ffe88deddd726854f90e4fff48867deb3a91f9`:

- HTTP 200;
- App 13.82.0 / Core 4.82.0;
- Service Worker `luvia-shell-v13.82.0`;
- Travel Identity source consumes `trip.v1` and the versioned Trip event;
- authenticated active Trip and Control Center projection load correctly before and after reload;
- browser console: zero errors and zero warnings;
- internal repository paths remain protected by the SPA fallback.

The Cloudflare version ID was not available through the local authenticated tooling. No version ID is claimed for M5.1a; the deployed artifact and runtime were verified directly.

## Previous M4.4 Cloudflare Integration Preview Baseline

Nicht-Production-Branches werden durch Cloudflare Workers Builds als Worker-Versionen hochgeladen.

Für `integration` wurde erfolgreich bestätigt:

- Branch: `integration`
- Commit: `cc9a9c9`
- Deployment-Befehl: `npx wrangler versions upload`
- Worker Version ID: `68de6497-912e-4b14-937a-2810b8979927`
- stabiler Preview Alias: `https://integration-luvia.njwnrvwbv5.workers.dev`

Der erste automatische Integration-Build lief in einen Cloudflare-Initialisierungs-Timeout. Der Retry desselben Commits war vollständig erfolgreich. Es lag kein reproduzierbarer Luvia-Codefehler vor.

## Production

Production:

`https://myluvia.app`

Confirmed M5.1b production release commit:

`68e7ff5433e4581eb3c19ef98934302736be84ec`

Cloudflare production identity:

- Worker version: **185**;
- version ID: `14a8e2eb-385b-4e2a-80bb-e8056952a991`;
- deployment ID: `749d237e-47ce-4e71-a1e9-349e4fb9cbc4`;
- active traffic: **100 %**;
- version URL: `https://14a8e2eb-luvia.njwnrvwbv5.workers.dev`.

Production was verified directly after the successful `main` promotion:

- HTTP 200;
- App 13.82.1 / Core 4.82.1;
- Service Worker `luvia-shell-v13.82.1`;
- live `index.html`, kernel, Service Worker and Gallery source match the clean `main` release after line-ending normalization;
- authenticated active Trip `Paris Hochzeitstag` and destination Paris loaded;
- Timeline loaded with three entries;
- Gallery settled at 51 photos, 10 photo moments and Realtime active, with day counts 20 / 27 / 4 / 0;
- Trip identity, Timeline and Gallery survived reload;
- browser console: zero errors and zero warnings;
- internal repository paths remained protected by the SPA fallback.

The focused 3 / 3 runtime gate supplies the deliberately non-persistent changed-Trip, download-label and no-Trip variants. No cloud-synchronized Trip selection was changed merely to manufacture browser evidence.

Observed operationally: Production Gallery initially displayed its loading/zero state and settled after roughly 20 seconds. One exact text locator timed out after reload even though the final DOM already contained the complete correct state; the final evidence was read from the main view and all four day buttons. This did not reproduce as an application failure.

## Previous M5.1a Production Baseline

- release commit: `b4ffe88deddd726854f90e4fff48867deb3a91f9`;
- App 13.82.0 / Core 4.82.0;
- authenticated active Trip, Control Center identity, Trip surface, three Timeline entries and reload persistence verified;
- browser console: zero errors and zero warnings;
- internal repository paths protected by the SPA fallback;
- no Cloudflare version ID was claimed because it was not available through the authenticated tooling used for M5.1a.

Previous confirmed M4.4 Cloudflare production version:

`f61d9b23-9ea4-43f8-b318-83c44789341d`

## Static Asset Hardening

Während M4.4 wurde festgestellt, dass `wrangler.jsonc` das Repository-Root als Static-Asset-Verzeichnis verwendet:

`"directory": "."`

Production lieferte dadurch interne Repository-Dateien direkt aus.

Nachgewiesenes Beispiel vor dem Fix:

`https://myluvia.app/DEPLOYMENT-M3.4.md`

Ergebnis vor Hardening:

- HTTP 200
- `Content-Type: text/markdown`
- interner Deployment-Inhalt öffentlich erreichbar

Die bestehende `.assetsignore` wurde deshalb erweitert.

Ausgeschlossen werden unter anderem:

- `.assetsignore`
- `wrangler.jsonc`
- `supabase/**`
- `tests/**`
- `docs/**`
- `tools/**`
- `*.md`
- `*.sql`
- `*.txt`
- historische `test-results-*.json`

Nach dem Fix wurde sowohl lokal als auch remote bestätigt, dass interne Pfade nicht mehr direkt ausgeliefert werden.

## Asset Security Smokes

Bestätigte interne Testpfade:

- `/DEPLOYMENT-M3.4.md`
- `/supabase/migrations/_headers`
- `/tests/run-m4.3-safe-regression.cjs`

Erwartetes und bestätigtes Verhalten:

- HTTP 200 aufgrund SPA-Fallback
- `Content-Type: text/html`
- Response entspricht `index.html`
- interne Datei wird nicht direkt ausgeliefert

Bestätigt auf:

- lokalem Wrangler Runtime Proof
- manuellem isoliertem Preview-Test
- automatischem `integration` Preview
- Production `myluvia.app`

## Redundanter Test-Worker

Für die initiale M4.4-Erprobung wurde kurzfristig ein separater Worker erstellt:

`luvia-integration`

Version:

`f54d23ff-d692-40c0-bda1-faf98fc7fe0b`

Nachdem der vorhandene automatische Cloudflare-Branch-Preview-Pfad vollständig nachgewiesen war, wurde dieser zusätzliche Worker wieder gelöscht.

Post-Delete-Verifikation:

Cloudflare API Code `10007` – Worker existiert nicht mehr.

Damit verbleibt keine zweite Deployment-Wahrheit.

## Backend / Database / Secrets

Für M4.4:

- Datenbankmigration: **NEIN**
- SQL-Deployment: **NEIN**
- Supabase Edge Function Änderung: **NEIN**
- Supabase Secret Änderung: **NEIN**
- Cloudflare Secret Änderung: **NEIN**
- Storage Schema Änderung: **NEIN**
- remote-only `luvia-media-delivery`: **UNANGETASTET**

## Completion

Mit Promotion dieser formalen Abschlussdokumentation über den nachgewiesenen Pfad

`feature/platform-core -> integration -> main`

ist M4 vollständig abgeschlossen.

Nächster Architektur-Meilenstein:

**M5 – Trip Core Isolation**

## M5.1a Slice Completion

M5.1a – Travel Identity Trip Contract Adoption is complete for implementation, promotion, preview, production and active-stream synchronization.

## M5.1b Slice Completion

M5.1b – Gallery View Trip Contract Adoption is complete for implementation, controlled validation, promotion, Preview, Production and runtime-release synchronization.

The acceptance evidence is intentionally split: authenticated Preview/Production browser smokes prove the deployed current-Trip Gallery path, while the deterministic 3 / 3 runtime gate proves changed-Trip observation, download labeling and the no-Trip fallback without changing cloud-synchronized user truth.

M5 itself remains **IN PROGRESS**. The M5 exit gate remains unclaimed.

Next scope:

**M5.1c – complete the approved release-evidence, exact staging and implementation-commit gates for the already green Booking Inbox Trip Contract candidate. Integration, Preview, Main, Production and six-stream synchronization remain unclaimed.**
