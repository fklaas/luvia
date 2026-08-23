# PCR M9.2 - Staged App Runtime and Module Mounting

Status: `APPROVED FOR IMPLEMENTATION`

Owner streams: Platform foundation, followed by Consumer adoption

Baseline marker: `3e8a25f28b92275831ced0df7b3883cc96bebcac`

Baseline App / Core: `13.82.26 / 4.82.26`

## Measured baseline

- All eight streams are synchronized to the M9.1 documentation marker with `Local = Tracking = Live`, divergence `0/0` and clean worktrees.
- `core/runtime/boot-coordinator.js` exposes seven Web splash/boot phases but no platform-neutral App Runtime stage contract.
- `app/app-shell.js` directly coordinates Supabase startup, auth readiness, Trip/Profile hydration, shell rendering and ten concrete module mount paths.
- Navigation M9.1 already defines canonical mount descriptors for all 15 routes through `navigation.v1`.
- Concrete Web mounting remains Consumer-owned; shared runtime sequencing remains Platform-owned.
- Existing `LifecyclePort` and `NetworkPort` are available through Platform Ports. They are not required for the first staged-runtime mutation and remain a later M9 adoption surface.
- No DB, RPC, Edge Function, secret or manual Cloudflare configuration change is required.

## Problem classification

The current behavior works, but boot and mounting are implicit control flow. Diagnostics cannot answer which reusable stage is stable, which stage failed, whether recovery occurred, or which canonical navigation descriptor caused a concrete module mount. The direct per-route mount chain also duplicates routing knowledge already owned by `navigation.v1`.

## Locked ownership

- Platform owns the browserless `app-runtime.v1` state machine, generic timeout/recovery semantics and the browserless `module-mount.v1` registry.
- Consumer owns DOM creation, target resolution, concrete Web module adapters, user-facing failure rendering and App Shell composition.
- Navigation owns route and mount descriptors; the Mount Contract consumes them and does not create a second route registry.
- Domain Cores retain all domain truth and commands. Neither new contract may store Trip, Places, Booking, Media, Identity or Journey truth.
- Journey/Timeline hydration remains separately classified and is not reclassified as ordinary Places mounting.

## Mutation scope

1. Add browserless `app-runtime.v1` with ordered stages: `idle -> platform-ready -> auth-ready -> domain-context-ready -> shell-ready -> modules-ready`.
2. Add explicit running, ready, failed, timeout and recovery states with immutable snapshots and subscriptions.
3. Add browserless `module-mount.v1`, consuming `navigation.v1` descriptors and serializing mount/unmount transitions.
4. Bind the App Runtime in the Platform Web boot coordinator and expose runtime diagnostics through a compatibility binding.
5. Adopt both contracts in the Consumer App Shell without moving concrete screen composition or domain ownership.
6. Add focused browserless and static adoption regression, then run the complete safe suite.

## Excluded scope

- History/back-stack policy and URL synchronization.
- Lifecycle/background and network/offline adoption.
- Push/deep-link cold-start policy beyond the existing M9.1 navigation intent.
- Domain mutations, DB migrations, Edge Functions, secrets and provider configuration.
- Journey/Timeline ownership changes.

## Acceptance gates

- Both contract cores execute without `window`, `document`, `navigator`, Web Storage or direct browser navigation.
- Runtime stage gaps are rejected; timeouts become measured failed state; recovery is explicit.
- Module activation consumes the canonical route descriptor, resolves its declared target and unmounts serially.
- App Shell contains no route-specific mount `if` chain for the ten module routes.
- Existing Trip Contract adoption and active-Trip switch behavior stay intact.
- Focused M9.2 regression and complete safe regression pass.
- Preview and Production runtime assets are byte-proven against the release commit, followed by authenticated F5 and UI acceptance.
