# PCR M9.4 — Runtime Signals and Resume Coordination

Status: APPROVED FOR IMPLEMENTATION

Owner streams: `feature/platform-core` for the browserless signal policy and Platform-Port Web binding; `feature/consumer-experience` for serialized App Shell action handling and the visible runtime-status projection.

## Measured baseline

M9.1–M9.3 established canonical Navigation Intents, staged module mounting and History/Deep-Link projection. The remaining App Shell baseline contains exactly one active direct Auth subscription that couples session transitions to unmount, Runtime recovery, domain hydration and rendering in one callback. The App Shell has zero `LifecyclePort` subscriptions and zero `NetworkPort` subscriptions.

The existing Platform registry already provides productive Web implementations of `AuthSessionPort`, `LifecyclePort` and `NetworkPort`. Lifecycle reports active/background from visibility/page transitions; Network reports online/offline transitions; AuthSession remains a projection over Supabase Auth and owns no second token/session store. These ports are therefore reused rather than duplicated.

Other direct visibility/network consumers in Collaboration, Media upload coordination, Location and Travel Context retain their measured owners. M9.4 does not silently absorb their domain-specific reactions into the App Shell.

## Ownership and contract lock

- Platform owns the browserless `app-runtime-signals.v1` transition policy and native/Web bindings.
- AuthSessionPort remains the only session snapshot/transition source used by the new binding. The policy stores only loading/authenticated/user-id/event metadata, never a session or token.
- Consumer owns screen composition, serialized session activation/deactivation, current-view resume and the accessible connectivity-status projection.
- Lifecycle and Network are runtime capabilities, not Domain Truth.
- A session signal authorizes shell rehydration only; it does not authorize a foreign Domain Command.
- Resume preserves the current canonical Navigation Intent and must not write another History entry.
- Timeline/Journey remains a separately reserved cross-domain aggregator.

## Mutation scope

1. Add browserless `core/runtime/runtime-signal-policy-core.js` with idempotent Auth/Lifecycle/Network transitions, a 15-second background-resume threshold and bounded diagnostics.
2. Add `app/adapters/runtime-signal-web-adapter.js`, consuming only `AuthSessionPort`, `LifecyclePort` and `NetworkPort`.
3. Replace the App Shell's direct Auth subscription with serialized runtime actions.
4. On eligible resume, refresh the existing runtime/current module without changing the Navigation Intent or pushing History.
5. On offline/reconnect, expose a responsive `aria-live` status and trigger the existing runtime refresh path without moving domain sync ownership.
6. Add focused browserless, load-order, ownership and Consumer-adoption guards; register them in Safe Regression after adoption.

## Explicit exclusions

- no database/schema/RPC/RLS/bucket migration;
- no Edge Function, secret or manual Cloudflare configuration change;
- no Auth, Trip Join, Booking return or provider URL-policy migration;
- no Collaboration, Media, Location or Travel Context lifecycle-owner migration;
- no service-worker/background-execution claim;
- no Timeline/Journey reclassification;
- no legacy shell deletion without a later reference/runtime proof.

## Rollout and rollback

The additive Platform foundation is followed by Consumer adoption, Integration, authenticated Preview lifecycle/reconnect acceptance, Main and Production. Rollback is code-only to the synchronized M9.3 marker `7e8829119727a6c65e1a05c3029c981d6af78369`; no data rollback is required.
