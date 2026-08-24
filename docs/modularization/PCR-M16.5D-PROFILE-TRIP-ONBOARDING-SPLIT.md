# PCR M16.5D — Profile/Trip Onboarding Split and Native Interaction Grammar

Date: 2026-08-24

Status: DESIGN-ONLY PROTOTYPE ACCEPTED AS DIRECTION / JOINT DESIGN FREEZE PENDING

## Binding product decision

The public landing page and cinematic onboarding direction are now the visual,
motion and interaction benchmark for the remaining Luvia product. Signed-in
surfaces must move away from technical tile composition toward a continuous,
travel-led product story with bright open canvases, meaningful imagery,
spatial depth, reversible fades and shared context.

This decision does not freeze every screen. Landing and onboarding still need
fine tuning for Corporate warmth, imagery, typography, iconography and final
copy. Their underlying rhythm and interaction quality are nevertheless the
minimum standard for M16.5 and M17.

## Two independent onboarding products

Account/profile onboarding and Trip creation are intentionally separate:

1. Identity owns account data, profile consent and the global Reisekompass.
2. Trip owns the concrete journey frame and active Trip identity.
3. Collaboration owns invitations, membership, roles and owner transfer.
4. Experience composes the visual handoff without creating Domain Truth.

The profile flow covers the existing canonical preference vocabulary rather
than reducing it to one decorative mood question:

- interests;
- dietary preferences;
- travel styles;
- activity preferences;
- evening and entertainment preferences;
- mobility preferences;
- family needs;
- accessibility and sensory needs;
- travel pace;
- budget style.

Learning signals are never silently promoted. Intelligence may propose a
preference; only explicit user confirmation may mutate the Identity-owned
Reisekompass.

The first-Trip Composer preserves the current Trip-creation capability and
expands its design coverage:

- Trip name and optional subtitle;
- symbol;
- canonical destination identity, not free-text ambiguity;
- start/end or explicitly flexible dates;
- active modules/product areas;
- privacy/visibility;
- invitations, participants and roles through Collaboration;
- active-Trip accent with live semantic preview;
- final review before the owner command.

The design-only module selector demonstrates Places, Journey, Booking, Travel
Wallet/Documents, Memories, Move and Collaboration. Selecting a surface
configures the product experience; it does not move or duplicate its Domain
Truth.

## Active-Trip accent contract

The selected Trip colour is a semantic input for the concrete active journey.
It may drive primary actions, selections, focus rings, route traces, headings,
outlines, confirmations and shared-element continuity. It must not replace the
Corporate base palette or semantic success/warning/error colours. Every
mapping requires contrast-safe fallbacks and light/dark/high-contrast review.

## Magnetic and haptic interaction grammar

Magnetic response is restrained, contextual spatial attraction for important
interactive elements. It is not continuous floating decoration. The prototype
caps pointer attraction, springs back to origin and disables the effect for
coarse pointers and reduced motion.

Haptics are semantic Experience intents such as select, confirm, success,
warning and navigate. A Web adapter may use vibration when the platform and
user settings permit it. Native iOS and Android later map the same intents to
their platform feedback APIs. Domain Cores may request or describe an intent
through public Experience/Platform contracts; they may not call browser or
device APIs directly.

## Prototype evidence

The design workspace now contains:

- `profile-onboarding.html`, `profile-onboarding.css` and
  `profile-onboarding.js` for the separate account, consent and complete
  Reisekompass flow;
- `onboarding.html`, `onboarding.css` and `onboarding.js` as the independent
  first-Trip Composer;
- `experience-motion.css` and `experience-motion.js` as a design-only Web
  adapter for cinematic page handoff, semantic haptics, magnetic pointer
  response and reduced-motion fallback;
- `mobile-qa.html` with side-by-side deterministic 390 x 844 frames for both
  flows;
- the signed-in `index.html` prototype consuming the same interaction grammar
  for primary routes, Luvia actions and modal controls.

Measured browser acceptance:

- complete profile flow from account through values, rhythm, needs, consent
  and Reisekompass review;
- complete Trip flow from welcome through identity, travel feeling, canonical
  destination, dates, Collaboration, module selection, accent and review;
- live active-Trip colour change reflected in the final review;
- exactly one active signed-in route after Heute -> Planen;
- direct profile, Trip and signed-in prototype console errors: zero;
- JavaScript syntax checks: PASS;
- desktop and 390 x 844 composition reviewed;
- reduced-motion styles and interaction branches present.

The iframe-only mobile comparison harness emitted one browser-instrumentation
MutationObserver error while both same-origin frames rendered correctly. The
direct product pages were error-free; this is not classified as a product
runtime defect.

## Native-First and delivery boundary

This slice is Design-only. It does not create or update a real account, profile,
Trip, membership, module configuration or Cloud record. It changes no database,
schema, RPC, RLS, bucket, Edge Function, secret, Worker or Production asset.

M17 implementation must reuse Identity, Trip, Collaboration and Experience
contracts. The prototype may guide composition and motion, but it is not an
authorization model or persistence implementation.

## Remaining joint gates

- account recovery, passkey/SSO and invitation-join variants;
- detailed place-search, date flexibility and participant role states;
- all loading, empty, validation, offline, denied, conflict, confirmation,
  receipt and recovery states;
- final Corporate type, icon, logo, illustration, map and image language;
- Today, Planen, Journey, Booking, Wallet, Memories, Luvia Intelligence,
  Profile, Collaboration, Attention, Social and Admin screen/state completion;
- SwiftUI and Compose token/motion mappings;
- accessibility, performance and motion budgets;
- explicit user-approved Design Freeze.
