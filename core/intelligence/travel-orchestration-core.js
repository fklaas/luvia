var LuviaTravelOrchestrationCoreV1=(()=>{
'use strict';

const CONTRACT_ID='intelligence.travel-orchestration.v1';
const VERSION='1';
const RUNTIME_VERSION='1.1.0';
const PURPOSES=new Set(['timeline-suggestion','places-ranking','route-planning','weather-context','confirmed-visit','group-decision']);
const WRITE_VERBS=/\b(plane|planen|fuege|füge|buche|buchen|reserviere|reservieren|verschiebe|verschieben|loesche|lösche|storniere|stornieren|aendere|ändere|aktualisiere|aktualisieren|speichere|speichern|merke|merken|teile|teilen|aktiviere|aktivieren|deaktiviere|deaktivieren|erstelle|erstellen|stimme|abstimmen)\b/i;
const FORBIDDEN_COMMAND=/\b(ohne\s+(?:meine\s+)?bestätigung|bypass|umgeh(?:e|en)|heimlich|ungefragt|automatisch\s+(?:buchen|stornieren|löschen|teilen)|lösche\s+alles|teile\s+(?:den\s+)?(?:exakten|genauen)\s+standort\s+ungefragt)\b/i;
const TIME_PATTERN=/(?:(?:um|gegen)\s*)?\b([01]?\d|2[0-3])(?:[:.]([0-5]\d))?\s*(?:uhr)?\b/i;
const ALL_TIME_PATTERN=/(?:(?:um|gegen)\s*)?\b([01]?\d|2[0-3])(?:[:.]([0-5]\d))?\s*(?:uhr)?\b/gi;
const DAY_PATTERN=/\b(heute|morgen|uebermorgen|übermorgen|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/i;
const PARTY_PATTERN=/\b(?:für|fuer|mit)\s+(\d{1,2})\s+(?:personen?|leuten?|gästen?|gaesten?)\b/i;
const PARTY_WORD_PATTERN=/\b(?:für|fuer)\s+(?:uns\s+)?(zwei|drei|vier|fünf|fuenf|sechs|sieben|acht|neun|zehn)\b|\bzu\s+(zweit|dritt|viert|fünft|fuenft|sechst|siebt|acht|neunt|zehnt)\b/i;
const PARTY_WORDS=Object.freeze({zwei:2,zweit:2,drei:3,dritt:3,vier:4,viert:4,'fünf':5,fuenf:5,'fünft':5,fuenft:5,sechs:6,sechst:6,sieben:7,siebt:7,acht:8,neun:9,neunt:9,zehn:10,zehnt:10});
const LOCATION_ALLOW=/\b(standort|gps|position|ortung)\b.{0,40}\b(nutzen|teilen|freigeben|erlauben|aktivieren)\b|\b(nutze|teile|erlaube|aktiviere)\b.{0,40}\b(standort|gps|position|ortung)\b/i;
const LOCATION_DENY=/\b(standort|gps|position|ortung)\b.{0,40}\b(nicht|nie|sperren|deaktivieren|widerrufen)\b|\b(kein|keinen|deaktiviere|sperre|widerrufe)\b.{0,40}\b(standort|gps|position|ortung)\b/i;
const DOMAINS=Object.freeze([
  {id:'places',owner:'places',contract:'places.v1',availability:'active',pattern:/\b(place|places|restaurant|café|cafe|essen|strand|meer|museum|kultur|aktivitaet|aktivität|ausflug|fotospot|shopping|nachtleben|natur|sehenswuerdig|sehenswürdig|ort(?:e|en)?)\b/i},
  {id:'booking',owner:'booking',contract:'booking.v1',availability:'active',pattern:/\b(buchung(?:en)?|buche|buchen|reservier\w*|stornier\w*|umbuch\w*|tisch|ticket|hotel|provider)\b/i},
  {id:'journey',owner:'journey',contract:'journey.v1',availability:'active',pattern:/\b(timeline|tagesbogen|tagesplan|reiseplan|route|danach|davor|verschieb|plane|planen|hinzufueg|hinzufüg|moment)\b/i},
  {id:'trip',owner:'trip',contract:'trip.v1',availability:'active',pattern:/\b(aktive\s+reise|reise\s+wechseln|reisedaten|reiseziel|reisezeitraum|trip|urlaub\s+(?:umbenennen|ändern|aendern))\b/i},
  {id:'identity',owner:'identity',contract:'identity.v1',availability:'active',pattern:/\b(profil|identität|identitaet|reisekompass|vorliebe|präferenz|praeferenz|vegetar|vegan|barrierefrei|allerg)\b/i},
  {id:'privacy',owner:'identity',contract:'identity.v1',availability:'active',pattern:/\b(privatsphäre|privatsphaere|privacy|einwilligung|consent|datenfreigabe|standortfreigabe)\b|\b(?:gps|standort|position|ortung)\b.{0,48}\b(?:nicht|nie|widerrufen|freigeben|teilen)\b/i},
  {id:'device-position',owner:'platform',contract:'LocationPort',availability:'active',pattern:/\b(gps|standort|position|ortung|in\s+meiner\s+nähe|in\s+meiner\s+naehe|hier\s+in\s+der\s+nähe)\b/i},
  {id:'collaboration',owner:'collaboration',contract:'collaboration.membership.v1',availability:'foundation',pattern:/\b(abstimmung|abstimmen|stimme|gruppe|gruppenentscheidung|mitreisend|familie|freunde|gemeinsam|einladen|einladung|rolle)\b|\blade\b.{0,40}\bein\b/i},
  {id:'memory',owner:'memory',contract:'memory.v1',availability:'active',pattern:/\b(erinnerung(?:en)?|fotos?|videos?|moment\s+bewahren|stor(?:y|ies)|reels?|fotobuch|alben|album)\b|\bspeicher\w*\b.{0,40}\bmoment\b|\bmoment\b.{0,40}\bspeicher\w*\b/i}
]);

const clean=value=>String(value??'').trim();
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const iso=value=>{if(value==null||clean(value)==='')return null;const date=new Date(value);return Number.isNaN(date.getTime())?null:date.toISOString()};
const unique=(items,max=48)=>[...new Set(items.map(clean).filter(Boolean))].slice(0,max);
function immutable(value){if(value==null||typeof value!=='object')return value;if(Array.isArray(value))return Object.freeze(value.map(immutable));return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])))}
function stable(value){if(value==null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return`[${value.map(stable).join(',')}]`;return`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`}
function digest(value){const source=stable(value);let hash=2166136261;for(let index=0;index<source.length;index++){hash^=source.charCodeAt(index);hash=Math.imul(hash,16777619)}return`fnv1a-${(hash>>>0).toString(16).padStart(8,'0')}`}

function clausesFor(message){
  const parts=clean(message).split(/\s+(und\s+danach|danach|anschließend|anschliessend|außerdem|ausserdem|sowie)\s+|[;\n]+/i),clauses=[];let relation='parallel';
  for(const part of parts){const value=clean(part);if(!value)continue;if(/^(?:und\s+danach|danach|anschließend|anschliessend)$/i.test(value)){relation='after';continue}if(/^(?:außerdem|ausserdem|sowie)$/i.test(value)){relation='parallel';continue}clauses.push({text:value,relation:clauses.length?relation:'root'});relation='parallel'}
  return clauses;
}
function timeHint(source){const time=source.match(TIME_PATTERN),day=source.match(DAY_PATTERN);return{day:day?.[1]?.toLocaleLowerCase('de-DE')||null,time:time?`${String(Number(time[1])).padStart(2,'0')}:${String(Number(time[2]||0)).padStart(2,'0')}`:null,explicit:Boolean(day||time)}}
function allTimes(source){const times=[];for(const match of source.matchAll(ALL_TIME_PATTERN))times.push(`${String(Number(match[1])).padStart(2,'0')}:${String(Number(match[2]||0)).padStart(2,'0')}`);return unique(times)}
function categoryHints(source){const hints=[];for(const [id,pattern] of [
  ['food',/\b(restaurant|café|cafe|essen|vegetar|vegan|genuss)\b/i],['culture',/\b(museum|kultur|geschichte|galerie|theater|konzert|event)\b/i],['nature',/\b(natur|strand|meer|wald|park|ruhe|erholung)\b/i],
  ['activity',/\b(aktivitaet|aktivität|ausflug|sport|schwimm|rad|wander)\b/i],['photo',/\b(foto|fotospot|aussicht)\b/i],['nightlife',/\b(nachtleben|club|bar|abend)\b/i],['shopping',/\b(shopping|einkauf|markt)\b/i]
])if(pattern.test(source))hints.push(id);return hints}
function entityHints(source){const party=source.match(PARTY_PATTERN),partyWord=source.match(PARTY_WORD_PATTERN),partyToken=clean(partyWord?.[1]||partyWord?.[2]).toLocaleLowerCase('de-DE');return{partySize:party?Number(party[1]):PARTY_WORDS[partyToken]||null,hasNamedTarget:/[„“"'][^„“"']{2,80}[„“"']/.test(source),hasChoice:/\b(?:oder|zwischen)\b/i.test(source)}}
function requiredInputs(domain,mode,clause,hint,entities){
  if(mode!=='propose-write')return domain.id==='device-position'&&!/\b(?:in\s+meiner\s+nähe|in\s+meiner\s+naehe|hier)\b/i.test(clause)?['purpose']:[];
  if(domain.id==='booking')return[!entities.hasNamedTarget&&!/\b(?:restaurant|hotel|ticket|tisch)\b/i.test(clause)?'bookable-target':null,!hint.day?'date':null,!hint.time?'time':null,!entities.partySize?'party-size':null,'verified-provider-capability'].filter(Boolean);
  if(domain.id==='journey')return[!hint.day?'day':null,!hint.time?'time-or-open-period':null,!/\b(?:restaurant|ort|place|museum|strand|route|moment|tagesplan)\b/i.test(clause)?'journey-target':null].filter(Boolean);
  if(domain.id==='trip')return[/\bwechsel/i.test(clause)&&!entities.hasNamedTarget?'target-trip':null].filter(Boolean);
  if(domain.id==='identity')return[/\b(?:ändern|aendern|aktualisieren|speichern)\b/i.test(clause)&&!/\b(?:vegetar|vegan|barrierefrei|allerg|ruhig|kultur|natur|aktiv)\b/i.test(clause)?'preference-change':null].filter(Boolean);
  if(domain.id==='privacy')return[/\b(?:teile|teilen|freigebe|freigeben|aktiviere|aktivieren|deaktiviere|deaktivieren|widerrufe|widerrufen)\b/i.test(clause)?null:'privacy-setting',/\b(?:standort|gps|position|ortung)\b/i.test(clause)?'position-purpose':null].filter(Boolean);
  if(domain.id==='device-position')return['explicit-position-grant','purpose'];
  if(domain.id==='collaboration')return[/\babstimm/i.test(clause)&&!entities.hasChoice?'decision-options':null,/\b(?:stimme|abstimm)\b/i.test(clause)&&!entities.hasNamedTarget?'selected-choice':null].filter(Boolean);
  if(domain.id==='memory')return[!/\b(?:foto|video|moment|story|reel|fotobuch|album)\b/i.test(clause)?'memory-source-or-target':null].filter(Boolean);
  return[];
}
function conflictSet(text,intents,offline){
  const conflicts=[];
  if(LOCATION_ALLOW.test(text)&&LOCATION_DENY.test(text))conflicts.push({code:'position-consent-conflict',message:'Der Wunsch erlaubt und verweigert Standortzugriff zugleich.',intentIds:intents.filter(item=>['device-position','privacy'].includes(item.domain)).map(item=>item.id)});
  if(/\b(?:buche|reserviere)\b/i.test(text)&&/\b(?:storniere|lösche)\b/i.test(text))conflicts.push({code:'booking-lifecycle-conflict',message:'Buchung und Stornierung stehen im selben Wunsch ohne eindeutiges Ziel.',intentIds:intents.filter(item=>item.domain==='booking').map(item=>item.id)});
  for(const intent of intents){const times=allTimes(intent.clause);if(times.length>1)conflicts.push({code:'multiple-time-values',message:`Für eine Teilaufgabe sind mehrere Zeiten genannt: ${times.join(' / ')}.`,intentIds:[intent.id]})}
  if(offline&&intents.some(item=>item.domain==='booking'&&item.mode==='propose-write'))conflicts.push({code:'offline-external-command',message:'Externe Booking-Befehle bleiben offline blockiert; der Entwurf kann lokal erhalten bleiben.',intentIds:intents.filter(item=>item.domain==='booking').map(item=>item.id)});
  return conflicts;
}
function compileIntent(message,context={}){
  const text=clean(message),empty={contractId:CONTRACT_ID,kind:'intent-graph',messageHash:digest(''),intents:[],ownerRoutes:[],requiresConfirmation:false,status:'empty',automaticMutation:false,rawMessageStored:false};if(!text)return immutable(empty);
  const clauses=clausesFor(text),intents=[],offline=context.offline===true||context.online===false;
  clauses.forEach((entry,index)=>{const matched=DOMAINS.filter(domain=>domain.pattern.test(entry.text)),domains=matched.length?matched:(clauses.length===1?DOMAINS.filter(domain=>domain.pattern.test(text)):[]);for(const domain of domains){const write=WRITE_VERBS.test(entry.text),hint=timeHint(entry.text),entities=entityHints(entry.text),missing=requiredInputs(domain,write?'propose-write':'read',entry.text,hint,entities);intents.push({id:`intent-${index+1}-${domain.id}`,sequence:index+1,domain:domain.id,owner:domain.owner,ownerContract:domain.contract,ownerAvailability:domain.availability,mode:write?'propose-write':'read',requiresConfirmation:write,clause:entry.text,relation:entry.relation,categoryHints:domain.id==='places'?categoryHints(entry.text):[],temporalHint:hint,entityHints:entities,missingInputs:missing,dependencies:index&&entry.relation==='after'?[`clause-${index}`]:[],automaticMutation:false})}});
  const uniqueIntents=[...new Map(intents.map(intent=>[`${intent.sequence}:${intent.domain}`,intent])).values()],blockedCommands=[];
  if(FORBIDDEN_COMMAND.test(text))blockedCommands.push({code:'confirmation-bypass-forbidden',message:'Luvia führt keine stille, ungefragte oder bestätigungslose Mutation aus.'});
  for(const intent of uniqueIntents)if(intent.mode==='propose-write'&&intent.ownerAvailability!=='active')blockedCommands.push({code:'owner-command-not-productized',message:`${intent.ownerContract} ist noch nicht als produktiver Mutationspfad verfügbar.`,intentIds:[intent.id]});
  const conflicts=conflictSet(text,uniqueIntents,offline),missingInputs=uniqueIntents.flatMap(intent=>intent.missingInputs.map(input=>({intentId:intent.id,domain:intent.domain,input}))),status=blockedCommands.length?'blocked':conflicts.length?'conflicted':missingInputs.length?'needs-clarification':uniqueIntents.length?'compiled':'unresolved';
  const ownerRoutes=unique([...new Set(uniqueIntents.map(intent=>intent.ownerContract))]),steps=uniqueIntents.map(intent=>({intentId:intent.id,sequence:intent.sequence,relation:intent.relation,owner:intent.owner,ownerContract:intent.ownerContract,mode:intent.mode,status:intent.missingInputs.length?'needs-input':intent.ownerAvailability==='active'?'ready':'owner-foundation',requiresConfirmation:intent.requiresConfirmation}));
  return immutable({contractId:CONTRACT_ID,kind:'intent-graph',messageHash:digest(text),locale:clean(context.locale)||'de-DE',compiledAt:iso(context.now)||null,connectivity:offline?'offline':'online',status,intents:uniqueIntents,ownerRoutes,steps,missingInputs,conflicts,blockedCommands,requiresConfirmation:uniqueIntents.some(intent=>intent.requiresConfirmation),readPlan:steps.filter(step=>step.mode==='read'),mutationPlan:steps.filter(step=>step.mode==='propose-write'),automaticMutation:false,rawMessageStored:false});
}

function planningTrace(input={}){
  const compiled=input.compiled?.contractId===CONTRACT_ID?input.compiled:compileIntent(input.message||'',input),now=Date.parse(input.now||new Date().toISOString());
  const evidence=(input.evidence||[]).slice(0,24).map(item=>{const observedAt=iso(item.observedAt),freshUntil=iso(item.freshUntil),freshUntilMs=Date.parse(freshUntil||0),observedMs=Date.parse(observedAt||0),freshness=!observedAt?'unknown':Number.isFinite(freshUntilMs)&&freshUntilMs<now?'stale':Number.isFinite(observedMs)?'observed':'unknown';return{id:clean(item.id)||digest({source:item.source,observedAt:item.observedAt,kind:item.kind}),source:clean(item.source),kind:clean(item.kind),observedAt,freshUntil,freshness,supports:(item.supports||[]).map(clean).filter(Boolean),verified:item.verified===true}});
  const decisions=(input.decisions||[]).slice(0,24).map(item=>({id:clean(item.id)||digest(item),owner:clean(item.owner),action:clean(item.action),reasonCodes:(item.reasonCodes||[]).map(clean).filter(Boolean),evidenceIds:(item.evidenceIds||[]).map(clean).filter(Boolean),requiresConfirmation:item.requiresConfirmation!==false,status:clean(item.status)||'proposed'}));
  return immutable({contractId:CONTRACT_ID,kind:'explainable-planning-trace',traceId:digest({messageHash:compiled.messageHash,evidence,decisions}),compiled:{messageHash:compiled.messageHash,intentIds:compiled.intents.map(item=>item.id),ownerRoutes:compiled.ownerRoutes,status:compiled.status},evidence,decisions,missingEvidence:decisions.flatMap(decision=>decision.evidenceIds.filter(id=>!evidence.some(item=>item.id===id))),staleEvidence:evidence.filter(item=>item.freshness==='stale').map(item=>item.id),privateRawContextStored:false,exactLocationStored:false,automaticMutation:false});
}
function gateContext(input={}){
  const purpose=clean(input.purpose),grant=input.grant||{},now=Date.parse(input.now||new Date().toISOString()),expires=Date.parse(grant.expiresAt||0),allowed=grant.granted===true&&PURPOSES.has(purpose)&&(!Number.isFinite(expires)||expires>=now);
  if(!allowed)return immutable({contractId:CONTRACT_ID,kind:'on-device-context-gate',allowed:false,purpose,reason:grant.granted!==true?'no-explicit-grant':!PURPOSES.has(purpose)?'purpose-not-allowed':'grant-expired',context:null,persist:false});
  const source=input.context||{},precision=grant.precision==='precise'?'precise':'coarse',coordinates=source.coordinates||source.position||null,reduced=coordinates&&Number.isFinite(Number(coordinates.lat??coordinates.latitude))&&Number.isFinite(Number(coordinates.lng??coordinates.longitude))?{lat:precision==='precise'?Number(coordinates.lat??coordinates.latitude):Number(Number(coordinates.lat??coordinates.latitude).toFixed(2)),lng:precision==='precise'?Number(coordinates.lng??coordinates.longitude):Number(Number(coordinates.lng??coordinates.longitude).toFixed(2))}:null;
  return immutable({contractId:CONTRACT_ID,kind:'on-device-context-gate',allowed:true,purpose,precision,context:{coordinates:reduced,observedAt:iso(source.observedAt),source:clean(source.source)||'device'},persist:false,expiresAt:iso(grant.expiresAt)});
}
function causalFeedback(input={}){const explicit=input.explicit===true,confirmed=input.confirmedOutcome===true;if(!explicit||!confirmed)return immutable({contractId:CONTRACT_ID,kind:'causal-feedback-learning',accepted:false,reason:!explicit?'feedback-not-explicit':'outcome-not-confirmed',proposedAdjustments:[],automaticProfileMutation:false});const outcome=clean(input.outcome),signals=(input.signals||[]).filter(signal=>clean(signal.feature)&&Number.isFinite(Number(signal.effect))).slice(0,12),proposedAdjustments=signals.map(signal=>({feature:clean(signal.feature),delta:Number(clamp(Number(signal.effect),-.08,.08).toFixed(3)),basis:clean(signal.basis)||outcome,evidenceId:clean(signal.evidenceId)||null,requiresIdentityOwnerConfirmation:true}));return immutable({contractId:CONTRACT_ID,kind:'causal-feedback-learning',accepted:Boolean(proposedAdjustments.length),outcome,proposedAdjustments,automaticProfileMutation:false,ownerRoute:'identity.v1'})}
function orchestrate(message,input={}){const compiled=compileIntent(message,input),trace=planningTrace({compiled,evidence:input.evidence,decisions:input.decisions,now:input.now});return immutable({contractId:CONTRACT_ID,kind:'travel-orchestration-proposal',compiled,trace,ownerCommands:compiled.intents.map(intent=>({owner:intent.owner,ownerContract:intent.ownerContract,ownerAvailability:intent.ownerAvailability,intentId:intent.id,mode:intent.mode,requiresConfirmation:intent.requiresConfirmation,blocked:compiled.blockedCommands.some(item=>item.intentIds?.includes(intent.id)),missingInputs:intent.missingInputs,payload:{clause:intent.clause,categoryHints:intent.categoryHints,temporalHint:intent.temporalHint,entityHints:intent.entityHints}})),automaticMutation:false})}
function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserless:true,features:['multi-intent-compiler','owner-route-graph','conflict-detection','missing-input-detection','offline-command-gate','explainable-planning-trace','causal-feedback-learning','on-device-context-gate'],ownerRouted:true,directOwnerMutation:false,rawMessagePersistence:false})}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,compileIntent,planningTrace,gateContext,causalFeedback,orchestrate,diagnostics});
})();
