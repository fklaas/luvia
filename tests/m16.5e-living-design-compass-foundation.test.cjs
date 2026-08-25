'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=file=>fs.readFileSync(file,'utf8');
const coreSource=read('core/experience/experience-contract-core.js');
const adapterSource=read('app/adapters/experience-web-adapter.js');
const safeRunner=read('tests/run-m4.3-safe-regression.cjs');

for(const forbidden of ['window','document','navigator','localStorage','sessionStorage','supabase','LuviaTripStore','LuviaTripContext']){
  assert(!coreSource.includes(forbidden),`browserless Experience foundation contains ${forbidden}`);
}

const browserless={Object,Array,String,Number,Boolean,Date,Error,TypeError,Map,Set,Math,parseInt};
vm.createContext(browserless);
vm.runInContext(coreSource,browserless,{filename:'experience-contract-core.js'});
const core=browserless.LuviaExperienceContractCoreV1;

assert(core);
assert.equal(core.runtimeVersion,'1.1.0');
assert.equal(core.diagnostics().browserless,true);
assert.equal(core.diagnostics().domainTruth,false);
assert.deepEqual([...core.diagnostics().compassRotatableLayers],['needle']);
assert(core.diagnostics().tokenCount>=80);
assert(core.diagnostics().motionPatternCount>=9);
assert.equal(core.diagnostics().hapticIntentCount,6);

const brand=core.createCompassTheme();
assert.equal(brand.variant,'brand');
assert.equal(brand.palette.ringStops.map(stop=>stop.color).join(','),'#ef6254,#f4b34c,#2c93a9,#2f8c73,#ef6254');
assert.deepEqual([...brand.layers.rotatable],['needle']);
assert.deepEqual([...brand.layers.fixed],['face','hub']);
assert(brand.layers.forbidden.includes('whole-mark'));
assert.equal(brand.geometry.safeAreaRatio,.125);
assert.equal(brand.domainTruth,false);

const personalized=core.createCompassTheme({accent:'#2f8c73'});
assert.equal(personalized.variant,'activeTrip');
assert.equal(personalized.palette.ringStops[0].color,'#2f8c73');
assert.equal(personalized.palette.ringStops.at(-1).color,'#2f8c73');
assert.equal(new Set(personalized.palette.ringStops.map(stop=>stop.color)).size,2,'active Trip ring must use two colour families');
assert.equal(JSON.stringify(personalized.palette.directionPoints),JSON.stringify(brand.palette.directionPoints),'direction semantics must stay brand-stable');
assert(personalized.activeTripPalette.contrast.onAccent>=4.5,'derived foreground must meet normal-text contrast');
assert.equal(personalized.activeTripPalette.source,'explicit-experience-input');
assert.equal(personalized.activeTripPalette.domainTruth,false);

const theme=core.createTheme({tripAccent:'#2f8c73'});
assert.equal(theme.values['color.action.primary'],'#2f8c73');
assert.equal(theme.values['color.trip.accent'],'#2f8c73');
assert.equal(theme.values['color.trip.complement'],personalized.activeTripPalette.complement);
assert.equal(theme.compass.variant,'activeTrip');
assert(Object.isFrozen(theme));
assert.equal(core.createTheme().values['color.action.primary'],'#e96784','foundation must not restyle the current product without an explicit Trip accent');
for(const accent of ['#ffffff','#000000','#ef6254','#f4b34c','#2c93a9','#2f8c73','#7b61ff','#f3e44d']){
  assert(core.deriveActiveTripPalette({accent}).contrast.onAccent>=4.5,`contrast fallback failed for ${accent}`);
}

for(const id of ['compassSharedElement','compassNodeReveal','compassNeedleSeek','compassAmbientInvite','compassBrandIntro']){
  const motion=core.getMotion(id);
  assert(motion,`missing ${id}`);
  assert(motion.native.swiftUI,`missing SwiftUI mapping for ${id}`);
  assert(motion.native.compose,`missing Compose mapping for ${id}`);
  assert.equal(core.resolveMotion(id,{reducedMotion:true}).duration,'0ms');
}
assert.deepEqual([...core.getMotion('compassNeedleSeek').rotates],['needle']);
assert.deepEqual([...core.getMotion('compassNeedleSeek').fixed],['face','hub']);
for(const id of ['select','navigate','confirm','success','warning','compassSeek']){
  const haptic=core.getHaptic(id);
  assert(haptic,`missing haptic intent ${id}`);
  assert(haptic.native.swiftUI);
  assert(haptic.native.compose);
}

const component=core.getComponent('livingCompass');
assert.equal(component.rotatableLayer,'needle');
assert.equal(component.minimumTouchTarget,44);
assert(component.variants.includes('activeTrip'));

const styleValues=new Map();
const eventListeners=new Map();
const browser={
  Object,Array,String,Number,Boolean,Date,Error,TypeError,Map,Set,Math,parseInt,
  console:{error:()=>{}},
  document:{documentElement:{dataset:{},style:{setProperty:(name,value)=>styleValues.set(name,value)}}},
  CustomEvent:function(type,init){this.type=type;this.detail=init?.detail},
  addEventListener:(name,handler)=>eventListeners.set(name,handler),
  dispatchEvent:()=>true
};
browser.window=browser;
vm.createContext(browser);
vm.runInContext(coreSource,browser,{filename:'experience-contract-core.js'});
vm.runInContext(adapterSource,browser,{filename:'experience-web-adapter.js'});
eventListeners.get('luvia:theme-changed')({detail:{tripAccent:'#2f8c73'}});
assert.equal(styleValues.get('--luvia-color-trip-accent'),'#2f8c73');
assert.equal(styleValues.get('--luvia-color-action-primary'),'#2f8c73');
assert.equal(browser.document.documentElement.dataset.luviaTripAccent,'personalized');
assert.equal(browser.LuviaExperienceContractV1.snapshot().domainTruth,false);
assert.equal(browser.LuviaExperienceContractV1.snapshot().compass.layers.rotatable[0],'needle');

const assets={
  primary:read('assets/brand/luvia-living-compass/primary.svg'),
  compact:read('assets/brand/luvia-living-compass/compact.svg'),
  face:read('assets/brand/luvia-living-compass/layers/face.svg'),
  needle:read('assets/brand/luvia-living-compass/layers/two-ended-needle.svg'),
  hub:read('assets/brand/luvia-living-compass/layers/hub.svg')
};
assert(assets.primary.includes('ring-ne')&&assets.primary.includes('ring-es')&&assets.primary.includes('ring-sw')&&assets.primary.includes('ring-wn'));
assert(assets.primary.includes('filter id="shadow"'),'primary mark requires controlled material depth');
assert(!assets.compact.includes('filter id="shadow"'),'compact mark must not inherit the large-format drop shadow');
assert(assets.needle.includes('M64 26.5')&&assets.needle.includes('M64 79.4'),'needle must preserve two visual ends');
assert(!assets.face.includes('M64 26.5'),'face layer must not duplicate the needle');
assert(!assets.hub.includes('M64 26.5'),'hub layer must not duplicate the needle');

assert(safeRunner.includes('tests/m16.5e-living-design-compass-foundation.test.cjs'));

console.log('M16.5E Living Design / Compass Foundation: PASS');
console.log(`Tokens / motion / haptics: ${core.diagnostics().tokenCount} / ${core.diagnostics().motionPatternCount} / ${core.diagnostics().hapticIntentCount}`);
console.log('Brand Compass / active-Trip palette / rotatable needle: PASS');
console.log('Web / SwiftUI / Compose semantic projection: PASS');
console.log('Domain Truth / browser dependencies: NONE');
