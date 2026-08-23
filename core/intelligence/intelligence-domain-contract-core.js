var LuviaIntelligenceDomainContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='intelligence.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
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
  {id:'planning.dialogue',tier:'default',mode:'READ',schema:'planning_dialogue',tools:[],timeoutMs:15000,cacheTtlMs:0,description:'Zerlegt einen Planungswunsch, stellt höchstens eine gezielte Rückfrage und startet keine Recherche.'},
  {id:'discovery.plan',tier:'default',mode:'READ',schema:'discovery_plan',tools:['trip.current','preferences.current','travel.context','memory.signals'],timeoutMs:20000,cacheTtlMs:300000,description:'Erzeugt kontrollierte Suchstrategien aus Guided Discovery.'},
  {id:'discovery.rank',tier:'default',mode:'READ',schema:'candidate_ranking',tools:['trip.current','preferences.current','travel.context','memory.signals'],timeoutMs:20000,cacheTtlMs:180000,description:'Ordnet bereits fachlich validierte Providerkandidaten persönlich.'},
  {id:'dashboard.brief',tier:'default',mode:'READ',schema:'dashboard_brief',tools:['trip.current','preferences.current','travel.context','journey.context','journey.events','journey.reservations','journey.evidence','schedule.current','today.current','recommendations.current','memory.signals'],timeoutMs:20000,cacheTtlMs:300000,description:'Erstellt ein ehrliches Reisebriefing für das Dashboard.'},
  {id:'timeline.propose',tier:'deep',mode:'DRAFT',schema:'timeline_proposal',tools:['trip.current','preferences.current','travel.context','journey.context','journey.events','journey.reservations','journey.evidence','schedule.current','today.current','places.saved','memory.signals'],timeoutMs:20000,cacheTtlMs:0,description:'Bereitet bestätigungspflichtige Timeline-Änderungen vor.'},
  {id:'memory.extract',tier:'fast',mode:'DRAFT',schema:'memory_signals',tools:['preferences.current'],timeoutMs:20000,cacheTtlMs:0,description:'Leitet belegte Lernsignale aus Nutzerentscheidungen ab.'},
  {id:'memory.compose',tier:'default',mode:'DRAFT',schema:'memory_composition',tools:[],timeoutMs:20000,cacheTtlMs:0,description:'Erzeugt aus Reisebildern und belegtem Kontext gemeinsam Titel, Erinnerungstext, Caption und Highlights.'},
  {id:'text.summarize',tier:'fast',mode:'READ',schema:'summary',tools:[],timeoutMs:20000,cacheTtlMs:600000,description:'Kurze, kontrollierte Zusammenfassungen.'}
].map(immutableDefinition));

const DOMAINS=Object.freeze([
  {id:'journey',description:'Reservierter Cross-Domain-Aggregator als read-only Intelligence-Quelle.',capabilities:['dashboard.brief','brain.ask','timeline.propose'],tools:['journey.context','journey.events','journey.reservations'],events:['luvia:journey-context-changed'],contracts:{sourceContract:'journey.projection',owner:'journey',mutationDelegated:true}},
  {id:'places',description:'Places-Projektionen für Suche und Ranking.',capabilities:['discovery.plan','discovery.rank'],tools:['journey.context','preferences.current','places.saved'],events:[],contracts:{sourceContract:'places.v1',owner:'places',placeContractsRequired:true,providerFactsAuthoritative:true}},
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
function discoveryPlan(value={}){return{searchPlans:(Array.isArray(value.searchPlans)?value.searchPlans:[]).slice(0,6).map(plan=>({query:text(plan.query),includedTypes:list(plan.includedTypes,12),weight:number(plan.weight,0,1,1)})).filter(plan=>plan.query),preferredSignals:list(value.preferredSignals,20),mustHave:list(value.mustHave,20),excludedSignals:list(value.excludedSignals,20),reasoningSummary:text(value.reasoningSummary),confidence:number(value.confidence,0,1,.5)}}
function ranking(value={}){return{rankings:(Array.isArray(value.rankings)?value.rankings:[]).slice(0,50).map(item=>({entityId:text(item.entityId),score:number(item.score,0,100,50),confidence:number(item.confidence,0,1,.5),reasons:list(item.reasons,6),unknowns:list(item.unknowns,6)})).filter(item=>item.entityId),summary:text(value.summary)}}
function dashboard(value={}){return{headline:text(value.headline,'Eure Reise nimmt Form an.'),message:text(value.message,'Luvia verbindet eure Pläne, Vorlieben und den aktuellen Reisemoment.'),highlights:list(value.highlights,5),suggestedActions:(Array.isArray(value.suggestedActions)?value.suggestedActions:[]).slice(0,4).map(action=>({id:text(action.id),label:text(action.label),capability:text(action.capability),kind:text(action.kind,'refresh')})).filter(action=>action.label)}}
function timeline(value={}){return{title:text(value.title,'Vorschlag für euren Reisetag'),explanation:text(value.explanation),changes:(Array.isArray(value.changes)?value.changes:[]).slice(0,10).map(change=>({action:text(change.action),eventId:text(change.eventId),date:text(change.date),time:text(change.time),title:text(change.title),durationMinutes:number(change.durationMinutes,15,720,90),reason:text(change.reason)})).filter(change=>['add','update','remove'].includes(change.action)),warnings:list(value.warnings,8),confidence:number(value.confidence,0,1,.5)}}
function signals(value={}){return{signals:(Array.isArray(value.signals)?value.signals:[]).slice(0,8).map(signal=>({signalKey:text(signal.signalKey),category:text(signal.category,'general'),value:clone(signal.value||{}),confidence:number(signal.confidence,0,1,.5),evidence:text(signal.evidence)})).filter(signal=>signal.signalKey)}}
function validateOutput(schema,value){let output;switch(schema){case'planning_dialogue':output=planningDialogue(value);break;case'discovery_plan':output=discoveryPlan(value);break;case'candidate_ranking':output=ranking(value);break;case'dashboard_brief':output=dashboard(value);break;case'timeline_proposal':output=timeline(value);break;case'memory_signals':output=signals(value);break;case'summary':output={summary:text(value?.summary||value)};break;default:output={answer:text(value?.answer||value?.message||value),suggestedActions:Array.isArray(value?.suggestedActions)?clone(value.suggestedActions):[]};}return immutable(output)}
const validators=Object.freeze({planningDialogue,discoveryPlan,ranking,dashboard,timeline,signals});

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
  immutable,sanitize,createCapabilityRegistry,listCapabilities,getCapability,createDomainRegistry,listDomains,getDomain,
  listTools,getTool,listModelTiers,resolveModelTier,canRunCapability,assertCapabilityMode,canExecuteProposal,policySnapshot,
  validateOutput,validators,createContextEnvelope,normalizeSignal,transitionSignal,projectMemorySnapshot,
  createProposalIntent,transitionProposal,createEvidenceState,createSystemSnapshot
});
})();
