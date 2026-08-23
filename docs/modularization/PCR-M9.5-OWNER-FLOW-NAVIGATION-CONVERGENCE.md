# PCR M9.5 – Owner Flow Navigation Convergence

Status: **PLATFORM FOUNDATION IMPLEMENTED / CONSUMER + BOOKING ADOPTION PENDING**

## Measured baseline

M9.1–M9.4 established canonical screen intents, staged module mounting, one History owner and runtime signal coordination. The remaining M9 scope was not another App Shell router. It consisted of owner-specific transitions in Auth, Trip Join/Public Entry and Booking plus two byte-identical inactive legacy Shell copies.

The pre-mutation inventory proved:

- all eight streams synchronized at `1a21b4a3c01fa103c0c380272a84fe3d4c9a6b74`, divergence `0/0`, clean;
- active Shell: only `app/app-shell.js`, loaded by `index.html` and cached by `sw.js`;
- `luvia-app-shell.js` and `legacy/ui/luvia-app-shell.js`: byte-identical, not referenced by active `index.html`, Service Worker, imports or fetches;
- Auth login forced a full `location.replace`, although M9.4 already provides serialized session activation;
- Auth logout wrote Web History directly;
- Trip Join persisted pending input through direct `localStorage` and used direct History/Location reloads;
- Booking and Trip Invite opened device/browser surfaces directly;
- the formal Storage, Sharing, DeepLink and ExternalNavigation Ports already existed and remained the correct Web/native boundary.

Timeline/Journey is not part of this scope. No owner-specific domain truth moves into Platform or Consumer.

## Locked bundled scope

1. Add browserless `owner-flow-navigation.v1` effects for Auth, Join and Booking transitions.
2. Add one Web adapter that consumes the existing Platform Ports and delegates URL replacement to the established `LuviaNavigationHistoryV1` owner.
3. Make password login reload-free and let M9.4 Runtime Signals perform session activation.
4. Move pending Join storage to `StoragePort`; preserve the Join query through login; remove direct reload/history actions.
5. Move Trip Invite sharing and external communication to Sharing/ExternalNavigation Ports.
6. Adopt the same external navigation boundary in Consumer Booking and Booking Core.
7. Delete only the two proven unreachable byte-identical legacy Shell JavaScript copies. Historical CSS and the separately classified v11 archive remain untouched.
8. Add owner-specific focused guards and then perform the normal Integration/Preview/Main/Production/8-stream gates.

## Explicit exclusions

- no database, schema, RPC, RLS or bucket mutation;
- no Edge Function or secret change;
- no Booking, Trip, Identity or Journey truth reassignment;
- no deletion of `core/app/app-shell-v11.js` or the archived `legacy/ui/index-v11.0.0.html`;
- no broad cleanup of unrelated PWA, profile or historical URL debt;
- no direct AI, Timeline/Journey or payment mutation.

## Platform foundation

The Platform foundation introduces a browserless immutable policy with no DOM, browser global, Supabase access or Domain Truth. `app/adapters/owner-flow-navigation-web-adapter.js` is the only new Web binding. It uses the existing Navigation History adapter for URL replacement and the existing Platform Port registry for external navigation.

Auth password login no longer reloads the document. Auth logout clears navigation through the owner-flow boundary. Join URLs preserve unrelated parameters, remove `join`/`invite` only when requested and retain the completion screen until the traveler explicitly opens the joined trip.

The deleted `luvia-app-shell.js` and `legacy/ui/luvia-app-shell.js` had identical SHA-256 `4651AC3D4E921E5CA18AE4B03B6AFB6C72F28723D6CE8D55DFFC99B36B3ABC7E` and zero active reachability.
