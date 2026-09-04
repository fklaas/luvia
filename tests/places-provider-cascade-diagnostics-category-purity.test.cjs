'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

const gateway=fs.readFileSync('supabase/functions/luvia-gateway/_shared/places.ts','utf8');
assert.match(gateway,/'chinese-scharbeutz'/,'exact Chinese filter health probe exists');
assert.match(gateway,/providers:Object\.freeze\(\['auto'\]\)/,'probe uses the live automatic cascade');
assert.match(gateway,/includedType:'chinese_restaurant'/,'probe carries exact cuisine evidence contract');
assert.match(gateway,/tomtom:\{configured:Boolean\(Deno\.env\.get\('TOMTOM_API_KEY'\)\)/,'TomTom configuration is visible without exposing the key');
assert.match(gateway,/here:\{configured:Boolean\(Deno\.env\.get\('HERE_API_KEY'\)\)/,'HERE configuration is visible without exposing the key');

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
