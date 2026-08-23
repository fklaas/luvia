'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const policySource=read('core/runtime/owner-flow-navigation-policy-core.js');
const adapterSource=read('app/adapters/owner-flow-navigation-web-adapter.js');
const historySource=read('app/adapters/navigation-history-web-adapter.js');
const portsSource=read('app/adapters/platform-port-adapters.mjs');
const authConfig=read('auth/config.js');
const authSession=read('auth/session.js');
const authUi=read('auth/ui.js');
const joinSource=read('core/trips/join-flow.js');
const inviteSource=read('core/trips/trip-experience.js');
const indexSource=read('index.html');
const swSource=read('sw.js');
const safeRunner=read('tests/run-m4.3-safe-regression.cjs');

for(const token of ['window','document','navigator','globalThis','localStorage','sessionStorage','history.pushState','history.replaceState','location.href','location.assign','location.replace','location.reload','supabase'])assert(!policySource.includes(token),`browserless Owner Flow Policy contains ${token}`);
const context=vm.createContext({Object,Array,Set,Map,String,Boolean,Number,Error,TypeError,RegExp,Date});
vm.runInContext(`${policySource}\nthis.policy=LuviaOwnerFlowNavigationPolicyCoreV1;`,context);
const policy=context.policy;
assert.equal(policy.contractId,'owner-flow-navigation.v1');
assert.equal(policy.diagnostics().browserless,true);
assert.equal(policy.diagnostics().domainTruth,false);
const current={path:'/index.html',query:{screen:'places',invite:'old-code',keep:'1'},hash:'route=places'};
let effect=policy.transition('join.open',{code:' luvia-7k2 '},current);
assert.equal(effect.joinCode,'LUVIA7K2');
assert.equal(effect.address.query.join,'LUVIA7K2');
assert.equal(effect.address.query.invite,undefined);
assert.equal(effect.address.query.keep,'1');
assert.equal(effect.reload,false);
effect=policy.transition('join.clear',{},effect.address);
assert.equal(effect.address.query.join,undefined);
assert.equal(effect.address.query.keep,'1');
effect=policy.transition('auth.logout',{},current);
assert.deepEqual(Object.keys(effect.address.query),[]);
assert.equal(effect.address.hash,'');
assert.equal(policy.transition('auth.login.success',{},current).history,'preserve');
assert.equal(policy.transition('booking.external',{url:'https://example.test/reserve'},current).action,'external');
assert.throws(()=>policy.transition('booking.external',{url:'javascript:alert(1)'},current),error=>error.code==='OWNER_FLOW_EXTERNAL_URL_INVALID');
assert.throws(()=>policy.transition('join.open',{code:'x'},current),error=>error.code==='JOIN_CODE_INVALID');
assert.equal(Object.isFrozen(effect),true);

assert.match(adapterSource,/LuviaNavigationHistoryV1/);
assert.match(adapterSource,/replaceLocation/);
assert.match(adapterSource,/ExternalNavigationPort/);
assert.match(adapterSource,/luvia:owner-flow-navigation/);
assert.doesNotMatch(adapterSource,/history\.(?:pushState|replaceState)/,'Owner Flow adapter must keep Web History writes in the History adapter');
assert.match(historySource,/function replaceLocation/);
assert.match(portsSource,/reserve\(\{placeholder='\/booking-handoff\.html'/);
assert.match(portsSource,/async share\(\{title='',text='',url=''/);
assert.match(portsSource,/async copyText\(value\)/);

assert.doesNotMatch(authConfig,/\blocation\./,'Auth config must use Environment URL policy');
assert.doesNotMatch(authSession,/history\.replaceState|location\.pathname/,'Auth sign-out must not write Web History directly');
assert.match(authSession,/LuviaOwnerFlowNavigationV1\?\.authLogout/);
assert.doesNotMatch(authUi,/location\.(?:assign|replace|reload)|setTimeout\(\(\)=>location/,'Login must be reload-free');
assert.match(authUi,/LuviaOwnerFlowNavigationV1\?\.authLoginSuccess/);

for(const token of ['localStorage','history.replaceState','location.href','location.assign','location.replace','location.reload'])assert(!joinSource.includes(token),`Join Flow bypasses owner navigation/storage boundary with ${token}`);
assert.match(joinSource,/require\?\.\('StoragePort'\)/);
assert.match(joinSource,/LuviaOwnerFlowNavigationV1/);
assert.match(joinSource,/cleanUrl\(\{notify:false\}\)/,'successful Join must preserve completion UI before explicit open');
for(const token of ['navigator.clipboard','navigator.share','location.origin','location.pathname','location.href','window.open'])assert(!inviteSource.includes(token),`Trip Invite bypasses Sharing/External Navigation Ports with ${token}`);
assert.match(inviteSource,/require\('SharingPort'\)/);
assert.match(inviteSource,/require\('ExternalNavigationPort'\)/);

assert.equal(fs.existsSync(path.join(root,'luvia-app-shell.js')),false,'inactive root legacy shell must be deleted after reachability proof');
assert.equal(fs.existsSync(path.join(root,'legacy/ui/luvia-app-shell.js')),false,'duplicate legacy UI shell must be deleted after reachability proof');
assert(!indexSource.includes('luvia-app-shell.js'),'active index must not reference deleted legacy shell');
assert(!swSource.includes("'luvia-app-shell.js'"),'Service Worker must not cache deleted legacy shell');

const policyIndex=indexSource.indexOf('core/runtime/owner-flow-navigation-policy-core.js');
const historyIndex=indexSource.indexOf('app/adapters/navigation-history-web-adapter.js');
const adapterIndex=indexSource.indexOf('app/adapters/owner-flow-navigation-web-adapter.js');
const shellIndex=indexSource.indexOf('app/app-shell.js');
assert(policyIndex>0&&historyIndex>policyIndex&&adapterIndex>historyIndex&&shellIndex>adapterIndex,'Owner Flow Policy / History / Web adapter / Shell load order invalid');
for(const asset of ['core/runtime/owner-flow-navigation-policy-core.js','app/adapters/owner-flow-navigation-web-adapter.js'])assert(swSource.includes(`'${asset}'`),`Service Worker missing ${asset}`);
assert(safeRunner.includes('tests/m9.5-owner-flow-navigation-foundation.test.cjs'),'M9.5 Platform guard missing from Safe Regression');

console.log('M9.5 Owner Flow Navigation Platform Foundation: PASS');
