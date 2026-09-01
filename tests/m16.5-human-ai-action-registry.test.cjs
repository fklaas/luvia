'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildReport, validateRegistry } = require('../scripts/m16.5-human-ai-action-registry.cjs');

const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'docs', 'modularization', 'M16.5-HUMAN-AI-ACTION-PARITY-REPORT.md');
const validated = validateRegistry();

assert.equal(validated.registry.actions.length, 327);
assert.equal(validated.registry.summary.aiCoverage.MISSING, 248);
assert.equal(validated.registry.summary.aiCoverage.PUBLIC_E2E_PASS, 3);
assert.equal(validated.registry.summary.aiCoverage.REGISTERED_PARTIAL, 40);
assert.equal(validated.registry.summary.aiCoverage.NATIVE_CHAT, 14);
assert.equal(validated.runtimeActions.length, 21);
assert.equal(Object.keys(validated.inputContracts.contracts).length, 21);
assert.equal(validated.registry.summary.inputContracts.READY, 45);
assert.equal(validated.registry.summary.ownerBinding.PUBLIC_CONTRACT_BOUND, 243);
assert.equal(validated.registry.summary.ownerBinding.OWNER_METHOD_AUDIT_OPEN || 0, 0);
assert.equal(validated.inputContracts.enforcement, 'BOUNDED_RUNTIME_ENFORCEMENT_ACTIVE');
assert.deepEqual(validated.inputContracts.runtimeEnforcement.runtimeEnforcedActionIds, ['places.place.favorite', 'places.place.unfavorite', 'places.place.plan', 'places.place.unplan', 'booking.restaurant.open', 'booking.trip.read', 'booking.reservation.create', 'booking.reservation.modify', 'booking.reservation.cancel', 'journey.day.read', 'journey.day.open', 'trip.active.list', 'trip.active.select', 'trip.update.details', 'places.restaurant.recommend', 'places.discovery.recommend', 'events.verified.read', 'memory.library.read', 'memory.story.save', 'identity.preferences.read', 'identity.preferences.update']);
assert.equal(validated.inputContracts.runtimeEnforcement.metadataValidatedOpenActionIds, 0);
assert.equal(validated.sourceAudit.markers.length, 896);

const expectedReport = buildReport(validated).replace(/\r\n?/g, '\n');
const actualReport = fs.readFileSync(REPORT, 'utf8').replace(/\r\n?/g, '\n');
assert.equal(actualReport, expectedReport, 'generated Human ↔ AI parity report is stale');

console.log('M16.5 Human ↔ AI action registry: PASS');
console.log('327 semantic actions · 21 runtime actions · 896 active source markers: PASS');
console.log('21 typed runtime input contracts and 45 mapped human-action rows: PASS');
console.log('21/21 runtime actions guarded before Ledger or Owner execution: PASS');
console.log('243 Navigation/Auth/Identity/Collaboration/Intelligence/Trip/Journey/Booking/Places/Media/Memory/Event/Platform actions bound to verified public Owner methods: PASS');
console.log('State-changing confirmation/idempotency and public-evidence gates: PASS');
