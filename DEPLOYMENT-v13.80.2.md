# Deployment – v13.80.2

## Required
1. **Database migration:** NO new migration for v13.80.2. The v13.80.0 migration must already exist.
2. **Supabase Edge Function:** YES – redeploy `booking-email-reply` because its verification logic changed.
3. **Secrets:** NO changes.
4. **Static app:** YES.

## Commands
From the project directory:

```bash
npx supabase functions deploy booking-email-reply
```

Then deploy the complete static app using the existing deployment path, for direct Wrangler deployments:

```bash
npx wrangler deploy
```

Do **not** run `npx supabase db push` for this patch.

## Post-deploy
- Close all Luvia tabs and reopen.
- Confirm `LuviaKernelVersion` reports Core 4.80.2 / Build 13.80.2.
- On mobile, Control → Inbox must show the conversation list first.
- Open a thread: `← Inbox` must be visible.
- Send a reply in an already verified existing booking thread. It must no longer fail solely because of the obsolete `verified/autoUsable` field check.
