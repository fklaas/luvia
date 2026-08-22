(function(){
'use strict';
const VERSION='4.19.1';
const metrics={registered:0,updated:0,removed:0,normalized:0,hydrated:0,imports:0,searches:0,invalid:0,lastError:null};
const D=()=>window.LuviaPlaceDomain,R=()=>window.LuviaPlaceRegistry;
const state=LuviaPlaceStateCoreV1.create({validate:place=>D().validate(place),normalize:(place,options)=>D().normalize(place,options)});
function put(place){try{const value=state.register(place);metrics.registered=state.size();return value;}catch(error){if(error?.code==='INVALID_PLACE')metrics.invalid++;throw error;}}
function normalizePlace(sourceData,options={}){const type=options.primaryType||sourceData?.primaryType||sourceData?.place?.primary_type||'custom',adapter=R().getAdapter(type);if(!adapter)throw new Error('Kein Adapter für '+type);const place=adapter.normalize(sourceData,options);metrics.normalized++;return place;}
function registerPlace(input,options={}){return put(options.normalized?input:normalizePlace(input,options));}
function updatePlace(id,patch={}){try{const next=state.update(id,patch);if(next)metrics.updated++;return next;}catch(error){if(error?.code==='INVALID_PLACE')metrics.invalid++;throw error;}}
function updateLifecycle(id,value){return updatePlace(id,{lifecycle:value});}
function removePlace(id){const result=state.remove(id);if(result)metrics.removed++;metrics.registered=state.size();return result;}
function getPlaces(filters={}){return state.list(filters);}
async function hydrateType(type,context={}){const adapter=R().getAdapter(type);if(!adapter?.load)return[];const items=await adapter.load(context);items.forEach(put);metrics.hydrated+=items.length;return items;}
async function hydrateAll(context={}){const settled=await Promise.allSettled(D().TYPES.map(type=>hydrateType(type,context)));return settled.flatMap(x=>x.status==='fulfilled'?x.value:[]);}
async function init(context={}){const tripId=context.tripId||(window.LuviaTripContractV1||window.LuviaTripContract)?.getActiveTrip?.()?.tripId||null;try{await hydrateAll({tripId});}catch(error){metrics.lastError=error.message;}return diagnostics();}
async function search(options={}){metrics.searches++;return R().getAdapter(options.type||options.primaryType||'custom')?.search(options);}
async function importProviderPlace(providerPlaceId,options={}){metrics.imports++;const response=await R().getAdapter(options.type||options.primaryType||'custom')?.import(providerPlaceId,options);const entity=response?.data?.entity||response?.data;if(entity?.place)put(normalizePlace(entity,{primaryType:entity.place.primary_type||options.type}));return response;}
async function updateLifecycleCloud(tripPlaceId,value,patch={},options={}){const response=await window.LuviaPlaceEntities.updateLifecycle(tripPlaceId,value,patch,options);const entity=response?.data;if(entity?.place)put(normalizePlace(entity,{primaryType:entity.place.primary_type}));return response;}
function diagnostics(){return{version:VERSION,status:'ready',placeCount:state.size(),metrics:{...metrics},registry:R().diagnostics(),cloud:{authoritative:true,service:Boolean(window.LuviaPlaceEntities)},restaurantCompatibility:{active:false,mapping:'restaurant module → universal place API → optional restaurant extension'}};}
window.LuviaPlaceCore=window.LuviaPlacesCore=Object.freeze({version:VERSION,init,getPlace:id=>state.get(id),getPlaces,registerPlace,updatePlace,updateLifecycle,removePlace,normalizePlace,getPlaceTypes:()=>R().getTypes(),getPlaceRoles:id=>state.get(id)?.roles||[],hasRole:(id,role)=>state.get(id)?.roles?.includes(role)||false,getCapabilities:id=>state.get(id)?.capabilities||[],hydrateType,hydrateAll,search,importProviderPlace,updateLifecycleCloud,recordVisit:(placeId,patch={})=>window.LuviaPresenceVisitCore?.confirmVisit?.(placeId,patch),diagnostics});
})();
