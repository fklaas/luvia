# Luvia v13.81.4 / Core 4.81.4

## Mutation Thread Bootstrap
Modify/Cancel no longer requires a pre-existing `booking_email_thread` when a direct provider mutation is unavailable.

The Booking Integration now follows this order:
1. Try the existing provider mutation path.
2. If the provider result is a known safe fallback state, verify whether the booking state still permits a mutation request.
3. Reuse an existing booking e-mail thread when present.
4. If no thread exists, reuse `booking.contact.email` only when the Booking Core already has an auto-usable verified candidate for that exact address.
5. Otherwise run `booking-contact-resolve` against the official venue website.
6. Verify the finally selected contact again through `luvia_booking_email_verified_candidate`.
7. Only then allow `booking-email-reply` to bootstrap a new mutation thread for action `modify` or `cancel`.
8. Send the request and record the canonical booking message/audit data.

Normal Inbox replies are deliberately unchanged: they still cannot invent a missing thread. Thread bootstrap is narrowly restricted to the two evidence-driven mutation actions.

A successful send returns `email_thread_bootstrap` as the transport. Sending a request does **not** set the booking to `confirmed` or `cancelled`; the mutation remains pending while provider outcome is unknown.

If Resend rejects the first message of a freshly bootstrapped thread, the thread is marked `delivery_failed` rather than pretending that an answer is pending. The reply idempotency fingerprint is independent of the transient thread-creation flag, so a retry after a partial send/recording failure reuses the same Resend idempotency key and mutation subject instead of risking a duplicate provider e-mail.

## Mobile Mutation Surface
The previous mobile modal/stacking approach is replaced by a dedicated mobile mutation drilldown:
- true `100dvh` fullscreen surface
- own header with `← Buchung`
- independently scrollable body
- own action footer in a separate layout row
- safe-area padding
- global `.luvia-shell-nav` and `.lv-dock-wrap` removed from layout while the surface is active
- desktop keeps the established modal

This is a structural fix for the covered CTA problem rather than another z-index workaround.

## Contact Resolver 1.5.0
`booking-contact-resolve` now hardens official-site crawling with:
- URL normalization and HTTPS-first behavior
- manual redirect handling with redirect-chain diagnostics
- redirect-domain venue-identity validation
- browser-like User-Agent, Accept and Accept-Language headers
- request timeout and error classification
- HTTP status, final URL, redirect chain and content-type diagnostics
- known contact/reservation/location path discovery
- `mailto:`, visible e-mail, structured/JSON e-mail and basic obfuscation extraction
- venue-specific verification before a candidate becomes usable
- generic booking-provider e-mail domains remain blocked

Existing `booking.contact.email` is treated as discovery input, not proof. It becomes reusable only if it is already a verified Booking Core candidate or is rediscovered on an official venue source.

## Route Resolver 2.5.0
`booking-route-resolve` receives the same fetch/redirect hardening and now reports richer diagnostics:
- `fetchDiagnostics`
- `httpStatus`
- `finalUrl`
- `errorClass`
- `reasonDetails`
- `existingContactPresent`
- `existingContactVerified`

## Green Farmer's Regression
The regression contract covers the real booking ID:
`046bcb5c-0942-48f7-b8e1-292eb4de60c7`

It specifically protects:
- venue-identity-safe redirect from the legacy Green Farmer's domain family to the current venue-branded domain family
- discovery of venue-published e-mail addresses such as `hello@greenfarmers.fr`
- provider e-mail blocking
- verified-contact reuse
- thread bootstrap for Modify/Cancel
- no fake confirmation/cancellation

A real Supabase Edge production crawl remains a post-deployment smoke test, not something claimed by the local fixture tests.

## Reserve with Google Discovery Matrix
Google remains discovery/handoff only. v13.81.4 exposes:
- `googleReserveDetected`
- `googlePartnerIdentified`
- `googleExternalBookingLink`
- `googleDirectIntegration: false`
- resolved `provider`
- resolved `channel`

If a Google Reserve handoff resolves to a known partner such as TheFork or OpenTable, Luvia may identify that final partner. No direct Google Actions Center integration is claimed or implemented.

## Database / Secrets
- New DB migration: **NO**
- SQL deployment: **NO**
- New tables: **NO**
- New secrets: **NO**
- Changed Edge Functions: **YES**
  - `booking-email-reply`
  - `booking-contact-resolve`
  - `booking-route-resolve`

Existing `booking_email_threads`, `booking_messages`, `booking_email_delivery_events`, contact candidates and mutation/audit primitives are reused. No duplicate booking/message truth was introduced.
