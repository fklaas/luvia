(() => {
  'use strict';
  const VERSION='4.22.1';
  const root=globalThis.window||globalThis;
  const core=root.LuviaIntelligenceDomainContractCoreV1;
  if(!core)throw new Error('INTELLIGENCE_DOMAIN_CORE_REQUIRED');
  const registry=core.createCapabilityRegistry();
  root.LuviaAICapabilities=Object.freeze({
    version:VERSION,
    register:registry.register,
    get:registry.get,
    list:registry.list,
    diagnostics:()=>Object.freeze({...registry.diagnostics(),version:VERSION,ownerCore:core.runtimeVersion})
  });
})();
