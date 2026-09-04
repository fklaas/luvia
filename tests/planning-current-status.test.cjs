'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const read=p=>fs.readFileSync(p,'utf8').replace(/\r\n?/g,'\n'),plan=JSON.parse(read('docs/planning/status-plan.v1.json'));
assert.equal(plan.packages.length,50);assert.equal(new Set(plan.packages.map(p=>p.id)).size,50);
for(let i=1;i<=50;i++){const id='P'+String(i).padStart(2,'0'),row=plan.packages.find(p=>p.id===id);assert.ok(row?.owner&&row?.status&&row?.nextAcceptance&&row?.scope,id);assert.ok(read('docs/planning/MASTERFAHRPLAN-v6.md').includes(id));assert.ok(read('docs/planning/STATUSPLAN-2026-09-04.md').includes(id))}
for(const file of ['CURRENT-BUILD.md','ROADMAP-LUVIA-CURRENT.md','HANDOFF-CODEX-CURRENT.md','HANDOFF-NORMAL-CHATGPT-CURRENT.md'])assert.ok(read(file).includes('docs/planning/'),file+' must point to canonical current plan');
const dir='docs/planning/archive/2026-09-04-before-consolidation/';
for(const file of JSON.parse(read(dir+'manifest.json'))){assert.equal(crypto.createHash('sha256').update(read(dir+file.path)).digest('hex'),file.contentSha256LF,file.path+' archived evidence must not change')}
assert.match(read('docs/planning/MASTERFAHRPLAN-v6.md'),/M22/);
assert.match(read('docs/planning/MASTERFAHRPLAN-v6.md'),/M18/);
console.log('Current P01–P50 status, roadmap pointers and immutable historical evidence: PASS');

