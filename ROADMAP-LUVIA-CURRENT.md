# Luvia Current Roadmap

## Completed
- v13.75 – Adaptive Failover, Decision Replay & Orchestration Hardening
- v13.76 – Control Center Architecture & Global Product Module Foundation
- v13.77 – Control Center Home & Travel Identity Integration
- **v13.78 – Booking Control Center Foundation**

## Next
- **v13.79 – Booking Inbox & Conversations**
  - user-visible booking inbox
  - `booking_messages` / `booking_email_threads`
  - conversation history
  - unread foundation
- **v13.80 – Booking Actions & Intelligence**
  - `review_required`
  - alternatives accept/decline
  - `requires_action`
  - reply intelligence presentation
  - bidirectional replies and recovery actions
- **v13.81 – Booking Timeline, Modify & Cancel**
  - booking lifecycle timeline
  - mutation state
  - modify / cancel
  - reconciliation and recovery UX
- **v13.82 – Travel Wallet & Notifications**
- **v13.83 – Trip Command Center Foundation**
- **v13.84 – Control Experience Hardening**

## Architecture rule
Control Center surfaces may aggregate and interpret domain state but must never create a second Booking, Trip, Auth, Media, Realtime or Notification truth.
