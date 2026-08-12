# Luvia v13.81.3 / Core 4.81.3

## Booking Mutation UX
- blocked mutation paths now disable the primary CTA after a structural blocker is known
- user-facing blocker copy remains readable instead of raw codes
- no Booking Truth is mutated by UI availability decisions

## Mobile Action Footer
The previous z-index-only fix was not sufficient because the fixed global navigation and the dialog could still participate in different stacking contexts. v13.81.3 suppresses `.luvia-shell-nav` while a Booking mutation dialog is open, locks the body, uses a full `100dvh` mobile sheet and keeps the action footer sticky with safe-area padding.

## Timeline
Transport noise is presentation-deduplicated in `bookingTimeline()` while the underlying audit/event truth remains untouched.

## Contact / Reservation Discovery Reliability
- booking-contact-resolve 1.4.0
- booking-route-resolve 2.4.0
- deeper official-site crawl including contact/reservation/restaurant/location pages
- guessed well-known paths when navigation markup is incomplete
- redirect-aware crawling
- `mailto:`, visible email, JSON/config email and basic `[at]/[dot]` obfuscation support
- venue/provider safety rules retained; generic provider email domains remain blocked
- Green Farmer's regression coverage for `hello@greenfarmers.fr`

## Google Reservation Discovery
`google.com/maps/reserve/...` may now be classified as `google_reserve` when such a handoff is present in input or discovered markup. This is a handoff/discovery signal only. Diagnostics explicitly report `googleDirectIntegration: false`.
