# M15 Test Results - Actionable Intelligence and Rich Results

Date: 2026-08-24

Runtime source: `d39ed496d45b38cc6722cd0668d25f99e490940c`

App / Core: 13.82.47 / 4.82.47

## Automated gates

- Safe Regression: 84 / 84 PASS.
- NFR-0: 3 / 3 PASS.
- Cross-Core DB ownership guard: PASS.
  - tracked JS/TS: 360;
  - static DB calls: 310;
  - mapped debt: 30 / 30 allowed, historical baseline 26;
  - unmapped DB objects: 39 / 39 baseline;
  - dynamic DB calls: 27 / 27 baseline.
- Browserless Action Contract: PASS.
- Automatic action execution restricted to READ/NEVER: PASS.
- Foreign Domain mutation ownership in Intelligence: 0.
- Journey/Timeline independent ownership: PASS.
- Verified dietary provider-evidence regression: PASS.
- Bounded progressive Places breadth regression: PASS.
- Booking owner entry, route attribution and CORS guard: PASS.
- Natural day-intent Rich Result routing: PASS.
- Rich-result desktop/mobile/touch/reduced-motion and trip-accent semantics:
  PASS, new `!important` debt 0.

## Supabase Function acceptance

Function: `booking-route-resolve`

- resolver version: 2.5.1;
- active Supabase Function deployment version: 11;
- function id: `2b0b11f4-4214-488e-87df-e7fe416d3e60`;
- deployed bundle SHA-256:
  `f4a0877227f1f8e31296b3d112ffbd08a8629cd6cd580ff06e8d5d00d6dae924`;
- Production, www, Integration, Production Worker and immutable Preview
  preflights: 5 / 5 PASS;
- hostile-origin negative preflight: 1 / 1 PASS, HTTP 403 and origin `null`;
- wildcard origin: NONE;
- exact authenticated Restaurant Cafe Diercksen route: PASS;
- search count: 1 exact venue;
- official website present: YES;
- pages checked: 7;
- verified candidates: 2;
- selected channel/provider/reason:
  `email / official_website / VERIFIED_EMAIL_FALLBACK`;
- resolver response version: 2.5.1.

## Integration Preview acceptance

- Cloudflare version: `ae4fdd36-3b54-4f0f-a072-bbbdd30cc37c` (number 771).
- Stable and immutable Preview URLs: each 15 / 15 byte-exact Git blobs.
- Stable and immutable Preview URLs: each 5 / 5 private-path SPA fallback.
- Stable and immutable Preview URLs: each 5 / 5 retired-path SPA fallback.
- Authenticated App/Core 13.82.47 / 4.82.47: PASS.
- Active Trip Ostseeurlaub / Scharbeutz: PASS.
- Action runtime 1.0.1, six actions and Trip/Places/Booking/Journey owner
  availability: PASS.
- Places and Booking public contract readiness: PASS.
- Prompt "Plane einen entspannten Tag für mich": Journey Rich Result PASS,
  four day cards plus owner action.
- Enter submit: PASS.
- Shift+Enter newline without submit: PASS.
- 390 x 844: no horizontal overflow, scrollable chat, Rich Result visible.
- 390 x 500 keyboard viewport: no horizontal overflow; submit visible at
  46.24 px height.
- Browser console after feature acceptance: 0.
- Authenticated reloads: 25 / 25 PASS.
- Reload range: 3.963-6.562 seconds; average 4.625 seconds.
- Browser console after reload gate: 0.

## Main and Production acceptance

- Main promotion: fast-forward only, PASS.
- Production Cloudflare version:
  `3f12dc7d-5332-4521-b38c-3cc36f7b38b1` (number 772).
- Production deployment:
  `e36fe7ad-97a6-4654-97bd-e425653753ad`, 100%.
- `myluvia.app` and immutable Production URL: each 15 / 15 byte-exact Git
  blobs.
- Both Production URLs: each 5 / 5 private-path and 5 / 5 retired-path SPA
  fallback.
- Authenticated App/Core, active Trip and all four owner bindings: PASS.
- Production Journey Rich Result: four day cards plus owner action, PASS.
- Production browser console after feature acceptance: 0.
- Authenticated Production reloads: 25 / 25 PASS.
- Reload range: 3.571-6.625 seconds; average 4.269 seconds.
- Production console after reload gate: 0.

## Infrastructure invariants

- Database/schema/RPC/RLS/bucket migration: NONE.
- Secret change: NONE.
- Manual Cloudflare configuration: NONE.
- Only Supabase Function mutation: `booking-route-resolve` 2.5.1.
- HTTP 200 was never used alone as private-path evidence; fallback bodies were
  compared byte-for-byte with the active index response.
- CRLF working-copy differences were excluded by comparing deployed bytes
  directly against Git blobs.
