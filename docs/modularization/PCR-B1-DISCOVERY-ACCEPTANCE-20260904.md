# B1 discovery and truthful result state

Problem: public App 13.82.168.37 returns provider candidates but the conversational selection is empty, then reports success. Chat uses a different candidate window and destination default than the shared Places/Stays map. The existing B1 acceptance report records the counterexample.

Owners: Places owns category, subject evidence, geographic scope and provider discovery; Intelligence consumes places.v1 and owns conversational orchestration and explanations. Journey remains the sole timeline contract. No duplicate stores or private domain access.

Scope: bounded fixes in the existing discovery adapter, Places evidence/contract projection and AI runtime/dashboard; targeted behavioral tests; action registry classification only if a new user action is introduced. Public contract additions preserve existing fields and signatures. Runtime manifests, inventory and Integration release identity are Platform-owned supporting changes.

DB / functions: none planned; no schema migration, credentials or provider-budget changes. Existing quota enforcement remains active. Native core rules remain browserless.

Visible .39 continuation: the shared Journey suggestion sheet used stale day guidance (31 August 2026) for the June 2027 trip and kept date/time fields hidden before commit. Extend the existing presentation slice to restore a visible, editable date/time review before its existing Places plan command. Defaults must stay within the active trip; explicit windows and conflict checks remain binding. Reuse the current scheduler and owner command, not another timeline store. The accidental test plan was removed through places.v1 before continuing. This reuses the registered Timeline action and adds no new semantic user action.

The same readback exposed a lost duration: Places stored 90 minutes in its metadata, while its existing Timeline compatibility projection emitted null and Journey defaulted to 60. Preserve the declared duration in that existing source-owner projection, with finite positive validation. No new consumer of the compatibility provider and no new persistence path.

Test plan: reproduce the actual generic and vegetarian request; distinguish subject/category/diet evidence and unknown from contradiction; prevent vegetarian/vegan false positives; verify bounded provider calls and cache scope; honest empty/degraded status; controlled regression, asset identity and visible Integration browser flow through discovery, details, Favorite and Timeline with confirmation/readback/recovery. Record unexecuted stages honestly.

Rollout: user-authorized recovery and B1 implementation, branch codex/b1-discovery-acceptance-20260904 through Integration only. No Production, paid booking or external messages. Rollback: revert this bounded runtime slice to source 978e3d00 / App 13.82.168.37; preserve existing user data, accounting and subsequent documentation.

Booking steering: visible ROOF route preview succeeds but its handoff appears above the viewport while the clicked action keeps a stale working message. Update the existing Journey suggestion presentation to show the final route at the initiating action, with readable provider labels, honest manual/technical fallback, accessible reveal and retry. Booking remains the sole route owner; no external message is sent in acceptance. Repair the same callback's completion-state reference without adding a persistence path. Validate positive route, unavailable route, technical failure and blocked external-window retry behavior.

Live Booking readback further exposed a cross-service false positive: the ROOF restaurant resolves to a junior-suite page at the same hotel address. Extend the existing Booking Edge owner to reject incompatible lodging/dining routes, recognize valid reservation anchors on the exact official venue page, and preserve the verified anchor in handoff. No new function, schema or credentials. Deploy booking-route-resolve only after identity, service, email/manual and full regression checks; frontend remains .43. The function is shared backend scope, not a Main frontend deployment.
