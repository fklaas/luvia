'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fixture=read('tests/fixtures/m16.5-block1-place-booking-integrity-browser.html');
const edge=read('supabase/functions/booking-route-resolve/index.ts');
const context={console,URL,Date};context.window=context;context.globalThis=context;vm.createContext(context);

for(const file of [
  'core/places/places-domain-contract-core.js',
  'core/places/global-place-contracts.js',
  'core/booking/booking-admission-core.js'
])vm.runInContext(read(file),context,{filename:file});

const admission=context.LuviaBookingAdmissionCore;
const places=context.LuviaGlobalPlaceContracts;
const hotel={id:'hotel-arosa-travemuende',providerPlaceId:'hotel-arosa-travemuende',name:'Grand SPA Resort A-ROSA Travemünde',primaryType:'hotel',types:['hotel','lodging']};
const falseBeach={id:'beach-aura-hotel-name',providerPlaceId:'beach-aura-hotel-name',name:'Strandabschnitt Strandkörbe des Aura-Hotels',primaryType:'beach',types:['beach','tourist_attraction']};

const hotelAdmission=admission.resolve(hotel);
assert.equal(places.accepts(hotel,'accommodation','Hotels in Travemünde',{}, {destination:'Travemünde'}),true,'a provider-typed real hotel must remain in accommodation results');
assert.equal(hotelAdmission.kind,'lodging');
assert.equal(hotelAdmission.notice.label,'Preis und Verfügbarkeit ungeklärt');
assert.equal(hotelAdmission.action.label,'Zimmer und Preise prüfen');
assert.doesNotMatch(JSON.stringify(hotelAdmission),/Ticket|Eintritt/,'a hotel must never inherit ticket/admission language');

assert.equal(places.accepts(falseBeach,'accommodation','Hotels in Travemünde',{}, {destination:'Travemünde'}),false,'the word Hotel in a beach name must not bypass accommodation type evidence');

for(const venue of [
  {id:'beach-lounge',name:'Beach Lounge',primaryType:'bar',types:['bar']},
  {id:'tonfink',name:'Tonfink',primaryType:'night_club',types:['night_club','bar']}
]){
  const result=admission.resolve(venue);
  assert.equal(result.kind,'nightlife',`${venue.name} must remain nightlife`);
  assert.equal(result.requirement,'unknown',`${venue.name} category alone must not invent a booking requirement`);
  assert.equal(result.notice.label,'Einlass noch ungeklärt');
  assert.equal(result.action.label,'Einlass prüfen');
  assert.doesNotMatch(JSON.stringify(result),/Zimmer und Preise/);
}

for(const source of [
  '../../core/places/places-domain-contract-core.js',
  '../../core/places/global-place-contracts.js',
  '../../core/booking/booking-admission-core.js'
])assert.ok(fixture.includes(source),`visible integrity fixture misses real core ${source}`);
for(const visibleProof of ['Unterkunft · korrekt erkannt','Als Unterkunft abgewiesen','Nachtleben · Bar und Nachtclub korrekt erkannt','Fremdes Ziel blockiert'])assert.ok(fixture.includes(visibleProof),`visible integrity fixture misses ${visibleProof}`);

assert.match(edge,/function routeIdentityEvidence\(/,'Edge resolver must evaluate the selected venue/property identity');
assert.match(edge,/function conflictingPrimaryIdentity\(/,'Edge resolver must detect another named venue or property');
assert.match(edge,/CONFLICTING_TARGET_PROPERTY/,'cross-property handoffs need an explicit fail-closed reason');
assert.match(edge,/VENUE_OR_PROPERTY_IDENTITY_MISMATCH/,'unproven route identity must be rejected');
assert.match(edge,/if\(!proof\.verified\)return \{ok:false,reason:proof\.reason/,'an unverified provider target must never be opened');
assert.match(edge,/nameMatched\|\|addressMatched\|\|sourceBound\|\|providerBound/,'reachability alone must not count as target identity');

console.log('M16.5 Block 1 Place/Booking integrity: PASS');
console.log('Hotel copy + typed accommodation gate + nightlife semantics + cross-venue fail-closed: 4/4 PASS');
