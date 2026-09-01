const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const context={console,URL};context.window=context;context.globalThis=context;vm.createContext(context);
vm.runInContext(fs.readFileSync('core/booking/booking-lifecycle-policy-core.js','utf8'),context,{filename:'booking-lifecycle-policy-core.js'});
const policy=context.LuviaBookingLifecyclePolicyCore;

const api=policy.assess({booking:{status:'confirmed',provider:'tiqets'},capability:{id:'tiqets',luviaAccessState:'connected',platform:{modifyReservation:true,cancelReservation:true,statusPolling:true}}});
assert.equal(api.actions.modify.transport,'provider_api');
assert.equal(api.actions.cancel.transport,'provider_api');
assert.equal(api.actions.refreshStatus.available,true);

const thread=policy.assess({booking:{status:'requested',provider:'official'},capability:{id:'official',luviaAccessState:'discovery',platform:{}},thread:{id:'thread-1'}});
assert.equal(thread.actions.message.available,true);
assert.equal(thread.actions.modify.transport,'email_thread');
assert.equal(thread.actions.cancel.transport,'email_thread');

const external=policy.assess({booking:{status:'forwarded',provider:'eventim',request:{reservationUrl:'https://tickets.example/order'}},capability:{id:'eventim',luviaAccessState:'discovery',platform:{}}});
assert.equal(external.actions.manageExternal.available,true);
assert.equal(external.actions.message.available,false,'a provider link must never invent a provider chat');
assert.equal(external.actions.modify.available,false,'an external link without a verified contact must not invent modification support');
assert.equal(external.external.unconfirmed,true);
assert.match(external.summary,/noch nicht bestätigt/);

const resolvable=policy.assess({booking:{status:'confirmed'},canResolveVerifiedContact:true});
assert.equal(resolvable.actions.modify.transport,'verified_email_resolution');
assert.equal(resolvable.actions.cancel.transport,'verified_email_resolution');
assert.equal(resolvable.actions.message.available,false,'contact discovery may bootstrap a mutation request, never a free-form thread');

const terminal=policy.assess({booking:{status:'cancelled',request:{reservationUrl:'https://tickets.example/order'}},thread:{id:'thread-2'},capability:{luviaAccessState:'connected',platform:{modifyReservation:true,cancelReservation:true}}});
for(const action of Object.values(terminal.actions))assert.equal(action.available,false,'terminal bookings must expose no mutations');

console.log('M16.5 Block 1 booking lifecycle policy: PASS');
