(() => {
  'use strict';
  let root,activeView='today',moduleMountRegistry=null,lastRenderedTripId=null,tripSwitchToken=0,overlayPortal=null,unsubscribeTrip=null,unsubscribeRuntimeActions=null,unsubscribeProfile=null,unsubscribeCollaboration=null,collaborationFrame=0,authHydration=0,lastAuthUserId=null,hydratedAuthUserId=null,pendingPlaceOpen=null,todayRenderFrame=0,todayRenderTimer=0,todayLastHtml='',lastTripRenderSignature='',showSequence=0,shellInitialized=false,bootComplete=false,subscriptionsBound=false;
  let shellStartPromise=null,shellEventsBound=false,bootRecoveryTimer=0,runtimeStatusTimer=0,runtimeActionChain=Promise.resolve();
  const bootDiagnostics={version:'13.68.11',started:false,startReason:null,domReadyState:document.readyState,rootResolved:false,authInitialized:false,initialSession:null,bootstrapEntered:false,bootstrapCompleted:false,renderAttempted:false,renderCompleted:false,recoveryRenderAttempted:false,recoveryRenderCompleted:false,lastStage:null,lastError:null,startedAt:null,completedAt:null};
  window.LuviaBootDiagnostics=bootDiagnostics;
  function markBoot(stage,patch={}){bootDiagnostics.lastStage=stage;Object.assign(bootDiagnostics,patch);return bootDiagnostics;}
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
  const BOOKING_AVAILABILITY_SRC='core/booking/booking-availability.js?v=13.68.11';
  const BOOKING_RESERVATION_CREATE_SRC='core/booking/booking-reservation-create.js?v=13.68.11';
  const BOOKING_RESERVATION_MUTATION_SRC='core/booking/booking-reservation-mutation.js?v=13.81.0';
  const BOOKING_RESERVATION_MUTATION_STATUS_SRC='core/booking/booking-reservation-mutation-status.js?v=13.81.0';
  const BOOKING_RESERVATION_RECOVERY_SRC='core/booking/booking-reservation-recovery.js?v=13.68.11';
  const BOOKING_EMAIL_V2_SRC='core/booking/booking-email-v2.js?v=13.68.11';
  let bookingAvailabilityLoadPromise=null,bookingReservationCreateLoadPromise=null,bookingReservationMutationLoadPromise=null,bookingReservationMutationStatusLoadPromise=null,bookingReservationRecoveryLoadPromise=null,bookingEmailV2LoadPromise=null;
  function ensureBookingAvailabilityClient(){
    if(window.LuviaBookingAvailability?.check&&window.LuviaBookingAvailability?.readiness)return Promise.resolve(window.LuviaBookingAvailability);
    if(bookingAvailabilityLoadPromise)return bookingAvailabilityLoadPromise;
    bookingAvailabilityLoadPromise=new Promise((resolve,reject)=>{
      const done=()=>window.LuviaBookingAvailability?.check&&window.LuviaBookingAvailability?.readiness?resolve(window.LuviaBookingAvailability):reject(new Error('Booking Availability Client wurde nicht registriert.'));
      const existing=document.querySelector('script[data-luvia-booking-availability],script[src*="core/booking/booking-availability.js"]');
      if(existing){
        if(window.LuviaBookingAvailability)return done();
        existing.addEventListener('load',done,{once:true});
        existing.addEventListener('error',()=>reject(new Error('Booking Availability Client konnte nicht geladen werden.')),{once:true});
        setTimeout(done,1200);
        return;
      }
      const script=document.createElement('script');
      script.src=BOOKING_AVAILABILITY_SRC;
      script.dataset.luviaBookingAvailability='true';
      script.onload=done;
      script.onerror=()=>reject(new Error('Booking Availability Client konnte nicht geladen werden.'));
      document.head.appendChild(script);
    }).finally(()=>{if(!window.LuviaBookingAvailability)bookingAvailabilityLoadPromise=null;});
    return bookingAvailabilityLoadPromise;
  }
  function ensureBookingReservationCreateClient(){
    if(window.LuviaBookingReservationCreate?.create&&window.LuviaBookingReservationCreate?.readiness)return Promise.resolve(window.LuviaBookingReservationCreate);
    if(bookingReservationCreateLoadPromise)return bookingReservationCreateLoadPromise;
    bookingReservationCreateLoadPromise=new Promise((resolve,reject)=>{
      const done=()=>window.LuviaBookingReservationCreate?.create&&window.LuviaBookingReservationCreate?.readiness?resolve(window.LuviaBookingReservationCreate):reject(new Error('Booking Reservation Create Client wurde nicht registriert.'));
      const existing=document.querySelector('script[data-luvia-booking-reservation-create],script[src*="core/booking/booking-reservation-create.js"]');
      if(existing){
        if(window.LuviaBookingReservationCreate)return done();
        existing.addEventListener('load',done,{once:true});
        existing.addEventListener('error',()=>reject(new Error('Booking Reservation Create Client konnte nicht geladen werden.')),{once:true});
        setTimeout(done,1200); return;
      }
      const script=document.createElement('script'); script.src=BOOKING_RESERVATION_CREATE_SRC; script.dataset.luviaBookingReservationCreate='true';
      script.onload=done; script.onerror=()=>reject(new Error('Booking Reservation Create Client konnte nicht geladen werden.')); document.head.appendChild(script);
    }).finally(()=>{if(!window.LuviaBookingReservationCreate)bookingReservationCreateLoadPromise=null;});
    return bookingReservationCreateLoadPromise;
  }
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
  const date=v=>v?new Date(v+'T12:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}):'';
  const initials=p=>(p.displayName||p.email||'L').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
  const avatar=p=>p.avatarUrl?`<img class="lv-header-avatar" src="${esc(p.avatarUrl)}" alt="Profil">`:`<span class="lv-header-avatar" style="--avatar:${esc(p.avatarColor||'#ee6f83')}">${esc(initials(p))}</span>`;
  function bootScreen(){if(root)root.innerHTML=''}
  function errorScreen(error){root.innerHTML=`<main class="lv-empty"><section class="lv-card"><span class="lv-logo"></span><h1>Start nicht möglich</h1><div class="lv-error">${esc(error?.message||error||'Unbekannter Fehler')}</div><div class="lv-actions"><button class="lv-primary" data-retry>Erneut versuchen</button><a class="lv-secondary" href="intelligence/console.html">Developer Console</a></div></section></main>`}
  function ensureBookingReservationMutationClient(){
    if(window.LuviaBookingReservationMutation?.modify&&window.LuviaBookingReservationMutation?.cancel&&window.LuviaBookingReservationMutation?.readiness)return Promise.resolve(window.LuviaBookingReservationMutation);
    if(bookingReservationMutationLoadPromise)return bookingReservationMutationLoadPromise;
    bookingReservationMutationLoadPromise=new Promise((resolve,reject)=>{
      const done=()=>window.LuviaBookingReservationMutation?.modify&&window.LuviaBookingReservationMutation?.cancel&&window.LuviaBookingReservationMutation?.readiness?resolve(window.LuviaBookingReservationMutation):reject(new Error('Booking Reservation Mutation Client wurde nicht registriert.'));
      const existing=document.querySelector('script[data-luvia-booking-reservation-mutation],script[src*="core/booking/booking-reservation-mutation.js"]');
      if(existing){if(window.LuviaBookingReservationMutation)return done();existing.addEventListener('load',done,{once:true});existing.addEventListener('error',()=>reject(new Error('Booking Reservation Mutation Client konnte nicht geladen werden.')),{once:true});return;}
      const script=document.createElement('script');script.src=BOOKING_RESERVATION_MUTATION_SRC;script.dataset.luviaBookingReservationMutation='true';script.onload=done;script.onerror=()=>reject(new Error('Booking Reservation Mutation Client konnte nicht geladen werden.'));document.head.appendChild(script);
    }).finally(()=>{if(!window.LuviaBookingReservationMutation)bookingReservationMutationLoadPromise=null;});
    return bookingReservationMutationLoadPromise;
  }
  function ensureBookingReservationMutationStatusClient(){
    if(window.LuviaBookingReservationMutationStatus?.get&&window.LuviaBookingReservationMutationStatus?.history)return Promise.resolve(window.LuviaBookingReservationMutationStatus);
    if(bookingReservationMutationStatusLoadPromise)return bookingReservationMutationStatusLoadPromise;
    bookingReservationMutationStatusLoadPromise=new Promise((resolve,reject)=>{
      const done=()=>window.LuviaBookingReservationMutationStatus?.get&&window.LuviaBookingReservationMutationStatus?.history?resolve(window.LuviaBookingReservationMutationStatus):reject(new Error('Booking Reservation Mutation Status Client wurde nicht registriert.'));
      const existing=document.querySelector('script[data-luvia-booking-reservation-mutation-status],script[src*="core/booking/booking-reservation-mutation-status.js"]');
      if(existing){if(window.LuviaBookingReservationMutationStatus)return done();existing.addEventListener('load',done,{once:true});existing.addEventListener('error',()=>reject(new Error('Booking Reservation Mutation Status Client konnte nicht geladen werden.')),{once:true});return;}
      const script=document.createElement('script');script.src=BOOKING_RESERVATION_MUTATION_STATUS_SRC;script.dataset.luviaBookingReservationMutationStatus='true';script.onload=done;script.onerror=()=>reject(new Error('Booking Reservation Mutation Status Client konnte nicht geladen werden.'));document.head.appendChild(script);
    }).finally(()=>{if(!window.LuviaBookingReservationMutationStatus)bookingReservationMutationStatusLoadPromise=null;});
    return bookingReservationMutationStatusLoadPromise;
  }
  function ensureBookingReservationRecoveryClient(){
    if(window.LuviaBookingReservationRecovery?.get&&window.LuviaBookingReservationRecovery?.list&&window.LuviaBookingReservationRecovery?.reconcile&&window.LuviaBookingReservationRecovery?.history)return Promise.resolve(window.LuviaBookingReservationRecovery);
    if(bookingReservationRecoveryLoadPromise)return bookingReservationRecoveryLoadPromise;
    bookingReservationRecoveryLoadPromise=new Promise((resolve,reject)=>{
      const done=()=>window.LuviaBookingReservationRecovery?.get&&window.LuviaBookingReservationRecovery?.list&&window.LuviaBookingReservationRecovery?.reconcile&&window.LuviaBookingReservationRecovery?.history?resolve(window.LuviaBookingReservationRecovery):reject(new Error('Booking Reservation Recovery Client wurde nicht registriert.'));
      const existing=document.querySelector('script[data-luvia-booking-reservation-recovery],script[src*="core/booking/booking-reservation-recovery.js"]');
      if(existing){if(window.LuviaBookingReservationRecovery)return done();existing.addEventListener('load',done,{once:true});existing.addEventListener('error',()=>reject(new Error('Booking Reservation Recovery Client konnte nicht geladen werden.')),{once:true});return;}
      const script=document.createElement('script');script.src=BOOKING_RESERVATION_RECOVERY_SRC;script.dataset.luviaBookingReservationRecovery='true';script.onload=done;script.onerror=()=>reject(new Error('Booking Reservation Recovery Client konnte nicht geladen werden.'));document.head.appendChild(script);
    }).finally(()=>{if(!window.LuviaBookingReservationRecovery)bookingReservationRecoveryLoadPromise=null;});
    return bookingReservationRecoveryLoadPromise;
  }
  function ensureBookingEmailV2Client(){
    if(window.LuviaBookingEmailV2?.readiness&&window.LuviaBookingEmailV2?.get&&window.LuviaBookingEmailV2?.history&&window.LuviaBookingEmailV2?.queue&&window.LuviaBookingEmailV2?.send)return Promise.resolve(window.LuviaBookingEmailV2);
    if(bookingEmailV2LoadPromise)return bookingEmailV2LoadPromise;
    bookingEmailV2LoadPromise=new Promise((resolve,reject)=>{
      const done=()=>window.LuviaBookingEmailV2?.readiness&&window.LuviaBookingEmailV2?.get&&window.LuviaBookingEmailV2?.history&&window.LuviaBookingEmailV2?.queue&&window.LuviaBookingEmailV2?.send?resolve(window.LuviaBookingEmailV2):reject(new Error('Booking Email V2 Client wurde nicht registriert.'));
      const existing=document.querySelector('script[data-luvia-booking-email-v2],script[src*=\"core/booking/booking-email-v2.js\"]');
      if(existing){if(window.LuviaBookingEmailV2)return done();existing.addEventListener('load',done,{once:true});existing.addEventListener('error',()=>reject(new Error('Booking Email V2 Client konnte nicht geladen werden.')),{once:true});return;}
      const script=document.createElement('script');script.src=BOOKING_EMAIL_V2_SRC;script.dataset.luviaBookingEmailV2='true';script.onload=done;script.onerror=()=>reject(new Error('Booking Email V2 Client konnte nicht geladen werden.'));document.head.appendChild(script);
    }).finally(()=>{if(!window.LuviaBookingEmailV2)bookingEmailV2LoadPromise=null;});
    return bookingEmailV2LoadPromise;
  }
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
  function dashboard(t){const destination=t.destination?.formattedAddress||t.destination?.name||'Reiseziel noch offen',dates=t.startDate?(t.endDate?`${date(t.startDate)} – ${date(t.endDate)}`:`Ab ${date(t.startDate)}`):'Zeitraum noch offen',p=profile();return `<section class="lv-dashboard"><article class="lv-card lv-hero"><span class="lv-kicker">Aktive Reise</span><div class="lv-titleline"><span class="lv-symbol">${esc(t.symbol||'❤️')}</span><div><h1>${esc(t.title||'Unsere Reise')}</h1><div class="lv-meta"><span>📍 ${esc(destination)}</span><span>📅 ${esc(dates)}</span></div></div></div><div class="lv-actions"><button class="lv-primary" data-invite>Personen einladen</button><button class="lv-secondary" data-edit>Reise bearbeiten</button><button class="lv-secondary" data-profile-open="trips">Reise wechseln</button></div></article><div class="lv-grid" data-widget-grid>${window.LuviaDashboardWidgets.render({trip:t,profile:p,esc})}</div></section>`}
  function dock(){
    const items=window.LuviaNavigationRegistry?.items?.()||[];
    return `<div class="lv-dock-wrap"><nav class="lv-dock" aria-label="Hauptnavigation">${items.map(item=>`<button class="lv-nav ${activeView===item.id?'on':''}" data-view="${item.id}"><span class="lv-nav-icon">${item.icon}</span><span class="lv-nav-label">${esc(item.label)}</span></button>`).join('')}</nav></div>`;
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
      document.querySelectorAll('.lv-timeline-modal:not(.lv-time-editor)').forEach(node=>node.remove());
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
      const activeId=snap().activeTripId;if(activeId)await window.LuviaTimelineCore?.hydrate?.(activeId).catch(()=>{});
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
  function transitionMeta(view){
    if(view==='today')return{icon:'🏠',title:'Heute',subtitle:'Eure Reise auf einen Blick.'};
    if(view==='plan')return{icon:'✨',title:'Planen',subtitle:'Alles für eure gemeinsame Vorbereitung.'};
    if(view==='trip')return{icon:'🧳',title:'Reise',subtitle:'Euer gemeinsamer Reiseverlauf.'};
    if(view==='memories')return{icon:'📸',title:'Erinnerungen',subtitle:'Fotos, Alben und Geschichten, die bleiben.'};
    if(view==='more')return{icon:'•••',title:'Mehr',subtitle:'Profil und Einstellungen.'};
    if(view==='places')return{icon:'📍',title:'Places',subtitle:'Orte entdecken, planen und erleben.'};
    if(view==='places-lifecycle')return{icon:'🧭',title:'Meine Orte',subtitle:'Entdeckt, geplant, besucht und erinnert.'};
    if(view==='routes')return{icon:'🗺️',title:'Routen',subtitle:'Etappen einfach in Google Maps öffnen.'};
    if(view==='gallery')return{icon:'📸',title:'Fotogalerie',subtitle:'Alle Reisefotos nach Tagen, Favoriten und Bearbeitung.'};if(view==='albums')return{icon:'💛',title:'Memory Albums',subtitle:'Bewusst gestaltete Erinnerungen – getrennt von der stabilen Galerie.'};if(view==='control-center')return{icon:'◎',title:'Control Center',subtitle:'Status, offene Aktionen und Reisebezug an einem Ort.'};if(view==='control-center-identity')return{icon:'◉',title:'Identität & Datenschutz',subtitle:'Profil, Vorlieben und Gerätefähigkeiten transparent getrennt.'};if(view==='control-center-bookings')return{icon:'◫',title:'Booking Control Center',subtitle:'Alle Buchungen mit einem verständlichen Status.'};if(view==='control-center-inbox')return{icon:'✉',title:'Booking Inbox',subtitle:'Gespräche mit Restaurants, Hotels und weiteren Anbietern.'};
    return{icon:'✨',title:'Luvia',subtitle:'Eure Reise wird vorbereitet.'};
  }

  function transitionHost(view,content){const meta=transitionMeta(view);return `<section class="lv-view-host lv-module-host lv-module-entering"><div class="lv-module-intro" role="status" aria-live="polite"><div class="lv-module-intro-icon">${esc(meta.icon)}</div><strong>${esc(meta.title)}</strong><span>${esc(meta.subtitle)}</span></div><div class="lv-view-content">${content}</div></section>`}
  function completeTransition(stage){const host=stage.querySelector('.lv-view-host');if(!host)return;const started=performance.now();requestAnimationFrame(()=>{const elapsed=performance.now()-started;setTimeout(()=>host.classList.add('is-ready'),Math.max(220-elapsed,0));setTimeout(()=>host.classList.remove('lv-module-entering'),Math.max(620-elapsed,420))})}
  function routeHelper(t){
    const destination=t?.destination?.formattedAddress||t?.destination?.name||'';
    return `<section class="lv-route-helper"><div class="lv-route-card"><span class="lv-kicker">Einfach weiterreisen</span><h1>Route in Google Maps öffnen.</h1><p>Luvia ersetzt keine Navigation. Wählt Start und Ziel; Google Maps übernimmt die aktuelle Route. Mehrere geplante Orte werden später automatisch in sinnvolle Etappen geteilt.</p><div class="lv-route-grid"><div class="lv-route-field"><label>Start</label><input data-route-origin placeholder="Aktueller Standort oder Adresse"></div><div class="lv-route-field"><label>Ziel</label><input data-route-destination value="${esc(destination)}" placeholder="Ort oder Adresse"></div></div><div class="lv-route-actions"><button class="primary" data-route-open>In Google Maps öffnen</button><button data-view="plan">Zurück zu Planen</button></div></div></section>`;
  }
  async function show(view='today',options={}){
    view=window.LuviaNavigationRegistry?.normalize?.(view)||view||'today';
    const intent=screenIntent(view,options);
    const t=activeTrip();if(!t)return render();
    const stage=root?.querySelector('[data-stage]');if(!stage)return render();
    const current=stage.querySelector('.lv-view-host')?.dataset?.view||'';
    const currentTripId=stage.querySelector('.lv-view-host')?.dataset?.tripId||'';
    const requestedTripId=String(t.id||t.tripId||'');
    const sameView=current===view&&currentTripId===requestedTripId;
    if(sameView&&!options.force){activeView=view;commitScreenIntent(intent,options);root.querySelector('.lv-dock-wrap')?.remove();root.querySelector('.lv-shell')?.insertAdjacentHTML('beforeend',dock());return;}
    const sequence=++showSequence;await unmountCurrent('route-change');if(sequence!==showSequence)return;
    activeView=view;const animate=options.animate!==false;
    const wrap=(name,content)=>{const html=transitionHost(name,content);return animate?html:html.replace(' lv-module-entering','').replace('lv-view-host','lv-view-host is-ready')};
    const route=navigationContract().get(view);
    const mount=route?.mount||{mode:'inline',key:view};
    let content='';
    if(mount.mode==='module')content=`<div id="${esc(mount.targetId)}"></div>`;
    else if(view==='routes')content=routeHelper(t);
    else if(['plan','trip','memories','more'].includes(view))content=window.LuviaModuleHubs?.render?.(view,t)||'';
    else {view='today';activeView='today';content=dashboard(t);}
    stage.innerHTML=wrap(view,content);const host=stage.querySelector('.lv-view-host');host?.setAttribute('data-view',view);host?.setAttribute('data-trip-id',requestedTripId);
    try{
      if(appRuntime().snapshot().status==='failed')recoverRuntime('shell-ready',{reason:'module-retry',route:view});
      await appRuntime().run('modules-ready',()=>moduleMounts().activate(view,{trip:t,options,force:Boolean(options.force),resolveTarget:targetId=>stage.querySelector(`#${targetId}`)}),{timeoutMs:20000,detail:{route:view,mountMode:mount.mode,mountKey:mount.key}});
      if(sequence!==showSequence)return;
    }catch(error){renderMountFailure(view,error,stage);return}
    commitScreenIntent(intent,options);
    if(view==='today'){lastRenderedTripId=requestedTripId;requestAnimationFrame(()=>window.LuviaTimelineCore?.bindCalendar?.(stage));}
    if(animate)completeTransition(stage);
    root.querySelector('.lv-dock-wrap')?.remove();root.querySelector('.lv-shell')?.insertAdjacentHTML('beforeend',dock());
  }

  function refreshDashboardGrid(){const t=activeTrip(),grid=root?.querySelector('[data-widget-grid]');if(!t||activeView!=='today'||!grid)return false;grid.innerHTML=window.LuviaDashboardWidgets.render({trip:t,profile:profile(),esc});requestAnimationFrame(()=>window.LuviaTimelineCore?.bindCalendar?.(grid));return true;}
  function refreshShellHeader(){const t=activeTrip(),p=profile(),shell=root?.querySelector('.lv-shell');if(!t||!shell)return;const trip=shell.querySelector('.lv-trip');if(trip)trip.innerHTML=`<strong>${esc(t.title||'Unsere Reise')}</strong><small>${esc(t.destination?.name||'Reiseziel offen')}</small>`;const trigger=shell.querySelector('.lv-profile-trigger');if(trigger)trigger.innerHTML=`${avatar(p)}<span><b>${esc(p.displayName||'Profil')}</b><small>${esc(t.title||'Reise')}</small></span>`;root.querySelector('.lv-dock-wrap')?.remove();shell.insertAdjacentHTML('beforeend',dock(t));}
  function releaseBadge(){const v=window.LuviaKernelVersion||window.LuviaCoreVersion||{core:'4.17.0',build:'13.17.0'};return `<span class="lv-build-badge" title="Luvia Core ${v.core} · Build ${v.build}">${v.build} · Core ${v.core}</span>`;}
  function ready(){const t=activeTrip(),p=profile();if(!t)return noTrips();const tripId=String(t.id||t.tripId||'');lastTripRenderSignature=tripRenderSignature(t);window.LuviaTheme.apply(t);if(root.querySelector('.lv-shell')){completeRuntimeStage('shell-ready',{surface:'app-shell',reused:true});refreshShellHeader();if(lastRenderedTripId!==tripId)return show(activeView,{force:true,animate:false});completeRuntimeStage('modules-ready',{route:activeView,reused:true});return}root.innerHTML=`<div class="lv-shell"><div class="lv-ambient-memories" aria-hidden="true"><span class="lv-ambient-item lv-ambient-passport">✦</span><span class="lv-ambient-item lv-ambient-camera">◉</span><span class="lv-ambient-item lv-ambient-heart">♡</span><span class="lv-ambient-item lv-ambient-pin">⌖</span><span class="lv-ambient-item lv-ambient-ticket">◇</span><span class="lv-ambient-item lv-ambient-route">⌁</span><span class="lv-ambient-item lv-ambient-sun">✺</span><span class="lv-ambient-item lv-ambient-cloud">☁</span><span class="lv-ambient-item lv-ambient-star">✦</span></div><header class="lv-header"><span class="lv-logo"></span><div class="lv-trip"><strong>${esc(t.title||'Unsere Reise')}</strong><small>${esc(t.destination?.name||'Reiseziel offen')}</small></div><span class="lv-spacer"></span>${releaseBadge()}<button class="lv-icon" data-view="control-center" aria-label="Control Center">◎ <span class="lv-label">Control</span></button><button class="lv-icon lv-ai-global-trigger" data-ai-ask-open aria-label="Mit Luvia sprechen">✦ <span class="lv-label">Luvia</span></button><button class="lv-icon" data-invite>＋ <span class="lv-label">Einladen</span></button><button class="lv-profile-trigger" data-profile-open="hub">${avatar(p)}<span><b>${esc(p.displayName||'Profil')}</b><small>${esc(t.title||'Reise')}</small></span></button></header><main class="lv-stage" data-stage></main></div>`;shellInitialized=true;completeRuntimeStage('shell-ready',{surface:'app-shell',reused:false});return show(activeView,{animate:true})}
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
        unsubscribeTrip=tripContract()?.subscribe?.(s=>{if(!bootComplete)return;const active=s?.activeTrip||null,context=s?.context||{},activeTripId=String(active?.id||active?.tripId||context?.tripId||'')||null;if(!activeTripId)return;const token=++tripSwitchToken;Promise.resolve().then(async()=>{if(token!==tripSwitchToken)return;if(profile().activeTripId!==activeTripId&&authApi.getState().authenticated)await window.LuviaProfileService.setActiveTrip(activeTripId).catch(console.warn);await window.LuviaTimelineCore?.hydrate?.(activeTripId).catch(()=>{});if(token!==tripSwitchToken)return;window.LuviaDestination?.refresh?.();if(window.LuviaCollaboration?.snapshot?.().tripId!==activeTripId)window.LuviaCollaboration?.watchTrip?.(activeTripId).catch?.(console.warn);lastTripRenderSignature=tripRenderSignature(active);refreshShellHeader();await show(activeView,{force:true,animate:false});}).catch(console.error)});
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
  function handleHubAction(action){
    if(!action)return;
    if(['today','plan','trip','memories','more','places','places-lifecycle','routes','gallery','albums','bookings','control-center','control-center-identity','control-center-bookings','control-center-inbox'].includes(action))return show(action);
    if(action==='timeline')return show('today').then(()=>setTimeout(()=>root.querySelector('[data-widget-id="today"]')?.scrollIntoView({behavior:'smooth',block:'start'}),120));
    if(action==='profile')return window.LuviaProfileFoundation.open('hub');
    if(action==='preferences')return window.LuviaProfileFoundation.open('preferences');
    if(action==='trip-settings')return openDialog('trip.edit',activeTrip());
    if(action==='participants')return openDialog('trip.invite',activeTrip());
    const labels={checklists:'Checklisten',budget:'Budget',language:'Sprachhilfe',weather:'Wetter',gallery:'Fotogalerie','travel-book':'Reisebuch',review:'Reise-Revue',albums:'Alben'};
    toast(`${labels[action]||'Dieser Bereich'} wird in einem kommenden Luvia-Baustein hier integriert.`);
  }
  function bind(){root.addEventListener('click',e=>{
    const suggestion=e.target.closest('[data-today-suggestion-add]');if(suggestion){e.preventDefault();e.stopPropagation();return addTodaySuggestion(suggestion)}
    const placeTarget=e.target.closest('[data-place-open]');if(placeTarget){e.preventDefault();return openPlace(placeOpenPayload(placeTarget)).catch(console.error)}
    if(e.target.closest('[data-retry]'))return bootstrap();if(e.target.closest('[data-create]'))return window.LuviaTripCreator.open();if(e.target.closest('[data-signout]'))return (window.LuviaAuth||window.ParisAuth).signOut();if(e.target.closest('[data-join-code]'))return window.LuviaJoinFlow?.openCodeEntry?.();if(e.target.closest('[data-invite]'))return openDialog('trip.invite',activeTrip());if(e.target.closest('[data-edit]'))return openDialog('trip.edit',activeTrip());
    const po=e.target.closest('[data-profile-open]');if(po)return window.LuviaProfileFoundation.open(po.dataset.profileOpen||'hub');
    const action=e.target.closest('[data-hub-action]')?.dataset.hubAction;if(action)return handleHubAction(action);
    const route=e.target.closest('[data-route-open]');if(route){const origin=root.querySelector('[data-route-origin]')?.value?.trim()||'',destination=root.querySelector('[data-route-destination]')?.value?.trim()||'';if(!destination)return toast('Bitte zuerst ein Ziel eingeben.');const params=new URLSearchParams({api:'1',destination,travelmode:'driving'});if(origin)params.set('origin',origin);window.LuviaPlatformPorts.require('ExternalNavigationPort').open(`https://www.google.com/maps/dir/?${params.toString()}`);return;}
    const view=e.target.closest('[data-view]')?.dataset.view;if(view){e.preventDefault();e.stopPropagation();return show(view)}
  })}

  window.addEventListener('luvia:members-changed',()=>updateDashboardWidget('members'));window.addEventListener('luvia:restaurant-intelligence-changed',()=>updateDashboardWidget('restaurantIntelligence'));window.addEventListener('luvia:schedule-intelligence-changed',()=>{if(activeView==='today'&&root?.querySelector('.lv-shell'))window.LuviaTodayIntelligence?.refresh?.({refreshSchedule:false}).catch?.(()=>{})});window.addEventListener('luvia:today-intelligence-changed',()=>window.LuviaLiveDayCompanion?.refresh?.({refreshToday:false}).catch?.(()=>{}));window.addEventListener('luvia:place-plan-changed',()=>{window.LuviaScheduleIntelligence?.refresh?.({force:true,skipThrottle:true}).then(()=>window.LuviaTodayIntelligence?.refresh?.({refreshSchedule:false})).catch?.(()=>{});if(activeView==='today'&&root?.querySelector('.lv-shell'))updateTodayWidget()});window.addEventListener('luvia:timeline-cloud-changed',()=>{if(activeView==='today'&&root?.querySelector('.lv-shell')){updateDashboardWidget('today');requestAnimationFrame(()=>window.LuviaTimelineCore?.bindCalendar?.(root))}});window.addEventListener('luvia:live-day-changed',()=>{if(activeView==='today'&&root?.querySelector('.lv-shell'))updateTodayWidget()});window.addEventListener('luvia:theme-changed',event=>{const accent=event.detail?.palette?.accent;if(!accent)return;document.documentElement.style.setProperty('--module-accent',accent);document.querySelectorAll('#restaurants-module,#accommodations-module,#attractions-module,#photo-spots-module,#shopping-module,#nature-module,#mobility-module,#move-module,.lv-module-host,.lv-dashboard').forEach(el=>{el.style.setProperty('--trip-accent',accent);el.style.setProperty('--module-accent',accent);el.style.setProperty('--rv2-accent',accent)})});
  window.addEventListener('luvia:dashboard-widget-refresh',e=>{const id=e.detail?.id;if(id&&activeView==='today'&&root?.querySelector('.lv-shell'))updateDashboardWidget(id)});window.addEventListener('luvia:open-place-request',e=>openPlace(e.detail).catch(console.error));window.addEventListener('luvia:in-window-data-changed',()=>{if(activeView==='today'&&root?.querySelector('.lv-shell')){updateDashboardWidget('today');requestAnimationFrame(()=>window.LuviaTimelineCore?.bindCalendar?.(root))}});window.addEventListener('luvia:trip-modules-changed',()=>{if(root?.querySelector('.lv-shell'))show(activeView,{force:true,animate:false,scroll:false}).catch(console.error)});window.addEventListener('luvia:places-lifecycle-changed',()=>{if(activeView==='places-lifecycle')window.LuviaPlaceLifecycleHub?.load?.().catch?.(console.warn)});window.addEventListener('luvia:place-overlay-closed',()=>{});window.addEventListener('luvia:navigate-request',e=>{const intent=e.detail?.intent||navigationContract().resolve(e.detail?.view,{source:'navigate-request'});if(intent?.route)show(intent.route,{force:true,intent,historyAction:e.detail?.historyAction,source:intent.source||'navigate-request'}).catch(console.error)});window.LuviaApp=Object.freeze({version:'13.82.33',bootstrap,render,start:startShell,diagnostics:()=>({...bootDiagnostics,appRuntime:window.LuviaAppRuntime?.diagnostics?.()||null,runtimeSignals:window.LuviaAppRuntimeSignalsV1?.diagnostics?.()||null,moduleMount:moduleMountRegistry?.diagnostics?.()||null,navigationHistory:window.LuviaNavigationHistoryV1?.diagnostics?.()||null}),show,back:()=>navigationHistory().back(),forward:()=>navigationHistory().forward(),openPlace,activeView:()=>activeView,ensureBookingAvailabilityClient,ensureBookingReservationCreateClient,ensureBookingReservationMutationClient,ensureBookingReservationMutationStatusClient,ensureBookingReservationRecoveryClient,ensureBookingEmailV2Client});if(document.readyState==='loading'){window.addEventListener('DOMContentLoaded',()=>startShell('DOMContentLoaded').catch(error=>console.error('[LuviaBoot]',error)),{once:true})}else{queueMicrotask(()=>startShell('document-already-ready').catch(error=>console.error('[LuviaBoot]',error)))};
  window.addEventListener('luvia:owner-flow-navigation',event=>{if(event.detail?.owner!=='join'||!bootComplete)return;Promise.resolve().then(()=>render()).catch(error=>{console.error('[LuviaOwnerFlow]',error);errorScreen(error)})});
})();
