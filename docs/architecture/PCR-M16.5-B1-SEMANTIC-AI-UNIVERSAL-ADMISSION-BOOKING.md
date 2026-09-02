# PCR M16.5 B1 — Semantic AI and universal admission booking

Status: accepted for implementation on `integration`

## Problem

The AI could route a complete sentence such as “Ich will eine andere Reise auswählen” to Places because a deterministic fallback over-weighted isolated verbs and nouns. Booking affordances were additionally limited to gastronomic places, so attractions, culture, activities and events could neither expose a truthful admission notice nor enter the existing Booking Owner flow.

## Owner decision

- `core/intelligence/` owns semantic intent interpretation and clarification.
- `core/booking/` remains the single owner for booking, reservation and admission-routing truth.
- `booking.v1` remains the only public booking adapter. The change is additive; no second Booking Core or consumer-owned booking policy is introduced.
- Places, Journey/Timeline and AI Chat remain light consumers. They render the Booking Owner decision and invoke only its public command.

## Contract changes

1. Add the browserless `booking.admission.v1` component inside the Booking Core. It classifies the visit kind, evaluates explicit admission evidence, ranks safe provider/direct/email routes, and returns immutable user-facing notice/action metadata.
2. Extend `booking.v1.reads` with `resolveAdmission(place)` and `admissionProviderCatalog()`.
3. Add canonical AI action `booking.place.open`; retain `booking.restaurant.open` as a compatibility alias.
4. Let confident structured model output win over the deterministic language fallback. Low-confidence or conflicting model output becomes a clarification, never an invented owner route.
5. Add browserless `booking.lifecycle-policy.v1`. It determines whether manage,
   modify, cancel, message and status refresh are genuinely available from the
   connected provider capability, verified email thread/contact path, external
   handoff or terminal status.
6. External ticket/reservation navigation must first create or reuse a normal
   Booking record and record the exact safe HTTPS handoff. It remains
   unconfirmed until provider/message evidence returns.
7. Add browserless `booking.live-stay-search.v1`, public
   `booking.v1.reads.searchStayOffers` and typed AI read
   `booking.stay.search`. Structured semantic entities carry destination,
   dates, occupancy, rooms and provider identifiers; raw text is not a
   provider command.
8. Add one authenticated aggregate Hotel search function plus separate
   Amadeus/Hotelbeds provider adapters. The aggregate function may invoke only
   providers whose capability, connection and activation state is ready.
9. Add service-only Hotel search/snapshot evidence and a readiness view. RLS is
   deny-default for normal clients; no raw prompt, secret or exact device
   location is persisted.
10. Resolve every external URL or verified-email handoff through the Booking
    route owner. First gate the requested action by Place kind; then require an
    exact selected venue/property identity proof from provider place ID,
    normalized name/address or a provider-specific property/product identifier.
    Cache identity is Place- and route-specific and is invalidated when either
    changes.

## Evidence and safety rules

- Place type alone may make admission relevant, but never proves that a ticket or reservation is required.
- `reservable=true` means supported, not required.
- A ticket or booking URL means a route is available, not that entry is mandatory.
- Lodging never inherits ticket/admission actions, and nightlife/activity is not
  recast as restaurant merely because a reservation route may exist.
- HTTPS validity, a corporate domain or partial name overlap does not prove the
  selected venue/property. Generic corporate pages, sibling properties,
  cross-venue targets and weak Hotel-name matches fail closed.
- “required”, “recommended”, “free” and timed-entry statements require explicit provider or official-place evidence.
- A public booking email is usable only when it is structurally valid and explicitly marked public and verified with a source URL.
- Provider API routes are exposed as connected only when a real configured connection exists. Partner-gated catalogs are discovery metadata until credentials and commercial access exist.
- Opening the owner flow does not send, reserve, purchase or mutate anything. Existing confirmation and receipt rules stay in force.
- An external link never implies provider chat, modification, cancellation or
  a confirmed booking. Free-form messages require an existing verified thread.
- A provider is `connected` only after contract entitlement, provider-specific
  transport, credentials, health, idempotency and reconciliation are proven.
- A Hotel price requires `source=provider_api`, `live=true`, matching stay/rate
  semantics, current evidence and a complete mandatory total. Affiliate links
  and unconnected providers contribute zero price evidence.
- One provider permits only a named single-source view. Cross-source comparison
  requires two successful live sources. “Best market price” is never claimed.

## Compatibility

- `booking.v1` keeps version `1` and all existing read/command names.
- Restaurant buttons continue to work through the new generic decision.
- The legacy `booking.restaurant.open` identifier remains an input-enforced
  compatibility alias that canonicalizes to `booking.place.open`; it is not a
  second runtime action and does not inflate the visible counters.
- Existing Booking, handoff, email-thread and mutation-fallback contracts are
  retained. Main, Production and secrets are unchanged. The separately
  authorized Hotel addendum is additive: two service-only evidence tables, one
  readiness view and three fail-closed Integration Edge functions. It does not
  modify existing reservation/message/provider evidence.

## Changed streams

- `core/intelligence/`: semantic-first interpretation and generic booking action.
- `core/booking/`: admission decision, provider catalog and engine discovery.
- `core/platform/booking-contract-adapter.js`: public read projection.
- `core/ai/`, `app/places/`, `app/journey/`: light notice and action consumers.
- `index.html`, `sw.js` and immutable runtime bundles: script registration and release version.

## Verification

- Browserless admission matrix: dining, attraction, culture, activity, event, free place, unknown place, official route, partner route and verified-email fallback.
- Semantic routing regression: trip-selection sentences must not reach Places; unknown wishes must clarify.
- Public-adapter projection test: raw contact data cannot cross the boundary.
- AI action compatibility and universal action tests.
- Consumer source tests and a visible browser fixture.
- Place-route identity tests must include the public cross-venue negatives and
  positive exact OpenTable/TheFork, activity ticket and Hotel-property routes.
- Controlled Hotel fixture at default and 390×844: two-source comparison and
  no-source fail-closed state, `TT.MM.JJJJ`, no overflow and no console errors.
- Static Edge/auth/secret-boundary tests, migration/rollback test and semantic
  Hotel route without dependence on one lexical keyword.
- Full relevant test suites, public Integration smoke, immutable/stable byte comparison and exact previous-version rollback proof.

## Booking lifecycle correction history

App/Core `13.82.140/4.82.140` reached Integration from commit
`89090dc149f0cce6e974683c0a2291206cbb848a` and passed public Booking Read/Open,
but was rejected when a fresh-chat Create sentence could not resolve `DAS LEO`
without a preceding Place card. The model had correctly selected Booking Create;
the defect was the runtime's subject source, not keyword recognition. No external
mutation occurred, and Stable was restored immediately to accepted `.139`.

The `.141` correction read bounded active-Trip Booking Owner projections and
merged them with known Place subjects before exact, ambiguity-safe target
resolution. Public Read/Open, fresh-chat Create and Cancel recognition passed,
but Modify displayed only the Booking name even though the exact new date and
time remained preserved in `preview.changes`. `.141` was rejected because the
user could not verify what would change; every confirmation was cancelled and
Stable returned to accepted `.139` without an external mutation.

The `.142` correction kept `.141` subject resolution and extended the shared
browserless consumer projection to render nested change values. Public Read,
Open and fresh-chat Create passed, but the exact Modify sentence failed twice:
the model returned new date/time as typed constraints rather than `timeWindow`,
and the compiler asked for the internal placeholder `booking change`. `.142`
was rejected and rolled back to `.139`; all previews were cancelled.

The `.143` correction normalizes structured temporal evidence from either form.
The permanent regression uses the public sentence and model shape, asserts the
exact Owner patch, and drives the visible 5/5 fixture to `Neues Datum` and `Neue
Uhrzeit`. Public Integration operation, byte proof and exact `.143 → .139`
rollback remain release gates.

Public operation of Stable `.139` then exposed a separate route-integrity
counterexample set: Hotel cards showed `Eintritt`/`Tickets prüfen`; a nightlife
reservation action opened an unrelated A-ROSA/Straubinger Hotel property; and a
partial Hotel-name match could pass as if it identified the selected property.
These are decisive failures because a safe-looking destination is still the
wrong destination.

The accepted `.143` slice adds two independent gates. The Place-Kind
gate decides whether lodging, dining or activity/nightlife can expose the
requested action. The route gate then requires exact venue/property identity
for every external URL and verified-email target and fails closed on generic,
sibling or cross-place destinations. Route cache reuse is bound to the selected
Place plus provider/address/source facts. The dedicated visible local integrity
fixture is **4/4 green** and focused identity/source/unit tests are green for the
concrete negative cases and exact provider/property positives. Edge
`booking-route-resolve` **2.7 is ACTIVE as remote version 13**, with JWT
verification and fail-closed origin/auth checks retained. Runtime commit
`11ff01ae`, Worker version `a8db9b4a-ace5-4144-b86c-db61d9586ccf`, 100% Stable
Integration traffic, 197/197 Safe Regression and 24/24 byte-identical changed
assets complete public `.143` Acceptance.

The signed-in public Hotel sentence is semantically recognized and returns an
honest provider-unavailable state. A compound sentence asking to find Lübeck
nightlife and check Tonfink reservation requirements still fails closed and
leaks internal missing-field labels. That is a separate next-slice semantic
counterexample; no external mutation or wrong handoff occurred.

## Rollout and rollback

The coherent Integration slice is public from commit
`090c8009bb63e52a45f91b4d4fdbb640e91f51c9`, clean archive SHA-256
`9B9DA25879BA41757FBB01662EE56E60A4C435758382ECD3C390D2DD5C6E77B2`,
Worker version `caf3e8bd-7f98-47fc-991c-135062732dad` and deployment
`b5c1f33e-dbda-4e09-901e-952b7cc47207`. Stable and Immutable match the archive
for 24/24 selected files and 6,003,200 bytes. The public signed-in Chat proves
the typed Berlin/date/occupancy Hotel read and truthful provider-unavailable
state at desktop and 390×844; it is not a positive live-provider proof.

An app-only semantic follow-up is accepted on App/Core `13.82.138/4.82.138`.
It preserves a compiled Trip `switch/select` operation and prevents the older
direct-navigation recognizer from closing the conversation. The signed-in
public 390×844 run of `Ich will eine andere Reise auswählen.` stayed in Chat,
returned nine real Trip-owner projections plus eight concrete selection
controls, asked for no date/time and performed no mutation. Its provenance is
runtime commit `3beb33f38909c1b82c0b6078e8aa0d88ba08616f`, clean archive SHA-256
`59EBC14CF89C6925C1BE9FA5E20EC72B01EBB180C1971F5AAF4A68A572A0341F`,
Worker version `e12ec944-a66e-4f77-9b18-9259f63fa46b` and deployment
`92b83529-6b0d-42ab-b1e0-83c8bb42628f`; 23/23 selected files / 6,340,606
bytes match archive, Stable and Immutable.

The immediate `.138` rollback is app-only and restores accepted `.136`:
`npx wrangler versions deploy caf3e8bd-7f98-47fc-991c-135062732dad@100 --name integration-luvia --message "Rollback M16.5 B1 App 13.82.138 to accepted App 13.82.136" --yes`.
Rejected `.137` is not a rollback target. No DB or Edge compensation belongs to
the `.138` rollback.

If the complete `.136` Booking/Hotel foundation must also be removed, its code
rollback restores accepted App `13.82.135` / Worker version
`d4efd8ac-969c-426c-b312-7ea686740ac1`. Full additive backend compensation then
runs the Hotel live-offer rollback followed by the universal Booking rollback.
Neither rollback deletes existing Booking, message, reservation or conversion
evidence.

## Accepted semantic Places-mutation follow-up — App/Core 13.82.139/4.82.139

The next app-only slice completes the four registered Places mutation paths
without changing the Booking, Provider, DB, RLS, Secret or Edge boundaries in
this PCR. Structured sentence meaning plus an exact Chat/Owner subject resolves
`places.place.favorite`, `places.place.unfavorite`, `places.place.plan` or
`places.place.unplan`. Interpretation alone never mutates. Confirmation invokes
the existing public Owner, and an independent `places.v1.reads.listSaved` or
`journey.v1.reads.snapshot` reconciliation is required before success. A
contradictory readback becomes `outcome_unknown` and blocks blind retry.

The signed-in Stable test publicly removed and restored one exact Journey entry
at `12.06.2027`, `17:50 Uhr`, and separately favorited/unfavorited one real
Foursquare Place. The canonical action registry therefore promotes only those
four rows, for seven total public passes. The observed loss of conversational
Place subjects after switching surfaces remains explicit counterevidence and a
following semantic-context hydration requirement.

Provenance is runtime commit `e2a1d39c59c39ea84c0652e2b4cc1b785678a6b0`,
archive SHA-256 `2E605A191E3D0A8296B125BC6874C099EAFDCD2857D38C2F05B52D2E65E7B118`,
Worker version `df146bb6-52dc-4c82-8ab2-d4a6618839db`, and 26/26 selected files /
6,572,893 bytes identical across archive, Stable and Immutable. The exact
app-only rollback restores `.138`:
`npx wrangler versions deploy e12ec944-a66e-4f77-9b18-9259f63fa46b@100 --name integration-luvia --message "Rollback M16.5 B1 App 13.82.139 to accepted App 13.82.138" --yes`.

## Accepted semantic Booking lifecycle and route integrity — App/Core 13.82.143/4.82.143

The next Integration-only slice extends the existing Booking Core rather than
creating a second booking system. `booking.reservation.create` now delegates to
`booking.v1 commands.submitReservation`; the Owner distinguishes connected
provider API, verified public booking e-mail, external handoff and unavailable
route without claiming that a draft row was externally submitted.

Whole-sentence structured semantics resolve Create, Modify and Cancel against
one exact Place or active Booking Owner object. Dates and times may be supplied
through a structured `timeWindow` or individual typed constraints; both produce
the same normalized temporal hint. Read cards expose only actions allowed by the
browserless lifecycle policy. All writes retain Preview,
explicit confirmation, idempotency, Owner Receipt and unknown-outcome
reconciliation. A local 390 px five-action fixture proves Read, Open, Create,
Modify and Cancel with `TT.MM.JJJJ`. The shared consumer projection now reads
the exact nested Modify patch and visibly labels the new date/time; the fixture
uses these real Runtime values rather than fixed demonstration copy. Provider-
positive public evidence remains a separate release gate and is not inferred
from the local controlled transport matrix.

The binding continuation is: prove real Restaurant and Activity provider routes
while repairing the Tonfink compound sentence; add canonical Hotel property and
selected-offer identity; build the bright Demo-design Hotel surface over the
existing Booking Owner; activate Hotel/Affiliate providers; close P09/P10;
finish the remaining Step-17 rows; then execute Blocks 2–5 in order.

## Visible Hotel consumer debt

The Hotel owner, provider boundary and fail-closed price decision are technical
foundation only. The currently reachable Hotel page still uses the retired
turquoise, form-heavy, long stacked-card layout and is not a visually accepted
product slice. Before live Hotel provider activation is accepted, it must be
replaced by a bright Demo-design consumer over the same Booking Owner: compact
search, three explainable decision lanes, readable offer cards, complete total/
flexibility/breakfast evidence, one primary action, concise Chat projection and
desktop/mobile/keyboard/reduced-motion Step-17 evidence. No legacy Hotel UI may
be described as complete merely because the owner core exists.
