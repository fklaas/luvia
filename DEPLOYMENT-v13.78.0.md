# Deployment – Luvia v13.78.0 / Core 4.78.0
## Booking Control Center Foundation

## 1. Deployment impact

| Area | Required |
|---|---|
| Database migration | **NO** |
| Supabase SQL Editor | **NO** |
| Supabase Edge Functions | **NO** |
| New/changed secrets | **NO** |
| Cloudflare/static app deployment | **YES** |
| Service Worker cache update | **YES** – `luvia-shell-v13.78.0` |

v13.78 is a static product/UI architecture release. It consumes the Booking Core already deployed in previous releases and does not alter Booking database truth.

## 2. Before deployment

1. Keep the known-good complete v13.77.0 ZIP for rollback.
2. Extract the complete v13.78.0 ZIP into a clean working folder.
3. Confirm these files exist:
   - `CURRENT-BUILD.md`
   - `RELEASE-v13.78.0.md`
   - `TEST-v13.78.0.md`
   - `TEST-RESULTS-v13.78.0.md`
   - `app/control-center/booking-control-center.js`
   - `app/control-center/booking-control-center.css`
4. Do **not** execute `npx supabase db push`.
5. Do **not** execute any Supabase SQL for this release.
6. Do **not** deploy any Edge Function for this release.
7. Do **not** change Resend, Cloudflare or Supabase secrets.

## 3. Optional local pre-deploy verification

From the extracted project root:

```bash
node tests/v13.78.0-booking-control-center-foundation.test.cjs
node tests/v13.78.0-product-module-regression.test.cjs
node tests/v13.77.0-control-center-home-travel-identity.test.cjs
```

Then provider regressions:

```bash
node tests/booking-thefork-adapter-v13.41.0.test.cjs
node tests/booking-quandoo-adapter-v13.42.0.test.cjs
node tests/booking-opentable-adapter-v13.44.0.test.cjs
node tests/booking-sevenrooms-adapter-v13.45.0.test.cjs
node tests/booking-resy-adapter-v13.46.0.test.cjs
node tests/booking-tock-adapter-v13.47.0.test.cjs
```

Syntax checks:

```bash
node --check app/control-center/booking-control-center.js
node --check app/control-center/control-center-attention-service.js
node --check app/control-center/control-center-home.js
node --check app/control-center/control-center-manifest.js
node --check app/app-shell.js
node --check core/diagnostics/product-module-diagnostics.js
node --check intelligence/kernel/version.js
node --check sw.js
```

## 4. Deploy the complete static app

### If using the existing direct Cloudflare Worker path

From the project root:

```bash
npx wrangler deploy
```

### If using GitHub → Cloudflare automatic deployment

1. Replace the repository working tree with the **complete** v13.78.0 project contents.
2. Review changed files against `CHANGED-FILES-v13.78.0.txt`.
3. Commit with:

```text
feat(luvia): add Booking Control Center foundation v13.78.0
```

4. Push to the branch used by the production deployment.
5. Wait until the Cloudflare deployment reports success.
6. Do not mix v13.77 and v13.78 files manually.

## 5. Service Worker / cache update

The cache key is now:

```text
luvia-shell-v13.78.0
```

After production deployment:

1. Open `myluvia.app`.
2. Reload once.
3. Close all Luvia tabs if the previous build remains active.
4. Reopen Luvia.
5. If necessary, use DevTools → Application → Service Workers → Update.
6. Only continue testing when this console command reports v13.78:

```js
LuviaKernelVersion
```

Expected important fields:

```js
{
  core: '4.78.0',
  build: '13.78.0',
  name: 'Booking Control Center Foundation'
}
```

## 6. Consumer Experience regression first

Before testing the new surface, confirm existing Luvia still works:

1. Login succeeds.
2. `Heute` opens.
3. `Planen` opens.
4. `Reise` opens.
5. `Erinnerungen` opens.
6. `Mehr` opens.
7. Existing Places opens.
8. Existing consumer Booking view still opens where previously available.
9. No boot loop or blank app appears.

If one of these fails, stop and investigate before judging the Booking Control Center.

## 7. Open the Booking Control Center

1. Click the existing **`◎ Control`** entry in the header.
2. Confirm Control Center Home opens.
3. In `Direkt weiter`, click **Buchungen**.
4. The transition title should become **Booking Control Center**.
5. The new page should show:
   - heading `Alle Buchungen. Ein verständlicher Status.`
   - Reise selector
   - Status Center
   - booking list or a valid empty state
   - booking detail column/panel on wider screens

## 8. Trip scope test

If the account has multiple trips:

1. Note which trip is active globally.
2. Open Booking Control Center.
3. The selector should start with that active trip.
4. Change the selector to another trip.
5. Only bookings belonging to the selected trip should be shown.
6. This selector is a view scope only; it must not create or overwrite Booking truth.
7. Switch the global active trip using the existing Luvia trip selector and reopen the Control Center. The default scope should follow the global trip context.

## 9. Status Center test

With real bookings, compare the list with the four counters:

- **Aufmerksamkeit**: `review_required`, `requires_action`, `alternative_proposed`, `blocked`, `failed`
- **In Bearbeitung**: draft/ready/requested/awaiting reply and equivalent live states
- **Bestätigt**: confirmed
- **Abgeschlossen**: cancelled/declined/completed and terminal states

The counters must be derived from the same rows displayed in the list.

## 10. Provider-independence test

Open bookings created through different paths if available:

- direct API
- email
- external/official link
- partner/affiliate path

The user-facing booking status must remain one Luvia status. The provider/channel should appear only as the booking path, not as a competing status system.

## 11. Detail foundation test

Select a booking.

Expected fields when available:
- booking type
- title
- Luvia status
- date/time
- party size
- booking path
- confirmation number/reference

If the booking requires attention, the detail should explain that the booking needs attention but **must not yet invent reply actions**. Those follow in v13.79/v13.80.

The button `Im bisherigen Buchungsbereich öffnen` intentionally keeps the old booking UI reachable during the staged migration.

## 12. Empty and error states

### No bookings
Select a trip without bookings. Expected:
- `Noch keine Buchungen für diese Reise.`
- button to open Places
- no crash

### Booking API unavailable/error
If the Booking API fails, expected:
- visible error state
- retry button
- rest of Luvia stays usable
- no mutation of booking data

## 13. Browser console diagnostics

### Version

```js
LuviaKernelVersion
```

### Product modules

```js
LuviaProductModuleRegistry.diagnostics()
```

Expected:
- `control-center` registered
- consumer remains enabled
- Control Center can be mounted independently

### Booking Control Center

Open the Booking Control Center and run:

```js
LuviaBookingControlCenter.diagnostics()
```

Expected important fields:

```js
{
  mounted: true,
  ownsBookingTruth: false,
  source: 'booking-core',
  providerIndependent: true,
  loading: false
}
```

`count` and `summary` depend on the selected trip's real bookings.

### Booking integration

```js
LuviaBooking.diagnostics()
```

Expected:
- initialized after Booking Control Center load
- active Booking integration available

### Attention

```js
LuviaControlCenterAttention.diagnostics()
```

Expected:
- `ownsDomainTruth: false`
- no crash if there are zero Attention items

### Capabilities

```js
LuviaCapabilityRegistry.diagnostics()
```

`booking.lifecycle` should be ready/available in a normal authenticated production runtime.

### Global diagnostics

```js
LuviaProductModuleDiagnostics.run()
```

The new `booking-control-center` check should be `ok: true`.

## 14. Isolation test

Optional architecture regression:

```js
LuviaProductModuleRegistry.state('consumer')
LuviaProductModuleRegistry.disable('control-center')
LuviaProductModuleRegistry.state('consumer')
LuviaProductModuleRegistry.enable('control-center')
```

Consumer must remain enabled. Reload afterward to return to the normal clean runtime.

## 15. Supabase steps – explicitly none

For v13.78 you do **not** need:

```bash
npx supabase db push
```

You do **not** need:

```bash
npx supabase functions deploy <function>
```

No SQL Editor script and no new secret is required.

## 16. Rollback

Because v13.78 changes only static app files:

1. Redeploy the complete known-good v13.77.0 project.
2. Do not roll back Supabase database or functions.
3. Reload/close/reopen Luvia so the previous Service Worker becomes active.
4. Verify:

```js
LuviaKernelVersion
```

reports:

```text
build: 13.77.0
core: 4.77.0
```
