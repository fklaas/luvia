'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const shell=read('app/app-shell.js');
const index=read('index.html');
const sw=read('sw.js');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const manifest=read('docs/modularization/M14-LEGACY-RETIREMENT-MANIFEST.md');

assert.match(shell,/const runtimeAssetLoads=new Map\(\),runtimeAssetDiagnostics=new Map\(\)/);
assert.match(shell,/const bookingRuntimeAssets=Object\.freeze\(\{/);
assert.equal((shell.match(/path:'core\/booking\/booking-/g)||[]).length,6,'all six Booking runtime clients need one declarative descriptor');
assert.equal((shell.match(/document\.createElement\('script'\)/g)||[]).length,1,'App Shell must keep one shared dynamic script creation path');
assert.equal((shell.match(/document\.head\.appendChild\(node\)/g)||[]).length,1,'App Shell must keep one shared dynamic script append path');
assert.match(shell,/runtimeAssetUrl=path=>`\$\{path\}\?v=\$\{encodeURIComponent\(window\.LuviaKernelVersion\?\.build\|\|'13\.82\.44'\)\}`/);
assert.match(shell,/runtimeAssetLoads\.has\(descriptor\.id\)/,'concurrent asset requests must share one promise');
assert.match(shell,/timer=setTimeout\(\(\)=>validate\(/,'missing registrations need a bounded timeout');
assert.match(shell,/runtimeAssets:runtimeAssetSnapshot\(\)/,'runtime loader state must be observable');
assert.doesNotMatch(shell,/BOOKING_(?:AVAILABILITY|RESERVATION|EMAIL).*_SRC/,'stale per-client URL constants must be retired');
assert.doesNotMatch(shell,/13\.68\.11|13\.81\.0/,'active App Shell must not advertise stale runtime builds');

for(const retired of [
  'legacy/ui/index-v11.0.0.html',
  'legacy/ui/luvia-app-shell.css',
  'legacy/ui/luvia-dashboard.css',
  'legacy/ui/luvia-dashboard.js',
  'legacy/ui/luvia-v7-enhancements.js'
]){
  assert.equal(fs.existsSync(path.join(root,retired)),false,`${retired} must be retired after zero-reachability proof`);
  assert.equal(index.includes(retired),false);
  assert.equal(sw.includes(retired),false);
  assert.equal(ownership.includes(`${retired},`),false,'ownership registry must not claim a deleted artifact');
  assert.ok(manifest.includes(`\`${retired}\``),`retirement manifest missing ${retired}`);
}

for(const retained of ['core/legacy/paris-migrator.js','legacy/paris/cloud-adapter.js','paris-official.html']){
  assert.equal(fs.existsSync(path.join(root,retained)),true,`${retained} has active compatibility consumers and must remain`);
  assert.ok(manifest.includes(`\`${retained}\``),`retained debt classification missing ${retained}`);
}

for(const rootReplacement of ['luvia-app-shell.css','luvia-dashboard.css','luvia-dashboard.js','luvia-v7-enhancements.js']){
  assert.equal(fs.existsSync(path.join(root,rootReplacement)),true,`${rootReplacement} remains the exact compatibility recovery source`);
}

for(const forbidden of ['LuviaTripStore.upsert','supabase.from','functions.invoke','localStorage.setItem'])assert.equal(shell.includes(forbidden),false,`runtime loader must not acquire domain/data authority: ${forbidden}`);

console.log('M14.1 App Shell / Legacy Runtime Hardening: PASS');
console.log('Booking script loader paths: 6 -> 1');
console.log('Retired unreachable legacy/ui artifacts: 5');
console.log('Active Paris migration/cloud compatibility: explicitly retained');
