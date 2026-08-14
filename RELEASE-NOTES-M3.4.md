# Release Notes M3.4 – Identity Contract Adapter Foundation

## Release

- App: **13.81.8**
- Core: **4.81.8**
- Name: **M3.4 Identity Contract Adapter Foundation**
- Contract: **identity.v1**
- Runtime-Version: **1.0.0**
- Channel: **production**
- Datum: **2026-08-14**

## Überblick

M3.4 ergänzt Luvia um eine stabile, additive Runtime-Grenze für Identity und Preferences. Der neue `identity.v1`-Contract ersetzt die bestehenden Systeme nicht, sondern kapselt sie über einen Strangler-Adapter.

Bestehende Owner bleiben:

- `LuviaProfileService`
- `LuviaUserPreferences`
- `LuviaTravelPreferences`

## Neu

Neue Runtime-Datei: `core/platform/identity-contract-adapter.js`

Neue Globals:

- `LuviaIdentityContractV1`
- `LuviaIdentityContract`

Metadaten:

- `contractId = identity.v1`
- `version = 1`
- `runtimeVersion = 1.0.0`

### Viewer Identity

`getViewerIdentity()` gibt ausschließlich freigegebene Identity-/Settings-Felder zurück. Nicht veröffentlicht werden unter anderem `email`, `activeTripId`, `archivedTripIds`, `dashboardWidgets` und Persistenzdetails.

### Public Identity

`getPublicIdentity()` besteht ausschließlich aus:

- `userId`
- `displayName`
- `avatarUrl`
- `avatarColor`

Foreign Public Identity bleibt in M3.4 im Modus `self-only-until-provider`. Fremde Nutzer liefern kontrolliert `IDENTITY_CONTRACT_PROVIDER_UNAVAILABLE` mit Provider `publicIdentityLookup`.

### Preferences

`getPreferences('self')` ist strikt selbstbezogen, immutable und von Public Identity getrennt. Nicht selbstbezogene Zugriffe liefern `IDENTITY_CONTRACT_SELF_ONLY`.

### Commands

- `updateProfile()` → `LuviaProfileService.save()`
- `updatePreferences()` → `LuviaUserPreferences.update()` / `replaceCategory()`

`activeTripId` ist nicht über Identity schreibbar und liefert `IDENTITY_CONTRACT_PROFILE_FIELD_NOT_ALLOWED`.

### Events

- `luvia:profile-changed` → `luvia:identity.changed`
- `luvia:user-preferences-changed` → `luvia:preferences.changed`

`luvia:travel-preferences-changed` wird bewusst nicht erneut gebridged, um Duplicate Events zu vermeiden.

Contract Events leaken weder vollständige Profile noch private Preferences.

## Diagnostics

Erwartet:

- `profile = true`
- `preferences = true`
- `travelPreferences = true`
- `publicIdentityLookup = false`
- `ready = true`

`publicIdentityLookup = false` ist beabsichtigt.

## Runtime-Integration

Reihenfolge:

`Trip Contract Adapter` → `Places Contract Adapter` → `Media Contract Adapter` → `Identity Contract Adapter` → `Profile Foundation` → `App Shell`

Service Worker: `luvia-shell-v13.81.8`

Force Update: `appv=13.81.8`

## Tests

Neue Tests:

- `tests/m3.4-identity-contract-adapter.test.cjs`
- `tests/m3.4-identity-contract-release-integration.test.cjs`

Finale relevante Regression:

`TOTAL: 11`
`FAILED: 0`
`M3.4 FINAL REGRESSION: PASS`

Historische Testschuld, bereits auf M3.3 identisch rot:

- `profile-preference-payload.test.cjs`
- `user-preference-core.test.cjs`
- `v13.68.8-app-bootstrap-render-guarantee.test.cjs`

Baseline: `5ad7cdadd0668b2c49113ddfd15dfd33992bdc6f`

## Datenbank / Backend

Keine Datenbankmigration, kein SQL-Deployment, keine Edge-Function-Änderung, keine neuen Secrets. Die remote-only Function `luvia-media-delivery` bleibt unangetastet.

## Nicht Bestandteil

Keine vollständige Consumer-Migration, kein Foreign-User-Provider, keine neue Persistenz, keine Social Runtime, kein Auth-Rewrite, kein UX-Redesign und keine Booking-/Places-/Media-Fachänderung.

## M3-Status

Nach erfolgreichem Production-Gate von M3.4 ist **M3 – Contract Adapter Foundation** abgeschlossen. Danach folgt **M4 – Parallel Development Foundation**.
