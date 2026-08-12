const assert=require('node:assert');
const fs=require('node:fs');
const vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8');
const sandbox={window:{dispatchEvent:()=>{}},console,CustomEvent:function(type,init){this.type=type;this.detail=init?.detail;},Map,Set,Object,Date,String,Boolean,Array,Error};
vm.createContext(sandbox);
for(const f of [
 'core/design/design-system-contract.js',
 'core/platform/global-contracts.js',
 'core/platform/capability-registry.js',
 'core/platform/attention-contract.js',
 'core/platform/product-module-registry.js',
 'app/product-module-manifests.js',
 'app/control-center/control-center-shell.js',
 'app/control-center/control-center-manifest.js',
 'core/diagnostics/product-module-diagnostics.js'
]) vm.runInContext(read(f),sandbox,{filename:f});
const version=read('intelligence/kernel/version.js');
assert(version.includes("core:'4.76.0'"));assert(version.includes("build:'13.76.0'"));
const r=sandbox.window.LuviaProductModuleRegistry;assert(r);assert.equal(r.version,'1.0.0');
assert.deepEqual(Array.from(r.list().map(x=>x.id)),['consumer','developer-console','control-center']);
const cc=r.get('control-center');assert(cc);assert.equal(cc.type,'product-surface');assert.equal(cc.status,'foundation');
assert.equal(cc.principles.ownsDomainTruth,false);assert.equal(cc.principles.inheritsGlobalDesign,true);assert.equal(cc.principles.independentlyEnableable,true);
assert(cc.children.includes('booking-control-center'));assert(cc.children.includes('booking-inbox'));assert(cc.children.includes('travel-wallet'));assert(cc.children.includes('trip-command-center'));
assert(sandbox.window.LuviaCapabilityRegistry.get('booking.lifecycle'));assert(sandbox.window.LuviaCapabilityRegistry.get('booking.messages'));
assert.equal(sandbox.window.LuviaCapabilityRegistry.get('notifications.unread').status,'planned');
assert(sandbox.window.LuviaAttentionContract.levels.includes('action_required'));assert(sandbox.window.LuviaAttentionContract.eventKinds.includes('unread'));
assert.equal(sandbox.window.LuviaDesignSystemContract.allowsProductForks,false);
r.disable('control-center');assert.equal(r.state('control-center').enabled,false);assert.equal(r.state('consumer').enabled,true);r.enable('control-center');assert.equal(r.state('control-center').enabled,true);
const diag=sandbox.window.LuviaProductModuleDiagnostics.snapshot();assert.equal(diag.version,'4.76.0');assert.equal(diag.build,'13.76.0');assert.equal(diag.architecture.productModulesAboveDomainModules,true);assert.equal(diag.architecture.domainTruthRemainsInCores,true);
const oldRegistry=read('core/modules/module-registry.js');assert(oldRegistry.includes('window.LuviaModuleRegistry'));assert(oldRegistry.includes("id:'restaurants'"));
const orchestration=read('core/booking/booking-orchestration.js');assert(orchestration.includes("const VERSION='1.3.0'"));assert(orchestration.includes("'api','external_link','affiliate','email','manual'"));
const index=read('index.html');for(const x of ['product-module-registry.js?v=13.76.0','control-center-manifest.js?v=13.76.0','product-module-foundation.css?v=13.76.0'])assert(index.includes(x));
console.log('LUVIA_V13_76_0_CONTROL_CENTER_GLOBAL_PRODUCT_MODULE_FOUNDATION_OK');
