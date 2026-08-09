# Deployment v13.63.0 / Core 4.63.0

## 1. Frontend
Deploy the complete v13.63.0 project.

## 2. SQL migration
Run in Supabase SQL Editor:
`supabase/migrations/20260809113000_core_v4_63_0_reservation_modify_cancel_runtime_v1.sql`

## 3. Edge Functions
Deploy the new mutation runtime:
`supabase functions deploy booking-provider-reservation-mutation`

JWT verification: **ON** (default). The function authenticates the user and then performs the provider mutation through server-side guarded logic.

The provider functions below were changed only to expose the newly persisted capability values in diagnostics; deploy them as well so runtime and diagnostics stay on the same build:
- `supabase functions deploy booking-provider-zenchef`
- `supabase functions deploy booking-provider-opentable`
- `supabase functions deploy booking-provider-sevenrooms`
- `supabase functions deploy booking-provider-resy`

JWT verification for all four: **ON** (default).

No new secrets are required by v13.63.0. Existing partner credential/connection gates remain authoritative.

## 4. Do not activate providers manually
Do not set `luvia_access_state='connected'`, probe state, credentials or `liveTransportEnabled=true` merely to test this build. Expected `PARTNER_REQUIRED`/transport blocks are part of the smoke test while real partner access is absent.
