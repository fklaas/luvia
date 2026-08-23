(()=>{
'use strict';

const root=window;
function storage(scope='persistent'){
  return scope==='session'?root.sessionStorage:root.localStorage;
}
function createStoragePort(){
  return Object.freeze({
    get(key,fallback=null,options={}){
      try{const raw=storage(options.scope).getItem(String(key));if(raw==null)return fallback;try{return JSON.parse(raw)}catch{return raw}}
      catch{return fallback}
    },
    set(key,value,options={}){storage(options.scope).setItem(String(key),JSON.stringify(value));return value},
    remove(key,options={}){storage(options.scope).removeItem(String(key));return true},
    diagnostics:()=>Object.freeze({platform:'web',persistent:'local-origin-storage',transient:'session-origin-storage'})
  });
}
const storagePort=createStoragePort();
const secureStoragePort=Object.freeze({
  get:(key,fallback=null)=>storagePort.get(key,fallback,{scope:'persistent'}),
  set:(key,value)=>storagePort.set(key,value,{scope:'persistent'}),
  remove:key=>storagePort.remove(key,{scope:'persistent'}),
  diagnostics:()=>Object.freeze({platform:'web',protection:'web-origin-storage',hardwareBacked:false,tokenOwner:'supabase-auth-client'})
});
const authSessionPort=Object.freeze({
  snapshot:()=>root.LuviaAuth?.getState?.()||Object.freeze({session:null,user:null,loading:true,authenticated:false}),
  subscribe(listener){return root.LuviaAuth?.onChange?.(listener)||(()=>{})},
  async requireSession(options={}){
    let state=root.LuviaAuth?.getState?.();
    if((!state?.authenticated||!state?.session?.user?.id)&&options.refresh!==false&&root.LuviaAuth?.refreshCurrentUser){
      await root.LuviaAuth.refreshCurrentUser();
      state=root.LuviaAuth?.getState?.();
    }
    if(!state?.authenticated||!state?.session?.user?.id)throw new Error('AUTH_SESSION_NOT_READY');
    return state.session;
  },
  diagnostics:()=>Object.freeze({platform:'web',provider:'supabase-auth',sessionOwnedByProvider:true})
});
const notificationPort=Object.freeze({
  status:()=>Object.freeze({supported:typeof root.Notification==='function',permission:typeof root.Notification==='function'?root.Notification.permission:'unsupported'}),
  async requestPermission(){if(typeof root.Notification!=='function')return'unsupported';return root.Notification.requestPermission()},
  notify({title='Luvia',body='',tag='',data=null}={}){
    if(typeof root.Notification!=='function'||root.Notification.permission!=='granted')return null;
    return new root.Notification(String(title),{body:String(body),tag:String(tag),data});
  },
  diagnostics:()=>Object.freeze({platform:'web',delivery:'user-gesture-and-explicit-command-only',automaticDomainEventDelivery:false})
});

root.LuviaIdentityPlatformWebPorts=Object.freeze({StoragePort:storagePort,SecureStoragePort:secureStoragePort,AuthSessionPort:authSessionPort,NotificationPort:notificationPort});
})();
