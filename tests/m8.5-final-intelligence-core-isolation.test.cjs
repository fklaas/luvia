'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const read=path=>fs.readFileSync(path,'utf8');
const corePath='core/intelligence/intelligence-domain-contract-core.js';
const adapterPath='core/platform/intelligence-contract-adapter.js';
const core=read(corePath);
const adapter=read(adapterPath);
const index=read('index.html');
const serviceWorker=read('sw.js');
const dashboard=read('core/ai/ai-dashboard-service.js');
const tools=read('core/ai/ai-tool-registry.js');
const memory=read('core/ai/ai-memory-service.js');
const proposals=read('core/ai/ai-command-proposal-service.js');
const registry=JSON.parse(read('config/luvia-cores.json'));
const contract=JSON.parse(read('docs/modularization/contracts/intelligence.v1.json'));

for(const [label,pattern] of [
  ['global runtime',/\bwindow\b|\bglobalThis\b/],
  ['DOM',/\bdocument\b|\bCustomEvent\b|\bdispatchEvent\b/],
  ['device API',/\bnavigator\b/],
  ['browser storage',/\blocalStorage\b|\bsessionStorage\b/],
  ['network',/\bfetch\s*\(|\bXMLHttpRequest\b/],
  ['provider SDK',/\bSupabase\b/i],
  ['direct DB',/\.from\s*\(|\.rpc\s*\(/]
])assert.equal((core.match(pattern)||[]).length,0,`physical Intelligence Core must be browserless: ${label}`);

for(const forbidden of [
  'LuviaSupabaseService',
  '.from(',
  '.rpc(',
  'localStorage',
  'sessionStorage',
  'LuviaTripContext',
  'LuviaPlaceCore',
  'LuviaUserPreferences.update',
  'LuviaScheduleIntelligence',
  'execute('
])assert.equal(adapter.includes(forbidden),false,`intelligence.v1 adapter leaks private provider/mutation: ${forbidden}`);

assert.equal(index.includes(corePath),true,'Intelligence owner core missing from runtime');
assert.equal(index.includes(adapterPath),true,'intelligence.v1 adapter missing from runtime');
assert.ok(index.indexOf(corePath)<index.indexOf('core/ai/ai-evidence-store.js'),'owner core must load before transitional AI rules');
assert.ok(index.indexOf(adapterPath)>index.indexOf('core/ai/ai-core.js'),'adapter must bind after transitional provider runtime');
assert.ok(index.indexOf(adapterPath)<index.indexOf('core/ai/ai-dashboard-service.js'),'public Intelligence contract must exist before dashboard consumer');
for(const asset of [corePath,adapterPath,'core/ai/ai-evidence-store.js','core/ai/ai-domain-registry.js'])assert.ok(serviceWorker.includes(asset),`offline shell missing ${asset}`);

assert.equal(registry.cores.intelligence.status,'active');
assert.equal(registry.cores.intelligence.publicContract,'LuviaIntelligenceContractV1');
assert.equal(registry.cores.intelligence.contractAdapter,adapterPath);
assert.equal(registry.cores.intelligence.browserlessCore,corePath);
assert.ok(registry.cores.intelligence.excludedTruth.includes('journey-timeline'));
assert.equal(registry.cores.journeyTimeline.status,'reserved');

assert.equal(contract.contractId,'intelligence.v1');
assert.equal(contract.status,'active');
assert.equal(contract.runtimeImplementationStage,'M8.5');
assert.ok(contract.currentImplementation.includes('LuviaIntelligenceContractV1'));

for(const [label,source] of [['dashboard',dashboard],['tool registry',tools],['memory',memory],['proposal',proposals]])assert.equal(source.includes('LuviaTripContext'),false,`${label} still reads private Trip context`);
assert.equal(tools.includes('LuviaPlaceRuntime'),false);
assert.equal(tools.includes('LuviaUserPreferences'),false);
assert.equal(memory.includes('LuviaUserPreferences'),false);
assert.equal(/window\.LuviaAI(?:\.|\?\.)/.test(dashboard),false);
assert.equal(dashboard.includes('data-ai-timeline-check'),false);
for(const token of ['data-ai-transparency-open','So denkt Luvia','getSystemSnapshot','getMemorySnapshot','openTransparency:transparencyModal'])assert.ok(dashboard.includes(token),`visible Intelligence Transparency missing ${token}`);

assert.ok(core.includes("const CAPABILITIES=Object.freeze(["));
assert.ok(core.includes("const MODEL_TIERS=Object.freeze({"));
assert.ok(core.includes("foreignDomainMutation:false"));
assert.ok(core.includes("journeyTimelineOwner:false"));
assert.ok(core.includes("INTELLIGENCE_OWNER_COMMAND_REQUIRED"));

console.log('M8.5 FINAL Intelligence Core Isolation Foundation: PASS');
console.log('Browserless owner core: PASS');
console.log('intelligence.v1 runtime: ACTIVE');
console.log('Private Trip/Places/Identity dashboard-tool-memory refs: 0');
console.log('Timeline/Journey reservation: PRESERVED');
