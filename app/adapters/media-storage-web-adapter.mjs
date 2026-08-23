import registry from './platform-port-adapters.mjs';

const root=globalThis;
const uploadQueueMemory=new Map();
let uploadQueueDbPromise=null;

function uploadQueueDb(){
  if(!root.indexedDB)return Promise.resolve(null);
  if(uploadQueueDbPromise)return uploadQueueDbPromise;
  uploadQueueDbPromise=new Promise(resolve=>{
    try{
      const request=root.indexedDB.open('luvia-media-upload-queue-v1',1);
      request.onupgradeneeded=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains('uploads'))db.createObjectStore('uploads',{keyPath:'id'});
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>resolve(null);
      request.onblocked=()=>resolve(null);
    }catch{resolve(null)}
  });
  return uploadQueueDbPromise;
}

async function queuePut(task){
  const db=await uploadQueueDb();
  if(!db){uploadQueueMemory.set(String(task.id),task);return task}
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('uploads','readwrite');
    tx.objectStore('uploads').put(task);
    tx.oncomplete=()=>resolve(task);
    tx.onerror=()=>reject(tx.error||new Error('Media upload queue write failed.'));
    tx.onabort=()=>reject(tx.error||new Error('Media upload queue write aborted.'));
  });
}

async function queueList(){
  const db=await uploadQueueDb();
  if(!db)return[...uploadQueueMemory.values()];
  return new Promise((resolve,reject)=>{
    const request=db.transaction('uploads','readonly').objectStore('uploads').getAll();
    request.onsuccess=()=>resolve(request.result||[]);
    request.onerror=()=>reject(request.error||new Error('Media upload queue read failed.'));
  });
}

async function queueRemove(id){
  const db=await uploadQueueDb();
  if(!db){uploadQueueMemory.delete(String(id));return true}
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('uploads','readwrite');
    tx.objectStore('uploads').delete(String(id));
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>reject(tx.error||new Error('Media upload queue delete failed.'));
    tx.onabort=()=>reject(tx.error||new Error('Media upload queue delete aborted.'));
  });
}

const client=()=>root.LuviaSupabaseService?.getClient?.()||root.LuviaSupabase?.getClient?.()||root.LuviaSupabase?.client?.()||root.ParisSupabaseClient||root.ParisCloud?.client||null;
const bucket=name=>{
  const value=client();
  if(!value?.storage?.from)throw new Error('MediaStoragePort benötigt eine aktive Storage-Verbindung.');
  return value.storage.from(String(name||'luvia-media'));
};

const mediaStoragePort=Object.freeze({
  isAvailable:()=>Boolean(client()?.storage?.from),
  upload:(name,path,body,options={})=>bucket(name).upload(path,body,options),
  remove:(name,paths)=>bucket(name).remove([...(paths||[])]),
  download:(name,path)=>bucket(name).download(path),
  createSignedUrl:(name,path,expiresIn=3600)=>bucket(name).createSignedUrl(path,expiresIn),
  stageUpload:queuePut,
  listStagedUploads:queueList,
  removeStagedUpload:queueRemove,
  diagnostics:()=>Object.freeze({
    remoteStorage:Boolean(client()?.storage?.from),
    uploadQueue:root.indexedDB?'indexeddb':'memory'
  })
});

registry.register('MediaStoragePort',mediaStoragePort);
root.dispatchEvent(new CustomEvent('luvia:platform-ports-ready',{detail:{ports:registry.list()}}));
root.LuviaMediaCore?.initializeUploadQueue?.().catch(error=>console.warn('[Luvia MediaStorage Web Adapter] Upload Queue nicht gestartet',error));

export default mediaStoragePort;
