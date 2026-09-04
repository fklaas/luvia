const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('app/adapters/places-discovery-adapter.js','utf8');
const calls=[];
const queryOffsets={q1:0,q2:10,q3:20,q4:30,q5:40};
const window={
  LuviaGlobalPlaceContracts:{
    queryCascade:()=>Object.keys(queryOffsets),
    intentFor:()=>({key:'generic',niche:false}),
    accepts:()=>true,
    relevance:()=>({score:0,reasons:[]})
  },
  LuviaPlaceEntities:{
    async searchPlaces(options){
      calls.push(options);
      const offset=queryOffsets[options.query];
      return{data:{places:Array.from({length:20},(_,index)=>({providerPlaceId:`place-${offset+index}`,name:`Place ${offset+index}`,types:['restaurant'],rating:4.5,userRatingCount:100}))}};
    }
  }
};
const categories={food:{label:'Essen'}};
const domain={version:'test',routeDiscovery:()=>({category:'food',primaryType:'restaurant',includedType:'restaurant',includedTypes:['restaurant'],label:'Essen',query:'Restaurants'})};
const context={window,LuviaPlacesDomainContractCoreV1:domain};
context.globalThis=context;
vm.runInContext(source,vm.createContext(context),{filename:'places-discovery-adapter.js'});

(async()=>{
  const result=await window.LuviaPlacesDiscoveryService.recommend({text:'Restaurants',destination:'Scharbeutz',candidateLimit:60,limit:18});
  assert.equal(calls.length,5,'overlapping provider pages must keep sampling the bounded semantic variants until the wider diversity pool is real');
  assert(calls.every(call=>call.maxResultCount===20),'provider work is bounded to the visible owner request');
  assert.equal(new Set(calls.flatMap(call=>call.intentContext.variants)).size,5,'fallback variants remain available when a provider query fails or is too small');
  assert.equal(result.places.length,18,'the owner adapter must expose the requested expanded ranked set');
  assert.equal(new Set(result.places.map(place=>place.providerPlaceId)).size,18,'visible results must stay deduplicated');
  assert.equal(result.diversityMeta.queriedVariants,5,'the result must expose the actual provider-query breadth');
  assert.equal(result.diversityMeta.rotationAcrossQueries,true,'ranked cards must rotate across the sampled variants');
  assert.equal(window.LuviaPlacesDiscoveryService.diagnostics().breadthUsesUniquePlaces,true);
  console.log('LUVIA_M15_0B_PLACES_PROGRESSIVE_BREADTH_RUNTIME_OK');
})().catch(error=>{console.error(error);process.exitCode=1});
