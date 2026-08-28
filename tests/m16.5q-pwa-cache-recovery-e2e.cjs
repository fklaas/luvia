'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');

const BASE_URL=process.env.LUVIA_E2E_BASE_URL||'http://127.0.0.1:4174';
const BROWSER=process.env.LUVIA_E2E_BROWSER||chromium.executablePath();

(async()=>{
  if(!BROWSER||!fs.existsSync(BROWSER))throw new Error(`LUVIA_E2E_BROWSER not found: ${BROWSER}`);
  const browser=await chromium.launch({headless:true,executablePath:BROWSER});
  const context=await browser.newContext({serviceWorkers:'allow'});
  const page=await context.newPage();page.setDefaultTimeout(30000);
  try{
    await page.goto(`${BASE_URL}/?qa=m16.5q-pwa`,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>window.LuviaKernelVersion?.build==='13.82.104'&&Boolean(window.LuviaPWA));
    await page.evaluate(()=>window.LuviaPWA.register());
    await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.LuviaKernelVersion?.build==='13.82.104'&&Boolean(navigator.serviceWorker.controller));

    const documentToken=await page.evaluate(()=>window.__m165qPwaDocumentToken=`pwa-${Date.now()}-${Math.random()}`);
    await page.evaluate(async()=>{
      const stale=await caches.open('luvia-shell-v13.17.0');
      await stale.put(new Request(new URL('stale-cache-probe',location.href)),new Response('stale'));
      await window.LuviaPWA.register();
    });
    await page.waitForTimeout(500);
    const cachesAfterRegister=await page.evaluate(()=>caches.keys());
    assert.ok(cachesAfterRegister.includes('luvia-shell-v13.82.104'),'current release cache is missing');
    assert.ok(cachesAfterRegister.includes('luvia-shell-v13.17.0'),'registration must preserve caches while the current worker controls the live document');
    assert.equal(await page.evaluate(()=>window.__m165qPwaDocumentToken),documentToken,'registration must not reload the live document');
    await page.evaluate(()=>window.LuviaPWA.clearOldCaches());
    const cachesAfterMaintenance=await page.evaluate(()=>caches.keys());
    assert.ok(cachesAfterMaintenance.includes('luvia-shell-v13.82.104'),'explicit maintenance removed the active release cache');
    assert.equal(cachesAfterMaintenance.includes('luvia-shell-v13.17.0'),false,'explicit maintenance did not prune the stale shell cache');

    await context.setOffline(true);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.LuviaKernelVersion?.build==='13.82.104'&&document.querySelector('#app')?.children.length>0);
    const offlineCss=await page.evaluate(()=>fetch('app/module-hubs.css?v=13.82.104').then(response=>response.text()));
    assert.match(offlineCss,/\.lv-plan-compass-stage/,'offline active-cache recovery missed the Living Compass stylesheet');
    const offlineController=await page.evaluate(()=>{
      const scriptURL=new URL(navigator.serviceWorker.controller?.scriptURL||'',location.href);
      return{pathname:scriptURL.pathname,build:scriptURL.searchParams.get('v')};
    });
    assert.equal(offlineController.pathname.endsWith('/sw.js'),true,'offline document lost the active worker controller');
    assert.equal(offlineController.build,'13.82.104','offline document is controlled by a stale worker build');

    console.log('M16.5Q PWA cache / Service Worker real browser E2E: PASS');
    console.log('Live registration preserved the controller/cache; explicit maintenance and offline reload: PASS');
  }finally{
    await context.setOffline(false).catch(()=>{});
    await context.close();await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1});
