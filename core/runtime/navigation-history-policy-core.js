var LuviaNavigationHistoryPolicyCoreV1=(()=>{
'use strict';

const CONTRACT_ID='navigation-history.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';

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
function text(value,fallback=''){return String(value??fallback).trim()}
function decode(value){try{return decodeURIComponent(String(value||'').replace(/\+/g,' '))}catch{return String(value||'')}}
function pairs(value){
  return Object.fromEntries(text(value).replace(/^[?#]/,'').split('&').filter(Boolean).map(part=>{
    const index=part.indexOf('=');
    return index<0?[decode(part),'']:[decode(part.slice(0,index)),decode(part.slice(index+1))];
  }));
}
function explicitParts(input){
  const raw=text(input);
  if(!raw)return{candidate:'',params:{}};
  const hashIndex=raw.indexOf('#');
  const queryIndex=raw.indexOf('?');
  const queryEnd=hashIndex>=0?hashIndex:raw.length;
  const query=queryIndex>=0?pairs(raw.slice(queryIndex+1,queryEnd)):{};
  const hash=hashIndex>=0?pairs(raw.slice(hashIndex+1)):{};
  const stop=Math.min(...[queryIndex,hashIndex].filter(index=>index>=0).concat(raw.length));
  const path=raw.slice(0,stop).replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]+/i,'');
  const pathToken=decode(path.split('/').filter(Boolean).pop()||'');
  const candidate=query.screen||query.view||query.route||query.module||hash.screen||hash.view||hash.route||hash.module||pathToken;
  const params={...query,...hash};
  delete params.screen;delete params.view;delete params.route;delete params.module;
  return{candidate:text(candidate).toLowerCase(),params};
}
function matchUrl(input,navigation,options={}){
  if(!navigation?.get||!navigation?.fromUrl)throw new Error('navigation-history.v1 benötigt navigation.v1.');
  const explicit=explicitParts(input);
  if(!explicit.candidate||!navigation.get(explicit.candidate))return null;
  return navigation.fromUrl(input,{...options,source:options.source||'history-url',params:{...explicit.params,...(options.params||{})}});
}
function stable(value){
  if(value==null||typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return`[${value.map(stable).join(',')}]`;
  return`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
}
function fingerprint(intent){return`${intent.route}|${stable(intent.params||{})}`}

function createPolicy(options={}){
  const navigation=options.navigation;
  if(!navigation?.resolve||!navigation?.createIntent)throw new Error('navigation-history.v1 benötigt navigation.v1.');
  const now=typeof options.now==='function'?options.now:()=>new Date().toISOString();
  let keySequence=0;
  const createKey=typeof options.createKey==='function'?options.createKey:()=>`nav-${++keySequence}`;
  let sequence=0;
  let state=immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,status:'idle',sequence,position:-1,length:0,entry:null,lastAction:'none',updatedAt:now()});

  function publish(action,entry,detail={}){
    sequence+=1;
    const length=action==='push'?Math.max(entry.position+1,1):Math.max(state.length,entry?entry.position+1:0);
    state=immutable({...state,status:entry?'ready':'idle',sequence,position:entry?.position??-1,length,entry:entry?clone(entry):null,lastAction:action,updatedAt:now(),detail:clone(detail)});
    return immutable({kind:'navigation.history.effect',contractId:CONTRACT_ID,version:VERSION,action,intent:entry?.intent||null,entry:entry?clone(entry):null,snapshot:clone(state),requiresDomainCommand:false});
  }
  function entry(input,entryOptions={}){
    const inputOptions=input&&typeof input==='object'?input:{};
    const intent=navigation.resolve(input,{source:entryOptions.source||inputOptions.source||'history-policy',replace:entryOptions.replace??inputOptions.replace});
    const position=Number.isInteger(entryOptions.position)?entryOptions.position:Math.max(state.position,0);
    return immutable({key:text(entryOptions.key)||createKey(),position,intent,route:intent.route,fingerprint:fingerprint(intent),createdAt:now()});
  }
  function project(input,projectOptions={}){
    const inputOptions=input&&typeof input==='object'?input:{};
    const nextIntent=navigation.resolve(input,{source:projectOptions.source||inputOptions.source||'history-policy',replace:projectOptions.replace??inputOptions.replace});
    const same=state.entry?.fingerprint===fingerprint(nextIntent);
    const replace=Boolean(projectOptions.replace||nextIntent.replace||state.status==='idle');
    if(same&&!replace)return publish('none',state.entry,{reason:'idempotent'});
    const action=replace?'replace':'push';
    const position=Number.isInteger(projectOptions.position)?projectOptions.position:action==='push'?state.position+1:Math.max(state.position,0);
    return publish(action,entry(nextIntent,{...projectOptions,position}),{reason:projectOptions.reason||'navigate'});
  }
  function start(url,startOptions={}){
    const intent=matchUrl(url,navigation,{source:startOptions.source||'history-url'});
    if(!intent)return immutable({kind:'navigation.history.effect',contractId:CONTRACT_ID,version:VERSION,action:'none',intent:null,entry:null,snapshot:clone(state),requiresDomainCommand:false});
    return project(intent,{replace:true,position:Number.isInteger(startOptions.position)?startOptions.position:0,key:startOptions.key,reason:'url-start'});
  }
  function restore(input,restoreOptions={}){
    const position=Number.isInteger(restoreOptions.position)?restoreOptions.position:Math.max(state.position,0);
    return publish('restore',entry(input,{...restoreOptions,position,source:restoreOptions.source||input?.source||'history-pop',replace:true}),{reason:restoreOptions.reason||'platform-restore'});
  }
  function command(action){return immutable({kind:'navigation.history',contractId:CONTRACT_ID,version:VERSION,action,requiresDomainCommand:false})}
  function snapshot(){return state}
  function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserless:true,domainTruth:false,state:clone(state)})}

  return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,start,project,restore,back:()=>command('back'),forward:()=>command('forward'),snapshot,diagnostics});
}

function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserless:true,domainTruth:false,routeTruth:false});}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,matchUrl,createPolicy,diagnostics});
})();
