# Database Domain Map — M2 ownership

**Rule:** table ownership means the domain that controls schema semantics and writes. It does not grant direct access to other domains.

## Scope and evidence

- Source archive contains **126 immutable local migrations**.
- Parsing those migrations finds **118 tables created by the tracked migration history**.
- M0 production inventory found **140 public tables**, **30 views**, **177 PostgreSQL functions**, **39 triggers** and **229 policies**; all 140 tables had RLS enabled.
- The current migration history is not fully linked to the remote migration ledger; M0 explicitly prohibits migration repair/push until separately planned.
- Additional base/legacy tables referenced by productive RPCs or confirmed during M0 are included with evidence `M0 remote/base referenced`.
- `DATABASE-DOMAIN-MAP.csv` is the machine-readable form.

## Ownership map

### Booking
| Table | Status | Evidence |
|---|---|---|
| `booking_affiliate_attributions` | canonical | migration-created |
| `booking_affiliate_clicks` | canonical | migration-created |
| `booking_affiliate_conversions` | canonical | migration-created |
| `booking_affiliate_links` | canonical | migration-created |
| `booking_affiliate_partners` | canonical | migration-created |
| `booking_attribution_events_v2` | canonical | migration-created |
| `booking_audit_log` | canonical | migration-created |
| `booking_availability_requests` | canonical | migration-created |
| `booking_availability_snapshots` | canonical | migration-created |
| `booking_channel_resolutions` | canonical | migration-created |
| `booking_commercial_events` | canonical | migration-created |
| `booking_commission_reconciliations` | canonical | migration-created |
| `booking_commission_state_events` | canonical | migration-created |
| `booking_contact_candidates` | canonical | migration-created |
| `booking_conversation_preferences` | canonical | migration-created |
| `booking_conversion_reports` | canonical | migration-created |
| `booking_correlations` | canonical | migration-created |
| `booking_dead_letters` | canonical | migration-created |
| `booking_discovery_runs` | canonical | migration-created |
| `booking_email_delivery_events` | canonical | migration-created |
| `booking_email_requests` | canonical | migration-created |
| `booking_email_threads` | canonical | migration-created |
| `booking_events` | canonical | migration-created |
| `booking_handoff_events` | canonical | migration-created |
| `booking_health_checks` | canonical | migration-created |
| `booking_message_intelligence` | canonical | migration-created |
| `booking_messages` | canonical | migration-created |
| `booking_monetization_profiles` | canonical | migration-created |
| `booking_offers` | canonical | migration-created |
| `booking_profiles` | canonical | migration-created |
| `booking_provider_activation_controls` | canonical | migration-created |
| `booking_provider_activation_runs` | canonical | migration-created |
| `booking_provider_admin_actions` | canonical | migration-created |
| `booking_provider_capabilities` | canonical | migration-created |
| `booking_provider_connection_events` | canonical | migration-created |
| `booking_provider_connections` | canonical | migration-created |
| `booking_provider_links` | canonical | migration-created |
| `booking_provider_probe_runs` | canonical | migration-created |
| `booking_provider_references` | canonical | migration-created |
| `booking_provider_status_contracts` | canonical | migration-created |
| `booking_provider_status_receipts` | canonical | migration-created |
| `booking_reconciliation_issues` | canonical | migration-created |
| `booking_reconciliation_runs` | canonical | migration-created |
| `booking_reservation_cancel_requests` | canonical | migration-created |
| `booking_reservation_create_requests` | canonical | migration-created |
| `booking_reservation_modify_requests` | canonical | migration-created |
| `booking_reservation_mutation_reconciliation_attempts` | canonical | migration-created |
| `booking_reservation_mutation_status_events` | canonical | migration-created |
| `booking_route_attempts` | canonical | migration-created |
| `booking_route_decisions` | canonical | migration-created |
| `booking_route_failover_events` | canonical | migration-created |
| `booking_route_state` | canonical | migration-created |
| `booking_status_signals` | canonical | migration-created |
| `booking_status_updates` | canonical | migration-created |
| `bookings` | canonical | migration-created |

### Trip
| Table | Status | Evidence |
|---|---|---|
| `timeline_events` | canonical/base | migration-created |
| `trip_members` | canonical/base | M0 remote/base referenced |
| `trip_modules` | canonical/base | migration-created |
| `trip_preferences` | canonical/base | migration-created |
| `trip_schedule_events` | canonical/base | migration-created |
| `trip_settings` | canonical/base | M0 remote/base referenced |
| `trips` | canonical/base | M0 remote/base referenced |

### Places
| Table | Status | Evidence |
|---|---|---|
| `accommodations` | legacy/extension | migration-created |
| `place_lifecycle_history` | canonical | migration-created |
| `place_recommendation_feedback` | canonical | migration-created |
| `place_visits` | canonical | migration-created |
| `places` | canonical | migration-created |
| `provider_cache` | canonical | migration-created |
| `restaurants` | legacy/extension | migration-created |
| `trip_place_data` | canonical | migration-created |
| `trip_places` | canonical | migration-created |

### Media/Memory
| Table | Status | Evidence |
|---|---|---|
| `live_moment_media` | canonical | migration-created |
| `media` | canonical | migration-created |
| `media_cluster_items` | canonical | migration-created |
| `media_clusters` | canonical | migration-created |
| `media_day_polaroids` | canonical | migration-created |
| `media_memory_proposals` | canonical | migration-created |
| `media_pages` | canonical | migration-created |
| `media_place_links` | canonical | migration-created |
| `memory_album_contributions` | canonical | migration-created |
| `memory_album_favorites` | canonical | migration-created |
| `memory_album_items` | canonical | migration-created |
| `memory_albums` | canonical | migration-created |
| `memory_card_album_reviews` | canonical | migration-created |
| `memory_card_album_votes` | canonical | migration-created |
| `memory_cards` | canonical | migration-created |
| `memory_journey_chapters` | canonical | migration-created |
| `memory_journey_contributions` | canonical | migration-created |
| `memory_journey_items` | canonical | migration-created |
| `memory_journeys` | canonical | migration-created |
| `memory_member_identity` | canonical | migration-created |
| `memory_stack_curation` | canonical | migration-created |
| `memory_stack_title_proposals` | canonical | migration-created |

### Identity/Preferences
| Table | Status | Evidence |
|---|---|---|
| `derived_user_preferences` | canonical | migration-created |
| `user_profiles` | canonical | migration-created |

### Intelligence
| Table | Status | Evidence |
|---|---|---|
| `ai_action_proposals` | canonical/transitional | migration-created |
| `ai_evidence_records` | canonical/transitional | migration-created |
| `ai_interaction_events` | canonical/transitional | migration-created |
| `ai_learning_signals` | canonical/transitional | migration-created |
| `ai_orchestration_runs` | canonical/transitional | migration-created |
| `ai_usage` | canonical/transitional | migration-created |
| `ai_usage_events` | canonical/transitional | migration-created |
| `automation_jobs` | canonical/transitional | migration-created |
| `automation_steps` | canonical/transitional | migration-created |
| `co_selection_aggregates` | canonical/transitional | migration-created |
| `generated_content` | canonical/transitional | migration-created |
| `live_day_decisions` | canonical/transitional | migration-created |
| `live_day_snapshots` | canonical/transitional | migration-created |
| `popularity_aggregates` | canonical/transitional | migration-created |
| `recommendation_events` | canonical/transitional | migration-created |
| `recommendation_instances` | canonical/transitional | migration-created |
| `recommendation_memory` | canonical/transitional | migration-created |
| `recommendation_settings` | canonical/transitional | migration-created |
| `recommendations` | canonical/transitional | migration-created |
| `user_activity_events` | canonical/transitional | migration-created |
| `user_content_overrides` | canonical/transitional | migration-created |

### Collaboration
| Table | Status | Evidence |
|---|---|---|
| `trip_activity_events` | canonical projection | migration-created |
| `trip_presence` | canonical projection | migration-created |

### Trip/Places
| Table | Status | Evidence |
|---|---|---|
| `destinations` | transitional shared reference | migration-created |

### Platform/Location
| Table | Status | Evidence |
|---|---|---|
| `location_samples` | shared runtime data | migration-created |

### Platform/Modules
| Table | Status | Evidence |
|---|---|---|
| `modules` | legacy registry data | migration-created |

### Legacy/Paris
| Table | Status | Evidence |
|---|---|---|
| `budget_entries` | legacy | M0 remote/base referenced |
| `day_closures` | legacy | M0 remote/base referenced |
| `day_notes` | legacy | M0 remote/base referenced |
| `favorites` | legacy | M0 remote/base referenced |
| `gallery_photos` | legacy | M0 remote/base referenced |
| `live_moments` | legacy | M0 remote/base referenced |
| `paris_member_activity_feed` | legacy | M0 remote/base referenced |
| `paris_member_locations` | legacy | M0 remote/base referenced |
| `paris_member_presence` | legacy | M0 remote/base referenced |
| `paris_member_profiles` | legacy | M0 remote/base referenced |



## Booking database boundary

M0 confirmed Booking is the most internally modular backend area: 55 Booking tables, all 30 public Booking views, 88 Booking-related DB functions and 22 remote Booking Edge Functions. **Consumers and Social must never query these internals directly.** `LuviaBooking`/future `booking.v1` is the cross-product boundary.

## Edge Function ownership

### Booking
All 22 tracked `booking-*` Edge Function directories:
`booking-contact-resolve`, `booking-email-inbound`, `booking-email-reply`, `booking-email-runtime`, `booking-email-send`, `booking-health`, `booking-provider-availability`, `booking-provider-connection-health`, `booking-provider-opentable`, `booking-provider-quandoo`, `booking-provider-quandoo-webhook`, `booking-provider-reservation-create`, `booking-provider-reservation-mutation`, `booking-provider-reservation-mutation-status`, `booking-provider-reservation-reconcile`, `booking-provider-resy`, `booking-provider-sevenrooms`, `booking-provider-status-ingest`, `booking-provider-thefork`, `booking-provider-tock`, `booking-provider-zenchef`, `booking-route-resolve`.

### Intelligence / Platform
- `luvia-intelligence` → Intelligence transport.
- `luvia-gateway` → Platform/backend gateway.
- M0 found one remote-only active function `luvia-media-delivery`; retain as a legacy/runtime candidate until source/reachability is reconciled. Do not delete or redeploy from this M2 package.

## Storage ownership

- `luvia-media` → Media, private, M0: 209 objects.
- `luvia-media-thumbnails` → Media, public, M0: 120 objects.
- `paris-gallery` → Legacy/Media bridge, private, M0: 12 objects. It is **not empty** and cannot be deleted.

## Cross-domain DB rule

A cross-domain read that needs data from multiple owners must be exposed by a domain API, RPC/view designed as a contract projection, or a Platform adapter. The existence of RLS does not make direct cross-core table access an approved architecture.
