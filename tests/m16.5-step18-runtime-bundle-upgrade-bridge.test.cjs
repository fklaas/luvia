'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const manifest=JSON.parse(read('app/luvia-runtime-compatibility.manifest.json'));
const loader=read('app/luvia-runtime-loader.mjs');
const worker=read('sw.js');
const pwa=read('intelligence/pwa-service.js');
const ignore=read('.assetsignore');

assert.equal(manifest.schemaVersion,1);
assert.equal(manifest.currentBuild,'13.82.168.57');
assert.equal(manifest.policy.minimumRetainedBuilds,3);
assert.deepEqual(manifest.retainedBuilds.map(item=>item.build),['13.82.121','13.82.122','13.82.123','13.82.124','13.82.125','13.82.126','13.82.127','13.82.128','13.82.129','13.82.130','13.82.135','13.82.136','13.82.137','13.82.138','13.82.139','13.82.140','13.82.141','13.82.142','13.82.143','13.82.144','13.82.145','13.82.146']);
assert.equal(manifest.policy.currentLoaderUsesCompatibilityBundle,false);
assert.equal(manifest.policy.precacheCompatibilityBundles,false,'compatibility bundles must be addressable without adding multi-megabyte precache debt');

for(const release of manifest.retainedBuilds){
  for(const key of ['preContext','postContext']){
    const relative=release[key];
    const absolute=path.join(root,relative);
    assert.equal(fs.existsSync(absolute),true,`${release.build} upgrade bridge is missing ${relative}`);
    const source=fs.readFileSync(absolute,'utf8');
    assert.match(source,/^\/\* Generated (?:before|after) LuviaTripContext by scripts\/build-runtime-bundle\.cjs\./,`${relative} is not an exact JavaScript runtime bundle`);
    assert.ok(Buffer.byteLength(source)>300000,`${relative} is unexpectedly small and could be an SPA HTML fallback`);
    new vm.Script(source,{filename:relative});
  }
}

assert.match(loader,/luvia-runtime-precontext-13\.82\.168\.bundle\.js/);
assert.match(loader,/luvia-runtime-postcontext-13\.82\.168\.bundle\.js/);
assert.doesNotMatch(loader,/13\.82\.(?:12[1-9]|13[05678]|14[0-6])\.bundle\.js/,'the current loader may not execute a compatibility bundle');
assert.match(worker,/luvia-runtime-precontext-13\.82\.168\.bundle\.js/);
assert.doesNotMatch(worker,/APP_SHELL\.push\(scoped\('app\/luvia-runtime-(?:precontext|postcontext)-13\.82\.(?:12[1-9]|13[05678]|14[0-6])/,'compatibility bundles must not inflate the current service-worker precache');
assert.ok(worker.includes("if(/\\.(?:m?js|css|json"),'the version-aware static-asset branch must include .mjs runtime loaders');
assert.match(worker,/token===BUILD\|\|token\.startsWith\(`\$\{BUILD\}-`\)/,'build-suffixed runtime URLs must resolve to the current immutable cache identity');
assert.match(pwa,/activateExpectedWaitingSoon\(registration,\{preserveDocument:false\}\)/,'a controlled build upgrade must reload under the new controller instead of preserving a mixed-build document');
assert.doesNotMatch(pwa,/controlledUpgradeRecoveryStarted&&activateExpectedWaiting\(reg,\{preserveDocument:true\}\)/,'the late waiting-worker path must not re-enable mixed-build document preservation');
assert.doesNotMatch(ignore,/^\/?app(?:\/|$)/m,'the Cloudflare asset boundary may not exclude the runtime upgrade bridge');

console.log('M16.5 Step 18 runtime bundle upgrade bridge: PASS');
console.log('Retained split builds: 13.82.121–13.82.130 plus 13.82.135–13.82.146');

const cacheName=worker.match(/const CACHE='([^']+)'/)[1];
assert.ok(pwa.includes('`luvia-shell-v${BUILD}-local-recovery`'),'PWA cleanup must preserve the service worker cache identity');
assert.equal(cacheName,`luvia-shell-v${manifest.currentBuild}-local-recovery`);
const warmContext=vm.createContext({URL,self:{registration:{scope:'https://example.test/'}},caches:{},console});
vm.runInContext(worker.slice(0,worker.indexOf('async function precacheShell'))+';globalThis.warm=WARM_SHELL;',warmContext);
assert.ok(warmContext.warm.some(x=>x.includes('runtime-postcontext')));
assert.ok(!warmContext.warm.some(x=>x.includes('assets/public-landing')||x.includes('place-detail-service.js')),'mobile warming must not download marketing media or bundled source copies');
