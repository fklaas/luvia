# Luvia v13.66.0 / Core 4.66.0 — Email Booking V2 Request Runtime

## Ziel
Der E-Mail-Fallback wird vom einfachen Transport zu einem serverseitig auditierten Booking-Runtime-Pfad. Ein `bookings.contact.email` allein ist keine Versandfreigabe mehr.

## Neu
- `booking_email_requests` als persistierter Outbound-Audit mit Idempotenz, Fingerprint und Expected States.
- `luvia_booking_email_verified_candidate(...)` prüft unmittelbar vor Versand, ob die Zieladresse als verifizierter, öffentlicher und offizieller Venue-Kontakt in `booking_contact_candidates` vorliegt.
- Generische Booking-/SaaS-Provider-Domains bleiben über `luvia_booking_is_provider_email_domain(...)` geblockt.
- `booking_email_readiness_v2` zeigt `ready`, `contact_required`, `verification_required` oder `blocked`.
- Versand benötigt einen expliziten Nutzeraufruf (`userApproved=true`).

## Sicherheitsprinzip
Keine erratene E-Mail, keine generische Provider-Adresse, kein stiller Auto-Versand.
