# Provider and budget orchestration PCR

Problem: the shared Places/Stays consumer is pinned to Geoapify; routes and paid-provider calls have no cross-instance budget reservation. New TomTom, HERE and HeiGIT secrets are present.

Owner: Places provider orchestration with Platform-owned service-role transport and additive database accounting. Media attribution remains behind places.v1/getCard; no second Place/Trip/Media store. Consumer changes only expose mode and source, with no redesign.

Contracts: additive getRoute(origin,destination,{mode}) and authenticated providers.status; existing WALK default and route geometry remain compatible. Existing explicit provider requests remain explicit. Automatic routing is opt-in from the shared consumer, then promoted after tests.

Files: gateway places/routes and new provider/budget/media modules; additive service-role-only budget tables/RPC; Places contract adapter and shared Places/Stays consumer; tests, runtime manifests and release documentation.

DB impact: persistent policy and atomic pre-request accounting, bounded account-wide windows, circuit cooldowns. No user-domain data copied. Unknown quota is disabled, errors count conservatively, no automatic paid overage. Initial limited ceilings are below verified account/free allowances; externally consumed keys remain subject to reconciliation.

Test plan: provider schema/category/cuisine evidence, geographic clipping, all routing modes and coordinate errors, exact-image reference/attribution, concurrent reservations and window resets, RLS, denied budgets causing zero outbound calls, fallback limits, shared browser Places/Stays and safe regression.

Rollout: additive migration first, gateway next, then consumer after live probes; no Main deployment. Unsupported/unverified provider capabilities stay disabled and are reported. Rollback: consumer 13.82.168.36 and gateway source 314e149e; disable budget policies for newly introduced providers. Retain accounting audit rows; no destructive rollback.
