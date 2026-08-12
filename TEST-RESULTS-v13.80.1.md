# TEST RESULTS v13.80.1

## PASS
- LUVIA_V13_80_1_BOOKING_INBOX_COMPOSER_SEND_RELIABILITY_OK
- LUVIA_V13_80_0_REPLY_SAFETY_CONTRACT_OK
- LUVIA_V13_79_0_BOOKING_CORE_CONVERSATION_SEAM_OK
- LUVIA_V13_78_0_BOOKING_CONTROL_CENTER_FOUNDATION_OK
- LUVIA_V13_78_0_PRODUCT_MODULE_REGRESSION_OK
- LUVIA_V13_77_0_CONTROL_CENTER_HOME_TRAVEL_IDENTITY_OK
- TheFork adapter regression PASS
- Quandoo adapter regression PASS
- OpenTable adapter regression PASS
- SevenRooms adapter regression PASS
- Resy adapter regression PASS
- Tock adapter regression PASS
- node --check booking-inbox.js PASS
- node --check booking-integration.js PASS

## Live checks still required
- real browser click on Senden
- live `booking-email-reply` invocation
- live Resend acceptance
- persistence of outbound message after reload
