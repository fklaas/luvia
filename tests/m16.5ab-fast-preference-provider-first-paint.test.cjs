'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const preferenceSource=fs.readFileSync(path.join(root,'app/adapters/trip-preference-context-adapter.js'),'utf8');
const discoverySource=fs.readFileSync(path.join(root,'app/adapters/places-discovery-adapter.js'),'utf8');
const placesSource=fs.readFileSync(path.join(root,'app/places/places-spatial-experience.js'),'utf8');
const sheetSource=fs.readFileSync(path.join(root,'app/journey/journey-suggestion-sheet.js'),'utf8');
const indexSource=fs.readFileSync(path.join(root,'index.html'),'utf8');
const runtimeLoaderSource=fs.readFileSync(path.join(root,'app/luvia-runtime-loader.mjs'),'utf8');
const assetsIgnoreSource=fs.readFileSync(path.join(root,'.assetsignore'),'utf8');

const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const sandbox={
  Object,Array,Map,Set,Date,Math,Number,String,Boolean,RegExp,JSON,Promise,
  setTimeout,clearTimeout,console,
  CustomEvent:class CustomEvent{constructor(type,options={}){this.type=type;this.detail=options.detail}},
  dispatchEvent(){},
  LuviaProfileService:{snapshot:()=>({profile:{id:'fabian',displayName:'Fabian'}})},
  LuviaJoinFlow:{snapshot:()=>[{user_id:'fabian',display_name:'Fabian',role:'owner'},{user_id:'lea',display_name:'Lea',role:'member'}]},
  LuviaIdentityContractV1:{reads:{getPreferences:()=>({travelInterests:['culture'],dietaryPreferences:['vegetarian']})}},
  LuviaTripContractV1:{reads:{getActiveTrip:()=>({id:'trip-fast'})}},
  LuviaSupabaseService:{
    start:async()=>{
      await delay(1200);
      return{from:()=>({select:()=>({eq:async()=>({data:[{user_id:'lea',preference_key:'travel_interest',preference_value:'nature',confidence:1,source:'profile'}],error:null})})})};
    }
  }
};
vm.createContext(sandbox);
vm.runInContext(preferenceSource,sandbox,{filename:'trip-preference-context-adapter.js'});

(async()=>{
  const started=Date.now();
  const first=await sandbox.LuviaTripPreferenceContextV1.sharedGroup({fast:true,maxWaitMs:120});
  const elapsed=Date.now()-started;
  assert.ok(elapsed<500,`fast preference projection blocked first paint for ${elapsed} ms`);
  assert.equal(first.source,'identity-self-fast-projection');
  assert.equal(first.persisted,false);
  assert.ok(first.travelers.some(item=>item.id==='fabian'&&item.signals.includes('culture')));

  await delay(1250);
  const cachedStarted=Date.now();
  const cached=await sandbox.LuviaTripPreferenceContextV1.sharedGroup({fast:true,maxWaitMs:120});
  assert.ok(Date.now()-cachedStarted<80,'the completed group projection must be served from the bounded cache');
  assert.ok(cached.travelers.some(item=>item.id==='lea'&&item.signals.includes('nature')),'background owner projection must enrich later paints');

  assert.match(discoverySource,/options\.fastPath===true\?Math\.min\(3,/,'fast provider paint may issue at most three bounded query variants for real category diversity');
  assert.match(discoverySource,/options\.fastPath===true&&options\.parallelFastQueries===true/,'fast provider breadth must be parallel instead of serial');
  assert.match(discoverySource,/options\.fastPath===true\?2400:12000/,'fast provider paint must have a strict timeout instead of a 15 second wait');
  assert.match(discoverySource,/providerCache\.get\(cacheKey\)/,'provider evidence must be reusable within its freshness window');
  assert.match(preferenceSource,/luvia:user-preferences-changed[\s\S]*sharedCache\.clear\(\)/,'saved Identity preferences must invalidate the shared traveler projection');
  assert.match(placesSource,/bindPreferenceRefresh\(\)/,'the visible Places surface must refresh its ranking when Identity or group preferences arrive after first paint');
  assert.match(placesSource,/search\(\{focus:false,silent:true\}\)/,'preference refresh must preserve the visible provider result instead of flashing an empty loading surface');
  assert.match(sheetSource,/load\(input,\{\.\.\.options,fast:true\}\)/,'the sheet must paint the provider-first result before semantic enrichment');
  assert.match(sheetSource,/load\(input,\{force:true,fast:false\}\)\.then/,'semantic and group enrichment must continue in the background');
  assert.match(sheetSource,/patchEnrichedResults\(handle,first,enriched\)/,'background enrichment must patch stable cards instead of replacing the visible rail');
  assert.doesNotMatch(sheetSource,/then\(enriched=>\{if\(handle\.overlay\?\.isConnected\)paintResults/,'background enrichment may not repaint the complete visible result rail');
  assert.match(sheetSource,/successful\.length>=minimumResponses&&groups\.size>=minimumGroups/,'the first visible result must wait for category diversity instead of accepting the first food-only response');
  assert.match(sheetSource,/within\(Promise\.all\(firstCandidates\.map\(enrich\)\),1600/,'real provider images must receive a bounded first-paint enrichment window');
  assert.match(indexSource,/fonts\.googleapis\.com[^>]+media="print"[^>]+onload=/,'remote typography must not block the first visible shell paint');
  assert.match(indexSource,/vendor\/maplibre\/maplibre-gl-5\.12\.0\.css\?v=/,'MapLibre styling must be delivered as a same-origin immutable shell asset');
  assert.match(`${indexSource}\n${runtimeLoaderSource}`,/vendor\/supabase\/supabase-2\.112\.4\.js\?v=/,'the required Supabase browser bundle must be delivered as a same-origin immutable shell asset');
  assert.match(assetsIgnoreSource,/^\/supabase$/m,'only the root backend source directory may be excluded from Worker assets');
  assert.match(assetsIgnoreSource,/^!vendor\/supabase\/\*\*$/m,'the runtime Supabase vendor bundle must be explicitly included in Worker assets');
  assert.doesNotMatch(assetsIgnoreSource,/^supabase$/m,'an unanchored Supabase ignore would also remove the required vendor runtime');
  assert.match(runtimeLoaderSource,/identity-platform-web-adapter\.js[\s\S]*platform-port-adapters\.mjs[\s\S]*media-storage-web-adapter\.mjs[\s\S]*supabase-2\.112\.4\.js[\s\S]*luvia-runtime-precontext-13\.82\.168\.bundle\.js[\s\S]*luvia-trip-context\.js[\s\S]*luvia-runtime-postcontext-13\.82\.168\.bundle\.js/,'the physical ports and vendor boundary must be ready before Trip state, its web binding, and all product consumers execute in contract order');
  assert.match(indexSource,/exifr@7\.1\.3\/dist\/full\.umd\.js" async/,'optional photo metadata parsing must not delay DOMContentLoaded or Today');
  assert.match(indexSource,/vendor\/maplibre\/maplibre-gl-5\.12\.0\.js\?v=13\.82\.168\.88" defer/,'the same-origin map renderer must preserve execution order without blocking HTML parsing');
  const blockingLocalScripts=[...indexSource.matchAll(/<script\b([^>]*)\bsrc=["'](?!https?:\/\/)([^"']+)["']([^>]*)>/g)]
    .filter(match=>!/(?:^|\s)(?:async|defer)(?:\s|=|$)/.test(`${match[1]} ${match[3]}`)&&!/\btype=["']module["']/.test(`${match[1]} ${match[3]}`));
  assert.equal(blockingLocalScripts.length,0,'the shell must not serialize hundreds of same-origin scripts before first paint');

  console.log('M16.5AB fast preference projection and provider-first paint: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
