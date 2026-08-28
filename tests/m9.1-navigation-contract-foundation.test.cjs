'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const corePath='core/runtime/navigation-contract-core.js';
const adapterPath='app/navigation-registry.js';
const portsPath='app/adapters/platform-port-adapters.mjs';
const indexPath='index.html';
const coreSource=fs.readFileSync(corePath,'utf8');
const adapterSource=fs.readFileSync(adapterPath,'utf8');
const portsSource=fs.readFileSync(portsPath,'utf8');
const indexSource=fs.readFileSync(indexPath,'utf8');

for(const [label,pattern] of [
  ['browser global',/\bwindow\b|\bglobalThis\b/],
  ['DOM',/\bdocument\b|\bCustomEvent\b|\bdispatchEvent\b/],
  ['device API',/\bnavigator\b/],
  ['browser storage',/\blocalStorage\b|\bsessionStorage\b/],
  ['browser navigation',/\bhistory\b|\blocation\b|\bopen\s*\(/],
  ['network',/\bfetch\s*\(|\bXMLHttpRequest\b/]
])assert.equal((coreSource.match(pattern)||[]).length,0,`Navigation Contract Core must be browserless: ${label}`);

const context={console,Object,Array,Map,Set,Error,TypeError,String,Boolean,Number,Math,JSON,decodeURIComponent,encodeURIComponent};
vm.createContext(context);
vm.runInContext(coreSource,context,{filename:corePath});
const core=context.LuviaNavigationContractCoreV1;

assert.ok(core,'Navigation Contract Core missing');
assert.equal(core.contractId,'navigation.v1');
assert.equal(core.version,'1');
assert.equal(core.runtimeVersion,'1.0.0');
assert.equal(Object.isFrozen(core),true);
assert.equal(core.normalize('dashboard'),'today');
assert.equal(core.normalize('mobility'),'plan');
assert.equal(core.normalize('unknown'),'today');
assert.equal(core.get('unknown'),null);
assert.equal(core.get('places').mount.targetId,'places-module');
assert.equal(core.get('control-center-inbox').mount.owner,'booking');
assert.equal(core.items().length,5);
assert.equal(core.listRoutes().length,16);
assert.equal(core.get('profile-onboarding').mount.owner,'identity');
assert.equal(core.get('profile-onboarding').mount.mode,'fullscreen');
assert.equal(Object.isFrozen(core.items()),true);
assert.equal(Object.isFrozen(core.get('places')),true);

const queryIntent=core.fromUrl('https://app.luvia.test/index.html?screen=places&placeId=p-7');
assert.equal(queryIntent.kind,'screen.navigate');
assert.equal(queryIntent.route,'places');
assert.equal(queryIntent.params.placeId,'p-7');
assert.equal(queryIntent.requiresDomainCommand,false);
assert.equal(Object.isFrozen(queryIntent),true);

const hashIntent=core.fromUrl('https://app.luvia.test/#module=gallery&clusterId=c-2');
assert.equal(hashIntent.route,'gallery');
assert.equal(hashIntent.params.clusterId,'c-2');
assert.equal(core.resolve({screen:'booking-inbox',params:{threadId:'t-1'}}).route,'control-center-inbox');
assert.equal(core.toDeepLink({view:'places',params:{placeId:'p 1'}}),'luvia://screen/places?placeId=p%201');
assert.equal(core.diagnostics().domainTruth,false);
assert.equal(core.diagnostics().browserless,true);

assert.match(adapterSource,/LuviaNavigationContractCoreV1/);
assert.match(adapterSource,/LuviaNavigationContractV1/);
assert.match(adapterSource,/normalize:contract\.normalize/);
assert.doesNotMatch(adapterSource,/const items=Object\.freeze/,'Web registry must not duplicate route truth');

const deepLinkBlock=portsSource.slice(portsSource.indexOf('const deepLinkPort='),portsSource.indexOf('const offlineCachePort='));
assert.match(deepLinkBlock,/LuviaNavigationContractV1/);
assert.match(deepLinkBlock,/luvia:navigate-request/);
assert.match(deepLinkBlock,/kind:'screen\.navigate'/);
assert.doesNotMatch(deepLinkBlock,/LuviaApp\?\.show/,'DeepLinkPort must emit an intent instead of calling the Web App Shell directly');

const coreIndex=indexSource.indexOf('core/runtime/navigation-contract-core.js');
const adapterIndex=indexSource.indexOf('app/navigation-registry.js');
const shellIndex=indexSource.indexOf('app/app-shell.js');
assert.ok(coreIndex>=0&&coreIndex<adapterIndex&&adapterIndex<shellIndex,'Navigation Contract Core must load before Web adapter and App Shell');

console.log('M9.1 Navigation Contract Foundation: PASS');
