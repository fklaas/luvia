# Deployment – v13.76.0

## Database migration
**NEIN**

## Supabase Edge Functions
**NEIN**

## Secrets
**NEIN**

## SQL
**KEIN SQL erforderlich**

## Static deployment
Deploy the complete application through the existing Cloudflare/GitHub path. If using Wrangler directly:

```bash
npx wrangler deploy
```

## After deployment
1. Hard reload the app.
2. Confirm `window.LuviaKernelVersion` returns Core 4.76.0 / Build 13.76.0.
3. Confirm normal Consumer UI still boots.
4. Open `intelligence/console.html` and select **Product Modules**.
5. Run **Foundation testen**.
6. Confirm Consumer, Control Center and Developer Console are registered.
7. Confirm existing Booking Core diagnostics remain healthy.
