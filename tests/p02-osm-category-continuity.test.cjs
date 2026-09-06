'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

(async()=>{
  const root=path.resolve(__dirname,'..'),modulePath=path.join(root,'supabase/functions/luvia-gateway/_shared/osm-dietary.ts');
  const provider=await import(pathToFileURL(modulePath)),destination={countryCode:'DE'};
  const element=(id,tags)=>provider.normalizeOsmPlaceElement({type:'node',id,lat:54.02+id/1e6,lon:10.75,tags:{name:`Ort ${id}`,...tags}},destination);
  const categoryCases=[
    [{amenity:'restaurant'},'restaurant'],[{tourism:'hotel'},'hotel'],[{leisure:'playground'},'playground'],[{tourism:'theme_park'},'amusement_park'],[{leisure:'spa'},'spa'],[{natural:'beach'},'beach'],[{historic:'castle'},'historical_landmark'],[{tourism:'viewpoint'},'observation_deck'],[{tourism:'museum'},'museum'],[{leisure:'park'},'park'],[{shop:'clothes'},'clothing_store'],[{shop:'mall'},'shopping_mall'],[{amenity:'nightclub'},'night_club'],[{amenity:'pharmacy'},'pharmacy']
  ];
  categoryCases.forEach(([tags,type],index)=>assert.ok(element(index+1,tags).types.includes(type),`OSM category ${index+1} must map to ${type}`));

  const cuisines=[['italian','italian_restaurant'],['german','german_restaurant'],['mediterranean','mediterranean_restaurant'],['greek','greek_restaurant'],['french','french_restaurant'],['spanish','spanish_restaurant'],['indian','indian_restaurant'],['asian','asian_restaurant'],['chinese','chinese_restaurant'],['japanese','japanese_restaurant'],['thai','thai_restaurant'],['vietnamese','vietnamese_restaurant'],['korean','korean_restaurant'],['mexican','mexican_restaurant'],['middle_eastern','middle_eastern_restaurant'],['lebanese','lebanese_restaurant'],['turkish','turkish_restaurant']];
  cuisines.forEach(([cuisine,type],index)=>assert.ok(element(100+index,{amenity:'restaurant',cuisine}).types.includes(type),`${cuisine} must map to ${type}`));
  assert.equal(element(200,{amenity:'restaurant','diet:vegetarian':'yes'}).features.servesVegetarianFood,true);
  assert.equal(element(201,{amenity:'restaurant','diet:vegan':'yes'}).features.servesVeganFood,true);

  const pictured=element(300,{tourism:'attraction',image:'https://images.example/place.jpg',wikidata:'Q42',wikimedia_commons:'File:Exact place.jpg'});
  assert.equal(pictured.photos[0].entityReference,'openstreetmap:node/300','a photo may only reference the exact selected OSM entity');
  assert.equal(pictured.raw.wiki_and_media.wikidata,'Q42');
  assert.equal(pictured.raw.wiki_and_media.wikimedia_commons,'File:Exact place.jpg');
  assert.equal(element(301,{tourism:'attraction',image:'http://images.example/unsafe.jpg'}).photos.length,0,'only HTTPS place-linked images are eligible');

  const worker=fs.readFileSync(path.join(root,'cloudflare-worker.js'),'utf8'),places=fs.readFileSync(path.join(root,'supabase/functions/luvia-gateway/_shared/places.ts'),'utf8'),osmSource=fs.readFileSync(modulePath,'utf8'),proxyBudget=fs.readFileSync(path.join(root,'supabase/migrations/20260905235500_openstreetmap_cached_proxy_budget.sql'),'utf8'),adapter=fs.readFileSync(path.join(root,'core/platform/places-contract-adapter.js'),'utf8'),browser=fs.readFileSync(path.join(root,'intelligence/places-service.js'),'utf8'),detailOwner=fs.readFileSync(path.join(root,'core/places/place-detail-service.js'),'utf8');
  assert.match(worker,/CATEGORY_KEYS=new Set\(\['food','accommodation'.*'practical'\]\)/s,'the edge route must whitelist all 14 canonical categories');
  assert.match(worker,/url\.pathname==='\/api\/providers\/osm-places'/,'the category continuity route stays inside the authenticated provider namespace');
  assert.match(worker,/!CATEGORY_KEYS\.has\(category\)/,'arbitrary categories must fail closed');
  assert.match(worker,/radius,500,15000/,'requests must stay inside the bounded destination radius');
  assert.match(worker,/out center tags 250/,'the provider response must be hard capped');
  assert.doesNotMatch(worker,/body\?\.query/,'the client must never supply arbitrary Overpass QL');
  assert.match(osmSource,/provider:'openstreetmap-cache',operation:'lookup'/,'cached Edge lookups must not consume the direct Overpass allowance');
  assert.match(proxyBudget,/'openstreetmap-cached-proxy','openstreetmap-cache',array\['lookup'\],true,20000,0,300/,'the cache lookup lane must retain a high but bounded operational ceiling');
  assert.match(places,/mode='free_osm_category_continuity'/,'OSM must be an observable category continuity mode');
  assert.ok(places.indexOf("osmPlacesSearch(effectiveDestination")<places.indexOf('const breadthTarget='),'the cached OSM lane must answer before spending TomTom or HERE fallback budget');
  assert.match(places,/'shopping-scharbeutz'.*category:'shopping'/s,'public health must exercise Shopping through the real category contract');
  assert.match(places,/'nightlife-scharbeutz'.*category:'nightlife'/s,'public health must exercise Nightlife through the real category contract');
  assert.match(places,/'hotels-scharbeutz'.*category:'accommodation'.*strictTypeFiltering:true/s,'public health must exercise Stays through the same strict category contract');
  assert.match(places,/options\?\.openNow\)list=list\.filter\(p=>p\.openNow===true\)/,'unknown open state must fail closed');
  assert.match(places,/options\?\.accessibleOnly\)list=list\.filter\(p=>p\.accessibilityOptions\?\.wheelchairAccessibleEntrance===true\)/,'unknown accessibility must fail closed');
  assert.match(places,/rawId\.startsWith\('openstreetmap:'\).*providerPlaceSeed/s,'exact linked OSM media must require a matching selected-place seed');
  assert.match(places,/rawId\.startsWith\('openstreetmap:'\).*enrichLinkedMedia.*enrichExactFoursquareMedia/s,'an OSM image miss may use the same strict exact-identity Foursquare fallback as other providers');
  assert.match(adapter,/SELECTED_MEDIA_PROVIDER_PREFIXES=.*'openstreetmap:'/,'OSM selected cards must enter exact media hydration');
  assert.match(browser,/providerPlaceSeed:seed\|\|undefined/,'only an identity-matched browser seed may reach the gateway');
  assert.match(detailOwner,/providerPlaceSeed=normalizedId&&seedId===normalizedId\?seed:null/,'the shared detail owner must bridge the exact selected entity into the public transport option');
  console.log('P02 cached OSM continuity: 14 categories, 19 cuisines, fail-closed facts and exact-place media: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
