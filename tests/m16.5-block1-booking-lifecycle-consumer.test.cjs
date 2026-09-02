const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=file=>fs.readFileSync(file,'utf8');

const integration=read('core/booking/booking-integration.js');
const adapter=read('core/platform/booking-contract-adapter.js');
const ui=read('core/booking/booking-ui.js');
const sheet=read('app/booking/booking-management-sheet.js');
const factory=read('core/booking/providers/admission-partner-adapter-factory.js');
const tiqets=read('core/booking/providers/tiqets-adapter.js');
const viator=read('core/booking/providers/viator-adapter.js');
const index=read('index.html');
const sw=read('sw.js');

assert.match(integration,/async function trackExternalHandoffForPlace/);
assert.match(integration,/channel:route\.channel==='affiliate'\?'affiliate':'external_link'/);
assert.match(integration,/recordHandoff\(booking\.id/);
assert.match(integration,/deduplicated:true/);
assert.match(adapter,/async function lifecycleCapabilities/);
assert.match(adapter,/commands=Object\.freeze\(\{createForPlace,submitReservation,trackExternalHandoff/);
assert.ok(ui.indexOf('openBooking(target,{reserved})')<ui.indexOf('trackExternalHandoffForPlace'),'the deliberate provider click must open synchronously before asynchronous attribution so mobile popup protection cannot consume the handoff');
assert.match(adapter,/async function preparePlaceBooking/,'the public Booking contract must expose a non-mutating route warm-up');
assert.match(ui,/emailVerified:true/);
assert.match(sheet,/contract\.reads\.lifecycleCapabilities/);
assert.match(sheet,/if\(actions\.message\?\.available\)/);
assert.match(sheet,/if\(actions\.manageExternal\?\.available\)/);
assert.doesNotMatch(sheet,/<nav><button type="button" class="is-primary" data-lvbm-mode="modify">Buchung anpassen/,'management actions must not be unconditional');
assert.match(factory,/confirmReservation=input=>invoke\('confirm_reservation'/);
assert.match(factory,/getTickets=input=>invoke\('get_tickets'/);
assert.match(tiqets,/confirm_reservation/);
assert.match(tiqets,/get_tickets/);
assert.doesNotMatch(viator,/confirm_reservation|get_tickets|modify_reservation/,'Viator operations must not borrow unverified supplier-side capabilities');
assert.match(index,/booking-lifecycle-policy-core\.js/);
assert.match(sw,/booking-lifecycle-policy-core\.js/);

console.log('M16.5 Block 1 booking lifecycle consumer: PASS');
