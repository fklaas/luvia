'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const ROOT=path.resolve(__dirname,'..');
const BASE_URL=process.env.LUVIA_E2E_BASE_URL||'http://127.0.0.1:4173';
const FIXTURE=`${BASE_URL}/tests/fixtures/m16.5q-living-compass-recovery-browser.html?screen=plan`;
const TODAY_FIXTURE=`${BASE_URL}/tests/fixtures/m16.5q-living-compass-recovery-browser.html?screen=today`;
const BROWSER=process.env.LUVIA_E2E_BROWSER||chromium.executablePath();
const OUTPUT=path.join(ROOT,'test-results','m16.5q');
const center=box=>({x:box.x+box.width/2,y:box.y+box.height/2});

async function heading(page,text){await page.getByRole('heading',{level:1,name:text}).waitFor({state:'visible'});return text}
async function expectCompass(page,title){
  await heading(page,title);
  const stage=page.locator('[data-stage] > .lv-view-host:not(.lv-route-previous) [data-plan-compass-stage]');
  await stage.waitFor({state:'visible'});
  await page.waitForFunction(()=>{
    const stage=document.querySelector('[data-stage] > .lv-view-host:not(.lv-route-previous) [data-plan-compass-stage]');
    return Boolean(stage?.classList.contains('is-ready')&&!stage.matches('.is-context-leaving,.is-context-entering,.is-context-seeking,.is-context-pulsing'));
  });
  assert.equal(await stage.locator('.lv-plan-direction').count(),8,'every context must retain eight primary directions');
}
async function assertIdleDynamics(page){
  const direction=page.locator('.lv-plan-direction').first(),idle=direction.locator('.lv-plan-direction-idle'),needle=page.locator('[data-plan-compass-stage] .lv-plan-compass-needle');
  const beforeBox=await direction.boundingBox();assert.ok(beforeBox,'idle direction has no physical hit box');
  const before=await page.evaluate(()=>{const idle=document.querySelector('.lv-plan-direction-idle'),needle=document.querySelector('[data-plan-compass-stage] .lv-plan-compass-needle');return{idleTransform:getComputedStyle(idle).transform,idleAnimation:getComputedStyle(idle).animationName,needleTransform:getComputedStyle(needle).transform,needleAnimation:getComputedStyle(needle).animationName}});
  await page.waitForTimeout(720);
  const afterBox=await direction.boundingBox(),after=await page.evaluate(()=>{const idle=document.querySelector('.lv-plan-direction-idle'),needle=document.querySelector('[data-plan-compass-stage] .lv-plan-compass-needle');return{idleTransform:getComputedStyle(idle).transform,needleTransform:getComputedStyle(needle).transform}});assert.ok(afterBox);
  assert.equal(before.idleAnimation,'lv-plan-direction-idle-drift','settled direction visuals must retain their subtle idle drift');assert.equal(before.needleAnimation,'lv-plan-needle-idle','the unselected Compass needle must retain its subtle idle pendulum');assert.notEqual(after.idleTransform,before.idleTransform,'the direction visual must move gently while idle');assert.notEqual(after.needleTransform,before.needleTransform,'the unselected needle must visibly pendulate');
  const a=center(beforeBox),b=center(afterBox);assert.ok(Math.abs(a.x-b.x)<=.25&&Math.abs(a.y-b.y)<=.25&&Math.abs(beforeBox.width-afterBox.width)<=.25&&Math.abs(beforeBox.height-afterBox.height)<=.25,'idle dynamics must not move or resize the physical direction hit target');
}
async function assertHitGeometry(page){
  const directions=page.locator('.lv-plan-direction');
  for(let index=0;index<await directions.count();index++){
    const direction=directions.nth(index),before=await direction.boundingBox();assert.ok(before,`direction ${index+1} has no hit box`);
    const surface=direction.locator('.lv-plan-direction-surface'),beforeTransform=await surface.evaluate(node=>getComputedStyle(node).transform);
    await direction.hover();await page.waitForTimeout(420);
    const after=await direction.boundingBox(),afterTransform=await surface.evaluate(node=>getComputedStyle(node).transform),a=center(before),b=center(after);assert.ok(after);
    assert.ok(Math.abs(a.x-b.x)<=1.5&&Math.abs(a.y-b.y)<=1.5&&Math.abs(before.width-after.width)<=.5&&Math.abs(before.height-after.height)<=.5,`direction ${index+1} changed its hit geometry on hover: ${JSON.stringify({before,after})}`);
    assert.notEqual(afterTransform,beforeTransform,`direction ${index+1} must visibly lift on hover while its outer hit geometry stays immutable`);
  }
}
async function assertInsideViewport(page){
  const viewport=page.viewportSize(),directions=page.locator('.lv-plan-direction');
  for(let index=0;index<await directions.count();index++){
    const box=await directions.nth(index).boundingBox();assert.ok(box,`mobile direction ${index+1} has no hit box`);
    assert.ok(box.width>=43.5&&box.height>=43.5,`mobile direction ${index+1} is smaller than the 44 px touch target: ${JSON.stringify(box)}`);
    assert.ok(box.x>=-1&&box.y>=-1&&box.x+box.width<=viewport.width+1&&box.y+box.height<=viewport.height+1,`mobile direction ${index+1} is clipped: ${JSON.stringify({box,viewport})}`);
  }
}

(async()=>{
  if(!BROWSER||!fs.existsSync(BROWSER))throw new Error(`LUVIA_E2E_BROWSER not found: ${BROWSER}`);
  fs.mkdirSync(OUTPUT,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:BROWSER});
  try{
    const desktop=await browser.newPage({viewport:{width:1440,height:900}});
    desktop.setDefaultTimeout(8000);
    await desktop.goto(FIXTURE,{waitUntil:'networkidle'});await expectCompass(desktop,'Welche Richtung soll die Planung nehmen?');
    const documentToken=await desktop.evaluate(()=>window.__m165rDocumentToken||(window.__m165rDocumentToken=`document-${Date.now()}-${Math.random()}`));
    await assertIdleDynamics(desktop);await assertHitGeometry(desktop);await desktop.screenshot({path:path.join(OUTPUT,'desktop-plan.png'),fullPage:true});console.log('desktop idle dynamics and hover geometry: PASS');

    await desktop.getByRole('button',{name:'Heute',exact:true}).first().click();
    const leavingStage=desktop.locator('[data-plan-compass-stage].is-context-leaving');await leavingStage.waitFor({state:'attached'});await desktop.waitForFunction(()=>{const stage=document.querySelector('[data-plan-compass-stage].is-context-leaving'),motions=[...(stage?.querySelectorAll('.lv-plan-direction-motion')||[])].map(node=>Number(getComputedStyle(node).opacity));return motions.length===8&&motions[0]>motions.at(-1)+.2});
    const leavingSequence=await leavingStage.evaluate(stage=>{const motions=[...stage.querySelectorAll('.lv-plan-direction-motion')].map(node=>Number(getComputedStyle(node).opacity)),brand=getComputedStyle(document.querySelector('.lv-living-brand-compass'));return{motions,needleMotion:stage.dataset.compassNeedleMotion,brandOpacity:Number(brand.opacity),detached:stage.closest('.lv-living-shell')?.classList.contains('is-plan-compass-detached')}});
    assert.ok(leavingSequence.motions[0]>leavingSequence.motions.at(-1)+.2,'old context points must retract in reverse radial order');assert.equal(leavingSequence.needleMotion,'context','the needle must run its bounded irregular context-search motion');assert.ok(leavingSequence.brandOpacity<.08&&leavingSequence.detached,'the top-left source Compass must stay hidden throughout a context switch');
    const enteringStage=desktop.locator('[data-plan-compass-stage].is-context-entering');await enteringStage.waitFor({state:'attached'});await desktop.waitForFunction(()=>{const stage=document.querySelector('[data-plan-compass-stage].is-context-entering'),motions=[...(stage?.querySelectorAll('.lv-plan-direction-motion')||[])].map(node=>Number(getComputedStyle(node).opacity));return motions.length===8&&motions[0]>motions.at(-1)+.18});const enteringSequence=await enteringStage.locator('.lv-plan-direction-motion').evaluateAll(nodes=>nodes.map(node=>Number(getComputedStyle(node).opacity)));assert.ok(enteringSequence[0]>enteringSequence.at(-1)+.18,'new context points must enter in forward radial order after the old points have left');
    await expectCompass(desktop,'Was braucht euer Tag gerade?');
    assert.equal(new URL(desktop.url()).searchParams.get('screen'),'plan','context switches must remain inside the committed Plan route');
    assert.equal(await desktop.evaluate(()=>window.__m165rDocumentToken),documentToken,'context switching must not replace the browser document');assert.equal(await desktop.evaluate(()=>performance.getEntriesByType('navigation').length),1,'context switching must not create a document reload');
    await desktop.waitForTimeout(700);await desktop.screenshot({path:path.join(OUTPUT,'desktop-today-context.png'),fullPage:true});console.log('desktop Today context: PASS');
    await desktop.getByRole('button',{name:'Reise',exact:true}).first().click();await expectCompass(desktop,'Wo möchtet ihr eure Reise öffnen?');
    await desktop.getByRole('button',{name:'Erinnern',exact:true}).first().click();await expectCompass(desktop,'Wie soll diese Reise weiterleben?');
    await desktop.getByRole('button',{name:'Profil',exact:true}).first().click();await expectCompass(desktop,'Was möchtest du für dich ausrichten?');
    await desktop.getByRole('button',{name:'Planen',exact:true}).first().click();await expectCompass(desktop,'Welche Richtung soll die Planung nehmen?');console.log('all five Compass contexts: PASS');

    const first=desktop.locator('.lv-plan-direction').first();await first.focus();await desktop.keyboard.press('ArrowRight');
    assert.equal(await desktop.locator(':focus').getAttribute('data-compass-label'),'Meine Orte','ArrowRight must move focus to the next Compass direction');
    await desktop.keyboard.press('ArrowLeft');assert.equal(await desktop.locator(':focus').getAttribute('data-compass-label'),'Places');
    await desktop.keyboard.press('Escape');await heading(desktop,'Heute');await desktop.locator('[data-plan-compass-stage]').waitFor({state:'detached'});assert.equal(await desktop.locator('[data-plan-compass-stage]').count(),0,'Escape must close to Today');console.log('desktop keyboard and Escape: PASS');

    await desktop.getByRole('button',{name:'Reise',exact:true}).first().click();await expectCompass(desktop,'Wo möchtet ihr eure Reise öffnen?');assert.equal(new URL(desktop.url()).searchParams.get('screen'),'today','a direct Trip context click must preserve the committed feature route');
    await desktop.getByRole('button',{name:'Kompass schließen und zu Heute zurückkehren'}).click();await heading(desktop,'Heute');
    await desktop.getByRole('button',{name:'Erinnern',exact:true}).first().click();await expectCompass(desktop,'Wie soll diese Reise weiterleben?');
    await desktop.getByRole('button',{name:'Kompass schließen und zu Heute zurückkehren'}).click();await heading(desktop,'Heute');
    await desktop.getByRole('button',{name:'Profil öffnen',exact:true}).click();await expectCompass(desktop,'Was möchtest du für dich ausrichten?');assert.equal(await desktop.locator('.lv-e2e-dialog').count(),0,'the header avatar must open the Profile Compass instead of the legacy Profile overlay');
    await desktop.getByRole('button',{name:'Kompass schließen und zu Heute zurückkehren'}).click();await heading(desktop,'Heute');
    await desktop.getByRole('button',{name:/Fabian Profil & Reisekompass/}).click();await expectCompass(desktop,'Was möchtest du für dich ausrichten?');assert.equal(await desktop.locator('.lv-e2e-dialog').count(),0,'the lower profile card must open the same Profile Compass');
    await desktop.getByRole('button',{name:'Planen',exact:true}).first().click();await expectCompass(desktop,'Welche Richtung soll die Planung nehmen?');console.log('direct Today/Plan/Trip/Memories/Profile context entry: PASS');

    const routeDesktop=await browser.newPage({viewport:{width:1440,height:900}});routeDesktop.setDefaultTimeout(8000);await routeDesktop.goto(FIXTURE,{waitUntil:'networkidle'});await expectCompass(routeDesktop,'Welche Richtung soll die Planung nehmen?');
    await routeDesktop.getByRole('button',{name:/^Places:/}).click();await routeDesktop.locator('.lv-route-previous[aria-hidden="true"]').waitFor({state:'attached'});assert.equal(await routeDesktop.locator('.lv-route-previous[aria-hidden="true"] :focus').count(),0,'an outgoing route host must never retain focused descendants while aria-hidden');assert.equal(await routeDesktop.locator('.lv-route-previous').getAttribute('inert'),'','the outgoing route host must be inert during transition');await heading(routeDesktop,'Places');
    assert.equal(new URL(routeDesktop.url()).searchParams.get('screen'),'places','direction selection must reach the exact Places route');
    await routeDesktop.screenshot({path:path.join(OUTPUT,'desktop-places-destination.png'),fullPage:true});
    await routeDesktop.getByRole('button',{name:'Erinnern',exact:true}).first().click();await expectCompass(routeDesktop,'Wie soll diese Reise weiterleben?');assert.equal(new URL(routeDesktop.url()).searchParams.get('screen'),'places','a direct context switch from Places must preserve the committed Places route');
    await routeDesktop.getByRole('button',{name:'Planen',exact:true}).first().click();await expectCompass(routeDesktop,'Welche Richtung soll die Planung nehmen?');
    await routeDesktop.goBack();await expectCompass(routeDesktop,'Welche Richtung soll die Planung nehmen?');await routeDesktop.waitForFunction(()=>document.querySelectorAll('[data-plan-compass-stage]').length===1);assert.equal(await routeDesktop.locator('[data-plan-compass-stage]').count(),1,'Back during a live transition must settle to exactly one Compass stage');
    await routeDesktop.reload({waitUntil:'networkidle'});await expectCompass(routeDesktop,'Welche Richtung soll die Planung nehmen?');await routeDesktop.close();console.log('desktop exact route, Back and reload: PASS');

    const stalled=await browser.newPage({viewport:{width:1440,height:900}});stalled.setDefaultTimeout(3500);
    await stalled.addInitScript(()=>{const nativeAnimate=Element.prototype.animate;Element.prototype.animate=function(...args){if(this.classList?.contains('lv-plan-compass-flight'))return{finished:new Promise(()=>{}),cancel(){}};return nativeAnimate.apply(this,args)}});
    await stalled.goto(FIXTURE,{waitUntil:'networkidle'});await expectCompass(stalled,'Welche Richtung soll die Planung nehmen?');
    const stalledStart=Date.now();await stalled.getByRole('button',{name:/^Places:/}).click();await heading(stalled,'Places');
    assert.ok(Date.now()-stalledStart<2500,'a stalled decorative Compass flight must never gate destination routing');
    assert.equal(new URL(stalled.url()).searchParams.get('screen'),'places','stalled-flight selection must still reach Places');
    console.log('stalled decorative flight / deterministic destination routing: PASS');

    const motion=await browser.newPage({viewport:{width:1440,height:900}});motion.setDefaultTimeout(8000);await motion.goto(TODAY_FIXTURE,{waitUntil:'networkidle'});await heading(motion,'Heute');
    await motion.getByRole('button',{name:'Planen',exact:true}).first().click();const motionStage=motion.locator('[data-plan-compass-stage]');await motionStage.waitFor({state:'attached'});await motion.locator('.lv-plan-compass-flight').waitFor({state:'attached'});
    const beforeCarrier=await motion.evaluate(()=>{const stage=document.querySelector('[data-plan-compass-stage]'),core=stage.querySelector('.lv-plan-compass-core'),mark=stage.querySelector('.lv-plan-compass-mark'),coreOpacity=Number(getComputedStyle(core).opacity),markOpacity=Number(getComputedStyle(mark).opacity);return{arriving:stage.classList.contains('is-compass-arriving'),core:coreOpacity,effectiveMark:coreOpacity*markOpacity}});assert.equal(beforeCarrier.arriving,false,'the carrier must not start before the Compass reaches its final flight phase');assert.ok(beforeCarrier.core<.08&&beforeCarrier.effectiveMark<.08,'white carrier and target mark must both stay visually absent during the initial flight');
    await motionStage.locator('xpath=self::*[contains(@class,"is-compass-arriving")]').waitFor({state:'attached'});const arrivalStart=await motion.evaluate(()=>{const stage=document.querySelector('[data-plan-compass-stage]'),core=stage.querySelector('.lv-plan-compass-core'),mark=stage.querySelector('.lv-plan-compass-mark'),coreOpacity=Number(getComputedStyle(core).opacity),markOpacity=Number(getComputedStyle(mark).opacity);return{flight:document.querySelectorAll('.lv-plan-compass-flight').length,core:coreOpacity,effectiveMark:coreOpacity*markOpacity}});assert.equal(arrivalStart.flight,1,'the source Compass must still be present when carrier and target start their shared handoff');assert.ok(arrivalStart.core<.35&&arrivalStart.effectiveMark<.35,'carrier and target must fade in together instead of exposing a finished white disc first');
    await motion.waitForTimeout(140);const sharedHandoff=await motion.evaluate(()=>{const stage=document.querySelector('[data-plan-compass-stage]'),core=stage.querySelector('.lv-plan-compass-core'),mark=stage.querySelector('.lv-plan-compass-mark'),coreOpacity=Number(getComputedStyle(core).opacity),markOpacity=Number(getComputedStyle(mark).opacity);return{core:coreOpacity,effectiveMark:coreOpacity*markOpacity}});assert.ok(sharedHandoff.core>0&&sharedHandoff.effectiveMark>0,'carrier and Compass target must materialize in the same handoff phase');assert.ok(Math.abs(sharedHandoff.core-sharedHandoff.effectiveMark)<.08,'carrier and Compass target opacity must remain visually coupled through one shared parent');
    await motionStage.locator('xpath=self::*[contains(@class,"is-ready")]').waitFor({state:'attached'});const settledCenter=await motion.evaluate(()=>{const stage=document.querySelector('[data-plan-compass-stage]'),core=stage.querySelector('.lv-plan-compass-core'),mark=stage.querySelector('.lv-plan-compass-mark'),coreOpacity=Number(getComputedStyle(core).opacity),markOpacity=Number(getComputedStyle(mark).opacity);return{core:coreOpacity,effectiveMark:coreOpacity*markOpacity}});assert.ok(settledCenter.core>.78&&settledCenter.effectiveMark>.72,'the center must be substantially materialized before copy and directions begin');
    await motion.waitForFunction(()=>{const motions=[...document.querySelectorAll('[data-plan-compass-stage] .lv-plan-direction-motion')].map(node=>Number(getComputedStyle(node).opacity));return motions.length===8&&motions[0]>motions.at(-1)+.25});const stagger=await motion.locator('.lv-plan-direction-motion').evaluateAll(nodes=>nodes.map(node=>Number(getComputedStyle(node).opacity)));assert.ok(stagger[0]>stagger.at(-1)+.25,'direction points must pop in with the accepted radial stagger rather than appear as one block');await motion.screenshot({path:path.join(OUTPUT,'desktop-entry-shared-handoff.png'),fullPage:true});await expectCompass(motion,'Welche Richtung soll die Planung nehmen?');
    const motionPlaces=motion.getByRole('button',{name:/^Places:/}),motionBox=await motionPlaces.boundingBox(),motionBackground=await motionPlaces.locator('.lv-plan-direction-surface').evaluate(node=>getComputedStyle(node).backgroundColor);assert.ok(motionBox,'Places must expose a stable physical selection rectangle');const motionPoint=center(motionBox);await motion.mouse.move(motionPoint.x,motionPoint.y);await motion.mouse.down();await motion.waitForTimeout(42);await motion.mouse.up();await motionPlaces.waitFor({state:'visible'});await motion.waitForTimeout(300);
    const selectedFeedback=await motion.evaluate(()=>{const stage=document.querySelector('[data-plan-compass-stage]'),selected=stage.querySelector('.lv-plan-direction.is-selected'),other=[...stage.querySelectorAll('.lv-plan-direction:not(.is-selected)')][0];return{angle:stage.style.getPropertyValue('--lv-plan-selection-angle'),selectedBackground:getComputedStyle(selected.querySelector('.lv-plan-direction-surface')).backgroundColor,otherOpacity:Number(getComputedStyle(other).opacity),flight:document.querySelectorAll('.lv-plan-compass-flight').length}});const selectedBox=await motionPlaces.boundingBox();assert.deepEqual(selectedBox,motionBox,'the chosen point must stay in its accepted orbit position');assert.equal(selectedFeedback.angle,'-90deg','the native two-ended needle must take the direct signed angle to the chosen point');assert.notEqual(selectedFeedback.selectedBackground,motionBackground,'the chosen point must receive the accepted coral underlay');assert.ok(selectedFeedback.otherOpacity<.7,'unchosen directions must recede while the selected point remains');assert.equal(selectedFeedback.flight,0,'the selected point must remain calmly visible before the return flight starts');
    await motion.locator('.lv-plan-compass-flight').waitFor({state:'attached'});const returnFlight=await motion.locator('.lv-plan-compass-flight').evaluate(node=>({angle:getComputedStyle(node).getPropertyValue('--lv-plan-selection-angle').trim(),needleAnimation:getComputedStyle(node.querySelector('.lv-plan-compass-needle')).animationName}));assert.equal(returnFlight.angle,'-90deg','the return flight must preserve the directly selected needle angle');assert.equal(returnFlight.needleAnimation,'none','the return flight needle must never run a searching or looping animation');const returnCarrierStart=await motion.evaluate(()=>Number(getComputedStyle(document.querySelector('[data-plan-compass-stage] .lv-plan-compass-core')).opacity));await motion.waitForTimeout(180);const returnCarrierMid=await motion.evaluate(()=>{const core=document.querySelector('[data-plan-compass-stage] .lv-plan-compass-core'),mark=core?.querySelector('.lv-plan-compass-mark'),coreOpacity=core?Number(getComputedStyle(core).opacity):0,markOpacity=mark?Number(getComputedStyle(mark).opacity):1;return{core:coreOpacity,effectiveMark:coreOpacity*markOpacity}});assert.ok(returnCarrierMid.core<returnCarrierStart-.18,'the white carrier must recede as soon as the Compass return flight begins');assert.ok(Math.abs(returnCarrierMid.core-returnCarrierMid.effectiveMark)<.08,'carrier and source mark must leave as one coupled visual');await motion.waitForTimeout(180);const returnCarrierEnd=await motion.evaluate(()=>{const core=document.querySelector('.lv-route-previous .lv-plan-compass-core,[data-plan-compass-stage] .lv-plan-compass-core');return core?Number(getComputedStyle(core).opacity):0});assert.ok(returnCarrierEnd<.08,'no white carrier may remain after the center Compass has departed');await heading(motion,'Places');await motion.close();console.log('reference-timed carrier/mark handoff, radial pop, coral selection, direct selection needle and coupled reverse exit: PASS');

    const movingPress=await browser.newPage({viewport:{width:1440,height:900}});movingPress.setDefaultTimeout(8000);await movingPress.goto(FIXTURE,{waitUntil:'networkidle'});await heading(movingPress,'Welche Richtung soll die Planung nehmen?');await movingPress.locator('[data-plan-compass-stage].is-compass-arriving').waitFor({state:'visible'});
    const movingButton=movingPress.getByRole('button',{name:/^Places:/}),movingBox=await movingButton.boundingBox();assert.ok(movingBox,'the visible pre-settlement Places direction must expose a physical target');const movingPoint=center(movingBox);await movingPress.mouse.move(movingPoint.x,movingPoint.y);await movingPress.mouse.down();await movingPress.evaluate(()=>{const button=document.querySelector('[data-plan-compass-stage] [data-hub-action="places"]');button.style.transform='translateX(96px)'});await movingPress.mouse.up();await heading(movingPress,'Places');assert.equal(new URL(movingPress.url()).searchParams.get('screen'),'places','the direction latched at pointerdown must route exactly once even if animation moves it before pointerup');await movingPress.close();console.log('visible pre-ready press / moving target pointer ownership: PASS');

    const directions=[['Places','Places','places'],['Meine Orte','Meine Orte','places-lifecycle'],['Timeline','Heute','today'],['Booking','Buchungen','bookings'],['Checklisten','Checklisten','plan'],['Budget','Budget','plan'],['Routen','Route in Google Maps öffnen.','routes'],['Wetter','Wetterkontext','plan']];
    for(const [label,target,screen] of directions){
      const pointer=await browser.newPage({viewport:{width:1920,height:1020}});pointer.setDefaultTimeout(8000);await pointer.goto(FIXTURE,{waitUntil:'networkidle'});await expectCompass(pointer,'Welche Richtung soll die Planung nehmen?');await pointer.waitForTimeout(1600);
      const button=pointer.getByRole('button',{name:new RegExp(`^${label}:`)}),box=await button.boundingBox();assert.ok(box,`${label} pointer target missing`);const point=center(box);await pointer.mouse.move(point.x,point.y);await pointer.waitForTimeout(120);const hovered=await button.boundingBox();assert.deepEqual(hovered,box,`${label} must remain stationary under a physical pointer`);const hit=await pointer.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest?.('[data-hub-action]')?.dataset?.compassLabel||null,point);assert.equal(hit,label,`${label} must own its visible hit center`);await pointer.mouse.down();await pointer.waitForTimeout(45);await pointer.mouse.up();await heading(pointer,target);assert.equal(new URL(pointer.url()).searchParams.get('screen'),screen,`${label} must reach its exact screen`);await pointer.close();
    }
    console.log('1920x1020 physical pointer routing through all eight Plan directions: PASS');

    const superseded=await browser.newPage({viewport:{width:1440,height:900}});superseded.setDefaultTimeout(8000);await superseded.goto(FIXTURE,{waitUntil:'networkidle'});await expectCompass(superseded,'Welche Richtung soll die Planung nehmen?');
    await superseded.evaluate(()=>{window.__m165qPlacesMountDelay=1600});await superseded.getByRole('button',{name:/^Places:/}).click();await superseded.waitForTimeout(240);await superseded.getByRole('button',{name:'Planen',exact:true}).first().click();await superseded.waitForTimeout(120);await superseded.evaluate(()=>window.dispatchEvent(new CustomEvent('luvia:navigate-request',{detail:{view:'routes',source:'m16.5q-newer-route'}})));
    await heading(superseded,'Route in Google Maps öffnen.');await superseded.waitForTimeout(1900);assert.equal(await superseded.getByRole('heading',{level:1,name:'Route in Google Maps öffnen.'}).count(),1,'an older delayed Compass route must never replay over a newer navigation intent');assert.equal(await superseded.locator('[data-plan-compass-stage]').count(),0,'a superseded queued Plan context must not replace the newer route');assert.equal(new URL(superseded.url()).searchParams.get('screen'),'routes','the newest route intent must remain committed after a delayed Places mount');await superseded.close();console.log('slow Places mount / newer navigation intent ordering: PASS');

    const earlyBack=await browser.newPage({viewport:{width:1440,height:900}});earlyBack.setDefaultTimeout(8000);await earlyBack.goto(FIXTURE,{waitUntil:'networkidle'});await expectCompass(earlyBack,'Welche Richtung soll die Planung nehmen?');await earlyBack.evaluate(()=>{window.__m165qPlacesMountDelay=1600});await earlyBack.getByRole('button',{name:/^Places:/}).click();await earlyBack.waitForFunction(()=>new URL(location.href).searchParams.get('screen')==='places');await earlyBack.goBack();await expectCompass(earlyBack,'Welche Richtung soll die Planung nehmen?');await earlyBack.waitForTimeout(1900);assert.equal(await earlyBack.getByRole('heading',{level:1,name:'Welche Richtung soll die Planung nehmen?'}).count(),1,'the first Back gesture must remain authoritative after a delayed Places mount settles');assert.equal(new URL(earlyBack.url()).searchParams.get('screen'),'plan','history must be committed before the asynchronous Places mount so the first Back gesture can restore Plan');await earlyBack.close();console.log('slow Places mount / first Browser Back ordering: PASS');

    const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});reduced.setDefaultTimeout(8000);await reduced.goto(FIXTURE,{waitUntil:'networkidle'});await expectCompass(reduced,'Welche Richtung soll die Planung nehmen?');
    const reducedAnimations=await reduced.evaluate(()=>({idle:getComputedStyle(document.querySelector('.lv-plan-direction-idle')).animationName,needle:getComputedStyle(document.querySelector('[data-plan-compass-stage] .lv-plan-compass-needle')).animationName}));assert.deepEqual(reducedAnimations,{idle:'none',needle:'none'},'reduced motion must disable idle direction drift and needle pendulum');
    await reduced.getByRole('button',{name:'Heute',exact:true}).first().click();await expectCompass(reduced,'Was braucht euer Tag gerade?');await reduced.getByRole('button',{name:'Kompass schließen und zu Heute zurückkehren'}).click();await heading(reduced,'Heute');

    for(const viewport of [{width:390,height:844},{width:360,height:740},{width:320,height:673}]){
      const context=await browser.newContext({viewport,hasTouch:true,isMobile:true});const mobile=await context.newPage();mobile.setDefaultTimeout(8000);await mobile.goto(FIXTURE,{waitUntil:'networkidle'});await expectCompass(mobile,'Welche Richtung soll die Planung nehmen?');await mobile.waitForTimeout(1500);await assertInsideViewport(mobile);
      if(viewport.width===390){await mobile.screenshot({path:path.join(OUTPUT,'mobile-390-plan.png'),fullPage:true});await mobile.getByRole('button',{name:'Kompass schließen und zu Heute zurückkehren'}).tap();await heading(mobile,'Heute');await mobile.getByRole('button',{name:'Reise',exact:true}).first().tap();await expectCompass(mobile,'Wo möchtet ihr eure Reise öffnen?');await mobile.getByRole('button',{name:'Planen',exact:true}).first().tap();await expectCompass(mobile,'Welche Richtung soll die Planung nehmen?');await mobile.getByRole('button',{name:/^Places:/}).tap();await heading(mobile,'Places')}
      await context.close();
    }
    console.log('M16.5Q Living Compass real browser E2E: PASS');
    console.log('Desktop pointer / hover geometry / keyboard / reload / browser Back: PASS');
    console.log('Mobile touch 390x844 / 360x740 / 320x673 and 44px targets: PASS');
    console.log('Reduced motion context switch / close-to-Today: PASS');
    console.log(`Evidence: ${OUTPUT}`);
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
