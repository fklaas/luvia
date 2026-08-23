'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');
const navigationSource=read('core/runtime/navigation-contract-core.js');
const historySource=read('core/runtime/navigation-history-policy-core.js');
const adapterSource=read('app/adapters/navigation-history-web-adapter.js');
const portsSource=read('app/adapters/platform-port-adapters.mjs');
const indexSource=read('index.html');

assert.doesNotMatch(historySource,/\b(?:window|document|navigator|localStorage|sessionStorage|globalThis)\b/,'History Policy Core must stay browserless');
assert.doesNotMatch(historySource,/\b(?:pushState|replaceState|popstate|hashchange|location)\b/,'History Policy Core must not use Web History or URL globals');
assert.doesNotMatch(historySource,/Luvia(?:Trip|Places|Media|Identity|Booking)(?:Store|State)/,'History Policy Core must not consume private Domain Truth');

const context=vm.createContext({Object,Array,Map,Set,Error,TypeError,String,Boolean,Number,Math,JSON,Date,decodeURIComponent,encodeURIComponent});
vm.runInContext(`${navigationSource}\n${historySource}\nthis.navigation=LuviaNavigationContractCoreV1;this.historyCore=LuviaNavigationHistoryPolicyCoreV1;`,context);
const navigation=context.navigation;
const historyCore=context.historyCore;

assert.equal(historyCore.contractId,'navigation-history.v1');
assert.equal(historyCore.version,'1');
assert.equal(historyCore.runtimeVersion,'1.0.0');
assert.equal(historyCore.diagnostics().browserless,true);
assert.equal(historyCore.diagnostics().domainTruth,false);
assert.equal(historyCore.matchUrl('https://app.luvia.test/index.html',navigation),null,'plain app root must not override the user default view');

const queryIntent=historyCore.matchUrl('https://app.luvia.test/index.html?screen=places&category=restaurants',navigation);
assert.equal(queryIntent.route,'places');
assert.equal(queryIntent.params.category,'restaurants');
assert.equal(queryIntent.source,'history-url');
assert.equal(historyCore.matchUrl('https://app.luvia.test/#module=gallery&clusterId=c-4',navigation).route,'gallery');
assert.equal(historyCore.matchUrl('luvia://screen/control-center-identity',navigation).route,'control-center-identity');
assert.equal(historyCore.matchUrl('https://app.luvia.test/unknown',navigation),null);

let tick=0;
const policy=historyCore.createPolicy({navigation,now:()=>`t-${++tick}`,createKey:()=>`k-${tick}`});
assert.equal(policy.snapshot().status,'idle');
assert.equal(policy.start('https://app.luvia.test/index.html').action,'none');

const initial=policy.project(navigation.createIntent('today',{source:'app-shell'}));
assert.equal(initial.action,'replace');
assert.equal(initial.entry.position,0);
assert.equal(initial.snapshot.length,1);
assert.equal(policy.project('today').action,'none');

const pushed=policy.project({route:'places',params:{category:'restaurants'},source:'app-shell'});
assert.equal(pushed.action,'push');
assert.equal(pushed.entry.position,1);
assert.equal(pushed.snapshot.length,2);
assert.equal(policy.project({route:'places',params:{category:'restaurants'}},{replace:true}).action,'replace');

const restored=policy.restore(navigation.createIntent('today',{source:'history-pop'}),{position:0,key:'initial'});
assert.equal(restored.action,'restore');
assert.equal(restored.entry.position,0);
assert.equal(policy.back().kind,'navigation.history');
assert.equal(policy.back().action,'back');
assert.equal(policy.forward().action,'forward');
assert.equal(Object.isFrozen(policy.snapshot()),true);

assert.match(adapterSource,/LuviaNavigationHistoryPolicyCoreV1/);
assert.match(adapterSource,/addEventListener\('popstate'/);
assert.match(adapterSource,/history\.pushState/);
assert.match(adapterSource,/history\.replaceState/);
assert.match(adapterSource,/luvia:navigate-request/);
assert.match(adapterSource,/LuviaNavigationHistoryV1/);
assert.doesNotMatch(adapterSource,/Luvia(?:Trip|Places|Media|Identity|Booking)(?:Store|State)/,'Web History adapter must not consume Domain Truth');

const deepLinkBlock=portsSource.slice(portsSource.indexOf('const deepLinkPort='),portsSource.indexOf('const offlineCachePort='));
assert.match(deepLinkBlock,/intent/);
assert.match(deepLinkBlock,/luvia:navigate-request/);
assert.doesNotMatch(deepLinkBlock,/history\.(?:pushState|replaceState)/,'DeepLinkPort must not become a second Web History owner');

const navigationIndex=indexSource.indexOf('core/runtime/navigation-contract-core.js');
const historyIndex=indexSource.indexOf('core/runtime/navigation-history-policy-core.js');
const registryIndex=indexSource.indexOf('app/navigation-registry.js');
const adapterIndex=indexSource.indexOf('app/adapters/navigation-history-web-adapter.js');
const shellIndex=indexSource.indexOf('app/app-shell.js');
assert.ok(navigationIndex>=0&&navigationIndex<historyIndex&&historyIndex<registryIndex&&registryIndex<adapterIndex&&adapterIndex<shellIndex,'Navigation, History Policy, Web adapter and Consumer Shell load order must be explicit');

console.log('M9.3 Navigation History / Back / Deep-Link Policy Foundation: PASS');
