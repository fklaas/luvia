# Current Build

- App: **13.80.1**
- Core: **4.80.1**
- Name: **Booking Actions & Intelligence – Composer Send Reliability Fix**
- Base: v13.80.0

## Patch scope
- explicit click handler for Booking Inbox send button
- native submit remains supported (keyboard/Enter/form semantics)
- one shared `sendFromForm()` transport path
- persistent inline composer status/error feedback
- no Booking/Message truth changes
- no DB schema changes beyond v13.80.0
- no Edge Function changes beyond v13.80.0
