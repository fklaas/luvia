(()=>{
'use strict';

const CONTRACT_ID='platform.actions.v1';
const VERSION='1';
const MODES=Object.freeze(['once','watch']);
const clean=value=>String(value??'').trim();
const immutable=value=>{
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
};
function boundedIntent(kind,input={}){
  const target=clean(input.target||input.operation||input.route||input.id);
  if(!target)throw new Error('PLATFORM_ACTION_TARGET_REQUIRED');
  return immutable({kind,target,reason:clean(input.reason)||null,stateChanging:false});
}
function retryIntent(input={}){return boundedIntent('retry',input)}
function refreshIntent(input={}){return boundedIntent('refresh',input)}
function locationRequest(input={}){
  const mode=MODES.includes(input.mode)?input.mode:'once';
  if(input.userGesture!==true)throw new Error('PLATFORM_USER_GESTURE_REQUIRED');
  return immutable({mode,accuracy:input.accuracy==='high'?'high':'balanced',timeoutMs:Math.max(1000,Math.min(60000,Number(input.timeoutMs)||15000)),userGesture:true});
}
function sharePayload(input={}){
  const payload={title:clean(input.title),text:clean(input.text),url:clean(input.url)};
  if(payload.url&&!/^https?:\/\//i.test(payload.url))throw new Error('PLATFORM_SHARE_URL_INVALID');
  if(!payload.title&&!payload.text&&!payload.url)throw new Error('PLATFORM_SHARE_PAYLOAD_REQUIRED');
  return immutable(payload);
}
function phoneTarget(value){
  const phone=clean(value?.phone||value).replace(/[^+0-9#*(),. -]/g,'');
  if(!/[0-9]/.test(phone))throw new Error('PLATFORM_PHONE_REQUIRED');
  return phone;
}
function filename(value='download'){
  const name=clean(value).replace(/[\\/:*?"<>|\u0000-\u001f]/g,'-').slice(0,160);
  return name||'download';
}

globalThis.LuviaPlatformActionContractCoreV1=Object.freeze({contractId:CONTRACT_ID,version:VERSION,retryIntent,refreshIntent,locationRequest,sharePayload,phoneTarget,filename});
})();
