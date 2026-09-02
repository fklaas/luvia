'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const moduleSource=fs.readFileSync('modules/accommodations/accommodation-module.js','utf8');
const css=fs.readFileSync('modules/accommodations/accommodation-module.css','utf8');
const fixture=fs.readFileSync('tests/fixtures/m16.5-block1-hotel-consumer-owner-browser.html','utf8');

for(const token of ["VERSION='5.2.0-bright-map-media-booking'",'luvia-hotels-bright-v3','data-hotel-search-status','Unterkünfte konnten nicht geladen werden','data-place-retry','reads.searchStayOffers','commands.openStayOffer','commands.openPlaceBooking','data-hotel-booking','data-hotel-detail-booking','data-hotel-map','mountProjection','cardReference','userGesture:true','Dieses Angebot öffnen','Datumsformat: TT.MM.JJJJ','Duffel Stays beantragt · Freigabe ausstehend','kein Marktbestpreis',"placeType:'accommodation'",'LuviaPlaceExperience.plannedPanel','LuviaPlaceExperience.discovery','LuviaPlaceCollections.favoritePanel','LuviaPlaceUI.card'])assert.ok(moduleSource.includes(token),`Hotel consumer owner token missing: ${token}`);
for(const forbidden of ['Tickets prüfen','Eintritt noch ungeklärt','data-book-accommodation'])assert.ok(!moduleSource.includes(forbidden),`Hotel module must not contain generic ticket semantics: ${forbidden}`);
assert.match(css,/\.luvia-accommodations-v2/);
assert.match(css,/\.hotel-offer-card/);
assert.doesNotMatch(css,/consume the restaurant design contract/i);
for(const token of ['Kontrollierte Browser-Abnahme','2027-06-12','2027-06-14','HBX-9','HBX-RATE-9','openStayOffer','accommodation-module.css','accommodation-module.js'])assert.ok(fixture.includes(token),`Visible Hotel owner fixture missing: ${token}`);
assert.ok(!fixture.includes('Tickets prüfen'));
console.log('M16.5 Block 1 bright Hotel consumer + exact owner handoff: PASS');
console.log('TT.MM.JJJJ, honest live-price copy, shared map, exact Place booking route and no ticket semantics: PASS');
