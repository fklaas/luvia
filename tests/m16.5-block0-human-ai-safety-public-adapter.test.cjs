'use strict';

const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const read=file=>fs.readFileSync(file,'utf8');
const registry=JSON.parse(read('config/luvia-human-ai-action-registry.v1.json'));const context={console,globalThis:null};context.globalThis=context;
context.LuviaIntelligenceDomainContractCoreV1={immutable:value=>value,listCapabilities:()=>[],getCapability:()=>null,listDomains:()=>[],listTools:()=>[],listModelTiers:()=>[],policySnapshot:()=>({}),sanitize:value=>value};
context.LuviaAI={diagnostics:()=>({version:'test'}),run:async()=>({}),ask:async()=>({}),rank:async()=>({}),recommend:async()=>({}),explain:async()=>({}),summarize:async()=>({})};
vm.createContext(context);vm.runInContext(read('core/intelligence/human-ai-language-compiler-core.js'),context);vm.runInContext(read('core/intelligence/human-ai-safety-policy-core.js'),context);vm.runInContext(read('core/platform/intelligence-contract-adapter.js'),context);
const api=context.LuviaIntelligenceContractV1,search=registry.actions.find(item=>item.id==='places.restaurant.search');
assert.equal(api.runtimeVersion,'1.10.0');assert.equal(typeof api.reads.evaluateHumanActionAuthority,'function');assert.equal(typeof api.reads.getHumanActionSafetyCoverage,'function');
const decision=api.reads.evaluateHumanActionAuthority({action:search,actor:{authenticated:true,tripRole:'MEMBER',online:true,providers:{PLACES_PROVIDER:true}}});assert.equal(decision.decision,'ALLOW');assert.equal(decision.ownerExecution,false);
const coverage=api.reads.getHumanActionSafetyCoverage(registry.actions);assert.equal(coverage.policyActions,333);assert.equal(Object.keys(coverage.classifications).length,6);assert.equal(api.diagnostics().providers.humanActionSafetyPolicy,true);
console.log('M16.5 Block 0 Human-AI safety public Intelligence adapter: PASS');
