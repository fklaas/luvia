# M14 Test Results

Date: 2026-08-24

Status: COMPLETE / CLOSED / PRODUCTION VERIFIED

## Automated gates

- M14.1 App Shell loader and proof-based legacy retirement: PASS.
- M14.2 AI form, keyboard, IME, in-flight and no-command-authority guard: PASS.
- M14.3 responsive conversation, fixed composer, safe-area and accessibility
  guard: PASS.
- Controlled Safe Regression: **74/74 PASS** on Integration and Main.
- NFR-0 Native First foundation: **3/3 PASS**.
- JavaScript syntax and release consistency for App **13.82.45** / Core
  **4.82.45**: PASS.
- Cross-Core DB ownership: **357** tracked JS/TS files; static **310**; mapped
  **30/30** with historical baseline **26**; unmapped **39/39**; dynamic
  **27/27**; no growth.
- Removed paths: **5/5** absent from Git HEAD and recoverable from recorded
  pre-deletion blobs.

## Integration Preview acceptance

- Version: `2225b653-d0b0-4154-b000-47d49266f513`.
- Immutable version URL and stable alias: each **9/9 exact Git blobs**.
- Internal/private paths: **5/5 exact SPA fallback**.
- Retired legacy paths: **5/5 exact SPA fallback**, not private content.
- Authenticated account: Ostseeurlaub / Scharbeutz retained; App/Core
  13.82.45 / 4.82.45.
- Enter submit, Shift+Enter newline, user/assistant history, contextual
  follow-ups and explicit no-Domain-action status: PASS.
- Desktop 1280 x 720, mobile 390 x 844 and simulated keyboard 390 x 500:
  send action visible, no horizontal overflow and active actions at least
  **46 px**.
- Laptop conversation scroll region improved from **56 px to 169 px**.
- Escape restores trigger focus; final overlay depth zero; console **0/0**.
- Corrected final authenticated F5: **25/25**, minimum **3.552 seconds**,
  maximum **4.789 seconds**, average **4.150 seconds**.

### Rejected Preview evidence

The first ten reload samples used a predicate that expected isolated or
non-existent `window` runtime globals and therefore reported `trip:null`.
Visible authenticated UI and active Trip were stable. This is a test-predicate
defect, not an application failure. The samples remain rejected and are not
rewritten as passes.

## Production acceptance

- Version/deployment: `5ecb0362-579f-4c7d-a8b3-c50b12572823` /
  `935193e9-ba4a-42e4-aee7-36909ba63b90`, **100% active**.
- Immutable URL and `myluvia.app`: each **9/9 exact Git blobs**, **5/5
  private-path** and **5/5 retired-path SPA fallback**.
- Authenticated account and active Ostseeurlaub/Scharbeutz Trip retained.
- Real prompt `Was ist als Nächstes wichtig?` produced one assistant turn and
  two contextual follow-up suggestions; explicit no-Domain-action status:
  PASS.
- Desktop, mobile and simulated keyboard reachability: PASS; active actions
  **46 px**, no horizontal overflow, Escape/focus restoration PASS.
- Final authenticated F5: **25/25**, minimum **4.553 seconds**, maximum
  **7.932 seconds**, average **5.725 seconds**.
- Final overlay depth zero; console **0 warnings / 0 errors**.

## Non-runtime impact

- Database/schema/RPC/RLS/bucket migration: NONE.
- Supabase Edge Function change: NONE.
- Secret/provider change: NONE.
- Manual Cloudflare configuration or manual upload/deploy: NONE.
- Production causation is not inferred beyond observed Git promotion and
  Cloudflare-reported version/deployment source.
