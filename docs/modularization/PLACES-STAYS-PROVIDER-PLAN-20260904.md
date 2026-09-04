# Map and accommodation follow-up, 2026-09-04

The basemap already uses OpenFreeMap. It does not consume Google, Geoapify or
Foursquare place-search quota. OpenFreeMap currently documents a public instance
without request/view limits: https://openfreemap.org/

Geoapify is the current primary category/viewport source. A 50-result response
can consume three credits, since each group of 20 results counts toward usage.
Caching with attribution is explicitly supported:
https://www.geoapify.com/places-api/

The quality slice introduces a 32-entry, 15-minute session viewport cache and
in-flight request coalescing. Complete regions cover smaller viewports; capped
pages cannot assert full coverage. Cached results are filtered by bounds, and
preference ranking is recomputed for the active profile. Google results are not
included in this new cache. No provider account or quota was expanded.

Recommended next infrastructure slice:

1. A server-side regional Geoapify cache, shared across users, with expiration,
   source attribution and density-aware coverage. This saves more than adding
   several paid providers that answer the same question.
2. Explicit provider budgets by capability: discovery, details, photos, routing
   and live accommodation offers. Fallback only on missing capability, exhausted
   configured budget or provider failure; never fan out to every provider on pan.
3. Open-data regional POI imports for high-traffic destinations, with scheduled
   updates and a canonical provider-identity merge. Evaluate Overture and
   Foursquare Open Source Places separately from their paid APIs.
4. Media enrichment only for a selected place, with a short budget and source/
   author attribution. The rejected category illustrations are removed. Missing
   venue photos use a small neutral unavailable state, never a substitute image.
   Geoapify details links exact-entity images/Commons references; Foursquare photo
   fallback requires exact normalized name and coordinates within 120 metres.
   Coverage and Premium entitlement remain provider-dependent; no universal
   real-photo coverage is claimed.
5. Shared Places/Stays acceptance: destination, category, All/Fit, viewport,
   photos, dates and exact planning target. Booking price/availability remains
   a separate live Booking-owner read.

Foursquare's current pricing page separates Pro and Premium calls; free sandbox
marketing must not be treated as unlimited ongoing production allowance:
https://foursquare.com/pricing/

Live diagnosis on 2026-09-04: the connected Foursquare account returned no API
credits remaining for the COAST request. Exact venue media cannot currently be
validated through that account. A budget/source decision is needed; no credit
purchase or automatic billing was enabled in this recovery.

Google has provider-specific caching, attribution and map-display rules, with
EEA-specific terms. It cannot be treated as a drop-in source for a general shared
POI cache without evaluating the applicable contract:
https://developers.google.com/maps/documentation/places/web-service/policies

The current EEA service terms specifically restrict ordinary Places API content
with any map, and list a Places UI Kit exception. Do not silently add Google
photo enrichment to the existing map-linked custom cards. Evaluate billing
jurisdiction, applicable terms and the UI Kit as a separate integration decision:
https://cloud.google.com/terms/maps-platform/eea/maps-service-terms

Product improvements worth prioritizing: visible result count and source age;
pin clustering at regional zoom; retain selected pin when new data arrives;
distinguish no results from incomplete provider coverage; named saved areas;
profile-match reasons next to unresolved requirements; accommodation amenities
separate from restaurant price levels. In the German navigation, Unterkünfte is
clearer than Hotels and covers apartments, holiday houses, hostels and camping.
