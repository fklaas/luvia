# Deployment v13.81.3

## 0. Preconditions
Use the complete v13.81.3 project. The v13.81.0 database migration must already exist from the previous release.

## 1. Database
No new database migration and no SQL in this patch. Do **not** run `npx supabase db push` for v13.81.3.

## 2. Supabase project
Check the linked project if needed:

```bash
npx supabase projects list
```

If required:

```bash
npx supabase link --project-ref yiadkcxgyzdgyadnhyqe
```

## 3. Deploy changed Edge Functions
Both resolvers changed and must be deployed:

```bash
npx supabase functions deploy booking-contact-resolve
npx supabase functions deploy booking-route-resolve
```

No other Edge Function is required for this patch.

## 4. Secrets
No new secrets. Existing Supabase/service-role configuration is reused.

## 5. Static app
Deploy the complete project through the established pipeline. Direct Wrangler path:

```bash
npx wrangler deploy
```

## 6. Cache
Service Worker cache: `luvia-shell-v13.81.3`. Close all Luvia tabs after deploy and reopen.

## 7. Version check
Browser console:

```js
LuviaKernelVersion
```
Expected App 13.81.3 / Core 4.81.3.

## 8. Mutation mobile smoke
- Control -> Buchungen -> Buchung -> Ändern
- global bottom navigation must disappear while the action sheet is open
- primary CTA must be fully visible
- repeat with Stornieren
- after a structural blocker, the primary CTA becomes disabled and reads `Aktuell nicht möglich`

## 9. Discovery smoke
Use a booking/place with an official website. Re-run route/contact discovery. For Green Farmer's, the resolver must deep-crawl official contact/location pages and may accept `hello@greenfarmers.fr` only when it is actually published on the fetched official source.

If a Reserve with Google handoff is provided/discovered, the resolver may return provider `google_reserve`, while diagnostics must still say `googleDirectIntegration: false`.
