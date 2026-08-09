# Testplan — v13.68.0 Email Booking V2

1. Migrationen vorhanden; Views und Tabellen sichtbar.
2. `window.LuviaBookingEmailV2` vorhanden; `readiness/get/history/queue/send` sind Functions.
3. Booking ohne E-Mail -> `BOOKING_CONTACT_EMAIL_MISSING` / `contact_required`.
4. Generische Provider-Adresse wie `contact@zenchef.com` -> `BOOKING_PROVIDER_EMAIL_DOMAIN`, kein Resend-Call.
5. Nicht als offizieller Venue-Kandidat verifizierte Adresse -> `VENUE_EMAIL_NOT_VERIFIED`, kein Resend-Call.
6. Verifizierte Venue-Adresse im Testmodus -> Versand nur an `BOOKING_TEST_RECIPIENT`, `intended_recipient` bleibt Restaurantadresse.
7. Identischer Send-Request -> idempotente Antwort, kein zweiter Versand.
8. Thread wird angelegt und Outbound Message verknüpft.
9. Inbound Reply wird über Alias/Header einem Thread zugeordnet.
10. Reply Intelligence erzeugt Status-Provenance (`email_reply`), keinen direkten Booking-Status-Write.
11. Delivery Event ist idempotent; Bounce/Complaint landet in `delivery_attention`.
12. `reply_overdue`/`review_required` erscheinen in Recovery Queue; **kein automatischer Resend**.
