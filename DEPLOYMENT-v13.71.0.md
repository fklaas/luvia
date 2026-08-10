# Deployment v13.71.0

## Important: migration history is not yet safely baselined

Do **not** run `npx supabase db push` for this release. The production database currently contains historical structures whose CLI migration history is incomplete, so an unguarded db push may try to replay old migrations.

## Deployment order

1. Deploy the complete v13.71.0 project build to the normal Luvia web deployment.
2. In Supabase → SQL Editor, open:
   `supabase/migrations/20260810214500_core_v4_71_0_production_commission_revenue_lifecycle.sql`
3. Execute that migration once against the production project.
4. No Edge Functions require deployment.
5. No new secrets are required.
6. Run the rollback-safe SQL runtime test from `TEST-v13.71.0.md`.

A later dedicated infrastructure step must repair/baseline Supabase migration history before `npx supabase db push` becomes the default again.
