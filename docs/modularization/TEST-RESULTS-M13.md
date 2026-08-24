# M13 Test Results

Date: 2026-08-24

Status: COMPLETE / CLOSED / PRODUCTION VERIFIED

## Automated gates

- M13.1 Memory Core / `memory.v1` foundation: PASS.
- M13.2 Premium Memories & Story Composition Experience: PASS.
- Controlled Safe Regression: **71/71 PASS**.
- NFR-0 Native First foundation: **3/3 PASS**.
- Cross-Core DB ownership: static **310**, mapped **30/30** with historical
  baseline **26**, unmapped **39/39**, dynamic **27/27**; no growth.
- Release consistency: **App 13.82.44 / Core 4.82.44 PASS**.

## Local browser acceptance

- Desktop Premium Memories render and signed preview hydration: PASS.
- Selection: two items selected and selection tray reports 2/60: PASS.
- Story Composer: two memories grouped into one chapter and displayed as
  `2 Momente`: PASS.
- Favorite filter: expected/actual **9/9**.
- Accent-bearing search (`Louvre` fixture): expected/actual **14/14**.
- Mobile viewport: **390 x 844**, body scroll width **375** at inner width
  **390**, no horizontal document overflow.
- Minimum visible component button height: **48 px**.
- Search accessibility label: absolute/1 px visually hidden in isolated
  component fixture.

## Integration Preview acceptance

- Version: `9dfe232e-15de-4aad-a965-955f7607845e`.
- Runtime assets: **12/12 byte-exact Git blobs**.
- Deployment-private paths: **5/5 exact SPA fallback**.
- Authenticated App/Core, active Trip, Memories empty state, contextual Luvia
  AI, Escape/focus restoration and mobile layout: **PASS**.
- Authenticated F5: **25/25 PASS**, minimum **3.395 seconds**, maximum
  **5.940 seconds**, average **4.166 seconds**.
- Browser console: **0/0**.

## Production acceptance

- Version/deployment: `a5aa7b3f-0cd1-4b38-a12d-c3102478f214` /
  `98b1f425-fc75-4eca-b7b1-b1eae69becbe`, **100% active**.
- Version URL: **12/12 byte-exact**, **5/5 exact SPA fallback**.
- `myluvia.app`: **12/12 byte-exact**, **5/5 exact SPA fallback**.
- Authenticated account: Ostseeurlaub / Scharbeutz retained; App/Core
  13.82.44 / 4.82.44; real Memories empty state: **PASS**.
- Contextual Luvia AI overlay, focused input, Escape close and trigger-focus
  restoration: **PASS**.
- Mobile 390 x 844: body/document width **375**, no horizontal overflow; all
  active M13 buttons **48 px**.
- Final authenticated F5: **25/25 PASS**, minimum **2.667 seconds**, maximum
  **4.238 seconds**, average **2.956 seconds**.
- Browser console after final series: **0/0**.
- Main promotion: **FF-only PASS**.
- Eight-stream runtime synchronization: **8/8 PASS** on
  `8fa43791f960cb1c5e8e67e253b5676d8dd46e6b`.

The authenticated real account contains zero Media assets. Therefore the
released empty state was accepted in Integration and Production without
creating user data. Large-library search/filter, two-item selection and Story
Composer behavior were separately verified with the deterministic local
fixture; this fixture evidence is not misrepresented as Production user data.
