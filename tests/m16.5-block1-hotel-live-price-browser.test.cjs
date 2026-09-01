'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');
const fixture=fs.readFileSync('tests/fixtures/m16.5-block1-hotel-live-price-browser.html','utf8');
for(const text of ['Hotelpreise, die man einordnen kann.','2 Live-Testquellen','Noch keine Quelle verbunden','12.06.2027','14.06.2027','kein Marktbestpreis','Provisionen beeinflussen die Reihenfolge nicht','Kontrollierter lokaler Abnahmetest'])assert.ok(fixture.includes(text),`visible Hotel proof missing: ${text}`);
assert.match(fixture,/booking-live-stay-search-core\.js/);
assert.match(fixture,/LuviaBookingLiveStaySearchCore\.buildResult/);
assert.doesNotMatch(fixture,/2027-06-12–2027-06-14/,'visible dates must use TT.MM.JJJJ');
console.log('M16.5 Block 1 visible Hotel live-price decision browser: PASS');
