var LuviaCollaborationInteractionContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='collaboration.interaction.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const clean=value=>String(value??'').trim();
function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function fail(code,message){throw Object.assign(new Error(message),{code})}
function inviteCode(value){const code=clean(value).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12);if(code.length<5)fail('COLLABORATION_INVITE_CODE_INVALID','Bitte einen gültigen Einladungscode angeben.');return code}
function memberName(value){const name=clean(value).slice(0,80);if(!name)fail('COLLABORATION_MEMBER_NAME_REQUIRED','Anzeigename fehlt.');return name}
function trip(input={}){
  const id=clean(input.id||input.tripId||input.trip_id),title=clean(input.title||input.tripName||input.trip_name)||'Unsere Reise',code=inviteCode(input.joinCode||input.join_code);
  if(!id)fail('COLLABORATION_TRIP_REQUIRED','Reise fehlt.');
  return immutable({id,title,joinCode:code,destinationName:clean(input.destinationName||input.destination?.name),symbol:clean(input.symbol)||'✦',accent:clean(input.accent)||'#ee6f83'});
}
function invitePayload(input={},baseUrl=''){
  const selected=trip(input),root=clean(baseUrl).replace(/[?#].*$/,'')||'index.html',url=`${root}${root.includes('?')?'&':'?'}join=${encodeURIComponent(selected.joinCode)}`,text=`Komm mit auf unsere Reise ${selected.title}. ${url}`;
  return immutable({trip:selected,code:selected.joinCode,url,title:`Einladung zu ${selected.title}`,text});
}
function preview(input={}){
  const id=clean(input.trip_id||input.tripId||input.id);if(!id)fail('COLLABORATION_INVITE_UNAVAILABLE','Einladung enthält keine Reise.');
  return immutable({tripId:id,title:clean(input.trip_name||input.tripName||input.title)||'Unsere Reise',destinationName:clean(input.destination_name||input.destinationName),symbol:clean(input.symbol)||'✦',accent:clean(input.accent)||'#ee6f83',memberCount:Math.max(0,Number(input.member_count||input.memberCount)||0),available:true});
}
function voteChoice(value){
  if(value===true)return Object.freeze({id:'yes',providerValue:true,label:'Ja'});
  if(value===false)return Object.freeze({id:'no',providerValue:false,label:'Nein'});
  const choice=clean(value).toLowerCase();
  if(['yes','ja','approve','approved'].includes(choice))return Object.freeze({id:'yes',providerValue:true,label:'Ja'});
  if(['no','nein','reject','rejected'].includes(choice))return Object.freeze({id:'no',providerValue:false,label:'Nein'});
  if(['abstain','enthalten','skip','neutral'].includes(choice)||value==null)return Object.freeze({id:'abstain',providerValue:null,label:'Enthalten'});
  fail('COLLABORATION_VOTE_INVALID','Stimme muss Ja, Nein oder Enthalten sein.');
}
function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserless:true,membershipTruth:false,providerBoundary:'existing-trip-membership-and-proposal-providers'});}
return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,inviteCode,memberName,trip,invitePayload,preview,voteChoice,diagnostics});
})();
