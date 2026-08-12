# Luvia Current Roadmap

## Completed
- v13.75 – Adaptive Failover, Decision Replay & Orchestration Hardening
- v13.76 – Control Center Architecture & Global Product Module Foundation
- v13.77 – Control Center Home & Travel Identity Integration
- v13.78 – Booking Control Center Foundation
- v13.79 – Booking Inbox & Conversations
- **v13.80 – Booking Actions & Intelligence**
  - real bidirectional reply transport over existing Booking Email V2 threads
  - explicit user approval before reply transport
  - persistent Intelligence review/action state
  - Alternatives accept / decline
  - `requires_action` and ambiguous `review_required` answers
  - free text composer connected to Booking Core
  - safe recipient verification, idempotency and thread correlation
  - action audit events and provider-independent UX

## Next
- **v13.81 – Booking Timeline, Modify & Cancel**
  - understandable lifecycle timeline
  - booking mutations and mutation state
  - modify / cancel
  - reconciliation and recovery UX
- **v13.82 – Travel Wallet & Notifications**
- **v13.83 – Trip Command Center Foundation**
- **v13.84 – Control Experience Hardening**

## Architecture rule
Control Center surfaces may aggregate, interpret and initiate user-approved actions, but Booking, Message, Trip, Auth, Media, Realtime and Notification truth remain in their respective Cores.
