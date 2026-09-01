'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const REGISTRY=path.join(ROOT,'config','luvia-human-ai-action-registry.v1.json');
const OUTPUT=path.join(ROOT,'config','luvia-human-ai-consumer-projections.v1.json');

function loadCore(){
  const context={console};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(ROOT,'core','intelligence','human-ai-consumer-projection-core.js'),'utf8'),context,{filename:'human-ai-consumer-projection-core.js'});
  return context.LuviaHumanAIConsumerProjectionCoreV1;
}
function buildConsumerProjections(){
  const registry=JSON.parse(fs.readFileSync(REGISTRY,'utf8')),core=loadCore(),projections=core.projectCatalog(registry.actions),summary=core.describeCoverage(registry.actions);
  return{$schema:'./luvia-human-ai-consumer-projections.v1.schema.json',contractId:'luvia.human-ai-consumer-projections.v1',version:'1.0.0',generatedAt:'2026-09-01',source:{registryContractId:registry.contractId,registryVersion:registry.version,coreContractId:core.contractId,coreVersion:core.version},invariants:{normalSurfaceTechnicalVocabulary:false,singleResolvedIntentRepeated:false,datesUseGermanDayMonthYear:true,blockedCapabilityPresentedAsAvailable:false},summary,projections};
}
function validateConsumerProjections(document){
  assert.equal(document.projections.length,329);
  assert.equal(new Set(document.projections.map(item=>item.actionId)).size,329);
  assert.equal(document.summary.projectedActions,329);
  assert.equal(document.summary.capabilityStates,15);
  assert.equal(document.summary.technicalVocabularyHidden,true);
  assert.equal(document.summary.duplicateSingleIntentSuppressed,true);
  assert.equal(document.summary.dateFormat,'TT.MM.JJJJ');
  return true;
}
function writeConsumerProjections(){const document=buildConsumerProjections();validateConsumerProjections(document);fs.writeFileSync(OUTPUT,`${JSON.stringify(document,null,2)}\n`,'utf8');return document}
if(require.main===module){const document=writeConsumerProjections();process.stdout.write(`Human-AI consumer projections: ${document.summary.projectedActions}; ${Object.keys(document.summary.consumerViews).length} view types\n`)}
module.exports={buildConsumerProjections,validateConsumerProjections,writeConsumerProjections};
