# PCR M16.5J — Accepted Living Shell Runtime Release

## Purpose

M16.5J packages the M16.5H productive shell adoption and the M16.5I binding
visual-parity gate as a new immutable Integration candidate. This is a review
release, not a claim that the complete visual redesign is finished.

## Runtime provenance

- Consumer source: `fee1cdbe02707f845fa6543d17b9c03718135c23`.
- App / Core: `13.82.51 / 4.82.51`.
- Channel: `integration-preview`.
- Release name: `M16.5 Accepted Living Shell Candidate`.
- Previous Integration runtime: `13.82.50 / 4.82.50` at
  `771fb839d1b4e58c3b59f71bc689638348fbc933`.

The active entry, App Shell fallback, Trip Context module import, diagnostics,
force-update target and Service Worker cache advance together. Global Compass
brand assets remain byte-identical to the accepted M16.5G asset family.

## Visual truth and release lock

The accepted demo is pinned by
`config/luvia-m16.5-visual-parity-contract.json`. The candidate includes the
new desktop/mobile Living Shell and real Trip, Navigation, Collaboration and
Intelligence projections. Plan/Places/Booking and the remaining feature stages
are still adoption work and may not be called visually complete.

Main and Production remain locked by the parity contract. Integration can be
used for authenticated desktop/mobile review only. A successful technical
preview cannot silently satisfy joint visual acceptance.

## Validation gate

Measured on the Platform release candidate on 2026-08-25:

- complete allowlisted Safe Regression: `99 / 99 PASS`;
- visual-inventory freshness: `2,768 tracked / 660 candidates / PASS`;
- Native-First foundation: `3 / 3 PASS`;
- cross-Core DB ownership guard: `PASS`, no debt growth.

Deployment evidence is recorded separately after the immutable Integration
Worker exists.

No database/schema/RPC/RLS/bucket migration, Supabase Edge Function mutation,
secret mutation, manual Cloudflare configuration change, Main promotion or
Production deployment belongs to M16.5J.

## Rollback

Rollback is an immutable redeployment of the previous Integration runtime or a
fast-forward follow-up. No history rewrite, data rollback or destructive cleanup
is required.
