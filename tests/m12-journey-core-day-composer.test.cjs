'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const corePath='core/journey/journey-domain-contract-core.js';
const adapterPath='core/platform/journey-contract-adapter.js';
const composerPath='app/journey/journey-day-composer.js';
const composerCssPath='app/journey/journey-day-composer.css';
const browserFixturePath='tests/fixtures/m12-journey-day-composer-browser.html';

for(const file of [corePath,adapterPath,composerPath,composerCssPath,browserFixturePath]){
  assert.ok(fs.existsSync(path.join(ROOT,file)),`Missing M12 runtime file: ${file}`);
}

const coreSource=read(corePath);
const adapterSource=read(adapterPath);
for(const token of ['window','document','navigator','localStorage','sessionStorage','Supabase','querySelector','fetch(']){
  assert.equal(coreSource.includes(token),false,`Journey Domain Core must remain browserless: ${token}`);
}

const context={Object,Array,Map,Set,Date,Math,Number,String,Boolean,JSON,Intl};
vm.createContext(context);
vm.runInContext(coreSource,context,{filename:corePath});
const core=context.LuviaJourneyDomainContractCoreV1;
assert.ok(core,'Journey Domain Contract Core did not publish its browserless surface');
assert.deepEqual(JSON.parse(JSON.stringify(core.diagnostics())),{
  contractId:'journey.v1',
  version:'1',
  runtimeVersion:'1.0.0',
  browserless:true,
  truth:'derived-day-graph-and-conflict-policy',
  foreignDomainTruth:false,
  persistence:false,
  sourceOwners:['booking','journey','media','places','trip']
});

const projection=core.compose({
  trip:{id:'trip-1',title:'Paris',startDate:'2026-08-24',endDate:'2026-08-26'},
  now:'2026-08-24T09:00:00.000Z',
  entries:[
    {id:'schedule:1',source:'schedule',sourceKey:'1',tripId:'trip-1',entityType:'restaurant',title:'Fruehstueck',startAt:'2026-08-24T10:00:00.000Z',endAt:'2026-08-24T11:00:00.000Z',placeId:'place-1'},
    {id:'place-data:2',source:'place-data',sourceKey:'2',tripId:'trip-1',entityType:'attraction',title:'Museum',startAt:'2026-08-24T10:45:00.000Z',durationMinutes:90,placeId:'place-2'},
    {id:'visit:3',source:'gps',sourceKey:'3',tripId:'trip-1',entityType:'place',title:'Spaziergang',startAt:'2026-08-24T14:00:00.000Z',durationMinutes:30,placeId:'place-3',automatic:true},
    {id:'event:4',source:'event',sourceKey:'4',tripId:'trip-1',entityType:'photo_memory',kind:'photo_memory',title:'Fotomoment',startAt:'2026-08-25T12:00:00.000Z',metadata:{mediaIds:['m-1']}}
  ]
});

assert.equal(Object.isFrozen(projection),true);
assert.equal(Object.isFrozen(projection.days),true);
assert.equal(projection.contractId,'journey.v1');
assert.equal(projection.trip.id,'trip-1');
assert.equal(projection.days.length,3,'Trip date range should produce a complete three-day graph');
assert.equal(projection.summary.entryCount,4);
assert.equal(projection.summary.conflictCount,1);
assert.equal(projection.days[0].conflicts[0].kind,'overlap');
assert.deepEqual(JSON.parse(JSON.stringify(projection.days[0].conflicts[0].entryIds)),['schedule:1','place-data:2']);
assert.equal(projection.days[0].entries[0].provenance.owner,'journey');
assert.equal(projection.days[0].entries[0].durationMinutes,60,'Explicit one-hour interval must infer its duration');
assert.equal(projection.days[0].entries[1].provenance.owner,'places');
assert.equal(projection.days[0].entries[2].provenance.owner,'places');
assert.equal(projection.days[1].entries[0].provenance.owner,'media');
assert.equal(projection.days[0].status,'attention');
assert.equal(projection.days[1].status,'planned');
assert.equal(projection.days[2].status,'open');
assert.equal(projection.provenance.foreignDomainTruth,false);
assert.equal(projection.provenance.persistence,false);
assert.equal(projection.provenance.sourceContract,'journey.web-projection');

const adapterEvents=[];
const adapterContext={
  Object,Array,Map,Set,Date,Math,Number,String,Boolean,JSON,Intl,
  CustomEvent:class CustomEvent{constructor(type,options={}){this.type=type;this.detail=options.detail}},
  dispatchEvent:event=>adapterEvents.push(event),
  LuviaTimelineCore:{
    snapshot:()=>({tripId:'trip-1',hydrated:true,entries:[{id:'provider:1',source:'schedule',tripId:'trip-1',title:'Dinner',entityType:'restaurant',startAt:'2026-08-24T18:00:00.000Z',durationMinutes:90}]}),
    subscribe:()=>()=>{},
    diagnostics:()=>({cloudAuthoritative:true,realtime:true,eventCount:1,metrics:{queued:0}}),
    init:async()=>({}),hydrate:async()=>({}),record:async()=>({}),removeEntry:async()=>true,clearEntries:async()=>({}),removePhotoMemoryByCluster:async()=>true,
    openPhotoMemory:()=>null,editEntry:()=>null,openPlanningEditor:()=>null
  },
  LuviaTripContractV1:{getActiveTrip:()=>({id:'trip-1',title:'Paris',startDate:'2026-08-24',endDate:'2026-08-26'})},
  LuviaGlobalContracts:{register:definition=>adapterEvents.push(definition)}
};
vm.createContext(adapterContext);
vm.runInContext(coreSource,adapterContext,{filename:corePath});
vm.runInContext(adapterSource,adapterContext,{filename:adapterPath});
const journeyApi=adapterContext.LuviaJourneyContractV1;
assert.equal(journeyApi.contractId,'journey.v1');
assert.equal(journeyApi.reads.snapshot({now:'2026-08-24T09:00:00.000Z'}).entries[0].provenance.owner,'journey');
assert.equal(journeyApi.reads.snapshot({now:'2026-08-24T09:00:00.000Z'}).trip.id,'trip-1');
assert.equal(typeof journeyApi.commands.hydrate,'function');
assert.equal(typeof journeyApi.commands.recordEvent,'function');
assert.equal(journeyApi.diagnostics().cloudAuthoritative,true);

const registry=JSON.parse(read('config/luvia-cores.json'));
const contractSpec=JSON.parse(read('docs/modularization/contracts/journey.v1.json'));
assert.equal(registry.cores.journeyTimeline.status,'active');
assert.equal(registry.cores.journeyTimeline.root,'core/journey/');
assert.equal(registry.cores.journeyTimeline.ownerStream,'feature/platform-core');
assert.equal(registry.cores.journeyTimeline.browserlessCore,corePath);
assert.equal(registry.cores.journeyTimeline.contractAdapter,adapterPath);
assert.equal(registry.cores.journeyTimeline.legacyCompatibility,'core/places/timeline-core.js');
assert.equal(contractSpec.contractId,'journey.v1');
assert.equal(contractSpec.runtimeImplementationStage,'M12');
assert.equal(contractSpec.truthOwnership,'derived-day-graph-and-conflict-policy');
assert.equal(contractSpec.foreignDomainTruth,false);
assert.deepEqual(contractSpec.currentImplementation,[corePath,adapterPath,'LuviaJourneyContractV1']);
for(const command of ['hydrate','recordEvent','removeEntry','clearEntries','editEntry'])assert.ok(contractSpec.commands.includes(command),`journey.v1 contract spec missing command: ${command}`);

const index=read('index.html');
const order=[corePath,'core/places/timeline-core.js',adapterPath,composerPath,'app/app-shell.js'].map(file=>index.indexOf(file));
assert.ok(order.every(index=>index>=0),'M12 runtime files must all be loaded');
assert.deepEqual(order,[...order].sort((a,b)=>a-b),'Journey Core, compatibility runtime, contract, composer and App Shell load order is invalid');
assert.ok(index.includes(`${composerCssPath}?v=13.82.48`));

for(const token of ['LuviaJourneyContractV1','contractId:CONTRACT_ID','composeProjection','const reads=Object.freeze','const commands=Object.freeze','legacyCompatibility:true'])assert.ok(adapterSource.includes(token),`Journey adapter missing ${token}`);
assert.equal((adapterSource.match(/LuviaTimelineCore/g)||[]).length<=2,true,'Journey adapter must contain one compatibility-provider boundary, not scattered private access');

const activeScripts=[...index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)]
  .map(match=>match[1].split('?')[0].replace(/^\.\//,''))
  .filter(file=>file&&!/^(?:https?:)?\/\//i.test(file)&&/\.m?js$/i.test(file));
const privateTimelineConsumers=activeScripts.filter(file=>read(file).includes('LuviaTimelineCore')).sort();
assert.deepEqual(privateTimelineConsumers,[adapterPath,'core/places/timeline-core.js'].sort(),'Only journey.v1 adapter may reach the legacy Timeline provider');
const publicConsumers=activeScripts.filter(file=>file!==adapterPath).map(file=>read(file)).join('\n');
assert.doesNotMatch(publicConsumers,/LuviaJourneyContractV1(?:\?\.|\.)(?:hydrate|record|removeEntry|clearEntries|removePhotoMemoryByCluster|editEntry|openPlanningEditor|snapshot|list)\b/,'Active consumers must use explicit journey.v1 reads/commands namespaces');

const appShell=read('app/app-shell.js');
assert.equal(appShell.includes('LuviaTimelineCore'),false,'Active App Shell must consume journey.v1 instead of the private Timeline runtime');
assert.ok(appShell.includes('LuviaJourneyContractV1'));
assert.ok(appShell.includes('LuviaJourneyDayComposer'));

const widgets=read('core/dashboard/dashboard-widget-registry.js');
assert.ok(widgets.includes('LuviaJourneyDayComposer?.renderCalendar'));
assert.equal(widgets.includes('LuviaTimelineCore?.renderCalendar'),false);

const composer=read(composerPath),css=read(composerCssPath),legacy=read('core/places/timeline-core.js');
for(const token of ['journey.day-composer','journey.day-detail','LuviaJourneyContractV1','LuviaExperienceContractV1','LuviaUI','data-journey-date'])assert.ok(composer.includes(token),`Day Composer missing ${token}`);
assert.ok(css.includes('min-height:48px'));
assert.match(css,/\.lvj-entry-actions button\{min-height:48px/);
assert.ok(css.includes('prefers-reduced-motion'));
assert.ok(css.includes('grid-template-columns'));
assert.ok(legacy.includes("runtimeRole:'journey-web-compatibility-adapter'"));
assert.ok(legacy.includes("publicContract:'journey.v1'"));

const debt=JSON.parse(read('config/luvia-native-readiness-debt.json'));
assert.ok(debt.files?.['core/places/timeline-core.js']||debt.fileInventory?.['core/places/timeline-core.js']||JSON.stringify(debt).includes('core/places/timeline-core.js'),'Historical NFR baseline must remain intact');

const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
for(const file of [corePath,adapterPath,composerPath,composerCssPath,'docs/modularization/contracts/journey.v1.json','tests/m12-journey-core-day-composer.test.cjs',browserFixturePath])assert.ok(ownership.includes(file),`Ownership registry missing ${file}`);
assert.match(ownership,/core\/places\/timeline-core\.js,Journey,Adapter\/Web Compatibility/);

const fixture=read(browserFixturePath);
for(const asset of [corePath,adapterPath,composerPath,composerCssPath])assert.ok(fixture.includes(`../../${asset}`),`Browser fixture missing production asset: ${asset}`);
assert.ok(fixture.includes('data-fixture-root'));

console.log('M12 Journey Core / Day Graph / Day Composer: PASS');
