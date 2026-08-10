# Deployment v13.68.9

1. Deploy the full frontend/build.
2. From the linked project directory run:

```bash
npx supabase db push
```

3. Deploy the inbound webhook function:

```bash
npx supabase functions deploy booking-email-inbound
```

`supabase/config.toml` keeps `booking-email-inbound` with `verify_jwt = false`; Resend authenticates this endpoint through the existing Svix signature verification inside the function.

No new secrets are required. Existing `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `RESEND_WEBHOOK_SECRET` remain in use.
