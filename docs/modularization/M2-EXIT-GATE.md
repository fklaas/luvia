# M2 Exit Gate — Ownership & Contract Specification

**Baseline:** aff59be / v13.81.4 / Core 4.81.4  
**Build type:** documentation/contract specification only  
**Runtime version bump:** none required

## Master-plan requirements

- [x] Minimal public contracts defined for Trip, Places, Booking, Media, Identity, Intelligence and future Social.
- [x] Read, command/write and event responsibility documented separately for every core.
- [x] Database/domain ownership documented in Markdown + CSV.
- [x] Forbidden direct accesses explicitly defined.
- [x] Platform Change Request rule defined for shared/contracts/events.
- [x] Contract versioning rule defined.
- [x] No old implementation deleted.
- [x] No database migration changed/added.
- [x] No Edge Function changed/deployed.
- [x] No secret changed/read into artifacts.
- [x] Existing productive Cores remain the implementation source for M3 adapters.

## Exit question per core

| Core | What others may read | What others may trigger | What stays internal | Clear? |
|---|---|---|---|---|
| Trip | normalized trip/context projection | active selection + Trip use-case commands | storage/RPC/legacy bridge/tables | YES |
| Places | search/place/lifecycle projection | import/favorite/plan/lifecycle commands | adapters/backend/table persistence | YES |
| Booking | booking/conversation/timeline/status projection | create/reply/action/modify/cancel/preferences via LuviaBooking | repository/providers/tables/functions/secrets | YES |
| Media | media/memory projections + signed URL requests | media/memory owner commands | storage/table/clustering internals | YES |
| Identity | self + safe public identity projection; private preferences only to self | profile/preference commands | full profile row/private prefs/auth migration | YES |
| Intelligence | capability results/proposals | run capability / create proposal | provider/router/tools/evidence internals | YES |
| Social future | future feed/experience/social unread projection | future Social-owned commands | future graph/ranking/moderation schema | YES |

## M2 result

**PASS — M2 Ownership & Contract Specification is complete as a documentation build.**  
Next architecture build is **M3 — Contract Adapter Foundation**. Runtime implementation must remain additive and legacy-compatible.
