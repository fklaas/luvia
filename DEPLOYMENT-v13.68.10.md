# Deployment v13.68.10

1. Deploy the complete frontend package.
2. From the linked Supabase project directory run:

```bash
npx supabase db push
```

3. Redeploy the inbound email function so runtime metadata and the webhook response match this release:

```bash
npx supabase functions deploy booking-email-inbound
```

`booking-email-inbound` remains `verify_jwt = false` because Resend authenticates the inbound webhook through the existing Svix signature verification.

No new secrets are required.

After deployment, re-run the existing GMX inbound message through `luvia_booking_process_inbound_intelligence_v2`. It should classify the German confirmation as `confirmed`, but because the sender is untrusted, persist `auto_apply=false`, `applied=false`, `review_required=true`, and produce no `email_reply` status signal.
