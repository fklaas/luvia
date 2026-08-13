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
