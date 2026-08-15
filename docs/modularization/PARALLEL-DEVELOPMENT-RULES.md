# Parallel Development Rules — normative from M2, activated operationally in M4

M2 defines the rules. **Do not create the worktrees/branches from this document yet; M4 performs that step.**

## Source of truth

1. Git is the source of truth. ZIP files are release/handoff artifacts only.
2. `main` is stable production history; `integration` is created in M4 and becomes the controlled merge staging branch.
3. One development stream = one branch + one worktree. Two chats must never edit the same worktree.
4. Database migrations are immutable after deployment. New schema work always gets a new timestamped migration.

## Planned streams after M4

| Stream | Owns | May not change without Platform Change Request |
|---|---|---|
| `feature/booking-core` | Booking domain/core/providers/functions/tests | shared platform/contracts, Trip/Places/Media/Identity internals, App Shell |
| `feature/consumer-experience` | Consumer screens/experience composition | domain internals, shared platform/contracts, DB truth |
| `feature/social-experience-graph` | future Social domain + Social experience files | Booking internals, Trip membership internals, Identity private profile, shared platform/contracts |
| `feature/platform-core` | contracts/adapters/shared runtime/integration tooling | domain business behavior unless owner-approved |

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
2. Flag IDs use the form `<owner>.<feature>` and must use one registered owner prefix: `platform`, `trip`, `places`, `booking`, `media`, `identity`, `intelligence`, `consumer`, or `social`.
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
8. After each `main` release, active streams synchronize with `main` before continuing dependent work.
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
