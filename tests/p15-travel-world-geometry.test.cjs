'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync('app/composer-travel-world.js','utf8'),context);
const world=context.window.LuviaComposerTravelWorld;
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
// Holes stay water/unselectable even when their exterior polygon is land.
const holed=[{properties:{name:'Test'},geometry:{type:'Polygon',coordinates:[[[0,0],[10,0],[10,10],[0,10],[0,0]],[[3,3],[7,3],[7,7],[3,7],[3,3]]]}}];
assert.equal(world.countryAt(holed,5,5),undefined);assert.equal(world.countryAt(holed,1,1).properties.name,'Test');checks++;
assert.ok(features.every(f=>f.properties.name&&['Polygon','MultiPolygon'].includes(f.geometry.type)));checks++;
// Real mount with controlled DOM/events: gesture ownership, not a copy of the implementation.
function node(){const listeners=new Map(),captures=new Set();return {listeners,clientWidth:500,clientHeight:400,dataset:{},classList:{add(){},remove(){}},closest(){return null},
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
hierarchy.primary();assert.equal(hierarchy.snapshot().level,0);assert.equal(hierarchy.snapshot().pending.name,'Europa');assert.equal(navigation.length,0);checks++;
hierarchy.primary();assert.equal(hierarchy.snapshot().level,1);assert.equal(hierarchy.snapshot().pending,null);assert.equal(navigation.length,1);assert.equal(picks.length,pickCount);checks++;
before=hierarchy.snapshot();canvas.emit('keydown',{key:'ArrowRight'});assert.ok(hierarchy.snapshot().panX>before.panX);hierarchy.destroy();checks++;
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
console.log(`P15 travel world: ${checks}/${checks} geometry, picking and gesture checks PASS`);
