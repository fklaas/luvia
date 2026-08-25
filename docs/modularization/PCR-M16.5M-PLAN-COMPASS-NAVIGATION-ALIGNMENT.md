# PCR M16.5M — Plan Compass Navigation Alignment

## Purpose

M16.5M corrects the responsive placement of the signed-in navigation Compass
without changing the accepted M16.5K Plan Compass composition or its product
flow. The official full-colour Compass remains the central navigation item,
but it now sits inside and vertically centred with the other four destinations
instead of enlarging the mobile dock or floating above it.

## Runtime provenance

- Accepted Plan Compass source: `37cead7b30230f2731b866390c510f812ba50291`.
- Integration Plan adoption: `1eefd71`.
- Previous Integration release: `32c3939` at App / Core
  `13.82.52 / 4.82.52`.
- App / Core: `13.82.53 / 4.82.53`.
- Channel: `integration-preview`.
- Release name: `M16.5 Plan Compass Navigation Alignment`.

The active entry, App Shell fallback, Trip Context import, diagnostics,
force-update target and Service Worker cache advance together. The official
Compass vector and layered two-ended needle are unchanged.

## Corrected responsive contract

- The mobile dock remains a five-column navigation surface.
- The navigation Compass participates in normal layout at `42 × 42 px`, and at
  `40 × 40 px` on viewports up to `390 px` wide.
- It has no negative top offset, absolute centring or artificial label margin.
- Hover and reduced-motion behaviour retain the accepted motion contract.
- The embedded feature Compass still travels from the top-left Luvia brand.
- The separate `Luvia Compass` destination still opens Intelligence directly.

Main and Production remain locked. M16.5M is an immutable Integration review
candidate, not a Design Freeze and not permission to substitute any remaining
legacy feature composition.

No database/schema/RPC/RLS/bucket migration, Supabase Edge Function mutation,
secret mutation, manual Cloudflare configuration change, Main promotion or
Production deployment belongs to M16.5M.

## Rollback

Rollback is an immutable redeployment of M16.5L or a forward-only corrective
release. No history rewrite or data rollback is required.
