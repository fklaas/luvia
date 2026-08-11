(function(){
'use strict';
const VERSION='1.3.0';
const ROUTE_ORDER=Object.freeze(['api','external_link','affiliate','email','manual']);
const ROUTE_SCORE=Object.freeze({api:500,external_link:350,affiliate:300,email:200,manual:0});
const USER_ACTION_CHANNELS=Object.freeze(['affiliate','external_link','manual']);
const ERROR_CLASSES=Object.freeze(['transient','permanent','user_action','unknown']);
const RUNTIME_HEALTH_ADJUSTMENT=Object.freeze({healthy:20,ready:10,unknown:-220,degraded:-300,unavailable:-500});
const clean=v=>String(v??'').trim();
const bool=v=>v===true||String(v).toLowerCase()==='true';
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
const urlOk=v=>{try{const u=new URL(clean(v));return u.protocol==='https:';}catch{return false;}};
const emailOk=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(v));
function deriveRuntimeHealth(raw={}){
 const r=obj(raw);const channel=clean(r.channel).toLowerCase();
 if(channel&&channel!=='api')return Object.freeze({state:'ready',reason:'NON_API_HANDOFF',adjustment:10,apiEligible:true,probeFresh:null});
 const connection=clean(r.connectionState||r.connection_state||'unknown').toLowerCase();
 const probe=clean(r.probeState||r.probe_state||'unknown').toLowerCase();
 const availability=clean(r.availabilityRuntimeState||r.availability_runtime_state||'unknown').toLowerCase();
 const orchestration=clean(r.orchestrationState||r.orchestration_state||'unknown').toLowerCase();
 const failures=Math.max(0,Number(r.consecutiveProbeFailures??r.consecutive_probe_failures??0)||0);
 const probeAgeSeconds=Number(r.probeAgeSeconds??r.probe_age_seconds);
 const probeFresh=Number.isFinite(probeAgeSeconds)?probeAgeSeconds<=900:null;
 if(['failed','disabled'].includes(connection)||probe==='failed'||availability==='disabled')return Object.freeze({state:'unavailable',reason:'RUNTIME_PROVIDER_UNAVAILABLE',adjustment:RUNTIME_HEALTH_ADJUSTMENT.unavailable,apiEligible:false,probeFresh});
 if(availability==='partner_required'||connection==='partner_required')return Object.freeze({state:'unavailable',reason:'PARTNER_NOT_CONNECTED',adjustment:RUNTIME_HEALTH_ADJUSTMENT.unavailable,apiEligible:false,probeFresh});
 if(orchestration==='backoff'||connection==='degraded'||probe==='degraded'||failures>=2)return Object.freeze({state:'degraded',reason:'RUNTIME_PROVIDER_DEGRADED',adjustment:RUNTIME_HEALTH_ADJUSTMENT.degraded,apiEligible:true,probeFresh});
 if(probe==='healthy'&&probeFresh===false)return Object.freeze({state:'degraded',reason:'LIVE_PROBE_STALE',adjustment:RUNTIME_HEALTH_ADJUSTMENT.degraded,apiEligible:true,probeFresh});
 if(connection==='connected'&&probe==='healthy'&&(availability==='ready'||availability==='unknown'))return Object.freeze({state:'healthy',reason:'RUNTIME_PROVIDER_HEALTHY',adjustment:RUNTIME_HEALTH_ADJUSTMENT.healthy,apiEligible:true,probeFresh});
 if(connection==='connected'&&['healthy','ready','not_applicable'].includes(probe))return Object.freeze({state:'ready',reason:'RUNTIME_PROVIDER_READY',adjustment:RUNTIME_HEALTH_ADJUSTMENT.ready,apiEligible:true,probeFresh});
 return Object.freeze({state:'unknown',reason:'RUNTIME_HEALTH_UNKNOWN',adjustment:RUNTIME_HEALTH_ADJUSTMENT.unknown,apiEligible:true,probeFresh});
}
function normalizeSignals(raw={}){
 const r=obj(raw);const runtime=deriveRuntimeHealth(r);
 return Object.freeze({
  liveAvailable:r.liveAvailable??r.live_available??null,
  connectionState:clean(r.connectionState||r.connection_state||'unknown').toLowerCase(),
  reliability:clamp(r.reliability??0.5,0,1),
  directBooking:Boolean(r.directBooking??r.direct_booking),
  uxQuality:clamp(r.uxQuality??r.ux_quality??0.5,0,1),
  fallbackQuality:clamp(r.fallbackQuality??r.fallback_quality??0.5,0,1),
  commercialReady:Boolean(r.commercialReady??r.commercial_ready),
  userPreference:clamp(r.userPreference??r.user_preference??0,-1,1),
  policyPenalty:clamp(r.policyPenalty??r.policy_penalty??0,0,100),
  probeState:clean(r.probeState||r.probe_state||'unknown').toLowerCase(),
  probeAgeSeconds:Number.isFinite(Number(r.probeAgeSeconds??r.probe_age_seconds))?Number(r.probeAgeSeconds??r.probe_age_seconds):null,
  consecutiveProbeFailures:Math.max(0,Number(r.consecutiveProbeFailures??r.consecutive_probe_failures??0)||0),
  orchestrationState:clean(r.orchestrationState||r.orchestration_state||'unknown').toLowerCase(),
  availabilityRuntimeState:clean(r.availabilityRuntimeState||r.availability_runtime_state||'unknown').toLowerCase(),
  runtimeHealth:runtime
 });
}
function signalsFromReadiness(row={}){
 const r=obj(row);return normalizeSignals({
  liveAvailable:r.availability_runtime_state==='ready'?true:(['disabled','connection_not_ready','transport_not_ready','probe_not_healthy'].includes(clean(r.availability_runtime_state).toLowerCase())?false:null),
  connectionState:r.connection_state,
  reliability:clamp((Number(r.reliability_score)||50)/100,0,1),
  directBooking:Boolean(r.supports_create_reservation)&&clean(r.luvia_access_state).toLowerCase()==='connected',
  commercialReady:Boolean(r.commercial_active),
  probeState:r.probe_state,
  probeAgeSeconds:r.probe_age_seconds,
  consecutiveProbeFailures:r.consecutive_probe_failures,
  orchestrationState:r.orchestration_state,
  availabilityRuntimeState:r.availability_runtime_state
 });
}
function normalizeCandidate(raw={}){
 const channel=ROUTE_ORDER.includes(clean(raw.channel).toLowerCase())?clean(raw.channel).toLowerCase():'manual';
 const sourceType=clean(raw.sourceType||raw.source_type||'candidate');
 const target=clean(raw.target||raw.value||raw.contactValue||raw.contact_value);
 const confidence=Math.max(0,Math.min(1,Number(raw.confidence??0)));
 const autoUsable=raw.autoUsable===undefined&&raw.auto_usable===undefined?true:bool(raw.autoUsable??raw.auto_usable);
 const active=raw.active===undefined?true:bool(raw.active);
 const structurallyValid=channel==='email'?emailOk(target):(channel==='manual'?true:urlOk(target));
 const rawSignals={...(obj(raw.signals||raw.intelligence||{})),channel};
 return Object.freeze({
  id:clean(raw.id)||null,channel,provider:clean(raw.provider).toLowerCase()||null,target:target||null,
  sourceType,sourceId:clean(raw.sourceId||raw.source_id||raw.id)||null,
  confidence:Number.isFinite(confidence)?confidence:0,autoUsable,active,structurallyValid,
  requiresUserAction:USER_ACTION_CHANNELS.includes(channel),metadata:Object.freeze(obj(raw.metadata)),
  signals:normalizeSignals(rawSignals)
 });
}
function intelligenceBreakdown(candidate){
 const c=normalizeCandidate(candidate),s=c.signals;
 const availability=s.liveAvailable===true?30:s.liveAvailable===false?-80:0;
 const connection=({healthy:24,ready:20,connected:20,degraded:-18,failed:-90,disabled:-100,unknown:0,partner_required:-60})[s.connectionState]??0;
 const reliability=Math.round((s.reliability-.5)*40);
 const direct=s.directBooking?28:0;
 const ux=Math.round((s.uxQuality-.5)*24);
 const fallback=Math.round((s.fallbackQuality-.5)*16);
 const commercial=s.commercialReady?8:0;
 const userPreference=Math.round(s.userPreference*35);
 const policy=-Math.round(s.policyPenalty);
 const runtime=c.channel==='api'?(s.runtimeHealth?.adjustment??RUNTIME_HEALTH_ADJUSTMENT.unknown):10;
 return Object.freeze({availability,connection,reliability,direct,ux,fallback,commercial,userPreference,policy,runtime,total:availability+connection+reliability+direct+ux+fallback+commercial+userPreference+policy+runtime});
}
function routeScore(candidate){
 const c=normalizeCandidate(candidate);
 if(!c.active||!c.autoUsable||!c.structurallyValid)return -1;
 if(c.channel==='api'&&(c.signals.liveAvailable===false||['failed','disabled'].includes(c.signals.connectionState)||c.signals.runtimeHealth?.state==='unavailable'))return -1;
 const b=intelligenceBreakdown(c);
 return (ROUTE_SCORE[c.channel]??-1)+Math.round(c.confidence*10)+b.total;
}
function plan(candidates=[],options={}){
 const excluded=new Set((options.excludedChannels||[]).map(x=>clean(x).toLowerCase()));
 const normalized=(Array.isArray(candidates)?candidates:[]).map(normalizeCandidate)
  .filter(c=>!excluded.has(c.channel))
  .map(c=>({route:c,score:routeScore(c),breakdown:intelligenceBreakdown(c)})).filter(x=>x.score>=0)
  .sort((a,b)=>b.score-a.score||ROUTE_ORDER.indexOf(a.route.channel)-ROUTE_ORDER.indexOf(b.route.channel));
 const selected=normalized[0]?.route||normalizeCandidate({channel:'manual',sourceType:'fallback',target:'manual',confidence:1});
 return Object.freeze({
  version:VERSION,selected,channel:selected.channel,provider:selected.provider,target:selected.target,
  requiresUserAction:selected.requiresUserAction,
  dispatchAllowed:!selected.requiresUserAction&&bool(options.userApproved),
  reason:normalized.length?'ADAPTIVE_RUNTIME_RANKED_ROUTE':'NO_AUTOMATED_ROUTE_AVAILABLE',
  policy:Object.freeze({userInterestFirst:true,commercialWeightCapped:8,commercialCannotConfirmReservation:true,runtimeHealthAdaptive:true}),
  excludedChannels:Object.freeze([...excluded]),ranked:Object.freeze(normalized)
 });
}
function explainDecision(planResult){
 const p=planResult?.selected?planResult:plan([],{});const ranked=Array.isArray(p.ranked)?p.ranked:[];const winner=ranked[0]||null;
 return Object.freeze({
  version:VERSION,policy:'user-interest-first',decisionMode:'runtime-adaptive-failover',
  selected:Object.freeze({channel:p.channel,provider:p.provider,target:p.target,reason:p.reason,requiresUserAction:p.requiresUserAction,runtimeHealth:winner?.route?.signals?.runtimeHealth||null}),
  selectedScore:winner?.score??0,selectedBreakdown:winner?.breakdown||null,
  alternatives:Object.freeze(ranked.slice(1).map(x=>Object.freeze({channel:x.route.channel,provider:x.route.provider,score:x.score,deltaToWinner:(winner?.score??x.score)-x.score,runtimeHealth:x.route.signals?.runtimeHealth||null,breakdown:x.breakdown}))),
  invariants:Object.freeze({routeOrderMatchesServer:true,commercialWeightCapped:8,userInterestFirst:true,commercialCannotConfirmReservation:true,runtimeHealthAdaptive:true})
 });
}
function policySnapshot(){return Object.freeze({version:VERSION,routeOrder:ROUTE_ORDER,routeScore:ROUTE_SCORE,runtimeHealthAdjustment:RUNTIME_HEALTH_ADJUSTMENT,commercialWeightCapped:8,userInterestFirst:true,commercialCannotConfirmReservation:true,runtimeHealthAdaptive:true,adaptiveFailover:true,decisionReplay:true,retryVsFailoverSeparated:true});}
function classifyFailure(error={}){const status=Number(error.status||error.statusCode||0);const code=clean(error.code).toUpperCase();if(error.userActionRequired===true)return'user_action';if(status===408||status===425||status===429||status>=500)return'transient';if(status>=400&&status<500)return'permanent';if(['ETIMEDOUT','ECONNRESET','EAI_AGAIN','RATE_LIMITED','TEMPORARY_UNAVAILABLE'].includes(code))return'transient';if(['INVALID_REQUEST','NOT_SUPPORTED','AUTH_INVALID','CONTACT_REJECTED'].includes(code))return'permanent';return'unknown';}
function nextAfterFailure({attemptNo=1,maxRetries=2,error={}}={}){const errorClass=ERROR_CLASSES.includes(clean(error.errorClass||error.error_class).toLowerCase())?clean(error.errorClass||error.error_class).toLowerCase():classifyFailure(error);if(errorClass==='user_action')return Object.freeze({action:'wait_for_user',errorClass,retry:false,fallback:false});if(errorClass==='transient'&&Number(attemptNo)<=Number(maxRetries)){const delaySeconds=Math.min(3600,Math.max(30,60*Math.pow(2,Math.max(0,Number(attemptNo)-1))));return Object.freeze({action:'retry_same_route',errorClass,retry:true,fallback:false,delaySeconds});}return Object.freeze({action:'fallback_next_route',errorClass,retry:false,fallback:true});}
async function execute(planResult,context={}){const p=planResult?.selected?planResult:plan(context.candidates||[],context);const route=p.selected;if(route.requiresUserAction)return Object.freeze({ok:true,kind:'user_action_required',channel:route.channel,provider:route.provider,target:route.target,requiresUserAction:true,merchantOfRecord:false});if(!bool(context.userApproved))return Object.freeze({ok:false,kind:'approval_required',channel:route.channel,provider:route.provider,target:route.target,requiresUserAction:true});const registry=context.registry||window.LuviaBookingProviderRegistry;if(!registry||typeof registry.dispatch!=='function')throw new Error('Booking-Provider-Registry nicht verfügbar.');return registry.dispatch(context.booking,{...context,providerId:route.provider||context.providerId,route});}

function failoverPolicySnapshot(){return Object.freeze({version:VERSION,maxAutomaticRetries:2,maxAutomaticFailovers:4,requiresFailedAttempt:true,blocksOnUnknownProviderOutcome:true,preservesBookingIdentity:true,neverConfirmsReservation:true,failedRouteSignatureExcluded:true});}
function canFailover({attemptStatus,state,providerOutcomeKnown=true,reconciliationRequired=false,bookingStatus='requested'}={}){const status=clean(attemptStatus).toLowerCase(),routeState=clean(state).toLowerCase(),b=clean(bookingStatus).toLowerCase();if(['confirmed','cancelled'].includes(b))return Object.freeze({allowed:false,reason:'BOOKING_TERMINAL'});if(providerOutcomeKnown===false||reconciliationRequired===true)return Object.freeze({allowed:false,reason:'RECONCILIATION_REQUIRED'});if(status!=='failed'||routeState!=='fallback_required')return Object.freeze({allowed:false,reason:'FALLBACK_NOT_REQUIRED'});return Object.freeze({allowed:true,reason:'FAILOVER_ALLOWED'});}
function diagnostics(){
 const healthy=plan([{channel:'api',provider:'direct',target:'https://example.test/api',confidence:.9,signals:{liveAvailable:true,connectionState:'connected',probeState:'healthy',probeAgeSeconds:30,availabilityRuntimeState:'ready',reliability:.95,directBooking:true,uxQuality:.9}},{channel:'affiliate',provider:'commercial',target:'https://example.test/ref',confidence:1,signals:{commercialReady:true,reliability:.8,uxQuality:.8}}]);
 const degraded=plan([{channel:'api',provider:'degraded',target:'https://example.test/api',confidence:1,signals:{connectionState:'degraded',probeState:'degraded',consecutiveProbeFailures:2,reliability:.9,directBooking:true}},{channel:'external_link',provider:'official',target:'https://example.test/book',confidence:.9,signals:{reliability:.8,uxQuality:.8}}]);
 return Object.freeze({version:VERSION,status:'ready',ranking:'user-interest-first',decisionMode:'runtime-adaptive-failover',commercialWeightCapped:8,directWinsCommercialOnly:healthy.provider==='direct',degradedDirectFallsBack:degraded.channel==='external_link',adaptiveFailover:true,decisionReplay:true,retryVsFailoverSeparated:true,routeOrder:ROUTE_ORDER,routeScore:ROUTE_SCORE,runtimeHealthAdjustment:RUNTIME_HEALTH_ADJUSTMENT,policy:healthy.policy,serverPolicyExpected:Object.freeze({api:500,external_link:350,affiliate:300,email:200,manual:0})});
}
window.LuviaBookingOrchestration=Object.freeze({version:VERSION,ROUTE_ORDER,ROUTE_SCORE,RUNTIME_HEALTH_ADJUSTMENT,USER_ACTION_CHANNELS,ERROR_CLASSES,deriveRuntimeHealth,signalsFromReadiness,normalizeCandidate,normalizeSignals,intelligenceBreakdown,routeScore,plan,explainDecision,policySnapshot,failoverPolicySnapshot,canFailover,classifyFailure,nextAfterFailure,execute,diagnostics});
})();
