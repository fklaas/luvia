# Test Results v13.80.3

## PASS
- `LUVIA_V13_80_3_REPLY_SENDER_ERROR_TRANSPARENCY_OK`
- `LUVIA_V13_80_0_REPLY_SAFETY_CONTRACT_OK`
- `LUVIA_V13_80_0_BOOKING_ACTIONS_INTELLIGENCE_OK`
- `LUVIA_V13_79_0_BOOKING_CORE_CONVERSATION_SEAM_OK`
- `LUVIA_V13_78_0_BOOKING_CONTROL_CENTER_FOUNDATION_OK`
- `LUVIA_V13_78_0_PRODUCT_MODULE_REGRESSION_OK`
- `LUVIA_V13_77_0_CONTROL_CENTER_HOME_TRAVEL_IDENTITY_OK`
- TheFork adapter regression
- Quandoo adapter regression
- OpenTable adapter regression
- SevenRooms adapter regression
- Resy adapter regression
- Tock adapter regression
- JS syntax checks for changed runtime files

## Historical version-locked tests
`v13.80.2-reply-verification-mobile-inbox.test.cjs` and `v13.80.1-booking-inbox-composer-send-reliability.test.cjs` contain hard-coded cache/version assertions for their own release numbers and therefore fail after the legitimate v13.80.3 cache bump. Their functional guarantees are retained by the current v13.80.3 gate plus the v13.80.0 functional regression tests.

## Not live-tested locally
- Real Resend provider acceptance in production
- Production Supabase Edge Function execution
- Actual venue mailbox threading
- Production service-worker refresh
