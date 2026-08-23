(() => {
  'use strict';
  const VERSION='2.1.0';
  const CONTRACT_ID='overlay-host.v1';
  const core=window.LuviaOverlayHostContractCoreV1;
  if(!core?.createStack)throw new Error('Luvia UI Host benötigt overlay-host.v1.');
  const policy=core.createStack({createId:(()=>{let sequence=0;return()=>`luvia-overlay-${++sequence}`})()});
  const registry=new Map();
  const mounts=new Map();
  const backgroundState=new Map();
  const BASE_Z_INDEX=2147483000;
  const FOCUSABLE='button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  function register(name,handler){if(!name||typeof handler!=='function')throw new Error('UI-Dialog benötigt Name und Handler.');registry.set(name,handler);return()=>registry.delete(name)}
  function has(name){return registry.has(name)}
  async function open(name,payload){const handler=registry.get(name);if(!handler)throw new Error(`UI-Dialog nicht registriert: ${name}`);try{return await handler(payload)}catch(error){console.error('[LuviaUI]',name,error);throw error}}
  function focusables(overlay){return[...overlay.querySelectorAll(FOCUSABLE)].filter(node=>node.getAttribute?.('aria-hidden')!=='true'&&!node.hidden)}
  function rememberBackground(){
    [...document.body.children].forEach(node=>{
      if(node.matches?.('[data-luvia-ui-overlay]')||backgroundState.has(node))return;
      backgroundState.set(node,{inert:Boolean(node.inert),hadAriaHidden:node.hasAttribute?.('aria-hidden'),ariaHidden:node.getAttribute?.('aria-hidden')});
    });
  }
  function restoreBackground(){
    backgroundState.forEach((value,node)=>{
      node.inert=value.inert;
      if(value.hadAriaHidden)node.setAttribute('aria-hidden',value.ariaHidden??'');else node.removeAttribute('aria-hidden');
    });
    backgroundState.clear();
  }
  function syncLayers(){
    const state=policy.snapshot();
    if(state.count){
      rememberBackground();
      backgroundState.forEach((_,node)=>{node.inert=true;node.setAttribute('aria-hidden','true')});
      document.documentElement.classList.add('luvia-ui-open');
      document.body.classList.add('luvia-ui-open');
      document.documentElement.dataset.luviaUiDepth=String(state.count);
    }else{
      restoreBackground();
      document.documentElement.classList.remove('luvia-ui-open');
      document.body.classList.remove('luvia-ui-open');
      delete document.documentElement.dataset.luviaUiDepth;
    }
    mounts.forEach((item,id)=>{
      const top=id===state.top?.id;
      item.overlay.inert=!top;
      item.overlay.setAttribute('aria-hidden',top?'false':'true');
      item.overlay.dataset.luviaUiLayer=top?'top':'underlay';
      const position=state.entries.findIndex(entry=>entry.id===id);
      item.overlay.style.zIndex=String(BASE_Z_INDEX+Math.max(position,0)+1);
    });
  }
  function dialogSemantics(content,{modal=true,label=''}){
    if(!content.hasAttribute('role'))content.setAttribute('role',modal?'dialog':'region');
    if(modal)content.setAttribute('aria-modal','true');
    if(label&&!content.hasAttribute('aria-label'))content.setAttribute('aria-label',label);
    if(!content.hasAttribute('aria-label')&&!content.hasAttribute('aria-labelledby')){
      const heading=content.querySelector('h1,h2,h3');
      if(heading){heading.id=heading.id||`luvia-ui-title-${Math.random().toString(36).slice(2,10)}`;content.setAttribute('aria-labelledby',heading.id)}
    }
  }
  function mount({name='dialog',kind='dialog',content,className='',modal=true,closeOnBackdrop=true,closeOnEscape=true,closeOnBack=true,closeSelector='[data-ui-close]',initialFocus=null,label='',onClose,overlayRoot=null}={}){
    if(!(content instanceof HTMLElement))throw new Error('UI-Overlay benötigt ein HTMLElement.');
    const effect=policy.open({name,kind,modal,closeOnBackdrop,closeOnEscape,closeOnBack});
    const {id}=effect.entry;
    const overlay=overlayRoot instanceof HTMLElement?overlayRoot:document.createElement('div');
    overlay.classList.add('luvia-ui-overlay');
    String(className||'').split(/\s+/).filter(Boolean).forEach(token=>overlay.classList.add(token));
    overlay.dataset.luviaUiOverlay=id;
    overlay.dataset.luviaUiName=effect.entry.name;
    overlay.dataset.luviaUiKind=effect.entry.kind;
    dialogSemantics(content,{modal,label});
    if(content!==overlay&&!overlay.contains(content))overlay.appendChild(content);
    const previousFocus=document.activeElement;
    let closed=false;
    const finalize=reason=>{
      if(closed)return false;
      closed=true;
      mounts.delete(id);
      overlay.remove();
      syncLayers();
      const next=topMount();
      const focusTarget=next?(next.overlay.contains(previousFocus)?previousFocus:focusables(next.overlay)[0]||next.content):previousFocus;
      queueMicrotask(()=>{try{focusTarget?.focus?.({preventScroll:true})}catch{}});
      try{onClose?.(reason)}catch(error){console.error('[LuviaUI] onClose',error)}
      return true;
    };
    const forceClose=(reason='api')=>{if(closed)return false;policy.close(id,reason);return finalize(reason)};
    const requestClose=(reason='api')=>{if(closed)return false;const result=policy.requestClose({id,reason});return result.action==='close'?finalize(reason):false};
    overlay.addEventListener('pointerdown',event=>{if(event.target===overlay)requestClose('backdrop')});
    overlay.addEventListener('click',event=>{if(!closeSelector)return;let trigger=null;try{trigger=event.target.closest?.(closeSelector)}catch(error){console.error('[LuviaUI] invalid close selector',error)}if(trigger&&overlay.contains(trigger))requestClose('button')});
    const handle=Object.freeze({id,name:effect.entry.name,kind:effect.entry.kind,overlay,content,close:forceClose,requestClose,get closed(){return closed}});
    mounts.set(id,handle);
    if(!overlay.isConnected)document.body.appendChild(overlay);
    syncLayers();
    queueMicrotask(()=>{
      if(closed)return;
      const target=typeof initialFocus==='string'?overlay.querySelector(initialFocus):initialFocus instanceof HTMLElement?initialFocus:focusables(overlay)[0]||content;
      if(target===content&&!content.hasAttribute('tabindex'))content.setAttribute('tabindex','-1');
      try{target?.focus?.({preventScroll:true})}catch{}
    });
    return handle;
  }
  function adopt(overlay,options={}){
    if(!(overlay instanceof HTMLElement))throw new Error('UI-Overlay-Adoption benötigt ein HTMLElement.');
    const content=options.content instanceof HTMLElement?options.content:overlay.firstElementChild||overlay;
    return mount({...options,content,overlayRoot:overlay});
  }
  function topMount(){const id=policy.snapshot().top?.id;return id?mounts.get(id)||null:null}
  function closeTop(reason='api'){const top=topMount();return top?top.close(reason):false}
  function requestCloseTop(reason='back'){const top=topMount();return top?top.requestClose(reason):false}
  function closeAll(reason='api'){const items=[...mounts.values()].reverse();policy.closeAll(reason);items.forEach(item=>item.close(reason));return items.length}
  function handleBack(){return requestCloseTop('back')}
  function onKeyDown(event){
    const top=topMount();if(!top)return;
    if(event.key==='Escape'){if(top.requestClose('escape'))event.preventDefault();return}
    if(event.key!=='Tab')return;
    const items=focusables(top.overlay);
    if(!items.length){event.preventDefault();top.content.focus?.({preventScroll:true});return}
    const first=items[0],last=items.at(-1),active=document.activeElement;
    if(event.shiftKey&&(active===first||!top.overlay.contains(active))){event.preventDefault();last.focus({preventScroll:true})}
    else if(!event.shiftKey&&active===last){event.preventDefault();first.focus({preventScroll:true})}
  }
  function diagnostics(){const state=policy.snapshot();return Object.freeze({version:VERSION,contractId:CONTRACT_ID,adapter:'web-dom-compatibility',browserless:false,domainTruth:false,registered:[...registry.keys()],open:state.entries.map(item=>({id:item.id,name:item.name,kind:item.kind})),policy:policy.diagnostics()})}

  document.addEventListener('keydown',onKeyDown,true);
  window.addEventListener('luvia:navigate-request',()=>closeAll('navigation'));
  window.addEventListener('luvia:runtime-action',event=>{if(event.detail?.type==='session.deactivate')closeAll('session')});
  window.addEventListener('luvia:logout',()=>closeAll('session'));
  const style=document.createElement('style');
  style.textContent=`:where(.luvia-ui-overlay){position:fixed;inset:0;z-index:var(--luvia-overlay-z,2147483000);display:grid;place-items:center;padding:max(20px,env(safe-area-inset-top)) max(20px,env(safe-area-inset-right)) max(20px,env(safe-area-inset-bottom)) max(20px,env(safe-area-inset-left));background:rgba(31,43,54,.56);backdrop-filter:blur(12px);overscroll-behavior:contain}.luvia-ui-overlay[data-luvia-ui-layer="underlay"]{pointer-events:none}html.luvia-ui-open,body.luvia-ui-open{overflow:hidden;overscroll-behavior:none}@media(max-width:760px){:where(.luvia-ui-overlay){padding:max(0px,env(safe-area-inset-top)) max(0px,env(safe-area-inset-right)) max(0px,env(safe-area-inset-bottom)) max(0px,env(safe-area-inset-left));place-items:stretch}}@media(prefers-reduced-motion:reduce){.luvia-ui-overlay,.luvia-ui-overlay *{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}`;
  document.head.appendChild(style);
  window.LuviaUI=Object.freeze({version:VERSION,contractId:CONTRACT_ID,register,has,open,mount,adopt,closeTop,closeAll,handleBack,diagnostics});
  window.dispatchEvent(new CustomEvent('luvia:ui-ready',{detail:window.LuviaUI}));
})();
