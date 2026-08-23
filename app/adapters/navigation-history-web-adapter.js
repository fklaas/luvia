(()=>{
  'use strict';
  const VERSION='1.0.0';
  const STATE_KEY='luviaNavigationHistoryV1';
  const NAV_KEYS=Object.freeze(['screen','view','route','module']);
  const root=window;
  const navigation=root.LuviaNavigationContractV1;
  const core=root.LuviaNavigationHistoryPolicyCoreV1;
  if(!navigation?.resolve||!core?.createPolicy||!core?.matchUrl)throw new Error('Luvia Navigation History benötigt navigation.v1 und navigation-history.v1.');
  const policy=core.createPolicy({navigation});
  let started=false;
  let projectedKeys=new Set();

  function stored(value=root.history.state){return value?.[STATE_KEY]||null}
  function statePayload(effect){
    return Object.freeze({...(root.history.state||{}),[STATE_KEY]:Object.freeze({version:VERSION,position:effect.entry?.position??0,length:effect.snapshot?.length??1,key:effect.entry?.key||null,intent:effect.intent||null})});
  }
  function canonicalUrl(intent){
    const url=new URL(root.location.href);
    NAV_KEYS.forEach(key=>url.searchParams.delete(key));
    projectedKeys.forEach(key=>url.searchParams.delete(key));
    const hashParams=new URLSearchParams(url.hash.replace(/^#/,''));
    NAV_KEYS.forEach(key=>hashParams.delete(key));
    projectedKeys.forEach(key=>hashParams.delete(key));
    url.hash=hashParams.toString()?`#${hashParams}`:'';
    if(intent.route!==navigation.normalize())url.searchParams.set('screen',intent.route);
    Object.entries(intent.params||{}).forEach(([key,value])=>url.searchParams.set(key,String(value)));
    projectedKeys=new Set(Object.keys(intent.params||{}));
    return `${url.pathname}${url.search}${url.hash}`;
  }
  function apply(effect){
    if(!effect?.entry||!['push','replace'].includes(effect.action))return effect;
    const url=canonicalUrl(effect.intent);
    if(effect.action==='push')root.history.pushState(statePayload(effect),'',url);
    else root.history.replaceState(statePayload(effect),'',url);
    return effect;
  }
  function publish(effect,source='history-adapter'){
    root.dispatchEvent(new CustomEvent('luvia:navigation-history-changed',{detail:Object.freeze({source,effect,diagnostics:api.diagnostics()})}));
    return effect;
  }
  function restoreFromPlatform(event){
    const saved=stored(event?.state);
    const intent=saved?.intent||core.matchUrl(root.location.href,navigation,{source:'history-pop'})||navigation.createIntent(navigation.defaultRoute||'today',{source:'history-pop',replace:true});
    projectedKeys=new Set(Object.keys(intent.params||{}));
    const effect=policy.restore(intent,{position:Number.isInteger(saved?.position)?saved.position:0,key:saved?.key,source:'history-pop'});
    root.dispatchEvent(new CustomEvent('luvia:navigate-request',{detail:Object.freeze({view:intent.route,intent,historyAction:'restore',historyEffect:effect})}));
    publish(effect,'popstate');
  }
  function start(){
    if(started)return policy.snapshot().entry?.intent||null;
    started=true;
    root.addEventListener('popstate',restoreFromPlatform);
    const saved=stored();
    if(saved?.intent){
      projectedKeys=new Set(Object.keys(saved.intent.params||{}));
      policy.restore(saved.intent,{position:Number.isInteger(saved.position)?saved.position:0,key:saved.key,source:'history-state'});
      return saved.intent;
    }
    const effect=policy.start(root.location.href,{source:'history-url'});
    if(effect.intent){projectedKeys=new Set(Object.keys(effect.intent.params||{}));apply(effect);return effect.intent}
    return null;
  }
  function currentIntent(){return start()||policy.snapshot().entry?.intent||null}
  function project(input,options={}){
    start();
    const saved=stored();
    const effect=options.restore
      ?policy.restore(input,{position:Number.isInteger(saved?.position)?saved.position:policy.snapshot().position,key:saved?.key,source:options.source||'history-restore'})
      :policy.project(input,{replace:Boolean(options.replace),source:options.source||input?.source||'app-shell',reason:options.reason||'screen-commit'});
    apply(effect);
    return publish(effect,options.source||'app-shell');
  }
  function clear(){
    projectedKeys=new Set();
    const url=new URL(root.location.href);
    NAV_KEYS.forEach(key=>url.searchParams.delete(key));
    url.hash='';
    root.history.replaceState(null,'',`${url.pathname}${url.search}`);
    return true;
  }
  function replaceLocation(next={},options={}){
    const url=new URL(root.location.href);
    if(next.path)url.pathname=String(next.path).startsWith('/')?String(next.path):`/${String(next.path)}`;
    url.search='';
    Object.entries(next.query||{}).forEach(([key,value])=>{if(key&&value!=null)url.searchParams.set(String(key),String(value))});
    url.hash=next.hash?`#${String(next.hash).replace(/^#/,'')}`:'';
    const state=options.preserveState===false?null:root.history.state;
    root.history.replaceState(state,'',`${url.pathname}${url.search}${url.hash}`);
    publish(Object.freeze({action:'replace-location',source:options.source||'owner-flow',location:Object.freeze({path:url.pathname,search:url.search,hash:url.hash})}),options.source||'owner-flow');
    return Object.freeze({path:url.pathname,search:url.search,hash:url.hash});
  }
  function back(){const command=policy.back();root.history.back();return command}
  function forward(){const command=policy.forward();root.history.forward();return command}
  function diagnostics(){return Object.freeze({version:VERSION,started,adapter:'web-history',policy:policy.diagnostics(),currentUrl:`${root.location.pathname}${root.location.search}${root.location.hash}`})}

  const api=Object.freeze({version:VERSION,start,currentIntent,project,back,forward,clear,replaceLocation,snapshot:policy.snapshot,diagnostics});
  root.LuviaNavigationHistoryV1=api;
})();
