(() => {
  'use strict';
  const VERSION='1.10.0-venue-identity-gate';
  let activeHandle=null;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=v=>String(v??'').trim();
  const normalizeIdentity=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const canonicalType=raw=>{
    const type=String(raw||'').toLowerCase();
    if(type==='restaurant'||type.includes('restaurant')||['cafe','café','bakery','meal_takeaway','meal_delivery','food'].includes(type))return 'restaurant';
    if(['night_club','nightclub','nightlife','bar','pub','lounge','music_venue','discotheque','disco','dance_club'].includes(type))return 'activity';
    if(['accommodation','hotel','lodging','motel','hostel','resort_hotel','bed_and_breakfast','guest_house'].includes(type)||type.includes('hotel'))return 'accommodation';
    return type;
  };
  const capable=type=>{
    const canonical=canonicalType(type);
    if(canonical==='restaurant')return true;
    if(canonical==='accommodation')return false;
    return Boolean(window.LuviaPlaceTypeContracts?.capability?.(canonical,'reservation')||window.LuviaPlaceTypeContracts?.capability?.(canonical,'booking'));
  };
  const admissionFor=place=>window.LuviaBookingAdmissionCore?.resolve?.(place)||null;

  function actionButton({placeType,place}={}){
    const type=canonicalType(placeType||place?.primaryType||place?.primary_type||'');
    const admission=admissionFor({...place,type});
    if(!(admission?.action?.available||capable(type)))return '';
    const label=admission?.action?.label||(type==='accommodation'?'Buchen':'Reservieren');
    const pid=place?.providerPlaceId||place?.provider_place_id||place?.id||'';
    const name=place?.name||'';
    const email=(place?.bookingEmailVerified===true&&place?.bookingEmailPublic===true)?place?.bookingEmail||'':'';
    const website=place?.website||place?.websiteUri||place?.website_uri||'';
    const reservationUrl=place?.reservationUrl||place?.reservation_url||place?.bookingUrl||place?.booking_url||place?.ticketUrl||place?.ticket_url||'';
    const reservationSource=place?.reservationSource||place?.reservation_source||place?.bookingRouteSource||place?.booking_route_source||(pid&&reservationUrl?'provider_place_details':'');
    const address=place?.formattedAddress||place?.address||place?.shortAddress||'';
    return `<button type="button" class="luv-place-primary-action" data-luvia-booking-place data-booking-place-type="${esc(type)}" data-booking-place-id="${esc(pid)}" data-booking-place-name="${esc(name)}" data-booking-place-email="${esc(email)}" data-booking-place-website="${esc(website)}" data-booking-place-reservation-url="${esc(reservationUrl)}" data-booking-place-reservation-source="${esc(reservationSource)}" data-booking-place-address="${esc(address)}">◇ ${label}</button>`;
  }

  function dialogHtml(place={},route={},options={}){
    const type=String(place.type||'other');
    const admission=admissionFor(place),kind=admission?.kind||'other',isHotel=kind==='lodging'||type==='accommodation'||type==='hotel',isDining=kind==='dining'||type==='restaurant';
    const subject=isDining?'Tisch':isHotel?'Aufenthalt':'Besuch';
    const trip=window.LuviaTripContractV1?.getActiveTrip?.()||{};
    const defaultDate=(options.date||trip.startDate||trip.start_date||new Date().toISOString().slice(0,10));
    const defaultTime=options.time||'19:00';
    const email=route?.resolved&&route.channel==='email'&&route.value?route.value:place.email||'';
    const routeLabel=email?'Reservierungsanfrage senden':'Noch kein sicherer Buchungsweg';
    return `<div class="lv-booking-backdrop">
      <section class="lv-booking-dialog" role="dialog" aria-modal="true" aria-labelledby="bookingDialogTitle">
        <button type="button" class="lv-booking-close" data-booking-close aria-label="Schließen">×</button>
        <span class="lv-booking-kicker">Luvia Booking</span>
        <h2 id="bookingDialogTitle">${isDining?'Euren Tisch anfragen.':isHotel?'Euren Aufenthalt anfragen.':'Euren Besuch anfragen.'}</h2>
        <p><strong>${esc(place.name||'Ausgewählter Ort')}</strong><span>Drei kurze Schritte. Erst am Ende wird etwas übergeben.</span></p>
        <nav class="lv-booking-progress" aria-label="Buchungsschritte"><button type="button" data-booking-step-jump="1" aria-current="step"><b>1</b><span>Wer</span></button><i></i><button type="button" data-booking-step-jump="2"><b>2</b><span>Wann</span></button><i></i><button type="button" data-booking-step-jump="3"><b>3</b><span>Wunsch</span></button></nav>
        <form class="lv-booking-canvas" data-booking-canvas>
          <section class="lv-booking-step is-active" data-booking-step="1">
            <span>Schritt 1 · Eure Anfrage</span><h3>Auf welchen Namen?</h3><p>Damit Anbieter und Booking eure Anfrage eindeutig zuordnen können.</p>
            <div class="lv-booking-fields"><label><span>Name</span><input type="text" autocomplete="name" data-booking-name required placeholder="Vor- und Nachname"></label><label><span>${isHotel?'Gäste':isDining?'Personen':'Teilnehmende'}</span><input type="number" min="1" max="50" value="2" data-booking-party required></label></div>
          </section>
          <section class="lv-booking-step" data-booking-step="2" hidden>
            <span>Schritt 2 · Euer Zeitpunkt</span><h3>${isHotel?'Wann möchtet ihr bleiben?':`Wann soll euer ${subject} sein?`}</h3><p>Datum und Uhrzeit werden verbindlich erst mit eurem letzten Klick übergeben.</p>
            <div class="lv-booking-fields"><label><span>${isHotel?'Check-in':'Datum'}</span><input type="date" data-booking-date required value="${esc(defaultDate)}"></label>${isHotel?`<label><span>Check-out</span><input type="date" data-booking-end-date required value="${esc(defaultDate)}"></label>`:`<label><span>Uhrzeit</span><input type="time" data-booking-time required value="${esc(defaultTime)}"></label>`}</div>
          </section>
          <section class="lv-booking-step" data-booking-step="3" hidden>
            <span>Schritt 3 · Der passende Rahmen</span><h3>Gibt es einen Anlass oder Wunsch?</h3><p>Optional – Luvia übergibt beides unverändert an den gewählten Buchungsweg.</p>
            <div class="lv-booking-occasions" role="group" aria-label="Anlass"><button type="button" data-booking-occasion="Kein besonderer Anlass" aria-pressed="true">Einfach so</button><button type="button" data-booking-occasion="Geburtstag" aria-pressed="false">Geburtstag</button><button type="button" data-booking-occasion="Jahrestag" aria-pressed="false">Jahrestag</button><button type="button" data-booking-occasion="Familienzeit" aria-pressed="false">Familienzeit</button><button type="button" data-booking-occasion="Besonderer Abend" aria-pressed="false">Besonderer Abend</button></div>
            <label class="lv-booking-note"><span>Anmerkungen</span><textarea data-booking-note rows="3" placeholder="z. B. ruhiger Tisch, Kinderstuhl oder Allergie …"></textarea></label>
            <input type="hidden" data-booking-email value="${esc(email)}"><input type="hidden" data-booking-occasion-value value="Kein besonderer Anlass">
            <div class="lv-booking-route"><strong>${email?'Verifizierter E-Mail-Weg':'Noch kein sicherer Weg gefunden'}</strong><small>${email?'Der Booking Core hat keinen belastbareren Providerweg gefunden und diese öffentlich belegte Buchungsadresse geprüft. Eine E-Mail wird nur nach eurem letzten Klick versendet.':'Luvia rät keine Adresse und sendet nichts.'}</small></div>
          </section>
          <div class="lv-booking-actions"><button type="button" data-booking-prev hidden>← Zurück</button><span></span><button type="button" class="is-primary" data-booking-next>Weiter →</button><button type="submit" class="is-primary" data-booking-create hidden ${email?'':'disabled'}>${esc(routeLabel)}</button></div>
        </form>
        <div class="lv-booking-result" data-booking-result hidden></div>
      </section>
    </div>`;
  }

  function close(node,reason='owner'){if(!activeHandle||activeHandle.overlay!==node)return false;const current=activeHandle;activeHandle=null;return current.close(reason)}

  async function open(place={},route={},options={}){
    if(!(route?.resolved&&route.channel==='email'&&route.value))throw new Error('Der E-Mail-Canvas darf nur für einen verifizierten E-Mail-Fallback geöffnet werden.');
    if(!routeIdentityMatchesPlace(place,route))throw new Error('Der E-Mail-Weg gehört nicht nachweisbar zu diesem Ort.');
    const inlineHost=options.host instanceof Element?options.host:null;
    if(!inlineHost)close(activeHandle?.overlay,'replace');
    const wrap=document.createElement('div');
    wrap.innerHTML=dialogHtml(place,route,options);
    const backdrop=wrap.firstElementChild,dialog=backdrop.firstElementChild;
    let node=backdrop,mounted=null;
    if(inlineHost){inlineHost.classList.add('is-booking-inline-host');inlineHost.replaceChildren(dialog);dialog.classList.add('is-inline');node=inlineHost}
    else{const ui=LuviaUI;if(!ui?.adopt)throw new Error('Overlay Host v1 Legacy Adoption ist noch nicht bereit.');mounted=ui.adopt(node,{name:'booking.place-request',kind:'sheet',content:dialog,closeSelector:'[data-booking-close]',initialFocus:'[data-booking-name]',onClose:()=>{if(activeHandle?.id===mounted.id)activeHandle=null}});activeHandle=mounted}
    const controls={steps:[],jumps:[],occasions:[]};
    node.querySelectorAll('[data-booking-step],[data-booking-step-jump],[data-booking-occasion],[data-booking-close],[data-booking-prev],[data-booking-next],[data-booking-create],[data-booking-result],[data-booking-name],[data-booking-party],[data-booking-date],[data-booking-time],[data-booking-end-date],[data-booking-email],[data-booking-occasion-value],[data-booking-note]').forEach(element=>{
      if(element.hasAttribute('data-booking-step'))controls.steps.push(element);
      if(element.hasAttribute('data-booking-step-jump'))controls.jumps.push(element);
      if(element.hasAttribute('data-booking-occasion'))controls.occasions.push(element);
      for(const key of ['close','prev','next','create','result','name','party','date','time','endDate','email','occasionValue','note']){
        const attribute=`data-booking-${key.replace(/[A-Z]/g,letter=>`-${letter.toLowerCase()}`)}`;
        if(element.hasAttribute(attribute))controls[key]=element;
      }
    });
    if(inlineHost&&controls.close){controls.close.setAttribute('aria-label','Zurück zu den Vorschlägen');controls.close.textContent='←'}
    let step=1;
    const backToSuggestions=()=>options.onBack?.();
    const showStep=next=>{
      step=Math.max(1,Math.min(3,Number(next)||1));
      controls.steps.forEach(panel=>{const active=Number(panel.dataset.bookingStep)===step;panel.hidden=!active;panel.classList.toggle('is-active',active)});
      controls.jumps.forEach(button=>{const active=Number(button.dataset.bookingStepJump)===step;button.toggleAttribute('aria-current',active);if(active)button.setAttribute('aria-current','step')});
      controls.prev.hidden=step===1;controls.next.hidden=step===3;controls.create.hidden=step!==3;
      controls.steps.find(panel=>Number(panel.dataset.bookingStep)===step)?.querySelector('input,textarea')?.focus?.();
    };
    let submitting=false;
    const submitRequest=async e=>{
      e?.preventDefault?.();
      if(submitting)return;
      submitting=true;
      const create=controls.create;
      create.disabled=true;
      const result=controls.result;
      try{
        const date=controls.date?.value||'';
        const time=controls.time?.value||'12:00';
        const endDate=controls.endDate?.value||'';
        const startAt=date?new Date(`${date}T${time}:00`).toISOString():null;
        const endAt=endDate?new Date(`${endDate}T11:00:00`).toISOString():null;
        const request={requesterName:controls.name?.value||'',partySize:Number(controls.party?.value||1),startAt,endAt,occasion:controls.occasionValue?.value||'',note:controls.note?.value||''};
        const email=controls.email?.value||'';if(!email)throw new Error('Für diesen Ort wurde keine verifizierte Buchungs-E-Mail gefunden.');
        const booking=await window.LuviaBooking.createForPlace({placeType:place.type,place:{...place,email},channel:'email',provider:route.provider||'official',emailVerified:true,emailVerificationSource:route.source||route.reason||'verified_booking_owner_route',route,...request});
        await window.LuviaBooking.sendEmail(booking.id,{requesterName:request.requesterName,note:request.note,occasion:request.occasion});
        result.hidden=false;result.innerHTML=`<strong>Anfrage versendet.</strong><p>Luvia hat Anlass und Anmerkungen an ${esc(booking.contact.email)} übergeben. Der Status bleibt „Angefragt“, bis eine belastbare Antwort vorliegt.</p>`;
        create.hidden=true;
      }catch(error){
        result.hidden=false;
        result.textContent=error?.message||'Die Buchungsanfrage konnte nicht angelegt werden.';
        create.disabled=false;
      }finally{submitting=false}
    };
    const bookingCanvas=node.querySelector('[data-booking-canvas]');
    if(bookingCanvas)bookingCanvas.onsubmit=submitRequest;
    node.addEventListener('click',async e=>{
      if(e.target===node)return;
      if(e.target.closest('[data-booking-close]')){if(inlineHost)backToSuggestions();return}
      const occasion=e.target.closest('[data-booking-occasion]');
      if(occasion){controls.occasions.forEach(button=>button.setAttribute('aria-pressed',String(button===occasion)));controls.occasionValue.value=occasion.dataset.bookingOccasion;return}
      if(e.target.closest('[data-booking-prev]')){showStep(step-1);return}
      if(e.target.closest('[data-booking-next]')){
        const panel=controls.steps.find(candidate=>Number(candidate.dataset.bookingStep)===step),invalid=panel.querySelector(':invalid');if(invalid){invalid.reportValidity();return}showStep(step+1);return;
      }
      const create=e.target.closest('[data-booking-create]');
      if(!create)return;
      await submitRequest(e);
    });
    showStep(1);
    controls.name?.focus?.();
    return node;
  }

  const ROUTE_CACHE_TTL_MS=5*60*1000;
  const routeCache=new Map();
  const routeCacheFamilies=new Map();
  const placeIdentityKey=place=>[
    clean(place?.providerPlaceId||place?.provider_place_id||place?.id).replace(/^places\//,''),
    normalizeIdentity(place?.name),
    normalizeIdentity(place?.formattedAddress||place?.address||place?.shortAddress),
    normalizeIdentity(place?.type||place?.primaryType||place?.primary_type)
  ].join('|');
  const routeFactsKey=place=>[
    clean(place?.website||place?.websiteUri||place?.website_uri).toLowerCase(),
    clean(place?.reservationUrl||place?.reservation_url||place?.bookingUrl||place?.booking_url||place?.ticketUrl||place?.ticket_url).toLowerCase(),
    normalizeIdentity(place?.reservationSource||place?.reservation_source),
    place?.bookingEmailVerified===true?normalizeIdentity(place?.bookingEmail||place?.email):''
  ].join('|');
  const cacheKey=place=>`${placeIdentityKey(place)}::${routeFactsKey(place)}`;
  const cacheFamilyKey=place=>clean(place?.providerPlaceId||place?.provider_place_id||place?.id).replace(/^places\//,'')||`${normalizeIdentity(place?.name)}|${normalizeIdentity(place?.formattedAddress||place?.address||place?.shortAddress)}`;
  function cachedRoute(place){
    const key=cacheKey(place),identity=placeIdentityKey(place),entry=routeCache.get(key);
    if(!entry)return null;
    if(entry.identity!==identity||entry.expiresAt<=Date.now()){routeCache.delete(key);return null}
    return entry.promise;
  }
  function rememberRoute(place,promise){
    const key=cacheKey(place),identity=placeIdentityKey(place),family=cacheFamilyKey(place),previous=routeCacheFamilies.get(family);
    if(previous&&previous!==key)routeCache.delete(previous);
    routeCacheFamilies.set(family,key);
    routeCache.set(key,{identity,expiresAt:Date.now()+ROUTE_CACHE_TTL_MS,promise});
    Promise.resolve(promise).catch(()=>{const current=routeCache.get(key);if(current?.promise===promise)routeCache.delete(key)});
    return promise;
  }
  const routeIdentityMatchesPlace=(place,route)=>Boolean(route?.identityVerified===true&&clean(route.placeIdentityKey)&&route.placeIdentityKey===placeIdentityKey(place));

  async function enrichPlace(place){
    let enriched={...place};
    const providerId=String(enriched.providerPlaceId||'').replace(/^places\//,'');
    if(providerId&&window.LuviaPlaceDetails?.prepare&&(!enriched.website||!(enriched.reservationUrl||enriched.ticketUrl))){
      try{
        const prepared=await window.LuviaPlaceDetails.prepare(providerId,{regionCode:'DE',photoLimit:1,seedPlace:{name:enriched.name,primaryType:enriched.type}});
        const detail=prepared?.place||{};
        const detailedReservationUrl=detail.reservationUrl||detail.reservation_url||detail.bookingUrl||detail.booking_url||detail.ticketUrl||detail.ticket_url||'';
        enriched={...enriched,
          name:enriched.name||detail.name||detail.displayName?.text||'',
          website:enriched.website||detail.website||detail.websiteUri||detail.website_uri||'',
          reservationUrl:enriched.reservationUrl||enriched.ticketUrl||detailedReservationUrl,
          reservationSource:enriched.reservationSource||(detailedReservationUrl?'provider_place_details':''),
          address:enriched.address||detail.formattedAddress||detail.address||''
        };
      }catch(error){console.debug('[Luvia Booking] Place-Details für Provider-Routing konnten nicht nachgeladen werden.',error?.message||error)}
    }
    return enriched;
  }

  async function resolveRouteCached(place){
    const cachedFirst=cachedRoute(place);if(cachedFirst)return cachedFirst;
    const promise=(async()=>{
      const enriched=await enrichPlace(place);
      // Admission may describe a possible route, but only the Edge resolver may
      // bind a concrete external URL or e-mail address to this exact Place.
      // This deliberately prevents stale/cross-venue admission data from bypassing
      // the identity gate (for example Beach Lounge -> unrelated A-ROSA property).
      let route=await window.LuviaBooking.resolvePlaceRoute(enriched);
      if(route?.resolved&&['external_link','affiliate','email'].includes(route.channel)&&!routeIdentityMatchesPlace(enriched,route))route={...route,resolved:false,channel:null,value:null,reason:'ROUTE_PLACE_IDENTITY_MISMATCH'};
      const resolved={place:enriched,route};
      return resolved;
    })();
    return rememberRoute(place,promise);
  }

  function placeFromButton(button){
    return {
      type:button.dataset.bookingPlaceType,
      id:button.dataset.bookingPlaceId,
      providerPlaceId:button.dataset.bookingPlaceId,
      name:button.dataset.bookingPlaceName,
      email:button.dataset.bookingPlaceEmail,
      website:button.dataset.bookingPlaceWebsite,
      reservationUrl:button.dataset.bookingPlaceReservationUrl,
      reservationSource:button.dataset.bookingPlaceReservationSource||'',
      address:button.dataset.bookingPlaceAddress||''
    };
  }

  // Warm the provider route as soon as the user approaches the action. On desktop this
  // normally completes before the click, so the external booking page opens immediately.
  document.addEventListener('pointerover',e=>{
    const button=e.target.closest?.('[data-luvia-booking-place]');
    if(!button||button.dataset.bookingPrefetched==='1')return;
    button.dataset.bookingPrefetched='1';
    resolveRouteCached(placeFromButton(button)).catch(()=>{});
  },{passive:true,capture:true});
  document.addEventListener('focusin',e=>{
    const button=e.target.closest?.('[data-luvia-booking-place]');
    if(!button||button.dataset.bookingPrefetched==='1')return;
    button.dataset.bookingPrefetched='1';
    resolveRouteCached(placeFromButton(button)).catch(()=>{});
  },true);

  // Mobile has no hover. Resolve as soon as a reservation action becomes visible so the
  // verified destination is normally ready before the user's click.
  const bookingObserver=('IntersectionObserver' in window)?new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      const button=entry.target;
      if(button?.dataset?.bookingPrefetched!=='1'){
        button.dataset.bookingPrefetched='1';
        resolveRouteCached(placeFromButton(button)).catch(()=>{});
      }
      bookingObserver.unobserve(button);
    }
  },{rootMargin:'240px'}):null;
  const observeBookingButtons=()=>document.querySelectorAll('[data-luvia-booking-place]').forEach(button=>{
    if(button.dataset.bookingPrefetched!=='1'){button.dataset.bookingPrefetched='1';resolveRouteCached(placeFromButton(button)).catch(()=>{});}
    bookingObserver?.observe(button);
  });
  new MutationObserver(observeBookingButtons).observe(document.documentElement,{childList:true,subtree:true});
  queueMicrotask(observeBookingButtons);

  function closeReserved(handle){try{if(handle&&!handle.closed)handle.close()}catch{}}
  function externalTarget(route){
    if(!(route?.resolved&&['external_link','affiliate'].includes(route.channel)&&route.value))return null;
    try{const target=new URL(route.value);if(!/^https?:$/.test(target.protocol))return null;return target.toString()}catch{return null}
  }

  async function openForPlace(input={},options={}){
    let place={...input,type:canonicalType(input.type||input.primaryType||input.primary_type||'other')};
    let reserved=null;
    if(options.reserveExternalWindow!==false){try{reserved=LuviaOwnerFlowNavigationV1.reserveBookingHandoff()}catch{}}
    let resolved;
    try{resolved=await resolveRouteCached(place)}catch(error){
      closeReserved(reserved);
      console.warn('[Luvia Booking] Die evidenzbasierte Routenermittlung ist fehlgeschlagen.',error);
      options.onUnavailable?.({place,route:{resolved:false,channel:null,reason:'ROUTE_PREVIEW_UNAVAILABLE'},error});
      return Object.freeze({opened:false,channel:'unavailable',resolvedChannel:null,provider:null,reason:'ROUTE_PREVIEW_UNAVAILABLE',requiresOwnerFlow:false});
    }
    place=resolved.place||place;
    const route=resolved.route||{};
    place._bookingContactChecked=true;
    place._bookingContactReason=route.reason||'NO_VERIFIED_ROUTE';
    place._bookingContactPagesChecked=Number(route.pagesChecked||0);
    place._bookingEnginesDetected=Array.isArray(route.enginesDetected)?route.enginesDetected:[];

    const target=externalTarget(route);
    if(target&&!routeIdentityMatchesPlace(place,route)){
      closeReserved(reserved);
      const blockedRoute={...route,resolved:false,channel:null,value:null,reason:'ROUTE_PLACE_IDENTITY_MISMATCH'};
      options.onUnavailable?.({place,route:blockedRoute});
      return Object.freeze({opened:false,channel:'unavailable',resolvedChannel:null,provider:route.provider||null,reason:'ROUTE_PLACE_IDENTITY_MISMATCH',requiresOwnerFlow:false});
    }
    if(target){
      let tracking=null,trackingError=null;
      try{
        if(typeof window.LuviaBooking.trackExternalHandoffForPlace==='function')tracking=await window.LuviaBooking.trackExternalHandoffForPlace({place,route:{...route,value:target},startAt:options.startAt||null,endAt:options.endAt||null,partySize:options.partySize||1});
        else{await window.LuviaBooking.recordPlaceHandoff?.(place,{...route,value:target});tracking={tracked:true,legacyAttributionOnly:true}}
      }
      catch(error){trackingError=error;console.warn('[Luvia Booking] Der externe Weg wurde geöffnet, konnte aber nicht im Booking Center gespeichert werden.',error)}
      const didOpen=LuviaOwnerFlowNavigationV1.openBooking(target,{reserved});
      if(!didOpen){closeReserved(reserved);throw new Error('Der Browser hat das Buchungsfenster blockiert.')}
      const tracked=tracking?.tracked===true;
      options.onExternal?.({place,route:{...route,value:target},tracked,bookingId:tracking?.bookingId||null,trackingError});
      return Object.freeze({opened:true,channel:'external_link',resolvedChannel:route.channel,provider:route.provider||null,reason:route.reason||null,requiresOwnerFlow:false,tracked,bookingId:tracking?.bookingId||null,trackingError:trackingError?.message||null});
    }

    closeReserved(reserved);
    if(route.resolved&&route.channel==='email'&&route.value){
      place.email=route.value;
      await open(place,route,options);
      return Object.freeze({opened:true,channel:'email_canvas',resolvedChannel:'email',provider:route.provider||null,reason:route.reason||null,requiresOwnerFlow:true});
    }

    options.onUnavailable?.({place,route});
    return Object.freeze({opened:false,channel:'unavailable',resolvedChannel:route.channel||null,provider:route.provider||null,reason:route.reason||'NO_VERIFIED_ROUTE',requiresOwnerFlow:false});
  }

  document.addEventListener('click',async e=>{
    const button=e.target.closest('[data-luvia-booking-place]');
    if(!button)return;
    e.preventDefault();
    e.stopPropagation();
    if(button.dataset.bookingBusy==='1')return;
    const place=placeFromButton(button);
    button.dataset.bookingBusy='1';button.disabled=true;
    try{
      await openForPlace(place,{reserveExternalWindow:true});
    }catch(error){
      window.LuviaUIKit?.toast?.(error?.message||'Der Booking-Owner-Flow konnte nicht geöffnet werden.',{type:'error'});
    }finally{
      button.dataset.bookingBusy='0';button.disabled=false;
    }
  },true);


  window.LuviaBookingUI=Object.freeze({version:VERSION,actionButton,open,openForPlace});
})();
