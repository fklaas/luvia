(()=>{
'use strict';

const core=globalThis.LuviaAuthCommandContractCoreV1;
if(!core)throw new Error('Auth Contract v1: Browserless Core fehlt.');
const CONTRACT_ID=core.contractId;
const VERSION=core.version;
const RUNTIME_VERSION='1.0.0-owner-adapter';

function unavailable(){throw Object.assign(new Error('Auth Contract v1: Auth-Owner ist noch nicht bereit.'),{code:'AUTH_OWNER_UNAVAILABLE'})}
function runtime(){const api=globalThis.LuviaAuth;if(!api)unavailable();return api}
function state(){return core.projectState(runtime().getState?.()||{})}
function done(action,details={}){return core.receipt(action,runtime().getState?.()||{},details)}
function selectMode(value){return core.createModeIntent(value)}
function getState(){return state()}

async function signInWithPassword(input={}){
  await runtime().signIn(core.email(input.email),core.password(input.password));
  return done('sign-in-with-password');
}
async function signUpWithPassword(input={}){
  const userProfile=core.profile(input.profile||input);
  await runtime().signUp({...userProfile,email:core.email(input.email),password:core.password(input.password)});
  return done('sign-up-with-password');
}
async function signInWithProvider(input={}){
  const provider=core.provider(input.provider);
  await runtime().signInWithProvider(provider);
  return done('sign-in-with-provider',{provider,redirectStarted:true});
}
async function requestPasswordReset(input={}){
  const email=core.email(input.email);
  await runtime().resetPassword(email);
  return done('request-password-reset',{email,delivery:'email'});
}
async function completePasswordReset(input={}){
  await runtime().updatePassword(core.password(input.password));
  return done('complete-password-reset');
}
async function linkProvider(input={}){
  const provider=core.provider(input.provider);
  await runtime().linkProvider(provider);
  return done('link-provider',{provider,redirectStarted:true});
}
async function updatePassword(input={}){
  await runtime().updatePassword(core.password(input.password));
  return done('update-password');
}
async function signOut(){await runtime().signOut();return done('sign-out')}
async function requestAnonymousEmail(input={}){
  const person=core.profile(input);
  await runtime().requestAnonymousEmail({...person,email:core.email(input.email)});
  return done('request-anonymous-email',{delivery:'email'});
}
async function checkAnonymousUpgrade(){
  const result=await runtime().checkUpgradeConfirmation();
  return done('check-anonymous-upgrade',{confirmed:Boolean(result?.confirmed)});
}
async function resendAnonymousEmail(){
  const pending=runtime().getState?.()?.pendingUpgrade;
  if(!pending?.email)throw Object.assign(new Error('Es gibt keine laufende Kontosicherung.'),{code:'AUTH_PENDING_UPGRADE_REQUIRED'});
  await runtime().requestAnonymousEmail({...pending,email:core.email(pending.email)});
  return done('resend-anonymous-email',{delivery:'email'});
}
async function changeAnonymousEmail(input={}){
  const current=runtime().getState?.()?.pendingUpgrade||{};
  runtime().cancelPendingUpgrade();
  await runtime().requestAnonymousEmail({...current,...core.profile(input),email:core.email(input.email)});
  return done('change-anonymous-email',{delivery:'email'});
}
async function completeAnonymousUpgrade(input={}){
  await runtime().completeAnonymousUpgrade(core.password(input.password));
  return done('complete-anonymous-upgrade');
}

const reads=Object.freeze({getState,checkAnonymousUpgrade});
const composition=Object.freeze({selectMode});
const commands=Object.freeze({signInWithPassword,signUpWithPassword,signInWithProvider,requestPasswordReset,completePasswordReset,linkProvider,updatePassword,signOut,requestAnonymousEmail,checkAnonymousUpgrade,resendAnonymousEmail,changeAnonymousEmail,completeAnonymousUpgrade});
const api=Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,reads,composition,commands,getState,selectMode,diagnostics:()=>Object.freeze({...core.diagnostics(),runtimeVersion:RUNTIME_VERSION,ready:Boolean(globalThis.LuviaAuth),owner:'platform-auth',tokenExposure:false,passwordExposure:false})});

globalThis.LuviaAuthContractV1=api;
globalThis.LuviaGlobalContracts?.register?.({id:CONTRACT_ID,version:VERSION,required:false,probe:()=>({available:Boolean(globalThis.LuviaAuth),detail:'Auth v1 public owner adapter'})});
})();
