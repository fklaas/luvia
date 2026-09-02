'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=file=>fs.readFileSync(file,'utf8');

const places=read('app/places/places-spatial-experience.js');
const placesCore=read('app/places/places-spatial-composition-core.js');
const placesOwner=read('core/places/places-domain-contract-core.js');
const placesCss=read('app/places/places-spatial-experience.css');
const hotels=read('modules/accommodations/accommodation-module.js');
const hotelCss=read('modules/accommodations/accommodation-module.css');
const sheet=read('app/journey/journey-suggestion-sheet.js');
const sheetCss=read('app/journey/journey-day-composer.css');
const journeyAdapter=read('core/platform/journey-contract-adapter.js');
const journeyComposer=read('app/journey/journey-day-composer.js');

for(const token of ["themeparks:{key:'themeparks'","wellness:{key:'wellness'","water:{key:'water'","malls:{key:'malls'"])assert.ok(placesOwner.includes(token),`missing canonical Places category: ${token}`);
assert.match(places,/filter\(category=>category\.key!=='accommodation'&&category\.primaryType!=='accommodation'\)/,'Hotels must remain outside the Places consumer category rail');
for(const token of ['vegetarian','reservable','accessible','priceLevel','subtype'])assert.ok(places.includes(token),`missing contextual Places filter: ${token}`);
assert.match(places,/Google-\/Provider-Fakten, keine KI-Vermutungen/);
assert.match(places,/maxViewportResults:MAX_RESULTS/,'Places must compose the bounded 80-result viewport contract rather than expose a 20-item UI shortlist');
assert.match(places,/data-places-history-region/);
assert.match(places,/state\.history=.*\.slice\(0,6\)/);
assert.match(placesCore,/function preferredResultIds\(results\)/,'preference pins need an evidence-backed relative selection policy');
assert.match(placesCore,/\.slice\(0,5\)/,'the map may highlight only a bounded set of the most relevant evidence-backed pins');
assert.match(placesCore,/result\.preferenceCoverage>0&&result\.preferenceReasons\.length>0/,'a preferred pin must keep positive traveler coverage and explicit reasons');
assert.match(placesCss,/\.lv-places-spatial__marker\.is-preferred/);
assert.match(places,/innerHTML=`<span>\$\{marker\.rank\}<\/span><b aria-hidden="true">Passt<\/b>`/,'preference fit must be rendered as real accessible marker content rather than decorative CSS');

for(const token of ['data-hotel-filter="rating"','data-hotel-filter="reviews"','data-hotel-filter="accessible"','data-hotel-pin-history','minUserRatingCount','accessibleOnly'])assert.ok(hotels.includes(token),`missing shared Hotel map behavior: ${token}`);
assert.match(hotels,/maxResultCount:80/);
assert.match(hotels,/Places-Preisniveaus sind keine Zimmerpreise/,'the Hotel surface must not disguise a Place price level as a room price');
assert.match(hotels,/rememberHotel\(selected\);openHotelSheet\(selected\)/,'one Hotel pin must enter history and open exactly that Hotel');
assert.doesNotMatch(hotels,/LuviaPlaceDetail(?!s)|openLoading\(\{typeLabel:'Unterkunft'/,'the retired Hotel detail surface must not remain reachable in the Hotel consumer');
assert.match(hotelCss,/\.hotel-filter-reveal/);
assert.match(hotelCss,/\.hotel-pin-history/);

assert.match(sheet,/Promise\.all\(rawInput\.places\.map\(place=>within\(enrich\(place\),3200,place\)\)\)/,'provider photo hydration must precede the first exact-pin card paint within a bound');
assert.match(sheet,/loading="eager" fetchpriority="high"/);
assert.match(sheet,/Kein Anbieterfoto/,'missing real media must have an honest fallback rather than an invented image');
assert.match(sheet,/setTimeout\(\(\)=>\{if\(!handle\.overlay\?\.isConnected\)return;results\.querySelectorAll\('\[data-lvjs-staged-actions\]'\)/,'card actions must enter after the sheet instead of competing with its first paint');
assert.match(sheet,/data-lvjs-details/);
assert.match(sheet,/function openProviderDetails\(place,input\)/);
for(const label of ['Küche','Preisniveau','Öffnungszeiten','Zahlung','Barrierefreiheit','Adresse','Telefon'])assert.ok(sheet.includes(`'${label}'`),`secondary detail sheet misses ${label}`);
assert.match(sheet,/safeHttpUrl=value=>\{const raw=clean\(value\);if\(!\/\^https\?:\\\/\\\//,'external detail actions must reject internal or malformed relative URLs');
assert.match(sheet,/bookingStatus:'pending_user_action'/,'starting Booking must create an explicitly unconfirmed Timeline state');
assert.match(journeyAdapter,/bookingStatus\|\|metadata\.planTrust/,'Booking truth must override an earlier planning-trust label');
for(const status of ['Buchung bestätigt','Buchung storniert','Buchung nicht bestätigt','Buchung noch unbestätigt'])assert.ok(journeyComposer.includes(status),`Timeline Booking projection misses ${status}`);
assert.match(journeyComposer,/\['luvia:booking-changed','luvia:booking-ready'\]/,'Timeline must refresh its Booking-owner projection after lifecycle changes');
assert.match(sheetCss,/\.lvjs-staged-actions/);
assert.match(sheetCss,/\.lvjs-provider-detail-sheet/);
assert.match(sheetCss,/overflow-y:auto/,'the mobile sheet must scroll as one uninterrupted surface');

console.log('M16.5 Block 1 contextual map + clean pin detail contract: PASS');
