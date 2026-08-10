# Deployment v13.70.1

## Version
- App: `13.70.1`
- Core: `4.70.1`

## Important after the failed SQL Editor run
If the same SQL Editor tab still reports that the transaction is aborted, run `rollback;` once or open a fresh SQL Editor tab. `npx supabase db push` uses its own connection, so an aborted SQL Editor session does not damage the database.

## Database
From the locally linked Luvia project:

```bash
npx supabase db push
```

The build contains the corrected v13.70.0 migration and the additional repair migration:

`supabase/migrations/20260810171500_core_v4_70_1_conversion_runtime_view_migration_fix.sql`

## Supabase Functions
No Edge Function deploy is required.

## Secrets
No new secrets are required.
