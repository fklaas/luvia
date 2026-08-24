# PCR M16.5C — Cinematic Product and Navigation Foundation

Date: 2026-08-24

Status: DIRECTIONAL FOUNDATION ACTIVE / DESIGN-ONLY PROTOTYPE / RUNTIME
CONTINUITY FIX IN RELEASE VALIDATION / DESIGN FREEZE PENDING

## Product decision

The redesign is no longer developed as a sequence of disconnected sample
screens. Luvia becomes one continuous travel story across public entry,
onboarding, trip creation and the signed-in product. The visual direction uses
the preferred Q/R territory as its strongest base while deliberately combining:

- B: spatial map and orientation competence;
- D: adult Corporate warmth and carefully placed affectionate detail;
- E: Compare, Add-to-Day, Booking, consent, Wallet and receipt flows;
- F: Living-Itinerary phases and open mobile backgrounds;
- G: shared-element continuity, magnetic motion and haptic semantics.

The canvas remains bright and primarily white, but it may not become sterile.
Warmth comes from travel anticipation, shared time, discovery, memories,
rest and movement—not from indiscriminately inserting people into stock images.
Imagery is a separate Corporate Design workstream and remains subject to a
dedicated image-language gate.

## Target navigation

The accepted primary product destinations are:

1. Heute;
2. Planen;
3. Luvia — central conversational and action surface;
4. Reise;
5. Erinnern.

Wallet/Documents, Booking, Collaboration, Profile, Settings, Attention and
future Admin/Social surfaces are contextual destinations below those primary
meanings. Their Domain Cores remain independent. Navigation composition does
not merge ownership or create duplicate truth.

The design prototype implements the target navigation on desktop and mobile.
Profile is an explicit account/settings action rather than a sixth product
world. Luvia is described as "Fragen, planen, handeln" and stays visually
central without receiving foreign Domain authority.

## Motion and spatial continuity

The motion foundation is narrative and state-based rather than decorative:

- one route change produces one coordinated exit/entry cycle;
- the committed source remains visible until the target is fully mounted;
- scroll reveals are reversible and may combine opacity, depth, drift and
  restrained scale instead of making every section another static tile;
- landing storytelling uses a semantic travel thread rather than unexplained
  numeric carousel steps;
- onboarding changes scene and atmosphere as meaning changes;
- future creation, confirmation, receipt and recovery flows preserve spatial
  provenance through shared elements and owner states;
- system reduced-motion preference removes parallax, blur and non-essential
  movement while retaining hierarchy and state clarity.

The active Trip accent remains a semantic input for primary actions,
selection, focus, highlights, route traces and motion continuity. Every chosen
accent requires contrast-safe fallbacks and may never become an unbounded
theme override.

## Prototype evidence

The design-only prototype workspace contains:

- `landing.html`: public narrative entry with scroll-linked scenes and a
  semantic journey thread;
- `onboarding.html`: cinematic account and first-Trip creation flow;
- `index.html`: authenticated product shell with the target navigation;
- `app.js`, `landing.js` and `onboarding.js`: direct, reversible interaction
  and route choreography;
- `styles.css`, `landing.css` and `onboarding.css`: desktop/mobile, touch,
  safe-area and reduced-motion treatment;
- `mobile-qa.html`: deterministic 390 x 844 visual review frame.

The onboarding prototype covers Ankommen, identity/account consent, desired
travel feeling, canonical destination, dates, Collaboration roles, active Trip
accent, privacy and a final review. It does not create production Trip truth.

Browser acceptance covered the public entry, authenticated Today/Plan route
transition, the complete onboarding sequence, desktop and 390 x 844 mobile
composition, destination identity, one active route surface and horizontal
overflow containment. JavaScript syntax checks pass for all three prototype
runtimes.

## Runtime defect correction

The reported apparent double page load was traced to the active App Shell's
presentation-only full-field module intro. The target route was already
selected, then the shell displayed a second splash before revealing the real
module. This was not a second browser document navigation, but it was perceived
as one and broke the required continuity.

The Consumer fix removes the intermediate splash. It keeps the previous
committed surface visible while the canonical target module mounts, commits
History only after mount success and then performs exactly one coordinated
cross-fade. Cancellation restores the previous surface; mount failure renders
the existing explicit recovery surface. Route IDs and owner-specific module
mounts remain governed by `navigation.v1` and the Module Mount Registry.

No database, schema, RPC, RLS, bucket, Supabase Function, secret or manual
Cloudflare change is part of this slice.

## Remaining joint Design Freeze gates

M16.5 remains active. A complete Design Freeze still requires:

- Corporate logo, type, icon, illustration, map and image-language decisions;
- complete Today, Plan/Places, Journey, Booking, Memories, Profile, Wallet,
  Luvia AI, Collaboration, Social and Admin flows;
- every overlay, popup, sheet, rich result and loading/empty/error/offline/
  denied/confirmation/receipt/recovery state;
- token contracts and responsive SwiftUI/Compose mappings;
- accessibility, reduced-motion and performance budgets;
- user review of the integrated prototype and an explicit Design Freeze.

Broad M17 runtime restyling remains blocked until that joint gate. The isolated
navigation-continuity defect may be released independently because it removes
a confirmed runtime problem without applying the unapproved visual language.
