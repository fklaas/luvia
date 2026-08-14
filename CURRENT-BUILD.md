# CURRENT BUILD

- App: **13.81.8**
- Core: **4.81.8**
- Name: **M3.4 Identity Contract Adapter Foundation**
- Channel: production
- Datum: 2026-08-14

## Scope

- Additive Runtime-Implementierung des in M2 spezifizierten `identity.v1`-Contracts.
- Führt `LuviaIdentityContractV1` und `LuviaIdentityContract` als stabile öffentliche Identity-/Preferences-Grenze ein.
- Bestehende Owner bleiben `LuviaProfileService`, `LuviaUserPreferences` und `LuviaTravelPreferences`.
- `getViewerIdentity()` liefert ausschließlich eine freigegebene Viewer-Projection.
- `getPublicIdentity()` liefert ausschließlich `userId`, `displayName`, `avatarUrl`, `avatarColor`.
- Foreign Public Identity bleibt bis zu einem echten Provider im Modus `self-only-until-provider`.
- `getPreferences('self')` bleibt strikt selbstbezogen und getrennt von Public Identity.
- Profiländerungen delegieren an `LuviaProfileService.save()`.
- Preference-Änderungen delegieren an `LuviaUserPreferences.update()` bzw. `replaceCategory()`.
- `activeTripId` bleibt Trip-Ownership.
- `luvia:profile-changed` wird auf `luvia:identity.changed` normalisiert.
- `luvia:user-preferences-changed` wird auf `luvia:preferences.changed` normalisiert.
- `luvia:travel-preferences-changed` wird bewusst nicht erneut gebridged.
- Keine Consumer-Migration, keine neue Persistenz, keine DB-/Function-/Secret-Änderung.

## Deployment

- Datenbankmigration: NEIN
- SQL-Deployment: NEIN
- Supabase Edge Functions: NEIN
- Neue Secrets: NEIN
- Cloudflare Secrets: NEIN
- Statischer App-Deploy: JA

## Core Truth

M3.4 führt keine zweite Identity-Wahrheit, keinen zweiten Preferences-Store, keinen zusätzlichen Profile-Cache und keinen neuen Persistenzpfad ein. Der Adapter ist ausschließlich eine Strangler-Grenze über den bestehenden Implementierungen.

## M3-Status

- M3.1 – Trip Contract Adapter Foundation
- M3.2 – Places Contract Adapter Foundation
- M3.3 – Media Contract Adapter Foundation
- M3.4 – Identity Contract Adapter Foundation

Nach erfolgreichem Production-Gate von M3.4 ist M3 abgeschlossen. Danach folgt **M4 – Parallel Development Foundation**.
