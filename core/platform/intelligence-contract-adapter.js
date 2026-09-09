(() => {
  'use strict';

  const CONTRACT_ID = 'intelligence.v1';
  const VERSION = '1';
  const RUNTIME_VERSION = '1.19.0-resumable-trip-sections';
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
        goalTypes:['destination','time','accommodation','transport','food','culture','sights','nature','water','nightlife','shopping','wellness','family','active','rest','open'],
        constraintKeys:{destination:'named destination or region',destinationScope:'city|region|country|coast|open',countryPreference:'named country or abroad',timeWindow:'original approximate period',season:'spring|summer|autumn|winter',month:'named month',year:'four digit year',durationDays:'integer calendar days only when the user says days',durationNights:'integer nights only when the user says nights',dateFlexibility:'fixed|days|weeks|open',travelers:'short group description',adults:'integer',children:'integer',childAges:'comma-separated ages',schoolHolidayRequired:'true|false',schoolHolidayRegion:'governing country/state/region',accommodation:'requested kind',transport:'requested mode',departureOrigin:'named home city, station or airport',maximumFlightMinutes:'integer only when explicitly stated',flightPreference:'short|medium|long|open or description',arrivalTime:'HH:mm local time',departureTime:'HH:mm local time',arrivalRecoveryMinutes:'integer',departureBufferMinutes:'integer',category:'one goal type',excludeCategory:'one goal type',categoryMix:'balanced|favorites|surprising',pace:'slow|balanced|active',budgetLevel:'economy|balanced|generous|open',tripBudget:'amount as stated',dailyBudget:'amount as stated',currency:'ISO code or stated currency',splurgeDay:'special higher-budget moment',dietary:'requirement',accessibility:'requirement',mobility:'requirement',maximumPerDay:'1|2|3|4',notBefore:'HH:mm',notAfter:'HH:mm',wakeTime:'HH:mm',bedTime:'HH:mm',breakfastTime:'HH:mm',lunchWindow:'time range as stated',dinnerTime:'HH:mm',napWindow:'time range as stated',energyPattern:'morning|balanced|evening or description',jetLagSensitivity:'low|medium|high',freeTimePercent:'0-100',maximumTransferMinutes:'integer',dayTripRadiusKm:'integer',baseLocation:'named area',spatialClustering:'true|false',weatherFallback:'true|false',indoorOutdoorBalance:'description',planBPerDay:'true|false',reservationStyle:'early|flexible|minimal or description',bookingDeadline:'date or relative period',mustReserve:'specific wish',groupDecisionMode:'consensus|majority|individual-turns or description',fairnessRequired:'true|false',memberPriority:'person and wish',evidenceFreshness:'description',recheckBeforeDays:'integer',mustDo:'specific wish',exclude:'specific exclusion'},
        experienceKeys:{experienceWish:'specific activity or experience, not a generic POI category',avoidExperience:'experience the party dislikes',discoveryStyle:'familiar highlights|local discovery|surprise, only if stated',eveningStyle:'dinner|live music|bars|dancing|quiet, only if stated'},
        rule:'Output adults and children as separate integer constraints whenever the party is explicit; no children means children=0, never merely a group description. The current trip overrides profile defaults about children, stroller, budget and pace; preserve medical and dietary restrictions. A beach day is water with a mustDo for real beach time, never a request for parks. Old town/harbour exploration is sights/water, not automatically museums or art galleries. Nightlife is its own category even when also in mustDo. Interpret optional tripPreferences.experiences as taste, without assuming tastes from age. When invitees are still missing, do not claim their preferences or agreement are known. Use canonical keys when applicable. Keep month, year and stated duration as separate constraints so Luvia can offer exact date windows before planning. Put concrete wishes such as a named museum, beach day, child-friendly activity, restaurant style or shopping wish into mustDo/category constraints instead of generalizing them away. Other constraints retain descriptive keys. Never discard unsupported requirements or invent destinations, dates, holiday periods or place facts.'}
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
      surface:'trip-destination-inspiration',userGoal:requestBrief,tripPreferences:input.tripPreferences||{},globalPreferences:input.profilePreferences||{},destination:null,
      excludedDestinations:excluded,variationSeed:String(input.variationSeed||''),
      task:'First distinguish a fixed destination from an open destination request. If the user explicitly chooses one city, island or travel region, return exactly ONE searchPlan for that destination and explain briefly that you are keeping their chosen destination. Do not offer other cities. A departure airport, excluded place, comparison or example is not a chosen destination. A country or broad coast alone is still open unless the user explicitly wants that whole region. For an open request return exactly five distinct real named cities or travel regions ranked by fit. For ambiguous alternative destinations ask one followUpQuestion instead of silently choosing one. Treat abroad, coast, travel-distance limits and exclusions as mandatory for open recommendations. Each searchPlans.query contains only the unambiguous destination name and country. Do not invent a geographic identity or inherit an active trip. Exclude excludedDestinations from open recommendations only; they must never override a fixed user destination. Climate is only a seasonal expectation, never current weather. No price or availability claims. Keep reasoningSummary short in natural German. Provider geocoding verifies every identity before use.'
    },{fallback:false,context:{surface:'trip-destination-inspiration'}});
    if(response?.ok===false||response?.meta?.fallback)throw Object.assign(new Error('Die KI konnte eure Reisewünsche gerade nicht auswerten.'),{code:'TRIP_INSPIRATION_UNAVAILABLE'});
    const value=response?.data||response?.result||response,plans=(value?.searchPlans||[]).map(plan=>({query:String(plan?.query||'').trim(),reason:String(plan?.reason||'').trim().slice(0,360),fitSignals:[...new Set((plan?.fitSignals||[]).map(item=>String(item||'').trim()).filter(Boolean))].slice(0,3),weight:Math.max(0,Math.min(1,Number(plan?.weight)||0))})).filter(plan=>plan.query),queries=[...new Set(plans.map(plan=>plan.query))].slice(0,5),ideas=queries.map(query=>plans.find(plan=>plan.query===query));
    if(!queries.length)throw Object.assign(new Error(value?.followUpQuestion?.text||'Beschreibt noch etwas genauer, was euch an der Reise wichtig ist.'),{code:'TRIP_INSPIRATION_MORE_DETAIL'});
    return immutable({owner:'intelligence',contractId:'intelligence.v1',kind:'destination-inspiration',source:'ai',mode:queries.length===1?'fixed-destination':'inspiration',queries,ideas,summary:String(value.reasoningSummary||'').slice(0,800)});
  }

  // Only this compact projection reaches a model. The verified full reserve stays
  // in the workflow and remains the source for later changes.
  function placeReferenceCodec(candidates){
    const encoded=new Map(),decoded=new Map(),names=new Map();
    const sorted=[...candidates].sort((a,b)=>String(a.providerPlaceId||a.id||'').localeCompare(String(b.providerPlaceId||b.id||'')));
    sorted.forEach(place=>{const id=String(place.providerPlaceId||place.id||'');if(id&&!encoded.has(id)){const ref='p'+(encoded.size+1);encoded.set(id,ref);decoded.set(ref,id);names.set(ref,String(place.name||id));}});
    const referenceKey=/^(providerPlaceId|forProviderPlaceId|providerPlaceIds|evidencePlaceIds|excludedProviderPlaceIds|alternatives|entityId)$/;
    function convert(value,map,key=''){
      if(Array.isArray(value))return value.map(item=>convert(item,map,key));
      if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([name,item])=>[name,convert(item,map,name)]));
      if(typeof value==='string'&&key==='evidenceRefs'){const match=value.match(/^place:(.+):(identity|provider-snapshot)$/);if(match&&map.has(match[1]))return 'place:'+map.get(match[1])+':'+match[2];}
      if(typeof value==='string'&&referenceKey.test(key))return map.get(value)||value;
      // Model-written prose must not retain temporary aliases that a later
      // candidate subset or repair could reinterpret as another Place.
      return typeof value==='string'&&map===decoded?value.replace(/\bp[1-9]\d*\b/g,ref=>names.get(ref)||ref):value;
    }
    return {encode:value=>convert(value,encoded),decode:value=>convert(value,decoded),fingerprint:sectionFingerprint([...encoded.keys()])};
  }

  function experienceEvidence(place){
    const types=[...new Set([place.primaryType,...(place.types||[])].filter(Boolean))];
    const families=[['beach',['beach']],['harbour',['marina']],['park-garden',['park','garden','park_recreation_area']],['museum-gallery',['museum','art_gallery']],['monument',['monument','historical_monument','historical_landmark']],['market',['market']],['shopping',['shopping_mall','clothing_store','department_store','store']],['food',['restaurant','cafe','bakery','meal_takeaway']],['live-evening',['live_music_venue','concert_hall','performing_arts_theater','comedy_club']],['bar-club',['bar','pub','cocktail_bar','wine_bar','night_club','jazz_club','karaoke_bar']],['participatory',['sports_activity_location','bowling_alley','escape_room','swimming_pool','amusement_park','aquarium','zoo']]];
    const kinds=families.filter(([,values])=>types.some(type=>values.includes(type)||values.includes('restaurant')&&type.endsWith('_restaurant'))).map(([key])=>key);
    const warnings=[];
    if(types.includes('nightlife_spot')&&kinds.includes('monument')&&!kinds.some(kind=>['bar-club','live-evening'].includes(kind)))warnings.push('Broad nightlife label conflicts with monument evidence; do not count this as an evening venue without specific venue evidence.');
    if(kinds.includes('park-garden')&&/\b(church|iglesia|cathedral|kirche|catedral|temple)\b/i.test(place.name||''))warnings.push('Name and outdoor-park classification disagree; verify actual identity instead of inventing a nature visit.');
    return {kinds:kinds.length?kinds:['unspecified'],identityWarnings:warnings,providerNativeTypes:(place.providerNativeTypes||[]).slice(0,12),description:String(place.description||place.editorialSummary?.text||place.editorialSummary||'').slice(0,420),address:String(place.formattedAddress||place.address||'').slice(0,220)};
  }
  const EXPERIENCE_QUALITY={
    task:'Compose experiences the party would choose, not a quota of nearby POIs. Explain internally what someone actually does at each venue and why the time allocation makes sense. Use the stated tastes, not age stereotypes.',
    identity:'Search category is a retrieval hint, never provider evidence. Check name, original categories, description and address together. Skip contradictory identities unless source evidence resolves the conflict. A monument is not nightlife; a church is not a park; a sports shop is not a sporting activity.',
    variety:'Balance experience kinds across the WHOLE trip: participating, tasting, exploring neighbourhoods, water, social evenings and deliberate rest when wanted. Different parks or galleries do not constitute different experiences. Repeated parks, galleries, generic shops or sightseeing require an explicit user preference or a distinct, evidenced purpose; never fill an otherwise weak day with them.',
    relevance:'A wish for sea requires meaningful beach/coast time. An old-town wish does not imply daily art museums. Do not allocate 90 minutes to an ordinary shop or 120 minutes to a marker; durations must fit the actual activity. Prefer a few memorable and feasible anchors with supporting meals and free time.',
    limits:'Do not invent tours, workshops, sports rentals, events, restaurant service or booking availability from a place name. If the pool cannot fulfill a concrete wish, report the precise missing experience for targeted research rather than substituting an unrelated park. Real repeated beach holidays or museum trips are welcome when requested.'
  };
  function itineraryExperienceBalance(itinerary,candidates){
    const byId=new Map(candidates.map(place=>[String(place.providerPlaceId||place.id||'').replace(/^places\//,''),place])),counts=new Map(),daysByKind=new Map();
    const days=(itinerary.days||[]).map(day=>({date:day.date,experiences:(day.entries||[]).map(entry=>{const evidence=experienceEvidence(byId.get(entry.providerPlaceId)||entry);for(const kind of evidence.kinds){counts.set(kind,(counts.get(kind)||0)+1);if(!daysByKind.has(kind))daysByKind.set(kind,new Set());daysByKind.get(kind).add(day.date);}return{providerPlaceId:entry.providerPlaceId,durationMinutes:entry.durationMinutes,kinds:evidence.kinds,identityWarnings:evidence.identityWarnings};})}));
    return {days,kindCounts:Object.fromEntries(counts),daysPerKind:Object.fromEntries([...daysByKind].map(([kind,dates])=>[kind,dates.size])),rule:'Assess repetitions against explicit wishes and distinct experiences; counts are evidence, not a blanket prohibition.'};
  }
  function modelPlace(place){
    const c=place.coordinates||place.location||{};
    return {providerPlaceId:place.providerPlaceId,name:place.name,category:place.category||place.requestCategory,primaryType:place.primaryType||null,types:place.types||[],searchTarget:place.tripSearchTarget||null,
      spatialAreaId:Math.floor(Number(c.latitude??c.lat)*111.32/2)+':'+Math.floor(Number(c.longitude??c.lng)*111.32*Math.cos(Number(c.latitude??c.lat)*Math.PI/180)/2),
      coordinates:{latitude:Number(c.latitude??c.lat),longitude:Number(c.longitude??c.lng)},
      experienceEvidence:experienceEvidence(place),...(place.facts?{facts:place.facts}:{})};
  }
  function sectionCandidates(candidates,used,dayCount,priority=[]){
    const buckets=new Map();
    for(const place of candidates){if(used.has(place.providerPlaceId))continue;const key=place.category||'other';if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(place);}
    for(const bucket of buckets.values())bucket.sort((a,b)=>Number(Boolean(b.tripSearchTarget))-Number(Boolean(a.tripSearchTarget)));
    const categories=[...buckets.keys()].sort((a,b)=>Number(!priority.includes(a))-Number(!priority.includes(b)));
    const limit=Math.max(dayCount*4,Math.min(64,dayCount*7+14)),result=[];
    const areas=new Map(),kinds=new Map();
    while(result.length<limit&&categories.some(key=>buckets.get(key).length))for(const key of categories){
      if(result.length>=limit)break;const bucket=buckets.get(key);if(!bucket.length)continue;
      let best=0,bestScore=-Infinity;
      bucket.forEach((place,index)=>{const area=modelPlace(place).spatialAreaId,kind=experienceEvidence(place).kinds.join('|'),score=Number(Boolean(place.tripSearchTarget))*2-(areas.get(area)||0)*3-(kinds.get(kind)||0)*2-index*.02;if(score>bestScore){best=index;bestScore=score;}});
      const place=bucket.splice(best,1)[0],area=modelPlace(place).spatialAreaId,kind=experienceEvidence(place).kinds.join('|');areas.set(area,(areas.get(area)||0)+1);kinds.set(kind,(kinds.get(kind)||0)+1);result.push(place);
    }
    return result;
  }
  function sectionFingerprint(value){const text=JSON.stringify(value);let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619)}return (hash>>>0).toString(16);}

  // Research hypotheses are not user requirements. Only measured pool coverage
  // reaches composition and audit; the full search log stays in the workflow.
  function poolPlanningEvidence(pool){
    if(!pool)return null;
    const keys=['candidateCount','target','categoryTargets','missingCategories','thinCategories','distinctAreas','minimumDistinctAreas','largestAreaShare','spatialReady'];
    return Object.fromEntries(keys.filter(key=>pool[key]!=null).map(key=>[key,pool[key]]));
  }

  async function composeTripItinerary(input = {}) {
    const clean=(value,limit=0)=>{const result=value==null?'':String(value).trim();return limit?result.slice(0,limit):result};
    const minute=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value||'')?Number(value.slice(0,2))*60+Number(value.slice(3)):null;
    const clock=value=>`${String(Math.max(0,Math.min(23,Math.floor(value/60)))).padStart(2,'0')}:${String(Math.max(0,Math.min(59,value%60))).padStart(2,'0')}`;
    const rawDays=(Array.isArray(input.days)?input.days:[]).slice(0,366).map((item,index)=>({date:clean(item?.date,10),label:clean(item?.label,80)||`Tag ${index+1}`}));
    const planningDayCount=Math.max(1,Math.min(366,Array.isArray(input.days)?input.days.length:1)),planningCandidateLimit=4000,candidateInput=(Array.isArray(input.candidates)?input.candidates:[]).slice(0,planningCandidateLimit).map(item=>{
      const coordinates=item?.coordinates||item?.location||{};
      const providerPlaceId=clean(item?.providerPlaceId||item?.provider_place_id||item?.id,240).replace(/^places\//,''),provider=clean(item?.provider||item?.source,80),observedAt=clean(item?.providerObservedAt||item?.ownerObservedAt,40),evidenceRefs=[`place:${providerPlaceId}:identity`,...(provider&&observedAt?[`place:${providerPlaceId}:provider-snapshot`]:[])];
      return {providerPlaceId,name:clean(item?.name,200),category:clean(item?.requestCategory||item?.category,80),tripSearchTarget:clean(item?.tripSearchTarget,200),primaryType:clean(item?.primaryType||item?.primary_type||item?.type,80),providerNativeTypes:(item?.providerNativeTypes||[]).slice(0,12),description:clean(item?.description||item?.editorialSummary?.text||item?.editorialSummary,420),types:(item?.types||[]).slice(0,12),formattedAddress:clean(item?.formattedAddress||item?.address,280),coordinates:{latitude:Number(coordinates.latitude??coordinates.lat),longitude:Number(coordinates.longitude??coordinates.lng)},provider,observedAt,evidenceRefs,facts:{features:Object.fromEntries(Object.entries(item?.features||{}).filter(([key,value])=>['servesVegetarianFood','servesVeganFood','wheelchairAccessible','strollerAccessible'].includes(key)&&typeof value==='boolean')),priceLevel:clean(item?.priceLevel||item?.price_level,60),openNow:typeof item?.openNow==='boolean'?item.openNow:null,businessStatus:clean(item?.businessStatus||item?.business_status,80)}};
    }).filter(item=>item.providerPlaceId&&item.name&&Number.isFinite(item.coordinates.latitude)&&Number.isFinite(item.coordinates.longitude));
    if(!rawDays.length)throw contractError('TRIP_ITINERARY_DAYS_REQUIRED','Für den Reiseentwurf fehlen die Reisetage.');
    if(!candidateInput.length)throw contractError('TRIP_ITINERARY_CANDIDATES_REQUIRED','Für den Reiseentwurf fehlen überprüfte Places.');
    const references=placeReferenceCodec(candidateInput);
    const order=input.brief?.travelOrder||{},planningPolicy=input.brief?.policy||{},rhythm=order.rhythm||{},logistics=order.logistics||{},pace=String(input.brief?.tripPreferences?.pace||input.tripPreferences?.pace||'balanced'),baseTarget=pace==='active'?4:pace==='slow'?2:3,maximumMomentsPerDay=Math.max(1,Math.min(4,Number(planningPolicy.maximumPerDay)||4)),baseStart=minute(planningPolicy.notBefore)??minute(rhythm.dayStart)??570,baseEnd=minute(planningPolicy.notAfter)??minute(rhythm.dayEnd)??1260,arrivalTime=minute(logistics.arrival?.localTime),departureTime=minute(logistics.departure?.localTime);
    const dayInput=rawDays.map((day,index)=>{
      const role=rawDays.length===1?'day-trip':index===0?'arrival':index===rawDays.length-1?'departure':'full';
      let notBefore=baseStart,notAfter=baseEnd,target=baseTarget;
      if(role==='arrival'){target=Math.max(1,baseTarget-1);if(arrivalTime!=null)notBefore=Math.max(notBefore,arrivalTime+Math.max(45,Number(logistics.arrival?.recoveryMinutes)||90));}
      if(role==='departure'){target=Math.max(1,baseTarget-1);if(departureTime!=null)notAfter=Math.min(notAfter,departureTime-Math.max(60,Number(logistics.departure?.bufferMinutes)||120));}
      if(notAfter-notBefore<90)target=0;else target=Math.min(target,Math.max(1,Math.floor((notAfter-notBefore+60)/150)));
      return {...day,role,minimumMoments:target,targetMoments:target,...(role==='full'?{longStayAlternative:{minimumMoments:Math.max(1,target-1),minimumAnchorMinutes:180,minimumTotalMinutes:target*60,minimumFreeMinutes:90}}:{}),notBefore:clock(notBefore),notAfter:clock(Math.max(notBefore,notAfter)),freeTimePercent:Math.max(0,Math.min(70,Number(rhythm.freeTimePercent??planningPolicy.freeTimePercent)||0))};
    });
    const originallyRequiredCandidateCount=dayInput.reduce((sum,day)=>sum+day.minimumMoments,0),activeDayCount=dayInput.filter(day=>day.minimumMoments>0).length;
    if(candidateInput.length<activeDayCount)throw contractError('TRIP_ITINERARY_COVERAGE_INSUFFICIENT',`Dieser Suchlauf hat bisher ${candidateInput.length} unterschiedliche, belegte Kandidaten geliefert. Das ist kein Gesamtbestand des Reiseziels. Für die ${activeDayCount} aktiven Reisetage muss Luvia die Places-Recherche noch erweitern.`);
    let remainingCandidateShortage=Math.max(0,originallyRequiredCandidateCount-candidateInput.length);
    const reliefOrder=dayInput.map((day,index)=>({day,index})).filter(item=>item.day.minimumMoments>1).sort((left,right)=>Number(left.day.role!=='full')-Number(right.day.role!=='full')||Number(left.index%2===0)-Number(right.index%2===0)||right.day.minimumMoments-left.day.minimumMoments||left.index-right.index);
    while(remainingCandidateShortage>0){let reduced=false;for(const item of reliefOrder){if(remainingCandidateShortage<=0)break;if(item.day.minimumMoments<=1)continue;item.day.minimumMoments-=1;item.day.targetMoments=Math.min(item.day.targetMoments,item.day.minimumMoments);remainingCandidateShortage-=1;reduced=true;}if(!reduced)break;}
    const requiredCandidateCount=dayInput.reduce((sum,day)=>sum+day.minimumMoments,0),candidateAdaptivePlanning=requiredCandidateCount<originallyRequiredCandidateCount;
    const calendarEvidence=(Array.isArray(input.calendarEvidence)?input.calendarEvidence:[]).slice(0,40).map(item=>({id:clean(item?.id,160),kind:clean(item?.kind||item?.type,80),name:clean(item?.name,160),region:clean(item?.region,160),startDate:clean(item?.startDate,10),endDate:clean(item?.endDate,10),source:clean(item?.source,160),sourceUrl:clean(item?.sourceUrl,500),authority:clean(item?.authority,160),authorityUrl:clean(item?.authorityUrl,500),retrievedAt:clean(item?.retrievedAt,40),verified:item?.verified===true})).filter(item=>item.id);
    const evidenceCatalog=[...candidateInput.flatMap(item=>[{id:`place:${item.providerPlaceId}:identity`,kind:'place-identity',source:'places.v1',observedAt:item.observedAt||'',supports:['place identity']},...(item.provider&&item.observedAt?[{id:`place:${item.providerPlaceId}:provider-snapshot`,kind:'place-provider-snapshot',source:item.provider,observedAt:item.observedAt,supports:['provider supplied fields']}]:[])]),...calendarEvidence.filter(item=>item.verified).map(item=>({id:`calendar:${item.id}`,kind:item.kind||'calendar',source:item.authority||item.source,observedAt:item.retrievedAt,supports:['calendar interval',item.startDate&&item.endDate?`${item.startDate}/${item.endDate}`:''].filter(Boolean) }))];
    const spatialVariety=(input.poolQuality?.minimumDistinctAreas||order.geography?.minimumDistinctAreas||1)>1,spatialDistribution={enabled:spatialVariety,minimumAreas:Math.min(3,dayInput.length),maximumSingleAreaShare:.6,minimumFullDayAreas:Math.min(3,dayInput.filter(day=>day.role==='full').length),areaDefinition:'Supplied 2 km geographic grid IDs are coverage measures, not neighborhood names. Choose meaningful distinct day anchors and coherent local routes. Preserve actual must-dos; do not add distant filler.'};
    const planningContract={experienceQuality:EXPERIENCE_QUALITY,completePeriod:true,dayPolicies:dayInput,spatialDistribution,maximumMomentsPerDay,useOnlyCandidateIds:true,allDaysExactlyOnce:true,noUnexplainedEmptyDays:true,avoidDuplicatePlaces:true,preserveAllHardConstraints:true,assignContextualTimes:true,avoidSingleDefaultTime:true,preventTimeOverlap:true,freeTimeBetweenMoments:true,explicitDeliberateFreeTime:true,wholeTripBalance:true,travelPromiseRequired:true,uncertaintyMapRequired:true,bookingDependenciesRequired:true,neighborhoodRecommendationRequired:true,verifiedClaimsRequireEvidence:true,clusterDaysGeographically:true,arrivalDepartureAware:true,prepareBackupOptions:true,candidateAdaptivePlanning,availableCandidateCount:candidateInput.length,originallyRequiredCandidateCount,automaticMutation:false};
    const requestedCategoryIds=[...new Set((order.categories||[]).map(item=>clean(item?.category)).filter(Boolean))],repairInstructions=(Array.isArray(input.repairInstructions)?input.repairInstructions:[]).map(item=>clean(item,300)).filter(Boolean).slice(0,20),qualityAttempt=Math.max(1,Math.min(3,Math.round(Number(input.qualityAttempt)||1))),composeTier='default',existing=input.existingItinerary?.kind==='ai-trip-itinerary'?input.existingItinerary:null,requestedRepairDates=[...new Set([...(Array.isArray(input.repairDayDates)?input.repairDayDates:[]),...(Array.isArray(existing?.contractIssues)?existing.contractIssues.map(item=>item?.dayDate):[])].map(date=>clean(date,10)).filter(date=>dayInput.some(day=>day.date===date)))];
    let value,missingRepairDates=[],supportingDetailsChanged=false;
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
        const repairResponse=await run('trip.compose-day-repair',references.encode({referenceSet:references.fingerprint,surface:'trip-composer',retryGeneration:Math.max(0,Math.round(Number(input.retryGeneration)||0)),locale:input.locale||'de-DE',timeZone:input.timeZone||input.destination?.timezone||'',travelOrder:order,planningPolicy,destination:input.destination||null,travelPromise:existing.travelPromise||{},days:[repairPolicy],neighboringDays,excludedProviderPlaceIds:[...usedIds],candidateCatalog:sectionCandidates(availableCandidates,usedIds,1,[...priorityCategories]).map(modelPlace),repairInstructions:targetedInstructions,planningContract:{...planningContract,dayPolicies:[repairPolicy],repairOnly:true,preserveOtherDays:true,priorityCategories:[...priorityCategories]}}),{tier:input.deepRepair===true?'deep':'default',fallback:false,workflowId:input.workflowId||null,context:{surface:'trip-composer',purpose:'repair-failed-trip-day',qualityLane:input.deepRepair===true?'sol-day-repair':'terra-day-repair'}});
        if(repairResponse?.ok!==true||repairResponse?.meta?.fallback!==false)throw contractError('TRIP_ITINERARY_DAY_REPAIR_AI_REQUIRED','Luvia konnte den offenen Reisetag gerade nicht zuverlässig reparieren.');
        const repairValue=references.decode(repairResponse?.data||repairResponse?.result||repairResponse),returnedDays=Array.isArray(repairValue?.days)?repairValue.days:[],exactDay=returnedDays.find(item=>clean(item?.date,10)===repairPolicy.date),day=exactDay||(returnedDays.length===1?{...returnedDays[0],date:repairPolicy.date}:null);
        if(!day){missingRepairDates.push(repairPolicy.date);continue;}
        replacements.set(repairPolicy.date,day);for(const entry of day.entries||[]){const id=clean(entry?.providerPlaceId,240).replace(/^places\//,'');if(id)usedIds.add(id);}
      }
      value={...existing,days:dayInput.map(day=>replacements.get(day.date)||existingDays.find(item=>clean(item?.date,10)===day.date)||{date:day.date,theme:'',balance:{energy:'balanced',freeTimePurpose:''},freeTime:[],entries:[]})};
      // Booking dependencies, uncertainty and alternatives refer to the original
      // routes. Regenerate those supporting details once after all day repairs.
      supportingDetailsChanged=replacements.size>0;
    }else{
      const sections=[],sectionSize=7,sectionCount=Math.ceil(dayInput.length/sectionSize),usedIds=new Set(),completedDays=[],saved=Array.isArray(input.completedSections)?input.completedSections:[];
      for(let sectionIndex=0;sectionIndex<sectionCount;sectionIndex++){
        const sectionDays=dayInput.slice(sectionIndex*sectionSize,(sectionIndex+1)*sectionSize),previousCategories=new Set(completedDays.flatMap(day=>(day.entries||[]).map(entry=>candidateInput.find(p=>p.providerPlaceId===entry.providerPlaceId)?.category))),priorities=requestedCategoryIds.filter(category=>!previousCategories.has(category)),catalog=sectionCandidates(candidateInput,usedIds,sectionDays.length,priorities);
        const request={surface:'trip-composer',retryGeneration:Math.max(0,Math.round(Number(input.retryGeneration)||0)),locale:input.locale||'de-DE',timeZone:input.timeZone||input.destination?.timezone||'',
          userRequest:clean(input.userRequest,1200),travelOrder:order,planningPolicy,planningAssumptions:input.brief?.planningAssumptions||[],deferredChecks:input.brief?.deferredChecks||[],profilePreferences:input.brief?.requestPreferences||input.profilePreferences||{},destination:input.destination||null,days:sectionDays,
          segment:{index:sectionIndex+1,count:sectionCount,wholeTripStart:dayInput[0].date,wholeTripEnd:dayInput.at(-1).date,wholeTripDayCount:dayInput.length},
          previousDays:completedDays.map(day=>({date:day.date,theme:day.theme,energy:day.balance?.energy,entries:(day.entries||[]).map(entry=>({providerPlaceId:entry.providerPlaceId,category:candidateInput.find(p=>p.providerPlaceId===entry.providerPlaceId)?.category}))})),
          travelPromise:sections[0]?.result?.travelPromise||null,candidateCatalog:catalog.map(modelPlace),calendarEvidence,
          planningContract:{...planningContract,dayPolicies:sectionDays,availableCandidateCount:catalog.length,priorityCategories:priorities,poolQuality:poolPlanningEvidence(input.poolQuality)},repairInstructions};
        const key=sectionFingerprint(request),prior=saved.find(section=>section.key===key&&section.index===sectionIndex);
        await input.onProgress?.({section:sectionIndex+1,sectionCount,completedDays:completedDays.length,totalDays:dayInput.length});
        let result=prior?.result;
        if(!result){
          const response=await run('trip.compose',references.encode({...request,referenceSet:references.fingerprint}),{tier:composeTier,fallback:false,workflowId:input.workflowId||null,context:{surface:'trip-composer',purpose:'trip-section'}});
          if(response?.ok!==true||response?.meta?.fallback!==false)throw contractError('TRIP_ITINERARY_AI_REQUIRED','Luvia konnte diesen Reiseabschnitt gerade nicht zuverlässig komponieren.');
          result=references.decode(response?.data||response?.result||response);
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
    let travelPromise={summary:clean(value?.travelPromise?.summary,600),commitments:[...new Set((value?.travelPromise?.commitments||[]).map(item=>clean(item,240)).filter(Boolean))].slice(0,12),deliberateFreeTime:clean(value?.travelPromise?.deliberateFreeTime,300),exclusions:[...new Set((value?.travelPromise?.exclusions||[]).map(item=>clean(item,180)).filter(Boolean))].slice(0,12)};
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
      const timed=entries.filter(entry=>entry.time).sort((left,right)=>left.time.localeCompare(right.time));
      for(let slot=1;slot<timed.length;slot++){
        const prior=timed[slot-1],next=timed[slot],priorStart=minute(prior.time),nextStart=minute(next.time);
        if(nextStart<priorStart+prior.durationMinutes)contractIssues.push({code:'TRIP_ITINERARY_TIME_OVERLAP',dayDate:expected.date,message:`${expected.label} enthält überlappende Vorschlagszeiten.`});
      }
      const occupied=timed.map(entry=>[minute(entry.time),minute(entry.time)+entry.durationMinutes]);
      const freeTime=(Array.isArray(source.freeTime)?source.freeTime:[]).slice(0,6).flatMap(item=>{
        const from=minute(clean(item?.start,5)),until=minute(clean(item?.end,5)),purpose=clean(item?.purpose,180);if(from==null||until==null||until<=from||!purpose)return [];
        let windows=[[Math.max(from,minute(expected.notBefore)),Math.min(until,minute(expected.notAfter))]].filter(([start,end])=>end>start);
        for(const [busyStart,busyEnd] of occupied)windows=windows.flatMap(([start,end])=>busyStart>=end||busyEnd<=start?[[start,end]]:[[start,Math.min(end,busyStart)],[Math.max(start,busyEnd),end]].filter(([a,b])=>b>a));
        occupied.push(...windows);return windows.map(([start,end])=>({start:clock(start),end:clock(end),purpose,reason:clean(item?.reason,300)||purpose,minutes:end-start}));
      }).sort((a,b)=>a.start.localeCompare(b.start));
      if(expected.freeTimePercent>0&&expected.role==='full'&&!freeTime.length)contractIssues.push({code:'TRIP_ITINERARY_FREETIME_MISSING',dayDate:expected.date,message:`${expected.label} enthält noch keinen bewusst geplanten Freiraum.`});
      const plannedMinutes=entries.reduce((sum,item)=>sum+item.durationMinutes,0),freeTimeMinutes=freeTime.reduce((sum,item)=>sum+item.minutes,0),energy=['light','balanced','intense'].includes(source.balance?.energy)?source.balance.energy:'balanced';
      const longStay=expected.longStayAlternative,deliberateLongStay=longStay&&entries.length>=longStay.minimumMoments&&entries.some(entry=>entry.durationMinutes>=longStay.minimumAnchorMinutes)&&plannedMinutes>=longStay.minimumTotalMinutes&&freeTime.filter(slot=>slot.purpose&&!timed.some(entry=>minute(slot.start)<minute(entry.time)+entry.durationMinutes&&minute(slot.end)>minute(entry.time))).reduce((sum,slot)=>sum+slot.minutes,0)>=longStay.minimumFreeMinutes;
      if(entries.length<expected.minimumMoments&&!deliberateLongStay)contractIssues.push({code:'TRIP_ITINERARY_DAY_TOO_THIN',dayDate:expected.date,message:`${expected.label} braucht noch einen passenden Moment oder einen bewusst geplanten längeren Aufenthalt.`});
      return {date:expected.date,label:expected.label,theme:clean(source.theme,160),role:expected.role,balance:{energy,plannedMinutes,freeTimeMinutes,freeTimePurpose:clean(source.balance?.freeTimePurpose,240)||freeTime.map(item=>item.purpose).filter(Boolean).join(' · ')},freeTime:freeTime.map(({minutes,...item})=>item),entries};
    });
    const candidateCategories=new Set(candidateInput.map(item=>item.category)),usedCategories=new Set(days.flatMap(day=>day.entries.map(entry=>entry.category))),missingCategories=requestedCategoryIds.filter(category=>candidateCategories.has(category)&&!usedCategories.has(category));
    if(missingCategories.length){const repairDay=days.find(day=>day.role==='full')||days[0];contractIssues.push({code:'TRIP_ITINERARY_CATEGORY_COVERAGE_MISSING',dayDate:repairDay.date,message:`Dieser Tag muss die bislang fehlenden Wunschbereiche berücksichtigen: ${missingCategories.join(', ')}.`});}
    const dayDates=new Set(dayInput.map(day=>day.date)),backupUsed=new Set();
    const validBackup=item=>dayDates.has(item?.dayDate)&&days.some(day=>day.date===item.dayDate&&day.entries.some(entry=>entry.providerPlaceId===item.forProviderPlaceId))&&allowed.has(item?.providerPlaceId)&&!used.has(item.providerPlaceId)&&item.providerPlaceId!==item.forProviderPlaceId;
    const unusedCandidates=candidateInput.filter(item=>!used.has(item.providerPlaceId));
    if(!contractIssues.length&&(supportingDetailsChanged||(unusedCandidates.length&&!(value?.backupOptions||[]).some(validBackup)))){
      // Missing supporting details must never regenerate already valid day routes.
      const supportResponse=await run('trip.compose',references.encode({referenceSet:references.fingerprint,surface:'trip-composer',retryGeneration:Math.max(0,Math.round(Number(input.retryGeneration)||0)),locale:input.locale||'de-DE',timeZone:input.timeZone||'',destination:input.destination||null,travelOrder:order,planningPolicy,days:[],fixedItinerary:{title:value.title,summary:value.summary,travelPromise,days,uncertaintyMap:value.uncertaintyMap||[],bookingOrder:value.bookingOrder||[],neighborhoodRecommendation:value.neighborhoodRecommendation||{}},plannedPlaceCatalog:candidateInput.filter(item=>used.has(item.providerPlaceId)).map(modelPlace),candidateCatalog:sectionCandidates(unusedCandidates,new Set(),Math.min(7,dayInput.length)).map(modelPlace),planningContract:{repairMetadataOnly:true,preserveOtherDays:true,prepareBackupOptions:true,useOnlyCandidateIds:true,rebuildAfterDayRepair:supportingDetailsChanged},repairInstructions:[...(supportingDetailsChanged?['The fixed day routes were repaired. Rebuild bookingOrder, uncertaintyMap, travelPromise, neighborhoodRecommendation and backupOptions for these CURRENT routes. Previous supporting text is obsolete: do not retain references to replaced places or old temporary aliases. Bind concrete booking dependencies to the exact currently planned Place; alternative Places belong only in backupOptions. Use actual Place names in prose from plannedPlaceCatalog.']:[]),'Keep every fixed day unchanged. Return days as an empty array. Supply at least three useful backupOptions when suitable unused Places exist, each for an exact existing day and planned Place. Backup providerPlaceId must come only from the unused candidateCatalog; forProviderPlaceId must belong to that day in fixedItinerary. Never describe another beach or an outdoor harbour as safe bad-weather shelter. Correct unsupported promises, booking claims and accommodation claims as provisional.']}),{tier:'fast',fallback:false,workflowId:input.workflowId||null,context:{surface:'trip-composer',purpose:'trip-supporting-details'}});
      if(supportResponse?.ok!==true||supportResponse?.meta?.fallback!==false)throw contractError('TRIP_SUPPORT_AI_REQUIRED','Luvia konnte die Reisealternativen gerade nicht vervollständigen.');
      const support=references.decode(supportResponse.data||supportResponse.result||supportResponse);
      if(support.travelPromise?.summary&&support.travelPromise?.commitments?.length&&support.travelPromise?.deliberateFreeTime)travelPromise={summary:clean(support.travelPromise.summary,600),commitments:support.travelPromise.commitments.map(item=>clean(item,240)).slice(0,12),deliberateFreeTime:clean(support.travelPromise.deliberateFreeTime,300),exclusions:(support.travelPromise.exclusions||[]).map(item=>clean(item,180)).slice(0,12)};
      value={...value,backupOptions:support.backupOptions||[],alternatives:support.alternatives||value.alternatives,uncertaintyMap:supportingDetailsChanged?(support.uncertaintyMap||[]):support.uncertaintyMap?.length?support.uncertaintyMap:value.uncertaintyMap,bookingOrder:support.bookingOrder||value.bookingOrder,neighborhoodRecommendation:support.neighborhoodRecommendation||value.neighborhoodRecommendation};
    }
    const backupOptions=(Array.isArray(value?.backupOptions)?value.backupOptions:[]).map(item=>{const forProviderPlaceId=clean(item?.forProviderPlaceId,240).replace(/^places\//,''),providerPlaceId=clean(item?.providerPlaceId,240).replace(/^places\//,''),dayDate=clean(item?.dayDate,10);if(!validBackup({dayDate,forProviderPlaceId,providerPlaceId})||backupUsed.has(providerPlaceId))return null;backupUsed.add(providerPlaceId);return{dayDate,forProviderPlaceId,providerPlaceId,trigger:clean(item?.trigger,160),reason:clean(item?.reason,400)}}).filter(Boolean).slice(0,20);
    const alternatives=(value?.alternatives||[]).map(item=>clean(item,240)).filter(id=>allowed.has(id)&&!used.has(id)&&!backupUsed.has(id)).slice(0,20);
    const uncertaintyKinds=['weather','price','opening','route','availability','booking'],modelUncertainties=(Array.isArray(value?.uncertaintyMap)?value.uncertaintyMap:[]).map(item=>{const evidenceRefs=[...new Set((item?.evidenceRefs||[]).map(ref=>clean(ref,240)).filter(ref=>allowedEvidence.has(ref)))].slice(0,20),source=clean(item?.source,160),observedAt=clean(item?.observedAt,40),verified=item?.state==='verified'&&source&&Number.isFinite(Date.parse(observedAt))&&evidenceRefs.length;return{subject:clean(item?.subject,240),kind:['weather','price','opening','route','availability','booking','event','calendar','other'].includes(item?.kind)?item.kind:'other',state:verified?'verified':item?.state==='modelled'?'modelled':'open',reason:clean(item?.reason,400),source:verified?source:'',observedAt:verified?observedAt:'',expiresAt:verified&&Number.isFinite(Date.parse(item?.expiresAt))?clean(item.expiresAt,40):'',affectedDayDates:[...new Set((item?.affectedDayDates||[]).map(date=>clean(date,10)).filter(date=>dayDates.has(date)))].slice(0,20),providerPlaceIds:[...new Set((item?.providerPlaceIds||[]).map(id=>clean(id,240).replace(/^places\//,'')).filter(id=>allowed.has(id)))].slice(0,20),evidenceRefs}}).filter(item=>item.subject).slice(0,40),presentKinds=new Set(modelUncertainties.map(item=>item.kind));
    const uncertaintyMap=[...modelUncertainties,...uncertaintyKinds.filter(kind=>!presentKinds.has(kind)).map(kind=>({subject:{weather:'Wetter am Reisetermin',price:'Preise am Reisetermin',opening:'Öffnungszeiten zu den geplanten Besuchen',route:'Wegezeiten zwischen Reisemomenten',availability:'Verfügbarkeit der ausgewählten Orte',booking:'Buchungsstatus und Fristen'}[kind],kind,state:'open',reason:'Für diese Aussage liegt im Entwurf noch kein aktueller, zitierbarer Providerbeleg vor.',source:'',observedAt:'',expiresAt:'',affectedDayDates:[],providerPlaceIds:[],evidenceRefs:[]}))];
    const bookingOrder=(Array.isArray(value?.bookingOrder)?value.bookingOrder:[]).map(item=>{const providerPlaceId=clean(item?.providerPlaceId,240).replace(/^places\//,''),evidenceRefs=[...new Set((item?.evidenceRefs||[]).map(ref=>clean(ref,240)).filter(ref=>allowedEvidence.has(ref)))].slice(0,12);return{rank:Math.max(1,Math.min(99,Math.round(Number(item?.rank)||99))),subject:clean(item?.subject,240),providerPlaceId:providerPlaceId&&allowed.has(providerPlaceId)?providerPlaceId:'',state:['secure-first','plan-around','later','open'].includes(item?.state)?item.state:'open',reason:clean(item?.reason,400),blocks:[...new Set((item?.blocks||[]).map(block=>clean(block,180)).filter(Boolean))].slice(0,12),evidenceRefs}}).filter(item=>item.subject).sort((a,b)=>a.rank-b.rank).slice(0,30);
    const neighborhoodSource=value?.neighborhoodRecommendation||{},neighborhoodEvidence=[...new Set((neighborhoodSource.evidencePlaceIds||[]).map(id=>clean(id,240).replace(/^places\//,'')).filter(id=>used.has(id)))].slice(0,24),neighborhoodRecommendation={state:neighborhoodSource.state==='modelled'&&neighborhoodEvidence.length?'modelled':'open',label:clean(neighborhoodSource.label,180),radiusKm:Math.max(0,Math.min(100,Number(neighborhoodSource.radiusKm)||0)),reason:clean(neighborhoodSource.reason,500),evidencePlaceIds:neighborhoodEvidence,caveats:[...new Set((neighborhoodSource.caveats||[]).map(item=>clean(item,240)).filter(Boolean))].slice(0,12)};
    return immutable({owner:'intelligence',contractId:'intelligence.v1',kind:'ai-trip-itinerary',source:'ai',title:clean(value?.title,160),summary:clean(value?.summary,800),travelPromise,days,dayPolicies:dayInput,uncertaintyMap,bookingOrder,neighborhoodRecommendation,evidenceCatalog,alternatives,backupOptions,contractIssues,uncoveredRequirements:(value?.uncoveredRequirements||[]).map(item=>clean(item,240)).filter(Boolean).slice(0,20),warnings:(value?.warnings||[]).map(item=>clean(item,240)).filter(Boolean).slice(0,20),confidence:Math.max(0,Math.min(1,Number(value?.confidence)||0)),candidateCount:candidateInput.length,automaticMutation:false,confirmationRequired:true});
  }

  async function planTripPlaceSearch(input={}){
    const definitions=Array.isArray(input.categories)?input.categories:[],allowed=new Set(definitions.flatMap(item=>item.types||[]));
    const response=await run('discovery.plan',{surface:'trip-composer',domain:'trip',userGoal:input.travelOrder||{},destination:input.destination||null,categoryCatalog:definitions,task:'Identify up to three concrete must-do experiences from this travel order that broad category browsing may miss, such as a real harbour, a particular facility, a named landmark or a specialised activity. Return precise local-language provider search queries and only includedTypes from the supplied categoryCatalog. Do not equate a beach with a harbour, a shop with shopping in general, or a venue name with verified suitability. Do not repeat generic food, culture or beach browse searches unless they are specifically necessary. Return no searchPlans when there is no concrete additional search need. Queries are hypotheses for provider verification, never invented Places or verified facts. Keep reasons short.'},{tier:'fast',fallback:false,context:{surface:'trip-composer',purpose:'specific-trip-place-research'}});
    if(response?.ok!==true||response?.meta?.fallback!==false)throw contractError('TRIP_SEARCH_PLAN_UNAVAILABLE','Die gezielte Ortsrecherche konnte noch nicht vorbereitet werden.');
    return immutable({source:'ai',plans:(response.data?.searchPlans||[]).slice(0,3).map(plan=>({query:String(plan.query||'').trim().slice(0,200),includedTypes:[...new Set((plan.includedTypes||[]).filter(type=>allowed.has(type)))].slice(0,4),reason:String(plan.reason||'').slice(0,200)})).filter(plan=>plan.query&&plan.includedTypes.length)});
  }

  async function rankTripReserve(input={}){
    const candidates=(input.candidates||[]).slice(0,16).map(place=>({providerPlaceId:String(place.providerPlaceId||place.id||'').replace(/^places\//,''),name:place.name,category:place.requestCategory||place.category,experienceEvidence:experienceEvidence(place),features:place.features||{},coordinates:place.coordinates||place.location}));
    if(!candidates.length)return immutable({kind:'trip-reserve-options',options:[],source:'places'});
    const references=placeReferenceCodec(candidates);
    const response=await run('discovery.rank',references.encode({referenceSet:references.fingerprint,surface:'trip-composer',domain:'trip',currentMoment:{surface:'trip-composer'},contract:{travelOrder:input.travelOrder||{},operation:input.mode,rejectionReason:String(input.rejectionReason||''),previousRejections:input.rejections||[],experienceQuality:EXPERIENCE_QUALITY,selectedMoment:input.current||null,day:input.day||null,instruction:'Rank only the supplied verified reserve. Address the exact rejection reason, not merely similarity. Omit unsuitable options; do not fill five slots. For no interest offer a different experience consistent with the travel order. Explain in one short German sentence (at most 16 words) what differs and fits. Preserve confirmed constraints. Do not claim opening hours, transport times, live prices or suitability without evidence.'},candidates}),{tier:'fast',fallback:false,context:{surface:'trip-composer',purpose:'trip-reserve-choice'}});
    if(response?.ok!==true||response?.meta?.fallback!==false)throw contractError('TRIP_RESERVE_AI_UNAVAILABLE','Luvia konnte die Alternativen gerade nicht einordnen. Eure Tagesroute bleibt erhalten.');
    const allowed=new Set(candidates.map(item=>item.providerPlaceId)),rankings=references.decode(response.data?.rankings||[]);
    return immutable({kind:'trip-reserve-options',source:'ai',options:rankings.filter(item=>allowed.has(String(item.entityId))).sort((a,b)=>Number(b.score)-Number(a.score)).slice(0,5).map(item=>({providerPlaceId:String(item.entityId),reason:(item.reasons||[]).map(reason=>typeof reason==='string'?reason:reason.label||reason.text||'').filter(Boolean).slice(0,1).join(' ')}))});
  }

  async function auditTripItinerary(input = {}) {
    const itinerary=input.itinerary;
    if(itinerary?.kind!=='ai-trip-itinerary'||itinerary?.owner!=='intelligence')throw contractError('TRIP_AUDIT_ITINERARY_REQUIRED','Für den unabhängigen Qualitätscheck fehlt der vollständige KI-Entwurf.');
    const {evidenceCatalog:_evidence,dayPolicies:_policies,contractIssues:_issues,...compactItinerary}=itinerary;
    const auditIds=new Set([...(itinerary.days||[]).flatMap(day=>(day.entries||[]).map(entry=>entry.providerPlaceId)),...(itinerary.backupOptions||[]).map(item=>item.providerPlaceId),...(itinerary.bookingOrder||[]).map(item=>item.providerPlaceId)]);
    const references=placeReferenceCodec(input.candidates||[]);
    const auditDayCount=Math.max(1,Math.min(366,Array.isArray(itinerary?.dayPolicies)?itinerary.dayPolicies.length:Array.isArray(itinerary?.days)?itinerary.days.length:1)),auditCandidateLimit=Math.max(160,auditDayCount*9),response=await run('trip.audit',references.encode({referenceSet:references.fingerprint,surface:'trip-composer',retryGeneration:Math.max(0,Math.round(Number(input.retryGeneration)||0)),locale:input.locale||'de-DE',timeZone:input.timeZone||input.destination?.timezone||'',userRequest:String(input.userRequest||'').slice(0,1200),travelOrder:input.brief?.travelOrder||{},planningPolicy:input.brief?.policy||{},tripPreferences:input.brief?.tripPreferences||{},planningAssumptions:input.brief?.planningAssumptions||[],deferredChecks:input.brief?.deferredChecks||[],auditScope:{stage:'reviewable-draft',requirementsSource:'userRequest, confirmed travelOrder and editable planningAssumptions only',providerQueriesAreRequirements:false,liveVerificationRequiredBeforeBooking:true,unknownFutureSchedulesDoNotPreventDraft:true},destination:input.destination||null,planningContract:{experienceQuality:EXPERIENCE_QUALITY,dayPolicies:itinerary.dayPolicies||[],allDaysExactlyOnce:true,useOnlyCandidateIds:true,preserveAllHardConstraints:true,travelPromiseRequired:true,explicitDeliberateFreeTime:true,wholeTripBalance:true,uncertaintyMapRequired:true,verifiedClaimsRequireEvidence:true,bookingDependenciesRequired:true,neighborhoodRecommendationRequired:true,clusterDaysGeographically:true,arrivalDepartureAware:true,prepareBackupOptions:true},itinerary:compactItinerary,experienceBalance:itineraryExperienceBalance(itinerary,input.candidates||[]),poolQuality:poolPlanningEvidence(input.poolQuality),candidateCatalog:(Array.isArray(input.candidates)?input.candidates:[]).filter(item=>auditIds.has(String(item.providerPlaceId||item.id||'').replace(/^places\//,''))).slice(0,auditCandidateLimit).map(item=>({providerPlaceId:String(item?.providerPlaceId||item?.provider_place_id||item?.id||'').replace(/^places\//,''),name:String(item?.name||''),experienceEvidence:experienceEvidence(item),category:String(item?.requestCategory||item?.category||''),primaryType:String(item?.primaryType||item?.type||''),types:(item?.types||[]).slice(0,12),features:Object.fromEntries(Object.entries(item?.features||{}).filter(([key,value])=>['servesVegetarianFood','servesVeganFood','wheelchairAccessible','strollerAccessible'].includes(key)&&typeof value==='boolean')),coordinates:item?.coordinates||item?.location||null}))}),{tier:'default',fallback:false,workflowId:input.workflowId||null,context:{surface:'trip-composer',purpose:'independent-trip-quality-audit',qualityLane:'terra-audit'}});
    if(response?.ok!==true||response?.meta?.fallback!==false)throw contractError('TRIP_AUDIT_AI_REQUIRED','Der unabhängige KI-Qualitätscheck ist gerade nicht verfügbar.');
    const value=references.decode(response?.data||response?.result||response),rawIssues=(value?.issues||[]).map(item=>({code:String(item?.code||'').trim().slice(0,100),severity:item?.severity==='blocked'?'blocked':'attention',dayDate:String(item?.dayDate||'').trim().slice(0,10),providerPlaceIds:[...new Set((item?.providerPlaceIds||[]).map(id=>String(id||'').replace(/^places\//,'').trim()).filter(Boolean))].slice(0,12),message:String(item?.message||'').trim().slice(0,500),suggestedRepair:String(item?.suggestedRepair||'').trim().slice(0,500)})).filter(item=>item.code&&item.message),deferredCodes=new Set(['LIVE_DATA_MISSING','LIVE_FACTS_MISSING','OPENING_HOURS_UNVERIFIED','WEATHER_UNVERIFIED','PRICE_UNVERIFIED','ROUTE_UNVERIFIED','AVAILABILITY_UNVERIFIED']),deferred=rawIssues.filter(item=>item.severity==='blocked'&&deferredCodes.has(item.code)),onlyDeferred=deferred.length>0&&rawIssues.filter(item=>item.severity==='blocked').every(item=>deferred.includes(item)),issues=rawIssues.map(item=>deferred.includes(item)?{...item,severity:'attention'}:item),promiseAssessment={kept:value?.promiseAssessment?value.promiseAssessment.kept===true:true,summary:String(value?.promiseAssessment?.summary||'').trim().slice(0,500),missedCommitments:[...new Set((value?.promiseAssessment?.missedCommitments||[]).map(item=>String(item||'').trim()).filter(Boolean))].slice(0,20)};
    if(onlyDeferred&&!promiseAssessment.kept)promiseAssessment.verificationPending=true;
    if(!promiseAssessment.kept&&!onlyDeferred&&!issues.some(item=>item.severity==='blocked'))issues.push({code:'TRAVEL_PROMISE_MISSED',severity:'blocked',dayDate:'',providerPlaceIds:[],message:promiseAssessment.summary||'Der Entwurf hält das bestätigte Reiseversprechen noch nicht vollständig.',suggestedRepair:promiseAssessment.missedCommitments.length?`Erfülle diese fehlenden Zusagen: ${promiseAssessment.missedCommitments.join(' · ')}`:'Baue den Entwurf erneut gegen jede Zusage des Reiseversprechens auf.'});
    const blocked=issues.filter(item=>item.severity==='blocked'),dimensions=(value?.dimensions||[]).map(item=>({id:String(item?.id||'').trim().slice(0,80),label:String(item?.label||'').trim().slice(0,120),score:Math.max(0,Math.min(100,Math.round(Number(item?.score)||0))),status:['pass','attention','blocked'].includes(item?.status)?item.status:'attention',summary:String(item?.summary||'').trim().slice(0,360)})).filter(item=>item.id&&item.label).slice(0,12);
    return immutable({owner:'intelligence',contractId:'intelligence.v1',kind:'ai-trip-quality-audit',source:'ai',readyForReview:blocked.length===0&&(promiseAssessment.kept||onlyDeferred),score:Math.max(0,Math.min(100,Math.round(Number(value?.score)||0))),headline:String(value?.headline||'Qualitätscheck des Reiseentwurfs').trim().slice(0,240),promiseAssessment,dimensions,issues,strengths:[...new Set((value?.strengths||[]).map(item=>String(item||'').trim()).filter(Boolean))].slice(0,12),repairInstructions:[...new Set((value?.repairInstructions||[]).map(item=>String(item||'').trim()).filter(Boolean))].slice(0,20),confidence:Math.max(0,Math.min(1,Number(value?.confidence)||0)),automaticMutation:false});
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
      planTripPlaceSearch,
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
    planTripPlaceSearch,
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
