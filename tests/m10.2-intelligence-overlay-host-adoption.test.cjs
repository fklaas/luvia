'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const proposal=read('core/ai/ai-command-proposal-service.js');
const dashboard=read('core/ai/ai-dashboard-service.js');
const host=read('core/ui/ui-manager.js');
const timeline=read('core/places/timeline-core.js');
const safeRunner=read('tests/run-m4.3-safe-regression.cjs');

assert.match(host,/contractId:CONTRACT_ID/,'Intelligence adoption requires the canonical Overlay Host');
for(const [source,name] of [[proposal,'intelligence.command-proposal'],[dashboard,'intelligence.ask'],[dashboard,'intelligence.transparency']])assert(source.includes(`name:'${name}'`),`Intelligence overlay missing owner name ${name}`);
assert.match(proposal,/ui\.mount\(/);
assert.match(proposal,/onClose:\(\)=>\{if\(!settled\)\{settled=true;resolve\(false\)\}\}/,'Dismissal must resolve a proposal as not confirmed');
assert.doesNotMatch(proposal,/document\.body\.appendChild\(overlay\)|overlay\.remove\(\)/,'AI Proposal must not own a parallel overlay root');
assert.match(dashboard,/ui\.mount\(/);
assert.doesNotMatch(dashboard,/document\.body\.appendChild\(overlay\)|overlay\.remove\(\)/,'AI Dashboard must not own a parallel overlay root');
assert.match(dashboard,/initialFocus:'textarea'/,'Ask-Luvia must focus the command input');
assert.match(dashboard,/closeSelector:'\[data-ai-close\]'/,'Dashboard dialogs must delegate close semantics');
assert.doesNotMatch(`${proposal}\n${dashboard}`,/history\.(?:pushState|replaceState)|localStorage|sessionStorage/,'Intelligence overlay adoption must not gain History or browser-storage ownership');
assert.match(timeline,/function openEditor|function editEntry|openEditor\(/,'Timeline/Journey must remain separately present');
assert(!timeline.includes('intelligence.command-proposal'),'Timeline/Journey must not be absorbed into Intelligence overlay ownership');
assert(safeRunner.includes('tests/m10.2-intelligence-overlay-host-adoption.test.cjs'),'M10.2 guard missing from Safe Regression');

console.log('M10.2 Intelligence Overlay Host Adoption: PASS');
