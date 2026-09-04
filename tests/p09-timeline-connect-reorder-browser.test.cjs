'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const output=process.env.LUVIA_TEST_OUTPUT||path.resolve('test-results/p09-connect-reorder');
const headed=process.env.LUVIA_HEADED==='1';
const read=file=>fs.readFileSync(file,'utf8');
const storeKey='fixture:p09-connected-timeline';
const placeholderSvg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e96861"/><stop offset=".5" stop-color="#b45d91"/><stop offset="1" stop-color="#2f9a93"/></linearGradient></defs><circle cx="80" cy="80" r="72" fill="url(#g)"/><path d="M80 28 96 80 80 132 64 80Z" fill="#fff" opacity=".9"/></svg>';

const setup=`(()=>{
  const trip={id:'trip-scharbeutz',title:'Ostseeurlaub',destination:{name:'Scharbeutz'},startDate:'2027-06-12',endDate:'2027-06-13'};
  const initial=[
    {id:'entry-cafe',source:'place-data',dataKey:'planned_at',sourceRevision:'rev-1',tripId:trip.id,tripPlaceId:'link-cafe',placeId:'place-cafe',providerPlaceId:'provider-cafe',title:'Grande Beach Café',entityType:'restaurant',startAt:'2027-06-12T10:00:00.000Z',durationMinutes:60,fields:{planned_at:'2027-06-12T10:00:00.000Z',metadata:{durationMinutes:60,notes:'Frühstück'}},metadata:{durationMinutes:60,notes:'Frühstück'}},
    {id:'entry-museum',source:'place-data',dataKey:'planned_at',sourceRevision:'rev-1',tripId:trip.id,tripPlaceId:'link-museum',placeId:'place-museum',providerPlaceId:'provider-museum',title:'Museum für Regionalgeschichte',entityType:'attraction',startAt:'2027-06-12T14:00:00.000Z',durationMinutes:75,fields:{planned_at:'2027-06-12T14:00:00.000Z',metadata:{durationMinutes:75,notes:'Kultur'}},metadata:{durationMinutes:75,notes:'Kultur'}}
  ];
  const readEntries=()=>{try{return JSON.parse(localStorage.getItem('${storeKey}')||'null')||structuredClone(initial)}catch{return structuredClone(initial)}};
  const writeEntries=rows=>localStorage.setItem('${storeKey}',JSON.stringify(rows));
  window.__fixtureWrites=Number(sessionStorage.getItem('fixture:p09-writes')||0);
  window.LuviaTripContractV1={getActiveTrip:()=>trip};
  window.LuviaTimelineCore={snapshot:()=>({tripId:trip.id,hydrated:true,entries:readEntries()}),hydrate:async()=>({tripId:trip.id,hydrated:true,entries:readEntries()}),subscribe:()=>()=>{}};
  window.LuviaBookingContractV1={reads:{listForTrip:async()=>[]}};
  window.LuviaPlacesContractV1={commands:{plan:async input=>{
    const rows=readEntries(),index=rows.findIndex(entry=>entry.tripPlaceId===input.tripPlaceId);if(index<0)throw new Error('Fixture-Owner fehlt.');
    const current=rows[index];if(input.expectedUpdatedAt!==current.sourceRevision)throw new Error('Fixture-Revision ist veraltet.');
    const revision=Number(String(current.sourceRevision).replace(/\\D/g,''))+1,fields=structuredClone(input.fields),metadata=structuredClone(fields.metadata||{});
    rows[index]={...current,startAt:fields.planned_at,durationMinutes:Number(metadata.durationMinutes)||current.durationMinutes,fields:{...current.fields,...fields},metadata,sourceRevision:'rev-'+revision};
    writeEntries(rows);window.__fixtureWrites+=1;sessionStorage.setItem('fixture:p09-writes',String(window.__fixtureWrites));return{updated_at:'rev-'+revision};
  }}};
  window.LuviaFeatureFlagRegistry={register:()=>{}};window.LuviaGlobalContracts={register:()=>{}};
  window.LuviaUIKit={toast:message=>{document.documentElement.dataset.lastToast=message}};
  window.LuviaUI={mount(options){const overlay=document.createElement('div');overlay.className='fixture-overlay luvia-ui-overlay '+(options.className||'');if(options.kind==='sheet'){overlay.classList.add('luvia-living-sheet-overlay');options.content.classList.add('luvia-living-sheet')}overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label',options.label||'Dialog');overlay.append(options.content);document.body.append(overlay);const handle={id:'fixture-overlay',overlay,close(){overlay.remove();options.onClose?.()}};overlay.querySelectorAll(options.closeSelector||'[data-close]').forEach(button=>button.onclick=()=>handle.close());return handle}};
  window.LuviaApp={show:async()=>{const root=document.querySelector('main');root.innerHTML=window.LuviaJourneyDayComposer.renderTimeline(trip);window.LuviaJourneyDayComposer.bindTimeline(root)}};
})();`;

const html='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Luvia · Timeline verbinden</title><link rel="stylesheet" href="/composer.css"><style>:root{--lv-accent:#aa6189;--lv-on-accent:#fff;--trip-accent:#aa6189}body{margin:0;font:16px system-ui;background:#eef4f4}.fixture-overlay{position:fixed;inset:0;z-index:100;display:flex;justify-content:center;align-items:flex-end;background:#16364980;overflow:hidden}.fixture-overlay>.luvia-living-sheet{box-sizing:border-box;width:100%;max-height:calc(100dvh - 8px);overflow:auto;border:1px solid #dbe5e8;border-radius:26px 26px 0 0;background:linear-gradient(145deg,#fff,#f4faf9 64%,#fff5f2);box-shadow:0 -24px 80px #0e304033}.lvjt-photo{display:none!important}</style></head><body><main></main><script src="/domain.js"></script><script src="/resilience.js"></script><script src="/setup.js"></script><script src="/adapter.js"></script><script src="/composer.js"></script><script>window.LuviaApp.show()</script></body></html>';

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:!headed});
  try{
    const page=await browser.newPage({viewport:{width:477,height:900},hasTouch:true,isMobile:true,timezoneId:'Europe/Berlin'}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const assets=new Map([
      ['/',{contentType:'text/html',body:html}],
      ['/composer.css',{contentType:'text/css',body:read('app/journey/journey-day-composer.css')}],
      ['/domain.js',{contentType:'text/javascript',body:read('core/journey/journey-domain-contract-core.js')}],
      ['/resilience.js',{contentType:'text/javascript',body:read('core/journey/journey-resilience-core.js')}],
      ['/setup.js',{contentType:'text/javascript',body:setup}],
      ['/adapter.js',{contentType:'text/javascript',body:read('core/platform/journey-contract-adapter.js')}],
      ['/composer.js',{contentType:'text/javascript',body:read('app/journey/journey-day-composer.js')}]
    ]);
    await page.route('https://fixture.luvia.test/**',route=>{const pathname=new URL(route.request().url()).pathname,item=assets.get(pathname);if(item)return route.fulfill(item);if(/\.(?:svg|png|jpe?g|webp)$/i.test(pathname))return route.fulfill({contentType:'image/svg+xml',body:placeholderSvg});return route.abort()});
    await page.goto('https://fixture.luvia.test/');
    await page.getByRole('button',{name:'Timeline bearbeiten',exact:true}).click();
    const selectors=page.locator('[data-group-select]');assert.equal(await selectors.count(),2);
    await selectors.nth(0).click();await selectors.nth(1).click();
    await page.getByRole('button',{name:'Auswahl verbinden · 2',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Timeline-Momente verbinden und ordnen'});await dialog.waitFor();
    assert.match(await dialog.textContent(),/Grande Beach Café.*Museum für Regionalgeschichte/s);
    await dialog.getByRole('button',{name:'Nach unten',exact:true}).first().click();
    assert.match(await dialog.textContent(),/Nachher.*Museum für Regionalgeschichte.*Grande Beach Café/s);
    await page.screenshot({path:path.join(output,'reorder-review.png')});
    await dialog.getByRole('button',{name:'Verbinden und neu ordnen',exact:true}).click();
    await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)||'[]')[0]?.metadata?.timelineConnection,storeKey,{timeout:5000});
    let rows=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),storeKey);
    assert.equal(rows.find(row=>row.id==='entry-museum').startAt,'2027-06-12T10:00:00.000Z');
    assert.equal(rows.find(row=>row.id==='entry-cafe').startAt,'2027-06-12T14:00:00.000Z');
    assert.equal(await page.locator('.lvjt-connection-badge').count(),2);
    await page.screenshot({path:path.join(output,'connected-order.png'),fullPage:true});

    await page.reload();
    await page.getByRole('button',{name:'Reihenfolge zurücknehmen',exact:true}).waitFor();
    assert.equal(await page.locator('.lvjt-connection-badge').count(),2);
    await page.screenshot({path:path.join(output,'reload-recovery.png'),fullPage:true});
    await page.getByRole('button',{name:'Reihenfolge zurücknehmen',exact:true}).click();
    const restore=page.getByRole('dialog',{name:'Frühere Timeline-Reihenfolge wiederherstellen'});await restore.waitFor();
    await restore.getByRole('button',{name:'Frühere Reihenfolge wiederherstellen',exact:true}).click();
    await page.waitForFunction(key=>{const rows=JSON.parse(localStorage.getItem(key)||'[]');return rows.length>0&&rows.every(row=>!row.metadata.timelineConnectionRecovery)},storeKey,{timeout:5000});

    await page.reload();rows=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),storeKey);
    assert.equal(rows.find(row=>row.id==='entry-cafe').startAt,'2027-06-12T10:00:00.000Z');
    assert.equal(rows.find(row=>row.id==='entry-museum').startAt,'2027-06-12T14:00:00.000Z');
    assert.equal(await page.locator('.lvjt-connection-badge').count(),0);
    assert.equal(await page.getByRole('button',{name:'Reihenfolge zurücknehmen',exact:true}).count(),0);
    assert.deepEqual(errors,[]);
    await page.screenshot({path:path.join(output,'restored-order.png'),fullPage:true});
    fs.writeFileSync(path.join(output,'result.json'),JSON.stringify({pass:true,headed,viewport:'477x900',checks:['two Places selected','before/after review','confirmed reverse order','connection survives reload','restore survives reload','exact original times restored'],errors},null,2));
    console.log('P09 headed browser: connect, multi-reorder, reload recovery and exact restore PASS');
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
