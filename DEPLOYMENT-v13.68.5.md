# Deployment – v13.68.5 / Core 4.68.5

1. Deploy the complete frontend package.
2. Run migration:
   `supabase/migrations/20260809214500_core_v4_68_5_placeholder_email_detection_verified_candidate_ranking_fix.sql`
3. Deploy with JWT verification ON:
   - `supabase functions deploy booking-contact-resolve`
   - `supabase functions deploy booking-email-runtime`
4. No new secrets are required.

Do not deploy `booking-email-send` or `booking-email-inbound` for this patch unless your deployment process always redeploys all functions.
