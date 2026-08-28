# Luvia destination hero photo pipeline

## Outcome

The Today hero now treats destination photography as sourced product data, not decoration. It requests an exact image through the Places owner boundary and keeps a documented, semantically relevant local image ready before that request finishes.

## Runtime order

1. **Immediate first paint:** a reviewed local image is chosen deterministically. Known catalog destinations use their exact asset; other destinations use a clearly identified coast, mountain or neutral travel motif.
2. **Exact destination resolution:** if the trip owns a canonical `placeId`, Today calls `places.v1.reads.getCard()` after rendering.
3. **Verified replacement:** only a returned owner photo replaces the fallback. The surface is marked `places-exact-transient`.
4. **Attribution:** available photographer/provider attribution and source links stay visibly connected to the image.
5. **Failure behavior:** a network, provider or photo failure keeps the local fallback. It does not block the app, replace the image with an unrelated result, or invent source metadata.

## Reliability rules

- Destination identity comes from Trip/Places owner data, not a display string guessed by Today.
- Google Places photos are transient and are not copied into Luvia's permanent asset bundle.
- A fallback is never labeled as the exact destination.
- No client-side stock API key is introduced.
- A future stock-search service must retain asset ID, exact query, photographer, source, license, semantic class and review receipt.
- Only destination-relevant travel motifs are eligible: recognizable city views, landmarks, coastline/beaches, mountains/nature or another trip-specific scene. Generic office, abstract, unrelated lifestyle and unverified AI imagery are excluded.

## Sources

- [Google Place Photos (New)](https://developers.google.com/maps/documentation/places/web-service/place-photos)
- [Google Places policies and attributions](https://developers.google.com/maps/documentation/places/web-service/policies)
- [Unsplash API documentation](https://unsplash.com/documentation)
- [Unsplash API attribution guideline](https://help.unsplash.com/en/articles/2511315-guideline-attribution)
- [Pexels API documentation](https://www.pexels.com/api/documentation/)
- [MediaWiki Imageinfo API](https://www.mediawiki.org/wiki/API:Imageinfo/en)
- [Wikimedia Commons: Beaches of Scharbeutz](https://commons.wikimedia.org/wiki/Category:Beaches_of_Scharbeutz)
