# Deployment – Luvia v13.58.0 / Core 4.58.0

1. Komplette Web-App deployen.
2. Migration ausführen:
   `supabase/migrations/20260809074500_core_v4_58_0_provider_credential_activation_live_probe_runtime.sql`
3. Edge Function deployen:
   `supabase functions deploy booking-provider-connection-health`
   JWT Verification: ON.
4. Gateway für Release-/Health-Konsistenz neu deployen:
   `supabase functions deploy luvia-gateway --no-verify-jwt`

## Neue optionale Konfiguration

Nur für einen echten Quandoo-Live-Probe:

- `QUANDOO_PROBE_MERCHANT_ID` – Merchant-ID eines für Luvia freigegebenen Test-/Produktions-Merchants.
- Optional `QUANDOO_API_BASE`; Standard ist `https://api.quandoo.com/v1`.

Bereits bestehend:
- `QUANDOO_AUTH_TOKEN`
- `QUANDOO_AGENT_ID`

Ohne diese Werte bleibt Quandoo korrekt auf `waiting_credentials` / `waiting_configuration`; es wird nichts künstlich aktiviert.

## Keine Secrets im Browser

Alle Werte bleiben ausschließlich als Supabase Function Secrets/Environment-Konfiguration serverseitig.
