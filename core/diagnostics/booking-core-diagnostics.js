(function(){
'use strict';
const VERSION='4.72.0';
const BUILD='13.72.0';
const clean=v=>String(v??'').trim();
const check=(name,ok,detail=null)=>({name,ok:Boolean(ok),detail});
const modules=()=>({
 contract:window.LuviaBookingContract,
 events:window.LuviaBookingEvents,
 capabilities:window.LuviaBookingProviderCapabilities,
 registry:window.LuviaBookingProviderRegistry,
 orchestration:window.LuviaBookingOrchestration,
 connections:window.LuviaBookingProviderConnections,
 availability:window.LuviaBookingAvailability,
 create:window.LuviaBookingReservationCreate,
 mutation:window.LuviaBookingReservationMutation,
 mutationStatus:window.LuviaBookingReservationMutationStatus,
 recovery:window.LuviaBookingReservationRecovery,
 email:window.LuviaBookingEmailV2,
 communication:window.LuviaBookingCommunication,
 monetization:window.LuviaBookingMonetization,
 reconciliation:window.LuviaBookingReconciliationProviderReturn,
 integration:window.LuviaBookingIntegration
});
function componentGroups(){
 const m=modules();
 return Object.freeze([
  {key:'foundation',label:'Foundation',components:['contract','events','integration']},
  {key:'reservation',label:'Reservation Lifecycle',components:['availability','create','mutation','mutationStatus','recovery']},
  {key:'email',label:'Email Booking',components:['email','communication']},
  {key:'providers',label:'Provider & Orchestration',components:['capabilities','registry','connections','orchestration']},
  {key:'commercial',label:'Commercial / Attribution / Commission',components:['monetization','reconciliation']}
 ].map(g=>Object.freeze({...g,status:g.components.every(k=>Boolean(m[k]))?'ready':'incomplete',available:g.components.filter(k=>Boolean(m[k])).length,total:g.components.length})));
}
function snapshot(){
 const m=modules();const groups=componentGroups();const providerRows=m.registry?.list?.()||[];const orchestration=m.orchestration?.diagnostics?.()||null;
 const checks=[
  check('booking-contract',m.contract),check('provider-registry',m.registry),check('provider-capabilities',m.capabilities),
  check('orchestration',m.orchestration),check('reservation-lifecycle',m.availability&&m.create&&m.mutation&&m.mutationStatus&&m.recovery),
  check('email-booking',m.email&&m.communication),check('commercial-core',m.monetization&&m.reconciliation),
  check('user-interest-first',orchestration?.directWinsCommercialOnly===true,orchestration)
 ];
 return Object.freeze({
  version:VERSION,build:BUILD,name:'Booking Core',status:checks.every(x=>x.ok)?'ready':'degraded',healthy:checks.every(x=>x.ok),
  providerCount:providerRows.length,providers:providerRows,groups,checks,
  policies:Object.freeze({commercialDoesNotConfirmReservation:true,commissionDoesNotConfirmReservation:true,userInterestFirst:true,noFakeProviderActivation:true,emailIsFallback:true}),
  orchestration
 });
}
async function runLocalTests(){
 const start=performance.now();const base=snapshot();const o=window.LuviaBookingOrchestration;const assertions=[...base.checks];
 if(o){
  const plan=o.plan([
   {channel:'api',provider:'healthy_direct',target:'https://example.test/direct',confidence:.8,signals:{liveAvailable:true,connectionState:'healthy',reliability:.95,directBooking:true,uxQuality:.9}},
   {channel:'affiliate',provider:'paid_route',target:'https://example.test/paid',confidence:1,signals:{commercialReady:true,reliability:.9,uxQuality:.9}}
  ]);
  assertions.push(check('commercial-never-dominates-better-direct-route',plan.provider==='healthy_direct',plan.ranked));
  const unavailable=o.plan([
   {channel:'api',provider:'down',target:'https://example.test/down',confidence:1,signals:{liveAvailable:false,connectionState:'failed',directBooking:true}},
   {channel:'email',provider:'email',target:'venue@example.com',confidence:.9,signals:{fallbackQuality:.9,reliability:.9}}
  ]);
  assertions.push(check('failed-direct-can-fall-back',unavailable.channel==='email',unavailable.ranked));
  assertions.push(check('commercial-weight-capped',o.diagnostics?.().commercialWeightCapped===8,o.diagnostics?.()));
 }
 return Object.freeze({ok:assertions.every(x=>x.ok),version:VERSION,build:BUILD,durationMs:Math.round(performance.now()-start),assertions,snapshot:snapshot()});
}
async function runRemoteTests(){
 const result={connectionReadiness:null,monetizationReadiness:null,errors:[]};
 try{result.connectionReadiness=await window.LuviaBookingProviderConnections?.readiness?.()}catch(e){result.errors.push({area:'connections',message:clean(e?.message||e)})}
 try{result.monetizationReadiness=await window.LuviaBookingMonetization?.profiles?.()}catch(e){result.errors.push({area:'monetization',message:clean(e?.message||e)})}
 return Object.freeze({...result,ok:result.errors.length===0});
}
async function run({remote=false}={}){const local=await runLocalTests();const remoteResult=remote?await runRemoteTests():{skipped:true};return Object.freeze({ok:local.ok&&(remoteResult.skipped||remoteResult.ok),local,remote:remoteResult});}
window.LuviaBookingCoreDiagnostics=Object.freeze({version:VERSION,build:BUILD,snapshot,componentGroups,runLocalTests,runRemoteTests,run});
})();
