'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('core/places/place-detail-service.js','utf8');
const css=fs.readFileSync('modules/restaurants-v2/restaurant-module.css','utf8');
const calls=[];
const context=vm.createContext({console,Map,Promise,Object,String,Number,Math,Date,setTimeout,clearTimeout});
context.window=context;context.globalThis=context;context.addEventListener=()=>{};
context.LuviaPlaces={
  async details(id,options){calls.push({id,options});return{data:{place:{id,name:'Exact Place',photos:[{uri:'https://images.example/exact.jpg',attribution:'Exact author · CC BY',attributionUrl:'https://source.example/exact',sourceUrl:'https://source.example/exact',provider:'wikimedia',verified:true}]}}}},
  async photo(){throw new Error('direct media must not use the Google photo resolver')}
};
vm.runInContext(source,context,{filename:'place-detail-service.js'});
(async()=>{
  await context.LuviaPlaceDetails.fetchDetails('here:exact',{enrichMedia:false});
  const prepared=await context.LuviaPlaceDetails.prepare('here:exact',{seedPlace:{id:'here:exact',name:'Exact Place'},photoLimit:3});
  assert.equal(calls.length,2,'a lean cache entry must never shadow an exact-media detail request');
  assert.equal(calls[0].options.enrichMedia,false);
  assert.equal(calls[1].options.enrichMedia,true,'every shared detail consumer must request exact selected-place media');
  assert.equal(calls[1].options.providerPlaceSeed.id,'here:exact','the exact selected search entity must cross the shared detail boundary for linked media resolution');
  assert.deepEqual({...prepared.photos[0]},{uri:'https://images.example/exact.jpg',attribution:'Exact author · CC BY',attributionUrl:'https://source.example/exact',sourceUrl:'https://source.example/exact',provider:'wikimedia',verified:true},'attribution and source metadata must survive the detail service');
  assert.match(source,/figcaption/,'the shared visible gallery must render photo attribution');
  assert.match(source,/kein sicher zugeordnetes Bild verfügbar/,'an image miss must remain explicit instead of using a misleading stock photo');
  assert.match(css,/\.rv2-gallery-photo figcaption/,'visible attribution styling must ship with the gallery');
  await context.LuviaPlaceDetails.fetchDetails('openstreetmap:node/1',{enrichMedia:true});
  await context.LuviaPlaceDetails.prepare('openstreetmap:node/1',{seedPlace:{id:'openstreetmap:node/1',name:'Linked place',raw:{wiki_and_media:{wikidata:'Q42'}}}});
  assert.equal(calls.length,4,'an earlier exact-media request without a seed must not shadow a later identity-linked seed request');
  assert.equal(calls[3].options.providerPlaceSeed.raw.wiki_and_media.wikidata,'Q42');
  const gateway=fs.readFileSync('supabase/functions/luvia-gateway/_shared/places.ts','utf8');
  assert.match(gateway,/geoapify-details-media-v4:[^`]+seedMediaKey/,'Geoapify detail caching must distinguish a later exact media-bearing seed');
  assert.match(gateway,/const exactPlace=exactSeed\?\{\.\.\.exactSeed,\.\.\.place/,'Geoapify details must preserve exact media facts carried by the selected search entity');
  assert.match(gateway,/options\.enrichMedia===true&&!linked\.photos\?\.length\?await enrichExactFoursquareMedia/,'Foursquare media is requested only when exact linked media is still absent');
  console.log('Shared exact-place media and visible attribution: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
