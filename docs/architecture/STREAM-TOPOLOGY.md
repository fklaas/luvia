# Luvia Stream Topology

## Canonical registry

`config/luvia-streams.json`

Topology-aware automation reads this registry. Hard-coded stream counts or
parallel branch lists are forbidden.

## Active nineteen-stream topology

| Stream | Branch | Worktree | Primary role |
|---|---|---|---|
| Main | `main` | `../luvia` | Final release |
| Integration | `integration` | `../luvia-integration` | Cross-stream convergence |
| Consumer | `feature/consumer-experience` | `../luvia-consumer` | Product composition; no Domain Truth |
| Platform | `feature/platform-core` | `../luvia-platform` | Runtime, Ports, shared contracts and tooling |
| Trip | `feature/trip-core` | `../luvia-trip` | Trip Truth and owner commands |
| Places | `feature/places-core` | `../luvia-places` | Places Truth, discovery rules and lifecycle |
| Booking | `feature/booking-core` | `../luvia-booking` | Booking Truth and provider lifecycle |
| Media | `feature/media-core` | `../luvia-media` | Media assets and transfer lifecycle |
| Memory | `feature/memory-core` | `../luvia-memory` | Memory/Narrative Truth |
| Identity | `feature/identity-core` | `../luvia-identity` | Viewer identity and explicit preferences |
| Events | `feature/events-core` | `../luvia-events` | Event envelopes; no Domain Truth |
| Journey | `feature/journey-core` | `../luvia-journey` | Day Graph, conflict policy and provenance |
| Experience | `feature/experience-core` | `../luvia-experience` | Corporate Design and interaction system |
| Intelligence | `feature/intelligence-core` | `../luvia-intelligence` | AI orchestration and Intelligence state |
| Collaboration | `feature/collaboration-core` | `../luvia-collaboration` | Reserved Membership owner |
| Attention | `feature/attention-core` | `../luvia-attention` | Reserved Notification Intent owner |
| Travel Wallet | `feature/travel-wallet-core` | `../luvia-travel-wallet` | Reserved secure Documents owner |
| Reviews | `feature/reviews-core` | `../luvia-reviews` | Reserved Reviews/Reputation owner |
| Admin | `feature/admin-core` | `../luvia-admin` | Reserved mandatory Governance owner |

Reserved means the boundary and owner stream are binding, not that runtime,
tables, policies or contracts already exist. Activation still requires a
browserless Core, public contract, security model, tests and separately gated
persistence changes.

## Historical Social stream

`feature/social-experience-graph` remains on GitHub as non-destructively
preserved history. It is no longer an active Truth owner and must not evolve in
parallel with `feature/collaboration-core`. Existing presence/activity code is
classified compatibility until M18.1 establishes Membership Truth.

## Promotion model

Normal production-bearing work follows:

`feature/* -> integration -> main -> production verification -> stream sync`

Architecture-only topology changes follow the same Feature -> Integration ->
Main path, but do not claim a runtime deployment when no deployable asset,
schema, Function, secret or provider configuration changed.

Every promotion proves:

- expected branch and exact candidate parent;
- clean worktree before mutation;
- correct tracking and live remote refs;
- zero unexplained divergence;
- exact staged scope;
- relevant tests and guardrails;
- fast-forward-only convergence where required.

## Cross-stream changes

Cross-cutting architecture changes require an explicit owner and exact file
scope. A dedicated branch is an ownership lane, not a repository fork: every
stream carries the same integrated tree after closeout and may mutate only its
declared owner scope.

Experience, Intelligence and Admin are not privileged bypass layers. Admin UI
does not own administrative authorization truth; Intelligence cannot grant
itself permissions; Platform transports contracts but does not absorb business
truth.
