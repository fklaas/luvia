(() => {
  'use strict';
  const VERSION='1.16.1';
  let client=null, repository=null, initialized=false, initPromise=null;

  const mapType=type=>({
    restaurant:'restaurant',
    accommodation:'hotel',
    attraction:'activity',
    mobility:'transport'
  }[String(type||'').toLowerCase()]||'other');

  const activeTrip=()=>window.LuviaTripStore?.snapshot?.()?.activeTrip||null;
  const activeTripId=()=>activeTrip()?.id||activeTrip()?.tripId||null;
  const clean=v=>String(v??'').trim();

  function providerId(place={}){
    return clean(place.providerPlaceId||place.provider_place_id||place.googlePlaceId||place.google_place_id||place.name||place.id);
  }

  function internalUuid(value){
    const v=clean(value);
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)?v:null;
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
    const row=await window.LuviaBookingCore.create({
      tripId,
      tripPlaceId:internalUuid(input.tripPlaceId||place.tripPlaceId||place.trip_place_id),
      placeId:internalUuid(input.placeId||place.internalPlaceId||place.place_id),
      type:mapType(placeType),
      status:'draft',
      channel:contactEmail?'email':'manual',
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
        note:clean(input.note),
        providerPlaceId:providerId(place),
        sourcePlaceType:placeType,
        source:'luvia_places',
        website:website||null,
        reservationUrl:clean(place.reservationUrl||place.reservation_url||place.bookingUrl||place.booking_url)||null
      },
      metadata:{
        integrationVersion:VERSION,
        destination:activeTrip()?.destination||null
      }
    });
    let ready=await window.LuviaBookingCore.transition(row.id,'ready',{metadata:{createdFrom:'places'}});
    try{await linkRecentPlaceHandoff(ready.id,place)}catch(error){console.warn('[Luvia Booking] Korrelation des vorherigen Handoffs übersprungen.',error)}
    window.dispatchEvent(new CustomEvent('luvia:booking-changed',{detail:{booking:ready,action:'created'}}));
    if(!ready?.contact?.email){
      try{await resolveRoute(ready.id);ready=await get(ready.id)||ready}catch(error){console.warn('[Luvia Booking] automatische Buchungskanal-Ermittlung nicht verfügbar',error)}
    }
    return ready;
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
      p_metadata:{source:'places_reserve_action',resolverReason:route.reason||null,resolverVersion:route.resolverVersion||null}
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
    const payload={
      name:clean(place.name),
      placeType:String(place.type||place.primaryType||place.primary_type||'').toLowerCase(),
      website:clean(place.website||place.websiteUri||place.website_uri),
      reservationUrl:clean(place.reservationUrl||place.reservation_url||place.bookingUrl||place.booking_url),
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

  async function resolveContact(id){return resolveRoute(id);}

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

  async function sendEmail(id,{requesterName,note,testRecipient,idempotencyKey}={}){
    await init();
    const booking=await get(id);
    if(!booking)throw new Error('Buchung wurde nicht gefunden.');
    if(!booking.contact?.email)throw new Error('Für diesen Ort ist noch keine bestätigte E-Mail-Adresse verfügbar.');
    let data;
    if(window.LuviaBookingEmailV2?.send){data=await window.LuviaBookingEmailV2.send({bookingId:id,requesterName,note,testRecipient,idempotencyKey});}
    else{const result=await client.functions.invoke('booking-email-send',{body:{bookingId:id,userApproved:true,requesterName:requesterName||undefined,note:note||undefined,testRecipient:testRecipient||undefined,idempotencyKey:idempotencyKey||undefined}});if(result.error)throw await functionError(result.error,'Versand der Buchungsanfrage ist fehlgeschlagen.');data=result.data;}
    if(data?.error&&!data?.expected)throw new Error(data.details||data.error);
    window.dispatchEvent(new CustomEvent('luvia:booking-changed',{detail:{bookingId:id,action:'email-sent',result:data}}));
    return data;
  }

  async function cancel(id){
    return transition(id,'cancelled',{metadata:{cancelledFrom:'luvia_ui'}});
  }

  const api=Object.freeze({
    version:VERSION,init,createForPlace,listForTrip,get,transition,providerCapabilities,statusHistory,statusSignals,attributionJourney,statusAttributionSummary,correlationJourney,conversionReports,monetizationProfiles,monetizationForBooking,orchestrationReadiness,providerRuntimeHealth,routeDecisionDiagnostics,routeFailoverDiagnostics,replayRouteDecision,reconcileTripReturns,returnOrchestrationSummary,linkRecentPlaceHandoff,recordHandoff,recordPlaceHandoff,planRoute,resolvePlaceRoute,resolveRoute,resolveContact,updateContact,messages,messageIntelligence,emailThread,conversation,sendEmail,reply,resolveIntelligence,performIntelligenceAction,actionReplyText,cancel,mapType,
    diagnostics:()=>({version:VERSION,initialized,activeTripId:activeTripId(),coreVersion:window.LuviaBookingCore?.version||null})
  });
  window.LuviaBooking=api;
  window.addEventListener('luvia:supabase-client-ready',()=>init().catch(console.warn));
})();