'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('app/journey/journey-suggestion-sheet.js','utf8');
const place={
  providerPlaceId:'geoapify:night-1',
  provider:'geoapify',
  name:'Kleine Strandbar',
  primaryType:'bar',
  types:['bar','catering.bar'],
  location:{latitude:54.02,longitude:10.76},
  coordinates:{latitude:54.02,longitude:10.76}
};
const providerDuplicate={
  ...place,
  providerPlaceId:'here:night-1',
  provider:'here',
  location:{latitude:54.0202,longitude:10.7601},
  coordinates:{latitude:54.0202,longitude:10.7601}
};
const secondPlace={
  ...place,
  providerPlaceId:'tomtom:night-2',
  provider:'tomtom',
  name:'Reetkate',
  location:{latitude:54.025,longitude:10.755},
  coordinates:{latitude:54.025,longitude:10.755}
};
const placesById=new Map([place,providerDuplicate,secondPlace].map(item=>[item.providerPlaceId,item]));
const requests=[];
const context={
  console,
  setTimeout,
  clearTimeout,
  Date,
  Promise,
  Map,
  Set,
  WeakMap,
  AbortController,
  addEventListener(){},
  dispatchEvent(){return true},
  LuviaPlacesContractV1:{
    reads:{
      recommend:async request=>{
        requests.push(request);
        const requestIndex=requests.length-1;
        return{places:requestIndex===0?[place]:requestIndex===1?[providerDuplicate]:requestIndex===2?[secondPlace]:[],plan:{attempts:[]}};
      },
      getCard:async id=>({place:placesById.get(id)||place,image:null})
    }
  },
  LuviaJourneyContractV1:{reads:{getGraph:()=>({days:[]}),getDay:()=>({entries:[]})}},
  LuviaTripPreferenceContextV1:{
    snapshot:()=>({profilePreferences:{},tripComposition:{}}),
    sharedGroup:async()=>({travelers:[],coveredTravelers:0,totalTravelers:0})
  },
  LuviaProfileService:{snapshot:()=>({profile:{id:'traveler-1',displayName:'Fabian'}})},
  matchMedia:()=>({matches:true})
};
context.globalThis=context;
vm.runInNewContext(source,context,{filename:'journey-suggestion-sheet.js'});

(async()=>{
  const result=await context.LuviaJourneySuggestions.load({
    trip:{id:'trip-1',destination:{name:'Scharbeutz',location:{latitude:54.02,longitude:10.75}}},
    targetDate:'2027-06-12',
    startAt:'2027-06-12T20:00:00',
    endAt:'2027-06-12T22:00:00',
    query:'Abends noch etwas unternehmen',
    requestedCount:3
  },{fast:true,force:true});

  assert.equal(requests.length,6,'the bounded category plan still asks the existing Places owner');
  assert.equal(result.choices.length,2,'provider duplicates must collapse while genuine partial results remain usable');
  assert.equal(new Set(result.choices.map(item=>item.name)).size,2,'the same real place may not occupy two suggestion cards');
  assert.match(result.warning,/2 belegte Möglichkeiten/);
  assert.match(result.warning,/sicheren Teilstand sofort/);
  assert.equal(result.stale,false);
  console.log('Journey suggestion partial continuity: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
