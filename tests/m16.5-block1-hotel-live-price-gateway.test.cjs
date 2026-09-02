'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');

const coreContext={Object,Array,String,Number,Boolean,Date,Math,RegExp,JSON,Set,Map,Error,TypeError,Promise};
vm.createContext(coreContext);
for(const file of ['core/booking/booking-accommodation-core.js','core/booking/booking-stay-decision-core.js','core/booking/booking-live-stay-search-core.js'])vm.runInContext(read(file),coreContext,{filename:file});
const live=coreContext.LuviaBookingLiveStaySearchCore,stay=coreContext.LuviaBookingStayDecisionCore;
assert.ok(live&&stay);
for(const file of ['core/booking/booking-accommodation-core.js','core/booking/booking-stay-decision-core.js','core/booking/booking-live-stay-search-core.js'])assert.doesNotMatch(read(file),/\bwindow\b|\bglobalThis\b|\bfetch\s*\(/,`${file} must remain browserless`);

const query={tripId:'trip-1',destination:'Berlin',cityCode:'BER',checkIn:'2027-06-12',checkOut:'2027-06-14',adults:2,children:0,childAges:[],rooms:1,currency:'EUR',providers:['amadeus_hotels','hotelbeds']};
assert.equal(live.validateQuery(query).valid,true);
assert.equal(live.validateQuery({...query,checkOut:'2027-06-11'}).valid,false);
assert.equal(live.validateQuery({...query,children:1,childAges:[]}).valid,false);

const unavailable=live.buildResult(query,[
  {providerId:'amadeus_hotels',ok:false,expected:true,error:'PARTNER_REQUIRED',offers:[]},
  {providerId:'hotelbeds',ok:false,expected:true,error:'PARTNER_REQUIRED',offers:[]},
]);
assert.equal(unavailable.productMode,'fit_only');
assert.equal(unavailable.claims.priceRankingAvailable,false);
assert.equal(unavailable.search.failed.length,2);

const base={propertyName:'Seehotel Berlin',latitude:52.52,longitude:13.405,roomCode:'double',board:'breakfast',checkIn:query.checkIn,checkOut:query.checkOut,adults:2,children:0,rooms:1,currency:'EUR',totalIncludesMandatoryCharges:true,available:true,isLive:true,source:'provider_api',freshnessMinutes:0};
const decision=live.buildResult(query,[
  {providerId:'amadeus_hotels',ok:true,source:'provider_api',live:true,observedAt:'2026-09-02T08:00:00Z',offers:[{...base,offerId:'ama-1',totalPrice:310,refundable:false}]},
  {providerId:'hotelbeds',ok:true,source:'provider_api',live:true,observedAt:'2026-09-02T08:00:01Z',offers:[{...base,offerId:'hbx-1',totalPrice:295,refundable:true,freeCancellationUntil:'2027-06-10',prepaymentRequired:false}]},
]);
assert.equal(decision.productMode,'cross_source_live_prices');
assert.equal(decision.hotels.length,1);
assert.equal(decision.hotels[0].offerCount,2);
assert.equal(decision.recommendations.cheapestComparable.offerId,'hbx-1');
assert.equal(decision.claims.bestMarketPrice,false);
assert.equal(decision.recommendations.bestPersonalFit,null,'provider reliability without traveler evidence must not become personal fit');
assert.equal(decision.coverage.allMarketPriceGuarantee,false);
assert.equal(decision.invariants.unconnectedProviderCannotContributeOffers,true);

const affiliate=live.buildResult(query,[{providerId:'amadeus_hotels',ok:true,source:'affiliate_link',live:true,offers:[{...base,offerId:'fake',totalPrice:1}]}]);
assert.equal(affiliate.claims.priceRankingAvailable,false);
const unproven=stay.buildDecision([{...base,offerId:'unproven',isLive:false,source:'fixture',totalPrice:1}],query,{attempted:['fixture'],succeeded:['fixture']});
assert.ok(unproven.excluded[0].reasons.includes('LIVE_PROVIDER_EVIDENCE_MISSING'));

const gateway=read('supabase/functions/booking-hotel-offer-search/index.ts');
const amadeus=read('supabase/functions/booking-provider-amadeus-hotels/index.ts');
const hotelbeds=read('supabase/functions/booking-provider-hotelbeds/index.ts');
for(const source of [gateway,amadeus,hotelbeds]){
  assert.match(source,/AUTH_REQUIRED/);
  assert.match(source,/partner|required|connected/i);
  assert.match(source,/offers:\[\]/);
}
assert.match(gateway,/booking_stay_offer_readiness_v1/);
assert.match(gateway,/runtime_state==='ready'/);
assert.match(gateway,/affiliateLinksNeverBecomeOffers:true/);
assert.match(gateway,/exactCoordinatesStored:false/);
assert.match(amadeus,/AMADEUS_CLIENT_ID/);assert.match(amadeus,/AMADEUS_CLIENT_SECRET/);assert.match(amadeus,/\/v3\/shopping\/hotel-offers/);
assert.match(hotelbeds,/HOTELBEDS_API_KEY/);assert.match(hotelbeds,/HOTELBEDS_API_SECRET/);assert.match(hotelbeds,/hotel-api\/1\.0\/hotels/);

const migration=read('supabase/migrations/20260902110000_core_v4_82_136_hotel_live_offer_gateway.sql');
const rollback=read('docs/rollback/M16.5-B1-CORE-4.82.136-HOTEL-LIVE-OFFER-GATEWAY-ROLLBACK.sql');
for(const token of ['booking_stay_offer_searches','booking_stay_offer_snapshots','booking_stay_offer_readiness_v1','hotel-live-offer-v1']){assert.ok(migration.includes(token));assert.ok(rollback.includes(token));}
assert.match(migration,/Affiliate-Links|affiliateLinkCannotSupplyPrice/i);
assert.match(rollback,/removes the 4\.82\.136 live-offer gateway slice/i);
const config=read('supabase/config.toml');
for(const fn of ['booking-hotel-offer-search','booking-provider-amadeus-hotels','booking-provider-hotelbeds'])assert.match(config,new RegExp(`\\[functions\\.${fn}\\]\\r?\\nverify_jwt = true`));

const master=read('docs/modularization/M16.5-BLOCK0-TO-BLOCK5-MASTER-HANDOUT.md');
const step17=read('docs/modularization/M16.5-STEP17-E2E-MATRIX.md');
for(const provider of ['Amadeus','Hotelbeds','KAYAK','Expedia Rapid','Booking.com Demand'])assert.ok(master.includes(provider),`master plan must preserve provider order: ${provider}`);
assert.match(master,/never\s+claims\s+a\s+universal\s+best-market\s+price/i);
assert.match(step17,/m16\.5-block1-hotel-live-price-browser\.html/);
assert.match(step17,/d4efd8ac-969c-426c-b312-7ea686740ac1@100/);
assert.match(step17,/M16\.5-B1-CORE-4\.82\.136-HOTEL-LIVE-OFFER-GATEWAY-ROLLBACK\.sql/);

let bookingReads=0;
const runtimeContext={console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,Intl,RegExp,Promise,crypto:{randomUUID:()=>`hotel-${Date.now()}`},CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},LuviaTripContractV1:{getActiveTrip:()=>({id:'trip-1',title:'Berlin',startDate:'2027-06-12',endDate:'2027-06-14',destination:{name:'Berlin',cityCode:'BER',latitude:52.52,longitude:13.405},participants:[{id:'a'},{id:'b'}]})},LuviaBookingContractV1:{reads:{async searchStayOffers(input){bookingReads++;assert.equal(input.checkIn,'2027-06-12');return decision;}}}};
vm.createContext(runtimeContext);
for(const file of ['core/intelligence/intelligence-action-contract-core.js','core/intelligence/intelligence-action-ledger-core.js','core/ai/ai-action-runtime.js'])vm.runInContext(read(file),runtimeContext,{filename:file});
(async()=>{
  const result=await runtimeContext.LuviaAIActionRuntime.runMessage('Ich brauche etwas Passendes',{compiledIntent:{contractId:'intelligence.travel-orchestration.v1',status:'compiled',intents:[{domain:'booking',mode:'read',clause:'Ich brauche etwas Passendes',entityHints:{bookingType:'hotel'}}]}});
  assert.equal(bookingReads,1,'semantic booking type must reach the Hotel owner read without a keyword-only router');
  assert.equal(result.routes[0].actionId,'booking.stay.search');
  assert.equal(result.results[0].title,'1 Hotels mit belegten Livepreisen');
  assert.equal(result.results[0].evidence.bestMarketPrice,false);
  assert.equal(result.results[0].items[0].totalPrice,295);
  console.log('M16.5 Block 1 hotel live-price gateway: PASS');
  console.log('Fail-closed provider readiness, two-source like-for-like decision and semantic Chat route: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
