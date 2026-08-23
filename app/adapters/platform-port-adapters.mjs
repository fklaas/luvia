import {createPlatformPortRegistry} from '../../core/platform/native/platform-port-registry.mjs';

const root=globalThis;
const prefix='luvia:offline-cache:';
const position=value=>Object.freeze({
  latitude:Number(value?.coords?.latitude??value?.latitude),
  longitude:Number(value?.coords?.longitude??value?.longitude),
  accuracy:Number(value?.coords?.accuracy??value?.accuracy??999),
  altitude:value?.coords?.altitude??value?.altitude??null,
  heading:value?.coords?.heading??value?.heading??null,
  speed:value?.coords?.speed??value?.speed??null,
  timestamp:value?.timestamp||Date.now()
});
const locationPort=Object.freeze({
  isSupported:()=>Boolean(root.navigator?.geolocation),
  getCurrent(options={}){
    if(!root.navigator?.geolocation)return Promise.reject(new Error('LocationPort wird von diesem Gerät nicht unterstützt.'));
    return new Promise((resolve,reject)=>root.navigator.geolocation.getCurrentPosition(value=>resolve(position(value)),reject,{
      enableHighAccuracy:options.accuracy==='high'||options.enableHighAccuracy===true,
      timeout:options.timeoutMs??options.timeout??15000,
      maximumAge:options.maximumAgeMs??options.maximumAge??30000
    }));
  },
  watch(onPosition,onError=()=>{},options={}){
    if(!root.navigator?.geolocation)throw new Error('LocationPort wird von diesem Gerät nicht unterstützt.');
    return root.navigator.geolocation.watchPosition(value=>onPosition(position(value)),onError,{
      enableHighAccuracy:options.accuracy==='high'||options.enableHighAccuracy===true,
      timeout:options.timeoutMs??options.timeout??20000,
      maximumAge:options.maximumAgeMs??options.maximumAge??15000
    });
  },
  clearWatch:id=>root.navigator?.geolocation?.clearWatch?.(id)
});
const permissionPort=Object.freeze({
  async query(name){
    if(!root.navigator?.permissions?.query)return'unsupported';
    try{return (await root.navigator.permissions.query({name})).state||'unknown'}catch{return'unknown'}
  }
});
const networkPort=Object.freeze({
  isOnline:()=>root.navigator?.onLine!==false,
  subscribe(listener){
    if(typeof listener!=='function')return()=>{};
    const publish=()=>listener(Object.freeze({online:root.navigator?.onLine!==false,at:new Date().toISOString()}));
    root.addEventListener?.('online',publish);
    root.addEventListener?.('offline',publish);
    publish();
    return()=>{
      root.removeEventListener?.('online',publish);
      root.removeEventListener?.('offline',publish);
    };
  }
});
const lifecycleState=()=>root.document?.visibilityState==='hidden'?'background':'active';
const lifecyclePort=Object.freeze({
  state:lifecycleState,
  subscribe(listener){
    if(typeof listener!=='function')return()=>{};
    const publish=()=>listener(Object.freeze({state:lifecycleState(),at:new Date().toISOString()}));
    const background=()=>listener(Object.freeze({state:'background',at:new Date().toISOString()}));
    root.document?.addEventListener?.('visibilitychange',publish);
    root.addEventListener?.('pageshow',publish);
    root.addEventListener?.('pagehide',background);
    publish();
    return()=>{
      root.document?.removeEventListener?.('visibilitychange',publish);
      root.removeEventListener?.('pageshow',publish);
      root.removeEventListener?.('pagehide',background);
    };
  }
});
const externalNavigationPort=Object.freeze({
  reserve({placeholder='/booking-handoff.html'}={}){
    const target=new URL(placeholder,root.location?.href);
    if(target.origin!==root.location?.origin)throw new Error('ExternalNavigationPort Platzhalter muss same-origin sein.');
    const handle=root.open(target.href,'_blank');
    if(handle)handle.opener=null;
    return handle||null;
  },
  open(url,{reserved=null}={}){
    const parsed=new URL(url,root.location?.href);
    if(!['http:','https:','mailto:'].includes(parsed.protocol))throw new Error('ExternalNavigationPort unterstützt nur HTTP/HTTPS/Mailto.');
    if(reserved&&!reserved.closed&&reserved.location?.replace){reserved.location.replace(parsed.href);return true}
    return Boolean(root.open(parsed.href,'_blank','noopener,noreferrer'));
  },
  openMaps({latitude,longitude,label='',providerPlaceId=''}={}){
    const query=latitude!=null&&longitude!=null?`${latitude},${longitude}`:label;
    if(!query)throw new Error('ExternalNavigationPort benötigt ein Karten-Ziel.');
    const suffix=providerPlaceId?`&query_place_id=${encodeURIComponent(providerPlaceId)}`:'';
    return this.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}${suffix}`);
  }
});
const deepLinkPort=Object.freeze({
  open(route={}){
    const contract=root.LuviaNavigationContractV1||root.LuviaNavigationContractCoreV1;
    const intent=contract?.resolve
      ?contract.resolve(route,{source:'DeepLinkPort'})
      :Object.freeze({kind:'screen.navigate',route:String(route.screen||route.view||''),params:Object.freeze({...route.params}),source:'DeepLinkPort'});
    root.dispatchEvent(new CustomEvent('luvia:deep-link-requested',{detail:intent}));
    root.dispatchEvent(new CustomEvent('luvia:navigate-request',{detail:{view:intent.route,intent}}));
    return intent;
  },
  current(){
    const contract=root.LuviaNavigationContractV1||root.LuviaNavigationContractCoreV1;
    if(contract?.fromUrl)return contract.fromUrl(root.location?.href||'',{source:'DeepLinkPort.current'});
    const params=new URLSearchParams(root.location?.search||'');
    return Object.freeze({kind:'screen.navigate',route:params.get('screen')||null,params:Object.freeze(Object.fromEntries(params.entries())),source:'DeepLinkPort.current'});
  }
});
const offlineCachePort=Object.freeze({
  read(key,fallback=null){
    try{const raw=root.sessionStorage?.getItem(prefix+String(key));return raw==null?fallback:JSON.parse(raw)}catch{return fallback}
  },
  write(key,value){root.sessionStorage?.setItem(prefix+String(key),JSON.stringify(value));return value},
  remove(key){root.sessionStorage?.removeItem(prefix+String(key));return true},
  clear(namespace=''){
    const match=prefix+String(namespace);
    for(let index=(root.sessionStorage?.length||0)-1;index>=0;index--){const key=root.sessionStorage.key(index);if(key?.startsWith(match))root.sessionStorage.removeItem(key)}
    return true;
  }
});

function chooseMedia({accept='image/*',multiple=true,capture=null}={}){
  if(!root.document?.createElement)return Promise.reject(new Error('Media-Auswahl wird von dieser Plattform nicht unterstützt.'));
  return new Promise((resolve,reject)=>{
    const input=root.document.createElement('input');
    let settled=false;
    const finish=files=>{
      if(settled)return;
      settled=true;
      root.removeEventListener?.('focus',onFocus);
      input.remove();
      resolve(Object.freeze([...(files||[])]));
    };
    const onFocus=()=>root.setTimeout?.(()=>{if(!settled&&!input.files?.length)finish([])},0);
    input.type='file';
    input.accept=accept;
    input.multiple=Boolean(multiple);
    if(capture)input.setAttribute('capture',capture);
    input.hidden=true;
    input.addEventListener('change',()=>finish(input.files),{once:true});
    input.addEventListener('cancel',()=>finish([]),{once:true});
    root.addEventListener?.('focus',onFocus,{once:true});
    root.document.body?.appendChild(input);
    try{if(typeof input.showPicker==='function')input.showPicker();else input.click()}catch(error){
      settled=true;
      root.removeEventListener?.('focus',onFocus);
      input.remove();
      reject(error);
    }
  });
}
const mediaPickerPort=Object.freeze({
  isSupported:()=>Boolean(root.document?.createElement),
  pickImages:options=>chooseMedia({accept:'image/*,.jpg,.jpeg,.png,.webp,.heic,.heif,.avif',multiple:true,...options})
});
const mediaCapturePort=Object.freeze({
  isSupported:()=>Boolean(root.document?.createElement),
  async captureImage(options={}){const files=await chooseMedia({accept:'image/*',multiple:false,capture:options.facingMode==='user'?'user':'environment'});return files[0]||null}
});
const devicePort=Object.freeze({
  info:()=>Object.freeze({
    userAgent:String(root.navigator?.userAgent||''),
    platform:String(root.navigator?.userAgentData?.platform||root.navigator?.platform||''),
    language:String(root.navigator?.language||''),
    mobile:Boolean(root.navigator?.userAgentData?.mobile)
  })
});
const sharingPort=Object.freeze({
  isSupported:()=>typeof root.navigator?.share==='function',
  async share({title='',text='',url=''}={}){
    if(typeof root.navigator?.share!=='function')return false;
    await root.navigator.share({title,text,url});
    return true;
  },
  async copyText(value){
    if(!root.navigator?.clipboard?.writeText)return false;
    await root.navigator.clipboard.writeText(String(value??''));
    return true;
  },
  async shareFiles({title='',text='',files=[]}={}){
    if(typeof root.navigator?.share!=='function'||typeof root.File!=='function')return false;
    const nativeFiles=files.map((entry,index)=>entry instanceof root.File?entry:new root.File([entry.blob],entry.name||`media-${index+1}`,{type:entry.type||entry.blob?.type||'application/octet-stream'}));
    const payload={title,text,files:nativeFiles};
    if(root.navigator.canShare&&!root.navigator.canShare(payload))return false;
    await root.navigator.share(payload);
    return true;
  }
});

const identityPorts=root.LuviaIdentityPlatformWebPorts||{};
const registry=createPlatformPortRegistry({
  ...(identityPorts.StoragePort?{StoragePort:identityPorts.StoragePort}:{}),
  ...(identityPorts.SecureStoragePort?{SecureStoragePort:identityPorts.SecureStoragePort}:{}),
  ...(identityPorts.AuthSessionPort?{AuthSessionPort:identityPorts.AuthSessionPort}:{}),
  ...(identityPorts.NotificationPort?{NotificationPort:identityPorts.NotificationPort}:{}),
  LocationPort:locationPort,
  PermissionPort:permissionPort,
  NetworkPort:networkPort,
  LifecyclePort:lifecyclePort,
  MediaPickerPort:mediaPickerPort,
  MediaCapturePort:mediaCapturePort,
  DevicePort:devicePort,
  SharingPort:sharingPort,
  DeepLinkPort:deepLinkPort,
  ExternalNavigationPort:externalNavigationPort,
  OfflineCachePort:offlineCachePort
});

root.LuviaPlatformPorts=registry;
root.LuviaPlatformPortsReady=Promise.resolve(registry);
root.dispatchEvent(new CustomEvent('luvia:platform-ports-ready',{detail:{ports:registry.list()}}));
export default registry;
