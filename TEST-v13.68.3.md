# Test – Luvia v13.68.3 / Core 4.68.3

1. Confirm `window.LuviaBookingEmailV2.version === '1.0.3'`.
2. Sphère readiness remains blocked with `EMAIL_ASSET_OR_FILE_REFERENCE`.
3. Sphère `send()` returns an expected-state response rather than HTTP 500.
4. `booking_email_requests` contains a blocked audit row for the request.
5. `actual_recipient` and `provider_message_id` remain null.
6. Verified-candidate RPC is invoked with `userClient`, not the service-role admin client.
7. Audit/thread persistence continues to use service role.
8. Resend fetch remains after verified-recipient gate.
