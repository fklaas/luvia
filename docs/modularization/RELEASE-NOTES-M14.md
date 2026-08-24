# M14 Runtime Clarity and Conversational Luvia AI

## Release identity

- App / Core: `13.82.45 / 4.82.45`
- Starting marker / code rollback: `00e6e8c67757d9149ba8d5cbddbe6ef38db25313`
- Runtime Integration and Main commit: `41a1b651c24dcc300454043fcca8d99bf515b6dc`
- Consumer implementation: `5c5abb54885c3625a147be01064a11921ac082cb`
- Intelligence implementation: `2794645e25a2303d76846efb6d3ecbd1aa7d3ce3`,
  `e3846cb9775e90a35829b12d37acdd7806bcee9f`
- Experience implementation: `1c8730d48534e6c564af22f0f774ab42a32f1d0`,
  `6ede24b86ba89526ae4ff20faa4c3f611e0ec41e`
- Status: **COMPLETE / CLOSED / PRODUCTION VERIFIED**

## Delivered

- Replaced six repeated Booking runtime-loader implementations with one
  declarative, deduplicated and observable loader boundary.
- Removed five unreachable archived Paris-era UI copies. Exact pre-deletion
  blob identities and replacements are recorded in the M14 retirement
  manifest; all files remain recoverable from Git.
- Preserved the three demonstrably active Paris compatibility paths behind
  explicit replacement and removal gates.
- Established the owner-first target folders for all eight streams without a
  speculative mass move: Domain Core, runtime policy, Experience semantics,
  Web composition, category modules and bounded legacy compatibility.
- Upgraded the global Luvia AI dialog to a real conversation with visible
  submit, Enter and Shift+Enter semantics, persistent turns, contextual
  follow-ups, in-flight safety and clear read-only action status.
- Made the conversation and composer reachable across laptop, mobile,
  simulated keyboard, dynamic viewport and safe-area constraints.

## Ownership and Native First

- Intelligence may reason across every public Domain contract but M14 gives it
  no foreign truth or direct mutation authority.
- Experience owns interaction and visual behavior only.
- App Shell owns Web composition, not Booking truth.
- Timeline/Journey remains a separate cross-domain Core.
- Browser/device behavior remains outside Domain rules. NFR-0 is **3/3 PASS**.

## Measured gates

- Safe Regression: **74/74 PASS**.
- Cross-Core DB ownership: **357** tracked JS/TS files, static **310**, mapped
  **30/30**, unmapped **39/39**, dynamic **27/27**, no growth.
- Runtime diff: **25 files, 499 insertions, 8,043 deletions**.
- Database/schema/RPC/RLS/bucket migration: none.
- Supabase Edge Function, secret/provider or manual Cloudflare change: none.

## Preview

- Version `2225b653-d0b0-4154-b000-47d49266f513` (number 746).
- Immutable URL and integration alias: each **9/9 byte-exact Git blobs**,
  **5/5 private-path** and **5/5 retired-path SPA fallback**.
- Authenticated Ostseeurlaub/Scharbeutz, App/Core, Enter, Shift+Enter,
  conversation history, contextual follow-ups, Escape/focus restoration,
  desktop 1280 x 720, mobile 390 x 844 and simulated keyboard 390 x 500:
  **PASS**.
- Minimum active action: **46 px**; horizontal overflow: **none**; console:
  **0 warnings / 0 errors**.
- Final authenticated F5: **25/25**, 3.552-4.789 seconds, average 4.150
  seconds; overlay depth zero.
- Ten earlier samples are explicitly rejected because their test predicate
  queried isolated/non-existent global runtime state. They are not counted as
  application failures or passes.

## Production

- Version `5ecb0362-579f-4c7d-a8b3-c50b12572823` (number 747), deployment
  `935193e9-ba4a-42e4-aee7-36909ba63b90`, **100%**.
- Immutable URL and `myluvia.app`: each **9/9 byte-exact Git blobs**, **5/5
  private-path** and **5/5 retired-path SPA fallback**.
- Real prompt, assistant response, two contextual follow-ups, read-only action
  status, responsive layouts, keyboard and focus restoration: **PASS**.
- Final authenticated F5: **25/25**, 4.553-7.932 seconds, average 5.725
  seconds; overlay depth zero; console **0/0**.
- Main promotion was fast-forward only. Cloudflare causation is not inferred
  because the observed deployment has no Git commit annotation.

## Rollback

Code-only rollback to `00e6e8c67757d9149ba8d5cbddbe6ef38db25313`.
No persisted-data or infrastructure compensation is required.
