# Luvia Social Travel Intelligence / Experience Graph Blueprint

Date: 2026-08-24

Status: STRATEGIC CORE RESERVED / NO RUNTIME OR PERSISTENCE CLAIM

Owner stream: `feature/social-experience-graph`

Planned boundary: `social.experience-graph.v1` with `social.v1` compatibility

## Product thesis

Luvia does not build a conventional Travel Social Network. It builds a Social
Travel Intelligence Network.

The primary question is not what other people posted or where they travelled.
It is which consented experiences from trusted or behaviorally compatible
people are relevant to the active traveller, trip, place, time and situation,
and how Luvia can transform that relevance into an explainable owner-backed
action.

The product loop is:

`discover -> plan -> book -> experience -> remember -> consented experience signal -> relevant adaptation -> owner-backed action`

There is no requirement for an endless feed, follower competition or public
like counts. Relevance and utility replace engagement and vanity.

## Signature product capabilities

### Experience Graph

Consent-scoped links connect public owner references for people, trips, places,
experiences, memories, situations, inspiration and booking outcomes. Graph
nodes do not copy their source entity. Each edge records purpose, audience,
consent/provenance, validity, visibility and lifecycle.

### Travel Twins

Intelligence computes an explainable compatibility projection from privacy-safe
signals. Social governs discovery consent, visibility, dismiss/block state and
any durable accepted connection. Match evidence exposes uncertainty, sample
size and reasons; it never exposes a private Travel DNA vector.

### Social Compass

Social relevance augments a Places/Booking/Journey decision without bypassing
the owners. A restaurant result can explain trusted visits or compatible
experience evidence, then offer Places and Booking owner actions in the same
surface.

### Fork my Trip

Social provides a consented inspiration projection and stores provenance.
Intelligence adapts duration, budget, traveller context, weather and current
availability. Trip/Journey owner commands create the new plan. Social never
copies a foreign trip or schedule as Social truth.

### Luvia Echoes

Memory owns the source memory, Places the Place reference, Social the consented
person-to-experience relationship and Echo lifecycle, Attention the semantic
notification intent, and Platform LocationPort the device location capability.
An Echo is delivered only when purpose, audience, time, location precision and
consent gates all pass.

### Experience Drops

A Drop is a short contextual tip attached by public IDs to a place or trip
context. Social owns its text, audience, lifecycle, consent and moderation
state. Audiences are private, family, friends, circle or moderated community.
Drops do not reveal live presence.

### Verified Experience

A verification attestation references sanitized owner receipts from Booking,
Trip, Places, Media or Journey with consent. It expresses evidence and
provenance, not a guaranteed fact and not a hidden ranking requirement.
Reviews owns authored reviews, moderation and reputation; Social owns the
relevance/provenance connection only.

### Social Booking and inspiration provenance

Social can record that a person/trip/experience inspired a Place or Booking
intent. Booking owns provider selection, availability, reservation state,
affiliate attribution, conversion and commission. Social may receive a
sanitized receipt but never calls providers, reads Booking tables or decides a
commission.

## Binding non-goals

- no endless engagement feed as the primary product;
- no public follower or like counts as ranking authority;
- no influencer status overriding contextual relevance;
- no global hidden popularity/reputation score;
- no reinterpretation of `trip_members`, Collaboration presence or contact
  lists as Social relationships;
- no copied Trip, Place, Booking, Memory, Media, Identity or Reviews truth;
- no exposure of precise live location or travel presence without explicit,
  purpose-bound consent;
- no autonomous Intelligence mutation of Social or foreign Domain truth.

## Domain ownership matrix

| Concern | Canonical owner | Social role |
|---|---|---|
| Profile and explicit preferences | Identity | minimal public identity and consent reference |
| Inferred Travel DNA / compatibility calculation | Intelligence | privacy-safe evidence input and durable consented relationship state |
| Trip and active-trip truth | Trip | inspiration/fork reference only |
| Day Graph and adapted itinerary | Journey | provenance and Social relevance only |
| Places lifecycle/provider data | Places | Place ID reference and contextual experience signal |
| Booking/provider/commission | Booking | inspiration provenance and sanitized receipt only |
| Memories/photos/stories | Memory/Media | consented source reference, never a content copy |
| Group membership, invitations, roles, votes | Collaboration | relationship may reference a group, never own membership |
| Authored reviews/moderation/reputation | Reviews | evidence/relevance reference only |
| Notification policy and delivery | Attention | semantic Echo/connection intent request only |
| Administrative authority | Admin | moderation/admin commands via Admin policy only |
| Device location and deep links | Platform Ports | capability request via ports, no device API |

Intelligence owns the private inferred Travel DNA and its model lifecycle.
Social receives only the minimum privacy-safe compatibility evidence required
for consented discovery and explanation.

## Canonical Social models

- `SocialSubjectRef`: opaque Identity public reference plus subject type;
- `SocialRelationship`: lifecycle, relationship kind, source, reciprocal
  state, visibility and block precedence;
- `Circle`: owner, membership references, audience policy and version;
- `ExperienceSignal`: source-owner reference, context tags, consent scope,
  verification evidence refs, freshness and expiry;
- `TravelTwinEvidence`: compatibility band, factors, uncertainty, sample gate,
  algorithm/version and explanation refs without raw private vectors;
- `ExperienceDrop`: Place/context reference, content, audience, reuse consent,
  moderation and lifecycle;
- `Echo`: source reference, recipient scope, trigger policy, expiry,
  acknowledgment and delivery-intent refs;
- `TripForkProvenance`: source Trip projection ref, derived Trip ref,
  adaptation receipt and attribution visibility;
- `InspirationReceipt`: source subject/experience, resulting intent/entity ref,
  correlation and purpose without financial truth;
- `SocialConsent`: subject, purpose, audience, reuse, precision, expiry,
  revocation and policy version;
- `SocialModerationCase`: reason, evidence refs, status, decisions and appeal
  refs while Reviews/Admin retain their own authority domains.

Every model is versioned and immutable at public boundaries. Commands use
expected version, actor, purpose, correlation, idempotency and owner receipts.

## Planned contract surface

Reads:

- relevant experience signals for an explicit context;
- relationship/circle projection;
- privacy-safe Travel Twin evidence;
- Echo and Drop projections;
- Trip Fork provenance;
- inspiration receipt;
- consent and export status for the authenticated subject.

Commands:

- request/accept/decline/disconnect a relationship;
- block/unblock with block precedence;
- create/update/archive a Drop;
- configure audience/reuse consent and revoke it;
- acknowledge/dismiss an Echo;
- record owner-confirmed Fork or inspiration provenance;
- report content/relationship;
- export/delete Social subject data.

Events:

- `social.relationship.*`;
- `social.experience-signal.*`;
- `social.echo.*`;
- `social.drop.*`;
- `social.trip-fork.*`;
- `social.inspiration.*`;
- `social.consent.*`.

Events contain IDs, versions, purpose, correlation and minimal causal metadata.
They do not contain raw private profiles, memories, locations or booking data.

## Intelligence integration

Intelligence may:

- calculate contextual compatibility and relevance;
- explain match factors and uncertainty;
- adapt an inspiration projection into a proposed Trip/Journey plan;
- detect spam, Sybil or unsafe sharing signals;
- draft a Drop or audience change;
- orchestrate public Social and owner tools under the action policy.

Intelligence may not:

- expose or persist a raw Travel DNA vector in Social;
- accept a relationship, change audience or publish a Drop without required
  confirmation;
- infer contacts/membership as consent;
- bypass block, child-safety, moderation or visibility policies;
- perform Booking, Trip, Journey, Memory, Reviews or Admin writes directly.

## Privacy, safety and governance

- default private and purpose-bound consent;
- audience and reuse consent are separate;
- block dominates follow/relationship, recommendation and delivery;
- child/minor accounts and family contexts require stricter policies;
- location precision is minimized and coarse by default;
- no live-presence inference from Booking, Media or Timeline evidence;
- retention/expiry applies to signals, Echoes, Drops and provenance;
- revocation and deletion propagate to indexes, caches, model features and
  downstream projections with receipts;
- subject export explains graph edges, evidence sources and decisions;
- report, rate-limit, anti-Sybil, moderation and appeal are mandatory before
  community audiences;
- logs and telemetry use redacted IDs/digests and never raw private payloads;
- Admin actions are server-authorized and immutably audited; a visible control
  is never authority.

## Native First

The Core and contracts are browserless. Web, SwiftUI and Compose consume the
same semantics. Device behavior crosses LocationPort, PermissionPort,
NotificationPort, DeepLinkPort, SharingPort, NetworkPort, LifecyclePort,
SecureStoragePort and OfflineCachePort.

Offline Social state is a bounded read model plus idempotent safe drafts.
Relationship, audience, block, community publication and other security-
relevant changes require current server policy and an owner receipt.

## M16.5 Experience requirements

M16.5 designs Social as contextual utility across Luvia, not as an attached
generic tab. The complete design inventory includes:

- Travel Twin compatibility/evidence cards and uncertainty;
- Social Compass explanations within Places, Journey and Luvia AI;
- Fork my Trip source/adaptation/provenance flow;
- Echo arrival, defer, privacy and source-memory flow;
- Drop creation, audience, moderation, relevant-time delivery and expiry;
- verified versus community evidence semantics;
- connection/circle/block/report/consent controls;
- Social Booking inspiration and owner handoff receipts;
- empty, loading, stale, denied, blocked, revoked, expired, moderated,
  unknown-outcome, offline and recovery states;
- accessible motion, active-Trip accents, mobile/native adaptations and
  reduced-motion equivalents.

No Social design is frozen independently from the global Corporate Design.

## Delivery sequence for M18.6

1. Read-only Social/Collaboration/Identity/Memory/Booking/Reviews data and
   privacy inventory.
2. Threat model, consent taxonomy, child-safety and moderation ADR.
3. Browserless graph, relationship, visibility, block and consent state
   machines plus negative tests.
4. Additive contract and owner-command foundation with no persistence.
5. Separately approved schema/RLS/RPC/index migration and rollback.
6. Private/family/friends circles and Experience Signals.
7. Travel Twin evaluation pipeline with fairness, uncertainty and opt-out.
8. Echoes and Drops through Attention and Platform Ports.
9. Fork my Trip and Social Compass/Booking owner handoffs.
10. Community audiences only after moderation, abuse, deletion and scale gates.
11. Web/native Experience integration and controlled Intelligence tools.
12. Preview, Production, privacy/security acceptance and 20/20 stream sync.

## Acceptance gates

- single Social truth owner and zero Collaboration/Identity/Memory/Booking
  truth copies;
- complete consent/audience/block matrix;
- RLS/IDOR and cross-account negative tests;
- relationship and consent version/race/idempotency tests;
- deletion/revocation/index/cache/model propagation receipts;
- Travel Twin offline evaluation, bias/fairness, calibration and explanation;
- Echo location/time/precision/expiry and false-trigger tests;
- Fork provenance and Trip/Journey owner-receipt tests;
- verified-experience evidence integrity and uncertainty;
- moderation/report/appeal/anti-Sybil/rate-limit tests;
- browserless Core smoke and browser-global guardrails;
- responsive/accessibility/reduced-motion/native adapter acceptance;
- Preview/Production provenance, reload/offline/recovery and rollback drill;
- all twenty registry streams Local = Tracking = live Remote, divergence 0/0,
  clean at the accepted marker.

## Current mutation boundary

This blueprint reserves ownership and product direction only. It creates no
Social runtime, schema, table, RLS policy, RPC, Edge Function, secret, index,
provider connection or visible UI. Those require the gated M18.6 sequence.
