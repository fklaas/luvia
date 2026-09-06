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
  const separated={...base,id:'geoapify:c',providerPlaceId:'geoapify:c',formattedAddress:'Strandallee 80, Scharbeutz',location:{latitude:54.0205,longitude:10.7505}};
  const different={...base,id:'geoapify:d',providerPlaceId:'geoapify:d',name:'Hotel Seeblick',location:{latitude:54.02005,longitude:10.75005}};
  const rows=mergeProviderPlaces([exact,nearby,separated,different]);
  assert.equal(rows.length,3,'same name within 25 metres is one canonical place; distinct names and farther branches remain separate');
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
  console.log('P02 canonical name/address/max-25m place deduplication: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
