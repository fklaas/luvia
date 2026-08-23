'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const ui=read('core/booking/booking-ui.js');
const detection=read('core/booking/booking-engine-detection.js');
const ports=read('app/adapters/platform-port-adapters.mjs');
const safe=read('tests/run-m4.3-safe-regression.cjs');

assert.match(ui,/LuviaOwnerFlowNavigationV1\.reserveBookingHandoff\(\)/);
assert.match(ui,/LuviaOwnerFlowNavigationV1\.openBooking\(target\.toString\(\),\{reserved:handoffWindow\}\)/);
assert.doesNotMatch(ui,/window\.open\s*\(|handoffWindow\.location\.replace/,'Booking UI must not own browser popup navigation');
assert.match(ui,/recordPlaceHandoff/,'Booking attribution must remain before external navigation');

assert.match(detection,/function runtimeBase\(\)/);
assert.match(detection,/LuviaOwnerFlowNavigationV1/);
assert.doesNotMatch(detection,/\blocation\.href/,'Booking engine detection must not read browser location directly');
assert.match(ports,/return Boolean\(root\.open\(parsed\.href/,'ExternalNavigationPort must report popup blocking');
assert(safe.includes('tests/m9.5-booking-owner-flow-adoption.test.cjs'),'M9.5 Booking guard missing from Safe Regression');

console.log('M9.5 Booking Owner Flow Adoption: PASS');
