# Deployment v13.75.0
1. Deploy the complete app package via the existing GitHub/Cloudflare production flow.
2. Because the historical Supabase migration baseline is not repaired yet, do **not** blindly run `npx supabase db push`.
3. In Supabase SQL Editor run the complete file:
   `supabase/migrations/20260811065500_core_v4_75_0_adaptive_failover_decision_replay_orchestration_hardening.sql`
4. No Edge Function deploy is required.
5. No new secrets are required.
6. Run `SMOKE-v13.75.0.sql` in one execution. It rolls back all synthetic booking data.
7. Hard-refresh `/console.html`, run Booking Core tests and Backend Readiness.
8. Run the browser-console checks documented in `TEST-v13.75.0.md`.
