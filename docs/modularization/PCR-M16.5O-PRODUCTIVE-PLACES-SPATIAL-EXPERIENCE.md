# PCR M16.5O — Productive Places Spatial Experience

## Decision

The accepted light Luvia Places composition replaces the legacy guided Places
surface as the default productive destination opened from the Plan Compass.
The experience is a real Consumer composition over public owner contracts; it
is not a demo fixture, a second Places store or a hard-coded map.

## Product scope

- open editorial Places stage with the active Trip accent and no dark content
  containers;
- Luvia search, explicit filters and all ten canonical Places categories;
- one connected desktop map-and-results canvas and a responsive mobile
  map-first composition;
- six initial results with deliberate expansion up to eighteen;
- selected result, marker and result details remain synchronized;
- details, favourites, planning, booking and external navigation use existing
  owner commands and Platform ports;
- loading, empty, offline, map-unavailable and error states remain readable and
  actionable without invented results or silent fallback behavior.

The classical category catalog remains an explicit alternate route. It is no
longer the default Plan → Places experience.

## Coordinate and map integrity

Only complete, finite WGS84 coordinate pairs projected by `places.v1` may
create map markers. A result without valid coordinates stays visible in the
list and carries a transparent map-omission reason. Consumer never substitutes
a sample coordinate, moves a marker onto a drawable area or infers a location
from card order.

The map viewport is calculated exclusively from the visible valid marker
projection. A map-library, style or network failure keeps the result list
usable and exposes an explicit map state instead of synthetic pins.

## Ownership and privacy

Places retains Domain Truth. Consumer reads and acts only through
`LuviaPlacesContractV1`; Booking actions use `LuviaBookingContractV1`; network,
offline cache and external navigation use `LuviaPlatformPorts`. The composition
does not read a private owner core, Supabase, a database table, local storage or
provider payloads directly.

## Accessibility and responsive contract

Search, categories, filters, markers, results and actions are keyboard
reachable, visibly focused and labelled. Status changes use a live region.
Touch targets are at least 44 px. At widths up to 800 px the composition becomes
map-first with a locally scrollable result rail; the document itself must not
gain horizontal overflow. Reduced-motion users receive the complete information
architecture without decorative transitions.

## Acceptance and release state

The browserless M16.5N acceptance test locks deterministic composition,
6/18 result breadth, exact coordinate projection, public owner boundaries,
responsive behavior, accessibility and cache registration. Runtime release
still requires authenticated desktop and mobile Browser evidence plus the full
Integration safe-regression suite.

This change does not authorize Main or Production deployment. No database
migration, RPC, RLS, bucket, Edge Function, secret or manual Cloudflare setting
belongs to this slice.

## Rollback

Rollback restores the parent Consumer commit, where `modules/places-shell.js`
mounts the prior `LuviaPlacesFinal` experience. The classical catalog and all
Places owner data remain unchanged.
