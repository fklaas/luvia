# Deployment – Luvia v13.80.0 / Core 4.80.0

## Overview
This release changes three layers and should be deployed in this order:
1. Database migration
2. Supabase Edge Function `booking-email-reply`
3. Static Luvia application

Do not deploy the static UI first, because the new composer expects the v4.80 database RPC and reply function to exist.

## 1. Pre-deploy checks
- Confirm production currently runs v13.79.0 / Core 4.79.0.
- Keep the complete v13.79 ZIP available for static rollback.
- Confirm the existing Email Booking V2 setup is healthy (Resend inbound/outbound already working).
- No new secret values are introduced; the new function reuses the existing Booking/Resend environment.

## 2. Database migration – REQUIRED
Migration file:
`supabase/migrations/20260812104500_core_v4_80_0_booking_actions_intelligence.sql`

Recommended production method for this project: open the Supabase SQL Editor, copy the complete content of that migration file, and execute it once.

Do **not** blindly run `npx supabase db push` just for this release.

The migration is additive. It:
- adds persistent review/action fields to `booking_message_intelligence`
- backfills `review_state`
- adds a review-state constraint and index
- creates `luvia_booking_resolve_message_intelligence(...)`
- grants the RPC only to authenticated/service-role contexts

### SQL verification after migration
Run in Supabase SQL Editor:

```sql
select column_name, data_type
from information_schema.columns
where table_schema='public'
  and table_name='booking_message_intelligence'
  and column_name in ('review_state','reviewed_by','reviewed_at','user_action','user_action_payload')
order by column_name;
```

Expected: 5 rows.

Then:

```sql
select routine_name
from information_schema.routines
where routine_schema='public'
  and routine_name='luvia_booking_resolve_message_intelligence';
```

Expected: one function row.

Optional state check:

```sql
select review_state, count(*)
from public.booking_message_intelligence
group by review_state
order by review_state;
```

Existing rows that require review/action should normally be `open`; non-action rows should be `not_required`.

## 3. Supabase Edge Function – REQUIRED
From the local Luvia project root, after login/linking to the correct Supabase project:

```bash
npx supabase functions deploy booking-email-reply
```

No other function needs to be redeployed solely for v13.80.

### Required existing environment
The new function reuses the environment already required by Email Booking V2:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `BOOKING_MODE`
- `BOOKING_TEST_RECIPIENT` when not in production mode
- `BOOKING_FROM` if customized

No new secret name is required.

## 4. Function verification
In Supabase Dashboard → Edge Functions verify that `booking-email-reply` exists and the newest deployment is active.

The function is configured with JWT verification:

```toml
[functions.booking-email-reply]
verify_jwt = true
```

Do not disable this guard.

## 5. Static application deployment
Replace/update the project with the complete v13.80 build.

Recommended commit:

`feat(luvia): add Booking Actions and Intelligence v13.80.0`

If using the existing Wrangler deployment path, from project root:

```bash
npx wrangler deploy
```

If GitHub → Cloudflare deploys automatically, commit/push the complete project and wait until Cloudflare marks deployment successful.

## 6. Service Worker refresh
The cache is `luvia-shell-v13.80.0`.

After static deployment:
1. Open Luvia.
2. Reload once.
3. If old assets remain, close all Luvia tabs.
4. Reopen Luvia.
5. Verify in browser console:

```js
LuviaKernelVersion
```

Expected:
- core `4.80.0`
- build `13.80.0`
- name `Booking Actions & Intelligence`

## 7. Functional production smoke test
Use a real Booking conversation that already has an Email V2 thread.

### A. Free reply
1. Control → Inbox.
2. Open an existing conversation.
3. Type a harmless reply, e.g. `Vielen Dank für die Rückmeldung.`
4. Press Send once.
5. Wait for success toast.
6. Verify the outbound bubble only appears after transport success.
7. Reload the page and reopen the conversation; the message must still exist.

### B. Alternative action
Use a conversation with Intelligence intent `alternative_proposed`.
1. Verify `Alternative annehmen` / `Ablehnen` appear.
2. Choose the appropriate test action only when safe for the real venue.
3. Verify a real outbound reply is created.
4. Verify the Intelligence card becomes resolved after reload.
5. Verify Booking status becomes `awaiting_reply`, not `confirmed`.

### C. requires_action / review_required
1. Open an action-required Intelligence card.
2. Press `Antworten`.
3. Enter the answer and Send.
4. Reload and verify the Intelligence action remains resolved.

## 8. Browser console checks
While Inbox is open:

```js
LuviaBookingInbox.diagnostics()
```

Expected:
- `ownsMessageTruth: false`
- `ownsBookingTruth: false`
- `source: 'booking-core'`
- `composerTransport: 'booking-email-reply-v1'`
- `intelligenceActions: true`

Then:

```js
LuviaBooking.diagnostics()
```

Expected Booking integration version: `1.16.0`.

And:

```js
LuviaCapabilityRegistry.probe('booking.actions')
```

Expected: true.

## 9. Supabase data verification after one test reply
For a known Booking ID:

```sql
select id,direction,channel,transport_provider,delivery_status,body_text,email_thread_id,created_at
from public.booking_messages
where booking_id='YOUR_BOOKING_UUID'
order by created_at desc
limit 10;
```

The new user reply should be outbound/email/resend and `sent`.

Check thread:

```sql
select booking_id,state,last_outbound_message_id,last_inbound_message_id,last_activity_at
from public.booking_email_threads
where booking_id='YOUR_BOOKING_UUID';
```

Expected after reply: `state = 'awaiting_reply'` and `last_outbound_message_id` points to the new message.

For Intelligence actions:

```sql
select id,intent,review_required,requires_user_action,review_state,user_action,reviewed_at
from public.booking_message_intelligence
where booking_id='YOUR_BOOKING_UUID'
order by classified_at desc;
```

Resolved user actions should remain `resolved` after reload.

## 10. Failure behavior to verify
- Booking without existing email thread → no fake send; expected `EMAIL_THREAD_REQUIRED` error.
- Unverified venue recipient → reply blocked; no success bubble.
- Missing test recipient in test mode → reply blocked.
- Double click/retry with same idempotency key must not create a second provider send.

## 11. Rollback
Because v13.80 has an additive DB migration, rollback is layered:

### Static rollback
Redeploy complete v13.79 project if UI regression occurs.

### Function rollback
If reply transport itself is faulty, stop using v13.80 UI and redeploy/remove the new function as appropriate. Existing initial `booking-email-send` and inbound functions remain untouched.

### Database
The additive columns/RPC may safely remain while v13.79 static UI is restored. Do not drop them during an emergency rollback unless a deliberate DB rollback is planned and tested.

This makes the safest emergency rollback: **v13.79 static app + leave additive v4.80 DB objects in place**.
