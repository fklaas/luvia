# Current Build

- App: **13.80.3**
- Core: **4.80.3**
- Name: **Booking Actions & Intelligence – Reply Sender Consistency & Error Transparency Fix**
- Channel: production
- Built: 2026-08-12

## Scope
Patch release for the real booking reply path. Aligns reply sender configuration with the proven initial booking email path, adds provider idempotency, and surfaces structured Resend failures instead of `[object Object]`. Mobile Inbox behavior from v13.80.2 remains unchanged.
