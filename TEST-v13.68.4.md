# Test – Luvia v13.68.4 / Core 4.68.4

Primary regression target: Café Berry booking `e02f3951-8ca7-4ed5-b7ab-e94a5aa04712` with legacy email `bonjour@cafeberryparis.fr`.

1. Invoke `booking-contact-resolve` with the authenticated Luvia client.
2. The resolver must no longer return `CONTACT_ALREADY_PRESENT` merely because the booking field exists.
3. If the exact email is published on the official venue source, response must report `legacyContactVerified: true` and `bridgeReason: LEGACY_CONTACT_VERIFIED_AND_BRIDGED`.
4. `booking_contact_candidates` must contain the exact address with verified/public/official/auto-usable state and a source URL.
5. Repeating the resolver must not create duplicate candidates for the same booking/kind/contact/source tuple.
6. `window.LuviaBookingEmailV2.readiness(...)` must then become READY only if the verified candidate exists.
7. If the address is not present on the official venue source, Email V2 must remain blocked.
