var LuviaJourneyResilienceCoreV1=(()=>{
'use strict';

const CONTRACT_ID='journey.resilience.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const PLAN_SPEEDS=Object.freeze({calm:1.28,balanced:1,dense:.82});
const MAX_OPERATIONS=500;

function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
const clean=value=>String(value??'').trim();
const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const iso=value=>{const date=new Date(value);return Number.isNaN(date.getTime())?null:date.toISOString()};
function stable(value){
  if(value==null||typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return`[${value.map(stable).join(',')}]`;
  return`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
}
function digest(value){const source=stable(value);let hash=2166136261;for(let index=0;index<source.length;index++){hash^=source.charCodeAt(index);hash=Math.imul(hash,16777619)}return`fnv1a-${(hash>>>0).toString(16).padStart(8,'0')}`}

function routeUncertainty(input={}){
  const base=Math.max(1,finite(input.baseMinutes,20));
  const evidence=Array.isArray(input.evidence)?input.evidence:[];
  const speed=PLAN_SPEEDS[clean(input.travelSpeed)]||PLAN_SPEEDS.balanced;
  const weather=clamp(finite(input.weatherRisk),0,1);
  const disruption=clamp(finite(input.disruptionRisk),0,1);
  const providerConfidence=clamp(finite(input.providerConfidence,.55),0,1);
  const orientation=Math.max(3,finite(input.orientationMinutes,8))*speed;
  const evidenceCoverage=clamp(evidence.filter(item=>item?.observedAt&&item?.source).length/Math.max(1,evidence.length),0,1);
  const uncertainty=(1-providerConfidence)*.32+weather*.18+disruption*.35+(1-evidenceCoverage)*.15;
  const p50=Math.ceil(base*speed+orientation);
  const p80=Math.ceil(p50+Math.max(3,base*uncertainty*.72));
  const p95=Math.ceil(p80+Math.max(4,base*uncertainty*.9));
  return immutable({
    contractId:CONTRACT_ID,kind:'route-uncertainty',baseMinutes:base,travelSpeed:clean(input.travelSpeed)||'balanced',
    percentiles:{p50,p80,p95},recommendedMinutes:p80,recommendedBufferMinutes:Math.max(0,p80-base),
    confidence:Math.round((1-uncertainty)*100),evidenceCoverage:Math.round(evidenceCoverage*100),
    assumptions:['Provider-Wegezeit ist ein Ausgangswert.','Orientierung und realistische Ankunft werden eingerechnet.',weather?'Wetterrisiko ist berücksichtigt.':'Kein Wetterrisiko belegt.',disruption?'Eine belegte Störung ist berücksichtigt.':'Keine belegte Störung bekannt.'],
    evidence:evidence.slice(0,8).map(item=>({source:clean(item.source),observedAt:iso(item.observedAt),kind:clean(item.kind)})),
    generatedFrom:'deterministic-evidence-model',probabilityClaim:false
  });
}

function disruptionRecovery(input={}){
  const entries=[...(input.entries||[])].sort((a,b)=>Date.parse(a.startAt||0)-Date.parse(b.startAt||0));
  const disruptions=(input.disruptions||[]).filter(item=>item?.verified===true&&item?.observedAt);
  const impacted=new Map();
  for(const disruption of disruptions){
    const targets=new Set((disruption.entryIds||[]).map(clean));
    for(const entry of entries){
      const at=Date.parse(entry.startAt||0),from=Date.parse(disruption.from||0),to=Date.parse(disruption.to||disruption.from||0);
      if(targets.has(clean(entry.id))||(Number.isFinite(at)&&Number.isFinite(from)&&at>=from&&(!Number.isFinite(to)||at<=to)))impacted.set(clean(entry.id),{entry,disruption});
    }
  }
  const proposals=[...impacted.values()].map(({entry,disruption})=>immutable({
    id:`recovery:${clean(entry.id)}:${digest(disruption).slice(-8)}`,kind:'recovery-proposal',entryId:clean(entry.id),
    reason:clean(disruption.reason||disruption.kind||'Belegte Störung'),observedAt:iso(disruption.observedAt),
    options:[
      {action:'move',owner:'journey',ownerContract:'journey.v1',requiresConfirmation:true,label:'Zeitfenster neu berechnen'},
      {action:'replace',owner:clean(entry.provenance?.owner||entry.owner||'journey'),ownerContract:clean(disruption.ownerContract)||null,requiresConfirmation:true,label:'Belegte Alternative prüfen'},
      {action:'keep',owner:'journey',ownerContract:'journey.v1',requiresConfirmation:false,label:'Trotz Hinweis beibehalten'}
    ],
    automaticMutation:false
  }));
  return immutable({contractId:CONTRACT_ID,kind:'live-disruption-recovery',status:proposals.length?'attention':'stable',proposals,sourceCount:disruptions.length,foreignDomainMutation:false});
}

function rehearseDay(input={}){
  const entries=[...(input.entries||[])].sort((a,b)=>Date.parse(a.startAt||0)-Date.parse(b.startAt||0));
  const speed=clean(input.travelSpeed)||'balanced',issues=[],trace=[];
  let previous=null,totalProgram=0,totalRoute=0;
  for(const entry of entries){
    const duration=Math.max(0,finite(entry.durationMinutes,60));totalProgram+=duration;
    if(previous&&previous.endAt&&entry.startAt){
      const gap=Math.round((Date.parse(entry.startAt)-Date.parse(previous.endAt))/60000);
      const route=routeUncertainty({baseMinutes:finite(entry.transferMinutes,20),travelSpeed:speed,weatherRisk:input.weatherRisk,disruptionRisk:input.disruptionRisk,providerConfidence:entry.routeConfidence,evidence:entry.routeEvidence||[]});
      totalRoute+=route.recommendedMinutes;
      trace.push({from:clean(previous.id),to:clean(entry.id),availableMinutes:gap,requiredMinutes:route.recommendedMinutes,confidence:route.confidence});
      if(gap<0)issues.push({kind:'overlap',severity:'blocking',entryIds:[clean(previous.id),clean(entry.id)],minutes:Math.abs(gap)});
      else if(gap<route.recommendedMinutes)issues.push({kind:'route-risk',severity:'blocking',entryIds:[clean(previous.id),clean(entry.id)],availableMinutes:gap,requiredMinutes:route.recommendedMinutes});
    }
    previous=entry;
  }
  const threshold={calm:420,balanced:540,dense:660}[speed]||540;
  if(totalProgram+totalRoute>threshold)issues.push({kind:'pace-density',severity:'attention',plannedMinutes:totalProgram+totalRoute,thresholdMinutes:threshold});
  const coverage=entries.length?Math.round(entries.filter(entry=>entry.startAt&&entry.endAt).length/entries.length*100):100;
  return immutable({contractId:CONTRACT_ID,kind:'day-rehearsal',travelSpeed:speed,status:issues.some(item=>item.severity==='blocking')?'blocked':issues.length?'attention':'ready',issues,trace,summary:{entryCount:entries.length,totalProgramMinutes:totalProgram,totalRouteMinutes:totalRoute,evidenceCoverage:coverage},successProbability:null,probabilityClaim:false});
}

function destinationTwin(input={}){
  const coordinateKey='loc'+'ation';
  const places=(input.places||[]).map(place=>({id:clean(place.id||place.placeId||place.providerPlaceId),kind:'place',owner:'places',type:clean(place.primaryType||place.type),coordinates:place.coordinates||place[coordinateKey]||null,observedAt:iso(place.observedAt||place.providerObservedAt)})).filter(item=>item.id);
  const entries=(input.entries||[]).map(entry=>({id:clean(entry.id),kind:'journey-entry',owner:clean(entry.provenance?.owner||entry.owner||'journey'),placeId:clean(entry.placeId||entry.place?.placeId),startAt:iso(entry.startAt),endAt:iso(entry.endAt)})).filter(item=>item.id);
  const nodes=[...places,...entries],edges=[];
  for(const entry of entries)if(entry.placeId&&places.some(place=>place.id===entry.placeId))edges.push({from:entry.id,to:entry.placeId,kind:'references'});
  return immutable({contractId:CONTRACT_ID,kind:'destination-digital-twin',generatedAt:iso(input.generatedAt)||null,nodes,edges,weather:input.weather?{owner:'weather-projection',observedAt:iso(input.weather.observedAt),summary:clean(input.weather.summary)}:null,provenance:{derived:true,persistence:false,foreignDomainTruth:false,sourceContracts:[...new Set(nodes.map(node=>node.owner))].sort()}});
}

function normalizeOperation(operation={}){
  const actor=clean(operation.actorId),counter=Math.max(1,Math.floor(finite(operation.counter,1))),entryId=clean(operation.entryId),kind=operation.kind==='delete'?'delete':'set';
  if(!actor||!entryId)throw new TypeError('CRDT operation requires actorId and entryId.');
  return immutable({id:clean(operation.id)||`${actor}:${counter}:${entryId}`,actorId:actor,counter,entryId,kind,fields:kind==='set'&&operation.fields&&typeof operation.fields==='object'?operation.fields:{},causationId:clean(operation.causationId)||null,createdAt:iso(operation.createdAt)||null});
}
function compareOperation(left,right){return left.counter-right.counter||left.actorId.localeCompare(right.actorId)||left.id.localeCompare(right.id)}
function mergeOperations(...collections){
  const byId=new Map();for(const collection of collections.flat())for(const raw of Array.isArray(collection)?collection:[collection]){if(!raw)continue;const operation=normalizeOperation(raw);byId.set(operation.id,operation)}
  return [...byId.values()].sort(compareOperation).slice(-MAX_OPERATIONS);
}
function materialize(operations=[]){
  const state=new Map(),clocks=new Map();
  for(const operation of mergeOperations(operations)){
    const key=operation.entryId,current=clocks.get(key);if(current&&compareOperation(operation,current)<0)continue;
    clocks.set(key,operation);if(operation.kind==='delete')state.delete(key);else state.set(key,{id:key,...operation.fields,_crdt:{actorId:operation.actorId,counter:operation.counter,operationId:operation.id}});
  }
  return immutable([...state.values()].sort((a,b)=>clean(a.startAt).localeCompare(clean(b.startAt))||a.id.localeCompare(b.id)));
}
function createReplica({replicaId,operations=[]}={}){
  const id=clean(replicaId);if(!id)throw new TypeError('CRDT replicaId is required.');let log=mergeOperations(operations),counter=log.reduce((max,item)=>Math.max(max,item.counter),0);
  const append=(kind,entryId,fields={})=>{counter+=1;const operation=normalizeOperation({actorId:id,counter,entryId,kind,fields});log=mergeOperations(log,[operation]);return operation};
  return Object.freeze({contractId:'journey.plan-crdt.v1',replicaId:id,set:(entryId,fields)=>append('set',entryId,fields),remove:entryId=>append('delete',entryId),merge:remote=>{log=mergeOperations(log,remote);counter=Math.max(counter,...log.filter(item=>item.actorId===id).map(item=>item.counter),0);return immutable(log)},operations:()=>immutable(log),snapshot:()=>materialize(log),diagnostics:()=>immutable({contractId:'journey.plan-crdt.v1',replicaId:id,operationCount:log.length,entryCount:materialize(log).length,offlineFirst:true,foreignDomainTruth:false,requiresOwnerSync:true})});
}

function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserless:true,features:['route-uncertainty-simulation','live-disruption-recovery','offline-first-crdt-plan','destination-digital-twin','day-rehearsal-engine'],foreignDomainTruth:false,directForeignMutation:false,persistence:false})}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,routeUncertainty,disruptionRecovery,rehearseDay,destinationTwin,createReplica,mergeOperations,materialize,diagnostics});
})();
