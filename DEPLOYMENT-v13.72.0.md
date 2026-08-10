# Deployment v13.72.0

## 1. App deployen
Die vollständige v13.72.0-ZIP als neue Projektversion committen/pushen und über die bestehende Cloudflare-Pipeline deployen.

## 2. Supabase Migration
Wegen der bekannten historischen Migration-History **nicht blind `npx supabase db push` verwenden**.

Im Supabase SQL Editor den vollständigen Inhalt ausführen:
`supabase/migrations/20260810215300_core_v4_72_0_booking_intelligence_provider_orchestration_diagnostics.sql`

## 3. Edge Functions
Für v13.72.0 muss keine Edge Function neu deployed werden.

## 4. Secrets
Keine neuen Secrets.

## 5. Runtime Smoke
Nach erfolgreicher Migration `SMOKE-v13.72.0.sql` vollständig in einer Query ausführen. Die Query endet mit `rollback`.

## 6. Developer Console
`https://myluvia.app/console.html` öffnen → Tab **Booking Core**.
- Booking Core Gesamtstatus prüfen
- `Booking Core testen`
- optional angemeldet `Backend-Readiness prüfen`
