'use strict';

const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');

(async()=>{
  const source=pathToFileURL(path.join(__dirname,'..','supabase','functions','luvia-gateway','_shared','places.ts')).href;
  const {mergeProviderPlaces}=await import(`${source}?dedupe=${Date.now()}`);
  const base={name:'Hotel Strandgrün',provider:'geoapify',types:['lodging'],formattedAddress:'Strandallee 10, Scharbeutz',location:{latitude:54.02,longitude:10.75},photos:[],evidence:[{provider:'geoapify',kind:'place-search'}]};
  const nearby={...base,id:'geoapify:b',providerPlaceId:'geoapify:b',location:{latitude:54.0201,longitude:10.7501},photos:[{uri:'https://images.example/hotel.jpg'}]};
  const exact={...base,id:'geoapify:a',providerPlaceId:'geoapify:a'};
  const separated={...base,id:'geoapify:c',providerPlaceId:'geoapify:c',formattedAddress:'Strandallee 80, Scharbeutz',location:{latitude:54.025,longitude:10.755}};
  const different={...base,id:'geoapify:d',providerPlaceId:'geoapify:d',name:'Hotel Seeblick',location:{latitude:54.02005,longitude:10.75005}};
  const rows=mergeProviderPlaces([exact,nearby,separated,different]);
  assert.equal(rows.length,3,'same lodging name within 350 metres is one canonical property; distinct names and farther properties remain separate');
  assert.equal(rows[0].providerPlaceId,'geoapify:b','the photo-bearing exact duplicate is retained as the richer canonical row');
  assert.equal(rows[0].photos.length,1);
  assert.deepEqual(rows[0].canonicalDuplicateIds,['geoapify:a','geoapify:b']);
  assert.equal(rows[0].providerRefs.geoapify,'b','the provider reference follows the retained canonical row');
  const addressOnly=mergeProviderPlaces([
    {...exact,id:'here:a',providerPlaceId:'here:a',provider:'here',location:null},
    {...exact,id:'tomtom:b',providerPlaceId:'tomtom:b',provider:'tomtom',location:null}
  ]);
  assert.equal(addressOnly.length,1,'an exact normalized name and full address can deduplicate providers without coordinates');
  assert.equal(addressOnly[0].provider,'multi');
  const ordinaryBranches=mergeProviderPlaces([
    {...exact,id:'geoapify:restaurant-a',providerPlaceId:'geoapify:restaurant-a',name:'Muster Café',primaryType:'restaurant',types:['restaurant']},
    {...exact,id:'geoapify:restaurant-b',providerPlaceId:'geoapify:restaurant-b',name:'Muster Café',primaryType:'restaurant',types:['restaurant'],formattedAddress:'Strandallee 20, Scharbeutz',location:{latitude:54.0215,longitude:10.7515}}
  ]);
  assert.equal(ordinaryBranches.length,2,'non-accommodation branches still use the strict 25-metre identity boundary');
  console.log('P02 canonical place and accommodation-property deduplication: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
