'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
globalThis.Deno={env:{get:name=>name==='SUPABASE_URL'?'https://test.supabase.co':name==='SUPABASE_SERVICE_ROLE_KEY'?'service-role':'fixture-key'}};
const ok=data=>new Response(JSON.stringify(data),{headers:{'content-type':'application/json'}});
(async()=>{
  const calls=[];
  globalThis.fetch=async(url,init={})=>{
    calls.push({url:String(url),init});
    if(String(url).includes('/rpc/'))return ok({allowed:true});
    if(String(url).includes('/places:searchText'))return ok({places:[{id:'google-exact',displayName:{text:'Exact Venue'},location:{latitude:54.0214,longitude:10.7536},photos:[{name:'places/google-exact/photos/photo-1',widthPx:1200,heightPx:800,authorAttributions:[{displayName:'Verified photographer',uri:'https://maps.google.com/author'}]}]}]});
    if(String(url).includes('/photos/photo-1/media'))return ok({photoUri:'https://lh3.googleusercontent.com/exact-photo'});
    throw new Error(`unexpected ${url}`);
  };
  const module=await import(pathToFileURL(path.resolve(__dirname,'../supabase/functions/luvia-gateway/_shared/places.ts')));
  const source={id:'geoapify:venue',providerPlaceId:'geoapify:venue',provider:'geoapify',name:'Exact Venue',countryCode:'DE',location:{latitude:54.0214,longitude:10.7536},photos:[]};
  const enriched=await module.enrichExactGoogleMedia(source);
  assert.equal(enriched.photos.length,1);
  assert.equal(enriched.photos[0].provider,'google');
  assert.equal(enriched.photos[0].entityReference,'geoapify:venue','the selected Luvia entity remains the photo owner');
  assert.equal(enriched.photos[0].linkedEntityReference,'google:google-exact','the exact Google entity is traceable');
  assert.equal(enriched.photos[0].verified,true);
  assert.equal(enriched.providerRefs.google,'google-exact');
  assert.equal(calls.filter(call=>call.url.includes('/places:searchText')).length,1,'one selected place spends one exact identity search');
  const resolved=await module.placesAction('places.photo',{photoName:enriched.photos[0].name,maxWidthPx:960,maxHeightPx:720});
  assert.equal(resolved.data.photoUri,'https://lh3.googleusercontent.com/exact-photo');
  assert.equal(calls.filter(call=>call.url.includes('/media')).length,1,'the photo SKU is read only when the image is actually resolved');
  console.log('Google exact selected-place identity, traceability and on-demand photo: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
