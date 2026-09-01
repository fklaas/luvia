'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const adapterSource=fs.readFileSync(path.join(root,'app/adapters/places-discovery-adapter.js'),'utf8');
const actionSource=fs.readFileSync(path.join(root,'core/ai/ai-action-runtime.js'),'utf8');

test('AI Places discovery reuses the resolved active destination before provider search',async()=>{
  const requests=[];
  const activeDestination={
    id:'scharbeutz',
    name:'Scharbeutz',
    countryCode:'DE',
    location:{latitude:54.0261,longitude:10.7564},
    viewport:{south:53.99,west:10.70,north:54.08,east:10.82}
  };
  const sandbox={
    console,
    setTimeout,
    clearTimeout,
    document:{documentElement:{lang:'de'}},
    LuviaPlacesDomainContractCoreV1:{
      version:'test',
      routeDiscovery:()=>({category:'food',label:'Essen & Trinken',primaryType:'restaurant',includedType:'restaurant',includedTypes:['restaurant','cafe'],query:'Cafés'})
    },
    LuviaGlobalPlaceContracts:{
      queryCascade:()=>['Café im Zentrum von Scharbeutz'],
      intentFor:()=>({niche:false}),
      spatialIntent:()=>null,
      relevance:()=>({score:0,reasons:[]}),
      accepts:()=>true
    },
    LuviaPlaces:{activeDestination:()=>activeDestination},
    LuviaPlaceEntities:{
      searchPlaces:async options=>{
        requests.push(options);
        return{data:{places:[{id:'fsq:cafe-1',providerPlaceId:'fsq:cafe-1',name:'Café Mitte',location:{latitude:54.027,longitude:10.757},provider:'foursquare',providerRefs:{foursquare:'cafe-1'},types:['cafe']}],providers:{requested:['google','foursquare'],used:['foursquare'],errors:[]}},meta:{cache:{hit:false}}};
      }
    }
  };
  sandbox.window=sandbox;
  sandbox.globalThis=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(adapterSource,sandbox,{filename:'places-discovery-adapter.js'});

  const result=await sandbox.LuviaPlacesDiscoveryService.recommend({
    tripId:'trip-1',
    trip:{id:'trip-1',destination:{name:'Scharbeutz'}},
    destination:'Scharbeutz',
    text:'Café im Zentrum, nicht am Strand',
    category:'food',
    fastPath:true,
    fastQueryLimit:1,
    limit:1,
    providers:['google','foursquare']
  });

  assert.equal(requests.length,1);
  assert.deepEqual(JSON.parse(JSON.stringify(requests[0].destination)),activeDestination);
  assert.equal(requests[0].strictDestination,true);
  assert.equal(result.places.length,1);
  assert.equal(result.places[0].provider,'foursquare');
  assert.equal(result.providerDiagnostics.status,'ready');
});

test('AI owner passes Trip-owned destination context without creating a second owner',()=>{
  assert.match(actionSource,/placesContract\(\)\.reads\.recommend\(\{tripId:tripId\(trip\),trip,text:/);
  assert.match(actionSource,/destinationContext:trip\?\.destination&&typeof trip\.destination==='object'\?trip\.destination:null/);
  assert.doesNotMatch(actionSource,/LuviaDestination\.(?:ensureResolved|set|save)/);
});
