'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');
const contract=JSON.parse(read('config/luvia-m16.5-visual-parity-contract.json'));
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const gateDoc=read('docs/modularization/M16.5-VISUAL-PARITY-AND-NO-SUBSTITUTION-GATE.md');

assert.equal(contract.schemaVersion,1);
assert.equal(contract.binding,true,'the accepted M16.5 reference must remain binding');
assert.match(contract.decision,/completely/);
assert.equal(contract.reference.fileCount,27);
assert.equal(contract.reference.totalBytes,11703321);

const expectedHashes={
  'index.html':'e9292e437fe9889d7906ea95f7ef058619b63aaf31cf0a7c9205e54098bfb525',
  'styles.css':'cae88bad7e47f94e00c66c7dc14c9068da1ecb62c1085732e09de4807fc519c5',
  'app-redesign.css':'27ad4fcc5c736870b9159cc3579c7258af600b2fc079cba30eacb4fd67f8ab9a',
  'app.js':'fdb3c14ff96886697c53f8c759e41cd22f3b40f8787f81be408ce82b24713560',
  'landing.html':'3e25d9fd8027ede08d8eb4b323a4a1d9c8de0f114cb19d6796db2625a5bd5d83',
  'onboarding.html':'30a649e406af64ee87e1fab69681dd6fb2d01041cab89dc55af21843c1a7ad74'
};
for(const [file,hash] of Object.entries(expectedHashes)){
  const entry=contract.reference.keyFiles.find(item=>item.path===file);
  assert.ok(entry,`accepted reference manifest missing ${file}`);
  assert.equal(entry.sha256,hash,`accepted reference hash drifted for ${file}`);
  assert.match(entry.sha256,/^[0-9a-f]{64}$/);
}

for(const phrase of ['legacy screen','approximate styling','feature removal','desktop-only parity','silent visual deviation']){
  assert.ok(contract.forbiddenSubstitutions.some(item=>item.includes(phrase)),`no-substitution rule missing: ${phrase}`);
}

const requiredSurfaceIds=[
  'public-landing','account-onboarding','trip-onboarding','signed-in-shell','today',
  'plan-places-booking','trip-journey-collaboration','memories-cards-albums-stories',
  'profile-profile-compass','intelligence-chat-actions','overlays-dialogs-sheets-popups',
  'cross-product-runtime-states'
];
assert.deepEqual(contract.surfaces.map(surface=>surface.id),requiredSurfaceIds);
for(const surface of contract.surfaces){
  for(const field of contract.requiredGateFields){
    assert.ok(Object.hasOwn(surface.gates,field),`${surface.id} is missing parity gate ${field}`);
  }
}

assert.equal(contract.releaseGate.mainAllowed,false,'Main must remain locked during incomplete visual adoption');
assert.equal(contract.releaseGate.productionAllowed,false,'Production must remain locked during incomplete visual adoption');
assert.ok(contract.surfaces.some(surface=>surface.status.includes('pending')||surface.status.includes('progress')),'an intermediate adoption may not claim completion');

assert.match(gateDoc,/binding interface specification/);
assert.match(gateDoc,/A redesigned header around a legacy screen does not pass/);
assert.match(gateDoc,/Main and Production remain\s+locked/);

for(const file of [
  'config/luvia-m16.5-visual-parity-contract.json',
  'docs/modularization/M16.5-VISUAL-PARITY-AND-NO-SUBSTITUTION-GATE.md',
  'tests/m16.5i-visual-parity-no-substitution-gate.test.cjs'
])assert.ok(ownership.includes(file),`ownership registry missing ${file}`);

console.log('M16.5I Visual Parity / No-Substitution gate: PASS');
console.log('Accepted reference key-file hashes: 6/6 PINNED');
console.log('Main / Production visual release lock: ACTIVE');
