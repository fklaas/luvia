(() => {
  'use strict';
  const VERSION='4.23.0-trip-itinerary';
  const root=globalThis.window||globalThis;
  const core=root.LuviaIntelligenceDomainContractCoreV1;
  if(!core)throw new Error('INTELLIGENCE_DOMAIN_CORE_REQUIRED');
  const validators=core.validators;
  root.LuviaAIOutputValidator=Object.freeze({
    version:VERSION,
    validate:core.validateOutput,
    planningDialogue:validators.planningDialogue,
    tripItinerary:validators.tripItinerary,
    discoveryPlan:validators.discoveryPlan,
    ranking:validators.ranking,
    dashboard:validators.dashboard,
    timeline:validators.timeline,
    signals:validators.signals
  });
})();
