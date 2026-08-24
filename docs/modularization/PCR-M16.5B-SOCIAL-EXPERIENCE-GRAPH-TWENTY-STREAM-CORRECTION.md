# PCR M16.5B — Social Experience Graph and Twenty-stream Correction

Date: 2026-08-24

Owner: `feature/platform-core`

Runtime impact: none

Database / RLS / RPC / bucket impact: none

Function / secret / provider / Cloudflare impact: none

## Trigger and decision

The first M16.5 topology candidate treated the existing Social branch as
historical after separating Collaboration/Membership. The product definition
then supplied for Social proved a separate long-lived truth and lifecycle:
consent-scoped Experience Graph relationships, visibility, Travel Twin
relationship state, Echoes, Drops, Trip Fork provenance and inspiration
signals.

That evidence invalidates the historical-only classification. It does not
merge Social back into Collaboration. The registry expands from nineteen to
twenty active streams and reactivates the existing non-destructively preserved
`feature/social-experience-graph` worktree/branch as the Social owner lane.

The 19-stream marker `3f0e135d8ea006fbd964e010854107d12aa13387`
remains auditable intermediate evidence but is superseded before the normative
v4.4 Masterfahrplan and before M16.5 Design Freeze.

## Ownership lock

Collaboration owns spaces, memberships, invitations, scoped roles and group
votes. Social owns consented Experience Graph edges, relationship/visibility,
Travel Twin relationship state, Echo/Drop/Fork provenance and inspiration
signals.

Identity owns public identity and explicit preferences. Intelligence owns the
private inferred Travel DNA and compatibility calculation. Trip/Journey,
Places, Booking, Memory/Media, Reviews, Attention and Admin remain the sole
owners of their respective truth and commands.

## Scope

- change the canonical registry to `20-stream-core-aligned-v1`;
- add the existing Social branch/worktree as registry-active;
- reserve `core/social/` and `social.experience-graph.v1`;
- replace the old feed/follow/like-oriented `social.v1` reservation with the
  anti-vanity Experience Graph direction;
- update architecture, ownership, dependency, contract, CODEOWNERS, roadmap,
  M16.5 design inventory and topology guardrails;
- add a deterministic Social reservation guard;
- update the normative v4.4 Masterfahrplan.

## Explicit exclusions

- no Social Core implementation or new `core/social/` runtime file;
- no table, migration, RLS, RPC, Function, secret or provider;
- no friend import, contact upload, feed, follower or like feature;
- no private Travel DNA, precise presence, Memory or Booking payload copy;
- no visible Social tab or pre-freeze visual implementation;
- no Production deployment claim for architecture-only files.

## Verification

- JSON registries and `social.v1` parse;
- twenty unique stream IDs, branches and worktree mappings;
- Social Core maps exactly once to `feature/social-experience-graph`;
- Social and Collaboration purposes/boundaries remain distinct;
- contract forbids vanity ranking, membership reinterpretation, private model
  copying and foreign Domain mutation;
- CODEOWNERS protects `core/social/`;
- roadmap contains the complete M18.6 product/architecture blueprint;
- full Safe Regression and NFR-0;
- FF-only Integration/Main promotion;
- 20/20 Local = Tracking = live Remote, divergence 0/0, clean.

## Closeout evidence

Implementation marker:
`41c02f6cf6a36d85eecba3f02a7c7a7a38e4444f`.

Platform, Integration and Main each passed the controlled Safe Regression
`92/92`. NFR-0 remained `3/3`; the cross-Core DB guard remained unchanged at
361 tracked JavaScript/TypeScript files, static 310, mapped `30/30`, unmapped
`39/39` and dynamic `27/27`.

All twenty registry streams were then measured at the implementation marker:
Local = Tracking = live Remote, divergence `0/0`, working tree clean. This
includes the reactivated `feature/social-experience-graph` owner lane.

App/Core remains `13.82.48 / 4.82.48` and runtime source remains
`0d7468596dbdb42803738f427d4355bf31281c65`. No runtime asset, database,
schema, RPC, RLS, bucket, Edge Function, secret, provider or Cloudflare
configuration changed. No Preview or Production deployment was triggered or
claimed.

M16.5 visual design remains active and not frozen. The next product gate is
the jointly reviewed Creative Territories and end-to-end flow prototypes;
neither Social nor Admin runtime implementation is claimed by this closeout.

## Rollback

Rollback is a reviewed code/docs revert. The pre-existing Social branch and
worktree are not deleted. No data compensation is required because no runtime
or persistence exists in this slice.

## Stop conditions

Stop on duplicate Social/Collaboration truth, unexpected branch drift, dirty
worktree, guard failure, unapproved persistence, private-profile/location
leakage, a visual decision represented as Design Freeze or any claim that the
reserved Social runtime already exists.
