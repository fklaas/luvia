# M14 Legacy Retirement Manifest

Date: 2026-08-24

## Scope lock

M14 retires only artifacts whose active reachability is zero and whose replacement or historical successor is explicit. It does not rename an active file merely because it still contains `Paris`, and it does not rewrite the historical NFR-0 debt snapshot.

The repository structure remains owner-first:

- `core/<domain>/` owns canonical domain truth and browserless rules;
- `core/runtime/` owns platform-neutral runtime policy;
- `core/experience/` owns shared visual and interaction semantics, never domain truth;
- `app/` owns Web composition and Web adapters;
- `modules/` owns product-category composition, never duplicated owner truth;
- `legacy/` may contain only explicitly reachable compatibility code with a named replacement and removal gate.

This structure applies to the synchronized eight-stream topology. A broad directory move without an ownership proof remains forbidden.

## Retired artifacts

The following archived UI copies were absent from `index.html`, the Service Worker asset graph, active imports and runtime fetches. Four were byte-identical duplicates of the surviving root compatibility assets. The archived v11 HTML was a 4.66 MB non-runtime snapshot superseded by the current `index.html`; `paris-official.html` remains separately tracked until its remaining Media/compatibility references are migrated.

| Deleted path | Git blob before deletion | Replacement / recovery source |
| --- | --- | --- |
| `legacy/ui/index-v11.0.0.html` | `25b926dd396d26c6439087c1647bd7ec8e3c6aa9` | current `index.html`; historical Paris compatibility remains in `paris-official.html` |
| `legacy/ui/luvia-app-shell.css` | `15dc5f3aca77908701f640664feeffaeb7d22f61` | byte-identical `luvia-app-shell.css` |
| `legacy/ui/luvia-dashboard.css` | `a44e5e7ca7ad1391f82909afdd98b2fd1788d212` | byte-identical `luvia-dashboard.css` |
| `legacy/ui/luvia-dashboard.js` | `e0cca2258d1deffbfd0760e1f73891bb9f21c602` | byte-identical `luvia-dashboard.js` |
| `legacy/ui/luvia-v7-enhancements.js` | `3555b4672c233bf35ccac943759249fad123a4cd` | byte-identical `luvia-v7-enhancements.js` |

Every deleted artifact remains recoverable from Git history. No user data, database object, cloud asset or production configuration is deleted by this block.

## Explicitly retained compatibility paths

- `core/legacy/paris-migrator.js` remains active behind Trip runtime compatibility. `core/trips/trip-store.js` and `intelligence/destination-service.js` still reference its migration/mirror surface.
- `legacy/paris/cloud-adapter.js` remains active because the Trip owner still consumes `LuviaLegacyParisCloud` for measured legacy cloud list/save flows.
- `paris-official.html` and its root compatibility assets remain until their Media/Identity/Trip consumers are replaced and the public path is proven to resolve only to the current SPA.
- historical `paris*` storage keys, RPC names and compatibility aliases are not renamed without data and provider migration proof.

These retained paths are debt with an exit gate, not the target architecture. Their removal requires replacement, reference, regression, Preview and Production proof.
