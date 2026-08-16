# Release Notes M4.4 – Integration / Preview / Merge Proof

## Release

- App: **13.81.9**
- Core: **4.81.9**
- Datum: **2026-08-15**
- Milestone: **M4.4**
- Übergeordneter Meilenstein: **M4 – Parallel Development Foundation**
- Runtime-/Hardening-Baseline: `cc9a9c920f0163ecc0c102a7cece495c892b6249`

## Überblick

M4.4 beweist erstmals den vollständigen operativen Luvia-Promotionspfad von einem Feature-Stream bis Production.

Der nachgewiesene Weg lautet:

`feature/platform-core -> integration -> Regression -> Cloudflare Preview -> main -> Production`

Damit ist die technische Grundlage geschaffen, damit mehrere Luvia-Streams parallel arbeiten können, ohne direkte Feature-zu-Production-Pfade oder unkontrollierte Doppelstrukturen zu erzeugen.

## M4.1 – Repository Topology

M4.1 etablierte die parallele Git-/Worktree-Struktur.

Branches:

- `integration`
- `feature/platform-core`
- `feature/booking-core`
- `feature/consumer-experience`
- `feature/social-experience-graph`

Zusätzlich bleibt `main` die Produktionswahrheit.

## M4.2 – Ownership & Guardrails

M4.2 etablierte:

- normative Modul-Ownership;
- `.github/CODEOWNERS`;
- `FILE-OWNERSHIP.csv`;
- DB-Ownership-Guardrail;
- Cross-Core-Debt-Baseline;
- Regeln für Cross-Domain Reads und Writes;
- PCR-/Platform-Regeln für Shared Infrastructure.

Der Guardrail bleibt Bestandteil der M4.3/M4.4 Regression.

## M4.3 – Feature Flags & Regression Harness

Neu:

`core/platform/feature-flag-registry.js`

Feature Flags sind temporäre Rollout-Gates und keine neue Domain-, Capability- oder Permission-Wahrheit.

Der zentrale Safe Regression Harness umfasst 17 explizit allowlistete Tests.

## M4.4 – Integration / Preview / Merge Proof

M4.4 hat den vorgesehenen Branch- und Deployment-Weg praktisch durchgeführt.

Nachgewiesen:

1. `feature/platform-core` nach `integration`
2. Regression auf `integration`
3. Push von `integration`
4. Cloudflare Branch Build
5. automatische Integration Preview
6. Live-Smoke der Preview
7. `integration` nach `main`
8. Regression auf `main`
9. Push von `main`
10. automatischer Cloudflare Production Build
11. Production Live-Smoke

## Cloudflare Integration Preview

Der bestehende Cloudflare-Git-Pfad wurde als dauerhafte Preview-Mechanik bestätigt.

Integration Build:

- Branch: `integration`
- Commit: `cc9a9c9`
- Deployment-Befehl: `npx wrangler versions upload`
- Version ID: `68de6497-912e-4b14-937a-2810b8979927`
- Alias: `https://integration-luvia.njwnrvwbv5.workers.dev`

Der erste Build desselben Integration-Commits scheiterte während der Cloudflare-Initialisierung durch Timeout. Ein Retry lief vollständig erfolgreich durch.

## Production

Production:

`https://myluvia.app`

Bestätigte Production Version:

`f61d9b23-9ea4-43f8-b318-83c44789341d`

Live bestätigt:

- App-Version 13.81.9
- Service Worker `luvia-shell-v13.81.9`
- HTTP 200
- Static Asset Hardening aktiv

## Static Asset Security Fix

M4.4 deckte während der Preview-Vorbereitung eine bestehende Deployment-Schwachstelle auf.

Da `wrangler.jsonc` `"directory": "."` verwendet, konnten interne Repo-Dateien als statische Assets veröffentlicht werden.

Vor dem Fix wurde auf Production nachgewiesen:

`/DEPLOYMENT-M3.4.md`

- HTTP 200
- `text/markdown`
- interner Deployment-Inhalt direkt abrufbar

`.assetsignore` wurde deshalb gehärtet.

Ausgeschlossen werden nun Entwicklungs-, Test-, Dokumentations- und Datenbankartefakte.

Remote-Smokes bestätigten anschließend den Schutz sowohl auf Integration Preview als auch Production.

## Redundante Preview-Struktur entfernt

Während der Erprobung wurde einmalig der separate Worker `luvia-integration` erstellt.

Nach Nachweis des bereits vorhandenen automatischen Cloudflare Branch Preview Pfades wurde der zusätzliche Worker wieder gelöscht.

Damit existiert keine konkurrierende Preview-/Deployment-Wahrheit.

## Tests

Safe Regression Harness:

- Total: **17**
- Passed: **17**
- Failed: **0**
- Suite: **PASS**

Erfolgreich ausgeführt auf:

- Platform Feature Stream
- Integration
- Main

Zusätzlich:

- Local Asset Ignore Runtime Proof: PASS
- Automatic Integration Preview Smoke: PASS
- Production Live Verify: PASS
- Internal Asset Exposure Guard: PASS
- Main Remote SHA Verify: PASS
- Integration Remote SHA Verify: PASS
- Platform Remote SHA Verify: PASS

## Backend / Datenbank

Keine Änderung an:

- Supabase DB
- Migrationen
- SQL
- Edge Functions
- Supabase Secrets
- Cloudflare Secrets
- Storage Schema
- `luvia-media-delivery`

## M4 Status

- M4.1: **COMPLETE**
- M4.2: **COMPLETE**
- M4.3: **COMPLETE**
- M4.4: **COMPLETE**

Nach Promotion dieser Abschlussdokumentation:

**M4 – Parallel Development Foundation: COMPLETE**

**PARALLEL DEVELOPMENT READY: YES**

## Nächster Meilenstein

**M5 – Trip Core Isolation**

M5 beginnt die eigentliche Core-Separation nach der nun abgeschlossenen Parallel-Development-Grundlage.
