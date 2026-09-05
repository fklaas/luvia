'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

(async()=>{
  const root=path.resolve(__dirname,'..');
  const modulePath=path.join(root,'supabase/functions/luvia-gateway/_shared/osm-dietary.ts');
  const provider=await import(pathToFileURL(modulePath));
  const destination={countryCode:'DE'};
  const ordinary=provider.normalizeOsmDietaryElement({type:'node',id:42,lat:54.02,lon:10.75,tags:{name:'Grüne Kombüse',amenity:'restaurant',cuisine:'italian','diet:vegetarian':'yes','diet:vegan':'no','addr:street':'Strandallee','addr:housenumber':'1'}},destination);
  assert.equal(ordinary.providerPlaceId,'openstreetmap:node/42');
  assert.equal(ordinary.features.servesVegetarianFood,true);
  assert.equal(ordinary.features.servesVeganFood,false);
  assert.ok(ordinary.types.includes('italian_restaurant'));
  assert.equal(ordinary.formattedAddress,'Strandallee 1');
  assert.equal(ordinary.attribution,'© OpenStreetMap contributors');
  const dedicated=provider.normalizeOsmDietaryElement({type:'way',id:7,center:{lat:54.021,lon:10.751},tags:{name:'Pflanzenküche',amenity:'cafe','diet:vegetarian':'only','diet:vegan':'yes'}},destination);
  assert.ok(dedicated.types.includes('vegetarian_restaurant'));
  assert.equal(dedicated.features.servesVeganFood,true);
  assert.equal(provider.normalizeOsmDietaryElement({type:'node',id:8,lat:54.02,lon:10.75,tags:{name:'Unbelegt',amenity:'restaurant'}},destination),null,'missing explicit diet tags must never create a fit claim');

  const places=fs.readFileSync(path.join(root,'supabase/functions/luvia-gateway/_shared/places.ts'),'utf8');
  const migration=fs.readFileSync(path.join(root,'supabase/migrations/20260905210000_openstreetmap_dietary_evidence_budget.sql'),'utf8');
  const browser=fs.readFileSync(path.join(root,'intelligence/places-service.js'),'utf8');
  assert.match(places,/!processed\.length&&wantsOsmDietary/);
  assert.match(places,/mode='free_osm_dietary_evidence'/);
  assert.match(places,/rawId\.startsWith\('openstreetmap:'\)/,'OSM evidence ids must never fall through to Google details');
  assert.match(migration,/'openstreetmap-dietary-evidence','openstreetmap',array\['search'\],true,500,0,6/);
  assert.match(browser,/PROVIDER_NAMES=new Set\(\[[^\]]*'openstreetmap'/);
  assert.match(browser,/\.slice\(0,6\)/,'the five-provider profile cascade must not be truncated');
  console.log('P02 OSM explicit dietary evidence provider, attribution, budget and Google isolation: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
