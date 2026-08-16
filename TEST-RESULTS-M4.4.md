# Test Results M4.4 – Integration / Preview / Merge Proof

## Release

- App: **13.81.9**
- Core: **4.81.9**
- Milestone: **M4.4**
- Datum: **2026-08-15**
- Runtime-/Hardening-Baseline: `cc9a9c920f0163ecc0c102a7cece495c892b6249`

## 1. Testziel

M4.4 muss beweisen, dass parallele Feature-Streams kontrolliert über `integration` bis `main` und Production promoted werden können.

Zusätzlich müssen Regression, Preview, Deployment-Isolation und Cleanup nachweisbar sein.

## 2. Integration Preflight

Vor erster Promotion:

- `integration` clean
- Integration HEAD `db1a82c5e6a994a2aa33cb67eb4ae7855495de5f`
- Platform remote `7963f6bd85852157a7ea410d075a00ffe4a066b0`
- Divergenz `0 3`

Result:

**PASS**

## 3. M4.1–M4.3 Feature nach Integration

Fast-Forward:

`db1a82c -> 7963f6b`

Result:

**PASS**

## 4. Integration Regression – erster Lauf

Harness:

`tests/run-m4.3-safe-regression.cjs`

Result:

- Total: 17
- Passed: 17
- Failed: 0
- Suite: PASS

## 5. Integration Remote Verify

Local und `origin/integration`:

`7963f6bd85852157a7ea410d075a00ffe4a066b0`

Result:

**PASS**

## 6. Wrangler Version

Wrangler:

`4.123.0`

Result:

**PASS**

## 7. Deployment Dry Run

Separater Preview-Name:

`luvia-integration`

Dry Run:

**PASS**

Kein Upload während Dry Run.

## 8. Production Internal Asset Exposure Discovery

Production Test:

`/DEPLOYMENT-M3.4.md`

Vor Hardening:

- Status 200
- Content-Type `text/markdown`
- interner Inhalt direkt ausgeliefert

Result:

**SECURITY ISSUE CONFIRMED**

## 9. Internal Asset Dependency Review

Prüfung auf Runtime-Abhängigkeiten von:

- `supabase/`
- `tests/`
- `docs/`
- `tools/`
- `.md`
- `.sql`
- `.txt`

Nach Präzisierung wurden keine echten Runtime-Ladevorgänge für die später ausgeschlossenen internen Artefakte belegt.

Result:

**PASS**

## 10. Static Asset Hardening Scope

Geändert:

`.assetsignore`

Initialer Scope:

- genau eine Datei
- 22 Insertions
- `git diff --check` ohne Fehler

Result:

**PASS**

## 11. Local Asset Runtime Proof

Geprüft:

`/DEPLOYMENT-M3.4.md`

- Status 200
- `text/html`
- SPA fallback True

Result: PASS

Geprüft:

`/supabase/migrations/_headers`

- Status 200
- `text/html`
- SPA fallback True

Result: PASS

Geprüft:

`/tests/run-m4.3-safe-regression.cjs`

- Status 200
- `text/html`
- SPA fallback True

Result: PASS

Gesamt:

**PASS**

## 12. Platform Regression nach Hardening

- Total: 17
- Passed: 17
- Failed: 0
- Suite: PASS

## 13. Cross-Core Guardrail

- tracked JS/TS files: 327
- static DB calls: 316
- mapped cross-core debt: 26 / 26
- unmapped DB-object debt: 39 / 39
- dynamic DB calls: 27 / 27

Kein Debt Growth.

Result:

**PASS**

## 14. Hardening Commit

Commit:

`cc9a9c920f0163ecc0c102a7cece495c892b6249`

Message:

`fix: harden static asset deployment boundaries`

Result:

**PASS**

## 15. Platform Remote Verify

Local:

`cc9a9c920f0163ecc0c102a7cece495c892b6249`

Remote:

`cc9a9c920f0163ecc0c102a7cece495c892b6249`

Result:

**PASS**

## 16. Hardening Integration Merge

Vor Merge:

Divergenz:

`0 1`

Fast-Forward:

`7963f6b -> cc9a9c9`

Result:

**PASS**

## 17. Integration Regression – finaler Hardening Stand

- Total: 17
- Passed: 17
- Failed: 0
- Suite: PASS

Result:

**PASS**

## 18. Integration Working Tree

Nach Regression:

`integration...origin/integration [ahead 1]`

Keine zusätzlichen Dateien.

Result:

**PASS**

## 19. Integration Push

Push:

`7963f6b..cc9a9c9 integration -> integration`

Remote SHA:

`cc9a9c920f0163ecc0c102a7cece495c892b6249`

Result:

**PASS**

## 20. Manual Isolated Preview

Temporärer Worker:

`luvia-integration`

Version:

`f54d23ff-d692-40c0-bda1-faf98fc7fe0b`

Deploy:

**PASS**

## 21. Manual Preview Remote Smoke

Preview lieferte:

- HTTP 200
- App 13.81.9
- drei interne Testpfade als SPA fallback
- keine direkte interne Asset-Auslieferung

Result:

**PASS**

## 22. Main Pre-Merge

Main:

`db1a82c5e6a994a2aa33cb67eb4ae7855495de5f`

Origin Main:

`db1a82c5e6a994a2aa33cb67eb4ae7855495de5f`

Integration:

`cc9a9c920f0163ecc0c102a7cece495c892b6249`

Divergenz:

`0 4`

Result:

**PASS**

## 23. Integration nach Main

Fast-Forward:

`db1a82c -> cc9a9c9`

Result:

**PASS**

## 24. Main Regression

- Total: 17
- Passed: 17
- Failed: 0
- Suite: PASS

Result:

**PASS**

## 25. Main Working Tree

Nach Regression:

`main...origin/main [ahead 4]`

Keine zusätzlichen Dateien.

Result:

**PASS**

## 26. Main Push

Push:

`db1a82c..cc9a9c9 main -> main`

Result:

**PASS**

## 27. Main Remote Verify

Local:

`cc9a9c920f0163ecc0c102a7cece495c892b6249`

Remote:

`cc9a9c920f0163ecc0c102a7cece495c892b6249`

Result:

**PASS**

## 28. Production Auto-Deploy Discovery

Nach Main Push erschien eine neue Production Deployment Version:

`f61d9b23-9ea4-43f8-b318-83c44789341d`

Wrangler Metadata:

- source `wrangler`
- triggered_by `version_upload`
- version number 164

Dashboard Build History bestätigte den erfolgreichen `main` Build für `cc9a9c9`.

Result:

**PASS**

## 29. Production Runtime Smoke

Production:

`https://myluvia.app`

- Index Status 200
- Content-Type text/html
- 13.81.9 vorhanden

Result:

**PASS**

## 30. Production Service Worker Smoke

- Status 200
- `luvia-shell-v13.81.9` vorhanden

Result:

**PASS**

## 31. Production Asset Security Smoke

`/DEPLOYMENT-M3.4.md`

Nach Hardening:

- Status 200
- Content-Type text/html
- SPA fallback True

Result:

**PASS**

## 32. Automatic Integration Build

Erster Versuch:

Cloudflare Build initialization timeout.

Retry:

- Initialization PASS
- Clone PASS
- Installation PASS
- Deployment PASS

Result:

**PASS**

## 33. Automatic Integration Version

Version ID:

`68de6497-912e-4b14-937a-2810b8979927`

Preview Alias:

`https://integration-luvia.njwnrvwbv5.workers.dev`

Result:

**PASS**

## 34. Automatic Integration Preview Smoke

- Index 200
- App 13.81.9
- SW 13.81.9

Interne Pfade:

- `/DEPLOYMENT-M3.4.md`
- `/supabase/migrations/_headers`
- `/tests/run-m4.3-safe-regression.cjs`

Für alle:

- Content-Type text/html
- SPA fallback True

Result:

**PASS**

## 35. Temporary Worker Cleanup

Worker:

`luvia-integration`

Delete:

**PASS**

Post Delete:

Cloudflare API Code 10007 – Worker existiert nicht.

Result:

**PASS**

## 36. Real Worker Post-Cleanup

Worker:

`luvia`

Aktive Production Deployment Version:

`f61d9b23-9ea4-43f8-b318-83c44789341d`

Result:

**PASS**

## 37. Post-Cleanup Production Verify

- Status 200
- App 13.81.9
- interne Datei blockiert

Result:

**PASS**

## 38. Post-Cleanup Integration Preview Verify

- Status 200
- App 13.81.9
- interne Datei blockiert

Result:

**PASS**

## 39. Backend / DB / Secrets

- DB Migration: NO
- SQL Deployment: NO
- Supabase Edge Function Change: NO
- Supabase Secret Change: NO
- Cloudflare Secret Change: NO
- Storage Schema Change: NO
- `luvia-media-delivery`: unchanged

Result:

**PASS**

## 40. Final M4.4 Technical Result

Regression:

**17 / 17 PASS**

Integration Preview:

**PASS**

Production:

**PASS**

Static Asset Hardening:

**PASS**

Branch Promotion:

**PASS**

Temporary Infrastructure Cleanup:

**PASS**

M4.4 TECHNICAL GATE:

**PASS**

Nach Promotion dieser Abschlussdokumentation:

**M4 COMPLETE**

**PARALLEL DEVELOPMENT READY: YES**
