# Test Plan v13.81.4

## A. Release / Cache
1. Kernel = App 13.81.4 / Core 4.81.4
2. `index.html` lädt geänderte Assets mit `?v=13.81.4`
3. Service Worker Cache = `luvia-shell-v13.81.4`

## B. Mutation Thread Bootstrap
1. Provider mutation remains first choice
2. known expected provider blockers may enter safe e-mail fallback
3. existing thread is reused
4. missing thread checks exact `booking.contact.email` against verified Booking Core candidates first
5. unresolved contact invokes `booking-contact-resolve`
6. final e-mail is verified again before thread creation
7. only `modify` and `cancel` may bootstrap a thread
8. normal Inbox reply still requires a pre-existing thread
9. canonical `reply_alias` is created
10. outbound message correlation = `outbound_mutation_thread_bootstrap`
11. failed first Resend attempt marks the first-outbound mutation thread `delivery_failed`
12. idempotency fingerprint stays stable when a bootstrap retry sees the thread already created
13. bootstrap retry keeps the same mutation subject/thread semantics
14. successful request remains pending/evidence-driven
15. no direct final `confirmed` or `cancelled` transition from send

## C. Mobile Mutation Surface
1. mobile Modify is fullscreen drilldown, not modal
2. mobile Cancel is fullscreen drilldown, not modal
3. header/back action present
4. independently scrollable body
5. fixed app surface uses `100dvh`
6. safe-area bottom padding present
7. global shell bottom nav hidden while active
8. legacy `.lv-dock-wrap` hidden while active
9. footer is its own grid row and cannot sit behind global nav
10. desktop modal remains available

## D. Discovery Fetch Hardening
For both contact and route resolver:
1. missing scheme -> HTTPS
2. HTTP input -> HTTPS-first
3. manual redirect chain
4. max redirect guard
5. redirect target SSRF check
6. redirect-domain venue identity validation
7. browser-like User-Agent
8. HTML Accept header
9. Accept-Language
10. timeout/error classification
11. HTTP status diagnostics
12. final URL diagnostics
13. redirect chain diagnostics
14. contact/reservation page discovery
15. official-source e-mail extraction
16. provider-domain e-mails blocked
17. existing contact is input but not implicit verification

## E. Green Farmer's Regression
Booking ID: `046bcb5c-0942-48f7-b8e1-292eb4de60c7`

1. legacy/current Green Farmer domain-family redirect identity allowed
2. `hello@greenfarmers.fr` fixture discoverable
3. generic provider e-mails remain blocked
4. existing booking contact must be verified rather than blindly trusted
5. Modify can use thread bootstrap
6. Cancel can use thread bootstrap contract
7. send alone never finalizes booking
8. real production crawl only after Edge Function deployment

## F. Google Reserve Matrix
Cases:
1. Google Reserve -> TheFork
2. Google Reserve -> OpenTable
3. Google Reserve -> unknown/other handoff
4. Google Reserve without identifiable partner
5. no Google Reserve
6. Google Reserve + venue e-mail
7. venue e-mail only

For every case:
- `googleDirectIntegration` remains `false`
- partner is only identified when final URL maps to a known provider
- external handoff remains higher-priority than e-mail when healthy

## G. Regression
- v13.81 mutation expected-error bridge
- v13.81 mutation evidence safety
- v13.80 reply safety
- TheFork adapter
- Quandoo adapter
- OpenTable adapter
- SevenRooms adapter
- Resy adapter
- Tock adapter

## H. Syntax
- changed JS via `node --check`
- changed Edge TS via local `tsc --noEmit` syntax/type parse with remote import stubbed

## I. Production-only
- real Green Farmer's Supabase Edge crawl
- real Resend send/delivery
- real inbound provider reply
- real Google Maps Reserve partner comparison
- real mobile/browser rendering
- Cloudflare deployment/cache propagation
