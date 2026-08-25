# PCR M16.5H — Accepted Living Shell Adoption

## Decision and evidence

The M16.5G Integration candidate at `771fb839d1b4e58c3b59f71bc689638348fbc933`
was technically valid and byte-proven, but visually rejected after authenticated
browser inspection. It still composed the legacy single-row header and old
content geometry with additive M16.5 styling. This is classified as useful
negative acceptance evidence, not as an approved visual release.

M16.5H replaces that composition at the productive `app/app-shell.js` owner
boundary. The jointly accepted M16.5 prototype is the binding Experience
specification for the Signed-in shell; it is no longer treated as a detached
showcase to be approximated over the legacy surface.

## Scope

- fixed desktop Living Product sidebar with the official layered Compass mark;
- active Trip context from `trip.v1` only;
- real top-level navigation from `navigation.v1`;
- presentation-only day phase rail;
- real Collaboration member projection when available;
- fixed light and open Corporate surface semantics inside the Signed-in shell;
- responsive mobile top bar and five-destination bottom dock without horizontal
  navigation scrolling;
- real Luvia Compass entry into the existing Intelligence command/chat surface;
- official face, two-ended needle and hub vector layers, with only the needle
  animated;
- existing module mounts, route history, owner flows and Today projections
  remain active inside the new shell.

The slice deliberately does not duplicate demo fixtures. Real features continue
to read their public owner contracts. The next adoption slices replace each
legacy module composition inside this shell, beginning with Plan/Places/Booking,
then Journey/Trip, Memories and Profile.

## Ownership and architecture

Consumer/Experience owns composition and interaction. Trip, Places, Booking,
Journey, Memory, Identity and Collaboration retain their Domain Truth. The new
shell contains no private Store, Supabase table, browser-storage or direct DB
shortcut. The current Trip accent remains an explicit semantic Experience
projection.

## Local authenticated acceptance

Measured against the real local runtime on 2026-08-25:

- authenticated shell mounted with the existing Ostseeurlaub Trip;
- desktop sidebar, Trip context, phase rail and official layered Compass visible;
- Today rendered real Trip/Journey/Attention/Collaboration projections;
- Plan navigation changed the route exactly once and retained the new shell;
- Luvia Compass opened the real conversational Intelligence dialog, including
  send control and Enter/Shift+Enter guidance;
- no application error was logged; the local non-release origin reported the
  pre-existing cloud-profile availability warning and is therefore not used as
  console-clean release evidence.

## Gates and release state

This Consumer slice is not a Runtime release by itself. Platform must assign the
next App/Core build, refresh cache provenance, run the complete safe regression,
and publish a new immutable Integration candidate. Main and Production remain
unchanged until the repaired desktop and mobile Integration surface is jointly
accepted.

No database migration, RPC, RLS, bucket, Edge Function, secret, manual
Cloudflare setting or production mutation belongs to M16.5H.

## Rollback

Rollback is the parent of the M16.5H Consumer commit. The earlier M16.5G
Integration version remains immutable negative evidence and must not be
reclassified as visual acceptance.
