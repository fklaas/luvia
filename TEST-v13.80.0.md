# Test Plan – Luvia v13.80.0 / Core 4.80.0

## Automated local gates
1. v13.80 Booking Actions & Intelligence architecture test.
2. v13.80 Reply Safety Contract test.
3. v13.78 Product Module regression.
4. v13.78 Booking Control Center regression.
5. v13.77 Control Center Home/Travel Identity regression.
6. Six Booking provider adapter regressions.
7. JavaScript syntax checks for all changed JS files.
8. Static version/cache/config consistency checks.

## Manual production gates
Because the reply function requires real authenticated Supabase + Resend transport, production validation must verify:
- existing thread lookup
- venue-recipient verification
- Resend acceptance
- canonical message storage
- thread state update
- persistent Intelligence resolution
- no premature confirmation

## Acceptance criteria
- Free composer replies are real and persistent.
- UI never displays a successful message before transport succeeds.
- `alternative_proposed` actions send an actual reply and move the Booking to `awaiting_reply`, never directly to `confirmed`.
- `requires_action` replies resolve their Intelligence review state.
- `review_required` can be answered or explicitly marked reviewed.
- Inbox still owns no Booking/Message truth.
- Existing provider adapter tests remain green.
