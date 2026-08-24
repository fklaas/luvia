# Parallel Development Rules — normative from M2, activated operationally in M4

M2 established the initial rules. M4 completed the parallel-development
foundation, M4.5 established the first eight streams, and M16.5 aligns every
active or bindingly reserved Core boundary with its own owner stream.
`config/luvia-streams.json` is the machine-readable source of truth.

## Source of truth

1. Git is the source of truth. ZIP files are release/handoff artifacts only.
2. `main` is stable production history; `integration` is the controlled merge, regression and preview staging branch.
3. One development stream = one branch + one worktree. Two chats must never edit the same worktree.
4. Database migrations are immutable after deployment. New schema work always gets a new timestamped migration.

## Active streams — M16.5 core-aligned nineteen-stream topology

| Stream | Owns | May not change without Platform Change Request |
|---|---|---|
| `main` | production release history and approved architecture baseline | direct feature development |
| `integration` | cross-stream convergence, regression and preview validation | direct product feature development |
| `feature/booking-core` | Booking domain/core/providers/functions/tests | shared platform/contracts, Trip/Places/Media/Identity internals, App Shell |
| `feature/consumer-experience` | Consumer screens/experience composition | domain internals, shared platform/contracts, DB truth |
| `feature/platform-core` | contracts/adapters/shared runtime/Ports/integration tooling | domain business behavior unless owner-approved |
| `feature/trip-core` | Trip Truth, Active Trip Context and Trip commands | Places/Booking/Media/Identity/Journey/Admin internals |
| `feature/places-core` | Places Truth, discovery rules, lifecycle and Place commands | Trip/Booking/Journey/Admin internals |
| `feature/media-core` | Media asset truth, acquisition, storage and transfer lifecycle | Memory narrative, Wallet documents or foreign truth |
| `feature/memory-core` | Memory/Narrative Truth and lifecycle | Media asset truth, Journey schedule or foreign truth |
| `feature/identity-core` | global viewer identity and explicit preferences | Auth session transport, Membership or Admin grants |
| `feature/events-core` | versioned cross-core event envelopes and compatibility | Domain Truth, notification delivery or policy |
| `feature/journey-core` | derived Day Graph, ordering, conflicts and provenance | Trip/Places/Booking/Media truth |
| `feature/experience-core` | `core/experience/*`, shared design-system and interaction foundations | domain truth, domain persistence, unrelated domain internals |
| `feature/intelligence-core` | `core/intelligence/*`, Intelligence-specific architecture/state and controlled Intelligence migrations | private domain truth, foreign-domain mutation, unclassified bulk moves |
| `feature/collaboration-core` | reserved Collaboration/Membership owner boundary | Identity, Trip membership or Admin governance truth |
| `feature/attention-core` | reserved Attention/Notification Intent owner boundary | source-domain truth or provider-specific UI ownership |
| `feature/travel-wallet-core` | reserved secure Travel Wallet/Documents owner boundary | Booking, Trip, Identity or Media truth |
| `feature/reviews-core` | reserved Reviews/Moderation/Reputation owner boundary | Places/Booking truth or hidden global social score |
| `feature/admin-core` | reserved mandatory Admin Governance owner boundary | Auth/Identity/Membership or any managed Domain Truth |

The complete active stream/worktree mapping is defined by
`config/luvia-streams.json`. New topology-aware automation must consume that
registry instead of maintaining a separate hard-coded branch list. The former
`feature/social-experience-graph` branch is preserved as historical lineage,
not a second active Collaboration owner.

## Platform Change Request (PCR)

Any change to the following requires an explicit PCR before implementation:

- `core/platform/*`
- shared event envelope/naming rules
- `core/ui/*`, `core/design/*`, Theme shared semantics
- Auth/Supabase client/session ownership
- Navigation/ProductModule/Capability registries
- public contract major versions
- `index.html`, `sw.js`, `wrangler.jsonc` when the change affects more than one stream
- shared DB views/functions that expose multiple domain owners

A PCR must state: **problem, owner, impacted contracts, backward compatibility, affected streams/files, DB/Function impact, test plan, rollout/feature gate if needed, rollback**. Cross-cutting work is merged through Platform/integration, never hidden inside a product branch.

## Feature flag governance

Feature flags are temporary rollout gates, not a second configuration or domain-truth system.

1. The shared registry mechanics are Platform-owned through `core/platform/feature-flag-registry.js`.
2. Flag IDs use the form `<owner>.<feature>` and must use a registered owner
   prefix such as `platform`, `trip`, `places`, `booking`, `media`, `memory`,
   `identity`, `events`, `journey`, `experience`, `intelligence`, `consumer`,
   `collaboration`, `attention`, `travel-wallet`, `reviews` or `admin`.
3. The owning stream may define its own rollout flag, but may not modify shared registry mechanics without a Platform Change Request.
4. Unknown flags fail closed and evaluate as disabled.
5. New or incomplete functionality must remain safe when its flag is disabled.
6. Feature flags must never replace:
   - authentication or authorization;
   - privacy or permission checks;
   - capability availability;
   - ProductModule lifecycle/state;
   - domain ownership or persisted business truth;
   - migration or schema compatibility rules.
7. Feature definitions use only the registry schema. Arbitrary hidden configuration fields are not permitted.
8. No parallel flag truth may be introduced through `localStorage`, query parameters, ad-hoc globals, hidden JSON configuration, or another registry.
9. The historical `intelligence/platform.js` / `intelligence/runtime-config.json` feature-flag path must not be reactivated as the modern runtime flag system.
10. Runtime mutation APIs such as `enable()`, `disable()` or `setEnabled()` are not part of the M4.3 foundation.
11. A rollout change to `defaultEnabled:true` requires the owning stream's tests and the controlled baseline regression to be green.
12. Once a rollout is permanently complete, the owner removes the temporary flag and dead gated branch in a controlled change rather than keeping permanent flag debt.

## Merge order

The standard merge path is:

`feature/* -> integration -> controlled regression + integration smoke -> main -> production`

Cross-cutting work follows this order:

1. Shared Platform/contract/PCR changes are implemented and integrated first.
2. Affected domain streams sync against that shared contract before adding dependent business behavior.
3. Domain-owner changes are integrated before Consumer/Social composition that depends on them.
4. Each feature stream merges to `integration`; feature branches do not bypass `integration` into `main`.
5. Domain tests and the controlled regression baseline must pass on the integrated state.
6. Integration/Preview smoke must pass before promotion to `main`.
7. `main` remains the stable production release history.
8. After each `main` release, all registry-active streams synchronize with
   `main` before continuing dependent work.
9. A failed integration or regression gate stops promotion; fixes return through the owning stream or Platform/PCR path rather than being patched directly into production history.
## Merge rule

A stream may merge when:

1. its owner files are the only intended product files changed;
2. public contract changes are additive or versioned;
3. no direct foreign-domain DB/provider access was added;
4. domain tests + baseline regression suite are green;
5. migration/function/deploy impact is explicitly listed;
6. integration smoke passes before main;
7. rollback point is known.

## Conflict rule

If two streams need the same shared file, stop. Do not “just merge both.” Move the shared change into a Platform/PCR change first, integrate it, then rebase/merge each stream against the new contract.

## Release/version rule

Architecture IDs `M0…M15` remain separate from App/Booking/Social product versions. A docs-only architecture build can keep v13.81.4/Core 4.81.4. Runtime/DB/function/visible behavior changes must increment the appropriate product version according to the existing release scheme.
