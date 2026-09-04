'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {stripTypeScriptTypes}=require('node:module');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const errors=[];const check=(name,fn)=>{try{fn();console.log(name+': PASS')}catch(e){errors.push(name+': '+e.message)}};
const ctx=vm.createContext({console,URLSearchParams,URL,Date,Map,Set,Promise,performance,setTimeout,clearTimeout,Deno:{env:{get:()=> 'test-key'}},document:{documentElement:{classList:{contains:()=>false}}}});ctx.window=ctx;
vm.runInContext(read('core/places/places-domain-contract-core.js'),ctx);
vm.runInContext(read('core/places/global-place-contracts.js'),ctx);
vm.runInContext(read('app/places/places-spatial-composition-core.js'),ctx);
const ui=read('app/places/places-spatial-experience.js').replace('globalThis.LuviaPlacesSpatialExperience=','globalThis.recovery={state,tripGeography,ensureVisibleFitResults,activeSearchDefinition,emptySearchMessage,emptySearchActions};globalThis.LuviaPlacesSpatialExperience=');
vm.runInContext(ui,ctx);
const gw=stripTypeScriptTypes(read('supabase/functions/luvia-gateway/_shared/places.ts').replace(/^import .*?;\r?\n/gm,'').replace(/^export /gm,''));
vm.runInContext(gw+'\nglobalThis.gatewayRecovery={geoapifyCategoriesFromOptions,geoapifyPlacesSearch};',ctx);
const geo={location:{latitude:54.0224961,longitude:10.7544158},searchRadiusMeters:3000};
const place=(name,primaryType,types)=>({id:name,providerPlaceId:name,name,primaryType,types,location:geo.location,coordinates:geo.location});
check('Park is not Wellness',()=>assert.equal(ctx.LuviaGlobalPlaceContracts.accepts(place('Augustuspark','park',['leisure_park','park','activity']),'wellness','',{}),false));
check('Museum is not a theme park',()=>assert.equal(ctx.LuviaGlobalPlaceContracts.accepts(place('Museum','museum',['museum','activity']),'themeparks','',{}),false));
check('Pool remains water experience',()=>assert.equal(ctx.LuviaGlobalPlaceContracts.accepts(place('Pool','swimming_pool',['swimming_pool','activity']),'water','',{}),true));
check('Spa remains Wellness',()=>assert.equal(ctx.LuviaGlobalPlaceContracts.accepts(place('Therme','spa',['spa','leisure_spa','activity']),'wellness','',{}),true));
check('Destination browse is local even for old 10 km trips',()=>assert.equal(ctx.recovery.tripGeography({destination:{...geo,searchRadiusMeters:10000,name:'Scharbeutz'}}).searchRadiusMeters,3000));
check('Only explicit search scope can extend the destination radius',()=>{ctx.recovery.state.searchRadiusMeters=5000;assert.equal(ctx.recovery.tripGeography({destination:geo}).searchRadiusMeters,5000);ctx.recovery.state.searchRadiusMeters=0});
check('Empty search states coverage and offers explicit alternatives',()=>{const s=ctx.recovery.state;s.trip={destination:{...geo,name:'Scharbeutz'}};s.status='empty';s.filters.cuisines=['chinese_restaurant'];assert.match(ctx.recovery.emptySearchMessage(),/3-km-Umkreis um Scharbeutz/);assert.match(ctx.recovery.emptySearchMessage(),/Küchenangaben können fehlen/);assert.match(ctx.recovery.emptySearchActions(),/data-places-expand-radius/);assert.match(ctx.recovery.emptySearchActions(),/data-places-broaden-cuisine/);s.activeViewport={};assert.match(ctx.recovery.emptySearchMessage(),/sichtbaren Kartenausschnitt/);assert.doesNotMatch(ctx.recovery.emptySearchActions(),/data-places-expand-radius/);s.activeViewport=null;s.filters.cuisines=[]});
check('Passend stays selected with no verified fits',()=>{ctx.recovery.state.fitOnly=true;ctx.recovery.state.results=[place('Ungeprüft','restaurant',['restaurant'])];assert.equal(ctx.recovery.ensureVisibleFitResults().length,0);assert.equal(ctx.recovery.state.fitOnly,true)});
check('All restores the unfiltered cohort',()=>{ctx.recovery.state.fitOnly=false;assert.equal(ctx.recovery.ensureVisibleFitResults().length,1)});
check('Broad Food does not inherit restaurant-only filter',()=>assert.equal(JSON.stringify(ctx.gatewayRecovery.geoapifyCategoriesFromOptions({category:'food',includedType:'restaurant',includedTypes:['restaurant','cafe','bar']})),JSON.stringify(['catering'])));
check('Explicit Restaurant remains a subtype',()=>assert.equal(JSON.stringify(ctx.gatewayRecovery.geoapifyCategoriesFromOptions({category:'food',includedType:'restaurant',includedTypes:['restaurant']})),JSON.stringify(['catering.restaurant'])));
check('Wellness request is spa-scoped',()=>assert.equal(JSON.stringify(ctx.gatewayRecovery.geoapifyCategoriesFromOptions({category:'wellness',includedType:'spa'})),JSON.stringify(['leisure.spa'])));
async function providerCases(){
 const calls=[];ctx.fetch=async url=>{const p=new URL(url).searchParams;calls.push(p);const activity=p.get('categories')==='entertainment';return{ok:true,status:200,json:async()=>({features:[{properties:{place_id:activity?'far':'near',name:activity?'Far':'Near',lat:activity?54.04:54.023,lon:10.7544,categories:[activity?'entertainment.miniature_golf':'leisure.playground']}},{properties:{place_id:'unnamed',lat:54.0225,lon:10.7544,categories:['leisure.park']}}]})}};
 const rows=await ctx.gatewayRecovery.geoapifyPlacesSearch('',geo,{category:'activities',maxResultCount:1,maxDistanceMeters:3000},null,null);
 check('Nearest candidates win across batches before final limit',()=>assert.equal(rows[0]?.name,'Near'));
 check('Distance bias is proximity, spatial filter remains hard',()=>{assert.ok(calls.every(p=>p.get('bias')==='proximity:10.7544158,54.0224961'));assert.ok(calls.every(p=>p.get('filter')==='circle:10.7544158,54.0224961,3000'))});
 let invalidCalls=0;ctx.fetch=async()=>{invalidCalls++;return{ok:false,status:400,json:async()=>({message:'invalid category'})}};
 let failed=false;try{await ctx.gatewayRecovery.geoapifyPlacesSearch('',geo,{category:'wellness'},null,null)}catch{failed=true}
 check('Invalid taxonomy fails instead of returning unrelated sights',()=>{assert.equal(failed,true);assert.equal(invalidCalls,1,'no unrelated taxonomy fallback request')});
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log('Places recovery behavioral regressions: PASS');
}
providerCases().catch(e=>{console.error(e);process.exitCode=1});
