(() => {
  'use strict';
  const browser=window;
  const VERSION='4.37.1';
  const inflight=new Map();
  const MAX_BYTES=150000;
  const FUNCTION_NAME=/integration-luvia\./i.test(String(browser.location?.hostname||''))?'luvia-intelligence-integration':'luvia-intelligence';
  const PERSISTENT_CAPABILITIES=new Set(['planning.dialogue','trip.compose','trip.compose-day-repair','trip.audit']);
  let blockedUntil=0,lastError=null;
  const stable=value=>JSON.stringify(value);
  const sleep=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));

  function compact(value,depth=0){
    if(depth>12)return'[truncated]';
    if(value==null||typeof value==='boolean'||typeof value==='number')return value;
    if(typeof value==='string')return value.slice(0,1200);
    if(Array.isArray(value))return value.slice(0,60).map(item=>compact(item,depth+1));
    if(typeof value==='object'){
      const result={};
      for(const [key,item] of Object.entries(value)){
        if(/raw|html|embedding|base64|knowledgeGraph|journeyGraph/i.test(key))continue;
        result[key]=compact(item,depth+1);
      }
      return result;
    }
    return String(value);
  }

  function canonical(value){
    if(Array.isArray(value))return value.map(canonical);
    if(value&&typeof value==='object')return Object.keys(value).sort().reduce((result,key)=>{result[key]=canonical(value[key]);return result;},{});
    return value;
  }

  function fingerprint(value){
    const text=JSON.stringify(canonical(value)),seeds=[2166136261,2246822507,3266489909,668265263];
    return seeds.map(seed=>{let hash=seed>>>0;for(let index=0;index<text.length;index++){hash^=text.charCodeAt(index);hash=Math.imul(hash,16777619)}return(hash>>>0).toString(16).padStart(8,'0');}).join('');
  }

  function persistentContext(value={}){
    const context=compact(value||{});
    if(context?.live&&typeof context.live==='object')delete context.live.now;
    if(context?.journey?.knowledgeGraph&&typeof context.journey.knowledgeGraph==='object')delete context.journey.knowledgeGraph.generatedAt;
    if(context?.journey?.schedule&&typeof context.journey.schedule==='object')delete context.journey.schedule.lastUpdatedAt;
    if(context?.journey?.today&&typeof context.journey.today==='object')delete context.journey.today.generatedAt;
    return context;
  }

  function bodyFor(action,payload){
    let body={action,payload:compact(payload),client:{appVersion:'13.82.168.177',coreVersion:'4.82.296'}};
    if(new TextEncoder().encode(stable(body)).length>MAX_BYTES)body={
      action,
      payload:{idempotencyKey:payload?.idempotencyKey,workflowId:payload?.workflowId,jobId:payload?.jobId,retryFailed:payload?.retryFailed,phase:payload?.phase,state:compact(payload?.state),capability:payload?.capability,tier:payload?.tier,input:compact(payload?.input),context:{trip:compact(payload?.context?.trip),currentMoment:compact(payload?.context?.currentMoment),preferences:compact(payload?.context?.preferences)}},
      client:body.client
    };
    return body;
  }

  async function invoke(action,payload={},options={}){
    if(Date.now()<blockedUntil)throw Object.assign(new Error(lastError?.code==='AI_PAYLOAD_TOO_LARGE'?'Luvia Intelligence wurde nach einer zu großen Anfrage kurz pausiert.':'Luvia AI ist kurz pausiert. Bitte versucht es gleich erneut.'),{code:lastError?.code==='AI_PAYLOAD_TOO_LARGE'?'AI_PAYLOAD_CIRCUIT_OPEN':lastError?.code||'AI_RATE_LIMITED'});
    const body=bodyFor(action,payload),key=`${action}:${stable(body).slice(0,4000)}`;
    if(inflight.has(key))return inflight.get(key);
    const task=(async()=>{
      const client=await browser.LuviaSupabaseService.start(),timeoutMs=Math.max(3000,Number(options.timeoutMs||30000));
      let timer=null;
      try{
        const request=client.functions.invoke(FUNCTION_NAME,{body});
        const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(new Error('Luvia Intelligence hat das Zeitlimit überschritten.'),{code:'AI_TIMEOUT'})),timeoutMs)});
        const {data,error}=await Promise.race([request,timeout]);
        if(error){
          let detail=null;try{detail=await error.context?.clone?.().json();}catch{}
          const providerCode=detail?.error?.code,providerMessage=detail?.error?.message,status=Number(error?.context?.status||error?.status||0);
          if(status===413||/413|content too large/i.test(error.message||'')){blockedUntil=Date.now()+60000;lastError={code:'AI_PAYLOAD_TOO_LARGE',at:new Date().toISOString()};}
          if(status===429||/429|rate limit|zu viele/i.test(error.message||'')){blockedUntil=Date.now()+30000;lastError={code:providerCode||'AI_RATE_LIMITED',at:new Date().toISOString()};}
          throw Object.assign(new Error(providerMessage||error.message||'Luvia Intelligence ist nicht erreichbar.'),{status,code:providerCode||(status===413?'AI_PAYLOAD_TOO_LARGE':status===429?'AI_RATE_LIMITED':'AI_EDGE_ERROR'),cause:error});
        }
        if(data?.ok===false)throw Object.assign(new Error(data.error?.message||'Luvia Intelligence konnte die Aufgabe nicht lösen.'),{code:data.error?.code||'AI_RESPONSE_ERROR',meta:data.meta});
        return data;
      }finally{if(timer)clearTimeout(timer);}
    })().finally(()=>inflight.delete(key));
    inflight.set(key,task);
    return task;
  }

  async function runPersistent(payload={},options={}){
    const capability=String(payload?.capability||'');
    if(!PERSISTENT_CAPABILITIES.has(capability)||!options.workflowId)return invoke('brain.run',payload,options);
    const normalized={capability,tier:payload?.tier,input:compact(payload?.input||{}),context:persistentContext(payload?.context||{})};
    // Version the key alongside the canonical fingerprint contract. Earlier keys
    // were compared with an order-sensitive server digest and can therefore be
    // poisoned by an otherwise equivalent payload restored in a different key order.
    const hash=fingerprint(normalized),idempotencyKey=`trip-plan-v2:${capability.replaceAll('.','-')}:${hash}`;
    const started=Date.now(),maxWaitMs=Math.max(15000,Number(options.timeoutMs||90000)),pollMs=Math.max(500,Math.min(3000,Number(options.pollMs||1200)));
    let response=await invoke('trip.plan-job.start',{...normalized,workflowId:options.workflowId,idempotencyKey,retryFailed:options.retryFailed===true},{timeoutMs:12000});
    let job=response?.data?.job;
    while(job){
      if(job.status==='succeeded')return {ok:true,data:{result:job.result},meta:{...(job.meta||{}),jobId:job.id,jobStatus:job.status,resumable:true,reused:job.attemptCount>0}};
      if(job.status==='failed')throw Object.assign(new Error(job.error?.message||'Der fortsetzbare KI-Auftrag konnte nicht abgeschlossen werden.'),{code:job.error?.code||'AI_JOB_FAILED',jobId:job.id,meta:job.meta});
      if(Date.now()-started>=maxWaitMs)throw Object.assign(new Error('Eure Reise wird serverseitig weiter geplant. Öffnet diesen Schritt später erneut; Luvia setzt denselben Auftrag ohne Doppelberechnung fort.'),{code:'AI_JOB_PENDING',jobId:job.id,resumable:true});
      await sleep(pollMs);
      response=await invoke('trip.plan-job.read',{jobId:job.id},{timeoutMs:10000});
      job=response?.data?.job;
    }
    throw Object.assign(new Error('Der Server hat keine fortsetzbare Auftrags-ID geliefert.'),{code:'AI_JOB_RESPONSE_INVALID'});
  }

  async function startTripWorkflow(idempotencyKey,state={}){
    const response=await invoke('trip.plan-workflow.start',{idempotencyKey,state},{timeoutMs:12000});
    return response?.data?.workflow;
  }

  async function readTripWorkflow(workflowId){
    const response=await invoke('trip.plan-workflow.read',{workflowId},{timeoutMs:10000});
    return response?.data?.workflow;
  }

  async function checkpointTripWorkflow(workflowId,phase,state={}){
    const response=await invoke('trip.plan-workflow.checkpoint',{workflowId,phase,state},{timeoutMs:12000});
    return response?.data?.workflow;
  }

  const run=(payload,options)=>invoke('brain.run',payload,options);
  const health=()=>invoke('brain.health',{}, {timeoutMs:10000});
  const diagnostics=()=>({version:VERSION,inFlight:inflight.size,blockedUntil,lastError,maxPayloadBytes:MAX_BYTES,persistentCapabilities:[...PERSISTENT_CAPABILITIES],functionName:FUNCTION_NAME});
  browser.LuviaOpenAIProvider=Object.freeze({version:VERSION,provider:'openai',invoke,run,runPersistent,startTripWorkflow,readTripWorkflow,checkpointTripWorkflow,health,diagnostics});
})();
