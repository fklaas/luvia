# PCR M3.4 – Identity Contract Adapter Foundation

## Status

- Meilenstein: **M3.4**
- App: **13.81.8**
- Core: **4.81.8**
- Contract: **identity.v1**
- Runtime-Contract-Version: **1.0.0**
- Release-Name: **M3.4 Identity Contract Adapter Foundation**
- Änderungstyp: **additive Architektur-/Runtime-Änderung**
- Datenbankänderung: **NEIN**
- Edge-Function-Änderung: **NEIN**
- Secret-Änderung: **NEIN**
- Consumer-Migration: **NEIN**

## 1. Problemstellung

Luvia besitzt bereits funktionierende Profile-, Preferences- und Travel-Preference-Systeme mit fachlicher Wahrheit in `LuviaProfileService`, `LuviaUserPreferences` und `LuviaTravelPreferences`.

Es fehlte bislang eine stabile öffentliche Contract-Grenze. Direkte Zugriffe auf vollständige Profile, private Preferences und interne Persistenzdetails würden die weitere Modularisierung und Parallelentwicklung behindern.

M3.4 löst dieses Problem durch einen additiven `identity.v1`-Contract Adapter.

## 2. Architekturentscheidung

M3.4 führt keinen neuen Identity-Core und keinen neuen Preferences-Store ein.

```text
Bestehende Identity-/Preferences-Owner
                │
                ▼
          identity.v1
                │
                ▼
      zukünftige Consumer
```

Der Adapter liest aus bestehenden Ownern, delegiert Commands an bestehende Owner, publiziert sichere Projections, normalisiert Events und führt keine eigene Persistenz ein.

## 3. Ownership

`LuviaProfileService` bleibt Owner für persistentes Profil, Cloud-Synchronisation, Profile-Persistenz, Profile-Settings, Auth-Metadata-Migration, Profile-Cache und bestehende Kompatibilität.

`LuviaUserPreferences` bleibt Owner für normalisierte Reisepräferenzen, Preference-Updates, Kategorien, Persistenz, Onboarding und Schema-Zustand.

`LuviaTravelPreferences` bleibt ein abgeleiteter Context-/Scoring-/Auswertungs-Layer und wird nicht zum Persistenz-Owner.

## 4. Neue Runtime-Grenze

Neue Datei: `core/platform/identity-contract-adapter.js`

Globals:

```text
LuviaIdentityContractV1
LuviaIdentityContract
```

Metadaten:

```text
contractId = identity.v1
version = 1
runtimeVersion = 1.0.0
```

API immutable.

## 5. Reads

```text
getViewerIdentity()
getPublicIdentity(userId?)
getPreferences('self')
subscribe(listener)
diagnostics()
```

## 6. Viewer Identity

Whitelist enthält nur explizit freigegebene Viewer-/Settings-Felder. Nicht enthalten sind `email`, `activeTripId`, `archivedTripIds`, `dashboardWidgets`, `createdAt`, `updatedAt`. Projection immutable.

## 7. Active Trip

`activeTripId` bleibt Trip-Ownership. Kein Read und kein Write über `identity.v1`.

## 8. Public Identity

Exakt:

```text
userId
displayName
avatarUrl
avatarColor
```

Keine E-Mail, Preferences, Trip-Auswahl oder Persistenzdetails.

## 9. Foreign Public Identity

Kein direkter Supabase-Shortcut, kein Missbrauch von Memory-/Collaboration-Tabellen, kein zweiter Public-Profile-Store.

```text
self-only-until-provider
IDENTITY_CONTRACT_PROVIDER_UNAVAILABLE
provider = publicIdentityLookup
```

## 10. Preferences

Self-only. Freigegeben sind die normierten Reise-/Dining-/Mobility-/Accessibility-/Budget-/Family-/Schema-Felder. Nicht freigegeben sind `source`, `userId`, private Implementierungsfelder, Persistenzpayloads und ProfileService-State.

Non-self: `IDENTITY_CONTRACT_SELF_ONLY`.

## 11. Commands

`updateProfile()` → `LuviaProfileService.save()`.

`activeTripId` → `IDENTITY_CONTRACT_PROFILE_FIELD_NOT_ALLOWED`.

`updatePreferences()` → `LuviaUserPreferences.update()` oder `replaceCategory()`.

## 12. Verbotene Direktabhängigkeiten

```text
LuviaSupabaseService
ParisAuth
localStorage
sessionStorage
user_profiles
.rpc(
LuviaPreferenceSchema
activeTripId
archivedTripIds
dashboardWidgets
```

## 13. Event-Modell

Compatibility Events bleiben:

```text
luvia:profile-changed
luvia:user-preferences-changed
luvia:travel-preferences-changed
```

Neu:

```text
luvia:identity.changed
luvia:preferences.changed
```

## 14. Event Bridges

```text
luvia:profile-changed → luvia:identity.changed
luvia:user-preferences-changed → luvia:preferences.changed
```

Nur sichere Public Identity bzw. Status-/Metadaten. `luvia:travel-preferences-changed` wird bewusst nicht erneut gebridged.

## 15. Diagnostics

```text
profile = true
preferences = true
travelPreferences = true
publicIdentityLookup = false
ready = true
```

## 16. Global Contract Registry

`identity.v1` registriert sich in der bestehenden Registry, falls vorhanden. Keine zweite Registry.

## 17. Runtime-Reihenfolge

```text
Trip Contract Adapter
→ Places Contract Adapter
→ Media Contract Adapter
→ Identity Contract Adapter
→ Profile Foundation
→ App Shell
```

## 18. Service Worker / Release

Adapter im Shell-Cache; `luvia-shell-v13.81.8`; App 13.81.8; Core 4.81.8; Force Update `appv=13.81.8`.

## 19. Datenbank / Functions / Secrets

Keine neue Tabelle, Spalte, RPC, Migration, RLS-/Storage-Änderung, Edge-Function-Änderung oder neue Secrets. `luvia-media-delivery` bleibt unangetastet.

## 20. Nicht Bestandteil

Keine vollständige Consumer-Migration, kein Foreign-User-Provider, keine Social Runtime, keine neue Persistenz, kein Auth-Rewrite, kein UX-Redesign, keine Booking-/Places-/Media-Fachänderungen.

## 21. Architekturregeln nach M3.4

Social darf später Public Identity über `identity.v1` lesen, aber keine vollständigen Profile oder privaten Preferences.

Booking darf Identity nicht direkt persistieren.

Places darf Profile-/Preferences-State nicht selbst besitzen.

Trip bleibt Owner der aktiven Reise.

## 22. Teststrategie

Neue Tests:

```text
tests/m3.4-identity-contract-adapter.test.cjs
tests/m3.4-identity-contract-release-integration.test.cjs
```

Test-first RED → GREEN.

## 23. Regression

```text
TOTAL: 11
FAILED: 0
M3.4 FINAL REGRESSION: PASS
```

## 24. Historische Testschuld

Rot, aber auf M3.3 identisch reproduziert:

```text
profile-preference-payload.test.cjs
user-preference-core.test.cjs
v13.68.8-app-bootstrap-render-guarantee.test.cjs
```

Baseline: `5ad7cdadd0668b2c49113ddfd15dfd33992bdc6f`

Keine M3.4-Regression.

## 25. Sicherheitsprinzip

Der Contract darf weniger veröffentlichen als die bestehenden Implementierungen intern wissen. Wo eine sichere Owner-Schnittstelle fehlt, wird `provider unavailable` bevorzugt statt einer neuen direkten Datenbankkopplung.

## 26. Migrationseffekt

```text
bestehender direkter Zugriff
→ identity.v1
→ Validierung
→ alte Abhängigkeit später entfernbar
```

Kein Big-Bang-Rewrite.

## 27. Erfolgskriterien

Produktiver `identity.v1`, bestehende Owner bleiben einzige Wahrheit, kein zweiter Store, kein direkter Supabase-Zugriff im Adapter, sichere Projections, delegierte Commands, Trip-State außerhalb Identity, sichere Events, kein Duplicate Event, M3.1–M3.3 regressionsfrei, Release konsistent und Production Runtime Smoke grün.

## 28. Masterfahrplan

Nach erfolgreichem Production-Abschluss:

```text
M3 – Contract Adapter Foundation: COMPLETE
```

Danach:

```text
M4 – Parallel Development Foundation
```
