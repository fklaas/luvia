# Deployment — Luvia v13.68.0 / Core 4.68.0

## 1. Frontend
Die vollständige ZIP deployen.

## 2. Migrationen — in Reihenfolge
1. `supabase/migrations/20260809170500_core_v4_66_0_email_booking_v2_request_runtime.sql`
2. `supabase/migrations/20260809172000_core_v4_67_0_email_booking_v2_thread_reply_status.sql`
3. `supabase/migrations/20260809174000_core_v4_68_0_email_booking_v2_completion_recovery.sql`

## 3. Edge Functions
```bash
supabase functions deploy booking-email-send
supabase functions deploy booking-email-inbound
supabase functions deploy booking-email-runtime
```

- `booking-email-send`: JWT Verification **ON**.
- `booking-email-runtime`: JWT Verification **ON**.
- `booking-email-inbound`: Resend Webhook Endpoint; die bestehende Webhook-Konfiguration beibehalten. Falls das Supabase-Dashboard für Webhook-Funktionen JWT-Verifikation erzwingt, muss dieser Endpoint wie bereits beim bisherigen Inbound-Webhook so konfiguriert bleiben, dass Resend ihn ohne Luvia-User-JWT erreichen kann. Die Svix-Signaturprüfung in der Function bleibt die eigentliche Webhook-Authentisierung.

## 4. Bestehende Secrets
Weiterhin benötigt:
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `BOOKING_EMAIL_FROM`
- `BOOKING_INBOUND_DOMAIN`
- `BOOKING_MODE`
- im Testbetrieb: `BOOKING_TEST_RECIPIENT`

Keine neuen Secrets für v13.66–v13.68.

## 5. Wichtiger Produktions-Guard
Produktive E-Mail-Ziele werden nur akzeptiert, wenn die Adresse in `booking_contact_candidates` exakt als `verified + public + official + auto_usable` nachgewiesen ist und nicht zu einer Booking-/SaaS-Provider-Domain gehört.
