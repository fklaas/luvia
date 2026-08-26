'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');

const ROOT=path.resolve(__dirname,'..');
const EDGE=process.env.LUVIA_E2E_BROWSER||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT=path.join(ROOT,'test-results','m16.5r');

function startStaticServer(){
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
  const server=http.createServer((request,response)=>{
    const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
    const file=path.resolve(ROOT,`.${pathname}`);
    if(file!==ROOT&&!file.startsWith(`${ROOT}${path.sep}`)){response.writeHead(403);response.end('Forbidden');return}
    fs.readFile(file,(error,data)=>{
      if(error){response.writeHead(error.code==='ENOENT'?404:500);response.end(error.code||'Error');return}
      response.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
      response.end(data);
    });
  });
  return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>resolve(server))});
}

async function clickAtCenter(page,locator){
  const box=await locator.boundingBox();
  assert.ok(box,'real pointer target has no box');
  await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
}

(async()=>{
  fs.mkdirSync(OUTPUT,{recursive:true});
  const server=process.env.LUVIA_E2E_BASE_URL?null:await startStaticServer();
  const baseUrl=process.env.LUVIA_E2E_BASE_URL||`http://127.0.0.1:${server.address().port}`;
  const fixture=`${baseUrl}/tests/fixtures/m16.5r-places-continuity-browser.html`;
  const browser=await chromium.launch({headless:true,executablePath:EDGE});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const consoleProblems=[];
  page.on('console',message=>{if(['warning','error'].includes(message.type()))consoleProblems.push(`${message.type()}: ${message.text()}`)});
  page.on('pageerror',error=>consoleProblems.push(`pageerror: ${error.message}`));
  try{
    await page.goto(fixture,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>window.__placesFixture?.ready===true&&document.querySelectorAll('[data-place-card]').length===6&&window.__placesFixture.mapInstances===1);
    const rail=page.locator('.lv-places-spatial__result-list');
    const fourth=page.locator('[data-place-card="place-4"]');
    await fourth.scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
    const before=await rail.evaluate(node=>({left:node.scrollLeft,width:node.clientWidth,total:node.scrollWidth}));
    assert.ok(before.left>before.width,`fixture did not reach a later horizontal result: ${JSON.stringify(before)}`);

    const detailButton=fourth.locator('[data-places-detail="place-4"]');
    await clickAtCenter(page,detailButton);
    await page.waitForFunction(()=>document.querySelector('[data-places-detail-region="place-4"] .lv-places-spatial__detail:not([role="status"])'));
    const after=await page.evaluate(()=>{
      const rail=document.querySelector('.lv-places-spatial__result-list');
      const button=document.querySelector('[data-places-detail="place-4"]');
      const card=document.querySelector('[data-place-card="place-4"]');
      return{
        left:rail.scrollLeft,
        activeIsButton:document.activeElement===button,
        expanded:button.getAttribute('aria-expanded'),
        selected:card.getAttribute('aria-current'),
        detailText:card.querySelector('[data-places-detail-region="place-4"]').textContent,
        mapInstances:window.__placesFixture.mapInstances,
        mapRemovals:window.__placesFixture.mapRemovals,
        mapEaseCalls:window.__placesFixture.mapEaseCalls,
        detailRequests:window.__placesFixture.detailRequests
      };
    });
    assert.ok(Math.abs(after.left-before.left)<=2,`Details & Evidenz reset the horizontal rail: ${JSON.stringify({before,after})}`);
    assert.equal(after.activeIsButton,true,'detail completion replaced or lost the real pointer focus origin');
    assert.equal(after.expanded,'true');
    assert.equal(after.selected,'true','opening later-result evidence must select that same Place');
    assert.match(after.detailText,/Kontinuitätsort 4/);
    assert.deepEqual(after.detailRequests,['place-4']);
    assert.equal(after.mapInstances,1,'detail loading must not rebuild the map');
    assert.equal(after.mapRemovals,0,'detail loading must not destroy the active map');
    assert.deepEqual(after.mapEaseCalls.at(-1)?.center,[10.78,54.04],'selected Place and map viewport must stay synchronized');

    await page.screenshot({path:path.join(OUTPUT,'places-result-4-detail-continuity.png'),fullPage:true});
    await clickAtCenter(page,detailButton);
    const closed=await page.evaluate(()=>{const rail=document.querySelector('.lv-places-spatial__result-list'),button=document.querySelector('[data-places-detail="place-4"]');return{left:rail.scrollLeft,activeIsButton:document.activeElement===button,expanded:button.getAttribute('aria-expanded'),detail:document.querySelector('[data-places-detail-region="place-4"]').textContent}});
    assert.ok(Math.abs(closed.left-before.left)<=2,'closing evidence must preserve the exact horizontal result context');
    assert.equal(closed.activeIsButton,true);
    assert.equal(closed.expanded,'false');
    assert.equal(closed.detail,'');
    assert.deepEqual(consoleProblems,[],'real Edge continuity sequence emitted console problems');
    console.log('M16.5R Places Details/Evidence continuity real Edge E2E: PASS');
    console.log(`Rail scroll retained: ${before.left.toFixed(1)} -> ${after.left.toFixed(1)} -> ${closed.left.toFixed(1)}`);
    console.log('Selected Place / map / focus / async detail / close continuity: PASS');
  }finally{
    await browser.close();
    if(server)await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1});
