# PCR M16.5J — Plan Compass Productive Adoption

## Decision

The accepted embedded Living Compass is now the productive entry composition
for Plan. It is not an overlay and it is not launched from the separate
navigation item named `Luvia Compass`. Selecting Plan moves the official layered
Compass from the top-left Luvia brand into the feature stage, reveals the eight
accepted Plan directions around it, and returns it to the same brand source
before the selected real feature opens.

The navigation item `Luvia Compass` remains the direct entry into the existing
Intelligence chat and command surface.

## Product behavior

- the heading and explanatory copy are centered and enter after the Compass;
- Places, Meine Orte, Timeline, Booking, Checklisten, Budget, Routen and Wetter
  occupy the accepted radial constellation;
- directions float subtly only after their staggered entrance has settled;
- a feature choice fades the other directions, slightly enlarges the selected
  label, turns only the official two-ended logo needle and then opens the real
  feature route;
- the complete Compass mark never rotates and no synthetic external needle is
  drawn;
- X returns the Compass to the Luvia brand and routes to Today;
- changing a top-level destination while the stage is open returns the shared
  element before the destination changes;
- reserved directions remain visible and are labelled through maturity state
  instead of being removed.

## Responsive evidence

The embedded stage was measured in the real Browser runtime at 390 × 844 and
320 × 673. Both viewports fit the complete constellation and fixed five-item
navigation without horizontal or document-level vertical scrolling. The
mobile stage removes only the otherwise redundant shell bottom reserve while
Plan is active; it does not change the accepted feature arrangement.

Reduced-motion users receive the same information architecture without flight,
floating, blur or selection-spin animation.

## Data and owner boundaries

Plan reads aggregate place counts through the public `places.v1` projection
exposed by `LuviaPlacesContractV1`. Consumer does not read `LuviaPlaceCore`, a
private Store, Supabase, browser storage or a database table. Real Places,
Lifecycle, Timeline, Booking and Routes destinations remain mounted through
their existing owner routes. Checklists, Budget and Weather stay visible as
reserved directions until their productive owner surfaces are migrated.

## Release state

M16.5J is the first visible Plan/Places/Booking adoption slice, not the complete
Step 5 acceptance. Places search/map composition and Booking visual migration
continue next. The immutable Integration preview is the only public candidate
channel for this slice. Main and Production remain unchanged until all binding
desktop/mobile surfaces pass joint visual acceptance.

No database migration, RPC, RLS, bucket, Edge Function, secret or manual
Cloudflare setting belongs to this change.

## Rollback

Rollback is the parent of the M16.5J Consumer commit. The prior M16.5H immutable
Integration candidate remains preserved as comparison evidence.
