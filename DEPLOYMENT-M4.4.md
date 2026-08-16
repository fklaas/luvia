# Deployment M4.4 – Integration / Preview / Merge Proof

## 1. Release-Übersicht

- App-Version: **13.81.9**
- Core-Version: **4.81.9**
- Milestone: **M4.4**
- Parent Milestone: **M4 – Parallel Development Foundation**
- Datum: **2026-08-15**
- Runtime-/Hardening-Baseline: `cc9a9c920f0163ecc0c102a7cece495c892b6249`

## 2. Deployment-Ziel

M4.4 beweist einen reproduzierbaren und kontrollierten Promotionspfad:

`feature/* -> integration -> regression -> preview -> main -> production`

M4.4 führt keine Datenbank- oder Backendmigration durch.

## 3. Git Source of Truth

Git bleibt die einzige Source of Truth.

ZIP-Dateien sind ausschließlich Release-/Handoff-Artefakte und keine Entwicklungsquelle.

## 4. Branch Topology

Verbindliche Branches:

- `main`
- `integration`
- `feature/platform-core`
- `feature/booking-core`
- `feature/consumer-experience`
- `feature/social-experience-graph`

## 5. Merge Rule

Feature-Streams dürfen `main` nicht direkt umgehen.

Verbindlicher Weg:

`feature/* -> integration -> main`

Vor Promotion zu `main` muss der Integration-Stand geprüft werden.

## 6. M4.4 Runtime Baseline

M4.4 Runtime-/Hardening-Baseline:

`cc9a9c920f0163ecc0c102a7cece495c892b6249`

Commit:

`fix: harden static asset deployment boundaries`

Vorherige M4 Commits:

- `52c70bd` – M4.1
- `82497d7` – M4.2
- `7963f6b` – M4.3

## 7. Feature nach Integration

Der M4.1–M4.3 Platform-Stand wurde per Fast-Forward nach `integration` übernommen.

Anschließend wurde M4.4 Static Asset Hardening erneut über `feature/platform-core -> integration` promoted.

Kein Merge-Commit und keine Konfliktauflösung waren erforderlich.

## 8. Integration Regression

Befehl:

`node .\tests\run-m4.3-safe-regression.cjs`

Bestätigtes Ergebnis:

- Total: 17
- Passed: 17
- Failed: 0
- Suite: PASS

## 9. Integration Remote Verification

Bestätigter Integration SHA:

`cc9a9c920f0163ecc0c102a7cece495c892b6249`

Local und `origin/integration` waren identisch.

## 10. Cloudflare Build Configuration

Die Runtime nutzt:

`wrangler.jsonc`

Konfiguration:

- Worker: `luvia`
- Compatibility Date: `2026-08-06`
- Static Assets Directory: `.`
- SPA Not Found Handling: `single-page-application`

## 11. Automatic Integration Preview

Cloudflare Workers Builds verarbeitet Nicht-Production-Branches als Worker-Versionen.

Für `integration` wurde bestätigt:

Deployment Command:

`npx wrangler versions upload`

Erfolgreiche Version:

`68de6497-912e-4b14-937a-2810b8979927`

Stabiler Preview Alias:

`https://integration-luvia.njwnrvwbv5.workers.dev`

Version Preview:

`https://68de6497-luvia.njwnrvwbv5.workers.dev`

## 12. Integration Build Retry

Der erste automatische Build für `integration` und Commit `cc9a9c9` scheiterte vor Clone/Install/Deploy mit:

`Build failed to initialize and was timed out`

Der identische Build wurde erneut gestartet.

Retry Ergebnis:

- Initialization: PASS
- Clone: PASS
- Installation: PASS
- Deployment: PASS
- Gesamt: PASS

Damit lag kein reproduzierbarer Luvia-Codefehler vor.

## 13. Integration Preview Smoke

Preview:

`https://integration-luvia.njwnrvwbv5.workers.dev`

Bestätigt:

- `index.html`: HTTP 200
- Content-Type: `text/html`
- App 13.81.9 vorhanden
- `sw.js`: HTTP 200
- `luvia-shell-v13.81.9` vorhanden

## 14. Static Asset Exposure Discovery

Vor dem Production-Promotionsabschluss wurde die bestehende Static-Asset-Konfiguration geprüft.

`wrangler.jsonc` verwendet:

`"directory": "."`

Die damalige `.assetsignore` schloss nur wenige technische Verzeichnisse aus.

Production-Test:

`https://myluvia.app/DEPLOYMENT-M3.4.md`

Ergebnis vor Hardening:

- HTTP 200
- Content-Type `text/markdown`
- interner Deployment-Inhalt direkt erreichbar

Dies wurde als bestehende Deployment-Schwachstelle behandelt.

## 15. Dependency Safety Check

Vor Erweiterung der `.assetsignore` wurde geprüft, ob Runtime-Code interne Entwicklungs-/Dokumentationsartefakte tatsächlich benötigt.

Es wurden keine belegten Runtime-Abhängigkeiten auf folgende Bereiche gefunden:

- `docs/`
- `tools/`
- `tests/`
- lokale `supabase/` Entwicklungsstruktur
- interne Markdown-/SQL-/TXT-Dokumentation

False Positives wie Supabase CDN URLs und historische Testresultate wurden getrennt bewertet.

## 16. .assetsignore Hardening

Ergänzt wurden Regeln für:

- `.assetsignore`
- `wrangler.jsonc`
- `supabase/**`
- `tests/**`
- `docs/**`
- `tools/**`
- `*.md`
- `*.sql`
- `*.txt`
- `test-results-*.json`
- `TEST-RESULTS-*.json`

## 17. Local Runtime Proof

Wrangler wurde lokal gestartet.

Geprüfte Pfade:

- `/DEPLOYMENT-M3.4.md`
- `/supabase/migrations/_headers`
- `/tests/run-m4.3-safe-regression.cjs`

Für alle drei:

- HTTP 200
- Content-Type `text/html`
- SPA fallback `True`
- direkte interne Asset-Auslieferung verhindert

Ergebnis:

**PASS**

## 18. Platform Regression nach Hardening

Nach `.assetsignore` Hardening:

- Total: 17
- Passed: 17
- Failed: 0
- Suite: PASS

## 19. Platform Commit

Commit:

`cc9a9c920f0163ecc0c102a7cece495c892b6249`

Message:

`fix: harden static asset deployment boundaries`

Local und `origin/feature/platform-core` wurden anschließend als identisch bestätigt.

## 20. Hardening nach Integration

Divergenz vor Merge:

`0 1`

Fast-Forward:

`7963f6b -> cc9a9c9`

Anschließend erneut:

- Integration Regression 17/17 PASS
- Working Tree clean
- Push zu `origin/integration`
- Remote SHA Verify PASS

## 21. Integration nach Main

Vor Main-Merge:

- local main = `db1a82c5e6a994a2aa33cb67eb4ae7855495de5f`
- origin/main = `db1a82c5e6a994a2aa33cb67eb4ae7855495de5f`
- origin/integration = `cc9a9c920f0163ecc0c102a7cece495c892b6249`
- Divergenz = `0 4`

Fast-Forward:

`db1a82c -> cc9a9c9`

Kein Merge-Konflikt.

## 22. Main Regression

Nach Integration -> Main:

- Total: 17
- Passed: 17
- Failed: 0
- Suite: PASS

## 23. Main Push

Main wurde zu GitHub gepusht.

Remote Verification:

Local:

`cc9a9c920f0163ecc0c102a7cece495c892b6249`

Remote:

`cc9a9c920f0163ecc0c102a7cece495c892b6249`

Result:

**PASS**

## 24. Automatic Production Deployment

Der erfolgreiche Cloudflare `main` Build führte automatisch zur Production-Promotion.

Production Version:

`f61d9b23-9ea4-43f8-b318-83c44789341d`

Wrangler Version Metadata:

- version number: 164
- source: `wrangler`
- triggered_by: `version_upload`
- created_on: `2026-08-15T19:46:50.767963Z`

Dashboard Build History bestätigte den erfolgreichen `main` Build für Commit `cc9a9c9`.

## 25. Production Runtime Verify

Production:

`https://myluvia.app`

Bestätigt:

- HTTP 200
- Content-Type `text/html`
- App 13.81.9 vorhanden
- Service Worker 13.81.9 vorhanden

## 26. Production Asset Security Verify

Nach Hardening:

`/DEPLOYMENT-M3.4.md`

liefert nicht mehr den Markdown-Inhalt.

Bestätigt:

- HTTP 200
- Content-Type `text/html`
- SPA fallback `True`

Damit ist der zuvor nachgewiesene direkte interne Asset-Zugriff geschlossen.

## 27. Automatic Preview Asset Security Verify

Automatische Integration Preview:

`https://integration-luvia.njwnrvwbv5.workers.dev`

Bestätigte Pfade:

- `/DEPLOYMENT-M3.4.md`
- `/supabase/migrations/_headers`
- `/tests/run-m4.3-safe-regression.cjs`

Für alle:

- Content-Type `text/html`
- SPA fallback `True`
- direkte interne Asset-Auslieferung verhindert

## 28. Temporary Manual Worker

Für die erste Preview-Erprobung wurde temporär angelegt:

Worker:

`luvia-integration`

Version:

`f54d23ff-d692-40c0-bda1-faf98fc7fe0b`

Message:

`M4.4 integration preview cc9a9c9`

Nachdem der automatische Cloudflare Branch Preview Pfad bewiesen war, wurde dieser Worker als redundant klassifiziert.

## 29. Temporary Worker Cleanup

Delete Dry Run wurde durchgeführt.

Anschließend:

`npx wrangler delete luvia-integration`

Cloudflare bestätigte:

`Successfully deleted luvia-integration`

Post-Delete Check:

Cloudflare API:

`Worker does not exist ... code 10007`

Ergebnis:

**PASS**

## 30. Post-Cleanup Live Verify

Production:

**PASS**

Integration Preview:

**PASS**

Beide lieferten:

- HTTP 200
- App 13.81.9
- Internal Asset Guard aktiv

## 31. Backend / DB / Secret Status

M4.4 benötigt:

- keine DB-Migration
- kein SQL-Deployment
- keine Supabase Edge Function Änderung
- keine Supabase Secret Änderung
- keine Cloudflare Secret Änderung
- keine Storage Schema Änderung

`luvia-media-delivery` bleibt unangetastet.

## 32. Rollback

Git-Rollback basiert auf dem letzten stabilen Main-Stand vor M4:

`db1a82c5e6a994a2aa33cb67eb4ae7855495de5f`

Cloudflare vorherige bestätigte Production Version:

`c7918e34-e461-4c16-8d88-67c4207e6e5c`

Ein Rollback darf nur kontrolliert durchgeführt werden und muss anschließend erneut durch Production-Smokes verifiziert werden.

## 33. Finaler Promotionspfad

Die formale Abschlussdokumentation wird erneut über den nun bewiesenen Pfad geführt:

`feature/platform-core -> integration -> main`

Nach erfolgreicher Promotion gilt:

**M4 – Parallel Development Foundation: COMPLETE**

**PARALLEL DEVELOPMENT READY: YES**

## 34. Nächster Meilenstein

**M5 – Trip Core Isolation**

M5 beginnt erst nach dem formalen M4.4 Exit Gate.
