# PCR M16.5Z — First Trip Composer

Date: 2026-08-28

Target: Integration only

App/Core candidate: 13.82.99 / 4.82.99
Main and Production: locked and unchanged

## Outcome and binding reference

This slice implements Gate 4 of the binding M16.5 Productization Plan: the
Trip-owned First Trip Composer after the Identity-owned Profile onboarding.
It follows the accepted Luvia Compass language and keeps Profile truth, Trip
truth, Places truth and Collaboration membership physically separated.

The flow is one continuous nine-stage journey: welcome, Trip identity,
trip-specific feeling, canonical destination, dates/flexibility, start mode,
feature modules, active Trip colour and the complete Compass-backed result.

## Owner boundaries and persistence

- `trip.v1.commands.createFirstTrip` is the sole committing command.
- The Trip owner validates and sanitizes the composition, derives a stable
  idempotency key, writes through the existing Trip owner path and returns an
  immutable receipt. Replays with the same key do not create a second Trip.
- Destination search and confirmation use only the public
  `places.v1.reads.suggestDestinations` and
  `places.v1.reads.getDestination` reads. The Composer never calls the private
  Places gateway directly and only accepts a Places-owned canonical result.
- Session-scoped draft/defer/reload state uses `StoragePort`; the UI imports no
  browser storage, Supabase client or private Trip/Places store.
- “Invite after creation” records only the requested next step. Membership,
  invitations and roles remain owned by the separate Collaboration contract.

## Profile preferences and trip feelings

- Profile preferences remain durable, user-specific constraints and defaults.
  Dietary, accessibility, sensory and mobility requirements are never
  overwritten by a Trip feeling.
- Trip feelings are a bounded overlay for this single Trip. They are persisted
  under the Trip composition and can later weight matching Places, Planning and
  Journey results only inside the Profile constraints.
- The downstream weighting consumer is not implemented in M16.5Z. The UI says
  this explicitly; this release does not pretend that selecting a feeling
  already reorders Places or a day plan.
- Multi-person preference reconciliation remains Collaboration/Decision owner
  work and is not simulated by the Composer.

## Product behavior

- After a completed Profile and no Trips, App Shell opens the Composer before
  the normal signed-in empty state. It can also be opened through its public
  navigation route.
- All 50 named Trip colours shown on the public Landing page are selectable.
  Participant profile colours remain independent.
- Dates use two plain choices: fixed dates or a visible flexible range. The
  start mode uses one decision: private first or invite after creation.
- The final screen keeps the complete layered Luvia Compass visible and shows
  exact destination, time, feelings and enabled modules before commit.
- Reload/resume, browser Back/Forward, keyboard navigation and Reduced Motion
  are deterministic. Internal scroll regions retain hidden scrollbars.

## Local evidence

- JavaScript syntax, Trip adapter, Places adapter, Navigation guard and M16.5Z
  static contract tests: PASS.
- Desktop 1440 × 900 real left-click sequence through all nine stages and the
  Trip owner receipt: PASS; horizontal overflow and console errors are 0.
- One `Alt+ArrowRight` after multiple re-renders advances exactly one step. A
  reproduced duplicate-key-handler root cause was fixed and re-verified.
- Mobile 390 × 844 touch-event sequence through all nine stages and the Trip
  owner receipt: PASS; the complete Compass uses all three official SVG layers,
  horizontal overflow and console errors are 0.
- Mobile Reload retains title, destination, flexibility, feelings and `Ink`;
  Back reaches colour and Forward returns to the result: PASS.
- The 50-colour palette exposes one pressed state and selects `Ink` as
  `#334d5b`: PASS.
- Reduced Motion reports `prefers-reduced-motion: reduce`, zero transition
  duration and no panel animation: PASS.
- Safe Regression: 116 / 116 PASS; regenerated visual inventory: 2,855
  tracked files / 726 visual candidates / 0 unclassified.

## Explicitly open

- Collaboration membership/invitation/role creation is reserved. M16.5Z only
  preserves an explicit handoff request and does not claim that people were
  invited.
- Trip-feeling weighting in Places, Planning and Journey is the next Core
  productization step; this release stores but does not consume the weights.
- Physical-handset acceptance and the broader M16.5 Design Freeze remain
  separate gates.
- Main and Production promotion is not authorized by this slice.

## Public Integration evidence

- Runtime implementation commit:
  `9f8d0dffeff12b9645444bc5878b91003040da43`.
- The deployment was built from a clean `git archive` of that commit. The three
  pre-existing untracked local Reel videos were neither archived nor uploaded.
- Cloudflare Integration version:
  `e9c1df5d-d172-459e-ab8a-93736988d65e` (Worker version 47), 100% in deployment
  `ff560abc-6fe4-4258-be16-ea2280c18ff0`.
- Stable URL: `https://integration-luvia.njwnrvwbv5.workers.dev/`.
- Immutable URL:
  `https://e9c1df5d-integration-luvia.njwnrvwbv5.workers.dev/`.
- Clean commit archive, Stable and Immutable are SHA-256 byte-identical for
  10/10 critical assets: entry document, version kernel, App Shell, Composer
  JS/CSS, Places adapter, Trip adapter, Trip creator, Navigation Core and
  Service Worker.
- Immutable Desktop 1440 × 900: all nine stages were completed with real left
  clicks, including three Trip feelings, canonical Kopenhagen confirmation,
  fixed dates, invitation handoff, module selection, all 50 colours and `Ink`.
  The visible receipt was
  `trip.first.create · trip-m165z-public · required`; the complete Compass had
  three SVG layers, horizontal overflow was false and console warnings/errors
  were 0.
- Stable Desktop 1440 × 900 repeated the complete nine-stage left-click
  sequence through the same committed receipt; 50 colours were present,
  horizontal overflow was false and console warnings/errors were 0.
- Immutable Mobile 390 × 844 completed all nine stages through a browser-
  emulated Touch/Pointer/Click event path, including canonical Places,
  flexible month, invitation handoff, 50 colours and `Sea`. The committed
  receipt was visible, the complete three-layer Compass was present,
  horizontal overflow was false and console warnings/errors were 0. This is
  browser touch-event evidence, not a physical-handset claim.
- Public keyboard evidence advances exactly `identity` to `feeling` for one
  `Alt+ArrowRight`. Reduced Motion reports a matching media query, zero root
  transition, no panel animation and no overflow. Stable Reload plus Browser
  Back/Forward retained App 13.82.99 assets without warnings/errors.
- Public `tests/**` is intentionally excluded from the Worker artifact. The
  visible public component E2E therefore used a temporary, isolated in-origin
  QA mount of the actually deployed Composer and its real CSS/JS assets. The
  temporary mount, emulation overrides and tabs were removed after testing.
  App-Shell gating and session resume remain separately proven by the local
  visible fixture plus the 116/116 contract/regression gate.

## Rollback

Rollback returns Stable Integration to App/Core 13.82.98 / 4.82.98, version
`31624f74-d281-43eb-81b7-8b994401c7df`, deployment
`a0215087-ad1c-47a3-9345-e5fa3cd2eb83`. No database migration, Supabase
configuration, Main or Production mutation is part of M16.5Z.
