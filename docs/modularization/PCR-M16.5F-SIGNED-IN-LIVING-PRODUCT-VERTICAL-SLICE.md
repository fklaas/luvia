# PCR M16.5F — Signed-in Living Product Vertical Slice

Date: 2026-08-25

Status: IMPLEMENTATION ACTIVE / CONSUMER FEATURE / JOINT VISUAL REVIEW PENDING

## Purpose

M16.5F is the first productive, visible adoption of the accepted M16.5 design
direction. It replaces neither owner contracts nor product capabilities. It
recomposes the real authenticated App Shell and Today surface around the
existing Trip, Journey, Attention, Collaboration, Places, Booking, Memory and
Intelligence projections.

The target is a bright, open and travel-led product surface with one coherent
navigation rhythm, active-Trip colour continuity, restrained spatial motion
and the official Living Compass as the central Intelligence entry. This is a
real Consumer vertical slice rather than another disconnected design demo.

## Locked product composition

The primary signed-in navigation is composed as:

1. Heute — real Today composition and Journey read projection;
2. Planen — existing planning hub and owner module routes;
3. Luvia Compass — existing Intelligence chat and action surface;
4. Reise — existing Trip/Journey/Collaboration hub;
5. Erinnern — existing Media/Memory surfaces.

`navigation.v1` remains the canonical screen-route truth. The Compass entry is
an Experience action and not a fake Domain route. Profile, Control Center,
invitation and settings remain contextual header or owner actions.

## Ownership and data boundaries

- Trip context is read exclusively through `trip.v1` and the existing App
  Shell input.
- Today consumes the existing read-only Travel Identity and Attention
  projections plus `NetworkPort`.
- Journey remains a separate read-only `journey.v1` projection and is not
  absorbed into Trip or Places.
- Booking, Places, Collaboration, Media and Memory functionality continues to
  mount through its existing owner contracts and routes.
- The Consumer layer owns only composition, markup, presentation state and
  navigation affordances. It owns no Domain Truth and performs no direct
  database mutation.

## Visual and interaction rules

- bright, open Corporate canvas; no dark presentation block in the default
  signed-in experience;
- active-Trip accent is the semantic colour for selection, primary actions,
  focus, continuity and the personalized Compass family;
- the Corporate palette and semantic success/warning/error colours are not
  overwritten by Trip colour;
- the Today hierarchy tells one continuous story instead of presenting an
  undifferentiated tile wall;
- one route action produces one coordinated exit/entry cycle;
- the central Compass action opens the existing conversational/actionable
  Intelligence surface;
- desktop and mobile use the same five meanings; touch targets, safe area,
  content readability and reduced motion remain mandatory;
- all visual values consume Experience or established App Shell variables;
  this slice adds no new literal brand-colour shortcut or `!important` debt.

## Files in scope

- `app/app-shell.js`
- `app/app-shell.css`
- `app/today/today-experience.js`
- `app/today/today-experience.css`
- `tests/m16.5f-signed-in-living-product-vertical-slice.test.cjs`
- `tests/run-m4.3-safe-regression.cjs`
- `config/luvia-visual-surface-inventory.json`
- `tests/m16.5-visual-surface-inventory.test.cjs`
- `docs/modularization/FILE-OWNERSHIP.csv`

The root logo, Service Worker cache, `index.html`, version provenance and
Production deployment do not belong to this Consumer mutation. They are a
separate Platform adoption gate after the Consumer candidate is green.

## Acceptance gates

- real Today model, Attention state and Journey projection remain rendered;
- five target navigation meanings are present, with Compass opening the real
  Intelligence composer;
- no private Trip/Places/Booking/Memory store or direct Supabase access is
  introduced;
- active-Trip semantic tokens reach Shell, Today, controls and Compass;
- focus-visible, touch target, responsive and reduced-motion rules are
  retained;
- existing M11 and M16.5C regressions remain green;
- visual inventory is regenerated from staged source;
- NFR-0 and the complete Safe Regression pass before integration;
- browser acceptance on authenticated desktop and mobile Preview remains a
  joint gate before Main or Production.

## Infrastructure and rollback

This slice changes no schema, migration, RPC, RLS, bucket, Edge Function,
secret or manual Cloudflare setting. Rollback is a normal revert of the
Consumer feature commit. Owner data and Domain state require no rollback.
