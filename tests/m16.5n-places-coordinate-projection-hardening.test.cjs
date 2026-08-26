'use strict';

const assert=require('node:assert');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'core/places/places-domain-contract-core.js'),'utf8');
const context={Object,Array,String,Number,Boolean,Date,Math,Set,Map,Error,TypeError};

vm.runInNewContext(source,context,{filename:'core/places/places-domain-contract-core.js'});
const core=context.LuviaPlacesDomainContractCoreV1;
assert.ok(core,'Places Domain Contract Core must install browserlessly');

const plain=value=>JSON.parse(JSON.stringify(value));
const projectCoordinates=input=>core.projectPlace({id:'coordinate-test',name:'Coordinate Test',...input}).coordinates;

assert.deepStrictEqual(plain(projectCoordinates({location:{latitude:52.001,longitude:13.002}})),{
  latitude:52.001,
  longitude:13.002
},'location must be accepted as a provider coordinate source');
assert.deepStrictEqual(plain(projectCoordinates({location:{lat:'52.003',lng:'13.004'}})),{
  latitude:52.003,
  longitude:13.004
},'finite numeric strings and lat/lng aliases must remain compatible');

for(const [label,input,expected] of [
  ['coordinates',{coordinates:{latitude:48.1,longitude:11.5}},{latitude:48.1,longitude:11.5}],
  ['position',{position:{lat:53.5,lng:10.0}},{latitude:53.5,longitude:10}],
  ['flat fields',{latitude:54.2,longitude:10.7},{latitude:54.2,longitude:10.7}],
  ['WGS84 negative boundary',{location:{latitude:-90,longitude:-180}},{latitude:-90,longitude:-180}],
  ['WGS84 positive boundary',{location:{latitude:90,longitude:180}},{latitude:90,longitude:180}]
]){
  const coordinates=projectCoordinates(input);
  assert.deepStrictEqual(plain(coordinates),expected,`${label} projection must stay compatible`);
  assert.ok(Object.isFrozen(coordinates),`${label} projection must remain immutable`);
}

for(const [label,input] of [
  ['boolean latitude',{location:{latitude:true,longitude:13}}],
  ['boolean longitude',{location:{latitude:52,longitude:false}}],
  ['NaN latitude',{location:{latitude:NaN,longitude:13}}],
  ['positive Infinity longitude',{location:{latitude:52,longitude:Infinity}}],
  ['negative Infinity latitude',{location:{latitude:-Infinity,longitude:13}}],
  ['NaN string',{location:{latitude:'NaN',longitude:'13'}}],
  ['Infinity string',{location:{latitude:'52',longitude:'Infinity'}}],
  ['blank string',{location:{latitude:'  ',longitude:'13'}}],
  ['object latitude',{location:{latitude:{value:52},longitude:13}}],
  ['array longitude',{location:{latitude:52,longitude:[13]}}],
  ['missing latitude',{location:{longitude:13}}],
  ['missing longitude',{location:{latitude:52}}],
  ['null latitude',{location:{latitude:null,longitude:13}}],
  ['null longitude',{location:{latitude:52,longitude:null}}],
  ['latitude below WGS84',{location:{latitude:-90.000001,longitude:13}}],
  ['latitude above WGS84',{location:{latitude:90.000001,longitude:13}}],
  ['longitude below WGS84',{location:{latitude:52,longitude:-180.000001}}],
  ['longitude above WGS84',{location:{latitude:52,longitude:180.000001}}]
]){
  assert.strictEqual(projectCoordinates(input),null,`${label} must project to null`);
}

const details=core.projectDetails({id:'details-location',location:{latitude:51.2,longitude:7.1},rating:4.8});
assert.deepStrictEqual(plain(details.coordinates),{latitude:51.2,longitude:7.1});
assert.strictEqual(details.rating,4.8,'non-coordinate detail projection must remain unchanged');

const saved=core.projectSaved({
  place:{id:'saved-location',location:{latitude:49.4,longitude:8.7},name:'Saved'},
  tripPlace:{id:'trip-place-1',trip_id:'trip-1',status:'favorite',is_favorite:true}
});
assert.deepStrictEqual(plain(saved.coordinates),{latitude:49.4,longitude:8.7});
assert.strictEqual(saved.tripPlaceId,'trip-place-1','saved projection must remain unchanged');
assert.strictEqual(saved.isFavorite,true,'saved favorite projection must remain unchanged');

console.log('M16.5N Places coordinate projection hardening: PASS');
