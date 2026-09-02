'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8').replace(/\r\n?/g,'\n');
const bytes=relative=>fs.readFileSync(path.join(ROOT,relative));
const sha256=relative=>crypto.createHash('sha256').update(bytes(relative)).digest('hex');
const pngSize=relative=>{
  const source=bytes(relative);
  assert.equal(source.subarray(1,4).toString('ascii'),'PNG',`${relative} is not a PNG`);
  return{width:source.readUInt32BE(16),height:source.readUInt32BE(20)};
};

const compact=read('assets/brand/luvia-living-compass/compact.svg');
const rootLogo=read('luvia-logo.svg');
const favicon=read('favicon.svg');
const index=read('index.html');
const worker=read('sw.js');
const manifest=JSON.parse(read('manifest.webmanifest'));
const version=read('intelligence/kernel/version.js');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
const pcr=read('docs/modularization/PCR-M16.5G-GLOBAL-LIVING-COMPASS-RELEASE.md');

assert.equal(rootLogo,compact,'global root logo must equal the official compact Living Compass vector');
assert.equal(favicon,compact,'SVG favicon must equal the official compact Living Compass vector');
assert.match(rootLogo,/Luvia Living Compass/);
assert.doesNotMatch(rootLogo,/M64 99C51 88/,'legacy heart-route mark must be retired from the root logo');

assert.equal(sha256('favicon.ico'),'46215d2c6286f3d396f0d1d40a06a0248ad3000901a488ccf0c4a693ac41fc3c');
assert.equal(sha256('icon-192.png'),'29403b7e1bd1efe4e3e175dfe7fb1d7919f9b60d029701be045003da443fd109');
assert.equal(sha256('icon-512.png'),'23cfeb50eaae1ac1e31fb36e5f6cb72c5a21815e00d42234b47eb1ea88c1bc5d');
assert.deepEqual(pngSize('icon-192.png'),{width:192,height:192});
assert.deepEqual(pngSize('icon-512.png'),{width:512,height:512});

assert.equal(manifest.background_color,'#fff8f7');
assert.equal(manifest.theme_color,'#ef6254');
for(const icon of ['icon-192.png','icon-512.png'])assert.ok(manifest.icons.some(entry=>entry.src===icon),`manifest misses ${icon}`);
for(const asset of ['luvia-logo.svg','favicon.svg','favicon.ico','icon-192.png','icon-512.png']){
  assert.equal(worker.split(`'${asset}'`).length-1,1,`Service Worker must cache ${asset} exactly once`);
}

assert.match(version,/core:'4\.82\.155'/);
assert.match(version,/build:'13\.82\.155'/);
assert.match(version,/name:'M16\.5 Places Hotel Recovery'/);
assert.match(version,/channel:'integration-preview'/);
assert.match(worker,/const CACHE='luvia-shell-v13\.82\.155'/);
assert.equal(index.includes('?v=13.82.49'),false,'active entry must not retain the previous runtime cache key');
assert.ok(index.includes('app/app-shell.js?v=13.82.155'));
assert.ok(index.includes('app/today/today-experience.js?v=13.82.155'));
assert.ok(index.includes('core/experience/experience-contract-core.js?v=13.82.155'));

for(const file of ['luvia-logo.svg','favicon.svg','favicon.ico','icon-192.png','icon-512.png','manifest.webmanifest','docs/modularization/PCR-M16.5G-GLOBAL-LIVING-COMPASS-RELEASE.md','tests/m16.5g-global-living-compass-release.test.cjs'])assert.ok(ownership.includes(file),`ownership registry misses ${file}`);
assert.match(pcr,/No schema, RPC, RLS, bucket, Edge Function or secret mutation/);

console.log('M16.5G Global Living Compass / Platform release: PASS');
console.log('Root logo / favicon / PWA icons: OFFICIAL COMPASS');
console.log('App / Core: 13.82.155 / 4.82.155');
