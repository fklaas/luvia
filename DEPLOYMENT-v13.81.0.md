# Deployment – v13.81.0

## Deployment matrix
- DB migration: **YES**
- SQL Editor: **YES – recommended for this project**
- New Edge Function: **NO**
- Edge Function redeploy: **NO**
- New secrets: **NO**
- Static Cloudflare/Luvia deploy: **YES**

## 1. Database migration
Use Supabase SQL Editor. Do **not** blindly run `npx supabase db push` because project migration history is intentionally not assumed clean.

Run the complete file:
`supabase/migrations/20260812115500_core_v4_81_0_booking_timeline_modify_cancel_conversation_lifecycle.sql`

The migration is additive. It creates:
- `booking_conversation_preferences`
- `luvia_booking_conversation_preference(...)`
- `luvia_booking_record_mutation_fallback(...)`
- `luvia_booking_timeline_v1(...)`

It does not delete existing Booking Core data.

## 2. Verify database objects
Run `SMOKE-v13.81.0.sql` section A after migration.

## 3. Edge Functions
No v13.81 Edge Function deployment is required. Existing live runtimes are reused:
- `booking-provider-reservation-mutation`
- `booking-provider-reservation-mutation-status`
- `booking-email-reply`

Do not redeploy them merely for v13.81 unless your production project is missing a previously required deployment.

## 4. Static deployment
Copy the complete v13.81 project into the repository and deploy normally.

Commit title:
`feat(luvia): add booking timeline modify cancel and conversation lifecycle v13.81.0`

Direct Wrangler path, when used by the project:
`npx wrangler deploy`

## 5. Service worker
Expected cache: `luvia-shell-v13.81.0`.
Close all Luvia tabs after production deployment, reopen and verify `LuviaKernelVersion`.

## 6. Production smoke order
1. Verify build 13.81.0/Core 4.81.0.
2. Open Control → Buchungen.
3. Open an existing booking and verify Timeline.
4. For a harmless live test, use Modify with a genuinely intended change OR use Cancel only when cancellation is truly intended. These are real provider/customer actions.
5. For an email booking, verify fallback creates an outbound message and booking stays non-terminal until provider reply.
6. Open Control → Inbox; archive a conversation; verify it moves to Archiv; unarchive it.
7. Delete a conversation from your Inbox; verify it disappears while SQL confirms `booking_messages` still exist.
