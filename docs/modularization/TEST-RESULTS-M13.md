# M13 Test Results

Date: 2026-08-24

Status: LOCAL RELEASE CANDIDATE PASS

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

## Pending release gates

- Integration Preview static provenance and authenticated runtime: pending.
- Main promotion and Production provenance: pending.
- Production authenticated F5 and console acceptance: pending.
- Final eight-stream synchronization: pending.

No pending gate is pre-claimed as PASS.
