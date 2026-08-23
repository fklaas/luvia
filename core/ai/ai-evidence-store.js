(() => {
  'use strict';
  const VERSION='4.19.1';
  const root=globalThis.window||globalThis;
  const core=root.LuviaIntelligenceDomainContractCoreV1;
  if(!core)throw new Error('INTELLIGENCE_DOMAIN_CORE_REQUIRED');
  const state=core.createEvidenceState({now:()=>new Date().toISOString()});
  root.LuviaAIEvidence=Object.freeze({
    version:VERSION,
    put:state.put,
    get:state.get,
    resolve:state.resolve,
    clear:state.clear,
    diagnostics:()=>Object.freeze({...state.diagnostics(),version:VERSION,ownerCore:core.runtimeVersion})
  });
})();
