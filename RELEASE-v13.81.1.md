# Release v13.81.1

## Purpose
Reliability patch for v13.81 Booking Timeline + Modify + Cancel.

## Fixed
- Modify confirmation now has an explicit click action in addition to native form submit.
- Cancel confirmation now has an explicit click action in addition to native form submit.
- Mutation form values are captured before the UI re-renders into a busy state.
- Mutation errors are surfaced in the action sheet instead of appearing as a dead button.
- Mobile Booking Control Center is now list-first. No booking is auto-selected on mobile.
- Tapping a booking opens a dedicated mobile detail surface.
- `← Alle Buchungen` returns to the booking list.
- Desktop retains the two-column master/detail experience.

## Architecture
No Booking Truth changes. No mutation semantics changed. Evidence-first cancellation remains enforced.
