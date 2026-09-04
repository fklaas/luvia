'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

const gateway=fs.readFileSync('supabase/functions/luvia-gateway/_shared/places.ts','utf8');
assert.match(gateway,/'chinese-scharbeutz'/,'exact Chinese filter health probe exists');
assert.match(gateway,/providers:Object\.freeze\(\['auto'\]\)/,'probe uses the live automatic cascade');
assert.match(gateway,/includedType:'chinese_restaurant'/,'probe carries exact cuisine evidence contract');
assert.match(gateway,/maxDistanceMeters:5000/,'probe uses the same specialized local radius as the consumer');
assert.match(gateway,/tomtom:\{configured:Boolean\(Deno\.env\.get\('TOMTOM_API_KEY'\)\)/,'TomTom configuration is visible without exposing the key');
assert.match(gateway,/here:\{configured:Boolean\(Deno\.env\.get\('HERE_API_KEY'\)\)/,'HERE configuration is visible without exposing the key');
assert.match(gateway,/answered:\[\.\.\.new Set\(answered\)\]/,'gateway distinguishes a successful empty answer from provider failure');

const placesService=fs.readFileSync('intelligence/places-service.js','utf8');
const discovery=fs.readFileSync('app/adapters/places-discovery-adapter.js','utf8');
const spatial=fs.readFileSync('app/places/places-spatial-experience.js','utf8');
assert.match(placesService,/answered\.length\?'empty':errors\.length\?'unavailable'/,'public Places service preserves honest empty answers');
assert.match(discovery,/providers\.status==='unavailable'/,'discovery fails only when no provider answered');
assert.match(discovery,/answered\.size\?'empty':uniqueErrors\.length\?'unavailable'/,'aggregated discovery truth preserves a successful empty provider answer');
assert.match(spatial,/specializedLocalRadius=.*cuisines.*5000/,'an explicit cuisine filter searches the bounded 5 km Scharbeutz area');

const source=fs.readFileSync('core/places/places-domain-contract-core.js','utf8');
const context={window:{}};
vm.createContext(context);
vm.runInContext(source,context);
const core=context.LuviaPlacesDomainContractCoreV1;
const nature=core.category('nature');
for(const type of ['lodging','accommodation','hotel','apartment','vacation_rental','campground']){
  assert(nature.excludedTypes.includes(type),`nature must exclude ${type}`);
}
console.log('Places provider cascade diagnostics and Nature category purity: PASS');
