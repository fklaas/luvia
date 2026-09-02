'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');

const context={console,Object,Array,String,Number,Boolean,Date,Math,RegExp,JSON,Set,Map,Error,TypeError,Promise};
context.globalThis=context;context.window=context;vm.createContext(context);
vm.runInContext(read('core/booking/booking-stay-decision-core.js'),context,{filename:'core/booking/booking-stay-decision-core.js'});
const stay=context.LuviaBookingStayDecisionCore;
const query={tripId:'trip-luebeck',checkIn:'2027-06-12',checkOut:'2027-06-14',adults:2,children:0,rooms:1,currency:'EUR'};
const offer=(providerId,providerHotelId,overrides={})=>({
  providerId,providerHotelId,offerId:`offer-${providerId}`,providerRateKey:`rate-${providerId}`,
  propertyName:'Grand Hotel',checkIn:query.checkIn,checkOut:query.checkOut,adults:2,children:0,rooms:1,
  totalPrice:300,currency:'EUR',totalIncludesMandatoryCharges:true,available:true,isLive:true,source:'provider_api',freshnessMinutes:0,
  quotedAt:'2026-09-02T09:00:00Z',deepLink:`https://booking.example/${providerHotelId}/offer`,bookingUrlVerified:true,bookingUrlPropertyId:providerHotelId,
  ...overrides
});

const providerScoped=stay.buildDecision([offer('amadeus_hotels','AMA-1'),offer('hotelbeds','HBX-9')],query,{attempted:['amadeus_hotels','hotelbeds'],succeeded:['amadeus_hotels','hotelbeds']});
assert.equal(providerScoped.hotels.length,2,'equal names alone must never merge unrelated provider properties');

const exactGeo=stay.buildDecision([
  offer('amadeus_hotels','AMA-1',{latitude:53.8662,longitude:10.6866}),
  offer('hotelbeds','HBX-9',{latitude:53.8662,longitude:10.6866,totalPrice:295})
],query,{attempted:['amadeus_hotels','hotelbeds'],succeeded:['amadeus_hotels','hotelbeds']});
assert.equal(exactGeo.hotels.length,1,'exact name plus exact coordinates may establish a high-confidence cross-provider property');
assert.equal(exactGeo.hotels[0].offerCount,2);

const canonical=stay.buildDecision([
  offer('amadeus_hotels','AMA-1',{canonicalPropertyId:'luvia-hotel-1'}),
  offer('hotelbeds','HBX-9',{canonicalPropertyId:'luvia-hotel-1',totalPrice:290})
],query,{attempted:['amadeus_hotels','hotelbeds'],succeeded:['amadeus_hotels','hotelbeds']});
assert.equal(canonical.hotels.length,1,'an explicit canonical property id must join provider offers');
assert.equal(canonical.hotels[0].propertyKey,'canonical:luvia-hotel-1');

const handoff=stay.createOfferHandoff(offer('hotelbeds','HBX-9',{canonicalPropertyId:'luvia-hotel-1'}),query);
assert.equal(handoff.valid,true);
assert.equal(handoff.payload.providerHotelId,'HBX-9');
assert.equal(handoff.payload.offerId,'offer-hotelbeds');
assert.equal(handoff.payload.providerRateKey,'rate-hotelbeds');
assert.equal(handoff.payload.propertyKey,'canonical:luvia-hotel-1');
assert.equal(handoff.payload.totalPrice,300);
assert.ok(handoff.payload.quoteFingerprint);
const normalizedHandoff=stay.createOfferHandoff(canonical.hotels[0].bestAvailableTotal,query);
assert.equal(normalizedHandoff.valid,true,`a selected normalized offer must retain its exact handoff identity: ${normalizedHandoff.issues.join(', ')} ${JSON.stringify(stay.normalizeOffer(canonical.hotels[0].bestAvailableTotal,query).price)}`);

const foreign=stay.createOfferHandoff(offer('hotelbeds','HBX-9',{bookingUrlPropertyId:'HBX-FOREIGN'}),query);
assert.equal(foreign.valid,false);
assert.ok(foreign.issues.includes('BOOKING_URL_PROPERTY_MISMATCH'));
const unverified=stay.createOfferHandoff(offer('hotelbeds','HBX-9',{bookingUrlVerified:false}),query);
assert.equal(unverified.valid,false);
assert.ok(unverified.issues.includes('BOOKING_URL_IDENTITY_UNVERIFIED'));

const noFit=stay.buildDecision([offer('hotelbeds','HBX-9')],query,{attempted:['hotelbeds'],succeeded:['hotelbeds']});
assert.equal(noFit.recommendations.bestPersonalFit,null,'provider reliability alone must not become a personal recommendation');
assert.equal(noFit.invariants.personalFitRequiresEvidence,true);
const withFit=stay.buildDecision([offer('hotelbeds','HBX-9',{preferenceFit:.82})],query,{attempted:['hotelbeds'],succeeded:['hotelbeds']});
assert.equal(withFit.recommendations.bestPersonalFit.offerId,'offer-hotelbeds');

const opened=[];let tracked=null;
context.LuviaBooking={
  async trackExternalHandoffForPlace(input){tracked=input;return{bookingId:'booking-stay-1',tracked:true}},
  diagnostics(){return{ready:true}}
};
context.LuviaBookingUI={openForPlace(){}};
context.LuviaBookingDraftCoreV1={};context.LuviaBookingAdmissionCore={};context.LuviaBookingAccommodationCore={};
context.LuviaBookingStaySearchWebAdapter={search(){}};
context.LuviaPlatformPorts={get(name){assert.equal(name,'ExternalNavigationPort');return{async open(url){opened.push(url);return true}}}};
vm.runInContext(read('core/platform/booking-contract-adapter.js'),context,{filename:'core/platform/booking-contract-adapter.js'});
(async()=>{
  await assert.rejects(()=>context.LuviaBookingContractV1.commands.openStayOffer({offer:offer('hotelbeds','HBX-9'),query},{userGesture:false}),error=>error.code==='BOOKING_STAY_OFFER_USER_GESTURE_REQUIRED');
  const result=await context.LuviaBookingContractV1.commands.openStayOffer({offer:offer('hotelbeds','HBX-9'),query},{userGesture:true});
  assert.equal(result.opened,true);
  assert.deepEqual(opened,['https://booking.example/HBX-9/offer']);
  assert.equal(tracked.place.providerPlaceId,'hotel:hotelbeds:HBX-9');
  assert.equal(tracked.metadata.selectedStayOffer.offerId,'offer-hotelbeds');
  assert.equal(tracked.metadata.selectedStayOffer.quoteFingerprint,result.selectedOffer.quoteFingerprint);
  assert.equal(tracked.startAt,null,'the handoff must not invent a check-in clock time');
  assert.equal(tracked.endAt,null,'the handoff must not invent a check-out clock time');
  assert.match(read('core/booking/booking-integration.js'),/sameQuote/,'deduplication must include the exact quote identity');
  console.log('M16.5 Block 1 Hotel property + selected-offer identity: PASS');
  console.log('Cross-provider property merge, exact quote handoff, foreign-property rejection and honest personal-fit lane: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
