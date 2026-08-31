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
const ignore=read('.assetsignore');

assert.equal(manifest.schemaVersion,1);
assert.equal(manifest.currentBuild,'13.82.125');
assert.equal(manifest.policy.minimumRetainedBuilds,3);
assert.deepEqual(manifest.retainedBuilds.map(item=>item.build),['13.82.121','13.82.122','13.82.123','13.82.124']);
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

assert.match(loader,/luvia-runtime-precontext-13\.82\.125\.bundle\.js/);
assert.match(loader,/luvia-runtime-postcontext-13\.82\.125\.bundle\.js/);
assert.doesNotMatch(loader,/13\.82\.12[1-4]\.bundle\.js/,'the current loader may not execute a compatibility bundle');
assert.match(worker,/luvia-runtime-precontext-13\.82\.125\.bundle\.js/);
assert.doesNotMatch(worker,/APP_SHELL\.push\(scoped\('app\/luvia-runtime-(?:precontext|postcontext)-13\.82\.12[1-4]/,'compatibility bundles must not inflate the current service-worker precache');
assert.doesNotMatch(ignore,/^\/?app(?:\/|$)/m,'the Cloudflare asset boundary may not exclude the runtime upgrade bridge');

console.log('M16.5 Step 18 runtime bundle upgrade bridge: PASS');
console.log('Retained split builds: 13.82.121 / 13.82.122 / 13.82.123 / 13.82.124');
