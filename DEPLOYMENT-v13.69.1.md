# Deployment v13.69.1

1. Deploy the full project build through the normal Luvia web deployment.
2. From the locally linked Luvia project run:

```bash
npx supabase db push
```

Migration:
`20260810135500_core_v4_69_1_official_website_monetization_profile_normalization_fix.sql`

No Supabase Edge Function deploy is required.
No new secret is required.
