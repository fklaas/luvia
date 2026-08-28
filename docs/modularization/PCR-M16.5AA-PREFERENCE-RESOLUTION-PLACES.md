# PCR M16.5AA — Shared Preference Resolution + Compass Activation

Date: 2026-08-28

Target: Integration only

App/Core candidate: 13.82.100 / 4.82.100

Main and Production: locked and unchanged

## Problem and outcome

M16.5Z deliberately stored durable Profile preferences and per-Trip feelings
without pretending that downstream Cores already used them. M16.5AA closes the
first consumer slice: a browserless Intelligence-owned resolver combines the
two public projections without creating a third source of truth. Places is the
first visible adopter and explains the result to the user.

The resolver is intentionally generic. Planning, Journey/Today, Move, Trip and
Luvia AI can adopt the same derived resolution later. They must not duplicate
the mapping, read private Identity/Trip stores or persist the derived weights.

## Owner and contract boundaries

- Identity remains the sole owner of durable personal preferences, dietary and
  accessibility requirements, mobility, pace and interests.
- Trip remains the sole owner of the active Trip composition and the selected
  `firstTripComposer.feelings` overlay.
- Intelligence owns deterministic resolution, weighting and consumer-specific
  ranking annotations. It stores nothing and mutates neither source input.
- Places remains the owner of provider candidates and canonical place facts.
  It consumes only additive `intelligence.v1` reads and projects recommendation
  annotations without converting them into Place truth.
- Unknown provider evidence is not invented. A candidate stays visible with a
  verification note. A candidate is filtered only when provider evidence
  explicitly conflicts with a durable hard constraint.

## Public additive contract

`intelligence.v1` gains two backward-compatible reads:

- `resolveTripPreferences(input)` returns an immutable, non-persisted derived
  resolution with provenance, hard constraints, Profile signals, Trip signals
  and human-readable summary.
- `rankPlaceCandidates(input)` applies that resolution to provider candidates
  and returns eligible candidates, explanation annotations and blocked-count
  metadata while preserving provider facts.

No existing command, event, field or return value is removed. Places consumers
that do not supply Profile/Trip data retain their previous behavior.

## Visible Places behavior

- Results explain three layers: “Verbindlich aus dem Profil”, “Persönliche
  Schwerpunkte” and “Nur für diese Reise”.
- Each result can show confirmed constraints, matching reasons and honest
  verification notes for missing provider evidence.
- Trip feelings change ordering only inside durable Profile constraints and do
  not rewrite the global Reisekompass.
- The explanation composition is responsive and retains hidden-scrollbar and
  keyboard behavior of the existing Places surface.

## Shared Compass direction activation

- Experience owns one non-domain visual resolver for every real Compass
  navigator. It maps the actual needle coordinate system (`0°` north, `90°`
  east, `±180°` south, `-90°` west) onto the four official ring gradients.
- Intermediate targets use the same sRGB interpolation as the SVG ring rather
  than choosing a random brand stop. The selected node, its icon accent, all
  four thin orbit lines and the soft ambient field receive that one value.
- The selected card remains predominantly white: colour is led by its border,
  icon, rings and atmosphere instead of a heavy full-card fill.
- Signed-in module hubs keep the selected direction settled for 620 ms after
  the direct 760 ms needle seek, then use the already accepted reverse exit.
- Public primary choices, world choices and Living Journey points consume the
  same resolver. Their real click/keyboard actions keep the selection visible
  before changing canvas or opening authentication.
- Reduced Motion removes seek and settle time and keeps the destination
  immediately available. Decorative onboarding Compass illustrations are not
  falsely upgraded into navigation; future onboarding navigators must consume
  this same Experience resolver.

## Files and operational impact

- New browserless resolver:
  `core/intelligence/trip-preference-resolution-core.js`.
- Additive Intelligence and Places adapter reads/projections.
- Places result surface and CSS explanation treatment.
- Entry document and Service Worker cache inclusion.
- Targeted deterministic contract test and Safe Regression allowlist entry.
- Shared direction-tone contract, four-orbit signed-in markup and public
  Compass activation/settle behavior.

Database migration: none.

Supabase or provider configuration: none.

Manual data migration: none.

## Test plan and acceptance

- Syntax-check all changed JavaScript.
- Deterministic test: hard conflicts are blocked, unknown evidence is marked,
  different Trip feelings change ranking and inputs remain byte-equivalent.
- Static owner/contract test: only public Intelligence reads are used and the
  new asset is loaded and cached.
- Controlled Safe Regression must remain fully green.
- Visible browser verification on Desktop and Mobile must exercise real
  pointer/touch selection, the explanation surface, result navigation, Reload,
  Back, keyboard and Reduced Motion without overflow or console errors.
- Public functional acceptance requires the same visible sequence on Stable
  and Immutable Integration plus byte-parity evidence.

## Public Integration evidence

- Runtime implementation commit:
  `cc2850d4d6bd0e3dab1c52aa2ce480cd3e277f5b`.
- The Worker was built from a clean `git archive` of that commit. The three
  pre-existing untracked local Reel videos were neither archived nor uploaded.
- Cloudflare Integration version:
  `0ad87340-4aa1-4d56-8048-d5c749d82adf`, 100% in deployment
  `d4f22fa1-de92-4c24-bab3-c646698ad096`.
- Stable URL: `https://integration-luvia.njwnrvwbv5.workers.dev/`.
- Immutable URL:
  `https://0ad87340-integration-luvia.njwnrvwbv5.workers.dev/`.
- Clean archive, Stable and Immutable are SHA-256 byte-identical for 14/14
  critical assets: entry document, version kernel, App Shell, module hub
  JS/CSS, Experience contract, preference resolver, Intelligence/Places
  adapters, Places JS/CSS, public Landing motion/CSS and Service Worker.
- Safe Regression: 118/118 PASS. Targeted Compass, preference resolution,
  visual inventory, shell recovery, public Landing/Auth and shell-freeze tests
  PASS; changed JavaScript syntax 35/35 PASS.
- Signed-in Stable Desktop real-keyboard/left-click sequence: Plan Compass,
  direct needle target, visibly settled selection, Back and Reload PASS.
  Cardinal direction evidence is red/orange/blue/green at
  `0°/90°/180°/-90°`; an intermediate `-45°` selection resolves to the exact
  SVG-gradient value `#8f7764` across node and four orbit lines.
- Immutable public Landing Desktop and 390x844 Mobile real-click sequence:
  accessible puzzle bypass, animations re-enabled, `Luvia kennenlernen`,
  `Living Journey`/`Place Compass` and a Journey point PASS; four synchronized
  lines, subtle near-white selected surface and zero horizontal overflow.
- Real Edge Service Worker E2E on Stable PASS: live registration preserves the
  controlled document, explicit maintenance prunes only stale caches and an
  offline reload serves App 13.82.100 plus the Compass stylesheet.

## Explicitly open

- M16.5AA wires Places only. Planning, Journey/Today, Move, Trip summaries,
  Memories and Luvia AI are eligible consumers but are not claimed as wired by
  this slice.
- Multi-person preference reconciliation remains Collaboration/Decision owner
  work and is not simulated.
- Physical-handset acceptance and the broader M16.5 Design Freeze remain
  separate gates.
- Main and Production promotion is not authorized.

## Rollback

Rollback returns Stable Integration to App/Core 13.82.99 / 4.82.99, version
`e9c1df5d-d172-459e-ab8a-93736988d65e`, deployment
`ff560abc-6fe4-4258-be16-ea2280c18ff0`. Because this slice has no persistence,
schema or provider-configuration change, rollback is a Worker traffic switch.
