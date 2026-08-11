# Deployment · Luvia v13.74.0 / Core 4.74.0

1. Deploy the complete project through the existing GitHub/Cloudflare production path.
2. Because the historic Supabase migration ledger is not yet baselined, do **not** run `npx supabase db push` blindly.
3. In Supabase SQL Editor execute the full migration:
   `supabase/migrations/20260810224000_core_v4_74_0_runtime_provider_health_adaptive_booking_decisions.sql`
4. No Edge Function deployment is required for this build.
5. No new secrets are required.
6. Run `SMOKE-v13.74.0.sql` in Supabase SQL Editor.
7. Browser: hard refresh `https://myluvia.app/console.html`, open Booking Core, run `Booking Core testen`, then `Backend-Readiness prüfen`.
