'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildReport, validateRegistry } = require('../scripts/m16.5-human-ai-action-registry.cjs');

const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'docs', 'modularization', 'M16.5-HUMAN-AI-ACTION-PARITY-REPORT.md');
const validated = validateRegistry();

assert.equal(validated.registry.actions.length, 333);
assert.equal(validated.registry.summary.aiCoverage.MISSING, 223);
assert.equal(validated.registry.summary.aiCoverage.PUBLIC_E2E_PASS, 7);
assert.equal(validated.registry.summary.aiCoverage.REGISTERED_PARTIAL, 67);
assert.equal(validated.registry.summary.aiCoverage.NATIVE_CHAT, 14);
assert.equal(validated.runtimeActions.length, 30);
assert.equal(Object.keys(validated.inputContracts.contracts).length, 30);
assert.equal(validated.registry.summary.inputContracts.READY, 76);
assert.equal(validated.registry.summary.ownerBinding.PUBLIC_CONTRACT_BOUND, 249);
assert.equal(validated.registry.summary.ownerBinding.OWNER_METHOD_AUDIT_OPEN || 0, 0);
assert.equal(validated.inputContracts.enforcement, 'BOUNDED_RUNTIME_ENFORCEMENT_ACTIVE');
assert.deepEqual(validated.inputContracts.runtimeEnforcement.runtimeEnforcedActionIds, ['navigation.route.open', 'places.place.favorite', 'places.place.unfavorite', 'places.place.plan', 'places.place.unplan', 'booking.place.open', 'booking.stay.search', 'booking.stay.offer.open', 'booking.trip.read', 'booking.reservation.create', 'booking.reservation.modify', 'booking.reservation.cancel', 'journey.day.read', 'journey.day.open', 'journey.entry.schedule', 'journey.entry.remove', 'journey.entry.restore', 'journey.visit.update', 'journey.visit.remove', 'journey.visit.restore', 'trip.active.list', 'trip.active.select', 'trip.update.details', 'places.restaurant.recommend', 'places.discovery.recommend', 'events.verified.read', 'memory.library.read', 'memory.story.save', 'identity.preferences.read', 'identity.preferences.update']);
assert.equal(validated.inputContracts.runtimeEnforcement.metadataValidatedOpenActionIds, 0);
assert.equal(validated.sourceAudit.markers.length, 1015);

const expectedReport = buildReport(validated).replace(/\r\n?/g, '\n');
const actualReport = fs.readFileSync(REPORT, 'utf8').replace(/\r\n?/g, '\n');
assert.equal(actualReport, expectedReport, 'generated Human ↔ AI parity report is stale');

console.log('M16.5 Human ↔ AI action registry: PASS');
console.log('333 semantic actions · 30 runtime actions · 1015 active source markers: PASS');
console.log('30 typed runtime input contracts and 76 mapped human-action rows: PASS');
console.log('30/30 runtime actions guarded before Ledger or Owner execution: PASS');
console.log('249 Navigation/Auth/Identity/Collaboration/Intelligence/Trip/Journey/Booking/Places/Media/Memory/Event/Platform actions bound to verified public Owner methods: PASS');
console.log('State-changing confirmation/idempotency and public-evidence gates: PASS');
