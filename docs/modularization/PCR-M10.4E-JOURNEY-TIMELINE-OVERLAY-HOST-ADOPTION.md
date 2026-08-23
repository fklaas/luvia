# PCR M10.4E — Journey / Timeline Overlay Host Adoption

Date: 2026-08-23

Status: FEATURE COMPLETE / INTEGRATION RELEASE GATES PENDING

## Ownership audit

Timeline/Journey is a cross-domain aggregator, not a normal Places consumer. Its active implementation currently lives physically at `core/places/timeline-core.js`, but it composes facts from Trip schedules, Places, visits, Media memories and member context. This M10 slice does not legitimize that physical location as final ownership and does not move Journey truth into Places.

Measured aggregation and mutation sources remain:

- `trip_schedule_events`;
- `timeline_events`;
- `place_visits`;
- `trip_place_data`;
- `trip_places` and `places`;
- `trip_members`;
- Media photo-memory projections;
- owner commands through existing Trip Place Data / Place Collections paths.

A later physical Journey Core extraction should introduce an explicit `journey.v1` contract and imported projections, then move the aggregator out of the Places directory without duplicating Trip, Places, Media, Booking or Identity truth. That is a distinct architecture milestone; M10 only centralizes presentation lifecycle.

## Change

The three active Journey/Timeline surfaces now use the canonical Web Overlay Host under separately classified owners:

- `journey.timeline-day` for a day's sequence;
- `journey.timeline-photo-memory` for a composed Media memory;
- `journey.timeline-planning-editor` for date/time editing.

The day-to-photo-memory and day-to-Place transitions now close through the owning host handle rather than removing DOM behind the host's back. Planning editors stack above the day sheet and restore it on dismissal. The App Shell's direct Timeline DOM-removal shortcut is deleted because it would orphan host state; the Timeline owner closes its surface before emitting the Place-open request.

## Boundary and Native First status

- Timeline/Journey remains a reserved cross-domain owner and is not relabeled as Places, Media, Trip, Consumer or Intelligence.
- The host receives no Journey facts or mutation authority.
- Existing cloud aggregation in `timeline-core.js` remains explicit debt. This slice does **not** claim that the Journey domain is physically Native First Ready.
- A future iOS/Android Journey renderer can consume the same semantic sheet/dialog stack only after the Journey data contract is physically extracted.
- No database migration, RPC, Edge Function, secret or deployment-configuration change.
- Shared visual primitives remain M10.5 Experience Core work.

## Verification

- JavaScript syntax and M10.4E ownership guard: PASS.
- Global Place planning dialog contract: PASS.
- M7 FINAL Media Domain / Native Readiness: PASS; the separate Timeline/Journey Media reservation remains measured.
- M5.4 active TripStore consumer isolation: PASS; Timeline does not regain private TripStore access.
- M9 staged runtime mounting and owner-flow navigation: PASS.
- NFR-0 Native First and browser-global guardrails: PASS; browser dependency debt did not grow.
- Controlled Safe Regression: `65 / 65 PASS`.
- Real Microsoft Edge headless lifecycle proof: PASS.
  - Timeline day opens host-owned with dialog semantics, inert background and deterministic close focus.
  - Day-to-photo-memory transition closes the day through its host handle and leaves one correct top layer.
  - Planning editor stacks over a Timeline day, makes the day an inert underlay, then restores it after Escape.
  - Final host depth and scroll-lock state after cleanup: `0` / clean.
  - Browser console warnings/errors: `0`.

Manually sampled historical tests `ai-memory-bridge-v13.28.2.2`, `gallery-studio-v13.28.4` and `nature-place-integration` are not current merge gates. They still assert obsolete release numbers, retired Gallery implementation strings or an old hub tile; their unrelated stale assertions were not used to rewrite current product code. Their one directly relevant Timeline photo-memory rendering assertion passed where it was independently reported.

- Preview/Production acceptance: pending the combined M10 release candidate.
