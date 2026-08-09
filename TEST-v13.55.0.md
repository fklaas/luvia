# Test plan — v13.56.0 / Core 4.56.0

- Provider-return matrix has OpenTable/TheFork/Resy/Zenchef/SevenRooms contracts with partner-safe non-auto-apply states.
- Quandoo/Tock verified mappings remain intact.
- Route resolver rejects menu/maps/legal content and recognizes LaFourchette, lazy iframes and structured booking actions.
- Contact resolver supports Cloudflare e-mail decoding and parallel official contact/legal crawling.
- Places quick filters use one central delegated submit path across all modules.
- AI discovery performs one final ranking pass and caches equivalent searches.
- Existing verified-provider status-return/retry path remains unchanged.
