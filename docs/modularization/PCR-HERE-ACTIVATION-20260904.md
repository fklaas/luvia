# HERE live activation

Baseline: Integration 550d25c8, runtime .37 / gateway v161. The user's screenshot confirms an accessible organization and created app. Bounded authenticated gateway probes succeeded for category search, WALK and BICYCLE on 2026-09-04. HERE's current public Limited Plan documents 1000 requests/day across location services (https://www.here.com/get-started/pricing/rps-limits-excluded-use-cases). The individual billing plan is not visible in this browser; no account-plan or paid-subscription changes are authorized by this release.

Scope: configuration-only activation behind existing Places/Platform provider accounting. Consolidate the previously disabled HERE search and routing policies into a single shared pool: 500/day, 10000/month, 10/minute, UTC. Carry forward existing reservations, including the three acceptance requests. Keep legacy rows and usage for audit, disable their operations. No user-domain data, credentials or frontend changes.

Migration locks the old policy rows before changing routing ownership. Rollback disables the new shared policy; retain usage. Validate shared accounting and role access, live results, final server policy and clean source/deployment distinction. No gateway or frontend redeploy is needed: current .37 already includes the adapter and fallback order.
