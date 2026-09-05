'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {chromium}=require('playwright');

const output=process.env.LUVIA_TEST_OUTPUT||path.resolve('test-results/p09-owner-capabilities-first-paint');
const headed=process.env.LUVIA_HEADED==='1';
const read=file=>fs.readFileSync(file,'utf8');
const trip={id:'trip-scharbeutz',title:'Ostseeurlaub',destination:{name:'Scharbeutz'},startDate:'2027-06-12',endDate:'2027-06-12'};
const entries=[
  {id:'place-open',source:'place-data',sourceKey:'place-open',sourceRevision:'rev-1',dataKey:'planned_at',tripId:trip.id,tripPlaceId:'link-open',placeId:'place-open',providerPlaceId:'provider-open',title:'Grande Beach Café',entityType:'restaurant',startAt:'2027-06-12T10:00:00.000Z',durationMinutes:60,metadata:{providerFacts:{typeLabel:'Restaurant'}}},
  {id:'place-booked',source:'place-data',sourceKey:'place-booked',sourceRevision:'rev-2',dataKey:'planned_at',tripId:trip.id,tripPlaceId:'link-booked',placeId:'place-booked',providerPlaceId:'provider-booked',title:'Gebuchtes Abendessen',entityType:'restaurant',startAt:'2027-06-12T13:00:00.000Z',durationMinutes:90,metadata:{bookingId:'booking-1',bookingStatus:'confirmed'}},
  {id:'visit-one',source:'gps',sourceKey:'visit-one',sourceRevision:'visit-rev-1',tripId:trip.id,placeId:'place-visit',title:'Bestätigter Strandbesuch',entityType:'nature',kind:'visited',startAt:'2027-06-12T16:00:00.000Z',durationMinutes:45,automatic:true,metadata:{}},
  {id:'memory-one',source:'event',sourceKey:'memory-one',tripId:trip.id,title:'Sonnenuntergang am Meer',entityType:'photo_memory',kind:'photo_memory',startAt:'2027-06-12T19:00:00.000Z',durationMinutes:30,metadata:{mediaIds:['media-1']}}
];

async function verifyHydrationContinuity(){
  const source=read('core/places/timeline-core.js'),events=[],started=[];let dateEntries=[],gate=Promise.resolve();
  const builder=table=>{const query={select(){started.push(table);return query},eq(){return query},neq(){return query},order(){return query},in(){return query},then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};return query};
  const context={console,setTimeout,clearTimeout,queueMicrotask,Date,Math,Number,String,Boolean,JSON,Map,Set,WeakMap,WeakSet,Promise,CustomEvent:class CustomEvent{constructor(type,options={}){this.type=type;this.detail=options.detail}},addEventListener:()=>{},dispatchEvent:event=>events.push(event)};
  context.window=context;context.globalThis=context;
  context.LuviaTripContext={getActiveTrip:()=>({tripId:'trip-1'})};
  context.LuviaSupabaseService={getClient:()=>({from:builder})};
  context.LuviaTripPlaceData={hydrate:()=>gate,dateEntries:()=>dateEntries,snapshot:()=>({tripId:'trip-1'}),init:async()=>{}};
  vm.createContext(context);vm.runInContext(source,context,{filename:'core/places/timeline-core.js'});
  dateEntries=[{id:'pd-one',tripId:'trip-1',tripPlaceId:'tp-one',placeId:'p-one',placeType:'restaurant',kind:'planned',title:'Bestehender Plan',startAt:'2027-06-12T10:00:00.000Z',dataKey:'planned_at',record:{updated_at:'rev-1',place:{name:'Bestehender Plan'}}}];
  await context.LuviaTimelineCore.hydrate('trip-1');assert.equal(context.LuviaTimelineCore.snapshot().entries.length,1);
  let release;gate=new Promise(resolve=>{release=resolve});dateEntries=[];started.length=0;
  const pending=context.LuviaTimelineCore.hydrate('trip-2');
  const during=context.LuviaTimelineCore.snapshot();assert.equal(during.loading,true);assert.equal(during.hydrated,false);assert.equal(during.entries.length,0,'A trip switch must not paint entries from the previous trip');
  for(const table of ['trip_schedule_events','timeline_events','place_visits','trip_places','trip_members'])assert.ok(started.includes(table),`${table} must start without waiting for the Place-data request`);
  assert.ok(events.some(event=>event.type==='luvia:timeline-changed'&&event.detail?.projectionReason==='hydrate-start'),'Hydration start must be projected to consumers');
  release();await pending;assert.equal(context.LuviaTimelineCore.snapshot().hydrated,true);
}

const setup=`(()=>{
 let provider={tripId:${JSON.stringify(trip.id)},loading:true,hydrated:false,entries:[],lastError:null,lastUpdatedAt:null};
 const listeners=new Set();
 window.__providerState=()=>structuredClone(provider);
 window.__publishTimeline=value=>{provider=structuredClone(value);for(const listener of listeners)listener(structuredClone(provider))};
 window.LuviaTimelineCore={snapshot:()=>structuredClone(provider),subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener)},hydrate:async()=>structuredClone(provider),init:async()=>structuredClone(provider),diagnostics:()=>({cloudAuthoritative:true,realtime:true,eventCount:provider.entries.length,metrics:{queued:0}})};
 window.LuviaTripContractV1={getActiveTrip:()=>(${JSON.stringify(trip)})};
 window.LuviaBookingContractV1={reads:{listForTrip:async()=>[{id:'booking-1',trip_place_id:'link-booked',status:'confirmed'}]}};
 window.__visitWrites=[];window.__visit={id:'visit-one',tripId:${JSON.stringify(trip.id)},placeId:'place-visit',state:'visited',arrivedAt:'2027-06-12T16:00:00.000Z',leftAt:null,durationSeconds:2700,detectionSource:'gps-confirmed',automatic:false,confirmed:true,revision:'visit-rev-1'};
 window.LuviaPlacesContractV1={reads:{getVisit:()=>structuredClone(window.__visit),getPlace:()=>({id:'place-visit',name:'Bestätigter Strandbesuch',formattedAddress:'Strandallee, Scharbeutz'}),getLifecycle:async()=>({lifecycle:'visited'}),visitRecoveries:()=>[]},commands:{updateVisit:async(id,input)=>{window.__visitWrites.push({kind:'update',id,input});window.__visit={...window.__visit,arrivedAt:input.arrivedAt,leftAt:input.leftAt,durationSeconds:input.durationSeconds,revision:'visit-rev-2'};return structuredClone(window.__visit)},removeVisit:async(id,input)=>{window.__visitWrites.push({kind:'remove',id,input});return{recoveryId:'visit-recovery-1'}}}};
 window.LuviaUI={mount(options){const overlay=document.createElement('div');overlay.className='fixture-overlay luvia-living-sheet-overlay '+(options.className||'');overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label',options.label||'Dialog');options.content.classList.add('luvia-living-sheet');overlay.append(options.content);document.body.append(overlay);const handle={id:'fixture-overlay',overlay,close(){overlay.remove();options.onClose?.()}};overlay.querySelectorAll(options.closeSelector||'[data-close]').forEach(button=>button.onclick=()=>handle.close());return handle}};
 window.LuviaJourneyOfflinePack={status:()=>({available:false,saved:false})};
 window.LuviaFeatureFlagRegistry={register:()=>{}};window.LuviaGlobalContracts={register:()=>{}};
 window.LuviaUIKit={toast:()=>{}};
 window.LuviaApp={show:async()=>{const root=document.querySelector('main');root.innerHTML=window.LuviaJourneyDayComposer.renderTimeline(${JSON.stringify(trip)});window.LuviaJourneyDayComposer.bindTimeline(root)}};
})();`;
const html='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Luvia · Timeline Owner</title><link rel="stylesheet" href="/composer.css"><style>:root{--lv-accent:#aa6189;--lv-on-accent:#fff;--trip-accent:#aa6189}body{margin:0;font:16px system-ui;background:#edf4f4}main{max-width:1180px;margin:auto;padding:12px}.lvjt-photo{display:none!important}.lvjt-entry-card{grid-template-columns:1fr!important}</style></head><body><main></main><script src="/domain.js"></script><script src="/setup.js"></script><script src="/adapter.js"></script><script src="/composer.js"></script><script>window.LuviaApp.show()</script></body></html>';

(async()=>{
  await verifyHydrationContinuity();
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:!headed});
  try{
    const page=await browser.newPage({viewport:{width:477,height:900},hasTouch:true,isMobile:true,timezoneId:'Europe/Berlin'}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const assets=new Map([
      ['/',{contentType:'text/html',body:html}],
      ['/composer.css',{contentType:'text/css',body:read('app/journey/journey-day-composer.css')}],
      ['/domain.js',{contentType:'text/javascript',body:read('core/journey/journey-domain-contract-core.js')}],
      ['/setup.js',{contentType:'text/javascript',body:setup}],
      ['/adapter.js',{contentType:'text/javascript',body:read('core/platform/journey-contract-adapter.js')}],
      ['/composer.js',{contentType:'text/javascript',body:read('app/journey/journey-day-composer.js')}],
      ['/assets/brand/luvia-living-compass/layers/face.svg',{contentType:'image/svg+xml',body:read('assets/brand/luvia-living-compass/layers/face.svg')}],
      ['/assets/brand/luvia-living-compass/layers/two-ended-needle.svg',{contentType:'image/svg+xml',body:read('assets/brand/luvia-living-compass/layers/two-ended-needle.svg')}],
      ['/assets/brand/luvia-living-compass/layers/hub.svg',{contentType:'image/svg+xml',body:read('assets/brand/luvia-living-compass/layers/hub.svg')}]
    ]);
    await page.route('https://fixture.luvia.test/**',route=>{const item=assets.get(new URL(route.request().url()).pathname);return item?route.fulfill(item):route.abort()});
    await page.goto('https://fixture.luvia.test/');

    const loading=page.locator('[data-journey-loading]');try{await loading.waitFor({state:'visible',timeout:5000})}catch(error){throw new Error(`Timeline loading surface missing. Page errors: ${errors.join(' | ')||'none'}. Body: ${(await page.locator('body').textContent()).slice(0,500)}`,{cause:error})}
    const loadingText=await loading.textContent();
    assert.match(loadingText,/Euer Reisetag wird sicher zusammengesetzt/);
    assert.match(loadingText,/zeigen wir den Tag nicht fälschlich als leer/);
    assert.doesNotMatch(loadingText,/0 Momente|Dieser Tag gehört noch euch/);
    assert.equal(await loading.getAttribute('aria-busy'),'true');
    const readiness=await page.evaluate(()=>window.LuviaJourneyContractV1.reads.snapshot().readiness);
    assert.deepEqual(readiness,{hydrated:false,loading:true,lastError:null,lastUpdatedAt:null});
    await page.screenshot({path:path.join(output,'truthful-loading-state.png'),fullPage:true});

    await page.evaluate(value=>{window.__publishTimeline(value);return window.LuviaApp.show()}, {tripId:trip.id,loading:false,hydrated:true,entries,lastError:null,lastUpdatedAt:'2026-09-04T20:00:00.000Z'});
    await page.locator('[data-entry-capabilities]').first().waitFor();
    assert.equal(await page.locator('[data-entry-capabilities]').count(),4);
    for(const label of ['Plan direkt bearbeitbar','Buchung schützt diesen Termin','Bestätigter Besuch','Erinnerung im Memory-Bereich'])assert.equal(await page.getByText(label,{exact:true}).count(),1,label);
    const matrix=await page.evaluate(()=>Object.fromEntries(window.LuviaJourneyContractV1.reads.snapshot().entries.map(entry=>[entry.id,window.LuviaJourneyContractV1.reads.entryCapabilities(entry)])));
    assert.equal(matrix['place-open'].actions.editSchedule.state,'available');
    assert.equal(matrix['place-open'].actions.connectReorder.state,'available');
    assert.equal(matrix['place-booked'].owner,'booking');
    assert.equal(matrix['place-booked'].actions.editSchedule.state,'delegated');
    assert.equal(matrix['place-booked'].actions.connectReorder.state,'locked');
    assert.equal(matrix['visit-one'].mode,'confirmed-visit');
    assert.equal(matrix['visit-one'].actions.remove.state,'delegated');
    assert.equal(matrix['memory-one'].owner,'media');
    assert.equal(matrix['memory-one'].actions.editSchedule.state,'locked');

    const booked=page.locator('[data-entry-id="place-booked"]'),visit=page.locator('[data-entry-id="visit-one"]'),memory=page.locator('[data-entry-id="memory-one"]');
    assert.equal(await booked.getByRole('button',{name:'Buchung verwalten',exact:true}).count(),1);
    assert.equal(await booked.getByRole('button',{name:'Löschen',exact:true}).count(),0);
    assert.equal(await visit.getByRole('button',{name:/Zeit ändern|Löschen/}).count(),0);
    assert.equal(await memory.getByRole('button',{name:'Fotomoment öffnen',exact:true}).count(),1);
    await page.getByRole('button',{name:'Timeline bearbeiten',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Für gemeinsamen Weg auswählen',exact:true}).count(),1,'Only the unbooked planned Place may enter group editing');
    await booked.locator('[data-entry-capabilities]').evaluate(node=>node.open=true);
    await page.screenshot({path:path.join(output,'owner-capability-matrix.png'),fullPage:true});
    await visit.getByRole('button',{name:'Besuch verwalten',exact:true}).click();
    const visitDialog=page.getByRole('dialog',{name:'Bestätigten Besuch verwalten'});await visitDialog.waitFor();
    assert.equal(await visitDialog.getByRole('button',{name:'Besuchszeit korrigieren',exact:true}).count(),1);
    assert.equal(await visitDialog.getByRole('button',{name:'Aus Timeline entfernen',exact:true}).count(),1);
    await visitDialog.getByRole('button',{name:'Besuchszeit korrigieren',exact:true}).click();
    await visitDialog.locator('input[name="time"]').fill('18:15');await visitDialog.locator('input[name="duration"]').fill('60');
    await page.screenshot({path:path.join(output,'visit-owner-correction-preview.png'),fullPage:true});
    await visitDialog.getByRole('button',{name:'Korrektur bestätigen',exact:true}).click();await visitDialog.waitFor({state:'detached'});
    const visitWrites=await page.evaluate(()=>window.__visitWrites);assert.equal(visitWrites.length,1);assert.equal(visitWrites[0].kind,'update');assert.equal(visitWrites[0].input.confirmed,true);assert.equal(visitWrites[0].input.expectedRevision,'visit-rev-1');assert.equal(visitWrites[0].input.durationSeconds,3600);
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,'result.json'),JSON.stringify({pass:true,headed,viewport:'477x900',checks:['truthful loading state without false empty day','readiness projection','planned Place direct actions','Booking delegation','Visit owner correction preview and confirmed write','Memory delegation','only eligible Place selectable for group edit'],errors},null,2));
    console.log('P09 owner capability matrix and truthful Timeline first paint: PASS');
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
