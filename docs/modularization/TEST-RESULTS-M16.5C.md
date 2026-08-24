# Test Results — M16.5C Navigation Continuity

Date: 2026-08-24

Runtime source: `0e8d6c51972f1aa4d6873707e8d02206cbe3957f`

## Static and architecture gates

- `node --check app/app-shell.js`: PASS;
- focused M9.2 staged runtime mounting: PASS;
- M16.5C single-cycle navigation transition: PASS;
- release-version consistency at 13.82.49 / 4.82.49: PASS;
- visual inventory freshness: PASS;
- Safe Regression: 93 / 93 PASS on Consumer, Integration and Main;
- NFR-0 browser-global guard, browserless smoke and Native-First foundation:
  3 / 3 PASS;
- Cross-Core DB ownership guard: no growth;
- twenty-stream topology and Core/stream registry: PASS.

The first full 93-test feature run stopped on three legacy/static checks. Two
route tests detected Identity and Booking only through presentation metadata
that the fix correctly removed; they now prove the canonical Navigation
Contract route plus registered owner mount. The visual inventory was regenerated
from the exact staged scope. The next full run was 93 / 93 PASS.

The first 13.82.49 release run stopped on the M16 runtime registration test's
historical release-name regex. The asset registrations already matched
13.82.49. The metadata assertion was advanced to `M16.5 Navigation Continuity`,
then the complete release suite passed 93 / 93. No failed gate was bypassed.

## Integration acceptance

Accepted Worker version: `73a3eda8-c83f-46fe-9db0-23221bf19bf7`

- critical assets: 8 / 8 exact raw Git blobs;
- authenticated active Trip: Ostseeurlaub / Scharbeutz;
- rendered release: 13.82.49 / Core 4.82.49;
- Today → Plan navigation: PASS;
- final stage hosts: exactly 1 (`plan`);
- obsolete full-field module intros: 0;
- authenticated F5: 25 / 25 PASS;
- browser console entries: 0.

Rejected intermediate Integration versions:

- `d8195e71-7951-46c5-8c8e-c0627acf6853`: canonical content PASS, raw
  byte-exactness open because working-copy CRLF was uploaded;
- `7a3e42bb-896a-440b-b232-8d86e4031b34`: archive export still materialized
  Windows EOL; not accepted.

## Production acceptance

Accepted Worker version: `48770d4e-5a97-4a81-8543-1c42626995c9`

- `https://myluvia.app/`: 8 / 8 exact raw Git blobs;
- direct Production Worker URL: 8 / 8 exact raw Git blobs;
- total Production byte provenance: 16 / 16 PASS;
- authenticated active Trip: Ostseeurlaub / Scharbeutz;
- rendered release: 13.82.49 / Core 4.82.49;
- Today → Plan navigation: PASS;
- final stage hosts: exactly 1 (`plan`);
- obsolete full-field module intros: 0;
- authenticated F5: 25 / 25 PASS;
- browser console entries: 0.

## Mutation ledger

- Consumer feature pushed: yes;
- Integration fast-forwarded and pushed: yes;
- Main fast-forwarded and pushed: yes;
- Integration static Worker deployed: yes;
- Production static Worker deployed: yes;
- database/storage/Supabase Function/secret mutation: none;
- broad M16.5 visual prototype deployment: none.
