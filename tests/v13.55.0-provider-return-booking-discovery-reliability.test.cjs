const fs=require('fs');
function read(p){return fs.readFileSync(p,'utf8')}
const checks=[];const ok=(name,cond)=>{checks.push([name,!!cond]);console.log((cond?'PASS':'FAIL'),name)};
const route=read('supabase/functions/booking-route-resolve/index.ts');
const contact=read('supabase/functions/booking-contact-resolve/index.ts');
const shell=read('core/places/place-experience-shell.js');
const discovery=read('core/preferences/discovery-contract-service.js');
const pipeline=read('core/discovery/ai-search-evidence-pipeline.js');
const migration=read('supabase/migrations/20260809044500_core_v4_55_0_provider_return_matrix_booking_discovery_reliability.sql');
ok('route resolver 2.3.0',route.includes("VERSION='2.3.0'"));
ok('thefork legacy host recognition',route.includes('lafourchette'));
ok('lazy booking resources',route.includes('data-lazy-src'));
ok('cloudflare e-mail decode route',route.includes('decodeCfEmail'));
ok('legal/contact crawl for e-mail',route.includes('confidentialit'));
ok('contact resolver cloudflare decode',contact.includes('decodeCfEmail'));
ok('contact pages parallel',contact.includes('Promise.all(candidateLinks'));
ok('universal quick-filter core',shell.includes("categoryInteractionMode:'module-root-delegation'")&&!shell.includes('stopImmediatePropagation()')); // Core 4.56 supersedes the faulty capture interceptor
ok('discovery cache',discovery.includes('SEARCH_CACHE_TTL_MS = 90000'));
ok('max four search plans',discovery.includes('plans.slice(0, 4)'));
ok('skip nested AI ranking',discovery.includes('skipAIRanking'));
ok('single aggregate AI provider search',pipeline.includes('aggregateContract')&&pipeline.includes('rankingPasses:1'));
ok('provider return readiness view',migration.includes('booking_provider_return_readiness'));
ok('resy webhook partner-safe',migration.includes("('resy','webhook'")&&migration.includes('partner_schema_required'));
ok('opentable official docs source',migration.includes('https://docs.opentable.com/'));
if(checks.some(x=>!x[1]))process.exit(1);
console.log('LUVIA_V13_55_0_PROVIDER_RETURN_BOOKING_DISCOVERY_RELIABILITY_OK');
