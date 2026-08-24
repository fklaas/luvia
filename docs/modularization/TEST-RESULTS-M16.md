# M16 Test Results - Confirmed Owner Actions

Date: 2026-08-24

Runtime source: `0d7468596dbdb42803738f427d4355bf31281c65`

App / Core: 13.82.48 / 4.82.48

## Automated gates

- Safe Regression: 90 / 90 PASS.
- NFR-0: 3 / 3 PASS.
- Cross-Core DB ownership guard: PASS.
  - tracked JS/TS: 361;
  - static DB calls: 310;
  - mapped debt: 30 / 30 allowed;
  - unmapped DB objects: 39 / 39 baseline;
  - dynamic DB calls: 27 / 27 baseline;
  - growth: none.
- M16.1 browserless Action Ledger: PASS.
- M16.2 nineteen-action capability/risk/confirmation policy: PASS.
- M16.3 confirmed owner runtime, idempotency and unknown-outcome policy: PASS.
- M16.4 confirmation, cancellation, receipt and recovery chat contract: PASS.
- M16.5 runtime registration/load order: PASS.
- M16.6 shared Experience semantics, Trip accent, responsive and reduced
  motion: PASS.
- M15 compatibility suite: PASS.
- Journey/Timeline independent ownership: PASS.
- Private owner-store, direct Supabase/RPC and foreign persistence access in
  the Intelligence action surfaces: 0.

## Capability and connection evidence

- Contract: `intelligence.actions.v1`.
- Supplemental ledger: `intelligence.action-ledger.v1`.
- Registered actions: 19.
- Public owners: Trip, Places, Booking, Journey, Memory and Identity.
- Risk classes: R0-R3; no R4 financial/destructive authority implemented.
- Automatic execution: registered R0 READ plus confirmation NEVER only.
- R1: direct user gesture and owner receipt.
- R2/R3: explicit preview/confirmation; R3 uses idempotency and blocks blind
  retry when the provider outcome is unknown.
- Ledger stores orchestration metadata/digests only, no raw foreign Domain
  payload and no duplicated Domain Truth.

Authenticated live reads proved all six M16 owner bindings. This is not an
exhaustive claim for every table, RPC, Realtime subscription, Edge Function,
storage bucket or external provider operation in the whole application. Those
paths remain itemized in the M21.5 full-function matrix.

## Integration Preview acceptance

- Cloudflare version: `ae43731e-d8d8-4819-b271-020d276b55cf`.
- Stable Integration and immutable Preview URLs: each 17 / 17 byte-exact Git
  blobs.
- Both URLs: each 5 / 5 private-path and 5 / 5 retired-path SPA fallback,
  classified by body equality with the Git index rather than HTTP 200 alone.
- Authenticated App/Core 13.82.48 / 4.82.48: PASS.
- Active Trip Ostseeurlaub / Scharbeutz: PASS.
- Trip collection with active context and selectable alternatives: PASS.
- Booking collection with owner actions: PASS.
- Journey Day Graph cards: PASS.
- Memory collection/empty state: PASS.
- Identity self-only preferences: PASS.
- Provider-backed restaurant search: four real Places cards with facts and
  Places/Booking/Journey actions, PASS.
- R2 `Zur Reise planen`: explicit confirmation card, PASS.
- R2 cancellation: owner command not executed; cancellation receipt, PASS.
- 390 x 844: no horizontal overflow; composer and submit reachable.
- 390 x 500: no horizontal overflow; submit visible.
- Browser console after feature acceptance: 0 errors, 0 warnings.
- Authenticated reloads: 25 / 25 PASS.
- Reload range: 3.027-5.203 seconds; average 3.877 seconds.

## Main and Production acceptance

- Main promotion to runtime source: fast-forward only, PASS.
- Production Cloudflare version:
  `a17a3bbf-2519-4fe2-a35a-64c25fe55186`.
- Production deployment:
  `213ac503-00e4-4855-8059-dd61d2e6ca6a`, 100%.
- `myluvia.app` and immutable Production URL: each 17 / 17 byte-exact Git
  blobs.
- Both Production URLs: each 5 / 5 private-path and 5 / 5 retired-path SPA
  fallback.
- Authenticated Trip, Booking, Journey, Memory, Identity and provider-backed
  Places reads: PASS.
- Production App/Core and active Trip retention: PASS.
- Production console after feature acceptance: 0 errors, 0 warnings.
- Authenticated Production reloads: 25 / 25 PASS.
- Reload range: 3.120-4.846 seconds; average 3.409 seconds.

## Retained test anomaly

One long Production browser-automation sequence targeted an R2 plan/cancel
exercise while result cards and a prior click were still settling. A
reversible R1 Places favourite command for `DAS LEO` completed and returned a
normal Places owner receipt. No R2/R3 confirmation was accepted; no Journey,
Trip, Booking or external provider mutation ran. The resulting favourite is
retained as test data until the user explicitly authorizes its deletion.

This observation is not rewritten as a cancellation PASS. The accepted
confirmation/cancel evidence is the independent Integration flow on the
byte-identical runtime. The anomaly does not prove a foreign-store or database
bypass: the recorded effect went through the public Places owner command and
receipt path. It does prove that long animated browser automation must wait for
stable targets before using dense reversible R1 controls.

## Infrastructure invariants

- Database/schema/RPC/RLS/bucket migration: NONE.
- Supabase Edge Function change: NONE.
- Secret/provider configuration change: NONE.
- Manual Cloudflare configuration: NONE.
- Cloudflare deployment causation: not inferred; provider version/deployment,
  exact bytes and live runtime behavior are recorded separately.
- CRLF working-copy differences were excluded by comparing deployed bytes
  directly with Git blob hashes.
