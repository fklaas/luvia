const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const context={console,URL,Date,setTimeout,clearTimeout};context.window=context;context.globalThis=context;vm.createContext(context);

for(const file of [
  'core/booking/booking-provider-capabilities.js',
  'core/booking/booking-engine-detection.js',
  'core/booking/booking-admission-core.js',
  'core/booking/booking-provider-registry.js',
  'core/booking/providers/admission-partner-adapter-factory.js',
  'core/booking/providers/tiqets-adapter.js',
  'core/booking/providers/viator-adapter.js'
])vm.runInContext(read(file),context,{filename:file});

const admission=context.LuviaBookingAdmissionCore;
const museum=admission.resolve({id:'museum-1',primaryType:'museum',name:'Museum',ticketRequired:true,ticketUrl:'https://museum.example/tickets'});
assert.equal(museum.kind,'culture');
assert.equal(museum.requirement,'ticket_required');
assert.equal(museum.certainty,'verified');
assert.equal(museum.action.label,'Tickets öffnen');
assert.equal(museum.route.kind,'official_link');

const supported=admission.resolve({id:'museum-2',primaryType:'museum',ticketUrl:'https://museum.example/shop'});
assert.equal(supported.requirement,'ticket_available','a ticket URL must never be upgraded to ticket-required');
assert.equal(supported.certainty,'provider_supported');

const restaurant=admission.resolve({id:'restaurant-1',primaryType:'restaurant',reservable:true});
assert.equal(restaurant.requirement,'reservation_supported','reservable means supported, never required');
assert.equal(restaurant.notice.label,'Reservierung möglich');

const restaurantBar=admission.resolve({id:'restaurant-bar-1',primaryType:'restaurant',categories:[{name:'bar'}]});
assert.equal(restaurantBar.kind,'dining','an explicit restaurant primary type must remain dining even with a secondary bar tag');

const hotelUnknown=admission.resolve({id:'hotel-1',primaryType:'hotel',name:'Grand Hotel'});
assert.equal(hotelUnknown.kind,'lodging');
assert.equal(hotelUnknown.requirement,'unknown','a lodging category must not invent availability or a booking requirement');
assert.equal(hotelUnknown.certainty,'unknown');
assert.equal(hotelUnknown.notice.label,'Preis und Verfügbarkeit ungeklärt');
assert.equal(hotelUnknown.notice.detail,'Preis und Verfügbarkeit vor dem Aufenthalt prüfen.');
assert.equal(hotelUnknown.action.label,'Zimmer und Preise prüfen');
assert.doesNotMatch(JSON.stringify(hotelUnknown),/Ticket|Eintritt/,'unknown lodging must never be presented as admission or ticketing');

const hotelRoute=admission.resolve({id:'hotel-2',primaryType:'lodging',bookingUrl:'https://hotel.example/book'});
assert.equal(hotelRoute.requirement,'reservation_supported','a verified hotel booking route proves only a supported route, never live availability');
assert.equal(hotelRoute.certainty,'provider_supported');
assert.equal(hotelRoute.notice.label,'Buchungsweg verfügbar');
assert.equal(hotelRoute.action.label,'Zimmer und Preise öffnen');
assert.equal(hotelRoute.notice.detail,'Ein Buchungsweg ist belegt; Preis und Verfügbarkeit sind noch nicht bestätigt.');

const nightclubUnknown=admission.resolve({id:'nightclub-1',primaryType:'night_club',name:'Tonfink'});
assert.equal(nightclubUnknown.kind,'nightlife');
assert.equal(nightclubUnknown.requirement,'unknown','nightlife alone proves neither tickets nor reservations');
assert.equal(nightclubUnknown.notice.label,'Einlass noch ungeklärt');
assert.equal(nightclubUnknown.action.label,'Einlass prüfen');

const barUnknown=admission.resolve({id:'bar-1',primaryType:'bar',name:'Beach Lounge'});
assert.equal(barUnknown.kind,'nightlife','bar must no longer collapse into dining without a stronger dining provider type');
assert.equal(barUnknown.requirement,'unknown');

const nightclubTicket=admission.resolve({id:'nightclub-2',primaryType:'nightclub',ticketRequired:true});
assert.equal(nightclubTicket.kind,'nightlife');
assert.equal(nightclubTicket.requirement,'ticket_required','an explicit provider ticket requirement must remain authoritative');
assert.equal(nightclubTicket.certainty,'verified');

const nightclubReservation=admission.resolve({id:'nightclub-3',primaryType:'nightclub',reservationRequired:true});
assert.equal(nightclubReservation.requirement,'reservation_required','an explicit provider reservation requirement must remain authoritative');
assert.equal(nightclubReservation.certainty,'verified');

const nightclubBookingRoute=admission.resolve({id:'nightclub-4',primaryType:'nightclub',providerBookingUrl:'https://club.example/guest-list'});
assert.equal(nightclubBookingRoute.requirement,'reservation_supported','a provider booking route must not be relabelled as a ticket route');
assert.equal(nightclubBookingRoute.certainty,'provider_supported');

const nightclubTicketRoute=admission.resolve({id:'nightclub-5',primaryType:'nightclub',providerTicketUrl:'https://tickets.example/club'});
assert.equal(nightclubTicketRoute.requirement,'ticket_available','a provider ticket route may prove ticket availability, but never ticket requirement');
assert.equal(nightclubTicketRoute.certainty,'provider_supported');

const culturalReservationRoute=admission.resolve({id:'culture-reservation-1',primaryType:'museum',reservationUrl:'https://museum.example/tour-reservation'});
assert.equal(culturalReservationRoute.requirement,'reservation_supported','an explicit reservation route must not be relabelled as ticket availability merely because the place is cultural');
assert.equal(culturalReservationRoute.certainty,'provider_supported');

const minigolf=admission.resolve({id:'activity-1',primaryType:'miniature_golf'});
assert.equal(minigolf.kind,'activity');
assert.equal(minigolf.requirement,'unknown');
assert.equal(minigolf.action.label,'Tickets prüfen');
assert.equal(minigolf.invariants.placeTypeNeverProvesRequirement,true);

const rawEmail=admission.resolve({id:'culture-1',primaryType:'museum',email:'private@example.test',bookingEmail:'booking@example.test'});
assert.equal(rawEmail.routes.length,0,'an unverified email must not become a route');
const verifiedButNotPublicEmail=admission.resolve({id:'culture-1b',primaryType:'museum',bookingEmail:'booking@example.test',bookingEmailVerified:true,bookingEmailSourceUrl:'https://museum.example/contact'});
assert.equal(verifiedButNotPublicEmail.routes.length,0,'verification without an explicit public flag must not become a route');
const verifiedEmail=admission.resolve({id:'culture-2',primaryType:'museum',bookingEmail:'tickets@example.test',bookingEmailVerified:true,bookingEmailPublic:true,bookingEmailSourceUrl:'https://museum.example/contact'});
assert.equal(verifiedEmail.route.kind,'email');

assert.equal(context.LuviaBookingEngineDetection.detectUrl('https://www.tiqets.com/en/example/').id,'tiqets');
assert.equal(context.LuviaBookingEngineDetection.detectUrl('https://www.eventim.de/event/example').vertical,'event');
assert.equal(context.LuviaBookingProviderCapabilities.get('tiqets').luviaAccessState,'partner_required');
assert.equal(context.LuviaBookingProviderCapabilities.get('viator').platform.createReservation,true);
assert.equal(context.LuviaTiqetsProviderAdapter.access().connected,false);
assert.equal(context.LuviaBookingProviderRegistry.get('tiqets').capability.luviaAccessState,'partner_required');

const adapterContext={console,URL,Date};adapterContext.window=adapterContext;adapterContext.globalThis=adapterContext;vm.createContext(adapterContext);
vm.runInContext(read('core/booking/booking-provider-capabilities.js'),adapterContext);
vm.runInContext(read('core/booking/booking-admission-core.js'),adapterContext);
vm.runInContext(read('core/platform/booking-contract-adapter.js'),adapterContext);
const projected=adapterContext.LuviaBookingContractV1.placeProjection({id:'museum-3',primaryType:'museum',ticketUrl:'https://museum.example/tickets',email:'private@example.test',bookingEmail:'tickets@example.test',bookingEmailVerified:false});
assert.equal(projected.reservationUrl,'https://museum.example/tickets');
assert.equal(projected.bookingEmail,'','raw or unverified email must not cross booking.v1');
assert.equal(adapterContext.LuviaBookingContractV1.reads.resolveAdmission(projected).kind,'culture');
(async()=>{
  await assert.rejects(()=>context.LuviaTiqetsProviderAdapter.catalog({destination:'Berlin'}),error=>error.code==='BOOKING_PROVIDER_PARTNER_REQUIRED');
  console.log('M16.5 Block 1 universal admission booking core: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
