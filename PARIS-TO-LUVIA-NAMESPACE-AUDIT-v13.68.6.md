# Paris → Luvia Namespace Audit – Phase 1

## In v13.68.6 kanonisiert
- Auth API → `LuviaAuth`
- Auth UI → `LuviaAuthUI`
- Supabase Config → `LuviaSupabaseConfig`
- Supabase Client → `LuviaSupabaseClient`
- Auth Change Event → `luvia:auth-changed`
- Auth Upgrade/Explicit-Signout LocalStorage → `luviaAuth*`

## Absichtlich kompatibel belassen
`ParisAuth`, `ParisAuthUI`, `ParisSupabaseConfig`, `ParisSupabaseClient` existieren als Aliase, da zahlreiche ältere Module sie noch lesen. Sie sind keine kanonischen Schreibpfade mehr.

## Echte Paris-Reisedaten – nicht umbenennen
Dateien und Keys unter `legacy/paris/*`, historische Paris-Reise-Inhalte, Trip-Namen, Bucket-/Migrationsdaten und andere tatsächlich Paris betreffende Daten werden nicht pauschal umbenannt.

## Phase 2 Kandidaten
Noch vorhandene technische Fallback-Leser von `ParisSupabaseClient`/`ParisAuth` in älteren Core-Modulen werden modulweise auf `Luvia*` migriert. Erst wenn die Audit-Suche keine produktiven Abhängigkeiten mehr findet, können die Compatibility-Aliase entfernt werden.
