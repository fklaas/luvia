'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const timers=new Map();let timerId=0;
const node=()=>({isConnected:true,dataset:{},style:{setProperty(){}},classList:{toggle(){},contains(){return false}},append(){},setAttribute(k,v){this[k]=v},addEventListener(){},closest(){return null},replaceChildren(){}});
class FakeMap{
 constructor(options){this.options=options;this.events={};this.shift=0}
 on(name,fn){(this.events[name]??=[]).push(fn)}
 fire(name,event={}){for(const fn of this.events[name]||[])fn(event)}
 addControl(){} getStyle(){return{layers:[]}} easeTo(){this.fire('moveend')} resize(){this.fire('moveend')} remove(){}
 getBounds(){return{getSouth:()=>54+this.shift,getNorth:()=>54.05+this.shift,getWest:()=>10.7,getEast:()=>10.8}}
 getCenter(){return{lat:54.025+this.shift,lng:10.75}} getZoom(){return 13}
}
class Marker{setLngLat(){return this}addTo(){return this}remove(){}}
const ctx=vm.createContext({console,Date,Map,Set,Promise,performance,document:{documentElement:node(),createElement:node},MutationObserver:class{observe(){}disconnect(){}},maplibregl:{Map:FakeMap,Marker,NavigationControl:class{}},setTimeout:(fn,ms)=>{timers.set(++timerId,{fn,ms});return timerId},clearTimeout:id=>timers.delete(id)});ctx.window=ctx;
for(const p of ['core/places/places-domain-contract-core.js','core/places/global-place-contracts.js','app/places/places-spatial-composition-core.js'])vm.runInContext(read(p),ctx);
vm.runInContext(read('app/places/places-spatial-experience.js').replace('globalThis.LuviaPlacesSpatialExperience=','globalThis.recovery={state,loadCached,saveCached,cacheScope,cacheKey};globalThis.LuviaPlacesSpatialExperience='),ctx);
const row=(id,lat=54.02)=>({id,providerPlaceId:id,name:id,primaryType:'restaurant',types:['restaurant'],coordinates:{latitude:lat,longitude:10.75}});
const tick=async()=>{const pending=[...timers];timers.clear();for(const[,t]of pending)await t.fn()};
(async()=>{
 ctx.recovery.state.category='food';
 let calls=0,rows=[row('Fresh')],received;
 const projection=ctx.LuviaPlacesSpatialExperience.mountProjection(node(),[row('Old')],{initialCenter:{latitude:54.0225,longitude:10.7544},onViewportSearch:async()=>{calls++;return rows},projectViewportResults:()=>[],onViewportResults:r=>received=r});
 assert.ok(projection.map,'real projection must mount');
 assert.equal(projection.view.markers.length,1,'known pins are available before tile readiness');
 const loadingNode=node(),loading=ctx.LuviaPlacesSpatialExperience.mountProjection(loadingNode,[],{initialCenter:{latitude:54.02,longitude:10.75},runtimeStatus:()=>({kind:'loading'})});loading.map.fire('style.load');assert.equal(loadingNode.dataset.mapState,'ready','a usable base map while search is pending must not claim empty');loading.destroy();
 assert.deepEqual(Array.from(projection.map.options.center),[10.7544,54.0225],'camera starts at destination');
 projection.map.fire('load');await tick();assert.equal(calls,0,'load, ease and resize must not spend viewport requests');
 projection.map.fire('moveend',{originalEvent:{}});projection.map.fire('dragend',{originalEvent:{}});projection.map.fire('zoomend',{originalEvent:{}});
 await tick();assert.equal(calls,1,'one user gesture causes one debounced request');
 assert.equal(received[0].name,'Fresh','fit rendering must preserve the full candidate cohort');assert.equal(projection.view.markers.length,0);
 projection.update(received);assert.equal(projection.view.markers.length,1,'All can restore full cohort after fit-only rendering');
 projection.map.shift=.1;rows=[];projection.map.fire('moveend',{originalEvent:{}});await tick();assert.equal(received.length,0,'successful empty read clears stale candidates');assert.equal(projection.view.markers.length,0);
 projection.map.shift=.2;rows=[row('Outside old viewport'),row('Inside new viewport',54.22)];projection.map.fire('moveend',{originalEvent:{}});await tick();assert.equal(received.length,1);assert.equal(received[0].name,'Inside new viewport');
 let resolve;const racing=ctx.LuviaPlacesSpatialExperience.mountProjection(node(),[row('New category')],{initialCenter:{latitude:54.02,longitude:10.75},onViewportSearch:()=>new Promise(r=>resolve=r),onViewportResults:()=>assert.fail('cancelled response must never publish')});
 racing.map.fire('load');await tick();racing.map.fire('moveend',{originalEvent:{}});const pending=tick();racing.cancelPending();resolve([row('Stale category')]);await pending;assert.equal(racing.view.markers[0].name,'New category');
 const lodging={...row('Hotel'),primaryType:'lodging',types:['lodging','accommodation_hotel']};let hotelRows;
 const hotel=ctx.LuviaPlacesSpatialExperience.mountProjection(node(),[lodging],{category:'accommodation',initialCenter:{latitude:54.02,longitude:10.75},onViewportSearch:async()=>[lodging],onViewportResults:rows=>hotelRows=rows});
 hotel.map.fire('style.load');hotel.map.fire('moveend',{originalEvent:{}});await tick();
 assert.equal(hotelRows.length,1,'Hotel viewport must ignore the currently selected Places food category');
 assert.equal(hotel.view.markers[0].name,'Hotel');
 const savedCache=new Map();ctx.LuviaPlatformPorts={get:id=>id==='OfflineCachePort'?{read:k=>savedCache.get(k),write:(k,v)=>savedCache.set(k,v)}:null};
 const st=ctx.recovery.state;st.surface='places';st.trip={id:'same-trip',destinationName:'Scharbeutz',destinationLat:54.02,destinationLng:10.75};st.category='food';st.categories=[{key:'food'}];st.results=[row('geoapify:cached')];st.lastSearchAt=new Date().toISOString();ctx.recovery.saveCached();assert.equal(savedCache.size,1);st.results=[];assert.equal(ctx.recovery.loadCached(),true);assert.equal(st.results.length,1);
 st.trip={...st.trip,destinationLat:48};assert.equal(ctx.recovery.loadCached(),false,'changed destination cannot restore stale-region pins');st.trip.destinationLat=54.02;
 const entry=savedCache.get(ctx.recovery.cacheKey());entry.savedAt='2020-01-01';assert.equal(ctx.recovery.loadCached(),false,'expired data cannot claim current coverage');entry.savedAt=new Date().toISOString();
 st.filters.cuisines=['italian_restaurant'];st.results=[row('geoapify:filtered')];ctx.recovery.saveCached();assert.equal(entry.results[0].name,'geoapify:cached','a filtered result must not overwrite the default destination cohort');st.filters.cuisines=[];
 st.results=[row('google-legacy')];ctx.recovery.saveCached();assert.equal(savedCache.get(ctx.recovery.cacheKey()).results[0].name,'geoapify:cached','cache must not absorb other provider content');
 projection.destroy();racing.destroy();hotel.destroy();console.log('Places viewport gestures, empty replacement, fit cohort, Hotel parity and stale response cancellation: PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
