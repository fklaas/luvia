# Luvia v13.55.0 / Core 4.55.0 — Provider Return Matrix + Booking/Places Reliability

## Booking Core
- Expands the remaining provider return matrix for OpenTable, TheFork, Resy, Zenchef and SevenRooms using only public, first-party capability evidence.
- Keeps partner-gated payload/status vocabularies non-auto-applying; no undocumented status mapping is invented.
- Adds `booking_provider_return_readiness` for one auditable view of connected/verified/partner-required return paths.

## Booking discovery reliability
- Provider recognition now understands legacy TheFork/LaFourchette hosts, lazy-loaded booking iframes, structured booking actions and script/config URLs.
- Provider handoff validation accepts venue-specific JS booking shells without weakening venue verification.
- Contact resolution decodes Cloudflare-protected email addresses and crawls official contact/imprint/privacy/legal pages in parallel.
- E-mail fallback remains evidence-only: no guessed address is ever sent.

## Places reliability & performance
- One central quick-filter/category click path restores all Places catalogue chips after rerenders.
- AI Places search removes duplicate nested AI ranking and aggregates provider searches before one final AI ranking pass.
- Search plans are capped, parallelized and cached for 90 seconds to improve repeated and Reisekompass-guided searches.
