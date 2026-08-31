(()=>{
'use strict';

const VERSION='1.2.0';
const immutable=value=>{
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
};
const identity=()=>globalThis.LuviaIdentityContractV1||globalThis.LuviaIdentityContract;
const trip=()=>globalThis.LuviaTripContractV1||globalThis.LuviaTripContract;
const intelligence=()=>globalThis.LuviaIntelligenceContractV1||globalThis.LuviaIntelligenceContract;
let activeDraft=null;
const sharedCache=new Map();
const SHARED_CACHE_MS=120000;
const clean=value=>String(value??'').trim();
const preferenceLabels=value=>{
  if(value==null)return[];
  if(Array.isArray(value))return value.flatMap(preferenceLabels);
  if(typeof value==='object')return Object.entries(value).flatMap(([key,item])=>item===false||item==null?[]:item===true?[key]:(typeof item==='object'&&clean(item.label)?[clean(item.label)]:preferenceLabels(item)));
  return clean(value)?[clean(value)]:[];
};
function participants(){
  const rows=globalThis.LuviaJoinFlow?.snapshot?.()||[],seen=new Set();
  return rows.map(item=>({id:clean(item?.user_id||item?.userId||item?.id),name:clean(item?.display_name||item?.displayName||item?.name)||'Mitreisende Person',role:clean(item?.role)||null})).filter(item=>item.id&&!seen.has(item.id)&&seen.add(item.id));
}
function sharedBase(options={}){
  const activeTrip=options.trip||trip()?.reads?.getActiveTrip?.()||trip()?.getActiveTrip?.()||null,tripId=clean(activeTrip?.id||activeTrip?.tripId),profile=globalThis.LuviaProfileService?.snapshot?.().profile||{},ownerId=clean(profile.userId||profile.id),byId=new Map(participants().map(item=>[item.id,{...item,signals:[]}])) ;
  const owner=byId.get(ownerId)||{id:ownerId||'self',name:clean(profile.displayName||profile.firstName)||'Du',role:'owner',signals:[]};
  owner.signals=[...new Set(preferenceLabels(options.profilePreferences||identity()?.reads?.getPreferences?.('self')||{}))].slice(0,24);byId.set(owner.id,owner);
  return{tripId,byId};
}
function projection(tripId,byId,source='identity-self-plus-trip-preferences'){
  const travelers=[...byId.values()].map(item=>immutable({...item,signals:[...new Set(item.signals.map(clean).filter(Boolean))].slice(0,24)}));
  return immutable({kind:'shared-trip-preference-projection',tripId,travelers,coveredTravelers:travelers.filter(item=>item.signals.length).length,totalTravelers:travelers.length,source,persisted:false});
}
async function loadSharedGroup(options={},base=sharedBase(options)){
  const {tripId,byId}=base;if(!tripId)return projection(tripId,byId,'identity-self-fallback');
  try{
    const client=await globalThis.LuviaSupabaseService?.start?.(),response=await client?.from?.('trip_preferences')?.select?.('user_id,preference_key,preference_value,confidence,source')?.eq?.('trip_id',tripId);
    if(response?.error)throw response.error;
    for(const row of response?.data||[]){if(Number(row.confidence??1)<.5)continue;const userId=clean(row.user_id)||'trip-shared',traveler=byId.get(userId)||{id:userId,name:userId==='trip-shared'?'Eure Reise':'Mitreisende Person',role:null,signals:[]};traveler.signals.push(...preferenceLabels(row.preference_value),clean(row.preference_key));byId.set(userId,traveler)}
    const value=projection(tripId,byId);sharedCache.set(tripId,{value,loadedAt:Date.now()});globalThis.dispatchEvent?.(new CustomEvent('luvia:trip-preferences-projected',{detail:{tripId,travelerCount:value.travelers.length}}));return value;
  }catch(error){console.warn('[TripPreferenceContext] Shared preference projection unavailable',error?.code||error?.message||error);return projection(tripId,byId,'identity-self-plus-known-travelers')}
}
async function sharedGroup(options={}){
  const base=sharedBase(options),cached=base.tripId?sharedCache.get(base.tripId):null;
  if(cached&&Date.now()-cached.loadedAt<SHARED_CACHE_MS)return cached.value;
  const task=loadSharedGroup(options,base);
  if(options.fast===true){const waitMs=Math.max(80,Math.min(900,Number(options.maxWaitMs)||420));return Promise.race([task,new Promise(resolve=>setTimeout(()=>resolve(projection(base.tripId,base.byId,'identity-self-fast-projection')),waitMs))])}
  return task;
}

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
function diagnostics(){return Object.freeze({version:VERSION,identity:Boolean(identity()),trip:Boolean(trip()),intelligence:Boolean(intelligence()),sharedGroupProjection:true,fastProjection:true,sharedCacheMs:SHARED_CACHE_MS,sharedCacheEntries:sharedCache.size,persisted:false,foreignDomainMutation:false})}

['luvia:user-preferences-changed','luvia:identity.preferences.changed','luvia:profile-changed','luvia:trip.changed','luvia:trip-changed'].forEach(name=>globalThis.addEventListener?.(name,()=>sharedCache.clear()));

globalThis.LuviaTripPreferenceContextV1=Object.freeze({version:VERSION,snapshot,sharedGroup,dayGuidance,setDraft,peekDraft,consumeDraft,diagnostics});
})();
