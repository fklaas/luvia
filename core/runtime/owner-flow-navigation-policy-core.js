var LuviaOwnerFlowNavigationPolicyCoreV1=(()=>{
'use strict';

const CONTRACT_ID='owner-flow-navigation.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const TYPES=Object.freeze([
  'auth.login.success',
  'auth.logout',
  'join.open',
  'join.clear',
  'join.complete',
  'booking.external'
]);

function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function text(value,fallback=''){return String(value??fallback).trim()}
function code(value){return text(value).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12)}
function query(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return{};
  return Object.fromEntries(Object.entries(value).filter(([key,item])=>text(key)&&item!=null).slice(0,40).map(([key,item])=>[text(key).slice(0,80),text(item).slice(0,1000)]));
}
function addressDescriptor(value={}){
  return immutable({
    path:text(value.path,'/').startsWith('/')?text(value.path,'/'):`/${text(value.path)}`,
    query:query(value.query),
    hash:text(value.hash).replace(/^#/,''),
    href:text(value.href)
  });
}
function externalUrl(value){
  const url=text(value);
  if(!/^https?:\/\//i.test(url)){
    const error=new Error('OWNER_FLOW_EXTERNAL_URL_INVALID');
    error.code='OWNER_FLOW_EXTERNAL_URL_INVALID';
    throw error;
  }
  return url;
}
function transition(type,payload={},current={}){
  const flow=text(type);
  if(!TYPES.includes(flow)){
    const error=new Error(`OWNER_FLOW_UNKNOWN: ${flow}`);
    error.code='OWNER_FLOW_UNKNOWN';
    throw error;
  }
  const source=addressDescriptor(current),nextQuery={...source.query};
  const base={contractId:CONTRACT_ID,version:VERSION,type:flow,owner:flow.split('.')[0],reload:false,domainTruth:false};
  if(flow==='auth.login.success')return immutable({...base,action:'notify',render:'runtime',history:'preserve'});
  if(flow==='auth.logout')return immutable({...base,action:'replace',render:'signed-out',history:'replace',address:{path:source.path,query:{},hash:''}});
  if(flow==='join.open'){
    const joinCode=code(payload.code);
    if(joinCode.length<5){const error=new Error('JOIN_CODE_INVALID');error.code='JOIN_CODE_INVALID';throw error}
    delete nextQuery.invite;nextQuery.join=joinCode;
    return immutable({...base,action:'replace',render:'join',history:'replace',joinCode,address:{path:source.path,query:nextQuery,hash:source.hash}});
  }
  if(flow==='join.clear'||flow==='join.complete'){
    delete nextQuery.join;delete nextQuery.invite;
    return immutable({...base,action:'replace',render:flow==='join.complete'?'app':'previous',history:'replace',address:{path:source.path,query:nextQuery,hash:source.hash}});
  }
  return immutable({...base,action:'external',render:'preserve',history:'preserve',url:externalUrl(payload.url),purpose:text(payload.purpose,'booking')});
}
function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,types:TYPES,browserless:true,domainTruth:false,reloadFree:true})}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,types:TYPES,code,addressDescriptor,transition,diagnostics});
})();
