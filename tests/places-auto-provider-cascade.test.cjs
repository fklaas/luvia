'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

globalThis.Deno={env:{get:name=>({
  SUPABASE_URL:'https://fixture.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY:'fixture-service-role',
  GEOAPIFY_API_KEY:'fixture-geoapify',
  TOMTOM_API_KEY:'fixture-tomtom',
  HERE_API_KEY:'fixture-here'
}[name]||'')}};

const ok=data=>new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json'}});
const destination=(latitude=54.0214)=>({
  name:'Scharbeutz',countryCode:'DE',
  location:{latitude,longitude:10.7536},
  canonicalCity:{name:'Scharbeutz',center:{lat:latitude,lng:10.7536}},
  searchRadiusMeters:15000
});
const options=latitude=>({
  providers:['auto'],includedType:'chinese_restaurant',includedTypes:['chinese_restaurant'],
  strictPlaceType:'chinese_restaurant',strictTypeFiltering:true,strictDestination:true,
  maxResultCount:20,maxDistanceMeters:15000,languageCode:'de',regionCode:'DE',forceRefresh:true,
  locationRestriction:{rectangle:{low:{latitude:latitude-.08,longitude:10.65},high:{latitude:latitude+.08,longitude:10.85}}}
});
const tomtomRow={id:'tt-chinese',poi:{name:'China Garten',classifications:[{code:'RESTAURANT',names:[{name:'Chinese Restaurant'}]}]},address:{freeformAddress:'Strandallee 1, Scharbeutz'},position:{lat:54.0215,lon:10.7537}};
const hereRow={id:'here:chinese',resultType:'place',title:'China Restaurant Ming',position:{lat:54.1215,lng:10.7537},address:{label:'Seestraße 2, Scharbeutz'},categories:[{name:'Restaurant'}],foodTypes:[{name:'Chinese',primary:true}]};

(async()=>{
  const calls=[];
  let scenario='tomtom';
  globalThis.fetch=async(url,init={})=>{
    const href=String(url);calls.push({href,body:String(init.body||'')});
    if(href.includes('/rest/v1/rpc/luvia_reserve_provider_budget')){
      const body=JSON.parse(String(init.body||'{}'));
      const allowed=body.p_provider===(scenario==='tomtom'?'tomtom':scenario==='here'?'here':'none');
      return ok({allowed,reason:allowed?null:'budget_exhausted'});
    }
    if(href.includes('/rest/v1/rpc/luvia_provider_outcome'))return ok(null);
    if(href.includes('api.tomtom.com'))return ok({results:[tomtomRow]});
    if(href.includes('hereapi.com'))return ok({items:[hereRow]});
    throw new Error('Unexpected network request: '+href);
  };

  const file=path.resolve(__dirname,'../supabase/functions/luvia-gateway/_shared/places.ts');
  const {placesAction}=await import(pathToFileURL(file));

  const first=await placesAction('places.text-search',{query:'Chinesisches Restaurant',destination:destination(),options:options(54.0214)});
  assert.equal(first.data.places.length,1,'TomTom must rescue an exhausted Geoapify cuisine read');
  assert.equal(first.data.places[0].provider,'tomtom');
  assert(first.data.places[0].types.includes('chinese_restaurant'));
  assert.deepEqual(first.data.providers.attempted,['geoapify','tomtom']);
  assert.equal(first.data.providers.mode,'free_budget_cascade');
  assert.equal(first.data.providers.fallbackUsed,true);
  assert(first.data.providers.errors.some(error=>error.provider==='geoapify'));

  scenario='here';
  const secondLatitude=54.1214;
  const second=await placesAction('places.text-search',{query:'Chinesisches Restaurant',destination:destination(secondLatitude),options:options(secondLatitude)});
  assert.equal(second.data.places.length,1,'HERE must rescue exhausted Geoapify and TomTom cuisine reads');
  assert.equal(second.data.places[0].provider,'here');
  assert(second.data.places[0].types.includes('chinese_restaurant'));
  assert.deepEqual(second.data.providers.attempted,['geoapify','tomtom','here']);
  assert.equal(second.data.providers.mode,'free_budget_cascade');

  scenario='none';
  await assert.rejects(
    ()=>placesAction('places.text-search',{query:'Chinesisches Restaurant',destination:destination(54.2214),options:{...options(54.2214),providers:['geoapify']}}),
    error=>error.code==='PLACES_ALL_PROVIDERS_FAILED'&&error.providerErrors?.length===1,
    'an explicit diagnostic provider selection must remain isolated'
  );

  const source=filePath=>fs.readFileSync(path.resolve(__dirname,'..',filePath),'utf8');
  for(const [filePath,pattern] of [
    ['intelligence/places-service.js',/Array\.isArray\(options\.providers\)\?options\.providers:\['auto'\]/],
    ['intelligence/place-entity-service.js',/options\.providers\.length\?options\.providers:\['auto'\]/],
    ['core/platform/places-contract-adapter.js',/Array\.isArray\(options\.providers\)\?options\.providers:\['auto'\]/],
    ['modules/accommodations/accommodation-module.js',/providers:\['auto'\]/],
    ['app/journey/journey-suggestion-sheet.js',/providers:\['auto'\]/]
  ])assert.match(source(filePath),pattern,`${filePath} must use the managed provider cascade by default`);

  assert(calls.some(call=>call.href.includes('api.tomtom.com')),'TomTom provider request missing');
  assert(calls.some(call=>call.href.includes('hereapi.com')),'HERE provider request missing');
  console.log('Places automatic provider cascade: Geoapify → TomTom → HERE with evidenced cuisine: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
