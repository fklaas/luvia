(() => {
  'use strict';
  let root,activeView='today',moduleMountRegistry=null,lastRenderedTripId=null,tripSwitchToken=0,overlayPortal=null,unsubscribeTrip=null,unsubscribeRuntimeActions=null,unsubscribeProfile=null,unsubscribeCollaboration=null,collaborationFrame=0,authHydration=0,lastAuthUserId=null,hydratedAuthUserId=null,pendingPlaceOpen=null,todayRenderFrame=0,todayRenderTimer=0,todayLastHtml='',lastTripRenderSignature='',showSequence=0,shellInitialized=false,bootComplete=false,subscriptionsBound=false;
  let shellStartPromise=null,shellEventsBound=false,bootRecoveryTimer=0,runtimeStatusTimer=0,runtimeActionChain=Promise.resolve(),routeTransitionTimer=0,planCompassTransition=false,planCompassEntryTimer=0,activeCompassContext=null,compassContextToken=0,compassFlightSequence=0,compassIntentSequence=0,lastCompassFocus=null,pendingCompassContext=null,pendingCompassExit=null,compassPointerGesture=null,suppressCompassPointerClick=0;
  const activeCompassAnimations=new Set();
  const bootDiagnostics={version:window.LuviaKernelVersion?.build||'13.82.50',started:false,startReason:null,domReadyState:document.readyState,rootResolved:false,authInitialized:false,initialSession:null,bootstrapEntered:false,bootstrapCompleted:false,renderAttempted:false,renderCompleted:false,recoveryRenderAttempted:false,recoveryRenderCompleted:false,lastStage:null,lastError:null,startedAt:null,completedAt:null};
  window.LuviaBootDiagnostics=bootDiagnostics;
  function markBoot(stage,patch={}){bootDiagnostics.lastStage=stage;Object.assign(bootDiagnostics,patch);return bootDiagnostics;}
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
  const runtimeAssetLoads=new Map(),runtimeAssetDiagnostics=new Map();
  const bookingRuntimeAssets=Object.freeze({
    availability:Object.freeze({id:'booking-availability',path:'core/booking/booking-availability.js',selector:'script[data-luvia-booking-availability],script[src*="core/booking/booking-availability.js"]',datasetKey:'luviaBookingAvailability',global:'LuviaBookingAvailability',validate:client=>Boolean(client?.check&&client?.readiness),label:'Booking Availability Client'}),
    reservationCreate:Object.freeze({id:'booking-reservation-create',path:'core/booking/booking-reservation-create.js',selector:'script[data-luvia-booking-reservation-create],script[src*="core/booking/booking-reservation-create.js"]',datasetKey:'luviaBookingReservationCreate',global:'LuviaBookingReservationCreate',validate:client=>Boolean(client?.create&&client?.readiness),label:'Booking Reservation Create Client'}),
    reservationMutation:Object.freeze({id:'booking-reservation-mutation',path:'core/booking/booking-reservation-mutation.js',selector:'script[data-luvia-booking-reservation-mutation],script[src*="core/booking/booking-reservation-mutation.js"]',datasetKey:'luviaBookingReservationMutation',global:'LuviaBookingReservationMutation',validate:client=>Boolean(client?.modify&&client?.cancel&&client?.readiness),label:'Booking Reservation Mutation Client'}),
    reservationMutationStatus:Object.freeze({id:'booking-reservation-mutation-status',path:'core/booking/booking-reservation-mutation-status.js',selector:'script[data-luvia-booking-reservation-mutation-status],script[src*="core/booking/booking-reservation-mutation-status.js"]',datasetKey:'luviaBookingReservationMutationStatus',global:'LuviaBookingReservationMutationStatus',validate:client=>Boolean(client?.get&&client?.history),label:'Booking Reservation Mutation Status Client'}),
    reservationRecovery:Object.freeze({id:'booking-reservation-recovery',path:'core/booking/booking-reservation-recovery.js',selector:'script[data-luvia-booking-reservation-recovery],script[src*="core/booking/booking-reservation-recovery.js"]',datasetKey:'luviaBookingReservationRecovery',global:'LuviaBookingReservationRecovery',validate:client=>Boolean(client?.get&&client?.list&&client?.reconcile&&client?.history),label:'Booking Reservation Recovery Client'}),
    emailV2:Object.freeze({id:'booking-email-v2',path:'core/booking/booking-email-v2.js',selector:'script[data-luvia-booking-email-v2],script[src*="core/booking/booking-email-v2.js"]',datasetKey:'luviaBookingEmailV2',global:'LuviaBookingEmailV2',validate:client=>Boolean(client?.readiness&&client?.get&&client?.history&&client?.queue&&client?.send),label:'Booking Email V2 Client'})
  });
  const runtimeAssetUrl=path=>`${path}?v=${encodeURIComponent(window.LuviaKernelVersion?.build||'13.82.50')}`;
  function ensureRuntimeAsset(descriptor,{timeoutMs=3000}={}){
    const current=()=>window[descriptor.global];
    if(descriptor.validate(current())){runtimeAssetDiagnostics.set(descriptor.id,Object.freeze({status:'ready',source:'registered',path:descriptor.path}));return Promise.resolve(current())}
    if(runtimeAssetLoads.has(descriptor.id))return runtimeAssetLoads.get(descriptor.id);
    const promise=new Promise((resolve,reject)=>{
      let settled=false,timer=0,node=document.querySelector(descriptor.selector),created=false;
      const cleanup=()=>{if(timer)clearTimeout(timer);node?.removeEventListener?.('load',onLoad);node?.removeEventListener?.('error',onError)};
      const complete=(status,source,value)=>{if(settled)return;settled=true;cleanup();runtimeAssetDiagnostics.set(descriptor.id,Object.freeze({status,source,path:descriptor.path}));status==='ready'?resolve(value):reject(value)};
      const validate=(source,final=false)=>{const client=current();if(descriptor.validate(client)){complete('ready',source,client);return true}if(final)complete('failed',source,new Error(`${descriptor.label} wurde nicht registriert.`));return false};
      const onLoad=()=>validate(created?'dynamic-load':'existing-load',true);
      const onError=()=>complete('failed',created?'dynamic-error':'existing-error',new Error(`${descriptor.label} konnte nicht geladen werden.`));
      if(!node){node=document.createElement('script');node.src=runtimeAssetUrl(descriptor.path);node.dataset[descriptor.datasetKey]='true';created=true}
      node.addEventListener('load',onLoad,{once:true});node.addEventListener('error',onError,{once:true});
      runtimeAssetDiagnostics.set(descriptor.id,Object.freeze({status:'loading',source:created?'dynamic':'existing',path:descriptor.path}));
      timer=setTimeout(()=>validate(created?'dynamic-timeout':'existing-timeout',true),timeoutMs);
      if(created)document.head.appendChild(node);else queueMicrotask(()=>validate('existing-registered'));
    }).finally(()=>{runtimeAssetLoads.delete(descriptor.id)});
    runtimeAssetLoads.set(descriptor.id,promise);
    return promise;
  }
  const ensureBookingAvailabilityClient=()=>ensureRuntimeAsset(bookingRuntimeAssets.availability);
  const ensureBookingReservationCreateClient=()=>ensureRuntimeAsset(bookingRuntimeAssets.reservationCreate);
  const ensureBookingReservationMutationClient=()=>ensureRuntimeAsset(bookingRuntimeAssets.reservationMutation);
  const ensureBookingReservationMutationStatusClient=()=>ensureRuntimeAsset(bookingRuntimeAssets.reservationMutationStatus);
  const ensureBookingReservationRecoveryClient=()=>ensureRuntimeAsset(bookingRuntimeAssets.reservationRecovery);
  const ensureBookingEmailV2Client=()=>ensureRuntimeAsset(bookingRuntimeAssets.emailV2);
  const runtimeAssetSnapshot=()=>Object.freeze(Object.fromEntries([...runtimeAssetDiagnostics].map(([id,value])=>[id,{...value}])));
  const tripContract=()=>window.LuviaTripContractV1||window.LuviaTripContract||null;
  function snap(){
    const api=tripContract();
    if(!api)return {trips:[],activeTripId:null,activeTrip:null,hasTrips:false,hasActiveTrip:false,loaded:false};
    const trips=api.listTrips?.()||api.snapshot?.()?.trips||[];
    const activeTrip=api.getActiveTrip?.()||api.snapshot?.()?.activeTrip||null;
    const context=api.getContext?.()||api.snapshot?.()?.context||{};
    const activeTripId=String(activeTrip?.id||activeTrip?.tripId||context?.tripId||'')||null;
    return {trips,activeTripId,activeTrip,hasTrips:trips.length>0,hasActiveTrip:Boolean(activeTrip),loaded:true};
  }
  const activeTrip=()=>tripContract()?.getActiveTrip?.()||snap().activeTrip,profile=()=>window.LuviaProfileService?.snapshot?.().profile||{};
  const initials=p=>(p.displayName||p.email||'L').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
  const avatar=p=>p.avatarUrl?`<img class="lv-header-avatar" src="${esc(p.avatarUrl)}" alt="Profil">`:`<span class="lv-header-avatar" style="--avatar:${esc(p.avatarColor||'#ee6f83')}">${esc(initials(p))}</span>`;
  function bootScreen(){if(root)root.innerHTML=''}
  function errorScreen(error){root.innerHTML=`<main class="lv-empty"><section class="lv-card"><span class="lv-logo"></span><h1>Start nicht möglich</h1><div class="lv-error">${esc(error?.message||error||'Unbekannter Fehler')}</div><div class="lv-actions"><button class="lv-primary" data-retry>Erneut versuchen</button><a class="lv-secondary" href="intelligence/console.html">Developer Console</a></div></section></main>`}
  async function signedOut(){
    const mountRoot=root||document.getElementById('app');
    const authApi=(window.LuviaAuth||window.ParisAuth),authUI=(window.LuviaAuthUI||window.ParisAuthUI);
    if(!mountRoot){console.error('[LuviaAuthBoot] #app fehlt.');return;}
    // A pending invite may own the signed-out screen, but only if it actually mounts DOM.
    const joinRendered=await window.LuviaJoinFlow?.renderIfPending?.(mountRoot,authApi.getState(),profile());
    if(joinRendered&&mountRoot.children.length>0)return;
    if(joinRendered)console.warn('[LuviaAuthBoot] JoinFlow meldete Render-Erfolg ohne DOM; Public Entry übernimmt.');
    const fallbackLogin=(reason='fallback')=>{
      document.documentElement.classList.remove('lv-public-entry-active','lv-entry-active');
      document.body.classList.remove('lv-public-entry-active','lv-entry-active');
      mountRoot.innerHTML=`<main class="lv-auth lv-card" data-luvia-auth-recovery="${reason}"><header class="lv-auth-head"><span class="lv-logo"></span><h1>Willkommen bei Luvia</h1><p>Melde dich an, um deine Reisen auf diesem Gerät zu öffnen.</p></header><div class="lv-auth-slot" data-auth-slot></div></main>`;
      authUI?.renderAuthForm?.(mountRoot.querySelector('[data-auth-slot]'),'login');
    };
    if(!window.LuviaGuidedJourneyEntry?.render){fallbackLogin('entry-missing');return;}
    try{
      window.LuviaGuidedJourneyEntry.render(mountRoot);
      if(!mountRoot.querySelector('[data-entry-root]'))throw new Error('LUVIA_PUBLIC_ENTRY_MOUNT_FAILED');
    }catch(error){console.error('[LuviaAuthBoot] Public Entry konnte nicht gerendert werden',error);fallbackLogin('entry-render-error');return;}
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const entry=mountRoot.querySelector('[data-entry-root]'),active=entry?.querySelector('[data-screen].is-active');
      const marker=active?.querySelector('.lv-home-copy,.lv-step-card,.lv-idea-content,.lv-entry-header');
      const rect=active?.getBoundingClientRect?.(),markerRect=marker?.getBoundingClientRect?.();
      const style=active?getComputedStyle(active):null,markerStyle=marker?getComputedStyle(marker):null;
      const inViewport=Boolean(markerRect&&markerRect.bottom>0&&markerRect.right>0&&markerRect.top<(window.innerHeight||document.documentElement.clientHeight)&&markerRect.left<(window.innerWidth||document.documentElement.clientWidth));
      const visible=Boolean(active&&marker&&rect&&markerRect&&rect.width>10&&rect.height>10&&markerRect.width>10&&markerRect.height>10&&inViewport&&style?.visibility!=='hidden'&&style?.opacity!=='0'&&markerStyle?.visibility!=='hidden'&&markerStyle?.opacity!=='0'&&markerStyle?.display!=='none');
      if(!visible){console.error('[LuviaAuthBoot] Unvollständiger Public-Entry-Mount – Login-Fallback wird aktiviert.');fallbackLogin('entry-watchdog');}
    }));
  }
  async function noTrips(){if(await window.LuviaJoinFlow?.renderIfPending?.(root,(window.LuviaAuth||window.ParisAuth).getState(),profile()))return;root.innerHTML=`<main class="lv-empty"><section class="lv-card"><span class="lv-logo"></span><h1>Eure erste Reise wartet</h1><p>Erstellt eine Reise und legt Reiseziel, Zeitraum, Stil und Module fest.</p><div class="lv-actions" style="justify-content:center"><button class="lv-primary" data-create>Reise erstellen</button><button class="lv-secondary" data-join-code>Einladungscode eingeben</button><button class="lv-secondary" data-profile-open="hub">Profil</button><button class="lv-secondary" data-signout>Abmelden</button></div></section></main>`}
  function dashboard(t){const p=profile(),today=window.LuviaTodayExperience;if(!today?.render)throw new Error('Today Experience v1 fehlt.');return today.render({trip:t,profile:p,esc,widgetsHtml:window.LuviaDashboardWidgets.render({trip:t,profile:p,esc})})}
  const navigationIcons=Object.freeze({
    today:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.2 12 4l8 7.2v8.3a.5.5 0 0 1-.5.5h-5v-6h-5v6h-5a.5.5 0 0 1-.5-.5Z"/></svg>',
    plan:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4M11 7.5v7M7.5 11h7"/></svg>',
    trip:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5 10 3l4 2.5L19 3v15.5L14 21l-4-2.5L5 21Z"/><path d="M10 3v15.5M14 5.5V21"/></svg>',
    memories:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.5"/><path d="m6.5 17 4-4 2.7 2.5 2.3-2 2 3.5"/></svg>',
    profile:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10Z"/></svg>',
    control:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22"/></svg>',
    invite:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5M18 8v6M15 11h6"/></svg>'
  });
  const compassAssetBase='assets/brand/luvia-living-compass/layers';
  function livingCompass(className=''){
    return `<span class="lv-living-compass ${esc(className)}" aria-hidden="true"><img class="lv-living-compass__face" src="${compassAssetBase}/face.svg" alt=""><img class="lv-living-compass__needle" src="${compassAssetBase}/two-ended-needle.svg" alt=""><img class="lv-living-compass__hub" src="${compassAssetBase}/hub.svg" alt=""></span>`;
  }
  const compassWait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const compassMotionReduced=()=>document.documentElement.classList.contains('reduce-motion')||document.body.classList.contains('reduce-motion')||window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const compassSelectionHold=()=>compassMotionReduced()?Promise.resolve():compassWait(620);
  const currentPlanCompassStage=()=>root?.querySelector('[data-stage] > .lv-view-host:not(.lv-route-previous) [data-plan-compass-stage]')||null;
  function cancelCompassFlights(){
    ++compassFlightSequence;
    activeCompassAnimations.forEach(animation=>{try{animation.cancel()}catch{}});activeCompassAnimations.clear();
    document.querySelectorAll('.lv-plan-compass-flight').forEach(node=>node.remove());
  }
  function planCompassBrandSource(){
    const mobile=window.matchMedia?.('(max-width: 800px)')?.matches;
    const preferred=root?.querySelector(mobile?'.lv-living-mobile-compass':'.lv-living-brand-compass');
    if(preferred?.getClientRects?.().length)return preferred;
    return root?.querySelector('.lv-living-brand-compass,.lv-living-mobile-compass')||null;
  }
  async function flyPlanCompass(source,target,{returning=false}={}){
    if(!source||!target||compassMotionReduced())return true;
    cancelCompassFlights();const sequence=compassFlightSequence;
    const start=source.getBoundingClientRect(),end=target.getBoundingClientRect();
    if(!start.width||!end.width)return true;
    const flightHost=root?.querySelector('.lv-living-shell')||root;if(!flightHost)return true;
    const flight=source.cloneNode(true);flight.className='lv-plan-compass-flight';
    Object.assign(flight.style,{left:`${start.left}px`,top:`${start.top}px`,width:`${start.width}px`,height:`${start.height}px`});flightHost.appendChild(flight);
    const inheritedSelectionAngle=getComputedStyle(source).getPropertyValue('--lv-plan-selection-angle').trim();
    if(inheritedSelectionAngle)flight.style.setProperty('--lv-plan-selection-angle',inheritedSelectionAngle);
    const dx=end.left+end.width/2-(start.left+start.width/2),dy=end.top+end.height/2-(start.top+start.height/2),scale=end.width/Math.max(start.width,1);
    const frames=returning
      ?[{transform:'translate3d(0,0,0) scale(1) rotate(0deg)',opacity:1},{transform:`translate3d(${dx*.72}px,${dy*.72}px,0) scale(${Math.max(scale*1.25,.3)}) rotate(13deg)`,opacity:.96,offset:.72},{transform:`translate3d(${dx}px,${dy}px,0) scale(${scale}) rotate(0deg)`,opacity:.16}]
      :[{transform:'translate3d(0,0,0) scale(1) rotate(0deg)',opacity:1},{transform:`translate3d(${dx*.68}px,${dy*.68}px,0) scale(${Math.max(scale*.82,1.08)}) rotate(-9deg)`,opacity:.98,offset:.68},{transform:`translate3d(${dx}px,${dy}px,0) scale(${scale}) rotate(0deg)`,opacity:.1}];
    const duration=returning?920:1100;let animation=null;
    try{
      animation=flight.animate(frames,{duration,easing:'cubic-bezier(.16,.84,.18,1)',fill:'forwards'});activeCompassAnimations.add(animation);
      await Promise.race([animation.finished.catch(()=>null),compassWait(duration+180)]);
    }catch{}finally{if(animation){activeCompassAnimations.delete(animation);try{animation.cancel()}catch{}}flight.remove()}
    return sequence===compassFlightSequence;
  }
  async function revealPlanCompass(){
    const stage=currentPlanCompassStage(),shell=root?.querySelector('.lv-living-shell');if(!stage||activeView!=='plan'||planCompassTransition)return;
    stage.classList.remove('is-ready','is-compass-arriving','is-navigating','is-returning');await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    if(activeView!=='plan'||!stage.isConnected)return;
    const source=planCompassBrandSource(),target=stage.querySelector('.lv-plan-compass-mark');shell?.classList.add('is-plan-compass-detached');
    const arrivalTimer=setTimeout(()=>{if(activeView==='plan'&&!planCompassTransition&&stage.isConnected)stage.classList.add('is-compass-arriving')},compassMotionReduced()?0:860);
    const completed=await flyPlanCompass(source,target);
    clearTimeout(arrivalTimer);
    if(!completed||planCompassTransition||activeView!=='plan'||!stage.isConnected){shell?.classList.remove('is-plan-compass-detached');return}
    stage.classList.add('is-compass-arriving');await compassWait(compassMotionReduced()?0:240);
    if(!planCompassTransition&&activeView==='plan'&&stage.isConnected)requestAnimationFrame(()=>stage.isConnected&&stage.classList.add('is-ready'));
  }
  function clearPlanCompassVisuals({preserveFlights=false}={}){
    clearTimeout(planCompassEntryTimer);if(!preserveFlights){cancelCompassFlights();root?.querySelector('.lv-living-shell')?.classList.remove('is-plan-compass-detached')}
    root?.querySelectorAll('[data-plan-compass-stage]').forEach(stage=>{stage.classList.remove('is-ready','is-compass-arriving','is-navigating','is-returning','is-context-leaving','is-context-entering','is-context-seeking','is-context-pulsing');stage.querySelectorAll('.is-selected').forEach(node=>node.classList.remove('is-selected'))});
  }
  async function returnPlanCompassHome(stage){
    const shell=root?.querySelector('.lv-living-shell'),source=stage?.querySelector('.lv-plan-compass-mark'),target=planCompassBrandSource();
    stage?.classList.add('is-returning');let completed=false;
    try{completed=await flyPlanCompass(source,target,{returning:true})}finally{shell?.classList.remove('is-plan-compass-detached')}
    if(completed&&target){const lockup=target.closest('.lv-living-brand,.lv-living-mobile-brand')||target;lockup.classList.add('lv-plan-compass-home-arrival');setTimeout(()=>lockup.classList.remove('lv-plan-compass-home-arrival'),760)}
    return completed;
  }
  function navigationItems(){
    const registered=new Map((window.LuviaNavigationRegistry?.items?.()||[]).map(item=>[item.id,item]));
    const fallbackLabels={today:'Heute',plan:'Planen',trip:'Reise',memories:'Erinnern'},routeItem=id=>registered.get(id)||{id,label:fallbackLabels[id]||id};
    return [routeItem('today'),routeItem('plan'),{id:'compass',label:'Luvia Compass',action:'assistant'},routeItem('trip'),routeItem('memories')];
  }
  function dock(){
    return `<div class="lv-dock-wrap"><nav class="lv-dock" aria-label="Hauptnavigation">${navigationItems().map(item=>item.action==='assistant'
      ?`<button class="lv-nav lv-nav--compass lv-ai-global-trigger" type="button" data-ai-ask-open data-luvia-experience-component="commandSurface" data-luvia-experience-role="livingCompass" aria-label="Luvia Compass öffnen" aria-haspopup="dialog">${livingCompass('lv-nav-compass-mark')}<span class="lv-nav-label">${esc(item.label)}</span></button>`
      :`<button class="lv-nav ${activeView===item.id?'on':''}" type="button" data-view="${item.id}" data-compass-context="${item.id}" ${activeView===item.id?'aria-current="page"':''}><span class="lv-nav-icon">${navigationIcons[item.id]||''}</span><span class="lv-nav-label">${esc(item.label)}</span></button>`).join('')}</nav></div>`;
  }
  function sidebarNavigation(){
    return `<nav class="lv-living-primary-nav" aria-label="Luvia Bereiche">${navigationItems().map(item=>item.action==='assistant'
      ?`<button class="lv-living-nav-item lv-living-nav-ai lv-ai-global-trigger" type="button" data-ai-ask-open data-luvia-experience-component="commandSurface" data-luvia-experience-role="livingCompass" aria-label="Luvia Compass öffnen" aria-haspopup="dialog">${livingCompass('lv-living-nav-compass')}<span class="lvx-command-trigger-copy"><b>${esc(item.label)}</b><small>Fragen &amp; handeln</small></span></button>`
      :`<button class="lv-living-nav-item ${activeView===item.id?'is-active':''}" type="button" data-view="${item.id}" data-compass-context="${item.id}" ${activeView===item.id?'aria-current="page"':''}><span class="lv-living-nav-icon">${navigationIcons[item.id]||''}</span><span>${esc(item.label)}</span></button>`).join('')}<button class="lv-living-nav-item" type="button" data-profile-open="hub" data-compass-context="profile"><span class="lv-living-nav-icon">${navigationIcons.profile}</span><span>Profil</span></button></nav>`;
  }
  function phaseRail(){
    const hour=new Date().getHours(),active=hour<11?0:hour<15?1:hour<18?2:hour<22?3:4;
    return `<div class="lv-living-phase-rail" aria-label="Reisephase">${['Morgen','Unterwegs','Vor Ort','Abend','Erinnern'].map((label,index)=>`<span class="${index===active?'is-active':''}"><b>${label}</b><i></i></span>`).join('')}</div>`;
  }
  function companionProjection(){
    const state=window.LuviaCollaboration?.snapshot?.()||{},members=Array.isArray(state.members)?state.members:[];
    if(!members.length)return '';
    return `<div class="lv-living-companions" aria-label="Mitreisende">${members.slice(0,3).map(member=>`<span title="${esc(member.displayName||member.name||'Mitreisende Person')}">${esc(initials(member))}</span>`).join('')}${members.length>3?`<span>+${members.length-3}</span>`:''}</div>`;
  }
  function activeTripMarkup(t){
    return `<span>Aktive Reise</span><strong>${esc(t.title||'Unsere Reise')}</strong><small>${esc(t.destination?.name||'Reiseziel offen')}${t.startDate||t.endDate?` · ${esc([t.startDate,t.endDate].filter(Boolean).join(' – '))}`:''}</small><div class="lv-living-trip-accent" aria-hidden="true"><i></i><i></i><i></i><i></i></div>`;
  }
  function refreshNavigationSelection(view=activeView){
    const compassView=currentPlanCompassStage()&&activeCompassContext?({today:'today',plan:'plan',trip:'trip',memories:'memories'}[activeCompassContext]||null):null;
    const selectedView=compassView||view;
    root?.querySelectorAll?.('.lv-living-nav-item[data-view],.lv-dock .lv-nav[data-view]').forEach(button=>{
      const selected=button.dataset.view===selectedView;button.classList.toggle(button.closest('.lv-living-primary-nav')?'is-active':'on',selected);
      if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
    root?.querySelectorAll?.('[data-compass-context="profile"]').forEach(button=>button.classList.toggle('is-compass-context-active',activeCompassContext==='profile'));
  }


  const moduleForPlaceType=type=>({restaurant:'restaurants',accommodation:'accommodations',attraction:'attractions',photo_spot:'photo_spots',activity:'activities',shopping:'shopping',nature:'nature',mobility:'mobility',family:'family',transit:'mobility',custom:'custom-places'}[type]||null);
  function placeOpenPayload(element){return{type:element.dataset.placeType||'custom',placeId:element.dataset.placeId||'',providerPlaceId:element.dataset.providerPlaceId||'',tripPlaceId:element.dataset.tripPlaceId||'',title:element.dataset.placeTitle||'',mode:element.dataset.placeMode||'detail',date:element.dataset.placeDate||'',time:element.dataset.placeTime||'',durationMinutes:Number(element.dataset.placeDuration||45)};}
  const tripRenderSignature=t=>JSON.stringify([t?.id||t?.tripId||'',t?.title||'',t?.accent||'',t?.symbol||'',t?.startDate||'',t?.endDate||'',t?.destination?.name||'',t?.destination?.formattedAddress||'',...(window.LuviaModuleRegistry?.enabledForTrip?.(t)||[])]);
  async function resolvePlaceForAction(payload){
    const direct=payload.placeId&&window.LuviaPlaceCore?.getPlace?.(payload.placeId);
    if(direct)return direct;
    const places=window.LuviaPlaceCore?.getPlaces?.({tripId:activeTrip()?.id||activeTrip()?.tripId})||[];
    let match=places.find(p=>String(p.id||'')===String(payload.placeId||'')||String(p.sourceId||p.providerPlaceId||'')===String(payload.providerPlaceId||'')||String(p.metadata?.tripPlaceId||'')===String(payload.tripPlaceId||'')||(payload.title&&p.name===payload.title));
    if(match)return match;
    if(payload.type==='restaurant'&&window.LuviaRestaurants?.list){
      const response=await window.LuviaRestaurants.list({tripId:activeTrip()?.id||activeTrip()?.tripId});
      const entries=(response?.data?.entities||[]).map(window.LuviaRestaurants.entityToEntry);
      const entry=entries.find(item=>String(item.placeId||'')===String(payload.placeId||'')||String(item.providerPlaceId||'')===String(payload.providerPlaceId||'')||String(item.tripPlaceId||'')===String(payload.tripPlaceId||'')||(payload.title&&item.name===payload.title));
      if(entry)match=window.LuviaPlaceCore?.registerPlace?.(entry,{primaryType:'restaurant'});
    }
    return match||null;
  }
  async function deliverPlaceOpen(payload){if(!payload)return false;const moduleId=moduleForPlaceType(payload.type);if(moduleId==='restaurants'&&window.LuviaRestaurantsV2?.openPlace)return Boolean(await window.LuviaRestaurantsV2.openPlace(payload));if(moduleId==='accommodations'&&window.LuviaAccommodations?.openPlace)return Boolean(await window.LuviaAccommodations.openPlace(payload));if(moduleId==='attractions'&&window.LuviaAttractions?.openPlace)return Boolean(await window.LuviaAttractions.openPlace(payload));if(moduleId==='photo_spots'&&window.LuviaPhotoSpots?.openPlace)return Boolean(await window.LuviaPhotoSpots.openPlace(payload));if(moduleId==='shopping'&&window.LuviaShopping?.openPlace)return Boolean(await window.LuviaShopping.openPlace(payload));if(moduleId==='nature'&&window.LuviaNature?.openPlace)return Boolean(await window.LuviaNature.openPlace(payload));if(moduleId==='mobility'&&window.LuviaMobility?.openPlace)return Boolean(await window.LuviaMobility.openPlace(payload));window.dispatchEvent(new CustomEvent('luvia:open-place',{detail:payload}));return true;}
  async function openTypedPlaceOverlay(payload){const moduleId=moduleForPlaceType(payload?.type);try{if(moduleId==='restaurants'&&window.LuviaRestaurantsV2?.openPlace)return Boolean(await window.LuviaRestaurantsV2.openPlace(payload));if(moduleId==='accommodations'&&window.LuviaAccommodations?.openPlace)return Boolean(await window.LuviaAccommodations.openPlace(payload));if(moduleId==='attractions'&&window.LuviaAttractions?.openPlace)return Boolean(await window.LuviaAttractions.openPlace(payload));if(moduleId==='photo_spots'&&window.LuviaPhotoSpots?.openPlace)return Boolean(await window.LuviaPhotoSpots.openPlace(payload));if(moduleId==='shopping'&&window.LuviaShopping?.openPlace)return Boolean(await window.LuviaShopping.openPlace(payload));if(moduleId==='nature'&&window.LuviaNature?.openPlace)return Boolean(await window.LuviaNature.openPlace(payload));if(moduleId==='mobility'&&window.LuviaMobility?.openPlace)return Boolean(await window.LuviaMobility.openPlace(payload))}catch(error){console.warn('[Luvia App] Typabhängige Place-Detailkarte konnte nicht direkt geöffnet werden.',error)}return false;}
  async function openPlace(payload){
    const requestedReturn=payload?.returnView||activeView;
    payload={...payload,returnView:requestedReturn};
    const moduleId=moduleForPlaceType(payload.type),enabled=moduleId&&window.LuviaModuleRegistry?.isEnabled?.(activeTrip(),moduleId);
    if(payload.overlayOnly&&enabled){
      if(await openTypedPlaceOverlay(payload))return;
      const typeLabel=payload.type==='accommodation'?'Unterkunft':payload.type==='restaurant'?'Restaurant':payload.type==='attraction'?'Aktivität':payload.type==='photo_spot'?'Fotospot':payload.type==='shopping'?'Shopping':payload.type==='nature'?'Natur & Ausflüge':payload.type==='mobility'?'Move':'Place';
      const overlay=window.LuviaPlaceDetails?.openLoading?.({typeLabel});
      const seed=payload.seedPlace||await resolvePlaceForAction(payload)||{};
      const providerId=String(payload.providerPlaceId||seed.providerPlaceId||seed.provider_place_id||seed.sourceId||seed.source_id||'').replace(/^places\//,'');
      const basePlace={...seed,name:seed.name||payload.title||typeLabel,primaryType:payload.type,address:seed.address||seed.formattedAddress||seed.formatted_address||'',providerPlaceId:providerId};
      const seedPhoto=seed._cardPhotoUri||seed.photoUri||seed.photo_url||seed.imageUrl||seed.image_url||'';
      const immediatePhotos=seedPhoto?[{uri:seedPhoto}]:[];
      const immediateIntel=window.LuviaPlaceIntelligence?.analyze?.(payload.type,basePlace,{trip:activeTrip()})||{};
      if(overlay)window.LuviaPlaceDetails.update(overlay,{typeLabel,placeType:payload.type,destination:activeTrip()?.destination?.name||'',place:basePlace,photos:immediatePhotos,intelligence:immediateIntel,lifecycle:{status:seed.lifecycle||seed.status||'discovered',title:`${typeLabel}-Lebenszyklus`}});
      if(providerId){
        window.LuviaPlaceDetails.prepare(providerId,{regionCode:'DE',photoLimit:4,seedPlace:seed}).then(prepared=>{
          const place={...basePlace,...(prepared.place||{}),primaryType:payload.type};
          const intel=window.LuviaPlaceIntelligence?.analyze?.(payload.type,place,{trip:activeTrip()})||immediateIntel;
          if(overlay?.node?.isConnected)window.LuviaPlaceDetails.update(overlay,{typeLabel,placeType:payload.type,destination:activeTrip()?.destination?.name||'',place,photos:prepared.photos?.length?prepared.photos:immediatePhotos,intelligence:intel,lifecycle:{status:seed.lifecycle||seed.status||'discovered',title:`${typeLabel}-Lebenszyklus`}});
        }).catch(error=>{console.error(error)});
      }
      return;
    }
    if(enabled){if(payload.type==='mobility'||payload.type==='transit'){pendingPlaceOpen=null;await show('routes',{payload});}else{pendingPlaceOpen=payload;await show('places',{moduleId,payload});pendingPlaceOpen=null;}return;}
    pendingPlaceOpen=payload;
    window.dispatchEvent(new CustomEvent('luvia:open-place',{detail:payload}));
  }
  async function addTodaySuggestion(element){
    const payload=placeOpenPayload(element),trip=activeTrip(),tripId=trip?.id||trip?.tripId;
    if(!tripId||!payload.date||!payload.time)return;{const [h,m]=payload.time.split(':').map(Number),d=new Date(2000,0,1,h||0,m||0);d.setMinutes(Math.ceil(d.getMinutes()/5)*5,0,0);payload.time=d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});}
    element.disabled=true;const old=element.innerHTML;element.classList.add('is-saving');
    try{
      if(payload.type==='restaurant'){
        let entry=null;
        if(window.LuviaRestaurants?.list){const response=await window.LuviaRestaurants.list({tripId});const entries=(response?.data?.entities||[]).map(window.LuviaRestaurants.entityToEntry);entry=entries.find(item=>String(item.tripPlaceId||'')===String(payload.tripPlaceId||'')||String(item.placeId||'')===String(payload.placeId||'')||String(item.providerPlaceId||'')===String(payload.providerPlaceId||'')||(payload.title&&item.name===payload.title));}
        let providerId=payload.providerPlaceId;
        if(!providerId&&payload.placeId){const known=window.LuviaPlaceCore?.getPlace?.(payload.placeId);providerId=known?.sourceId||known?.providerPlaceId||known?.metadata?.providerPlaceId||'';}
        if(!entry&&providerId){const imported=await window.LuviaRestaurants.importPlace(providerId,{tripId,tripPlace:{status:'planned',plannedDate:payload.date,plannedTime:payload.time},restaurant:{reservationStatus:'idea'}});const entity=imported?.data?.entity||imported?.data;entry=entity?.tripPlace?window.LuviaRestaurants.entityToEntry(entity):null;}
        if(!entry&&!providerId&&payload.title&&window.LuviaRestaurants?.search){const found=await window.LuviaRestaurants.search(payload.title,{tripId,maxResultCount:5,persistRecommendations:false});const exact=(found?.data?.places||[]).find(place=>String(place.name||'').toLowerCase()===String(payload.title).toLowerCase())||(found?.data?.places||[])[0];providerId=String(exact?.id||exact?.providerPlaceId||'').replace(/^places\//,'');if(providerId){const imported=await window.LuviaRestaurants.importPlace(providerId,{tripId,tripPlace:{status:'planned',plannedDate:payload.date,plannedTime:payload.time},restaurant:{reservationStatus:'idea'}});const entity=imported?.data?.entity||imported?.data;entry=entity?.tripPlace?window.LuviaRestaurants.entityToEntry(entity):null;}}
        if(!entry&&window.LuviaRestaurants?.list){const response=await window.LuviaRestaurants.list({tripId});entry=(response?.data?.entities||[]).map(window.LuviaRestaurants.entityToEntry).find(item=>String(item.providerPlaceId||'')===String(payload.providerPlaceId||'')||String(item.placeId||'')===String(payload.placeId||'')||(payload.title&&item.name===payload.title));}
        if(!entry?.tripPlaceId)throw new Error('Der vorgeschlagene Ort konnte nicht eindeutig zur Reise hinzugefügt werden.');
        const stableName=payload.title||entry.name;
        const saved=await window.LuviaRestaurants.updateLifecycle(entry.tripPlaceId,'planned',{plannedDate:payload.date,plannedTime:payload.time,reservationStatus:entry.reservationStatus||'idea',metadata:{scheduledFrom:'today-free-window',displayName:stableName,expectedDurationMinutes:Number(payload.durationMinutes||45)}},{tripId});
        const savedEntity=saved?.data?.tripPlace?saved.data:null;const savedEntry=savedEntity?window.LuviaRestaurants.entityToEntry(savedEntity):entry;
        await window.LuviaScheduleIntelligence?.upsertRestaurantAsync?.({...savedEntry,name:stableName,date:payload.date,time:payload.time,plannedDate:payload.date,plannedTime:payload.time,lifecycleStatus:'planned',metadata:{...(savedEntry.metadata||{}),expectedDurationMinutes:Number(payload.durationMinutes||45)},source:{...(savedEntry.source||{}),suggestion:true,persistedRestaurant:true},tripId});
        await window.LuviaScheduleIntelligence?.waitForPersistence?.();
      }else{
        window.dispatchEvent(new CustomEvent('luvia:plan-place-suggestion',{detail:{...payload,tripId}}));
      }
      await window.LuviaTodayIntelligence?.refresh?.({refreshSchedule:false});
      window.setTimeout(()=>window.LuviaScheduleIntelligence?.refresh?.({tripId,force:true}).catch?.(()=>{}),400);
      window.LuviaUIKit?.toast?.(`${payload.title||'Ort'} wurde um ${payload.time} Uhr eingeplant.`,{type:'success'});
    }catch(error){console.error('[Luvia Today Suggestion]',error);window.LuviaUIKit?.toast?.(error.message||'Der Vorschlag konnte nicht eingeplant werden.',{type:'error'});element.disabled=false;element.innerHTML=old;element.classList.remove('is-saving');}
  }
  function dashboardContext(){const t=activeTrip();return t?{trip:t,profile:profile(),esc}:null;}
  function updateDashboardWidget(id){
    if(activeView!=='today')return;
    clearTimeout(todayRenderTimer);
    todayRenderTimer=setTimeout(()=>{
      cancelAnimationFrame(todayRenderFrame);
      todayRenderFrame=requestAnimationFrame(()=>{
        const article=root?.querySelector(`[data-widget-id="${id}"]`),context=dashboardContext();
        if(!article||!context)return;
        const html=window.LuviaDashboardWidgets?.renderOne?.(id,context);
        if(typeof html!=='string'||html===article.innerHTML)return;
        const previousHeight=Math.ceil(article.getBoundingClientRect().height);
        if(previousHeight>0)article.style.minHeight=`${previousHeight}px`;
        article.innerHTML=html;
        if(id==='today')todayLastHtml=html;
        requestAnimationFrame(()=>{article.style.minHeight=''});
      });
    },420);
  }
  const updateTodayWidget=()=>updateDashboardWidget('today');

  function appRuntime(){const runtime=window.LuviaAppRuntime;if(!runtime?.run||!runtime?.complete||!runtime?.recover)throw new Error('Luvia App Runtime v1 fehlt.');return runtime}
  function completeRuntimeStage(stage,detail={}){const runtime=appRuntime(),result=!runtime.isAtLeast(stage)?runtime.complete(stage,detail):runtime.snapshot();if(stage==='shell-ready')ensureRuntimeStatus();return result}
  function recoverRuntime(to,detail={}){const runtime=appRuntime();if(runtime.snapshot().status==='failed'||runtime.isAtLeast(to))return runtime.recover({to,detail});return runtime.snapshot()}
  function navigationContract(){const contract=window.LuviaNavigationContractV1;if(!contract?.get||!contract?.normalize||!contract?.resolve)throw new Error('Luvia Navigation Contract v1 fehlt.');return contract}
  function navigationHistory(){const history=window.LuviaNavigationHistoryV1;if(!history?.currentIntent||!history?.project||!history?.back||!history?.forward)throw new Error('Luvia Navigation History v1 fehlt.');return history}
  function runtimeSignals(){const signals=window.LuviaAppRuntimeSignalsV1;if(!signals?.start||!signals?.subscribe||!signals?.authSnapshot)throw new Error('Luvia App Runtime Signals v1 fehlen.');return signals}
  function ensureRuntimeStatus(){
    const header=root?.querySelector?.('.lv-header');if(!header)return null;
    let node=root.querySelector('[data-runtime-status]');
    if(!node){node=document.createElement('div');node.className='lv-runtime-status';node.dataset.runtimeStatus='online';node.setAttribute('role','status');node.setAttribute('aria-live','polite');node.setAttribute('aria-atomic','true');node.hidden=true;header.insertAdjacentElement('afterend',node)}
    if(runtimeSignals().snapshot()?.online===false)updateRuntimeStatus('offline','Offline · Luvia arbeitet lokal weiter.');
    return node;
  }
  function updateRuntimeStatus(state,message,{hideAfterMs=0}={}){
    const node=root?.querySelector?.('[data-runtime-status]')||ensureRuntimeStatus();if(!node)return;
    clearTimeout(runtimeStatusTimer);node.dataset.runtimeStatus=state;node.textContent=message;node.hidden=!message;
    if(hideAfterMs>0)runtimeStatusTimer=setTimeout(()=>{node.hidden=true;node.textContent=''},hideAfterMs);
  }
  async function handleRuntimeAction(client,action){
    if(!action?.type)return;
    markBoot('runtime-action',{lastRuntimeAction:action.type,lastRuntimeActionAt:action.at||new Date().toISOString()});
    if(action.type==='runtime.offline'){updateRuntimeStatus('offline','Offline · Luvia arbeitet lokal weiter.');return}
    if(action.type==='runtime.reconnect'){
      updateRuntimeStatus('reconnect','Wieder online · Luvia aktualisiert deine Reise.',{hideAfterMs:3600});
      if(!bootComplete)return;
      window.LuviaRuntime.refresh();window.LuviaDestination?.refresh?.();window.LuviaCollaboration?.heartbeat?.();
      if(root?.querySelector('.lv-shell'))await show(activeView,{force:true,animate:false,history:false,source:'runtime-reconnect'});
      return;
    }
    if(action.type==='runtime.resume'){
      const authState=runtimeSignals().authSnapshot(),userId=authState?.user?.id||null;
      if(!bootComplete||!authState?.authenticated||String(userId||'')!==String(action.payload?.userId||''))return;
      if(action.payload?.online===false){updateRuntimeStatus('offline','Offline · Luvia arbeitet lokal weiter.');window.LuviaRuntime.refresh();return}
      updateRuntimeStatus('resume','Willkommen zurück · Deine Ansicht wird aktualisiert.',{hideAfterMs:2600});
      window.LuviaRuntime.refresh();window.LuviaDestination?.refresh?.();window.LuviaCollaboration?.heartbeat?.();
      const activeId=snap().activeTripId;if(activeId)await window.LuviaJourneyContractV1?.commands?.hydrate?.(activeId).catch(()=>{});
      if(root?.querySelector('.lv-shell'))await show(activeView,{force:true,animate:false,history:false,source:'runtime-resume'});
      return;
    }
    const authState=runtimeSignals().authSnapshot(),uid=authState?.user?.id||null;
    if(action.type==='session.activate'||action.type==='session.switch'){
      if(!authState?.authenticated||String(uid||'')!==String(action.payload?.userId||''))return;
      if(hydratedAuthUserId===uid&&bootComplete)return;
      await unmountCurrent(action.type);recoverRuntime('auth-ready',{reason:action.type,userId:uid});window.LuviaBootCoordinator.reset();lastRenderedTripId=null;bootComplete=false;await hydrateForAuth(client,authState);return;
    }
    if(action.type==='session.deactivate'){
      if(authState?.authenticated)return;
      window.LuviaProfileFoundation?.close?.();
      await unmountCurrent('session.deactivate');recoverRuntime('auth-ready',{reason:'session.deactivate'});window.LuviaBootCoordinator.reset();lastAuthUserId=null;lastRenderedTripId=null;bootComplete=false;await hydrateForAuth(client,authState);
    }
  }
  function queueRuntimeAction(client,action){runtimeActionChain=runtimeActionChain.then(()=>handleRuntimeAction(client,action)).catch(error=>{errorScreen(error);return null});return runtimeActionChain}
  function screenIntent(view,options={}){
    const navigation=navigationContract();
    if(options.intent)return navigation.resolve(options.intent,{source:options.source||options.intent.source||'app-shell',replace:options.replace??options.intent.replace});
    const current=navigationHistory().currentIntent();
    if(current?.route===view&&!options.resetParams)return current;
    return navigation.createIntent(view,{source:options.source||'app-shell',replace:Boolean(options.replace)});
  }
  function commitScreenIntent(intent,options={}){
    if(options.history===false)return null;
    return navigationHistory().project(intent,{restore:options.historyAction==='restore',replace:Boolean(options.replace),source:options.source||intent.source||'app-shell'});
  }
  function moduleMounts(){
    if(moduleMountRegistry)return moduleMountRegistry;
    const core=window.LuviaModuleMountContractCoreV1;
    if(!core?.createRegistry)throw new Error('Luvia Module Mount Contract v1 fehlt.');
    moduleMountRegistry=core.createRegistry({navigation:navigationContract()});
    moduleMountRegistry.register('places',{mount:async({target,trip,options})=>{window.LuviaDestination?.refresh?.();await window.LuviaPlacesShell.mount(target,trip,{...options,focusReset:true});if(pendingPlaceOpen&&pendingPlaceOpen.type!=='mobility'){const payload=pendingPlaceOpen;pendingPlaceOpen=null;requestAnimationFrame(()=>window.LuviaPlacesShell.openPlace(payload))}},unmount:()=>window.LuviaPlacesShell?.unmount?.()});
    moduleMountRegistry.register('places-lifecycle',{mount:({target,trip})=>window.LuviaPlaceLifecycleHub.mount(target,trip),unmount:()=>window.LuviaPlaceLifecycleHub?.unmount?.()});
    moduleMountRegistry.register('gallery',{mount:({target,trip})=>window.LuviaGalleryView.mount(target,trip),unmount:()=>window.LuviaGalleryView?.unmount?.()});
    moduleMountRegistry.register('albums',{mount:({target,trip})=>window.LuviaAlbumsView.mount(target,trip),unmount:()=>window.LuviaAlbumsView?.unmount?.()});
    moduleMountRegistry.register('bookings',{mount:({target,trip})=>window.LuviaBookingsView.mount(target,trip),unmount:()=>window.LuviaBookingsView?.unmount?.()});
    moduleMountRegistry.register('control-center',{mount:({target})=>window.LuviaControlCenterHome.mount(target),unmount:()=>window.LuviaControlCenterHome?.unmount?.()});
    moduleMountRegistry.register('control-center-identity',{mount:({target})=>window.LuviaIdentityCenter.mount(target),unmount:()=>window.LuviaIdentityCenter?.unmount?.()});
    moduleMountRegistry.register('control-center-bookings',{mount:({target})=>window.LuviaBookingControlCenter.mount(target),unmount:()=>window.LuviaBookingControlCenter?.unmount?.()});
    moduleMountRegistry.register('control-center-inbox',{mount:({target})=>window.LuviaBookingInbox.mount(target),unmount:()=>window.LuviaBookingInbox?.unmount?.()});
    window.LuviaModuleMountRegistry=moduleMountRegistry;
    return moduleMountRegistry;
  }
  async function unmountCurrent(reason='route-change'){if(moduleMountRegistry)await moduleMountRegistry.deactivate({reason})}
  const MOUNT_FAILURES=Object.freeze({
    places:['Places','Das Places-Modul konnte nicht geöffnet werden.'],
    'places-lifecycle':['Meine Orte','Der Places-Lifecycle konnte nicht geöffnet werden.'],
    gallery:['Fotogalerie','Die Fotogalerie konnte nicht geöffnet werden.'],
    albums:['Alben','Die Alben konnten nicht geöffnet werden.'],
    bookings:['Buchungen','Der Booking-Bereich konnte nicht geöffnet werden.'],
    'control-center':['Control Center','Das Control Center konnte nicht geöffnet werden.'],
    'control-center-identity':['Identität & Datenschutz','Das Identity Center konnte nicht geöffnet werden.'],
    'control-center-bookings':['Booking Control Center','Das Booking Control Center konnte nicht geöffnet werden.'],
    'control-center-inbox':['Booking Inbox','Die Booking Inbox konnte nicht geöffnet werden.']
  });
  function renderMountFailure(view,error,stage){console.error(error);const copy=MOUNT_FAILURES[view]||['Luvia','Dieser Bereich konnte nicht geöffnet werden.'];stage.innerHTML=`<section class="lv-card" style="padding:24px"><h2>${esc(copy[0])}</h2><div class="lv-error">${esc(copy[1])}</div></section>`}
  function transitionHost(view,content){return `<section class="lv-view-host lv-module-host lv-route-entering" aria-busy="true"><div class="lv-view-content">${content}</div></section>`}
  function excludeRouteHost(host,excluded=true){
    if(!host)return;if(excluded&&host.contains(document.activeElement))document.activeElement?.blur?.();host.inert=excluded;
    if(excluded)host.setAttribute('aria-hidden','true');else host.removeAttribute('aria-hidden');
  }
  function settleRouteTransition(stage){clearTimeout(routeTransitionTimer);routeTransitionTimer=0;const hosts=[...stage.querySelectorAll(':scope > .lv-view-host')],current=hosts.shift();hosts.forEach(host=>host.remove());current?.classList.remove('lv-route-entering','is-ready','lv-route-previous','is-exiting');excludeRouteHost(current,false);current?.setAttribute('aria-busy','false')}
  function completeTransition(stage,host,previousHost=null){if(!host)return;requestAnimationFrame(()=>requestAnimationFrame(()=>{host.classList.add('is-ready');host.setAttribute('aria-busy','false');previousHost?.classList.add('is-exiting');routeTransitionTimer=setTimeout(()=>{previousHost?.remove();host.classList.remove('lv-route-entering','is-ready');routeTransitionTimer=0},560)}))}
  function routeHelper(t){
    const destination=t?.destination?.formattedAddress||t?.destination?.name||'';
    return `<section class="lv-route-helper"><div class="lv-route-card"><span class="lv-kicker">Einfach weiterreisen</span><h1>Route in Google Maps öffnen.</h1><p>Luvia ersetzt keine Navigation. Wählt Start und Ziel; Google Maps übernimmt die aktuelle Route. Mehrere geplante Orte werden später automatisch in sinnvolle Etappen geteilt.</p><div class="lv-route-grid"><div class="lv-route-field"><label>Start</label><input data-route-origin placeholder="Aktueller Standort oder Adresse"></div><div class="lv-route-field"><label>Ziel</label><input data-route-destination value="${esc(destination)}" placeholder="Ort oder Adresse"></div></div><div class="lv-route-actions"><button class="primary" data-route-open>In Google Maps öffnen</button><button data-view="plan">Zurück zu Planen</button></div></div></section>`;
  }
  async function show(view='today',options={}){
    view=window.LuviaNavigationRegistry?.normalize?.(view)||view||'today';
    const intent=screenIntent(view,options);
    const t=activeTrip();if(!t)return render();
    const stage=root?.querySelector('[data-stage]');if(!stage)return render();settleRouteTransition(stage);
    const requestedCompassContext=view==='plan'?(options.compassContext||'plan'):null;
    const current=stage.querySelector('.lv-view-host')?.dataset?.view||'';
    const currentTripId=stage.querySelector('.lv-view-host')?.dataset?.tripId||'';
    const requestedTripId=String(t.id||t.tripId||'');
    const sameView=current===view&&currentTripId===requestedTripId;
    if(sameView&&!options.force&&(!requestedCompassContext||activeCompassContext===requestedCompassContext)){activeView=view;commitScreenIntent(intent,options);refreshNavigationSelection(view);return;}
    if(view!=='plan'){activeCompassContext=null;if(!planCompassTransition)clearPlanCompassVisuals()}
    activeView=view;const sequence=++showSequence;commitScreenIntent(intent,options);await unmountCurrent('route-change');if(sequence!==showSequence)return;window.LuviaTodayExperience?.unbind?.();window.LuviaPremiumMemoriesExperience?.unbind?.();
    const animate=options.animate!==false;
    const wrap=(name,content)=>{const html=transitionHost(name,content);return animate?html:html.replace(' lv-route-entering','').replace(' aria-busy="true"','').replace('lv-view-host','lv-view-host is-ready')};
    const route=navigationContract().get(view);
    const mount=route?.mount||{mode:'inline',key:view};
    let content='';
    if(mount.mode==='module')content=`<div id="${esc(mount.targetId)}"></div>`;
    else if(view==='routes')content=routeHelper(t);
    else if(view==='memories')content=window.LuviaPremiumMemoriesExperience?.render?.({trip:t,esc})||window.LuviaModuleHubs?.render?.(view,t)||'';
    else if(view==='plan'){activeCompassContext=requestedCompassContext||'plan';content=window.LuviaModuleHubs?.renderCompass?.(activeCompassContext,t)||window.LuviaModuleHubs?.render?.(view,t)||'';}
    else if(['trip','more'].includes(view))content=window.LuviaModuleHubs?.render?.(view,t)||'';
    else {view='today';activeView='today';content=dashboard(t);}
    const previousHost=stage.querySelector(':scope > .lv-view-host');
    if(animate&&previousHost){previousHost.classList.add('lv-route-previous');excludeRouteHost(previousHost,true);stage.insertAdjacentHTML('afterbegin',wrap(view,content))}
    else stage.innerHTML=wrap(view,content);
    const host=stage.querySelector(':scope > .lv-view-host');host?.setAttribute('data-view',view);host?.setAttribute('data-trip-id',requestedTripId);
    try{
      if(appRuntime().snapshot().status==='failed')recoverRuntime('shell-ready',{reason:'module-retry',route:view});
      await appRuntime().run('modules-ready',()=>moduleMounts().activate(view,{trip:t,options,force:Boolean(options.force),resolveTarget:targetId=>stage.querySelector(`#${targetId}`)}),{timeoutMs:20000,detail:{route:view,mountMode:mount.mode,mountKey:mount.key}});
      if(sequence!==showSequence){host?.remove();previousHost?.classList.remove('lv-route-previous','is-exiting');excludeRouteHost(previousHost,false);return;}
    }catch(error){previousHost?.remove();renderMountFailure(view,error,stage);return}
    if(view==='today'){lastRenderedTripId=requestedTripId;window.LuviaTodayExperience?.bind?.(stage,{trip:t,profile:profile(),esc});requestAnimationFrame(()=>window.LuviaJourneyDayComposer?.bindCalendar?.(stage));}
    if(view==='memories')window.LuviaPremiumMemoriesExperience?.bind?.(stage,{trip:t,profile:profile(),esc});
    if(animate)completeTransition(stage,host,previousHost);
    root.querySelector('.lv-dock-wrap')?.remove();root.querySelector('.lv-shell')?.insertAdjacentHTML('beforeend',dock());refreshNavigationSelection(view);
    clearTimeout(planCompassEntryTimer);
    if(view==='plan')planCompassEntryTimer=setTimeout(()=>revealPlanCompass().catch(error=>console.warn('[Luvia Plan Compass]',error)),animate?140:0);
    else if(!planCompassTransition)root.querySelector('.lv-living-shell')?.classList.remove('is-plan-compass-detached');
    if(options.focusHeading)setTimeout(()=>{const heading=host?.querySelector('h1');if(!heading)return;heading.setAttribute('tabindex','-1');heading.focus?.({preventScroll:true})},animate?580:0);
  }

  function refreshDashboardGrid(){const t=activeTrip(),grid=root?.querySelector('[data-widget-grid]');if(!t||activeView!=='today'||!grid)return false;grid.innerHTML=window.LuviaDashboardWidgets.render({trip:t,profile:profile(),esc});requestAnimationFrame(()=>window.LuviaJourneyDayComposer?.bindCalendar?.(grid));return true;}
  function refreshShellHeader(){const t=activeTrip(),p=profile(),shell=root?.querySelector('.lv-shell');if(!t||!shell)return;shell.querySelectorAll('.lv-trip').forEach(trip=>{trip.innerHTML=activeTripMarkup(t)});shell.querySelectorAll('.lv-profile-trigger').forEach(trigger=>{trigger.innerHTML=`${avatar(p)}<span><b>${esc(p.displayName||'Profil')}</b><small>Profil &amp; Reisekompass</small></span>`});const companions=shell.querySelector('[data-living-companions]');if(companions)companions.innerHTML=companionProjection();root.querySelector('.lv-dock-wrap')?.remove();shell.insertAdjacentHTML('beforeend',dock(t));refreshNavigationSelection();}
  function releaseBadge(){const v=window.LuviaKernelVersion||window.LuviaCoreVersion||{core:'4.17.0',build:'13.17.0'};return `<span class="lv-build-badge" title="Luvia Core ${v.core} · Build ${v.build}">${v.build} · Core ${v.core}</span>`;}
  function ready(){const t=activeTrip(),p=profile();if(!t)return noTrips();const tripId=String(t.id||t.tripId||'');lastTripRenderSignature=tripRenderSignature(t);window.LuviaTheme.apply(t);if(root.querySelector('.lv-shell')){completeRuntimeStage('shell-ready',{surface:'app-shell',reused:true});refreshShellHeader();if(lastRenderedTripId!==tripId)return show(activeView,{force:true,animate:false});completeRuntimeStage('modules-ready',{route:activeView,reused:true});return}root.innerHTML=`<div class="lv-shell lv-living-shell"><div class="lv-living-atmosphere" aria-hidden="true"><i></i><i></i><i></i></div><aside class="lv-living-sidebar"><button class="lv-living-brand" type="button" data-view="today" aria-label="Luvia Heute öffnen">${livingCompass('lv-living-brand-compass')}<span><b>LUVIA</b><small>Reisen, die mit dir leben.</small></span></button><div class="lv-trip lv-living-trip">${activeTripMarkup(t)}</div>${sidebarNavigation()}<div class="lv-living-sidebar-spacer"></div><button class="lv-living-quiet-action" type="button" data-view="control-center"><span class="lv-living-nav-icon">${navigationIcons.control}</span><span>Control Center</span></button><button class="lv-profile-trigger lv-living-profile" data-profile-open="hub">${avatar(p)}<span><b>${esc(p.displayName||'Profil')}</b><small>Profil &amp; Reisekompass</small></span></button></aside><section class="lv-living-workspace"><header class="lv-header lv-living-topbar"><button class="lv-living-mobile-brand" type="button" data-view="today" aria-label="Luvia Heute öffnen">${livingCompass('lv-living-mobile-compass')}<b>LUVIA</b></button>${phaseRail()}<div class="lv-living-top-actions"><button class="lv-trip lv-living-trip-switcher" type="button" data-edit>${activeTripMarkup(t)}</button><span data-living-companions>${companionProjection()}</span>${releaseBadge()}<button class="lv-living-icon-button" type="button" data-view="control-center" aria-label="Control Center">${navigationIcons.control}</button><button class="lv-living-icon-button" type="button" data-invite aria-label="Personen einladen">${navigationIcons.invite}</button><button class="lv-profile-trigger lv-living-top-profile" data-profile-open="hub" aria-label="Profil öffnen">${avatar(p)}</button></div></header><main class="lv-stage lv-living-stage" data-stage></main></section></div>`;shellInitialized=true;completeRuntimeStage('shell-ready',{surface:'app-shell',reused:false});return show(activeView,{animate:true})}
  async function render(){const auth=(window.LuviaAuth||window.ParisAuth).getState();if(auth.loading)return bootScreen();if(!auth.authenticated)return signedOut();document.documentElement.classList.remove('lv-entry-active','lv-public-entry-active');document.body.classList.remove('lv-entry-active','lv-public-entry-active');const s=snap();if(!s.loaded)return bootScreen('Reisen werden geladen …');if(window.LuviaJoinFlow?.pending?.())return window.LuviaJoinFlow.renderIfPending(root,auth,profile());if(!s.hasTrips||!s.hasActiveTrip)return noTrips();return ready()}
  async function hydrateForAuth(client,authState){
    const run=++authHydration;
    if(!authState?.authenticated){
      lastAuthUserId=null;hydratedAuthUserId=null;
      if(!appRuntime().isAtLeast('domain-context-ready'))await appRuntime().run('domain-context-ready',()=>Promise.resolve({authenticated:false}),{timeoutMs:5000,detail:{source:'auth-hydration',authenticated:false}});
      bootComplete=true;await render();completeRuntimeStage('shell-ready',{surface:'signed-out'});completeRuntimeStage('modules-ready',{route:null,mountMode:'none'});await window.LuviaBootCoordinator.reveal();return;
    }
    const userId=authState.user?.id||null;
    if(bootComplete&&hydratedAuthUserId===userId){await render();completeRuntimeStage('shell-ready',{surface:'app-shell'});completeRuntimeStage('modules-ready',{route:activeView});return}
    await window.LuviaBootCoordinator.boot(client);if(run!==authHydration)return;
    const p=profile();lastAuthUserId=userId;hydratedAuthUserId=userId;let profileView=window.LuviaNavigationRegistry?.normalize?.(p.defaultView)||'today';if(!['today','plan','trip','memories','more'].includes(profileView))profileView='today';const initialIntent=navigationHistory().currentIntent();activeView=initialIntent?.route||profileView;if(!navigationContract().get(activeView))activeView='today';window.LuviaRuntime.refresh();window.LuviaTheme.apply(activeTrip());window.LuviaDestination?.refresh?.();bootComplete=true;await render();completeRuntimeStage('shell-ready',{surface:'app-shell'});completeRuntimeStage('modules-ready',{route:activeView});await window.LuviaBootCoordinator.reveal();const activeId=snap().activeTripId;if(activeId){await window.LuviaCollaboration?.start?.(client);window.LuviaCollaboration?.watchTrip?.(activeId).catch?.(console.warn)}
  }
  async function bootstrap(){
    markBoot('bootstrap-enter',{bootstrapEntered:true});
    bootScreen();
    try{
      if(appRuntime().snapshot().status==='failed')appRuntime().recover({to:'idle',detail:{reason:'bootstrap-retry'}});
      const client=await appRuntime().run('platform-ready',()=>window.LuviaSupabaseService.start(),{timeoutMs:30000,detail:{source:'app-shell',capability:'supabase-service'}});
      const authApi=(window.LuviaAuth||window.ParisAuth);
      const authAfterStart=await appRuntime().run('auth-ready',()=>{const state=authApi.getState();if(state?.loading){const error=new Error('Luvia Auth Session ist noch nicht bereit.');error.code='AUTH_SESSION_NOT_READY';throw error}return state},{timeoutMs:10000,detail:{source:'app-shell',capability:'auth-session'}});
      markBoot('auth-ready',{authInitialized:!authAfterStart?.loading,initialSession:authAfterStart?.session?true:false});
      await window.LuviaJoinFlow?.start?.(client);
      window.LuviaPWA?.register?.().catch(e=>console.warn('[LuviaPWA]',e));
      const initialAuth=authApi.getState();
      if(initialAuth?.authenticated)lastAuthUserId=initialAuth.user?.id||null;
      if(!subscriptionsBound){
        subscriptionsBound=true;
        unsubscribeTrip=tripContract()?.subscribe?.(s=>{if(!bootComplete)return;const active=s?.activeTrip||null,context=s?.context||{},activeTripId=String(active?.id||active?.tripId||context?.tripId||'')||null;if(!activeTripId)return;const token=++tripSwitchToken;Promise.resolve().then(async()=>{if(token!==tripSwitchToken)return;if(profile().activeTripId!==activeTripId&&authApi.getState().authenticated)await window.LuviaProfileService.setActiveTrip(activeTripId).catch(console.warn);await window.LuviaJourneyContractV1?.commands?.hydrate?.(activeTripId).catch(()=>{});if(token!==tripSwitchToken)return;window.LuviaDestination?.refresh?.();if(window.LuviaCollaboration?.snapshot?.().tripId!==activeTripId)window.LuviaCollaboration?.watchTrip?.(activeTripId).catch?.(console.warn);lastTripRenderSignature=tripRenderSignature(active);refreshShellHeader();await show(activeView,{force:true,animate:false});}).catch(console.error)});
        unsubscribeProfile=window.LuviaProfileService.subscribe(()=>{if(!bootComplete)return;window.LuviaTheme.apply(activeTrip());window.LuviaCollaboration?.heartbeat?.();refreshShellHeader();refreshDashboardGrid()});
        unsubscribeCollaboration=window.LuviaCollaboration?.subscribe?.(state=>{if(!bootComplete||!state?.tripId||activeView!=='today'||!root?.querySelector('.lv-shell'))return;cancelAnimationFrame(collaborationFrame);collaborationFrame=requestAnimationFrame(()=>updateDashboardWidget('members'))});
        unsubscribeRuntimeActions=runtimeSignals().subscribe(action=>queueRuntimeAction(client,action));
      }
      await runtimeSignals().start();
      await hydrateForAuth(client,initialAuth);
      markBoot('bootstrap-complete',{bootstrapCompleted:true,completedAt:new Date().toISOString()});
    }catch(error){
      console.error('[LuviaApp]',error);
      if(appRuntime().snapshot().status!=='failed')appRuntime().fail(error,{stage:appRuntime().snapshot().pendingStage||appRuntime().snapshot().lastStableStage,source:'app-shell'});
      markBoot('bootstrap-error',{lastError:error?.message||String(error),bootstrapCompleted:true,completedAt:new Date().toISOString()});
      bootComplete=true;
      errorScreen(error)
    }
  }
  async function guaranteeInitialRender(reason='guarantee'){
    const mountRoot=root||document.getElementById('app');
    if(!mountRoot)return markBoot('root-missing',{lastError:'LUVIA_APP_ROOT_MISSING'});
    root=mountRoot;
    if(mountRoot.children.length>0)return markBoot('dom-present',{renderCompleted:true});
    const authApi=(window.LuviaAuth||window.ParisAuth);
    try{
      if(authApi?.getState?.()?.loading&&window.LuviaSupabaseService?.start){
        await Promise.race([window.LuviaSupabaseService.start(),new Promise(resolve=>setTimeout(resolve,2200))]);
      }
      const authState=authApi?.getState?.();
      if(authState?.authenticated&&!appRuntime().isAtLeast('domain-context-ready')){
        markBoot('recovery-await-domain-context',{lastError:null});
        return false;
      }
      markBoot('recovery-render',{renderAttempted:true,recoveryRenderAttempted:true});
      await render();
      const mounted=mountRoot.children.length>0;
      markBoot(mounted?'recovery-render-complete':'recovery-render-empty',{renderCompleted:mounted,recoveryRenderCompleted:mounted,lastError:mounted?null:'LUVIA_INITIAL_RENDER_EMPTY'});
      if(!mounted){
        const state=authApi?.getState?.();
        if(state&&!state.loading&&!state.authenticated){await signedOut();}
      }
      return mountRoot.children.length>0;
    }catch(error){
      console.error('[LuviaBoot] Recovery render failed',error);
      markBoot('recovery-render-error',{lastError:error?.message||String(error)});
      return false;
    }
  }
  function startShell(reason='auto'){
    if(shellStartPromise)return shellStartPromise;
    bootDiagnostics.started=true;bootDiagnostics.startReason=reason;bootDiagnostics.startedAt=new Date().toISOString();bootDiagnostics.domReadyState=document.readyState;
    root=document.getElementById('app');markBoot('root-resolved',{rootResolved:Boolean(root)});
    if(!root){const error=new Error('LUVIA_APP_ROOT_MISSING');markBoot('root-error',{lastError:error.message});return Promise.reject(error)}
    const initialNavigationIntent=navigationHistory().currentIntent();markBoot('navigation-ready',{navigationIntent:initialNavigationIntent});
    if(!shellEventsBound){shellEventsBound=true;bind();}
    ensureBookingAvailabilityClient().catch(error=>console.warn('[Luvia Booking] Availability Client konnte nicht initialisiert werden:',error?.message||error));
    ensureBookingReservationCreateClient().catch(error=>console.warn('[Luvia Booking] Reservation Create Client konnte nicht initialisiert werden:',error?.message||error));
    ensureBookingReservationMutationClient().catch(error=>console.warn('[Luvia Booking] Reservation Mutation Client konnte nicht initialisiert werden:',error?.message||error));
    ensureBookingReservationMutationStatusClient().catch(error=>console.warn('[Luvia Booking] Reservation Mutation Status Client konnte nicht initialisiert werden:',error?.message||error));
    ensureBookingReservationRecoveryClient().catch(error=>console.warn('[Luvia Booking] Reservation Recovery Client konnte nicht initialisiert werden:',error?.message||error));
    ensureBookingEmailV2Client().catch(error=>console.warn('[Luvia Booking] Email V2 Client konnte nicht initialisiert werden:',error?.message||error));
    clearTimeout(bootRecoveryTimer);
    bootRecoveryTimer=setTimeout(()=>{if(root&&root.children.length===0)guaranteeInitialRender('startup-watchdog')},900);
    shellStartPromise=(async()=>{await bootstrap();markBoot('post-bootstrap-render-check');await guaranteeInitialRender('post-bootstrap');return true})().catch(error=>{markBoot('start-error',{lastError:error?.message||String(error)});throw error});
    return shellStartPromise;
  }

  async function openDialog(name,payload){try{if(!window.LuviaUI?.has?.(name))throw new Error(`Dialog ${name} ist noch nicht verfügbar.`);await window.LuviaUI.open(name,payload)}catch(error){console.error('[LuviaUI]',name,error);const message=error?.message||'Der Dialog konnte nicht geöffnet werden.';window.LuviaUIKit?.toast?.(message,{type:'error'})||alert(message)}}
  function toast(message){const old=document.querySelector('.lv-preview-toast');old?.remove();const el=document.createElement('div');el.className='lv-preview-toast';el.textContent=message;document.body.appendChild(el);setTimeout(()=>el.remove(),2800)}
  const compassContextForView=view=>({today:'today',plan:'plan',trip:'trip',memories:'memories'}[view]||null);
  const compassReservedCopy=Object.freeze({
    attention:['Hinweise','Wetter, Konflikte und ruhige Reisehinweise werden hier gebündelt, sobald der zuständige Owner-Core die Projektion freigibt.'],wallet:['Wallet','Belege und Reisedokumente bleiben offline-fähig vorgesehen; die produktive Owner-Projektion ist noch reserviert.'],checklists:['Checklisten','Vorbereitung und Aufgaben sind im Living Compass fest verortet; der produktive Owner-Core ist noch reserviert.'],budget:['Budget','Gemeinsame Reiseausgaben sind als eigene Richtung reserviert und werden nicht durch eine Legacy-Kachel ersetzt.'],weather:['Wetterkontext','Wetter soll Entscheidungen erklären, nicht als isolierte Kachel enden. Die produktive Kontextprojektion folgt durch den Owner-Core.'],language:['Sprachhilfe','Die Sprachhilfe bleibt als Horizont sichtbar und ist noch nicht als produktiver Owner-Core freigegeben.'],community:['Community','Lokale Empfehlungen und Community-Evidenz bleiben als Horizont reserviert.'],['memory-map']:['Erinnerungskarte','Orte und Day Keys sind vorgesehen; Memory und Places müssen die produktive Projektion gemeinsam freigeben.'],reviews:['Reviews','Erlebt-, Verifiziert- und Reputationssignale bleiben sichtbar reserviert.'],['memory-export']:['Reisebuch exportieren','Der Export-Horizont bleibt sichtbar, bis Memory und Media die produktive Ausgabe freigeben.'],['social-drop']:['Experience Drop','Der geteilte Experience Drop ist sichtbar reserviert und noch nicht produktiv aktiviert.'],admin:['Administration','Administrative Rollen und Systemsteuerung bleiben strikt von persönlichen Profilrechten getrennt.'],devices:['Geräte','Geräte- und Sitzungssteuerung ist als eigener Sicherheitshorizont reserviert.']
  });
  function showCompassReserved(action,label,context='plan'){
    const stage=root?.querySelector('[data-stage]');if(!stage)return;
    const copy=compassReservedCopy[action]||[label||'Luvia Horizont','Diese Richtung ist im akzeptierten Living-Compass-Modell sichtbar reserviert und noch nicht produktiv aktiviert.'];
    activeCompassContext=null;activeView='plan';stage.innerHTML=transitionHost('compass-reserved',`<section class="lv-compass-reserved-focus" data-compass-reserved-focus aria-labelledby="lv-compass-reserved-title"><div class="lv-compass-reserved-orbit" aria-hidden="true">${livingCompass('lv-compass-reserved-mark')}</div><span>Luvia Living Compass · ${esc(context)}</span><h1 id="lv-compass-reserved-title" tabindex="-1">${esc(copy[0])}</h1><p>${esc(copy[1])}</p><strong>Nicht vereinfacht, nicht durch Legacy ersetzt.</strong><button type="button" data-compass-return="${esc(context)}">Zurück zum Kompass</button></section>`).replace(' lv-route-entering','').replace(' aria-busy="true"','').replace('lv-view-host','lv-view-host is-ready');
    const host=stage.querySelector('.lv-view-host');host?.setAttribute('data-view','plan');refreshNavigationSelection('plan');requestAnimationFrame(()=>stage.querySelector('h1')?.focus?.({preventScroll:true}));
  }
  function handleHubAction(action,meta={}){
    if(!action)return;
    const focusHeading=Boolean(meta.fromCompass);
    if(['today','plan','trip','memories','more','places','places-lifecycle','routes','gallery','albums','bookings','control-center','control-center-identity','control-center-bookings','control-center-inbox'].includes(action))return show(action,{focusHeading});
    if(action==='timeline')return show('today',{focusHeading}).then(()=>setTimeout(()=>root.querySelector('[data-widget-id="today"]')?.scrollIntoView({behavior:'smooth',block:'start'}),120));
    if(action==='assistant')return show('today').then(()=>window.LuviaAIDashboard?.openChat?.());
    if(action==='new-trip')return show('today').then(()=>window.LuviaTripCreator?.open?.());
    if(action==='profile')return show('more').then(()=>window.LuviaProfileFoundation.open('hub'));
    if(action==='preferences')return show('more').then(()=>window.LuviaProfileFoundation.open('preferences'));
    if(action==='privacy')return show('control-center-identity',{focusHeading});
    if(action==='signals')return show('more').then(()=>window.LuviaProfileFoundation.open('preferences'));
    if(action==='account')return show('more').then(()=>window.LuviaProfileFoundation.open('hub'));
    if(action==='trip-settings')return show('trip').then(()=>openDialog('trip.edit',activeTrip()));
    if(action==='participants')return show('trip').then(()=>openDialog('trip.invite',activeTrip()));
    if(compassReservedCopy[action]||meta.maturity==='reserved'||meta.maturity==='foundation')return showCompassReserved(action,meta.label,meta.context);
    const labels={gallery:'Fotogalerie','travel-book':'Reisebuch',review:'Reise-Revue',albums:'Alben'};
    toast(`${labels[action]||meta.label||'Dieser Bereich'} wird in einem kommenden Luvia-Baustein hier integriert.`);
  }
  async function openLivingCompassContext(context='plan',{focus=true,intentSequence=++compassIntentSequence}={}){
    const key=['today','plan','trip','memories','profile'].includes(context)?context:'plan';
    if(intentSequence!==compassIntentSequence)return;
    if(planCompassTransition){if(activeCompassContext!==key)pendingCompassContext={key,focus,intentSequence};return}
    const currentStage=currentPlanCompassStage();
    if(!currentStage)return show('plan',{compassContext:key,history:false,source:'living-compass-context'});
    if(activeCompassContext===key)return;
    const token=++compassContextToken,host=currentStage.closest('.lv-view-host'),content=host?.querySelector('.lv-view-content');if(!content)return;
    planCompassTransition=true;cancelCompassFlights();root?.querySelector('.lv-living-shell')?.classList.remove('is-plan-compass-detached');lastCompassFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    currentStage.classList.add('is-context-leaving','is-context-seeking','is-context-pulsing');
    await compassWait(compassMotionReduced()?0:220);
    if(token!==compassContextToken||!content.isConnected){planCompassTransition=false;return;}
    content.innerHTML=window.LuviaModuleHubs?.renderCompass?.(key,activeTrip())||'';activeCompassContext=key;
    const next=content.querySelector('[data-plan-compass-stage]');next?.classList.add('is-ready','is-context-entering','is-context-seeking','is-context-pulsing');refreshNavigationSelection('plan');
    await compassWait(compassMotionReduced()?0:360);
    if(token===compassContextToken&&next?.isConnected){next.classList.remove('is-context-entering','is-context-seeking','is-context-pulsing');if(focus){const heading=next.querySelector('h1');heading?.setAttribute('tabindex','-1');heading?.focus?.({preventScroll:true})}}
    planCompassTransition=false;
    const exit=pendingCompassExit;pendingCompassExit=null;if(exit&&exit.intentSequence===compassIntentSequence)return leavePlanCompass(exit.destination,exit.selected,exit.intentSequence);
    const queued=pendingCompassContext;pendingCompassContext=null;if(queued&&queued.intentSequence===compassIntentSequence&&queued.key!==activeCompassContext)return openLivingCompassContext(queued.key,{focus:queued.focus,intentSequence:queued.intentSequence});
  }
  async function leavePlanCompass(destination='today',selected=null,intentSequence=++compassIntentSequence){
    const stage=currentPlanCompassStage();if(!stage||intentSequence!==compassIntentSequence)return;if(planCompassTransition){pendingCompassExit={destination,selected,intentSequence};return}
    selected=selected?.isConnected?selected:[...stage.querySelectorAll('[data-hub-action]')].find(node=>node.dataset.hubAction===destination)||selected;
    const meta={label:selected?.dataset.compassLabel||selected?.textContent?.trim()||'',maturity:selected?.dataset.maturity||'active',context:activeCompassContext||'plan',fromCompass:true};
    planCompassTransition=true;pendingCompassContext=null;pendingCompassExit=null;clearTimeout(planCompassEntryTimer);++compassContextToken;cancelCompassFlights();
    let result,navigationTask=null,superseded=false;
    try{
      if(selected){const angle=Number(selected.dataset.planAngle||0),directAngle=((angle+180)%360+360)%360-180;selected.classList.add('is-selected');stage.style.setProperty('--lv-plan-selection-angle',`${directAngle}deg`);stage.classList.add('is-navigating');await compassSelectionHold()}else stage.classList.add('is-navigating');
      superseded=intentSequence!==compassIntentSequence;
      if(!superseded){void returnPlanCompassHome(stage).catch(error=>console.warn('[Luvia Plan Compass]',error));navigationTask=Promise.resolve(handleHubAction(destination,meta))}
    }finally{
      planCompassTransition=false;
      if(superseded){cancelCompassFlights();stage.classList.remove('is-navigating','is-returning');stage.querySelectorAll('.is-selected').forEach(node=>node.classList.remove('is-selected'));stage.style.removeProperty('--lv-plan-selection-angle')}
      else activeCompassContext=null;
    }
    if(navigationTask){result=await navigationTask;superseded=intentSequence!==compassIntentSequence;if(!superseded&&stage.isConnected){stage.classList.remove('is-ready','is-compass-arriving','is-navigating','is-returning');stage.querySelectorAll('.is-selected').forEach(node=>node.classList.remove('is-selected'))}}
    const queuedContext=pendingCompassContext;pendingCompassContext=null;
    const queuedExit=pendingCompassExit;pendingCompassExit=null;
    if(queuedContext&&queuedContext.intentSequence===compassIntentSequence)return openLivingCompassContext(queuedContext.key,{focus:queuedContext.focus,intentSequence:queuedContext.intentSequence});
    if(queuedExit&&queuedExit.intentSequence===compassIntentSequence&&currentPlanCompassStage())return leavePlanCompass(queuedExit.destination,queuedExit.selected,queuedExit.intentSequence);
    return result;
  }
  function choosePlanCompassDirection(button,intentSequence=++compassIntentSequence){
    const action=button?.dataset.hubAction;if(!action)return;if(planCompassTransition){pendingCompassExit={destination:action,selected:button,intentSequence};return}
    return leavePlanCompass(action,button,intentSequence);
  }
  function rememberCompassPointer(event){
    const stage=currentPlanCompassStage();let direction=event.target.closest?.('[data-plan-compass-stage] [data-hub-action]');
    if(!direction&&stage?.matches('.is-compass-arriving,.is-ready'))direction=[...stage.querySelectorAll('[data-hub-action]')].find(node=>{const box=node.getBoundingClientRect();return event.clientX>=box.left&&event.clientX<=box.right&&event.clientY>=box.top&&event.clientY<=box.bottom});
    if(!direction||event.button!==0||event.isPrimary===false)return;
    compassPointerGesture={pointerId:event.pointerId,action:direction.dataset.hubAction,x:event.clientX,y:event.clientY};
    try{direction.setPointerCapture?.(event.pointerId)}catch{}
  }
  function releaseCompassPointer(event){
    const gesture=compassPointerGesture;compassPointerGesture=null;
    if(!gesture||gesture.pointerId!==event.pointerId||Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>20)return;
    const stage=currentPlanCompassStage(),direction=[...(stage?.querySelectorAll('[data-hub-action]')||[])].find(node=>node.dataset.hubAction===gesture.action);if(!direction)return;
    event.preventDefault();event.stopPropagation();const suppression=++suppressCompassPointerClick;setTimeout(()=>{if(suppressCompassPointerClick===suppression)suppressCompassPointerClick=0},0);
    return choosePlanCompassDirection(direction);
  }
  function bind(){root.addEventListener('click',e=>{
    if(suppressCompassPointerClick&&e.detail>0){e.preventDefault();e.stopPropagation();suppressCompassPointerClick=0;return}
    const suggestion=e.target.closest('[data-today-suggestion-add]');if(suggestion){e.preventDefault();e.stopPropagation();return addTodaySuggestion(suggestion)}
    const placeTarget=e.target.closest('[data-place-open]');if(placeTarget){e.preventDefault();return openPlace(placeOpenPayload(placeTarget)).catch(console.error)}
    if(e.target.closest('[data-retry]'))return bootstrap();if(e.target.closest('[data-create]'))return window.LuviaTripCreator.open();if(e.target.closest('[data-signout]'))return (window.LuviaAuth||window.ParisAuth).signOut();if(e.target.closest('[data-join-code]'))return window.LuviaJoinFlow?.openCodeEntry?.();if(e.target.closest('[data-invite]'))return openDialog('trip.invite',activeTrip());if(e.target.closest('[data-edit]'))return openDialog('trip.edit',activeTrip());
    const compassReturn=e.target.closest('[data-compass-return]');if(compassReturn){e.preventDefault();return openLivingCompassContext(compassReturn.dataset.compassReturn||'plan')}
    const compassNavigation=e.target.closest('button[data-compass-context]');if(compassNavigation){e.preventDefault();e.stopPropagation();return openLivingCompassContext(compassNavigation.dataset.compassContext||'plan')}
    const po=e.target.closest('[data-profile-open]');if(po){if(currentPlanCompassStage()){e.preventDefault();e.stopPropagation();return openLivingCompassContext('profile')}return window.LuviaProfileFoundation.open(po.dataset.profileOpen||'hub')}
    const planClose=e.target.closest('[data-plan-compass-close]');if(planClose){e.preventDefault();e.stopPropagation();return leavePlanCompass('today')}
    const compassAI=e.target.closest('[data-compass-ai]');if(compassAI){e.preventDefault();e.stopPropagation();return leavePlanCompass('assistant',compassAI)}
    const planDirection=e.target.closest('[data-plan-compass-stage] [data-hub-action]');if(planDirection){e.preventDefault();e.stopPropagation();return choosePlanCompassDirection(planDirection)}
    const action=e.target.closest('[data-hub-action]')?.dataset.hubAction;if(action)return handleHubAction(action);
    const route=e.target.closest('[data-route-open]');if(route){const origin=root.querySelector('[data-route-origin]')?.value?.trim()||'',destination=root.querySelector('[data-route-destination]')?.value?.trim()||'';if(!destination)return toast('Bitte zuerst ein Ziel eingeben.');const params=new URLSearchParams({api:'1',destination,travelmode:'driving'});if(origin)params.set('origin',origin);window.LuviaPlatformPorts.require('ExternalNavigationPort').open(`https://www.google.com/maps/dir/?${params.toString()}`);return;}
    const view=e.target.closest('[data-view]')?.dataset.view;if(view){e.preventDefault();e.stopPropagation();++compassIntentSequence;const context=compassContextForView(view),compassStage=currentPlanCompassStage();if(context&&compassStage)return openLivingCompassContext(context,{intentSequence:compassIntentSequence});if(compassStage)return leavePlanCompass(view,null,compassIntentSequence);return show(view)}
  });root.addEventListener('pointerdown',rememberCompassPointer,true);root.addEventListener('pointerup',releaseCompassPointer,true);root.addEventListener('pointercancel',()=>{compassPointerGesture=null},true);root.addEventListener('keydown',e=>{
    const stage=currentPlanCompassStage();if(!stage)return;
    if(e.key==='Escape'){e.preventDefault();return leavePlanCompass('today')}
    if(planCompassTransition)return;
    if(!e.target.closest?.('[data-plan-compass-stage]'))return;
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    const directions=[...stage.querySelectorAll('.lv-plan-direction:not([disabled])')];if(!directions.length)return;
    const current=directions.indexOf(document.activeElement),step=e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1,next=directions[(current<0?0:current+step+directions.length)%directions.length];e.preventDefault();next?.focus();
  })}

  window.addEventListener('luvia:members-changed',()=>updateDashboardWidget('members'));window.addEventListener('luvia:restaurant-intelligence-changed',()=>updateDashboardWidget('restaurantIntelligence'));window.addEventListener('luvia:schedule-intelligence-changed',()=>{if(activeView==='today'&&root?.querySelector('.lv-shell'))window.LuviaTodayIntelligence?.refresh?.({refreshSchedule:false}).catch?.(()=>{})});window.addEventListener('luvia:today-intelligence-changed',()=>window.LuviaLiveDayCompanion?.refresh?.({refreshToday:false}).catch?.(()=>{}));window.addEventListener('luvia:place-plan-changed',()=>{window.LuviaScheduleIntelligence?.refresh?.({force:true,skipThrottle:true}).then(()=>window.LuviaTodayIntelligence?.refresh?.({refreshSchedule:false})).catch?.(()=>{});if(activeView==='today'&&root?.querySelector('.lv-shell'))updateTodayWidget()});window.addEventListener('luvia:timeline-cloud-changed',()=>{if(activeView==='today'&&root?.querySelector('.lv-shell')){updateDashboardWidget('today');requestAnimationFrame(()=>window.LuviaJourneyDayComposer?.bindCalendar?.(root))}});window.addEventListener('luvia:live-day-changed',()=>{if(activeView==='today'&&root?.querySelector('.lv-shell'))updateTodayWidget()});window.addEventListener('luvia:theme-changed',event=>{const accent=event.detail?.palette?.accent;if(!accent)return;document.documentElement.style.setProperty('--module-accent',accent);document.querySelectorAll('#restaurants-module,#accommodations-module,#attractions-module,#photo-spots-module,#shopping-module,#nature-module,#mobility-module,#move-module,.lv-module-host,.lv-dashboard').forEach(el=>{el.style.setProperty('--trip-accent',accent);el.style.setProperty('--module-accent',accent);el.style.setProperty('--rv2-accent',accent)})});
  window.addEventListener('luvia:dashboard-widget-refresh',e=>{const id=e.detail?.id;if(id&&activeView==='today'&&root?.querySelector('.lv-shell'))updateDashboardWidget(id)});window.addEventListener('luvia:open-place-request',e=>openPlace(e.detail).catch(console.error));window.addEventListener('luvia:in-window-data-changed',()=>{if(activeView==='today'&&root?.querySelector('.lv-shell')){updateDashboardWidget('today');requestAnimationFrame(()=>window.LuviaJourneyDayComposer?.bindCalendar?.(root))}});window.addEventListener('luvia:trip-modules-changed',()=>{if(root?.querySelector('.lv-shell'))show(activeView,{force:true,animate:false,scroll:false}).catch(console.error)});window.addEventListener('luvia:places-lifecycle-changed',()=>{if(activeView==='places-lifecycle')window.LuviaPlaceLifecycleHub?.load?.().catch?.(console.warn)});window.addEventListener('luvia:place-overlay-closed',()=>{});window.addEventListener('luvia:navigate-request',e=>{const intent=e.detail?.intent||navigationContract().resolve(e.detail?.view,{source:'navigate-request'});if(intent?.route){++compassIntentSequence;show(intent.route,{force:true,intent,historyAction:e.detail?.historyAction,source:intent.source||'navigate-request'}).catch(console.error)}});window.LuviaApp=Object.freeze({version:'13.82.50',bootstrap,render,start:startShell,diagnostics:()=>({...bootDiagnostics,appRuntime:window.LuviaAppRuntime?.diagnostics?.()||null,runtimeSignals:window.LuviaAppRuntimeSignalsV1?.diagnostics?.()||null,moduleMount:moduleMountRegistry?.diagnostics?.()||null,navigationHistory:window.LuviaNavigationHistoryV1?.diagnostics?.()||null,runtimeAssets:runtimeAssetSnapshot()}),show,openCompass:(context='plan')=>openLivingCompassContext(context),back:()=>navigationHistory().back(),forward:()=>navigationHistory().forward(),openPlace,activeView:()=>activeView,ensureBookingAvailabilityClient,ensureBookingReservationCreateClient,ensureBookingReservationMutationClient,ensureBookingReservationMutationStatusClient,ensureBookingReservationRecoveryClient,ensureBookingEmailV2Client});if(document.readyState==='loading'){window.addEventListener('DOMContentLoaded',()=>startShell('DOMContentLoaded').catch(error=>console.error('[LuviaBoot]',error)),{once:true})}else{queueMicrotask(()=>startShell('document-already-ready').catch(error=>console.error('[LuviaBoot]',error)))};
  window.addEventListener('luvia:owner-flow-navigation',event=>{if(event.detail?.owner!=='join'||!bootComplete)return;Promise.resolve().then(()=>render()).catch(error=>{console.error('[LuviaOwnerFlow]',error);errorScreen(error)})});
})();
