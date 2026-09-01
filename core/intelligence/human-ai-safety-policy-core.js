var LuviaHumanAISafetyPolicyCoreV1=(()=>{
'use strict';

const CONTRACT_ID='intelligence.human-ai-safety-policy.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const CLASSIFICATIONS=Object.freeze({
  READ_PRESENTATION:'READ_PRESENTATION',
  NAVIGATION_OPEN:'NAVIGATION_OPEN',
  DRAFT:'DRAFT',
  INTERNAL_WRITE:'INTERNAL_WRITE',
  EXTERNAL_TRANSACTION:'EXTERNAL_TRANSACTION',
  HIGH_RISK_OR_PERMISSION:'HIGH_RISK_OR_PERMISSION'
});
const SCOPES=Object.freeze({PUBLIC:'PUBLIC',SELF:'SELF',TRIP_MEMBER:'TRIP_MEMBER',TRIP_ADMIN:'TRIP_ADMIN',SYSTEM_ADMIN:'SYSTEM_ADMIN'});
const DECISIONS=Object.freeze({
  ALLOW:'ALLOW',AUTHENTICATION_REQUIRED:'AUTHENTICATION_REQUIRED',SCOPE_DENIED:'SCOPE_DENIED',REAUTH_REQUIRED:'REAUTH_REQUIRED',
  CONSENT_REQUIRED:'CONSENT_REQUIRED',NETWORK_REQUIRED:'NETWORK_REQUIRED',PROVIDER_UNAVAILABLE:'PROVIDER_UNAVAILABLE',
  USER_GESTURE_REQUIRED:'USER_GESTURE_REQUIRED',CONFIRMATION_REQUIRED:'CONFIRMATION_REQUIRED',ACTION_UNAVAILABLE:'ACTION_UNAVAILABLE'
});
const DESTRUCTIVE=/(?:\.delete|\.remove|\.clear|\.archive|\.dissolve|cancel\.submit|session\.sign-out)$/;
const PUBLIC_ACTION=/^(?:demo\.|auth\.(?:mode\.|email\.(?:sign-in|sign-up)$|oauth\.|password\.reset\.|recovery\.|anonymous-upgrade\.)|ui\.(?:sheet\.close|nested-sheet\.back|section\.|carousel\.|list\.more|retry|refresh)$)/;
const TRIP_ADMIN_ACTION=/^(?:trip\.(?:archive|restore|invite\.)|places\.(?:favorites\.clear|schedule\.clear)|journey\.entries\.clear|media\.gallery\.clear)/;
const TRIP_MEMBER_DOMAIN=/^(?:places\.|journey\.|collaboration\.|booking\.|media\.|memory\.|events\.)/;
const SELF_TRIP_ACTION=/^trip\.(?:list$|active\.select$|open$|draft\.|create$|join\.|archived\.toggle-visibility$)/;
const HIGH_RISK=/(?:^R4$|R4)/;
const text=value=>String(value??'').trim();
const unique=value=>[...new Set((Array.isArray(value)?value:[]).map(text).filter(Boolean))];
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
function immutable(value){if(value&&typeof value==='object'){Object.values(value).forEach(immutable);Object.freeze(value)}return value}
function actionId(action){return text(action?.id||action?.actionId)}
function classify(action={}){
  const id=actionId(action),effect=text(action.effect).toUpperCase(),risk=text(action.risk).toUpperCase();
  if(effect==='PERMISSION'||HIGH_RISK.test(risk)||(action?.lifecycle?.stateChanging===true&&DESTRUCTIVE.test(id)))return CLASSIFICATIONS.HIGH_RISK_OR_PERMISSION;
  if(effect==='EXTERNAL')return CLASSIFICATIONS.EXTERNAL_TRANSACTION;
  if(effect==='WRITE')return CLASSIFICATIONS.INTERNAL_WRITE;
  if(effect==='DRAFT')return CLASSIFICATIONS.DRAFT;
  if(effect==='NAVIGATION')return CLASSIFICATIONS.NAVIGATION_OPEN;
  return CLASSIFICATIONS.READ_PRESENTATION;
}
function requiredScope(action={}){
  const id=actionId(action);
  if(PUBLIC_ACTION.test(id))return SCOPES.PUBLIC;
  if(TRIP_ADMIN_ACTION.test(id))return SCOPES.TRIP_ADMIN;
  if(SELF_TRIP_ACTION.test(id))return SCOPES.SELF;
  if(/^trip\./.test(id)||TRIP_MEMBER_DOMAIN.test(id))return SCOPES.TRIP_MEMBER;
  return SCOPES.SELF;
}
function consentRequirements(action={}){
  const id=actionId(action),requirements=[];
  if(/^(?:device\.loca(?:tion)\.|places\.loca(?:tion)\.|settings\.loca(?:tion)-sharing\.)/.test(id))requirements.push('GEOLOCATION');
  if(/^(?:device\.camera\.|media\.capture\.)/.test(id))requirements.push('CAMERA');
  if(/^(?:device\.notification|device\.notifications|settings\.notifications)/.test(id))requirements.push('NOTIFICATIONS');
  if(/(?:native-share|\.email$|\.whatsapp$|device\.share\.)/.test(id))requirements.push('EXTERNAL_SHARE');
  if(/(?:profile\.export|story\.export|photo\.download|device\.download)/.test(id))requirements.push('DATA_EXPORT');
  if(/settings\.(?:personalization|activity-data)\.update/.test(id))requirements.push('PERSONALIZATION');
  return unique(requirements);
}
function providerGate(action={}){
  const id=actionId(action);
  if(/^auth\.(?!mode\.)/.test(id))return'AUTH_PROVIDER';
  if(/^(?:places\.(?:discovery\.search|restaurant\.search|results\.|detail\.(?:open|gallery\.open|website\.open|maps\.open)|loca(?:tion)\.refresh)|trip\.draft\.destination\.search)/.test(id))return'PLACES_PROVIDER';
  if(/^booking\.(?:availability|external-handoff|reservation|refresh|timeline|route|channel|modify|cancel|recovery|inbox|message|thread|intelligence-action)/.test(id))return'BOOKING_PROVIDER';
  if(/^events\./.test(id))return'VERIFIED_EVENT_PROVIDER';
  if(/^ai\.chat\.(?:prompt\.submit|read\.|sequence\.continue)/.test(id))return'AI_RUNTIME';
  return null;
}
function confirmationPolicy(action={},classification=classify(action)){
  const configured=text(action?.lifecycle?.confirmationPolicy||action?.confirmation).toUpperCase();
  if(text(action.effect).toUpperCase()==='PERMISSION')return'USER_GESTURE';
  if(classification===CLASSIFICATIONS.HIGH_RISK_OR_PERMISSION&&DESTRUCTIVE.test(actionId(action)))return'EXPLICIT';
  return['NEVER','USER_GESTURE','EXPLICIT'].includes(configured)?configured:(action?.lifecycle?.stateChanging===true?'EXPLICIT':'NEVER');
}
function compilePolicy(action={}){
  const id=actionId(action);if(!id)throw new TypeError('Human-AI safety policy requires an action id.');
  const classification=classify(action),gate=providerGate(action),effect=text(action.effect).toUpperCase()||'READ',risk=text(action.risk).toUpperCase()||'R0';
  return immutable({
    actionId:id,classification,effect,risk,requiredScope:requiredScope(action),
    reauthRequired:/^(?:auth\.password\.update|auth\.provider\..*\.link|identity\.profile\.export)$/.test(id),reauthMaxAgeSeconds:600,
    consentRequirements:consentRequirements(action),providerGate:gate,networkPolicy:gate||effect==='EXTERNAL'?'ONLINE_REQUIRED':'OFFLINE_CAPABLE',
    userGestureRequired:effect==='PERMISSION'||effect==='EXTERNAL'||/(?:\.open$|\.copy$|\.call$|\.download$)/.test(id),
    confirmationPolicy:confirmationPolicy(action,classification),stateChanging:action?.lifecycle?.stateChanging===true,
    humanStatus:text(action?.human?.status)||'AVAILABLE',naturalLanguageConfirmsMutation:false,ownerExecution:false
  });
}
function hasScope(required,actor={}){
  if(required===SCOPES.PUBLIC)return true;
  if(actor.authenticated!==true)return false;
  const scopes=new Set(unique(actor.scopes).map(item=>item.toUpperCase())),role=text(actor.tripRole).toUpperCase();
  if(scopes.has(required)||scopes.has('SYSTEM_ADMIN')||role==='SYSTEM_ADMIN')return true;
  if(required===SCOPES.SELF)return true;
  if(required===SCOPES.TRIP_MEMBER)return['MEMBER','OWNER','ADMIN'].includes(role)||scopes.has('TRIP_MEMBER')||scopes.has('TRIP_ADMIN');
  if(required===SCOPES.TRIP_ADMIN)return['OWNER','ADMIN'].includes(role)||scopes.has('TRIP_ADMIN');
  return false;
}
function outcome(policy,decision,message,missing=[]){
  return immutable({actionId:policy.actionId,decision,allowed:decision===DECISIONS.ALLOW,ownerExecution:false,nextGate:decision===DECISIONS.ALLOW?'INPUT_VALIDATION':decision,message,missing:unique(missing),policy:clone(policy)});
}
function evaluate(input={}){
  const policy=input.policy?immutable(clone(input.policy)):compilePolicy(input.action||{}),actor=input.actor&&typeof input.actor==='object'?input.actor:{};
  if(!['AVAILABLE','CONDITIONAL'].includes(text(policy.humanStatus).toUpperCase()))return outcome(policy,DECISIONS.ACTION_UNAVAILABLE,'Diese Funktion ist für dich gerade nicht verfügbar.');
  if(policy.requiredScope!==SCOPES.PUBLIC&&actor.authenticated!==true)return outcome(policy,DECISIONS.AUTHENTICATION_REQUIRED,'Bitte melde dich an, um fortzufahren.');
  if(!hasScope(policy.requiredScope,actor))return outcome(policy,DECISIONS.SCOPE_DENIED,'Du hast für diese Reiseaktion nicht die nötige Berechtigung.',[policy.requiredScope]);
  if(policy.reauthRequired){const now=Number.isFinite(Number(actor.nowEpochSeconds))?Number(actor.nowEpochSeconds):Math.floor(Date.now()/1000),reauth=Number(actor.reauthenticatedAtEpochSeconds);if(!Number.isFinite(reauth)||now-reauth>policy.reauthMaxAgeSeconds)return outcome(policy,DECISIONS.REAUTH_REQUIRED,'Bitte bestätige aus Sicherheitsgründen noch einmal deine Anmeldung.');}
  const grants=new Set(unique(actor.consents));const missingConsents=(policy.consentRequirements||[]).filter(item=>!grants.has(item));
  if(missingConsents.length)return outcome(policy,DECISIONS.CONSENT_REQUIRED,'Dafür brauche ich zuerst deine ausdrückliche Freigabe.',missingConsents);
  if(policy.networkPolicy==='ONLINE_REQUIRED'&&actor.online!==true)return outcome(policy,DECISIONS.NETWORK_REQUIRED,'Diese Aktion braucht eine Internetverbindung.');
  if(policy.providerGate){const providers=actor.providers&&typeof actor.providers==='object'?actor.providers:{};if(providers[policy.providerGate]!==true)return outcome(policy,DECISIONS.PROVIDER_UNAVAILABLE,'Der zuständige Dienst ist gerade nicht erreichbar.',[policy.providerGate]);}
  if(policy.userGestureRequired&&actor.userGesture!==true)return outcome(policy,DECISIONS.USER_GESTURE_REQUIRED,'Bitte löse diesen Schritt selbst über die sichtbare Aktion aus.');
  if(policy.confirmationPolicy==='EXPLICIT'&&actor.confirmed!==true)return outcome(policy,DECISIONS.CONFIRMATION_REQUIRED,'Prüfe die Vorschau und bestätige die Änderung ausdrücklich.');
  return outcome(policy,DECISIONS.ALLOW,'Berechtigung und Sicherheitsvoraussetzungen sind erfüllt.');
}
function describeCoverage(catalog=[]){
  const actions=Array.isArray(catalog)?catalog:[],policies=actions.map(compilePolicy),countBy=key=>policies.reduce((out,item)=>(out[item[key]]=(out[item[key]]||0)+1,out),{});
  return immutable({contractId:CONTRACT_ID,version:VERSION,catalogActions:actions.length,policyActions:policies.length,classifications:countBy('classification'),scopes:countBy('requiredScope'),reauthRequired:policies.filter(item=>item.reauthRequired).length,consentGated:policies.filter(item=>item.consentRequirements.length).length,providerGated:policies.filter(item=>item.providerGate).length,onlineRequired:policies.filter(item=>item.networkPolicy==='ONLINE_REQUIRED').length,naturalLanguageConfirmsMutation:false,ownerExecution:false});
}
return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,classifications:CLASSIFICATIONS,scopes:SCOPES,decisions:DECISIONS,classify,compilePolicy,evaluate,describeCoverage});
})();
