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
