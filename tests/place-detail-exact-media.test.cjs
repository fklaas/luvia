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
  assert.deepEqual({...prepared.photos[0]},{uri:'https://images.example/exact.jpg',attribution:'Exact author · CC BY',attributionUrl:'https://source.example/exact',sourceUrl:'https://source.example/exact',provider:'wikimedia',verified:true},'attribution and source metadata must survive the detail service');
  assert.match(source,/figcaption/,'the shared visible gallery must render photo attribution');
  assert.match(source,/kein sicher zugeordnetes Bild verfügbar/,'an image miss must remain explicit instead of using a misleading stock photo');
  assert.match(css,/\.rv2-gallery-photo figcaption/,'visible attribution styling must ship with the gallery');
  console.log('Shared exact-place media and visible attribution: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
