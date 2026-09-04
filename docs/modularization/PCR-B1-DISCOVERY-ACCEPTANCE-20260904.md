# B1 discovery and truthful result state

Problem: public App 13.82.168.37 returns provider candidates but the conversational selection is empty, then reports success. Chat uses a different candidate window and destination default than the shared Places/Stays map. The existing B1 acceptance report records the counterexample.

Owners: Places owns category, subject evidence, geographic scope and provider discovery; Intelligence consumes places.v1 and owns conversational orchestration and explanations. Journey remains the sole timeline contract. No duplicate stores or private domain access.

Scope: bounded fixes in the existing discovery adapter, Places evidence/contract projection and AI runtime/dashboard; targeted behavioral tests; action registry classification only if a new user action is introduced. Public contract additions preserve existing fields and signatures. Runtime manifests, inventory and Integration release identity are Platform-owned supporting changes.

DB / functions: none planned; no schema migration, credentials or provider-budget changes. Existing quota enforcement remains active. Native core rules remain browserless.

Test plan: reproduce the actual generic and vegetarian request; distinguish subject/category/diet evidence and unknown from contradiction; prevent vegetarian/vegan false positives; verify bounded provider calls and cache scope; honest empty/degraded status; controlled regression, asset identity and visible Integration browser flow through discovery, details, Favorite and Timeline with confirmation/readback/recovery. Record unexecuted stages honestly.

Rollout: user-authorized recovery and B1 implementation, branch codex/b1-discovery-acceptance-20260904 through Integration only. No Production, paid booking or external messages. Rollback: revert this bounded runtime slice to source 978e3d00 / App 13.82.168.37; preserve existing user data, accounting and subsequent documentation.
