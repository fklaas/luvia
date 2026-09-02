const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const places=read('app/places/places-spatial-experience.js');
const journey=read('app/journey/journey-suggestion-sheet.js');
const runtime=read('core/ai/ai-action-runtime.js');
const actionContract=read('core/intelligence/intelligence-action-contract-core.js');
const dashboard=read('core/ai/ai-dashboard-service.js');
const adapter=read('core/platform/booking-contract-adapter.js');
const index=read('index.html');

assert.match(places,/reads\?\.resolveAdmission|LuviaBookingAdmissionCore/);
assert.match(places,/lv-places-spatial__admission/);
assert.doesNotMatch(places,/function isBookablePlace/);
assert.match(journey,/const admissionFor=/);
assert.match(journey,/data-lvjs-staged-actions/);
assert.match(journey,/data-lvjs-booking/);
assert.doesNotMatch(journey,/class="lvjs-admission"/,'admission noise must not compete with the compact first paint');
assert.doesNotMatch(journey,/const isBookable=place=>\['food','cafe'\]/);
assert.match(runtime,/booking\.place\.open/);
assert.match(runtime,/bookingAdmission/);
assert.match(actionContract,/normalizeAdmission/);
assert.match(dashboard,/Ticket oder Reservierung/);
assert.match(dashboard,/placeAdmission\(item\)/);
assert.match(adapter,/resolveAdmission/);
assert.match(adapter,/bookingEmailVerified&&bookingEmailPublic/);
assert.match(index,/core\/booking\/booking-admission-core\.js/);
assert.match(index,/providers\/tiqets-adapter\.js/);
assert.match(index,/providers\/viator-adapter\.js/);

console.log('M16.5 Block 1 admission consumers and public owner adapter: PASS');
