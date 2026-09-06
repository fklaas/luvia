'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

const gateway=fs.readFileSync('supabase/functions/luvia-gateway/_shared/places.ts','utf8');
const additional=fs.readFileSync('supabase/functions/luvia-gateway/_shared/additional-places.ts','utf8');
const osm=fs.readFileSync('supabase/functions/luvia-gateway/_shared/osm-dietary.ts','utf8');
assert.match(gateway,/'chinese-scharbeutz'/,'exact Chinese filter health probe exists');
assert.match(gateway,/providers:Object\.freeze\(\['auto'\]\)/,'probe uses the live automatic cascade');
assert.match(gateway,/options:\{providers:\['auto'\],maxResultCount:20/,'health probes default to the same automatic provider cascade as the real consumer');
assert.match(gateway,/'minigolf-scharbeutz'[\s\S]{0,900}category:'activities'[\s\S]{0,300}includedType:'miniature_golf_course'/,'Minigolf diagnostics use the real activities contract instead of a Geoapify-only text query');
assert.match(gateway,/'minigolf-chat-scharbeutz'[\s\S]{0,900}category:'activities'[\s\S]{0,300}includedType:'miniature_golf_course'/,'AI Chat Minigolf diagnostics use the identical Places contract');
assert.match(gateway,/'beach-supplies-scharbeutz'[\s\S]{0,1000}category:'shopping'[\s\S]{0,350}includedTypes:Object\.freeze\(\['sporting_goods_store','toy_store','department_store'\]\)[\s\S]{0,120}strictTypeFiltering:true/,'beach supplies diagnostics use a strict automatic specialty-retail cascade');
assert.match(osm,/miniature_golf:'miniature_golf_course'/,'OSM miniature golf keeps the exact canonical place type');
assert.match(osm,/surf:'sporting_goods_store'/,'OSM surf shops map to the beach-supplies specialty type');
assert.match(gateway,/includedType:'chinese_restaurant'/,'probe carries exact cuisine evidence contract');
assert.match(gateway,/maxDistanceMeters:5000/,'probe uses the same specialized local radius as the consumer');
assert.match(gateway,/tomtom:\{configured:Boolean\(Deno\.env\.get\('TOMTOM_API_KEY'\)\)/,'TomTom configuration is visible without exposing the key');
assert.match(gateway,/here:\{configured:Boolean\(Deno\.env\.get\('HERE_API_KEY'\)\)/,'HERE configuration is visible without exposing the key');
assert.match(gateway,/answered:\[\.\.\.new Set\(answered\)\]/,'gateway distinguishes a successful empty answer from provider failure');
assert.match(gateway,/if\(excluded\.length\)list=list\.filter/,'gateway removes explicitly excluded provider types before returning or caching results');
assert.match(gateway,/'nature-scharbeutz'/,'bounded Nature purity health probe exists');
assert.match(gateway,/'food-scharbeutz'/,'bounded broad Food cascade health probe exists');
const cuisineHealthBlock=gateway.slice(gateway.indexOf('const CUISINE_HEALTH_TYPES'),gateway.indexOf('const CUISINE_HEALTH_PROBES'));
const cuisineTypes=[...cuisineHealthBlock.matchAll(/'([a-z_]+_restaurant)'/g)].map(match=>match[1]);
assert.equal(new Set(cuisineTypes).size,19,'all 19 visible cuisine filters have a bounded health probe');
for(const type of ['italian_restaurant','german_restaurant','mediterranean_restaurant','greek_restaurant','french_restaurant','spanish_restaurant','indian_restaurant','asian_restaurant','chinese_restaurant','japanese_restaurant','thai_restaurant','vietnamese_restaurant','korean_restaurant','mexican_restaurant','middle_eastern_restaurant','lebanese_restaurant','turkish_restaurant','vegetarian_restaurant','vegan_restaurant'])assert(cuisineTypes.includes(type),`health matrix must include ${type}`);
assert.match(gateway,/maxResultCount:50,maxDistanceMeters:5000/,'every generated cuisine probe matches the real 50-result 5 km consumer window');
assert.doesNotMatch(gateway.slice(gateway.indexOf('const CUISINE_HEALTH_PROBES'),gateway.indexOf('const HEALTH_PROBES')),/forceRefresh:true/,'repeated public cuisine diagnostics reuse their five-minute server cache');
assert.match(gateway,/searchDegraded[\s\S]*30_000/,'degraded positive gateway cohorts are cached only briefly');
assert.match(additional,/options\.strictTypeFiltering===true\?requested\.filter/,'only an explicitly selected cuisine activates provider cuisine mode');
assert.match(additional,/holiday park\\b\/.test\(text\)\)return\['lodging','vacation_rental'\]/,'HERE Holiday Park is classified as accommodation instead of nature');
assert.match(additional,/rv parks\?\\b\/.test\(text\)\)return\['lodging','campground'\]/,'HERE RV Parks are classified as accommodation instead of nature');
assert.match(additional,/park and ride\\b\/.test\(text\)\)return\['parking'\]/,'HERE Park and Ride cannot enter nature through the word Park');
assert.match(additional,/camping hiking shop\\b\/.test\(text\)\)return\['store'\]/,'HERE Camping-Hiking Shop cannot enter nature through broad words');

const placesService=fs.readFileSync('intelligence/places-service.js','utf8');
const discovery=fs.readFileSync('app/adapters/places-discovery-adapter.js','utf8');
const spatial=fs.readFileSync('app/places/places-spatial-experience.js','utf8');
assert.match(placesService,/answered\.length\?'empty':errors\.length\?'unavailable'/,'public Places service preserves honest empty answers');
assert.match(discovery,/providers\.status==='unavailable'/,'discovery fails only when no provider answered');
assert.match(discovery,/answered\.size\?'empty':uniqueErrors\.length\?'unavailable'/,'aggregated discovery truth preserves a successful empty provider answer');
assert.match(spatial,/specializedLocalRadius=.*cuisines.*5000/,'an explicit cuisine filter searches the bounded 5 km Scharbeutz area');
assert.match(spatial,/currentRadius<5000\?5000:currentRadius<10000\?10000/,'only an explicit empty-state action expands the fixed destination search to 10 km');

const source=fs.readFileSync('core/places/places-domain-contract-core.js','utf8');
const context={window:{}};
vm.createContext(context);
vm.runInContext(source,context);
const core=context.LuviaPlacesDomainContractCoreV1;
const nature=core.category('nature');
assert.equal(nature.includedTypes.includes('spa'),false,'Nature does not duplicate the dedicated Wellness & Spa category');
assert.equal(nature.excludedTypes.includes('spa'),true,'Nature actively rejects spa-only results');
for(const type of ['lodging','accommodation','hotel','apartment','vacation_rental','campground']){
  assert(nature.excludedTypes.includes(type),`nature must exclude ${type}`);
}
console.log('Places provider cascade diagnostics and Nature category purity: PASS');
