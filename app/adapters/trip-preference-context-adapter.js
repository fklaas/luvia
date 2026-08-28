(()=>{
'use strict';

const VERSION='1.0.0';
const immutable=value=>{
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
};
const identity=()=>globalThis.LuviaIdentityContractV1||globalThis.LuviaIdentityContract;
const trip=()=>globalThis.LuviaTripContractV1||globalThis.LuviaTripContract;
const intelligence=()=>globalThis.LuviaIntelligenceContractV1||globalThis.LuviaIntelligenceContract;
let activeDraft=null;

function snapshot(){
  const activeTrip=trip()?.reads?.getActiveTrip?.()||trip()?.getActiveTrip?.()||null;
  const profilePreferences=identity()?.reads?.getPreferences?.('self')||identity()?.getPreferences?.('self')||{};
  const tripComposition=activeTrip?.composition||{};
  const resolution=intelligence()?.reads?.resolveTripPreferences?.({trip:activeTrip,profilePreferences,tripComposition})||null;
  return immutable({version:VERSION,kind:'consumer-trip-preference-context',persisted:false,trip:activeTrip,profilePreferences,tripComposition,resolution,provenance:{profile:'identity.v1',trip:'trip.v1',resolution:'intelligence.v1',foreignDomainTruth:false}});
}
function dayGuidance(dayGraph){
  const context=snapshot();
  return intelligence()?.reads?.composeDayGuidance?.({resolution:context.resolution,dayGraph,trip:context.trip})||null;
}
function setDraft(value){activeDraft=value&&typeof value==='object'?immutable(value):null;return activeDraft}
function peekDraft(){return activeDraft}
function consumeDraft(){const value=activeDraft;activeDraft=null;return value}
function diagnostics(){return Object.freeze({version:VERSION,identity:Boolean(identity()),trip:Boolean(trip()),intelligence:Boolean(intelligence()),persisted:false,foreignDomainMutation:false})}

globalThis.LuviaTripPreferenceContextV1=Object.freeze({version:VERSION,snapshot,dayGuidance,setDraft,peekDraft,consumeDraft,diagnostics});
})();
