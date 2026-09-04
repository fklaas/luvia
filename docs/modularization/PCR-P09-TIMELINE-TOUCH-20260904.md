# P09 Timeline time review, touch movement and recovery

Problem: the Timeline date editor reports success before persistence, offers only transient undo, and has no mobile long-press movement mode. The user explicitly requests holding a Timeline entry to enter an iOS-like move/edit mode.

Owners: Journey owns derived schedule preview and conflicts; Places owns persisted planned Place fields and their recovery receipt. Consumer owns pointer/keyboard presentation through Overlay Host. Platform owns public adapter and release integration. Existing planned Place actions (date/time/duration/reorder and undo) are reused; no parallel Timeline store.

Scope: browserless Journey preview, additive journey.v1 edit overload and recovery reads, optimistic-concurrency support in the existing Places field writer, source revision projection in the classified Timeline compatibility provider, mobile/keyboard Consumer controls, readable result explanations and targeted behavioral gates. Booked stays/visits/photos retain their source-owner workflows; dragging never reschedules a provider booking.

Compatibility: existing editEntry(identity, callback) remains supported. Confirmed structured edits use public journey.v1 -> places.v1. The existing Places writer optionally requires an exact source revision, uses a conditional update under existing RLS, and refuses stale changes. Recovery is a single previous schedule receipt attached to the same owner record, not copied domain truth or a second local store. No schema migration, Edge Function, secrets or provider budgets change.

Tests: read-only preview, all overlapping intervals including nested visits, trip bounds, duration, stale revision, failed write, duplicate command, reload recovery, invalidated recovery, mobile long press vs scrolling, pointer cancellation, keyboard movement, visible conflict and confirmation, public owner readback. Restore our test changes and preserve user data. Physical iPhone testing remains separately identified.

Rollout: user-authorized feature branch codex/p09-timeline-touch-20260904 -> Integration only. Full controlled regression and immutable public asset verification before reporting deployed. Rollback by reverting this bounded slice to App 13.82.168.43, source 466aaa9e38c116409b375ffe07020787a1c2465b; retain user records and receipts.

Acceptance .44: source bc642a06a23e82165648d6a43738430f83b145d6, Worker 093456be-4963-4578-8468-390c3f80ec04. Safe regression 213/213, public hashes 30/30, visible Edge touch emulation and live date/time/duration edit with reload-persistent undo passed. Original six entry times and durations restored. No hardware or complete P09/AI parity claim. Reviewed CSS delta: +3985 canonical bytes, +2 reduced-motion/drag !important rules, +2 fallback colours and +1 local drag z-index; 9 explicit source-marker decisions reuse existing semantic actions.
