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
const networkPort=Object.freeze({isOnline:()=>root.navigator?.onLine!==false});
const externalNavigationPort=Object.freeze({
  open(url){
    const parsed=new URL(url,root.location?.href);
    if(!/^https?:$/.test(parsed.protocol))throw new Error('ExternalNavigationPort unterstützt nur HTTP/HTTPS.');
    root.open(parsed.href,'_blank','noopener,noreferrer');
    return true;
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
    const detail={screen:String(route.screen||''),params:{...(route.params||{})}};
    root.dispatchEvent(new CustomEvent('luvia:deep-link-requested',{detail}));
    if(detail.screen==='places')root.LuviaApp?.show?.('places');
    return Object.freeze(detail);
  },
  current(){
    const params=new URLSearchParams(root.location?.search||'');
    return Object.freeze({screen:params.get('screen')||null,params:Object.freeze(Object.fromEntries(params.entries()))});
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

const registry=createPlatformPortRegistry({
  LocationPort:locationPort,
  PermissionPort:permissionPort,
  NetworkPort:networkPort,
  DeepLinkPort:deepLinkPort,
  ExternalNavigationPort:externalNavigationPort,
  OfflineCachePort:offlineCachePort
});

root.LuviaPlatformPorts=registry;
root.LuviaPlatformPortsReady=Promise.resolve(registry);
root.dispatchEvent(new CustomEvent('luvia:platform-ports-ready',{detail:{ports:registry.list()}}));
export default registry;
