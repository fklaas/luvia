# Internal research report — destination hero photography

Date: 2026-08-28
Scope: Luvia signed-in Today hero, destination-specific professional travel photography, licensing, attribution, caching and semantic fallback.

## Research question

How can Luvia reliably show a professional image of the active trip destination without using irrelevant imagery, misrepresenting a fallback as the exact location, violating provider terms, or slowing first paint?

## Evidence matrix

| Lane | Primary evidence | Operational consequence | Confidence |
|---|---|---|---|
| Exact place identity | [Google Place Photos (New)](https://developers.google.com/maps/documentation/places/web-service/place-photos) | Resolve a photo only from the canonical `placeId`; photo resource names and returned URIs are transient and must not be treated as permanent local media. | High |
| Google attribution and storage | [Google Places policies](https://developers.google.com/maps/documentation/places/web-service/policies) | Display available author attribution and source access; do not prefetch/cache Places content outside permitted exceptions. | High |
| Unsplash API | [Unsplash API docs](https://unsplash.com/documentation), [Attribution guideline](https://help.unsplash.com/en/articles/2511315-guideline-attribution), [API terms](https://unsplash.com/api-terms) | API use requires returned image URL hotlinking and photographer/Unsplash attribution with links; a production search needs a server-side credential and provider-compliant tracking. | High |
| Pexels API | [Pexels API documentation](https://www.pexels.com/api/documentation/) | Requests require an API key; API clients should link prominently to Pexels and credit photographers where possible. Search supports orientation, size, locale and color but does not by itself prove geographic identity. | High |
| Wikimedia metadata | [MediaWiki Imageinfo API](https://www.mediawiki.org/wiki/API:Imageinfo/en) | Query `imageinfo` plus selected `extmetadata` fields for creator, credit, license and license URL; validate each file rather than assuming every Commons category member has the same license. | High |
| Exact Scharbeutz fallback evidence | [Scharbeutz beach category](https://commons.wikimedia.org/wiki/Category:Beaches_of_Scharbeutz), [exact Scharbeutz file example](https://commons.wikimedia.org/wiki/File:RK_1805_P1600408_Scharbeutz,_Strand_mit_Seebr%C3%BCcke.jpg), [exact Scharbeutz Unsplash photo](https://unsplash.com/photos/a-pier-on-a-beach-with-a-boat-in-the-distance-utdl1KmlHFs) | Exact openly licensed/stock alternatives exist, but they must enter a curated catalog only after visual review, license capture, creator credit and provenance storage. | High |
| Open-license discovery | [Creative Commons Openverse overview](https://creativecommons.org/about/education/education-oer-resources/), [CC license overview](https://creativecommons.org/cc-licenses/) | Openverse is a discovery layer for CC/public-domain media; Luvia still has to persist the individual work's license and attribution metadata. | Medium-high |

## Claim ledger

1. A Google Places photo can be bound to the canonical destination through `placeId`; its author attribution must be rendered when supplied. Supported by Google Place Photos and policy documentation. High confidence.
2. A Google photo reference/URI is not a durable Luvia asset. Supported by Google's no-caching and expiry guidance. High confidence.
3. Unsplash API results cannot be silently downloaded and re-served by a normal API integration; hotlinking and attribution are required. Supported by Unsplash API documentation and API terms. High confidence.
4. Pexels search is suitable as a reviewed stock lane, not as automatic proof that a result depicts an exact place. The first half is documented; the geographic-verification conclusion is an engineering inference from keyword search semantics. Medium-high confidence.
5. Wikimedia Commons can provide exact-place candidates with explicit file-level licensing, but the category itself is not sufficient rights evidence. Supported by category/file pages and Imageinfo metadata rules. High confidence.
6. A fallback must be disclosed as a motif fallback and selected from a semantic class; it must never silently claim to depict the named destination. Product integrity rule derived from the user's requirement and source limitations. High confidence.

## Decision

Use a non-blocking resolver with this order:

1. Canonical Places `placeId` -> `places.v1.reads.getCard()` -> transient exact photo with source attribution.
2. Curated local exact-destination catalog whose file, place, creator, source and license have already been reviewed.
3. Curated semantic fallback (coast, mountain, road-trip) with an explicit “Motiv-Fallback” label.
4. No random endpoint, no unreviewed keyword image and no unsupported claim that a fallback shows the exact destination.

The resolver runs after first paint. It cannot delay the signed-in shell. Google/remote failure preserves the documented local fallback.

## Rejected approaches

- Scraping search-result pages or embedding arbitrary image-search URLs.
- Treating a stock keyword hit as geographic proof.
- Caching a Google Places photo as a permanent application asset.
- Exposing provider API keys in browser code.
- Hiding attribution to gain visual simplicity.

## Remaining production work

- Add an owner-side photo-catalog service if Luvia later enables Unsplash, Pexels, Openverse or Wikimedia live search.
- Persist review receipts: normalized destination, provider asset ID, creator, source URL, license URL, semantic class, reviewer, review timestamp and expiry/revalidation timestamp.
- Add visual moderation for unsafe, low-quality, text-heavy, AI-looking and destination-irrelevant images before catalog promotion.
