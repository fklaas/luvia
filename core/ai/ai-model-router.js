(() => {
  'use strict';
  const VERSION='1.0.0';
  const root=globalThis.window||globalThis;
  const core=root.LuviaIntelligenceDomainContractCoreV1;
  if(!core)throw new Error('INTELLIGENCE_DOMAIN_CORE_REQUIRED');
  const TIERS=core.modelTiers;
  function resolve(capability,options={}){
    const definition=typeof capability==='string'?root.LuviaAICapabilities?.get?.(capability):capability;
    return core.resolveModelTier(definition,options);
  }
  function diagnostics(){return Object.freeze({version:VERSION,provider:'openai',routing:'server-authoritative',tiers:TIERS,ownerCore:core.runtimeVersion})}
  root.LuviaAIModelRouter=Object.freeze({version:VERSION,tiers:TIERS,resolve,diagnostics});
})();
