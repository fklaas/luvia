# Deployment M3.4 – Identity Contract Adapter Foundation

## 1. Release-Übersicht

- App-Version: **13.81.8**
- Core-Version: **4.81.8**
- Meilenstein: **M3.4**
- Contract: **identity.v1**
- Runtime-Contract-Version: **1.0.0**
- Release-Name: **M3.4 Identity Contract Adapter Foundation**
- Release-Channel: **production**
- Datum: **2026-08-14**
- Deployment-Art: **statischer Frontend-/Runtime-Release**
- Produktions-URL: **https://myluvia.app**

M3.4 führt den produktiven Runtime-Adapter für `identity.v1` ein. Der Build ersetzt keine bestehenden Identity- oder Preferences-Dienste, sondern legt eine stabile Contract-Grenze über `LuviaProfileService`, `LuviaUserPreferences` und `LuviaTravelPreferences`.

## 2. Scope

Neu: `core/platform/identity-contract-adapter.js`

Runtime-Globals:

```text
LuviaIdentityContractV1
LuviaIdentityContract
```

Keine vollständige Consumer-Migration, keine neue Persistenz und keine Backend-Umstrukturierung.

## 3. Core Truth

M3.4 führt keine zweite Identity-Wahrheit, keinen zweiten Preferences-Store, keinen neuen Profile-Cache und keinen neuen Persistenzpfad ein.

- `LuviaProfileService` bleibt Profile-Owner.
- `LuviaUserPreferences` bleibt Preferences-Owner.
- `LuviaTravelPreferences` bleibt abgeleiteter Context-/Scoring-Layer.
- `activeTripId` bleibt Trip-Ownership.

## 4. Sicherheitsregeln

M3.4 ist ausschließlich ein statischer Frontend-/Runtime-Release.

Nicht ausführen:

```powershell
npx supabase db push
```

Keine SQL-Migration, keine Migration-Reparatur, kein Supabase-Function-Deploy, keine Secret-Änderung.

Die remote-only Function `luvia-media-delivery` bleibt vollständig unangetastet.

## 5. Contract-Metadaten

```text
contractId = identity.v1
version = 1
runtimeVersion = 1.0.0
```

API immutable; `LuviaIdentityContract` und `LuviaIdentityContractV1` müssen dasselbe Objekt sein.

## 6. Öffentliche Reads

```text
getViewerIdentity()
getPublicIdentity(userId?)
getPreferences('self')
subscribe(listener)
diagnostics()
```

## 7. Viewer Identity

Erlaubte Felder:

```text
userId
displayName
firstName
lastName
avatarUrl
avatarColor
language
timezone
homeLocation
themeMode
density
reducedMotion
useTripAccent
defaultView
showArchivedTrips
personalizedRecommendations
activityData
locationSharing
notifications
```

Nicht freigegeben:

```text
email
activeTripId
archivedTripIds
dashboardWidgets
createdAt
updatedAt
```

Projection immutable; kein vollständiger ProfileService-Snapshot.

## 8. Public Identity

Exakt:

```text
userId
displayName
avatarUrl
avatarColor
```

Foreign Public Identity bleibt `self-only-until-provider`; fremde Nutzer liefern `IDENTITY_CONTRACT_PROVIDER_UNAVAILABLE` / `publicIdentityLookup`.

## 9. Preferences

Self-only. Freigegeben sind die normierten Travel-/Dining-/Mobility-/Accessibility-/Budget-/Family-/Schema-Preference-Felder. Nicht freigegeben sind `source`, `userId`, private Implementierungsfelder und Persistenzdetails.

Non-self liefert `IDENTITY_CONTRACT_SELF_ONLY`.

## 10. Commands

`updateProfile()` delegiert an `LuviaProfileService.save()`.

`activeTripId` ist nicht schreibbar und liefert `IDENTITY_CONTRACT_PROFILE_FIELD_NOT_ALLOWED`.

`updatePreferences()` delegiert an `LuviaUserPreferences.update()` oder `replaceCategory()`.

## 11. Verbotene Direktabhängigkeiten

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

## 12. Event-Normalisierung

Bestehend:

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

Bridges:

```text
luvia:profile-changed → luvia:identity.changed
luvia:user-preferences-changed → luvia:preferences.changed
```

`luvia:travel-preferences-changed` wird bewusst nicht erneut gebridged.

## 13. Event Privacy

`identity.changed` enthält nur sichere Public Identity. `preferences.changed` enthält nur Status-/Metadaten (`reason`, `revision`, `loaded`, `syncing`). Keine vollständigen Profile oder privaten Preferences.

## 14. Diagnostics

Erwartet:

```text
ready = true
profile = true
preferences = true
travelPreferences = true
publicIdentityLookup = false
```

`publicIdentityLookup = false` ist beabsichtigt.

## 15. Release-Integration

```text
App 13.81.8
Core 4.81.8
M3.4 Identity Contract Adapter Foundation
```

Service Worker: `luvia-shell-v13.81.8`

Force Update: `appv=13.81.8`

Runtime-Reihenfolge:

```text
Trip Contract Adapter
→ Places Contract Adapter
→ Media Contract Adapter
→ Identity Contract Adapter
→ Profile Foundation
→ App Shell
```

## 16. Backend-/DB-/Secret-Status

```text
Datenbankmigration: NEIN
SQL-Deployment: NEIN
Supabase Edge Functions: NEIN
Supabase Secrets: NEIN
Cloudflare Secrets: NEIN
Provider Credentials: NEIN
```

## 17. Lokale Tests

```powershell
node .\tests\m3.4-identity-contract-adapter.test.cjs
node .\tests\m3.4-identity-contract-release-integration.test.cjs
node .\tests\m3.1-trip-contract-adapter.test.cjs
node .\tests\m3.2-places-contract-adapter.test.cjs
node .\tests\m3.3-media-contract-adapter.test.cjs
node .\tests\release-version-consistency.test.cjs
```

Erwartet:

```text
M3.4 Identity Contract Adapter: OK
M3.4 Identity Contract Release Integration: OK
M3.1 Trip Contract Adapter: OK
M3.2 Places Contract Adapter: OK
M3.3 Media Contract Adapter: OK
Build 13.81.8 / Core 4.81.8 release consistency: OK
```

## 18. Finale relevante Regression

```text
TOTAL: 11
FAILED: 0
M3.4 FINAL REGRESSION: PASS
```

Historische Testschuld bleibt auf M3.3 identisch rot:

```text
profile-preference-payload.test.cjs
user-preference-core.test.cjs
v13.68.8-app-bootstrap-render-guarantee.test.cjs
```

Baseline: `5ad7cdadd0668b2c49113ddfd15dfd33992bdc6f`

## 19. Syntax- und JSON-Gates

```powershell
node --check .\core\platform\identity-contract-adapter.js
node --check .\intelligence\kernel\version.js
node --check .\core\diagnostics\media-readiness.js
node -e "JSON.parse(require('fs').readFileSync('docs/modularization/contracts/identity.v1.json','utf8')); console.log('identity.v1.json: OK')"
```

## 20. Git Diff Gate

```powershell
git diff --check
git --no-pager diff --cached --check
git --no-pager diff --cached --stat
```

Eine reine LF/CRLF-Warnung ist kein funktionaler Fehler.

## 21. Changed-File-Allowlist

Die Allowlist in `CHANGED-FILES-M3.4.txt` muss exakt 17 M3.4-Dateien enthalten. Keine zusätzliche Datei darf gestaged sein.

## 22. Staging

```powershell
git add --pathspec-from-file=CHANGED-FILES-M3.4.txt
git status --short
git --no-pager diff --cached --check
git --no-pager diff --cached --stat
```

## 23. Commit

```powershell
git commit -m "M3.4: identity contract adapter foundation"
```

Danach:

```powershell
git status --short
git rev-parse HEAD
git --no-pager log -1 --oneline
```

Working Tree muss clean sein.

## 24. Remote-Prüfung

```powershell
git fetch origin
git rev-list --left-right --count origin/main...HEAD
```

Wenn nur der lokale M3.4-Commit fehlt, wird `0 1` erwartet. Bei Divergenz nicht pushen.

## 25. GitHub Push

```powershell
git push origin main
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
git status --short
```

HEAD und origin/main müssen identisch sein.

## 26. Production Deployment

Nur Cloudflare:

```powershell
npx wrangler deploy
```

Kein Supabase-Deploy.

Zu dokumentieren:

- Worker `luvia`
- Cloudflare Version ID
- Deploy-Zeitpunkt
- keine Backend-/Secret-Änderung

## 27. Production Asset Smoke

Prüfen:

```text
https://myluvia.app/index.html
https://myluvia.app/intelligence/kernel/version.js
https://myluvia.app/core/platform/identity-contract-adapter.js
https://myluvia.app/sw.js
https://myluvia.app/force-update.html
```

Alle HTTP 200.

## 28. Production-Version

`version.js` muss enthalten:

```text
core = 4.81.8
build = 13.81.8
name = M3.4 Identity Contract Adapter Foundation
```

## 29. Production index.html

Muss enthalten:

```text
core/platform/identity-contract-adapter.js?v=13.81.8
```

Alte `?v=13.81.7`-Referenzen müssen 0 sein.

## 30. Production Service Worker

Muss enthalten:

```text
luvia-shell-v13.81.8
core/platform/identity-contract-adapter.js
```

## 31. Force Update

Browser:

```text
https://myluvia.app/force-update.html
```

Danach App-Boot, Auth, aktive Reise, Navigation und Console prüfen.

## 32. Runtime Smoke

Prüfen:

```js
window.LuviaIdentityContractV1
window.LuviaIdentityContract === window.LuviaIdentityContractV1
Object.isFrozen(window.LuviaIdentityContractV1)
```

Erwartet: Contract-ID `identity.v1`, Version `1`, Runtime `1.0.0`, Alias `true`, frozen `true`.

## 33. Privacy Smokes

`getViewerIdentity()`:

- kein `email`
- kein `activeTripId`
- keine `archivedTripIds`
- keine `dashboardWidgets`

`getPublicIdentity()`:

- exakt `userId`, `displayName`, `avatarUrl`, `avatarColor`

`getPreferences('self')`:

- immutable
- kein `source`
- kein `userId`
- keine internen Felder

Keine privaten Werte in Release-Dokumentation kopieren.

## 34. Event Smokes

Synthetischer `luvia:profile-changed` muss `luvia:identity.changed` erzeugen, ohne E-Mail-Leak.

Synthetischer `luvia:user-preferences-changed` muss `luvia:preferences.changed` erzeugen, ohne private Preferences.

Isolierter `luvia:travel-preferences-changed` darf keinen zusätzlichen Contract-Bridge-Event erzeugen.

## 35. Bestehende App-Funktionen

Nach Deploy prüfen:

- Authenticated Boot
- aktive Reise
- Navigation
- Profil
- Preferences/Reisekompass
- App Shell
- keine neuen fatalen M3.4-Console-Fehler
- M3.1–M3.4 Contracts geladen

## 36. Fehlerbehandlung

Lokaler Test rot → nicht committen.

Allowlist falsch → nicht committen.

Unerwartete Datei → nicht automatisch löschen.

Remote-Divergenz → nicht pushen.

Cloudflare Deploy fehlgeschlagen → Production-Smokes nicht als gültig bewerten.

Identity Contract fehlt → index.html, Asset-Status, Service Worker, Cache und Console prüfen; keinen zweiten Identity-Fallback bauen.

Private Datenleak → Release blockieren, korrigieren, vollständig neu testen.

## 37. Rollback

Vorheriger Stand:

```text
App 13.81.7
Core 4.81.7
M3.3 Media Contract Adapter Foundation
Commit 5ad7cdadd0668b2c49113ddfd15dfd33992bdc6f
```

Rollback ausschließlich statisch durch Wiederherstellung und erneutes Cloudflare-Deployment des bekannten M3.3-Stands. Kein DB-/Function-/Secret-Rollback erforderlich.

## 38. Abschlusskriterien

M3.4 ist erst abgeschlossen, wenn lokale Tests, Regression, Syntax, JSON, Release-Konsistenz, Allowlist, staged Diff, Commit, GitHub-Sync, Cloudflare Deploy, Production Assets, Force Update, Runtime, Diagnostics, Privacy und Events vollständig grün sind.

Danach gilt:

```text
M3.4 – Identity Contract Adapter Foundation: COMPLETE
M3 – Contract Adapter Foundation: COMPLETE
```

Nächster Meilenstein: **M4 – Parallel Development Foundation**.
