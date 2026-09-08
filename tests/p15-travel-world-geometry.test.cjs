'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}},source=fs.readFileSync('app/composer-travel-world.js','utf8');vm.createContext(context);
vm.runInContext(source,context);
const world=context.window.LuviaComposerTravelWorld;
assert.match(source,/2\.7\.0-island-country-identity/);assert.match(source,/drawGeographyLabels/);assert.match(source,/lx-geography-labels/);
const features=JSON.parse(fs.readFileSync('assets/composer/world-countries.json','utf8')).features;
let checks=0;
for(const [lng,lat] of [[12.48,41.89],[-9.14,38.71],[135.77,35.01],[151.21,-33.87],[-90,0]]){
  for(const offset of [0,.15,-.15]){
    const yaw=lng*Math.PI/180+offset,pitch=lat*Math.PI/180;
    const p=world.project(lng,lat,yaw,pitch);assert.ok(p.z>0);
    const point=world.unproject(p.x,p.y,yaw,pitch);
    assert.ok(Math.abs(point.lng-lng)<.00001);assert.ok(Math.abs(point.lat-lat)<.00001);checks++;
  }
}
assert.equal(world.unproject(2,2,0,0),null);checks++;
assert.equal(world.countryAt(features,12.48,41.89).properties.name,'Italien');checks++;
assert.equal(world.countryAt(features,13.4,52.5).properties.name,'Deutschland');checks++;
assert.equal(world.countryAt(features,-30,0),undefined);checks++;
assert.equal(world.countryForDestination(features,{countryCode:'ESP',country:'Spanien',formattedAddress:'Palma, IB, Spanien'},-30,0).properties.code,'ESP','A verified island destination must survive a coarse-polygon miss through country identity');checks++;
// Holes stay water/unselectable even when their exterior polygon is land.
const holed=[{properties:{name:'Test'},geometry:{type:'Polygon',coordinates:[[[0,0],[10,0],[10,10],[0,10],[0,0]],[[3,3],[7,3],[7,7],[3,7],[3,3]]]}}];
assert.equal(world.countryAt(holed,5,5),undefined);assert.equal(world.countryAt(holed,1,1).properties.name,'Test');checks++;
assert.ok(features.every(f=>f.properties.name&&['Polygon','MultiPolygon'].includes(f.geometry.type)));checks++;
// Real mount with controlled DOM/events: gesture ownership, not a copy of the implementation.
function node(){const listeners=new Map(),captures=new Set();return {listeners,clientWidth:500,clientHeight:400,dataset:{},classList:{add(){},remove(){}},setAttribute(){},closest(){return null},
  addEventListener(name,fn,options){listeners.set(name,{fn,options});},removeEventListener(name){listeners.delete(name);},
  setPointerCapture(id){captures.add(id);},hasPointerCapture(id){return captures.has(id);},releasePointerCapture(id){captures.delete(id);},
  getBoundingClientRect(){return {left:0,top:0,width:500,height:400};},emit(name,values={}){const event={target:this,button:0,pointerId:1,clientX:100,clientY:100,cancelable:true,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;},stopImmediatePropagation(){this.stopped=true;},...values};listeners.get(name)?.fn(event);return event;}};}
const surface=node(),canvas=node(),marker=node(),status=node();marker.dataset={worldPoint:'Lissabon',lng:'-9.14',lat:'38.71'};marker.closest=()=>marker;
context.fetch=()=>new Promise(()=>{});context.requestAnimationFrame=()=>1;context.cancelAnimationFrame=()=>{};context.performance={now:()=>0};context.ResizeObserver=class{observe(){}disconnect(){}};
const host={querySelector:s=>s==='.ftc-atlas-surface'?surface:s==='[data-ftc-world-canvas]'?canvas:status,querySelectorAll:s=>s==='[data-world-point]'?[marker]:[]};
const picks=[],mounted=world.mount(host,{onPick:pick=>picks.push(pick)});let before=mounted.snapshot();
surface.emit('pointerdown',{target:marker});surface.emit('pointermove',{clientX:150,clientY:120});surface.emit('pointerup',{clientX:150,clientY:120});
assert.notEqual(mounted.snapshot().yaw,before.yaw);assert.equal(picks.length,0);checks++;
assert.equal(surface.emit('click',{detail:1}).stopped,true);checks++;
surface.emit('pointerdown',{target:marker});surface.emit('pointerup');assert.equal(picks.length,1);assert.equal(picks[0].name,'Lissabon');checks++;
assert.notEqual(surface.emit('click',{detail:0}).stopped,true);surface.emit('click',{detail:0,target:marker});assert.equal(picks.length,2);checks++;
before=mounted.snapshot();const wheel=surface.emit('wheel',{deltaX:30,deltaY:20,deltaMode:0});assert.equal(wheel.prevented,true);assert.equal(wheel.stopped,true);assert.notEqual(mounted.snapshot().yaw,before.yaw);assert.equal(surface.listeners.get('wheel').options.passive,false);checks++;
before=mounted.snapshot();surface.emit('wheel',{deltaX:0,deltaY:-20,deltaMode:0,ctrlKey:true});assert.ok(mounted.snapshot().zoom>before.zoom);checks++;
assert.equal(surface.emit('touchmove').prevented,true);assert.equal(canvas.listeners.has('touchmove'),false);checks++;
surface.emit('pointerdown',{pointerId:1,target:marker});surface.emit('pointerdown',{pointerId:2,clientX:180,target:marker});before=mounted.snapshot();surface.emit('pointermove',{pointerId:2,clientX:220});assert.ok(mounted.snapshot().zoom>before.zoom);surface.emit('pointerup',{pointerId:2});surface.emit('pointerup',{pointerId:1});assert.equal(picks.length,2);checks++;
surface.emit('pointerdown',{target:marker});surface.emit('pointercancel');surface.emit('pointerup');assert.equal(picks.length,2);assert.equal(surface.hasPointerCapture(1),false);checks++;
surface.emit('pointerdown',{target:marker});surface.emit('lostpointercapture');surface.emit('pointerup');assert.equal(picks.length,2);checks++;
before=mounted.snapshot();surface.emit('pointerdown',{button:2,target:marker});surface.emit('pointermove',{clientX:400});surface.emit('pointerup');assert.equal(mounted.snapshot().yaw,before.yaw);checks++;
surface.emit('pointerdown');mounted.destroy();assert.equal(surface.listeners.size,0);assert.equal(marker.listeners.size,0);assert.equal(canvas.listeners.size,0);assert.equal(surface.hasPointerCapture(1),false);checks++;
const navigation=[],hierarchy=world.mount(host,{onPick:p=>picks.push(p),onNavigate:v=>navigation.push(v),reducedMotion:true}),pickCount=picks.length;
assert.equal(hierarchy.snapshot().continent,'','A fresh globe must not preselect Europe or another continent');assert.equal(hierarchy.snapshot().pending,null);checks++;
hierarchy.primary();assert.equal(hierarchy.snapshot().level,0);assert.equal(hierarchy.snapshot().pending,null);assert.equal(navigation.length,0);assert.equal(picks.length,pickCount);checks++;
before=hierarchy.snapshot();canvas.emit('keydown',{key:'ArrowRight'});assert.ok(hierarchy.snapshot().yaw>before.yaw);hierarchy.destroy();checks++;
const continents=JSON.parse(fs.readFileSync('assets/composer/world-continents.json','utf8')).features;
assert.ok(continents.some(f=>f.properties.code==='Europe'));assert.ok(continents.every(f=>['Polygon','MultiPolygon'].includes(f.geometry.type)));checks++;
for(const filename of fs.readdirSync('assets/composer/regions')){assert.match(filename,/^[A-Z0-9]{3}\.json$/);const pack=JSON.parse(fs.readFileSync('assets/composer/regions/'+filename,'utf8'));assert.ok(pack.features.every(f=>f.properties.country===filename.slice(0,3)&&f.properties.name&&f.properties.code&&['Polygon','MultiPolygon'].includes(f.geometry.type)));}checks++;
const reverse=world.mount(host,{view:{level:4,country:'DEU',region:'DEU-1'},reducedMotion:true});
reverse.zoomBy(.7);assert.equal(reverse.snapshot().level,3);checks++;
reverse.zoomBy(.7);assert.equal(reverse.snapshot().level,3,'A single outward gesture must not skip two levels');checks++;
assert.equal(reverse.backLevel(),true);assert.equal(reverse.snapshot().level,2);checks++;
reverse.backLevel();assert.equal(reverse.snapshot().level,1);assert.equal(reverse.snapshot().country,'');reverse.backLevel();assert.equal(reverse.snapshot().level,0);assert.equal(reverse.backLevel(),false);reverse.destroy();checks++;
const pathPoints={continent:{coordinates:[15,48]},country:{coordinates:[10,51]},region:{coordinates:[10,54]},destination:{coordinates:[10.75,54.02]}};
assert.equal(world.geographicTrace({level:0},pathPoints).length,0);assert.equal(world.geographicTrace({level:4},pathPoints).length,4);checks++;
assert.equal(world.geographicTrace({level:2},pathPoints).length,2,'Going back removes deeper trace segments');checks++;
assert.equal(world.geographicTrace({level:4},{...pathPoints,region:null}).length,3,'No fictitious region center');checks++;
assert.equal(world.geographicTrace({level:4},{...pathPoints,destination:{coordinates:[NaN,54]}}).length,3);checks++;
const changed=world.geographicTrace({level:4},{...pathPoints,destination:{coordinates:[12,55]}});assert.equal(changed[3].coordinates[0],12);assert.equal(pathPoints.destination.coordinates[0],10.75,'Trace never mutates destination truth');checks++;
// Use the real shipped projection library: a reversed tiny ring in Hawaii previously
// painted the rest of the globe over earlier states despite a correct feature count.
const d3=require('../vendor/d3-7.9.0.min.js');let checkedRings=0,checkedRegions=0,checkedPacks=0;
assert.equal(features.length,258,'Small countries and territories must not disappear back into the old 177-unit overview');checks++;
for(const [code,lng,lat] of [['AND',1.5218,42.5063],['MCO',7.4246,43.7384],['MLT',14.5146,35.8992],['SGP',103.851,1.29],['BRB',-59.61,13.10]]){assert.equal(world.countryAt(features,lng,lat)?.properties.code,code);checks++;}
const continentNames=['Europe','Asia','North America','South America','Africa','Oceania','Antarctica'];
assert.ok(features.every(f=>continentNames.includes(f.properties.continent)),'Every country must be reachable through one of the seven continent controls');
for(const name of continentNames){const collection={type:'FeatureCollection',features:features.filter(f=>f.properties.continent===name)},projection=world.fitGeography(d3,collection,390,500),path=d3.geoPath(projection);assert.ok(collection.features.length);for(const f of collection.features)assert.ok(path(f)&&!/NaN|Infinity/.test(path(f)),name+' / '+f.properties.name);}
checks++;
for(const file of ['assets/composer/world-countries.json','assets/composer/world-continents.json',...fs.readdirSync('assets/composer/regions').map(f=>'assets/composer/regions/'+f)]){
  const pack=JSON.parse(fs.readFileSync(file));
  for(const feature of pack.features){
    for(const polygon of feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates){
      polygon.forEach((ring,index)=>{const area=d3.geoArea({type:'Polygon',coordinates:[ring]});assert.ok(index?area>=2*Math.PI:area<=2*Math.PI,file+' / '+feature.properties.name+' has a reversed ring');checkedRings++;});
    }
  }
  if(!file.includes('/regions/')||!pack.features.length)continue;
  const p=world.fitGeography(d3,pack,390,500,{usa:file.endsWith('/USA.json')}),path=d3.geoPath(p);
  for(const f of pack.features){const output=path(f);assert.ok(output&&!/NaN|Infinity/.test(output),file+' / '+f.properties.name+' has no projected region');assert.ok(path.area(f)>0,file+' / '+f.properties.name+' has no visible area');checkedRegions++;}
  checkedPacks++;
}checks++;
const usa=JSON.parse(fs.readFileSync('assets/composer/regions/USA.json'));assert.equal(usa.features.length,51);
const usProjection=world.fitGeography(d3,usa,390,500,{usa:true}),usPath=d3.geoPath(usProjection);
for(const name of ['Alaska','Hawaii','Kalifornien','Florida','Washington, D.C.']){
  const region=usa.features.find(f=>f.properties.name===name);assert.ok(region,name);const bounds=usPath.bounds(region);assert.ok(bounds.flat().every(Number.isFinite));assert.ok(bounds[0][0]>=0&&bounds[1][0]<=390&&bounds[0][1]>=0&&bounds[1][1]<=500,name+' outside overview');checks++;
}
console.log(`P15 travel world: ${checks}/${checks} geometry, picking and gesture checks PASS; ${checkedRings} rings, ${checkedRegions} regions in ${checkedPacks} nonempty packs projected with real D3`);
