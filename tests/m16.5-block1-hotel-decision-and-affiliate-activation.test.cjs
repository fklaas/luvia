'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const context = { Object, Array, String, Number, Boolean, Date, Math, RegExp, JSON, Set, Map, Error, TypeError };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const file of [
  'core/booking/booking-stay-decision-core.js',
  'core/booking/booking-affiliate-activation-core.js',
]) vm.runInContext(read(file), context, { filename: file });

const stay = context.LuviaBookingStayDecisionCore;
const activation = context.LuviaBookingAffiliateActivationCore;
const query = { checkIn: '2027-06-12', checkOut: '2027-06-14', adults: 2, children: 0, rooms: 1, currency: 'EUR' };
const offers = [
  { offerId: 'a', providerId: 'bookingcom_demand', canonicalPropertyId: 'hotel-1', propertyName: 'Seehotel', roomCode: 'double-sea', board: 'breakfast', checkIn: '2027-06-12', checkOut: '2027-06-14', adults: 2, children: 0, rooms: 1, totalPrice: 300, currency: 'EUR', totalIncludesMandatoryCharges: true, available: true, isLive: true, source: 'provider_api', refundable: false, preferenceFit: .8, providerReliability: .9, commission: 999 },
  { offerId: 'b', providerId: 'expedia_rapid', canonicalPropertyId: 'hotel-1', propertyName: 'Seehotel', roomCode: 'double-sea', board: 'breakfast', checkIn: '2027-06-12', checkOut: '2027-06-14', adults: 2, children: 0, rooms: 1, totalPrice: 320, currency: 'EUR', totalIncludesMandatoryCharges: true, available: true, isLive: true, source: 'provider_api', refundable: true, freeCancellationUntil: '2027-06-10', prepaymentRequired: false, preferenceFit: .8, providerReliability: .9, commission: 0 },
  { offerId: 'c', providerId: 'unknown-cheap', canonicalPropertyId: 'hotel-2', propertyName: 'Lockhotel', roomCode: 'double', board: 'none', checkIn: '2027-06-12', checkOut: '2027-06-14', adults: 2, children: 0, rooms: 1, basePrice: 99, currency: 'EUR', available: true, isLive: true, source: 'provider_api', refundable: false },
  { offerId: 'd', providerId: 'stale', canonicalPropertyId: 'hotel-3', propertyName: 'Altes Hotel', roomCode: 'double', board: 'none', checkIn: '2027-06-12', checkOut: '2027-06-14', adults: 2, children: 0, rooms: 1, totalPrice: 100, currency: 'EUR', totalIncludesMandatoryCharges: true, freshnessMinutes: 60, available: true, isLive: true, source: 'provider_api' },
];

const decision = stay.buildDecision(offers, query, { attempted: ['bookingcom_demand', 'expedia_rapid', 'missing'], succeeded: ['bookingcom_demand', 'expedia_rapid'], failed: ['missing'] });
assert.equal(decision.hotels.length, 1, 'incomplete and stale bait prices must not enter the decision');
assert.equal(decision.hotels[0].offerCount, 2, 'the same hotel must collapse into one user card');
assert.equal(decision.hotels[0].comparableProviderRates.length, 1, 'identical room products must remain provider-comparable');
assert.equal(decision.recommendations.cheapestComparable.offerId, 'a');
assert.equal(decision.recommendations.bestFlexible.offerId, 'b');
assert.equal(decision.invariants.commissionExcludedFromRanking, true);
assert.equal(decision.invariants.livePriceRequiredForPriceRanking, true);
assert.equal(decision.claims.crossSourcePriceComparisonAvailable, true);
assert.equal(decision.claims.bestMarketPrice, false);
assert.equal(decision.coverage.allMarketPriceGuarantee, false);
assert.ok(decision.coverage.failed.includes('missing'));
assert.ok(decision.excluded.some(entry => entry.reasons.includes('TOTAL_PRICE_INCOMPLETE')));
assert.ok(decision.excluded.some(entry => entry.reasons.includes('QUOTE_STALE')));
const withoutPrices = stay.buildDecision([], query, { attempted: ['affiliate-link'], succeeded: ['affiliate-link'] });
assert.equal(withoutPrices.productMode, 'fit_only');
assert.equal(withoutPrices.claims.priceRankingAvailable, false);
assert.equal(withoutPrices.invariants.affiliateLinkAloneCannotRankPrice, true);

const commercial = activation.commercialRanking();
const hotel = activation.hotelRanking();
assert.equal(commercial[0].id, 'viator_affiliate');
assert.equal(hotel[0].id, 'kayak_affiliate');
assert.equal(hotel[1].id, 'expedia_affiliate');
assert.equal(activation.list().find(program => program.id === 'bookingcom_affiliate').status, 'submitted');
assert.equal(activation.policy().externalApplicationRequiresAuthorizedBusinessRepresentative, true);
assert.equal(activation.policy().commercialSignalsExcludedFromHotelRanking, true);
assert.equal(activation.policy().livePriceApiRequiredForPriceRanking, true);
assert.equal(activation.hotelPriceAccessRanking('proof')[0].id, 'duffel_stays');
assert.match(activation.hotelPriceAccessRanking('proof')[0].access, /application_submitted/);
assert.equal(activation.hotelPriceAccessRanking('usp')[0].id, 'kayak_affiliate');
assert.ok(activation.applicationChecklist().some(item => /Impressum/.test(item)));
assert.equal(activation.list({ wave: 'apply_now' }).length, 6);

const adapter = read('core/platform/booking-contract-adapter.js');
assert.match(adapter, /function compareStayOffers/);
assert.match(adapter, /LuviaBookingStayDecisionCore/);
assert.match(adapter, /hotelDecisionTruth:true/);
const index = read('index.html');
assert.match(index, /booking-stay-decision-core\.js/);
assert.match(index, /booking-affiliate-activation-core\.js/);

console.log('M16.5 Block 1 hotel decision + affiliate activation: PASS');
console.log('One hotel card, like-for-like provider rates, full-price/freshness gates and commission-free ranking: PASS');
console.log(`${commercial.length} ranked programmes · ${activation.list({ wave: 'apply_now' }).length} immediate applications: PASS`);
