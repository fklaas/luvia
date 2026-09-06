'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');

/*
 * M4.3 controlled local regression allowlist.
 *
 * This is intentionally NOT a glob over every historical *.test.cjs file.
 * Historical release evidence may contain release-specific version/cache/path
 * assertions and therefore must not silently become an evergreen merge gate.
 *
 * Every entry below has been reviewed as local/non-destructive and has already
 * been executed successfully against the M4.3 working baseline.
 */
const SUITE = Object.freeze([
  { category: 'Consumer travel world', test: 'tests/p15-travel-world-geometry.test.cjs' },
  { category: 'Platform preview transport', test: 'tests/p15-composer-preview-origin.test.cjs' },
  ...['p09-timeline-schedule','p09-timeline-remove-restore','p09-timeline-photo-memory-owner-management','p09-timeline-visit-owner-management','p09-timeline-connect-reorder','p09-timeline-connect-reorder-browser','p09-timeline-owner-capabilities-first-paint','planning-current-status','b1-discovery-acceptance','provider-orchestration','google-exact-selected-media','apple-maps-provider-contract','provider-budget-free-reserve','places-auto-provider-cascade','places-provider-cascade-diagnostics-category-purity','p02-nightlife-provider-breadth','p02-p03-shared-place-filter-profile-evidence','p02-osm-dietary-evidence-provider','m16.5-block1-places-cost-containment','trip-map-experiences','stays-shared-spatial','places-filter-matrix','place-detail-exact-media','places-stays-quality','recovery-active-trip-reload','recovery-places-locality','recovery-places-viewport','recovery-runtime-build'].map(name=>({category:'Recovery behavioral gates',test:`tests/${name}.test.cjs`})),
  {
    category: 'Release',
    test: 'tests/release-version-consistency.test.cjs'
  },

  {
    category: 'Runtime foundation',
    test: 'tests/m4.3-evergreen-foundation-regression.test.cjs'
  },

  {
    category: 'Feature flags',
    test: 'tests/m4.3-feature-flag-registry.test.cjs'
  },
  {
    category: 'Feature flags',
    test: 'tests/m4.3-feature-flag-release-integration.test.cjs'
  },

  {
    category: 'M3 contracts',
    test: 'tests/m3.1-trip-contract-adapter.test.cjs'
  },
  {
    category: 'M3 contracts',
    test: 'tests/m3.2-places-contract-adapter.test.cjs'
  },
  {
    category: 'M3 contracts',
    test: 'tests/m3.3-media-contract-adapter.test.cjs'
  },
  {
    category: 'M3 contracts',
    test: 'tests/m3.4-identity-contract-adapter.test.cjs'
  },
  {
    category: 'M3 contracts',
    test: 'tests/m4.3-contract-release-integration-evergreen.test.cjs'
  },

  {
    category: 'Places architecture',
    test: 'tests/m4.3-places-architecture-evergreen.test.cjs'
  },
  {
    category: 'Places architecture',
    test: 'tests/m6.1-places-state-core-foundation.test.cjs'
  },
  {
    category: 'Places architecture',
    test: 'tests/m6.2-places-runtime-projection-core.test.cjs'
  },
  {
    category: 'Places architecture',
    test: 'tests/m6-final-places-domain-native-readiness.test.cjs'
  },
  {
    category: 'Media architecture',
    test: 'tests/m7.1-media-acquisition-native-ports.test.cjs'
  },
  {
    category: 'Media architecture',
    test: 'tests/m7.2-gallery-media-contract-adoption.test.cjs'
  },
  {
    category: 'Media architecture',
    test: 'tests/m7.3-memory-asset-contract-adoption.test.cjs'
  },
  {
    category: 'Media architecture',
    test: 'tests/m7.4-remaining-media-consumer-contract-adoption.test.cjs'
  },
  {
    category: 'Media architecture',
    test: 'tests/m7-final-media-domain-native-readiness.test.cjs'
  },
  {
    category: 'Identity / Events architecture',
    test: 'tests/m8-final-identity-event-native-readiness.test.cjs'
  },
  {
    category: 'Intelligence architecture',
    test: 'tests/m8.5-final-intelligence-core-isolation.test.cjs'
  },
  {
    category: 'App Shell / Navigation',
    test: 'tests/m9.1-navigation-contract-foundation.test.cjs'
  },
  {
    category: 'App Shell / Runtime',
    test: 'tests/m9.2-staged-runtime-module-mounting.test.cjs'
  },
  {
    category: 'App Shell / History',
    test: 'tests/m9.3-navigation-history-policy-foundation.test.cjs'
  },
  {
    category: 'App Shell / Lifecycle',
    test: 'tests/m9.4-runtime-signals-resume-coordination.test.cjs'
  },
  {
    category: 'App Shell / Owner Flows',
    test: 'tests/m9.5-owner-flow-navigation-foundation.test.cjs'
  },
  {
    category: 'Product / Owner Flows',
    test: 'tests/m9.5-consumer-owner-flow-adoption.test.cjs'
  },
  {
    category: 'Booking / Owner Flows',
    test: 'tests/m9.5-booking-owner-flow-adoption.test.cjs'
  },
  {
    category: 'App Shell / Session Exit',
    test: 'tests/m9.6-authenticated-surface-session-exit-hygiene.test.cjs'
  },
  {
    category: 'App Shell / Overlay Host',
    test: 'tests/m10.1-overlay-host-foundation.test.cjs'
  },
  {
    category: 'Intelligence / Overlay Host',
    test: 'tests/m10.2-intelligence-overlay-host-adoption.test.cjs'
  },
  {
    category: 'App Shell / Overlay Compatibility',
    test: 'tests/m10.3-overlay-host-legacy-root-adoption.test.cjs'
  },
  {
    category: 'Product / Overlay Host',
    test: 'tests/m10.4-consumer-overlay-host-adoption.test.cjs'
  },
  {
    category: 'Booking / Overlay Host',
    test: 'tests/m10.4b-booking-overlay-host-adoption.test.cjs'
  },
  {
    category: 'Identity / Trip Overlay Host',
    test: 'tests/m10.4c-identity-trip-overlay-host-adoption.test.cjs'
  },
  {
    category: 'Places / Overlay Host',
    test: 'tests/m10.4d-places-overlay-host-adoption.test.cjs'
  },
  {
    category: 'Journey / Timeline Overlay Host',
    test: 'tests/m10.4e-journey-timeline-overlay-host-adoption.test.cjs'
  },
  {
    category: 'App Shell / Overlay Closeout',
    test: 'tests/m10-final-overlay-global-handler-closeout.test.cjs'
  },
  {
    category: 'Experience / Design System',
    test: 'tests/m10.5-experience-contract-premium-pilot.test.cjs'
  },
  {
    category: 'Product / Consumer',
    test: 'tests/m11-premium-today-attention-composition.test.cjs'
  },
  {
    category: 'Journey architecture',
    test: 'tests/m12-journey-core-day-composer.test.cjs'
  },
  {
    category: 'Memory architecture',
    test: 'tests/m13.1-memory-core-contract-foundation.test.cjs'
  },
  {
    category: 'Product / Consumer',
    test: 'tests/m13.2-premium-memories-experience.test.cjs'
  },
  {
    category: 'App Shell / Legacy Runtime',
    test: 'tests/m14.1-app-shell-legacy-runtime-hardening.test.cjs'
  },
  {
    category: 'Intelligence / AI Composer',
    test: 'tests/m14.2-ai-composer-keyboard-submit.test.cjs'
  },
  {
    category: 'Experience / AI Composer',
    test: 'tests/m14.3-ai-composer-viewport-reachability.test.cjs'
  },
  {
    category: 'Places / Discovery Reliability',
    test: 'tests/m15.0-places-verified-dietary-filter-regression.test.cjs'
  },
  {
    category: 'Places / Discovery Breadth',
    test: 'tests/m15.0b-places-progressive-breadth-runtime.test.cjs'
  },
  {
    category: 'Intelligence / Action Contract',
    test: 'tests/m15.1-intelligence-action-contract-core.test.cjs'
  },
  {
    category: 'Booking / AI Owner Entry',
    test: 'tests/m15.2-booking-owner-chat-entry.test.cjs'
  },
  {
    category: 'Platform / Rich Owner Adapters',
    test: 'tests/m15.3-owner-contract-rich-card-adapters.test.cjs'
  },
  {
    category: 'Intelligence / Action Runtime',
    test: 'tests/m15.4-intelligence-action-runtime.test.cjs'
  },
  {
    category: 'Intelligence / Rich Conversation',
    test: 'tests/m15.5-actionable-ai-chat-rich-results.test.cjs'
  },
  {
    category: 'Experience / Rich Results',
    test: 'tests/m15.6-actionable-ai-rich-result-experience.test.cjs'
  },
  {
    category: 'Booking / Preview CORS',
    test: 'tests/m15.7-booking-route-cors-acceptance.test.cjs'
  },
  {
    category: 'Intelligence / Natural Day Intent',
    test: 'tests/m15.8-intelligence-day-intent-rich-result.test.cjs'
  },
  {
    category: 'Intelligence / Action Ledger',
    test: 'tests/m16.1-intelligence-action-ledger-core.test.cjs'
  },
  {
    category: 'Intelligence / Capability Policy',
    test: 'tests/m16.2-intelligence-action-capability-policy.test.cjs'
  },
  {
    category: 'Intelligence / Confirmed Owner Runtime',
    test: 'tests/m16.3-intelligence-confirmed-owner-action-runtime.test.cjs'
  },
  {
    category: 'Intelligence / Confirmation Chat',
    test: 'tests/m16.4-intelligence-confirmation-recovery-chat.test.cjs'
  },
  {
    category: 'Platform / M16 Runtime Registration',
    test: 'tests/m16.5-intelligence-action-runtime-registration.test.cjs'
  },
  {
    category: 'Experience / Confirmed Owner Actions',
    test: 'tests/m16.6-confirmed-owner-action-experience.test.cjs'
  },

  {
    category: 'Product / Consumer',
    test: 'tests/m5.1b-gallery-view-trip-contract-adoption.test.cjs'
  },

  {
    category: 'Product / Control Center',
    test: 'tests/m5.1c-booking-inbox-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Product / Control Center',
    test: 'tests/m5.1d-booking-control-center-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Product / App Shell',
    test: 'tests/m5.1e-active-app-shell-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Product / Consumer',
    test: 'tests/m5.1f-memory-worlds-v3-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Places architecture',
    test: 'tests/m5.1g-places-domain-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Product / Consumer',
    test: 'tests/m5.1h-discovery-modules-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Runtime foundation',
    test: 'tests/m5.1i-diagnostics-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Product / Consumer',
    test: 'tests/m5.1j-profile-foundation-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Intelligence',
    test: 'tests/m5.1k-recommendations-trip-contract-adoption.test.cjs'
  },
  {
    category: 'Intelligence',
    test: 'tests/m5.4.1b-destination-service-trip-boundary-adoption.test.cjs'
  },
  {
    category: 'Intelligence',
    test: 'tests/m5.4.2-runtime-bootstrap-trip-boundary.test.cjs'
  },
  {
    category: 'Trip architecture',
    test: 'tests/m5.4.3-active-tripstore-consumer-isolation.test.cjs'
  },
  {
    category: 'Native readiness',
    test: 'tests/m5.4-final-web-compatibility-boundary.test.cjs'
  },
  {
    category: 'Trip architecture',
    test: 'tests/m5-final-physical-trip-core-isolation.test.cjs'
  },
  {
    category: 'Runtime foundation',
    test: 'tests/m5.2-remaining-trip-consumer-isolation.test.cjs'
  },
  {
    category: 'M3 contracts',
    test: 'tests/m5.1f-trip-contract-accent-compatibility.test.cjs'
  },
  {
    category: 'Product / Control Center',
    test: 'tests/v13.77.0-control-center-home-travel-identity.test.cjs'
  },
  {
    category: 'Product / Control Center',
    test: 'tests/v13.78.0-booking-control-center-foundation.test.cjs'
  },
  {
    category: 'Product / Control Center',
    test: 'tests/v13.78.0-product-module-regression.test.cjs'
  },

  {
    category: 'Booking',
    test: 'tests/v13.81.3-contact-resolver-green-farmers-regression.test.cjs'
  },
  {
    category: 'Booking',
    test: 'tests/v13.81.4-google-reserve-discovery-matrix.test.cjs'
  },
  {
    category: 'Booking',
    test: 'tests/v13.81.4-green-farmers-mutation-bootstrap-regression.test.cjs'
  },

  {
    category: 'Architecture / Registry',
    test: 'tests/m4.5.3-core-stream-registry.test.cjs'
  },
  {
    category: 'Architecture / Topology',
    test: 'tests/m4.5.4-eight-stream-topology-guardrail.test.cjs'
  },
  {
    category: 'M16.5 / Visual inventory',
    test: 'tests/m16.5-visual-surface-inventory.test.cjs'
  },
  {
    category: 'M16.5 / Social Experience Graph',
    test: 'tests/m16.5b-social-experience-graph-reservation.test.cjs'
  },
  {
    category: 'M16.5 / Navigation continuity',
    test: 'tests/m16.5c-single-cycle-navigation-transition.test.cjs'
  },
  {
    category: 'M16.5 / Living Design and Compass',
    test: 'tests/m16.5e-living-design-compass-foundation.test.cjs'
  },
  {
    category: 'M16.5 / Signed-in Living Product',
    test: 'tests/m16.5f-signed-in-living-product-vertical-slice.test.cjs'
  },
  {
    category: 'M16.5 / Global Living Compass Release',
    test: 'tests/m16.5g-global-living-compass-release.test.cjs'
  },
  {
    category: 'M16.5 / Accepted Living Shell',
    test: 'tests/m16.5h-accepted-living-shell-adoption.test.cjs'
  },
  {
    category: 'M16.5 / Visual Parity Gate',
    test: 'tests/m16.5i-visual-parity-no-substitution-gate.test.cjs'
  },
  {
    category: 'M16.5 / Accepted Living Shell Release',
    test: 'tests/m16.5j-accepted-living-shell-runtime-release.test.cjs'
  },
  {
    category: 'M16.5 / Productive Plan Compass',
    test: 'tests/m16.5k-plan-compass-productive-adoption.test.cjs'
  },
  {
    category: 'M16.5 / Productive Plan Compass Release',
    test: 'tests/m16.5l-productive-plan-compass-runtime-release.test.cjs'
  },
  {
    category: 'M16.5 / Plan Compass Navigation Alignment',
    test: 'tests/m16.5m-plan-compass-navigation-alignment.test.cjs'
  },
  {
    category: 'M16.5 / Places Coordinate Projection',
    test: 'tests/m16.5n-places-coordinate-projection-hardening.test.cjs'
  },
  {
    category: 'M16.5 / Productive Places Spatial Experience',
    test: 'tests/m16.5n-productive-places-spatial-experience.test.cjs'
  },
  {
    category: 'M16.5 / Productive Places Runtime Release',
    test: 'tests/m16.5p-productive-places-runtime-release.test.cjs'
  },
  {
    category: 'M16.5 / Living Compass Recovery Release',
    test: 'tests/m16.5q-living-compass-recovery-release.test.cjs'
  },
  {
    category: 'M16.5 / Design Integration and Feature Productization Plan',
    test: 'tests/m16.5-productization-plan.test.cjs'
  },
  {
    category: 'M16.5 / Places Details and Evidence Continuity',
    test: 'tests/m16.5r-places-detail-continuity-release.test.cjs'
  },
  {
    category: 'M16.5 / Public Landing and Real Authentication Scope Lock',
    test: 'tests/m16.5s-landing-auth-scope-lock.test.cjs'
  },
  {
    category: 'M16.5 / Public Landing and Real Authentication Integration',
    test: 'tests/m16.5s-public-landing-auth-integration.test.cjs'
  },
  {
    category: 'M16.5 / Responsive Shell and Memory Book Studio',
    test: 'tests/m16.5u-responsive-shell-memory-studio.test.cjs'
  },
  {
    category: 'M16.5 / Warm Start, Profile Routing and Accepted Header',
    test: 'tests/m16.5v-shell-warm-start-profile-header-release.test.cjs'
  },
  {
    category: 'M16.5 / Shell Detail and Today Stability',
    test: 'tests/m16.5w-shell-detail-stability-release.test.cjs'
  },
  {
    category: 'M16.5 / Shell Freeze Orbit and Control Course',
    test: 'tests/m16.5x-shell-freeze-orbit-control-course.test.cjs'
  },
  {
    category: 'M16.5 / Identity Compass Profile Onboarding',
    test: 'tests/m16.5y-identity-compass-onboarding.test.cjs'
  },
  {
    category: 'M16.5 / First Trip Composer',
    test: 'tests/m16.5z-first-trip-composer.test.cjs'
  },
  {
    category: 'P15/P17 / Composer Recovery and Product Validation',
    test: 'tests/trip-composer-recovery.test.cjs'
  },
  {
    category: 'M16.5 / Preference Resolution + Places',
    test: 'tests/m16.5aa-preference-resolution-places.test.cjs'
  },
  {
    category: 'M16.5 / Shared Compass Direction Activation',
    test: 'tests/m16.5aa-compass-direction-activation.test.cjs'
  },
  {
    category: 'M16.5 / Today Plan Places Wave C',
    test: 'tests/m16.5ab-today-plan-places-wave-c.test.cjs'
  },
  {
    category: 'M16.5 / Places Discovery Resilience',
    test: 'tests/m16.5ab-places-discovery-resilience.test.cjs'
  },
  {
    category: 'M16.5 / Local-first Boot + Living Today',
    test: 'tests/m16.5ab-local-first-boot-today.test.cjs'
  },
  {
    category: 'M16.5 / Verified Booking Route Gate',
    test: 'tests/m16.5ab-booking-route-gate.test.cjs'
  },
  {
    category: 'M16.5 / Unified Places Journey Living Sheet',
    test: 'tests/m16.5ab-unified-places-journey-sheet.test.cjs'
  },
  {
    category: 'M16.5 / Journey Suggestion Partial Continuity',
    test: 'tests/journey-suggestion-partial-continuity.test.cjs'
  },
  {
    category: 'M16.5 / Living Compass AI Owner Orchestration',
    test: 'tests/m16.5ab-living-compass-ai-owner-orchestration.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Consumer-ready AI Language',
    test: 'tests/m16.5-block1-consumer-ready-ai-language.test.cjs'
  },
  {
    category: 'M16.5 / Journey Resilience Foundation',
    test: 'tests/m16.5ab-journey-resilience-foundation.test.cjs'
  },
  {
    category: 'P11 / Evidenced Route Buffer Owner',
    test: 'tests/p11-route-uncertainty-buffer-owner.test.cjs'
  },
  {
    category: 'P12 / Source-backed Day Rehearsal',
    test: 'tests/p12-source-backed-day-rehearsal.test.cjs'
  },
  {
    category: 'M16.5 / Intelligence Travel Orchestration',
    test: 'tests/m16.5ab-intelligence-travel-orchestration.test.cjs'
  },
  {
    category: 'M16.5 / S16 Planning Trace + Route Uncertainty + Day Rehearsal',
    test: 'tests/m16.5-step16-trace-route-rehearsal-product-slices.test.cjs'
  },
  {
    category: 'M16.5 / Complete AI Mutation Coverage Matrix',
    test: 'tests/m16.5-step16-ai-mutation-coverage-matrix.test.cjs'
  },
  {
    category: 'M16.5 / Human-AI Action Registry + Parity Gate',
    test: 'tests/m16.5-human-ai-action-registry.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Human-AI Language Compiler',
    test: 'tests/m16.5-block0-human-ai-language-compiler.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Human-AI Language Public Adapter',
    test: 'tests/m16.5-block0-human-ai-language-public-adapter.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Visible Human-AI Language Browser',
    test: 'tests/m16.5-block0-human-ai-language-browser.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Shared Human-AI Safety Policy',
    test: 'tests/m16.5-block0-human-ai-safety-policy.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Human-AI Safety Public Adapter',
    test: 'tests/m16.5-block0-human-ai-safety-public-adapter.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Visible Human-AI Safety Browser',
    test: 'tests/m16.5-block0-human-ai-safety-browser.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Complete Human-AI Action Lifecycle',
    test: 'tests/m16.5-block0-human-ai-action-lifecycle.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Human-AI Lifecycle Public Adapter',
    test: 'tests/m16.5-block0-human-ai-lifecycle-public-adapter.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Visible Human-AI Lifecycle Browser',
    test: 'tests/m16.5-block0-human-ai-lifecycle-browser.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Honest Human-AI Capability Discovery',
    test: 'tests/m16.5-block0-human-ai-capability-discovery.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Capability Discovery Public Adapter',
    test: 'tests/m16.5-block0-human-ai-capability-public-adapter.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Visible Capability Discovery Browser',
    test: 'tests/m16.5-block0-human-ai-capability-browser.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Complete Human-AI Consumer Projection',
    test: 'tests/m16.5-block0-human-ai-consumer-projection.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Human-AI Consumer Public Adapter',
    test: 'tests/m16.5-block0-human-ai-consumer-public-adapter.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Visible Bright Human-AI Consumer Chat',
    test: 'tests/m16.5-block0-human-ai-consumer-browser.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Complete Human-AI Parity Failure Matrix',
    test: 'tests/m16.5-block0-human-ai-parity-failure-matrix.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Human-AI Parity Failure CI Drift Gate',
    test: 'tests/m16.5-block0-human-ai-parity-failure-drift.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Human-AI Parity Failure Public Adapter',
    test: 'tests/m16.5-block0-human-ai-parity-failure-public-adapter.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Visible Human-AI Parity Failure Matrix',
    test: 'tests/m16.5-block0-human-ai-parity-failure-browser.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Places Mutation Input Enforcement',
    test: 'tests/m16.5-block0-place-plan-input-enforcement.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Booking Input Enforcement',
    test: 'tests/m16.5-block0-booking-input-enforcement.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Journey + Trip Input Enforcement',
    test: 'tests/m16.5-block0-journey-trip-input-enforcement.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Places + Events + Memory + Identity Input Enforcement',
    test: 'tests/m16.5-block0-remaining-input-enforcement.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Identity Profile Public Owner Binding',
    test: 'tests/m16.5-block0-identity-profile-owner-binding.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Journey Public Owner Read/Write Bundle',
    test: 'tests/m16.5-block0-journey-owner-read-write-binding.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Booking Public Owner Surface',
    test: 'tests/m16.5-block0-booking-owner-surface-binding.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Places + Journey + Memory + Event Public Owner Bundle',
    test: 'tests/m16.5-block0-places-journey-memory-event-owner-bundle.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Trip + Media + Identity Public Owner Bundle',
    test: 'tests/m16.5-block0-trip-media-identity-owner-bundle.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Auth + Collaboration + Booking Public Owner Bundle',
    test: 'tests/m16.5-block0-auth-collaboration-booking-owner-bundle.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Final Platform + Places + Journey + Media + Memory Owner Bundle',
    test: 'tests/m16.5-block0-final-owner-method-bundle.test.cjs'
  },
  {
    category: 'M16.5 / Block 0 Visible Human-AI Action Parity',
    test: 'tests/m16.5-block0-visible-action-parity-browser.test.cjs'
  },
  {
    category: 'M16.5 / S16.09-S16.12 Verified Event Intelligence',
    test: 'tests/m16.5-step16-verified-event-intelligence.test.cjs'
  },
  {
    category: 'M16.5 / Global AI Chat + Owner-first USP Backlog',
    test: 'tests/m16.5-step15-global-ai-chat-and-step16-backlog.test.cjs'
  },
  {
    category: 'M16.5 / Spatial AI Places Diversity + Provider Media',
    test: 'tests/m16.5-step15-places-spatial-diversity-media.test.cjs'
  },
  {
    category: 'M16.5 / P02 Places Provider Truth + Public Projection',
    test: 'tests/m16.5-step15-places-provider-truth-projection.test.cjs'
  },
  {
    category: 'M16.5 / P03 AI Places Multi-category Fairness',
    test: 'tests/p03-ai-places-multicategory-result-contract.test.cjs'
  },
  {
    category: 'M16.5 / P03 Cross-surface Places Owner Parity',
    test: 'tests/p03-cross-surface-places-owner-parity.test.cjs'
  },
  {
    category: 'M16.5 / Runtime Bundle Upgrade Bridge',
    test: 'tests/m16.5-step18-runtime-bundle-upgrade-bridge.test.cjs'
  },
  {
    category: 'M16.5 / Provider-first Preference Paint',
    test: 'tests/m16.5ab-fast-preference-provider-first-paint.test.cjs'
  },
  {
    category: 'M16.5 / GPS Confirmation Timeline Boundary',
    test: 'tests/m16.5ab-gps-confirmation-timeline-boundary.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 GPS User-Gesture Gate',
    test: 'tests/m16.5-block1-gps-user-gesture-gate.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Foursquare Current Response Mapping',
    test: 'tests/m16.5-block1-foursquare-current-response-mapping.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Consumer Truth Projection',
    test: 'tests/m16.5-block1-consumer-truth-projection.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Strict Restaurant Evidence',
    test: 'tests/m16.5-block1-strict-restaurant-evidence.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Specific Subject Evidence Gate',
    test: 'tests/m16.5-block1-specific-subject-evidence-gate.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Semantic-first Owner Routing',
    test: 'tests/m16.5-block1-semantic-first-ai-routing.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Destination-bound Requirement Read',
    test: 'tests/m16.5-block1-destination-bound-requirement-read.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Semantic Places Mutations',
    test: 'tests/m16.5-block1-semantic-place-mutation-resolution.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Semantic Places Mutation Browser',
    test: 'tests/m16.5-block1-semantic-place-mutation-browser.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Universal Admission Booking Core',
    test: 'tests/m16.5-block1-universal-admission-booking.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Universal Accommodation + Affiliate Foundation',
    test: 'tests/m16.5-block1-universal-accommodation-affiliate-foundation.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Hotel Decision + Affiliate Activation',
    test: 'tests/m16.5-block1-hotel-decision-and-affiliate-activation.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Hotel Live-Price Gateway',
    test: 'tests/m16.5-block1-hotel-live-price-gateway.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Hotel Property + Selected Offer Identity',
    test: 'tests/m16.5-block1-hotel-property-offer-identity.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Visible Hotel Live-Price Decision',
    test: 'tests/m16.5-block1-hotel-live-price-browser.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Bright Hotel Consumer + Exact Owner Handoff',
    test: 'tests/m16.5-block1-hotel-consumer-owner.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Contextual Map + Clean Pin Detail',
    test: 'tests/m16.5-block1-contextual-map-detail-contract.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Chat Navigation Parity',
    test: 'tests/m16.5-block1-chat-navigation-parity.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Booking Lifecycle Policy',
    test: 'tests/m16.5-block1-booking-lifecycle-policy.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Booking Lifecycle Consumer',
    test: 'tests/m16.5-block1-booking-lifecycle-consumer.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Booking Submission Owner',
    test: 'tests/m16.5-block1-booking-submit-owner.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Semantic Booking Lifecycle',
    test: 'tests/m16.5-block1-semantic-booking-lifecycle.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Visible Semantic Booking Lifecycle',
    test: 'tests/m16.5-block1-semantic-booking-lifecycle-browser.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Admission Consumers',
    test: 'tests/m16.5-block1-admission-consumers.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Place Category Integrity',
    test: 'tests/m16.5-block1-place-category-integrity.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Booking Route Venue Identity',
    test: 'tests/m16.5-block1-booking-route-venue-identity.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 Place + Booking Integrity',
    test: 'tests/m16.5-block1-place-booking-integrity.test.cjs'
  },
  {
    category: 'M16.5 / Block 1 AI Places Destination Continuity',
    test: 'tests/m16.5-block1-ai-places-destination-continuity.test.cjs'
  },
  {
    category: 'M16.5 / Journey Offline Day Pack',
    test: 'tests/m16.5ab-journey-offline-day-pack.test.cjs'
  },
  {
    category: 'M16.5 / Journey Group Decision Policy',
    test: 'tests/m16.5ab-journey-place-group-decision-policy.test.cjs'
  },
  {
    category: 'M16.5 / Place Intelligence Evidence Boundary',
    test: 'tests/m16.5ab-place-intelligence-evidence-boundary.test.cjs'
  },
  {
    category: 'M16.5 / Local ES-module Server MIME Boundary',
    test: 'tests/m16.5ab-local-server-module-mime.test.cjs'
  },
  {
    category: 'P02 / Cached OSM category continuity',
    test: 'tests/p02-osm-category-continuity.test.cjs'
  },
  {
    category: 'P02 / Canonical place deduplication',
    test: 'tests/p02-canonical-place-dedupe.test.cjs'
  },
  {
    category: 'Architecture / Core boundaries',
    test: 'tests/m4.5.4-core-boundary-guardrails.test.cjs'
  },
  {
    category: 'Native readiness',
    test: 'tests/run-nfr0-foundation-regression.cjs'
  },
  {
    category: 'M5.3 / Active Trip Context',
    test: 'tests/run-m5.3-active-trip-context-regression.cjs'
  },
  {
    category: 'Repository guardrail',
    test: 'tests/m4.2-cross-core-db-ownership-guardrail.test.cjs'
  }
]);

function resolveTest(relativePath) {
  const absolute = path.resolve(ROOT, relativePath);

  if (
    absolute !== ROOT &&
    !absolute.startsWith(`${ROOT}${path.sep}`)
  ) {
    throw new Error(
      `Regression path escapes repository root: ${relativePath}`
    );
  }

  if (!fs.existsSync(absolute)) {
    throw new Error(
      `Regression allowlist entry does not exist: ${relativePath}`
    );
  }

  return absolute;
}

function listSuite() {
  console.log('M4.3 Safe Regression Allowlist');
  console.log(`Tests: ${SUITE.length}`);

  SUITE.forEach((entry, index) => {
    console.log(
      `${String(index + 1).padStart(2, '0')}. ` +
      `[${entry.category}] ${entry.test}`
    );
  });
}

if (process.argv.includes('--list')) {
  listSuite();
  process.exit(0);
}

const results = [];

console.log('=== M4.3 SAFE REGRESSION HARNESS ===');
console.log(`Repository: ${ROOT}`);
console.log(`Allowlisted tests: ${SUITE.length}`);

for (const entry of SUITE) {
  console.log(
    `\n=== [${entry.category}] ${entry.test} ===`
  );

  let absolute;

  try {
    absolute = resolveTest(entry.test);
  } catch (error) {
    console.error(error.message);

    results.push({
      ...entry,
      exitCode: 1,
      result: 'FAIL'
    });

    continue;
  }

  const run = spawnSync(
    process.execPath,
    [absolute],
    {
      cwd: ROOT,
      stdio: 'inherit'
    }
  );

  const exitCode =
    typeof run.status === 'number'
      ? run.status
      : 1;

  if (run.error) {
    console.error(
      `Runner error: ${run.error.message}`
    );
  }

  results.push({
    ...entry,
    exitCode,
    result: exitCode === 0 ? 'PASS' : 'FAIL'
  });
}

const passed =
  results.filter(item => item.result === 'PASS').length;

const failed =
  results.filter(item => item.result === 'FAIL');

console.log('\n=== M4.3 SAFE REGRESSION RESULT ===');

for (const item of results) {
  console.log(
    `${item.result.padEnd(4)}  ` +
    `[${item.category}] ${item.test}`
  );
}

console.log('');
console.log(`Total:  ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed.length}`);
console.log(
  `Suite:  ${failed.length === 0 ? 'PASS' : 'FAIL'}`
);

if (failed.length > 0) {
  process.exitCode = 1;
}
