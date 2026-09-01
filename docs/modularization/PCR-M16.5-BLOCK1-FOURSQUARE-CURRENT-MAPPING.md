# PCR M16.5 Block 1 — Foursquare Current Places Mapping

**PCR ID:** `PCR-M16.5-BLOCK1-FOURSQUARE-CURRENT-MAPPING`

**Requester stream:** Integration / Places

**Owning reviewer:** Places

**Status:** Edge deployed; public AI consumer acceptance pending

## Problem

The existing Places gateway still expected Foursquare's retired nested
`geocodes.main/roof` response while the current Places API returns top-level
`latitude` and `longitude`. It also requested a mixed field set without an
explicit current API version. Google daily quota exhaustion therefore exposed a
broken fallback and the public AI Chat could not return a source-backed Place.

## Authorized correction

- Keep the existing `luvia-gateway` and Places owner; introduce no second owner.
- Send bearer authentication plus `X-Places-Api-Version: 2025-06-17`.
- Request only documented Search/Details fields, omitting Search-only
  `distance` from Details.
- Map top-level coordinates first and retain retired `geocodes` only as a
  read-only compatibility fallback for old cached provider responses.
- Never fabricate coordinates, photos, ratings, opening state or availability.
- Bound public provider errors and retry a reduced Pro-field set only for a
  provider 400/403 field-entitlement rejection.

## Owner and data boundaries

`places.v1` remains owner of Places facts and mutations. The Edge function
normalizes external facts but does not persist a new source of truth or execute
an owner mutation. No Secret value is read into diagnostics; no DB schema, RLS,
migration, Main or Production change is part of this PCR.

## Evidence

- Four automated mapping tests cover current fields, provider photo/rating,
  legacy coordinate compatibility, no fabrication, bounded diagnostics and the
  field-entitlement fallback.
- `places.health` on gateway v112/v114 reports mapping version
  `2026-09-01.top-level-coordinates.v1` and API version `2025-06-17`.
- One explicitly authorized, bounded, fixed read-only probe on temporary v113
  returned a real Foursquare Place with provider ID and finite top-level
  coordinates. The probe was removed immediately and the clean final gateway
  was redeployed as v114.
- Final gateway bundle hash:
  `9efb30247d3ceb253ae96209b73b37984ee399cee1afd4cce49b55f712ea8c9f`.

## Rollout and rollback

The corrected function is deployed only to Supabase project
`yiadkcxgyzdgyadnhyqe` as `luvia-gateway` v114. To roll back, deploy the complete
`supabase/functions/luvia-gateway` tree from commit
`b2ee087d9388ab7839ab5923c34c1f7a5f96b653`, whose pre-change mapping source is
byte-equivalent to deployed v111. No Secret, DB or RLS rollback is required.

## Remaining acceptance

Gateway health and a fixed provider probe do not complete P02/P03. The real
public AI Chat must still send a user-entered request through Intelligence,
Trip-owned destination context, the public Places adapter and `places.v1`, then
visibly render source-backed result cards and MapLibre pins without developer
jargon or invented evidence.
