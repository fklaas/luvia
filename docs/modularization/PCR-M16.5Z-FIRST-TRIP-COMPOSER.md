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

Pending the clean runtime commit, Integration-only version upload and visible
immutable/stable browser sequence. No public acceptance is claimed before that
sequence passes.

## Rollback

Rollback returns Stable Integration to App/Core 13.82.98 / 4.82.98, version
`31624f74-d281-43eb-81b7-8b994401c7df`, deployment
`a0215087-ad1c-47a3-9345-e5fa3cd2eb83`. No database migration, Supabase
configuration, Main or Production mutation is part of M16.5Z.
