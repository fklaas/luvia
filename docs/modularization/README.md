# Luvia Modularisierung — M1–M3 Architecture Pack

**Architektur-Baseline:** v13.81.4 / Core 4.81.4 / `aff59be`
**Aktueller Runtime-Release:** v13.81.8 / Core 4.81.8
**Aktueller Architekturstand:** M3.4 — Identity Contract Adapter Foundation
**Runtime-Auswirkung:** additive Contract Adapter für M3.1–M3.4

## Empfohlene Lesereihenfolge

1. `ARCHITECTURE-INVENTORY.md` — bestätigte M1-Baseline und technische Hotspots.
2. `MODULE-OWNERSHIP.md` — normative Domain- und Datei-Ownership ab M2.
3. `M2-CONTRACT-SPECIFICATION.md` — normative Read-, Command- und Event-Grenzen.
4. `DATABASE-DOMAIN-MAP.md` — Ownership-Regeln für Tabellen, Functions und Storage.
5. `DEPENDENCY-MAP.md` und `CROSS-CORE-ACCESS.md` — bekannte Migration Debt und Zielrichtung.
6. `LEGACY-MAP.md` — Paris-/Legacy-Kompatibilität und spätere Lösch-Gates.
7. `PARALLEL-DEVELOPMENT-RULES.md` — Regeln für Parallelentwicklung; operative Worktrees folgen in M4.
8. `BASELINE-REGRESSION-CHECKLIST.md` — Release-Sicherheitsbaseline.
9. `M2-EXIT-GATE.md` — formaler Abschluss von M2.
10. `PLATFORM-CHANGE-REQUEST-TEMPLATE.md` — verpflichtende Vorlage für zukünftige Cross-Cutting-Änderungen.

## Maschinenlesbare Inventare

- `FILE-OWNERSHIP.csv`
- `GLOBAL-ACCESS-INVENTORY.csv`
- `DATABASE-DOMAIN-MAP.csv`
- `CONTRACT-MATRIX.csv`
- `contracts/*.json`

## Architekturgrenze

M1 und M2 definieren Architektur, Ownership und Contracts. M3 implementiert additive Runtime-Grenzen. Die Adapter ersetzen bestehende Domain-Owner nicht, sondern dienen als Strangler Boundaries für spätere Consumer-Migrationen.

## M3.1 Runtime-Implementierung

`trip.v1` über `core/platform/trip-contract-adapter.js`. Bestehende Trip-Implementierungen bleiben die fachliche Wahrheit. Keine Caller-Migration oder Legacy-Entfernung.

## M3.2 Runtime-Implementierung

`places.v1` über `core/platform/places-contract-adapter.js`. `LuviaPlaceCore`, `LuviaPlaces`, `LuviaPlaceCommands` und bestehende Places Services bleiben Owner. Sichere Projections, Commands, Events und Lifecycle-Kompatibilität; keine Provider-/DB-/Performance-Neustrukturierung.

## M3.3 Runtime-Implementierung

`media.v1` über `core/platform/media-contract-adapter.js`. Bestehende Media-/Memory-Owner bleiben fachliche Wahrheit. Sichere immutable Projections, Events, Command-Delegation und ID-basierte Signed-URL-Grenze. Keine Gallery-/Memory-Consumer-Migration oder DB-/UX-/AI-Provider-Neustrukturierung.

## M3.4 Runtime-Implementierung

`identity.v1` über `core/platform/identity-contract-adapter.js`.

Bestehende Owner:

- `LuviaProfileService`
- `LuviaUserPreferences`
- `LuviaTravelPreferences`

Runtime Globals:

- `LuviaIdentityContractV1`
- `LuviaIdentityContract`

M3.4 ergänzt Viewer Identity, minimale Public Identity, Self Preferences, sichere Profile-/Preference-Commands, normalisierte Events, Privacy-Grenzen, Diagnostics und Release-/Service-Worker-Integration.

Public Identity:

- `userId`
- `displayName`
- `avatarUrl`
- `avatarColor`

Foreign Public Identity bleibt `self-only-until-provider`.

`activeTripId` bleibt Trip-Ownership.

Event Bridges:

```text
luvia:profile-changed → luvia:identity.changed
luvia:user-preferences-changed → luvia:preferences.changed
```

`luvia:travel-preferences-changed` wird bewusst nicht erneut gebridged.

Nicht Bestandteil sind Consumer-Migration, Foreign-User-Provider, neue Persistenz, neue DB-/Function-/Secret-Strukturen, Social Runtime oder UX-Redesign.

## M3 Gesamtstatus

- M3.1 — Trip Contract Adapter Foundation
- M3.2 — Places Contract Adapter Foundation
- M3.3 — Media Contract Adapter Foundation
- M3.4 — Identity Contract Adapter Foundation

Nach erfolgreichem Production-Abschluss von M3.4 ist **M3 – Contract Adapter Foundation** abgeschlossen.

## Nächster Meilenstein

# M4 — Parallel Development Foundation

M4 schafft die operative Grundlage für stabilen `main`, Integration-Branch, getrennte Domain-Branches, Git Worktrees, verbindliche Ownership, Shared-Contract-Regeln, Feature Flags und kontrollierte Parallelentwicklung von Booking, Consumer, Social und Platform.
