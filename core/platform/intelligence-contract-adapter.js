(() => {
  'use strict';

  const CONTRACT_ID = 'intelligence.v1';
  const VERSION = '1';
  const RUNTIME_VERSION = '1.13.0-complete-trip-composition';
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

  async function interpretTripBrief(input = {}) {
    const request={
      surface:'trip-composer',userGoal:String(input.requestBrief||'').slice(0,1200),
      destination:input.destination?.name||'',startDate:input.startDate||null,endDate:input.endDate||null,
      scheduleMode:input.scheduleMode||'fixed',flexibility:input.flexibility||'',destinationTimeZone:input.destination?.timezone||'',
      globalPreferences:input.profilePreferences||{},tripPreferences:input.tripPreferences||{},participantPlan:input.participantPlan||'',
      calendarEvidence:Array.isArray(input.calendarEvidence)?input.calendarEvidence:[],answers:input.answers||[],
      task:'Understand the complete vacation request as one coherent travel order. Extract destinations or geographic scope, exact or approximate travel time, duration, travelers and children, school-holiday dependency, accommodation wishes, transport, activities, restaurants and food, culture, nature, shopping, nightlife, wellness, family moments, pace, budget, mobility, accessibility, must-dos, exclusions, rest and free-time wishes. Preserve the relationship between details instead of reducing the request to a list of generic categories. If the request mentions school-age children or school holidays and verified holiday evidence or the governing school region is missing, ask one short question for the smallest missing fact. Never invent school-holiday dates. Return all understood requirements even when another Luvia owner must verify or execute them.',
      interpretationContract:{purpose:'Interpret only this new trip. Never inherit a different active trip. Respect explicit profile restrictions. Return German text. Preserve every requested hard constraint, including unsupported ones. A follow-up answer resolves its original question.',
        goalTypes:['destination','time','accommodation','transport','food','culture','nature','nightlife','shopping','wellness','family','active','rest','open'],
        constraintKeys:{destination:'named destination or region',destinationScope:'city|region|country|coast|open',countryPreference:'named country or abroad',timeWindow:'original approximate period',season:'spring|summer|autumn|winter',month:'named month',durationNights:'integer',dateFlexibility:'fixed|days|weeks|open',travelers:'short group description',adults:'integer',children:'integer',childAges:'comma-separated ages',schoolHolidayRequired:'true|false',schoolHolidayRegion:'governing country/state/region',accommodation:'requested kind',transport:'requested mode',category:'one goal type',excludeCategory:'one goal type',categoryMix:'balanced|favorites|surprising',pace:'slow|balanced|active',budgetLevel:'economy|balanced|generous|open',dietary:'requirement',accessibility:'requirement',mobility:'requirement',maximumPerDay:'1|2|3|4',notBefore:'HH:mm',notAfter:'HH:mm',freeTimePercent:'0-100',mustDo:'specific wish',exclude:'specific exclusion'},
        rule:'Use canonical keys when applicable. Put concrete wishes such as a named museum, beach day, child-friendly activity, restaurant style or shopping wish into mustDo/category constraints instead of generalizing them away. Other constraints retain descriptive keys. Never discard unsupported requirements or invent destinations, dates, holiday periods or place facts.'}
    };
    const response=await run('planning.dialogue',request,{fallback:false});
    return immutable(preferenceResolver().projectTripBrief(input,response));
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
    const value=response?.data||response?.result||response,queries=[...new Set((value?.searchPlans||[]).map(p=>String(p.query||'').trim()).filter(Boolean))].slice(0,5);
    if(!queries.length)throw Object.assign(new Error(value?.followUpQuestion?.text||'Beschreibt noch etwas genauer, was euch an der Reise wichtig ist.'),{code:'TRIP_INSPIRATION_MORE_DETAIL'});
    return immutable({owner:'intelligence',contractId:'intelligence.v1',kind:'destination-inspiration',source:'ai',queries,summary:String(value.reasoningSummary||'').slice(0,800)});
  }

  async function composeTripItinerary(input = {}) {
    const clean=(value,limit=0)=>{const result=value==null?'':String(value).trim();return limit?result.slice(0,limit):result};
    const dayInput=(Array.isArray(input.days)?input.days:[]).slice(0,366).map((item,index)=>({date:clean(item?.date,10),label:clean(item?.label,80)||`Tag ${index+1}`}));
    const candidateInput=(Array.isArray(input.candidates)?input.candidates:[]).slice(0,80).map(item=>{
      const coordinates=item?.coordinates||item?.location||{};
      return {providerPlaceId:clean(item?.providerPlaceId||item?.provider_place_id||item?.id,240).replace(/^places\//,''),name:clean(item?.name,200),category:clean(item?.requestCategory||item?.category,80),primaryType:clean(item?.primaryType||item?.primary_type||item?.type,80),formattedAddress:clean(item?.formattedAddress||item?.address,280),coordinates:{latitude:Number(coordinates.latitude??coordinates.lat),longitude:Number(coordinates.longitude??coordinates.lng)}};
    }).filter(item=>item.providerPlaceId&&item.name&&Number.isFinite(item.coordinates.latitude)&&Number.isFinite(item.coordinates.longitude));
    if(!dayInput.length)throw contractError('TRIP_ITINERARY_DAYS_REQUIRED','Für den Reiseentwurf fehlen die Reisetage.');
    if(!candidateInput.length)throw contractError('TRIP_ITINERARY_CANDIDATES_REQUIRED','Für den Reiseentwurf fehlen überprüfte Places.');
    const pace=String(input.brief?.tripPreferences?.pace||input.tripPreferences?.pace||'balanced'),targetMomentsPerDay=pace==='active'?4:pace==='slow'?2:3,minimumMomentsPerDay=targetMomentsPerDay;
    if(candidateInput.length<dayInput.length*minimumMomentsPerDay)throw contractError('TRIP_ITINERARY_COVERAGE_INSUFFICIENT',`Die Places-Suche hat erst ${candidateInput.length} unterschiedliche Orte geliefert. Für ${dayInput.length} Reisetage und den gewählten Tagesrhythmus werden mindestens ${dayInput.length*minimumMomentsPerDay} benötigt.`);
    const response=await run('trip.compose',{
      surface:'trip-composer',locale:input.locale||'de-DE',timeZone:input.timeZone||input.destination?.timezone||'',
      travelOrder:input.brief||null,destination:input.destination||null,days:dayInput,travelers:input.travelers||{},
      profilePreferences:input.profilePreferences||{},tripPreferences:input.tripPreferences||{},calendarEvidence:input.calendarEvidence||[],
      candidateCatalog:candidateInput,existingEntries:Array.isArray(input.existingEntries)?input.existingEntries:[],
      planningContract:{completePeriod:true,minimumMomentsPerDay,targetMomentsPerDay,maximumMomentsPerDay:Math.max(minimumMomentsPerDay,Math.min(4,Number(input.brief?.policy?.maximumPerDay)||4)),useOnlyCandidateIds:true,allDaysExactlyOnce:true,noEmptyDays:true,avoidDuplicatePlaces:true,preserveAllHardConstraints:true,assignContextualTimes:true,avoidSingleDefaultTime:true,preventTimeOverlap:true,freeTimeBetweenMoments:true,freeTimeMayBeExplicit:true,automaticMutation:false}
    },{fallback:false,context:{surface:'trip-composer',purpose:'complete-trip-itinerary'}});
    if(response?.ok!==true||response?.meta?.fallback!==false)throw contractError('TRIP_ITINERARY_AI_REQUIRED','Luvia konnte die vollständige Reise gerade nicht zuverlässig komponieren.');
    const value=response?.data||response?.result||response,planDays=Array.isArray(value?.days)?value.days:[],allowed=new Map(candidateInput.map(item=>[item.providerPlaceId,item])),used=new Set(),byDate=new Map(planDays.map(item=>[clean(item?.date,10),item])),byLabel=new Map(planDays.map(item=>[clean(item?.label,80),item]));
    if(planDays.length!==dayInput.length)throw contractError('TRIP_ITINERARY_INCOMPLETE','Luvia hat noch nicht jeden Reisetag vollständig aufgebaut.');
    const maximumMomentsPerDay=Math.max(1,Math.min(4,Number(input.brief?.policy?.maximumPerDay)||4));
    const days=dayInput.map((expected,index)=>{
      const source=expected.date?byDate.get(expected.date):byLabel.get(expected.label)||planDays[index];
      if(!source)throw contractError('TRIP_ITINERARY_DAY_MISSING',`${expected.label} fehlt im KI-Entwurf.`);
      const entries=(Array.isArray(source.entries)?source.entries:[]).slice(0,maximumMomentsPerDay).map(entry=>{
        const providerPlaceId=clean(entry?.providerPlaceId,240).replace(/^places\//,''),candidate=allowed.get(providerPlaceId);
        if(!candidate)throw contractError('TRIP_ITINERARY_UNKNOWN_PLACE','Der KI-Entwurf enthält einen Ort, der nicht von Places bestätigt wurde.',{providerPlaceId});
        if(used.has(providerPlaceId))throw contractError('TRIP_ITINERARY_DUPLICATE_PLACE','Der KI-Entwurf verwendet denselben Ort mehrfach.',{providerPlaceId});
        const time=clean(entry?.time,5),durationMinutes=Math.round(Number(entry?.durationMinutes));
        if(expected.date&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw contractError('TRIP_ITINERARY_TIME_INVALID',`Die Uhrzeit für ${candidate.name} ist nicht eindeutig.`);
        if(!Number.isFinite(durationMinutes)||durationMinutes<30||durationMinutes>720)throw contractError('TRIP_ITINERARY_DURATION_INVALID',`Die Dauer für ${candidate.name} ist nicht plausibel.`);
        used.add(providerPlaceId);
        return {providerPlaceId,time:expected.date?time:'',durationMinutes,category:candidate.category,reason:clean(entry?.reason,500),confidence:Math.max(0,Math.min(1,Number(entry?.confidence)||0))};
      });
      if(entries.length<minimumMomentsPerDay)throw contractError('TRIP_ITINERARY_DAY_TOO_THIN',`${expected.label} ist noch nicht ausreichend geplant.`);
      const timed=entries.filter(entry=>entry.time).sort((left,right)=>left.time.localeCompare(right.time));
      for(let slot=1;slot<timed.length;slot++){
        const prior=timed[slot-1],next=timed[slot],priorStart=Number(prior.time.slice(0,2))*60+Number(prior.time.slice(3)),nextStart=Number(next.time.slice(0,2))*60+Number(next.time.slice(3));
        if(nextStart<priorStart+prior.durationMinutes)throw contractError('TRIP_ITINERARY_TIME_OVERLAP',`${expected.label} enthält überlappende Vorschlagszeiten.`);
      }
      return {date:expected.date,label:expected.label,theme:clean(source.theme,160),entries};
    });
    return immutable({owner:'intelligence',contractId:'intelligence.v1',kind:'ai-trip-itinerary',source:'ai',title:clean(value?.title,160),summary:clean(value?.summary,800),days,alternatives:(value?.alternatives||[]).map(item=>clean(item,240)).filter(id=>allowed.has(id)&&!used.has(id)).slice(0,20),uncoveredRequirements:(value?.uncoveredRequirements||[]).map(item=>clean(item,240)).filter(Boolean).slice(0,20),warnings:(value?.warnings||[]).map(item=>clean(item,240)).filter(Boolean).slice(0,20),confidence:Math.max(0,Math.min(1,Number(value?.confidence)||0)),candidateCount:candidateInput.length,automaticMutation:false,confirmationRequired:true});
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
      interpretTripBrief,
      suggestTripDestinations,
      composeTripItinerary,
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
    interpretTripBrief,
    suggestTripDestinations,
    composeTripItinerary,
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
