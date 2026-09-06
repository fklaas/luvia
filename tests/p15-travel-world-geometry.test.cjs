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
console.log(`P15 travel world: ${checks}/${checks} projection, geographic picking and data checks PASS`);
