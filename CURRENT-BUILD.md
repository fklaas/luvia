# CURRENT BUILD

- App: **13.81.3**
- Core: **4.81.3**
- Name: **Booking Mutation UX, Mobile Action Footer & Contact/Reservation Discovery Reliability**
- Channel: production
- Date: 2026-08-12

## Scope
- Mutation action-state UX / blocked CTA handling
- Mobile Modify/Cancel modal owns the foreground and suppresses global bottom navigation while open
- Booking timeline presentation deduplication
- Deep official-site contact/reservation crawl
- Green Farmer's contact-discovery regression (`hello@greenfarmers.fr`)
- Reserve with Google handoff detection (discovery only; no claimed direct integration)

## Deployment
- Database migration: NO
- SQL: NO
- Edge Functions: YES (`booking-contact-resolve`, `booking-route-resolve`)
- New secrets: NO
- Static app: YES
