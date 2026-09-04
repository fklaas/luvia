# Recovery of active trip and local Places discovery

Authorized by the user on 2026-09-04. Baseline: integration 1f4115dd,
runtime 13.82.168.20. Implementation branch: codex/recovery-trip-places-20260904.

Problem: selecting Ostseeurlaub then reloading publicly selects Jfjd again.
Places also show wrong categories, distant candidates and inconsistent fit mode.

Owners: Platform owns boot orchestration and release artifacts; Trip retains
active-trip truth; Identity retains profile persistence; Places owns category
validation and discovery; Consumer owns the spatial presentation. This is an
explicit cross-owner recovery slice integrated through Integration.

Contracts remain backward compatible. No new domain store or public major
version. Changes are limited to the proven boot/Places paths, their behavioral
tests and generated runtime. No schema migration or secret rotation is planned.
The existing gateway Function is deployed only if its mapping needs correction.

Validation: reproduce on visible Integration, executable delayed-hydration
regressions, category/locality/fit regressions, controlled Safe Regression and
visible before/after trip reload plus Scharbeutz category switching. Preserve
unknown provider evidence and cost guards. Record measured results separately.

Rollout: coherent source commits, generated versioned runtime, clean Git archive,
Integration only, public byte proof and visible acceptance. Main/Production
promotion is outside this recovery release. Rollback is the captured preceding
Integration Worker version plus the preceding gateway source if changed; never
a destructive reset of the working tree. Existing untracked files are excluded.
