'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.resolve(__dirname,'..');
const REGISTRY_PATH=path.join(ROOT,'config','luvia-human-ai-action-registry.v1.json');
const OUTPUT_PATH=path.join(ROOT,'config','luvia-human-ai-safety-policy.v1.json');
const CORE_PATH=path.join(ROOT,'core','intelligence','human-ai-safety-policy-core.js');

function loadCore(){const context={console};vm.createContext(context);vm.runInContext(fs.readFileSync(CORE_PATH,'utf8'),context,{filename:CORE_PATH});return context.LuviaHumanAISafetyPolicyCoreV1}
function buildSafetyPolicy(){
  const registry=JSON.parse(fs.readFileSync(REGISTRY_PATH,'utf8')),core=loadCore(),policies=registry.actions.map(action=>core.compilePolicy(action)),coverage=core.describeCoverage(registry.actions);
  return{$schema:'./luvia-human-ai-safety-policy.v1.schema.json',contractId:'luvia.human-ai-safety-policy.v1',version:'1.0.0',generatedAt:'2026-09-01',source:{registryContractId:registry.contractId,registryVersion:registry.version,coreContractId:core.contractId,coreVersion:core.version},invariants:{sameAuthorityAsActingUser:true,shadowPermission:false,naturalLanguageAloneConfirmsMutation:false,ownerExecution:false,denyByDefault:true},summary:coverage,policies};
}
function validateSafetyPolicy(document){
  assert.equal(document.contractId,'luvia.human-ai-safety-policy.v1');assert.equal(document.version,'1.0.0');assert.equal(document.policies.length,333);assert.equal(document.summary.policyActions,333);
  assert.equal(new Set(document.policies.map(item=>item.actionId)).size,333);assert.equal(Object.values(document.summary.classifications).reduce((sum,count)=>sum+count,0),333);assert.equal(Object.keys(document.summary.classifications).length,6);
  assert.ok(document.policies.every(item=>item.requiredScope&&item.networkPolicy&&item.confirmationPolicy));assert.ok(document.policies.every(item=>item.naturalLanguageConfirmsMutation===false&&item.ownerExecution===false));
  return true;
}
function writeSafetyPolicy(){const document=buildSafetyPolicy();validateSafetyPolicy(document);fs.writeFileSync(OUTPUT_PATH,`${JSON.stringify(document,null,2)}\n`,'utf8');return document}
if(require.main===module){const document=writeSafetyPolicy();process.stdout.write(`Human-AI safety policies: ${document.summary.policyActions}; ${document.summary.consentGated} consent-gated; ${document.summary.providerGated} provider-gated\n`)}
module.exports={buildSafetyPolicy,validateSafetyPolicy,writeSafetyPolicy};
