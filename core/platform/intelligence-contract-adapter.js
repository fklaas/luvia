(() => {
  'use strict';

  const CONTRACT_ID = 'intelligence.v1';
  const VERSION = '1';
  const RUNTIME_VERSION = '1.18.1-duration-scaled-trip-place-paging';
  const root = globalThis;

  const EVENTS = Object.freeze([
    'ai.changed',
    'ai.proposal.changed',
    'ai.memory.changed'
  ]);

  function contractError(code, message, extra = {}) {
    const error = new Error(message);
    error.code = code;
    Object.assign(error, extra);
    return error;
  }

  function providerUnavailable(provider) {
    throw contractError(
      'INTELLIGENCE_CONTRACT_PROVIDER_UNAVAILABLE',
      `Intelligence provider unavailable: ${provider}`,
      { provider }
    );
  }

  function domainCore() {
    return root.LuviaIntelligenceDomainContractCoreV1 ||
      providerUnavailable('LuviaIntelligenceDomainContractCoreV1');
  }

  function runtime() {
    return root.LuviaAI || providerUnavailable('LuviaAI');
  }

  function immutable(value) {
    return domainCore().immutable(value);
  }

  function getCapabilities() {
    return domainCore().listCapabilities();
  }

  function getCapability(capabilityId) {
    return domainCore().getCapability(capabilityId);
  }

  function getDomains() {
    return domainCore().listDomains();
  }

  function getTools() {
    return domainCore().listTools();
  }

  function getModelTiers() {
    return domainCore().listModelTiers();
  }

  function getPolicy() {
    return domainCore().policySnapshot();
  }

  function preferenceResolver() {
    return root.LuviaTripPreferenceResolutionCoreV1 ||
      providerUnavailable('LuviaTripPreferenceResolutionCoreV1');
  }

  function resolveTripPreferences(input = {}) {
    return immutable(preferenceResolver().resolve(input));
  }

  function rankPlaceCandidates(input = {}) {
    return immutable(preferenceResolver().rankPlaces(input));
  }

  function composeDayGuidance(input = {}) {
    return immutable(preferenceResolver().composeDayGuidance(input));
  }

  function calendarRequestFromModel(input = {}, data = {}) {
    const constraints=[...(data.hardConstraints||[]),...(data.softPreferences||[]),...(data.goals||[]).flatMap(goal=>[...(goal.hardConstraints||[]),...(goal.softPreferences||[])])];
    const norm=value=>String(value||'').trim().toLowerCase().replace(/[ _-]/g,''),row=key=>constraints.find(item=>norm(item?.key)===key),required=['true','yes','ja','required','erforderlich'].includes(String(row('schoolholidayrequired')?.value||'').trim().toLowerCase()),region=String(row('schoolholidayregion')?.value||'').trim();
    if(!required||!region)return null;
    const valid=value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value||''))&&!Number.isNaN(Date.parse(`${value}T12:00:00Z`)),start=valid(input.startDate)?String(input.startDate):new Date().toISOString().slice(0,10),end=valid(input.endDate)?String(input.endDate):new Date(Date.parse(`${start}T12:00:00Z`)+730*86400000).toISOString().slice(0,10),startYear=Number(start.slice(0,4)),endYear=Math.min(startYear+2,Number(end.slice(0,4))||startYear+2);
    return {schoolRegion:region,countryIsoCode:String(input.schoolCountryCode||input.homeCountryCode||'').trim().toUpperCase(),validFrom:`${startYear}-01-01`,validTo:`${endYear}-12-31`,languageIsoCode:String(input.locale||'de-DE').slice(0,2).toUpperCase()};
  }

  async function getTravelCalendarEvidence(input = {}) {
    const invoke=root.LuviaOpenAIProvider?.invoke;if(typeof invoke!=='function')providerUnavailable('LuviaOpenAIProvider.invoke');
    const response=await invoke('calendar.travel-evidence',input,{timeoutMs:12000}),value=response?.data||response?.result||response;
    if(response?.ok===false||value?.owner!=='intelligence'||value?.contractId!=='intelligence.v1'||value?.kind!=='travel-calendar-evidence'||value?.status!=='verified'||!Array.isArray(value?.evidence))throw contractError('CALENDAR_EVIDENCE_INVALID','Die Kalenderquelle konnte nicht verlässlich bestätigt werden.');
    return immutable(value);
  }

  async function interpretTripBrief(input = {}) {
    const request={
      surface:'trip-composer',userGoal:String(input.requestBrief||'').slice(0,1200),
      destination:input.destination?.name||'',startDate:input.startDate||null,endDate:input.endDate||null,
      scheduleMode:input.scheduleMode||'fixed',flexibility:input.flexibility||'',destinationTimeZone:input.destination?.timezone||'',
      globalPreferences:input.profilePreferences||{},tripPreferences:input.tripPreferences||{},participantPlan:input.participantPlan||'',
      calendarEvidence:Array.isArray(input.calendarEvidence)?input.calendarEvidence:[],answers:input.answers||[],
      task:'Understand the complete vacation request as one coherent travel order. Extract destinations or geographic scope, exact or approximate travel time, duration, travelers and children, school-holiday dependency, accommodation wishes, arrival and departure modes and local times, daily wake/meal/rest/sleep rhythm, jet-lag sensitivity, transport, maximum transfer tolerance, geographic base, activities, restaurants and food, culture, nature, shopping, nightlife, wellness, family moments, pace, total/daily budget and special splurges, reservation wishes and deadlines, accessibility, must-dos, exclusions, weather fallback needs, indoor/outdoor balance, group fairness and free-time wishes. Preserve relationships between details instead of reducing the request to generic categories. If the request mentions school-age children or school holidays and verified holiday evidence or the governing school region is missing, ask one short question for the smallest missing fact. Never invent school-holiday dates. Return all understood requirements even when another Luvia owner must verify or execute them.',
      interpretationContract:{purpose:'Interpret only this new trip. Never inherit a different active trip. Respect explicit profile restrictions. Return German text. Preserve every requested hard constraint, including unsupported ones. A follow-up answer resolves its original question.',
        goalTypes:['destination','time','accommodation','transport','food','culture','nature','nightlife','shopping','wellness','family','active','rest','open'],
        constraintKeys:{destination:'named destination or region',destinationScope:'city|region|country|coast|open',countryPreference:'named country or abroad',timeWindow:'original approximate period',season:'spring|summer|autumn|winter',month:'named month',year:'four digit year',durationDays:'integer calendar days only when the user says days',durationNights:'integer nights only when the user says nights',dateFlexibility:'fixed|days|weeks|open',travelers:'short group description',adults:'integer',children:'integer',childAges:'comma-separated ages',schoolHolidayRequired:'true|false',schoolHolidayRegion:'governing country/state/region',accommodation:'requested kind',transport:'requested mode',departureOrigin:'named home city, station or airport',maximumFlightMinutes:'integer only when explicitly stated',flightPreference:'short|medium|long|open or description',arrivalTime:'HH:mm local time',departureTime:'HH:mm local time',arrivalRecoveryMinutes:'integer',departureBufferMinutes:'integer',category:'one goal type',excludeCategory:'one goal type',categoryMix:'balanced|favorites|surprising',pace:'slow|balanced|active',budgetLevel:'economy|balanced|generous|open',tripBudget:'amount as stated',dailyBudget:'amount as stated',currency:'ISO code or stated currency',splurgeDay:'special higher-budget moment',dietary:'requirement',accessibility:'requirement',mobility:'requirement',maximumPerDay:'1|2|3|4',notBefore:'HH:mm',notAfter:'HH:mm',wakeTime:'HH:mm',bedTime:'HH:mm',breakfastTime:'HH:mm',lunchWindow:'time range as stated',dinnerTime:'HH:mm',napWindow:'time range as stated',energyPattern:'morning|balanced|evening or description',jetLagSensitivity:'low|medium|high',freeTimePercent:'0-100',maximumTransferMinutes:'integer',dayTripRadiusKm:'integer',baseLocation:'named area',spatialClustering:'true|false',weatherFallback:'true|false',indoorOutdoorBalance:'description',planBPerDay:'true|false',reservationStyle:'early|flexible|minimal or description',bookingDeadline:'date or relative period',mustReserve:'specific wish',groupDecisionMode:'consensus|majority|individual-turns or description',fairnessRequired:'true|false',memberPriority:'person and wish',evidenceFreshness:'description',recheckBeforeDays:'integer',mustDo:'specific wish',exclude:'specific exclusion'},
        rule:'Use canonical keys when applicable. Keep month, year and stated duration as separate constraints so Luvia can offer exact date windows before planning. Put concrete wishes such as a named museum, beach day, child-friendly activity, restaurant style or shopping wish into mustDo/category constraints instead of generalizing them away. Other constraints retain descriptive keys. Never discard unsupported requirements or invent destinations, dates, holiday periods or place facts.'}
    };
    const response=await run('planning.dialogue',request,{fallback:false,workflowId:input.workflowId||null}),calendarRequest=calendarRequestFromModel(input,response?.data||response?.result||{}),existing=Array.isArray(input.calendarEvidence)?input.calendarEvidence:[];let calendarEvidence=existing,calendarEvidenceStatus=calendarRequest?'required':'not-requested';
    if(calendarRequest){
      const region=calendarRequest.schoolRegion.toLocaleLowerCase('de-DE').replace(/[^a-z0-9äöüß]+/g,''),hasMatching=existing.some(item=>{const candidate=String(item?.region||item?.schoolRegion||'').toLocaleLowerCase('de-DE').replace(/[^a-z0-9äöüß]+/g,'');return item?.verified===true&&/school|ferien/i.test(String(item?.kind||item?.type||''))&&candidate&&(candidate===region||candidate.includes(region)||region.includes(candidate));});
      if(!hasMatching){try{const calendar=await getTravelCalendarEvidence(calendarRequest);calendarEvidence=[...existing,...calendar.evidence];calendarEvidenceStatus='verified';}catch(error){calendarEvidenceStatus=error?.code||'unavailable';}}
      else calendarEvidenceStatus='verified-cached';
    }
    const brief=preferenceResolver().projectTripBrief({...input,calendarEvidence},response);
    return immutable({...brief,calendarEvidence,calendarEvidenceStatus});
  }

  async function suggestTripDestinations(input = {}) {
    const requestBrief=String(input.requestBrief||'').trim().slice(0,1200);
    if(requestBrief.length<8)throw Object.assign(new Error('Beschreibt kurz, wie sich eure Reise anfühlen soll.'),{code:'TRIP_INSPIRATION_BRIEF_REQUIRED'});
    const excluded=[...new Set((Array.isArray(input.excludedDestinations)?input.excludedDestinations:[]).map(value=>String(value||'').trim()).filter(Boolean))].slice(0,20);
    const response=await run('discovery.plan',{
      surface:'trip-destination-inspiration',userGoal:requestBrief,globalPreferences:input.profilePreferences||{},destination:null,
      excludedDestinations:excluded,variationSeed:String(input.variationSeed||''),
      task:'Return exactly five distinct real named cities or travel regions as destination search hypotheses for a NEW trip before dates or destination are chosen. Rank them by how completely they satisfy the userGoal. Treat explicit requirements such as abroad, sea or coast, warm climate, nature, travel-distance limits and exclusions as mandatory: never return a destination that clearly conflicts with one of them. Replace every conflicting candidate before responding. Exclude every destination listed in excludedDestinations. Each searchPlans.query must contain only the unambiguous destination name and country. Never inherit an active trip. Interpret warmth and climate only as normal seasonal expectations, never as current weather or a forecast. Do not claim prices, availability or verified suitability. Use a short natural German reasoningSummary about the shared direction of the five ideas. Provider geocoding verifies every geographic identity before display.'
    },{fallback:false,context:{surface:'trip-destination-inspiration'}});
    if(response?.ok===false||response?.meta?.fallback)throw Object.assign(new Error('Die KI konnte eure Reisewünsche gerade nicht auswerten.'),{code:'TRIP_INSPIRATION_UNAVAILABLE'});
    const value=response?.data||response?.result||response,plans=(value?.searchPlans||[]).map(plan=>({query:String(plan?.query||'').trim(),reason:String(plan?.reason||'').trim().slice(0,360),fitSignals:[...new Set((plan?.fitSignals||[]).map(item=>String(item||'').trim()).filter(Boolean))].slice(0,3),weight:Math.max(0,Math.min(1,Number(plan?.weight)||0))})).filter(plan=>plan.query),queries=[...new Set(plans.map(plan=>plan.query))].slice(0,5),ideas=queries.map(query=>plans.find(plan=>plan.query===query));
    if(!queries.length)throw Object.assign(new Error(value?.followUpQuestion?.text||'Beschreibt noch etwas genauer, was euch an der Reise wichtig ist.'),{code:'TRIP_INSPIRATION_MORE_DETAIL'});
    return immutable({owner:'intelligence',contractId:'intelligence.v1',kind:'destination-inspiration',source:'ai',queries,ideas,summary:String(value.reasoningSummary||'').slice(0,800)});
  }

  // Only this compact projection reaches a model. The verified full reserve stays
  // in the workflow and remains the source for later changes.
  function modelPlace(place){
    const c=place.coordinates||place.location||{};
    return {providerPlaceId:place.providerPlaceId,name:place.name,category:place.category||place.requestCategory,
      coordinates:{latitude:Number(c.latitude??c.lat),longitude:Number(c.longitude??c.lng)},
      ...(place.facts?{facts:place.facts}:{})};
  }
  function sectionCandidates(candidates,used,dayCount,priority=[]){
    const buckets=new Map();
    for(const place of candidates){if(used.has(place.providerPlaceId))continue;const key=place.category||'other';if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(place);}
    const categories=[...buckets.keys()].sort((a,b)=>Number(!priority.includes(a))-Number(!priority.includes(b)));
    const limit=Math.max(dayCount*4,Math.min(64,dayCount*7+14)),result=[];
    while(result.length<limit&&categories.some(key=>buckets.get(key).length))for(const key of categories){if(result.length>=limit)break;const place=buckets.get(key).shift();if(place)result.push(place);}
    return result;
  }
  function sectionFingerprint(value){const text=JSON.stringify(value);let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619)}return (hash>>>0).toString(16);}

  async function composeTripItinerary(input = {}) {
    const clean=(value,limit=0)=>{const result=value==null?'':String(value).trim();return limit?result.slice(0,limit):result};
    const minute=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value||'')?Number(value.slice(0,2))*60+Number(value.slice(3)):null;
    const clock=value=>`${String(Math.max(0,Math.min(23,Math.floor(value/60)))).padStart(2,'0')}:${String(Math.max(0,Math.min(59,value%60))).padStart(2,'0')}`;
    const rawDays=(Array.isArray(input.days)?input.days:[]).slice(0,366).map((item,index)=>({date:clean(item?.date,10),label:clean(item?.label,80)||`Tag ${index+1}`}));
    const planningDayCount=Math.max(1,Math.min(366,Array.isArray(input.days)?input.days.length:1)),planningCandidateLimit=4000,candidateInput=(Array.isArray(input.candidates)?input.candidates:[]).slice(0,planningCandidateLimit).map(item=>{
      const coordinates=item?.coordinates||item?.location||{};
      const providerPlaceId=clean(item?.providerPlaceId||item?.provider_place_id||item?.id,240).replace(/^places\//,''),provider=clean(item?.provider||item?.source,80),observedAt=clean(item?.providerObservedAt||item?.ownerObservedAt,40),evidenceRefs=[`place:${providerPlaceId}:identity`,...(provider&&observedAt?[`place:${providerPlaceId}:provider-snapshot`]:[])];
      return {providerPlaceId,name:clean(item?.name,200),category:clean(item?.requestCategory||item?.category,80),primaryType:clean(item?.primaryType||item?.primary_type||item?.type,80),formattedAddress:clean(item?.formattedAddress||item?.address,280),coordinates:{latitude:Number(coordinates.latitude??coordinates.lat),longitude:Number(coordinates.longitude??coordinates.lng)},provider,observedAt,evidenceRefs,facts:{priceLevel:clean(item?.priceLevel||item?.price_level,60),openNow:typeof item?.openNow==='boolean'?item.openNow:null,businessStatus:clean(item?.businessStatus||item?.business_status,80)}};
    }).filter(item=>item.providerPlaceId&&item.name&&Number.isFinite(item.coordinates.latitude)&&Number.isFinite(item.coordinates.longitude));
    if(!rawDays.length)throw contractError('TRIP_ITINERARY_DAYS_REQUIRED','Für den Reiseentwurf fehlen die Reisetage.');
    if(!candidateInput.length)throw contractError('TRIP_ITINERARY_CANDIDATES_REQUIRED','Für den Reiseentwurf fehlen überprüfte Places.');
    const order=input.brief?.travelOrder||{},planningPolicy=input.brief?.policy||{},rhythm=order.rhythm||{},logistics=order.logistics||{},pace=String(input.brief?.tripPreferences?.pace||input.tripPreferences?.pace||'balanced'),baseTarget=pace==='active'?4:pace==='slow'?2:3,maximumMomentsPerDay=Math.max(1,Math.min(4,Number(planningPolicy.maximumPerDay)||4)),baseStart=minute(planningPolicy.notBefore)??minute(rhythm.dayStart)??570,baseEnd=minute(planningPolicy.notAfter)??minute(rhythm.dayEnd)??1260,arrivalTime=minute(logistics.arrival?.localTime),departureTime=minute(logistics.departure?.localTime);
    const dayInput=rawDays.map((day,index)=>{
      const role=rawDays.length===1?'day-trip':index===0?'arrival':index===rawDays.length-1?'departure':'full';
      let notBefore=baseStart,notAfter=baseEnd,target=baseTarget;
      if(role==='arrival'){target=Math.max(1,baseTarget-1);if(arrivalTime!=null)notBefore=Math.max(notBefore,arrivalTime+Math.max(45,Number(logistics.arrival?.recoveryMinutes)||90));}
      if(role==='departure'){target=Math.max(1,baseTarget-1);if(departureTime!=null)notAfter=Math.min(notAfter,departureTime-Math.max(60,Number(logistics.departure?.bufferMinutes)||120));}
      if(notAfter-notBefore<90)target=0;else target=Math.min(target,Math.max(1,Math.floor((notAfter-notBefore+60)/150)));
      return {...day,role,minimumMoments:target,targetMoments:target,notBefore:clock(notBefore),notAfter:clock(Math.max(notBefore,notAfter)),freeTimePercent:Math.max(0,Math.min(70,Number(rhythm.freeTimePercent??planningPolicy.freeTimePercent)||0))};
    });
    const originallyRequiredCandidateCount=dayInput.reduce((sum,day)=>sum+day.minimumMoments,0),activeDayCount=dayInput.filter(day=>day.minimumMoments>0).length;
    if(candidateInput.length<activeDayCount)throw contractError('TRIP_ITINERARY_COVERAGE_INSUFFICIENT',`Dieser Suchlauf hat bisher ${candidateInput.length} unterschiedliche, belegte Kandidaten geliefert. Das ist kein Gesamtbestand des Reiseziels. Für die ${activeDayCount} aktiven Reisetage muss Luvia die Places-Recherche noch erweitern.`);
    let remainingCandidateShortage=Math.max(0,originallyRequiredCandidateCount-candidateInput.length);
    const reliefOrder=dayInput.map((day,index)=>({day,index})).filter(item=>item.day.minimumMoments>1).sort((left,right)=>Number(left.day.role!=='full')-Number(right.day.role!=='full')||Number(left.index%2===0)-Number(right.index%2===0)||right.day.minimumMoments-left.day.minimumMoments||left.index-right.index);
    while(remainingCandidateShortage>0){let reduced=false;for(const item of reliefOrder){if(remainingCandidateShortage<=0)break;if(item.day.minimumMoments<=1)continue;item.day.minimumMoments-=1;item.day.targetMoments=Math.min(item.day.targetMoments,item.day.minimumMoments);remainingCandidateShortage-=1;reduced=true;}if(!reduced)break;}
    const requiredCandidateCount=dayInput.reduce((sum,day)=>sum+day.minimumMoments,0),candidateAdaptivePlanning=requiredCandidateCount<originallyRequiredCandidateCount;
    const calendarEvidence=(Array.isArray(input.calendarEvidence)?input.calendarEvidence:[]).slice(0,40).map(item=>({id:clean(item?.id,160),kind:clean(item?.kind||item?.type,80),name:clean(item?.name,160),region:clean(item?.region,160),startDate:clean(item?.startDate,10),endDate:clean(item?.endDate,10),source:clean(item?.source,160),sourceUrl:clean(item?.sourceUrl,500),authority:clean(item?.authority,160),authorityUrl:clean(item?.authorityUrl,500),retrievedAt:clean(item?.retrievedAt,40),verified:item?.verified===true})).filter(item=>item.id);
    const evidenceCatalog=[...candidateInput.flatMap(item=>[{id:`place:${item.providerPlaceId}:identity`,kind:'place-identity',source:'places.v1',observedAt:item.observedAt||'',supports:['place identity']},...(item.provider&&item.observedAt?[{id:`place:${item.providerPlaceId}:provider-snapshot`,kind:'place-provider-snapshot',source:item.provider,observedAt:item.observedAt,supports:['provider supplied fields']}]:[])]),...calendarEvidence.filter(item=>item.verified).map(item=>({id:`calendar:${item.id}`,kind:item.kind||'calendar',source:item.authority||item.source,observedAt:item.retrievedAt,supports:['calendar interval',item.startDate&&item.endDate?`${item.startDate}/${item.endDate}`:''].filter(Boolean) }))];
    const planningContract={completePeriod:true,dayPolicies:dayInput,maximumMomentsPerDay,useOnlyCandidateIds:true,allDaysExactlyOnce:true,noUnexplainedEmptyDays:true,avoidDuplicatePlaces:true,preserveAllHardConstraints:true,assignContextualTimes:true,avoidSingleDefaultTime:true,preventTimeOverlap:true,freeTimeBetweenMoments:true,explicitDeliberateFreeTime:true,wholeTripBalance:true,travelPromiseRequired:true,uncertaintyMapRequired:true,bookingDependenciesRequired:true,neighborhoodRecommendationRequired:true,verifiedClaimsRequireEvidence:true,clusterDaysGeographically:true,arrivalDepartureAware:true,prepareBackupOptions:true,candidateAdaptivePlanning,availableCandidateCount:candidateInput.length,originallyRequiredCandidateCount,automaticMutation:false};
    const requestedCategoryIds=[...new Set((order.categories||[]).map(item=>clean(item?.category)).filter(Boolean))],repairInstructions=(Array.isArray(input.repairInstructions)?input.repairInstructions:[]).map(item=>clean(item,300)).filter(Boolean).slice(0,20),qualityAttempt=Math.max(1,Math.min(3,Math.round(Number(input.qualityAttempt)||1))),composeTier=!repairInstructions.length?'fast':qualityAttempt>=3?'deep':'default',existing=input.existingItinerary?.kind==='ai-trip-itinerary'?input.existingItinerary:null,requestedRepairDates=[...new Set([...(Array.isArray(input.repairDayDates)?input.repairDayDates:[]),...(Array.isArray(existing?.contractIssues)?existing.contractIssues.map(item=>item?.dayDate):[])].map(date=>clean(date,10)).filter(date=>dayInput.some(day=>day.date===date)))];
    let value,missingRepairDates=[];
    if(existing&&requestedRepairDates.length){
      const repairSet=new Set(requestedRepairDates),existingDays=Array.isArray(existing.days)?existing.days:[],preservedDays=existingDays.filter(day=>!repairSet.has(clean(day?.date,10))),usedIds=new Set(preservedDays.flatMap(day=>(day?.entries||[]).map(entry=>clean(entry?.providerPlaceId,240).replace(/^places\//,''))).filter(Boolean)),repairPolicies=dayInput.filter(day=>repairSet.has(day.date)),replacements=new Map();
      // A compact one-day response is substantially more reliable than asking the
      // repair model to repeat several unrelated day objects. Each call still sees
      // the preserved itinerary and every id already used by an earlier repair.
      for(const repairPolicy of repairPolicies){
        const currentPreservedDays=[...preservedDays,...replacements.values()],preservedCategories=new Set(currentPreservedDays.flatMap(day=>(day?.entries||[]).map(entry=>clean(entry?.category,80)).filter(Boolean))),replacedDay=existingDays.find(day=>clean(day?.date,10)===repairPolicy.date),priorityCategories=new Set([...requestedCategoryIds.filter(category=>!preservedCategories.has(category)),...(replacedDay?.entries||[]).map(entry=>clean(entry?.category,80)).filter(Boolean)]),remainingCandidates=candidateInput.filter(item=>!usedIds.has(item.providerPlaceId)),priorityCandidates=[];
        for(const category of priorityCategories){const index=remainingCandidates.findIndex(item=>item.category===category);if(index>=0)priorityCandidates.push(...remainingCandidates.splice(index,1));}
        const availableCandidates=[...priorityCandidates,...remainingCandidates.sort((left,right)=>Number(!priorityCategories.has(left.category))-Number(!priorityCategories.has(right.category)))],neighboringDays=currentPreservedDays.map(day=>({date:clean(day?.date,10),theme:clean(day?.theme,160),energy:day?.balance?.energy||'balanced',providerPlaceIds:(day?.entries||[]).map(entry=>clean(entry?.providerPlaceId,240).replace(/^places\//,'')).filter(Boolean)}));
        const dayInstructions=repairInstructions.filter(item=>!requestedRepairDates.some(date=>item.includes(date))||item.includes(repairPolicy.date));
        const categoryInstruction=priorityCategories.size?`Dieser Ersatztag muss die im restlichen Entwurf fehlenden oder bisher hier getragenen Wunschbereiche abdecken, soweit passende Kandidaten vorhanden sind: ${[...priorityCategories].join(', ')}.`:'',targetedInstructions=[...(dayInstructions.length?dayInstructions:repairInstructions),categoryInstruction].filter(Boolean).slice(0,20);
        const repairResponse=await run('trip.compose-day-repair',{surface:'trip-composer',retryGeneration:Math.max(0,Math.round(Number(input.retryGeneration)||0)),locale:input.locale||'de-DE',timeZone:input.timeZone||input.destination?.timezone||'',travelOrder:order,planningPolicy,destination:input.destination||null,travelPromise:existing.travelPromise||{},days:[repairPolicy],neighboringDays,excludedProviderPlaceIds:[...usedIds],candidateCatalog:sectionCandidates(availableCandidates,usedIds,1,[...priorityCategories]).map(modelPlace),repairInstructions:targetedInstructions,planningContract:{...planningContract,dayPolicies:[repairPolicy],repairOnly:true,preserveOtherDays:true,priorityCategories:[...priorityCategories]}},{tier:qualityAttempt>=3?'deep':'default',fallback:false,workflowId:input.workflowId||null,context:{surface:'trip-composer',purpose:'repair-failed-trip-day',qualityLane:qualityAttempt>=3?'sol-day-repair':'terra-day-repair'}});
        if(repairResponse?.ok!==true||repairResponse?.meta?.fallback!==false)throw contractError('TRIP_ITINERARY_DAY_REPAIR_AI_REQUIRED','Luvia konnte den offenen Reisetag gerade nicht zuverlässig reparieren.');
        const repairValue=repairResponse?.data||repairResponse?.result||repairResponse,returnedDays=Array.isArray(repairValue?.days)?repairValue.days:[],exactDay=returnedDays.find(item=>clean(item?.date,10)===repairPolicy.date),day=exactDay||(returnedDays.length===1?{...returnedDays[0],date:repairPolicy.date}:null);
        if(!day){missingRepairDates.push(repairPolicy.date);continue;}
        replacements.set(repairPolicy.date,day);for(const entry of day.entries||[]){const id=clean(entry?.providerPlaceId,240).replace(/^places\//,'');if(id)usedIds.add(id);}
      }
      value={...existing,days:dayInput.map(day=>replacements.get(day.date)||existingDays.find(item=>clean(item?.date,10)===day.date)||{date:day.date,theme:'',balance:{energy:'balanced',freeTimePurpose:''},freeTime:[],entries:[]})};
    }else{
      const sections=[],sectionSize=7,sectionCount=Math.ceil(dayInput.length/sectionSize),usedIds=new Set(),completedDays=[],saved=Array.isArray(input.completedSections)?input.completedSections:[];
      for(let sectionIndex=0;sectionIndex<sectionCount;sectionIndex++){
        const sectionDays=dayInput.slice(sectionIndex*sectionSize,(sectionIndex+1)*sectionSize),previousCategories=new Set(completedDays.flatMap(day=>(day.entries||[]).map(entry=>candidateInput.find(p=>p.providerPlaceId===entry.providerPlaceId)?.category))),priorities=requestedCategoryIds.filter(category=>!previousCategories.has(category)),catalog=sectionCandidates(candidateInput,usedIds,sectionDays.length,priorities);
        const request={surface:'trip-composer',retryGeneration:Math.max(0,Math.round(Number(input.retryGeneration)||0)),locale:input.locale||'de-DE',timeZone:input.timeZone||input.destination?.timezone||'',
          travelOrder:order,planningPolicy,profilePreferences:input.brief?.requestPreferences||input.profilePreferences||{},destination:input.destination||null,days:sectionDays,
          segment:{index:sectionIndex+1,count:sectionCount,wholeTripStart:dayInput[0].date,wholeTripEnd:dayInput.at(-1).date,wholeTripDayCount:dayInput.length},
          previousDays:completedDays.map(day=>({date:day.date,theme:day.theme,energy:day.balance?.energy,entries:(day.entries||[]).map(entry=>({providerPlaceId:entry.providerPlaceId,category:candidateInput.find(p=>p.providerPlaceId===entry.providerPlaceId)?.category}))})),
          travelPromise:sections[0]?.result?.travelPromise||null,candidateCatalog:catalog.map(modelPlace),calendarEvidence,
          planningContract:{...planningContract,dayPolicies:sectionDays,availableCandidateCount:catalog.length,priorityCategories:priorities,poolQuality:input.poolQuality||null},repairInstructions};
        const key=sectionFingerprint(request),prior=saved.find(section=>section.key===key&&section.index===sectionIndex);
        await input.onProgress?.({section:sectionIndex+1,sectionCount,completedDays:completedDays.length,totalDays:dayInput.length});
        let result=prior?.result;
        if(!result){
          const response=await run('trip.compose',request,{tier:composeTier,fallback:false,workflowId:input.workflowId||null,context:{surface:'trip-composer',purpose:'trip-section'}});
          if(response?.ok!==true||response?.meta?.fallback!==false)throw contractError('TRIP_ITINERARY_AI_REQUIRED','Luvia konnte diesen Reiseabschnitt gerade nicht zuverlässig komponieren.');
          result=response?.data||response?.result||response;
        }
        // Keep only this section's dates; final normalization detects missing days.
        const dateSet=new Set(sectionDays.map(day=>day.date)),sectionResult={...result,days:(result?.days||[]).filter(day=>dateSet.has(day.date))};
        sections.push({key,index:sectionIndex,dates:sectionDays.map(day=>day.date),result:sectionResult});completedDays.push(...sectionResult.days);
        for(const day of sectionResult.days)for(const entry of day.entries||[])usedIds.add(entry.providerPlaceId);
        await input.onSection?.(sections,{section:sectionIndex+1,sectionCount,completedDays:completedDays.length,totalDays:dayInput.length});
      }
      const first=sections[0].result;
      value={...first,days:completedDays,alternatives:sections.flatMap(section=>section.result.alternatives||[]),backupOptions:sections.flatMap(section=>section.result.backupOptions||[]),uncertaintyMap:sections.flatMap(section=>section.result.uncertaintyMap||[]),bookingOrder:sections.flatMap(section=>section.result.bookingOrder||[]),warnings:[...new Set(sections.flatMap(section=>section.result.warnings||[]))]};
    }
    const planDays=Array.isArray(value?.days)?value.days:[],allowed=new Map(candidateInput.map(item=>[item.providerPlaceId,item])),allowedEvidence=new Set(evidenceCatalog.map(item=>item.id)),used=new Set(),byDate=new Map(planDays.map(item=>[clean(item?.date,10),item])),byLabel=new Map(planDays.map(item=>[clean(item?.label,80),item])),contractIssues=missingRepairDates.map(dayDate=>({code:'TRIP_ITINERARY_DAY_REPAIR_INCOMPLETE',dayDate,message:`${dayInput.find(day=>day.date===dayDate)?.label||dayDate} wurde in dieser Reparaturrunde noch nicht geliefert.`}));
    const travelPromise={summary:clean(value?.travelPromise?.summary,600),commitments:[...new Set((value?.travelPromise?.commitments||[]).map(item=>clean(item,240)).filter(Boolean))].slice(0,12),deliberateFreeTime:clean(value?.travelPromise?.deliberateFreeTime,300),exclusions:[...new Set((value?.travelPromise?.exclusions||[]).map(item=>clean(item,180)).filter(Boolean))].slice(0,12)};
    if(!travelPromise.summary||!travelPromise.commitments.length||!travelPromise.deliberateFreeTime)throw contractError('TRIP_ITINERARY_PROMISE_MISSING','Luvia hat das Reiseversprechen noch nicht vollständig formuliert.');
    const days=dayInput.map((expected,index)=>{
      const found=expected.date?byDate.get(expected.date):byLabel.get(expected.label)||planDays[index],source=found||{date:expected.date,theme:'',balance:{energy:'balanced',freeTimePurpose:''},freeTime:[],entries:[]};
      if(!found)contractIssues.push({code:'TRIP_ITINERARY_DAY_MISSING',dayDate:expected.date,message:`${expected.label} fehlt im KI-Entwurf.`});
      const entries=(Array.isArray(source.entries)?source.entries:[]).slice(0,maximumMomentsPerDay).map(entry=>{
        const providerPlaceId=clean(entry?.providerPlaceId,240).replace(/^places\//,''),candidate=allowed.get(providerPlaceId);
        if(!candidate){contractIssues.push({code:'TRIP_ITINERARY_UNKNOWN_PLACE',dayDate:expected.date,message:`${expected.label} enthält einen Ort, der nicht von Places bestätigt wurde.`});return null;}
        if(used.has(providerPlaceId)){contractIssues.push({code:'TRIP_ITINERARY_DUPLICATE_PLACE',dayDate:expected.date,message:`${expected.label} verwendet ${candidate.name} erneut.`});return null;}
        const time=clean(entry?.time,5),durationMinutes=Math.round(Number(entry?.durationMinutes)),start=minute(time),end=start==null?null:start+durationMinutes;
        if(expected.date&&start==null){contractIssues.push({code:'TRIP_ITINERARY_TIME_INVALID',dayDate:expected.date,message:`Die Uhrzeit für ${candidate.name} am ${expected.label} ist nicht eindeutig.`});return null;}
        if(!Number.isFinite(durationMinutes)||durationMinutes<30||durationMinutes>720){contractIssues.push({code:'TRIP_ITINERARY_DURATION_INVALID',dayDate:expected.date,message:`Die Dauer für ${candidate.name} am ${expected.label} ist nicht plausibel.`});return null;}
        if(start!=null&&(start<(minute(expected.notBefore)??0)||end>(minute(expected.notAfter)??1440))){contractIssues.push({code:'TRIP_ITINERARY_DAY_WINDOW_VIOLATION',dayDate:expected.date,message:`${candidate.name} liegt außerhalb des möglichen Zeitfensters am ${expected.label}.`});return null;}
        used.add(providerPlaceId);
        const rawEvidence=Array.isArray(entry?.evidenceRefs)&&entry.evidenceRefs.length?entry.evidenceRefs:candidate.evidenceRefs.slice(0,1),evidenceRefs=[...new Set(rawEvidence.map(item=>clean(item,240)).filter(item=>allowedEvidence.has(item)))].slice(0,12),certainty='modelled';
        return {providerPlaceId,time:expected.date?time:'',durationMinutes,category:candidate.category,reason:clean(entry?.reason,500),certainty:certainty==='verified'&&!evidenceRefs.length?'modelled':certainty,evidenceRefs,confidence:Math.max(0,Math.min(1,Number(entry?.confidence)||0))};
      }).filter(Boolean);
      if(entries.length<expected.minimumMoments)contractIssues.push({code:'TRIP_ITINERARY_DAY_TOO_THIN',dayDate:expected.date,message:`${expected.label} ist für seine Rolle ${expected.role} noch nicht ausreichend geplant.`});
      const timed=entries.filter(entry=>entry.time).sort((left,right)=>left.time.localeCompare(right.time));
      for(let slot=1;slot<timed.length;slot++){
        const prior=timed[slot-1],next=timed[slot],priorStart=minute(prior.time),nextStart=minute(next.time);
        if(nextStart<priorStart+prior.durationMinutes)contractIssues.push({code:'TRIP_ITINERARY_TIME_OVERLAP',dayDate:expected.date,message:`${expected.label} enthält überlappende Vorschlagszeiten.`});
      }
      const freeTime=(Array.isArray(source.freeTime)?source.freeTime:[]).map(item=>{const start=clean(item?.start,5),end=clean(item?.end,5),from=minute(start),until=minute(end),purpose=clean(item?.purpose,180);return from!=null&&until!=null&&until>from?{start,end,purpose,reason:clean(item?.reason,300)||purpose,minutes:until-from}:null}).filter(Boolean).slice(0,6);
      if(expected.freeTimePercent>0&&expected.role==='full'&&!freeTime.length)contractIssues.push({code:'TRIP_ITINERARY_FREETIME_MISSING',dayDate:expected.date,message:`${expected.label} enthält noch keinen bewusst geplanten Freiraum.`});
      const plannedMinutes=entries.reduce((sum,item)=>sum+item.durationMinutes,0),freeTimeMinutes=freeTime.reduce((sum,item)=>sum+item.minutes,0),energy=['light','balanced','intense'].includes(source.balance?.energy)?source.balance.energy:'balanced';
      return {date:expected.date,label:expected.label,theme:clean(source.theme,160),role:expected.role,balance:{energy,plannedMinutes,freeTimeMinutes,freeTimePurpose:clean(source.balance?.freeTimePurpose,240)||freeTime.map(item=>item.purpose).filter(Boolean).join(' · ')},freeTime:freeTime.map(({minutes,...item})=>item),entries};
    });
    const candidateCategories=new Set(candidateInput.map(item=>item.category)),usedCategories=new Set(days.flatMap(day=>day.entries.map(entry=>entry.category))),missingCategories=requestedCategoryIds.filter(category=>candidateCategories.has(category)&&!usedCategories.has(category));
    if(missingCategories.length){const repairDay=days.find(day=>day.role==='full')||days[0];contractIssues.push({code:'TRIP_ITINERARY_CATEGORY_COVERAGE_MISSING',dayDate:repairDay.date,message:`Dieser Tag muss die bislang fehlenden Wunschbereiche berücksichtigen: ${missingCategories.join(', ')}.`});}
    const dayDates=new Set(dayInput.map(day=>day.date)),backupUsed=new Set(),backupOptions=(Array.isArray(value?.backupOptions)?value.backupOptions:[]).map(item=>{const forProviderPlaceId=clean(item?.forProviderPlaceId,240).replace(/^places\//,''),providerPlaceId=clean(item?.providerPlaceId,240).replace(/^places\//,''),dayDate=clean(item?.dayDate,10);if(!dayDates.has(dayDate)||!used.has(forProviderPlaceId)||!allowed.has(providerPlaceId)||used.has(providerPlaceId)||providerPlaceId===forProviderPlaceId||backupUsed.has(providerPlaceId))return null;backupUsed.add(providerPlaceId);return{dayDate,forProviderPlaceId,providerPlaceId,trigger:clean(item?.trigger,160),reason:clean(item?.reason,400)}}).filter(Boolean).slice(0,20);
    const alternatives=(value?.alternatives||[]).map(item=>clean(item,240)).filter(id=>allowed.has(id)&&!used.has(id)&&!backupUsed.has(id)).slice(0,20);
    const uncertaintyKinds=['weather','price','opening','route','availability','booking'],modelUncertainties=(Array.isArray(value?.uncertaintyMap)?value.uncertaintyMap:[]).map(item=>{const evidenceRefs=[...new Set((item?.evidenceRefs||[]).map(ref=>clean(ref,240)).filter(ref=>allowedEvidence.has(ref)))].slice(0,20),source=clean(item?.source,160),observedAt=clean(item?.observedAt,40),verified=item?.state==='verified'&&source&&Number.isFinite(Date.parse(observedAt))&&evidenceRefs.length;return{subject:clean(item?.subject,240),kind:['weather','price','opening','route','availability','booking','event','calendar','other'].includes(item?.kind)?item.kind:'other',state:verified?'verified':item?.state==='modelled'?'modelled':'open',reason:clean(item?.reason,400),source:verified?source:'',observedAt:verified?observedAt:'',expiresAt:verified&&Number.isFinite(Date.parse(item?.expiresAt))?clean(item.expiresAt,40):'',affectedDayDates:[...new Set((item?.affectedDayDates||[]).map(date=>clean(date,10)).filter(date=>dayDates.has(date)))].slice(0,20),providerPlaceIds:[...new Set((item?.providerPlaceIds||[]).map(id=>clean(id,240).replace(/^places\//,'')).filter(id=>allowed.has(id)))].slice(0,20),evidenceRefs}}).filter(item=>item.subject).slice(0,40),presentKinds=new Set(modelUncertainties.map(item=>item.kind));
    const uncertaintyMap=[...modelUncertainties,...uncertaintyKinds.filter(kind=>!presentKinds.has(kind)).map(kind=>({subject:{weather:'Wetter am Reisetermin',price:'Preise am Reisetermin',opening:'Öffnungszeiten zu den geplanten Besuchen',route:'Wegezeiten zwischen Reisemomenten',availability:'Verfügbarkeit der ausgewählten Orte',booking:'Buchungsstatus und Fristen'}[kind],kind,state:'open',reason:'Für diese Aussage liegt im Entwurf noch kein aktueller, zitierbarer Providerbeleg vor.',source:'',observedAt:'',expiresAt:'',affectedDayDates:[],providerPlaceIds:[],evidenceRefs:[]}))];
    const bookingOrder=(Array.isArray(value?.bookingOrder)?value.bookingOrder:[]).map(item=>{const providerPlaceId=clean(item?.providerPlaceId,240).replace(/^places\//,''),evidenceRefs=[...new Set((item?.evidenceRefs||[]).map(ref=>clean(ref,240)).filter(ref=>allowedEvidence.has(ref)))].slice(0,12);return{rank:Math.max(1,Math.min(99,Math.round(Number(item?.rank)||99))),subject:clean(item?.subject,240),providerPlaceId:providerPlaceId&&allowed.has(providerPlaceId)?providerPlaceId:'',state:['secure-first','plan-around','later','open'].includes(item?.state)?item.state:'open',reason:clean(item?.reason,400),blocks:[...new Set((item?.blocks||[]).map(block=>clean(block,180)).filter(Boolean))].slice(0,12),evidenceRefs}}).filter(item=>item.subject).sort((a,b)=>a.rank-b.rank).slice(0,30);
    const neighborhoodSource=value?.neighborhoodRecommendation||{},neighborhoodEvidence=[...new Set((neighborhoodSource.evidencePlaceIds||[]).map(id=>clean(id,240).replace(/^places\//,'')).filter(id=>used.has(id)))].slice(0,24),neighborhoodRecommendation={state:neighborhoodSource.state==='modelled'&&neighborhoodEvidence.length?'modelled':'open',label:clean(neighborhoodSource.label,180),radiusKm:Math.max(0,Math.min(100,Number(neighborhoodSource.radiusKm)||0)),reason:clean(neighborhoodSource.reason,500),evidencePlaceIds:neighborhoodEvidence,caveats:[...new Set((neighborhoodSource.caveats||[]).map(item=>clean(item,240)).filter(Boolean))].slice(0,12)};
    return immutable({owner:'intelligence',contractId:'intelligence.v1',kind:'ai-trip-itinerary',source:'ai',title:clean(value?.title,160),summary:clean(value?.summary,800),travelPromise,days,dayPolicies:dayInput,uncertaintyMap,bookingOrder,neighborhoodRecommendation,evidenceCatalog,alternatives,backupOptions,contractIssues,uncoveredRequirements:(value?.uncoveredRequirements||[]).map(item=>clean(item,240)).filter(Boolean).slice(0,20),warnings:(value?.warnings||[]).map(item=>clean(item,240)).filter(Boolean).slice(0,20),confidence:Math.max(0,Math.min(1,Number(value?.confidence)||0)),candidateCount:candidateInput.length,automaticMutation:false,confirmationRequired:true});
  }

  async function rankTripReserve(input={}){
    const candidates=(input.candidates||[]).slice(0,16).map(place=>({providerPlaceId:String(place.providerPlaceId||place.id||'').replace(/^places\//,''),name:place.name,category:place.requestCategory||place.category,coordinates:place.coordinates||place.location}));
    if(!candidates.length)return immutable({kind:'trip-reserve-options',options:[],source:'places'});
    const response=await run('discovery.rank',{surface:'trip-composer',domain:'trip',currentMoment:{surface:'trip-composer'},contract:{travelOrder:input.travelOrder||{},operation:input.mode,selectedMoment:input.current||null,day:input.day||null,instruction:'Rank only the supplied verified reserve. Explain briefly how each option fits this specific change. Preserve confirmed constraints. Do not claim opening hours, transport times, live prices or suitability without evidence.'},candidates},{tier:'fast',fallback:false,context:{surface:'trip-composer',purpose:'trip-reserve-choice'}});
    if(response?.ok!==true||response?.meta?.fallback!==false)throw contractError('TRIP_RESERVE_AI_UNAVAILABLE','Luvia konnte die Alternativen gerade nicht einordnen. Eure Tagesroute bleibt erhalten.');
    const allowed=new Set(candidates.map(item=>item.providerPlaceId)),rankings=response.data?.rankings||[];
    return immutable({kind:'trip-reserve-options',source:'ai',options:rankings.filter(item=>allowed.has(String(item.entityId))).sort((a,b)=>Number(b.score)-Number(a.score)).slice(0,5).map(item=>({providerPlaceId:String(item.entityId),reason:(item.reasons||[]).map(reason=>typeof reason==='string'?reason:reason.label||reason.text||'').filter(Boolean).slice(0,1).join(' ')}))});
  }

  async function auditTripItinerary(input = {}) {
    const itinerary=input.itinerary;
    if(itinerary?.kind!=='ai-trip-itinerary'||itinerary?.owner!=='intelligence')throw contractError('TRIP_AUDIT_ITINERARY_REQUIRED','Für den unabhängigen Qualitätscheck fehlt der vollständige KI-Entwurf.');
    const {evidenceCatalog:_evidence,dayPolicies:_policies,contractIssues:_issues,...compactItinerary}=itinerary;
    const auditIds=new Set([...(itinerary.days||[]).flatMap(day=>(day.entries||[]).map(entry=>entry.providerPlaceId)),...(itinerary.backupOptions||[]).map(item=>item.providerPlaceId)]);
    const auditDayCount=Math.max(1,Math.min(366,Array.isArray(itinerary?.dayPolicies)?itinerary.dayPolicies.length:Array.isArray(itinerary?.days)?itinerary.days.length:1)),auditCandidateLimit=Math.max(160,auditDayCount*9),response=await run('trip.audit',{surface:'trip-composer',retryGeneration:Math.max(0,Math.round(Number(input.retryGeneration)||0)),locale:input.locale||'de-DE',timeZone:input.timeZone||input.destination?.timezone||'',travelOrder:input.brief?.travelOrder||{},planningPolicy:input.brief?.policy||{},destination:input.destination||null,planningContract:{dayPolicies:itinerary.dayPolicies||[],allDaysExactlyOnce:true,useOnlyCandidateIds:true,preserveAllHardConstraints:true,travelPromiseRequired:true,explicitDeliberateFreeTime:true,wholeTripBalance:true,uncertaintyMapRequired:true,verifiedClaimsRequireEvidence:true,bookingDependenciesRequired:true,neighborhoodRecommendationRequired:true,clusterDaysGeographically:true,arrivalDepartureAware:true,prepareBackupOptions:true},itinerary:compactItinerary,poolQuality:input.poolQuality||null,candidateCatalog:(Array.isArray(input.candidates)?input.candidates:[]).filter(item=>auditIds.has(String(item.providerPlaceId||item.id||'').replace(/^places\//,''))).slice(0,auditCandidateLimit).map(item=>({providerPlaceId:String(item?.providerPlaceId||item?.provider_place_id||item?.id||'').replace(/^places\//,''),name:String(item?.name||''),category:String(item?.requestCategory||item?.category||''),coordinates:item?.coordinates||item?.location||null}))},{tier:'default',fallback:false,workflowId:input.workflowId||null,context:{surface:'trip-composer',purpose:'independent-trip-quality-audit',qualityLane:'terra-audit'}});
    if(response?.ok!==true||response?.meta?.fallback!==false)throw contractError('TRIP_AUDIT_AI_REQUIRED','Der unabhängige KI-Qualitätscheck ist gerade nicht verfügbar.');
    const value=response?.data||response?.result||response,missingEvidence=/(?:nicht|noch nicht|unbelegt|unverified|unknown).{0,45}(?:belegt|bestätigt|verifiziert|nachweisbar|nachgewiesen|belastbar|evidence)|(?:fehlend|keine|without|missing).{0,45}(?:daten|data|beleg|evidence|flugzeit|opening|price|route|availability)/i,rawIssues=(value?.issues||[]).map(item=>({code:String(item?.code||'').trim().slice(0,100),severity:item?.severity==='blocked'?'blocked':'attention',dayDate:String(item?.dayDate||'').trim().slice(0,10),providerPlaceIds:[...new Set((item?.providerPlaceIds||[]).map(id=>String(id||'').replace(/^places\//,'').trim()).filter(Boolean))].slice(0,12),message:String(item?.message||'').trim().slice(0,500),suggestedRepair:String(item?.suggestedRepair||'').trim().slice(0,500)})).filter(item=>item.code&&item.message),downgradedUncertainty=rawIssues.filter(item=>item.severity==='blocked'&&missingEvidence.test(`${item.message} ${item.suggestedRepair}`)),issues=rawIssues.map(item=>downgradedUncertainty.includes(item)?{...item,severity:'attention'}:item),promiseAssessment={kept:value?.promiseAssessment?value.promiseAssessment.kept===true:true,summary:String(value?.promiseAssessment?.summary||'').trim().slice(0,500),missedCommitments:[...new Set((value?.promiseAssessment?.missedCommitments||[]).map(item=>String(item||'').trim()).filter(Boolean))].slice(0,20)};
    if(!promiseAssessment.kept&&downgradedUncertainty.length&&rawIssues.filter(item=>item.severity==='blocked').every(item=>downgradedUncertainty.includes(item)))promiseAssessment.kept=true;
    if(!promiseAssessment.kept&&!issues.some(item=>item.severity==='blocked'))issues.push({code:'TRAVEL_PROMISE_MISSED',severity:'blocked',dayDate:'',providerPlaceIds:[],message:promiseAssessment.summary||'Der Entwurf hält das bestätigte Reiseversprechen noch nicht vollständig.',suggestedRepair:promiseAssessment.missedCommitments.length?`Erfülle diese fehlenden Zusagen: ${promiseAssessment.missedCommitments.join(' · ')}`:'Baue den Entwurf erneut gegen jede Zusage des Reiseversprechens auf.'});
    const blocked=issues.filter(item=>item.severity==='blocked'),dimensions=(value?.dimensions||[]).map(item=>({id:String(item?.id||'').trim().slice(0,80),label:String(item?.label||'').trim().slice(0,120),score:Math.max(0,Math.min(100,Math.round(Number(item?.score)||0))),status:['pass','attention','blocked'].includes(item?.status)?item.status:'attention',summary:String(item?.summary||'').trim().slice(0,360)})).filter(item=>item.id&&item.label).slice(0,12).map(item=>!blocked.length&&downgradedUncertainty.length&&item.status==='blocked'?{...item,status:'attention'}:item);
    return immutable({owner:'intelligence',contractId:'intelligence.v1',kind:'ai-trip-quality-audit',source:'ai',readyForReview:blocked.length===0&&promiseAssessment.kept,score:Math.max(0,Math.min(100,Math.round(Number(value?.score)||0))),headline:String(value?.headline||'Qualitätscheck des Reiseentwurfs').trim().slice(0,240),promiseAssessment,dimensions,issues,strengths:[...new Set((value?.strengths||[]).map(item=>String(item||'').trim()).filter(Boolean))].slice(0,12),repairInstructions:[...new Set((value?.repairInstructions||[]).map(item=>String(item||'').trim()).filter(Boolean))].slice(0,20),confidence:Math.max(0,Math.min(1,Number(value?.confidence)||0)),automaticMutation:false});
  }

  function travelOrchestration() {
    return root.LuviaTravelOrchestrationCoreV1 ||
      providerUnavailable('LuviaTravelOrchestrationCoreV1');
  }

  function languageCompiler() {
    return root.LuviaHumanAILanguageCompilerCoreV1 ||
      providerUnavailable('LuviaHumanAILanguageCompilerCoreV1');
  }

  function compileHumanActions(input = {}) {
    return immutable(languageCompiler().compile(input));
  }

  function getHumanActionLanguageCoverage(catalog = []) {
    return immutable(languageCompiler().describeCoverage(catalog));
  }

  function safetyPolicy() {
    return root.LuviaHumanAISafetyPolicyCoreV1 ||
      providerUnavailable('LuviaHumanAISafetyPolicyCoreV1');
  }

  function evaluateHumanActionAuthority(input = {}) {
    return immutable(safetyPolicy().evaluate(input));
  }

  function getHumanActionSafetyCoverage(catalog = []) {
    return immutable(safetyPolicy().describeCoverage(catalog));
  }

  function actionLifecycle() {
    return root.LuviaHumanAIActionLifecycleCoreV1 ||
      providerUnavailable('LuviaHumanAIActionLifecycleCoreV1');
  }

  function compileHumanActionLifecycle(action = {}) {
    return immutable(actionLifecycle().compileLifecycle(action));
  }

  function createHumanActionLifecycle(input = {}) {
    return immutable(actionLifecycle().createInstance(input));
  }

  function advanceHumanActionLifecycle(instance = {}, event = {}) {
    return immutable(actionLifecycle().transition(instance, event));
  }

  function getHumanActionLifecycleCoverage(catalog = []) {
    return immutable(actionLifecycle().describeCoverage(catalog));
  }

  function capabilityDiscovery() {
    return root.LuviaHumanAICapabilityDiscoveryCoreV1 ||
      providerUnavailable('LuviaHumanAICapabilityDiscoveryCoreV1');
  }

  function discoverHumanActionCapabilities(input = {}) {
    return immutable(capabilityDiscovery().discover(input));
  }

  function getHumanActionCapabilityCoverage(catalog = []) {
    return immutable(capabilityDiscovery().describeCoverage(catalog));
  }

  function consumerProjection() {
    return root.LuviaHumanAIConsumerProjectionCoreV1 ||
      providerUnavailable('LuviaHumanAIConsumerProjectionCoreV1');
  }

  function projectHumanActionConsumer(input = {}) {
    return immutable(consumerProjection().projectCapability(input));
  }

  function projectHumanActionConversation(compiled = {}) {
    return immutable(consumerProjection().projectIntentSummary(compiled));
  }

  function projectHumanActionPreview(input = {}) {
    return immutable(consumerProjection().projectPreview(input));
  }

  function projectHumanActionReceipt(input = {}) {
    return immutable(consumerProjection().projectReceipt(input));
  }

  function getHumanActionConsumerCoverage(catalog = []) {
    return immutable(consumerProjection().describeCoverage(catalog));
  }

  function parityFailureMatrix() {
    return root.LuviaHumanAIParityFailureMatrixCoreV1 ||
      providerUnavailable('LuviaHumanAIParityFailureMatrixCoreV1');
  }

  function compileHumanActionParityMatrix(input = {}) {
    return immutable(parityFailureMatrix().compileMatrix(input));
  }

  function queryHumanActionParityMatrix(rows = [], filters = {}) {
    return immutable(parityFailureMatrix().query(rows, filters));
  }

  function projectHumanActionParityRow(row = {}) {
    return immutable(parityFailureMatrix().projectRow(row));
  }

  function getHumanActionParityCoverage(rows = []) {
    return immutable(parityFailureMatrix().describeCoverage(rows));
  }

  function planningTrace(input = {}) {
    return immutable(travelOrchestration().planningTrace(input));
  }

  function gateContext(input = {}) {
    return immutable(travelOrchestration().gateContext(input));
  }

  function causalFeedback(input = {}) {
    return immutable(travelOrchestration().causalFeedback(input));
  }

  async function run(capability, input = {}, options = {}) {
    domainCore().assertCapabilityMode(capability, ['READ', 'DRAFT']);
    return immutable(await runtime().run(capability, input, options));
  }

  async function ask(message, options = {}) {
    return immutable(await runtime().ask(message, options));
  }

  async function rank(input = {}, options = {}) {
    return immutable(await runtime().rank(input, options));
  }

  async function recommend(input = {}, options = {}) {
    return immutable(await runtime().recommend(input, options));
  }

  async function explain(input = {}, options = {}) {
    return immutable(await runtime().explain(input, options));
  }

  async function summarize(text, options = {}) {
    return immutable(await runtime().summarize(text, options));
  }

  async function createProposal(input = {}) {
    const provider = root.LuviaAIProposals;

    if (typeof provider?.create !== 'function') {
      providerUnavailable('LuviaAIProposals.create');
    }

    const intent = domainCore().createProposalIntent(input);
    return immutable(await provider.create(intent));
  }

  function getMemorySnapshot() {
    const provider = root.LuviaAIMemory;

    if (typeof provider?.snapshot !== 'function') {
      providerUnavailable('LuviaAIMemory.snapshot');
    }

    return domainCore().projectMemorySnapshot(provider.snapshot());
  }

  async function confirmLearningSignal(signal = {}) {
    const provider = root.LuviaAIMemory;
    if (typeof provider?.confirmSignal !== 'function') providerUnavailable('LuviaAIMemory.confirmSignal');
    return immutable(await provider.confirmSignal(signal));
  }

  async function dismissLearningSignal(signal = {}) {
    const provider = root.LuviaAIMemory;
    if (typeof provider?.dismissSignal !== 'function') providerUnavailable('LuviaAIMemory.dismissSignal');
    return immutable(await provider.dismissSignal(signal));
  }

  function getSystemSnapshot() {
    const core = domainCore();
    const diagnostics = root.LuviaAI?.diagnostics?.() || {};

    return core.createSystemSnapshot({
      status: root.LuviaAI ? 'ready' : 'contract-only',
      provider: diagnostics.provider || null,
      serverAuthoritativeModels:
        diagnostics.serverAuthoritativeModels === true,
      runtimeVersion: diagnostics.version || null,
      memory: diagnostics.memory || null,
      proposals: diagnostics.proposals || null
    });
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError(
        'Intelligence Contract v1: subscribe(listener) requires a function.'
      );
    }

    const subscriptions = [];
    const bind = (provider, name, project) => {
      if (typeof provider?.subscribe !== 'function') return;
      const unsubscribe = provider.subscribe((value, reason) => listener(immutable({
        name,
        version: VERSION,
        source: 'intelligence',
        occurredAt: new Date().toISOString(),
        detail: domainCore().sanitize(project(value, reason))
      })));
      if (typeof unsubscribe === 'function') subscriptions.push(unsubscribe);
    };

    bind(root.LuviaAI, 'ai.changed', value => value || {});
    bind(root.LuviaAIProposals, 'ai.proposal.changed', (proposal, reason) => ({ reason, proposal }));
    bind(root.LuviaAIMemory, 'ai.memory.changed', (snapshot, reason) => ({ reason, snapshot }));

    return () => subscriptions.splice(0).forEach(unsubscribe => unsubscribe());
  }

  function diagnostics() {
    const core = root.LuviaIntelligenceDomainContractCoreV1;

    return Object.freeze({
      contractId: CONTRACT_ID,
      version: VERSION,
      runtimeVersion: RUNTIME_VERSION,
      ready: Boolean(core && root.LuviaAI),
      providers: Object.freeze({
        domainCore: Boolean(core),
        travelOrchestration: Boolean(root.LuviaTravelOrchestrationCoreV1),
        humanActionLanguageCompiler: Boolean(root.LuviaHumanAILanguageCompilerCoreV1),
        humanActionSafetyPolicy: Boolean(root.LuviaHumanAISafetyPolicyCoreV1),
        humanActionLifecycle: Boolean(root.LuviaHumanAIActionLifecycleCoreV1),
        humanActionCapabilityDiscovery: Boolean(root.LuviaHumanAICapabilityDiscoveryCoreV1),
        humanActionConsumerProjection: Boolean(root.LuviaHumanAIConsumerProjectionCoreV1),
        humanActionParityFailureMatrix: Boolean(root.LuviaHumanAIParityFailureMatrixCoreV1),
        preferenceResolver: Boolean(root.LuviaTripPreferenceResolutionCoreV1),
        travelCalendar: Boolean(root.LuviaOpenAIProvider?.invoke),
        runtime: Boolean(root.LuviaAI),
        proposals: Boolean(root.LuviaAIProposals?.create),
        memory: Boolean(root.LuviaAIMemory?.snapshot)
      }),
      ownership: Object.freeze({
        intelligenceStateOnly: true,
        foreignDomainMutation: false,
        journeyTimelineOwner: false
      })
    });
  }

  const api = Object.freeze({
    contractId: CONTRACT_ID,
    version: VERSION,
    runtimeVersion: RUNTIME_VERSION,
    reads: Object.freeze({
      getCapabilities,
      getCapability,
      getDomains,
      getTools,
      getModelTiers,
      getPolicy,
      resolveTripPreferences,
      rankPlaceCandidates,
      composeDayGuidance,
      getTravelCalendarEvidence,
      interpretTripBrief,
      suggestTripDestinations,
      composeTripItinerary,
      auditTripItinerary,
      rankTripReserve,
      planningTrace,
      gateContext,
      causalFeedback,
      compileHumanActions,
      getHumanActionLanguageCoverage,
      evaluateHumanActionAuthority,
      getHumanActionSafetyCoverage,
      compileHumanActionLifecycle,
      createHumanActionLifecycle,
      advanceHumanActionLifecycle,
      getHumanActionLifecycleCoverage,
      discoverHumanActionCapabilities,
      getHumanActionCapabilityCoverage,
      projectHumanActionConsumer,
      projectHumanActionConversation,
      projectHumanActionPreview,
      projectHumanActionReceipt,
      getHumanActionConsumerCoverage,
      compileHumanActionParityMatrix,
      queryHumanActionParityMatrix,
      projectHumanActionParityRow,
      getHumanActionParityCoverage,
      getMemorySnapshot,
      getSystemSnapshot,
      subscribe
    }),
    commands: Object.freeze({ createProposal, confirmLearningSignal, dismissLearningSignal }),
    events: EVENTS,
    getCapabilities,
    getCapability,
    getDomains,
    getTools,
    getModelTiers,
    getPolicy,
    resolveTripPreferences,
    rankPlaceCandidates,
    composeDayGuidance,
    getTravelCalendarEvidence,
    interpretTripBrief,
    suggestTripDestinations,
    composeTripItinerary,
    auditTripItinerary,
    planningTrace,
    gateContext,
    causalFeedback,
    compileHumanActions,
    getHumanActionLanguageCoverage,
    evaluateHumanActionAuthority,
    getHumanActionSafetyCoverage,
    compileHumanActionLifecycle,
    createHumanActionLifecycle,
    advanceHumanActionLifecycle,
    getHumanActionLifecycleCoverage,
    discoverHumanActionCapabilities,
    getHumanActionCapabilityCoverage,
    projectHumanActionConsumer,
    projectHumanActionConversation,
    projectHumanActionPreview,
    projectHumanActionReceipt,
    getHumanActionConsumerCoverage,
    compileHumanActionParityMatrix,
    queryHumanActionParityMatrix,
    projectHumanActionParityRow,
    getHumanActionParityCoverage,
    getMemorySnapshot,
    getSystemSnapshot,
    run,
    ask,
    rank,
    recommend,
    explain,
    summarize,
    createProposal,
    confirmLearningSignal,
    dismissLearningSignal,
    subscribe,
    diagnostics
  });

  root.LuviaIntelligenceContractV1 = api;
  root.LuviaIntelligenceContract = api;

  root.LuviaFeatureFlagRegistry?.register?.({
    id: 'intelligence.s16-01-explainable-planning-trace',
    owner: 'intelligence',
    description: 'Shows the owner-routed evidence and decision trace without storing raw private context.',
    defaultEnabled: true,
    temporary: true
  });
  root.LuviaFeatureFlagRegistry?.register?.({id:'intelligence.s16-02-on-device-context-gate',owner:'intelligence',description:'Purpose-bound, deny-by-default context gate over an explicit LocationPort grant.',defaultEnabled:true,temporary:true});
  root.LuviaFeatureFlagRegistry?.register?.({id:'intelligence.s16-06-causal-feedback-learning',owner:'intelligence',description:'Explicit confirmed-outcome feedback may prepare a bounded Identity-owned preference change.',defaultEnabled:true,temporary:true});

  root.LuviaGlobalContracts?.register?.({
    id: CONTRACT_ID,
    version: VERSION,
    required: false,
    probe: () => ({
      available: diagnostics().ready,
      detail: 'Intelligence v1 owner adapter'
    })
  });
})();
