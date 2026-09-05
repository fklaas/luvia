'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const experiencePath='app/memories/premium-memories-experience.js';
const cssPath='app/memories/premium-memories-experience.css';
const fixturePath='tests/fixtures/m13-premium-memories-browser.html';

for(const file of [experiencePath,cssPath,fixturePath])assert.ok(fs.existsSync(path.join(ROOT,file)),`Missing M13 Premium Memories asset: ${file}`);

const source=read(experiencePath),css=read(cssPath),index=read('index.html'),shell=read('app/app-shell.js'),sw=read('sw.js');
for(const token of ['LuviaPremiumMemoriesExperience','LuviaMemoryContractV1','reads.snapshot','reads.library','reads.createDraft','reads.signedAsset','commands.stories.publish','commands.stories.save','composition.toggleSelection','LuviaUI','memory.story-composer','data-memory-select','data-memory-filter','data-memory-search','data-memory-more'])assert.ok(source.includes(token),`Premium Memories Experience missing ${token}`);
assert.ok(source.includes('Number(item.chapterPosition)===index'),'Story Composer chapter counts must derive from canonical story.items');
for(const forbidden of ['LuviaMediaCore','LuviaMemoryAlbums','LuviaMemoryCards','LuviaMemoryJourneys','LuviaSupabaseService','localStorage','sessionStorage','navigator.geolocation'])assert.equal(source.includes(forbidden),false,`Premium Memories must not bypass its public contracts: ${forbidden}`);
const normalized=source.replace(/\bArray\.from\s*\(/g,'Array_from(').replace(/\bObject\.fromEntries\s*\(/g,'Object_fromEntries(');
assert.doesNotMatch(normalized,/(?<!\.storage)\.from\s*\(|\.rpc\s*\(|functions\.invoke\s*\(/,'Premium Memories must contain no direct database or Edge Function access');

const context={Object,Array,Map,Set,WeakSet,Date,Math,Number,String,Boolean,JSON,Intl,Promise,URLSearchParams,FormData:class FormData{},AbortController:class AbortController{},setTimeout,clearTimeout};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(source,context,{filename:experiencePath});
const api=context.LuviaPremiumMemoriesExperience;
assert.ok(api,'Premium Memories Experience did not publish its runtime API');
assert.match(api.render(),/data-premium-memories/);
assert.deepEqual(JSON.parse(JSON.stringify(api.diagnostics())),{
  version:'1.0.0',contract:'memory.v1',mediaAssetContract:'media.v1',owner:'Consumer Experience',domainTruth:false,storyTruth:false,overlayHost:'overlay-host.v1',pageSize:36,maxVisible:120,selectionLimit:60,previewConcurrency:6,minimumTouchTarget:48
});

assert.ok(css.includes('min-height:48px'),'Premium Memories must retain 48px minimum touch targets');
assert.ok(css.includes('prefers-reduced-motion'),'Premium Memories must respect reduced motion');
assert.ok(css.includes('grid-template-columns'),'Premium Memories must provide responsive grid composition');
assert.match(css,/@media\(max-width:680px\)/,'Premium Memories mobile layout guard missing');
assert.match(css,/\.lvm-memory\.is-selected/,'Premium Memories selection state missing');
assert.match(css,/\.lvm-search>\.sr-only\{position:absolute!important/,'Premium Memories search label must stay visually hidden without global CSS');

const order=['core/memory/memory-domain-contract-core.js','core/platform/memory-contract-adapter.js',experiencePath,'app/app-shell.js'].map(file=>index.indexOf(file));
assert.ok(order.every(position=>position>=0),'M13 Memory contract, Experience and App Shell runtime files must all load');
assert.deepEqual(order,[...order].sort((a,b)=>a-b),'Memory contract must load before Premium Memories and App Shell');
assert.ok(index.includes(`${cssPath}?v=13.82.168.84`));
for(const asset of [experiencePath,cssPath])assert.ok(sw.includes(`'${asset}'`),`Service Worker shell missing ${asset}`);

assert.ok(shell.includes("view==='memories')content=window.LuviaPremiumMemoriesExperience?.render"),'App Shell must render Premium Memories for the Memories route');
assert.ok(shell.includes("if(view==='memories')window.LuviaPremiumMemoriesExperience?.bind"),'App Shell must bind Premium Memories after mounting the route');
assert.ok(shell.includes('window.LuviaPremiumMemoriesExperience?.unbind?.()'),'App Shell must unbind Premium Memories before route changes');

const fixture=read(fixturePath);
for(const asset of ['core/memory/memory-domain-contract-core.js',experiencePath,cssPath])assert.ok(fixture.includes(`../../${asset}`),`Browser fixture missing production asset: ${asset}`);
assert.ok(fixture.includes('data-fixture-root'));
assert.ok(fixture.includes('LuviaMemoryContractV1'));

const ownership=read('docs/modularization/FILE-OWNERSHIP.csv');
for(const file of [experiencePath,cssPath,'tests/m13.2-premium-memories-experience.test.cjs',fixturePath])assert.ok(ownership.includes(file),`Ownership registry missing ${file}`);

console.log('M13.2 Premium Memories & Story Composition Experience: PASS');
