# Deployment – Luvia v13.77.0 / Core 4.77.0
## Control Center Home & Travel Identity Integration

## 1. Deployment impact

| Area | Required |
|---|---|
| Database migration | **NO** |
| Supabase SQL Editor | **NO** |
| Supabase Edge Functions | **NO** |
| New/changed secrets | **NO** |
| Cloudflare/static app deployment | **YES** |
| Service worker cache update | **YES** – cache key changes to `luvia-shell-v13.77.0` |

This release is a static application release. It consumes the Booking Core and Trip runtime already deployed by earlier releases and does not change their database truth.

## 2. Before deploying

1. Keep the previous known-good v13.76.0 ZIP available for rollback.
2. Confirm the release root contains:
   - `CURRENT-BUILD.md`
   - `RELEASE-v13.77.0.md`
   - `TEST-RESULTS-v13.77.0.md`
   - `app/control-center/control-center-home.js`
   - `app/control-center/travel-identity-service.js`
   - `app/control-center/control-center-attention-service.js`
3. Do **not** run `npx supabase db push` for this release.
4. Do **not** deploy any Supabase Function for this release.

## 3. Local/static pre-deploy verification

From the extracted project root run:

```bash
node tests/v13.77.0-control-center-home-travel-identity.test.cjs
node tests/booking-thefork-adapter-v13.41.0.test.cjs
node tests/booking-quandoo-adapter-v13.42.0.test.cjs
node tests/booking-opentable-adapter-v13.44.0.test.cjs
node tests/booking-sevenrooms-adapter-v13.45.0.test.cjs
node tests/booking-resy-adapter-v13.46.0.test.cjs
node tests/booking-tock-adapter-v13.47.0.test.cjs
```

Expected first release marker:

```text
LUVIA_V13_77_0_CONTROL_CENTER_HOME_TRAVEL_IDENTITY_OK
```

Also run syntax checks:

```bash
node --check app/control-center/travel-identity-service.js
node --check app/control-center/control-center-attention-service.js
node --check app/control-center/control-center-home.js
node --check app/control-center/control-center-manifest.js
node --check app/app-shell.js
```

## 4. Deploy static application

Use the same production deployment path used for the current Luvia site. If deploying directly with the existing Cloudflare Worker configuration from the repository root:

```bash
npx wrangler deploy
```

If production deployment is performed automatically through GitHub/Cloudflare, commit the complete v13.77.0 project and let the configured production pipeline deploy it. Do not mix files from v13.76 and v13.77.

Recommended commit title:

```text
feat(luvia): add Control Center Home and travel identity integration v13.77.0
```

## 5. Service worker/cache verification

v13.77 changes the service worker cache name to:

```text
luvia-shell-v13.77.0
```

After deployment:

1. Open `myluvia.app` normally.
2. Reload once.
3. If the old release remains visible, close all Luvia tabs and reopen the site.
4. If needed, use the existing force-update flow or browser Application → Service Workers → Update.
5. Do not judge the release until `LuviaKernelVersion` reports build `13.77.0`.

## 6. Browser smoke test – visible product flow

Log in with an account that has at least one trip.

### A. Existing Consumer Experience regression

Verify before opening Control Center:

1. `Heute` opens.
2. `Planen` opens.
3. `Reise` opens.
4. `Erinnerungen` opens.
5. `Mehr` opens.
6. No blank screen or boot loop occurs.

### B. Control Center entry

1. In the existing Luvia header locate **`◎ Control`**.
2. Click it.
3. A `Control Center` transition should appear.
4. The Home should show the current trip identity.
5. It should display the active trip name, destination and dates when available.
6. It should show the travel phase, e.g. preparation / active trip day / completed.
7. The four area cards should be visible:
   - Buchungen
   - Inbox
   - Reiseunterlagen
   - Trip Command
8. Booking should indicate whether its capability is connected.
9. Inbox and Wallet may correctly show planned status; v13.79/v13.82 implement those product areas.

### C. Travel identity truth check

1. Note the trip shown in the normal Luvia header.
2. Open Control Center.
3. The Control Center trip must match the same global active trip.
4. Switch trip using the existing trip/profile mechanism.
5. Return to Control Center.
6. The identity must follow the globally selected trip without maintaining a second selection.

### D. Attention behavior

1. Click `Aktualisieren` in the attention section.
2. With no booking requiring action, `Keine offenen Aktionen erkannt.` is valid.
3. If a real booking has `review_required`, `requires_action`, `alternative_proposed`, `blocked` or `failed`, it should be represented as an attention item.
4. Failure to load Booking data must not crash the entire app; Control Center should remain usable.

### E. Existing Booking view regression

Click the Booking card and verify the existing Booking view still opens. v13.77 must not replace the existing Booking UI or mutate Booking Core truth.

## 7. Browser console checks

Run:

```js
LuviaKernelVersion
```

Expected important fields:

```js
{
  core: '4.77.0',
  build: '13.77.0',
  name: 'Control Center Home & Travel Identity Integration'
}
```

Then:

```js
LuviaProductModuleRegistry.diagnostics()
```

Expected:
- `control-center` exists.
- Control Center status is `home-v1`.
- When the Home is open, Control Center is mounted/active.
- Consumer remains enabled.

Travel identity:

```js
LuviaControlCenterTravelIdentity.diagnostics()
```

Expected:
- `ownsTripTruth: false`
- `source: 'global-trip-context'`
- active trip matches Luvia global trip context.

Attention:

```js
LuviaControlCenterAttention.diagnostics()
```

Expected:
- `ownsDomainTruth: false`
- `loading: false` after refresh completes.
- `items` is an array.

Home integration:

```js
LuviaControlCenterHome.diagnostics()
```

When Control Center is open, expected:

```js
mounted === true
```

Global architecture:

```js
LuviaCapabilityRegistry.diagnostics()
LuviaGlobalContracts.diagnostics()
LuviaProductModuleDiagnostics.run()
```

## 8. Isolation regression

From a normal page, test module isolation:

```js
LuviaProductModuleRegistry.state('consumer')
LuviaProductModuleRegistry.disable('control-center')
LuviaProductModuleRegistry.state('consumer')
LuviaProductModuleRegistry.enable('control-center')
```

Consumer must remain enabled before, during and after the Control Center toggle.

Reload after this manual diagnostic so the regular default-enabled state is restored cleanly.

## 9. What does NOT need deployment

Do not run:

```bash
npx supabase db push
```

Do not run any:

```bash
npx supabase functions deploy ...
```

No secrets need to be added or changed.

## 10. Rollback

If a production regression appears:

1. Redeploy the complete known-good **v13.76.0 / Core 4.76.0** project.
2. Do not roll back Supabase because v13.77 made no DB changes.
3. Reopen the site so the previous service worker/cache is installed.
4. Confirm:

```js
LuviaKernelVersion
```

reports build `13.76.0` and core `4.76.0`.
