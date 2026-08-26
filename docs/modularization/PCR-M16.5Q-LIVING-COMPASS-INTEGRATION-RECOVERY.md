# PCR M16.5Q — Living Compass Integration Recovery

## 1. Status and acceptance boundary

Date: 2026-08-26

Runtime: App 13.82.60 / Core 4.82.60

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
13.82.59 also remains unaccepted. It passed automation that waited for the
Compass to settle, but unchanged human pointer testing reproduced the inert
selection on both the integrated and external browsers; the first Browser Back
during a still-mounting Places route was ineffective; and the accepted motion
reference exposed a premature white carrier plus an incorrect needle handoff.
13.82.60 is the corrective Integration candidate. It receives
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

Binding accepted-motion reference:

- file: `Luvia M16.5E — Signed-in Living Product und 1 weitere Seite - Persönlich – Microsoft​ Edge 2026-08-26 14-34-16.mp4`;
- bytes / SHA-256: `54,880,341` /
  `CFA1998083F3A5C2158F11ACB392CD9C5A37ED862FE348128E30B27196424224`;
- unchanged duration/resolution evidence: 50.211633 seconds / 1920 × 1020;
- binding sequence: the source Compass flies into a still-empty atmospheric
  stage; the Compass and white carrier materialize together only in the final
  handoff; heading and eight fixed orbital points follow with a radial stagger;
  a selected point stays in place with a coral underlay while all others fade;
  and the two-ended needle turns directly to that selected point without a
  search loop before the Compass returns to the brand source.

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
19. App 13.82.59 tests waited for `.is-ready` and then another settlement delay.
    A human could press while a visible direction was still entering; if the
    browser's pointer target changed between `pointerdown` and `pointerup`, the
    native click was lost even though the point visibly reacted or shifted.
20. `commitScreenIntent` ran only after asynchronous module activation. During
    a slow Places mount there was no committed Places history entry yet, so the
    first Browser Back could not restore Plan and the late mount could still
    write stale visible state.
21. `leavePlanCompass` kept the global visual-transition lock for the complete
    asynchronous destination mount. A newer Back/Plan intent could render, but
    its entry was denied by that old lock; when the older task settled, its
    global cleanup then removed readiness from the newer Compass stage.
22. The carrier was allowed to reveal while the target Compass mark remained
    forced invisible until `is-ready`, and the return-flight clone lost the
    inherited signed selection angle. This separated the white disc from the
    arriving mark and could reset the needle during a still-visible exit frame.

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
  directions fade at their orbital positions. The selected point receives the
  accepted coral underlay and remains calmly visible for the bounded 620 ms
  reference hold. No decorative revolution is added.
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
  request. The browser-history intent and requested `activeView` are committed
  before asynchronous module deactivation/activation, so the first Back gesture
  is authoritative even while Places is still mounting.
- Physical primary-pointer input latches the visible direction at
  `pointerdown`, captures that pointer and resolves the same action at
  `pointerup` within the movement tolerance. The synthesized follow-up click is
  suppressed, so a direction cannot be dropped or executed twice if animation
  changes the browser hit target between press and release.
- The shared-element flight is mounted in the persistent `.lv-living-shell`;
  every flight has a common cancellation owner and a bounded fallback. The
  destination action starts after the selection feedback without awaiting the
  decorative return animation, so a throttled or stalled flight cannot gate
  routing. Cleanup removes detached flights, transition classes, duplicate
  hosts and the detached-brand state.
- The central white target carrier stays invisible during the first flight
  phase. `is-compass-arriving` cross-fades/scales the carrier and official target
  Compass together during the final 1.1-second flight handoff; only after the
  bounded handoff pause do the heading and eight fixed directions enter with
  the accepted stagger. The return clone inherits the exact signed selection
  angle and its needle animation is explicitly `none`.
- Hover and selection never resize or translate the direction element; visual
  feedback uses opacity only, preserving the full physical pointer/touch hit
  rectangle from press through route commit.
- The standalone Luvia Compass navigation control still opens the real
  Intelligence dialog directly.
- Before an outgoing host becomes hidden, focus is released from any descendant;
  the host is then both inert and `aria-hidden`. A superseded/Back transition
  removes both states together, so no hidden subtree retains or regains focus.
- The visual exit lock is released as soon as the destination action starts;
  it no longer spans the destination's asynchronous owner mount. Cleanup is
  scoped to the captured old stage and re-checks the monotonic intent before it
  may touch that stage, so a late task cannot reset a newer Compass.

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
- an explicit pre-ready physical press in which the Places element is moved 96
  px after `pointerdown` and before `pointerup`; the originally pressed Places
  action still executes exactly once;
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
- a separate 1.6-second delayed Places mount followed by the first Browser Back;
  Plan remains visible after the old mount settles and exactly one Plan stage
  owns `?screen=plan`;
- direct needle evidence (`Places` = `-90deg`, without `1080deg` addition);
- exit evidence that the selected Places card retains its exact rectangle,
  receives a coral underlay, holds before flight, and the return-flight clone
  retains `-90deg` with `animation-name: none`;
- outgoing-route focus/ARIA evidence: zero focused descendants below
  `aria-hidden`, with the previous host inert for the transition and restored
  together on cancellation;
- timed entry-frame evidence proving the white target carrier and target Compass
  are both hidden before arrival, materialize together in the final
  shared-element phase, and precede the staggered direction sequence;
- Service Worker registration, deliberate stale
  `luvia-shell-v13.17.0` creation/pruning, active
  `luvia-shell-v13.82.60` recovery and offline document/CSS reload.

Visual evidence is retained locally under
`test-results/m16.5q/desktop-entry-before-arrival.png`,
`desktop-entry-arrival-crossfade.png`, `desktop-entry-shared-handoff.png`, `desktop-plan.png`,
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
 well. App 13.82.59 then passed automation only after internal readiness waits;
 real human input reproduced the inert direction before settlement, the first
 Back failed during an in-flight Places mount, and the binding reference exposed
 the disconnected carrier/Compass and needle timing. App 13.82.59 is therefore
 also revoked and provides no functional acceptance.

App 13.82.60 public stable-origin re-acceptance completed after deployment:

1. a separate authenticated in-app browser tab loaded only `.60`-keyed runtime
   scripts and retained the exact route after a real reload;
2. a real primary pointer pressed and released during the visible
   `is-compass-arriving` / not-yet-`is-ready` window at 910 × 698 and 390 × 844;
   an immediate click repeated the same early window at 320 × 673. The latched
   direction routed exactly once despite the target switching from
   `pointer-events:none` to interactive between the physical phases;
3. direct clicks opened Plan, Trip, Memories, Profile and Today Compass
   contexts without a Plan-first precondition. Every context retained eight
   primary directions and the same center without stale route hosts;
4. all eight Plan directions produced their exact visible target state. Places,
   My Places, Booking and Routes committed their canonical URLs; Timeline
   returned to Today; reserved Checklist, Budget and Weather states remained
   deliberately ephemeral instead of forging productive routes;
5. the first Browser Back was issued immediately after the early Places
   history commit and restored the deep-linked Plan Compass despite the Places
   activation still being in flight. No duplicate host, stale stage or focused
   descendant below `aria-hidden` remained. X and Escape independently returned
   to Today; after the bounded return phase no stage or flight remained;
6. deployed motion sampling proved carrier and target mark stayed jointly at
   opacity zero through the flight phase, materialized together, and exposed
   directions only afterward. Selection preserved an identical card rectangle,
   added the coral underlay, used the direct `-90deg` angle, showed no flight
   during the hold and kept needle animation disabled;
7. authenticated Places returned 18 productive Scharbeutz results, six
   coordinate-qualified visible results and six MapLibre markers. Search,
   visible marker → result selection, honest empty/loading states and
   zero horizontal overflow passed at desktop, 390 × 844 and 320 × 673;
8. the browser console contained no `Blocked aria-hidden ... retained focus`,
   Compass or transition warning. The only warning was the pre-existing Trip
   remote-list fallback retaining its local offline cache;
9. all ten changed runtime assets are byte-exact between clean commit export,
   stable origin and immutable origin. Probes under `tests`, `docs`, `.git` and
   `wrangler.jsonc` returned only the public SPA entry and exposed no private
   artifact bytes.

Status after deployment: **LOCAL EDGE E2E/PWA PASS; AUTHENTICATED PUBLIC VISIBLE
RECOVERY E2E PASS WITHIN THE M16.5Q MATRIX. This does not accept the remaining
M16.5 visual-parity matrix or authorize Main/Production promotion.**

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
- `ffe86dd` — physical pointer ownership across moving targets, early
  browser-history commitment, scoped asynchronous cleanup and reference-bound
  carrier/selection/needle motion.
- `4a07245` — retain the direct selected needle angle through the still-visible
  outgoing route handoff.

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
- App 13.82.60 human-interaction/motion assembly: `9b4bbc4`; runtime release
  commit: `bc3549eeadbbb117469dd2340b1a022700ded644`.

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

Superseded, unaccepted App 13.82.59 Integration:

- source commit: `6abb10607f992b1ced0d63df226ce3d560395319`;
- version ID: `599148c7-6783-416d-9988-12bb111ab898`;
- deployment ID: `aec7b747-5879-4973-bf81-5ef9d8e1fb0d`;
- immutable URL:
  `https://599148c7-integration-luvia.njwnrvwbv5.workers.dev/`;
- reason superseded: human pointer input before internal readiness could lose
  the direction between press and release; history was not committed before a
  slow Places mount; stale exit cleanup could reset the restored Plan stage;
  and carrier/Compass/needle timing deviated from the binding reference.

App 13.82.60 Cloudflare Integration evidence:

- source commit: `bc3549eeadbbb117469dd2340b1a022700ded644`;
- version ID: `a785c5b2-e4a2-4310-9b11-8d43c6fb129f`;
- deployment ID: `1015592a-43f3-4aa6-ac2e-8fd5d1ecdf32`;
- traffic: 100%;
- stable URL: `https://integration-luvia.njwnrvwbv5.workers.dev/`;
- immutable URL:
  `https://a785c5b2-integration-luvia.njwnrvwbv5.workers.dev/`;
- ten changed runtime assets byte-exact across clean commit export, stable and
  immutable origins.

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
- authenticated functional execution in an independently controlled external
  Edge profile; the connected Edge control surface was unavailable, while the
  local Edge E2E and authenticated in-app public E2E both passed;
- the remaining M16.5 visual-parity matrix, especially complete Booking and all
  other surfaces not included in this recovery;
- the user's explicit complete Design Freeze and any later Main/Production
  promotion.

## 9. Rollback

Rollback affects only the dedicated Integration Worker:

```text
npx wrangler versions deploy 599148c7-6783-416d-9988-12bb111ab898@100 --name integration-luvia --message "Operational rollback M16.5Q to App 13.82.59" --yes
```

The rollback target is the immediately previous Integration version
`599148c7-6783-416d-9988-12bb111ab898` from deployment
`aec7b747-5879-4973-bf81-5ef9d8e1fb0d`. It is an operational fallback only,
not an accepted functional build. No data rollback is required because M16.5Q
changed no database, storage schema, Edge Function or secret.
