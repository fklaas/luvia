const assert=require('node:assert');const fs=require('node:fs');const vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8');
const version=read('intelligence/kernel/version.js');
assert(version.includes("core:'4.72.0'")&&version.includes("build:'13.72.0'"),'version not bumped');
const migration=read('supabase/migrations/20260810215300_core_v4_72_0_booking_intelligence_provider_orchestration_diagnostics.sql');
for(const token of ['booking_provider_orchestration_readiness_v1','luvia_booking_provider_intelligence_score','policy\',\'user_interest_first','commercialWeightCap\',8','when \'external_link\' then 350','when \'affiliate\' then 300'])assert(migration.includes(token),`migration missing ${token}`);
const sandbox={window:{},console,URL,performance:{now:()=>0}};vm.createContext(sandbox);vm.runInContext(read('core/booking/booking-orchestration.js'),sandbox);
const o=sandbox.window.LuviaBookingOrchestration;assert(o);assert.equal(o.version,'1.0.0');
let plan=o.plan([
 {channel:'api',provider:'direct',target:'https://example.test/direct',confidence:.8,signals:{liveAvailable:true,connectionState:'healthy',reliability:.95,directBooking:true,uxQuality:.9}},
 {channel:'affiliate',provider:'commercial',target:'https://example.test/ref',confidence:1,signals:{commercialReady:true,reliability:1,uxQuality:1}}
]);
assert.equal(plan.provider,'direct','commercial route must not dominate healthy direct route');
assert.equal(plan.policy.commercialWeightCapped,8);
plan=o.plan([
 {channel:'api',provider:'failed',target:'https://example.test/down',confidence:1,signals:{liveAvailable:false,connectionState:'failed',directBooking:true}},
 {channel:'email',provider:'email',target:'venue@example.com',confidence:.95,signals:{fallbackQuality:1,reliability:1}}
]);
assert.equal(plan.channel,'email','failed direct path should allow verified fallback');
assert.equal(o.diagnostics().directWinsCommercialOnly,true);
const consoleHtml=read('intelligence/console.html');const consoleJs=read('intelligence/developer-console.js');
assert(consoleHtml.includes('data-tab="booking"'),'Booking Core tab missing');
assert(consoleHtml.includes('booking-core-diagnostics.js?v=13.72.0'),'Booking diagnostics loader missing');
assert(consoleHtml.includes('<h2>Booking Core</h2>'),'Booking Core panel missing');
assert(consoleJs.includes('renderBookingCore'),'Booking Core renderer missing');
assert(consoleJs.includes('runBookingCoreTests'),'Booking Core test binding missing');
console.log('LUVIA_V13_72_0_BOOKING_INTELLIGENCE_PROVIDER_ORCHESTRATION_DIAGNOSTICS_OK');
