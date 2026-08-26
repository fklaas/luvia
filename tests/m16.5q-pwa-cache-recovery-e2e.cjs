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
    await page.waitForFunction(()=>window.LuviaKernelVersion?.build==='13.82.59'&&Boolean(window.LuviaPWA));
    await page.evaluate(async()=>{
      const stale=await caches.open('luvia-shell-v13.17.0');
      await stale.put(new Request(new URL('stale-cache-probe',location.href)),new Response('stale'));
      await window.LuviaPWA.register();
    });
    await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.LuviaKernelVersion?.build==='13.82.59'&&Boolean(navigator.serviceWorker.controller));

    const cachesAfterUpdate=await page.evaluate(()=>caches.keys());
    assert.ok(cachesAfterUpdate.includes('luvia-shell-v13.82.59'),'current release cache is missing');
    assert.equal(cachesAfterUpdate.includes('luvia-shell-v13.17.0'),false,'stale fixed cache survived recovery');

    await context.setOffline(true);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.LuviaKernelVersion?.build==='13.82.59'&&document.querySelector('#app')?.children.length>0);
    const offlineCss=await page.evaluate(()=>fetch('app/module-hubs.css?v=13.82.59').then(response=>response.text()));
    assert.match(offlineCss,/\.lv-plan-compass-stage/,'offline active-cache recovery missed the Living Compass stylesheet');
    assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/sw.js')),true,'offline document lost the active worker controller');

    console.log('M16.5Q PWA cache / Service Worker real browser E2E: PASS');
    console.log('Stale shell cache pruned after update; current cache and offline reload: PASS');
  }finally{
    await context.setOffline(false).catch(()=>{});
    await context.close();await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1});
