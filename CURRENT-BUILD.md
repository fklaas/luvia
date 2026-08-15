# CURRENT BUILD

- App: **13.81.9**
- Core: **4.81.9**
- Name: **M4.3 Feature Flag & Regression Harness Foundation**
- Channel: production
- Datum: 2026-08-15
- Milestone Status: **M4.3 IN PROGRESS**

## Scope

M4.3 schafft die kontrollierte Feature-Flag- und Regression-Grundlage für parallele Luvia-Entwicklung.

Aktueller Scope:

- Neue Platform-eigene `LuviaFeatureFlagRegistry`.
- Feature Flags dienen ausschließlich als temporäre Rollout-Gates.
- Feature Flags ersetzen weder Capabilities noch Product-Module-State, Auth, Berechtigungen oder Domain Truth.
- Unbekannte Flags sind fail-closed (`enabled: false`).
- Flag-IDs müssen dem Owner-Präfix folgen, z. B. `booking.<feature>`.
- Keine frei veränderbaren Runtime-Overrides über `enable()`, `disable()` oder `setEnabled()`.
- Konfliktfreie identische Registrierung ist idempotent; widersprüchliche Definitionen werden abgelehnt.
- Feature-Flag-Registry wird früh im Platform-Layer geladen, nach Capability Registry und vor Attention/Product Module Registry.
- Feature-Flag-Registry wird vom Service Worker gecacht.
- Kontrollierter M4.3 Safe Regression Harness statt blindem Glob über alle historischen Tests.
- Historische releasegebundene Tests bleiben unverändert als Release-Evidence erhalten.
- Weiterhin gültige Invarianten werden durch versionsunabhängige Evergreen-Tests geschützt.
- M3 Contract Adapter Integration für Trip, Places, Media und Identity bleibt als Evergreen-Gate erhalten.
- M4.2 Cross-Core DB Ownership Guardrail bleibt Bestandteil der Regression-Baseline.
- Places-Architektur wird gegen aktuelle Runtime-Struktur geprüft, nicht gegen retired Legacy-Pfade.

## Safe Regression Baseline

Der kontrollierte lokale M4.3-Harness liegt unter:

`tests/run-m4.3-safe-regression.cjs`

Die bisher bestätigte Baseline umfasst:

- Release-Konsistenz
- Runtime-/App-Boot-Foundation
- M3 Contract Adapter
- M3 Contract Release Integration Evergreen
- Places Architecture Evergreen
- Product Module / Control Center
- Booking / Contact Discovery Regression
- M4.2 Cross-Core DB Ownership Guardrail

Letzter bestätigter Harness-Lauf vor der Runtime-Einbindung der Feature-Flag-Registry:

- Total: 15
- Passed: 15
- Failed: 0
- Result: PASS

Nach Abschluss der Runtime-Einbindung muss der vollständige Harness erneut ausgeführt werden.

## Deployment

- Datenbankmigration: **NEIN**
- SQL-Deployment: **NEIN**
- Supabase Edge Functions: **NEIN**
- Neue Secrets: **NEIN**
- Cloudflare Secrets: **NEIN**
- Statischer App-Deploy: **JA, erst nach M4.3 Exit Gate**

## Core Truth

Die Feature-Flag-Foundation erzeugt keine zweite Domain- oder Capability-Wahrheit.

`LuviaCapabilityRegistry` beantwortet technische Verfügbarkeit.

`LuviaProductModuleRegistry` verwaltet Product-Module-State und Lifecycle.

`LuviaFeatureFlagRegistry` beantwortet ausschließlich, ob eine temporär gegatete Änderung standardmäßig freigeschaltet ist.

## Completed Baseline

M3 ist vollständig abgeschlossen:

- M3.1 – Trip Contract Adapter Foundation
- M3.2 – Places Contract Adapter Foundation
- M3.3 – Media Contract Adapter Foundation
- M3.4 – Identity Contract Adapter Foundation

M4 bisher:

- M4.1 – Parallel Repository Topology Foundation: **COMPLETE**
- M4.2 – Ownership & Cross-Core Repository Guardrails: **COMPLETE**
- M4.3 – Feature Flag & Regression Harness Foundation: **IN PROGRESS**
- M4.4 – Integration / Preview / Merge Proof: **PENDING**

**PARALLEL DEVELOPMENT READY** darf erst nach erfolgreichem M4.4 Exit Gate erklärt werden.