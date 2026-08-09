# Deployment v13.64.0 / Core 4.64.0

## 1. Frontend
Deploy the complete v13.64.0 project.

## 2. SQL migration
Run in Supabase SQL Editor:

`supabase/migrations/20260809154500_core_v4_64_0_reservation_lifecycle_synchronization.sql`

Die Migration erweitert die bestehenden Modify-/Cancel-Audits, legt den Mutation-Lifecycle-Eventstream und die zentrale Lifecycle-RPC/View an.

## 3. Edge Functions
Deploy the updated mutation runtime:

`supabase functions deploy booking-provider-reservation-mutation`

Deploy the new read-only status runtime:

`supabase functions deploy booking-provider-reservation-mutation-status`

JWT verification: **ON** for both functions.

## 4. Provider Functions
Keine Provider-Function muss für v13.64.0 allein erneut deployed werden. Die bestehende v13.63.x Provider-Adapter-/Connection-Wahrheit bleibt unverändert.

## 5. Secrets
Keine neuen Secrets erforderlich.

## 6. Nicht künstlich aktivieren
Provider weiterhin nicht manuell auf `connected`, `healthy` oder `liveTransportEnabled=true` setzen. Solange kein echter Partnerzugang besteht, bleiben echte Mutation-Calls erwartungsgemäß an der Readiness blockiert.
