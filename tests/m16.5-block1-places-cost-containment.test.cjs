'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=file=>fs.readFileSync(file,'utf8').replace(/\r\n?/g,'\n');

const backend=read('intelligence/backend-service.js');
const gateway=read('supabase/functions/luvia-gateway/_shared/places.ts');
const adapter=read('core/platform/places-contract-adapter.js');
const discovery=read('app/adapters/places-discovery-adapter.js');
const spatial=read('app/places/places-spatial-experience.js');
const service=read('intelligence/places-service.js');
const entities=read('intelligence/place-entity-service.js');
const stays=read('modules/accommodations/accommodation-module.js');
const suggestions=read('app/journey/journey-suggestion-sheet.js');
assert.match(discovery,/providers:options\.providers\|\|\['auto'\]/,'Places discovery must default to budget-managed discovery');
assert.match(spatial,/providers=\['auto'\]/,'viewport refresh must default to budget-managed discovery');
assert.match(service,/Array\.isArray\(options\.providers\)\?options\.providers:\['auto'\]/,'Places service must keep automatic fallback enabled when callers omit providers');
assert.match(entities,/options\.providers\.length\?options\.providers:\['auto'\]/,'Place entity reads must keep automatic fallback enabled');
assert.match(adapter,/Array\.isArray\(options\.providers\)\?options\.providers:\['auto'\]/,'viewport owner reads must keep automatic fallback enabled');
assert.equal((stays.match(/providers:\['auto'\]/g)||[]).length,2,'Stays initial and viewport reads must share the managed cascade');
assert.match(suggestions,/providers:\['auto'\]/,'Journey suggestions must share the managed cascade');

assert.ok(/locationRestriction[\s\S]{0,240}rectangle|rectangle[\s\S]{0,240}locationRestriction|locationBias[\s\S]{0,240}rectangle/.test(adapter),'viewport search must remain rectangle-qualified for the bounded owner contract');
assert.match(adapter,/geoapifyOnly|four-tile-legacy|single-rectangle-geoapify/,'viewport strategy must remain explicit for Geoapify vs Google/Foursquare');
assert.match(backend,/const RATE_LIMIT_COOLDOWN_MS=3\*1000/,'plain Places 429 must use a short cooldown instead of a 30-minute quota lock');
assert.match(backend,/isPlacesRateLimit/,'Places rate-limit handling must stay distinct from quota exhaustion');
assert.doesNotMatch(backend,/return status===429\|\|\/quota\|rate\.\\?limit/,'plain HTTP 429 must not be classified as a long quota failure');

assert.match(backend,/const NO_TRANSIENT_RETRY_ACTIONS=new Set\(\['places\.text-search','places\.nearby-search'\]\);/,'Places provider searches must opt out of generic transient replay');
assert.ok(backend.includes("if(NO_TRANSIENT_RETRY_ACTIONS.has(safeAction)&&TRANSIENT_STATUS.has(response.status))break;"),'502/503/504 must not automatically replay a Places provider search');
assert.match(backend,/for\(let attempt=0;attempt<3;attempt\+\+\)/,'non-Places backend actions must retain the established bounded retry envelope');

const viewportLine=gateway.split('\n').find(line=>line.startsWith('const VIEWPORT_SEARCH_FIELDS='))||'';
assert.ok(viewportLine,'a dedicated viewport FieldMask must exist');
for(const field of ['places.id','places.displayName','places.formattedAddress','places.location','places.primaryType','places.types','places.photos','places.businessStatus'])assert.ok(viewportLine.includes(field),'viewport FieldMask missing '+field);
for(const costly of ['places.rating','places.userRatingCount','places.priceLevel','places.currentOpeningHours','places.editorialSummary','places.goodForChildren','places.goodForGroups','places.servesVegetarianFood','places.delivery','places.dineIn','places.reservable'])assert.equal(viewportLine.includes(costly),false,'default viewport must not pay for '+costly);

const enterpriseLine=gateway.split('\n').find(line=>line.startsWith('const VIEWPORT_ENTERPRISE_FIELDS='))||'';
assert.ok(enterpriseLine.includes('places.rating')&&enterpriseLine.includes('places.userRatingCount')&&enterpriseLine.includes('places.priceLevel')&&enterpriseLine.includes('places.currentOpeningHours'),'explicit rating/open/price filtering must opt into the bounded Enterprise subset');
assert.equal(enterpriseLine.includes('places.servesVegetarianFood'),false,'Enterprise viewport subset must not silently include Atmosphere evidence');

const atmosphereLine=gateway.split('\n').find(line=>line.startsWith('const VIEWPORT_ATMOSPHERE_FIELDS='))||'';
assert.ok(atmosphereLine.includes('places.servesVegetarianFood'),'verified vegetarian filtering may opt into the required Atmosphere evidence');
assert.equal(atmosphereLine.includes('places.goodForChildren'),false,'vegetarian evidence must not pull unrelated Atmosphere fields');

assert.match(gateway,/if\(options\?\.richEvidence===true\)return SEARCH_FIELDS/,'an explicit richEvidence opt-in must remain available for owner-backed ranking');
assert.match(gateway,/object object/,'Geoapify must ignore a stringified destination object as a place name');
assert.match(gateway,/const limit=Math.min\(50,/,'Geoapify discovery must return a full page instead of 20 places');
assert.match(gateway,/function geoapifyLuviaTypes/,'Geoapify OSM categories must map onto Places type evidence');
assert.match(discovery,/const destinationLabel=value=>/,'discovery queries must use a destination name, not the destination object');
assert.match(discovery,/queryCascade\?\.\(goal,searchDestination/,'query cascade must receive the destination label');
assert.match(gateway,/provider:'geoapify',source:'automatic-geocoding'/,'resolved destinations must be Geoapify-owned');
assert.match(backend,/const QUOTA_CIRCUIT_MS=30\*60\*1000/,'exhausted Places quota must open a long client circuit instead of retrying every five seconds');
assert.match(backend,/if\(\/places_all_providers_failed\|provider_read_incomplete\|provider_read_unavailable\/\.test\(text\)\)return false/,'PLACES_ALL_PROVIDERS_FAILED must not open the 30-minute Places quota circuit');
assert.match(backend,/Do NOT treat PLACES_ALL_PROVIDERS_FAILED as a 30-minute quota lock/,'circuit policy must document why all-provider failure is not a quota lock');
assert.match(gateway,/providerOrder:'free_budget_cascade'/,'live Places order must be budget-managed');
assert.match(gateway,/:\['auto'\],providerErrors/,'gateway text-search default providers must be budget-managed');
assert.match(gateway,/food:'catering'/,'default food discovery must use the Geoapify parent catering bucket');
assert.match(gateway,/v2\.14\.1-empty-continuity/,'gateway cache must invalidate after empty-result continuity hardening');
assert.match(gateway,/version:'4\.34\.9-broad-food-cascade'/,'gateway health version must expose provider answer truth and broad Food fallback');
assert.match(gateway,/ttl>0&&!forceRefresh\?cached\(key\):null/,'forceRefresh must bypass a gateway cache hit');
assert.match(gateway,/if\(ttl>0&&!searchEmpty\)store\(key,result,ttl\)/,'successful empty provider pages must never be cached as geographic truth');
assert.match(gateway,/skippedEmpty:searchEmpty,forced:forceRefresh/,'cache diagnostics must disclose forced and skipped-empty reads');
assert.match(gateway,/One Luvia category → one Geoapify parent family/,'category mapping must keep Luvia categories exclusive');
assert.equal((gateway.match(/searchFields\(options\)/g)||[]).length,2,'text and nearby search must both route FieldMask selection through one policy');

const richLine=gateway.split('\n').find(line=>line.startsWith('const SEARCH_FIELDS='))||'';
assert.ok(richLine.includes('places.servesVegetarianFood'),'opt-in rich discovery must retain existing dietary evidence');
assert.ok(richLine.includes('places.goodForChildren'),'opt-in rich discovery must retain existing family evidence');

const detailLine=gateway.split('\n').find(line=>line.startsWith('const DETAIL_FIELDS='))||'';
assert.ok(detailLine.includes('servesVegetarianFood')&&detailLine.includes('goodForChildren')&&detailLine.includes('reviews'),'Place Details must retain full owner-backed evidence');

console.log('PASS m16.5 B1 Places cost containment');
