# Deployment – Luvia v13.68.4 / Core 4.68.4

1. Deploy the complete v13.68.4 project package.
2. Run in Supabase SQL Editor:

   `supabase/migrations/20260809201500_core_v4_68_4_contact_resolver_candidate_bridge_legacy_contact_verification_fix.sql`

3. Deploy the changed Edge Function:

   `supabase functions deploy booking-contact-resolve`

JWT Verification stays ON. No new secrets are required.

`booking-email-send`, `booking-email-runtime`, and `booking-email-inbound` do not need redeployment for this patch.
