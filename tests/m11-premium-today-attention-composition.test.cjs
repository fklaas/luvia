'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');

const coreSource=read('app/today/today-composition-core.js');
const adapterSource=read('app/today/today-experience.js');
const cssSource=read('app/today/today-experience.css');
const shellSource=read('app/app-shell.js');
const widgetSource=read('core/dashboard/dashboard-widget-registry.js');
const indexSource=read('index.html');
const swSource=read('sw.js');
const ownershipSource=read('docs/modularization/FILE-OWNERSHIP.csv');

for(const token of ['window','document','navigator','localStorage','sessionStorage','location','history','supabase','LuviaTripStore','LuviaPlaceCore','LuviaBooking']){
  assert.equal(new RegExp(`\\b${token}\\b`).test(coreSource),false,`browserless Today core contains forbidden token: ${token}`);
}
const context=vm.createContext({Date,Object,Set,String,Number,Math,Array,JSON});
vm.runInContext(coreSource,context,{filename:'today-composition-core.js'});
const core=context.LuviaTodayCompositionCoreV1;
assert.equal(core.contractId,'consumer.today-composition.v1');
assert.deepEqual(JSON.parse(JSON.stringify(core.diagnostics())),{contractId:'consumer.today-composition.v1',version:'1',runtimeVersion:'1.1.0',browserless:true,domainTruth:false,journeyTimelineOwner:false,allowedNavigationRoutes:['plan','places','control-center','control-center-bookings','control-center-inbox','more']});

const model=core.compose({
  trip:{title:'Paris zu zweit',destination:'Paris',symbol:'♥',dateRange:'22.08.2026 – 29.08.2026'},
  viewer:{displayName:'Fabian Klaas'},
  travel:{phase:'during',tripDay:3},
  attention:{items:[
    {id:'info',source:'trip',level:'info',title:'Reise läuft'},
    {id:'booking',source:'booking',level:'action_required',title:'Restaurant bestätigen',message:'Antwort ausstehend',action:{view:'control-center-bookings',label:'Prüfen'}},
    {id:'unsafe',source:'system',level:'warning',title:'Unsicher',action:{view:'admin',label:'Nicht erlaubt'}}
  ]},
  network:{online:true},
  clock:{hour:8}
});
assert.equal(model.greeting,'Guten Morgen, Fabian.');
assert.equal(model.headline,'Paris gehört heute euch.');
assert.equal(model.context.label,'Reisetag 3');
assert.equal(model.state,'attention');
assert.equal(model.attention[0].id,'booking');
assert.equal(model.attention.find(item=>item.id==='unsafe').action,null);
assert.equal(model.quickActions[0].route,'places');
assert.equal(model.provenance.domainTruth,false);
assert.match(model.provenance.journeyTimeline,/journey\.v1 read-only/);
assert.equal(Object.isFrozen(model),true);
assert.equal(Object.isFrozen(model.attention),true);
assert.equal(Object.isFrozen(model.attention[0]),true);
assert.equal(Object.isFrozen(model.quickActions),true);

const offline=core.compose({trip:{destination:'Rom'},travel:{phase:'before'},network:{online:false},clock:{hour:20}});
assert.equal(offline.greeting,'Guten Abend.');
assert.equal(offline.headline,'Rom rückt näher.');
assert.equal(offline.state,'offline');
assert.match(offline.status.message,/Offline bereit/);

const webWindow={
  LuviaTodayCompositionCoreV1:core,
  LuviaControlCenterTravelIdentity:{snapshot:()=>({phase:'during',tripDay:3})},
  LuviaControlCenterAttention:{snapshot:()=>({items:[{id:'booking-1',source:'booking',level:'action_required',title:'Restaurant bestätigen',action:{view:'control-center-bookings'}}]})},
  LuviaPlatformPorts:{get:id=>id==='NetworkPort'?{isOnline:()=>true}:null},
  addEventListener(){},removeEventListener(){}
};
webWindow.window=webWindow;
vm.runInContext(adapterSource,vm.createContext({window:webWindow,Date,Object,String,Number,Array,JSON,Error}),{filename:'today-experience.js'});
const rendered=webWindow.LuviaTodayExperience.render({
  trip:{id:'trip-paris',title:'Paris zu zweit',destination:{name:'Paris'},symbol:'♥',startDate:'2026-08-22',endDate:'2026-08-29'},
  profile:{displayName:'Fabian Klaas'},
  widgetsHtml:'<article data-widget-id="today">Journey calendar</article>',
  esc:value=>String(value)
});
assert.match(rendered,/data-today-contract="consumer\.today-composition\.v1"/);
assert.match(rendered,/<p class="lvt-focus-greeting">(?:Guten Morgen|Guten Tag|Guten Abend|Gute Nacht), Fabian\.<\/p>/);
assert.match(rendered,/Eure Erinnerungen beginnen hier<br><em>Paris im Blick\.<\/em>/);
assert.match(rendered,/data-experience-state="attention"/);
assert.match(rendered,/data-ai-ask-open/);
assert.match(rendered,/data-journey-projection="journey\.v1-read-only"/);
assert.match(rendered,/data-place-projection="places\.v1-read-only"/);
assert.match(rendered,/data-today-destination-image/);
assert.doesNotMatch(rendered,/data-widget-id="today">Journey calendar/,'focused Today stays a single non-scrolling hero instead of rendering legacy dashboard widgets');

for(const token of ['LuviaTripStore','TripStore','LuviaPlaceCore','LuviaBooking','supabase','\\.from\\(','localStorage','sessionStorage']){
  assert.equal(new RegExp(token).test(adapterSource),false,`Today Web adapter contains private/domain shortcut: ${token}`);
}
for(const required of ['LuviaControlCenterTravelIdentity','LuviaControlCenterAttention','LuviaPlatformPorts',"get?.('NetworkPort')",'LuviaTodayCompositionCoreV1','data-ai-ask-open','data-view','data-journey-projection="journey.v1-read-only"','bind','unbind'])assert.ok(adapterSource.includes(required),`Today adapter missing ${required}`);
assert.ok(shellSource.includes('window.LuviaTodayExperience'));
assert.match(shellSource,/today\.render\(\{trip:t,profile:p,esc,widgetsHtml:/);
assert.match(shellSource,/LuviaTodayExperience\?\.unbind/);
assert.match(shellSource,/LuviaTodayExperience\?\.bind/);
assert.ok(shellSource.includes('[data-widget-grid]'),'existing dashboard refresh mount must stay compatible');
assert.ok(widgetSource.includes("register({id:'today'"));
assert.ok(widgetSource.includes('LuviaJourneyDayComposer?.renderCalendar'));
assert.equal(widgetSource.includes('LuviaTimelineCore?.renderCalendar'),false);
assert.equal(coreSource.includes('TimelineCore'),false,'pure Consumer composition must not import Journey runtime');

for(const variable of ['--luvia-color-action-primary','--luvia-color-surface-elevated','--luvia-layout-touch-minimum','--luvia-color-border-focus','--luvia-focus-ring'])assert.ok(cssSource.includes(variable),`Experience token missing: ${variable}`);
assert.ok(cssSource.includes(':focus-visible'));
assert.ok(cssSource.includes('@media(prefers-reduced-motion:reduce)'));
assert.ok(cssSource.includes('@media(max-width:560px)'));
assert.match(cssSource,/min-height:var\(--luvia-layout-touch-minimum\)/);

const order=[
  'app/today/today-experience.css',
  'app/today/today-composition-core.js',
  'app/control-center/travel-identity-service.js',
  'app/control-center/control-center-attention-service.js',
  'app/today/today-experience.js',
  'app/app-shell.js'
].map(asset=>indexSource.indexOf(asset));
order.forEach((position,index)=>assert.ok(position>=0,`index asset ${index} missing`));
assert.ok(order[1]<order[2]&&order[2]<order[3]&&order[3]<order[4]&&order[4]<order[5],'Today runtime load order is invalid');
for(const asset of ['app/today/today-composition-core.js','app/today/today-experience.js','app/today/today-experience.css'])assert.ok(swSource.includes(`'${asset}'`),`service worker missing ${asset}`);
for(const asset of ['app/today/today-composition-core.js','app/today/today-experience.js','app/today/today-experience.css','tests/m11-premium-today-attention-composition.test.cjs'])assert.ok(ownershipSource.includes(asset),`ownership registry missing ${asset}`);

console.log('M11 premium Today and Attention composition: PASS');
