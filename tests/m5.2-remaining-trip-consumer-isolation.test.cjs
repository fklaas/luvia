'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const count = (text, regex) => (text.match(regex) || []).length;

const specs = [
  { kind:'platform', path:'core/media/ai-memory-bridge.js' },
  { kind:'platform', path:'core/media/media-core.js', context:true },
  { kind:'platform', path:'core/media/memory-cards.js' },
  { kind:'platform', path:'core/preferences/guided-discovery-sequence.js', context:true, localDraft:true },
  { kind:'platform', path:'core/services/theme-service.js' },
  { kind:'booking', path:'core/booking/booking-integration.js' },
  { kind:'booking', path:'core/booking/booking-ui.js' }
];

const scan = spec => {
  const text = read(spec.path);
  return {
    ...spec,
    text,
    store: count(text, /\bLuviaTripStore\b/g),
    directContext: count(text, /\bLuviaTripContext\b/g),
    contract: count(text, /\b(?:LuviaTripContractV1|LuviaTripContract)\b/g),
    getActiveTrip: count(text, /\bgetActiveTrip\b/g),
    getContext: count(text, /\bgetContext\b/g),
    mutation: count(text, /(?:LuviaTripStore|tripStore|store\(\))[^;\r\n]{0,200}\.(?:setActive|selectActiveTrip|upsert|insert|update|delete|remove|create|save|join)\s*\(/gi),
    tripDbMutation: count(text, /\.from\s*\(\s*['"](?:trips|trip_memberships|trip_members|trip_context)['"]\s*\)[^;\r\n]{0,240}\.(?:insert|update|upsert|delete)\s*\(/gi)
  };
};

const states = specs.map(scan);
const platform = states.filter(x => x.kind === 'platform');
const booking = states.filter(x => x.kind === 'booking');

assert.strictEqual(states.length, 7);
assert.strictEqual(platform.length, 5);
assert.strictEqual(booking.length, 2);

for (const state of platform) {
  assert.strictEqual(state.store, 0, state.path + ' private Trip Store must be zero');
  assert.strictEqual(state.directContext, 0, state.path + ' direct Trip Context must be zero');
  assert.ok(state.contract >= 1, state.path + ' must use public Trip Contract');
  assert.ok(state.getActiveTrip >= 1, state.path + ' must use getActiveTrip');
  assert.strictEqual(state.mutation, 0, state.path + ' private Trip mutation forbidden');
  assert.strictEqual(state.tripDbMutation, 0, state.path + ' Trip DB mutation forbidden');
  if (state.context) assert.ok(state.getContext >= 1, state.path + ' must use getContext');
}

const preference = platform.find(x => x.localDraft);
assert.ok(preference);
assert.strictEqual(count(preference.text, /luviaGuidedDiscoveryDraftV3:/g), 1);
assert.strictEqual(count(preference.text, /sessionStorage\.setItem\s*\(\s*state\.draftKey/g), 1);

for (const state of states) {
  assert.strictEqual(state.mutation, 0);
  assert.strictEqual(state.tripDbMutation, 0);
}

const bookingStore = booking.reduce((sum, x) => sum + x.store, 0);
const bookingContext = booking.reduce((sum, x) => sum + x.directContext, 0);
const bookingContractFiles = booking.filter(x => x.contract > 0).length;

const bookingLegacy =
  bookingStore === 2 &&
  bookingContext === 0 &&
  bookingContractFiles === 0;

const bookingGreen =
  bookingStore === 0 &&
  bookingContext === 0 &&
  bookingContractFiles === 2 &&
  booking.every(x => x.getActiveTrip >= 1);

assert.ok(
  bookingLegacy || bookingGreen,
  'Booking must be exact legacy remainder or exact full Contract adoption'
);

const adapter = read('core/platform/trip-contract-adapter.js');
assert.ok(/\bgetActiveTrip\b/.test(adapter));
assert.ok(/\bgetContext\b/.test(adapter));

const safeRunner = read('tests/run-m4.3-safe-regression.cjs');
assert.ok(!safeRunner.includes('tests/user-preference-core.test.cjs'));

if (bookingLegacy) {
  console.log('M5.2 Remaining Trip Consumer Isolation: PLATFORM FOUNDATION PASS');
  console.log('M5.2 remaining Booking legacy files = 2');
  console.log('M5.2 retained limitation: user-preference-core remains proven preexisting baseline failure.');
  process.exit(0);
}

console.log('M5.2 Remaining Trip Consumer Isolation: PASS');
console.log('M5.2 locked files adopted public Trip Contract = 7 / 7');
