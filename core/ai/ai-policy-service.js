(() => {
  'use strict';
  const VERSION='1.0.0';
  const core=window.LuviaIntelligenceDomainContractCoreV1;
  if(!core)throw new Error('INTELLIGENCE_DOMAIN_CORE_REQUIRED');
  const MODES=core.modes;
  function definition(capability){return typeof capability==='string'?window.LuviaAICapabilities?.get?.(capability):capability}
  function canRun(capability){return core.canRunCapability(definition(capability))}
  function canExecute(proposal,options={}){return core.canExecuteProposal(proposal,options)}
  function assertMode(capability,allowed=['READ','DRAFT']){return core.assertCapabilityMode(definition(capability),allowed)}
  function diagnostics(){return Object.freeze({...core.policySnapshot(),version:VERSION,ownerCore:core.runtimeVersion})}
  window.LuviaAIPolicy=Object.freeze({version:VERSION,modes:MODES,sanitize:core.sanitize,canRun,canExecute,assertMode,diagnostics});
})();
