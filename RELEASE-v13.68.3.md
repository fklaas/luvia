# Luvia v13.68.3 / Core 4.68.3
## Email Verification Auth Context Fix

This patch fixes the auth-context defect discovered while validating the v13.68.2 early email audit path.

### Root cause
`booking-email-send` correctly proved booking access with the authenticated browser JWT, then invoked `luvia_booking_email_verified_candidate(...)` through the service-role client. The verification RPC intentionally checks trip membership through `auth.uid()` unless a request JWT is explicitly identified as service role. Through the Edge/PostgREST RPC path this produced `TRIP_ACCESS_DENIED`, turning an expected recipient block into `EMAIL_CONTACT_VERIFICATION_FAILED` / HTTP 500.

### Fix
- Booking access continues through the authenticated `userClient` and RLS.
- Venue-contact verification now also executes through the same authenticated `userClient`.
- `admin` / service role remains limited to server-side audit, thread and bookkeeping writes.
- The v13.68.2 early audit remains intact.
- Invalid recipient results such as `EMAIL_ASSET_OR_FILE_REFERENCE` flow through the expected-state `block(...)` path and return HTTP 200.
- No Resend transport can execute before authenticated venue-contact verification succeeds.

### Expected Sphère regression result
For `logo-le-point@2x.jpg`:
- `ok=false`
- `expected=true`
- `error=EMAIL_ASSET_OR_FILE_REFERENCE`
- audit row: `state=blocked`, `expected_state=true`
- `actual_recipient=null`
- `provider_message_id=null`
- no Resend call

### Versions
- App: 13.68.3
- Core: 4.68.3
- Email V2 Browser Client: 1.0.3
- Email Send: 2.0.3
