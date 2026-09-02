(() => {
  'use strict';
  const VERSION='1.22.0-selected-stay-offer-handoff';
  let client=null, repository=null, initialized=false, initPromise=null;

  const mapType=type=>({
    restaurant:'restaurant',
    dining:'restaurant',
    accommodation:'hotel',
    lodging:'hotel',
    attraction:'activity',
    culture:'activity',
    activity:'activity',
    event:'event',
    mobility:'transport'
  }[String(type||'').toLowerCase()]||'other');

  const activeTrip=()=>window.LuviaTripContractV1?.getActiveTrip?.()||null;
  const activeTripId=()=>activeTrip()?.id||activeTrip()?.tripId||null;
  const clean=v=>String(v??'').trim();

  function providerId(place={}){
    return clean(place.providerPlaceId||place.provider_place_id||place.googlePlaceId||place.google_place_id||place.name||place.id);
  }

  function internalUuid(value){
    const v=clean(value);
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)?v:null;
  }

  function safeHttps(value){
    try{const url=new URL(clean(value));return url.protocol==='https:'?url.toString():null}catch{return null}
  }

  function channel(value,fallback='manual'){
    const normalized=clean(value).toLowerCase();
    return ['email','api','affiliate','external_link','manual'].includes(normalized)?normalized:fallback;
  }

  async function init(){
    if(initialized)return api;
    if(initPromise)return initPromise;
    initPromise=(async()=>{
      client=await window.LuviaSupabaseService.start();
      repository=window.LuviaBookingRepository.createSupabaseRepository(client);
      window.LuviaBookingCore.configure({repository});
      window.LuviaBookingCommunication?.configure?.({repository,mode:'production'});
      initialized=true;
      window.dispatchEvent(new CustomEvent('luvia:booking-ready',{detail:{version:VERSION}}));
      return api;
    })().catch(error=>{initPromise=null;throw error;});
    return initPromise;
  }

  async function createForPlace(input={}){
    await init();
    const tripId=input.tripId||activeTripId();
    if(!tripId)throw new Error('Keine aktive Reise verfügbar.');
    const place=input.place||{};
    const placeType=String(input.placeType||place.primaryType||place.primary_type||'other').toLowerCase();
    const startAt=input.startAt||null;
    const endAt=input.endAt||null;
    const contactEmail=clean(input.email||place.email||place.contactEmail||place.contact_email);
    const contactPhone=clean(place.phone||place.phoneNumber||place.internationalPhoneNumber);
    const website=clean(place.website||place.websiteUri||place.website_uri);
    const explicitChannel=channel(input.channel||input.route?.channel,contactEmail?'email':'manual');
    const explicitProvider=clean(input.provider||input.route?.provider)||null;
    const row=await window.LuviaBookingCore.create({
      tripId,
      tripPlaceId:internalUuid(input.tripPlaceId||place.tripPlaceId||place.trip_place_id),
      placeId:internalUuid(input.placeId||place.internalPlaceId||place.place_id),
      type:mapType(placeType),
      status:'draft',
      channel:explicitChannel,
      provider:explicitProvider,
      title:clean(input.title||place.name)||'Buchungsanfrage',
      startAt,
      endAt,
      partySize:Number(input.partySize||1),
      contact:{
        ...(contactEmail?{email:contactEmail}:{}),
        ...(contactPhone?{phone:contactPhone}:{}),
        ...(website?{website}:{}),
      },
      request:{
        requesterName:clean(input.requesterName),
        occasion:clean(input.occasion),
        note:clean(input.note),
        providerPlaceId:providerId(place),
        sourcePlaceType:placeType,
        source:'luvia_places',
        website:website||null,
        reservationUrl:clean(input.reservationUrl||input.route?.value||place.reservationUrl||place.reservation_url||place.bookingUrl||place.booking_url)||null
      },
      metadata:{
        integrationVersion:VERSION,
        destination:activeTrip()?.destination||null,
        ...(input.emailVerified===true?{verifiedContact:{email:true,source:clean(input.emailVerificationSource)||'booking_owner_route'}}:{}),
        ...(input.metadata&&typeof input.metadata==='object'?input.metadata:{})
      }
    });
    let ready=await window.LuviaBookingCore.transition(row.id,'ready',{metadata:{createdFrom:'places'}});
    try{await linkRecentPlaceHandoff(ready.id,place)}catch(error){console.warn('[Luvia Booking] Korrelation des vorherigen Handoffs übersprungen.',error)}
    window.dispatchEvent(new CustomEvent('luvia:booking-changed',{detail:{booking:ready,action:'created'}}));
    if(!ready?.contact?.email&&input.skipRouteResolution!==true){
      try{await resolveRoute(ready.id);ready=await get(ready.id)||ready}catch(error){console.warn('[Luvia Booking] automatische Buchungskanal-Ermittlung nicht verfügbar',error)}
    }
    return ready;
  }

  const CREATE_EXPECTED_CODES=new Set([
    'RESERVATION_CREATE_NOT_SUPPORTED','PARTNER_REQUIRED','CONNECTION_NOT_READY',
    'RESERVATION_CREATE_TRANSPORT_NOT_ACTIVE','LIVE_PROBE_NOT_HEALTHY','PROVIDER_DISABLED',
    'PROVIDER_NOT_FOUND','RESERVATION_CREATE_ADAPTER_NOT_IMPLEMENTED','BOOKING_STATE_NOT_CREATABLE'
  ]);
  function createExpected(result={}){
    const code=clean(result?.error||result?.code).toUpperCase();
    return result?.expected===true||CREATE_EXPECTED_CODES.has(code);
  }
  function reservationDateTime(input={}){
    const start=clean(input.startAt||input.start_at),instant=start?new Date(start):null;
    return{
      date:clean(input.date||input.requestedDate)||(instant&&!Number.isNaN(instant.getTime())?instant.toISOString().slice(0,10):''),
      time:clean(input.time||input.requestedTime)||(instant&&!Number.isNaN(instant.getTime())?instant.toISOString().slice(11,16):'')
    };
  }
  function providerVenueReference(input={},booking={}){
    const place=input.place||{},metadata=booking.metadata||{},providers=metadata.providers||{},provider=clean(input.provider||booking.provider).toLowerCase();
    return clean(input.venueReference||input.venue_reference||input.providerVenueReference||input.provider_venue_reference||input.providerSlotReference||place.venueReference||place.providerVenueReference||booking.request?.providerReference||providers?.[provider]?.venueId||providers?.[provider]?.reference);
  }
  function submissionResult(booking,result={}){
    return{bookingId:booking.id,bookingStatus:booking.status||null,provider:clean(result.provider||booking.provider)||null,providerOutcomeKnown:result.providerOutcomeKnown!==false,bookingStatusChanged:Boolean(result.bookingStatusChanged),...result};
  }

  /**
   * Executes the confirmed reservation request through exactly one evidenced
   * transport. Creating the Booking-owned row alone is never reported as an
   * external submission. Expected provider unavailability may safely fall back
   * to a verified e-mail route; an uncertain provider response never does.
   */
  async function submitReservation(input={}){
    await init();
    const trustedEmail=input.emailVerified===true?clean(input.email||input.place?.bookingEmail||input.place?.email):'';
    const protectedInput={...input,email:trustedEmail||undefined,place:{...(input.place||{}),...(trustedEmail?{email:trustedEmail}:{email:undefined})},skipRouteResolution:true};
    let booking=input.bookingId?await get(input.bookingId):await createForPlace(protectedInput);
    if(!booking)throw Object.assign(new Error('Die Buchungsanfrage konnte nicht angelegt werden.'),{code:'BOOKING_CREATE_FAILED',outcomeKnown:true});
    let route=input.route&&typeof input.route==='object'?input.route:null;
    const dateTime=reservationDateTime(input),provider=clean(input.provider||route?.provider||booking.provider).toLowerCase(),venueReference=providerVenueReference({...input,provider},booking),reservationCreate=typeof LuviaBookingReservationCreate!=='undefined'?LuviaBookingReservationCreate:null;
    const canTryProvider=Boolean(provider&&venueReference&&dateTime.date&&Number(input.partySize)>0&&reservationCreate?.create);
    if(canTryProvider&&(clean(input.channel||route?.channel||booking.channel).toLowerCase()==='api'||input.preferProviderApi===true)){
      let providerResult;
      try{
        providerResult=await reservationCreate.create({bookingId:booking.id,providerId:provider,venueReference,providerSlotReference:input.providerSlotReference||null,date:dateTime.date,time:dateTime.time||null,partySize:Number(input.partySize),timezone:clean(input.timezone)||null,guest:input.guest||{},notes:clean(input.note||input.notes)||null,idempotencyKey:input.idempotencyKey||null});
      }catch(error){
        // A transport exception may have reached the provider. It must be
        // reconciled and must never trigger an automatic second submission.
        error.outcomeKnown=false;throw error;
      }
      if(providerResult?.ok)return submissionResult(booking,{...providerResult,ok:true,transport:'provider_api',submissionState:providerResult.luviaStatus==='confirmed'?'confirmed':'provider_requested',providerOutcomeKnown:true});
      if(!createExpected(providerResult))throw Object.assign(new Error(providerResult?.error||'Der Provider-Ausgang ist noch nicht eindeutig.'),{code:providerResult?.error||'RESERVATION_CREATE_OUTCOME_UNKNOWN',outcomeKnown:false,providerResult});
      route=null;
    }
    if(!route?.resolved){
      try{route=await resolveRoute(booking.id)}catch(error){return submissionResult(booking,{ok:false,expected:true,transport:null,submissionState:'route_unavailable',providerOutcomeKnown:true,reason:error?.code||'BOOKING_ROUTE_RESOLUTION_FAILED'})}
      booking=await get(booking.id)||booking;
    }
    const resolvedChannel=clean(route?.channel||booking.channel).toLowerCase(),resolvedProvider=clean(route?.provider||booking.provider)||null;
    if(resolvedChannel==='email'){
      const verifiedByResolver=route?.resolved===true||booking?.metadata?.verifiedContact?.email===true;
      if(!verifiedByResolver||!clean(booking.contact?.email))return submissionResult(booking,{ok:false,expected:true,transport:null,submissionState:'verified_contact_required',provider:resolvedProvider,providerOutcomeKnown:true});
      const emailResult=await sendEmail(booking.id,{requesterName:input.requesterName,note:input.note||input.notes,occasion:input.occasion,idempotencyKey:input.idempotencyKey});
      if(emailResult?.expected===true||emailResult?.error)return submissionResult(booking,{...emailResult,ok:false,expected:true,transport:'email',submissionState:'email_not_sent',provider:resolvedProvider,providerOutcomeKnown:true});
      return submissionResult(booking,{...emailResult,ok:true,transport:'email',submissionState:'email_sent',provider:resolvedProvider,providerOutcomeKnown:true,awaitingProviderReply:true});
    }
    if(['external_link','affiliate'].includes(resolvedChannel)&&clean(route?.value||booking.contact?.bookingUrl))return submissionResult(booking,{ok:false,expected:true,transport:resolvedChannel,submissionState:'external_action_required',provider:resolvedProvider,providerOutcomeKnown:true,requiresUserAction:true,url:clean(route?.value||booking.contact?.bookingUrl)});
    return submissionResult(booking,{ok:false,expected:true,transport:null,submissionState:'route_unavailable',provider:resolvedProvider,providerOutcomeKnown:true,requiresUserAction:true,reason:clean(route?.reason)||'NO_VERIFIED_BOOKING_ROUTE'});
  }

  async function listForTrip(tripId=activeTripId()){
    await init();
    if(!tripId)return [];
    const {data,error}=await client.from('booking_integration_summary').select('*').eq('trip_id',tripId).order('start_at',{ascending:true,nullsFirst:false}).order('created_at',{ascending:false});
    if(error)throw error;
    return data||[];
  }

  async function get(id){
    await init();
    const {data,error}=await client.from('booking_integration_summary').select('*').eq('id',id).maybeSingle();
    if(error)throw error;
    return data;
  }

  async function transition(id,status,patch={}){
    await init();
    const {data,error}=await client.rpc('luvia_transition_booking',{p_booking_id:id,p_status:status,p_patch:patch||{}});
    if(error)throw new Error(error.message||'Booking-Status konnte nicht geändert werden.');
    window.dispatchEvent(new CustomEvent('luvia:booking-changed',{detail:{booking:data,action:'transition',status}}));
    return data;
  }

  function readableErrorDetail(value){
    if(value==null)return '';
    if(typeof value==='string')return value;
    if(value instanceof Error)return value.message||String(value);
    if(typeof value==='object'){
      const preferred=value.message||value.error||value.name||value.code;
      if(typeof preferred==='string'&&preferred.trim())return preferred.trim();
      try{return JSON.stringify(value)}catch{}
    }
    return String(value);
  }

  async function functionError(error,fallback){
    if(!error)return new Error(fallback);
    try{
      const ctx=error.context;
      if(ctx&&typeof ctx.json==='function'){
        const body=await ctx.json();
        const parts=[];
        const code=readableErrorDetail(body?.error);
        const message=readableErrorDetail(body?.message);
        const details=readableErrorDetail(body?.details);
        const status=body?.resendStatus?`Resend HTTP ${body.resendStatus}`:'';
        for(const part of [code,message,details,status])if(part&&!parts.includes(part))parts.push(part);
        if(parts.length)return new Error(parts.join(' · '));
      }
    }catch{}
    return new Error(error.message||fallback);
  }


  async function providerCapabilities(){
    await init();
    const {data,error}=await client.from('booking_provider_capabilities').select('*').eq('active',true).order('provider_id');
    if(error){console.warn('[Luvia Booking] Provider-Capabilities DB nicht verfügbar; lokaler Contract wird genutzt.',error);return window.LuviaBookingProviderCapabilities?.list?.()||[];}
    return (data||[]).map(row=>window.LuviaBookingProviderCapabilities?.normalize?.(row)||row);
  }

  async function statusHistory(id){
    await init();
    const {data,error}=await client.from('booking_status_updates').select('*').eq('booking_id',id).order('occurred_at',{ascending:false}).order('created_at',{ascending:false});
    if(error)throw error;
    return data||[];
  }


  async function statusSignals(id){
    await init();
    const {data,error}=await client.from('booking_status_signals').select('*').eq('booking_id',id).order('occurred_at',{ascending:false}).order('received_at',{ascending:false});
    if(error)throw error;return data||[];
  }

  async function attributionJourney(id){
    await init();
    const {data,error}=await client.from('booking_attribution_events_v2').select('*').eq('booking_id',id).order('occurred_at',{ascending:true});
    if(error)throw error;return data||[];
  }

  async function statusAttributionSummary(id){
    await init();
    const {data,error}=await client.from('booking_status_attribution_v2_summary').select('*').eq('booking_id',id).maybeSingle();
    if(error)throw error;return data;
  }

  async function recordHandoff(id,{provider,url,providerReference=null,metadata={}}={}){
    await init();
    const {data,error}=await client.rpc('luvia_booking_record_handoff',{p_booking_id:id,p_provider:clean(provider)||'official',p_external_url:clean(url),p_provider_reference:clean(providerReference)||null,p_metadata:metadata||{}});
    if(error)throw new Error(error.message||'Weiterleitung konnte nicht protokolliert werden.');
    window.dispatchEvent(new CustomEvent('luvia:booking-changed',{detail:{bookingId:id,action:'forwarded',result:data}}));
    return data;
  }

  async function planRoute(id,excludedChannels=[]){
    await init();
    const {data,error}=await client.rpc('luvia_booking_plan_route',{
      p_booking_id:id,
      p_excluded_channels:Array.isArray(excludedChannels)?excludedChannels:[]
    });
    if(error)throw error;
    return data;
  }


  async function updateContact(id,email){
    await init();
    const booking=await get(id);
    if(!booking)throw new Error('Buchung wurde nicht gefunden.');
    const value=clean(email).toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw new Error('Bitte eine gültige E-Mail-Adresse eingeben.');
    const contact={...(booking.contact||{}),email:value};
    const {data,error}=await client.from('bookings').update({contact,channel:'email',metadata:{...(booking.metadata||{}),manualContact:{addedAt:new Date().toISOString(),source:'luvia_ui'}}}).eq('id',id).select('*').single();
    if(error)throw error;
    window.dispatchEvent(new CustomEvent('luvia:booking-changed',{detail:{booking:data,action:'contact-updated'}}));
    return data;
  }


  async function recordPlaceHandoff(place={},route={}){
    await init();
    const tripId=activeTripId();
    if(!tripId||!route?.value)return null;
    const args={
      p_trip_id:tripId,
      p_place_type:String(place.type||place.primaryType||place.primary_type||'restaurant').toLowerCase(),
      p_provider_place_id:providerId(place)||null,
      p_venue_name:clean(place.name)||null,
      p_provider:clean(route.provider)||'official',
      p_destination_url:clean(route.value),
      p_metadata:{source:clean(route.source)||'places_reserve_action',resolverReason:route.reason||null,resolverVersion:route.resolverVersion||null,bookingRequest:route.request||null,...(route.metadata&&typeof route.metadata==='object'?route.metadata:{})}
    };
    const primary=await client.rpc('luvia_booking_prepare_monetized_handoff',args);
    if(!primary.error)return primary.data;
    const missingRpc=String(primary.error?.message||primary.error||'').toLowerCase().includes('luvia_booking_prepare_monetized_handoff');
    if(!missingRpc)throw primary.error;
    // Safe deploy-order compatibility: old handoff RPC remains the fallback until v4.69.0 DB migration is live.
    const legacy=await client.rpc('luvia_booking_record_place_handoff',args);
    if(legacy.error)throw legacy.error;
    return {handoffId:legacy.data,legacyFallback:true,bookingStatusChanged:false};
  }

  async function trackExternalHandoffForPlace({place={},route={},startAt=null,endAt=null,partySize=1,tripId=null,metadata={}}={}){
    await init();
    const target=safeHttps(route?.value||route?.url);
    if(!target)throw Object.assign(new Error('Der externe Buchungsweg ist nicht als sichere HTTPS-Adresse belegt.'),{code:'BOOKING_EXTERNAL_URL_INVALID'});
    const resolvedTripId=tripId||activeTripId();
    if(!resolvedTripId)throw new Error('Keine aktive Reise verfügbar.');
    const placeReference=providerId(place);
    const provider=clean(route.provider)||'official';
    const quoteFingerprint=clean(metadata?.selectedStayOffer?.quoteFingerprint||metadata?.quoteFingerprint),now=Date.now();
    let booking=null;
    try{
      const existing=await listForTrip(resolvedTripId);
      booking=existing.find(row=>{
        const rowPlace=clean(row?.request?.providerPlaceId||row?.request?.provider_place_id);
        const rowUrl=safeHttps(row?.metadata?.handoff?.url||row?.metadata?.handoff?.externalUrl||row?.metadata?.handoff?.external_url||row?.request?.reservationUrl||row?.request?.reservation_url);
        const created=Date.parse(row?.created_at||row?.createdAt||'');
        const rowQuoteFingerprint=clean(row?.metadata?.selectedStayOffer?.quoteFingerprint||row?.metadata?.quoteFingerprint),sameQuote=!quoteFingerprint||rowQuoteFingerprint===quoteFingerprint;
        return rowPlace&&rowPlace===placeReference&&rowUrl===target&&sameQuote&&Number.isFinite(created)&&(now-created)<7200000&&!['cancelled','declined','completed'].includes(clean(row?.status).toLowerCase());
      })||null;
    }catch(error){console.warn('[Luvia Booking] bestehender externer Vorgang konnte nicht dedupliziert werden.',error)}
    if(!booking){
      booking=await createForPlace({tripId:resolvedTripId,place,placeType:place.type||place.primaryType,startAt,endAt,partySize,channel:route.channel==='affiliate'?'affiliate':'external_link',provider,reservationUrl:target,route:{...route,value:target},skipRouteResolution:true,metadata:{externalHandoff:{trackedAt:new Date().toISOString(),provider,url:target,source:clean(route.source)||'places_owner_flow'},...(metadata&&typeof metadata==='object'?metadata:{})}});
      const handoff=await recordHandoff(booking.id,{provider,url:target,providerReference:route.providerReference||null,metadata:{source:clean(route.source)||'places_owner_flow',resolverReason:route.reason||null,resolverVersion:route.resolverVersion||null,...(metadata&&typeof metadata==='object'?metadata:{})}});
      booking=await get(booking.id)||booking;
      try{await recordPlaceHandoff(place,{...route,value:target})}catch(error){console.warn('[Luvia Booking] Handoff-Attribution konnte nicht zusätzlich protokolliert werden.',error)}
      return {ok:true,tracked:true,deduplicated:false,bookingId:booking.id,booking,handoff,url:target,provider};
    }
    try{await recordPlaceHandoff(place,{...route,value:target})}catch(error){console.warn('[Luvia Booking] wiederholte Handoff-Attribution konnte nicht protokolliert werden.',error)}
    return {ok:true,tracked:true,deduplicated:true,bookingId:booking.id,booking,url:target,provider};
  }

  async function linkRecentPlaceHandoff(bookingId,place={}){
    await init();
    if(!bookingId)return {linked:false,reason:'BOOKING_REQUIRED'};
    const {data,error}=await client.rpc('luvia_booking_link_recent_place_handoff',{
      p_booking_id:bookingId,
      p_provider_place_id:providerId(place)||null,
      p_venue_name:clean(place.name)||null,
      p_max_age_minutes:120
    });
    if(error){console.warn('[Luvia Booking] Handoff-Korrelation konnte nicht verknüpft werden.',error);return {linked:false,reason:'RPC_ERROR'};}
    return data||{linked:false};
  }

  async function correlationJourney(id){
    await init();
    const {data,error}=await client.from('booking_correlation_conversion_summary').select('*').eq('booking_id',id).order('handoff_correlated_at',{ascending:false});
    if(error)throw error;return data||[];
  }

  async function conversionReports(id){
    await init();
    const {data,error}=await client.from('booking_conversion_reports').select('*').eq('booking_id',id).order('occurred_at',{ascending:false});
    if(error)throw error;return data||[];
  }

  async function reconcileTripReturns(tripId=activeTripId()){
    await init();
    if(!tripId)return {ok:false,reason:'TRIP_REQUIRED'};
    if(!window.LuviaBookingReturnOrchestration?.reconcileTrip)return {ok:false,reason:'ORCHESTRATOR_UNAVAILABLE'};
    try{return await window.LuviaBookingReturnOrchestration.reconcileTrip(tripId,{limit:50,source:'bookings_view'});}
    catch(error){console.warn('[Luvia Booking] Provider-Rückkanal konnte noch nicht abgeglichen werden.',error);return {ok:false,reason:'RECONCILIATION_DEFERRED'};}
  }

  async function returnOrchestrationSummary(id){
    await init();
    return window.LuviaBookingReturnOrchestration?.summary?.(id)||null;
  }

  async function monetizationProfiles(){
    await init();
    if(window.LuviaBookingMonetization?.profiles)return window.LuviaBookingMonetization.profiles();
    const {data,error}=await client.from('booking_monetization_provider_readiness_v1').select('*').order('provider_id');
    if(error)throw error;return data||[];
  }

  async function monetizationForBooking(id){
    await init();
    if(window.LuviaBookingMonetization?.booking)return window.LuviaBookingMonetization.booking(id);
    const {data,error}=await client.from('booking_monetization_runtime_v1').select('*').eq('booking_id',id).order('created_at',{ascending:false});
    if(error)throw error;return data||[];
  }

  async function orchestrationReadiness(){
    await init();
    const {data,error}=await client.from('booking_provider_orchestration_readiness_v1').select('*').order('provider_id');
    if(error)throw error;
    return data||[];
  }

  async function providerRuntimeHealth(){
    await init();
    const {data,error}=await client.from('booking_provider_runtime_health_v1').select('*').order('provider_id');
    if(error)throw error;
    return data||[];
  }

  async function routeDecisionDiagnostics({limit=25}={}){
    await init();
    const safeLimit=Math.max(1,Math.min(100,Number(limit)||25));
    const {data,error}=await client.from('booking_route_decision_runtime_v1').select('*').order('created_at',{ascending:false}).limit(safeLimit);
    if(error)throw error;
    return data||[];
  }

  async function routeFailoverDiagnostics({limit=25}={}){
    await init();
    const safeLimit=Math.max(1,Math.min(100,Number(limit)||25));
    const {data,error}=await client.from('booking_route_failover_runtime_v1').select('*').order('created_at',{ascending:false}).limit(safeLimit);
    if(error)throw error;
    return data||[];
  }

  async function replayRouteDecision(decisionId){
    await init();
    if(!decisionId)throw new Error('Decision-ID fehlt.');
    const {data,error}=await client.rpc('luvia_booking_replay_route_decision',{p_decision_id:decisionId});
    if(error)throw error;
    return data;
  }

  async function resolvePlaceRoute(place={}){
    await init();
    const reservationUrl=clean(place.reservationUrl||place.reservation_url||place.bookingUrl||place.booking_url||place.ticketUrl||place.ticket_url);
    const providerPlaceId=providerId(place);
    const explicitReservationSource=clean(place.reservationSource||place.reservation_source||place.bookingRouteSource||place.booking_route_source);
    const inferredReservationSource=!explicitReservationSource&&providerPlaceId&&/^https:\/\/[^/]*google\.[^/]+\/maps\/reserve\//i.test(reservationUrl)?'google_place_details':'unknown';
    const payload={
      name:clean(place.name),
      placeType:String(place.type||place.primaryType||place.primary_type||'').toLowerCase(),
      website:clean(place.website||place.websiteUri||place.website_uri),
      reservationUrl,
      reservationSource:explicitReservationSource||inferredReservationSource,
      providerPlaceId,
      address:clean(place.formattedAddress||place.address||place.shortAddress)
    };
    if(!payload.name)throw new Error('Ort konnte nicht eindeutig bestimmt werden.');
    const {data,error}=await client.functions.invoke('booking-route-resolve',{body:{place:payload}});
    if(error)throw await functionError(error,'Buchungsweg konnte derzeit nicht geprüft werden.');
    if(data?.error)throw new Error(data.details||data.error);
    return data||{resolved:false};
  }

  async function resolveRoute(id){
    await init();
    const {data,error}=await client.functions.invoke('booking-route-resolve',{body:{bookingId:id}});
    if(error)throw await functionError(error,'Automatische Buchungskanal-Suche ist derzeit nicht verfügbar.');
    if(data?.error)throw new Error(data.details||data.error);
    window.dispatchEvent(new CustomEvent('luvia:booking-changed',{detail:{bookingId:id,action:'route-resolved',result:data}}));
    return data;
  }

  async function resolveContact(id){
    await init();
    if(!id)throw new Error('Booking-ID fehlt.');
    const {data,error}=await client.functions.invoke('booking-contact-resolve',{body:{bookingId:id}});
    if(error)throw await functionError(error,'Sicherer Anbieter-Kontakt konnte derzeit nicht geprüft werden.');
    if(data?.error)throw new Error(data.details||data.error);
    window.dispatchEvent(new CustomEvent('luvia:booking-changed',{detail:{bookingId:id,action:'contact-resolved',result:data}}));
    return data||{resolved:false};
  }

  async function messages(id){
    await init();
    if(!id)return [];
    return repository.messages(id);
  }

  async function messageIntelligence(id){
    await init();
    if(!id)return [];
    const {data,error}=await client.from('booking_message_intelligence').select('*').eq('booking_id',id).order('classified_at',{ascending:true});
    if(error)throw error;
    return data||[];
  }

  async function emailThread(id){
    await init();
    if(!id)return null;
    const {data,error}=await client.from('booking_email_threads').select('*').eq('booking_id',id).maybeSingle();
    if(error)throw error;
    return data||null;
  }

  async function conversation(id){
    await init();
    if(!id)throw new Error('Booking-ID fehlt.');
    const [booking,messageRows,intelligence,thread]=await Promise.all([get(id),messages(id),messageIntelligence(id),emailThread(id)]);
    if(!booking)throw new Error('Buchung wurde nicht gefunden.');
    return {booking,messages:messageRows,intelligence,thread,source:'booking-core',ownsMessageTruth:false};
  }


  async function reply(id,{bodyText,action=null,intelligenceId=null,testRecipient=null,idempotencyKey=null}={}){
    await init();
    const text=clean(bodyText);
    if(!id)throw new Error('Booking-ID fehlt.');
    if(!text)throw new Error('Bitte eine Nachricht eingeben.');
    const result=await client.functions.invoke('booking-email-reply',{body:{bookingId:id,bodyText:text,action:clean(action)||undefined,intelligenceId:clean(intelligenceId)||undefined,testRecipient:testRecipient||undefined,idempotencyKey:idempotencyKey||undefined,userApproved:true}});
    if(result.error)throw await functionError(result.error,'Antwort konnte nicht versendet werden.');
    const data=result.data||{};
    if(data?.error&&!data?.expected)throw new Error(data.details||data.error);
    if(data?.expected)throw new Error(data.error||'Antwort konnte noch nicht versendet werden.');
    window.dispatchEvent(new CustomEvent('luvia:booking-changed',{detail:{bookingId:id,action:'thread-reply-sent',result:data}}));
    return data;
  }

  async function resolveIntelligence(intelligenceId,action,payload={}){
    await init();
    if(!intelligenceId)throw new Error('Intelligence-ID fehlt.');
    const {data,error}=await client.rpc('luvia_booking_resolve_message_intelligence',{p_intelligence_id:intelligenceId,p_action:clean(action),p_payload:payload||{}});
    if(error)throw new Error(error.message||'Booking Intelligence konnte nicht abgeschlossen werden.');
    window.dispatchEvent(new CustomEvent('luvia:booking-changed',{detail:{action:'intelligence-resolved',intelligenceId,result:data}}));
    return data;
  }

  function actionReplyText(intelligence={},action,customText=''){
    const extracted=intelligence?.extracted||{};
    const time=clean(extracted.proposedTime||extracted.proposed_time);
    if(action==='accept_alternative')return `Vielen Dank.${time?` ${time} Uhr passt für uns.`:' Die vorgeschlagene Alternative passt für uns.'} Bitte bestätigen Sie die Reservierung.`;
    if(action==='decline_alternative')return 'Vielen Dank für die Alternative. Diese passt uns leider nicht. Gibt es eine andere verfügbare Möglichkeit?';
    if(action==='answer')return clean(customText);
    return clean(customText);
  }

  async function performIntelligenceAction(id,{intelligence,action,bodyText='' }={}){
    const intel=intelligence||{};
    const intelligenceId=intel.id||intel.intelligence_id;
    if(!intelligenceId)throw new Error('Intelligence-Aktion konnte nicht zugeordnet werden.');
    if(action==='mark_reviewed'||action==='dismiss')return resolveIntelligence(intelligenceId,action,{});
    const text=actionReplyText(intel,action,bodyText);
    if(!text)throw new Error('Für diese Aktion ist eine Antwort erforderlich.');
    return reply(id,{bodyText:text,action,intelligenceId});
  }

  async function sendEmail(id,{requesterName,note,occasion,testRecipient,idempotencyKey}={}){
    await init();
    const booking=await get(id);
    if(!booking)throw new Error('Buchung wurde nicht gefunden.');
    if(!booking.contact?.email)throw new Error('Für diesen Ort ist noch keine bestätigte E-Mail-Adresse verfügbar.');
    let data;
    if(window.LuviaBookingEmailV2?.send){data=await window.LuviaBookingEmailV2.send({bookingId:id,requesterName,note,occasion,testRecipient,idempotencyKey});}
    else{const legacyNote=clean(occasion)&&clean(occasion)!=='Kein besonderer Anlass'?[`Anlass: ${clean(occasion)}`,clean(note)].filter(Boolean).join('\n'):clean(note);const result=await client.functions.invoke('booking-email-send',{body:{bookingId:id,userApproved:true,requesterName:requesterName||undefined,note:legacyNote||undefined,occasion:occasion||undefined,testRecipient:testRecipient||undefined,idempotencyKey:idempotencyKey||undefined}});if(result.error)throw await functionError(result.error,'Versand der Buchungsanfrage ist fehlgeschlagen.');data=result.data;}
    if(data?.error&&!data?.expected)throw new Error(data.details||data.error);
    window.dispatchEvent(new CustomEvent('luvia:booking-changed',{detail:{bookingId:id,action:'email-sent',result:data}}));
    return data;
  }

  async function bookingTimeline(id){
    await init();
    if(!id)throw new Error('Booking-ID fehlt.');
    const {data,error}=await client.rpc('luvia_booking_timeline_v1',{p_booking_id:id});
    if(error)throw new Error(error.message||'Booking-Timeline konnte nicht geladen werden.');
    const payload=data||{bookingId:id,items:[],source:'booking-core',ownsBookingTruth:false};
    const items=Array.isArray(payload.items)?payload.items:[];
    const normalized=[];
    for(const item of items){
      const title=clean(item?.title||item?.label||item?.event||'');
      const at=clean(item?.at||item?.occurred_at||item?.created_at||item?.timestamp);
      const minute=at?at.slice(0,16):'';
      const key=`${title.toLowerCase()}|${minute}`;
      const previous=normalized[normalized.length-1];
      if(previous&&previous.__key===key)continue;
      // Transport noise directly adjacent to a domain-level modify/cancel event is collapsed.
      if(previous&&/^(nachricht gesendet|nachricht zugestellt)$/i.test(title)&&/(änderung|stornierung).*(angefragt|verarbeitet)/i.test(clean(previous.title||previous.label||''))&&minute===previous.__minute)continue;
      normalized.push({...item,__key:key,__minute:minute});
    }
    return {...payload,items:normalized.map(({__key,__minute,...item})=>item),deduplicated:true,source:'booking-core',ownsBookingTruth:false};
  }

  async function conversationPreferences(bookingIds=[]){
    await init();
    const ids=[...new Set((bookingIds||[]).map(clean).filter(Boolean))];
    if(!ids.length)return [];
    const {data,error}=await client.from('booking_conversation_preferences').select('*').in('booking_id',ids);
    if(error)throw error;
    return data||[];
  }

  async function setConversationPreference(id,action,at=null){
    await init();
    if(!id)throw new Error('Booking-ID fehlt.');
    const {data,error}=await client.rpc('luvia_booking_conversation_preference',{p_booking_id:id,p_action:clean(action),p_at:at||new Date().toISOString()});
    if(error)throw new Error(error.message||'Conversation-Einstellung konnte nicht gespeichert werden.');
    window.dispatchEvent(new CustomEvent('luvia:booking-conversation-preference',{detail:{bookingId:id,action,result:data}}));
    return data;
  }

  const THREAD_MUTATION_REQUEST_STATES=new Set(['ready','forwarded','requested','awaiting_reply','alternative_proposed','needs_action','requires_action','review_required','confirmed']);
  function mutationErrorCode(resultOrError){return clean(resultOrError?.code||resultOrError?.error||resultOrError?.message||resultOrError).toUpperCase();}
  function mutationFallbackable(resultOrError){
    const code=mutationErrorCode(resultOrError);
    return ['PROVIDER_RESERVATION_REFERENCE_REQUIRED','RESERVATION_MODIFY_NOT_SUPPORTED','RESERVATION_CANCEL_NOT_SUPPORTED','PARTNER_REQUIRED','CONNECTION_NOT_READY','RESERVATION_MODIFY_TRANSPORT_NOT_ACTIVE','RESERVATION_CANCEL_TRANSPORT_NOT_ACTIVE','LIVE_PROBE_NOT_HEALTHY','PROVIDER_NOT_FOUND','RESERVATION_MODIFY_ADAPTER_NOT_IMPLEMENTED','RESERVATION_CANCEL_ADAPTER_NOT_IMPLEMENTED','BOOKING_STATE_NOT_MODIFIABLE','BOOKING_STATE_NOT_CANCELLABLE'].some(x=>code.includes(x));
  }
  function bookingAllowsThreadMutationRequest(status){return THREAD_MUTATION_REQUEST_STATES.has(clean(status).toLowerCase());}
  async function assertThreadFallbackAllowed(id,resultOrError,action){
    const code=mutationErrorCode(resultOrError);
    if(!code.includes('BOOKING_STATE_NOT_'))return;
    const status=clean(resultOrError?.status||(await get(id))?.status).toLowerCase();
    if(bookingAllowsThreadMutationRequest(status))return;
    const err=new Error(action==='modify'?'Diese Buchung kann in ihrem aktuellen Zustand nicht mehr geändert werden.':'Diese Buchung kann in ihrem aktuellen Zustand nicht mehr storniert werden.');
    err.code=code||'BOOKING_STATE_NOT_MUTABLE';
    err.bookingStatus=status||null;
    throw err;
  }

  function modifyReplyText(input={}){
    const parts=[];
    if(clean(input.date))parts.push(`Datum auf ${clean(input.date)}`);
    if(clean(input.time))parts.push(`Uhrzeit auf ${clean(input.time).slice(0,5)} Uhr`);
    if(input.partySize!=null&&input.partySize!=='')parts.push(`Personenzahl auf ${Number(input.partySize)}`);
    const notes=clean(input.notes);
    return `Guten Tag, wir möchten unsere bestehende Reservierung gerne ändern: ${parts.join(', ')}.${notes?` Zusätzlich: ${notes}.`:''} Bitte bestätigen Sie uns die Änderung. Vielen Dank.`;
  }

  function cancelReplyText(input={}){
    const reason=clean(input.reason);
    return `Guten Tag, wir möchten unsere bestehende Reservierung stornieren.${reason?` Grund: ${reason}.`:''} Bitte bestätigen Sie uns die Stornierung. Vielen Dank.`;
  }

  async function prepareMutationEmailFallback(id,action){
    const existingThread=await emailThread(id);
    if(existingThread)return {thread:existingThread,threadBootstrapRequired:false,contactDiscovery:null,contactVerification:'existing_thread'};
    let booking=await get(id);
    let email=clean(booking?.contact?.email).toLowerCase();
    if(email){
      const {data:verified,error:verificationError}=await client.rpc('luvia_booking_email_verified_candidate',{p_booking_id:id,p_email:email});
      if(!verificationError&&verified?.ok)return {thread:null,threadBootstrapRequired:true,contactEmail:email,contactDiscovery:null,contactVerification:'verified_candidate',candidateId:verified.candidateId||null,action};
    }
    let contactDiscovery=null;
    try{contactDiscovery=await resolveContact(id);}catch(error){
      const err=new Error('Ein sicherer Anbieter-Kontakt konnte für diese Anfrage nicht verifiziert werden.');
      err.code='MUTATION_CONTACT_DISCOVERY_FAILED';
      err.cause=error;
      throw err;
    }
    booking=await get(id);email=clean(booking?.contact?.email).toLowerCase();
    if(!email){
      const err=new Error('Für diese Buchung ist aktuell kein sicher verifizierter Anbieter-Kontakt verfügbar.');
      err.code='MUTATION_CONTACT_UNAVAILABLE';
      err.discovery=contactDiscovery;
      throw err;
    }
    const {data:verified,error:verificationError}=await client.rpc('luvia_booking_email_verified_candidate',{p_booking_id:id,p_email:email});
    if(verificationError||!verified?.ok){
      const err=new Error('Der gefundene Anbieter-Kontakt ist noch nicht sicher für den Versand freigegeben.');
      err.code='EMAIL_RECIPIENT_NOT_VERIFIED';
      err.discovery=contactDiscovery;
      throw err;
    }
    return {thread:null,threadBootstrapRequired:true,contactEmail:email,contactDiscovery,contactVerification:'resolver_verified_candidate',candidateId:verified.candidateId||null,action};
  }

  async function recordMutationFallback(id,action,messageResult,payload={}){
    const messageId=messageResult?.messageId||messageResult?.message_id||messageResult?.message?.id||null;
    const {data,error}=await client.rpc('luvia_booking_record_mutation_fallback',{p_booking_id:id,p_action:action,p_message_id:messageId,p_payload:payload||{}});
    if(error)throw new Error(error.message||'Fallback-Mutation konnte nicht protokolliert werden.');
    const mutationThreadBootstrap=Boolean(messageResult?.threadBootstrapped||messageResult?.mutationThreadBootstrap);
    if(mutationThreadBootstrap)return {...(data||{}),messageId,transport:'email_thread_bootstrap',threadBootstrapped:Boolean(messageResult?.threadBootstrapped),mutationThreadBootstrap:true};
    return {...(data||{}),messageId,transport:'email_thread',threadBootstrapped:false,mutationThreadBootstrap:false};
  }

  async function modifyBooking(id,input={}){
    await init();
    if(!id)throw new Error('Booking-ID fehlt.');
    const mutation=window.LuviaBookingReservationMutation;
    if(mutation?.modify){
      try{
        const result=await mutation.modify({bookingId:id,...input});
        if(result?.ok)return {...result,transport:'provider_api'};
        if(!mutationFallbackable(result))throw new Error(result?.error||'Änderung konnte nicht gestartet werden.');
        await assertThreadFallbackAllowed(id,result,'modify');
      }catch(error){if(!mutationFallbackable(error))throw error;await assertThreadFallbackAllowed(id,error,'modify');}
    }
    const fallback=await prepareMutationEmailFallback(id,'modify');
    const text=modifyReplyText(input);
    const messageResult=await reply(id,{bodyText:text,action:'modify'});
    const audit=await recordMutationFallback(id,'modify',messageResult,{requestedDate:clean(input.date)||null,requestedTime:clean(input.time)||null,partySize:input.partySize==null?null:Number(input.partySize),notes:clean(input.notes)||null,threadBootstrapped:Boolean(messageResult?.threadBootstrapped||fallback.threadBootstrapRequired),contactDiscoveryReason:fallback.contactDiscovery?.reason||fallback.contactDiscovery?.bridgeReason||null});
    window.dispatchEvent(new CustomEvent('luvia:booking-changed',{detail:{bookingId:id,action:'modify-requested',result:audit}}));
    return {ok:true,action:'modify',bookingId:id,mutationLifecycleState:'pending',awaitingProviderReply:true,providerOutcomeKnown:false,reconciliationRequired:false,bookingStatusChanged:false,...audit};
  }

  async function cancelBooking(id,input={}){
    await init();
    if(!id)throw new Error('Booking-ID fehlt.');
    const mutation=window.LuviaBookingReservationMutation;
    if(mutation?.cancel){
      try{
        const result=await mutation.cancel({bookingId:id,...input});
        if(result?.ok)return {...result,transport:'provider_api'};
        if(!mutationFallbackable(result))throw new Error(result?.error||'Stornierung konnte nicht gestartet werden.');
        await assertThreadFallbackAllowed(id,result,'cancel');
      }catch(error){if(!mutationFallbackable(error))throw error;await assertThreadFallbackAllowed(id,error,'cancel');}
    }
    const fallback=await prepareMutationEmailFallback(id,'cancel');
    const messageResult=await reply(id,{bodyText:cancelReplyText(input),action:'cancel'});
    const audit=await recordMutationFallback(id,'cancel',messageResult,{reason:clean(input.reason)||null,threadBootstrapped:Boolean(messageResult?.threadBootstrapped||fallback.threadBootstrapRequired),contactDiscoveryReason:fallback.contactDiscovery?.reason||fallback.contactDiscovery?.bridgeReason||null});
    window.dispatchEvent(new CustomEvent('luvia:booking-changed',{detail:{bookingId:id,action:'cancel-requested',result:audit}}));
    return {ok:true,action:'cancel',bookingId:id,mutationLifecycleState:'pending',awaitingProviderReply:true,providerOutcomeKnown:false,reconciliationRequired:false,bookingStatusChanged:false,...audit};
  }

  async function cancel(id){
    console.warn('[Luvia Booking] cancel() legacy shortcut is deprecated. Use cancelBooking() so final cancellation is evidence-driven.');
    return cancelBooking(id,{});
  }

  const api=Object.freeze({
    version:VERSION,init,createForPlace,submitReservation,listForTrip,get,transition,providerCapabilities,statusHistory,statusSignals,attributionJourney,statusAttributionSummary,correlationJourney,conversionReports,monetizationProfiles,monetizationForBooking,orchestrationReadiness,providerRuntimeHealth,routeDecisionDiagnostics,routeFailoverDiagnostics,replayRouteDecision,reconcileTripReturns,returnOrchestrationSummary,linkRecentPlaceHandoff,recordHandoff,recordPlaceHandoff,trackExternalHandoffForPlace,planRoute,resolvePlaceRoute,resolveRoute,resolveContact,updateContact,messages,messageIntelligence,emailThread,conversation,sendEmail,reply,resolveIntelligence,performIntelligenceAction,actionReplyText,bookingTimeline,conversationPreferences,setConversationPreference,modifyBooking,cancelBooking,cancel,mapType,
    diagnostics:()=>({version:VERSION,initialized,activeTripId:activeTripId(),coreVersion:window.LuviaBookingCore?.version||null})
  });
  window.LuviaBooking=api;
  window.addEventListener('luvia:supabase-client-ready',()=>init().catch(console.warn));
})();
