# Test Plan – v13.81.0

## Automated release gates
- `node tests/v13.81.0-booking-timeline-modify-cancel-conversation-lifecycle.test.cjs`
- `node tests/v13.81.0-mutation-evidence-safety.test.cjs`

## Regression gates
- v13.80 reply safety
- v13.80 Booking Actions & Intelligence
- v13.79 conversation seam
- v13.78 product-module regression
- v13.78 Booking Control Center foundation
- v13.77 Control Center Home/Travel Identity
- TheFork/Quandoo/OpenTable/SevenRooms/Resy/Tock adapter foundations

## Browser tests
### Timeline
- Booking selected → Timeline appears.
- Inbound/outbound message events are understandable.
- Mutation warnings indicate unknown provider outcome/reconciliation when applicable.

### Modify
- Button opens action sheet.
- Date/time/party size can be changed.
- Submit does not directly claim final booking modification.
- Provider-ready path uses provider mutation.
- Unsupported provider can use existing email thread fallback.

### Cancel
- Explicit confirmation sheet required.
- Click never locally marks booking cancelled.
- Provider/email evidence must decide final status.

### Conversation lifecycle
- Archive removes from normal Inbox and shows in Archiv.
- Unarchive restores.
- Delete requires confirmation and hides conversation.
- Messages/audit remain in database.
