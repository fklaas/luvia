(()=>{
'use strict';

const root=window;
const core=root.LuviaOwnerFlowNavigationPolicyCoreV1;
if(!core?.transition)throw new Error('Owner Flow Navigation Policy Core v1 fehlt.');

function port(id){
  const registry=root.LuviaPlatformPorts;
  if(!registry?.require)throw new Error('Luvia Platform Ports sind noch nicht bereit.');
  return registry.require(id);
}
function historyAdapter(){
  const history=root.LuviaNavigationHistoryV1;
  if(!history?.replaceLocation)throw new Error('Luvia Navigation History replaceLocation fehlt.');
  return history;
}
function current(){
  const url=new URL(root.location.href);
  return core.addressDescriptor({path:url.pathname,query:Object.fromEntries(url.searchParams.entries()),hash:url.hash,href:url.href});
}
function publish(effect,options={}){
  if(options.notify===false)return effect;
  root.dispatchEvent(new CustomEvent('luvia:owner-flow-navigation',{detail:Object.freeze({effect,owner:effect.owner,type:effect.type,render:effect.render})}));
  return effect;
}
function apply(type,payload={},options={}){
  const effect=core.transition(type,payload,current());
  if(effect.action==='replace')historyAdapter().replaceLocation(effect.address,{source:type,preserveState:type!=='auth.logout'});
  if(effect.action==='external')return port('ExternalNavigationPort').open(effect.url,{reserved:options.reserved||null,purpose:effect.purpose});
  return publish(effect,options);
}
function reserveBookingHandoff(){return port('ExternalNavigationPort').reserve({placeholder:'/booking-handoff.html',purpose:'booking'})}
function diagnostics(){return Object.freeze({contractId:core.contractId,version:core.version,adapter:'web-platform-ports',historyOwner:'LuviaNavigationHistoryV1',ports:['StoragePort','SharingPort','DeepLinkPort','ExternalNavigationPort'],browserlessPolicy:Boolean(core.diagnostics().browserless),domainTruth:false,current:current()})}

root.LuviaOwnerFlowNavigationV1=Object.freeze({
  version:'1.0.0',
  current,
  authLoginSuccess:options=>apply('auth.login.success',{},options),
  authLogout:options=>apply('auth.logout',{},options),
  openJoin:(code,options)=>apply('join.open',{code},options),
  clearJoin:options=>apply('join.clear',{},options),
  completeJoin:options=>apply('join.complete',{},options),
  reserveBookingHandoff,
  openBooking:(url,options={})=>apply('booking.external',{url,purpose:'booking'},options),
  diagnostics
});
})();
