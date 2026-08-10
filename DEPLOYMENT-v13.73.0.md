# Deployment v13.73.0

## 1. App
Vollständige ZIP committen/pushen und über bestehende Cloudflare-Pipeline deployen.

## 2. Supabase Migration
Wegen der bekannten Migration-History weiterhin **nicht blind `npx supabase db push`**.
Im Supabase SQL Editor vollständig ausführen:
`supabase/migrations/20260810222000_core_v4_73_0_booking_decision_evidence_diagnostics_integrity.sql`

## 3. Edge Functions
Keine Edge Function neu deployen.

## 4. Secrets
Keine neuen Secrets.

## 5. Tests
`SMOKE-v13.73.0.sql` ausführen, danach Developer Console → Booking Core → lokale Tests + Backend-Readiness.
