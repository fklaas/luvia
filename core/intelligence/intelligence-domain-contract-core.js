var LuviaIntelligenceDomainContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='intelligence.v1';
const VERSION='1';
const RUNTIME_VERSION='1.4.0-lossless-trip-payload';
const MODES=Object.freeze({READ:'READ',DRAFT:'DRAFT',EXECUTE:'EXECUTE'});
const SIGNAL_STATUSES=Object.freeze(['inferred','confirmed','dismissed']);
const PROPOSAL_STATUSES=Object.freeze(['draft','accepted','rejected','executed','failed']);
const BLOCKED_KEYS=/^(email|phone|telephone|password|token|access_token|refresh_token|authorization|apikey|api_key|booking_number|reservation_number|payment|card|iban|address_exact)$/i;
const LIMITS=Object.freeze({maxDepth:7,maxArray:50,maxString:1200});

const MODEL_TIERS=Object.freeze({
  fast:Object.freeze({id:'fast',alias:'Luna',purpose:'schnelle Klassifikation und Kurzaufgaben'}),
  default:Object.freeze({id:'default',alias:'Terra',purpose:'reguläres Luvia-Denken'}),
  deep:Object.freeze({id:'deep',alias:'Sol',purpose:'komplexe Reiseoptimierung und tiefes Planen'})
});

function clone(value){
  if(value==null||typeof value!=='object')return value;
  if(value instanceof Error)return value;
  if(Array.isArray(value))return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clone(item)]));
}
function immutable(value){
  if(value==null||typeof value!=='object'||value instanceof Error)return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function immutableDefinition(value){return immutable(clone(value))}
function contractError(code,message,extra={}){
  const error=new Error(message);error.code=code;Object.assign(error,extra);return error;
}
function text(value,fallback=''){return String(value??fallback).trim()}
function list(value,max=20){return[...new Set((Array.isArray(value)?value:[]).map(item=>text(item)).filter(Boolean))].slice(0,max)}
function number(value,min,max,fallback=0){const parsed=Number(value);return Number.isFinite(parsed)?Math.max(min,Math.min(max,parsed)):fallback}

const CAPABILITIES=Object.freeze([
  {id:'brain.ask',tier:'default',mode:'READ',schema:'assistant_response',tools:['trip.current','preferences.current','travel.context','journey.context','journey.evidence','memory.signals'],timeoutMs:30000,cacheTtlMs:0,description:'Allgemeines kontextbezogenes Luvia-Gespräch.'},
  {id:'planning.dialogue',tier:'default',mode:'READ',schema:'planning_dialogue',tools:[],timeoutMs:30000,cacheTtlMs:0,description:'Zerlegt einen Planungswunsch, stellt höchstens eine gezielte Rückfrage und startet keine Recherche.'},
  {id:'trip.compose',tier:'deep',mode:'READ',schema:'trip_itinerary',tools:['trip.current','preferences.current','travel.context'],timeoutMs:60000,cacheTtlMs:0,description:'Komponiert aus einem semantischen Reiseauftrag und bereits belegten Places einen vollständigen, bestätigungspflichtigen Tagesentwurf.'},
  {id:'trip.compose-day-repair',tier:'default',mode:'READ',schema:'trip_day_repair',tools:['trip.current','preferences.current','travel.context'],timeoutMs:45000,cacheTtlMs:0,description:'Repariert ausschließlich fehlende oder unvollständige Reisetage und bewahrt den bereits gültigen Gesamtentwurf.'},
  {id:'trip.audit',tier:'default',mode:'READ',schema:'trip_quality_audit',tools:[],timeoutMs:45000,cacheTtlMs:0,description:'Prüft einen vollständigen Reiseentwurf unabhängig auf Logik, Abdeckung, Belastung, räumliche Kohärenz und unbelegte Aussagen.'},
  {id:'discovery.web-research',tier:'fast',mode:'READ',schema:'experience_research',tools:[],timeoutMs:40000,cacheTtlMs:0,description:'Budgetierte Webrecherche für offene Erlebniswünsche; Quellenhinweise ohne Place- oder Buchungsbehauptung.'},
  {id:'discovery.plan',tier:'fast',mode:'READ',schema:'discovery_plan',tools:['trip.current','preferences.current','travel.context','memory.signals'],timeoutMs:30000,cacheTtlMs:300000,description:'Erzeugt kontrollierte Suchstrategien aus Guided Discovery.'},
  {id:'discovery.rank',tier:'default',mode:'READ',schema:'candidate_ranking',tools:['trip.current','preferences.current','travel.context','memory.signals'],timeoutMs:20000,cacheTtlMs:180000,description:'Ordnet bereits fachlich validierte Providerkandidaten persönlich.'},
  {id:'dashboard.brief',tier:'default',mode:'READ',schema:'dashboard_brief',tools:['trip.current','preferences.current','travel.context','journey.context','journey.events','journey.reservations','journey.evidence','schedule.current','today.current','recommendations.current','memory.signals'],timeoutMs:20000,cacheTtlMs:300000,description:'Erstellt ein ehrliches Reisebriefing für das Dashboard.'},
  {id:'timeline.propose',tier:'deep',mode:'DRAFT',schema:'timeline_proposal',tools:['trip.current','preferences.current','travel.context','journey.context','journey.events','journey.reservations','journey.evidence','schedule.current','today.current','places.saved','memory.signals'],timeoutMs:20000,cacheTtlMs:0,description:'Bereitet bestätigungspflichtige Timeline-Änderungen vor.'},
  {id:'memory.extract',tier:'fast',mode:'DRAFT',schema:'memory_signals',tools:['preferences.current'],timeoutMs:20000,cacheTtlMs:0,description:'Leitet belegte Lernsignale aus Nutzerentscheidungen ab.'},
  {id:'memory.compose',tier:'default',mode:'DRAFT',schema:'memory_composition',tools:[],timeoutMs:20000,cacheTtlMs:0,description:'Erzeugt aus Reisebildern und belegtem Kontext gemeinsam Titel, Erinnerungstext, Caption und Highlights.'},
  {id:'text.summarize',tier:'fast',mode:'READ',schema:'summary',tools:[],timeoutMs:20000,cacheTtlMs:600000,description:'Kurze, kontrollierte Zusammenfassungen.'}
].map(immutableDefinition));

const DOMAINS=Object.freeze([
  {id:'trip',description:'Reiseauftrag und vollständige, noch ungespeicherte Reiseentwürfe.',capabilities:['planning.dialogue','trip.compose','trip.compose-day-repair','trip.audit'],tools:['trip.current','preferences.current','travel.context'],events:[],contracts:{sourceContract:'trip.v1',owner:'trip',placesRemainAuthoritative:true,writesRequireConfirmation:true}},
  {id:'journey',description:'Reservierter Cross-Domain-Aggregator als read-only Intelligence-Quelle.',capabilities:['dashboard.brief','brain.ask','timeline.propose'],tools:['journey.context','journey.events','journey.reservations'],events:['luvia:journey-context-changed'],contracts:{sourceContract:'journey.projection',owner:'journey',mutationDelegated:true}},
  {id:'places',description:'Places-Projektionen für Suche und Ranking.',capabilities:['discovery.plan','discovery.web-research','discovery.rank'],tools:['journey.context','preferences.current','places.saved'],events:[],contracts:{sourceContract:'places.v1',owner:'places',placeContractsRequired:true,providerFactsAuthoritative:true}},
  {id:'move',description:'Mobilitätsplanung mit Provider-Fakten und ohne Timeline-Ownership.',capabilities:['discovery.plan','discovery.rank'],tools:['journey.context','preferences.current'],events:[],contracts:{sourceContract:'places.v1',owner:'places',timelineForbidden:true,providerFactsAuthoritative:true}},
  {id:'timeline',description:'Proposal-only Planung; finale Mutation bleibt beim Journey/Timeline Owner.',capabilities:['timeline.propose'],tools:['journey.context','journey.events'],events:[],contracts:{sourceContract:'journey.projection',owner:'journey',writesRequireConfirmation:true,mutationDelegated:true}},
  {id:'future',description:'Expliziter Erweiterungspunkt.',capabilities:[],tools:['journey.context'],events:[],contracts:{registrationRequired:true}}
].map(immutableDefinition));

const TOOLS=Object.freeze([
  {name:'trip.current',domain:'trip',mode:'READ',trust:'owner-contract',sourceContract:'trip.v1',owner:'trip',description:'Aktive Reise ohne private Kontakt- oder Buchungsdaten.'},
  {name:'preferences.current',domain:'identity',mode:'READ',trust:'owner-contract',sourceContract:'identity.v1',owner:'identity',description:'Ausdrücklich bestätigte globale Nutzerpräferenzen.'},
  {name:'travel.context',domain:'trip',mode:'READ',trust:'projection',sourceContract:'trip.context.v1',owner:'trip',description:'Zeit, Reisephase und optional grober Standort.'},
  {name:'places.saved',domain:'places',mode:'READ',trust:'owner-contract',sourceContract:'places.v1',owner:'places',description:'Bereits gespeicherte Reiseorte als Evidence.'},
  {name:'schedule.current',domain:'journey',mode:'READ',trust:'projection',sourceContract:'journey.projection',owner:'journey',description:'Aktuelle geplante Ereignisse.'},
  {name:'today.current',domain:'journey',mode:'READ',trust:'projection',sourceContract:'journey.projection',owner:'journey',description:'Aktueller Tageskontext, freie Fenster und Konflikte.'},
  {name:'recommendations.current',domain:'intelligence',mode:'READ',trust:'owner-state',sourceContract:'intelligence.v1',owner:'intelligence',description:'Bestehende Empfehlungen und Entscheidungen.'},
  {name:'journey.context',domain:'journey',mode:'READ',trust:'cloud-projection',sourceContract:'journey.projection',owner:'journey',description:'Cloud-autoritativer Journey Context als fremde read-only Projektion.'},
  {name:'journey.events',domain:'journey',mode:'READ',trust:'cloud-projection',sourceContract:'journey.projection',owner:'journey',description:'Aufgelöste geplante und historische Reiseereignisse.'},
  {name:'journey.reservations',domain:'journey',mode:'READ',trust:'cloud-projection',sourceContract:'journey.projection',owner:'journey',description:'Aufgelöste Reservierungsprojektionen der aktiven Reise.'},
  {name:'journey.evidence',domain:'journey',mode:'READ',trust:'cloud-projection',sourceContract:'journey.projection',owner:'journey',description:'Belegbare Fakten und Quellen des Journey Aggregators.'},
  {name:'memory.signals',domain:'intelligence',mode:'READ',trust:'owner-state',sourceContract:'intelligence.v1',owner:'intelligence',description:'Belegte, getrennt vom Profil gespeicherte Lernsignale.'}
].map(immutableDefinition));

// Trip workflows carry an explicitly bounded catalogue. Never silently cut a
// confirmed trip or its reserve to a generic UI-preview array length.
function sanitizeTripPayload(value,depth=0,seen=new WeakSet()){
  if(value==null||typeof value==='boolean'||typeof value==='number')return value;
  if(typeof value==='string')return value.slice(0,4000);
  if(depth>18)throw contractError('AI_PAYLOAD_DEPTH_EXCEEDED','Die Reiseanfrage ist zu tief verschachtelt.');
  if(typeof value!=='object')return undefined;
  if(seen.has(value))throw contractError('AI_PAYLOAD_CIRCULAR','Die Reiseanfrage enthält einen Kreisverweis.');
  seen.add(value);let result;
  if(Array.isArray(value)){
    if(value.length>4000)throw contractError('AI_PAYLOAD_ARRAY_EXCEEDED','Der Reiseabschnitt muss vor der Übertragung verkleinert werden.');
    result=value.map(item=>sanitizeTripPayload(item,depth+1,seen));
  }else{
    result={};for(const [key,item] of Object.entries(value)){
      if(BLOCKED_KEYS.test(key)||/^(raw|html|embedding|base64|knowledgeGraph|journeyGraph)$/.test(key))continue;
      const safe=sanitizeTripPayload(item,depth+1,seen);if(safe!==undefined)result[key]=safe;
    }
  }
  seen.delete(value);return result;
}

function sanitize(value,depth=0,seen=new WeakSet()){
  if(value==null||typeof value==='boolean'||typeof value==='number')return value;
  if(typeof value==='string')return value.slice(0,LIMITS.maxString);
  if(depth>=LIMITS.maxDepth)return'[redacted-depth]';
  if(Array.isArray(value))return value.slice(0,LIMITS.maxArray).map(item=>sanitize(item,depth+1,seen));
  if(typeof value==='object'){
    if(seen.has(value))return'[circular]';
    seen.add(value);
    const output={};
    for(const [key,item] of Object.entries(value)){
      if(BLOCKED_KEYS.test(key))continue;
      const safe=sanitize(item,depth+1,seen);
      if(safe!==undefined)output[key]=safe;
    }
    return output;
  }
  return undefined;
}

function normalizeCapability(definition={}){
  const id=text(definition.id);
  if(!id)throw contractError('INTELLIGENCE_CAPABILITY_ID_REQUIRED','Intelligence capability id is required.');
  const mode=Object.values(MODES).includes(definition.mode)?definition.mode:MODES.READ;
  return immutable({id,tier:MODEL_TIERS[definition.tier]?.id||'default',mode,schema:text(definition.schema,'assistant_response'),tools:list(definition.tools,32),timeoutMs:number(definition.timeoutMs,1000,120000,20000),cacheTtlMs:number(definition.cacheTtlMs,0,86400000,0),description:text(definition.description)});
}
function createCapabilityRegistry(initial=CAPABILITIES){
  const entries=new Map();
  function register(definition={}){const item=normalizeCapability(definition);entries.set(item.id,item);return item}
  initial.forEach(register);
  function get(id){return entries.get(text(id))||null}
  function listEntries(){return immutable([...entries.values()].map(clone))}
  function diagnostics(){return immutable({version:RUNTIME_VERSION,count:entries.size,capabilities:listEntries()})}
  return Object.freeze({register,get,list:listEntries,diagnostics});
}
const capabilityRegistry=createCapabilityRegistry();
function listCapabilities(){return capabilityRegistry.list()}
function getCapability(id){return capabilityRegistry.get(id)}

function normalizeDomain(definition={}){
  const id=text(definition.id);
  if(!id)throw contractError('INTELLIGENCE_DOMAIN_ID_REQUIRED','Intelligence domain id is required.');
  return immutable({id,description:text(definition.description),capabilities:list(definition.capabilities,32),tools:list(definition.tools,32),events:list(definition.events,32),contracts:sanitize(definition.contracts||{})});
}
function createDomainRegistry(initial=DOMAINS){
  const entries=new Map();
  function register(definition={}){const item=normalizeDomain(definition);entries.set(item.id,item);return item}
  initial.forEach(register);
  function get(id){const item=entries.get(text(id));return item?immutable(clone(item)):null}
  function listEntries(){return immutable([...entries.values()].map(clone))}
  function diagnostics(){return immutable({version:RUNTIME_VERSION,count:entries.size,domains:listEntries()})}
  return Object.freeze({register,get,list:listEntries,diagnostics});
}
const domainRegistry=createDomainRegistry();
function listDomains(){return domainRegistry.list()}
function getDomain(id){return domainRegistry.get(id)}
function listTools(){return immutable(TOOLS.map(clone))}
function getTool(name){const item=TOOLS.find(tool=>tool.name===text(name));return item?immutable(clone(item)):null}
function listModelTiers(){return immutable(Object.values(MODEL_TIERS).map(clone))}
function resolveModelTier(capability,options={}){
  const definition=typeof capability==='string'?getCapability(capability):capability;
  const requested=text(options.tier||definition?.tier||'default');
  return MODEL_TIERS[requested]||MODEL_TIERS.default;
}
function canRunCapability(capability){
  const definition=typeof capability==='string'?getCapability(capability):capability;
  return Boolean(definition&&Object.values(MODES).includes(definition.mode));
}
function assertCapabilityMode(capability,allowed=[MODES.READ,MODES.DRAFT]){
  const definition=typeof capability==='string'?getCapability(capability):capability;
  if(!definition||!allowed.includes(definition.mode))throw contractError('INTELLIGENCE_POLICY_MODE_DENIED','Intelligence capability mode denied.',{capability:typeof capability==='string'?capability:capability?.id||null});
  return definition;
}
function canExecuteProposal(proposal,{confirmed=false}={}){
  const action=text(proposal?.actionType||proposal?.action_type);
  return Boolean(confirmed&&proposal&&proposal.status!=='executed'&&['timeline.add','timeline.update','timeline.remove'].includes(action));
}
function policySnapshot(){return immutable({version:RUNTIME_VERSION,modes:MODES,execution:'confirmation-and-owner-command-required',foreignDomainMutation:false,sanitization:LIMITS})}

function planningDialogue(value={}){
  const item=input=>({key:text(input?.key),value:text(input?.value),label:text(input?.label)});
  const items=(input,max=20)=>(Array.isArray(input)?input:[]).slice(0,max).map(item).filter(entry=>entry.key&&entry.label);
  const question=value.followUpQuestion?.text?{text:text(value.followUpQuestion.text),reason:text(value.followUpQuestion.reason),options:(Array.isArray(value.followUpQuestion.options)?value.followUpQuestion.options:[]).slice(0,5).map(option=>({label:text(option.label),value:text(option.value)})).filter(option=>option.label&&option.value),allowFreeText:value.followUpQuestion.allowFreeText!==false}:null;
  return{understanding:text(value.understanding),goals:(Array.isArray(value.goals)?value.goals:[]).slice(0,8).map(goal=>({type:text(goal.type,'open'),label:text(goal.label),hardConstraints:items(goal.hardConstraints,10),softPreferences:items(goal.softPreferences,10),timeWindow:goal.timeWindow?{label:text(goal.timeWindow.label),start:text(goal.timeWindow.start),end:text(goal.timeWindow.end),flexible:Boolean(goal.timeWindow.flexible)}:null,source:text(goal.source,'ai')})).filter(goal=>goal.label),hardConstraints:items(value.hardConstraints),softPreferences:items(value.softPreferences),followUpQuestion:question,summary:{headline:text(value.summary?.headline,'So habe ich euch verstanden'),intro:text(value.summary?.intro),goalLabels:list(value.summary?.goalLabels,8),hardLabels:list(value.summary?.hardLabels,10),softLabels:list(value.summary?.softLabels,10)},unknowns:list(value.unknowns,10),confidence:number(value.confidence,0,1,.5)};
}
function experienceResearch(value={}){
  const offers=(Array.isArray(value.offers)?value.offers:[]).slice(0,6).filter(item=>item?.state==='research-lead'&&item.placeVerified===false&&/^https?:\/\/[^\s]+$/i.test(String(item.source?.url||''))).map(item=>({name:text(item.name).slice(0,120),category:text(item.category).slice(0,24),description:text(item.description).slice(0,220),address:text(item.address).slice(0,200),source:{url:text(item.source.url),title:text(item.source.title).slice(0,160),retrievedAt:text(item.source.retrievedAt)},state:'research-lead',placeVerified:false,unknowns:list(item.unknowns,4)}));
  return {offers,unresolvedCategories:list(value.unresolvedCategories,12),retrievedAt:text(value.retrievedAt),sourceCount:number(value.sourceCount,0,1000,0)};
}
function discoveryPlan(value={}){return{followUpQuestion:value.followUpQuestion&&typeof value.followUpQuestion==='object'?{text:text(value.followUpQuestion.text),options:(Array.isArray(value.followUpQuestion.options)?value.followUpQuestion.options:[]).slice(0,8).map(item=>({label:text(item?.label),value:text(item?.value)})).filter(item=>item.label&&item.value)}:null,searchPlans:(Array.isArray(value.searchPlans)?value.searchPlans:[]).slice(0,6).map(plan=>({query:text(plan.query),targetName:text(plan.targetName).slice(0,200)||null,includedTypes:list(plan.includedTypes,12),weight:number(plan.weight,0,1,1),reason:text(plan.reason),fitSignals:list(plan.fitSignals,3)})).filter(plan=>plan.query),preferredSignals:list(value.preferredSignals,20),mustHave:list(value.mustHave,20),excludedSignals:list(value.excludedSignals,20),reasoningSummary:text(value.reasoningSummary),confidence:number(value.confidence,0,1,.5)}}
function ranking(value={}){return{rankings:(Array.isArray(value.rankings)?value.rankings:[]).slice(0,50).map(item=>({entityId:text(item.entityId),score:number(item.score,0,100,50),confidence:number(item.confidence,0,1,.5),reasons:list(item.reasons,6),unknowns:list(item.unknowns,6)})).filter(item=>item.entityId),summary:text(value.summary)}}
function dashboard(value={}){return{headline:text(value.headline,'Eure Reise nimmt Form an.'),message:text(value.message,'Luvia verbindet eure Pläne, Vorlieben und den aktuellen Reisemoment.'),highlights:list(value.highlights,5),suggestedActions:(Array.isArray(value.suggestedActions)?value.suggestedActions:[]).slice(0,4).map(action=>({id:text(action.id),label:text(action.label),capability:text(action.capability),kind:text(action.kind,'refresh')})).filter(action=>action.label)}}
function timeline(value={}){return{title:text(value.title,'Vorschlag für euren Reisetag'),explanation:text(value.explanation),changes:(Array.isArray(value.changes)?value.changes:[]).slice(0,10).map(change=>({action:text(change.action),eventId:text(change.eventId),date:text(change.date),time:text(change.time),title:text(change.title),durationMinutes:number(change.durationMinutes,15,720,90),reason:text(change.reason)})).filter(change=>['add','update','remove'].includes(change.action)),warnings:list(value.warnings,8),confidence:number(value.confidence,0,1,.5)}}
function tripItinerary(value={}){
  const certainty=item=>['verified','modelled','open'].includes(item?.certainty)?item.certainty:'open',uncertaintyState=item=>['verified','modelled','open'].includes(item?.state)?item.state:'open';
  return{title:text(value.title),summary:text(value.summary),travelPromise:{summary:text(value.travelPromise?.summary),commitments:list(value.travelPromise?.commitments,12),deliberateFreeTime:text(value.travelPromise?.deliberateFreeTime),exclusions:list(value.travelPromise?.exclusions,12)},days:(Array.isArray(value.days)?value.days:[]).slice(0,366).map((day,index)=>({date:text(day?.date),label:text(day?.label,`Tag ${index+1}`),theme:text(day?.theme),role:['arrival','full','departure','day-trip'].includes(day?.role)?day.role:'full',balance:{energy:['light','balanced','intense'].includes(day?.balance?.energy)?day.balance.energy:'balanced',plannedMinutes:number(day?.balance?.plannedMinutes,0,1440,0),freeTimeMinutes:number(day?.balance?.freeTimeMinutes,0,1440,0),freeTimePurpose:text(day?.balance?.freeTimePurpose)},freeTime:(Array.isArray(day?.freeTime)?day.freeTime:[]).slice(0,6).map(item=>({start:text(item?.start),end:text(item?.end),purpose:text(item?.purpose),reason:text(item?.reason)})).filter(item=>item.purpose),entries:(Array.isArray(day?.entries)?day.entries:[]).slice(0,8).map(entry=>({providerPlaceId:text(entry?.providerPlaceId),time:text(entry?.time),durationMinutes:number(entry?.durationMinutes,30,720,90),category:text(entry?.category),reason:text(entry?.reason),certainty:certainty(entry),evidenceRefs:list(entry?.evidenceRefs,12),confidence:number(entry?.confidence,0,1,.5)})).filter(entry=>entry.providerPlaceId)})),uncertaintyMap:(Array.isArray(value.uncertaintyMap)?value.uncertaintyMap:[]).slice(0,40).map(item=>({subject:text(item?.subject),kind:['weather','price','opening','route','availability','booking','event','calendar','other'].includes(item?.kind)?item.kind:'other',state:uncertaintyState(item),reason:text(item?.reason),source:text(item?.source),observedAt:text(item?.observedAt),expiresAt:text(item?.expiresAt),affectedDayDates:list(item?.affectedDayDates,20),providerPlaceIds:list(item?.providerPlaceIds,20),evidenceRefs:list(item?.evidenceRefs,20)})).filter(item=>item.subject),bookingOrder:(Array.isArray(value.bookingOrder)?value.bookingOrder:[]).slice(0,30).map(item=>({rank:number(item?.rank,1,99,99),subject:text(item?.subject),providerPlaceId:text(item?.providerPlaceId),state:['secure-first','plan-around','later','open'].includes(item?.state)?item.state:'open',reason:text(item?.reason),blocks:list(item?.blocks,12),evidenceRefs:list(item?.evidenceRefs,12)})).filter(item=>item.subject).sort((a,b)=>a.rank-b.rank),neighborhoodRecommendation:{state:value.neighborhoodRecommendation?.state==='modelled'?'modelled':'open',label:text(value.neighborhoodRecommendation?.label),radiusKm:number(value.neighborhoodRecommendation?.radiusKm,0,100,0),reason:text(value.neighborhoodRecommendation?.reason),evidencePlaceIds:list(value.neighborhoodRecommendation?.evidencePlaceIds,24),caveats:list(value.neighborhoodRecommendation?.caveats,12)},alternatives:list(value.alternatives,20),backupOptions:(Array.isArray(value.backupOptions)?value.backupOptions:[]).slice(0,40).map(item=>({dayDate:text(item?.dayDate),forProviderPlaceId:text(item?.forProviderPlaceId),providerPlaceId:text(item?.providerPlaceId),trigger:text(item?.trigger),reason:text(item?.reason)})).filter(item=>item.dayDate&&item.forProviderPlaceId&&item.providerPlaceId),uncoveredRequirements:list(value.uncoveredRequirements,20),warnings:list(value.warnings,20),confidence:number(value.confidence,0,1,.5)};
}
function tripDayRepair(value={}){
  return{days:(Array.isArray(value.days)?value.days:[]).slice(0,1).map(day=>({date:text(day?.date),theme:text(day?.theme),balance:{energy:['light','balanced','intense'].includes(day?.balance?.energy)?day.balance.energy:'balanced',freeTimePurpose:text(day?.balance?.freeTimePurpose)},freeTime:(Array.isArray(day?.freeTime)?day.freeTime:[]).slice(0,6).map(item=>({start:text(item?.start),end:text(item?.end),purpose:text(item?.purpose)})).filter(item=>item.purpose),entries:(Array.isArray(day?.entries)?day.entries:[]).slice(0,8).map(entry=>({providerPlaceId:text(entry?.providerPlaceId),time:text(entry?.time),durationMinutes:number(entry?.durationMinutes,30,720,90),reason:text(entry?.reason)})).filter(entry=>entry.providerPlaceId)})),reasoningSummary:text(value.reasoningSummary),confidence:number(value.confidence,0,1,.5)};
}
function tripQualityAudit(value={}){return{readyForReview:value.readyForReview===true,score:number(value.score,0,100,0),headline:text(value.headline),promiseAssessment:{kept:value.promiseAssessment?value.promiseAssessment.kept===true:true,summary:text(value.promiseAssessment?.summary),missedCommitments:list(value.promiseAssessment?.missedCommitments,20)},dimensions:(Array.isArray(value.dimensions)?value.dimensions:[]).slice(0,12).map(item=>({id:text(item?.id),label:text(item?.label),score:number(item?.score,0,100,0),status:['pass','attention','blocked'].includes(item?.status)?item.status:'attention',summary:text(item?.summary)})).filter(item=>item.id&&item.label),issues:(Array.isArray(value.issues)?value.issues:[]).slice(0,30).map(item=>({code:text(item?.code),severity:item?.severity==='blocked'?'blocked':'attention',dayDate:text(item?.dayDate),providerPlaceIds:list(item?.providerPlaceIds,12),message:text(item?.message),suggestedRepair:text(item?.suggestedRepair)})).filter(item=>item.code&&item.message),strengths:list(value.strengths,12),repairInstructions:list(value.repairInstructions,20),confidence:number(value.confidence,0,1,.5)}}
function signals(value={}){return{signals:(Array.isArray(value.signals)?value.signals:[]).slice(0,8).map(signal=>({signalKey:text(signal.signalKey),category:text(signal.category,'general'),value:clone(signal.value||{}),confidence:number(signal.confidence,0,1,.5),evidence:text(signal.evidence)})).filter(signal=>signal.signalKey)}}
function validateOutput(schema,value){let output;switch(schema){case'experience_research':output=experienceResearch(value);break;case'planning_dialogue':output=planningDialogue(value);break;case'trip_itinerary':output=tripItinerary(value);break;case'trip_day_repair':output=tripDayRepair(value);break;case'trip_quality_audit':output=tripQualityAudit(value);break;case'discovery_plan':output=discoveryPlan(value);break;case'candidate_ranking':output=ranking(value);break;case'dashboard_brief':output=dashboard(value);break;case'timeline_proposal':output=timeline(value);break;case'memory_signals':output=signals(value);break;case'summary':output={summary:text(value?.summary||value)};break;default:output={answer:text(value?.answer||value?.message||value),suggestedActions:Array.isArray(value?.suggestedActions)?clone(value.suggestedActions):[]};}return immutable(output)}
const validators=Object.freeze({planningDialogue,tripItinerary,tripDayRepair,tripQualityAudit,discoveryPlan,ranking,dashboard,timeline,signals});

function createContextEnvelope(input={}){
  const capability=assertCapabilityMode(input.capability,[MODES.READ,MODES.DRAFT]);
  const projections=Array.isArray(input.projections)?input.projections:[];
  return immutable({contractId:CONTRACT_ID,version:VERSION,capability:capability.id,mode:capability.mode,createdAt:text(input.createdAt)||null,projections:projections.slice(0,32).map(item=>({contractId:text(item?.contractId),owner:text(item?.owner),revision:text(item?.revision)||null,data:sanitize(item?.data||{})})).filter(item=>item.contractId&&item.owner),currentMoment:sanitize(input.currentMoment||{}),extra:sanitize(input.extra||{})});
}

function normalizeSignal(input={}){
  const signalKey=text(input.signalKey||input.signal_key||input.key);
  if(!signalKey)throw contractError('INTELLIGENCE_SIGNAL_KEY_REQUIRED','Intelligence signal key is required.');
  const status=SIGNAL_STATUSES.includes(input.status)?input.status:'inferred';
  return immutable({id:text(input.id)||null,signalKey,category:text(input.category,'general'),value:sanitize(input.value||{}),confidence:number(input.confidence,0,1,.5),evidence:text(input.evidence),status,createdAt:text(input.createdAt||input.created_at)||null,updatedAt:text(input.updatedAt||input.updated_at)||null});
}
function transitionSignal(signal,nextStatus){
  const current=normalizeSignal(signal);const next=text(nextStatus);
  const allowed={inferred:['confirmed','dismissed'],confirmed:[],dismissed:[]};
  if(!allowed[current.status].includes(next))throw contractError('INTELLIGENCE_SIGNAL_TRANSITION_DENIED','Intelligence signal transition denied.',{from:current.status,to:next});
  return immutable({...clone(current),status:next});
}
function projectMemorySnapshot(input={}){
  const source=input&&typeof input==='object'?input:{};
  const entries=(Array.isArray(source.signals)?source.signals:[]).map(normalizeSignal);
  const byStatus=Object.fromEntries(SIGNAL_STATUSES.map(status=>[status,entries.filter(item=>item.status===status).length]));
  return immutable({loaded:Boolean(source.loaded),syncing:Boolean(source.syncing),revision:number(source.revision,0,Number.MAX_SAFE_INTEGER,0),signals:entries,summary:{total:entries.length,byStatus},lastSyncedAt:text(source.lastSyncedAt)||null});
}

function createProposalIntent(input={}){
  const capability=getCapability(input.capability||'timeline.propose');
  if(!capability||capability.mode!==MODES.DRAFT)throw contractError('INTELLIGENCE_PROPOSAL_CAPABILITY_DENIED','Proposal capability must use DRAFT mode.');
  return immutable({tripId:text(input.tripId)||null,capability:capability.id,actionType:text(input.actionType,'timeline.batch'),actionPayload:sanitize(input.actionPayload||input.payload||{}),explanation:text(input.explanation),status:'draft',requiresConfirmation:true,mutationOwner:text(input.mutationOwner,'journey')});
}
function transitionProposal(proposal,nextStatus,{confirmed=false,ownerCommand=false}={}){
  const current=PROPOSAL_STATUSES.includes(proposal?.status)?proposal.status:'draft';
  const next=text(nextStatus);
  const allowed={draft:['accepted','rejected'],accepted:['executed','failed'],rejected:[],executed:[],failed:[]};
  if(!allowed[current].includes(next))throw contractError('INTELLIGENCE_PROPOSAL_TRANSITION_DENIED','Intelligence proposal transition denied.',{from:current,to:next});
  if(next==='accepted'&&!confirmed)throw contractError('INTELLIGENCE_CONFIRMATION_REQUIRED','Proposal acceptance requires explicit confirmation.');
  if(next==='executed'&&!ownerCommand)throw contractError('INTELLIGENCE_OWNER_COMMAND_REQUIRED','Foreign-domain execution requires the owner command.');
  return immutable({...sanitize(proposal),status:next,requiresConfirmation:true});
}

function createEvidenceState({now=()=>null}={}){
  const records=new Map();
  function put(items=[],meta={}){for(const item of items||[]){if(!item?.id)continue;records.set(String(item.id),immutable({...sanitize(item),meta:{...sanitize(item.meta||{}),...sanitize(meta)},storedAt:now()}));}return records.size}
  function get(id){const item=records.get(text(id));return item?immutable(clone(item)):null}
  function resolve(ids=[]){return immutable(ids.map(get).filter(Boolean))}
  function clear(){records.clear()}
  function diagnostics(){const byKind={};for(const item of records.values())byKind[item.kind]=(byKind[item.kind]||0)+1;return immutable({version:RUNTIME_VERSION,count:records.size,byKind})}
  return Object.freeze({put,get,resolve,clear,diagnostics});
}

function createSystemSnapshot(runtime={}){
  return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,status:text(runtime.status,'contract-only'),provider:text(runtime.provider)||null,serverAuthoritativeModels:runtime.serverAuthoritativeModels===true,providerRuntimeVersion:text(runtime.runtimeVersion)||null,capabilities:listCapabilities(),domains:listDomains(),tools:listTools(),modelTiers:listModelTiers(),policy:policySnapshot(),sourceContracts:list(TOOLS.map(tool=>tool.sourceContract),32),memory:runtime.memory?sanitize(runtime.memory):null,proposals:runtime.proposals?sanitize(runtime.proposals):null,ownership:{truth:'intelligence-specific-state-only',foreignDomainMutation:false,journeyTimelineOwner:false,experienceOwnership:false}});
}

return Object.freeze({
  contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,modes:MODES,modelTiers:MODEL_TIERS,
  immutable,sanitize,sanitizeTripPayload,createCapabilityRegistry,listCapabilities,getCapability,createDomainRegistry,listDomains,getDomain,
  listTools,getTool,listModelTiers,resolveModelTier,canRunCapability,assertCapabilityMode,canExecuteProposal,policySnapshot,
  validateOutput,validators,createContextEnvelope,normalizeSignal,transitionSignal,projectMemorySnapshot,
  createProposalIntent,transitionProposal,createEvidenceState,createSystemSnapshot
});
})();
