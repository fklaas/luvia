'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=file=>fs.readFileSync(file,'utf8').replace(/\r\n?/g,'\n');

const backend=read('intelligence/backend-service.js');
const gateway=read('supabase/functions/luvia-gateway/_shared/places.ts');
const adapter=read('core/platform/places-contract-adapter.js');

assert.ok(/locationRestriction[\s\S]{0,240}rectangle|rectangle[\s\S]{0,240}locationRestriction|locationBias[\s\S]{0,240}rectangle/.test(adapter),'viewport search must remain rectangle-qualified for the bounded four-tile owner contract');

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

assert.ok(gateway.includes('options?.locationRestriction?.rectangle||options?.locationBias?.rectangle'),'viewport FieldMask selection must be bound to rectangle map searches');
assert.equal((gateway.match(/searchFields\(options\)/g)||[]).length,2,'text and nearby search must both route FieldMask selection through one policy');

const richLine=gateway.split('\n').find(line=>line.startsWith('const SEARCH_FIELDS='))||'';
assert.ok(richLine.includes('places.servesVegetarianFood'),'normal rich discovery must retain existing dietary evidence');
assert.ok(richLine.includes('places.goodForChildren'),'normal rich discovery must retain existing family evidence');

const detailLine=gateway.split('\n').find(line=>line.startsWith('const DETAIL_FIELDS='))||'';
assert.ok(detailLine.includes('servesVegetarianFood')&&detailLine.includes('goodForChildren')&&detailLine.includes('reviews'),'Place Details must retain full owner-backed evidence');

console.log('PASS m16.5 B1 Places cost containment');
