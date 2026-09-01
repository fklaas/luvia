var LuviaAuthCommandContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='auth.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const MODES=Object.freeze(['login','register']);
const PROVIDERS=Object.freeze(['google','apple']);
const clean=value=>String(value??'').trim();

function clone(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clone(item)]));
}
function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function failure(code,message){throw Object.assign(new Error(message),{code})}
function mode(value){
  const normalized=clean(value).toLowerCase();
  if(!MODES.includes(normalized))failure('AUTH_MODE_INVALID','Anmeldemodus muss login oder register sein.');
  return normalized;
}
function provider(value){
  const normalized=clean(value).toLowerCase();
  if(!PROVIDERS.includes(normalized))failure('AUTH_PROVIDER_INVALID','Nur Google oder Apple sind als Anmeldeanbieter erlaubt.');
  return normalized;
}
function email(value){
  const normalized=clean(value).toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))failure('AUTH_EMAIL_INVALID','Bitte eine gültige E-Mail-Adresse angeben.');
  return normalized;
}
function password(value){
  const normalized=String(value??'');
  if(normalized.length<6)failure('AUTH_PASSWORD_INVALID','Das Passwort muss mindestens 6 Zeichen lang sein.');
  return normalized;
}
function profile(input={}){
  return immutable({
    firstName:clean(input.firstName).slice(0,80),
    lastName:clean(input.lastName).slice(0,80),
    displayName:clean(input.displayName).slice(0,120),
    preferences:input.preferences&&typeof input.preferences==='object'?clone(input.preferences):null,
    travelIdea:input.travelIdea&&typeof input.travelIdea==='object'?clone(input.travelIdea):null
  });
}
function createModeIntent(value){
  const selected=mode(value);
  return immutable({kind:'auth.mode.select',contractId:CONTRACT_ID,version:VERSION,mode:selected,stateChanging:false,requiresConfirmation:false});
}
function projectState(input={}){
  const user=input.user||{};
  const pending=input.pendingUpgrade||null;
  return immutable({
    loading:Boolean(input.loading),
    anonymous:Boolean(input.anonymous),
    authenticated:Boolean(input.authenticated),
    signedOut:Boolean(input.signedOut),
    email:clean(input.email||user.email||pending?.email).toLowerCase(),
    emailConfirmed:Boolean(input.emailConfirmed),
    provider:clean(input.provider),
    providers:(Array.isArray(input.identities)?input.identities:[]).map(identity=>clean(identity?.provider)).filter(Boolean),
    user:user?.id?{
      id:clean(user.id),
      email:clean(user.email).toLowerCase(),
      displayName:clean(user.user_metadata?.display_name||user.user_metadata?.name),
      firstName:clean(user.user_metadata?.first_name),
      lastName:clean(user.user_metadata?.last_name)
    }:null,
    pendingUpgrade:pending?{
      email:clean(pending.email).toLowerCase(),
      firstName:clean(pending.firstName),
      lastName:clean(pending.lastName),
      displayName:clean(pending.displayName),
      stage:clean(pending.stage),
      requestedAt:clean(pending.requestedAt),
      confirmedAt:clean(pending.confirmedAt)
    }:null,
    lastEvent:clean(input.lastEvent)
  });
}
function receipt(action,state,details={}){
  return immutable({ok:true,action:clean(action),contractId:CONTRACT_ID,version:VERSION,state:projectState(state),details:clone(details)});
}
function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserless:true,modes:MODES,providers:PROVIDERS,sensitiveOutput:Object.freeze([])});}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,modes:MODES,providers:PROVIDERS,mode,provider,email,password,profile,createModeIntent,projectState,receipt,diagnostics});
})();
