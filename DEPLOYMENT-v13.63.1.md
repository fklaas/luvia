# Deployment v13.63.1 / Core 4.63.1

1. Deploy the complete v13.63.1 project/frontend.
2. Run this migration in the Supabase SQL Editor:

   `supabase/migrations/20260809131500_core_v4_63_1_early_mutation_audit_fix.sql`

3. Redeploy the changed Edge Function:

```bash
supabase functions deploy booking-provider-reservation-mutation
```

JWT Verification: **ON**. Do **not** use `--no-verify-jwt`.

No provider functions need redeployment for this patch.
No new secrets are required.
Do not change provider connection/readiness states for testing.
