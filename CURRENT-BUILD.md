# CURRENT BUILD

- App: **13.82.0**
- Core: **4.82.0**
- Name: **M5.1a Travel Identity Trip Contract Adoption**
- Channel: **controlled promotion candidate**
- Datum: **2026-08-16**
- Milestone Status: **M5 IN PROGRESS**
- Parallel Development Status: **PARALLEL DEVELOPMENT READY**

## Current Scope

M5.1a lenkt die erste produktive Control-Center-Projektion auf den bestehenden `trip.v1`-Contract.

`LuviaControlCenterTravelIdentity` liest Reiseliste und aktive Reise nicht mehr direkt aus `LuviaTripStore` oder `LuviaTripContext`. Phase und Reisetag bleiben bis M5 Durchführung Punkt 2 im abgeleiteten `LuviaTravelContext`.

Nicht Bestandteil dieses Slices sind Contract-/Adapteränderungen, DB/Functions, Membership-/Timeline-/Schedule-Projections, Booking-/Inbox-Migrationen, Legacy-Löschungen oder UI-Redesign.

Promotion bleibt verbindlich:

`feature/platform-core -> integration -> controlled regression -> integration preview -> main -> production`

## M5 Status

- M5.1a – Travel Identity Trip Contract Adoption: **IMPLEMENTED / LOCAL VALIDATION PASS**
- M5 Durchführung Punkt 1 – weitere direkte Trip-Reads: **PENDING**
- M5 Durchführung Punkt 2 – Active Trip Context zentralisieren: **PENDING**
- M5 Durchführung Punkt 3 – Membership/Timeline/Schedule Reads: **PENDING**
- M5 Exit Gate: **NOT YET CLAIMED**

## M5.1a Local Evidence

- Structural release gate: **PASS**
- JavaScript syntax checks: **PASS**
- Release consistency (`13.82.0` / Core `4.82.0`): **PASS**
- Targeted Travel Identity regression: **PASS**
- Safe Regression: **17 / 17 PASS**
- Cross-Core DB ownership debt growth: **NONE**
- Database/Functions/Storage/Secrets impact: **NONE**
- Commit / Push / Integration / Preview / Production: **PENDING**

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

## Current Runtime Release

App:

`13.82.0`

Core:

`4.82.0`

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

Bestätigter Umfang:

- Total: **17**
- Passed: **17**
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

## Cloudflare Integration Preview

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

Bestätigte Cloudflare Production Version:

`f61d9b23-9ea4-43f8-b318-83c44789341d`

Der erfolgreiche `main`-Build desselben M4.4-Standes führte automatisch zur Production-Promotion.

Production wurde anschließend live verifiziert:

- HTTP 200
- App 13.81.9 vorhanden
- Service Worker `luvia-shell-v13.81.9`
- Static Asset Hardening aktiv

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
