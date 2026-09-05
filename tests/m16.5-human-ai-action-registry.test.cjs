'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildReport, validateRegistry } = require('../scripts/m16.5-human-ai-action-registry.cjs');

const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'docs', 'modularization', 'M16.5-HUMAN-AI-ACTION-PARITY-REPORT.md');
const validated = validateRegistry();

assert.equal(validated.registry.actions.length, 330);
assert.equal(validated.registry.summary.aiCoverage.MISSING, 229);
assert.equal(validated.registry.summary.aiCoverage.PUBLIC_E2E_PASS, 7);
assert.equal(validated.registry.summary.aiCoverage.REGISTERED_PARTIAL, 58);
assert.equal(validated.registry.summary.aiCoverage.NATIVE_CHAT, 14);
assert.equal(validated.runtimeActions.length, 24);
assert.equal(Object.keys(validated.inputContracts.contracts).length, 24);
assert.equal(validated.registry.summary.inputContracts.READY, 67);
assert.equal(validated.registry.summary.ownerBinding.PUBLIC_CONTRACT_BOUND, 246);
assert.equal(validated.registry.summary.ownerBinding.OWNER_METHOD_AUDIT_OPEN || 0, 0);
assert.equal(validated.inputContracts.enforcement, 'BOUNDED_RUNTIME_ENFORCEMENT_ACTIVE');
assert.deepEqual(validated.inputContracts.runtimeEnforcement.runtimeEnforcedActionIds, ['navigation.route.open', 'places.place.favorite', 'places.place.unfavorite', 'places.place.plan', 'places.place.unplan', 'booking.place.open', 'booking.stay.search', 'booking.stay.offer.open', 'booking.trip.read', 'booking.reservation.create', 'booking.reservation.modify', 'booking.reservation.cancel', 'journey.day.read', 'journey.day.open', 'trip.active.list', 'trip.active.select', 'trip.update.details', 'places.restaurant.recommend', 'places.discovery.recommend', 'events.verified.read', 'memory.library.read', 'memory.story.save', 'identity.preferences.read', 'identity.preferences.update']);
assert.equal(validated.inputContracts.runtimeEnforcement.metadataValidatedOpenActionIds, 0);
assert.equal(validated.sourceAudit.markers.length, 984);

const expectedReport = buildReport(validated).replace(/\r\n?/g, '\n');
const actualReport = fs.readFileSync(REPORT, 'utf8').replace(/\r\n?/g, '\n');
assert.equal(actualReport, expectedReport, 'generated Human ↔ AI parity report is stale');

console.log('M16.5 Human ↔ AI action registry: PASS');
console.log('330 semantic actions · 24 runtime actions · 984 active source markers: PASS');
console.log('24 typed runtime input contracts and 67 mapped human-action rows: PASS');
console.log('24/24 runtime actions guarded before Ledger or Owner execution: PASS');
console.log('246 Navigation/Auth/Identity/Collaboration/Intelligence/Trip/Journey/Booking/Places/Media/Memory/Event/Platform actions bound to verified public Owner methods: PASS');
console.log('State-changing confirmation/idempotency and public-evidence gates: PASS');
