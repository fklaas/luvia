# PCR M8.5 — Intelligence Contract Foundation & Scope Lock

Date: 2026-08-23

Owner streams: `feature/platform-core` (public Web adapter/runtime integration), `feature/intelligence-core` (owner core and Intelligence-owned consumers)

Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED**

## Source lock

M8.5 starts from the synchronized M8 closeout marker `b091d09a4b23b41b9c766d2e33437a45dd5b4a04`. The feature streams were required to be Local = Tracking = Live, divergence `0/0`, and clean before the first mutation.

## Measured baseline

| Root | Runtime files | Browser globals | DOM | Device APIs | Browser storage | Supabase | Direct DB markers | Private Trip refs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `core/ai/` | 14 | 112 | 18 | 4 | 0 | 9 | 6 | 7 |
| `core/recommendations/` | 7 | 99 | 11 | 16 | 4 | 7 | 5 | 0 |
| `core/planning/` | 6 | 43 | 20 | 15 | 8 | 0 | 0 | 0 |
| `core/discovery/` | 3 | 13 | 8 | 7 | 0 | 0 | 0 | 0 |
| legacy/productive mixed `intelligence/` | 40 | 580 | 73 | 168 | 46 | 54 | 8 | 20 |

The physical `core/intelligence/` root contained documentation only. `intelligence.v1` was specified but not runtime-active, while `LuviaAI` exposed a broad transitional Web facade.

The measured `intelligence/` tree is not one domain. It contains Platform compatibility services, productive Places/Trip compatibility modules, developer tooling, and obsolete/legacy foundations. It must not be bulk-moved by path.

## Truth and dependency classification

- **INTELLIGENCE OWNER:** capability definitions, policy, model-tier selection, output validation, evidence, inferred learning signals, AI interaction telemetry, proposal lifecycle, reasoning, ranking, planning and tool orchestration.
- **INTELLIGENCE INFRASTRUCTURE:** provider routing, Edge transport and Web adapters around Intelligence-owned persistence.
- **DOMAIN ADAPTER:** context aggregation and tools that read `trip.v1`, `places.v1`, `identity.v1`, Media or Booking projections.
- **DOMAIN OWNER:** final Trip, Places, Booking, Media, Identity, Social and Journey/Timeline truth and mutations.
- **EXPERIENCE CONSUMER:** dashboard, modal and visual state; these surfaces own no Intelligence or foreign Domain truth.
- **LEGACY/OBSOLETE:** historical kernel, diagnostics and data-layer generations not proven reachable from the current app shell.

Timeline/Journey is a reserved cross-domain aggregator. It is not reclassified as an ordinary Intelligence consumer and is not moved into Intelligence. Intelligence may read a Journey projection and create a proposal; only the eventual Journey/Timeline owner command may mutate that truth.

## Bundled first mutation scope

1. Establish a browserless `core/intelligence/intelligence-domain-contract-core.js` with canonical capabilities, domains, tools, model tiers, policy/sanitization, output validation, memory-signal and proposal state semantics.
2. Activate the additive Web compatibility facade `LuviaIntelligenceContractV1` in `core/platform/intelligence-contract-adapter.js`.
3. Make the existing capability, domain, model-router, policy and output-validator Web modules delegate their shared rules to the browserless owner core.
4. Expose sanitized reads, reasoning execution and proposal creation only. Foreign-domain execution remains outside `intelligence.v1`.
5. Migrate visible AI dashboard access from private Trip context and `LuviaAI` to `trip.v1` and `intelligence.v1`.
6. Add an Intelligence Transparency surface showing capability, source-contract, model-tier, memory/proposal and confirmation policy without exposing prompts, tokens or private raw context.
7. Add browserless, adapter, integration and product guardrails and include the focused exit guard in controlled Safe Regression.

## Explicit non-scope

- no database migration, table/RPC/RLS/bucket mutation;
- no Edge Function or secret mutation;
- no broad move of `core/ai`, `core/recommendations`, `core/planning`, `core/discovery` or `intelligence/`;
- no direct final write to Trip, Places, Booking, Media, Identity, Social or Journey/Timeline truth;
- no replacement of server-authoritative model routing;
- no exposure of provider prompts, credentials, raw private context or inferred-signal payloads in diagnostics;
- no retroactive rewrite of the historical NFR-0 debt snapshot;
- no claim that every browser dependency in the measured Intelligence estate is removed by this foundation block.

## Native First rule

The physical owner core must contain no `window`, `document`, `navigator`, browser storage, browser navigation, Supabase, DB, network or device dependency. Web, iOS and Android bind the same capability/policy/state rules through platform/runtime adapters and public Domain projections.

## Rollout and rollback

The rollout is additive: Platform adapter scaffold → Intelligence owner core and consumer adoption → Platform runtime registration/release. The adapter performs no provider lookup at load time, so the intermediate commit remains safe.

Rollback is code-only: remove the owner core, adapter, delegation and transparency surface, then restore the previous runtime loader/cache metadata. No canonical DB data or cloud configuration rollback is required.

## Commit and release evidence

- source lock / previous closeout: `b091d09a4b23b41b9c766d2e33437a45dd5b4a04`;
- Platform contract scaffold: `211632d8a8675117d47652951d6bf2ab00ea9a52`;
- NFR-neutral Platform adapter repair: `6f481e3f17267058c17b183a79c6b368a7c5a133`;
- Intelligence owner-core and consumer feature: `89db1e20584004a60282725ed59f65e20d9024e2`;
- initial runtime candidate: `78ceb7f3754c6de4a45595874206796671f6f0af`, App/Core `13.82.24 / 4.82.24`;
- final runtime release and Preview repair: `240968cd81d13610fa24a7c79892415df0871067`, App/Core `13.82.25 / 4.82.25`.

The first Integration Preview exposed a real UI acceptance failure: App-Shell event handling could intercept the bubble-phase Dashboard action listener, so the rendered Chat and Intelligence Transparency controls did not open. The candidate was stopped before `main`. The final release uses capture-phase delegation, adds a regression assertion for that integration condition and was re-run through the complete release path. No failed candidate was promoted to Production.

## Measured acceptance

- focused Intelligence validation: **17/17 PASS**;
- NFR-0 Foundation: **3/3 PASS**, including browser-global guardrail and browserless smoke;
- controlled Safe Regression on Platform, Integration and Main: **49/49 PASS**;
- release consistency: App/Core **13.82.25 / 4.82.25 PASS**;
- Integration Preview version: `e9b2bf20-9b71-48c4-8648-63a78c82f3e3`, alias `integration`, `has_preview=true`;
- Integration Preview: **21/21 byte-exact changed runtime assets**, **25/25 authenticated F5**, active Trip retained, Intelligence Transparency UI PASS, **0** console warnings/errors;
- Production version: `af037f55-89b6-48a8-a441-7c747d08064a` at **100%**;
- Production deployment: `60c76d81-c96b-4528-b5e6-fc7dfecc09f4`;
- Production: **21/21 byte-exact changed runtime assets**, **25/25 authenticated F5**, active Trip retained, Intelligence Transparency UI PASS, **0** console warnings/errors.

Remote byte provenance compares HTTP response bytes with Git blobs, not CRLF-normalized working-copy bytes. All changed runtime assets matched commit `240968cd81d13610fa24a7c79892415df0871067` exactly.

## Residual scope and exit decision

M8.5 closes the Intelligence contract foundation, not every historical AI/Planning/Discovery implementation. Provider transport, Intelligence-owned persistence, remaining legacy/browser-bound services and the eventual Journey/Timeline owner boundary remain explicit later slices. Existing direct proposal execution internals are transitional and are not exposed as foreign-domain mutation authority by `intelligence.v1`.

No database migration, schema/RPC/RLS/bucket mutation, Edge Function change, secret change, manual Cloudflare configuration change or foreign-domain truth move occurred. Rollback can select the previous Production version `e149aa86-a512-4083-9d18-08dc174d1860` and revert the code release; no canonical data rollback is needed.

M8.5 is **COMPLETE / CLOSED / PRODUCTION VERIFIED**. The next Intelligence slice must begin from a fresh measured residual-debt and owner-boundary lock rather than treating the mixed legacy roots as already isolated.
