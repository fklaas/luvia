# PCR M16.5E — Living Design, Active-Trip Accent and Compass Foundation

Date: 2026-08-25

Status: EXPERIENCE FOUNDATION IMPLEMENTED / PRODUCT ADOPTION NOT STARTED /
JOINT DESIGN FREEZE PENDING

## Decision

M16.5E turns the accepted M16.5 visual direction into an additive,
platform-neutral Experience contract. It does not restyle the productive app
and it does not declare the joint Design Freeze complete.

Experience owns the semantic design and interaction system. Trip remains the
only owner of the selected Trip colour. A product or platform adapter may pass
that colour as an explicit projection; Experience must never read Trip state,
storage, Supabase or another private owner implementation.

## Locked scope

The slice changes only:

- `core/experience/experience-contract-core.js`;
- `app/adapters/experience-web-adapter.js`;
- the Experience-owned runtime vector subset under
  `assets/brand/luvia-living-compass/`;
- Experience documentation, ownership rows and focused regression;
- the exhaustive M16.5 visual inventory after exact staging.

No product screen, Domain Core, database, RPC, RLS policy, bucket, Edge
Function, secret, Worker configuration or deployed runtime is changed.

## Active-Trip accent semantics

An explicit accent input deterministically produces:

- the primary action and selection colour;
- a contrast-selected foreground meeting the 4.5:1 normal-text target;
- a restrained soft surface colour;
- a complementary colour family for spatial continuity and Compass material;
- CSS custom-property, SwiftUI and Compose semantic mappings.

The mapping does not override success, warning, danger or information
semantics. The Corporate base palette remains stable. The active-Trip palette
contains `domainTruth: false` and records its source as an explicit Experience
input.

## Official Living Compass

The neutral brand Compass runs clockwise:

1. North — Red;
2. East — Orange;
3. South — Blue;
4. West — Green;
5. return to North — Red.

Inside an active Trip, the ring uses only the Trip accent and its controlled
complement. Direction points, geometry, clear space and material hierarchy
remain Corporate-stable. Blanket filters, black outlines, whole-mark rotation
and ad-hoc shadows are forbidden.

The mark is split into face, two-ended needle and hub. Only the needle layer
may rotate; face, hub and the complete mark remain fixed. The large primary
asset retains controlled depth, while the compact asset omits the outer
large-format shadow.

## Motion and native interaction

The contract defines:

- Compass shared-element expansion/collapse;
- staggered function-node reveal;
- two-ended needle seek and settle;
- irregular, non-blocking ambient invitation;
- a once-per-launch brand intro;
- select, navigate, confirm, success, warning and Compass-seek haptic intents.

Every motion resolves to an instant semantic transition when reduced motion is
active. Haptic entries are intents only; platform ports decide whether and how
feedback is emitted. No browser or device API exists in the browserless core.

## Measured precondition and repaired inventory drift

Before implementation, the focused Experience regression and NFR-0 3/3 were
PASS. The 93-test Safe Regression reported 92/93 because the committed visual
inventory still counted 2,748 tracked files while Git contained 2,749. Exact
read-only comparison proved the sole post-inventory addition was the
M16.5D documentation PCR; CSS, runtime and Domain boundaries had not drifted.

M16.5E therefore regenerates the exhaustive inventory only after all new files
are explicitly staged. The focused test, NFR-0 and the expanded 94-test Safe
Regression are mandatory release gates.

## Delivery boundary and rollback

This foundation may move through the Experience feature stream and Integration
when all gates are green. It remains visually dormant until a separately
scoped Consumer/Platform product-adoption slice imports it. Rollback is a
revert of the M16.5E feature commit; no persisted state or cloud rollback is
required.

The next visible slice must inventory and adopt one complete productive
vertical journey—starting with the signed-in shell, Today and navigation—using
the owner contracts already in Git. Prototype HTML is reference evidence, not
production authority.
