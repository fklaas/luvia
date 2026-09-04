# Places and stays quality recovery

User-authorized Integration slice, baseline 29e3ded6 / runtime 13.82.168.22.
Branch: codex/places-stays-quality-20260904. Preserve unrelated untracked files.

Places owns normalized facts and provider reads; Intelligence owns derived
preference eligibility; Experience consumers own the shared map and detail sheet.
Booking ownership and booking commands remain unchanged. Public contracts stay
backward compatible. This is a focused repair, not a visual system redesign.

Browse recommendations distinguish a confirmed conflict from an unconfirmed
stroller property. Dietary and accessibility requirements remain evidence-gated.
Unknown properties must remain visible; recommendation is not admission approval.
All means the full requested category, with only explicitly selected filters.

Geoapify viewport reads gain bounded session caching and in-flight coalescing.
Only complete responses may cover smaller rectangles. Other providers retain
their existing policy; no Google data is persisted through this cache.
Places and accommodations pass explicit category, cohort and preference context.
Shared card fixes cover category illustrations, dates and a single planning CTA.

Validation: executable preference/cache/category/parity regressions, controlled
safe suite, generated asset verification and visible Integration browser checks.
Deploy only a clean Git archive. Rollback: previous Integration Worker
bf58124e-df60-4a0f-aa22-bc38f0b26219 and gateway v144 if changed.
