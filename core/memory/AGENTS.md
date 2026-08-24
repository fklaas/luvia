# Memory Core Agent Guide

`core/memory/` owns durable Memory and Narrative truth: albums, cards, stories,
chapters, contributions, curation decisions and their lifecycle.

It does not own Media assets, Trip truth, Places truth, Journey scheduling,
Identity truth, Social membership or Intelligence reasoning.

## Required boundaries

- Media references cross `media.v1` as IDs and sanitized projections.
- Trip, Places, Journey, Identity and Intelligence context crosses public
  contracts only.
- Browser, DOM, Supabase, storage, navigation and device APIs are forbidden in
  the browserless Memory Domain Contract Core.
- Web/DB compatibility providers may remain in their legacy paths while they
  are explicitly classified behind `memory.v1`.
- A draft or composition session must not become a second durable truth beside
  the canonical Memory providers.
- Intelligence may propose Memory changes, but confirmed writes route through
  Memory commands.
