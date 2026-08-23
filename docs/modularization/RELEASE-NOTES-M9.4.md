# Release Notes — M9.4 Runtime Signals and Resume Coordination

Date: 2026-08-23
Status: COMPLETE / CLOSED / PRODUCTION VERIFIED

## Release identity

- App / Core: `13.82.33 / 4.82.33`
- Platform foundation: `c9377153ff8e6a95e592293745640c2ff058b31b`
- Consumer adoption: `e9dd548e0e8a4841ead1f6d956612eff51f1e4e1`
- Final runtime release: `236f32c1072d6e0e5d5ef8978d906289db7156cc`
- Previous synchronized marker / rollback: `7e8829119727a6c65e1a05c3029c981d6af78369`

## Architectural and visible result

M9.4 adds browserless `app-runtime-signals.v1`. One Web adapter consumes the existing AuthSession, Lifecycle and Network ports. The policy keeps no token or session and owns no Domain Truth; it emits only sanitized, idempotent session, offline, reconnect and eligible-resume actions.

The Consumer App Shell serializes those actions. Short background intervals do not remount. Eligible foreground resume and reconnect preserve the current Navigation Intent and add no History. Offline resume remains local until a true reconnect. A responsive, reduced-motion-compatible `aria-live` strip makes Offline, Reconnect and Resume visible without moving domain sync ownership into Consumer.

Collaboration, Media upload, Location and Travel Context retain their domain-specific transition behavior. Timeline/Journey and Auth/Join/Booking URL policies remain separately owned.

## Quality and deployment evidence

- focused M9.4, NFR-0 `3/3`, Safe Regression `53/53`: PASS;
- Integration Preview `44cd8304-0063-4605-b711-2420a9f9ee91`: `12/12` exact, `5/5` privacy, authenticated Offline/Reconnect/Resume, unchanged History, `25/25` F5 at 2.5–4.7 seconds, console `0`;
- Production version `93f9bc43-e25e-45c5-b727-15d31e41a33d`, deployment `f2ae2af2-2c39-48a7-9060-02a3a0eadb12`: 100%;
- `myluvia.app`: `12/12` exact, `5/5` privacy, authenticated Offline/Reconnect/Resume, unchanged History, `25/25` F5 at 2.1–3.9 seconds, active Trip/View retained, console `0`.

Release candidates `13.82.31` and `13.82.32` were rejected for stale/mismatched Kernel descriptors. Release Consistency now verifies build, core, name, channel and UTC timestamp against `CURRENT-BUILD.md`.

## Exclusions and rollback

There was no database/schema/RPC/RLS/bucket mutation, Edge Function change, secret change, manual Cloudflare configuration change, foreign Domain Truth move or Journey/Timeline reclassification.

Rollback is code-only to M9.3 marker `7e8829119727a6c65e1a05c3029c981d6af78369`; no data rollback is required. M9 remains in progress for real login/logout environment acceptance, owner-specific Auth/Join/Booking URL policies and legacy-shell proof.
