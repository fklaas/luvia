var LuviaHumanAIConsumerProjectionCoreV1=(()=>{
'use strict';

const CONTRACT_ID='intelligence.human-ai-consumer-projection.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const STATES=Object.freeze([
  'AVAILABLE_NOW','AVAILABLE_AFTER_CONFIRMATION','AVAILABLE_AFTER_USER_GESTURE','NEEDS_INPUT',
  'AUTHENTICATION_REQUIRED','SCOPE_DENIED','REAUTH_REQUIRED','CONSENT_REQUIRED','NETWORK_REQUIRED',
  'PROVIDER_UNAVAILABLE','AI_ROUTE_MISSING','OWNER_UNAVAILABLE','INPUT_CONTRACT_MISSING',
  'ACTION_UNAVAILABLE','NOT_APPLICABLE'
]);
const FIELD_LABELS=Object.freeze({
  query:'deinen Wunsch',tripId:'die Reise',placeRef:'den Ort',providerPlaceId:'den Ort',placeId:'den Ort',
  fields:'Datum und Uhrzeit',date:'das Datum',time:'die Uhrzeit',duration:'die Dauer',partySize:'die Personenzahl',
  bookingRef:'die Buchung',bookingId:'die Buchung',entryRef:'den Reisemoment',title:'einen Titel',value:'den neuen Wert',
  'location':'den Ort',destination:'das Reiseziel',dateRange:'den Reisezeitraum',email:'die E-Mail-Adresse',
  code:'den Code',url:'den Link',reason:'den Grund',preferenceValues:'die gewünschten Vorlieben',
  privacyPurpose:'wofür dein Standort verwendet werden darf',choice:'deine Auswahl',place:'den ausgewählten Ort',
  startAt:'Datum und Uhrzeit',endAt:'die Endzeit',items:'den Inhalt'
});
const COPY=Object.freeze({
  AVAILABLE_NOW:{tone:'ready',view:'ACTION',eyebrow:'Bereit',message:'Ich kann direkt weitermachen.',primary:'Jetzt anzeigen'},
  AVAILABLE_AFTER_CONFIRMATION:{tone:'attention',view:'PREVIEW',eyebrow:'Noch einmal prüfen',message:'Prüfe zuerst die Angaben. Geändert wird erst nach deiner Bestätigung.',primary:'Vorschau ansehen',secondary:'Abbrechen'},
  AVAILABLE_AFTER_USER_GESTURE:{tone:'attention',view:'HANDOFF',eyebrow:'Dein nächster Schritt',message:'Diese Aktion braucht einen sichtbaren Klick von dir.',primary:'Jetzt öffnen'},
  NEEDS_INPUT:{tone:'attention',view:'QUESTION',eyebrow:'Eine Angabe fehlt',message:'Dafür brauche ich noch eine kurze Angabe.',primary:'Angabe ergänzen'},
  AUTHENTICATION_REQUIRED:{tone:'attention',view:'HANDOFF',eyebrow:'Anmeldung nötig',message:'Melde dich bitte an, damit ich sicher fortfahren kann.',primary:'Anmelden'},
  SCOPE_DENIED:{tone:'blocked',view:'NOTICE',eyebrow:'Nicht möglich',message:'Deine Rolle in dieser Reise erlaubt diese Änderung nicht.',primary:null},
  REAUTH_REQUIRED:{tone:'attention',view:'HANDOFF',eyebrow:'Kurz bestätigen',message:'Bestätige bitte erneut deine Anmeldung.',primary:'Anmeldung bestätigen'},
  CONSENT_REQUIRED:{tone:'attention',view:'PERMISSION',eyebrow:'Deine Freigabe',message:'Dafür brauche ich zuerst deine ausdrückliche Freigabe.',primary:'Freigabe prüfen'},
  NETWORK_REQUIRED:{tone:'blocked',view:'RETRY',eyebrow:'Keine Verbindung',message:'Dafür wird eine Internetverbindung benötigt.',primary:'Erneut versuchen'},
  PROVIDER_UNAVAILABLE:{tone:'blocked',view:'RETRY',eyebrow:'Gerade nicht erreichbar',message:'Die benötigten aktuellen Informationen sind gerade nicht erreichbar.',primary:'Erneut versuchen',secondary:'Selbst öffnen'},
  AI_ROUTE_MISSING:{tone:'attention',view:'HANDOFF',eyebrow:'In der App verfügbar',message:'Diese Funktion kannst du bereits im passenden Bereich verwenden.',primary:'Bereich öffnen'},
  OWNER_UNAVAILABLE:{tone:'blocked',view:'RETRY',eyebrow:'Gerade nicht erreichbar',message:'Der passende Bereich kann die Anfrage gerade nicht übernehmen.',primary:'Erneut versuchen'},
  INPUT_CONTRACT_MISSING:{tone:'attention',view:'HANDOFF',eyebrow:'In der App verfügbar',message:'Diese Funktion ist im Chat noch nicht sicher vorbereitet.',primary:'Bereich öffnen'},
  ACTION_UNAVAILABLE:{tone:'blocked',view:'NOTICE',eyebrow:'Noch nicht verfügbar',message:'Diese Funktion steht gerade nicht zur Verfügung.',primary:null},
  NOT_APPLICABLE:{tone:'quiet',view:'HIDDEN',eyebrow:'',message:'',primary:null}
});

function immutable(value){if(value&&typeof value==='object'){Object.values(value).forEach(immutable);Object.freeze(value)}return value}
function clean(value){return String(value??'').replace(/\s+/g,' ').trim()}
function unique(values){return[...new Set((Array.isArray(values)?values:[]).map(clean).filter(Boolean))]}
function titleCase(value){const text=clean(value);return text?text.charAt(0).toLocaleUpperCase('de-DE')+text.slice(1):''}
function formatDate(value){const raw=clean(value),match=raw.match(/^(\d{4})-(\d{2})-(\d{2})/);if(match)return`${match[3]}.${match[2]}.${match[1]}`;const german=raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);return german?`${german[1].padStart(2,'0')}.${german[2].padStart(2,'0')}.${german[3]}`:raw}
function formatTime(value){const match=clean(value).match(/(?:T|^)(\d{1,2}):(\d{2})/);return match?`${match[1].padStart(2,'0')}:${match[2]} Uhr`:clean(value)}
function consumerText(value,fallback=''){
  let text=clean(value)||clean(fallback);
  text=text
    .replace(/\bAction Ledger\b/gi,'Verlauf')
    .replace(/\bOwner[- ]?Receipt\b/gi,'Bestätigung')
    .replace(/\bReceipt\b/gi,'Bestätigung')
    .replace(/\bOwner\b/gi,'zuständiger Bereich')
    .replace(/\bMutation(?:en)?\b/gi,'Änderungen')
    .replace(/\bPreview\b/gi,'Vorschau')
    .replace(/\bLifecycle\b/gi,'Ablauf')
    .replace(/\bProvider\b/gi,'Dienst')
    .replace(/\bContract\b/gi,'Verbindung')
    .replace(/\b(?:[a-z][a-z0-9-]*\.){2,}[a-z0-9-]+\b/gi,'interne Funktion')
    .replace(/\b\d{4}-(\d{2})-(\d{2})\b/g,(_,month,day)=>`${day}.${month}.${_.slice(0,4)}`);
  return clean(text);
}
function fieldLabel(field){const key=clean(field).split('.').at(-1);return FIELD_LABELS[field]||FIELD_LABELS[key]||clean(field).replace(/[_-]+/g,' ')}
function actionTitle(action={}){return consumerText(action.label||action.title||action.id,'Diese Aktion')}
function mode(action={}){
  const effect=clean(action.effect).toUpperCase(),stateChanging=action?.lifecycle?.stateChanging===true;
  if(['UNAVAILABLE','HIDDEN'].includes(clean(action?.human?.status).toUpperCase()))return'UNAVAILABLE';
  if(effect==='READ')return'READ';
  if(effect==='NAVIGATION'||effect==='OPEN')return'OPEN';
  if(effect==='DRAFT'&&!stateChanging)return'DRAFT';
  if(effect==='EXTERNAL')return'EXTERNAL';
  return stateChanging||['WRITE','DELETE'].includes(effect)?'CHANGE':'ACTION';
}
function projectCapability(input={}){
  const action=input.action||{},capability=input.capability||{},state=STATES.includes(capability.state)?capability.state:'ACTION_UNAVAILABLE',copy=COPY[state],missing=unique(capability.missing).map(fieldLabel),manual=capability.manualFlow?.available===true,actionMode=mode(action),title=actionTitle(action);
  const message=state==='NEEDS_INPUT'&&missing.length
    ?`Dafür brauche ich noch ${missing.length===1?missing[0]:`${missing.slice(0,-1).join(', ')} und ${missing.at(-1)}`}.`
    :consumerText(capability.consumerMessage||copy.message,copy.message);
  const primary=copy.primary||(manual?'Bereich öffnen':null),secondary=copy.secondary||(manual&&state!=='AI_ROUTE_MISSING'?'Selbst öffnen':null);
  return immutable({contractId:CONTRACT_ID,actionId:clean(action.id||capability.actionId)||null,state,view:copy.view,tone:copy.tone,hidden:copy.view==='HIDDEN',title,eyebrow:state==='NEEDS_INPUT'&&missing.length>1?'Angaben fehlen':copy.eyebrow,message,details:missing,primaryAction:primary?{label:primary,kind:state==='AVAILABLE_AFTER_CONFIRMATION'?'PREVIEW':state==='NEEDS_INPUT'?'CLARIFY':state==='AVAILABLE_NOW'?'PROCEED':state.includes('NETWORK')||state.includes('UNAVAILABLE')?'RETRY':'OPEN'}:null,secondaryAction:secondary?{label:secondary,kind:secondary==='Abbrechen'?'CANCEL':'OPEN'}:null,requiresConfirmation:state==='AVAILABLE_AFTER_CONFIRMATION',actionMode,manualFlow:manual?{label:consumerText(capability.manualFlow.label,'Passenden Bereich öffnen'),surface:consumerText(capability.manualFlow.surface)}:null});
}
function projectCatalog(catalog=[]){return immutable((Array.isArray(catalog)?catalog:[]).map(action=>{const actionMode=mode(action),state=actionMode==='UNAVAILABLE'?'ACTION_UNAVAILABLE':action?.ai?.runtimeRegistered===true?(action?.lifecycle?.stateChanging===true?'AVAILABLE_AFTER_CONFIRMATION':'AVAILABLE_NOW'):'AI_ROUTE_MISSING';return projectCapability({action,capability:{actionId:action.id,state,manualFlow:{available:['AVAILABLE','CONDITIONAL'].includes(clean(action?.human?.status).toUpperCase()),label:`${actionTitle(action)} selbst öffnen`,surface:action.surface}}})}))}
function projectIntentSummary(compiled={}){
  const intents=Array.isArray(compiled.intents)?compiled.intents:[],issues=[...(compiled.conflicts||[]),...(compiled.blockedCommands||[]),...(compiled.missingInputs||[])],simpleResolved=compiled.status==='compiled'&&intents.length===1&&!issues.length;
  if(!intents.length)return immutable({visible:false,title:'',items:[],message:''});
  const items=intents.slice(0,4).map((intent,index)=>({sequence:index+1,label:consumerText(intent.consumerLabel||intent.clause||intent.label,`Wunsch ${index+1}`),requiresConfirmation:intent.mode!=='read'}));
  const missing=unique((compiled.missingInputs||[]).map(item=>fieldLabel(item.input||item.field||item)));
  const state=compiled.status==='needs-clarification'?'QUESTION':compiled.status==='blocked'?'BLOCKED':compiled.status==='conflicted'?'CONFLICT':'READY';
  const title=state==='QUESTION'?'Eine Angabe fehlt':state==='BLOCKED'?'So kann ich das nicht ausführen':state==='CONFLICT'?'Bitte entscheide dich':`Ich kümmere mich um ${items.length} Dinge`;
  const message=missing.length?`Ergänze bitte ${missing.length===1?missing[0]:`${missing.slice(0,-1).join(', ')} und ${missing.at(-1)}`}.`:items.some(item=>item.requiresConfirmation)?'Änderungen zeige ich dir zuerst zur Bestätigung.':'';
  return immutable({visible:!simpleResolved,state,title,message,items});
}
function previewDetails(preview={}){
  const date=formatDate(preview.date||preview.startAt),clock=formatTime(preview.time||preview.startAt),details=[];
  if(preview.name||preview.title)details.push({label:'Was',value:consumerText(preview.name||preview.title)});
  if(date)details.push({label:'Datum',value:date});
  if(clock)details.push({label:'Uhrzeit',value:clock});
  if(preview.partySize)details.push({label:'Personen',value:String(preview.partySize)});
  if(preview.duration)details.push({label:'Dauer',value:consumerText(preview.duration)});
  return details.slice(0,5);
}
function projectPreview(input={}){
  const result=input.result||{},preview=input.preview||result?.evidence?.preview||{},details=previewDetails(preview),undo=input.compensatesLedgerId||input.undo===true,title=undo?'Änderung rückgängig machen?':consumerText(result.title||input.title,'Bitte noch einmal prüfen');
  return immutable({contractId:CONTRACT_ID,view:'PREVIEW',tone:'attention',eyebrow:'Bitte prüfen',title,message:consumerText(result.message||input.message,undo?'Die vorherige Änderung wird zurückgenommen.':'Erst nach deiner Bestätigung wird etwas geändert.'),details,note:undo?'Auch das Rückgängigmachen wird erst nach deiner Bestätigung ausgeführt.':'Du entscheidest. Ohne Bestätigung bleibt alles unverändert.',primaryAction:{label:undo?'Rückgängig machen':'Bestätigen',kind:'CONFIRM'},secondaryAction:{label:'Abbrechen',kind:'CANCEL'}})
}
function projectReceipt(input={}){
  const result=input.result||{},status=clean(input.status||result?.evidence?.status||result.status||'completed').toLowerCase(),recoveryKind=clean(input.recoveryKind),states={completed:{tone:'success',eyebrow:'Erledigt',title:'Änderung gespeichert'},opened:{tone:'success',eyebrow:'Geöffnet',title:'Für dich geöffnet'},failed:{tone:'blocked',eyebrow:'Nicht ausgeführt',title:'Das hat nicht geklappt'},outcome_unknown:{tone:'attention',eyebrow:'Wird geprüft',title:'Der Ausgang ist noch offen'},cancelled:{tone:'quiet',eyebrow:'Verworfen',title:'Nichts wurde geändert'},compensated:{tone:'success',eyebrow:'Rückgängig gemacht',title:'Die Änderung wurde zurückgenommen'}},copy=states[status]||states.completed;
  const primary=recoveryKind==='undo'?{label:'Rückgängig machen',kind:'UNDO'}:recoveryKind==='retry'?{label:'Erneut versuchen',kind:'RETRY'}:null;
  const note=recoveryKind==='reconcile'?'Ich prüfe zuerst den tatsächlichen Stand und wiederhole nichts automatisch.':recoveryKind==='manual'?'Falls du das zurücknehmen möchtest, öffne bitte den vorgesehenen Hilfeweg.':'';
  return immutable({contractId:CONTRACT_ID,view:'RECEIPT',tone:copy.tone,status,eyebrow:copy.eyebrow,title:consumerText(result.title,copy.title),message:consumerText(result.message,status==='completed'?'Die Änderung ist im aktuellen Stand angekommen.':copy.title),note,primaryAction:primary});
}
function projectReadFailure(input={}){const area=consumerText(input.area||input.result?.owner,'Diesen Teil');return immutable({contractId:CONTRACT_ID,view:'ERROR',tone:'blocked',eyebrow:'Gerade nicht verfügbar',title:`${titleCase(area)} konnte ich nicht zuverlässig laden`,message:'Versuche es noch einmal oder passe deinen Wunsch an. Es wurde nichts verändert.',primaryAction:{label:'Erneut versuchen',kind:'RETRY'},secondaryAction:{label:'Wunsch anpassen',kind:'REFINE'}})}
function projectResult(result={},options={}){return immutable({contractId:CONTRACT_ID,view:'RESULT',tone:result.kind==='error'?'blocked':'ready',eyebrow:consumerText(options.area||result.owner,'Für deine Reise'),title:consumerText(result.title,'Das habe ich gefunden'),message:consumerText(result.message),kind:clean(result.kind)||'message'})}
function projectSequenceTransition(input={}){const next=consumerText(input.nextLabel,'deinen nächsten Wunsch'),finished=input.finished===true;return immutable({title:finished?'Alles bearbeitet':'Als Nächstes',message:finished?'Alle Wünsche sind bearbeitet. Erledigte Änderungen bleiben im Verlauf sichtbar.':`Jetzt kümmere ich mich um ${next}.`})}
function describeCoverage(catalog=[]){const projections=projectCatalog(catalog),views=Object.fromEntries([...new Set(projections.map(item=>item.view))].sort().map(view=>[view,projections.filter(item=>item.view===view).length]));return immutable({catalogActions:projections.length,projectedActions:projections.length,consumerViews:views,capabilityStates:STATES.length,technicalVocabularyHidden:true,duplicateSingleIntentSuppressed:true,dateFormat:'TT.MM.JJJJ'})}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,states:STATES,formatDate,formatTime,consumerText,projectCapability,projectCatalog,projectIntentSummary,projectPreview,projectReceipt,projectReadFailure,projectResult,projectSequenceTransition,describeCoverage});
})();
