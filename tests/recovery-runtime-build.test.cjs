'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),script=fs.readFileSync(path.join(root,'scripts/build-runtime-bundle.cjs'),'utf8'),bumpScript=fs.readFileSync(path.join(root,'scripts/bump-runtime-release.cjs'),'utf8');
const files=new Map(),indexPath=path.join(root,'index.html'),versionPath=path.join(root,'intelligence/kernel/version.js');
const read=p=>files.has(p)?files.get(p):fs.readFileSync(p,'utf8');
const fakeFs={readFileSync:read,existsSync:p=>files.has(p)||fs.existsSync(p),writeFileSync:(p,s)=>files.set(p,s)};
const run=()=>vm.runInNewContext(script,{require:id=>id==='node:fs'?fakeFs:require(id),__dirname:path.join(root,'scripts'),Buffer,process:{stdout:{write(){}}}});
// Reproduce the former release corruption with duplicate entries at two revisions.
files.set(indexPath,read(indexPath).replace('</body>', '<template id="luviaRuntimeSourceManifest"><script src="core/runtime/boot-coordinator.js?v=old"></script></template><script type="module" src="app/luvia-runtime-loader.mjs?v=old" data-luvia-runtime-bundle="old"></script></body>'));
run();const first=read(indexPath);run();assert.equal(read(indexPath),first,'repeat build must be byte-stable');
assert.equal((first.match(/id="luviaRuntimeSourceManifest"/g)||[]).length,1);assert.equal((first.match(/src="app\/luvia-runtime-loader.mjs/g)||[]).length,1);
files.set(versionPath,read(versionPath).replace(/build:'[^']+'/,"build:'13.82.168.1099'"));run();
assert.equal((read(indexPath).match(/src="app\/luvia-runtime-loader.mjs/g)||[]).length,1,'version upgrade must replace, never append');
assert.ok(read(indexPath).includes('data-luvia-runtime-bundle="13.82.168.1099"'));
assert.match(bumpScript,/relative\.endsWith\('\.md'\)/,'a runtime bump must preserve historical Markdown release evidence');
assert.match(bumpScript,/relative==='docs\/planning\/status-plan\.v1\.json'/,'a runtime bump must preserve the consolidated historical status plan');
console.log('Runtime builder repairs duplicate entries and remains idempotent across upgrades: PASS');
