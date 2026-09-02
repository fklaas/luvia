<!-- LUVIA:M5.4.1:CLOSEOUT:START -->
## M5.4.1 – Active Foreign Trip Truth Isolation / Destination Service

**Status:** COMPLETE / CLOSED
**Closeout:** 2026-08-21
**Runtime App / Core:** 13.82.12 / 4.82.12
**Runtime source commit:** `c36a68b9a7abfca5f3d804dac98f96b72148a7ba`
**Previous closeout marker:** `c0ea48f7aeffc7df5ffb0b137cec21e31d0dfd47`

M5.4.1 isolates the active Destination Service from private Trip Truth access. `intelligence/destination-service.js` now reads and subscribes through the public Trip Contract and persists resolved destination state through the Trip-owned `applyResolvedDestination` command boundary.

TripStore remains the sole Trip Truth. The owner command preserves the existing local/offline canonical write semantics with one TripStore upsert and does not route through `TripExperience.update` or introduce `luvia_save_trip_profile`.

Integration preview, Main promotion, Production static byte provenance and authenticated browser/F5 acceptance are PASS. Safe Regression is 35/35 PASS.

No App/Core version bump was required. No DB migration, Edge Function change, Secret change or manual Cloudflare change was required.

M5 remains IN PROGRESS. M5.4 continues with the remaining active runtime/global Trip dependency reduction.
<!-- LUVIA:M5.4.1:CLOSEOUT:END -->

# CURRENT BUILD

- App: **13.82.167**
- Core: **4.82.167**
- Name: **M16.5 Places Hotel Recovery**
- Channel: **integration-preview**
- Datum: **2026-09-02**
- Milestone Status: **M5 COMPLETE / CLOSED; M6 COMPLETE / CLOSED; M7 COMPLETE / CLOSED; M8 COMPLETE / CLOSED; M8.5 COMPLETE / CLOSED / PRODUCTION VERIFIED; M9 COMPLETE / CLOSED / PRODUCTION VERIFIED; M10 COMPLETE / CLOSED / PRODUCTION VERIFIED; M10.5 COMPLETE / CLOSED / PRODUCTION VERIFIED; M11 COMPLETE / CLOSED / PRODUCTION VERIFIED; M12 COMPLETE / CLOSED / PRODUCTION VERIFIED; M13 COMPLETE / CLOSED / PRODUCTION VERIFIED; M14 COMPLETE / CLOSED / PRODUCTION VERIFIED; M15 COMPLETE / CLOSED / PRODUCTION VERIFIED; M16 COMPLETE / CLOSED / PRODUCTION VERIFIED; M16.5 BINDING VISUAL PARITY LOCK ACTIVE / PRODUCTIVE ADOPTION IN PROGRESS / DESIGN FREEZE PENDING**
- Parallel Development Status: **TWENTY-STREAM CORE-ALIGNED FOUNDATION COMPLETE**

## M16.5 Preview Morph + Hotel Map Parity — Integration candidate 13.82.167

- Two-step map interaction: **tapping a pin now selects only that exact provider Place, raises its visual priority and shows the full-spectrum compact preview. It no longer opens the large result sheet immediately. Tapping that preview is the explicit second step into the exact one-Place sheet**.
- Direct manipulation: **the preview owns a real pointer gesture from its first upward pixel. Pointer-down freezes only identity and geometry so a simple tap is never swallowed by premature modal isolation; the first upward movement creates the owner-backed result sheet and grows it from the exact compact-preview rectangle left and right to the full map width, downward to the map edge and upward with the finger. Explicit pixel geometry replaces breakpoint-dependent jumps; release past the forgiving distance or velocity threshold settles it open, while a short cancelled drag returns it without a write. Reduced-motion users retain the same interaction without decorative transitions**.
- Selected-state motion: **the current pin is larger, receives a white separation ring plus an animated full-Compass halo, and remains programmatically pressed. The preview floats independently; its three visible line-only chevrons rise in a fixed top-to-bottom 120 ms stagger, retain contrast over light map tiles and pause while the user drags. On narrow screens the preview clears the persistent bottom navigation**.
- Viewport-race protection: **the visible preview carries and freezes the complete provider Place snapshot at pointer-down. A simultaneous background viewport refresh can therefore neither exchange the touched Place nor open a different sheet. `.167` supersedes the intermediate `.163`–`.166` local candidates with a new App, Core, Service Worker and asset-cache identity**.
- Hotel parity: **Planen → Hotels now uses the same continuously mounted geographic renderer, twelve-tone Compass pins, enlarged selected state, `Alle / Passend`, locked `← x/xx →` navigation, compact Search/Type/Filter/Legend controls, provider-image preview, three staggered chevrons and exact-snapshot tap/drag sheet transition as Places. Panning and zooming use the same live viewport contract; one pin stages only one preview and never opens all hotels**.
- Preference recovery: **a Profile vegetarian/vegan requirement now constrains the initial and viewport provider reads automatically, not only after a manual filter selection. `traveling_with_children` and `baby` remain strong ranking context instead of becoming impossible universal admission gates; an explicit stroller requirement remains hard and fail-closed. Google `goodForChildren`, `goodForGroups` and `menuForChildren` fields are normalized for evidence-aware family ranking**.
- Release gate: **fresh `.167` runtime bundles, generated visual/action inventories, the 330-row parity matrix, NFR-0 3/3 and the complete controlled Safe Regression are 201/201 PASS. Local 390 × 844 real-pointer proof covers Places and Hotels: one Pin stages one exact image preview, preview tap morphs open, and upward drag settles the same provider entity. Clean Integration-only deployment and public confirmation remain; Main and Production stay locked**.

## M16.5 Hierarchical Multi-filter Map Controls — Local Integration candidate 13.82.161

- One unified map bar: **`Alle / Passend`, locked `← 1/xx →` pin navigation and the Search, Category, Filter and Legend icons remain in one quiet translucent bar between native zoom and the map's right edge. No second toolbar or external Places controls return**.
- Search correction: **the map search is a single non-wrapping field, starts empty for a category-led search and never copies `Restaurants, Cafés, Bars` into the visible input. The chosen canonical category still constrains the owner request. The redundant shell-dependent `.sr-only` element is removed; the native field owns its accessible name**.
- Hierarchical factual filters: **the compact right panel initially shows only `Art`, `Landesküche`, `Merkmale`, `Preisniveau` and `Sortierung`. Selecting a heading softly replaces that list with its values and a return action. Restaurant types and cuisines are substantially expanded; multiple values can be selected within a group, while distinct groups combine. Selected cuisine/type, provider facts and price levels participate in both the existing pins and subsequent Google-primary requests**.
- Preference conjunction: **filtered retrieval carries the active vegetarian or vegan Profile requirement into the cuisine-aware query and then reruns the same evidence-backed ranking. A selected Italian cuisine therefore searches for vegetarian Italian evidence instead of discarding the dietary requirement. The hard dietary gate remains fail-closed: category alone never fabricates suitability, meat-led counterevidence cannot become `Passend`, and unverified places remain available only under `Alle`**.
- Compact dismissal and map continuity: **every small panel has an `×`; tapping the free map closes it as well. Filter values update the mounted marker set immediately, while a debounced owner refresh replaces the marker data without destroying the visible map. Category and filter panels are height-bounded above the bottom navigation and scroll internally**.
- Release gate: **fresh runtime bundles, generated visual/action inventories, the 330-row parity matrix, NFR-0 3/3 and the complete controlled Safe Regression 201/201 are PASS. Clean Integration-only deployment and public narrow-screen interaction proof remain required. Main and Production remain locked**.

## M16.5 Compact Map-native Places Filters — Superseded Integration candidate 13.82.160

- Public counterevidence and correction: **public `.159` proved the map-native tool dock and all three working overlays, but the mobile filter's inherited expanding flex rows produced a large white area over the map. `.160` replaces that inherited layout with a content-sized one-column grid, removes row growth and keeps every factual choice in compact wrapping chips. Search, categories and legend retain their accepted map-native behavior**.
- Unified control bar: **`Alle / Passend`, locked `← 1/xx →` pin navigation and the Search, Category, Filter and Legend icons now share one quiet translucent bar between the native zoom control and the map's right edge. No second control bar remains**.
- Minimal overlays: **Search is one understated search field that submits with Enter. Categories and evidence-backed filters are small text-only lists without icons, checks, chip borders or card backgrounds; selection is communicated only by trip-colour type weight and a fine underline. The narrow panel fades in from the right over a lightly translucent surface**.
- Release gate: **fresh `.160` runtime bundles, focused layout/version gates, NFR-0 3/3 and the complete controlled Safe Regression 201/201 are PASS. Clean Integration-only deployment and repeated public mobile interaction proof remain required. Main and Production remain locked**.

## M16.5 Map-native Places Discovery Controls — Rejected Integration candidate 13.82.159

- Map-first composition: **the oversized `Entdecken, verstehen und bewusst einplanen` context card, full-width search row, external filter drawer, preference container and external category rail are removed from the productive Places render. Outside the map only the requested discovery heading, one small evidence/Booking line and the compact Luvia entry remain**.
- Native map tools: **four compact controls at the map's upper-right edge open Search, Category and evidence-backed Filter popovers directly over the continuously mounted map; the fourth exposes the ranking legend on hover and keyboard focus. Each popover uses compact responsive typography, active-Trip colour tokens and real pressed states. Opening or closing a tool does not remount or grey the map**.
- Map scale and continuity: **the map now owns roughly three quarters of the available small-screen height, while `Alle / Passend`, locked previous/next navigation, the full-spectrum selected-Place preview and the click-history remain intact. Category and query changes still use the Places owner read; factual filter changes update the mounted pins without a new map instance**.
- Superseded candidate: **the viewport evidence continuity correction from `.158` is included unchanged. Focused gates, release consistency, NFR-0 3/3 and the complete controlled Safe Regression are 201/201 PASS. Public operation proved all map tools but rejected the mobile filter geometry because it covered too much of the map; `.160` contains the corrective layout. Main and Production remain locked**.

## M16.5 Viewport Preference Continuity — Local Integration candidate 13.82.158

- Corrected viewport identity continuity: **a live map refresh can return a lean provider projection for a Place that the broader discovery response already verified. Luvia now merges the richer known preference and provider facts by immutable provider Place ID before ranking the refreshed viewport. This keeps the reported `Passend` cohort, visible preferred Pins and `x/xx` navigation aligned instead of showing a positive match count with an empty map**.
- Hard-gate continuity: **the merge cannot promote a new or unrelated Place. New viewport Places are still evaluated from their own provider facts; unknown hard dietary evidence remains in `Alle` and outside `Passend`, while an already verified identical Place does not lose its evidence merely because the viewport endpoint returned fewer fields**.
- Release gate: **public `.157` testing found the empty-`Passend` viewport regression after the hard gate had correctly narrowed the result set. `.158` supersedes that Integration candidate; focused continuity tests, fresh runtime bundles, release consistency, NFR-0 3/3 and the complete controlled Safe Regression are 201/201 PASS. Clean release, Integration-only deployment and public proof remain required. Main and Production remain locked**.

## M16.5 Hard Preference Gate + Compass Preview — Superseded Integration candidate 13.82.157

- Hard requirement order: **`Passend` now applies every applicable hard Profile requirement before any soft preference score. A Place with unknown dietary, accessibility or family evidence remains available in `Alle`, but cannot receive a `Passt` marker or enter the `Passend` pin set. Confirmed conflicts remain blocked by Intelligence**.
- Vegetarian evidence: **a positive Google/provider `servesVegetarianFood` fact continues to admit an ordinary mixed-menu restaurant. A recognizably meat-led primary offer such as kebab/döner, steak, barbecue/grill, burger or Greek cuisine no longer becomes personally fitting from that single generic option flag; it requires explicit vegetarian/vegan offer focus in the provider category, name or description. An explicitly vegetarian/vegan concept remains eligible regardless of cuisine format**.
- Ranking boundary: **soft signals such as family context, waterfront, quiet atmosphere, rating, distance or trip feeling can rank only after the hard gate passes. They can never compensate for an unknown or contradicted dietary requirement**.
- UI: **the full-width selected-pin preview at the bottom of the map uses a two-pixel conic border that traverses the complete ordered Luvia Compass spectrum from coral through amber, green, teal, blue and violet back to coral. The existing responsive preview grid, provider image and selected Place identity remain unchanged**.
- Truth boundary: **no cuisine, dish or dietary suitability is invented. `Alle` remains the complete bounded provider set; `Passend` is deliberately fail-closed on hard Profile requirements. Official-site/menu research remains a separate evidence capability and is not claimed by this App-only candidate**.
- Release gate: **focused shared-Intelligence, verified-dietary and productive spatial tests pass; fresh runtime bundles are built and the complete controlled Safe Regression is 201/201 PASS. Clean release, Integration-only deployment and public authenticated proof remain required. Main and Production remain locked**.

## M16.5 Preference Evidence Breadth — Local Integration candidate 13.82.156

- Corrected `Passend` contract: **the UI no longer truncates personally fitting Places to five results or requires every match to sit within five points of the current best candidate. Every coordinate-qualified Place with positive provider-backed preference evidence remains in the matching cohort. Missing evidence remains an explicit unknown and is never treated as a conflict; only an evidenced contradiction can block a candidate**.
- Broader discovery: **the fast Google-primary result remains visible immediately, while every search now starts a non-blocking deep pass with up to five query variants and 60 unique candidates. A full first page can no longer suppress this evidence pass**.
- Preference-aware retrieval: **confirmed dietary, accessibility and family requirements plus positive quiet, local and scenic weights produce targeted restaurant searches. AI search plans are placed ahead of generic fallback variants instead of being starved by them, and the deterministic fallback reads the same profile projection**.
- Truth boundary: **Google/provider types, service features, editorial facts and real candidate identity remain the evidence base. The AI may search within and rank that supplied evidence but may not invent cuisine, dietary suitability, atmosphere or accessibility. Official-site/menu crawling is a separate provider-owned evidence capability and is not claimed by this App-only candidate**.
- Release gate: **focused preference, strict Restaurant, unified sheet and productive spatial tests pass; fresh runtime bundles are built and the complete controlled Safe Regression is 201/201 PASS. Clean Integration release, public mobile proof and immutable byte proof remain required before acceptance. Main and Production remain locked**.

## M16.5 Map Navigation + Booking Submit Boundary — Local Integration candidate 13.82.155

- Compass-map correction: **both productive marker paths now rotate through twelve tones from the complete Luvia Compass spectrum instead of collapsing to one trip colour. `Passend` uses exactly the same relative, evidence-backed cohort as the visible `Passt` markers: at most five coordinate-qualified Places within five score points of the best result. The active mode is reapplied to every new viewport response before its atomic marker replacement, so its pressed state, `x/xx` count and visible pins remain aligned**.
- Locked browsing and selected-pin preview: **previous/next navigation now stays inside the currently loaded pin set and never moves the camera or changes `x/xx`; only a deliberate traveler pan/zoom requests and adopts a new viewport count. The former large `Auf der Karte … Orte` box is removed. A full-width compact preview at the bottom of the map shows the exact selected Place name and its exact provider-card image, with provider hydration keyed by the selected Place ID**.
- Timeline and route latency: **a Timeline conflict no longer leaves an inert button or writes into a hidden scheduler. The action remains clickable and reports the exact conflict in the visible action region; valid submissions still go through the Places/Journey owner boundary. Exact selected-Place route resolution begins before preference/photo enrichment and is reused on click, while an external route is exposed as a named in-sheet provider button requiring a fresh deliberate click**.
- Public counterevidence on `.152`: **the exact Google Place `DAS LEO`, Strandallee 99a in Scharbeutz, opened as one correct Restaurant sheet with its real image and staged `Details`, `Reservierung prüfen` and `Zur Timeline` actions. Selecting `Reservierung prüfen` appeared to do nothing when the provisional 10:00 slot collided with an existing Timeline moment, because the error was written only into the deliberately hidden legacy scheduler region**.
- Corrected interaction: **Booking progress and failures now use a compact visible live region directly below the staged actions. Opening `Reservierung prüfen` performs no Places or Timeline mutation. A Timeline entry is created only after the embedded verified-email form has actually been submitted, using the date and time from that form and retaining `requested` until Booking-owner evidence changes the status. External provider handoffs do not invent a completed submission or Timeline entry**.
- Blank-window and Core boundary: **the consumer no longer reserves a temporary browser tab while the Booking Core resolves the exact venue. Public `.153` proved that opening an asynchronously resolved provider immediately can still be rejected by the mobile popup blocker; `.154` therefore reveals a named provider button in the existing sheet and opens the exact route only on that deliberate second click. OpenTable, TheFork and the remaining adapters stay available only when the exact selected venue has an identity-verified route; otherwise the result is honestly unavailable. The verified-email Luvia form remains embedded in the existing sheet**.
- Map and detail correction: **the active-trip colour now owns Pins and staged actions; Places adds compact `Alle / Passend`, previous/next and `1/xx` map controls. The exact one-entity sheet has its own previous/next counter. Filters, preference context and category rail are compact horizontal controls. The provider-detail sheet uses a layer above the first sheet instead of the defective low fixed z-index**.
- Superseded `.154` Integration deployment: **the first `.154` deploy command was accidentally launched from the parent Temp directory and briefly uploaded unrelated static assets to the Integration worker only as version `54c1aad5-06aa-4ed4-b74e-4fecccfe56b5`. It was immediately superseded from the exact clean `.154` release directory by version `80f693b6-faef-43d6-8005-591364c6f96c`. No Main, Production, database, Edge Function, provider secret or user data was changed**.
- Current gate: **focused Place-detail, unified Journey sheet, explicit external-handoff, Booking route, lifecycle, admission and exact `Passend` filtering tests pass. Fresh `.155` bundles are built; generated inventories, the complete controlled Safe Regression, clean release commit, Integration deployment, operated mobile map proof, byte proof and exact rollback remain required before acceptance**.

## M16.5 Contextual Maps + Clean Place Detail — Stable Integration accepted 13.82.152

- Acceptance status: **ACCEPTED ON STABLE INTEGRATION. Integration-only; Main and Production remain locked. Public `.151` validated the real map, exact single-entity sheet, provider image and layered details, then was superseded because its absolute fit threshold could leave every preference pin unmarked. `.152` replaces that absolute threshold with a bounded, evidence-positive relative marker policy and visibly marks the strongest matching pins without hiding the rest**.
- Map product contract: **Places and Hotels keep one uninterrupted MapLibre canvas, update their complete bounded provider pin set after pan/zoom and open exactly one selected entity. Search-result lists remain absent; a compact six-item click history is the only region below the map**.
- Categories and filters: **accommodations are removed from Places because Hotels owns lodging. Places adds Freizeitparks, Einkaufszentren, Wellness and Wassererlebnisse. Contextual filters and Hotel filters project only fields backed by provider evidence; up to five relatively strongest pins with positive preference coverage and explicit reasons receive the visible `Passt` mark, while every other returned place remains on the map**.
- Clean Pin Sheet: **the selected Place or Hotel first appears as a calm image-led card. Details, Booking/Reservierung and Timeline actions enter softly after the first paint; date, time, party-size and room forms are not shown in the initial sheet. Missing provider photos use an explicit neutral fallback and never a synthetic or unrelated image**.
- Detail layering: **Details opens a second Bottom Sheet over the selected entity with provider-backed category, cuisine, price level, rating, opening hours, service, payment, accessibility, address, phone, Route, Website and menu links. Unknown fields remain absent**.
- Booking and Timeline: **starting a booking or reservation first creates an explicitly unconfirmed Journey entry. Booking remains the sole lifecycle owner; provider/API/e-mail replies project confirmed, cancelled, declined, change-requested and still-pending states back onto the Timeline without copying Booking truth into Places**.
- Legacy removal: **the retired Hotel `LuviaPlaceDetail` route and its immediate check-in/check-out/guest/room form are physically removed from the active Hotel consumer**.
- Provider truth: **live room-price comparison remains fail-closed until an approved connected stay provider supplies exact property, dates, occupancy, total price, currency and a fresh quote. No Place price level or affiliate handoff is represented as a room price**.
- Automated evidence: **focused map, exact-selection, clean-detail, Booking-lifecycle, Hotel-owner, Places-category and relative-preference gates are green. The complete controlled Safe Regression is 201/201 PASS; NFR-0 is 3/3 PASS; action parity, generated runtime bundles, release consistency and drift checks are green**.
- Operated mobile evidence: **at 390 × 844 px, public `.152` rendered 29 Google-primary Restaurant pins, three visible evidence-positive `Passt` pins, all 13 non-lodging Places categories, the contextual Restaurant filter, click history and a one-pin/one-entity sheet without horizontal overflow. Switching to Freizeitparks changed the filter contract and returned a real coordinate-qualified marker. The exact sheet loaded a real provider photo, initially showed no form and then softly revealed Details, Reservierung prüfen and Timeline; Details opened a stable second sheet. The Hotel surface previously exercised on the same functional code rendered more than 40 real pins, the same exact-entity sheet and its Hotel-specific actions**.
- Continuous-map evidence: **zooming the public `.152` map retained one live MapLibre canvas at opacity `1` immediately and after the viewport refresh. The map never returned to a grey loading shell; the previous visible pin set remained available until an atomic replacement could be committed**.
- Release provenance: **runtime commit `7bd84d1ee73e75caea90c69cebee1cedcb39e904`; clean archive `C:\Users\fabia\AppData\Local\Temp\luvia-integration-13.82.152-7bd84d1e.zip`, SHA-256 `2F930F57EF5F20CA8BEDAC917C0A56AFA92DEFE2D71A1D74F6660639F1F58B5B`, 3,120 Git-archive files; Worker version `f8af3dd5-9ef5-41e4-b7ee-77773909ad3c` receives 100% Stable Integration traffic. Twelve release-critical assets are SHA-256-identical between the clean release tree and Stable Integration**.
- Rollback and scope: **the immediate App-only rollback target is superseded `.151`, Worker version `22d08f77-b7cd-4316-a33a-468a6fa188ce`; it retains the accepted map, image, single-entity and detail-layer behavior but may show no preference marker. No DB, RLS, Edge Function, provider credential, shared secret, Main or Production change was part of `.152`**.
- Deliberate open boundaries: **Hotel live-rate comparison remains blocked by provider approval and credentials; no price is fabricated. Booking can create a pending Timeline projection and consume Booking-owned lifecycle state, but this acceptance did not claim a completed real Restaurant e-mail round-trip. Productive Event sourcing, event admission detection, ticket purchase and the remaining master-plan blocks remain open work**.

## M16.5 Continuous Place Map Refresh — Local Integration candidate 13.82.150

- Candidate status: **LOCAL RELEASE GATE OPEN. Public Stable currently serves the rejected `.149` build while `.150` completes its clean release gate; App/Core `13.82.147 / 4.82.147` remains the last accepted recovery baseline. Main and Production remain locked**.
- Continuous canvas: **pan/zoom refresh never changes an already rendered map back to `loading`, `empty` or `unavailable`. Tiles, camera and the previous pin set remain visible while the next bounded viewport result loads; zero results and transient provider/tile errors retain the active base map**.
- Atomic pins: **the complete replacement marker set is staged before the old set is removed. A newer camera movement invalidates an older in-flight response, the debounce is reduced from 420 ms to 180 ms and only a small non-blocking status pulse may indicate background work**.
- Global scope: **the contract is owned by the shared MapLibre projection and therefore applies to productive Places, Hotels, AI Places and the prepared AI Event map, with reduced-motion behavior retained**.
- Exact selection: **one pin represents one exact provider entity and opens a Bottom Sheet containing only that Place, Hotel, Restaurant, Activity, Culture or Event. A pin click cannot pass the complete result collection into the sheet**.
- Live viewport: **Places and Hotels now query the public `places.v1` contract again after a debounced map pan or zoom. The contract splits the visible bounds into four provider requests, accepts at most Google's 20 results per request, removes duplicate provider identities, rejects coordinates outside the requested bounds and retains up to 80 unique visible pins. Moving to a neighbouring area starts a new bounded viewport query; existing pins remain visible if that refresh fails**.
- Visibility and preference: **personal fit never filters the provider result set. Every eligible returned and coordinate-qualified result remains a pin; strong preference evidence may add a Compass marker to the pin. The UI does not claim that Google exposes an exhaustive global inventory beyond the results returned by its bounded API calls**.
- Shared consumers: **the same projection lifecycle is connected to productive Places, Hotels and the AI Places map. The Event map uses the same viewport hook, but no productive Event-source gateway exists yet, so Event breadth remains honestly unavailable rather than synthetic**.
- Provider order and Hotel truth: **each tile stays Google-primary with Foursquare as failure/empty fallback. Hotel discovery, live rate evidence and booking handoff remain separate; Duffel Stays and Booking.com Demand are application-pending and therefore cannot produce a live price or comparison claim**.
- Local release gate: **focused shared-map contracts are green. Fresh runtime bundles, the complete controlled Safe Regression, NFR0, patch hygiene, clean release commit, immutable Integration deployment, Stable/Immutable byte proof and operated desktop/mobile continuous-map acceptance remain required**.

## M16.5 Live Viewport Map Contract — Publicly deployed, rejected 13.82.149

- Deployment evidence: **runtime commit `56fd9b71` was uploaded as immutable Integration Worker version `aca26938-b43a-4f37-b802-ffd5fb805bb9` and received 100% Stable Integration traffic**.
- Retained correction: **one pin opens one exact entity; live viewport reads can return up to 80 unique coordinate-qualified pins, and personal relevance marks rather than hides provider results**.
- Decisive counterevidence: **during pan/zoom, the refresh incorrectly returned the shared map shell to `loading`. Its CSS hid the real MapLibre engine and exposed the grey fallback until the provider call settled; an empty refreshed viewport could hide it again as `empty`. This violates the always-visible map contract, so `.149` is not an acceptance or rollback target**.
- Correction: **`.150` separates first construction from background pin refresh and preserves the rendered map through loading, empty and transient-error outcomes**.

## M16.5 Product Reset Map + Hotel Provider Preparation — Publicly deployed, rejected 13.82.148

- Deployment evidence: **runtime commit `b1cf5a20a4f4912ca31fa8d4e2bfe89caab7674f` was uploaded as immutable Integration Worker version `4820c15d-bffe-4f4c-8d47-ccb8e5b272ae`. The candidate was rejected during public operation and Stable Integration was returned to App/Core `13.82.147 / 4.82.147`, Worker version `0c639544-b074-4633-a307-1b9d63ffa2d3`**.
- Decisive counterevidence: **selecting one map pin opened the complete collection of result cards instead of exactly one entity. This violates the map-only product contract even though the shared Bottom Sheet itself rendered**.
- Product reset: **the binding execution order retains all five 10-package blocks B1–B5 / P01–P50, but gates later breadth behind truthful provider state, one map language and the Golden Journey. Main and Production remain locked**.
- Map contract retained: **Places and Hotels are map-first. Productive results are represented by verified pins; selecting a pin must open only its exact shared bright Journey Bottom Sheet. A parallel result list and the legacy full-page Place detail are not accepted productive routes**.
- Hotel truth: **hotel discovery, live rate evidence and booking handoff remain separate capabilities. A price is shown only for the exact property, dates and occupancy returned by a connected source; Duffel Stays and Booking.com Demand remain application-pending and therefore cannot be presented as live**.
- Provider preparation: **Google remains the primary Place source and Foursquare the bounded fallback. The additive provider-registry migration was applied individually through the linked Management API, avoiding the defective broad migration ledger, and proves Duffel Stays as `application_pending / APPLICATION_PENDING` without adding a credential, fabricating availability or changing shared secrets**.
- Edge evidence: **`booking-provider-duffel-stays` v1, `booking-provider-connection-health` v7 and `booking-hotel-offer-search` v2 are ACTIVE with JWT verification retained. No unrelated Edge Function was deployed**.
- Rejection scope: **the additive provider-registry migration and the three bounded Edge deployments remain valid preparation, but `.148` is not an accepted App release and must not be used as a rollback target. The correction continues in `.149`; no Main or Production deployment occurred**.

## M16.5 Places + Hotel Recovery — Integration live, provider gate open 13.82.147

- Incident decision: **public App 13.82.146 is rejected. User-operated evidence showed an artificial AI clarification for a complete restaurant-search sentence, non-working Hotel details, unreadable card copy, Hotel ticket semantics, missing/slow media, misleading zero-result projections and a prior cross-venue booking handoff. These are product regressions, not cosmetic polish**.
- AI repair: **a relative date such as `heute` may conflict with the active Trip dates for a write that would change the Trip, but it no longer blocks a read-only Place search. The complete sentence `Finde uns heute ein ruhiges Restaurant am Wasser.` therefore compiles as a read and proceeds to Places instead of asking the user to decide again**.
- Exact Hotel identity: **Hotel card references now split only at the first UI namespace separator and preserve a full provider ID such as `fsq:…`. Detail, media and Booking resolution therefore receive the exact selected Place instead of the truncated value `fsq`. The Booking Owner remains fail-closed: no unrelated property, ticket flow or generic corporate URL may substitute for the selected Hotel**.
- Hotel experience: **Hotel cards isolate image and copy layers, use bounded visible-first media hydration, expose `Details`, `Verfügbarkeit` and `Merken`, and add the same shared verified-coordinate map projection as Places. Hotels never show `Eintritt` or `Tickets prüfen`. Without an exact booking route the UI reports that honestly rather than opening a foreign Hotel**.
- Places resilience: **one bounded request preserves the Google-first/Foursquare-fallback provider order. Foursquare is not queried in parallel with a healthy Google result, and deeper provider breadth runs only when the first pass supplies fewer than six verified results. Provider failure is displayed as unavailable, never as a factual `0 von 0` result**.
- Activity breadth and media truth: **the Foursquare mapper recognizes additional canonical amusement, sports, fitness, playground and skating categories. Provider photos load visible-first with bounded concurrency; when an exact image is unavailable, the UI renders an explicit neutral fallback instead of a wrong or invented Place photo**.
- Inventory: **330 semantic user actions, 24 typed runtime actions and 907 audited active source markers. The new Hotel controls map to existing `places.detail.open` and `booking.place.open` outcomes; Hotel map and full Place ID are separately audited technical projections, not inflated user-action counts**.
- Local and release gate: **the focused AI, Places, Hotel, Booking identity, admission and provider-mapping tests are green, and the complete controlled Safe Regression is 200/200 PASS. Runtime commit `af3f8812de2219115f441f3d88065d583f6d91a1` was uploaded from a clean detached worktree as immutable Worker version `0c639544-b074-4633-a307-1b9d63ffa2d3` and receives 100% Stable Integration traffic. Ten of ten release-critical public assets are SHA-256-identical to that clean source**.
- Public 390 px evidence: **App 13.82.147 loads with `TT.MM.JJJJ`, zero horizontal overflow and a truthful provider-unavailable Hotel state rather than `0 von 0`. The exact sentence `Finde uns heute ein ruhiges Restaurant am Wasser.` is understood as a Scharbeutz Restaurant read without the former artificial `Bitte entscheide dich`; because both Place providers are unavailable, Chat then shows a bounded retry state and performs no mutation**.
- External provider truth: **the operated Hotel probe on Supabase Edge `luvia-gateway` ACTIVE version 124 proves `google → foursquare`: Google currently fails because its daily `SearchTextRequest` quota is exhausted, then Foursquare fails because the account has zero API credits. Consequently no real public Hotel card can currently be loaded for click-through acceptance. No live Hotel-price API is connected, so Luvia must not claim a price comparison until identical dates, occupancy and current total prices arrive from a connected source**.
- Acceptance and rollback: **`.147` is the safer live recovery because it removes the known wrong actions, cross-property routing and false-zero UI, but final Hotel/Places acceptance remains open until at least one Place provider is reactivated and real card, photo, detail, map and exact booking handoff are operated publicly. Exact code rollback is `npx wrangler versions deploy a8db9b4a-ace5-4144-b86c-db61d9586ccf@100 --name integration-luvia --message "Rollback App 13.82.147 provider-gated recovery to accepted App 13.82.143" --yes`; shared Edge rollback is not required for an App-only defect**.
- Scope: **candidate changes are limited to source, generated inventories, the authorized shared Supabase Places gateway mapping and the Integration Worker. Main and Production remain untouched**.

## M16.5 Block 1 Google-first Destination Binding + Bright Hotel Truth — Integration Candidate 13.82.146

- Runtime target: **App 13.82.146 / Core 4.82.146 / cache `luvia-shell-v13.82.146` / Integration only**. App/Core 13.82.145/4.82.145 is publicly deployed but rejected; this candidate must complete the immutable release and public operation chain before acceptance.
- Real provider order: **the Places gateway now calls Google first and starts Foursquare only after Google is not configured, errors or returns no eligible destination-bound result. Diagnostics expose requested, attempted, used, fallback reason and fallback usage. If every attempted provider fails, the gateway returns `PLACES_ALL_PROVIDERS_FAILED`; the consumer must not project a truthful-looking zero-result state**.
- Current provider evidence: **both Google and Foursquare secrets exist in the shared Supabase project. The operated pre-change health probe showed Google failing with `The caller does not have permission` while Foursquare returned real Places. The Google Cloud Places API permission/billing/restriction remains an external configuration defect; Foursquare therefore remains necessary as fallback but no longer consumes quota beside a healthy Google response**.
- Explicit destination binding: **an explicit location such as `in Lübeck` is carried separately from the active Trip destination and is inherited by every dependent goal in the same structured dialogue unless that goal names its own destination. A compound request therefore searches the named destination and preserves it through the later exact-subject requirement read. A Scharbeutz result can no longer silently satisfy a Lübeck request, and a different venue can never satisfy `Tonfink reservieren?`**.
- Whole-sentence requirement read: **`muss ich dort reservieren?` remains a read-only `check_requirement` intent against the exact resolved Place; it does not require party size, cannot authorize a reservation write and returns compact Booking-owned language rather than internal compiler fields**.
- Bright Hotel consumer: **the dedicated accommodation screen now uses the bright Luvia design world, compact `TT.MM.JJJJ` stay inputs and separately truthful loading, ready, empty and provider-unavailable states. Hotel cards contain neither `Eintritt`, `Tickets prüfen`, `Reservierung prüfen` nor generic Place-booking routes. Live prices appear only when a connected provider API supplies a complete current total; affiliate links remain handoffs, never price evidence**.
- Exact Hotel identity: **the Booking Owner carries the canonical property ID and selected offer ID across normalization, comparison and handoff. Foreign properties, sibling Hotels, changed dates/occupancy, incomplete prices and unverified URLs fail closed**.
- Inventory and local evidence: **330 semantic actions, 246 public Owner paths, 24/24 typed runtime actions, 124 guarded writes, 903 audited source markers and 2,733 generated failure evals. `data-place-retry` is mapped to existing `places.results.retry`; the Hotel search marker is a state projection. Focused tests and the complete 200-test Safe Regression are green**.
- Current gate: **runtime bundles are built. Shared Supabase Edge v121 already proves Google-first/Foursquare-fallback; immutable Integration deployment, repeated signed-in operation, byte proof and exact rollback remain before acceptance**.
- Fixed continuation: **after this public gate, prove one real Restaurant route and one real Activity/Culture route, activate the first real Hotel live-price source and separately approved affiliate handoffs, close P09/P10 and remaining Step-17 rows, then continue Blocks 2–5 without reordering**.
- Scope: **this candidate changes the already authorized shared Supabase Places gateway and the Integration Worker only. It changes no DB schema, RLS policy, secret value, Main or Production deployment**.

## M16.5 Block 1 Shared-Destination Continuity — Publicly deployed, rejected 13.82.145

- Proven subset: **the public Hotel screen uses the new bright Luvia design on desktop and at 390 px without horizontal overflow. Hotels expose no ticket, entry or generic reservation control, and a Places-provider outage renders as unavailable rather than a false zero result. The compound Chat request correctly identified two tasks and searched nightlife in Lübeck**.
- Decisive public counterevidence: **the second sequential task, `Reservierungspflicht im Tonfink prüfen`, lost the sentence-level Lübeck destination and fell back to the active Scharbeutz Trip. Exact-subject protection prevented a wrong venue or hotel from opening, but the read was still scoped to the wrong city**.
- Root cause and correction: **the structured compiler attached Lübeck only to the first goal because the model did not repeat the already shared destination constraint on the second goal. App 13.82.146 now binds the one explicit sentence destination to dependent dialogue goals before their graphs are sliced for sequential execution. A new regression executes the second slice independently and requires its Places Owner call to remain in Lübeck**.
- Provider truth: **Supabase Edge `luvia-gateway` v121 remains correct and unchanged. It attempts Google first, receives the external Google Cloud permission failure, and only then uses Foursquare. No DB, RLS, secret, Main or Production change occurred**.

## M16.5 Block 1 Whole-Sentence Requirement + Exact Bright Hotel — Publicly deployed, rejected 13.82.144

- Repaired subset: **whole-sentence reservation-requirement recognition, exact Hotel offer handoff and the first dedicated Hotel consumer passed controlled local tests**.
- Decisive public counterevidence: **the signed-in request for nightlife in Lübeck still searched against the active Scharbeutz trip, and the exact Tonfink requirement read fell back into generic discovery. The resulting route could therefore show unrelated Places even though the sentence contained an explicit destination and venue**.
- Root cause and disposition: **the semantic compiler preserved the requested subject but the Places Owner call still inherited only the active Trip destination. Stable Integration was restored to accepted `.143`; `.144` remains an immutable upgrade bridge and counterexample, not a rollback target**.
- Correct rollback: **Stable Integration currently serves Worker version `a8db9b4a-ace5-4144-b86c-db61d9586ccf` at accepted App 13.82.143. Main and Production were untouched**.

## M16.5 Block 1 Booking Time and Place-Route Integrity — Stable Integration Accepted 13.82.143

- Runtime target: **App 13.82.143 / Core 4.82.143 / cache `luvia-shell-v13.82.143` / Integration only**.
- Existing Booking Core extended: **no parallel booking system was created. `booking.v1 commands.submitReservation` now drives confirmed AI Create through exactly one evidenced transport: connected provider API, verified public booking e-mail, external handoff or an honest unavailable result**.
- Whole-sentence AI: **structured dialogue semantics resolve Create, Modify and Cancel against one exact known Place or active Booking Owner object. Date and time are normalized from either a model `timeWindow` or individually typed date/time constraints, so a complete sentence does not become the internal missing input `booking-change`. A fresh Chat may derive the bounded subject from `booking.v1.reads.listForTrip`; the deterministic compiler remains the bounded safety fallback and isolated keywords do not authorize a write**.
- Lifecycle policy: **Read cards expose only actions supported by the current Booking state and provider/thread capability. Terminal bookings expose no mutation; ambiguous titles do not silently select a target**.
- Mutation safety: **Create, Modify and Cancel retain Preview, explicit confirmation, idempotency, Owner Receipt and unknown-outcome reconciliation. A Booking-owned draft is never described as externally submitted, an external link is never described as booked, and an unverified e-mail is never used as transport**.
- Compact Chat consumer: **the browserless consumer projection reads both initial booking values and exact requested changes. A Modify preview now says `Neues Datum: 15.06.2027` and `Neue Uhrzeit: 19:30 Uhr`; one booking card exposes Lesen, Buchungsweg, Neu anfragen, Ändern and Stornieren. User-facing dates use `TT.MM.JJJJ`; provider and ledger details stay outside normal product copy**.
- Public `.139` counterevidence: **the signed-in public Places flow exposed three independent integrity defects: Hotels were rendered with `Eintritt`/`Tickets prüfen`, a nightlife reservation action opened an unrelated A-ROSA/Straubinger hotel property, and partial Hotel-name overlap could be accepted as if it proved the selected property. Those outcomes are wrong even when the destination URL is syntactically valid; Stable `.139` is therefore evidence of the defect, not evidence that universal booking routing is complete**.
- `.143` correction: **a Place-Kind gate now separates lodging, dining and activity/nightlife semantics before an action is offered. Every URL or verified-email route must then prove the exact selected venue/property identity from provider place ID, normalized name/address or a provider-specific property/product identifier. Generic corporate pages, weak token overlap, sibling properties and cross-venue targets fail closed. Cache identity includes the selected Place and route facts so a result cannot leak to another card**.
- Local evidence: **the real AI Runtime, Action Contract, Ledger, Booking Lifecycle Policy, public Owner boundary and shared consumer projection pass the visible 390 px five-action lifecycle fixture. The separate visible Place/Booking integrity fixture is 4/4 green, focused source/unit tests preserve both the concrete cross-venue negative cases and positive exact OpenTable/TheFork/ticket/Hotel provider-property cases, and the complete controlled Safe Regression is 197/197 green. The Modify fixture reaches 5/5 and visibly shows `Neues Datum: 15.06.2027` plus `Neue Uhrzeit: 19:30 Uhr` for the public model shape**.
- Registry truth: **330 semantic actions, 24 typed runtime actions, 124 protected mutations, 20 truthful Undo paths, 899 audited source markers and 2,733 generated failure evals remain active. The new selected-Hotel-offer handoff is inventoried and bound to the same Booking Owner for UI and Chat. Provider-positive public evidence is not inferred from controlled local transports**.
- Release state: **accepted on Stable Integration from runtime commit `11ff01ae`. Supabase Edge `booking-route-resolve` 2.7 is ACTIVE as remote version 13 with JWT verification retained; unauthorized POST is 401 and an untrusted Origin preflight is 403. Worker version `a8db9b4a-ace5-4144-b86c-db61d9586ccf` receives 100% Integration traffic at Stable `https://integration-luvia.njwnrvwbv5.workers.dev/` and Immutable `https://a8db9b4a-integration-luvia.njwnrvwbv5.workers.dev/`. All 24 changed public assets are SHA-256 identical across the clean release archive, Stable and Immutable**.
- Public acceptance truth: **the signed-in Chat recognizes `Finde Hotels in Lübeck.` as a Hotel search and returns an honest provider-unavailable state without mutation or invented results. A compound sentence asking to find Lübeck nightlife and check Tonfink reservation requirements still fails closed but leaks internal missing-field labels (`bookable target`, `party size`); this is explicit next-slice semantic counterevidence, not a Place-route identity regression. The legacy Hotel page remains visibly unaccepted design debt**.
- Exact rollback: **restore accepted App 13.82.139 with `npx wrangler versions deploy df146bb6-52dc-4c82-8ab2-d4a6618839db@100 --name integration-luvia --message "Rollback rejected App 13.82.143 to accepted App 13.82.139 after public booking identity counterevidence" --yes`. Edge rollback redeploys the archived accepted 2.6 source from `C:\Users\fabia\AppData\Local\Temp\luvia-edge-rollback-e2a1d39c`; it is required only for a route-resolver defect**.
- Scope and fixed continuation: **no DB schema, RLS, Provider credential, Secret, Main or Production change occurred. The authorized shared Supabase Edge resolver changed; the Worker change is Integration-only. Next prove real restaurant and activity provider routes while repairing the Tonfink compound-sentence projection; then add exact Hotel property/offer identity and selected-offer handoff, build the bright Demo-design Hotel surface over the existing Booking Owner, activate Hotel/Affiliate providers, close P09/P10 and remaining Step-17 rows, and execute Blocks 2–5 in order**.

## M16.5 Block 1 Exact Booking Change Preview — Publicly deployed, rejected 13.82.142

- Repaired subset: **public Read/Open and fresh-chat Create passed; Create visibly showed `DAS LEO`, `14.06.2027`, `18:30 Uhr` and `2 Personen`. The shared consumer projection was capable of displaying exact nested Modify changes**.
- Decisive public counterevidence: **the exact Modify sentence was tested twice, including once in a fresh Chat. In both runs the structured model supplied target, new date and new time as individual constraints, but the compiler checked only `timeWindow` and asked for the internal placeholder `booking change`. No Modify confirmation was produced**.
- Root cause and disposition: **the values were present in the structured owner intent and visible in the interpreted-wish text, but `dialogueTemporalHint` ignored typed temporal constraints. Every offered preview was cancelled, no external booking mutation occurred, and Stable Integration returned immediately to accepted `.139`. `.142` is immutable counterevidence and an upgrade bridge, never a rollback target**.
- Provenance: **runtime commit `58c35ddeb3511857966fe0cc61efda633bd1e096`; clean archive `C:\Users\fabia\AppData\Local\Temp\luvia-integration-13.82.142-58c35dde-release.zip`, SHA-256 `610A1F982ADB06B68A42D2505869E06215EB7C1ACC253196C5F38D05AB676FB1`, 3,087 Git files and 68,486,476 bytes; immutable Worker version `c66206f6-13ad-4ea0-bb49-99c303523850`**.
- Correct rollback: **`npx wrangler versions deploy df146bb6-52dc-4c82-8ab2-d4a6618839db@100 --name integration-luvia --message "Rollback rejected App 13.82.142 to accepted App 13.82.139 after semantic modify clarification counterevidence" --yes`; DB, RLS, Edge Functions, Provider state, Secrets, Main and Production were unchanged**.

## M16.5 Block 1 Booking Owner Subject Resolution — Publicly deployed, rejected 13.82.141

- Repaired subset: **a fresh Chat now resolved `DAS LEO` from the public active-Trip Booking Owner collection and produced the correct Create confirmation with `14.06.2027`, `18:30 Uhr` and `2 Personen`. Public Read/Open and Cancel recognition also passed at 390 px**.
- Decisive public counterevidence: **the Modify sentence `Verschiebe bitte unsere Buchung im DAS LEO auf den 15.06.2027 um 19:30 Uhr.` reached `Buchungsänderung bestätigen`, but the shared consumer projection displayed only `Was: DAS LEO` and omitted the requested new date and time. Because a user could not safely verify the actual change, `.141` was rejected. Every preview was cancelled and no external booking mutation occurred**.
- Root cause and disposition: **the AI and Booking Owner had preserved the exact patch under `preview.changes`; `human-ai-consumer-projection-core` read only top-level fields. Stable Integration was restored immediately to accepted `.139`; `.141` remains immutable counterevidence and a retained upgrade bridge, not an accepted rollback target**.
- Provenance: **runtime commit `e45e21d8a6e7969a5bbc43cc42aca5ac11d7fea7`; clean archive `C:\Users\fabia\AppData\Local\Temp\luvia-integration-13.82.141-e45e21d8-release.zip`, SHA-256 `5205DB3B06B585C3769F8BD56EC27972E61053CF9282C3F48E25E8116DC59213`, 3,085 Git files and 67,658,301 bytes; immutable Worker version `ab4f2900-a068-44d5-be25-76a2ea04f87b`**.
- Correct rollback: **Stable Integration was restored to accepted App 13.82.139 with `npx wrangler versions deploy df146bb6-52dc-4c82-8ab2-d4a6618839db@100 --name integration-luvia --message "Rollback rejected App 13.82.141 to accepted App 13.82.139 after incomplete modify preview" --yes`; DB, RLS, Edge Functions, Provider state, Secrets, Main and Production were unchanged**.

## M16.5 Block 1 Semantic Booking Lifecycle — Publicly deployed, rejected 13.82.140

- Implemented scope: **Booking Read/Open/Create/Modify/Cancel, typed whole-sentence semantics, Preview, explicit confirmation, Booking Owner command, readback/Receipt and unknown-outcome handling were locally green at 5/5 and 194/194**.
- Publicly proven subset: **the signed-in Stable Chat listed real Booking Owner rows and opened the compact Booking Center at 390 px without horizontal overflow**.
- Decisive public counterevidence: **the fresh-chat sentence `Reserviere mir am 14.06.2027 um 18:30 Uhr für 2 Personen einen Tisch im DAS LEO.` was semantically classified as a Booking write, but Create could resolve targets only from prior Place cards. With no Place card in the conversation, the safe prerequisite route displayed the Booking list instead of a confirmation preview. No external mutation occurred**.
- Disposition: **`.140` was rejected immediately and Stable Integration was rolled back to accepted `.139`; `.140` is retained only as immutable counterevidence and as a runtime upgrade bridge, never as an accepted rollback target**.
- Provenance: **runtime commit `89090dc149f0cce6e974683c0a2291206cbb848a`; clean archive `C:\Users\fabia\AppData\Local\Temp\luvia-integration-13.82.140-89090dc1-release.zip`, SHA-256 `E7ECE5DFB682E33EBD4103991819A150053135BB04989C3417838138B9729E36`, 3,083 Git files and 66,829,905 bytes; immutable Worker version `ede79778-88f3-47bb-9b59-257bc27d4e55`; deployed at `2026-09-02T01:39:02.268Z`; 28/28 release-critical files / 7,451,883 bytes matched archive, Stable and Immutable before rollback**.
- Correct rollback: **Stable Integration was restored to accepted App 13.82.139 with `npx wrangler versions deploy df146bb6-52dc-4c82-8ab2-d4a6618839db@100 --name integration-luvia --message "Rollback rejected App 13.82.140 to accepted App 13.82.139 after public booking-create counterevidence" --yes`; DB, RLS, Edge Functions, Provider state, Secrets, Main and Production were unchanged**.

## M16.5 Block 1 Semantic Places Mutations — Stable Integration Slice 13.82.139

- Runtime target: **App 13.82.139 / Core 4.82.139 / cache `luvia-shell-v13.82.139` / Integration only**.
- Whole-sentence resolution: **structured OpenAI dialogue semantics select Favorite, Unfavorite, Plan or Unplan and the named Place; the deterministic compiler remains the bounded safety fallback. Matching uses current Chat subjects plus fresh `places.v1` or `journey.v1` Owner projections, never a free-form invented identifier**.
- Mutation protocol: **all four writes use Preview → explicit confirmation → public Owner command → independent Owner readback → Receipt → separately confirmed Undo. Plan/Unplan preserve the exact local date and time. No write is triggered merely by interpreting the sentence**.
- Honest completion: **a successful command response alone is insufficient. Favorites are reconciled through `places.v1.reads.listSaved`; planned moments are reconciled through `journey.v1.reads.snapshot`. A missing or contradictory required readback becomes `outcome_unknown`, blocks blind retry and never produces a false success receipt**.
- Consumer slice: **compact day cards expose `Aus Timeline entfernen` on the concrete entry, and all user-facing dates remain `TT.MM.JJJJ`. The normal Chat stays short; technical action/Owner details remain outside the ordinary product copy**.
- Local evidence: **focused semantic tests and the visible 390 px browser fixture prove natural German commands, typo-tolerant structured semantics, no pre-confirmation mutation, exact Owner entity resolution, confirmed write, independent readback, Receipt and separately confirmed Undo. Safe Regression is 191/191 PASS including NFR-0 3/3**.
- Public Step-17 evidence: **the signed-in Stable Chat removed `Museum für Regionalgeschichte` from 12.06.2027 at 17:50 only after Preview and confirmation, showed the Journey Owner at two moments, then restored the exact date/time through a second confirmed Undo and returned the Owner to three moments. A real Foursquare `Mini Golf` result was favorited and unfavorited through separate natural sentences, Previews, confirmations and readback-backed Receipts. The initial no-favorite state was restored. The public 390 px run had 390 px document width and no horizontal overflow**.
- Honest AI counterevidence: **reopening Chat from the Places Lifecycle resets its conversational subjects. The first context-free Unfavorite sentence therefore became a Place search; only the repeated sentence after the exact Place was visible became `places.place.unfavorite`. P04 is accepted for the proven contextual route, while cross-surface subject hydration remains a named AI follow-up and is not silently treated as solved**.
- Action matrix: **the four proven rows `places.favorite`, `places.unfavorite`, `places.plan` and `places.unplan` are now `PUBLIC_E2E_PASS`; the canonical inventory now contains 330 actions, 24 typed runtime actions, 124 protected writes, 899 source markers and 2,733 generated failure evals. Public-E2E rows remain truthfully at 7; the new Hotel-offer handoff remains local until a real provider-positive public run passes**.
- Release provenance: **runtime commit `e2a1d39c59c39ea84c0652e2b4cc1b785678a6b0`; clean archive `C:\Users\fabia\AppData\Local\Temp\luvia-integration-13.82.139-e2a1d39c.zip`, SHA-256 `2E605A191E3D0A8296B125BC6874C099EAFDCD2857D38C2F05B52D2E65E7B118`, 3,077 Git-archive files and 65,982,727 bytes; immutable Worker version `df146bb6-52dc-4c82-8ab2-d4a6618839db`, deployed 100% at `2026-09-02T00:49:25.388Z`; Stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; Immutable `https://df146bb6-integration-luvia.njwnrvwbv5.workers.dev/`. Archive, Stable and Immutable are SHA-256-identical for 26/26 release-critical files / 6,572,893 bytes**.
- Remaining B1 boundary: **`.143` Place/Booking-integrity Acceptance is complete. The fixed continuation is real Restaurant/Activity provider routes plus the compound-sentence semantic repair; exact Hotel property/offer identity and selected-offer handoff; the bright Demo-design Hotel surface over the existing Booking Owner; Hotel/Affiliate activation; P09/P10; remaining Step-17 rows; then Blocks 2–5**.
- Exact rollback: **restore accepted App 13.82.138 with `npx wrangler versions deploy e12ec944-a66e-4f77-9b18-9259f63fa46b@100 --name integration-luvia --message "Rollback M16.5 B1 App 13.82.139 to accepted App 13.82.138" --yes`; code/assets only**.
- Scope and incident truth: **the intended slice changed no DB, RLS, Edge Function, Provider, Secret or Main. One deployment command initially targeted Worker `luvia` instead of `integration-luvia` and uploaded Production version `31f295bf-fe99-4780-a324-809cb670bfe6`. Cloudflare rejected the attempted historic-version rollback because the listed version was no longer deployable, so the documented Production source commit `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba` (App/Core 13.82.49/4.82.49) was redeployed explicitly to `luvia` as version `cc7d58fc-a5f8-4d5c-a63f-95782e34eabe`. Five critical served assets are byte-identical to that source; no DB/data/RLS/Edge/Secret changed. The mistaken version remains only in immutable history and receives no traffic**.

## M16.5 Block 1 Chat-Native Trip Selection Repair — Stable Integration Slice 13.82.138

- Runtime target: **App 13.82.138 / Core 4.82.138 / cache `luvia-shell-v13.82.138` / Integration only**.
- Public counterevidence on `.137`: **the exact sentence `Ich will eine andere Reise auswählen.` no longer asked for date or time, but an older direct-navigation route overruled the correct semantic Trip intent and closed the Chat on the general Reise module instead of returning selectable trips inside the conversation**.
- Repair: **structured Trip `switch/select` reads now keep priority over the lower-level navigation recognizer. The Chat returns the Trip-owner collection and exposes `trip.active.select` only on a concrete non-active trip; an explicit request to open an App module still navigates normally**.
- Automated evidence: **the focused semantic and navigation tests inject the same structured OpenAI result, prove a two-trip Chat collection with no navigation event, preserve Hotel navigation including typo tolerance, and keep the internal-route allow-list plus foreign-URL rejection green**.
- Local acceptance: **Safe Regression 189/189 PASS, NFR-0 3/3 PASS and the unchanged ownership guardrail are green. The visible 390×844 semantic fixture proves `trip.v1`, no date/time requirement, no Places/Journey call, no horizontal overflow and zero browser warnings/errors**.
- Public Step-17 evidence: **the signed-in 390×844 Stable Chat kept the exact sentence `Ich will eine andere Reise auswählen.` inside the conversation, rendered the Trip-owner collection with nine real trips and eight `Diese Reise öffnen` controls, made no mutation, emitted no false date/time question and produced zero browser errors**.
- Release provenance: **runtime commit `3beb33f38909c1b82c0b6078e8aa0d88ba08616f`; clean archive SHA-256 `59EBC14CF89C6925C1BE9FA5E20EC72B01EBB180C1971F5AAF4A68A572A0341F`; immutable Worker version `e12ec944-a66e-4f77-9b18-9259f63fa46b`; 100 % deployment `92b83529-6b0d-42ab-b1e0-83c8bb42628f`; Stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; Immutable `https://e12ec944-integration-luvia.njwnrvwbv5.workers.dev/`. The clean ZIP contains 3,073 Git-archive files, is 65,148,854 bytes, and 23/23 release-critical files / 6,340,606 bytes are SHA-256-identical across archive, Stable and Immutable**.
- Exact rollback: **restore the last accepted full B1 foundation, App 13.82.136, with `npx wrangler versions deploy caf3e8bd-7f98-47fc-991c-135062732dad@100 --name integration-luvia --message "Rollback M16.5 B1 App 13.82.138 to accepted App 13.82.136" --yes`; code/assets only, no DB or Edge rollback. Rejected `.137` is explicitly not a rollback target**.
- Remaining B1 boundary: **this release closes the Chat-native Trip-selection read counterexample, not Block 1. P04 Favorite/Unfavorite, the complete P05 Plan/Unplan row set, Booking Create/Modify/Cancel, real provider-positive admission/hotel paths, P09/P10 and the remaining Step-17 hardware/provider rows stay open**.
- Scope lock: **no DB, RLS, Secret, Provider, Booking Edge, Main or Production change belongs to this repair slice**.

## M16.5 Block 1 Trip Selection Semantic Repair — Publicly deployed, rejected after Chat-boundary counterevidence 13.82.137

- Runtime target: **App 13.82.137 / Core 4.82.137 / cache `luvia-shell-v13.82.137` / Integration only**.
- Public counterevidence on `.136`: **`Ich will eine andere Reise auswählen.` reached the Trip wording but a structured model misclassified the control as a Journey task and the consumer incorrectly asked for date and time. No mutation occurred**.
- Repair: **structured `switch/select trip` operations are now constrained to the Trip owner even when a model labels the goal generically as `journey`; generic references such as `another` remain reads that list the available trips rather than pretending to identify or mutate one**.
- Visible local evidence: **the semantic/admission fixture injects that exact high-confidence wrong model shape and proves `trip.v1`, read mode, zero missing date/time fields, no Places/Journey call, zero console errors and no horizontal overflow at 390×844**.
- Public disposition: **the signed-in 390×844 Stable run removed the false date/time requirement and made no mutation, but left the Chat and opened the general Reise module. Because the requested selectable trip list did not remain in the Chat, `.137` is counterevidence rather than an accepted rollback target**.
- Release provenance: **runtime commit `15f7992e45186fb848ed9201ccfe8db543a6de8e`; clean archive SHA-256 `BC921456AB4769BF171B092BD2DCA54620BD0D2E95786AA4CDAA325A9360CBC7`; immutable Worker version `f5ee73eb-fb0b-4ec6-b564-8403108810db`; 100 % deployment `19f1efaa-3dfa-4208-949b-b1905a5fc72d`; 20/20 checked release files / 4,000,683 bytes matched archive, Stable and Immutable**.
- Exact rollback: **restore accepted App 13.82.136 with `npx wrangler versions deploy caf3e8bd-7f98-47fc-991c-135062732dad@100 --name integration-luvia --message "Rollback M16.5 B1 App 13.82.137 to accepted App 13.82.136" --yes`; code/assets only, no DB or Edge rollback**.
- Scope lock: **no DB, RLS, Secret, Provider, Booking Edge, Main or Production change belongs to this repair slice**.

## M16.5 Block 1 Semantic AI / Universal Admission / Hotel Live Price — Stable Integration Slice 13.82.136

- Runtime target: **App 13.82.136 / Core 4.82.136 / cache `luvia-shell-v13.82.136` / Integration only**.
- Whole-sentence routing: **the Chat combines the browserless compiler with the existing structured OpenAI dialogue result. A sufficiently evidenced semantic result wins; unresolved or low-confidence language asks a concise question instead of silently falling into Places. `ich will eine andere reise auswählen` routes to the Trip owner rather than searching for travel agencies**.
- Universal admission: **Booking now resolves dining, lodging, attractions, culture, activities, events, transport and rentals through one public `booking.admission.v1` decision. Category alone never proves that a ticket or reservation is required. The consumer shows only an evidenced ticket/reservation notice and only offers an action when a usable route exists**.
- Route order: **connected provider API → official HTTPS booking page → known provider handoff → explicitly verified public booking email. Raw Place email fields and unverified links are rejected; no email is sent and no external purchase is completed during acceptance**.
- Provider foundation: **Tiqets and Viator have real partner-gated adapter boundaries; GetYourGuide, FareHarbor, Bókun, Regiondo, bookingkit, Xola, Checkfront, Eventim, Reservix and Ticketmaster are classified in the capability/detection layer. None is claimed connected without partner access or a verified Place-specific route**.
- Consumers: **Chat Place cards/details, Places results and Journey/Timeline suggestions use the same light admission projection and category-appropriate action label. The canonical AI action is `booking.place.open`; `booking.restaurant.open` remains an input alias only**.
- Hotel live-price boundary: **`booking.stay.search` reaches `booking.v1.reads.searchStayOffers`; the authenticated gateway invokes only readiness-approved Amadeus/Hotelbeds adapters. Only current `provider_api` evidence with complete mandatory totals can rank. Partner/credential/destination/tax failures remain `fit_only`; affiliate links never become rate evidence or ranking input**.
- Local evidence: **the current 198-test Safe Regression allowlist, NFR-0 3/3 and unchanged ownership guardrail cover 330 action rows, 24/24 typed runtime actions, 246 public Owner paths and 2,733 generated failure evals. The semantic/admission fixture and the Hotel default plus 390×844 fixture pass with zero horizontal overflow and no browser warnings/errors; the Hotel consumer visibly proves both controlled live-shaped sources and the no-source/zero-invented-price state. A real provider-positive public run remains required**.
- Release provenance: **runtime commit `090c8009bb63e52a45f91b4d4fdbb640e91f51c9`; clean archive SHA-256 `9B9DA25879BA41757FBB01662EE56E60A4C435758382ECD3C390D2DD5C6E77B2`; immutable Worker version `caf3e8bd-7f98-47fc-991c-135062732dad`; 100 % deployment `b5c1f33e-dbda-4e09-901e-952b7cc47207`; Stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; Immutable `https://caf3e8bd-integration-luvia.njwnrvwbv5.workers.dev/`. 24/24 release-critical files / 6,003,200 bytes match the archive, Stable and Immutable exactly**.
- Public Step-17 evidence: **the signed-in Stable Chat understood `Finde mir bitte ein Hotel in Berlin vom 12.06.2027 bis 14.06.2027 für zwei Erwachsene, vergleiche nur belegte Livepreise.` as one typed Hotel Owner read. It showed `Noch kein freigeschalteter Livepreis`, kept Affiliate links out of price evidence, produced no mutation and remained overflow-free at 390×844. There were zero browser errors; the existing bounded Today warning for a permission-denied exact destination photo remained the only warning class**.
- Backend evidence: **the two additive `.136` migrations were applied individually through the linked Management API because the remote migration-history table is not usable for a safe global `db push`. Two Hotel providers and four `hotel-live-offer-v1` operation contracts exist; searches/snapshots remain 0/0. Eight Booking functions are ACTIVE with JWT verification; Amadeus and Hotelbeds both remain `PARTNER_REQUIRED` and unauthenticated calls return 401**.
- Exact rollback: **restore accepted App 13.82.135 with `npx wrangler versions deploy d4efd8ac-969c-426c-b312-7ea686740ac1@100 --name integration-luvia --message "Rollback M16.5 B1 App 13.82.136 to accepted App 13.82.135" --yes`. For full additive-backend compensation, then execute `docs/rollback/M16.5-B1-CORE-4.82.136-HOTEL-LIVE-OFFER-GATEWAY-ROLLBACK.sql` followed by `docs/rollback/M16.5-B1-CORE-4.82.136-UNIVERSAL-BOOKING-ROLLBACK.sql`; existing Booking/message/reservation/conversion evidence is retained**.
- Remaining B1 boundary: **this release accepts the semantic/admission/fail-closed Hotel foundation, not Block 1 as a whole. Real provider-positive hotel prices, P04/P05 mutations, provider-by-provider P07/P08 activation, P09, P10 and the remaining Step-17 hardware/provider rows stay open**.
- Scope lock: **Main, Production and Secrets remain unchanged. Additive Booking DB/RLS and eight Booking Edge deployments were authorized and applied; no Provider was connected and no Provider credential was added**.

## M16.5 Block 0 Human-AI Parity Control Plane — Stable Integration Release 13.82.135

- Runtime target: **App 13.82.135 / Core 4.82.135 / cache `luvia-shell-v13.82.135` / Integration only**.
- Complete inventory: **327 semantic user actions across 13 product categories are versioned; 316 are executable or conditional product actions and 11 are explicit Landing/demo interactions. The source audit reconciles 896 active `data-*` markers instead of counting markup as product capability**.
- Owner boundary: **all 243 audited public Owner paths have an explicit contract and method decision. Intelligence still owns orchestration only; Trip, Places, Booking, Journey, Identity, Auth, Collaboration, Media, Memory and Platform retain their own reads and mutations**.
- Runtime enforcement: **21/21 current AI runtime actions reject missing or contradictory typed input before Action Ledger creation or Owner invocation. Protected writes keep preview, explicit confirmation, idempotency, Owner receipt, readback/recovery and separately confirmed Undo where the Owner truthfully supports it**.
- Language and safety: **the browserless compiler covers all 327 actions, including reviewed German colloquialisms, misspellings, negation and ordered multi-intent language. One shared deny-by-default safety policy covers user/Trip authority, re-authentication, consent, provider, online and direct-gesture requirements without granting AI shadow permissions**.
- Honest capability and bright consumer: **all 327 actions have a current capability decision and consumer projection. The bright Chat shows understandable actions, questions, results, previews, confirmations, errors, receipts, recovery and Undo; technical Owner IDs, ledger vocabulary and raw provider errors remain diagnostics rather than normal user copy**.
- Generated release gate: **the 327-row parity matrix evaluates twelve dimensions per action and materializes 2,711 failure evals. Its six canonical source contracts are hashed, regenerated deterministically and byte-compared by CI so a changed UI action cannot silently bypass its registry, confirmation, idempotency or public-evidence decision**.
- Local release evidence: **Safe Regression 179/179 PASS, NFR-0 3/3 PASS, ownership guardrail unchanged and visual inventory 3,034 tracked files / 851 visual candidates / 65 CSS files. The local pointer run proved that a day switch updates the Timeline heading, selected date, moment count, open duration and attention state together**.
- Rejected `.134` counterevidence: **the signed-in `.134` run returned three source-backed Foursquare Minigolf places and completed the exact `14.06.2027 · 14:00 Uhr` mutation, but exposed a stale selected-day header/summary after switching from 12 to 14 June. `.134` remains immutable evidence and is not the accepted Block-0 release; its temporary test moment was removed through the visible Journey Owner surface**.
- Public Step-17 evidence: **on `.135`, the signed-in Stable Chat returned three exact source-backed Foursquare Minigolf results with Owner coordinates, MapLibre pins, saved Profile preferences and the visible Google-quota limitation. The natural-language command produced one `14.06.2027 · 14:00 Uhr` Preview, required explicit confirmation, returned an Owner success receipt, then exposed a second Preview with the same date/time before Undo. Only the second explicit confirmation removed the moment. Timeline readback then showed `Montag, 14. Juni 2027`, `0 Momente`, `14 Stunden` and `Alles klar`. Keyboard Enter, narrow responsive layout, Reload and Browser Back/Forward are green; the complete Reduced-Motion contract is green in the 179-test freeze. The browser log contains zero `.135` errors and one bounded warning class for a permission-denied exact destination photo, with the documented image fallback remaining visible**.
- Release provenance: **runtime source commit `453f31a15d0542aae5ee320cf3e11de76afa9fac`; clean archive SHA-256 `F84DE67B73E9F4576EAD854D9AB13964DFE8DED67B20DCFCCC74A3804F85CD72`; immutable Worker version `d4efd8ac-969c-426c-b312-7ea686740ac1`; 100% Integration deployment `83d40a2a-5f2e-4db0-b82d-3788736b5aab`; Stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; Immutable `https://d4efd8ac-integration-luvia.njwnrvwbv5.workers.dev/`. Twenty release-critical files / 4,119,803 bytes are SHA-256-identical between clean archive, Stable and Immutable**.
- Product-parity boundary: **this release closes the Block-0 control plane, not all 316 product actions. Each row becomes `PUBLIC_E2E_PASS` only through its coherent B1–B5 Owner slice with the same complete release chain; missing AI routes and reserved providers remain honestly open. Public `.135` counterevidence remains open for a later freely worded Unplan command, which duplicated the wish instead of mutating, and for `ich will eine andere reise auswählen`, which was incorrectly sent to Places instead of the Trip Owner. The immediate receipt Undo path is green; general language parity is not**.
- Exact rollback baseline: **`npx wrangler versions deploy df05650e-7776-4282-ac27-78efea65792c@100 --name integration-luvia --message "Rollback M16.5 Block 0 App 13.82.135 to accepted App 13.82.126" --yes`. Code/assets only; no data rollback. Rejected `.128`–`.134` are not rollback targets; the authorized `luvia-gateway` v120 remains unchanged by this App rollback**.
- Scope lock: **Main, Production, Secrets, DB/RLS and Edge Functions unchanged**.

## M16.5 Canonical AI Owner Commands and Compact Day Readback — Integration Candidate 13.82.133

- Runtime target: **App 13.82.133 / Core 4.82.133 / cache `luvia-shell-v13.82.133` / Integration only**.
- Reproduced public cause: **the existing Google provider is configured but its daily `SearchTextRequest` quota is exhausted. The same bounded public diagnostic proved that the existing Foursquare provider is reachable and returns source-backed Minigolf places, provider-native Mini Golf Course categories, coordinates and exact Place photos**.
- Provider query repair: **when Trip has already supplied a canonical destination, the existing `luvia-gateway` removes duplicate destination tokens before calling Foursquare. The chat request `Minigolf in Scharbeutz` no longer becomes the relevance-diluting provider query `Minigolf in Scharbeutz Scharbeutz`; it becomes the subject-only query `Minigolf` around the owner-supplied Scharbeutz anchor**.
- Exact-type contract: **a name-only occurrence of “Minigolf” can no longer override contradictory provider categories. A restaurant named `Imbiss da Gino Pizzeria Minigolf` is rejected, while provider-native `Mini Golf Course` evidence remains accepted**.
- Destination-first ranking: **among otherwise eligible candidates, source-backed distance to the Trip-owned destination now contributes a bounded deterministic score. The real near-Scharbeutz course is therefore not displaced solely by farther Timmendorfer results**.
- Best-result invariant: **query-variant diversity may fan out positions two and later, but it may never displace the highest-scoring eligible owner result. This keeps result breadth without letting the order of provider-query variants override relevance, exact type, preferences or destination distance**.
- Canonical owner command: **a referential request such as `Trage Ostsee Minigolf am 14.06.2027 gegen 14 ur in meine Timeline ein` resolves the already displayed, owner-backed Place once, survives the spelling error, produces one Places-owned mutation preview and no longer duplicates the same wish as a second Journey command or an unrelated new search**.
- Real mutation protocol: **the direct chat command now exercises the existing public `places.place.plan` owner path as Preview → explicit confirmation → Receipt → Journey readback → separately confirmed Undo → empty Journey readback. Intelligence keeps orchestration and explanation authority only; Places/Journey remain the fact and mutation owners**.
- Date and day-plan projection: **all visible Chat dates use `TT.MM.JJJJ`. A normal request for one date renders only that day, its moment count, time, title and concise conflict count. Route Uncertainty, Day Rehearsal, Disruption Recovery and Destination Twin are computed only when explicitly requested and remain inside one optional collapsed `Planungsdetails` section in the same Chat**.
- Trip-boundary safety: **a requested mutation date outside the active Trip is blocked as a visible conflict and may suggest the same day/month inside the active Trip; Luvia does not silently rewrite or execute it**.
- Media truth: **exact provider media remains photo-first. If neither provider search nor the existing bounded owner-detail hydration supplies a trustworthy photo, the consumer renders the compact map-first card; fixture and Landing imagery are never substituted for a Place photo**.
- Edge evidence: **the authorized existing `luvia-gateway` is ACTIVE as v120, function id `ae8f0801-2325-4125-b1a9-4c57f81770ce`, bundle SHA-256 `2b33580693d4f1363eb38835f9e27f4d659e405d92883056c6be6d28e8319590`. Health reports Places gateway 4.30.0 / gateway 4.63.0 and bounded named probes only. No second owner or public arbitrary query proxy was added**.
- Rejected public `.132` evidence: **runtime commit `45478d098bdef014492203517142569d62b419fa`, version `284b9c62-e4b4-4ad7-b6ad-20d371fdfc0e`, deployment `c9f2869b-19fb-40ee-8e1b-b59c03e2dff3`, Stable/Immutable parity 20/20. A real public pointer/keyboard run returned three source-backed Foursquare Mini Golf Course results with exact photos and excluded the name-only Pizzeria counterexample, but placed the 358 m Scharbeutz result third because query-variant diversity ran after deterministic scoring. `.132` is therefore public counterevidence, not an accepted release or rollback target**.
- Local acceptance evidence: **Safe Regression 147/147 PASS, including NFR-0 3/3, fresh visual inventory, owner-boundary gates and S16.01/S16.03/S16.04. A real local pointer/keyboard run proved exact Minigolf search, the typo-tolerant direct command, one compact `14.06.2027 · 14:00 Uhr` preview, explicit confirmation, successful receipt, one-day readback, confirmed Undo, empty readback and explicitly requested collapsed Planungsdetails. No DOM click shortcut was used**.
- Remaining acceptance gate: **clean source commit, immutable Worker upload/deployment, Stable/Immutable byte provenance, real public provider search, public mutation/readback/Undo, console check and Desktop/Mobile/Keyboard/Reload/Back/Reduced-Motion evidence remain required before `.133` may be accepted**.
- Planned rollback: **return Integration 100% to the last accepted Owner-first USP release `.126`, version `df05650e-7776-4282-ac27-78efea65792c`; rejected `.128`–`.132` are deliberately not rollback targets. Code/assets only; no data rollback. The authorized v120 `luvia-gateway` remains unchanged by this App rollback**.
- Scope lock: **Main, Production, Secrets and DB/RLS unchanged**.

## M16.5 Specific Subject Evidence Gate — Integration Candidate 13.82.131

- Runtime target: **App 13.82.131 / Core 4.82.131 / cache `luvia-shell-v13.82.131` / Integration only**.
- Systemic correction: **every concrete Places wish is compiled into a provider-evidence requirement. OpenAI may contribute precise multilingual search variants, but a visible candidate must still match the requested subject through its provider name, description, canonical type or preserved provider-native category. A broad parent class such as Activity, Store, Hotel or Swimming Pool cannot satisfy an unrelated concrete request**.
- Open vocabulary: **the evidence gate also derives discriminating terms from unfamiliar user subjects and OpenAI search plans. It is therefore not limited to a growing list of hard-coded one-off phrases; a Kletterpark/Climbing-Park counterexample exercises the same contract without a dedicated intent entry**.
- Fulfilment boundary: **product wishes route to plausible Shopping sources rather than Activities. Place metadata may establish a relevant business type, never current inventory; the consumer receives an explicit stock-unverified message and arbitrary shops are rejected**.
- Media boundary: **a search result without a projected image now performs one bounded owner-detail hydration before rendering. Provider photos retain their source attribution. If no trustworthy image exists after that read, the large decorative pseudo-photo is omitted and the card/detail use a compact map-first treatment; no invented image is shown**.
- Reported regression: **the exact compound request `Super, und wenn ich noch Minigolf spielen will oder die Kinder Luftmatratzen wollen?` remains two independently sequenced owner reads. Petersen's Landhaus/Hotel Pool is a mandatory negative counterexample for Minigolf; a provider-native Miniature Golf Course is positive evidence**.
- Ownership and writes: **OpenAI remains orchestrator only, Places remains owner of provider facts, Identity remains owner of confirmed profile preferences and no mutation is added. Existing write actions continue to require Preview, explicit confirmation, public Owner Command, Receipt and separately confirmed Undo/Recovery**.
- Acceptance state: **full Safe Regression 147/147 PASS and NFR foundation 3/3 PASS. A local visible real-pointer/keyboard run of the exact reported compound request showed three evidence-matched Minigolf cards, continued by real click to two plausible Shopping sources with explicit stock-unverified copy; the unrelated fashion-store counterexample stayed absent. Because the deterministic fixture has no exact provider photos, all five cards use the compact no-photo treatment with no media block and no approximate substitute. Public visible CUA, immutable deployment, byte comparison and final rollback record remain required before this candidate can be accepted**.
- Scope lock: **Main, Production, Secrets and DB/RLS unchanged**.

## M16.5 Places Evidence Breadth Repair — Stable Integration Release 13.82.130 / rejected after specific-subject counterevidence

- Runtime target: **App 13.82.130 / Core 4.82.130 / cache `luvia-shell-v13.82.130` / Integration only**.
- Evidence-first breadth: **the Places owner now requests a 12–20 item provider window for every visible 1–3 card selection. Its progressive search stop counts only category-eligible, non-rejected places instead of treating cafés, bakeries, shops or other unusable rows as a full result pool**.
- Cross-provider categories: **current Foursquare category labels are projected into a bounded Luvia discovery taxonomy while every native provider category ID and label remains preserved as evidence. This makes source-backed Foursquare places usable across Restaurants, Activities, Culture, Nature, Shopping and Practical without inventing a category**.
- Restaurant correctness: **strict restaurant reads retain Google strict type filtering, search Foursquare through a broad provider window inside an adaptive destination radius and post-filter every merged result against source-backed restaurant category evidence. Foursquare category IDs are sent only for an explicit, reviewed taxonomy set; the broad `13065` node is not imposed automatically because it can suppress legitimate local descendant categories. Spatial wishes such as waterfront remain ranking/search preferences unless provider facts actually support the requested location**.
- Consumer truth: **missing provider ratings no longer render as `0,0`; a single review renders as `1 Bewertung`. When the current message adds no preference but the Profile Compass is populated, chat copy now explicitly says that saved profile preferences were used instead of making the profile sound empty**.
- Existing ownership: **the existing Intelligence orchestrator, Places owner, Identity owner and provider gateway remain unchanged; no second owner and no new mutation path is introduced**.
- Edge release: **the authorized existing `luvia-gateway` is ACTIVE as v117, function id `ae8f0801-2325-4125-b1a9-4c57f81770ce`, bundle SHA-256 `16032f10c18b85c25a9586df835772d645083bcaf0071c9da6fc724f933b3d81`. Public health reports Places gateway 4.29.1, current Foursquare API 2025-06-17, explicit-reviewed-taxonomy-only category filtering, post-retrieval category evidence and adaptive destination radius. v116 is rejected because its automatic broad Restaurant-node filter caused a reproducible public all-owner-read failure while Google was restricted**.
- Public disposition: **full Safe Regression 146/146 PASS and the public restaurant-breadth run passed, but the next real compound wish exposed a broader contract defect: `Minigolf` returned Petersen's Landhaus because a Hotel Pool satisfied the parent category Activities although the candidate's own evidence explicitly contradicted Minigolf. `.130` is therefore rejected as a full Places/AI acceptance target; its restaurant breadth result remains evidence for that narrower query only**.
- Release provenance: **runtime source commit `99f283b6e6554a776513454729ba79b46853ebfd`; Edge breadth-recovery commit `2b73c61cd6ebb14129a74cc10de704999700f1fe`; Integration version `ba6f1391-3851-4616-bc34-54509c264202`; deployment `9fd733bc-23f2-406e-98b3-561a32578c59`; Stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; Immutable `https://ba6f1391-integration-luvia.njwnrvwbv5.workers.dev/`. The clean runtime archive has SHA-256 `95d7c9f7f37a0aaf8830a5f4a24cbb2e4021b2c1b833577719f2c64f8b177fea`; 21/21 changed runtime assets matched the clean archive on Immutable and Stable matched Immutable for 21/21 assets**.
- Remaining Block-1 scope: **Places Favorite/Unfavorite, Plan/Unplan and the remaining AI mutation-coverage rows are still explicitly open. The specific-subject defect additionally prevents a claim that the read slice or all of Block 1 is complete**.
- Planned rollback: **Integration returns directly to immutable App 13.82.127 version `87f30057-c93a-462e-94a2-3e067c694cfe`; rejected `.128` and `.129` are deliberately not rollback targets. Edge rollback remains a source redeploy of the complete `luvia-gateway` tree from commit `b2ee087d9388ab7839ab5923c34c1f7a5f96b653`**.
- Scope lock: **Main, Production, Secrets and DB/RLS unchanged**.

## M16.5 Block 1 Consumer Truth Repair — Publicly deployed, rejected after visible breadth counterevidence 13.82.129

- Runtime target: **App 13.82.129 / Core 4.82.129 / cache `luvia-shell-v13.82.129` / Integration only**.
- Provider-rating truth: **Foursquare's source rating remains preserved as a 0–10 provider fact and is explicitly normalized to Luvia's 0–5 product scale before ranking or presentation. A source value such as 7.7 is therefore shown consistently as 3.85/5 instead of being clamped to a false 5.0**.
- Device-location truth: **legacy exact-coordinate cache is removed at boot. Exact device coordinates remain session-only and are read or watched only after a current visible user gesture; Place detail may say “von deinem Standort” only with explicit GPS provenance**.
- Chat projection: **missing date/time information is requested before unrelated Journey results render; internal trip-place IDs and field names never become route labels; only populated days are expanded when a real plan exists; repeated compiler fragments and raw `time-or-open-period` tokens are projected as normal language**.
- Strict restaurant evidence: **an explicit restaurant intent remains `restaurant` through Intelligence and the public Places read. Google receives strict type filtering; Foursquare and merged results are post-filtered against source category evidence. Café, bakery and other adjacent food categories never backfill an explicit restaurant result, while spatial constraints such as waterfront remain attached to every query variant**.
- Chat-native Place detail: **MapLibre pins and result cards open a second light Living Sheet inside the existing Luvia chat instead of the legacy `rv2` Place surface. Places remains owner of details and photos; owner actions return to the chat and still require Preview and explicit confirmation. Escape closes exactly the nested Place detail first and preserves the conversation**.
- Existing ownership: **the existing Intelligence orchestrator, Places owner, Journey owner and Location owner remain unchanged. No second owner and no new mutation path is introduced**.
- Public disposition: **full Safe Regression 146/146 PASS and local pointer/keyboard acceptance passed, but the real public Scharbeutz waterfront search returned only Strand Creperie and Reetkate Scharbeutz. It also rendered a missing rating as `0,0` and used confusing Profile-Compass copy. `.129` is therefore rejected: excluding bakery/café was correct but the provider pool was still too narrow and stopped on ineligible raw rows**.
- Public deployment: **runtime source commit `67630e0796c426253f5de1d4ecb89f470fd934cd`; Integration version `468eb444-517c-4c8c-8f5d-a5ae1694e305`; deployment `316db7e4-39fb-47b2-9e8f-afd43feaf688`; Stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; Immutable `https://468eb444-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Planned rollback: **Integration returns directly to immutable App 13.82.127 version `87f30057-c93a-462e-94a2-3e067c694cfe`; rejected `.128` is deliberately not a rollback target. Edge rollback remains a source redeploy of `luvia-gateway` from commit `b2ee087d9388ab7839ab5923c34c1f7a5f96b653`**.
- Scope lock: **Main, Production, Secrets and DB/RLS unchanged**.

## M16.5 Block 1 Consumer-ready AI Places — Publicly deployed, rejected after visible counterevidence 13.82.128

- Runtime target: **App 13.82.128 / Core 4.82.128 / cache `luvia-shell-v13.82.128` / Integration only**.
- Consumer language: **normal chat output explains the goal, results, next step, retry and optional rationale in product language. Owner IDs, slice numbers, ledger terms, raw provider errors and source counters remain in diagnostics and evals instead of occupying the customer conversation**.
- Device-location boundary: **boot and reload do not start a browser geolocation read or watch. Only a visible user gesture starts one existing Location-owner watch; no second Location owner is introduced**.
- Provider correction: **the authorized `luvia-gateway` v114 requests current Foursquare Places fields, maps top-level `latitude`/`longitude`, preserves a read-only legacy-coordinate fallback and bounds public diagnostics. A temporary fixed read-only diagnostic proved a live source-backed Foursquare result and was removed before v114**.
- AI/Places continuity: **the existing Intelligence owner forwards Trip-owned destination context into the public Places discovery adapter. The adapter reuses an already resolved active destination before provider search, avoiding an unnecessary Google geocoding request and allowing the Foursquare fallback to run without inventing geography**.
- Owner and mutation boundary: **`intelligence.v1` remains the sole orchestrator and `places.v1` remains owner of Places facts and mutations. No new mutation is added; writes still require Preview → explicit confirmation → public Owner Command → Receipt → Recovery → separately confirmed Undo/compensation**.
- Public disposition: **Safe Regression 144/144 PASS and the positive public Foursquare search, provider photos and Place-detail opening worked. Visible acceptance then exposed two truth defects: the card showed a clamped 5.0 while the source detail exposed Foursquare 7.7/10, and Place detail rendered `0 m von deinem Standort` from stale cached exact coordinates without a current gesture. `.128` is therefore not accepted and is not a rollback target**.
- Public deployment: **runtime source commit `beea4bef32820a9051d7f022b636120608a06155`; Integration version `8f06010b-9fba-46fd-8920-c6a2a023af8e`; deployment `8d485943-3cfb-4be2-a507-d665eba0b478`; Stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; Immutable `https://8f06010b-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Edge rollback source: **redeploy the complete `supabase/functions/luvia-gateway` tree from source commit `b2ee087d9388ab7839ab5923c34c1f7a5f96b653` to return from v114 to the byte-equivalent pre-change v111 source; no Secret, DB or RLS rollback is involved**.
- Scope lock: **Main, Production, Secrets and DB/RLS unchanged. The only authorized data-plane change is the Integration-used `luvia-gateway` function described above**.

## M16.5 Block 1 Places Provider Truth — Integration Candidate 13.82.127

- Runtime target: **App 13.82.127 / Core 4.82.127 / cache `luvia-shell-v13.82.127` / Integration only**.
- Block-1 scope: **P02 Places Provider Readiness and P03 positive public AI Places search: Google/Foursquare fallback truth, provider-specific attribution, real freshness/cache/distance projection, spatial and privacy constraints, fair bounded multi-category results and honest all-provider failure**.
- Owner boundary: **the existing `intelligence.v1` remains the single orchestrator; `places.v1` remains owner of Places facts and mutations. No second Intelligence or Places owner is introduced**.
- Mutation boundary: **this candidate changes no owner mutation protocol. Favorite/Unfavorite and Plan/Unplan remain the next Block-1 slices and must still use Preview → explicit confirmation → public Owner Command → Receipt → Recovery → separately confirmed Undo/compensation**.
- Provider truth: **an empty owner response with provider errors becomes a visible provider-unavailable failure, never a false zero-result success. Provider payloads and secrets are not exposed; exact position reaches a provider only after an explicit provider-share grant**.
- Candidate evidence: **full Safe Regression 140/140 PASS including NFR-0 3/3. Public positive Provider CUA, immutable deployment, Stable/Immutable byte provenance and release IDs are not claimed until separately verified**.
- Planned rollback: **return Integration 100% to immutable `.126` version `df05650e-7776-4282-ac27-78efea65792c`; code/assets only, no data rollback**.
- Scope lock: **Main, Production, DB/RLS, Secrets and Edge Functions unchanged and unauthorized**.

## M16.5 Owner-first Intelligence USP Slices — Stable Integration Release 13.82.126

- Runtime target: **App 13.82.126 / Core 4.82.126 / cache `luvia-shell-v13.82.126` / Integration only**.
- Scope: **S16.01 Explainable Planning Trace, S16.02 On-Device Context Gate, S16.03 Route Uncertainty, S16.04 Day Rehearsal, S16.05 Live Disruption Recovery, S16.06 Causal Feedback, S16.08 Destination Digital Twin and the S16.09–S16.12 Verified Event Intelligence family**.
- Owner boundary: **the existing `intelligence.v1` remains the single orchestrator. Facts and mutations remain with Places, Booking, Journey, Trip, Identity, Memory and their public owner contracts. S16.07 CRDT and Collaboration writes remain reserved/disabled**.
- Event truth: **only strict source-backed Verified Event Claims may enter the timeline; a MapLibre pin additionally requires Places-provenanced coordinates. Missing public source gateway returns an empty `provider-unavailable` result, never fixture or invented events**.
- Mutation protocol: **Preview → explicit confirmation → public Owner Command → Owner Receipt → Recovery → separately confirmed Undo/compensation; natural language alone never executes a mutation**.
- Runtime-coherence recovery: **`.125` exposed a mixed-build Stable client because `luvia-runtime-loader.mjs` fell through the Service Worker's generic cache-first branch and a cached `.124` loader executed under the `.125` document URL. `.126` includes `.mjs` in the version-aware strategy, accepts the split suffix only for the exact current build and reloads a controlled upgrade under the new controller. The same previously controlled Stable tab then loaded only `.126` precontext, postcontext and loader assets**.
- Public Step-17 evidence: **real pointer and keyboard input on signed-in Stable showed nine Trip-owner records plus S16.01 Explainable Planning Trace; the Journey read showed three real moments plus S16.03 route bands `28–39 Min.`, S16.04 day rehearsal, S16.05 disruption status and S16.08 derived twin. The GPS request remained deny-by-default without an explicit purpose grant. Google Places quota and the missing verified-event gateway produced visible owner failures without invented cards, coordinates or events**.
- Public mutation evidence: **a real pointer selected `Ostseeurlaub`, displayed the R1 Preview, and executed `trip.active.select` only after `Verbindlich bestätigen`. The visible `trip · completed` Owner Receipt was followed by a separately prepared and confirmed Undo; `trip · compensated` restored `Jfjd`, which survived subsequent reloads**.
- Release verification: **Safe Regression 138/138 PASS and NFR-0 3/3 PASS. The final clean Git archive contains 2,925 files and has SHA-256 `f448e4949bf7b7593fb0ae2de282a5bee7fa076bbf996a9fd3cb44b66b0e29d8`. Archive, Immutable and Stable are SHA-256-identical for 28/28 selected release-critical files totaling 10,571,949 bytes**.
- Public deployment: **runtime source commits `69b1ed588e4239827566adf1c89120e34ebf8373` and inventory-coherent release head `4b5fce56177ad9393120f0e6fb11e1183ee83e3c`; Integration version `df05650e-7776-4282-ac27-78efea65792c`; deployment `6a72556d-431e-4654-8599-0de9cb240de7`; Stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; Immutable `https://df05650e-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Rejected/superseded versions: **immutable `8ae173d2-974d-4c46-8d14-0dcefc009b2c` never deployed because the feature registry rejected owner `journey`; deployed `.125` version `efbfb3a1-fb90-4cd6-88e2-7c244d0ae094` / deployment `073b5ce7-a578-49b9-baf7-1d58117e4f67` is rejected for the mixed `.124` loader; `.126` intermediate version `7fa68507-6ea1-46bd-ba6d-bb24b0469cba` / deployment `40623303-30e3-44c0-a9b8-f0ad0a4e1510` is superseded by the final inventory-coherent version. None is the rollback target**.
- Exact rollback: **`npx wrangler versions deploy 7e1068dd-dc21-4a82-8973-7d13c7105c80@100 --name integration-luvia --message "Rollback M16.5 App 13.82.126 to App 13.82.124" --yes`; code/assets only, no data rollback**.
- Scope lock: **Main, Production, DB/RLS, Secrets and Edge Functions unchanged and unauthorized**.

## M16.5 Spatial AI Places + Runtime Recovery — Stable Integration Release 13.82.124

- Runtime target: **App 13.82.124 / Core 4.82.124 / cache `luvia-shell-v13.82.124` / Integration only**.
- Single owner path: **`App Shell → LuviaAIDashboard → LuviaAIActionRuntime → public owner contracts`; no second Intelligence, Places, Booking or Journey owner exists**.
- Intent behavior: **the existing OpenAI `planning.dialogue` capability may classify multilingual meaning, while a deterministic compiler maps every goal back to fixed owner contracts, blocks confirmation bypasses and sequences compound wishes one owner-safe step at a time. Natural language never authorizes execution**.
- Places experience: **each Place-related wish renders at most three Places-v1 results, but deep discovery builds a wider deduplicated candidate pool from at least three semantic queries. Already exposed provider IDs are excluded for the current chat session; a repeat is allowed only as a visibly explained pool-exhaustion fallback. Valid owner coordinates survive the read projection into one reusable MapLibre projection; absent/invalid coordinates create no pin**.
- Spatial and media evidence: **the bounded compiler preserves positive and negative area constraints in DE/EN/ES/FR/IT/PT/NL. Provider-confirmed contradictions are rejected, while unknown location evidence stays honestly unknown. The exact first Google Places photo may be resolved only through the Places gateway and remains transient; missing evidence renders `Kein Provider-Foto belegt`, and controlled fixture images identify themselves as non-provider evidence**.
- Marker behavior: **MapLibre owns the outer marker anchor so hover cannot overwrite its placement transform. Only the inner pin may float vertically by 3 px; hover/focus pauses it and Reduced Motion disables it**.
- Runtime upgrade bridge: **the current loader executes only `.124`, while exact `.121`, `.122` and `.123` pre-/post-context bundles remain network-addressable without entering the current precache. This lets an older controlling Service Worker finish its cached boot, activate the new worker and recover on real reload instead of receiving SPA HTML for a missing JavaScript asset**.
- Compass map language: **base map and pins use the exact outer-ring palette coral `#ef6254`, sun `#f4b34c`, sea `#2c93a9` and grove `#2f8c73`, with restrained tints for water, parks, buildings and land. List-only fallback remains available when MapLibre, tiles or coordinates are unavailable**.
- Mutation protocol: **all owner mutations remain Preview → explicit confirmation → public Owner Command → Receipt → Recovery; exact owner-supported Undo is a separately confirmed compensation. Provider facts, events and coordinates are never invented**.
- Step 16 boundary: **the owner-first USP/Event backlog remains a decomposition contract, not an implementation or provider-inventory claim. The current candidate does not silently productize reserved Collaboration, CRDT or Verified Event owners**.
- Local visible evidence: **real pointer and keyboard input sent `Restaurant in Scharbeutz, eher im Zentrum statt am Strand`. The first run showed three controlled, location-confirmed centre candidates; the second identical request in the same chat excluded those IDs and showed three different centre candidates. Every image carried explicit fixture attribution, every card showed the bounded location evidence, and real pointer hover caused no horizontal pin movement**.
- Release state: **complete Safe Regression 135/135 PASS, including NFR-0 3/3, fresh visual inventory and the new upgrade-bridge gate. The real Stable browser that failed on `.123` under its controlling `.121` Worker boots on `.124` without cache deletion and survives real `Ctrl+R`; public logs contain no new error. Clean archive, Stable and Immutable are SHA-256-identical for 20/20 release-critical assets**.
- Public deployment: **source commit `787e084a77f3752a96ff7ad9312bbf470660c0c4`; Integration version `7e1068dd-dc21-4a82-8973-7d13c7105c80`; deployment `e74bb62b-a2a3-40a8-98cf-2873f0cba704`; Stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; Immutable `https://7e1068dd-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Exact rollback: **`npx wrangler versions deploy 846a60cc-ad58-4a6d-9a41-db020259b6e4@100 --name integration-luvia --message "Rollback M16.5 App 13.82.124 to App 13.82.122" --yes`; code/assets only, no data rollback**.
- Scope lock: **Main, Production, DB/RLS, Secrets and Edge Functions unchanged and unauthorized**.

## M16.5 Spatially Precise AI Places — REJECTED Stable Release 13.82.123

- Runtime/source: **App 13.82.123 / Core 4.82.123 / commit `71dbe44ecc782110d3e3b2c137df7d46860b090b` / version `52d68377-600f-4c17-92b3-18eae96a22fd` / deployment `39e2803a-2c8f-4086-9ba2-dd42ba7ed6cb`**.
- Positive evidence: **the immutable origin cold-started and reported the correct kernel; spatial intent, provider-media policy, session diversity and marker stability passed 134/134 locally**.
- Rejecting counterevidence: **a real Stable client still controlled by the `.121` Service Worker requested `luvia-runtime-precontext-13.82.121.bundle.js`; the asset had been removed, Cloudflare returned SPA HTML, the browser raised `Unexpected token '<'`, `LuviaTripStateReaderV1` never initialized and the visible Splash remained stuck across reload**.
- Disposition: **not an accepted release and not a rollback target. `.124` is the forward recovery with explicit three-build split-bundle retention. Main, Production and data plane were never changed**.

## M16.5 Functional Multilingual AI & Compass Map — Stable Integration Release 13.82.122

- Runtime: **App 13.82.122 / Core 4.82.122 / cache `luvia-shell-v13.82.122` / source commit `60de9c6acf46f938f98b6b8db2065a7a9ea532c6`**.
- Public deployment: **100% Integration version `846a60cc-ad58-4a6d-9a41-db020259b6e4`, deployment `e5f884fb-ae60-4f70-863a-12720db80f92`; Stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; Immutable `https://846a60cc-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Scope: **multilingual Structured Intent plus deterministic owner/confirmation safety, sequential multi-goal chat, up to three owner-backed Places per goal, shared Compass-coloured MapLibre projection, nested Place sheets and confirmed Owner Receipt/Undo continuation. It does not claim provider-photo diversity or precise centre-versus-waterfront enforcement now added in `.123`**.
- Rollback from `.124`: **`npx wrangler versions deploy 846a60cc-ad58-4a6d-9a41-db020259b6e4@100 --name integration-luvia --message "Rollback M16.5 App 13.82.124 to App 13.82.122" --yes`; code/assets only, no data rollback**.
- Main / Production / data plane: **unchanged; no DB/RLS, Secret or Edge Function action**.

## M16.5 Steps 15–18 Global AI & Owner-first Productization — Stable Integration Release 13.82.121

- Runtime: **App 13.82.121 / Core 4.82.121 / cache `luvia-shell-v13.82.121` / source commit `c1bf77cfcc8fcd1cd2cd32378ad5d8bd77f8b11d`**.
- Step 15: **the existing global Intelligence path remains the single orchestrator. The central Compass opens a bright bottom-up Living Sheet using the same geometry and motion language as the owner-backed Places suggestions in the Timeline; mobile uses the corresponding bottom-anchored compact sheet. The deterministic German multi-intent compiler separates Places, Booking, Journey, Trip, Identity/Privacy, Location, Collaboration and Memory, exposes conflicts/missing data/offline/forbidden commands, persists no raw prompt and performs no direct owner mutation**.
- Mutation protocol: **every write is Preview → explicit confirmation → public Owner Command → Receipt → Recovery. Exact owner-supported compensation is itself a new explicitly confirmed command and produces an Undo Receipt; unknown external outcomes never receive a blind retry**.
- Step 16: **`docs/modularization/M16.5-STEP16-OWNER-FIRST-USP-AND-EVENT-BACKLOG.md` decomposes all required USP/Event families into owners, contracts, I/O, freshness, privacy, failures, receipts, evals, rollback flags and source gates. It is backlog decomposition, not a provider/feature completion claim; source-less events and pins are forbidden**.
- Visible evidence: **the initial right-rail projection was explicitly rejected and replaced before release with the Timeline/Places-style bottom-up Living Sheet. Local real-pointer runs prove the corrected bottom-anchored projection at 1440×900 and 390×844. A subsequently reproduced double overlay came from a second Fixture click bridge beside the productive Dashboard handler; that bridge was removed and the existing chat mount made idempotent. Public Stable real-pointer runs now expose exactly one named dialog on Desktop and Mobile, and one close action removes it completely. A public Stable keyboard flow submitted a seven-route German compound request and visibly exposed the contradictory GPS instruction, missing provider evidence and blocked Collaboration foundation as `Befehl abgelehnt`; no mutation ran**.
- Validation: **the complete Safe Regression passes 133/133, including NFR-0 3/3 and the fresh visual inventory at the runtime commit. Stable and Immutable are exact for 10/10 release-critical assets, including the browser Supabase runtime, version, loader, Pre-/Post-Bundle, Experience CSS, AI dashboard, orchestration runtime and Service Worker. The truthful Step-17 matrix is recorded in `docs/modularization/M16.5-STEP17-E2E-MATRIX.md`; physical Touch, real flight-mode offline/reconnect, precise device GPS, multi-device Cloud and an external Provider completion remain explicitly open**.
- Public deployment: **100% Integration version `7b143022-d63a-49f8-9336-4c85d0a662cb`, deployment `a4cfbe0c-e747-4019-bd8c-01241007306b`; Stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; Immutable `https://7b143022-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Rejected release evidence: **version `9b5790fe-b791-488d-9b58-78210a1dccbf` was uploaded from the dirty working tree and never deployed. Version `cc4f5af3-4a9a-4420-817a-830f6f85e636`, deployment `32b57174-cbf9-448a-866d-ccb68aeb5ab4`, failed the public cold-start gate because an unanchored asset-ignore rule omitted the browser Supabase runtime; Stable was immediately returned to `27d0ffd0-712b-4737-9d4b-20f0093c625c`. Neither rejected version is an acceptance or rollback target**.
- Rollback: **`npx wrangler versions deploy 27d0ffd0-712b-4737-9d4b-20f0093c625c@100 --name integration-luvia --message "Rollback M16.5 Steps 15-18 to App 13.82.116" --yes`; code/assets only, no data rollback**.
- Main / Production / data plane: **unchanged: Main `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`; Production deployment `578f13fc-8193-4988-88cf-93c94362fcc3`, version `0d26706b-8b79-4e05-b3b6-6c6314cc597c`; no DB/RLS, Secret or Edge Function action**.

## M16.5AB Recovery Candidate 13.82.120 — LOCAL / NOT ACCEPTED / NOT DEPLOYED

- Runtime target: **App 13.82.120 / Core 4.82.120 / cache `luvia-shell-v13.82.120` / local Integration candidate only**.
- Purpose: **separate the recovery bytes from the previously cached `13.82.116` shell and audit Timeline, Places, Booking, preference, owner and hydration boundaries without changing Main or Production**.
- Visible evidence so far: **the preceding `13.82.118` audit proved the new cache boundary in the real local signed-in Places surface; category results opened provider-first in about 0.87–1.45 seconds and displayed real provider facts. `13.82.120` additionally invalidates stale preference/group projections when Identity or Trip context changes. Full signed-in cold start last measured about 5.1 seconds and therefore remains above the requested 4–5 second ceiling**.
- Regression state: **132/132 PASS on the complete safe-regression allowlist, including NFR-0 3/3, visual-inventory freshness, Core boundaries, owner contracts, Places resilience, Booking routes, GPS confirmation, offline day pack and group-decision policy. This is architecture and regression evidence only; the open visible/productive counterevidence below remains binding, so no release or functional acceptance may be inferred from this candidate**.
- Deployment: **none**. Stable Integration remains on its previously published version; immutable candidate, commit, deployment URL and rollback do not exist yet.
- Acceptance boundary: **no acceptance before the complete visible Desktop/Mobile/Keyboard/Reload/Back/Reduced-Motion E2E sequence and stable/immutable byte proof**.

## M16.5AB Timeline / Places / Booking Continuity — Integration Release 13.82.116

- Runtime source: **commit `c3810606` on `integration`; the Worker was uploaded from a clean `git archive` of exactly this commit**. The three local, untracked landing-reel files were neither committed nor deployed.
- Runtime target: **App 13.82.116 / Core 4.82.116 / cache `luvia-shell-v13.82.116` / Integration Preview only**.
- Visible product continuity: **Today and Timeline remain separate surfaces; Timeline uses one Living Sheet for real Places suggestions and Places search results. Provider facts, profile and Trip weighting, computed traveler/group fit, concise reasons, multi-select, independent date/time/duration per card, live time/distance/conflict recomposition, alternatives, group decisions, confirmation-only GPS moments, offline status and owner-safe Luvia AI routing are present without replacing the existing owner cores**.
- Booking boundary: **restaurants and cafés use the existing provider-first Booking Core. A verified provider opens before any fallback; only a Core-confirmed, evidentiary booking-email path opens the embedded three-step request canvas. Non-booking Places do not receive restaurant booking controls. Existing bookings use the same Living Sheet for change, cancellation and conversation; an unbooked Timeline Place changes only its scheduled time**.
- Places continuity: **Places search opens the same compact, touch-scrollable result sheet as Timeline suggestions. The public result set exposes verified type/address/rating/review-count/price/open-state facts, calculated group fit and one short evidence-aligned reason; selecting a card reveals that card's own schedule and next action. No legacy Places detail surface was substituted**.
- Public deployment: **100% Integration version `27d0ffd0-712b-4737-9d4b-20f0093c625c`, deployment `fbfccf09-e15b-48f9-be33-f4dd41230d2f`; stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; immutable `https://27d0ffd0-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Validation: **124/124 Safe Regression PASS; syntax PASS for 59 changed scripts; release-version consistency PASS; visual inventory PASS (2,875 tracked files, 742 visual candidates, 64 CSS files); Stable and Immutable are byte-identical for seven critical runtime assets. Real visible Stable E2E verified Timeline, three mixed-category real suggestions, traveler fit, per-card schedule, the provider-first three-step Booking canvas without sending a request, unbooked Timeline editing without Control-Center detour, Luvia AI Sheet, Plan Compass, real Places search with 18 provider results, Browser Back and Reload. Mobile 390×844 has zero horizontal document overflow; final browser console warnings/errors: 0**.
- Main / Production: **unchanged: Main `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`; Production deployment `578f13fc-8193-4988-88cf-93c94362fcc3`, version `0d26706b-8b79-4e05-b3b6-6c6314cc597c`**.
- Rollback: **`npx wrangler versions deploy add4b814-2fc6-4806-9d5f-43f98baa797e@100 --name integration-luvia --message "Rollback M16.5AB to App 13.82.114" --yes` restores the prior Stable Integration version; code/assets only, no data rollback**.
- Acceptance boundary: **the public browser sequence is visibly and technically verified, but no real reservation/email was sent and final physical-handset acceptance remains explicitly open. This release is not the global M16.5 Design Freeze**.

## M16.5AB Today ↔ Planen ↔ Places / Wave C

- Runtime source commit: **`362460ae9470817a1d85b09c7997c7a05fb99aa7`** on `integration`; the Worker was uploaded from a clean `git archive` of exactly that commit.
- Runtime target: **App 13.82.110 / Core 4.82.110 / Integration Preview**.
- Rejected candidate: **App/Core 13.82.101 / 4.82.101, immutable version `8e422bca-586c-425f-9914-975048ab9272`, failed the real visible Today → Places provider completion and was removed from Stable Integration on 2026-08-28. It is not functionally or visually accepted.**
- Restored stable baseline: **100% Integration version `0ad87340-4aa1-4d56-8048-d5c749d82adf` (App/Core 13.82.100 / 4.82.100); Main and Production remained unchanged.**
- Product slice: **the signed-in Today surface now follows the accepted M16.5E image-led Living Day composition on the real Journey day graph; Journey derives explicit open windows; Intelligence turns Identity-owned preferences and Trip-owned feelings into an explainable draft; Places receives those public projections plus the canonical Trip destination and remains the only visible commit path through `places.plan`**.
- Root-cause recovery: **the `.101` handoff sent only a display string to discovery and did not pass its canonical destination into each provider query; the cascade additionally waited for up to 60 unique candidates although only 18 are visible and one failed query variant could abort the whole run. `.102` carries the complete Trip destination, settles after the requested visible result count and preserves successful partial results across failed variants.**
- Safety: **the AI suggestion persists nothing and requires explicit user confirmation; App Shell and Living Compass navigation are frozen; Main and Production remain unchanged**.
- Today / appwide entry: **the signed-in Today surface is one non-scrolling, photo-first day view with a second-accurate departure countdown, current/trip weather, companions, owner-safe planning counts and a compact explainable AI draft. The destination image is requested eagerly in the first markup and remains the visual canvas; restrained saturation/contrast, a destination-colour light field and layered shade give it depth without replacing or hiding the real photograph. Pointer depth, restrained hover lift, four ambient orbits and independently moving planes add life without changing information hierarchy; Reduced Motion disables every new transform and animation. `Reise wechseln` is visible both in Today and appwide in the header and commits through `trip.v1.commands.selectActiveTrip`; the existing First Trip Composer remains appwide and cancel returns to the originating view**.
- Planning intelligence: **Today retains `dashboard.brief` for an honest journey status, while concrete planning cards come separately from OpenAI `discovery.plan` with the current Trip destination plus Identity/Trip/Travel context. Multiple non-fallback search plans form a horizontal, touch-scrollable slider; a fallback may render only one clearly safeguarded proposal. Selecting a proposal only hands a draft to Places and never schedules or persists automatically**.
- Destination-photo policy: **an exact transient Places photo derived from the canonical Trip `placeId` is preferred and visibly attributed; curated exact destination assets are second choice; any semantic fallback is explicitly labelled as a motif fallback rather than being presented as the destination**.
- Boot recovery: **first paint is local-first; remote profile/Trip/Journey hydration continues as background progress and cannot overwrite the visible `ready` phase. Reload, bfcache restoration and tab return explicitly expose the already mounted app instead of reactivating the legacy warm-boot mask**.
- Public deployment: **100% Integration version `859d3fc1-b808-4825-be3b-549adecd378d`, deployment `9f0077de-a335-44a6-beac-f2b26e29aaf6`; stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; immutable `https://859d3fc1-integration-luvia.njwnrvwbv5.workers.dev/`. The `.105` photo-first draft remains rejected, and `.106` is technically stable but visually superseded by `.107`**.
- `.107` visual convergence: **Today adopts the calmer Profile/Trip-onboarding grammar instead of mixing independent dashboard-card styles. The title separates greeting, journey statement and destination; travel metrics share one coherent instrument with safer countdown padding; OpenAI is prompted for short natural card titles and the client defensively turns provider search queries into readable labels while preserving the original query for Places. A small four-colour needle signature, explicitly labelled `Luvia` on mobile, moves only its needle and makes Luvia present without duplicating the full navigation Compass**.
- Validation / deployment / rollback: **121/121 Safe Regression PASS plus focused first-paint, live AI, real-click, Browser Back, Reload and Reduced-Motion evidence. Real visible signed-in Stable Mobile 390×844 confirms App 13.82.110, a complete non-scrolling frame with zero document overflow and four short OpenAI cards. A real left click on `Strandspaziergang mit Seebrückenblick` opens productive Places with that exact original provider query; Browser Back restores Today; cached Reload reaches ready in 2.494 s; Reduced Motion disables the Luvia needle animation. Stable and Immutable are SHA-256 byte-identical for `index.html`, version, Today JS/CSS, App Shell and Service Worker. Operational rollback is `npx wrangler versions deploy 6d5c62f3-4eb0-4b17-b1d4-ea6428fb06a7@100 --name integration-luvia --message \"Rollback M16.5AB to App 13.82.106\" --yes`; `.106` remains visually superseded and is only the immediate technical rollback. No Main or Production action is authorized**.
- Main / Production: **unchanged: Main `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`; Production deployment `578f13fc-8193-4988-88cf-93c94362fcc3`, version `0d26706b-8b79-4e05-b3b6-6c6314cc597c`; final physical-handset acceptance remains explicitly open**.

## M16.5AA Preference Resolution / Places / Shared Compass Activation

- Runtime source commit: **`cc2850d4d6bd0e3dab1c52aa2ce480cd3e277f5b`** on `integration`.
- Runtime target: **App 13.82.106 / Core 4.82.106 / Integration Preview**.
- Public deployment: **100% Integration version `0ad87340-4aa1-4d56-8048-d5c749d82adf`, deployment `d4f22fa1-de92-4c24-bab3-c646698ad096`; stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; immutable `https://0ad87340-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Preference resolution: **Identity-owned durable preferences and Trip-owned feelings are combined by one immutable Intelligence resolver; Places is the first visible consumer and explains hard Profile constraints, personal signals and per-Trip weighting without creating new truth**.
- Compass activation: **actual needle coordinates sample the official four-part SVG ring; selected node, icon accent, four thin orbit lines and ambient field share that exact tone; the node stays predominantly white and remains visibly settled for 620 ms before the accepted reverse exit**.
- Validation: **118/118 Safe Regression PASS; syntax 35/35; Stable signed-in Desktop keyboard/left-click/Back/Reload; immutable Landing Desktop and 390x844 Mobile real-click; Reduced Motion; zero mobile horizontal overflow; real Edge Service Worker registration/cache maintenance/offline reload; clean archive/Stable/Immutable parity 14/14**.
- Main / Production: **locked and unchanged; no database/schema/RPC/RLS/bucket migration, Edge Function, secret or manual non-versioned Cloudflare configuration change**.
- Rollback: **restore Integration version `e9c1df5d-d172-459e-ab8a-93736988d65e` at 100% (deployment `ff560abc-6fe4-4258-be16-ea2280c18ff0`), App/Core 13.82.99 / 4.82.99; code/assets only, no data rollback**.
- Acceptance boundary: **automated and visible browser evidence is complete; final physical-handset acceptance and the broader M16.5 Design Freeze remain explicitly open**.

## M16.5V Precision Memory Canvas / Accepted Living Shell

- Runtime source commit: **`e9481cf32a650c5d32095d244e5a58bfaaa8f724`** on `integration`.
- Runtime target: **App 13.82.92 / Core 4.82.92 / Integration Preview**.
- Public deployment: **100% Integration version `225b4f19-da56-4a4f-830a-88c58fce9f08`, deployment `ca41ce95-6e21-4888-a71d-950eec1103e3`; stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; immutable `https://225b4f19-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Responsive/product evidence: **mobile 390×844 and 360×740/320×673 E2E; complete Plan/Profile Compass constellations above the dock; profile/active-Trip/companion header; only the Luvia AI needle animates; Landing, authenticated App, auth and onboarding descendants hide native scrollbars while preserving scroll behavior**.
- Touch ownership: **real Chromium CDP touch sequence solves the puzzle; the first curved Compass rotation changes document `scrollX/scrollY` by exactly 0 px; crown and lower latch remain usable**.
- Memory Studio: **16 local travel photos, 12 draggable decorations, nine frame/mask choices, ten page-design worlds, sixteen journey themes, replacement/removal/layer ordering/duplication, decimal drag, corner scaling, rotation and keyboard nudge; mobile Photo Editor/Reel/Book surfaces remain reachable**.
- Places/maps: **mobile map transitions use zero tile fade and compact motion; a local branded fallback remains above the remote renderer until ready; productive map camera movement is shortened on compact viewports**.
- Validation: **112 / 112 Safe Regression PASS; real visible mobile dock at 390 px PASS; stable Integration real-click Profile Compass PASS (eight points, Plan inactive, zero overlaps); stable tab-switch and storage-independent reload PASS (no visible Splash); browser warnings/errors 0; stable/immutable byte parity 7 / 7 PASS; M16.5Q desktop/mobile touch/keyboard/reload/Back/reduced-motion and PWA recovery gates remain PASS**.
- Main / Production: **locked and unchanged after publication: Main `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`; Production deployment `578f13fc-8193-4988-88cf-93c94362fcc3`, version `0d26706b-8b79-4e05-b3b6-6c6314cc597c`; no database/schema/RPC/RLS/bucket migration, Edge Function, secret or manual non-versioned Cloudflare configuration change**.
- Rollback: **redeploy the last accepted Integration App 13.82.88 version `e64f96e9-aff8-49d6-9381-3c3904f947c5` from deployment `feb56eda-f035-4fe4-992b-a788b8970d7a`; code/assets only, no data rollback. App 13.82.91 is explicitly rejected as a rollback target because its warm-state persistence still depended on browser storage**.
- Acceptance boundary: **automated and visible browser evidence is complete for the repaired shell/navigation/tab-restore bundle; final physical-handset acceptance of App 13.82.92 and the broader M16.5 Design Freeze remain explicitly open**.

## M16.5H–J Accepted Living Shell / Visual Parity Candidate

- Consumer source: `fee1cdbe02707f845fa6543d17b9c03718135c23`.
- Runtime target: **App 13.82.51 / Core 4.82.51 / Integration Preview**.
- Product status: **the accepted desktop/mobile Living Shell is active around
  real Trip, Navigation, Collaboration and Intelligence projections; inner
  Plan/Places/Booking, Trip/Journey, Memories and Profile compositions remain
  explicit migration work and are not visually accepted yet**.
- Binding reference: **27 files / 11,703,321 bytes; six key inputs SHA-256
  pinned in `config/luvia-m16.5-visual-parity-contract.json`**.
- Release rule: **a redesigned header around a legacy feature does not pass;
  fixtures may be replaced only by real owner-contract data, responsive reflow,
  accessibility and designed runtime states**.
- Mandatory matrix: **Landing, account onboarding, Trip onboarding, Signed-in
  shell, Today, Plan/Places/Booking, Trip/Journey/Collaboration,
  Memories/Cards/Albums/Stories, Profile/Profile Compass, Intelligence actions,
  overlays/popups and cross-product runtime states**.
- Main / Production: **LOCKED until every mandatory row is measured on desktop
  and mobile and jointly accepted**. Production remains on **13.82.49 /
  4.82.49**.
- Candidate validation: **99 / 99 Safe Regression PASS on the immutable M16.5J
  baseline; visual inventory freshness PASS at 2,768 tracked files / 660 visual
  candidates; NFR-0 3 / 3
  PASS; cross-Core DB ownership guard PASS without debt growth**.
- Database/schema/RPC/RLS/bucket migration: **NONE**.
- Supabase Edge Function / secrets / manual Cloudflare change: **NONE**.

## M16.5K Productive Plan Compass Candidate

- Consumer source: `37cead7b30230f2731b866390c510f812ba50291`.
- Runtime target: **App 13.82.52 / Core 4.82.52 / Integration Preview**.
- Productive Plan entry: **accepted embedded eight-direction Living Compass in
  the Signed-in shell; no overlay and no legacy tile-wall substitution**.
- Shared element: **official layered Compass travels from the top-left Luvia
  brand; the separate `Luvia Compass` navigation item continues to open the real
  Intelligence chat**.
- Motion: **only the official two-ended needle rotates; feature directions enter
  after the Compass, float subtly, and leave before the selected owner route**.
- Data: **Plan counts use the public Places contract; no private owner Store or
  direct database access**.
- Responsive local evidence: **390 × 844 and 320 × 673 fit without document or
  horizontal navigation scrolling**.
- Step 5 status: **IN PROGRESS — embedded Plan Compass candidate complete;
  productive Places search/map and Booking visual migration continue next**.
- Candidate validation: **101 / 101 Safe Regression PASS; visual inventory
  freshness 2,772 / 661 PASS; NFR-0 3 / 3 PASS; cross-Core DB ownership guard
  PASS without debt growth**.
- Release status: **Integration candidate only; Main and Production remain
  locked and unchanged pending complete joint visual acceptance**.

## M16.5M Plan Compass Navigation Alignment

- Runtime target: **App 13.82.53 / Core 4.82.53 / Integration Preview**.
- Product correction: **the official full-colour central navigation Compass
  now participates in the mobile five-column dock layout at 42 × 42 px and
  40 × 40 px up to 390 px, without a negative offset, absolute positioning or
  artificial label spacing**.
- Accepted flow retained: **the Plan feature Compass still travels from the
  top-left Luvia brand, while the separate `Luvia Compass` destination still
  opens Intelligence directly**.
- Responsive gate: **the dock no longer grows around a displaced Compass; the
  complete Plan stage remains document-scroll-free at the accepted mobile
  review sizes**.
- Candidate validation: **102 / 102 Safe Regression PASS; regenerated visual
  inventory freshness 2,774 / 662 PASS; NFR-0 3 / 3 PASS; cross-Core DB
  ownership guard PASS without debt growth**.
- Release status: **Integration only; Main and Production remain locked and
  unchanged pending complete joint visual acceptance**.
- Database/schema/RPC/RLS/bucket migration: **NONE**.
- Supabase Edge Function / secret / manual Cloudflare change: **NONE**.

## M16.5R Places Details/Evidence Continuity Release

- Runtime target: **App 13.82.65 / Core 4.82.65 / Integration Preview only**.
- Release name / channel: **M16.5 Places Detail Continuity / `integration-preview`**.
- Reproduced root cause: **`loadDetails(id)` globally rendered the complete Places root for loading and completion. The `innerHTML` replacement destroyed the horizontally scrolled result rail, focused detail button and active MapLibre instance, recreating the rail at result 1 even though a later Place's evidence was shown**.
- Correction: **later-result evidence now selects the exact Place and patches only its stable live detail region. The rail, real pointer focus and existing map survive; the map follows the same owner-coordinate selection path. Pending-detail identity and lifecycle/root fences prevent close/reopen races and late unmounted mutations**.
- Local real Edge evidence: **390 × 844 result 4 rail position `1060.0 → 1060.0 → 1060.0` across open, delayed completion and close; selected Place 4; map center `[10.78, 54.04]`; map instances/removals `1 / 0`; focus retained; one `places.v1` detail read; console 0**.
- Validation: **Consumer 99 / 99 PASS; Integration Safe Regression 108 / 108 PASS; real local Edge 390 × 844 later-result continuity E2E PASS with rail `1060.0 → 1060.0 → 1060.0`; 9 / 9 changed/version-critical assets are byte-identical across source, stable and immutable Integration**.
- Public visible evidence: **authenticated stable-origin 390 × 844 real horizontal gestures reached productive result 4; a visible real left click opened `Details & Evidenz`; rail `1060.8 → 1060.8 → 1060.8`, exact result-4 selection, pointer focus, `aria-expanded`, the existing ready map and asynchronous detail completion all remained coherent through open/complete/close; reload restored the Places route; console warnings/errors 0**.
- Public deployment: **100% Integration version `672b3a94-e25d-47bc-97d3-baf903d1c971`, deployment `30f7b880-e7b4-4bd2-874d-a0b834ac75b8`; stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; immutable `https://672b3a94-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Product boundary: **this closes the bounded continuity defect only. The complete Places Golden Slice, remaining M16.5 Product Surface Matrix, user acceptance and Design Freeze remain open**.
- Main / Production: **locked and verified unchanged: Main `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`; Production deployment `578f13fc-8193-4988-88cf-93c94362fcc3`, version `0d26706b-8b79-4e05-b3b6-6c6314cc597c`**.
- Rollback: **redeploy immediately previous Integration App 13.82.64 version `20ad47c4-0a93-4d1b-ad91-9ff9f8c372ef` from deployment `c6878f00-0c18-457f-bd58-7c8b293e3736`; no data rollback**.

## M16.5S Public Landing / Real Authentication Scope Lock

- Runtime target: **App 13.82.81 / Core 4.82.81 / Integration Preview only**.
- Status: **Compass-first public journey and bounded Landing/Auth release complete on Integration with exact deployed-byte Desktop/Mobile E2E and controlled-worker recovery PASS. This is not the complete M16.5 Product-Surface or Design-Freeze acceptance**.
- Compass-first Landing: **after the Luvia intro, the closed layered Living Compass is the first and central public experience. The intro mark grows and visually docks into its housing. A subtle glint and responsive engravings invite discovery without a hand or explicit click instruction. The three initial choices appear only after the housing opens**.
- Journey-first entry: **the open Compass presents “Luvia kennenlernen”, “Weiterreisen” and “Meine Reise beginnen”. Login enters from the left and registration/recovery from the right while the single productive Auth owner remains unchanged**.
- Luvia worlds: **“Luvia kennenlernen” lets the needle search playfully and then replaces the first three choices with six softly staggered worlds: Ein ruhiger Anfang, Reisehorizonte, Place Compass, Memory Worlds, Living Journey and App live erleben. Each selection settles the needle, lets the Compass recede and opens one dedicated canvas; every canvas returns explicitly to the same Living Compass**.
- Emotional introduction: **“Hallo, wir sind Luvia” explains the product in three compact sentences: Luvia brings wishes, people, places and small moments together; the Living Compass listens and learns; the product is a journey that lives with its people, not a list to work through**.
- Living content: **ten named journey colours update the public theme; destinations and travel feelings change dynamically; Places uses a real interactive MapLibre map plus a 20-card example rondell; Memory future capabilities remain visibly marked as preview/not yet productive; the phone demo remains the deployable signed-in shell surface**.
- Real photography: **five locally stored Unsplash photographs replace the rejected AI-looking horizon asset. Every image carries the photographer credit and direct source link; the source/asset/license mapping is recorded in `assets/public-landing/travel-photo-sources.json`**.
- Productive Auth: **existing `auth/config.js`, `auth/session.js`, `auth/ui.js` and App Shell orchestration remain the single real Supabase password/OAuth/session owner path. Login and a deliberately minimal email/password/repeat registration are presented inside the accepted Landing; no duplicate Auth truth or fake account path was introduced**.
- Compass-led registration bridge: **registration remains the light secure-access chapter only. Its visible Compass guide explicitly sequences email confirmation before the first-login travel-preference journey and previews Ernährung, Rhythmus, Mobilität and Menschen without pretending those still-open profile preferences are already persisted**.
- Public demo correction: **the interactive Landing iframe and full-size demo link now use the deployable `app/demo/living-compass-browser.html` asset with root-relative base ownership, `noindex,nofollow` and explicit Service Worker coverage. The excluded `tests/fixtures/**` URL is no longer referenced, preventing the public SPA fallback from recursively loading the wrong document and generating broken `/tests/fixtures/core/**` scripts**.
- Recovery completion: **the existing `?auth=recovery` request contract now has a complete callback surface for valid, invalid and expired links and delegates the actual password mutation to the productive Auth UI owner. The final credential-changing submit was intentionally not executed during automated browser verification**.
- History/lifecycle: **login/register/recovery states are reloadable and Browser-Back coherent; signed-in transition cleanup removes the public Landing runtime, motion and focus ownership before the Living Product mounts**.
- Cache-upgrade correction: **the tiny build-qualified recovery runtime executes in the document head before the first blocking stylesheet, so a controlled client can replace a stale worker while the current document is still parsing. Worker installation now fetches only root/index, offline fallback, manifest, recovery runtime and build identity through the bounded four-request pool; all large visible surfaces warm explicitly only after visible load and idle. Once warmed, assets carrying the exact current `?v=` build are immutable and served cache-first instead of redownloading hundreds of scripts on every reload; unversioned assets remain network-first. The expected-worker handoff preserves the already-current document, cleans stale caches after late old-worker writes and tolerates blocked session storage**.
- Local visible evidence: **real cursor clicks at desktop size and 390 x 844 opened the closed Compass and all three primary directions without horizontal overflow. The visible sequence continued through “Luvia kennenlernen” to all six Luvia worlds and then opened “Ein ruhiger Anfang”, where the complete new short product introduction was present. Canvas Back, Browser Back, reload, keyboard Enter/Space, Reduced Motion, theme selection and the other five canvases remain covered by the Landing tests. Hardware `Input.dispatchTouchEvent` is unavailable in the integrated browser, so no new physical-device touch claim is made for this public-Landing slice**.
- Controlled stale-client evidence: **on the retained local 4186 origin, the prior `.79` controller was replaced by the `.80` document without a second document reload. The current document reached DOMContentLoaded in 8.041 s and `load` in 9.264 s; the active and controlling worker were exactly `/sw.js?v=13.82.80`, no worker was waiting or installing and only `luvia-shell-v13.82.80` remained. Subsequent real cursor clicks opened the closed Compass at desktop and 390 x 844 and exposed all three choices with zero horizontal overflow. This local pass does not replace the mandatory toxic Stable-origin check**.
- App 13.82.81 local recovery/performance evidence: **the retained `.80` controller published `.81` late as a waiting worker; the new bounded 80 ms poll activated that exact waiting build, removed the old cache and kept the current document. The `.80 -> .81` document reached DOMContentLoaded / load in 10.164 / 12.242 s with exact `.81` controller/cache and no waiting or installing worker. A real cursor click then opened all three primary choices. On the following fully warm reload all 250 resource entries had zero transferred bytes, proving exact-build cache-first delivery; the remaining 15.626 s load duration is script parsing/execution cost rather than cache/network inconsistency**.
- App 13.82.81 immutable/public evidence: **18 / 18 release-critical files are byte-identical across source, immutable and Stable Integration. On the immutable URL, real cursor clicks at desktop opened the closed Compass, all three first directions, all six Luvia worlds and the final “Ein ruhiger Anfang” canvas with the exact new product introduction; the same immutable build opened all three first directions at 390 x 844 with zero horizontal overflow. On Stable, the retained `.80` controller upgraded to exact `.81`; DOMContentLoaded / load were 18.533 / 18.547 s, active/controller were `/sw.js?v=13.82.81`, no worker waited or installed and the delayed cleanup left only `luvia-shell-v13.82.81`. Real Stable clicks then opened Plan and routed its visible Places direction to the productive Places surface “Was möchtet ihr heute entdecken?”**.
- Rejected public evidence: **App 13.82.66 reached an immutable Integration version, but its visible Browser-Back sequence exposed a false legacy-login fallback. The mount watchdog incorrectly treated viewport intersection as mount health on the deliberately long Landing. App 13.82.66 receives no functional/public acceptance and is superseded by the `.67` connected-DOM/visibility correction**.
- Rejected visual evidence: **App 13.82.71 reached immutable Integration, but the opened Compass choices inherited the scroll-scene blur of their stage at large desktop sizes. App 13.82.71 receives no visual acceptance and is superseded by `.72`, where the active stage and both signposts remain at computed `filter:none` and opacity `1`**.
- Rejected cache-upgrade evidence: **App 13.82.73 passed immutable Desktop/Mobile E2E and 18 / 18 source-to-immutable byte parity, then failed the mandatory Stable upgrade path: the existing `.72` controller and the new worker's unbounded full-shell install fetches competed for the same network, leaving the document at `readyState: loading` and multiple runtime resources pending beyond 37 seconds. `.73` was immediately rolled back to the accepted `.72` version and receives no functional/public acceptance**.
- Rejected stale-controller recovery evidence: **App 13.82.74 bounded the install pool and passed its immutable E2E, byte parity and controlled `.72 -> .74` upgrade fixture. On the real Stable origin, however, a browser still controlled by the rejected `.73` worker remained at `readyState: loading` for more than 25 seconds because `.74` deferred registration until the page load that the stale controller prevented. App 13.82.79 then passed immutable and local controlled-upgrade checks and eventually replaced that real stale public controller without a second reload, with the exact `.79` controller, no waiting/installing worker and only `luvia-shell-v13.82.79` remaining. The document nevertheless required approximately 109.12 seconds to finish loading, so `.79` was also immediately rolled back to `.72` and receives no functional/public acceptance. `.80` moves recovery ahead of blocking assets and splits critical installation from post-load full-shell warming**.
- Superseded App 13.82.80 public evidence: **the exact retained toxic `.79` Stable controller upgraded cleanly to `.80`: DOMContentLoaded / load were 18.088 / 18.101 s, only the exact `.80` controller and cache remained, and real cursor clicks opened Plan and then Places correctly. A subsequent normal `.80` reload still required 16.715 s because the worker redownloaded every exact-build asset before consulting its warm cache. `.80` therefore proves the functional recovery but is superseded for performance by `.81`; it receives no final bounded Landing/Auth release acceptance**.
- Previous accepted public baseline: **App 13.82.72, Integration version `9bdfd528-d5b2-4773-8a0f-949cc6e37fe0`, deployment `852438a1-1bc8-45f5-9875-f26e59db16c9`; stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; immutable `https://9bdfd528-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Public deployment: **100% Integration version `bd31b237-5a5d-4028-b10c-3cd56bebfb65`, deployment `08372387-610f-4b8a-aa98-06be1f387acf`; stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; immutable `https://bd31b237-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Validation: **110 / 110 Safe Regression PASS; Landing/Auth contract, scope lock, release consistency, NFR-0 3 / 3, regenerated visual inventory and cross-Core DB ownership guard PASS**.
- State lock: **23 mandatory Landing/login/register/recovery/OAuth/session/invite/offline states remain binding; later Profile onboarding and First-Trip onboarding are explicitly separate and still open**.
- Explicitly still open: **persisted Compass-led Profile/preferences onboarding, first-trip onboarding, the remaining M16.5 Product Surface Matrix, complete one-to-one visual parity and joint Design Freeze. The architectural consolidation/bundling of roughly 250 active classic entry scripts also remains separate performance work; cache-first now prevents their redownload, but it does not remove their browser parsing/execution cost. No complete M16.5 functional/design acceptance is granted by this bounded Landing/Auth release**.
- Binding document: **`docs/modularization/M16.5S-LANDING-AUTH-BASELINE-AND-SCOPE-LOCK.md`**.
- Release rule: **publish only as one cohesive Landing/Auth Integration outcome and grant no functional/public acceptance before a real visible public E2E sequence on the exact deployed bytes**.
- Main / Production: **locked and verified unchanged after publication: Main `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`; Production deployment `578f13fc-8193-4988-88cf-93c94362fcc3`, version `0d26706b-8b79-4e05-b3b6-6c6314cc597c`; no database/schema/RPC/RLS/bucket migration, Edge Function, secret or manual Cloudflare configuration change**.
- Rollback: **redeploy immediate operational predecessor App 13.82.80 version `e3f8a523-677a-4da8-8a5e-23d7d1fd3d45` from deployment `772221df-175f-4325-9be4-c455f327a287`; if a deeper accepted public baseline is required, redeploy App 13.82.72 version `9bdfd528-d5b2-4773-8a0f-949cc6e37fe0` from deployment `852438a1-1bc8-45f5-9875-f26e59db16c9`. Code/assets only; no data rollback**.

## M16.5T Interactive Public Journey Compass / Memory Studio Release

- Runtime target: **App 13.82.87 / Core 4.82.87 / Integration Preview only**.
- Compass and access: **the layered hardware Compass remains the first public experience; crown, upper index and lower curved latch remain rigidly attached branded hardware. Real mouse/touch rotation, crown press and curved latch movement unlock it. “Animationen aus” opens it directly and persists without removing keyboard or screen-reader access**.
- Public navigation: **the duplicated destination links were removed from the header. The Compass remains the single product-navigation character; the header keeps only brand, motion preference and the two bounded Auth entries**.
- Memory tools: **the photo editor now applies eleven non-destructive, visibly measurable controls to one coherent image rather than a misaligned split comparison. The Reel Studio uses four locally bundled Pexels travel clips with matching scenes, functional 9:16/Story/Reel variants, exclusive soundtrack selection, hashtags and social interaction states**.
- Modern Memory Book Studio: **the book remains the visual stage while its editor is a dedicated dock below it rather than an overlay on the pages. Text, font, size, weight, alignment, colour, image focus, frame, corners, captions, shapes, stickers, page layout, page turn and sixteen travel themes are directly interactive**.
- Professional page design worlds: **ten distinct systems — Reisemagazin, Küstenliebe, Golden Hour, Postkarten, Atlas & Wege, Familienglück, Abenteuer, City Lights, Wüstenpoesie and Alpenruhe — replace flat colour fills. They use recurring chapter typography, controlled white space, full-image stages, map/topography motifs, paper/postmark details and photo-derived colour harmony based on current CEWE and Saal travel-book guidance**.
- Movable layers and photography: **custom text, decoration and up to four added photo layers can be selected, dragged by mouse or touch, nudged by keyboard and removed. Eight additional locally bundled Pexels travel photographs cover jungle, family, city, beach, Sahara, romance, road trip and mountains; exact creator/source/license provenance is recorded in `assets/public-landing/book-photo-sources.json`**.
- Responsive and motion evidence: **real Edge desktop mouse, hover, keyboard, Browser Back, reload, Reduced Motion, 390 × 844 and 320 × 673 CDP touch sequences pass without horizontal document overflow. The test performs actual layer movement/removal, format/theme switches, Compass hardware gestures and canvas return paths**.
- Cache/PWA: **exact `.87` worker/cache registration, explicit stale-cache maintenance and an offline reload of the current Landing/Compass assembly PASS. All new bundled video, poster and book-photo assets are part of the versioned app shell**.
- Validation: **110 / 110 Safe Regression PASS; release consistency, Landing/Auth contract, M16.5Q recovery, M16.5R Places continuity, real Edge M16.5T E2E, PWA E2E, NFR-0 3 / 3, cross-Core DB ownership and regenerated visual inventory PASS**.
- Immutable/public evidence: **25 / 25 release-critical runtime, CSS, script, photo, source-inventory, video and poster assets are byte-identical between the LF-clean runtime commit, immutable version and Stable Integration. On the immutable URL, real visible browser clicks opened the Compass through the motion-free access path, exposed all six worlds, opened Memory World and Fotobuch, changed Designwelt/frame/Reisethema/layout/page, added and removed a photo layer and returned to the same six-direction Living Compass without horizontal overflow**.
- Stable signed-in evidence: **the retained authenticated Stable session loaded exact App 13.82.87 assets, a real visible click opened Plan, and a real Compass click on Places routed after the designed exit animation to the productive “Was möchtet ihr heute entdecken?” Places surface. Stable PWA registration, controlled cache maintenance and offline reload PASS**.
- Public deployment: **100% Integration version `8a2ce6c8-96d4-473c-a8a9-0866ec471b9b`, deployment `b57da617-ec11-43f3-95ec-1c648567080b`; stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; immutable `https://8a2ce6c8-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Explicitly still open: **physical-handset confirmation of this public Landing/Memory-Studio slice, persisted profile/preferences onboarding, first-trip onboarding, remaining M16.5 Product Surface Matrix, complete one-to-one visual parity and joint Design Freeze. The Memory editor/Reel/Fotobuch functions are an interactive public preview, not a claim that the full productive export/print pipeline already exists**.
- Main / Production: **locked and verified unchanged after publication: Main `c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`; Production deployment `578f13fc-8193-4988-88cf-93c94362fcc3`, version `0d26706b-8b79-4e05-b3b6-6c6314cc597c`**.
- Rollback target: **the currently accepted Integration App 13.82.81 version `bd31b237-5a5d-4028-b10c-3cd56bebfb65`, deployment `08372387-610f-4b8a-aa98-06be1f387acf`; code/assets only, no data rollback**.

## M16.5Q Living Compass Recovery Candidate

- Runtime target: **App 13.82.64 / Core 4.82.64 / Integration Preview only**.
- Acceptance correction: **App 13.82.63 was published with the corrected Moment routing and smooth selection needle, but the mandatory visible public E2E intentionally did not grant acceptance: the productive Places-owned “Living Compass öffnen” control restored Plan for one event phase and the broad delegated `[data-view]` ancestor matcher then reinterpreted the same click as the surrounding Places route, immediately sending the app back. App 13.82.63 is therefore superseded; App 13.82.64 is the combined candidate**.
- Measured root cause: **real Edge CDP touch input reproduced the unchanged `.61` failure at only 18 CSS pixels of normal finger drift: `pointerdown` → `pointermove` → `pointercancel`, with the URL remaining on Plan. F12 responsive mode and perfect `.tap()` automation did not exercise that hardware path. A delayed compatibility click could additionally land after the Compass DOM had already changed**.
- Physical-touch correction: **the non-scrolling radial direction owns touch panning with `touch-action:none`; touch uses a bounded 32 px slop while mouse remains at 20 px; the exact direction is latched from press to release; the delayed compatibility click is suppressed for the route handoff, and any new real pointer gesture immediately clears that guard**.
- Moment-routing correction: **Reise → Live-Momente and Erinnern → Moment bewahren now retain the accepted `capture` intent and open the distinct “Diesen Moment bewusst bewahren.” Media → Memory focus. Erinnern → Mediathek alone opens the existing Fotogalerie. The originating Reise/Erinnern context is retained for navigation selection and return**.
- Needle correction: **selection first samples the currently rendered idle-needle transform, freezes that exact frame, disables idle ownership and then animates the shortest signed path to the chosen direction for 760 ms with the accepted soft easing. CSS no longer competes for the same transform. Reduced Motion remains immediate and cleanup removes all inline animation state**.
- Route-host replay correction: **delegated navigation now recognizes `data-view` only on an interactive button/link/role-button control. The structural `.lv-view-host[data-view]` is no longer a clickable ancestor. A Places-owned Compass return click therefore cannot bubble into a second Places route command after the Plan stage has already mounted**.
- Compass design and cleanup: **the accepted M16.5 carrier/mark handoff, reverse-old/forward-new constellation sequence, playful radial entry, direct selected needle, Profile entry, detached source Compass, coupled reverse exit, idle float/pendulum, focus/inert/ARIA cleanup and monotonic routing remain unchanged**.
- Places/Map and Cache/PWA: **productive bidirectional map/list behavior and late-callback fencing remain intact. The expected `.64` cache derives from the active script release; normal registration preserves the live controller/cache, while explicit maintenance and controlled activation remain available**.
- Local visible browser evidence: **real Edge desktop pointer/hover/keyboard/reload/Back, the productive Places-owned Compass return control, all eight 1920 × 1020 Plan directions, 390 × 844 / 360 × 740 / 320 × 673 touch layouts, Reduced Motion and the complete reference-timed motion sequence PASS. Hardware-path `Input.dispatchTouchEvent` with 18 px drift routes Plan → Places, Plan → Booking, Reise → Live-Momente, Erinnern → Moment bewahren and Erinnern → Mediathek exactly. The measured mobile needle trace starts continuously from its last idle frame, contains intermediate frames, follows a monotonic shortest path and settles without a snap**.
- Local PWA evidence: **PASS on the versioned `.64` Integration assembly: normal registration preserved the controlling worker, active cache and live document; explicit maintenance removed only the deliberate stale cache; offline document and Compass CSS reload remained available**.
- Candidate validation: **106 / 106 Safe Regression PASS; regenerated visual inventory freshness 2,788 tracked / 672 visual / 59 CSS PASS; NFR-0 3 / 3 PASS; Active Trip Context 2 / 2 PASS; cross-Core DB ownership guard PASS at 363 tracked JS/TS without debt growth; release consistency, M16.5Q static gate, real Edge Compass E2E and real Edge PWA E2E PASS. The authenticated stable-origin real-CUA sequence and 8 / 8 stable/immutable/source asset parity are also PASS**.
- Public status: **App 13.82.64 is deployed at 100% on Integration as version `20ad47c4-0a93-4d1b-ad91-9ff9f8c372ef` in deployment `c6878f00-0c18-457f-bd58-7c8b293e3736`. Real visible clicks proved Plan → Places, the productive Places → Compass return without route-host replay, Reise → Live-Momente and Erinnern → Moment bewahren as the distinct capture focus, Erinnern → Mediathek as the sole gallery route, smooth intermediate needle frames, Browser Back, reload and a clean console. The user then repeated the corrected flow on a physical handset against the stable Integration origin and explicitly reported the last correction as working without the prior routing failure. M16.5Q physical-handset acceptance is therefore PASS for App 13.82.64; this does not grant the still-pending complete M16.5 Design Freeze**.
- URLs: **stable `https://integration-luvia.njwnrvwbv5.workers.dev/`; immutable `https://20ad47c4-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Rollback: **will target the immediately previous App 13.82.63 Integration version `47b0bb06-2052-403a-a2ec-ec0d80e2e1cd` from deployment `cdd969db-a8f2-4bef-a8ca-ce667b022acb`; it is operational fallback only, not an accepted candidate; no data rollback**.
- Main / Production: **locked and unchanged**.
- Database/schema/RPC/RLS/bucket migration, Edge Function, secret or manual Cloudflare configuration change: **NONE**.

## M16.5N–P Productive Places Spatial Experience

- Runtime target: **App 13.82.54 / Core 4.82.54 / Integration Preview**.
- Places owner hardening: **only complete finite WGS84 pairs inside latitude
  `[-90, 90]` and longitude `[-180, 180]` are projected; provider `location`
  is supported and all invalid or half pairs become `null`**.
- Productive composition: **Plan → Places now opens the accepted light spatial
  search with real owner-backed categories, six-to-eighteen result breadth,
  exact markers, synchronized map/list selection, filters and explicit runtime
  states**.
- Corporate map: **MapLibre 5.12.0 with Luvia-light layer treatment; results
  remain usable when the remote map library or style is unavailable**.
- Owner boundaries: **Places, Booking and external navigation are called only
  through their public contracts or Platform ports; Consumer owns no Place
  Domain Truth and creates no synthetic coordinate**.
- Compass correction: **non-selected directions fade at their orbital position
  and no longer visually collapse toward a shared lower-right/central point**.
- Step 5 status: **PRODUCTIVE PLACES ACCEPTED ON INTEGRATION — authenticated
  responsive-browser acceptance is complete; physical-handset review and the
  complete Booking visual migration continue next**.
- Candidate validation: **105 / 105 Safe Regression PASS; regenerated visual
  inventory 2,783 / 668 with 59 CSS files; NFR-0 3 / 3 and cross-Core DB guard
  PASS without debt growth**.
- Public Integration runtime: **version
  `5d722f6f-60a0-4c4f-b728-3a1af9b5201e`, deployment
  `5f8b9bd5-7ec4-4743-8f72-f3a8d9d8a1ca`, 100% traffic, 17 / 17 changed
  assets byte-exact to runtime commit
  `a51880d6547c3fe417316e1d705d204705338bfe`**.
- Authenticated Browser proof: **Plan → Places transition, stationary fade for
  non-selected directions, productive 18-result search, 6→8 progressive cards,
  open-now filter, 8 / 8 coordinate-qualified markers, loaded detail evidence,
  X → Today cleanup, standalone Luvia Compass → AI Chat and zero horizontal
  document overflow at the measured mobile breakpoint PASS**.
- Release status: **Integration only; Main and Production remain locked and
  unchanged pending complete joint visual acceptance and Design Freeze**.
- Database/schema/RPC/RLS/bucket migration: **NONE**.
- Supabase Edge Function / secret / manual Cloudflare configuration change:
  **NONE**. The dedicated `integration-luvia` version/deployment changed;
  Production Worker `luvia` remained exactly on deployment
  `578f13fc-8193-4988-88cf-93c94362fcc3` and version
  `0d26706b-8b79-4e05-b3b6-6c6314cc597c`.

## M16.5E–G Living Product Foundation Candidate

- Experience foundation: **official Living Compass vector family, active-Trip
  palette derivation, semantic motion/haptics and Web/SwiftUI/Compose mapping**
  at `afddfca01f1b5a0f9d6083a1dceb83b3a3949eef`.
- Consumer vertical slice: **productive Signed-in Shell, five target navigation
  meanings and continuous Today/Journey composition** at
  `e1e4b5fce80c854bba745f9bb12e1ef0c4bda74d` on Integration.
- Platform release candidate: **global root logo, SVG/ICO favicon and 192/512
  PWA icons adopt the official Living Compass asset set; active entry and
  Service Worker advance together to App 13.82.50 / Core 4.82.50**.
- Design status: **FOUNDATION ACTIVE / JOINT VISUAL REVIEW PENDING / DESIGN
  FREEZE NOT YET COMPLETE**.
- Production remains on **13.82.49 / 4.82.49** until authenticated desktop and
  mobile Integration Preview acceptance succeeds.
- Database/schema/RPC/RLS/bucket migration: **NONE**.
- Supabase Edge Function and secret change: **NONE**.
- Manual Cloudflare configuration change: **NONE**.
- Candidate validation: **96 / 96 Safe Regression PASS; NFR-0 3 / 3 PASS;
  full visual inventory PASS at 2,761 tracked files and 658 visual candidates**.

## M16 Runtime Assembly

- Scope: **Confirmed Owner Actions, Action Ledger, capability/connection diagnostics and expanded rich-result chat**
- Runtime release target: **App 13.82.48 / Core 4.82.48**
- Runtime source: `0d7468596dbdb42803738f427d4355bf31281c65`
- Intelligence owner feature: `808f99af1d791614581244d51a107459dd3f0c87`
- Action surface: **intelligence.actions.v1 / 19 actions / 6 public owner contracts / R0-R3**
- Action Ledger: **intelligence.action-ledger.v1 / digest-only / no raw payload / no foreign Domain Truth**
- Chat results: **Places, Journey, Trip, Booking, Memory and Identity projections plus confirmation and receipt cards**
- Safe execution: **R0 registered reads only; R1 direct gesture; R2/R3 explicit confirm/cancel; idempotency and owner receipts**
- External uncertainty: **R3 unknown outcome blocks blind retry until owner reconciliation**
- Platform runtime registration: **Contract → Ledger → Runtime → Chat load order PASS; Service Worker and Core Registry PASS**
- Safe Regression: **90 / 90 PASS**
- NFR-0: **3 / 3 PASS**
- Cross-Core DB guard: **361 tracked JS/TS; static 310; mapped 30/30; unmapped 39/39; dynamic 27/27; no growth**
- Runtime registration and shared Experience styling: **FEATURE STREAMS COMPLETE**
- Integration Preview `ae43731e-d8d8-4819-b271-020d276b55cf`: **both URLs 17/17 exact, 5/5 private and 5/5 retired fallback; six-owner authenticated read acceptance, R2 confirm/cancel, mobile PASS; 25/25 F5; console 0**
- Main promotion: **FF-only PASS**
- Production version/deployment `a17a3bbf-2519-4fe2-a35a-64c25fe55186` / `213ac503-00e4-4855-8059-dd61d2e6ca6a`: **100%; both URLs 17/17 exact, 5/5 private and 5/5 retired fallback; six-owner authenticated reads PASS; 25/25 F5; console 0**
- Database / schema / RPC / RLS / bucket migration: **NONE**
- Supabase Edge Functions / secrets: **UNCHANGED**
- Manual Cloudflare configuration: **NONE**
- Eight-stream documentation synchronization: **PENDING THIS CLOSEOUT MARKER**

## M16.5 Complete Visual Redesign / Admin, Social and Core-stream Foundation

- Scope: **complete visual, graphical and interactional redesign inventory plus mandatory Admin/Governance, strategic Social/Experience Graph ownership and Core-aligned GitHub streams**
- Runtime App / Core: **13.82.87 / 4.82.87 Integration-only public Journey/Hardware Compass candidate carrying the accepted Living Compass, corrected Media → Memory routing, stable Places continuity and the expanded public Landing; physical handset confirmation, complete profile/trip onboarding, remaining Product Surface Matrix, visual parity and Design Freeze remain pending**
- Architecture implementation chain: `6880e881fd433d28e75396502adee12af528fb8b` -> `3679a06fbaf45b132dac2238ba198d658b5ceb02` -> `f44036bf7e62e2557585142845f53ffa553ce4d7`
- M16 runtime source before the M16.5C continuity release: `0d7468596dbdb42803738f427d4355bf31281c65`
- M16.5 status: **BINDING VISUAL PARITY LOCK ACTIVE; the accepted Corporate Design is the required productive endpoint, the outer Signed-in shell is adopted, and the remaining feature stages are migrated without substitution before joint Design Freeze**
- Exhaustive manifest: **2,841 tracked files; 714 visual candidates; 268 active entry references; 0 unclassified entry references**
- Canonical CSS baseline: **61 files; 1,170,835 LF-normalized bytes; 9,669 lines; 3,387 `!important`; 3,365 literal hex colours; 420 z-index declarations; 54 reduced-motion queries; 81 focus-visible selectors**
- Design inventory includes: **all screens, routes, modules, deep links, overlays, cards, boxes, containers, forms, maps, media, chat/Rich Results, hidden and recovery states, Hover/Press/Focus/Drag/Scroll transitions, desktop/tablet/mobile Web and SwiftUI/Compose adaptations**
- Administrative Experience: **a separate design surface; the Consumer Control Center is not renamed or treated as Admin**
- Admin/Governance Core: **mandatory architecture reservation with default-deny, least privilege, server-side policy, roles/capabilities/scopes, grants, delegation, four-eyes approvals, step-up, break-glass, immutable audit and last-Superadmin protection**
- Admin runtime/schema/UI claim: **NOT IMPLEMENTED; planned for M18.5 after a dedicated security, RLS and migration gate**
- Social/Experience Graph Core: **strategic anti-vanity Social Travel Intelligence reservation for consented graph/relationship state, Travel Twins, Echoes, Drops, Fork provenance and inspiration signals; Collaboration membership and all foreign Domain Truth remain excluded**
- Social runtime/schema/UI claim: **NOT IMPLEMENTED; planned for M18.6 after consent/threat model and the M16.5 Design Freeze**
- Topology correction: **the synchronized 19-stream marker `3f0e135d8ea006fbd964e010854107d12aa13387` is retained as superseded intermediate evidence; the pre-existing Social branch/worktree is reactivated as the twentieth owner lane**
- Active GitHub topology: **20/20 registry streams at `41c02f6cf6a36d85eecba3f02a7c7a7a38e4444f`; Local = Tracking = live Remote; divergence 0/0; clean**
- Safe Regression: **110 / 110 PASS with the M16.5T public Journey/Memory Studio gate**
- NFR-0: **3 / 3 PASS**
- Cross-Core DB guard: **363 tracked JS/TS; static 310; mapped 30/30; unmapped 39/39; dynamic 27/27; no growth**
- Rejected/superseded evidence: **the first Integration manifest comparison failed because identical Git text blobs were checked out with different LF/CRLF working-copy endings; Integration was not advanced until canonical LF text provenance was used. The later 19-stream closeout was technically valid but product evidence proved Social has separate Truth, so it is superseded by the 20-stream correction rather than rewritten as final**
- Database / schema / RPC / RLS / bucket migration: **NONE**
- Supabase Edge Functions / secrets: **UNCHANGED**
- Runtime assets / Cloudflare / Preview / Production: **M16.5H–M establish the productive Living Shell, no-substitution gate and corrected embedded Plan Compass; M16.5N–P add owner-backed productive Places before a new immutable Integration Preview, while Main and Production remain on 13.82.49 / 4.82.49**
- Next design gate: **execute the binding `M16.5-DESIGN-INTEGRATION-AND-FEATURE-PRODUCTIZATION-PLAN.md` through rollback-capable vertical outcomes. The live Surface and Core/Owner matrices begin with the open Places Details/Evidenz rail-continuity defect, then public Landing/real Auth, Profile onboarding, First-Trip Composer, the complete Places Golden Slice, Booking, Today/Journey and Media/Memories before the user's explicit Design Freeze and any separate Main/Production decision**
- M16.5C direction: **Q/R visual base plus B/D/E/F/G functional DNA; bright open canvas, travel warmth, mobile-first, active-Trip accent and one continuous public-entry/onboarding/product story**
- Target primary navigation: **Heute / Planen / central Luvia / Reise / Erinnern; Wallet, Booking, Collaboration, Profile/Settings, Attention, Social and Admin remain contextual owner-backed flows**
- Design-only prototype: **cinematic landing, complete first-Trip onboarding, desktop/mobile target navigation, reversible scroll reveals and reduced-motion parity; no production Trip write and no broad visual deployment**
- Runtime continuity defect: **obsolete intermediate module splash removed; isolated single-cycle route transition is Production verified**
- M16.5C runtime source: `0e8d6c51972f1aa4d6873707e8d02206cbe3957f`
- M16.5C Consumer feature: `b1ea5efd7ab27de8bc5140eb621369a8b01865a3`
- Integration Worker `73a3eda8-c83f-46fe-9db0-23221bf19bf7`: **8/8 exact Git runtime assets; authenticated 25/25 F5; one final route host; obsolete module intros 0; console 0**
- Main promotion: **fast-forward only to `0e8d6c51972f1aa4d6873707e8d02206cbe3957f`; 93/93 PASS**
- Production Worker `48770d4e-5a97-4a81-8543-1c42626995c9`: **custom and direct URL 16/16 exact Git runtime assets; authenticated 25/25 F5; one final route host; obsolete module intros 0; console 0**
- M16.5C deployment scope: **single-cycle App Shell navigation continuity only; Design-only landing/onboarding/target-navigation prototype remains undeployed**
- M16.5C infrastructure: **no DB/schema/RPC/RLS/bucket migration, no Supabase Function or secret change, no manual Cloudflare configuration change**
- M16.5C rollback: **redeploy raw runtime blobs from pre-release marker `4128db468dd1fbed5b57bd3dd0fc58937c592029`; no data rollback**
- M16.5D design decision: **public landing and onboarding are the binding motion/visual benchmark; account/profile plus full Reisekompass are separated from the complete first-Trip Composer**
- M16.5D interaction decision: **semantic Magnetic/Haptic Experience grammar with Web adapter and native iOS/Android mappings; no direct device dependency in Domain Cores**
- M16.5D prototype scope: **profile-onboarding, Trip identity, canonical place, travel mood, dates, Collaboration handoff, seven product modules, privacy, active-Trip accent and review; Design-only and not deployed**

## M15 Runtime Release

- Scope: **Actionable Intelligence, owner-backed Rich Results, restaurant/day pilot and Places discovery reliability**
- Runtime release: **App 13.82.47 / Core 4.82.47**
- Runtime source: `d39ed496d45b38cc6722cd0668d25f99e490940c`
- Action contract: **intelligence.actions.v1 / 6 registered actions / 6 rich-result kinds**
- Safe auto-run: **registered READ + NEVER confirmation only**
- Explicit owner actions: **Places favorite/plan, Booking flow and Journey planning editor require a direct user gesture**
- Rich conversation: **provider-backed Place cards with image/evidence/actions, Journey Day Plan, immutable owner receipts and unchanged text fallback**
- Places incident correction: **verified dietary provider evidence preserved; false/unknown/conflicting evidence remains rejected**
- Places breadth: **up to 60 unique candidates across at most 5 query variants; up to 18 ranked results progressively visible in 6-result steps**
- Journey/Timeline ownership: **separate cross-domain aggregator retained**
- Database / schema / RPC / RLS / bucket migration: **NONE**
- Supabase Edge Functions: **booking-route-resolve 2.5.1 – request-scoped allowlisted CORS for Production, Integration and immutable Luvia Preview origins**
- Supabase secrets: **UNCHANGED**
- Manual Cloudflare configuration: **NONE**
- Safe Regression: **84 / 84 PASS**
- NFR-0: **3 / 3 PASS**
- Cross-Core DB guard: **360 tracked JS/TS; static 310; mapped 30/30; unmapped 39/39; dynamic 27/27; no growth**
- Booking route Function: **2.5.1 / Supabase deployment version 11 / CORS matrix 6/6 PASS / exact Diercksen route PASS**
- Integration Preview `ae4fdd36-3b54-4f0f-a072-bbbdd30cc37c`: **both URLs 15/15 byte-exact, 5/5 private and 5/5 retired fallback, authenticated Rich Result/mobile/keyboard PASS, 25/25 F5 at 3.963-6.562 seconds (average 4.625 seconds), console 0**
- Main promotion: **FF-only PASS**
- Production version/deployment `3f12dc7d-5332-4521-b38c-3cc36f7b38b1` / `e36fe7ad-97a6-4654-97bd-e425653753ad`: **100%, both URLs 15/15 byte-exact, 5/5 private and 5/5 retired fallback, authenticated Rich Result PASS, 25/25 F5 at 3.571-6.625 seconds (average 4.269 seconds), console 0**
- Eight-stream documentation synchronization: **PENDING THIS CLOSEOUT MARKER**

## M14 Runtime Release

- Scope: **App Shell Runtime Clarity, proof-based Paris Legacy Retirement and Conversational Luvia AI**
- Runtime release: **App 13.82.45 / Core 4.82.45**
- Runtime implementation, Integration and Main commit: `41a1b651c24dcc300454043fcca8d99bf515b6dc`
- Feature commits: Consumer `5c5abb54885c3625a147be01064a11921ac082cb`; Intelligence `2794645e25a2303d76846efb6d3ecbd1aa7d3ce3` and `e3846cb9775e90a35829b12d37acdd7806bcee9f`; Experience `1c8730d48534e6c564af22f0f774ab42a32f1d0` and `6ede24b86ba89526ae4ff20faa4c3f611e0ec41e`
- App Shell runtime assets: **one declarative registry, one generic deduplicated loader, bounded timeout and diagnostics**
- Retired unreachable Paris UI copies: **5 files / 7,702 deleted legacy lines; recoverable from Git**
- Retained active Paris compatibility boundaries: **3 paths with explicit replacement and removal gate**
- Luvia AI composer: **visible submit, Enter submit, Shift+Enter newline, IME guard, in-flight guard, persistent conversation and contextual follow-ups**
- Experience acceptance: **separate conversation scroll region, fixed actions, dynamic viewport/safe-area support, reduced motion and 44+ px targets**
- Domain command authority added to Intelligence: **NO**
- Safe Regression: **74 / 74 PASS**
- NFR-0: **3 / 3 PASS**
- Cross-Core DB guard: **357 tracked JS/TS; static 310; mapped 30/30; unmapped 39/39; dynamic 27/27; no growth**
- Database / schema / RPC / RLS / bucket migration: **NONE**
- Supabase Edge Functions / secrets: **NONE**
- Provider or manual Cloudflare configuration: **NONE**
- Integration Preview version `2225b653-d0b0-4154-b000-47d49266f513`: immutable URL and stable alias each **9/9 byte-exact Git blobs**, **5/5 private-path** and **5/5 retired-path SPA fallback**, authenticated chat/keyboard/responsive acceptance, final **25/25 F5** at **3.552-4.789 seconds** (average **4.150 seconds**) and console **0/0**
- Main promotion: **FF-only PASS**
- Production version/deployment `5ecb0362-579f-4c7d-a8b3-c50b12572823` / `935193e9-ba4a-42e4-aee7-36909ba63b90`: **100%**
- Production immutable URL and `myluvia.app`: each **9/9 byte-exact Git blobs**, **5/5 private-path** and **5/5 retired-path SPA fallback**
- Production authenticated chat/keyboard/responsive acceptance: **PASS**; final **25/25 F5** at **4.553-7.932 seconds** (average **5.725 seconds**), active Ostseeurlaub/Scharbeutz retained and console **0/0**
- Eight-stream documentation synchronization: **pending this closeout marker**
- Cloudflare causation: **not inferred**; active versions were observed after Git promotion and Cloudflare reports source/version/deployment without a Git commit annotation

## M13 Runtime Release

- Scope: **Memory Core Isolation and Premium Memories & Story Composition**
- Runtime release: **App 13.82.44 / Core 4.82.44**
- Canonical Memory contract: **memory.v1 / LuviaMemoryContractV1**
- Browserless Memory domain rules: **PASS**
- Private Memory provider references to `LuviaMediaCore`: **4 -> 0**
- Premium Memories: **responsive library, search, filters, bounded selection, signed previews, story draft/publish and transfer status**
- Experience owns Domain Truth: **NO**
- Runtime implementation, Integration and Main commit: `8fa43791f960cb1c5e8e67e253b5676d8dd46e6b`
- Platform foundation commit: `1778fad04a0131da0f91e1b65de9fe7fa19b2962`
- Safe Regression: **71 / 71 PASS**
- NFR-0: **3 / 3 PASS**
- Database / RPC / RLS / bucket migration: **NONE**
- Supabase Edge Functions / secrets: **NONE**
- Manual Cloudflare configuration: **NONE**
- Integration Preview version `9dfe232e-15de-4aad-a965-955f7607845e`: **12/12 byte-exact Git blobs**, **5/5 private-path SPA fallback**, authenticated Memories/AI/focus/mobile acceptance, **25/25 F5** at **3.395-5.940 seconds** (average **4.166 seconds**) and console **0/0**
- Main promotion: **FF-only PASS**
- Production version/deployment `a5aa7b3f-0cd1-4b38-a12d-c3102478f214` / `98b1f425-fc75-4eca-b7b1-b1eae69becbe`: **100%**
- Production version URL and `myluvia.app`: each **12/12 byte-exact Git blobs** and **5/5 private-path SPA fallback**
- Production authenticated Memories/AI/focus/mobile acceptance: **PASS**; final **25/25 F5** at **2.667-4.238 seconds** (average **2.956 seconds**), active Ostseeurlaub/Scharbeutz retained and console **0/0**
- Eight-stream runtime synchronization on `8fa43791f960cb1c5e8e67e253b5676d8dd46e6b`: **8/8 PASS**
- Cloudflare causation: **not inferred**; active versions were observed after Git promotion and Cloudflare reports the deployment source without a Git commit annotation

## M5.1e Closeout

- Scope: **Active App Shell Trip Contract Adoption**
- Runtime release: **App 13.82.5 / Core 4.82.5**
- Implementation commit: `9a148a45af93c8ea2cf4ef5ddd3d3d4f244d155a`
- Implementation parent: `93f94b0276450aa841fccae9e29b0b9b8094f561`
- Trip truth owner: **Trip Core**
- Active App Shell Trip reads: **Trip Contract v1**
- Direct `LuviaTripStore` access in active App Shell: **0**
- Direct `LuviaTripContext` access in active App Shell: **0**
- Active App Shell Trip subscription: **Trip Contract v1**
- Legacy `core/app/app-shell-v11.js`: **out of confirmed active runtime scope / unchanged**
- Focused M5.1e regression: **PASS**
- Controlled Safe Regression: **21 / 21 PASS**
- Integration promotion: **PASS**
- Integration Preview static verification: **PASS**
- Integration Preview authenticated runtime + reload smoke: **PASS**
- Integration Preview browser console: **0 visible warnings / 0 visible errors**
- Main promotion: **PASS**
- Production deployment: **PASS**
- Cloudflare Production Version ID: `854e33a3-9c9f-4426-9173-aee3b63c93f5`
- Production static release identity: **PASS**
- Production App Shell exact-match verification: **PASS**
- Production authenticated runtime + reload smoke: **PASS**
- Production browser console: **0 visible warnings / 0 visible errors**
- Six-stream runtime synchronization: **6 / 6 PASS**
- Six-stream runtime snapshot: `9a148a45af93c8ea2cf4ef5ddd3d3d4f244d155a`
- Six-stream divergence: **0 / 0**
- Six-stream worktrees: **clean**
- Database migration: **NONE**
- Supabase Edge Function change: **NONE**
- Supabase Secret change: **NONE**
- Cloudflare Secret change: **NONE**
- Provider configuration change: **NONE**
- M5.1e status: **COMPLETE**
- M5 status: **IN PROGRESS**

## Current Scope

M5.1e migrates the confirmed active production App Shell from direct Trip Store / Trip Context consumption to the canonical `trip.v1` boundary.

`app/app-shell.js` now reads Trip state through `LuviaTripContractV1` / `LuviaTripContract` and observes Trip switches through the Contract subscription.

The App Shell keeps only a local render projection required by its existing UI state (`activeTripId`, `hasTrips`, `hasActiveTrip`, `loaded`). This projection is derived from Contract reads and is not an independent or persisted Trip truth source.

Existing Trip-switch behavior for Profile, Timeline, Destination, Collaboration and shell rerendering remains part of the acceptance boundary.

`core/app/app-shell-v11.js` remains unchanged because the M5.1e reachability gate did not prove it to be part of the active runtime path.

Promotion remains:

`feature/platform-core -> integration -> controlled regression -> integration preview -> main -> production`
## M5 Status

- M5.1a – Travel Identity Trip Contract Adoption: **COMPLETE / PRODUCTION VERIFIED / SIX STREAMS SYNCED**
- M5.1b – Gallery View Trip Contract Adoption: **COMPLETE / PRODUCTION VERIFIED / SIX STREAMS SYNCED**
- M5.1c – Booking Inbox Trip Contract Adoption: **COMPLETE / PRODUCTION VERIFIED / SIX STREAMS SYNCED**
- M5.1d – Booking Control Center Trip Contract Adoption: **COMPLETE / PRODUCTION VERIFIED / SIX STREAMS SYNCED**
- M5.1e – Active App Shell Trip Contract Adoption: **COMPLETE**
- M5 Durchführung Punkt 1 – weitere direkte Trip-Reads: **IN PROGRESS**
- M5 Durchführung Punkt 2 – Active Trip Context zentralisieren: **PENDING**
- M5 Durchführung Punkt 3 – Membership/Timeline/Schedule Reads: **PENDING**
- M5 Exit Gate: **NOT YET CLAIMED**

## M5.1c Release Evidence

- Test-first boundary proof against unchanged Runtime: **EXPECTED RED — 0 / 3 PASS, caused by `LuviaTripStore`, `LuviaControlCenterTravelIdentity` and missing `trip.v1` usage**
- Existing controlled baseline before Runtime implementation: **18 / 18 PASS**
- JavaScript syntax checks for Runtime, focused test and controlled runner: **PASS**
- Targeted Booking Inbox Trip Contract regression after Runtime implementation: **3 / 3 PASS**
- Compatible Booking Actions / Intelligence boundary check: **PASS**
- Controlled safe regression on `feature/platform-core`: **19 / 19 PASS**
- Direct Inbox Store/Context/Travel-Identity references: **0**
- Direct Inbox DB/RPC, Trip-event, Trip-subscription and Trip-command references: **0**
- Cross-Core DB ownership debt growth: **NONE**
- Runtime diff: **3 insertions / 3 deletions in the approved Trip read helpers only**
- Controlled runner diff: **exactly one M5.1c entry; 19 unique paths; 0 duplicates**
- Release consistency (`13.82.2` / Core `4.82.2`): **PASS**
- Exact staged allowlist: **12 / 12 PASS; zero unstaged and zero untracked files; cached diff check PASS**
- Staged Runtime / runner / index gates: **3 / 3 Runtime numstat; one runner entry; 214 App cache tokens and unchanged asset/load order**
- Complete syntax, Contract, release, guardrail and controlled regression after staging: **PASS — 19 / 19**
- Implementation release commit: `83aae200b77aa7791f1d8d51b471af07506bdc0a`
- Implementation parent / approved PCR commit: `f3f7431b2db8344e34d716daed33e10559d9f7cf`
- Feature push: **PASS** — local, tracking and live Remote synchronized at the implementation commit
- Integration fast-forward: **PASS** — no merge commit
- Integration controlled regression: **19 / 19 PASS**
- Integration Preview static verification: **PASS** — App 13.82.2 / Core 4.82.2 JavaScript assets served as `text/javascript`
- Integration Preview authenticated runtime smoke: **PASS**
- Main fast-forward: **PASS** — no merge commit
- Main push: **PASS** — local, tracking and live Remote synchronized at the implementation commit
- Main controlled regression after promotion: **19 / 19 PASS**
- Production static verification: **PASS** — App 13.82.2 / Core 4.82.2
- Production authenticated runtime smoke: **PASS**
- Production browser console: **0 errors / 0 warnings**
- Six-stream synchronization: **6 / 6 PASS at `90fde6c458e4589d92dcc747978cac3853260e1d`; local, tracking and live Remote synchronized with divergence `0 / 0` and clean worktrees**
- M5.1c Cloudflare Worker version / deployment ID: **NOT CLAIMED — no direct identity evidence recorded in this closeout**
- Database/Functions/Storage/Secrets impact: **NONE**

## M5.1c Completion Boundary

M5.1c is **COMPLETE** for implementation, controlled validation, Integration, Preview, Main, Production and active-stream synchronization.

Final evidenced six-stream acceptance snapshot:

`90fde6c458e4589d92dcc747978cac3853260e1d`

At that snapshot all six active streams matched locally, in their tracking refs and live on GitHub, with divergence `0 / 0` and clean worktrees.

This later COMPLETE-marker documentation change does not pre-claim its own future commit SHA or its own promotion/synchronization. That administrative marker commit must still be inspected and propagated through the normal Git path.

M5 itself remains **IN PROGRESS**. The M5 exit gate remains **NOT YET CLAIMED**.
## M5.1b Release Evidence

- JavaScript syntax checks: **PASS**
- Targeted Gallery Trip Contract regression: **3 / 3 PASS**
- Controlled safe regression on feature, integration and main: **18 / 18 PASS on each branch**
- Direct Gallery TripStore/TripContext/AppState references: **0**
- Direct Gallery DB/RPC and legacy Trip-event references: **0**
- Cross-Core DB ownership debt growth: **NONE**
- Release consistency (`13.82.1` / Core `4.82.1`): **PASS**
- Implementation scope: **12 / 12 PCR-approved files**
- Implementation release commit: `68e7ff5433e4581eb3c19ef98934302736be84ec`
- Parent baseline: `0a2aa60564a75f4723ca11807905f669702e2437`
- Feature, integration and main promotion: **PASS — fast-forward only, no force push**
- Integration Preview static and authenticated runtime smoke: **PASS**
- Production static and authenticated runtime smoke: **PASS**
- Live browser evidence: active Trip, Gallery load/reload, 51 photos, 10 moments and console **0 errors / 0 warnings**
- Deterministic state-variation evidence: Trip switch, current-Trip download label and no-Trip fallback **3 / 3 PASS**
- Six active streams synchronized locally, in tracking refs and live on GitHub: **6 / 6 at `68e7ff54`, divergence `0 / 0`, clean trees**
- Database/Functions/Storage/Secrets impact: **NONE**

The 6 / 6 clean-tree statement records the runtime-release snapshot at `68e7ff54` before this four-file documentation closeout. The later closeout commit is not pre-claimed and must be inspected, promoted and synchronized separately.

## M5.1a Release Evidence

- Structural release gate: **PASS**
- JavaScript syntax checks: **PASS**
- Release consistency (`13.82.0` / Core `4.82.0`): **PASS**
- Targeted Travel Identity regression: **PASS**
- Safe Regression: **17 / 17 PASS**
- Cross-Core DB ownership debt growth: **NONE**
- Database/Functions/Storage/Secrets impact: **NONE**
- Release commit: `b4ffe88deddd726854f90e4fff48867deb3a91f9`
- Parent baseline: `de79c904a7aec99975acbf720abc3084714fb152`
- Feature, integration and main promotion: **PASS**
- Integration and main controlled regression: **17 / 17 PASS** on each branch
- Integration preview static and authenticated runtime smoke: **PASS**
- Production static and authenticated runtime smoke: **PASS**
- Six active streams synchronized locally and remotely: **6 / 6 at `b4ffe88d`, divergence `0 / 0`, clean trees**

## Previous M4 Baseline

- M4.1 – Parallel Repository Topology Foundation: **COMPLETE**
- M4.2 – Ownership & Cross-Core Repository Guardrails: **COMPLETE**
- M4.3 – Feature Flag & Regression Harness Foundation: **COMPLETE**
- M4.4 – Integration / Preview / Merge Proof: **COMPLETE**

**M4 – Parallel Development Foundation: COMPLETE**

**PARALLEL DEVELOPMENT READY: YES**

## Repository Topology

Verbindliche Branches:

- `main`
- `integration`
- `feature/platform-core`
- `feature/booking-core`
- `feature/consumer-experience`
- `feature/social-experience-graph`

Verbindlicher Promotionspfad:

`feature/* -> integration -> controlled regression -> integration preview -> main -> production`

Feature-Branches dürfen `integration` nicht umgehen.

## Current Production Runtime Release

- Current App: **13.82.6**
- Current Core: **4.82.6**
- Production runtime release commit: `6c84a6bd440f56b71108518420fce2b07e60a959`
- Runtime parent: `98b84f254c1889aaa5f6bc39ab0c29073c5014c7`
- Production Cloudflare Deployment ID: `a2606461-94da-4a50-9f50-2b641149873e`
- Production Cloudflare Worker Version ID: `c606fed4-1f5c-464e-b5a7-8a2a90344c42`
- Deployment traffic: **100%**
- Cloudflare source: `wrangler`
- Deployment created on: `2026-08-18T06:16:37.397835Z`
- Production static verification: **PASS**
- Browser runtime pre-reload: **PASS**
- Browser runtime post-reload: **PASS**
- Runtime state stability: **PASS**
- Console warnings/errors after reload: **0**
- Six-stream runtime synchronization: **PASS**
- M5.1g: **COMPLETE**
- M5 Trip Core Isolation: **IN PROGRESS**

Production was already serving the exact App 13.82.6 / Core 4.82.6 target when the production-state probe was executed. Therefore no additional manual `wrangler deploy` was performed.

Cloudflare proves the active Deployment ID and Version ID above and reports source `wrangler`. The collected evidence does not prove which exact local, CI, GitHub, or other process triggered that deployment; no unsupported trigger attribution is made.

## Safe Regression Baseline

Harness:

`tests/run-m4.3-safe-regression.cjs`

Bestätigter Umfang auf dem aktuellen M5.1e Runtime-/Closeout-Stand:

- Total: **21**
- Passed: **21**
- Failed: **0**
- Suite: **PASS**

Der Harness wurde erfolgreich ausgeführt auf:

- `feature/platform-core`
- `integration`
- `main`

Nach finaler Runtime-Synchronisierung wurde erneut bestätigt:

- Six-stream synchronization: **6 / 6 PASS**
- Local = Tracking = Live Remote
- Divergence: **0 / 0**
- Working Trees: **clean**

## Cross-Core Guardrail

Bestätigter Zustand:

- tracked JS/TS files: **327**
- static DB calls: **316**
- mapped cross-core debt: **26 / 26**
- unmapped DB-object debt: **39 / 39**
- dynamic DB calls: **27 / 27**

Es wurde kein Wachstum der bekannten Cross-Core-DB-Schuld festgestellt.

## Feature Flag Foundation

Platform besitzt die zentrale Feature-Flag-Mechanik.

Feature Flags:

- sind temporäre Rollout-Gates;
- besitzen Owner-Präfixe;
- sind bei unbekannten IDs fail-closed;
- ersetzen keine Capabilities;
- ersetzen keine Auth-/Privacy-/Permission-Entscheidungen;
- ersetzen keinen Product-Module-State;
- ersetzen keine Domain Truth;
- besitzen in M4.3/M4.4 keine frei veränderbare Runtime-Override-API.

## M5.1b Cloudflare Integration Preview

Preview:

`https://integration-luvia.njwnrvwbv5.workers.dev`

Confirmed for release commit `68e7ff5433e4581eb3c19ef98934302736be84ec`:

- Cloudflare Worker version: **184**;
- Cloudflare version ID: `5272ac11-6b95-4866-86fa-82b8dd610200`;
- HTTP 200;
- App 13.82.1 / Core 4.82.1;
- Service Worker `luvia-shell-v13.82.1`;
- `index.html`, kernel, Service Worker and Gallery source match the integration commit after line-ending normalization;
- Gallery source contains the `trip.v1` read path and zero direct `LuviaTripStore`, `LuviaTripContext` or `LuviaAppState` references;
- authenticated active Trip `Paris Hochzeitstag` and destination Paris loaded correctly;
- Gallery settled at 51 photos, 10 photo moments and Realtime active, with day counts 20 / 27 / 4 / 0;
- active Trip, Gallery content and release identity survived reload;
- browser console: zero errors and zero warnings;
- internal repository paths remain protected by the SPA fallback.

The authenticated browser smoke proves the deployed current-Trip, load and reload path. The focused 3 / 3 runtime test proves changed-Trip observation, current-Trip download labeling and the no-Trip fallback without mutating the cloud-synchronized user state.

Observed operationally: Gallery can temporarily show its loading state and zero photos before Realtime/media loading settles. On Preview it settled after roughly 9–15 seconds. M5.1b changes neither Gallery loading nor Media/Realtime behavior.

## Previous M5.1a Cloudflare Integration Preview Baseline

Preview:

`https://integration-luvia.njwnrvwbv5.workers.dev`

Confirmed for commit `b4ffe88deddd726854f90e4fff48867deb3a91f9`:

- HTTP 200;
- App 13.82.0 / Core 4.82.0;
- Service Worker `luvia-shell-v13.82.0`;
- Travel Identity source consumes `trip.v1` and the versioned Trip event;
- authenticated active Trip and Control Center projection load correctly before and after reload;
- browser console: zero errors and zero warnings;
- internal repository paths remain protected by the SPA fallback.

The Cloudflare version ID was not available through the local authenticated tooling. No version ID is claimed for M5.1a; the deployed artifact and runtime were verified directly.

## Previous M4.4 Cloudflare Integration Preview Baseline

Nicht-Production-Branches werden durch Cloudflare Workers Builds als Worker-Versionen hochgeladen.

Für `integration` wurde erfolgreich bestätigt:

- Branch: `integration`
- Commit: `cc9a9c9`
- Deployment-Befehl: `npx wrangler versions upload`
- Worker Version ID: `68de6497-912e-4b14-937a-2810b8979927`
- stabiler Preview Alias: `https://integration-luvia.njwnrvwbv5.workers.dev`

Der erste automatische Integration-Build lief in einen Cloudflare-Initialisierungs-Timeout. Der Retry desselben Commits war vollständig erfolgreich. Es lag kein reproduzierbarer Luvia-Codefehler vor.

## Production

Production:

`https://myluvia.app`

Confirmed M5.1b production release commit:

`68e7ff5433e4581eb3c19ef98934302736be84ec`

Cloudflare production identity:

- Worker version: **185**;
- version ID: `14a8e2eb-385b-4e2a-80bb-e8056952a991`;
- deployment ID: `749d237e-47ce-4e71-a1e9-349e4fb9cbc4`;
- active traffic: **100 %**;
- version URL: `https://14a8e2eb-luvia.njwnrvwbv5.workers.dev`.

Production was verified directly after the successful `main` promotion:

- HTTP 200;
- App 13.82.1 / Core 4.82.1;
- Service Worker `luvia-shell-v13.82.1`;
- live `index.html`, kernel, Service Worker and Gallery source match the clean `main` release after line-ending normalization;
- authenticated active Trip `Paris Hochzeitstag` and destination Paris loaded;
- Timeline loaded with three entries;
- Gallery settled at 51 photos, 10 photo moments and Realtime active, with day counts 20 / 27 / 4 / 0;
- Trip identity, Timeline and Gallery survived reload;
- browser console: zero errors and zero warnings;
- internal repository paths remained protected by the SPA fallback.

The focused 3 / 3 runtime gate supplies the deliberately non-persistent changed-Trip, download-label and no-Trip variants. No cloud-synchronized Trip selection was changed merely to manufacture browser evidence.

Observed operationally: Production Gallery initially displayed its loading/zero state and settled after roughly 20 seconds. One exact text locator timed out after reload even though the final DOM already contained the complete correct state; the final evidence was read from the main view and all four day buttons. This did not reproduce as an application failure.

## Previous M5.1a Production Baseline

- release commit: `b4ffe88deddd726854f90e4fff48867deb3a91f9`;
- App 13.82.0 / Core 4.82.0;
- authenticated active Trip, Control Center identity, Trip surface, three Timeline entries and reload persistence verified;
- browser console: zero errors and zero warnings;
- internal repository paths protected by the SPA fallback;
- no Cloudflare version ID was claimed because it was not available through the authenticated tooling used for M5.1a.

Previous confirmed M4.4 Cloudflare production version:

`f61d9b23-9ea4-43f8-b318-83c44789341d`

## Static Asset Hardening

Während M4.4 wurde festgestellt, dass `wrangler.jsonc` das Repository-Root als Static-Asset-Verzeichnis verwendet:

`"directory": "."`

Production lieferte dadurch interne Repository-Dateien direkt aus.

Nachgewiesenes Beispiel vor dem Fix:

`https://myluvia.app/DEPLOYMENT-M3.4.md`

Ergebnis vor Hardening:

- HTTP 200
- `Content-Type: text/markdown`
- interner Deployment-Inhalt öffentlich erreichbar

Die bestehende `.assetsignore` wurde deshalb erweitert.

Ausgeschlossen werden unter anderem:

- `.assetsignore`
- `wrangler.jsonc`
- `supabase/**`
- `tests/**`
- `docs/**`
- `tools/**`
- `*.md`
- `*.sql`
- `*.txt`
- historische `test-results-*.json`

Nach dem Fix wurde sowohl lokal als auch remote bestätigt, dass interne Pfade nicht mehr direkt ausgeliefert werden.

## Asset Security Smokes

Bestätigte interne Testpfade:

- `/DEPLOYMENT-M3.4.md`
- `/supabase/migrations/_headers`
- `/tests/run-m4.3-safe-regression.cjs`

Erwartetes und bestätigtes Verhalten:

- HTTP 200 aufgrund SPA-Fallback
- `Content-Type: text/html`
- Response entspricht `index.html`
- interne Datei wird nicht direkt ausgeliefert

Bestätigt auf:

- lokalem Wrangler Runtime Proof
- manuellem isoliertem Preview-Test
- automatischem `integration` Preview
- Production `myluvia.app`

## Redundanter Test-Worker

Für die initiale M4.4-Erprobung wurde kurzfristig ein separater Worker erstellt:

`luvia-integration`

Version:

`f54d23ff-d692-40c0-bda1-faf98fc7fe0b`

Nachdem der vorhandene automatische Cloudflare-Branch-Preview-Pfad vollständig nachgewiesen war, wurde dieser zusätzliche Worker wieder gelöscht.

Post-Delete-Verifikation:

Cloudflare API Code `10007` – Worker existiert nicht mehr.

Damit verbleibt keine zweite Deployment-Wahrheit.

## Backend / Database / Secrets

Für M4.4:

- Datenbankmigration: **NEIN**
- SQL-Deployment: **NEIN**
- Supabase Edge Function Änderung: **NEIN**
- Supabase Secret Änderung: **NEIN**
- Cloudflare Secret Änderung: **NEIN**
- Storage Schema Änderung: **NEIN**
- remote-only `luvia-media-delivery`: **UNANGETASTET**

## Completion

Mit Promotion dieser formalen Abschlussdokumentation über den nachgewiesenen Pfad

`feature/platform-core -> integration -> main`

ist M4 vollständig abgeschlossen.

Nächster Architektur-Meilenstein:

**M5 – Trip Core Isolation**

## M5.1a Slice Completion

M5.1a – Travel Identity Trip Contract Adoption is complete for implementation, promotion, preview, production and active-stream synchronization.

## M5.1b Slice Completion

M5.1b – Gallery View Trip Contract Adoption is complete for implementation, controlled validation, promotion, Preview, Production and runtime-release synchronization.

The acceptance evidence is intentionally split: authenticated Preview/Production browser smokes prove the deployed current-Trip Gallery path, while the deterministic 3 / 3 runtime gate proves changed-Trip observation, download labeling and the no-Trip fallback without changing cloud-synchronized user truth.

M5 itself remains **IN PROGRESS**. The M5 exit gate remains unclaimed.

Next scope:

**M5 Durchführung Punkt 1 – begin a fresh read-only preflight for the next direct Trip-read candidate. M5.1c is complete; M5 itself remains IN PROGRESS and its exit gate remains unclaimed.**
---

## Current M5 Status – M5.1f Closed

- Current App: **13.82.5**
- Current Core: **4.82.5**
- M5.1f Runtime Commit: `961e53addd5e7aec40241ea5ed3a59d699a40a3e`
- M5.1f: **COMPLETE**
- M5 Trip Core Isolation: **IN PROGRESS**
- Controlled Safe Regression: **23 / 23 PASS**
- Production Runtime / Reload: **PASS**
- Production Browser Warnings / Errors after reload: **none observed**
- Six active streams synchronized: **PASS**

The detailed M5.1f closeout and deployment-order recovery evidence is recorded
in `RELEASE-NOTES-M5.1F.md`, `TEST-RESULTS-M5.1F.md`, and
`docs/modularization/PCR-M5.1F-MEMORY-WORLDS-TRIP-CONTRACT-ADOPTION.md`.

---

## M5.1g Local Release Preparation

- Target App: **13.82.6**
- Target Core: **4.82.6**
- Scope: **Places Domain Trip Contract Adoption**
- Local implementation: **GREEN**
- M5.1g test: **4 / 4 PASS**
- Controlled Safe Regression: **24 / 24 PASS**
- Repository Guardrail: **PASS**
- Timeline: **explicitly excluded / unchanged**
- Release implementation commit: **pending**
- Integration promotion: **pending**
- Production deployment: **pending**
- Production runtime verification: **pending**
- Final six-stream synchronization: **pending**
- M5.1g status: **LOCAL RELEASE PREPARED**
- M5 Trip Core Isolation: **IN PROGRESS**

Important:

The target release **13.82.6 / Core 4.82.6** is prepared locally but is not yet the verified Production Runtime Release.

The authoritative Production Runtime section above therefore remains on the previously verified production release until deployment and production verification are complete.

## M5.1g Authoritative Closeout

Status: **COMPLETE**

This is the authoritative M5.1g closeout. Earlier M5.1g Local Release Preparation / lifecycle-pending statements represent the pre-release state and are superseded by this section.

### Release identity

- App: **13.82.6**
- Core: **4.82.6**
- Runtime commit: `6c84a6bd440f56b71108518420fce2b07e60a959`
- Parent: `98b84f254c1889aaa5f6bc39ab0c29073c5014c7`
- Subject: `feat(m5): adopt Trip Contract in Places domain`
- Runtime commit scope: **exactly 19 files**

### Places Trip Contract adoption

Exactly these eight Places consumers now read active Trip truth through the lazy Trip Contract boundary:

- `core/places/place-core.js`
- `core/places/place-lifecycle-hub.js`
- `core/places/place-collection-service.js`
- `core/places/place-command-service.js`
- `core/places/place-lifecycle-service.js`
- `core/places/places-final-foundation.js`
- `core/places/presence-visit-core.js`
- `core/places/trip-place-data-service.js`

Final boundary:

- direct `LuviaTripStore` truth refs: **0**
- direct `LuviaTripContext` truth refs: **0**
- Trip Contract adoption: **8 / 8**
- active Trip access through `getActiveTrip`: **8 / 8**

`core/places/timeline-core.js` is explicitly excluded and unchanged. Timeline remains reserved for the later cross-domain Journey / Timeline Aggregation architecture audit.

### Verification

- M5.1g direct test: **4 / 4 PASS**
- Controlled Safe Regression: **24 / 24 PASS**
- Release consistency: **App 13.82.6 / Core 4.82.6 PASS**
- Repository guardrail: **PASS**
- tracked JS/TS files: **327**
- static DB calls: **316**
- mapped cross-core debt: **26 / baseline 26**
- unmapped DB-object debt: **39 / baseline 39**
- dynamic DB calls: **27 / baseline 27**

### Production evidence

- Static Production: **PASS**
- Browser Runtime Pre-Reload: **PASS**
- Browser Runtime Post-Reload: **PASS**
- State Stability: **PASS**
- Console warnings/errors after reload: **0**
- active Trip: **Paris Hochzeitstag**
- active Trip ID: `a3a7cfe1-e099-4ee2-a92d-3b7b979155ae`
- active Trip accent: `#67a98f`
- Trip count: **7**
- Cloudflare Deployment ID: `a2606461-94da-4a50-9f50-2b641149873e`
- Cloudflare Version ID: `c606fed4-1f5c-464e-b5a7-8a2a90344c42`
- Traffic: **100%**
- Cloudflare source: `wrangler`
- Created on: `2026-08-18T06:16:37.397835Z`

No additional manual Production deploy was performed after Production was classified `TARGET_ALREADY_LIVE`. The exact triggering process for the active Wrangler deployment is not asserted because the collected evidence does not prove it.

### Six-stream synchronization

All six active streams resolve Local = Tracking = Live Remote to runtime commit `6c84a6bd440f56b71108518420fce2b07e60a959`, divergence **0 / 0**, working tree **clean**:

- `main`
- `integration`
- `feature/platform-core`
- `feature/booking-core`
- `feature/consumer-experience`
- `feature/social-experience-graph`

### Infrastructure impact

- DB migration: **NO**
- Supabase Edge Function change: **NO**
- Secret change: **NO**
- Timeline ownership move: **NO**

**M5.1g = COMPLETE.**

This closes only M5.1g.

**M5 = IN PROGRESS.**

## M5.1h Local Release Preparation

- Target App: **13.82.7**
- Target Core: **4.82.7**
- Milestone: **M5.1h – Discovery Modules Trip Contract Adoption**
- Parent baseline: **9c1d37e67c57fa6343a55b5ca5ea8ef25858c960**
- Stream: **feature/consumer-experience**
- Scope Lock: **PASS**
- Mutation Design Gate: **PASS**
- Test-first RED: **PROVEN**
- Targeted implementation regression: **PASS**
- Direct LuviaTripStore references in seven Discovery modules: **0**
- Direct LuviaTripContext references in seven Discovery modules: **0**
- Trip Contract adoption: **7 / 7**
- Timeline: **excluded / unchanged**
- Trip Contract Adapter: **unchanged**
- Safe Regression Evergreen allowlist: **28**
- Release implementation commit: **pending**
- Feature-stream push: **pending**
- Integration promotion: **pending**
- Main promotion: **pending**
- Production verification: **pending**
- M5.1h status: **LOCAL RELEASE PREPARATION**
- M5 Trip Core Isolation: **IN PROGRESS**

The top-level build identity represents the local M5.1h release candidate.

The authoritative verified Production Runtime remains App **13.82.6** / Core **4.82.6** until M5.1h has passed promotion to integration, promotion to main, Production deployment/runtime verification and reload/browser-console proof.

M5.1h does not modify core/places/timeline-core.js, core/platform/trip-contract-adapter.js, database schema, Supabase Edge Functions, secrets, Booking Core ownership, Media Core ownership, Experience Core ownership or Intelligence Core ownership.

## M5.1h Authoritative Closeout – 2026-08-18

- Milestone: **M5.1h – Discovery Modules Trip Contract Adoption**
- Final status: **COMPLETE**
- App: **13.82.7**
- Core: **4.82.7**
- Implementation commit: 69f1b7da691f9a1a0212d75748477018f0257408
- Consumer promotion: **PASS**
- Integration promotion: **PASS**
- Main promotion: **PASS**
- Integration Safe Regression: **28 / 28 PASS**
- Main Safe Regression: **28 / 28 PASS**
- DB ownership baseline: **UNCHANGED**
- Integration Runtime Proof: **EXACT_COMMIT_BLOBS_LIVE**
- Integration Discovery Git blobs: **7 / 7 exact**
- Production Runtime Proof: **TARGET_ALREADY_LIVE**
- Production Discovery Git blobs: **7 / 7 exact**
- Production App/Core identity: **13.82.7 / 4.82.7**
- Manual Wrangler deployment: **NOT REQUIRED / NOT PERFORMED**
- DB migration: **NONE**
- Supabase Edge Function change: **NONE**
- Secret change: **NONE**
- Timeline / Journey mutation: **NONE**

The earlier LOCAL RELEASE PREPARATION section remains a historical record of the state at that point in the lifecycle. This newer closeout section is authoritative.

The final closeout-marker commit and subsequent 8/8 stream synchronization are repository synchronization steps and do not modify the M5.1h runtime.

## M5.1i Local Release Preparation

- Target App: **13.82.8**
- Target Core: **4.82.8**
- Milestone: **M5.1i Diagnostics Trip Contract Adoption**
- Parent baseline: **8a48a56128029da4a7f3ac4c95696b17cd82a67d**
- Stream: **feature/platform-core**
- Runtime targets: **2 Diagnostics consumers**
- Direct LuviaTripStore references in scope: **0**
- Direct LuviaTripContext references in scope: **0**
- Trip Contract adoption: **2 / 2**
- Trip Contract extension: **NO**
- index reorder: **NO**
- Timeline / Journey: **excluded / unchanged**
- M5.1i targeted regression: **PASS**
- Safe Regression Evergreen allowlist: **29**
- Controlled Safe Regression: **29 / 29 PASS**
- Repository / ownership / DB guardrails: **PASS**
- Release consistency: **App 13.82.8 / Core 4.82.8 PASS**
- Release implementation commit: **pending**
- Feature-stream push: **pending**
- Integration promotion: **pending**
- Integration Preview verification: **pending**
- Main promotion: **pending**
- Production verification: **pending**
- Final eight-stream synchronization: **pending**
- M5.1i status: **LOCAL RELEASE PREPARED**
- M5 Trip Core Isolation: **IN PROGRESS**

The top-level build identity represents the local M5.1i release candidate.

The authoritative verified Production Runtime remains App **13.82.7** / Core **4.82.7** until the M5.1i promotion and Production verification gates prove otherwise.

M5.1i does not modify the Trip Contract Adapter, Timeline/Journey ownership, database schema, Supabase Edge Functions, secrets, Booking Core ownership, Media Core ownership, Experience Core ownership or Intelligence Core ownership.

## M5.1i Authoritative Closeout – 2026-08-18

- Milestone: **M5.1i – Diagnostics Trip Contract Adoption**
- Final status: **COMPLETE**
- App: **13.82.8**
- Core: **4.82.8**
- Owner stream: **feature/platform-core**
- Runtime / release implementation commit: `90f780188481365081d91f0ca3dd0a474f15bd50`
- Integration Preview CORS support commit: `4df3224dd4bb743eda09426b69f6f9fbd76a9806`
- Final Production Worker CORS support commit: `dee95f0dd89a26a029c5ba8840a9fecdc5ca076a`
- Platform promotion: **PASS**
- Integration promotion: **PASS**
- Main promotion: **PASS**
- Main / Integration / Platform live source marker: `dee95f0dd89a26a029c5ba8840a9fecdc5ca076a`
- Controlled Safe Regression: **29 / 29 PASS**
- Repository / ownership / DB guardrails: **PASS**
- Release consistency: **PASS**
- Production static source provenance: **6 / 6 exact assets**
- Production App / Core identity: **13.82.8 / 4.82.8**
- Production static classification: **TARGET_ALREADY_LIVE**
- Manual Cloudflare / Wrangler deployment for the M5.1i static release: **NOT REQUIRED / NOT PERFORMED**
- Production Browser Runtime CORS Revalidation: **15 / 15 PASS**
- Production browser failed assertions: **0**
- `luvia-gateway`: **ACTIVE / v111**
- `luvia-intelligence`: **ACTIVE / v25**
- Final Edge CORS matrix: **8 / 8 PASS**
- Production Worker origin accepted by both Edge Functions: **YES**
- Database migration: **NONE**
- Secret mutation: **NONE**
- Timeline / Journey mutation: **NONE**
- Trip Contract Adapter extension: **NONE**
- M5 Trip Core Isolation: **IN PROGRESS**
- M5 Exit Gate: **NOT YET CLAIMED**

The earlier **M5.1i Local Release Preparation** section remains the historical pre-release state. This authoritative closeout supersedes its lifecycle-pending statements.

The original Diagnostics runtime migration remained exactly the approved two-file Trip-read adoption. Two later minimal Platform CORS support commits were required by deployed browser origins: first the Integration Preview Worker origin and then the authoritative Production Worker origin. Those support fixes changed only the two shared CORS allowlists and did not alter Diagnostics business logic, Trip truth, database schema or secrets.

The first support deployment produced `luvia-gateway` v110 and `luvia-intelligence` v24 for Integration Preview CORS. The final Production Worker-origin support deployment was performed sequentially and produced `luvia-gateway` v111 followed by `luvia-intelligence` v25.

The Production static release was already serving the exact App 13.82.8 / Core 4.82.8 Git target; therefore no additional manual Wrangler deployment was performed.

This closeout does not pre-claim the future closeout-marker commit SHA or its subsequent eight-stream synchronization. Those repository synchronization steps must be inspected and propagated separately.

**M5.1i = COMPLETE.**

**M5 = IN PROGRESS.**
## M5.1j Authoritative Closeout – 2026-08-19

- Milestone: **M5.1j – Profile Foundation Trip Contract Adoption**
- Final status: **COMPLETE**
- App: **13.82.9**
- Core: **4.82.9**
- Owner stream: **feature/consumer-experience**
- Runtime / release implementation commit: **a76fae471f368f33a5e68c396f9e1778c1004e18**
- Consumer promotion: **PASS**
- Integration promotion: **PASS**
- Main promotion: **PASS**
- Consumer / Integration / Main live source marker: **a76fae471f368f33a5e68c396f9e1778c1004e18**
- Profile Foundation direct LuviaTripStore reads: **REMOVED**
- Profile Foundation direct LuviaTripStore mutation: **REMOVED**
- Public Trip Contract reads adopted: **listTrips(), getActiveTrip(), getContext()**
- Public Trip Contract command adopted: **selectActiveTrip(id)**
- Trip Contract Adapter extension: **NONE**
- Controlled Safe Regression: **30 / 30 PASS**
- Repository / ownership / boundary / registry guardrails: **PASS**
- Release consistency: **PASS**
- Integration Preview current static source provenance: **6 / 6 exact Git assets**
- Production current static source provenance: **6 / 6 exact Git assets**
- Production App / Core identity: **13.82.9 / 4.82.9**
- Production index cache tokens: **214 / 214 on 13.82.9**
- Stale 13.82.8 index cache tokens: **0**
- Production Service Worker: **luvia-shell-v13.82.9**
- Production force-update appv: **13.82.9**
- Static Asset Hardening smoke: **PASS**
- Manual Cloudflare / Wrangler deployment: **NONE**
- Supabase deployment: **NONE**
- Database migration: **NONE**
- Edge Function deployment: **NONE**
- Secret mutation: **NONE**
- Timeline / Journey mutation: **NONE**
- M5 Trip Core Isolation: **IN PROGRESS**
- M5 Exit Gate: **NOT YET CLAIMED**

The Profile Foundation consumer now uses only the public Trip Contract boundary for the migrated Trip list, active-trip and activation behavior. The private owner-internal store bridge behind selectActiveTrip remains unchanged and remains valid implementation detail of the Trip Contract owner.

The Integration Preview and Production environments were verified after Main promotion and both currently serve the exact six Git blobs derived from implementation commit a76fae471f368f33a5e68c396f9e1778c1004e18. This closeout does not retroactively claim that the Preview HTTP provenance check was a pre-Main promotion gate.

The retained historical protocol-evidence limitation from earlier M5 work remains part of the project record. Later verification does not retroactively manufacture immediate live-remote or divergence evidence for earlier mutation moments where it was not captured. No reset, history rewrite or destructive repository operation was performed to manufacture retrospective proof.

This closeout does not pre-claim the future M5.1j closeout-marker commit SHA or its subsequent eight-stream synchronization. Those repository synchronization steps remain separate gates.

**M5.1j = COMPLETE.**

**M5 = IN PROGRESS.**
## M5.1k Authoritative Closeout – 2026-08-19

- Milestone: **M5.1k – Recommendations Trip Contract Adoption**
- Final status: **COMPLETE**
- App: **13.82.10**
- Core: **4.82.10**
- Owner stream: **feature/intelligence-core**
- Runtime / release implementation commit: **792d049d27b896a838e0ce6e8b34329c87ca20f6**
- Owner implementation push: **PASS**
- Integration fast-forward promotion: **PASS**
- Pre-Main automatic Integration Preview gate: **PASS**
- Main fast-forward promotion: **PASS**
- Automatic Production acceptance: **PASS**
- Recommendations runtime files migrated: **6 / 6**
- Private LuviaTripStore reads: **6 -> 0**
- Direct LuviaTripContext dependencies: **6 -> 0**
- Public Trip Contract adoption: **6 / 6**
- Trip Contract read extension: **NONE**
- Trip Contract command extension: **NONE**
- Private Trip Store mutation introduced: **NONE**
- M5.1k targeted regression: **PASS**
- M5.1j regression: **PASS**
- M3.1 Trip Contract regression: **PASS**
- Release consistency: **PASS**
- Ownership / boundary / registry guardrails: **PASS**
- Controlled Safe Regression: **31 / 31 PASS**
- Integration Preview static Git provenance: **11 / 11 exact assets**
- Integration Preview timing: **executed and accepted before Main mutation**
- Production static Git provenance: **11 / 11 exact assets**
- Production App / Core identity: **13.82.10 / 4.82.10**
- Production index cache tokens: **214 / 214 on 13.82.10**
- Stale 13.82.9 index cache tokens: **0**
- Production Service Worker: **luvia-shell-v13.82.10**
- Production force-update appv: **13.82.10**
- Static Asset Hardening smoke: **PASS**
- Manual Cloudflare / Wrangler deployment: **NONE**
- Supabase deployment: **NONE**
- Database migration: **NONE**
- Edge Function deployment: **NONE**
- Supabase Secret mutation: **NONE**
- Cloudflare Secret mutation: **NONE**
- Timeline / Journey mutation: **NONE**
- Booking mutation: **NONE**
- Media mutation: **NONE**
- Preferences mutation: **NONE**
- Theme Service mutation: **NONE**
- Runtime lifecycle mutation: **NONE**
- Trip Context bridge mutation: **NONE**
- Legacy destination-service mutation: **NONE**
- M5 Trip Core Isolation: **IN PROGRESS**
- M5 Exit Gate: **NOT YET CLAIMED**

The six approved Recommendations runtime services now read active Trip truth only through the existing public Trip Contract boundary. No new Trip Contract capability was required and no private Trip Store mutation was introduced.

The accepted pre-Main Integration Preview gate served all eleven checked public release and Recommendations assets as exact Git blobs from implementation commit 792d049d27b896a838e0ce6e8b34329c87ca20f6 before Main was mutated. Therefore the project can truthfully record a real pre-Main Preview gate for M5.1k.

The automatic Production environment subsequently served the same eleven exact Git blobs on App 13.82.10 / Core 4.82.10. No manual Cloudflare deployment and no second deployment truth were introduced.

The earlier failed curl-based Preview harness attempts remain failed harness attempts and are not represented as accepted Preview evidence. The accepted Preview and Production proofs used the replacement .NET HttpClient harness.

Historical documentation correction performed in this closeout: the existing M5.1j section inside CURRENT-BUILD had inherited 13.82.10 / 4.82.10 strings from the later M5.1k release registration. The dedicated M5.1j Release Notes and Migration State prove that M5.1j was App 13.82.9 / Core 4.82.9. Only the historical M5.1j subsection was restored to those proven values. No runtime history, Git history or acceptance evidence was rewritten.

The retained historical protocol-evidence limitation remains part of the project record. Later checks do not retroactively manufacture immediate live-remote or divergence evidence for earlier mutation moments where it was not captured.

pre-Main Preview gate retroactively claimed = NO.

This closeout does not pre-claim the future M5.1k closeout-marker commit SHA or its later eight-stream synchronization.

M5.1k completes the Recommendations logical Trip Contract adoption slice only. Physical repository isolation remains part of the larger M5 completion work and is not claimed by M5.1k.

**M5.1k = COMPLETE.**

**M5 = IN PROGRESS.**

Next grouped milestone:

**M5.2 – Remaining Trip Consumer Isolation.**
## M5.2 Authoritative Closeout Preparation - 2026-08-20

- Milestone: **M5.2 - Remaining Trip Consumer Isolation**
- Runtime / Production acceptance: **COMPLETE**
- Overall M5.2 status: **CLOSEOUT PENDING**
- App: **13.82.11**
- Core: **4.82.11**
- Platform stream: **feature/platform-core**
- Booking stream: **feature/booking-core**
- Platform implementation commit: **221bceb89f2ba927f58e7e076c1769169115373c**
- Booking / final runtime target: **a2098a1188b40edbe60573322c6eec2d936ad28a**
- Platform consumers: **5 / 5**
- Booking consumers: **2 / 2**
- Total approved consumers: **7 / 7**
- Private LuviaTripStore references: **0**
- Direct LuviaTripContext references: **0**
- Public Trip Contract adoption: **7 / 7**
- Trip Contract extension: **NONE**
- Private Trip mutation introduced: **NONE**
- Trip DB mutation introduced: **NONE**
- M5.2 targeted regression: **PASS**
- Safe Regression: **32 / 32 PASS**
- Integration promotion: **PASS**
- Real pre-Main Integration Preview static provenance: **12 / 12 BYTE-EXACT PASS**
- Preview consumer boundary: **7 / 7 PASS**
- Preview Static Asset Hardening: **3 / 3 PASS**
- Preview authenticated runtime: **PASS**
- Preview F5 reload: **PASS**
- Preview authenticated Booking read: **24 rows / PASS**
- Main fast-forward: **PASS**
- Main push: **PASS**
- Main local / tracking / live divergence: **0 / 0**
- Production static provenance: **12 / 12 BYTE-EXACT PASS**
- Production root exact target index: **PASS**
- Production consumer boundary: **7 / 7 PASS**
- Production Static Asset Hardening: **3 / 3 PASS**
- Production authenticated runtime: **PASS**
- Production F5 reload: **PASS**
- Production active Trip restore: **PASS**
- Production Booking read: **24 rows / PASS**
- Production Service Worker: **luvia-shell-v13.82.11**
- Manual Cloudflare deployment: **NONE**
- Database migration: **NONE**
- Edge Function deployment: **NONE**
- Secret mutation: **NONE**

The approved M5.2 consumer set now reads active Trip truth through the public Trip Contract boundary.

The runtime history is linear:

c143fad9651e6090cae61cce91d69869c0e526a6
-> 221bceb89f2ba927f58e7e076c1769169115373c
-> a2098a1188b40edbe60573322c6eec2d936ad28a

The automatic Integration Preview served the accepted target before Main mutation.

The accepted static Preview gate proved twelve byte-exact Git assets, seven of seven scoped consumer boundaries and three of three Static Asset Hardening probes.

Authenticated Preview runtime and F5 reload passed.

Main was promoted by controlled fast-forward and normal non-force push.

Automatic Production subsequently served the same accepted target.

Production static provenance, release identity, runtime, F5 reload, active Trip restore, Booking read and Service Worker registration passed.

The initial text-based Preview comparison remains retained as failed harness evidence. The accepted replacement proof used raw Git blob bytes and raw HTTP bytes.

The initial Booking push harness error remains retained as a post-push PowerShell stderr-handling harness failure after remote success was proven.

Main Pre-flight V1 remains retained as a comparison-harness failure. Set forensics proved the 15-file scopes were logically identical and V2 passed.

The known tests/user-preference-core.test.cjs api.version === 3.0.0 failure remains PREEXISTING FAIL / RETAINED / NOT PASS.

The geolocation user-gesture and Tracking Prevention messages remain retained browser warnings. The Console is not claimed warning-free.

Historical protocol-evidence limitations remain retained.

pre-Main Preview gate retroactively claimed = NO.

That historical statement does not negate the genuine current M5.2 pre-Main Preview acceptance.

Final physical Trip Core isolation remains later M5 work.

The Docs Marker commit SHA is not pre-claimed by this working-tree state.

Final eight-stream synchronization remains pending.

**M5.2 runtime / Production acceptance = COMPLETE.**

**M5.2 overall = CLOSEOUT PENDING.**

**M5 = IN PROGRESS.**

NFR-0 begins only after the Docs Marker and final eight-stream synchronization are proven.

<!-- NFR-0 CLOSEOUT BEGIN -->
## NFR-0 Native First Ready

Date: 2026-08-20

Runtime App/Core: 13.82.11 / 4.82.11

Foundation Commit: a64e6c0fd3bd5954fe29571f8c4ea128f265a201

Production / Static Asset Hardening Head: c57aec1912578e3b4e5ea31e1a8e9f4ed5b75a27

Closeout Docs Marker: this commit.

NFR-0 status: COMPLETE / CLOSED after final 8/8 synchronization of this exact Docs Marker.

M5 status: IN PROGRESS.

Next milestone: M5.3 Active Trip Context / runtime-neutral Trip access.

M5.3 remains blocked until the final 8/8 synchronization gate for this marker passes.

Regression: NFR 3 / 3 PASS; Safe 33 / 33 PASS; M5.2 7 / 7 PASS.

Preview Static Asset Privacy: 5 / 5 PASS.

Production Static Asset Privacy: 5 / 5 PASS.

Authenticated Production Browser Smoke: PASS.

App/Core version bump for NFR-0: NONE.

DB migration: NONE.

Supabase Function change: NONE.

Secret change: NONE.

Manual Cloudflare deployment: NONE.

Retained warnings: browser Tracking Prevention and geolocation user-gesture warning from global-location-bootstrap.js?v=13.82.11.
<!-- NFR-0 CLOSEOUT END -->

<!-- M5.3 CLOSEOUT BEGIN -->
## M5.3 Active Trip Context Closeout - 2026-08-21

- Milestone: **M5.3 - Active Trip Context / Runtime-Neutral Trip Access**
- Runtime App: **13.82.12**
- Runtime Core: **4.82.12**
- Runtime Release Commit: **1dc39b0b034e09aebfab3737598c2f2ac393cacd**
- Foundation Commit: **464ec0b48306beb40ec05f8c8c5f966e19d22c90**
- Web Compatibility Binding Commit: **abbe3334d08cd30ac5cd82c80cb7e2ff953dcc29**
- Runtime / Production acceptance: **COMPLETE**
- M5.3 focused regression: **2 / 2 PASS**
- NFR Foundation regression: **3 / 3 PASS**
- Safe Regression: **34 / 34 PASS**
- M5.2 retained targeted regression: **7 / 7 PASS**
- Integration Preview Static Asset Privacy: **5 / 5 PASS**
- Production Static Asset Privacy: **5 / 5 PASS**
- Integration authenticated browser + F5 module-order proof: **PASS**
- Production authenticated browser + F5 module-order proof: **PASS**
- Active Trip Context Core version: **1.0.0**
- Web Runtime Compatibility Binding: **web-runtime-compatibility**
- Runtime provider: **LuviaTripStore**
- Trip truth equality proof: **TripStore = TripContext = TripContract = TravelContext**
- Service Worker after F5: **PASS**
- Booking Control Center after F5: **PASS**
- Database migration: **NONE**
- Supabase Edge Function deployment: **NONE**
- Secret mutation: **NONE**
- Manual Cloudflare deployment: **NONE**
- App/Core bump for this closeout documentation commit: **NONE**

M5.3 establishes a runtime-neutral Active Trip Context in core/trips/active-trip-context.mjs and keeps luvia-trip-context.js as a Web Runtime Compatibility Binding.

TripStore remains the sole Trip Truth provider. Active Trip Context owns no duplicate persisted truth and exposes only derived runtime-neutral Active Trip reads and subscriptions.

The browser-facing globals window.LuviaTripStore, window.LuviaTripContext, window.LuviaTripContractV1 and window.LuviaTravelContext remain compatibility/runtime debt and are not claimed as the final native transport.

The correct Travel Context source path for current architecture work is core/context/travel-context-service.js. The historical stale core/services/travel-context-service.js path is not authoritative.

The former module-scheduling risk caused by converting luvia-trip-context.js to type=module was explicitly tested on Integration and Production before and after F5. No Active Trip boot race was observed.

Retained browser messages include Tracking Prevention storage warnings and DevTools fetch-completion information. The Console is not claimed warning-free.

Retained M5.3 harness history includes the Safe-registration structural preflight failure, the incomplete Release Consistency mutation, and the later corrected in-place repair path. No failed harness is rewritten as PASS.

Historical M5.2 and NFR-0 pre-sync statements elsewhere in this document remain retained as point-in-time evidence. They are not the current synchronization status.

Closeout Docs Marker: **this commit**.

M5.3 is **COMPLETE / CLOSED only after final 8 / 8 synchronization of this exact Docs Marker is proven with Local = Tracking = Live, divergence 0 / 0 and clean worktrees.**

M5 remains **IN PROGRESS**.

Next grouped milestone: **M5.4 - Remaining Trip Web Compatibility / Runtime Dependency Reduction**.
<!-- M5.3 CLOSEOUT END -->

## M5.4.2 Runtime / Bootstrap Trip Boundary — COMPLETE / CLOSED

Date: 2026-08-21

### Runtime release state

- App: 13.82.12
- Core: 4.82.12
- Runtime implementation commit: `5b6af89ba061e9638fc12be3268767e6d681c1b9`
- Runtime parent / previous M5.4.1 closeout marker: `2748c02bdb1497b0460c85630c1fd8c8a5bc76d8`
- Runtime version bump in M5.4.2: NONE
- M5.4 overall state: IN PROGRESS
- M5 overall state: IN PROGRESS

### Scope

M5.4.2 isolated the active Web runtime/bootstrap path from direct private Trip Store access without creating a second Trip Truth.

Runtime files:
- `core/platform/trip-contract-adapter.js`
- `core/runtime/boot-coordinator.js`
- `core/runtime/runtime.js`

Test/guardrail files:
- `tests/m5.1j-profile-foundation-trip-contract-adoption.test.cjs`
- `tests/m5.4.2-runtime-bootstrap-trip-boundary.test.cjs`
- `tests/run-m4.3-safe-regression.cjs`

### Architecture result

- `core/runtime/boot-coordinator.js`: direct `LuviaTripStore` references 7 -> 0.
- `core/runtime/runtime.js`: direct `LuviaTripStore` references 3 -> 0.
- Trip Store remains the sole private Trip Truth owner.
- Trip Contract owner adapter gained runtime-neutral owner operations:
  - `getState`
  - `initialize`
  - `loadRemote`
- `selectActiveTrip(tripId, options={})` preserves boot `touch` / `source` semantics and forwards them only through the Trip owner boundary.
- No second Trip Truth was introduced.
- No new Trip-domain cloud mutation was introduced.
- Owner-internal private Trip Store references inside `core/platform/trip-contract-adapter.js` remain intentional owner implementation detail.
- Existing Web compatibility binding `window.LuviaTripStore` remains classified compatibility debt and is not claimed removed globally.

### Regression

- M5.4.2 focused regression: PASS.
- M5.4.1 command retention: PASS.
- M5.4.1 destination boundary retention: PASS.
- M5.1j owner bridge guardrail: PASS after exact additive signature update.
- Safe Regression: 36 / 36 PASS.
- NFR-0 regression remains PASS.
- M5.3 Active Trip Context regression remains PASS.
- Cross-core DB ownership guardrail remains PASS.

### Integration Preview

- Integration/Platform target: `5b6af89ba061e9638fc12be3268767e6d681c1b9`.
- Cloudflare integration check: `96750127577` — success.
- Integration Build ID: `8791679f-d968-4580-809d-9a5c0572cbe8`.
- Integration Version ID: `a1fb1cf3-34c3-4d68-b9fc-fb159da95f2d`.
- Immutable preview URL was not exposed in the check output and is not retroactively invented.
- Integration alias byte provenance: PASS.
- App/Core on preview: 13.82.12 / 4.82.12.
- Static privacy: PASS via SPA fallback proof.
- Authenticated Integration F5 smoke: PASS.
- Active Trip after F5: Paris Hochzeitstag / Paris.
- Booking Center after F5: PASS.

### Main / Production

- Main current runtime state: `5b6af89ba061e9638fc12be3268767e6d681c1b9`.
- Production Cloudflare check: `96753083232` — success.
- Production Build ID: `3a51d89b-ae7c-4844-befe-09bf22e98052`.
- Production Version ID: `38c83250-b231-46d6-b573-1e111fcd1d97`.
- Production byte provenance: PASS.
- Production static privacy: PASS.
- Authenticated Production F5 smoke: PASS.
- Runtime phase after F5: ready.
- Authentication after F5: true.
- Active Trip after F5: Paris Hochzeitstag / Paris.
- Booking Center after F5: PASS.

### Production runtime hashes

- `index.html`: `6be9d480f7659559550017f3d1bd550644101e3cbf32a766ed414959d583c63e`
- `intelligence/kernel/version.js`: `6bd816ebb3becab04dab7296f0d41df673b66bf26ac21bd85ce503c0493430db`
- `core/platform/trip-contract-adapter.js`: `dfb3110f2e94d3f6a1325e345d8548566e9f45cbbed3554ffaf6d66eedd8552b`
- `core/runtime/boot-coordinator.js`: `6b5e1164bb81c4a6ca3f56c0807ad4de5488eeb8343f875563175a47ef7a532a`
- `core/runtime/runtime.js`: `da7ef53d2b222c46fea06563c76518652fae8defb1e251fad56a5e3cdae4c6c5`

### Retained evidence / warnings

The exact causal action that first promoted Main from `2748c02bdb1497b0460c85630c1fd8c8a5bc76d8` to `5b6af89ba061e9638fc12be3268767e6d681c1b9` is not retroactively claimed. Later read-only evidence proved Main Local = Tracking = Live on the runtime commit, local reflog records a Fast Forward, the commit-specific Production Cloudflare check succeeded, and Production bytes match the runtime commit exactly. Missing immediate mutation-time causal evidence is not manufactured retroactively.

Browser Tracking Prevention messages and the geolocation user-gesture `[Violation]` from `core/location/global-location-bootstrap.js` remain retained Web runtime warnings. They are NOT claimed fixed by M5.4.2 and did not produce a new M5.4.2 Boot/Runtime failure.

### Infrastructure

- DB migration: NONE.
- Supabase Edge Function change: NONE.
- Secret change: NONE.
- Manual Cloudflare change: NONE.

M5.4.2 is eligible for COMPLETE / CLOSED only after this documentation marker is committed, pushed and all eight active streams are proven synchronized to the marker.

## M5.4.3 Active TripStore Consumer Isolation — COMPLETE / CLOSED

- Date: 2026-08-21
- App: 13.82.12
- Core: 4.82.12
- Runtime Commit: `cf4a6b32c0ef11f4ac798766a38996bd4973e5b3`
- Runtime Parent: `e62a7e99973306f787c9320b796935ce5a1bd9bf`
- Runtime Subject: `feat(m5): isolate remaining active TripStore consumers`
- Active non-owner private `LuviaTripStore` references: 6 -> 0
- Join Flow: private Store 2 -> 0
- Trip Creator: private Store 1 -> 0
- Trip Experience: private Store 2 -> 0
- Timeline Core: private Store 1 -> 0
- TripStore remains sole Trip Truth.
- Transitional owner command: `commitTripSnapshot`.
- Web `luvia-trip-context.js` compatibility binding remains deliberately deferred.
- NFR browser-global baseline was not widened.
- Safe Regression: 37/37 PASS.
- Integration Preview: PASS.
- Authenticated Integration F5: PASS.
- Production byte provenance: PASS.
- Authenticated Production F5: PASS.
- DB migration: none.
- Edge Function change: none.
- Secret change: none.
- Manual Cloudflare change: none.
- Retained browser debt: Geolocation user-gesture warning and Tracking Prevention/fetch diagnostics.
- Create real Trip: not executed during browser acceptance.
- Join real Trip: not executed during browser acceptance.
- M5.4 remains IN PROGRESS.
- M5 remains IN PROGRESS.
- Next: one bundled M5.4 FINAL architecture block; no micro-slice chain.


---

## M5.4 FINAL — Trip Web Compatibility Boundary

Status: **COMPLETE / CLOSED**

Runtime Release:
- App: **13.82.13**
- Core: **4.82.13**
- Runtime Commit: `4c1827aa122ae5ba91b4ada845ad919fd273edf4`
- Feature Commit: `2ab95fa27f67912f170124295f5662b82608531c`

Final architecture:
- `LuviaTripStateReaderV1` is the read-only Web Trip state boundary.
- Reader surface is limited to `snapshot` and `subscribe`.
- Web Trip Context has **0 private `LuviaTripStore` references**.
- Trip owner adapter retains exactly **1 direct private Store access** for owner mutation flow.
- Travel Context secondary `LuviaAppState` Trip fallback is removed.
- Active Trip Context core remains browserless.
- TripStore remains the sole Trip Truth.
- Unreachable legacy TripStore debt remains deferred and was not reactivated.

Release acceptance:
- Platform regression: **38/38 PASS**
- Integration regression: **38/38 PASS**
- Main regression: **38/38 PASS**
- Integration Preview byte provenance: **PASS**
- Integration authenticated F5 smoke: **25/25 PASS**
- Production byte provenance: **PASS**
- Production architecture acceptance: **PASS**
- Production static privacy: **PASS**
- Production authenticated F5 smoke: **25/25 PASS**

Infrastructure:
- DB migration: **NONE**
- Edge Function change: **NONE**
- Secret change: **NONE**
- Manual Cloudflare change: **NONE**

Static asset classification:
- Deployment-private architecture artifacts remain blocked by `.assetsignore`.
- `config/luvia-streams.json` and `config/luvia-cores.json` are intentionally deployment-public canonical architecture registries.
- HTTP 200 SPA fallback for excluded internal paths is not classified as direct asset exposure.

Known retained browser debt:
- Tracking Prevention storage warnings.
- Geolocation user-gesture warning.
- These are pre-existing and not introduced by M5.4.

Next milestone:
- **M5 remains IN PROGRESS.**
- Next work is the controlled physical Trip Core isolation / M5 Exit.

<!-- LUVIA:M5:FINAL:CLOSEOUT:START -->
## M5 FINAL — Physical Trip Core Isolation

**Status:** COMPLETE / CLOSED
**Closeout:** 2026-08-22
**Runtime App / Core:** 13.82.14 / 4.82.14
**Runtime Release Commit:** `579e72c9419fc4456ce724bc63ba15d8f24233c7`
**Physical Isolation Feature Commit:** `d3a13e829ea1eca4fbbeff38b16ecf52e2eec58e`
**Previous M5.4 closeout marker:** `3274235e3623e1b5cdd7765137e95ad4ebbc8812`

### Final architecture

- `core/trips/trip-state-core.js` owns the runtime-neutral in-memory Trip state and is browserless.
- `core/trips/trip-store.js` is the Web compatibility adapter for persistence, legacy migration, cloud synchronization and DOM/Web events; it no longer owns a second local Trip state object.
- `LuviaTripStateReaderV1` remains read-only and exposes only `snapshot` and `subscribe`.
- `LuviaTripStore` remains available only as a Web compatibility binding; it is not the native target API.
- Active Trip Context remains browserless and consumer-side private TripStore access remains isolated behind public Trip boundaries.
- No duplicate Trip Truth was introduced.

### Native First Ready exit interpretation

`config/luvia-native-readiness-debt.json` is retained unchanged as the historical NFR-0 baseline. Its original `core/trips/trip-store.js` DOMAIN_VIOLATION classification records the pre-migration baseline and is not rewritten retroactively. The measured M5 final runtime architecture supersedes that baseline for current Trip state ownership: runtime-neutral Trip state core plus Web compatibility adapter.

### Final validation

- Safe Regression: **39/39 PASS**.
- Integration Preview runtime byte provenance: **11/11 EXACT**.
- Integration authenticated F5 smoke: **25/25 PASS**.
- Integration visual Active Trip + Booking Center acceptance: **UI PASS**.
- Main promotion: **FF-only PASS**.
- Production runtime byte provenance: **11/11 EXACT**.
- Production Static Privacy: **PASS**.
- Production authenticated F5 smoke: **25/25 PASS**.
- Production visual Active Trip + Booking Center acceptance: **UI PASS**.
- Production Physical Trip Core / Native-readiness semantics: **PASS**.

### Infrastructure

- DB migration: **NONE**.
- Edge Function change: **NONE**.
- Secret change: **NONE**.
- Manual Cloudflare configuration change: **NONE**.
- Cloudflare deployment version identifier: **not independently captured in this closeout; acceptance is byte-provenance based**.

### Retained non-blocking Browser / Platform warnings

Tracking Prevention messages and the geolocation user-gesture warning remain existing Browser / Platform debt. They did not fail the authenticated Integration or Production acceptance gates and are not silently reclassified as Trip Core defects.

### Milestone result

M5 Trip Core Isolation is **COMPLETE / CLOSED**. The next roadmap milestone is **M6**.
<!-- LUVIA:M5:FINAL:CLOSEOUT:END -->

<!-- LUVIA:M6.1:CLOSEOUT:START -->
## M6.1 — Places State Core Foundation

**Status:** COMPLETE / PRODUCTION VERIFIED

**Closeout:** 2026-08-22

**Runtime App / Core:** 13.82.15 / 4.82.15

**Feature Commit:** `9b9b782baa3fa58ed8bc9be5e96214da084a52e4`

**Runtime Release Commit:** `f4adb8b07cc131166241bfa3051c1ea3119c1bfb`

The existing in-memory Place record map is now owned by browserless `core/places/place-state-core.js`. `core/places/place-core.js` remains the Web compatibility/orchestration adapter and contains no second record map. `places.v1`, Timeline/Journey, DB/RPC, Location, Category routing, Intelligence, Experience, and persistence behavior remain unchanged.

Platform, Integration, and Main Safe Regression are 40/40 PASS. Integration Preview and Production each serve 12/12 exact runtime Git blobs, protect 5/5 internal paths through SPA-fallback classification, preserve authenticated active-Trip state before and after F5, render the Places hub and all ten categories, and report zero browser-console warnings/errors.

The runtime acceptance was measured on Cloudflare version `50a9ad97-d841-46e0-81d3-9ca1e5619f77` at 100% traffic. Cloudflare reports `Unknown (deployment/version_upload)` as source; no unsupported trigger causation is claimed. A later documentation-only Main marker produced version `0528dd85-fa57-4169-8c8b-a47ecf222ff2`; it is not used to rewrite or overstate the measured runtime acceptance.

No database migration, RPC/schema change, Edge Function change, secret change, or manual Cloudflare configuration change was required.

M6 remains IN PROGRESS. The next controlled scope is a read-only ownership audit of Places runtime/collection projections before any further state consolidation; Location/Permission extraction remains separate.
<!-- LUVIA:M6.1:CLOSEOUT:END -->

<!-- LUVIA:M6.2:CLOSEOUT:START -->
## M6.2 — Places Runtime Projection Core

**Status:** COMPLETE / PRODUCTION VERIFIED

**Closeout:** 2026-08-22

**Runtime App / Core:** 13.82.16 / 4.82.16

**Feature Commit:** `ecd94eac7f5c97b68be74c13097aad1a9086164b`

**Runtime Release Commit:** `d1c45cbb0fe357a061dffc8f52bef29e9593c612`

The trip/type-scoped Places runtime projection now lives in browserless `core/places/place-runtime-projection-core.js`. The Web runtime store owns no projection maps, and the Collection service's duplicate Place/TripPlace record map is removed. Public Web compatibility behavior, cloud-authoritative lifecycle/favorite writes, and Timeline/Journey separation remain intact.

Safe Regression is **41/41 PASS** on Platform, Integration, and Main. Integration Preview and Production each passed **10/10 exact changed-runtime assets**, **5/5 private-path SPA fallback**, authenticated F5, Places routing, all ten category labels, and **0/0 console warnings/errors**.

The Integration and Production GitHub checks remained stuck at `in_progress` without conclusion or error. Direct Cloudflare evidence proves Preview version `a7294e57-baf5-42b7-80d9-efeb6aabda38` and Production deployment version `98b38643-2d9e-46cc-a032-1fddeae77788`; exact bytes and authenticated runtime acceptance independently close the environment gates. No successful GitHub-check conclusion is claimed.

No database migration, RPC/schema change, Edge Function change, secret change, or manual Cloudflare configuration change occurred.

M6 remains **IN PROGRESS** pending the measured contract/routing/ports/Intelligence/offline/browserless exit scope.
<!-- LUVIA:M6.2:CLOSEOUT:END -->

<!-- LUVIA:M6:FINAL:CLOSEOUT:START -->
## M6 FINAL — Places Core Isolation

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Closeout:** 2026-08-22

**Runtime App / Core:** 13.82.17 / 4.82.17

**Feature Commit:** `be839773659039692d5d4b69586490f2584593de`

**Runtime Release Commit:** `2917bc055409b05fb57199031cb91db7d7f66f73`

The M6 exit block adds the browserless Places domain surface and canonical ten-entry Category Registry, expands the public `places.v1` boundary, isolates Places/Intelligence discovery composition, and moves Web/device capability access behind Location, Permission, Network, DeepLink, ExternalNavigation, and OfflineCache ports. Places remains the sole truth owner; Intelligence ranks and plans without owning Place truth; Consumer/Experience owns only the category UI. Timeline/Journey remains separately classified and unchanged.

Safe Regression is **42/42 PASS** on Platform, Integration, and Main. Integration Preview and Production each passed **18/18 exact changed-runtime assets**, **5/5 private-path SPA fallback**, authenticated F5, active-Trip retention, the 13.82.17/4.82.17 release identity, Places routing, all ten categories, and **0/0 browser-console warnings/errors**.

Integration Preview Cloudflare version: `c996a818-5b79-47ac-9f7a-3897596b2d1f`.

Production Cloudflare version at 100% traffic: `9962d8e5-8c3e-4eb1-bf42-de9df9917c50`.

Production GitHub/Cloudflare build `1cec3007-675c-4c4b-8772-ac01982db0ed`, check `97018298435`: **SUCCESS**.

No database migration, RPC/schema change, Edge Function change, secret change, or manual Cloudflare configuration change occurred.

M6 is **COMPLETE / CLOSED**. M7 begins only with a fresh read-only baseline and scope lock from the normative roadmap and real repository state.
<!-- LUVIA:M6:FINAL:CLOSEOUT:END -->

<!-- LUVIA:M7.1:CLOSEOUT:START -->
## M7.1 — Media Acquisition Native Ports

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Closeout:** 2026-08-22

**Runtime App / Core:** 13.82.18 / 4.82.18

**Feature Commit:** `b2792df68a89b45f886c021be7c05404e33d1f4d`

**Runtime Release Commit:** `625dc47cb36427a0f28586d28e65eab344bc1ae9`

Gallery media selection, camera capture, capture location, device metadata, sharing, and diagnostic preference storage now cross the formal Platform Port boundary. Browser and DOM capabilities remain in the Web adapter; `core/media` receives no new browser coupling and no second Media truth was created.

Safe Regression is **43/43 PASS** on Platform, Integration, and Main. Integration Preview and Production each passed **9/9 exact changed-runtime Git blobs**, **5/5 private-path SPA fallback**, authenticated F5, active-Trip retention, Gallery rendering with 51 existing photos, both native acquisition actions, and **0/0 browser-console warnings/errors**.

Integration Preview Cloudflare version: `708bc5e4-0ab2-4335-945e-95dadc7f8310`.

Production Cloudflare version at 100% traffic: `97d5674b-db5d-43b0-8eee-ce8700acf6f2`.

Production GitHub/Cloudflare build `9e5a19ef-ed16-4042-a046-8557a6ef1087`, check `97020481096`: **SUCCESS**.

No database migration, schema/RPC/bucket/RLS change, Edge Function change, secret change, or manual Production deployment/configuration change occurred. M7 remains in progress; Media Contract adoption, Realtime/hydration ownership, storage/background upload, offline queue, Memory Experience adoption, and browserless Media Core readiness remain explicit later M7 work.
<!-- LUVIA:M7.1:CLOSEOUT:END -->

<!-- LUVIA:M7.2:CLOSEOUT:START -->
## M7.2 — Gallery Media Contract Adoption

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Closeout:** 2026-08-22

**Runtime App / Core:** 13.82.19 / 4.82.19

**Feature Commit:** `eaf505fdc715825a862c0d1dd733feb1330367a2`

**Runtime Release Commit:** `54eb8d16cf94a92cc8b77e1442dfe88bb44f4144`

All 19 direct Gallery references to the private Media Core are removed. Gallery now consumes the additive `media.v1` 1.1.0 surface for projected reads, signed assets, Polaroids, commands, rendered previews, Gallery clearing, and normalized Media Realtime subscription. The adapter exposes sanitized Media semantics without storage paths, bucket names, content hashes, raw metadata, user IDs, or database rows.

Safe Regression is **44/44 PASS** on Platform, Integration, and Main. Integration Preview and Production each passed **10/10 exact changed-runtime Git blobs**, **5/5 private-path SPA fallback**, authenticated F5, active-Trip retention, 51 Gallery photos, 10 photo moments, Realtime-active status, native acquisition actions, and **0/0 browser-console warnings/errors**.

Integration Preview version: `5c94df43-a9c9-4ea8-9687-44243348ea5c`.

Production version at 100% traffic: `bd7b5df9-667d-4a8e-93a5-d00f4583d5f0`.

Production build/check: `aaa26d29-24cf-4ad1-abd8-3abdee9b9153` / `97022054088`, **SUCCESS**.

No database, schema/RPC, bucket/RLS, Edge Function, secret, or manual Cloudflare deployment/configuration mutation occurred. Clustering, AI Memory, Albums/Cards/Journeys, Timeline/Journey, MediaStorage/background upload, and offline queue remain explicit later M7 scopes.
<!-- LUVIA:M7.2:CLOSEOUT:END -->

<!-- LUVIA:M7.3:CLOSEOUT:START -->
## M7.3 — Memory Asset Delivery Contract Adoption

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Closeout:** 2026-08-22

**Runtime App / Core:** 13.82.20 / 4.82.20

**Feature Commit:** `21ef490c30dc2cc0ddc011300ef0e3b638321d10`

**Runtime Release Commit:** `63a73bcd3b39de723b97c86887b866e488659d60`

All six direct private Media Core references in the locked Memory Experience asset-delivery targets are removed. Albums View, Memory Worlds v2/v3, and the Memory Export Engine now resolve signed assets lazily through `media.v1` and pass only Media IDs across the public boundary. URL caching, graceful missing-asset behavior, and the JavaScript/TypeScript source mirrors are preserved.

Safe Regression is **45/45 PASS** on Platform, Integration, and Main. Integration Preview and Production each passed **11/11 exact changed-runtime Git blobs**, **5/5 private-path SPA fallback**, authenticated F5, active-Trip retention, Memory Albums rendering with 59 curated Cards and 2 travelers, loaded signed images, and **0/0 browser-console warnings/errors**.

Integration Preview version: `805b8187-86f9-4b43-8254-7f574b11c6ae`, alias `integration`, `has_preview=true`.

Production version at 100% traffic: `476ec499-830d-4cbb-87a3-e9e32a79cd4d`.

Production build/check: `7df7ffbb-7f30-43aa-bd9c-76335dba88a4` / `97023989740`, **SUCCESS**.

No database, schema/RPC, bucket/RLS, Edge Function, secret, or manual Cloudflare deployment/configuration mutation occurred. Smart Photo Moments/Clustering, AI Memory, Memory owner services, legacy Gallery sync, Timeline/Journey, Realtime/hydration ownership, MediaStorage/background upload, and offline queue remain explicit later M7 scopes.
<!-- LUVIA:M7.3:CLOSEOUT:END -->

<!-- LUVIA:M7.4:CLOSEOUT:START -->
## M7.4 — Remaining Media Consumer Contract Adoption

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Closeout:** 2026-08-23

**Runtime App / Core:** 13.82.21 / 4.82.21

**Feature Commit:** `dfbeffbe7bbbd003f1a3e72220cd5d1f666768b0`

**Runtime Release Commit:** `2f8fe62b71f93643cef474ff002a90bd267bac01`

The three Smart Photo Moments and five AI Memory direct private Media Core references are removed. The reachable Paris Legacy/Experience path now consumes public Media reads and ID-only signed assets. Active AI Memory consumes sanitized public Media evidence and uses the Media-owned `linkPlace` command; it no longer borrows the private Media runtime context. Media/Memory truth, owner services, Clustering persistence, and Timeline/Journey classification remain unchanged.

Safe Regression is **46/46 PASS** on Platform, Integration, and Main. Integration Preview and Production each passed **13/13 exact changed/runtime Git blobs**, **5/5 private-path SPA fallback**, authenticated F5, active-Trip retention, Gallery hydration with 51 photos and 10 photo moments, Realtime-active status, and **0/0 browser-console warnings/errors**.

Integration Preview version: `0541fd51-4bd3-4e10-8ac0-3bc0d16aafb9`, alias `integration`, `has_preview=true`.

Production version at 100% traffic: `2ad42346-348b-4fbe-ba10-e32ede4e71ef`.

Production deployment/build/check: `36f63a2a-8e5e-438e-8323-12f698d8d195` / `193a43c1-3021-46f6-89ff-a417fb3ed1d3` / `97170830238`, **SUCCESS**.

No database, schema/RPC, bucket/RLS, Edge Function, secret, manual Production deployment, or Cloudflare configuration mutation occurred. Media Clustering and Memory owner internals, legacy Gallery sync, Timeline/Journey, Realtime/hydration ownership, MediaStorage/background upload, and offline queue remain explicit later M7 scopes.
<!-- LUVIA:M7.4:CLOSEOUT:END -->

<!-- LUVIA:M7:FINAL:CLOSEOUT:START -->
## M7 FINAL — Media Core Isolation / Native Readiness

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Closeout:** 2026-08-23

**Runtime App / Core:** 13.82.22 / 4.82.22

**Feature Commit:** `48e496aec0605d2dc8650f25692539010b67ca10`

**Runtime Release Commit:** `2e87a9fcce31d15fa73c2abf2c183b413154c606`

The M7 exit block establishes a browserless Media Domain Contract Core for canonical/public/Realtime projections and upload-state rules. All seven canonical direct Supabase Storage calls now cross a dedicated MediaStoragePort Web adapter. Persisted offline upload commands drain through injected NetworkPort and LifecyclePort transitions while online uploads preserve their existing behavior. The canonical legacy Gallery bridge has moved from ten private Media Core references to the public `media.v1` 1.2.0 boundary.

Media Core remains the sole Media truth and Realtime owner. Gallery, Memory Experience, Smart Photo, AI Memory, and legacy compatibility consumers use the public Contract; IndexedDB holds pending commands rather than a second Media database. Media Clustering and Memory Album/Card/Journey services remain same-owner internals. Timeline/Journey remains separately classified, unchanged, and retains exactly two measured private Media references.

Safe Regression is **47/47 PASS** on Platform, Integration, and Main. NFR-0 is **3/3 PASS** and the browserless Media Core smoke is **PASS**. Integration Preview and Production each passed **15/15 byte-exact runtime assets**, **5/5 private-path SPA fallback**, authenticated active-Trip/F5 acceptance, Gallery hydration with 51 photos and 10 photo moments, Realtime-active status, native acquisition actions, and **0 browser-console entries**.

Integration Preview version: `689f9a78-f0b9-46ac-a690-78ac7678d797`, alias `integration`, `has_preview=true`.

Integration build/check: `64bfe8b8-2f64-4634-9b04-3b9071fdf2ef` / `97173988989`, **SUCCESS**.

Production version at 100% traffic: `e1477e68-d8d1-4cfd-a7a4-c28a73f905dd`.

Production deployment/build/check: `83b155fc-58a5-4d4f-a12d-1e3347333d29` / `c2fed981-7394-44d5-8af5-1107dadd8687` / `97174286216`, **SUCCESS**.

No database migration, schema/RPC, bucket/RLS, Edge Function, secret, manual Production deployment, or Cloudflare configuration mutation occurred. Rollback is code-only; no canonical Media data rollback is required.

M7 is **COMPLETE / CLOSED**. M8 begins only from a fresh read-only source-lock baseline after the final eight-stream synchronization proof.
<!-- LUVIA:M7:FINAL:CLOSEOUT:END -->

<!-- LUVIA:M8:FINAL:CLOSEOUT:START -->
## M8 FINAL — Identity / Event Contracts / Native Readiness

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Runtime App / Core:** 13.82.23 / 4.82.23

**Feature Commit:** `2894f6f36f6905e7dd6314492e7624019478810d`

**Runtime Release Commit:** `34808b0f35352e16d36040ae2090e976a08cb0b8`

M8 establishes a browserless physical Identity State/Contract Core and a browserless `events.v1` envelope core. Global viewer identity and explicit preferences are Identity truth; Trip context and observed Intelligence signals are excluded from that owner surface. Profile/Auth direct browser-storage references are reduced from 27 to zero, and profile session readiness now crosses `AuthSessionPort`.

Web implementations for StoragePort, SecureStoragePort, AuthSessionPort and NotificationPort are active. Web SecureStorage reports origin-scoped, non-hardware-backed protection honestly and does not duplicate Supabase tokens. Domain Events never deliver notifications automatically.

The visible Identity & Privacy Center is integrated into Control Center and the App Shell. It exposes profile clarity, preference provenance, session/storage/notification status and native-adapter readiness without owning domain truth.

Focused M8 guard, M3.4 Identity regression, Profile payload/rollback, NFR-0 **3/3**, and controlled Safe Regression **48/48** are PASS on Platform, Integration and Main.

Integration Preview passed **21/21 byte-exact runtime assets**, **5/5 private-path SPA fallback**, authenticated Identity Center acceptance, active Trip, **25/25 authenticated F5**, and **0** console warnings/errors. Integration version/build/check: `d36c6bb8-541d-4a77-b6b6-13ccb6ac2cb4` / `d28bf78e-6bd8-48b1-90e6-3e36cb0c0a23` / `97178357197`, **SUCCESS**.

Production version `1472c0d6-d390-4a4d-b613-301399a5b620` is at **100%** in deployment `18b1524e-1f8b-40c7-8821-bc09940f13b9`. Build/check `330ed0ca-9962-40b8-9638-ea2af03df70b` / `97179308782` is **SUCCESS**. Production passed **21/21 byte exact**, **5/5 private-path SPA fallback**, **25/25 public F5**, and **0** console warnings/errors. The selected Production browser had no authenticated Production-origin session, so no authenticated-Production claim is made; the authenticated product path was measured in Integration and Production equality was proved byte-for-byte.

No database migration, schema/RPC/RLS/bucket change, Edge Function change, secret change, manual Cloudflare configuration change, Trip truth move, Intelligence signal move or Timeline/Journey reclassification occurred.

M8 is **COMPLETE / CLOSED**. M8.5 starts only after a fresh read-only Intelligence classification, dependency, runtime-reachability and ownership scope lock; no bulk move is pre-authorized.
<!-- LUVIA:M8:FINAL:CLOSEOUT:END -->

<!-- LUVIA:M8.5:FINAL:CLOSEOUT:START -->
## M8.5 — Intelligence Contract Core Foundation

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Runtime App / Core:** 13.82.25 / 4.82.25

**Platform Contract Foundation:** `211632d8a8675117d47652951d6bf2ab00ea9a52`

**Platform NFR-Neutral Adapter Fix:** `6f481e3f17267058c17b183a79c6b368a7c5a133`

**Intelligence Feature Commit:** `89db1e20584004a60282725ed59f65e20d9024e2`

**Initial Runtime Candidate:** `78ceb7f3754c6de4a45595874206796671f6f0af`

**Final Runtime Release / Preview Repair:** `240968cd81d13610fa24a7c79892415df0871067`

The new browserless Intelligence owner core centralizes nine capabilities, three model tiers, five domain classifications, twelve source tools, policy/sanitization, output validation, context envelopes, learning-signal lifecycle, proposal lifecycle and evidence state. `LuviaIntelligenceContractV1` is active as the additive Web compatibility binding.

Capability, domain, model-routing, policy, validator and evidence Web modules delegate shared rules to the owner core. Dashboard, tool, Memory and proposal identity/Trip reads use public contracts. The dashboard no longer exposes direct Timeline execution and adds a visible Intelligence Transparency surface.

Timeline/Journey remains separately reserved and read-only from Intelligence. Proposal creation grants no final foreign-domain mutation authority.

Feature validation: focused Intelligence suite **17/17 PASS**, NFR-0 **3/3 PASS**, and controlled Safe Regression **49/49 PASS** on Platform, Integration and Main.

The first Preview candidate correctly stopped before Main after browser acceptance found intercepted bubble-phase Dashboard actions. Release `240968c` switches those actions to capture delegation and adds a regression assertion. The repaired Integration Preview version `e9b2bf20-9b71-48c4-8648-63a78c82f3e3` passed **21/21 byte-exact assets**, **25/25 authenticated F5**, active-Trip retention, visible Intelligence Transparency and **0** console warnings/errors.

Production version `af037f55-89b6-48a8-a441-7c747d08064a` is at **100%** in deployment `60c76d81-c96b-4528-b5e6-fc7dfecc09f4`. Production passed **21/21 byte-exact assets**, **25/25 authenticated F5**, active-Trip retention, the full 9-capability / 3-tier / 6-source Transparency surface, Journey/Timeline reservation, owner-confirmation copy and **0** console warnings/errors.

No database migration, schema/RPC/RLS/bucket mutation, Edge Function change, secret change, manual Cloudflare configuration change or foreign-domain truth move occurred. Rollback is code-only; the prior Production version is `e149aa86-a512-4083-9d18-08dc174d1860`.

M8.5 is **COMPLETE / CLOSED / PRODUCTION VERIFIED**. Remaining mixed AI, Planning, Discovery, provider/persistence and Journey/Timeline boundaries stay explicitly classified for later measured slices; this closeout does not claim a big-bang isolation of those roots.
<!-- LUVIA:M8.5:FINAL:CLOSEOUT:END -->

<!-- LUVIA:M9.1:CLOSEOUT:START -->
## M9.1 — Navigation Contract Foundation

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Runtime App / Core:** 13.82.26 / 4.82.26

**Feature Commit:** `5248eccdbb2d8616a1b8248ec065bfc56bc41b7c`

**Runtime Release Commit:** `8a538e395aadf361fe9c2d360e258ecad35de880`

M9.1 adds browserless `navigation.v1` route, alias, immutable `screen.navigate` intent, Deep Link and declarative mount semantics. The Platform-owned Web Registry remains backward-compatible and binds `LuviaNavigationContractV1`; the Consumer-owned App Shell is unchanged in this Platform slice.

`DeepLinkPort` no longer calls `LuviaApp.show()` directly. It resolves a runtime-neutral Navigation Intent and publishes it through the existing navigation event boundary. This keeps Domain Commands separate from screen navigation and provides one semantic contract that later Web, iOS, Android and authorized Luvia Intelligence tools can consume.

The measured M9 baseline and PCR are recorded in `docs/modularization/M9-APP-SHELL-RUNTIME-NAVIGATION-BASELINE.md` and `docs/modularization/PCR-M9.1-NAVIGATION-CONTRACT-FOUNDATION.md`.

Focused M9.1 regression is **PASS**, NFR-0 is **3/3 PASS**, and controlled Safe Regression is **50/50 PASS** on Platform, Integration and Main.

Integration Preview version `43c5bdbb-569a-417c-9d69-9428abd5b86e` passed **11/11 byte-exact runtime assets**, **5/5 private-path SPA fallback**, **25/25 authenticated F5**, active-Trip/version retention, Planen -> Places navigation and **0** console warnings/errors. Build/check `99bf67e7-f36e-4d0c-93cc-6791b34d8baf` / `97191761126` is **SUCCESS**.

Production version `7e41749e-23ee-41e6-b67d-b0a3379c3969` is at **100%** in deployment `a1310844-e263-4c96-903c-50eace9f39da`. Production passed **11/11 byte-exact runtime assets**, **5/5 private-path SPA fallback**, **25/25 authenticated F5**, active-Trip/version retention, Planen -> Places with all ten categories and **0** console warnings/errors. The associated build is `a855c3b3-cb97-478a-873a-aa6bb58be7dc`. GitHub check `97193079285` remained `in_progress` without an error or conclusion at closeout; its status is not rewritten as success. The independent Cloudflare version/deployment records and exact authenticated runtime measurements prove the deployed Production state.

No database migration, schema/RPC/RLS/bucket mutation, Edge Function change, secret change, manual Cloudflare configuration change, Domain Truth move, Consumer App Shell rewrite or Journey/Timeline reclassification occurred. Rollback is code-only to M8.5 runtime `240968cd81d13610fa24a7c79892415df0871067` / Production version `af037f55-89b6-48a8-a441-7c747d08064a`.

M9.1 is **COMPLETE / CLOSED / PRODUCTION VERIFIED**. M9 remains **IN PROGRESS**; the next owner-locked slice is staged runtime boot and explicit module mounting, with Consumer App Shell changes requiring their own Consumer-owned PCR and regression gate.
<!-- LUVIA:M9.1:CLOSEOUT:END -->

<!-- LUVIA:M9.2:CLOSEOUT:START -->
## M9.2 — Staged App Runtime and Module Mounting

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Runtime App / Core:** 13.82.29 / 4.82.29

**Platform Foundation Commit:** `216c8389865434087c2cf4d1e5185824c8640b3b`

**Platform Rehydration Fix:** `ca19583c5023df2ed45e68d9cba8d199037f817a`

**Platform Auth Initialization Serialization:** `d1112f252c3f428941e1bbddb3aef4705cec43d5`

**Consumer Adoption Commit:** `b44b21602debf2e2d3f55b6fb0e9ef7712f06725`

**Consumer Boot-Race Repair:** `4109e5f3d200cd8b4c8a64cd6c6c0e8fe38d8716`

**Final Runtime Release:** `740f127041cb275cf8a5716965bf9c20d4158d04`

M9.2 adds browserless `app-runtime.v1` and `module-mount.v1`. App startup now has ordered Platform, Auth, Domain Context, Shell and Module readiness stages with immutable diagnostics, timeouts, explicit failure and recovery. Auth changes can rehydrate after the initial splash without retaining the first boot promise.

The first Integration Preview candidate exposed a real authenticated cold-start race: the 900-ms recovery watchdog attempted Shell readiness while Domain Context hydration was still running. Main was not moved. The Consumer repair makes that watchdog wait for the canonical Domain Context stage; the ordered state machine remains strict.

The second candidate passed a clean authenticated cold start and Plan-to-Places module routing, then exposed a distinct authenticated F5 race before Main promotion: a concurrent `Auth.init()` caller could observe `initialized=true` while the provider's initial `getSession()` was still pending. The Platform/Auth repair serializes all concurrent initializers on one bounded provider hydration, keeps settled initialization idempotent and resets the initializer after failure. A deterministic concurrency regression now proves that no caller receives the premature loading snapshot.

The Consumer App Shell removes five manual mounted-state flags and the direct route-specific mount chain. Nine canonical module routes now resolve their targets from `navigation.v1` and use serialized concrete Web adapters. Screen composition stays Consumer-owned, Domain Truth stays in its existing Cores, and Timeline/Journey remains separately hydrated outside the ordinary module registry.

Focused M9.2 regression and NFR-0 are PASS. The controlled Safe Regression is **51/51 PASS** on Platform, Integration and Main. Integration Preview version `6f18047f-a0c5-4020-8e40-1ba97ee20744` passed **14/14 byte-exact runtime assets**, **5/5 private-path SPA fallback**, authenticated cold start, Planen -> Places, all ten Places categories, **25/25 authenticated F5**, active-Trip retention and **0** console warnings/errors before Main moved.

Production version `15c2ba3c-8b16-40e4-bd53-01bc9f9893e4` is deployed at **100%** by deployment `db4ad571-9919-4c1e-b36d-1eaa2bf1fe34`. `myluvia.app` passed the same **14/14 byte-exact assets**, **5/5 privacy**, authenticated cold start, module routing, ten categories, **25/25 F5**, active-Trip retention and clean console. The two rejected Preview candidates remain recorded as failed gates; neither moved Main.

No database migration, schema/RPC/RLS/bucket mutation, Edge Function change, secret change, manual Cloudflare configuration change, foreign Domain Truth move or Timeline/Journey reclassification is part of M9.2.
<!-- LUVIA:M9.2:CLOSEOUT:END -->

<!-- LUVIA:M9.3:CLOSEOUT:START -->
## M9.3 — History, Back and Deep-Link Policy

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Runtime App / Core:** 13.82.30 / 4.82.30

**Platform Foundation Commit:** `965c231263d0554105e0bf8364dad1ab1323eb28`

**Consumer Adoption Commit:** `9a9108f4c3ff85a4d06e24fadeaf8c795ad4d432`

**Final Runtime Release:** `6648f41c6f831645dc79c6cd5463fe8cc945765e`

M9.3 adds the browserless `navigation-history.v1` policy and one Web History adapter. `navigation.v1` remains the sole route and intent truth; browser History is a projection and owns no Domain Truth. Explicit recognized URL routes and sanitized parameters are restored on authenticated cold start, while plain root URLs preserve the user’s configured default screen.

The Consumer App Shell commits a screen only after its module mounted successfully. Same-route navigation is idempotent, browser Back/Forward restores an existing intent without pushing a new entry, and external Google Maps navigation now crosses `ExternalNavigationPort`. Existing Auth, Join and Booking URL flows remain separately owner-classified rather than being silently absorbed.

Timeline/Journey remains a separately reserved cross-domain aggregator. No Trip, Places, Media, Identity, Booking or Intelligence truth moved into Platform or Consumer.

Focused M9.3 regression is PASS, NFR-0 is **3/3 PASS**, and controlled Safe Regression is **52/52 PASS** on Platform, Consumer, Integration and Main. Integration Preview version `2fd3416e-703a-4bc6-9172-3cc86f4b9714` passed **11/11 byte-exact runtime assets**, **5/5 private-path SPA fallback**, authenticated direct Places Deep Link with ten categories, browser Back/Forward restore, **25/25 authenticated F5**, active-Trip retention and an empty warning/error console.

One Preview reload exceeded the initial 15-second observer window but subsequently reached the fully correct state with no console error. Read-only diagnosis proved the application state before the remaining measurements used a contract-aligned 30-second observer window; the delayed result is retained rather than rewritten as an instant pass.

Production version `5c966e7f-1685-4976-9af1-d94871869954` is deployed at **100%** by deployment `32291cf2-f7c4-4ec7-bd11-f88d46520b77`. Production passed the same **11/11 exact assets**, **5/5 privacy**, authenticated Deep-Link/Back/Forward contract diagnostics and **25/25 F5** with observed stable-start latency **3.1–5.1 seconds**, active Trip retained and console **0**.

No database migration, schema/RPC/RLS/bucket mutation, Edge Function change, secret change, manual Cloudflare configuration change, foreign Domain Truth move or Timeline/Journey reclassification occurred. Rollback is code-only to M9.2 runtime `740f127041cb275cf8a5716965bf9c20d4158d04` / Production version `15c2ba3c-8b16-40e4-bd53-01bc9f9893e4`.

M9.3 is **COMPLETE / CLOSED / PRODUCTION VERIFIED**. M9 remains **IN PROGRESS**; its next mutation requires a fresh read-only scope lock over the remaining App Shell orchestration, lifecycle/resume and legacy URL-owner boundaries.
<!-- LUVIA:M9.3:CLOSEOUT:END -->

<!-- LUVIA:M9.4:CLOSEOUT:START -->
## M9.4 — Runtime Signals and Resume Coordination

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED; 13.82.31 + 13.82.32 RELEASE IDENTITY CANDIDATES REJECTED

**Runtime App / Core:** 13.82.33 / 4.82.33

**Platform Foundation Commit:** `c9377153ff8e6a95e592293745640c2ff058b31b`

**Consumer Adoption Commit:** `e9dd548e0e8a4841ead1f6d956612eff51f1e4e1`

**Final Runtime Release:** `236f32c1072d6e0e5d5ef8978d906289db7156cc`

M9.4 introduces browserless `app-runtime-signals.v1` and one Web binding over the existing `AuthSessionPort`, `LifecyclePort` and `NetworkPort`. The policy normalizes idempotent session, background/foreground and connectivity transitions without storing session tokens or owning Domain Truth.

The Consumer App Shell no longer binds Auth transitions directly to an inline render callback. Session activate/switch/deactivate, eligible resume and reconnect effects are serialized through one Runtime Action queue. Background intervals below 15 seconds do not remount the active module. Eligible resume and reconnect preserve the current canonical Navigation Intent and explicitly write no History entry. Offline resume remains local until the NetworkPort reports a real reconnect.

Offline, reconnect and eligible resume state now has a responsive, reduced-motion-compatible `aria-live` projection below the App header. Collaboration, Media upload, Location and Travel Context keep their existing domain-specific transition owners. Auth, Join and Booking URL policies plus Timeline/Journey remain outside this scope.

Focused M9.4 regression is PASS, NFR-0 is **3/3 PASS**, and controlled Safe Regression is **53/53 PASS** on Platform, Consumer, Integration and Main. Final Integration Preview version `44cd8304-0063-4605-b711-2420a9f9ee91` passed **12/12 byte-exact runtime assets**, **5/5 private-path SPA fallback**, authenticated Runtime-Signal diagnostics, visible Offline/Reconnect, 16.3-second Resume with unchanged History length, active Trip/View retention, **25/25 authenticated F5** at 2.5–4.7 seconds and console **0**.

Production version `93f9bc43-e25e-45c5-b727-15d31e41a33d` is deployed at **100%** by deployment `f2ae2af2-2c39-48a7-9060-02a3a0eadb12`. Production passed the same **12/12 exact assets**, **5/5 privacy**, authenticated Offline/Reconnect/16.3-second Resume contract, unchanged History length, active Trip/View retention and **25/25 F5** at 2.1–3.9 seconds with console **0**.

The first Preview candidate `13.82.31 / 4.82.31` passed runtime byte/privacy gates but still exposed the previous M9.3 name and build timestamp in `LuviaKernelVersion`; Main did not move. Candidate `13.82.32 / 4.82.32` corrected the milestone identity and passed all Preview gates, but its static `integration` channel was then proven unchanged after the same artifact reached 100% Production. That Production identity mismatch is rejected rather than rewritten as a pass. The final candidate is `13.82.33 / 4.82.33` with the established M9.4 / Production descriptor.

No database migration, schema/RPC/RLS/bucket mutation, Edge Function change, secret change, manual Cloudflare configuration change, foreign Domain Truth move or Timeline/Journey reclassification occurred. Rollback is code-only to the M9.3 synchronized marker `7e8829119727a6c65e1a05c3029c981d6af78369`.

M9.4 is **COMPLETE / CLOSED / PRODUCTION VERIFIED**. M9 remains **IN PROGRESS**; actual login/logout acceptance, separately owned Auth/Join/Booking URL policies and inactive legacy-shell deletion proof require a fresh measured scope lock.
<!-- LUVIA:M9.4:CLOSEOUT:END -->

<!-- LUVIA:M9.5:RUNTIME-CLOSEOUT:START -->
## M9.5 — Owner Flow Navigation Convergence

**Status:** RUNTIME RELEASED / PRODUCTION VERIFIED; REAL LOGOUT → LOGIN ACCEPTANCE OPEN

**Runtime App / Core:** 13.82.35 / 4.82.35

**Platform Foundation:** `cefc35e21e7cebd14ac2215d0e32beca16dc6e80`

**Consumer Adoption:** `9f47e953adde516d17c697a4daa7278487919e77`

**Booking Adoption:** `e84a794ff92fcb10379d8718e558bb735c966bd3`

**Integration Release:** `2cfa11a75cab0cf28d77d578006c0fc025f0f996`

**Production Runtime Release:** `7773087ede7c72d39bdd235269cd0fc7c2a9d90e`

M9.5 adds browserless `owner-flow-navigation.v1` effects for Auth, Join and Booking. The Web adapter delegates same-document URL replacement to the established Navigation History owner and external surfaces to Storage, Sharing, DeepLink and ExternalNavigation Ports. It owns no Domain Truth.

Password-login success no longer forces a document reload. Auth logout no longer writes Web History directly. Join pending state uses `StoragePort`; Public Entry and Join cleanup preserve unrelated URL parameters and rerender without a reload. Trip Invite and Booking external handoffs cross Platform Ports, while Booking attribution and provider validation remain Booking-owned.

The two byte-identical, unreachable legacy Shell JavaScript files `luvia-app-shell.js` and `legacy/ui/luvia-app-shell.js` were deleted after a zero-reachability proof. Their SHA-256 before deletion was `4651AC3D4E921E5CA18AE4B03B6AFB6C72F28723D6CE8D55DFFC99B36B3ABC7E`. Historical CSS, `core/app/app-shell-v11.js` and the archived v11 HTML remain unchanged.

Focused Platform, Consumer and Booking guards, NFR-0 **3/3**, and controlled Safe Regression **56/56** are PASS on Integration and Main.

Integration Preview version `563a84f3-c30b-483d-9d87-1bc9f0cb4ff4` passed **23/23 byte-exact runtime assets**, **5/5 private-path SPA fallback**, **2/2 removed-shell SPA fallback**, authenticated owner-flow diagnostics, same-document invalid-Join cleanup, **25/25 authenticated F5** at **2.231–4.060 seconds** (average **2.953 seconds**), active Trip/View retention and console **0/0**.

Production version `56d56a8b-5b1d-46af-bcd2-3cf0fb3e4479` passed the same **23/23**, **5/5**, **2/2**, authenticated runtime and same-document Join gates plus **25/25 authenticated F5** at **2.291–5.389 seconds** (average **2.852 seconds**) with active Trip/View retention and console **0/0**. The first post-activation byte sample observed a short four-HTML-asset edge-generation mix; read-only byte/marker/newline diagnosis proved convergence before the complete second gate passed **23/23**. The first mixed sample is retained as non-pass evidence.

An actual destructive logout followed by a credentialed login was not executed. The selected browser had a valuable authenticated Preview and Production session, and no credential source was authorized for safe restoration. Therefore M9 is not closed and no real login/logout acceptance claim is made. The remaining M9 exit gate is exactly one reversible credentialed logout → login → active-Trip/runtime verification cycle.

No database migration, schema/RPC/RLS/bucket mutation, Edge Function change, secret change, manual Cloudflare configuration change, foreign Domain Truth move or Timeline/Journey reclassification occurred. Rollback is code-only to synchronized M9.4 marker `1a21b4a3c01fa103c0c380272a84fe3d4c9a6b74` / Production version `93f9bc43-e25e-45c5-b727-15d31e41a33d`.
<!-- LUVIA:M9.5:RUNTIME-CLOSEOUT:END -->

<!-- LUVIA:M9:FINAL:CLOSEOUT:START -->
## M9 Final — App Shell Runtime, Navigation and Session Lifecycle

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Runtime App / Core:** 13.82.38 / 4.82.38

**M9.6 Consumer commits:** `f65b68a0ff194b410d773287ea54b47b9229c971` / `5494d8aed0f416603f1c71b90a58690895392493`

**Integration / Production runtime:** `c81face994744f38b7389e20d29e173bea6509d9` / `3bca0bab3467c38c9207e01d75ad07926d977b51`

M9 now provides browserless Navigation, Navigation History, Module Mount, Runtime Signal and Owner Flow policies; one Web History owner; staged module mounting; serialized Auth/Lifecycle/Network actions; same-document Auth/Join flows; Platform-Port external handoffs; and deterministic authenticated-surface cleanup. The two inactive legacy Shell copies remain deleted. Timeline/Journey remains separately reserved.

M9.6 closes the final real-environment gate. App Shell closes the Profile-owned surface before signed-out hydration. Control Center Attention pauses and clears its read-only projection during session exit via `AuthSessionPort`, invalidates stale reads and resumes only after session activation plus hydrated Travel Identity. Consumer owns no Auth, Trip or Booking truth.

Safe Regression is **57/57 PASS** and NFR-0 is **3/3 PASS**. Integration Preview version `9a51ec22-84f5-469b-993c-63caf7b618fe` and final Production version/deployment `1905015c-cf29-46b8-8f9a-402e8fdb3a75` / `27b46a4c-4e43-4835-9d9e-ed83029e6f16` passed **24/24 byte-exact assets**, **5/5 privacy**, **2/2 removed-shell fallback**, real logout/login in the same document, History delta **0**, active Paris Trip/Today restoration and isolated CDP **0** warnings/errors/exceptions.

Rejected evidence remains explicit: Preview 13.82.36 exposed one unauthenticated Booking projection read and never moved Main. The first 13.82.38 manual Production sample matched 24/24 Working-Copy bytes and normalized to 24/24 Git content but was only 1/24 raw Git-byte exact because of CRLF checkout conversion. Final deployment used a verified blob-clean temporary checkout and passed 24/24 raw Git equality.

No database/schema/RPC/RLS/bucket migration, Edge Function change, secret change, manual Cloudflare configuration change, foreign Domain Truth reassignment or Timeline/Journey reclassification occurred. M10 begins only after eight-stream synchronization on the final documentation marker.
<!-- LUVIA:M9:FINAL:CLOSEOUT:END -->

<!-- LUVIA:M10:FINAL:CLOSEOUT:START -->
## M10 Final — Overlay Host and Interaction Boundary

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Runtime App / Core:** 13.82.40 / 4.82.40

**Technical closeout:** `c879d63de29ca7864a23ece2452702faf0c04362`

**Integration / Production runtime:** `f42a1bad295475314095d8f5b01ce6e3b25d4a0f` / `1110ad8d9b63d6c970f37bc05cb6f5db1791f16e`

M10 establishes one browserless `overlay-host.v1` policy and one Web DOM compatibility host. The host owns overlay stacking, focus containment and restoration, Escape/Back dismissal, background inertness, safe-area presentation, scroll locking and navigation/session cleanup; it owns no Domain Truth. Native clients can bind the same runtime-neutral entries to native sheets and dialogs.

Trip Experience, Trip Join, Places Experience, Intelligence surfaces, Albums, Gallery, Memory Worlds, Consumer flows, Booking sheets, Identity Profile, Guided Discovery, Trip Creator, Module Manager, Places detail/photo/Restaurant surfaces and the separately classified Journey/Timeline overlays now use the common host. Journey/Timeline remains a cross-domain aggregator and physical extraction candidate; it was not reclassified as Places.

The final active-runtime guard resolved all 211 referenced local JavaScript assets, classified all six remaining body-append sites, and proves exactly one global keydown owner: `core/ui/ui-manager.js`. No measured actively reachable private modal stack remains. Inline handlers and Web compatibility bindings remain measured migration debt, not falsely reported as modal ownership.

Safe Regression is **66/66 PASS** and NFR-0 is **3/3 PASS**. Integration Preview version `ec418361-2592-428c-bbd0-a9658a2d3e3f` passed **24/24 byte-exact assets**, **5/5 privacy**, **25/25 authenticated F5**, product-surface and nested-stack acceptance with final depth zero and console **0/0**.

Production version `860f485b-3321-4348-93a9-69145cd87562` is at 100% in deployment `077c28b5-4f7e-4da8-aa11-b3c91b69d091`. Production passed **24/24 byte-exact assets**, **5/5 privacy**, **25/25 authenticated F5** at **3.213–5.943 seconds** (average **3.564 seconds**), active Paris Trip/version retention, nested overlay semantics and console **0/0**.

Rejected evidence remains explicit: the first Preview `/index.html` sample was a canonical 307 redirect, not a byte mismatch; the first local Production package contained CRLF checkout bytes, failed raw equality 0/24 and was never uploaded. Final deployment causation is claimed only for the explicitly uploaded LF-clean Production version and deployment above.

No database/schema/RPC/RLS/bucket migration, Edge Function change, secret change, manual Cloudflare configuration change, foreign Domain Truth move or Journey/Timeline ownership reassignment occurred. M10 is **COMPLETE / CLOSED**. M10.5 requires a fresh Experience ownership, token, component and composition baseline before mutation.
<!-- LUVIA:M10:FINAL:CLOSEOUT:END -->

<!-- LUVIA:M10.5:EXPERIENCE-FOUNDATION:START -->
## M10.5 — Experience Contract Foundation and Premium AI Surface

**Status:** COMPLETE / CLOSED / PRODUCTION VERIFIED

**Runtime App / Core:** 13.82.41 / 4.82.41

**Release name / channel:** M10.5 Experience Contract & Premium AI Surface / production

The measured M10.5 baseline found no Experience runtime implementation and 29 active local stylesheets totalling 543,882 bytes. Those stylesheets include 1,848 literal hex colours, 2,309 `!important` declarations, 134 z-index declarations, 24 reduced-motion queries and 25 `:focus-visible` selectors. This remains explicit incremental-adoption debt; no unsafe bulk CSS move was performed.

`core/experience/experience-contract-core.js` now owns browserless `experience.v1` semantics: 69 design tokens, 13 shared component contracts, nine UI states, four motion patterns, accessibility release thresholds and explicit SwiftUI/Compose mappings. `app/adapters/experience-web-adapter.js` is the Web-only CSS custom-property projection. The former `LuviaDesignSystemContract` is now a backwards-compatible facade over that single semantic source.

The existing global Luvia AI trigger and question dialog are the visible first consumer. They now use the Experience Command Surface, responsive premium styling, explicit context, prompt starters, semantic loading/success/error/attention states, minimum touch targets, focus-visible rules and reduced-motion behavior while retaining `intelligence.v1` reads and the sole M10 Overlay Host. No Domain Command authority was added.

Focused Experience guard: **PASS**. Semantic tokens **69**; components/states **13/9**; SwiftUI/Compose mappings **PASS**; Journey/Timeline reservation **PRESERVED**. Controlled Safe Regression: **67/67 PASS**. NFR-0: **3/3 PASS**. Global keydown owner: exactly **1**. Browser dependency growth in the locked Intelligence path: **0**.

Runtime implementation and Main release commit: `8f70dca88d18488e908b6a2f56c2d76eabdef643`. Integration Preview version `a6c98e88-4d28-4fdd-8264-0c8f4a7d0c5b` passed **13/13 changed deployable assets byte-exact**, **5/5 private-path SPA fallback**, authenticated premium-surface/focus/Escape acceptance, **25/25 authenticated F5** at **3.158–3.985 seconds** (average **3.507 seconds**) and console **0/0**.

Production version `f0df5811-3543-49f2-aa44-d53fe7df396f` is active at **100%** in deployment `5470e8ac-ec82-4ef3-8bcb-62c0450071aa`. Version URL and `myluvia.app` each passed **13/13 byte-exact assets** and **5/5 privacy**. The authenticated App Shell retained the Paris Trip, App/Core identity, Experience `v1`, 44 px touch target, Restaurant prompt, Overlay Host dismissal and focus restoration. The final clean Production series passed **25/25 F5** at **3.047–3.601 seconds** (average **3.202 seconds**) with overlay depth zero and console **0/0**.

One earlier Production observation exceeded the initial 12-second locator window after 17 successful samples. Read-only diagnosis proved that the same page subsequently reached the correct Trip/version/Experience state with no console error. That sample remains rejected and was not rewritten as PASS; the final independent 25-sample series above is the accepted gate.

No database/schema/RPC/RLS/bucket migration, Edge Function change, secret change, manual Cloudflare configuration change, foreign Domain Truth move or Journey/Timeline reclassification occurred. Main promotion was fast-forward only. Rollback is code-only to the synchronized M10 marker `f789f481876f4fc9dbf2abf8957e0cc6741ef07d`; no persisted-data compensation is required.
<!-- LUVIA:M10.5:EXPERIENCE-FOUNDATION:END -->

<!-- LUVIA:M11:PREMIUM-TODAY:CLOSEOUT:START -->
## M11 Premium Today and Attention Composition

M11 is **COMPLETE / CLOSED / PRODUCTION VERIFIED**.

Runtime App/Core: **13.82.42 / 4.82.42**

Runtime commit: `e1e642409b65576f92f9f2521d43d1766754ec92`

The new browserless `consumer.today-composition.v1` builds a deterministic, immutable presentation model from public/read-only Trip, Travel Identity, Attention, Experience and Network projections. Consumer owns Today presentation only. Trip, Booking, Places, Media, Identity and Intelligence truth ownership is unchanged; the composition core contains no browser global, storage, DB/RPC/Supabase, private Store or foreign-domain command path.

The visible Today surface now combines active-trip identity, travel phase, connectivity, attention and safe primary actions. It reuses the canonical Luvia AI Command Surface and Overlay Host without autonomous mutation authority. The existing Dashboard Widget Registry remains active. Journey/Timeline remains a separately owned cross-domain aggregator and is embedded exactly once through `reserved-read-only`.

Measured evidence:

- Focused M11 guard: **PASS**.
- Safe Regression on Feature, Integration and Main: **68/68 PASS**.
- NFR-0: **3/3 PASS**.
- Cross-Core DB guardrail: static **316**, mapped **26/26**, unmapped **39/39**, dynamic **27/27**; no growth.
- Integration Preview: **10/10 exact Git blobs**, **5/5 privacy**, authenticated desktop/mobile/AI/navigation/Journey acceptance and **25/25 F5** at **3.980-8.077 seconds** (average **4.401 seconds**).
- Production active version `57d3bb86-0d50-457f-b405-edf8c0b01c60` at **100%**. Version URL and `myluvia.app` each passed **10/10 exact Git blobs** and **5/5 privacy**.
- Production authenticated UX: App/Core identity, Paris Trip, Today Contract, Attention, one Journey boundary, AI focus/Escape restoration, safe Plan navigation and 390 x 844 responsive layout without horizontal overflow: **PASS**.
- Production independent final reload series: **25/25 PASS**, **3.629-4.163 seconds**, average **3.853 seconds**.

A prior high-frequency Production series reached only 6/8 inside a 10-second locator gate and one diagnostic reload settled correctly at 14.727 seconds. Those observations remain rejected. After cooldown and pacing, the separate clean 25-sample series above supplied the accepted gate. No failed observation was rewritten as PASS.

No database/schema/RPC/RLS/bucket migration, Edge Function, secret, provider, manual Cloudflare configuration or manual Cloudflare upload/deploy occurred. Cloudflare reported the new active version after Main promotion with source `Unknown`; deployment causation is not invented.

Rollback is code-only to the synchronized M10.5 documentation marker `5067332492fca8a7df79bb6584c891c973550180`; no persisted-data compensation is required.
<!-- LUVIA:M11:PREMIUM-TODAY:CLOSEOUT:END -->

<!-- LUVIA:M12:JOURNEY-CORE:CLOSEOUT:START -->
## M12 Journey Core, Day Graph and Day Composer — COMPLETE / CLOSED / PRODUCTION VERIFIED

Date: 2026-08-24

Runtime App/Core: **13.82.43 / 4.82.43**

Runtime implementation, Integration and Main commit: `32ecd52aa79af007d54a3fb675e2feccdf86df5a`

Measured final result:

- physical browserless `journey.v1` Domain/Contract Core: **PASS**;
- Journey owns immutable Day Graph composition, ordering, temporal-integrity/conflict policy and source provenance only;
- Trip, Places, Booking, Media, Identity, Social and Intelligence truth moves or copies: **NONE**;
- `LuviaJourneyContractV1` exposes explicit `reads` and `commands` over exactly one Web compatibility provider;
- active non-provider runtime consumers of private `LuviaTimelineCore`: **0**;
- legacy `core/places/timeline-core.js`: explicitly classified `journey-web-compatibility-adapter`, not Places truth and not a second Journey truth;
- visible premium Day Composer: **ACTIVE**, responsive at desktop and 390 x 844, no horizontal overflow, all measured actions 48 px, reduced-motion support;
- authenticated Paris Journey composition, owner provenance and overlap conflict dialog: **PASS**;
- focused M12 guard: **PASS**;
- Safe Regression: **69/69 PASS** on Platform, Integration and Main;
- NFR-0: **3/3 PASS**;
- Cross-Core DB guardrail: static **316**, mapped **30/30** with historical baseline **26** plus four exact approved Journey owner-reclassification entries, unmapped **39/39**, dynamic **27/27**;
- Integration Preview: **32/32 byte-exact Git blobs**, **5/5 private-path SPA fallback**, authenticated Day Composer/conflict flow, **25/25 F5** at **3.275–4.215 seconds** (average **3.717 seconds**), console **0/0**;
- Production Cloudflare version/deployment `2e1019c3-80a4-4304-981a-8044c5122e2e` / `d5bdf394-bad6-4c3b-a22f-a02da2eb956e`: **100%**;
- Production version URL and `myluvia.app`: each **32/32 byte-exact Git blobs** and **5/5 private-path SPA fallback**;
- Production authenticated Day Composer/conflict flow: **PASS**; final **25/25 F5** at **2.999–5.152 seconds** (average **3.342 seconds**), console **0/0**;
- Main promotion: **FF-only PASS**.

Two preliminary F5 probes were stopped and rejected because their predicates inspected deliberately absent module globals and then sampled before authenticated hydration. Read-only diagnosis proved the runtime healthy; the accepted Integration series waits on the stable public Journey UI. No rejected sample is rewritten as PASS.

No database/schema/RPC/RLS/bucket migration, Edge Function change, secret/provider change, manual Cloudflare configuration or manual Cloudflare upload/deploy occurred. Cloudflare reports the automatically observed version source as `Unknown`; chronology and measured bytes are recorded without inventing deployment causation. Rollback is code-only to synchronized M11 marker `06b6c069471cd0c744390553c3dbecbf9b7b0c0b`.
<!-- LUVIA:M12:JOURNEY-CORE:CLOSEOUT:END -->

<!-- LUVIA:M13:MEMORY-CORE:CLOSEOUT:START -->
## M13 Memory Core and Premium Memories — COMPLETE / CLOSED / PRODUCTION VERIFIED

Date: 2026-08-24

Runtime App/Core: **13.82.44 / 4.82.44**

Platform foundation: `1778fad04a0131da0f91e1b65de9fe7fa19b2962`

Runtime implementation, Integration and Main: `8fa43791f960cb1c5e8e67e253b5676d8dd46e6b`

Measured final result:

- physical browserless Memory Domain/Contract Core and public `memory.v1`: **PASS**;
- Memory owns albums, cards, stories, chapters, contributions, curation and narrative lifecycle; Media owns assets, acquisition, storage and delivery;
- Memory-to-Media crossings use public IDs and sanitized `media.v1` projections; private `LuviaMediaCore` references in Memory providers: **4 -> 0**;
- Trip, Places, Booking, Identity, Social, Intelligence and Media truth reassignment: **NONE**;
- Timeline/Journey remains a separate cross-domain Core and is not absorbed into Memory;
- Premium Memories with metrics, transfer state, large-library search/filter/paging, bounded selection, signed previews and Overlay-Host Story Composer: **ACTIVE**;
- authenticated real account empty state: **PASS**; deterministic local large-data fixture independently passed accent-insensitive search, filters, two-item selection and story composition without being represented as Production user data;
- responsive 390 x 844: no horizontal overflow and all active M13 actions 48 px;
- contextual global Luvia AI, focused input, Escape dismissal and trigger-focus restoration: **PASS**;
- Safe Regression **71/71**, NFR-0 **3/3**;
- DB ownership guard: static **310**, mapped **30/30** with historical baseline **26**, unmapped **39/39**, dynamic **27/27**; no growth;
- Integration Preview `9dfe232e-15de-4aad-a965-955f7607845e`: **12/12 exact**, **5/5 privacy**, authenticated UI and **25/25 F5** at **3.395-5.940 seconds** (average **4.166 seconds**), console **0/0**;
- Production version/deployment `a5aa7b3f-0cd1-4b38-a12d-c3102478f214` / `98b1f425-fc75-4eca-b7b1-b1eae69becbe`: **100%**;
- Production version URL and `myluvia.app`: each **12/12 exact** and **5/5 privacy**; authenticated final **25/25 F5** at **2.667-4.238 seconds** (average **2.956 seconds**), active Ostseeurlaub/Scharbeutz retained, console **0/0**;
- Main promotion: **FF-only PASS**; runtime synchronization: **8/8 PASS**.

No database/schema/RPC/RLS/bucket migration, Edge Function change, secret/provider change, manual Cloudflare configuration or manual Cloudflare upload/deploy occurred. Cloudflare reported the automatically observed active version without a Git commit annotation; causation is not inferred. Rollback is code-only to synchronized M12 marker `b610b0fa8db5f34a631fe8c87b82f8266c3a5b75`. M14 begins with a fresh read-only legacy/runtime/CSS debt baseline and scope lock.
<!-- LUVIA:M13:MEMORY-CORE:CLOSEOUT:END -->
# M16.5W Shell Detail Stability — Public visual gate failed / superseded (2026-08-27)

## Scope

- App: **13.82.93**
- Core: **4.82.93**
- Release: **M16.5W Shell Detail Stability**
- Channel: **integration-preview**
- Target: **Integration only**; Main and Production remain locked.
- Public deployment: version **`7c344d3b-9dde-4817-8241-f7ef9fb8871e`**, deployment **`c9fbd320-7fbc-4609-b3d4-320912d4e6e5`** reached Stable Integration, but is **not accepted**: public visible E2E exposed the inherited `.lv-ai-global-trigger` gradient/shadow on the sidebar Compass entry.
- Rollback baseline: **App 13.82.92 / Core 4.82.92; Integration version `225b4f19-da56-4a4f-830a-88c58fce9f08`, deployment `ca41ce95-6e21-4888-a71d-950eec1103e3`**.

## Candidate changes

- Removed the duplicate top-header `Luvia fragen` control while retaining the living Compass entry and the Today-owned assistant entry.
- Removed the coloured tile treatment from the sidebar Living Compass entry in default, hover, focus and active states.
- Replaced deterministic whole-logo motion with randomized Web Animations on the separate Compass needle layer only; face, hub and housing remain fixed, and reduced motion disables the sequence.
- Projected active-trip dates in German calendar notation without UTC day drift.
- Prevented unchanged Today status signals and unchanged Trip projections from remounting the premium `Vorfreude` surface; legitimate live changes update without replaying its entrance animation.

## Evidence and disposition

- Syntax / static release guard: **PASS**.
- Controlled Safe Regression: **113/113 PASS**.
- Visible local Desktop / Mobile / Keyboard / Reload / Back / reduced-motion E2E: **PASS**.
- Public stable / immutable byte equality: **PASS**, but the public browser visual gate **FAIL** for the Compass tile surface.
- Physical handset acceptance and the broader M16.5 design freeze: **OPEN; not claimed by this candidate**.

# M16.5W2 Compass Surface Closure — Public mobile gate failed / superseded (2026-08-27)

## Scope

- App: **13.82.94**
- Core: **4.82.94**
- Release: **M16.5W2 Compass Surface Closure**
- Channel: **integration-preview**
- Target: **Integration only**; Main and Production remain locked.
- Public deployment: version **`8dbd02d5-657b-4b46-94e2-722521f6b231`**, deployment **`3b6bb30d-cc28-49c4-9559-abe3f500b067`** reached Stable Integration, but is **not accepted**: public desktop passed while public 390×844 exposed the same inherited AI gradient/shadow on `.lv-nav--compass`.
- Rollback baseline: **App 13.82.92 / Core 4.82.92; Integration version `225b4f19-da56-4a4f-830a-88c58fce9f08`, deployment `ca41ce95-6e21-4888-a71d-950eec1103e3`**.

## Candidate changes

- Retains all M16.5W shell-detail and Today-stability changes.
- Closes the public-only Compass surface regression at its actual cause: the shared AI trigger rule used `!important` for a pink gradient, text colour and shadow after the ordinary navigation override.
- The shared AI decoration now excludes `.lv-living-nav-ai` at its source; the sidebar Compass owns an explicit transparent surface, neutral navigation text colour and no inherited animated ring without adding new `!important` debt.
- The randomized needle sequence retains its Web Animations path and adds a transition-driven fallback for browsers that do not expose `Element.animate`; only the needle layer moves in either path.

## Candidate evidence

- Syntax / static release guard: **PASS**.
- Controlled Safe Regression: **113/113 PASS**.
- Visible local Desktop / Mobile / Keyboard / Reload / Back / reduced-motion E2E: **PASS**; 390×844 and 1440×900 both have zero horizontal overflow, the Compass surface computes to `background-image:none` / `box-shadow:none`, and only the needle changes transform.
- Repeated identical Today status signal: **PASS**; the existing `.lvt-premium` DOM node remains connected, no replacement occurs and only one surface exists.
- Public stable / immutable byte equality: **9/9 PASS**.
- Public desktop visible E2E: **PASS**; public mobile visible E2E: **FAIL** for the dock Compass surface, therefore no acceptance.
- Physical handset acceptance and the broader M16.5 design freeze: **OPEN; not claimed by this candidate**.

# M16.5W3 Compass Surface Public Closure — Stable Integration browser-verified (2026-08-27)

## Scope

- App: **13.82.95**
- Core: **4.82.95**
- Release: **M16.5W3 Compass Surface Public Closure**
- Channel: **integration-preview**
- Target: **Integration only**; Main and Production remain locked.
- Public deployment: version **`9ca4efbd-5794-41f6-8d0b-27d09791e83c`**, deployment **`769eb1bb-95bb-4346-8e81-1e8ba9b9046d`**, **100% Stable Integration traffic**.
- Stable URL: **`https://integration-luvia.njwnrvwbv5.workers.dev/`**.
- Immutable URL: **`https://9ca4efbd-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Rollback baseline: **App 13.82.92 / Core 4.82.92; Integration version `225b4f19-da56-4a4f-830a-88c58fce9f08`, deployment `ca41ce95-6e21-4888-a71d-950eec1103e3`**.

## Candidate changes

- Retains all M16.5W and M16.5W2 shell-detail, Today-stability and randomized needle changes.
- Extends the source-owned shared AI decoration exclusion to both real navigation classes: desktop `.lv-living-nav-ai` and mobile `.lv-nav--compass`.
- Makes the dock Compass surface explicitly transparent with `background-image:none` and no shadow while retaining the official Compass logo and random needle-only motion.

## Candidate evidence

- Syntax / static release guard: **PASS**.
- Controlled Safe Regression: **113/113 PASS**.
- Visible local 390×844 with the exact public class combination `.lv-nav--compass.lv-ai-global-trigger`: **PASS**; `background-image:none`, `box-shadow:none`, zero horizontal overflow.
- Prior Desktop / Keyboard / Reload / Back / reduced-motion and Today stability sequences remain covered by the unchanged runtime behavior and the full regression gate.
- Clean archive excludes all three untracked local Reel files: **PASS**.
- Immutable and Stable Integration bytes: **9/9 exact SHA-256 PASS** for document, version, shell JS/CSS, Today JS/CSS, AI CSS, public entry and service worker.
- Public Desktop 1440×900: **PASS**; App/Core **13.82.95 / 4.82.95**, German active-trip date, top-header assistant count 0, sidebar Compass `background-image:none` / `box-shadow:none`, zero horizontal overflow, random needle transforms while face and hub remain fixed.
- Public Mobile 390×844: **PASS**; real class combination `.lv-nav--compass.lv-ai-global-trigger`, `background-image:none`, `box-shadow:none`, zero horizontal overflow and random needle-only motion.
- Public Keyboard / Reduced Motion: **PASS**; focus-visible outline retained with a transparent surface, reduced motion keeps the needle at `transform:none`.
- Public console after the final Desktop/Mobile sequence: **0 entries**.
- Main remains **`c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`**; Production remains deployment **`578f13fc-8193-4988-88cf-93c94362fcc3`**, version **`0d26706b-8b79-4e05-b3b6-6c6314cc597c`**, 100%.
- Physical handset acceptance and the broader M16.5 design freeze: **OPEN; not claimed by this candidate**.

# M16.5X Shell Freeze Orbit and Control Course — Stable Integration browser-verified (2026-08-27)

## Scope

- App: **13.82.97**
- Core: **4.82.97**
- Release: **M16.5X Shell Freeze Orbit and Control Course**
- Channel: **integration-preview**
- Target: **Integration only**; Main and Production remain locked.
- Runtime implementation commit: **`270131a8e3aeb28a15dbb7912704220248a1e50b`**.
- Public deployment: version **`a9309030-3045-4964-aa9e-4078a9ecc3cf`**, deployment **`793af37b-08f7-4b6e-88b7-edc12dd88b90`**, **100% Stable Integration traffic**.
- Stable URL: **`https://integration-luvia.njwnrvwbv5.workers.dev/`**.
- Immutable URL: **`https://a9309030-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Superseded public candidate: **App 13.82.96 / Core 4.82.96, version `8a039e50-9c86-4688-a940-f708557157b1`, deployment `63399dac-07e8-4748-b58e-1d312f52751e`**; rejected before acceptance because the top eight-point node crossed the heading description at 1440×900.
- Rollback baseline: **App 13.82.95 / Core 4.82.95; Integration version `9ca4efbd-5794-41f6-8d0b-27d09791e83c`, deployment `769eb1bb-95bb-4346-8e81-1e8ba9b9046d`**.

## Candidate changes

- Moves Today, Plan, Trip, Memories, Profile and Control Center onto one collision-free Compass orbit at each responsive breakpoint; Profile no longer alternates inner and outer radii.
- Retains the accepted Compass transition system while giving the eight-direction Desktop constellation materially more distance from the Compass.
- Replaces the Control Center dashboard entry with its own Living Compass context: Identity & Privacy, Bookings, Travel Documents, Inbox, Trip Command and Wallet.
- Replaces the generic `Morgen / Unterwegs / Vor Ort / Abend / Erinnern` header rail with one compact cartographic course cue; Mobile keeps the accepted minimal brand header.

## Public evidence and disposition

- Static release guard: **PASS**.
- Local Desktop 1440×900: **PASS**; all six Compass contexts share one radius, no card overlap, 14 px clearance between the heading description and the nearest node, and no horizontal overflow.
- Local Mobile 390×844 and 320×700: **PASS**; all cards remain visible, no overlap, no document scroll and no horizontal overflow.
- Controlled Safe Regression: **114/114 PASS**.
- Clean deployment archive: **PASS**; the three pre-existing, untracked local Reel videos are absent from the archive and public deployment.
- Immutable and Stable Integration bytes: **9/9 exact SHA-256 PASS** for `index.html`, version, shell JS/CSS, module hubs JS/CSS, public entry JS/CSS and service worker.
- Public Desktop 1440×900: **PASS**; App/Core **13.82.97 / 4.82.97**, Plan uses a single approximately 256–257 px orbit for all eight entries, no card overlap, positive heading and viewport-bottom clearance, no document overflow, old five-stop rail count 0 and cartographic course cue count 1.
- Public Mobile 390×844: **PASS**; Plan exposes all eight entries and Control Center all six entries without card overlap, clipping, document scroll or horizontal overflow.
- Public real click routing: **PASS**; Control Center opens its dedicated Compass context, Identity & Privacy routes to `control-center-identity`, and browser Back returns to the Plan Compass context.
- Settled public direct deep-link and settled Reload of `control-center-identity`: **PASS**; one main region, correct heading, ready runtime and console **0 entries**.
- One deliberately immediate synthetic Reload issued about 900 ms into the route transition produced one transient runtime-stage error. It is not rewritten as PASS and does not recur after the route has settled; a completely race-free mid-transition Reload claim remains **OPEN**.
- Main remains **`c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`**; Production remains deployment **`578f13fc-8193-4988-88cf-93c94362fcc3`**, version **`0d26706b-8b79-4e05-b3b6-6c6314cc597c`**, 100%.
- Physical handset acceptance and the broader M16.5 design/App-Shell freeze remain **OPEN; not claimed by this release**.

# M16.5Y Identity Compass Onboarding — Stable Integration browser-verified (2026-08-28)

## Scope

- App: **13.82.98**
- Core: **4.82.98**
- Release: **M16.5Y Identity Compass Onboarding**
- Channel: **integration-preview**
- Target: **Integration only**; Main and Production remain locked.
- Runtime implementation commit: **`a70e7a340cdaa45b4b2ba06cf44354d57d0fa32f`**.
- Public deployment: **100% Integration version `31624f74-d281-43eb-81b7-8b994401c7df`, deployment `a0215087-ad1c-47a3-9345-e5fa3cd2eb83`**.
- Stable URL: **`https://integration-luvia.njwnrvwbv5.workers.dev/`**.
- Immutable URL: **`https://31624f74-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Rollback baseline: **App 13.82.97 / Core 4.82.97; Integration version `a9309030-3045-4964-aa9e-4078a9ecc3cf`, deployment `793af37b-08f7-4b6e-88b7-edc12dd88b90`**.

## Candidate changes

- Adds the accepted seven-stage post-auth Profile/Reisekompass onboarding before First-Trip creation.
- Adds one atomic `identity.v1.commands.completeOnboarding` owner command and rejects foreign/Trip fields.
- Adds session-scoped draft, defer, reload/resume and edit-mode entry from Profile and Identity Center.
- Adds a responsive full-screen travel composition with hidden scrollbars and Reduced Motion behavior.

## Candidate evidence and disposition

- Targeted architecture and visible seven-stage Desktop owner-save sequence: **PASS**; the receipt identifies `identity` as owner and no Trip write occurs.
- Responsive local browser evidence: **PASS** at 1440×900, 1702×683, 958×506 with eight selected values and 390×844; the two reported short-height clipping defects are closed and document horizontal overflow is 0 px.
- Real reload/resume retains the selected canonical preferences; native-button keyboard reachability, Back/step history, hidden-scrollbar and Reduced Motion guards: **PASS**.
- Controlled Safe Regression: **115/115 PASS**; NFR-0 **3/3 PASS**; visual inventory **2,850 tracked / 722 visual candidates / 0 unclassified PASS**.
- Immutable and Stable Integration bytes: **9/9 exact SHA-256 PASS** for document, version kernel, App Shell JS/CSS, onboarding JS/CSS, Identity adapter, Navigation Core and Service Worker.
- Public signed-in real-click sequence: **PASS** from welcome through Compass without committing the real account; eight selected values survive Reload, Browser Back reaches Control, Forward returns to Compass and console warnings/errors are **0**.
- Public responsive clipping closure: **PASS** at 1702×683, 958×506 with eight selected values and 390×844; both reported clipped sections are visible, horizontal overflow is 0 px and Mobile preserves usable hidden-scrollbar scrolling.
- Main remains **`c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`**; Production remains deployment **`578f13fc-8193-4988-88cf-93c94362fcc3`**, version **`0d26706b-8b79-4e05-b3b6-6c6314cc597c`**, 100%.
- Public product state: **PUBLIC VERIFIED**; this is not a physical-handset or broader Design-Freeze acceptance claim.
- First-Trip Composer, physical-handset acceptance and broader M16.5 Design Freeze: **OPEN**.

# M16.5Z First Trip Composer — Stable Integration browser-verified (2026-08-28)

## Scope

- App: **13.82.99**
- Core: **4.82.99**
- Release: **M16.5Z First Trip Composer**
- Channel: **integration-preview**
- Target: **Integration only**; Main and Production remain locked.
- Runtime implementation commit: **`9f8d0dffeff12b9645444bc5878b91003040da43`**.
- Public deployment: **100% Integration version `e9c1df5d-d172-459e-ab8a-93736988d65e`, deployment `ff560abc-6fe4-4258-be16-ea2280c18ff0`**.
- Stable URL: **`https://integration-luvia.njwnrvwbv5.workers.dev/`**.
- Immutable URL: **`https://e9c1df5d-integration-luvia.njwnrvwbv5.workers.dev/`**.
- Rollback baseline: **App 13.82.98 / Core 4.82.98; Integration version `31624f74-d281-43eb-81b7-8b994401c7df`, deployment `a0215087-ad1c-47a3-9345-e5fa3cd2eb83`**.

## Candidate changes

- Adds a nine-stage Trip-owned First Trip Composer after completed Profile onboarding.
- Adds idempotent `trip.v1.commands.createFirstTrip` composition and receipt handling.
- Extends public `places.v1` with canonical destination suggestion/detail reads; no direct Places gateway access remains in the Composer.
- Separates durable Profile constraints from per-Trip feelings and states the not-yet-wired downstream weighting honestly.
- Adds all 50 public Landing Trip colours, plain-language flexible dates and one unambiguous private/invite-after-creation decision.
- Fixes duplicate keyboard-handler accumulation so one `Alt+ArrowRight` always means one step.

## Candidate evidence and disposition

- Local Desktop 1440×900 real-left-click nine-stage owner-command sequence: **PASS**; no horizontal overflow or console errors.
- Local Mobile 390×844 touch-event nine-stage owner-command sequence: **PASS**; full layered Compass, no horizontal overflow or console errors.
- Reload/Back/Forward, one-step keyboard navigation and deterministic Reduced Motion: **PASS**.
- Trip/Places/Navigation/static contract tests: **PASS**.
- Safe Regression: **116/116 PASS**; regenerated visual inventory: **2,855 tracked files / 726 visual candidates / 0 unclassified**.
- Clean-archive byte provenance: **10/10 exact SHA-256 PASS** across source archive, Stable and Immutable for entry, version, App Shell, Composer JS/CSS, Places/Trip adapters, Trip creator, Navigation Core and Service Worker.
- Public Immutable Desktop 1440×900 and Stable Desktop 1440×900: **complete nine-stage real-left-click sequence to `trip.first.create · trip-m165z-public · required` PASS; 50 colours, canonical Kopenhagen Places result, complete three-layer Compass, overflow false, console warnings/errors 0**.
- Public Immutable Mobile 390×844: **complete browser-emulated Touch/Pointer/Click event sequence to the same committed receipt PASS; flexible month, three Trip feelings, canonical Places, 50 colours, complete Compass, overflow false, console warnings/errors 0**. This is not a physical-handset claim.
- Public keyboard and Reduced Motion: **one Alt+Right equals one step; media query true, zero root transition, no panel animation, no overflow**. Stable Reload and Browser Back/Forward retain App 13.82.99 assets with console warnings/errors 0.
- Public test fixture boundary: **`tests/**` stays excluded from Worker assets. The public component path was exercised through a temporary isolated in-origin QA mount of the deployed real Composer assets; App-Shell gating/session recovery is separately covered by the local visible fixture and static/regression contracts. All temporary browser overrides and tabs were removed after testing.**
- Collaboration invitation execution, downstream trip-feeling weighting, physical-handset acceptance and broader M16.5 Design Freeze: **OPEN**.
- Main remains **`c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba`**; Production remains deployment **`578f13fc-8193-4988-88cf-93c94362fcc3`**, version **`0d26706b-8b79-4e05-b3b6-6c6314cc597c`**, 100%.
