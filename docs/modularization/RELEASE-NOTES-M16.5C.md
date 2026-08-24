# Release Notes — M16.5C Navigation Continuity

Date: 2026-08-24

App / Core: 13.82.49 / 4.82.49

Runtime source: `0e8d6c51972f1aa4d6873707e8d02206cbe3957f`

Consumer feature: `b1ea5efd7ab27de8bc5140eb621369a8b01865a3`

## User-visible correction

Luvia no longer displays a full-field module splash after a destination has
already been selected. The old sequence looked like two page loads: the
destination appeared to open, a presentation-only intro replaced it and the
real module then appeared.

The App Shell now retains the previous committed surface until the canonical
target module is fully mounted. It then performs one coordinated exit/entry
transition, removes the previous surface and leaves exactly one target host.
The result is a continuous screen change instead of an apparent reload.

## Preserved behavior and ownership

- `navigation.v1` remains the only route and intent truth;
- the Module Mount Registry retains concrete owner mount/unmount control;
- History commits only after target mount success;
- cancellation restores the previous committed surface;
- mount failure uses the existing explicit recovery surface;
- reduced-motion preference removes blur and non-essential movement;
- no Domain Core, database, provider or persistence rule changed.

The broad M16.5 visual redesign remains a Design-only prototype. This release
does not publish its new Corporate Design, navigation composition, onboarding
or screen styling.

## Release evidence

- Safe Regression: 93 / 93 PASS on Consumer feature, Integration release and
  Main;
- NFR-0: 3 / 3 PASS;
- Integration accepted Worker version:
  `73a3eda8-c83f-46fe-9db0-23221bf19bf7`;
- Integration runtime assets: 8 / 8 exact Git blobs;
- Integration authenticated F5: 25 / 25 PASS;
- Integration Today → Plan: one final `plan` host, zero `.lv-module-intro`,
  console 0;
- Production Worker version:
  `48770d4e-5a97-4a81-8543-1c42626995c9`;
- `myluvia.app` and the direct Production Worker URL: each 8 / 8 exact Git
  blobs, 16 / 16 total;
- Production authenticated F5: 25 / 25 PASS;
- Production Today → Plan: one final `plan` host, zero `.lv-module-intro`,
  console 0.

## Provenance note

The first Integration upload materialized seven text assets from the Windows
working copy with CRLF. Canonical-LF comparison proved their content was 8 / 8
equivalent, but byte-exact acceptance correctly remained open. A second archive
attempt also inherited Windows export EOL behavior. The accepted deployment
wrote each critical asset directly from its raw Git blob before upload. The
final Integration and Production endpoints are byte-exact; the intermediate
Worker version IDs remain evidence and are not described as accepted.

## Infrastructure scope

- Database/schema/RPC/RLS/bucket migration: none;
- Supabase Edge Function change: none;
- secret change: none;
- manual Cloudflare configuration change: none;
- Cloudflare Workers static asset release: Integration and Production only.

## Rollback

Redeploy the eight raw runtime blobs from pre-release marker
`4128db468dd1fbed5b57bd3dd0fc58937c592029` to the affected Worker. That restores
App/Core 13.82.48 / 4.82.48 and the old visual transition. Do not rewrite Git
history and do not touch data, Functions or secrets. Forward repair is
preferred because rollback restores the confirmed double-arrival defect.
