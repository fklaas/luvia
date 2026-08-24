'use strict';

const assert=require('node:assert');
const fs=require('node:fs');
const vm=require('node:vm');

const read=file=>fs.readFileSync(file,'utf8');
const coreSource=read('core/experience/experience-contract-core.js');
const adapterSource=read('app/adapters/experience-web-adapter.js');
const facadeSource=read('core/design/design-system-contract.js');
const css=read('core/experience/experience-foundation.css');
const index=read('index.html');
const sw=read('sw.js');
const ai=read('core/ai/ai-dashboard-service.js');
const shell=read('app/app-shell.js');
const registry=JSON.parse(read('config/luvia-cores.json'));
const safeRunner=read('tests/run-m4.3-safe-regression.cjs');
const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');

for(const token of ['window','document','navigator','localStorage','sessionStorage','HTMLElement','LuviaTripStore','LuviaTripContext','supabase','.rpc(','functions.invoke(']){
  assert(!coreSource.includes(token),`browserless Experience Core contains ${token}`);
}

const browserless={Object,Array,String,Number,Boolean,Date,Error,TypeError,Map,Set};
vm.createContext(browserless);
vm.runInContext(coreSource,browserless,{filename:'experience-contract-core.js'});
const core=browserless.LuviaExperienceContractCoreV1;
assert(core);
assert.equal(core.contractId,'experience.v1');
assert.equal(core.version,'1');
assert.equal(core.diagnostics().browserless,true);
assert.equal(core.diagnostics().domainTruth,false);
assert(core.diagnostics().tokenCount>=65);
assert(core.diagnostics().componentCount>=13);
assert.equal(core.diagnostics().stateCount,9);
assert.equal(core.diagnostics().nativePlatforms.join(','),'swiftui,compose');

for(const id of ['button','input','card','dialog','sheet','navigation','tabs','chip','menu','toast','banner','commandSurface']){
  const component=core.getComponent(id);
  assert(component,`missing component ${id}`);
  assert(component.native.swiftUI,`missing SwiftUI mapping for ${id}`);
  assert(component.native.compose,`missing Compose mapping for ${id}`);
}
for(const id of ['loading','empty','error','offline','disabled','permission','pending','success','attention'])assert(core.getState(id),`missing state ${id}`);
for(const token of core.listTokens()){
  assert(token.cssVariable,`missing Web token mapping for ${token.id}`);
  assert(token.native.swiftUI,`missing SwiftUI token mapping for ${token.id}`);
  assert(token.native.compose,`missing Compose token mapping for ${token.id}`);
}
assert(Object.isFrozen(core.getSystemSnapshot()));
assert.equal(core.createTheme({mode:'dark',accent:'#123456'}).values['color.action.primary'],'#123456');
assert.equal(core.resolveMotion('enter',{reducedMotion:true}).duration,'0ms');
assert.equal(core.getSystemSnapshot().accessibility.minimumTouchTarget,44);
assert.equal(core.getSystemSnapshot().accessibility.contrast.normalText,4.5);

const styleValues=new Map();
const eventListeners=new Map();
const browser={
  Object,Array,String,Number,Boolean,Date,Error,TypeError,Map,Set,
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
vm.runInContext(facadeSource,browser,{filename:'design-system-contract.js'});
assert(browser.LuviaExperienceContractV1);
assert.equal(browser.LuviaExperienceContractV1.diagnostics().adapter,'web-css-custom-properties');
assert(styleValues.size>=65);
eventListeners.get('luvia:theme-changed')({detail:{resolved:'dark',palette:{accent:'#345678',contrast:'#ffffff',soft:'#ddeeff'}}});
assert.equal(styleValues.get('--luvia-color-action-primary'),'#345678');
assert.equal(browser.document.documentElement.dataset.luviaExperienceTheme,'dark');
assert.equal(browser.LuviaDesignSystemContract.sourceContract,'experience.v1');
assert.equal(browser.LuviaDesignSystemContract.allowsProductForks,false);
assert(facadeSource.includes("sourceContract:'experience.v1'"));
assert(!facadeSource.includes('semanticTokens=Object.freeze(['),'facade must not recreate the canonical experience.v1 token catalogue');

for(const needle of [':focus-visible','prefers-reduced-motion:reduce','.lvx-command-trigger','.lvx-command-surface','.lvx-command-prompts','--luvia-layout-touch-minimum'])assert(css.includes(needle),`Experience CSS missing ${needle}`);
assert(index.indexOf('experience-contract-core.js')<index.indexOf('experience-web-adapter.js'));
assert(index.indexOf('experience-web-adapter.js')<index.indexOf('theme-service.js'));
assert(index.includes('core/experience/experience-foundation.css'));
for(const asset of ['core/experience/experience-contract-core.js','core/experience/experience-foundation.css','app/adapters/experience-web-adapter.js'])assert(sw.includes(asset),`service worker missing ${asset}`);

assert(shell.includes('data-luvia-experience-component="commandSurface"'));
assert(shell.includes('aria-haspopup="dialog"'));
assert(shell.includes('lvx-command-trigger-copy'));
for(const needle of ["component:'commandSurface'",'data-ai-prompt','data-experience-state','aria-live="polite"','contract.getState','ui.mount'])assert(ai.includes(needle),`AI premium pilot missing ${needle}`);
for(const forbidden of ['LuviaTripStore','LuviaPlacesCore','LuviaBookingRepository'])assert(!ai.includes(forbidden),`AI premium pilot crosses private owner boundary: ${forbidden}`);

assert.equal(registry.cores.experience.publicContract,'LuviaExperienceContractV1');
assert.equal(registry.cores.experience.browserlessCore,'core/experience/experience-contract-core.js');
assert.equal(registry.cores.experience.contractAdapter,'app/adapters/experience-web-adapter.js');
assert.equal(registry.cores.experience.truthOwnership,'no-domain-truth');
assert.equal(registry.cores.journeyTimeline.status,'active');
assert.equal(registry.cores.journeyTimeline.root,'core/journey/');
assert.equal(registry.cores.journeyTimeline.publicContract,'LuviaJourneyContractV1');
assert(safeRunner.includes('tests/m10.5-experience-contract-premium-pilot.test.cjs'));
for(const file of ['core/experience/experience-contract-core.js','core/experience/experience-foundation.css','app/adapters/experience-web-adapter.js','tests/m10.5-experience-contract-premium-pilot.test.cjs'])assert(ownership.includes(file),`ownership registry missing ${file}`);

console.log('M10.5 Experience Contract / Premium AI Pilot: PASS');
console.log(`Semantic tokens: ${core.diagnostics().tokenCount}`);
console.log(`Components / states: ${core.diagnostics().componentCount} / ${core.diagnostics().stateCount}`);
console.log('Native mappings: SwiftUI + Compose');
console.log('Journey / Timeline: independent active Core preserved');
