# Deployment – Luvia v13.68.3 / Core 4.68.3

## 1. Frontend
Deploy the complete v13.68.3 project package.

## 2. Supabase migration
Run in SQL Editor:

`supabase/migrations/20260809194000_core_v4_68_3_email_verification_auth_context_fix.sql`

This migration does not weaken RLS and does not alter the verification contract. It records the release/health state and documents the runtime auth-context requirement.

## 3. Edge Function
Deploy:

`supabase functions deploy booking-email-send`

JWT Verification: **ON**.

No `--no-verify-jwt`.

## 4. Other Functions
No redeploy is required for `booking-email-runtime` or `booking-email-inbound` for this patch.

## 5. Secrets
No new secrets.

## Regression test
Repeat the Sphère send call. Expected: HTTP 200 business response `EMAIL_ASSET_OR_FILE_REFERENCE` and a blocked audit row. There must be no Resend provider message id.
