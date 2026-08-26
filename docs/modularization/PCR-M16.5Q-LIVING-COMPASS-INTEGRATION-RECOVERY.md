# PCR M16.5Q — Living Compass Integration Recovery

## 1. Status and acceptance boundary

Date: 2026-08-26

Runtime: App 13.82.59 / Core 4.82.59

Channel: Integration Preview only

The earlier claim that the public M16.5P Integration build had received
functional acceptance is revoked. The interim App 13.82.55 public run is also
not accepted: parallel user testing reproduced a delayed Compass selection in
which the selected item moved but the destination appeared not to open. App
13.82.56 corrected that gate but remained unaccepted: public console evidence
then proved an outgoing focused direction was placed below `aria-hidden`.
App 13.82.57 also remains unaccepted. A second unchanged user recording and
parallel desktop/mobile testing proved intermittent stationary-page clicks,
direct primary-navigation fallback to legacy views and dependence on opening
Plan first. App 13.82.58 corrected those four narrow causes, but public
authenticated testing and simultaneous user testing then reproduced an older
delayed Places/Compass operation overwriting a newer navigation intent. App
13.82.59 is the corrective Integration candidate. It receives
no functional acceptance until a new, uninterrupted, real-pointer public E2E
run and console/accessibility check have visibly completed after deployment and
Service Worker settlement.

M16.5Q does **not** complete the full M16.5 Design Freeze, does not accept the
remaining Booking migration or other still-open visual-parity rows, and does
not authorize Main or Production promotion.

## 2. Binding inputs

The recovery followed the handoff order and the binding Master Handoff,
Design/Acceptance Contract and Start Instruction. The accepted M16.5 design is
the target without simplification or legacy substitution.

User evidence:

- file: `05_USER_EVIDENCE_PUBLIC_INTEGRATION_FAILURE_2026-08-26_095119.mp4`;
- SHA-256: `8380A1976B59D9D188DECA786C78C5BC451AFF56E110970DD9D9245CBDA17D78`;
- unchanged duration/resolution evidence: 19.93 seconds / 1920 × 1020;
- decisive sequence: while the Plan Compass is open, the real pointer clicks
  the top-level `Heute` target. The revoked runtime leaves the embedded stage,
  briefly exposes a blank/incorrect Compass state and routes to Today instead
  of switching to the Today constellation. Subsequent pointer movement also
  exposes collapsing direction geometry.

Additional unchanged user evidence:

- file: `Luvia – Gemeinsam reisen. Für immer erinnern. und 5 weitere Seiten - Persönlich – Microsoft​ Edge 2026-08-26 13-12-34.mp4`;
- SHA-256: `D5A5150F06C946ACE4190ADD986091957E568DE550105A2DB0C19377C5C4E627`;
- unchanged duration/resolution evidence: 73.301 seconds / 1920 × 1020;
- decisive sequence: at full desktop size, real pointer clicks on Plan
  directions repeatedly leave the visible view unchanged; the accepted Trip
  and Memories constellations are available only after opening Plan first,
  whereas direct primary navigation opens legacy feature compositions. The
  same non-routing click then recurs in compact mobile size.
- console capture: `pasted-text.txt`, 46,952 bytes, SHA-256
  `4E05891B80E6DAAD8E67D6C3FAD26ADFBC880E3CEF552B2EF9A98CAC3094ECB8`.
  It contains no uncaught application exception and no repeated
  focus/`aria-hidden` warning. Edge Tracking Prevention, aborted requests and
  external MapLibre style/sprite warnings are present, but none explains or
  gates the Compass command path. The failure is therefore bound to the
  application state/geometry causes below rather than storage prevention.

## 3. Proven root causes

1. `app/app-shell.js` treated every other top-level navigation click during an
   open Plan Compass as `leavePlanCompass(view)` instead of a context switch.
2. `app/module-hubs.js` exposed only a Plan constellation, so Today, Trip,
   Memories and Profile had no accepted in-stage equivalents.
3. Direction hover/selection combined CSS `scale`, animated `translate` and
   `transform`; Edge composed them into moving/collapsing hit geometry.
4. The shared Compass flight was initially mounted inside the stage subtree
   replaced during navigation, allowing the flight to disappear before the
   return-to-brand sequence completed.
5. A first recovery placement on `document.body` solved subtree replacement
   but violated the existing overlay/body-mount guard. The final placement is
   the persistent Living Shell, outside the replaced stage and inside the
   existing App Shell ownership boundary.
6. Rapid route/Back input could leave more than one transition host alive;
   stale hosts then duplicated Compass stages and could be removed by an older
   timer after a newer route had started.
7. Rapid direction selection during a context transition was dropped because
   `choosePlanCompassDirection` returned while the transition flag was set.
8. `intelligence/pwa-service.js` expected the obsolete fixed cache
   `luvia-shell-v13.17.0` while the worker served the active release cache.
   Registration/update/activation and stale-cache pruning were ordered
   incompletely, and the install prompt was discarded.
9. `app/places/places-spatial-experience.js` selected list results without
   moving the map, allowed late MapLibre callbacks to mutate replacement
   surfaces and had no honest fallback markup despite fallback CSS.
10. The Places Back control did not restore the embedded Plan Compass and map
    marker/list selection was not bidirectional.
11. `leavePlanCompass` awaited the Web Animations API `finished` promise for a
    purely decorative return flight before calling the destination action.
    Edge can throttle or pause that document-timeline animation; on the public
    stable origin the exact real click was reproduced with the selected Places
    item moving immediately but routing only about seven seconds later.
12. Entry and return flights had no shared cancellation owner or bounded
    lifetime. The stage's white target carrier was already visible while the
    small Compass was still travelling, and direction selection deliberately
    added `1080deg` before the target angle. That produced a disconnected
    shared-element handoff and three unnecessary needle revolutions.
13. The route transition applied `aria-hidden="true"` to the outgoing Plan host
    while the clicked `.lv-plan-direction.is-selected` still retained focus.
    Chromium correctly blocked the ARIA change and emitted repeated accessibility
    warnings. Superseded/Back transitions also removed `aria-hidden` without a
    single owner for restoring the host's focusability.
14. Accepted-context routing was conditional on finding an already-open
    `[data-plan-compass-stage]`. Direct Today, Trip, Memories or Profile input
    from a normal feature view therefore executed `show(view)` and exposed the
    legacy feature composition; opening Plan first accidentally made the same
    input take the accepted in-stage path.
15. The remaining hover and selected rules still changed each direction's
    scale and animated `transform`. The earlier browser assertion compared only
    the centre point, so a resizing hit box could pass while a physical pointer
    near its edge observed the item moving away and lost the intended click.
16. `leavePlanCompass` queued a context selected during destination routing but
    did not replay `pendingCompassContext` after the route committed. This made
    fast cross-context input appear intermittently inert.
17. Broad stage lookup could select a `[data-plan-compass-stage]` below an
    outgoing `.lv-route-previous` host. Commands then updated the hidden old
    Compass while the visible current view remained unchanged.
18. Productive module activation is asynchronous. App 13.82.58 did not order a
    queued Compass context against a later route/navigation intent. A delayed
    Places activation could therefore finish after Browser Back or another
    click and replay its older pending Plan context over the newer visible
    destination. The public authenticated sequence reproduced this under real
    Places data load; parallel user testing reproduced it in both integrated
    and external browsers.

## 4. Recovery implementation

### Living Compass

- Five accepted contexts now live in the same embedded stage: Today, Plan,
  Trip, Memories and Profile.
- Every desktop and mobile primary-navigation context target carries explicit
  Compass intent. Direct Today, Plan, Trip, Memories and Profile clicks now
  enter the accepted stage even when no Compass was previously open; the
  committed feature URL remains the context URL while the constellation
  switches in place.
- Each context preserves eight primary directions plus the two accepted
  horizon targets and explicitly distinguishes active, foundation and reserved
  maturity without replacing an unfinished destination with legacy UI.
- The selected direction remains stationary, the official two-ended needle
  aligns by the shortest signed angle in `[-180deg, 180deg]`, and non-selected
  directions fade at their orbital positions. No decorative revolution is
  added.
- X and Escape return to Today. Arrow keys move direction focus. Compact
  targets remain at least 44 px. Reduced motion removes the flight/animation
  without removing state or action.
- Rapid context, close and direction input is queued and replayed after the
  route commits. Stage lookup is restricted to the current non-previous host,
  and detached selections are resolved against that live stage before the
  exact action is executed.
- Every Compass/context/route command carries a monotonic user-intent sequence.
  A delayed animation, module mount or queued context may finish cleanup, but
  it cannot execute or replay after a newer click, Back/popstate or navigation
  request. The requested `activeView` is committed before asynchronous module
  deactivation so live owner refreshes also observe the destination rather
  than the outgoing Plan stage.
- The shared-element flight is mounted in the persistent `.lv-living-shell`;
  every flight has a common cancellation owner and a bounded fallback. The
  destination action starts after the selection feedback without awaiting the
  decorative return animation, so a throttled or stalled flight cannot gate
  routing. Cleanup removes detached flights, transition classes, duplicate
  hosts and the detached-brand state.
- The central white target carrier stays invisible during the first flight
  phase. `is-compass-arriving` cross-fades and scales it in only while the
  official Compass reaches the target, then the heading and eight directions
  enter. Context switches no longer spin the needle.
- Hover and selection never resize or translate the direction element; visual
  feedback uses opacity only, preserving the full physical pointer/touch hit
  rectangle from press through route commit.
- The standalone Luvia Compass navigation control still opens the real
  Intelligence dialog directly.
- Before an outgoing host becomes hidden, focus is released from any descendant;
  the host is then both inert and `aria-hidden`. A superseded/Back transition
  removes both states together, so no hidden subtree retains or regains focus.

### Places and map

- A result selection calls MapLibre `easeTo` with the public WGS84 tuple.
- A marker selection updates and scrolls the result list without redundant map
  motion.
- Render tokens, container connectivity and the current map identity fence all
  asynchronous MapLibre callbacks.
- The bright fallback preserves query, state, results, coordinate evidence and
  owner actions when the map library or style is unavailable.
- The Places Plan control restores the embedded Plan Compass.

### Cache and Service Worker

- The expected shell cache derives from `LuviaKernelVersion.build`.
- Only older `luvia-shell-v*` caches are pruned, after worker registration,
  update/activation and readiness.
- An already controlled page reloads once after the new worker takes control;
  the session guard prevents a reload loop.
- Versioned JS/CSS/JSON/manifest/HTML and brand assets use network-first
  recovery and fall back only to the active release cache.
- `beforeinstallprompt` is retained for the real install action.

## 5. Local verification

Real Microsoft Edge browser E2E passed against the assembled Integration
runtime:

- desktop physical pointer press/release at 1920 × 1020 through all eight Plan
  directions, with exact hit owner plus unchanged centre, width and height on
  hover; keyboard arrows, Escape, exact routing, rapid browser Back, reload and
  one-stage cleanup;
- touch at 390 × 844, 360 × 740 and 320 × 673 with all eight direction targets
  inside the viewport and at least 44 px;
- reduced-motion context switch and close-to-Today;
- all five context constellations, including direct primary-navigation entry
  from ordinary Today/Plan/Trip/Memories/Profile views without a Plan-first
  precondition and entry from Places while preserving `?screen=places`;
- a deliberately never-finishing Web Animations `finished` promise; the real
  Places click still reached the destination inside the fixed routing budget;
- a deliberately delayed Places module mount followed by a queued Plan click
  and a newer Routes navigation; after all delayed promises settle, Routes
  remains visible and no stale Compass stage is replayed;
- direct needle evidence (`Places` = `-90deg`, without `1080deg` addition);
- outgoing-route focus/ARIA evidence: zero focused descendants below
  `aria-hidden`, with the previous host inert for the transition and restored
  together on cancellation;
- timed entry-frame evidence proving the white target carrier is hidden before
  arrival and cross-fades only in the final shared-element phase;
- Service Worker registration, deliberate stale
  `luvia-shell-v13.17.0` creation/pruning, active
  `luvia-shell-v13.82.59` recovery and offline document/CSS reload.

Visual evidence is retained locally under
`test-results/m16.5q/desktop-entry-before-arrival.png`,
`desktop-entry-arrival-crossfade.png`, `desktop-plan.png`,
`desktop-today-context.png`, `desktop-places-destination.png` and
`mobile-390-plan.png`. The screenshots are test evidence, not public runtime
assets.

Automated gates:

- Safe Regression: 106 / 106 PASS;
- NFR-0: 3 / 3 PASS;
- Active Trip Context regression: 2 / 2 PASS;
- cross-Core DB ownership guard: PASS without debt growth;
- release consistency, M16.5Q release lock and visual inventory freshness:
  PASS;
- no database/schema/RPC/RLS/bucket migration;
- no Supabase Edge Function, secret or manual Cloudflare configuration change.

## 6. Public visible E2E

The earlier App 13.82.55 stable-origin sequence is retained only as revoked
diagnostic evidence. It did not cover the document-timeline throttling race.
The App 13.82.56 public run proved deterministic routing after Service Worker
settlement and all eight Plan destinations, but the user's console screenshot
proved the focus/`aria-hidden` contract still failed. App 13.82.57 then cleared
that narrow automated gate, but the second user recording proved its direct
entry, live-stage ownership, hit-geometry and queued-context behavior still
failed on desktop and compact mobile. None of these runs supports functional
acceptance. App 13.82.58 then passed the expanded local geometry/direct-entry
suite, but the authenticated public run reproduced a delayed Places activation
replaying Plan over a newer route. The user simultaneously reproduced the same
failure in the integrated and external browsers, so App 13.82.58 is revoked as
well.

Mandatory App 13.82.59 public re-acceptance after deployment:

1. settle the new Service Worker and repeat from the settled controller;
2. real left-click selection through all five Compass contexts and every Plan
   direction class, including immediate click during entry and rapid
   context-to-direction input;
3. visibly confirm that the target carrier appears only with the arriving
   Compass and the needle takes the direct target angle;
4. prove exact Places routing, result ↔ marker selection, Places Back, X,
   Escape, reload and browser Back without duplicate stage or lingering flight;
5. compare stable and immutable runtime bytes with the committed source and
   probe private/local paths;
6. keep the browser console free of the `Blocked aria-hidden ... retained
   focus` warning throughout the selection/route sequence.
7. begin from normal Today, Trip, Memories, Profile and Places feature views and
   prove that each direct desktop/mobile primary-navigation click opens its
   accepted Compass context without first opening Plan.

Status before deployment: **PENDING — no functional acceptance claimed**.

## 7. Source and deployment provenance

Consumer source commits:

- `d326c82` — Living Compass contexts, exact routing, Places/map and initial
  real-browser recovery;
- `78e395a4cc44d6cc2efcfd057d23ff297637fd47` — persistent-shell flight,
  rapid transition/Back cleanup and deterministic E2E settling.
- `1aefbd2` — cancellable and bounded decorative flights, non-blocking exact
  routing, timed target-carrier arrival and direct needle angle.
- `873cfc3a6a2989d3ff40f56d842054bffd746fde` — outgoing-route focus release,
  inert/ARIA pairing and browser regression coverage.
- `1c4cf04` — deterministic direct context entry, live-stage ownership,
  stationary hover/selection geometry, queued-context replay and full-size
  physical pointer regression coverage.
- `f7a7d44` — monotonic user-intent ordering across delayed module mounts,
  Compass queues, route requests and Browser Back, plus deterministic slow
  Places regression coverage.

Integration provenance:

- consumer assembly: `e9e1498`;
- runtime release commit: `5f24cf01697852d3b90a862cac0e2a811e63bcda`;
- clean release/inventory head used for the exported asset manifest:
  `82604fc1d0f25cd525db8866b9d35eeb3b3ff15f`.
- deterministic transition assembly: `57ee461`;
- App 13.82.56 runtime release candidate: `a3f8614`.
- route-transition focus integrity assembly: `570fa2e`.
- App 13.82.58 deterministic direct-entry assembly: `04a6f3c`.
- App 13.82.59 intent-ordering assembly: `7637dcb`.

Superseded App 13.82.55 Cloudflare Integration evidence:

- version ID: `c259ee5f-710e-433d-a25f-94cfbb9cf62a`;
- deployment ID: `60d2c58c-b395-4ca3-8830-f63a218dfb83`;
- traffic: 100%;
- stable URL: `https://integration-luvia.njwnrvwbv5.workers.dev/`;
- immutable URL:
  `https://c259ee5f-integration-luvia.njwnrvwbv5.workers.dev/`.

Superseded, unaccepted App 13.82.56 Integration:

- version ID: `4437fbf3-06d5-4658-bc5b-b692653e77b8`;
- deployment ID: `9c407d98-aeba-4538-9a33-e11188ae54cf`;
- reason superseded: public focus/`aria-hidden` console failure.

Superseded, unaccepted App 13.82.57 Integration:

- version ID: `183d62af-5c49-43ce-a148-08ebc8813364`;
- deployment ID: `b06ef844-3b91-4de8-959b-03bab9fcfdb5`;
- reason superseded: unchanged real desktop/mobile recording proved direct
  context, hit-geometry, live-stage and queued-context failures after the
  narrower focus/ARIA correction.

Superseded, unaccepted App 13.82.58 Integration:

- source commit: `b1c6f4fb13ac6d214c099f5a96934fd60998567e`;
- version ID: `8e7f17d0-242a-4290-ab0b-106d4f8353c6`;
- deployment ID: `a025dd9b-4495-4c53-bcf2-3aaa963c2366`;
- immutable URL:
  `https://8e7f17d0-integration-luvia.njwnrvwbv5.workers.dev/`;
- reason superseded: authenticated public and parallel user testing proved a
  delayed Places/Compass operation could replay over a newer route intent.

App 13.82.59 Cloudflare Integration version/deployment: **PENDING**.

Three intermediate, never-routed upload versions created while proving the
clean asset manifest were deleted through the authenticated Cloudflare Version
API: `03361f62-7da8-4c9a-9aa8-f57c1fb07c33`,
`f0727c89-4d81-4f40-9d31-994abf0ef0be` and
`8a1ef835-9606-4e45-93ee-0174537e9091`. None received deployment traffic.

Main remained exactly at
`c4b6d1740ad04c291d5e27d8d18b3a32e5ed87ba` locally and remotely.
Production remained exactly on deployment
`578f13fc-8193-4988-88cf-93c94362fcc3` and version
`0d26706b-8b79-4e05-b3b6-6c6314cc597c`.

## 8. Explicitly still open

- physical iOS/Android handset visual/touch acceptance;
- authenticated functional execution on the immutable hostname (the session is
  correctly origin-scoped); stable authenticated execution plus immutable byte
  parity is the current evidence boundary;
- App 13.82.59 public stable/immutable deployment and uninterrupted visible E2E
  re-acceptance;
- the remaining M16.5 visual-parity matrix, especially complete Booking and all
  other surfaces not included in this recovery;
- the user's explicit complete Design Freeze and any later Main/Production
  promotion.

## 9. Rollback

Rollback affects only the dedicated Integration Worker:

```text
npx wrangler versions deploy 8e7f17d0-242a-4290-ab0b-106d4f8353c6@100 --name integration-luvia --message "Operational rollback M16.5Q to App 13.82.58" --yes
```

The rollback target is the immediately previous Integration version
`8e7f17d0-242a-4290-ab0b-106d4f8353c6` from deployment
`a025dd9b-4495-4c53-bcf2-3aaa963c2366`. It is an operational fallback only,
not an accepted functional build. No data rollback is required because M16.5Q
changed no database, storage schema, Edge Function or secret.
