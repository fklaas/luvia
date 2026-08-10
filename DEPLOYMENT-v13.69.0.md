# Deployment v13.69.0 / Core 4.69.0

1. Deploy the complete web build.
2. From the locally linked Luvia Supabase project run:
   `npx supabase db push`
3. No Supabase Edge Function redeploy is required for this build.
4. No new secrets are required.
5. Hard-refresh / reopen the app so the `v13.69.0` service-worker cache is used.

## Runtime smoke tests
After DB migration is live, run the SQL checks from `TEST-v13.69.0.md`, then perform one real restaurant external handoff in Places and inspect the resulting correlation/monetization snapshot.
