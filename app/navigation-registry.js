(() => {
  'use strict';
  const VERSION='4.27.0';
  const core=window.LuviaNavigationContractCoreV1;
  if(!core?.normalize||!core?.resolve||!core?.items)throw new Error('Luvia Navigation Contract Core fehlt.');
  const contract=Object.freeze({
    contractId:core.contractId,
    version:core.version,
    runtimeVersion:core.runtimeVersion,
    normalize:core.normalize,
    get:core.get,
    routes:core.listRoutes,
    items:core.items,
    createIntent:core.createIntent,
    fromUrl:core.fromUrl,
    resolve:core.resolve,
    toDeepLink:core.toDeepLink,
    diagnostics:core.diagnostics
  });
  window.LuviaNavigationContractV1=contract;
  window.LuviaNavigationRegistry=Object.freeze({
    version:VERSION,
    contractVersion:core.runtimeVersion,
    items:contract.items,
    get:contract.get,
    normalize:contract.normalize,
    resolve:contract.resolve,
    createIntent:contract.createIntent,
    fromUrl:contract.fromUrl,
    diagnostics:()=>Object.freeze({version:VERSION,contract:contract.diagnostics()})
  });
})();
