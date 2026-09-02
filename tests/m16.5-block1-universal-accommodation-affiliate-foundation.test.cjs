'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const context = { Object, Array, String, Number, Boolean, Date, Math, RegExp, JSON, Set, Map, Error, TypeError, URL };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const file of [
  'core/booking/booking-provider-capabilities.js',
  'core/booking/booking-accommodation-core.js',
  'core/booking/booking-orchestration.js',
  'core/runtime/navigation-contract-core.js',
]) vm.runInContext(read(file), context, { filename: file });

const capabilities = context.LuviaBookingProviderCapabilities;
const accommodation = context.LuviaBookingAccommodationCore;
const orchestration = context.LuviaBookingOrchestration;
const navigation = context.LuviaNavigationContractCoreV1;

const portfolio = capabilities.list();
const lodging = capabilities.forVertical('lodging');
const affiliateIds = [
  'bookingcom_affiliate', 'expedia_affiliate', 'hotelscom_affiliate', 'vrbo_affiliate',
  'agoda_affiliate', 'tripcom_affiliate', 'hostelworld_affiliate', 'kayak_affiliate',
  'skyscanner_affiliate', 'viator_affiliate', 'tiqets_affiliate', 'klook_affiliate', 'omio_affiliate',
];
assert.ok(portfolio.length >= 44, 'the multi-vertical provider portfolio must retain the bounded broad/deep set');
assert.ok(lodging.length >= 14, 'lodging must expose price, direct, affiliate and fallback routes');
for (const id of affiliateIds) {
  const provider = capabilities.get(id);
  assert.equal(provider.luviaAccessState, 'partner_required', `${id} must fail closed before contracting`);
  assert.equal(provider.platform.createReservation, false, `${id} affiliate handoff must not claim booking authority`);
  assert.equal(capabilities.canMonetize(provider), true, `${id} must remain a contract-activatable commercial route`);
  assert.match(provider.metadata.officialDocs, /^https:\/\//, `${id} needs official evidence`);
}
assert.equal(capabilities.get('bookingcom_demand').platform.messaging, true);
assert.equal(capabilities.get('expedia_rapid').platform.cancelReservation, true);
assert.equal(capabilities.get('duffel_stays').platform.quote, true);
assert.equal(capabilities.get('duffel_stays').platform.cancelReservation, true);
assert.equal(capabilities.get('duffel_stays').luviaAccessState, 'partner_required');
assert.equal(capabilities.get('duffel_stays').metadata.applicationStatus, 'submitted');
assert.equal(capabilities.get('amadeus_hotels').platform.quote, true);
assert.equal(capabilities.get('amadeus_hotels').platform.cancelReservation, false, 'Amadeus Self-Service cancellation remains an offline boundary');
assert.equal(capabilities.get('hotelbeds').platform.modifyReservation, true);
assert.equal(capabilities.get('hotelbeds').metadata.productionCertificationRequired, true);

const validStay = accommodation.validateProfile({
  checkIn: '2027-06-12', checkOut: '2027-06-19', rooms: 2, adults: 3,
  children: 2, childAges: [6, 11], currency: 'eur', maxTotalPrice: 2400,
});
assert.equal(validStay.valid, true);
assert.equal(validStay.profile.currency, 'EUR');
assert.equal(validStay.profile.rooms, 2);
assert.equal(accommodation.validateProfile({ checkIn: '2027-02-30', checkOut: '2027-03-02' }).valid, false);
assert.ok(accommodation.validateProfile({ checkIn: '2027-06-12', checkOut: '2027-06-19', children: 2, childAges: [6] }).missing.includes('childAges'));
assert.ok(accommodation.validateProfile({ checkIn: '2027-06-19', checkOut: '2027-06-12' }).issues.some(issue => issue.code === 'INVALID_STAY_RANGE'));

const plan = accommodation.resolve({ profile: validStay.profile, routes: [
  { provider: 'bookingcom_affiliate', bookingMode: 'tracked_handoff', url: 'https://example.invalid/hotel' },
  { provider: 'email', channel: 'email', value: 'booking@example.invalid' },
] });
assert.equal(plan.invariants.affiliateNeverConfirmsBooking, true);
assert.equal(plan.invariants.unknownOutcomeNeverBlindlyRetries, true);
assert.equal(plan.routes[0].kind, 'tracked_affiliate');
assert.equal(plan.routes[1].kind, 'verified_email');
assert.ok(plan.affiliate.some(provider => provider.id === 'hostelworld_affiliate'));

const contact = accommodation.composeContactDraft({ hotelName: 'Seehotel', profile: validStay.profile });
assert.equal(contact.valid, true);
assert.equal(contact.userApproved, false);
assert.match(contact.bodyText, /2 Zimmer/);
assert.match(contact.bodyText, /Zahlungs- und Stornobedingungen/);

const ranking = orchestration.plan([
  { channel: 'external_link', provider: 'official', target: 'https://example.invalid/direct', confidence: .9, signals: { reliability: .9, uxQuality: .9 } },
  { channel: 'affiliate', provider: 'commercial', target: 'https://example.invalid/affiliate', confidence: 1, signals: { commercialReady: true, reliability: 1, uxQuality: 1 } },
]);
assert.equal(ranking.provider, 'official', 'commission readiness must not outrank the better official user route');
assert.equal(ranking.policy.commercialWeightCapped, 8);
assert.equal(ranking.policy.commercialCannotConfirmReservation, true);

assert.equal(navigation.get('hotels').surface, 'accommodations');
assert.equal(navigation.createIntent('unterkuenfte', { source: 'test' }).route, 'hotels');
assert.equal(navigation.createIntent('https://attacker.invalid/redirect').route, 'today', 'unknown external input must collapse to the safe local default, never redirect');

const migration = read('supabase/migrations/20260901143000_core_v4_82_136_universal_admission_lodging_affiliate_foundation.sql');
const rollback = read('docs/rollback/M16.5-B1-CORE-4.82.136-UNIVERSAL-BOOKING-ROLLBACK.sql');
const health = read('supabase/functions/booking-provider-connection-health/index.ts');
for (const id of affiliateIds) {
  assert.ok(migration.includes(`'${id}'`), `${id} needs an additive DB profile`);
  assert.ok(rollback.includes(`'${id}'`), `${id} needs exact compensating rollback coverage`);
  assert.ok(health.includes(`${id}:`), `${id} needs a fail-closed connection manifest`);
}
for (const id of ['amadeus_hotels', 'hotelbeds']) {
  assert.ok(migration.includes(`'${id}'`), `${id} needs an additive DB profile`);
  assert.ok(rollback.includes(`'${id}'`), `${id} needs exact compensating rollback coverage`);
  assert.ok(health.includes(`${id}:`), `${id} needs a fail-closed connection manifest`);
}
assert.match(migration, /commercial.*never imply|reservationTruthIndependent/i);
assert.match(rollback, /without deleting booking, click, conversion or commission evidence/i);

console.log('M16.5 Block 1 universal accommodation + affiliate foundation: PASS');
console.log(`${portfolio.length} providers · ${lodging.length} lodging routes · ${affiliateIds.length} contract-ready affiliate profiles: PASS`);
console.log('Stay validation, verified-email fallback, user-first ranking and exact rollback: PASS');
