(() => {
  'use strict';

  const CONTRACT_ID = 'intelligence.v1';
  const VERSION = '1';
  const RUNTIME_VERSION = '1.11.0';
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
      globalPreferences:input.profilePreferences||{},tripPreferences:input.tripPreferences||{},
      answers:input.answers||[],
      interpretationContract:{purpose:'Interpret only this new trip. Never inherit a different active trip. Respect explicit profile restrictions. Return German text. Preserve every requested hard constraint, including unsupported ones. A follow-up answer resolves its original question.',
        goalTypes:['food','culture','nature','nightlife','shopping','wellness','family','active','open'],
        constraintKeys:{category:'one goal type',excludeCategory:'one goal type',pace:'slow|balanced|active',budgetLevel:'economy|balanced|generous|open',dietary:'vegetarian|vegan',maximumPerDay:'1|2|3|4',notBefore:'HH:mm',notAfter:'HH:mm'},
        rule:'Use these canonical keys when applicable. Other constraints retain descriptive keys. Never discard unsupported requirements or invent place facts.'}
    };
    const response=await run('planning.dialogue',request,{fallback:false});
    return immutable(preferenceResolver().projectTripBrief(input,response));
  }

  async function suggestTripDestinations(input = {}) {
    const requestBrief=String(input.requestBrief||'').trim().slice(0,1200);
    if(requestBrief.length<8)throw Object.assign(new Error('Beschreibt kurz, wie sich eure Reise anfühlen soll.'),{code:'TRIP_INSPIRATION_BRIEF_REQUIRED'});
    const response=await run('discovery.plan',{
      surface:'trip-destination-inspiration',userGoal:requestBrief,globalPreferences:input.profilePreferences||{},destination:null,
      task:'Suggest up to three real named cities or regions as destination search hypotheses for a NEW trip before dates or destination are chosen. Each searchPlans.query must contain just the unambiguous destination name and country. Never inherit an active trip. Consider climate wishes as seasonal expectations only, never current weather. Do not claim prices, availability or verified suitability. Use German reasoningSummary to explain the overall ideas. Provider geocoding will verify every geographic identity before display.'
    },{fallback:false,context:{surface:'trip-destination-inspiration'}});
    if(response?.ok===false||response?.meta?.fallback)throw Object.assign(new Error('Die KI konnte eure Reisewünsche gerade nicht auswerten.'),{code:'TRIP_INSPIRATION_UNAVAILABLE'});
    const value=response?.data||response?.result||response,queries=[...new Set((value?.searchPlans||[]).map(p=>String(p.query||'').trim()).filter(Boolean))].slice(0,3);
    if(!queries.length)throw Object.assign(new Error(value?.followUpQuestion?.text||'Beschreibt noch etwas genauer, was euch an der Reise wichtig ist.'),{code:'TRIP_INSPIRATION_MORE_DETAIL'});
    return immutable({owner:'intelligence',contractId:'intelligence.v1',kind:'destination-inspiration',source:'ai',queries,summary:String(value.reasoningSummary||'').slice(0,800)});
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
