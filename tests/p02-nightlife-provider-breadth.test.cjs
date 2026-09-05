'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {stripTypeScriptTypes}=require('node:module');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const withoutImports=source=>source.replace(/^import .*?;\r?\n/gm,'').replace(/^export /gm,'');

const taxonomyContext=vm.createContext({Object,Array,Map,Set,Promise,Date,Math,Number,String,Boolean,RegExp,JSON,URL,URLSearchParams,console,Deno:{env:{get:()=>''}}});
taxonomyContext.globalThis=taxonomyContext;
taxonomyContext.tomtomTaxonomy={categories:[]};
taxonomyContext.hereTaxonomy={categories:[],foodTypes:[]};
taxonomyContext.providerFetch=async()=>{throw new Error('network not expected')};
vm.runInContext(stripTypeScriptTypes(withoutImports(read('supabase/functions/luvia-gateway/_shared/additional-places.ts')))+'\nglobalThis.nightlifeAdditionalTypes=additionalTypes;',taxonomyContext,{filename:'additional-places.ts'});

const typeCases=new Map([
  ['Nightlife',['nightlife_spot']],
  ['Cocktail Bar',['cocktail_bar','bar']],
  ['Wine Bar',['wine_bar','bar']],
  ['Pub',['pub','bar']],
  ['Cocktail Lounge',['cocktail_bar','lounge_bar','bar']],
  ['Disco Club',['night_club']],
  ['Live Entertainment-Music',['live_music_venue']],
  ['Jazz Club',['jazz_club']],
  ['Comedy Club',['comedy_club']],
  ['Karaoke Club',['karaoke_bar']],
  ['Casino',['casino']],
]);
for(const [label,expected] of typeCases){const actual=taxonomyContext.nightlifeAdditionalTypes([label]);for(const type of expected)assert.ok(actual.includes(type),`${label} must map to ${type}`)}

const calls={additional:[]};
const context=vm.createContext({Object,Array,Map,Set,Promise,Date,Math,Number,String,Boolean,RegExp,JSON,URL,URLSearchParams,AbortSignal,setTimeout,clearTimeout,console});
context.window=context;context.globalThis=context;
context.Deno={env:{get:name=>name==='GEOAPIFY_API_KEY'?'geo-test':''}};
context.FOURSQUARE_API_VERSION='2025-06-17';
context.FOURSQUARE_MAPPING_VERSION='test';
context.FOURSQUARE_PRO_FIELDS=[];context.FOURSQUARE_SEARCH_FIELDS=[];context.FOURSQUARE_DETAILS_FIELDS=[];
context.normalizeFoursquarePlace=value=>value;
context.boundedFoursquareError=()=>({code:'TEST'});
context.enrichLinkedMedia=async place=>place;
context.additionalDetails=async()=>null;
context.fetchMode='partial';
context.fetch=async url=>{
  const request=new URL(url),category=request.searchParams.get('categories')||'unknown';
  const count=context.fetchMode==='sufficient'?3:1;
  return{ok:true,status:200,json:async()=>({features:Array.from({length:count},(_,index)=>({properties:{place_id:`${context.fetchMode}-${category}-${index}`,name:`${category} ${index}`,lat:54.021+index*.0001,lon:10.753+index*.0001,categories:[category],datasource:{raw:{amenity:category==='adult.casino'?'casino':category==='adult.nightclub'?'nightclub':category==='catering.pub'?'pub':category==='catering.bar'?'bar':'music_venue'}}}}))})};
};
context.providerFetch=(_provider,_operation,_cost,url)=>context.fetch(url);
context.additionalSearch=async provider=>{
  calls.additional.push(provider);
  return Array.from({length:2},(_,index)=>({id:`${provider}:${index}`,providerPlaceId:`${provider}:${index}`,provider,name:`${provider} nightlife ${index}`,location:{latitude:54.023+index*.0001,longitude:10.755+index*.0001},primaryType:index?'live_music_venue':'bar',types:[index?'live_music_venue':'bar'],providerRefs:{[provider]:String(index)},evidence:[{provider,kind:'place-search'}]}));
};
vm.runInContext(stripTypeScriptTypes(withoutImports(read('supabase/functions/luvia-gateway/_shared/places.ts')))+'\nglobalThis.nightlifeProvider={placesAction,providerBreadthTarget,geoapifyCategoriesFromOptions};',context,{filename:'places.ts'});

assert.equal(context.nightlifeProvider.providerBreadthTarget('nightlife',['auto']),12);
assert.equal(context.nightlifeProvider.providerBreadthTarget('food',['auto']),0);
assert.equal(context.nightlifeProvider.providerBreadthTarget('nightlife',['geoapify']),0,'explicit provider debugging never fans out');

const nightlifeTypes=['nightlife_spot','bar','pub','cocktail_bar','wine_bar','night_club','dance_club','discotheque','lounge_bar','concert_hall','live_music_venue','music_venue','jazz_club','comedy_club','karaoke_bar','casino'];
const geoCategories=context.nightlifeProvider.geoapifyCategoriesFromOptions({category:'nightlife',includedTypes:nightlifeTypes,strictTypeFiltering:true},'Nachtleben');
for(const category of ['catering.bar','catering.pub','adult.nightclub','adult.casino','entertainment.culture'])assert.ok(geoCategories.includes(category),`${category} must be queried for nightlife`);

const destination=(name,latitude)=>({name,countryCode:'DE',location:{latitude,longitude:10.7536},canonicalCity:{name},searchRadiusMeters:3000});
const options={providers:['auto'],category:'nightlife',includedTypes:nightlifeTypes,strictTypeFiltering:true,maxResultCount:50,maxDistanceMeters:3000,languageCode:'de',regionCode:'DE'};

(async()=>{
  const partial=await context.nightlifeProvider.placesAction('places.text-search',{query:'Nachtleben',destination:destination('Scharbeutz',54.0214),options});
  assert.deepEqual(Array.from(partial.data.providers.attempted),['geoapify','tomtom','here']);
  assert.equal(partial.data.providers.primaryResultCount,5);
  assert.equal(partial.data.providers.supplementUsed,true);
  assert.equal(partial.data.providers.supplementReason,'category_breadth_floor');
  assert.equal(partial.data.providers.mode,'free_budget_supplement');
  assert.equal(partial.data.providers.breadthTarget,12);
  assert.equal(partial.data.places.length,9,'provider supplements extend rather than replace the five primary results');

  context.additionalSearch=async provider=>{
    calls.additional.push(provider);
    if(provider==='tomtom')throw Object.assign(new Error('budget unavailable'),{code:'PROVIDER_BUDGET_DENIED'});
    return Array.from({length:2},(_,index)=>({id:`${provider}:failure:${index}`,providerPlaceId:`${provider}:failure:${index}`,provider,name:`${provider} retained nightlife ${index}`,location:{latitude:54.024+index*.0001,longitude:10.756+index*.0001},primaryType:'bar',types:['bar'],providerRefs:{[provider]:`failure:${index}`},evidence:[{provider,kind:'place-search'}]}));
  };
  const retained=await context.nightlifeProvider.placesAction('places.text-search',{query:'Nachtleben mit Ausfall',destination:destination('Scharbeutz',54.0215),options:{...options,forceRefresh:true}});
  assert.equal(retained.data.places.length,7,'a failed supplement never deletes the five evidenced primary places');
  assert.ok(retained.data.providers.errors.some(error=>error.provider==='tomtom'&&error.code==='PROVIDER_BUDGET_DENIED'));
  assert.ok(retained.data.providers.answered.includes('here'));

  calls.additional.length=0;context.fetchMode='sufficient';
  const sufficient=await context.nightlifeProvider.placesAction('places.text-search',{query:'Abendorte',destination:destination('Timmendorfer Strand',54.002),options});
  assert.equal(sufficient.data.providers.primaryResultCount,15);
  assert.equal(sufficient.data.providers.supplementUsed,false);
  assert.deepEqual(calls.additional,[],'a sufficient primary cohort spends no TomTom or HERE request');
  console.log('P02 nightlife provider breadth, category taxonomy and quota-bounded supplementation: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
