var LuviaOverlayHostContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='overlay-host.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const KINDS=new Set(['dialog','sheet']);
const DISMISS_REASONS=Object.freeze({escape:'closeOnEscape',backdrop:'closeOnBackdrop',back:'closeOnBack'});

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
function normalizeKind(value){const kind=text(value,'dialog').toLowerCase();return KINDS.has(kind)?kind:'dialog'}
function normalizeDismiss(input={}){
  return immutable({
    closeOnEscape:input.closeOnEscape!==false,
    closeOnBackdrop:input.closeOnBackdrop!==false,
    closeOnBack:input.closeOnBack!==false
  });
}

function createStack(options={}){
  const now=typeof options.now==='function'?options.now:()=>new Date().toISOString();
  let idSequence=0;
  const createId=typeof options.createId==='function'?options.createId:()=>`overlay-${++idSequence}`;
  let sequence=0;
  let entries=[];
  let state=immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,status:'idle',sequence,count:0,top:null,entries:[],lastEffect:null,updatedAt:now()});

  function publish(action,entry=null,detail={}){
    sequence+=1;
    state=immutable({
      contractId:CONTRACT_ID,
      version:VERSION,
      runtimeVersion:RUNTIME_VERSION,
      status:entries.length?'active':'idle',
      sequence,
      count:entries.length,
      top:entries.at(-1)||null,
      entries:clone(entries),
      lastEffect:{action,entry:clone(entry),detail:clone(detail)},
      updatedAt:now()
    });
    return immutable({kind:'overlay.host.effect',contractId:CONTRACT_ID,version:VERSION,action,entry:clone(entry),detail:clone(detail),snapshot:clone(state),requiresDomainCommand:false});
  }
  function descriptor(input={}){
    const id=text(input.id)||text(createId());
    if(!id)throw new Error('overlay-host.v1 benötigt eine stabile Overlay-ID.');
    return immutable({
      id,
      name:text(input.name,'dialog'),
      kind:normalizeKind(input.kind),
      modal:input.modal!==false,
      dismiss:normalizeDismiss(input),
      openedAt:now()
    });
  }
  function open(input={}){
    const entry=descriptor(input);
    if(entries.some(item=>item.id===entry.id))throw new Error(`overlay-host.v1 Overlay-ID bereits aktiv: ${entry.id}`);
    entries=entries.concat(entry);
    return publish('open',entry,{reason:text(input.reason,'mount')});
  }
  function close(id,reason='api'){
    const targetId=text(id);
    const index=entries.findIndex(item=>item.id===targetId);
    if(index<0)return publish('none',null,{reason:text(reason,'api'),targetId});
    const [entry]=entries.splice(index,1);
    entries=[...entries];
    return publish('close',entry,{reason:text(reason,'api')});
  }
  function requestClose(input={}){
    const reason=text(input.reason,'api');
    const top=entries.at(-1)||null;
    const targetId=text(input.id,top?.id||'');
    if(!top||targetId!==top.id)return publish('blocked',null,{reason,targetId,code:top?'NOT_TOP':'EMPTY'});
    const policyKey=DISMISS_REASONS[reason];
    if(policyKey&&top.dismiss[policyKey]===false)return publish('blocked',top,{reason,targetId,code:'DISMISS_DISABLED'});
    return close(top.id,reason);
  }
  function closeTop(reason='api'){
    const top=entries.at(-1)||null;
    return top?close(top.id,reason):publish('none',null,{reason:text(reason,'api')});
  }
  function closeAll(reason='api'){
    const closed=[...entries].reverse();
    entries=[];
    return publish(closed.length?'close-all':'none',closed.at(0)||null,{reason:text(reason,'api'),closed:clone(closed)});
  }
  function snapshot(){return state}
  function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserless:true,domainTruth:false,platformRendering:false,count:state.count,status:state.status});}

  return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,open,close,requestClose,closeTop,closeAll,snapshot,diagnostics});
}

function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserless:true,domainTruth:false,platformRendering:false});}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,createStack,diagnostics});
})();
