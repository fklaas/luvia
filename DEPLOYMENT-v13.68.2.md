# Deployment v13.68.2

1. Deploy the complete v13.68.2 frontend.
2. Run migration:
   `supabase/migrations/20260809192600_core_v4_68_2_email_send_expected_state_early_audit_fix.sql`
3. Deploy:
   `supabase functions deploy booking-email-send`
   `supabase functions deploy booking-email-runtime`
4. JWT verification remains ON for both functions.
5. No new secrets are required.
6. `booking-email-inbound` does not need redeployment for this patch.

## First verification
Run the Sphère booking `8e240d22-6f85-4ecb-89f5-1a6577efc4a1` through `readiness()` and `send()`.
Both must return the asset/file recipient block; `send()` must return an expected HTTP-200 response and persist a blocked `booking_email_requests` row without a provider message id.
