# Cuisine coverage and truthful empty search

Baseline: c7d7120f / Integration runtime 13.82.168.30. User reports falsely
empty cuisine filters in Scharbeutz. Read-only browser reproduces Chinese = 0.
Live Geoapify has Sai Gon, Strandallee 22, Scharbeutz/Haffkrug, as asian cuisine
at 54.0497067 / 10.7509787, about 3.03 km from the destination anchor. The UI
omits Asian and the initial 3 km scope excludes this result. Chinese is not a
synonym of Asian; provider gaps must never imply that a cuisine does not exist.

Owners: Platform gateway mapping; Consumer shared Places/Stays composition.
Contracts: additive asian_restaurant subtype through existing places.v1 reads;
no major contract or domain truth change. Asian includes evidenced Asian cuisine
children, while Chinese and each child remain strict. Explicit empty-search
actions may broaden cuisine or extend destination radius to 5 km, never silently.
No automatic provider fanout, billing change or new source. Existing provider
cache keys already include radius, selected types and geography.

Files: shared gateway places.ts, shared consumer JS/CSS, regression tests,
generated runtime/version/index/sw and visual inventory. Gateway redeploy only;
no DB, secrets, ownership or Main change. Retain original selected trip, default
3 km scope and viewport gesture behavior. Both Places and Stays use shared scope
controls; cuisine alternatives apply only to Food.

Validation: actual Geoapify Asian/Chinese responses, independent normalization
and subset tests, default/explicit radius and scope-message tests, full controlled
safe regression, immutable Integration assets, visible browser Chinese empty,
Asian and radius extension, strict Chinese and Passend retention. Rollback to
c7d7120f plus previous gateway v149.
