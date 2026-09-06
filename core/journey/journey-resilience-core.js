var LuviaJourneyResilienceCoreV1=(()=>{
'use strict';

const CONTRACT_ID='journey.resilience.v1';
const VERSION='1';
const RUNTIME_VERSION='1.1.0-evidence-freshness-buffer';
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

const ROUTE_MODES=Object.freeze({walking:'zu Fuß',cycling:'mit dem Fahrrad',driving:'mit dem Auto',transit:'mit Bus und Bahn'});
function evidenceKinds(item={}){return[clean(item.kind),clean(item.type),...(Array.isArray(item.supports)?item.supports.map(clean):[])].join(' ').toLowerCase()}
function normalizeRouteEvidence(raw=[],now=new Date()){
  const nowMs=now.getTime();
  return raw.slice(0,8).map(item=>{
    const observedAt=iso(item?.observedAt),observedMs=Date.parse(observedAt||''),ageMinutes=Number.isFinite(nowMs)&&Number.isFinite(observedMs)?Math.max(0,Math.round((nowMs-observedMs)/60000)):null;
    const freshness=ageMinutes==null?'unknown':ageMinutes<=15?'live':ageMinutes<=180?'recent':ageMinutes<=1440?'aged':'stale';
    const liveStatus=item?.live===true&&freshness==='live'?'live':'unknown';
    return{source:clean(item?.source)||'Unbekannte Quelle',observedAt,kind:clean(item?.kind)||'route',ageMinutes,freshness,liveStatus,supports:Array.isArray(item?.supports)?item.supports.map(clean).filter(Boolean).slice(0,6):[]};
  });
}
function hasEvidence(evidence,kind){return evidence.some(item=>item.observedAt&&evidenceKinds(item).includes(kind))}
function ageLabel(item){if(!item||item.ageMinutes==null)return'Alter unbekannt';if(item.ageMinutes<1)return'gerade eben beobachtet';if(item.ageMinutes<60)return`vor ${item.ageMinutes} Min. beobachtet`;const hours=Math.round(item.ageMinutes/60);if(hours<48)return`vor ${hours} Std. beobachtet`;return`vor ${Math.round(hours/24)} Tagen beobachtet`}

function routeUncertainty(input={}){
  const base=Math.max(1,finite(input.baseMinutes,20));
  const now=new Date(input.now||Date.now()),evidence=normalizeRouteEvidence(Array.isArray(input.evidence)?input.evidence:[],now);
  const speed=PLAN_SPEEDS[clean(input.travelSpeed)]||PLAN_SPEEDS.balanced;
  const routeMode=ROUTE_MODES[clean(input.routeMode)]?clean(input.routeMode):'walking';
  const weather=hasEvidence(evidence,'weather')?clamp(finite(input.weatherRisk),0,1):0;
  const disruption=hasEvidence(evidence,'disruption')||hasEvidence(evidence,'traffic')?clamp(finite(input.disruptionRisk),0,1):0;
  const season=hasEvidence(evidence,'season')?clamp(finite(input.seasonRisk),0,1):0;
  const timeOfDay=hasEvidence(evidence,'time-of-day')?clamp(finite(input.timeOfDayRisk),0,1):0;
  const providerConfidence=clamp(finite(input.providerConfidence,.55),0,1);
  const orientation=Math.max(3,finite(input.orientationMinutes,8))*speed;
  const evidenceCoverage=clamp(evidence.filter(item=>item.observedAt&&item.source!=='Unbekannte Quelle').length/Math.max(1,evidence.length),0,1);
  const uncertainty=clamp((1-providerConfidence)*.28+weather*.16+disruption*.3+season*.08+timeOfDay*.08+(1-evidenceCoverage)*.1,.08,.92);
  const p50=Math.ceil(base*speed+orientation);
  const p80=Math.ceil(p50+Math.max(3,base*uncertainty*.72));
  const p95=Math.ceil(p80+Math.max(4,base*uncertainty*.9));
  const latest=evidence.filter(item=>item.observedAt).sort((left,right)=>Date.parse(right.observedAt)-Date.parse(left.observedAt))[0]||null,sources=[...new Set(evidence.map(item=>item.source).filter(Boolean))],liveStatus=evidence.some(item=>item.liveStatus==='live')?'live':'unknown';
  const ignored=[];if(finite(input.weatherRisk)>0&&!weather)ignored.push('Wetter');if(finite(input.disruptionRisk)>0&&!disruption)ignored.push('Verkehr oder Störung');if(finite(input.seasonRisk)>0&&!season)ignored.push('Saison');if(finite(input.timeOfDayRisk)>0&&!timeOfDay)ignored.push('Tageszeit');
  const evidenceSignature=digest({baseMinutes:base,routeMode,evidence:evidence.map(item=>({source:item.source,observedAt:item.observedAt,kind:item.kind,supports:item.supports}))});
  return immutable({
    contractId:CONTRACT_ID,kind:'route-uncertainty',baseMinutes:base,travelSpeed:clean(input.travelSpeed)||'balanced',routeMode,routeModeLabel:ROUTE_MODES[routeMode],
    percentiles:{p50,p80,p95},recommendedMinutes:p80,recommendedBufferMinutes:Math.max(0,p80-base),
    range:{expectedMinutes:p50,lowMinutes:Math.max(base,p50-2),highMinutes:p95},
    confidence:Math.round((1-uncertainty)*100),evidenceCoverage:Math.round(evidenceCoverage*100),
    sourceSummary:sources.join(', ')||'Keine Routenquelle belegt',observedAt:latest?.observedAt||null,dataAgeLabel:ageLabel(latest),liveStatus,liveStatusLabel:liveStatus==='live'?'Live-Daten belegt':'Live-Lage unbekannt',
    assumptions:['Die angegebene Wegezeit ist der Ausgangswert.','Orientierung und eine realistische Ankunft werden eingerechnet.',weather?'Belegtes Wetter ist berücksichtigt.':'Kein aktueller Wetterbeleg berücksichtigt.',disruption?'Belegte Verkehrs- oder Störungsdaten sind berücksichtigt.':'Aktuelle Verkehrs- und Störungslage unbekannt.',...(ignored.length?[`${ignored.join(', ')} ohne passenden Beleg nicht eingerechnet.`]:[])],
    evidence,evidenceSignature,ignoredUnverifiedFactors:ignored,
    generatedFrom:'deterministic-evidence-model',probabilityClaim:false,automaticMutation:false
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
