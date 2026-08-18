# Luvia Stream Topology

## Canonical registry

`config/luvia-streams.json`

Topology-aware automation should read this registry rather than maintaining an independent hard-coded branch list.

## Active streams

| Stream | Branch | Worktree | Primary role |
|---|---|---|---|
| Main | `main` | `../luvia` | Final release |
| Integration | `integration` | `../luvia-integration` | Cross-stream convergence |
| Platform | `feature/platform-core` | `../luvia-platform` | Platform, Trip, Places, contracts |
| Booking | `feature/booking-core` | `../luvia-booking` | Booking domain |
| Consumer | `feature/consumer-experience` | `../luvia-consumer` | Consumer product experiences |
| Social | `feature/social-experience-graph` | `../luvia-social` | Social / collaboration |
| Experience | `feature/experience-core` | `../luvia-experience` | Design system / shared UX infrastructure |
| Intelligence | `feature/intelligence-core` | `../luvia-intelligence` | AI / Intelligence architecture |

## Promotion model

Normal production-bearing work follows:

`feature/* -> integration -> main -> production verification -> stream sync`

Every promotion must prove:

- expected branch
- expected parent / candidate relationship
- clean worktree before mutation
- FF-only where required
- correct tracking branch
- correct live remote
- no unexpected divergence
- relevant tests and guardrails

## Cross-stream changes

Cross-cutting architecture changes must have an explicit owner and exact file scope.

Do not use a feature branch as an excuse to modify another core's private implementation.

Experience and Intelligence are peers of the existing feature streams, not privileged bypass layers.
