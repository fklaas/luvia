var LuviaMediaDomainContractCoreV1=(()=>{
'use strict';

const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const DEFAULT_BUCKET='luvia-media';
const UPLOAD_STATES=Object.freeze(['queued','uploading','retry','completed','failed']);
const TRANSITIONS=Object.freeze({
  queued:Object.freeze(['uploading','failed']),
  uploading:Object.freeze(['retry','completed','failed']),
  retry:Object.freeze(['uploading','failed']),
  completed:Object.freeze([]),
  failed:Object.freeze(['queued'])
});

const text=value=>value==null?null:String(value);
const number=value=>value==null||value===''?null:(Number.isFinite(Number(value))?Number(value):null);
const bool=value=>Boolean(value);
const pick=(obj,...keys)=>{
  for(const key of keys){if(obj&&obj[key]!==undefined)return obj[key]}
  return undefined;
};
const dayKey=value=>{
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return null;
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
};
const freezeArray=items=>Object.freeze((items||[]).map(item=>item&&typeof item==='object'&&!Object.isFrozen(item)?Object.freeze(item):item));
const immutable=value=>{
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
};

function projectEditSettings(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return Object.freeze({});
  const out={};
  for(const key of ['rotation','crop','brightness','contrast','saturation','warmth','temperature','blur','vignette','exposure','highlights','shadows','clarity','hue','grain','filter','frame','sticker','caption']){
    if(value[key]!==undefined)out[key]=value[key];
  }
  if(Array.isArray(value.overlays)){
    out.overlays=freezeArray(value.overlays.map(item=>Object.freeze({
      type:text(item?.type),value:text(item?.value),x:number(item?.x),y:number(item?.y),size:number(item?.size),rotation:number(item?.rotation),schema:text(item?.schema)
    })));
  }
  return Object.freeze(out);
}

function projectResolvedLocation(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  return Object.freeze({
    name:text(value.name),
    address:text(value.address),
    providerPlaceId:text(pick(value,'providerPlaceId','provider_place_id')),
    primaryType:text(pick(value,'primaryType','primary_type')),
    status:text(value.status),
    source:text(value.source),
    distanceMeters:number(pick(value,'distanceMeters','distance_meters')),
    confidence:number(value.confidence)
  });
}

function projectOwnerMedia(row,options={}){
  if(!row)return null;
  const fallbackBucket=options.bucket||DEFAULT_BUCKET;
  const capturedAt=pick(row,'capturedAt','captured_at')||pick(row,'createdAt','created_at');
  const metadata=row.metadata&&typeof row.metadata==='object'?row.metadata:{};
  return Object.freeze({
    id:text(row.id),
    tripId:text(pick(row,'tripId','trip_id')),
    userId:text(pick(row,'userId','user_id')),
    participantId:text(pick(row,'participantId','participant_id')),
    type:text(row.type),
    purpose:text(row.purpose),
    source:text(row.source),
    originalName:text(pick(row,'originalName','original_name')),
    displayName:text(pick(row,'displayName','display_name')??metadata.caption),
    mimeType:text(pick(row,'mimeType','mime_type')),
    storageBucket:text(pick(row,'storageBucket','storage_bucket')||fallbackBucket),
    storagePath:text(pick(row,'storagePath','storage_path')),
    previewPath:text(pick(row,'previewPath','preview_path')),
    thumbnailPath:text(pick(row,'thumbnailPath','thumbnail_path')),
    status:text(row.status),
    capturedAt:text(capturedAt),
    dayKey:text(pick(row,'dayKey','day_key')||dayKey(capturedAt)),
    timezone:text(row.timezone),
    latitude:number(row.latitude),
    longitude:number(row.longitude),
    width:number(row.width),
    height:number(row.height),
    fileSize:number(pick(row,'fileSize','file_size')),
    contentHash:text(pick(row,'contentHash','content_hash')),
    placeId:text(pick(row,'placeId','place_id')),
    favorite:bool(row.favorite),
    editSettings:pick(row,'editSettings','edit_settings')||{},
    metadata,
    renderedPreviewPath:text(pick(row,'renderedPreviewPath','rendered_preview_path')||metadata.renderedPreviewPath),
    createdAt:text(pick(row,'createdAt','created_at')),
    updatedAt:text(pick(row,'updatedAt','updated_at'))
  });
}

function projectPublicMedia(item){
  if(!item)return null;
  const metadata=item.metadata&&typeof item.metadata==='object'?item.metadata:{};
  return Object.freeze({
    id:text(item.id),
    tripId:text(pick(item,'tripId','trip_id')),
    participantId:text(pick(item,'participantId','participant_id')),
    type:text(item.type),
    purpose:text(item.purpose),
    source:text(item.source),
    originalName:text(pick(item,'originalName','original_name')),
    displayName:text(pick(item,'displayName','display_name')),
    mimeType:text(pick(item,'mimeType','mime_type')),
    status:text(item.status),
    capturedAt:text(pick(item,'capturedAt','captured_at')),
    dayKey:text(pick(item,'dayKey','day_key')),
    timezone:text(item.timezone),
    latitude:number(item.latitude),
    longitude:number(item.longitude),
    width:number(item.width),
    height:number(item.height),
    fileSize:number(pick(item,'fileSize','file_size')),
    placeId:text(pick(item,'placeId','place_id')),
    favorite:bool(item.favorite),
    renderedPreviewAvailable:Boolean(pick(item,'renderedPreviewPath','rendered_preview_path')||metadata.renderedPreviewPath),
    mediaKind:text(pick(item,'mediaKind','media_kind')??metadata.mediaKind),
    captureEvidenceAvailable:Boolean(metadata.captureEvidence||metadata.exif?.gpsAvailable),
    metadataAutoChecked:Boolean(metadata.metadataAutoCheckedAt),
    resolvedLocation:projectResolvedLocation(metadata.resolvedLocation),
    captureLocationName:text(metadata.captureLocation?.name),
    editSettings:projectEditSettings(pick(item,'editSettings','edit_settings')),
    createdAt:text(pick(item,'createdAt','created_at')),
    updatedAt:text(pick(item,'updatedAt','updated_at'))
  });
}

function projectRealtime(payload={}){
  const table=text(payload.table);
  const current=projectPublicMedia(payload.new);
  const previous=projectPublicMedia(payload.old);
  return Object.freeze({
    scope:table==='media_day_polaroids'?'polaroids':'media',
    eventType:text(pick(payload,'eventType','event_type','event')),
    mediaId:text(current?.id??previous?.id??pick(payload.new,'id','media_id')??pick(payload.old,'id','media_id')),
    media:current,
    previous
  });
}

function projectUploadTask(task){
  if(!task)return null;
  return Object.freeze({
    id:text(task.id),
    mediaId:text(task.mediaId),
    tripId:text(task.tripId),
    userId:text(task.userId),
    state:text(task.state),
    attempts:number(task.attempts)??0,
    queuedAt:text(task.queuedAt),
    updatedAt:text(task.updatedAt),
    nextAttemptAt:text(task.nextAttemptAt),
    lastError:text(task.lastError)
  });
}

function createUploadTask(input={}){
  const id=text(input.id);
  const mediaId=text(input.mediaId);
  const tripId=text(input.tripId);
  const userId=text(input.userId);
  if(!id||!mediaId||!tripId||!userId)throw new TypeError('Media upload task requires id, mediaId, tripId and userId.');
  const now=text(input.now)||new Date().toISOString();
  return Object.freeze({
    id,mediaId,tripId,userId,
    state:'queued',
    attempts:0,
    queuedAt:now,
    updatedAt:now,
    nextAttemptAt:null,
    lastError:null,
    options:immutable(input.options||{}),
    body:input.body
  });
}

function transitionUploadTask(task,next,patch={}){
  if(!task||!UPLOAD_STATES.includes(task.state))throw new TypeError('Invalid media upload task.');
  if(!UPLOAD_STATES.includes(next)||!TRANSITIONS[task.state].includes(next)){
    throw new Error(`Invalid media upload transition: ${task.state} -> ${next}`);
  }
  return Object.freeze({...task,...patch,state:next,updatedAt:text(patch.updatedAt)||new Date().toISOString()});
}

function createUploadCoordinator(providers={}){
  const queue=providers.queue||{};
  const network=providers.network||{};
  const lifecycle=providers.lifecycle||{};
  const execute=providers.execute;
  const now=typeof providers.now==='function'?providers.now:()=>new Date().toISOString();
  const maxAttempts=Math.max(1,Number(providers.maxAttempts)||5);
  const listeners=new Set();
  let running=null,started=false,unsubscribeNetwork=()=>{},unsubscribeLifecycle=()=>{};
  for(const method of ['put','list','remove'])if(typeof queue[method]!=='function')throw new TypeError(`Media upload queue provider missing: ${method}`);
  if(typeof execute!=='function')throw new TypeError('Media upload execute provider missing.');
  const online=()=>typeof network.isOnline!=='function'||network.isOnline()!==false;
  const emit=(type,task,error=null)=>{
    const event=Object.freeze({type,task:projectUploadTask(task),error:error?String(error?.message||error):null,at:now()});
    for(const listener of listeners){try{listener(event)}catch{}}
    return event;
  };
  async function enqueue(input={}){
    const task=createUploadTask({...input,now:now()});
    await queue.put(task);
    emit('queued',task);
    return projectUploadTask(task);
  }
  async function drain(options={}){
    if(running)return running;
    running=(async()=>{
      const summary={processed:0,completed:0,retried:0,failed:0,offline:false};
      if(!online()){summary.offline=true;return Object.freeze(summary)}
      const tasks=[...(await queue.list()||[])].sort((a,b)=>String(a.queuedAt||'').localeCompare(String(b.queuedAt||'')));
      for(const task of tasks){
        if(!online()){summary.offline=true;break}
        if(!['queued','retry','failed'].includes(task.state))continue;
        if(task.state==='failed'&&!options.includeFailed)continue;
        if(task.nextAttemptAt&&!options.force&&Date.parse(task.nextAttemptAt)>Date.parse(now()))continue;
        const queued=task.state==='failed'?transitionUploadTask(task,'queued',{updatedAt:now()}):task;
        const working=transitionUploadTask(queued,'uploading',{attempts:(Number(queued.attempts)||0)+1,nextAttemptAt:null,lastError:null,updatedAt:now()});
        await queue.put(working);
        summary.processed++;
        emit('uploading',working);
        try{
          await execute(working);
          const completed=transitionUploadTask(working,'completed',{updatedAt:now()});
          await queue.remove(working.id);
          summary.completed++;
          emit('completed',completed);
        }catch(error){
          const exhausted=working.attempts>=maxAttempts;
          const delay=Math.min(300000,1000*(2**Math.max(0,working.attempts-1)));
          const failed=transitionUploadTask(working,exhausted?'failed':'retry',{
            lastError:String(error?.message||error),
            nextAttemptAt:exhausted?null:new Date(Date.parse(now())+delay).toISOString(),
            updatedAt:now()
          });
          await queue.put(failed);
          if(exhausted)summary.failed++;else summary.retried++;
          emit(exhausted?'failed':'retry',failed,error);
          if(!online()){summary.offline=true;break}
        }
      }
      return Object.freeze(summary);
    })();
    try{return await running}finally{running=null}
  }
  async function snapshot(){
    const tasks=await queue.list();
    const counts=Object.fromEntries(UPLOAD_STATES.map(state=>[state,0]));
    for(const task of tasks||[])if(counts[task.state]!==undefined)counts[task.state]++;
    return Object.freeze({started,running:Boolean(running),online:online(),total:(tasks||[]).length,counts:Object.freeze(counts)});
  }
  function subscribe(listener){if(typeof listener!=='function')return()=>{};listeners.add(listener);return()=>listeners.delete(listener)}
  function start(){
    if(started)return api;
    started=true;
    if(typeof network.subscribe==='function')unsubscribeNetwork=network.subscribe(state=>{const value=typeof state==='boolean'?state:state?.online;if(value!==false)drain({force:true}).catch(()=>{})});
    if(typeof lifecycle.subscribe==='function')unsubscribeLifecycle=lifecycle.subscribe(state=>{const value=typeof state==='string'?state:state?.state;if(['active','visible','foreground'].includes(value))drain({force:true}).catch(()=>{})});
    if(online())drain().catch(()=>{});
    return api;
  }
  function stop(){unsubscribeNetwork();unsubscribeLifecycle();unsubscribeNetwork=()=>{};unsubscribeLifecycle=()=>{};started=false;return api}
  const api=Object.freeze({enqueue,drain,snapshot,subscribe,start,stop});
  return api;
}

return Object.freeze({
  version:VERSION,
  runtimeVersion:RUNTIME_VERSION,
  bucket:DEFAULT_BUCKET,
  uploadStates:UPLOAD_STATES,
  projectOwnerMedia,
  projectPublicMedia,
  projectRealtime,
  projectUploadTask,
  createUploadTask,
  transitionUploadTask,
  createUploadCoordinator
});
})();
