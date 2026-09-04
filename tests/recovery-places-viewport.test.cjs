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
vm.runInContext(read('app/places/places-spatial-experience.js').replace('globalThis.LuviaPlacesSpatialExperience=','globalThis.recovery={state,loadCached,saveCached,cacheScope,cacheKey,categoryCohortKey,rememberCategoryCohort,restoreCategoryCohort,beginViewportIntent};globalThis.LuviaPlacesSpatialExperience='),ctx);
const row=(id,lat=54.02)=>({id,providerPlaceId:id,name:id,primaryType:'restaurant',types:['restaurant'],coordinates:{latitude:lat,longitude:10.75}});
const tick=async()=>{const pending=[...timers];timers.clear();for(const[,t]of pending)await t.fn()};
(async()=>{
 ctx.recovery.state.category='food';
 let calls=0,rows=[row('Fresh')],received,intendedViewport;
 const projection=ctx.LuviaPlacesSpatialExperience.mountProjection(node(),[row('Old')],{initialCenter:{latitude:54.0225,longitude:10.7544},onViewportIntent:descriptor=>intendedViewport=descriptor,onViewportSearch:async()=>{calls++;return rows},projectViewportResults:()=>[],onViewportResults:r=>received=r});
 assert.ok(projection.map,'real projection must mount');
 assert.equal(projection.view.markers.length,1,'known pins are available before tile readiness');
 const loadingNode=node(),loading=ctx.LuviaPlacesSpatialExperience.mountProjection(loadingNode,[],{initialCenter:{latitude:54.02,longitude:10.75},runtimeStatus:()=>({kind:'loading'})});loading.map.fire('style.load');assert.equal(loadingNode.dataset.mapState,'ready','a usable base map while search is pending must not claim empty');loading.destroy();
 assert.deepEqual(Array.from(projection.map.options.center),[10.7544,54.0225],'camera starts at destination');
 projection.map.fire('load');await tick();assert.equal(calls,0,'load, ease and resize must not spend viewport requests');
 projection.map.fire('moveend',{originalEvent:{}});projection.map.fire('dragend',{originalEvent:{}});projection.map.fire('zoomend',{originalEvent:{}});
 assert.equal(intendedViewport?.bounds.south,54,'the visible area must become the active intent before debounce or provider completion');
 await tick();assert.equal(calls,1,'one user gesture causes one debounced request');
 assert.equal(received[0].name,'Fresh','fit rendering must preserve the full candidate cohort');assert.equal(projection.view.markers.length,0);
 projection.update(received);assert.equal(projection.view.markers.length,1,'All can restore full cohort after fit-only rendering');
 projection.map.shift=.1;rows=[];projection.map.fire('moveend',{originalEvent:{}});await tick();assert.equal(received.length,0,'successful empty read clears stale candidates');assert.equal(projection.view.markers.length,0);
 projection.map.shift=.2;rows=[row('Outside old viewport'),row('Inside new viewport',54.22)];projection.map.fire('moveend',{originalEvent:{}});await tick();assert.equal(received.length,1);assert.equal(received[0].name,'Inside new viewport');
 let resolve;const racing=ctx.LuviaPlacesSpatialExperience.mountProjection(node(),[row('New category')],{initialCenter:{latitude:54.02,longitude:10.75},onViewportSearch:()=>new Promise(r=>resolve=r),onViewportResults:()=>assert.fail('cancelled response must never publish')});
 racing.map.fire('load');await tick();racing.map.fire('moveend',{originalEvent:{}});const pending=tick();racing.cancelPending();resolve([row('Stale category')]);await pending;assert.equal(racing.view.markers[0].name,'New category');
 let retryCalls=0,failViewport=true;
 const retrying=ctx.LuviaPlacesSpatialExperience.mountProjection(node(),[row('Retained')],{initialCenter:{latitude:54.02,longitude:10.75},onViewportSearch:async()=>{retryCalls++;if(failViewport)throw new Error('transient');return[row('Retried')]}});
 retrying.map.fire('load');retrying.map.fire('moveend',{originalEvent:{}});await tick();assert.equal(retrying.view.markers[0].name,'Retained','transient failures retain previous pins');
 failViewport=false;retrying.map.fire('moveend',{originalEvent:{}});await tick();assert.equal(retryCalls,2,'failed area can be retried without moving to a different area');assert.equal(retrying.view.markers[0].name,'Retried');
 retrying.map.shift=.1;retrying.map.fire('moveend',{originalEvent:{}});retrying.cancelPending();await tick();assert.equal(retryCalls,2);
 retrying.map.fire('moveend',{originalEvent:{}});await tick();assert.equal(retryCalls,3,'cancelled area is not remembered as a completed search');retrying.destroy();
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
 st.category='food';st.query='Restaurant';st.results=[row('geoapify:food-cohort')];st.status='ready';st.lastSearchAt=new Date().toISOString();assert.equal(ctx.recovery.rememberCategoryCohort(),true);
 st.category='shopping';st.query='Shopping';st.results=[{...row('geoapify:shopping-cohort'),primaryType:'store',types:['store']}];
 assert.equal(ctx.recovery.restoreCategoryCohort('food','Restaurant'),true,'returning to a recent category restores its exact destination cohort immediately');
 assert.equal(st.results[0].name,'geoapify:food-cohort');assert.equal(st.status,'ready');
 // A late destination read must not overwrite a newer camera intent, and a
 // category change during the viewport debounce must use that camera's bounds.
 let finishDestination,viewportOptions=[];const traceMap={dataset:{}};
 st.root={querySelector:selector=>selector.includes('[data-places-map]')?traceMap:null,querySelectorAll:()=>[]};st.mapProjection={cancelPending(){},update(){return{markers:[]}}};st.activeViewport=null;
 st.categories=[{key:'food',query:'Restaurant',primaryType:'restaurant'},{key:'shopping',query:'Shopping',primaryType:'store'}];
 const shopping={...row('Shopping recovered',54.15),primaryType:'store',types:['store','commercial']};
 ctx.LuviaPlacesContractV1={reads:{recommend:()=>new Promise(resolve=>finishDestination=resolve),searchViewport:async options=>{viewportOptions.push(options);return{places:options.forceRefresh?[shopping]:[]}}}};
 const slowDestination=ctx.LuviaPlacesSpatialExperience.search({category:'food',preserveMap:true});
 const camera={bounds:{south:54.1,north:54.2,west:10.7,east:10.8},center:{latitude:54.15,longitude:10.75},radiusMeters:5000,key:'54.1000:10.7000:54.2000:10.8000'};
 ctx.recovery.beginViewportIntent(camera);st.results=[row('New viewport',54.15)];
 finishDestination({places:[row('Old destination')]});assert.equal(await slowDestination,false);assert.equal(st.results[0].name,'New viewport','late destination response cannot replace current viewport pins');
 await ctx.LuviaPlacesSpatialExperience.search({category:'shopping',query:'Shopping',preserveMap:true,replaceCategory:true});
 assert.equal(viewportOptions.length,2,'an unexpected broad empty category read gets one bounded continuity retry');
 assert.equal(viewportOptions[0].bounds,camera.bounds,'category switch uses new viewport before a viewport response has completed');assert.equal(viewportOptions[0].category,'shopping');
 assert.equal(viewportOptions[1].forceRefresh,true,'continuity retry bypasses browser and gateway cache');
 assert.equal(st.results[0].name,'Shopping recovered');assert.equal(traceMap.dataset.searchAttempt,'empty-retry');assert.equal(traceMap.dataset.searchResultCount,'1');
 viewportOptions=[];let transient=true;ctx.LuviaPlacesContractV1.reads.searchViewport=async options=>{viewportOptions.push(options);if(transient){transient=false;throw Object.assign(new Error('provider interrupted'),{code:'PLACES_PROVIDER_READ_UNAVAILABLE',status:503})}return{places:[shopping]}};
 await ctx.LuviaPlacesSpatialExperience.search({category:'shopping',query:'Shopping',preserveMap:true,replaceCategory:true});
 assert.equal(viewportOptions.length,2,'an unfiltered transient provider interruption gets one bounded continuity retry');
 assert.equal(viewportOptions[1].forceRefresh,true);assert.equal(st.results[0].name,'Shopping recovered');assert.equal(traceMap.dataset.searchAttempt,'transient-retry');
 assert.equal(traceMap.dataset.searchViewport,camera.key,'the trace retains the camera viewport key instead of the category key');
 viewportOptions=[];st.filters.types=['shopping_mall'];ctx.LuviaPlacesContractV1.reads.searchViewport=async options=>{viewportOptions.push(options);return{places:[]}};
 await ctx.LuviaPlacesSpatialExperience.search({category:'shopping',query:'Shopping',preserveMap:true,replaceCategory:true});
 assert.equal(viewportOptions.length,1,'a legitimately empty filtered viewport must not spend a continuity retry');st.filters.types=[];
 ctx.LuviaPlacesContractV1={reads:{}};
 await assert.rejects(ctx.LuviaPlacesSpatialExperience.viewportSearch(camera),/not ready/,'unavailable contract is not a successful empty result');
 const failureCopy={textContent:''},failureStatus={dataset:{},matches:()=>true,querySelector:selector=>selector==='span'?failureCopy:null,insertAdjacentHTML(_where,html){this.actions=html}};
 const failureShell={dataset:{},classList:{toggle(){}},setAttribute(k,v){this[k]=v},removeAttribute(k){delete this[k]},querySelector:()=>failureStatus};
 const failureMap={dataset:{},closest:()=>failureShell};
 st.root={querySelector:selector=>selector==='[data-places-map]'?failureMap:null,querySelectorAll:()=>[]};st.activeViewport=null;
 ctx.LuviaPlacesContractV1={reads:{recommend:async()=>{throw new Error('timeout')}}};
 st.category='food';st.filters.cuisines=['italian_restaurant'];st.results=[row('Old unfiltered result')];
 await ctx.LuviaPlacesSpatialExperience.search({category:'food',query:'Italienisch',silent:true,preserveMap:true});
 assert.equal(st.status,'error','a failed filter read must not hide behind stale rows excluded by that filter');assert.equal(st.results.length,0);
 st.filters.cuisines=[];
 await ctx.LuviaPlacesSpatialExperience.search({category:'shopping',query:'Shopping',preserveMap:true,replaceCategory:true});
 assert.equal(st.status,'error');assert.equal(failureMap.dataset.mapState,'unavailable');assert.equal(failureStatus.dataset.refreshing,'false');assert.equal(failureShell['aria-busy'],undefined,'failed read must stop loading');assert.match(failureStatus.actions,/data-places-retry/,'failure must offer a retry');assert.match(failureCopy.textContent,/erneut versuchen/);
 projection.destroy();racing.destroy();hotel.destroy();console.log('Places viewport gestures, empty replacement, fit cohort, Hotel parity and stale response cancellation: PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
