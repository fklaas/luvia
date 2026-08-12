const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('core/booking/booking-reservation-mutation.js','utf8');
const expected={ok:false,expected:true,error:'PROVIDER_RESERVATION_REFERENCE_REQUIRED'};
const window={LuviaSupabaseService:{start:async()=>({functions:{invoke:async()=>({data:null,error:{context:{json:async()=>expected}}})}})}};
vm.runInNewContext(code,{window,console,Error,Number,String,Promise,Object,Array,RegExp});
(async()=>{const out=await window.LuviaBookingReservationMutation.cancel({bookingId:'e02f3951-8ca7-4ed5-b7ab-e94a5aa04712'});assert.equal(out.expected,true);assert.equal(out.error,'PROVIDER_RESERVATION_REFERENCE_REQUIRED');console.log('LUVIA_V13_81_0_MUTATION_CLIENT_EXPECTED_ERROR_BRIDGE_OK')})().catch(e=>{console.error(e);process.exit(1)});
