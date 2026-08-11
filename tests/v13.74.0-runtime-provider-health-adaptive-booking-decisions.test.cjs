const assert=require('node:assert');const fs=require('node:fs');const vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8');
const version=read('intelligence/kernel/version.js');assert(version.includes("core:'4.74.0'")&&version.includes("build:'13.74.0'"));
const ojs=read('core/booking/booking-orchestration.js');const sandbox={window:{},console,URL,performance:{now:()=>0}};vm.createContext(sandbox);vm.runInContext(ojs,sandbox);const o=sandbox.window.LuviaBookingOrchestration;
assert.equal(o.version,'1.2.0');assert.deepEqual(Array.from(o.ROUTE_ORDER),['api','external_link','affiliate','email','manual']);
assert.equal(o.RUNTIME_HEALTH_ADJUSTMENT.healthy,20);assert.equal(o.RUNTIME_HEALTH_ADJUSTMENT.degraded,-300);assert.equal(o.RUNTIME_HEALTH_ADJUSTMENT.unavailable,-500);
let plan=o.plan([
 {channel:'api',provider:'healthy',target:'https://example.test/api',confidence:1,signals:{connectionState:'connected',probeState:'healthy',probeAgeSeconds:30,availabilityRuntimeState:'ready',liveAvailable:true,reliability:.95,directBooking:true}},
 {channel:'external_link',provider:'official',target:'https://example.test/book',confidence:.9,signals:{reliability:.8,uxQuality:.8}}
]);
assert.equal(plan.channel,'api','healthy direct API should win');
plan=o.plan([
 {channel:'api',provider:'degraded',target:'https://example.test/api',confidence:1,signals:{connectionState:'degraded',probeState:'degraded',consecutiveProbeFailures:2,reliability:.95,directBooking:true}},
 {channel:'external_link',provider:'official',target:'https://example.test/book',confidence:.9,signals:{reliability:.8,uxQuality:.8}}
]);
assert.equal(plan.channel,'external_link','degraded API should adaptively fall back to verified external link');
let evidence=o.explainDecision(plan);assert.equal(evidence.decisionMode,'runtime-adaptive');assert.equal(evidence.selected.runtimeHealth.state,'ready');assert.equal(evidence.alternatives[0].runtimeHealth.state,'degraded');
plan=o.plan([
 {channel:'api',provider:'stale',target:'https://example.test/api',confidence:1,signals:{connectionState:'connected',probeState:'healthy',probeAgeSeconds:1800,availabilityRuntimeState:'ready',reliability:.95,directBooking:true}},
 {channel:'external_link',provider:'official',target:'https://example.test/book',confidence:.9,signals:{reliability:.8,uxQuality:.8}}
]);
assert.equal(plan.channel,'external_link','stale probe must degrade direct route');
plan=o.plan([
 {channel:'api',provider:'down',target:'https://example.test/api',confidence:1,signals:{connectionState:'failed',probeState:'failed',reliability:1,directBooking:true,commercialReady:true}},
 {channel:'email',provider:'email',target:'venue@example.com',confidence:.9,signals:{fallbackQuality:.9,reliability:.9}}
]);
assert.equal(plan.channel,'email','unavailable API must fail closed to fallback');
const diag=o.diagnostics();assert.equal(diag.degradedDirectFallsBack,true);assert.equal(diag.commercialWeightCapped,8);assert.equal(diag.decisionMode,'runtime-adaptive');
const diagnostics=read('core/diagnostics/booking-core-diagnostics.js');for(const x of ["VERSION='4.74.0'","BUILD='13.74.0'","providerRuntimeHealth","degraded-direct-falls-back","stale-probe-degrades-direct","healthy-direct-recovers-priority"])assert(diagnostics.includes(x));
const integration=read('core/booking/booking-integration.js');assert(integration.includes("const VERSION='1.13.0'"));assert(integration.includes('providerRuntimeHealth'));
const migration=read('supabase/migrations/20260810224000_core_v4_74_0_runtime_provider_health_adaptive_booking_decisions.sql');for(const x of ['booking_provider_runtime_health_v1','luvia_booking_runtime_health_adjustment','luvia_booking_provider_route_eligible','ADAPTIVE_RUNTIME_RANKED_ROUTE','decisionMode','runtime_adaptive','booking_orchestration_v4_74'])assert(migration.includes(x));
console.log('LUVIA_V13_74_0_RUNTIME_PROVIDER_HEALTH_ADAPTIVE_BOOKING_DECISIONS_OK');
