# Deployment v13.65.0 / Core 4.65.0

## 1. Frontend
Die vollständige v13.65.0-ZIP deployen.

## 2. SQL Migration
Im Supabase SQL Editor ausführen:

`supabase/migrations/20260809163500_core_v4_65_0_reservation_mutation_recovery_reconciliation.sql`

Die Migration erweitert bestehende Modify-/Cancel-Requests, legt Reconciliation-Attempts und Queue an und aktiviert den sicheren Abschluss durch terminale Lifecycle-Events.

## 3. Edge Functions
Aktualisierte Mutation Runtime deployen:

`supabase functions deploy booking-provider-reservation-mutation`

Aktualisierte Mutation Status Runtime deployen:

`supabase functions deploy booking-provider-reservation-mutation-status`

Neue Reconciliation Runtime deployen:

`supabase functions deploy booking-provider-reservation-reconcile`

JWT Verification: **ON** für alle drei Functions.

## 4. Provider Functions
Für v13.65 allein keine Provider-Function erneut deployen. Der Reconciliation-Core nutzt nur bereits vorhandene `get_reservation`-Read-Actions, sofern Providerzugang, Capability und Connection dies zulassen.

## 5. Secrets
Keine neuen Secrets erforderlich.

## 6. Nicht künstlich aktivieren
Provider nicht manuell auf `connected`, `healthy` oder aktive Status-Transporte setzen. Ohne echten Partnerzugang sind `PARTNER_REQUIRED`, `RECONCILIATION_AWAITING_WEBHOOK` oder ein nicht implementierter Status-Read-Pfad korrekte Expected States.
