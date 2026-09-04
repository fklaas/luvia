# Places category and viewport continuity

Problem: switching category while a map gesture is debounced or in flight can reuse the previous viewport because the current camera intent was only stored on success. A delayed destination/category read can subsequently overwrite a newer viewport result. Cancelled or failed viewport keys were also treated as already requested, preventing retry of the same area.

Owner: Consumer/Experience owns the shared Places/Stays map orchestration. Places continues to own discovery data through places.v1. Platform integrates the version, bundle, index and service-worker release. No new owner or duplicate store.

Scope: app/places/places-spatial-experience.js, its existing viewport behavioral test, release metadata/bundles and current planning evidence. The optional onViewportIntent/onViewportError callbacks are internal projection inputs, not new public domain commands.

Compatibility: destination search still starts within 3 km of the active trip. Only deliberate map gestures change that scope. Category changes preserve the latest intended viewport; late responses cannot change its results. Pins already visible during a viewport refresh remain available on failure. No synthetic fixed result count, no removal of category/profile filtering and no new provider fanout.

Backend impact: no database, Edge Function, secrets or provider limit changes. Existing bounded Places requests remain in use. The existing discovery cache adds a 15-minute maximum recovery window for Geoapify data only after a failed identical read; original observation times remain, current-open filters are excluded, successful empty results invalidate earlier data. Shared implementation applies to Places and Stays.

Test plan: reproduce the missing immediate viewport intent before the fix; check category switch during debounce, late destination response, cancelled/failed same-area retry, successful empty results, map load, profile projection and Stays parity. Run full safe regression and visibly exercise live category switching and pan/zoom. Distinguish viewport counts from destination-radius counts and cold reads from cache hits.

Rollout: codex/places-category-continuity-20260904 -> Integration. .45 fixes camera intent; .46 also handles the live-observed network failure and bounded cached recovery. Main frontend stays unchanged. No wider visual change.

Additional live counterevidence on .45: Shopping was stable at 46 on repeated category switches, then a refresh after the three-minute provider cache expired ended in net::ERR_ABORTED. The category pins had already been cleared, and the catch path left the existing map loading indicator active. .46 must stop loading, expose a working retry in the current area and recover only eligible previously verified results with an explicit stale notice. This is not an accepted release until that failure path and the normal live flow are checked.

Rollback: redeploy the immutable .44 archive (source bc642a06a23e82165648d6a43738430f83b145d6) if the bounded slice regresses. No data rollback is needed; the fix changes read orchestration only.

Live baseline .44: on entry, Shopping 45 and Nature 3 in the user's previously selected viewport, with cache hits on repeat. After reload, 3-km destination discovery returned 50 provider rows for Shopping (46 after category admission) and 16 for Nature. These are observed query results, not proof of all businesses or nature areas in Scharbeutz. The immediately preceding commits b07cbea1 and 2d4152c1 only changed planning/documentation/tooling and did not change the deployed map.
