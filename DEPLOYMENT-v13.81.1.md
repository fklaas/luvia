# Deployment v13.81.1

## Required
- Static app deployment: YES
- DB migration: NO new migration
- Edge Functions: NO changes
- Secrets: NO changes

If v13.81.0 was already fully deployed, only deploy the static v13.81.1 app.

### Deploy
```bash
npx wrangler deploy
```

If your deployment is GitHub -> Cloudflare, commit and push the complete project instead.

## Service Worker
Cache: `luvia-shell-v13.81.1`

After deployment close all Luvia tabs and reopen the app.

## Verify
```js
LuviaKernelVersion
```
Expected Core 4.81.1 / Build 13.81.1.

```js
LuviaBookingControlCenter.diagnostics()
```
Expected `explicitMutationClick: true`, `mobileBookingsFirst: true`, `mobileDetailNavigation: true`.
