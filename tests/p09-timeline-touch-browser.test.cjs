'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const output=process.env.LUVIA_TEST_OUTPUT||path.resolve('test-results/p09');
const headed=process.env.LUVIA_HEADED==='1';
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:!headed});
 try{
 const page=await browser.newPage({viewport:{width:477,height:900},hasTouch:true,isMobile:true,timezoneId:'Europe/Berlin'}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',route=>route.request().url()==='https://fixture.luvia.test/'?route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="de"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Luvia · sichtbarer Timeline-Gestentest</title></head><body><main></main></body></html>'}):route.abort());
 await page.goto('https://fixture.luvia.test/');
 await page.addStyleTag({content:':root{--lv-accent:#aa6189;--lv-on-accent:#fff}body{margin:0;font:16px system-ui}button,input{font:inherit}.fixture-overlay{position:fixed;inset:0;z-index:10;display:flex;justify-content:center;align-items:flex-end;background:#16364980;overflow:auto}.lvjt-photo{display:none!important}'});
 await page.addStyleTag({content:fs.readFileSync('app/journey/journey-day-composer.css','utf8')});
 await page.evaluate(()=>{
  const trip={id:'trip-1',title:'Gestentest',destination:{name:'Scharbeutz'},startDate:'2027-06-12',endDate:'2027-06-13'};
  window.__testWrites=[];window.__testEntries=[{id:'entry-1',source:'place-data',dataKey:'planned_at',sourceRevision:'rev-1',tripId:trip.id,tripPlaceId:'link-1',placeId:'place-1',title:'Testcafé',entityType:'restaurant',startAt:'2027-06-12T10:00:00.000Z',durationMinutes:60,metadata:{durationMinutes:60}},{id:'entry-2',source:'place-data',dataKey:'planned_at',sourceRevision:'rev-2',tripId:trip.id,tripPlaceId:'link-2',placeId:'place-2',title:'Testmuseum',entityType:'attraction',startAt:'2027-06-12T14:00:00.000Z',durationMinutes:60,metadata:{durationMinutes:60}}];
  window.LuviaTripContractV1={getActiveTrip:()=>trip};window.LuviaTimelineCore={snapshot:()=>({entries:window.__testEntries}),hydrate:async()=>({entries:window.__testEntries}),subscribe:()=>()=>{}};
  window.LuviaBookingContractV1={reads:{listForTrip:async()=>[]}};
  window.LuviaPlacesContractV1={commands:{plan:async input=>{window.__testWrites.push(input);const entry=window.__testEntries.find(e=>e.tripPlaceId===input.tripPlaceId);Object.assign(entry,{startAt:input.fields.planned_at,durationMinutes:input.fields.metadata.durationMinutes,metadata:input.fields.metadata,sourceRevision:'rev-'+Date.now()})}}};
  window.LuviaUI={mount(options){const overlay=document.createElement('div');overlay.className='fixture-overlay '+options.className;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label',options.label);overlay.append(options.content);document.body.append(overlay);const handle={id:'test-overlay',overlay,close(){overlay.remove();options.onClose?.()}};overlay.querySelectorAll(options.closeSelector).forEach(button=>button.onclick=()=>handle.close());return handle}};
  window.LuviaApp={show(){const root=document.querySelector('main');root.innerHTML=LuviaJourneyDayComposer.renderTimeline(trip);LuviaJourneyDayComposer.bindTimeline(root)}};
 });
 for(const file of ['core/journey/journey-domain-contract-core.js','core/journey/journey-resilience-core.js','core/platform/journey-contract-adapter.js','app/journey/journey-day-composer.js'])await page.addScriptTag({content:fs.readFileSync(file,'utf8')});
 await page.evaluate(()=>LuviaApp.show());
 const cdp=await page.context().newCDPSession(page),card=page.locator('[data-entry-id="entry-1"]'),title=card.locator('h3');
 const point=async locator=>{await locator.scrollIntoViewIfNeeded();const b=await locator.boundingBox();return{x:b.x+b.width/2,y:b.y+b.height/2}};
 const touch=async(type,p)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:p?[{...p,id:1}]:[]});
 let p=await point(title);await touch('touchStart',p);await page.waitForTimeout(560);await touch('touchEnd');
 await page.getByRole('button',{name:'Fertig',exact:true}).waitFor();assert.equal(await page.evaluate(()=>__testWrites.length),0);
 await page.screenshot({path:path.join(output,'long-press.png')});
 // In edit mode, drag to an existing free interval. Release opens review, never writes.
 p=await point(title);await touch('touchStart',p);
 const target=await page.evaluate(()=>{const card=document.querySelector('[data-entry-id="entry-1"]'),gap=card.nextElementSibling;const r=gap.getBoundingClientRect();return{x:r.left+r.width*.7,y:Math.min(innerHeight-50,r.top+30)}});
 for(let step=1;step<=5;step++)await touch('touchMove',{x:p.x+(target.x-p.x)*step/5,y:p.y+(target.y-p.y)*step/5});
 await touch('touchEnd');
 await page.getByRole('dialog',{name:'Zeitänderung prüfen'}).waitFor({timeout:5000});assert.equal(await page.evaluate(()=>__testWrites.length),0);
 await page.screenshot({path:path.join(output,'drag-review.png')});await page.getByRole('button',{name:'Abbrechen',exact:true}).click();
 await page.getByRole('button',{name:'Fertig',exact:true}).click();
 // Moving before the hold deadline is ordinary scrolling and must not enter edit mode.
 p=await point(title);await touch('touchStart',p);await touch('touchMove',{x:p.x,y:p.y-100});await touch('touchEnd');await page.waitForTimeout(560);
 assert.equal(await page.locator('.is-editing').count(),0);assert.equal(await page.evaluate(()=>__testWrites.length),0);
 // Cancelled long press remains write-free.
 p=await point(title);await touch('touchStart',p);await page.waitForTimeout(560);await touch('touchCancel');assert.equal(await page.getByRole('dialog').count(),0);
 await page.getByRole('button',{name:'15 Minuten später',exact:true}).first().click();await page.getByRole('button',{name:'Änderung bestätigen',exact:true}).click();
 await page.getByRole('button',{name:'Letzte Zeitänderung zurücknehmen',exact:true}).waitFor({timeout:5000});assert.equal(await page.evaluate(()=>__testWrites.length),1);
 await page.getByRole('button',{name:'Letzte Zeitänderung zurücknehmen',exact:true}).click();await page.getByRole('button',{name:'Rücknahme bestätigen',exact:true}).click();
 await page.waitForFunction(()=>__testWrites.length===2);assert.equal(await page.evaluate(()=>__testEntries[0].startAt),'2027-06-12T10:00:00.000Z');assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(output,'result.json'),JSON.stringify({pass:true,headed,viewport:'477x900',touchInput:'Chromium touch emulation, not physical iOS',checks:['long press enters mode','drag opens review without write','normal scroll does not enter mode','touch cancel does not write','explicit commit','visible durable undo'],errors},null,2));
 console.log('P09 headed/touch browser: long press, drag preview, scroll, cancel, commit and undo PASS');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
