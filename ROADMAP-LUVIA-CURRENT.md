# Luvia Current Roadmap

## Completed
- v13.75 – Adaptive Failover, Decision Replay & Orchestration Hardening
- v13.76 – Control Center Architecture & Global Product Module Foundation
- v13.77 – Control Center Home & Travel Identity Integration
- v13.78 – Booking Control Center Foundation
- **v13.79 – Booking Inbox & Conversations**
  - provider-independent Booking Inbox
  - conversation list per trip
  - `booking_messages` timeline through Booking Core
  - `booking_message_intelligence` read-only cards
  - `booking_email_threads` conversation context
  - unread presentation foundation
  - composer UI foundation without fake sends

## Next
- **v13.80 – Booking Actions & Intelligence**
  - `review_required` user resolution
  - alternatives accept / decline / counter-propose
  - `requires_action` answers
  - understandable Reply Intelligence
  - real bidirectional reply transport over existing threads
  - translation seam / proposed replies
  - recovery / retry UX
- **v13.81 – Booking Timeline, Modify & Cancel**
  - booking lifecycle timeline
  - mutation state
  - modify / cancel
  - reconciliation and recovery UX
- **v13.82 – Travel Wallet & Notifications**
- **v13.83 – Trip Command Center Foundation**
- **v13.84 – Control Experience Hardening**

## Architecture rule
Control Center surfaces may aggregate and interpret domain state but must never create a second Booking, Message, Trip, Auth, Media, Realtime or Notification truth.
