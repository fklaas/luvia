'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const ROOT=path.resolve(__dirname,'..');
const BASE_URL=process.env.LUVIA_E2E_BASE_URL||'http://127.0.0.1:4173';
const FIXTURE=`${BASE_URL}/tests/fixtures/m16.5q-living-compass-recovery-browser.html?screen=plan`;
const BROWSER=process.env.LUVIA_E2E_BROWSER||chromium.executablePath();
const OUTPUT=path.join(ROOT,'test-results','m16.5q');
const center=box=>({x:box.x+box.width/2,y:box.y+box.height/2});

async function heading(page,text){await page.getByRole('heading',{level:1,name:text}).waitFor({state:'visible'});return text}
async function expectCompass(page,title){
  await heading(page,title);
  await page.locator('[data-plan-compass-stage]').waitFor({state:'visible'});
  await page.waitForFunction(()=>{
    const stage=document.querySelector('[data-plan-compass-stage]');
    return Boolean(stage?.classList.contains('is-ready')&&!stage.matches('.is-context-leaving,.is-context-entering,.is-context-seeking,.is-context-pulsing'));
  });
  assert.equal(await page.locator('.lv-plan-direction').count(),8,'every context must retain eight primary directions');
}
async function assertHitGeometry(page){
  const directions=page.locator('.lv-plan-direction');
  for(let index=0;index<await directions.count();index++){
    const direction=directions.nth(index),before=await direction.boundingBox();assert.ok(before,`direction ${index+1} has no hit box`);
    await direction.hover();await page.waitForTimeout(420);
    const after=await direction.boundingBox(),a=center(before),b=center(after);assert.ok(after);
    assert.ok(Math.abs(a.x-b.x)<=1.5&&Math.abs(a.y-b.y)<=1.5,`direction ${index+1} moved its hit center on hover: ${JSON.stringify({before,after})}`);
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
    await assertHitGeometry(desktop);await desktop.screenshot({path:path.join(OUTPUT,'desktop-plan.png'),fullPage:true});console.log('desktop hover geometry: PASS');

    await desktop.getByRole('button',{name:'Heute',exact:true}).first().click();
    await expectCompass(desktop,'Was braucht euer Tag gerade?');
    assert.equal(new URL(desktop.url()).searchParams.get('screen'),'plan','context switches must remain inside the committed Plan route');
    await desktop.waitForTimeout(700);await desktop.screenshot({path:path.join(OUTPUT,'desktop-today-context.png'),fullPage:true});console.log('desktop Today context: PASS');
    await desktop.getByRole('button',{name:'Reise',exact:true}).first().click();await expectCompass(desktop,'Wo möchtet ihr eure Reise öffnen?');
    await desktop.getByRole('button',{name:'Erinnern',exact:true}).first().click();await expectCompass(desktop,'Wie soll diese Reise weiterleben?');
    await desktop.getByRole('button',{name:'Profil',exact:true}).first().click();await expectCompass(desktop,'Was möchtest du für dich ausrichten?');
    await desktop.getByRole('button',{name:'Planen',exact:true}).first().click();await expectCompass(desktop,'Welche Richtung soll die Planung nehmen?');console.log('all five Compass contexts: PASS');

    const first=desktop.locator('.lv-plan-direction').first();await first.focus();await desktop.keyboard.press('ArrowRight');
    assert.equal(await desktop.locator(':focus').getAttribute('data-compass-label'),'Meine Orte','ArrowRight must move focus to the next Compass direction');
    await desktop.keyboard.press('ArrowLeft');assert.equal(await desktop.locator(':focus').getAttribute('data-compass-label'),'Places');
    await desktop.keyboard.press('Escape');await heading(desktop,'Heute');await desktop.locator('[data-plan-compass-stage]').waitFor({state:'detached'});assert.equal(await desktop.locator('[data-plan-compass-stage]').count(),0,'Escape must close to Today');console.log('desktop keyboard and Escape: PASS');

    await desktop.getByRole('button',{name:'Planen',exact:true}).first().click();await expectCompass(desktop,'Welche Richtung soll die Planung nehmen?');
    await desktop.getByRole('button',{name:/^Places:/}).click();await heading(desktop,'Places');
    assert.equal(new URL(desktop.url()).searchParams.get('screen'),'places','direction selection must reach the exact Places route');
    await desktop.screenshot({path:path.join(OUTPUT,'desktop-places-destination.png'),fullPage:true});
    await desktop.goBack();await expectCompass(desktop,'Welche Richtung soll die Planung nehmen?');assert.equal(await desktop.locator('[data-plan-compass-stage]').count(),1,'Back during a live transition must leave exactly one Compass stage');
    await desktop.reload({waitUntil:'networkidle'});await expectCompass(desktop,'Welche Richtung soll die Planung nehmen?');console.log('desktop exact route, Back and reload: PASS');

    const stalled=await browser.newPage({viewport:{width:1440,height:900}});stalled.setDefaultTimeout(3500);
    await stalled.addInitScript(()=>{const nativeAnimate=Element.prototype.animate;Element.prototype.animate=function(...args){if(this.classList?.contains('lv-plan-compass-flight'))return{finished:new Promise(()=>{}),cancel(){}};return nativeAnimate.apply(this,args)}});
    await stalled.goto(FIXTURE,{waitUntil:'networkidle'});await expectCompass(stalled,'Welche Richtung soll die Planung nehmen?');
    const stalledStart=Date.now();await stalled.getByRole('button',{name:/^Places:/}).click();await heading(stalled,'Places');
    assert.ok(Date.now()-stalledStart<2500,'a stalled decorative Compass flight must never gate destination routing');
    assert.equal(new URL(stalled.url()).searchParams.get('screen'),'places','stalled-flight selection must still reach Places');
    console.log('stalled decorative flight / deterministic destination routing: PASS');

    const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});reduced.setDefaultTimeout(8000);await reduced.goto(FIXTURE,{waitUntil:'networkidle'});await expectCompass(reduced,'Welche Richtung soll die Planung nehmen?');
    await reduced.getByRole('button',{name:'Heute',exact:true}).first().click();await expectCompass(reduced,'Was braucht euer Tag gerade?');await reduced.getByRole('button',{name:'Kompass schließen und zu Heute zurückkehren'}).click();await heading(reduced,'Heute');

    for(const viewport of [{width:390,height:844},{width:360,height:740},{width:320,height:673}]){
      const context=await browser.newContext({viewport,hasTouch:true,isMobile:true});const mobile=await context.newPage();mobile.setDefaultTimeout(8000);await mobile.goto(FIXTURE,{waitUntil:'networkidle'});await expectCompass(mobile,'Welche Richtung soll die Planung nehmen?');await mobile.waitForTimeout(1500);await assertInsideViewport(mobile);
      if(viewport.width===390){await mobile.screenshot({path:path.join(OUTPUT,'mobile-390-plan.png'),fullPage:true});await mobile.getByRole('button',{name:'Heute',exact:true}).first().tap();await expectCompass(mobile,'Was braucht euer Tag gerade?');await mobile.getByRole('button',{name:'Planen',exact:true}).first().tap();await mobile.getByRole('button',{name:/^Places:/}).tap();await heading(mobile,'Places')}
      await context.close();
    }
    console.log('M16.5Q Living Compass real browser E2E: PASS');
    console.log('Desktop pointer / hover geometry / keyboard / reload / browser Back: PASS');
    console.log('Mobile touch 390x844 / 360x740 / 320x673 and 44px targets: PASS');
    console.log('Reduced motion context switch / close-to-Today: PASS');
    console.log(`Evidence: ${OUTPUT}`);
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
