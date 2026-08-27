'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const entry=read('app/public-entry.js');
const bookings=read('app/bookings-view.js');
const shell=read('app/app-shell.js');
const safe=read('tests/run-m4.3-safe-regression.cjs');

assert.match(entry,/LuviaOwnerFlowNavigationV1/);
assert.match(entry,/window\.addEventListener\('popstate', syncAuthToLocation/);
assert.match(entry,/history\[replace \? 'replaceState' : 'pushState'\]/);
assert.match(entry,/url\.hash = '#compass-gate'/);
assert.match(entry,/history\.replaceState\(\{ luviaPublicAuth: null, luviaCompassOpen: true \}/);
assert.doesNotMatch(entry,/history\.back\(\)/,'Closing Landing/Auth must preserve the already-open Compass without history traversal');
assert.doesNotMatch(entry,/location\.(?:assign|replace|reload)/,'Public Landing/Auth must not perform document navigation for local auth states');

assert.match(bookings,/LuviaOwnerFlowNavigationV1\.openBooking\(url\)/);
assert.doesNotMatch(bookings,/window\.open\s*\(/,'Consumer Booking must use owner-flow external navigation');

assert.match(shell,/addEventListener\('luvia:owner-flow-navigation'/);
assert.match(shell,/event\.detail\?\.owner!==\'join\'/);
assert.match(shell,/Promise\.resolve\(\)\.then\(\(\)=>render\(\)\)/);
assert.match(shell,/LuviaJoinFlow\?\.renderIfPending/);
assert.doesNotMatch(shell,/location\.(?:assign|replace|reload)|history\.(?:pushState|replaceState)/,'Active App Shell must not become a second URL owner');
assert(safe.includes('tests/m9.5-consumer-owner-flow-adoption.test.cjs'),'M9.5 Consumer guard missing from Safe Regression');

console.log('M9.5 Consumer Owner Flow Adoption: PASS');
