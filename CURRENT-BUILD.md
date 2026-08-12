# CURRENT BUILD

- App: **13.81.4**
- Core: **4.81.4**
- Name: **Mutation Thread Bootstrap, Mobile Mutation Surface & Discovery Fetch Hardening**
- Channel: production
- Date: 2026-08-12

## Scope
- Safe mutation-thread bootstrap for Modify/Cancel when no existing booking email thread exists
- Existing verified `booking.contact` reuse plus official-site contact verification fallback
- True mobile Modify/Cancel fullscreen drilldown with global bottom navigation removed while active
- Redirect-aware, browser-like fetch hardening and diagnostics for contact/route discovery
- Green Farmer's redirect/contact regression coverage
- Reserve with Google handoff/partner diagnostics; direct Google integration remains disabled

## Deployment
- Database migration: NO
- SQL deployment: NO
- Edge Functions: YES (`booking-email-reply`, `booking-contact-resolve`, `booking-route-resolve`)
- New secrets: NO
- Static app: YES

## Core truth
- Modify/Cancel requests never set `confirmed` or `cancelled` merely because a message was sent.
- Provider/API/email evidence and the existing Booking Core provenance/reconciliation layers remain authoritative.
