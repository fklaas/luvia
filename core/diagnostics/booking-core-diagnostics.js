(function(){
'use strict';
const VERSION='4.75.0';
const BUILD='13.75.0';
const clean=v=>String(v??'').trim();
let lastRemoteResult=Object.freeze({state:'not_checked',checkedAt:null,ok:null});
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
 integration:window.LuviaBookingIntegration||window.LuviaBooking
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
  check('booking-contract',m.contract),check('booking-events',m.events),check('booking-integration',m.integration),
  check('provider-registry',m.registry),check('provider-capabilities',m.capabilities),check('orchestration',m.orchestration),
  check('reservation-lifecycle',m.availability&&m.create&&m.mutation&&m.mutationStatus&&m.recovery),
  check('email-booking',m.email&&m.communication),check('commercial-core',m.monetization&&m.reconciliation),
  check('user-interest-first',orchestration?.directWinsCommercialOnly===true,orchestration),
  check('route-order-server-consistent',JSON.stringify(orchestration?.routeOrder||[])===JSON.stringify(['api','external_link','affiliate','email','manual']),orchestration?.routeOrder)
 ];
 const groupsReady=groups.every(g=>g.status==='ready');
 const checksReady=checks.every(x=>x.ok);
 const healthy=groupsReady&&checksReady;
 return Object.freeze({
  version:VERSION,build:BUILD,name:'Booking Core',status:healthy?'ready':'degraded',healthy,
  providerCount:providerRows.length,providers:providerRows,groups,checks,backend:lastRemoteResult,
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
  assertions.push(check('client-server-route-order-consistent',JSON.stringify(o.ROUTE_ORDER)===JSON.stringify(['api','external_link','affiliate','email','manual']),o.policySnapshot?.()));
  const degraded=o.plan([
   {channel:'api',provider:'degraded_direct',target:'https://example.test/direct',confidence:1,signals:{connectionState:'degraded',probeState:'degraded',consecutiveProbeFailures:2,reliability:.95,directBooking:true}},
   {channel:'external_link',provider:'official_link',target:'https://example.test/book',confidence:.9,signals:{reliability:.8,uxQuality:.8}}
  ]);
  assertions.push(check('degraded-direct-falls-back',degraded.channel==='external_link',degraded.ranked));
  const stale=o.plan([
   {channel:'api',provider:'stale_direct',target:'https://example.test/direct',confidence:1,signals:{connectionState:'connected',probeState:'healthy',probeAgeSeconds:1800,availabilityRuntimeState:'ready',reliability:.95,directBooking:true}},
   {channel:'external_link',provider:'official_link',target:'https://example.test/book',confidence:.9,signals:{reliability:.8,uxQuality:.8}}
  ]);
  assertions.push(check('stale-probe-degrades-direct',stale.channel==='external_link',stale.ranked));
  const recovered=o.plan([
   {channel:'api',provider:'recovered_direct',target:'https://example.test/direct',confidence:1,signals:{connectionState:'connected',probeState:'healthy',probeAgeSeconds:30,availabilityRuntimeState:'ready',reliability:.95,directBooking:true}},
   {channel:'external_link',provider:'official_link',target:'https://example.test/book',confidence:.9,signals:{reliability:.8,uxQuality:.8}}
  ]);
  assertions.push(check('healthy-direct-recovers-priority',recovered.channel==='api',recovered.ranked));
  assertions.push(check('runtime-health-policy',o.diagnostics?.().degradedDirectFallsBack===true,o.diagnostics?.()));
  assertions.push(check('failover-policy-preserves-booking',o.failoverPolicySnapshot?.().preservesBookingIdentity===true,o.failoverPolicySnapshot?.()));
  assertions.push(check('failover-blocks-unknown-provider-outcome',o.canFailover?.({attemptStatus:'failed',state:'fallback_required',providerOutcomeKnown:false,reconciliationRequired:true,bookingStatus:'requested'})?.reason==='RECONCILIATION_REQUIRED',o.failoverPolicySnapshot?.()));
  assertions.push(check('failover-only-after-failed-attempt',o.canFailover?.({attemptStatus:'retry_scheduled',state:'retry_wait',providerOutcomeKnown:true,bookingStatus:'requested'})?.allowed===false,o.failoverPolicySnapshot?.()));
  const evidence=o.explainDecision?.(degraded); assertions.push(check('decision-evidence',Boolean(evidence?.selected&&evidence?.selectedBreakdown&&Array.isArray(evidence?.alternatives)&&evidence?.selected?.runtimeHealth),evidence));
 }
 return Object.freeze({ok:assertions.every(x=>x.ok),version:VERSION,build:BUILD,durationMs:Math.round(performance.now()-start),assertions,snapshot:snapshot()});
}
async function runRemoteTests(){
 const result={connectionReadiness:null,monetizationReadiness:null,orchestrationReadiness:null,providerRuntimeHealth:null,routeDecisionRuntime:null,routeFailoverRuntime:null,errors:[]};
 try{result.connectionReadiness=await window.LuviaBookingProviderConnections?.readiness?.()}catch(e){result.errors.push({area:'connections',message:clean(e?.message||e)})}
 try{result.monetizationReadiness=await window.LuviaBookingMonetization?.profiles?.()}catch(e){result.errors.push({area:'monetization',message:clean(e?.message||e)})}
 try{result.orchestrationReadiness=await window.LuviaBooking?.orchestrationReadiness?.()}catch(e){result.errors.push({area:'orchestration',message:clean(e?.message||e)})}
 try{result.providerRuntimeHealth=await window.LuviaBooking?.providerRuntimeHealth?.()}catch(e){result.errors.push({area:'runtime_health',message:clean(e?.message||e)})}
 try{result.routeDecisionRuntime=await window.LuviaBooking?.routeDecisionDiagnostics?.({limit:25})}catch(e){result.errors.push({area:'route_decisions',message:clean(e?.message||e)})}
 try{result.routeFailoverRuntime=await window.LuviaBooking?.routeFailoverDiagnostics?.({limit:25})}catch(e){result.errors.push({area:'route_failovers',message:clean(e?.message||e)})}
 const ok=result.errors.length===0&&Array.isArray(result.orchestrationReadiness)&&Array.isArray(result.providerRuntimeHealth);
 const healthStates=(result.providerRuntimeHealth||[]).reduce((acc,row)=>{const key=clean(row.runtime_health_state||'unknown').toLowerCase()||'unknown';acc[key]=(acc[key]||0)+1;return acc;},{});
 lastRemoteResult=Object.freeze({state:ok?'ready':'failed',checkedAt:new Date().toISOString(),ok,errorCount:result.errors.length,providerRows:Array.isArray(result.orchestrationReadiness)?result.orchestrationReadiness.length:0,runtimeHealthRows:Array.isArray(result.providerRuntimeHealth)?result.providerRuntimeHealth.length:0,healthStates:Object.freeze(healthStates),decisionRows:Array.isArray(result.routeDecisionRuntime)?result.routeDecisionRuntime.length:0,failoverRows:Array.isArray(result.routeFailoverRuntime)?result.routeFailoverRuntime.length:0});
 return Object.freeze({...result,ok,summary:lastRemoteResult});
}
async function run({remote=false}={}){const local=await runLocalTests();const remoteResult=remote?await runRemoteTests():Object.freeze({skipped:true,reason:'REMOTE_NOT_REQUESTED'});return Object.freeze({ok:local.ok&&(remoteResult.skipped||remoteResult.ok),local,remote:remoteResult});}
window.LuviaBookingCoreDiagnostics=Object.freeze({version:VERSION,build:BUILD,snapshot,componentGroups,runLocalTests,runRemoteTests,run});
})();
