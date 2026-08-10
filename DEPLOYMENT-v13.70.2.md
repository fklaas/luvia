# Deployment v13.70.2

1. Deploy the complete project build.
2. From the linked local Luvia project run:

```bash
npx supabase db push
```

Migration: `20260810193500_core_v4_70_2_early_commercial_correlation_pending_replay_fix.sql`

No Edge Functions need deployment. No new secrets are required.

Then run the SQL runtime test in `TEST-v13.70.2.md`.
