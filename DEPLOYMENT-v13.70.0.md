# Deployment v13.70.0

## Version

- App: `13.70.0`
- Core: `4.70.0`

## Database

From the locally linked Luvia project:

```bash
npx supabase db push
```

Migration:

`supabase/migrations/20260810161000_core_v4_70_0_conversion_runtime_commercial_event_ingestion.sql`

## Supabase Functions

No new or changed Edge Function is required for v13.70.0.

The commercial ingestion contract is deliberately a service-role database runtime. Provider-specific public callback endpoints are only activated when a real partner contract, payload and authenticity mechanism are known.

## Secrets

No new secrets are required.

## Static application

Deploy/push the complete v13.70.0 project normally so cache-busted client modules and version metadata become active.
