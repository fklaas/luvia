# M16 Release Notes - Confirmed Owner Actions

Date: 2026-08-24

Status: COMPLETE / CLOSED / PRODUCTION VERIFIED

App / Core: 13.82.48 / 4.82.48

Runtime source: `0d7468596dbdb42803738f427d4355bf31281c65`

## Outcome

M16 turns the six-action M15 pilot into a governed owner-action platform.
Luvia now exposes nineteen capabilities across Trip, Places, Booking, Journey,
Memory and Identity, presents each owner result inside the global conversation
and enforces risk-aware execution through a browserless Action Ledger. Luvia
Intelligence remains an orchestrator and owns no foreign Domain Truth.

## Visible product changes

- The global chat shows live Trip, Booking, Journey, Memory, Identity and
  Places results instead of falling back to text for these registered intents.
- Restaurant requests render real Places cards with provider facts, imagery,
  evidence and actions for favourite, Booking and trip planning.
- Meaningful changes show a dedicated R2/R3 confirmation card before any
  owner command can run.
- Completed, cancelled, failed and unknown-outcome actions appear as receipts
  in the same conversation.
- Active-Trip result cards and controls inherit semantic Trip accent tokens.
- The command surface remains usable without horizontal overflow at 390 x 844
  and at a 390 x 500 keyboard-height viewport.

## Architecture and safety

- `intelligence.actions.v1`: 19 registered actions, 6 owners, R0-R3.
- `intelligence.action-ledger.v1`: digest-only orchestration state, legal
  transitions, idempotency deduplication and unknown-outcome retry blocking.
- R0 registered reads may auto-run; R1 needs a direct user gesture; R2/R3 need
  explicit confirmation; no R4 authority exists in this release.
- Trip, Places, Booking, Journey, Memory and Identity execute only through
  their public contracts and retain all Domain Truth.
- Journey/Timeline remains its own cross-domain aggregator.
- Experience owns confirmation/receipt presentation; Platform owns runtime
  registration and native adapter mapping.
- Web globals remain compatibility bindings, not the final native contract
  target.

## Commits

- Intelligence owner implementation:
  `808f99af1d791614581244d51a107459dd3f0c87`.
- Experience owner implementation:
  `7b3a49128fab9399e3a8e9ac14ea5aa1496a1bd6`.
- Consolidated Platform, Integration and Main runtime:
  `0d7468596dbdb42803738f427d4355bf31281c65`.

## Quality and live acceptance

- Safe Regression: 90 / 90 PASS.
- NFR-0: 3 / 3 PASS.
- Cross-Core DB guard: PASS with no growth.
- Integration Preview:
  `ae43731e-d8d8-4819-b271-020d276b55cf`.
- Preview stable/immutable: each 17/17 exact plus 5/5 private and 5/5 retired
  fallback.
- Preview authenticated owner flows, R2 confirmation/cancel, mobile layouts
  and console: PASS; 25/25 F5, average 3.877 seconds.
- Production version/deployment:
  `a17a3bbf-2519-4fe2-a35a-64c25fe55186` /
  `213ac503-00e4-4855-8059-dd61d2e6ca6a`, 100%.
- Production stable/immutable: each 17/17 exact plus 5/5 private and 5/5
  retired fallback.
- Production authenticated six-owner reads and real Places provider path:
  PASS; 25/25 F5, average 3.409 seconds; console 0.

Live acceptance proves the six M16 owner read connections. The complete
database/RPC/Realtime/Function/provider surface remains subject to the
mandatory M21.5 all-functions acceptance matrix.

## Recorded automation anomaly

A dense long-running Production browser sequence caused one reversible R1
Places favourite command for `DAS LEO`, with a valid Places owner receipt. No
R2/R3 confirmation or Trip/Booking/Journey mutation occurred. The favourite is
not silently deleted; cleanup requires explicit user approval. Independent
Preview confirmation/cancel evidence remains PASS on byte-identical code.

## Infrastructure and deployment

- Database/schema/RPC/RLS/bucket migration: NONE.
- Supabase Edge Function change: NONE.
- Supabase secrets: UNCHANGED.
- Manual Cloudflare configuration: NONE.
- Cloudflare causation is not inferred from chronology. Provider-reported
  versions/deployment, exact Git bytes and authenticated runtime behavior are
  the acceptance evidence.

## Rollback

Return the Worker release to synchronized M15 marker
`efd64fed5ed47624b399635c9ae1942c5e5ac86f`. No schema, RLS, bucket, Function
or secret rollback is required. Real owner effects are never presumed undone
by Git; they follow their owner receipt and recovery contract.
