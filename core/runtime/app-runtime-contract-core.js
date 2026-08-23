var LuviaAppRuntimeContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='app-runtime.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const STAGES=Object.freeze(['idle','platform-ready','auth-ready','domain-context-ready','shell-ready','modules-ready']);
const MAX_HISTORY=32;

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
function stageIndex(stage){return STAGES.indexOf(String(stage||''))}
function stageError(code,message,stage){
  const error=new Error(message);
  error.code=code;
  if(stage)error.stage=stage;
  return error;
}
function errorSnapshot(error,stage,code){
  return immutable({
    code:String(code||error?.code||'APP_RUNTIME_STAGE_FAILED'),
    message:String(error?.message||error||'Unknown App Runtime failure'),
    name:String(error?.name||'Error'),
    stage:String(stage||error?.stage||'unknown')
  });
}

function createRuntime(options={}){
  const now=typeof options.now==='function'?options.now:()=>new Date().toISOString();
  const schedule=typeof options.schedule==='function'?options.schedule:(handler,delay)=>setTimeout(handler,delay);
  const cancel=typeof options.cancel==='function'?options.cancel:handle=>clearTimeout(handle);
  const listeners=new Set();
  let sequence=0;
  let transitions=[];
  let state=immutable({
    contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,
    sequence,stage:'idle',lastStableStage:'idle',pendingStage:null,status:'idle',ready:false,
    detail:{},error:null,updatedAt:now(),transitions:[]
  });

  function record(type,stage,detail={}){
    const entry=immutable({sequence,type,stage,detail:clone(detail),at:now()});
    transitions=transitions.concat(entry).slice(-MAX_HISTORY);
    return transitions;
  }
  function publish(next){
    state=immutable({...next,transitions:clone(transitions)});
    listeners.forEach(listener=>{try{listener(state)}catch{}});
    return state;
  }
  function validate(stage){
    const index=stageIndex(stage);
    if(index<0)throw stageError('APP_RUNTIME_STAGE_UNKNOWN',`Unknown App Runtime stage: ${stage}`,stage);
    return index;
  }
  function ensureProgression(stage){
    const target=validate(stage);
    const stable=stageIndex(state.lastStableStage);
    if(target>stable+1)throw stageError('APP_RUNTIME_STAGE_GAP',`App Runtime cannot skip from ${state.lastStableStage} to ${stage}.`,stage);
    return {target,stable};
  }
  function begin(stage,detail={}){
    if(state.status==='failed')throw stageError('APP_RUNTIME_RECOVERY_REQUIRED','App Runtime must recover before starting another stage.',stage);
    const {target,stable}=ensureProgression(stage);
    if(target<stable)return state;
    sequence+=1;
    record('stage.begin',stage,detail);
    return publish({...state,sequence,pendingStage:stage,status:'running',ready:false,detail:clone(detail),error:null,updatedAt:now()});
  }
  function complete(stage,detail={}){
    if(state.status==='failed')throw stageError('APP_RUNTIME_RECOVERY_REQUIRED','App Runtime must recover before completing another stage.',stage);
    const {target,stable}=ensureProgression(stage);
    if(target<stable)return state;
    if(state.pendingStage&&state.pendingStage!==stage)throw stageError('APP_RUNTIME_STAGE_PENDING',`App Runtime is waiting for ${state.pendingStage}, not ${stage}.`,stage);
    sequence+=1;
    const ready=stage==='modules-ready';
    record('stage.complete',stage,detail);
    return publish({...state,sequence,stage,lastStableStage:stage,pendingStage:null,status:ready?'ready':'progress',ready,detail:clone(detail),error:null,updatedAt:now()});
  }
  function fail(error,detail={}){
    const failedStage=String(detail.stage||state.pendingStage||state.lastStableStage||'unknown');
    const failure=errorSnapshot(error,failedStage,detail.code);
    sequence+=1;
    record('stage.failed',failedStage,{...detail,error:failure});
    return publish({...state,sequence,pendingStage:null,status:'failed',ready:false,detail:clone(detail),error:failure,updatedAt:now()});
  }
  function recover(options={}){
    const target=String(options.to||state.lastStableStage||'idle');
    const targetIndex=validate(target);
    const stableIndex=stageIndex(state.lastStableStage);
    if(targetIndex>stableIndex)throw stageError('APP_RUNTIME_RECOVERY_FORWARD','Recovery can only return to a completed App Runtime stage.',target);
    sequence+=1;
    const ready=target==='modules-ready';
    record('runtime.recovered',target,options.detail||{});
    return publish({...state,sequence,stage:target,lastStableStage:target,pendingStage:null,status:ready?'ready':target==='idle'?'idle':'progress',ready,detail:clone(options.detail||{}),error:null,updatedAt:now()});
  }
  async function run(stage,task,options={}){
    if(typeof task!=='function')throw stageError('APP_RUNTIME_TASK_REQUIRED',`App Runtime stage ${stage} requires a task.`,stage);
    begin(stage,options.detail||{});
    const timeoutMs=Math.max(0,Number(options.timeoutMs)||0);
    let timer=null;
    try{
      const work=Promise.resolve().then(task);
      const result=timeoutMs>0?await Promise.race([
        work,
        new Promise((_,reject)=>{timer=schedule(()=>reject(stageError('APP_RUNTIME_STAGE_TIMEOUT',`App Runtime stage ${stage} exceeded ${timeoutMs}ms.`,stage)),timeoutMs)})
      ]):await work;
      if(timer!=null)cancel(timer);
      complete(stage,options.completeDetail||options.detail||{});
      return result;
    }catch(error){
      if(timer!=null)cancel(timer);
      fail(error,{...(options.detail||{}),stage,code:error?.code});
      throw error;
    }
  }
  function snapshot(){return state}
  function subscribe(listener,options={}){
    if(typeof listener!=='function')return()=>{};
    listeners.add(listener);
    if(options.emitCurrent!==false)listener(state);
    return()=>listeners.delete(listener);
  }
  function isAtLeast(stage){return stageIndex(state.lastStableStage)>=validate(stage)}
  function diagnostics(){
    return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,stages:[...STAGES],state:clone(state),browserless:true,domainTruth:false});
  }

  return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,stages:STAGES,begin,complete,fail,recover,run,snapshot,subscribe,isAtLeast,diagnostics});
}

function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,stages:[...STAGES],browserless:true,domainTruth:false});}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,stages:STAGES,createRuntime,diagnostics});
})();
