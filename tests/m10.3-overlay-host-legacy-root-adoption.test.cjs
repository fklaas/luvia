'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const host=read('core/ui/ui-manager.js');
const safeRunner=read('tests/run-m4.3-safe-regression.cjs');

assert.match(host,/const VERSION='2\.3\.0'/);
assert.match(host,/function adopt\(overlay,options=\{\}\)/);
assert.match(host,/overlayRoot instanceof HTMLElement\?overlayRoot:document\.createElement\('div'\)/,'Host must accept an existing legacy root');
assert.match(host,/overlay\.firstElementChild\|\|overlay/,'Legacy root must derive its semantic content without a wrapper rewrite');
assert.match(host,/if\(!overlay\.isConnected\)document\.body\.appendChild\(overlay\)/,'Host must preserve already-connected roots');
assert.match(host,/if\(content!==overlay&&!overlay\.contains\(content\)\)overlay\.appendChild\(content\)/,'Adoption must not move an existing content tree');
assert.match(host,/:where\(\.luvia-ui-overlay\)/,'Host defaults must remain lower-specificity than owner CSS');
assert.match(host,/overlay\.classList\.add\('luvia-living-sheet-overlay'\)/,'Sheet mounts must receive the canonical bottom-sheet overlay class');
assert.match(host,/content\.classList\.add\('luvia-living-sheet'\)/,'Sheet content must receive the canonical white Living Sheet class');
assert.match(host,/background:linear-gradient\(145deg,rgba\(255,255,255,\.995\)/,'Canonical Living Sheets must default to the accepted light surface');
assert.match(host,/mount,adopt,closeTop/,'Web compatibility surface must expose adopt next to mount');
assert.doesNotMatch(host,/history\.(?:pushState|replaceState|back)/,'Legacy adoption must not become a second History owner');
assert(safeRunner.includes('tests/m10.3-overlay-host-legacy-root-adoption.test.cjs'),'M10.3 guard missing from Safe Regression');

console.log('M10.3 Overlay Host Legacy Root Adoption: PASS');
