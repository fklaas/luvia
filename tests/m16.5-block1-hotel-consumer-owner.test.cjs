'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const moduleSource=fs.readFileSync('modules/accommodations/accommodation-module.js','utf8');
const css=fs.readFileSync('modules/accommodations/accommodation-module.css','utf8');
const fixture=fs.readFileSync('tests/fixtures/m16.5-block1-hotel-consumer-owner-browser.html','utf8');

for(const token of ["VERSION='5.0.0-bright-stay-offer-identity'",'reads.searchStayOffers','commands.openStayOffer','userGesture:true','Dieses Angebot öffnen','Datumsformat: TT.MM.JJJJ','Keine Livepreis-Quelle verbunden','kein Marktbestpreis',"placeType:'accommodation'",'LuviaPlaceExperience.plannedPanel','LuviaPlaceExperience.discovery','LuviaPlaceCollections.favoritePanel','LuviaPlaceUI.card'])assert.ok(moduleSource.includes(token),`Hotel consumer owner token missing: ${token}`);
for(const forbidden of ['Tickets prüfen','Eintritt noch ungeklärt','data-book-accommodation','commands.openPlaceBooking'])assert.ok(!moduleSource.includes(forbidden),`Hotel module must not contain generic ticket/place booking path: ${forbidden}`);
assert.match(css,/\.luvia-accommodations-v2/);
assert.match(css,/\.hotel-offer-card/);
assert.doesNotMatch(css,/consume the restaurant design contract/i);
for(const token of ['Kontrollierte Browser-Abnahme','2027-06-12','2027-06-14','HBX-9','HBX-RATE-9','openStayOffer','accommodation-module.css','accommodation-module.js'])assert.ok(fixture.includes(token),`Visible Hotel owner fixture missing: ${token}`);
assert.ok(!fixture.includes('Tickets prüfen'));
console.log('M16.5 Block 1 bright Hotel consumer + exact owner handoff: PASS');
console.log('TT.MM.JJJJ, honest live-price copy, no ticket semantics and no generic Place booking route: PASS');
