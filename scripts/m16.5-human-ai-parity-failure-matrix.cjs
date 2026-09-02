'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const OUTPUT=path.join(ROOT,'config','luvia-human-ai-parity-failure-matrix.v1.json');
const SOURCES=Object.freeze({
  registry:'config/luvia-human-ai-action-registry.v1.json',
  language:'config/luvia-human-ai-language-contracts.v1.json',
  safety:'config/luvia-human-ai-safety-policy.v1.json',
  lifecycle:'config/luvia-human-ai-action-lifecycles.v1.json',
  capability:'config/luvia-human-ai-capability-matrix.v1.json',
  consumer:'config/luvia-human-ai-consumer-projections.v1.json'
});
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8').replace(/\r\n?/g,'\n');
const json=relative=>JSON.parse(read(relative));
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex').toUpperCase();
function loadCore(){const context={console};vm.createContext(context);const file='core/intelligence/human-ai-parity-failure-matrix-core.js';vm.runInContext(read(file),context,{filename:file});return context.LuviaHumanAIParityFailureMatrixCoreV1}
function buildParityFailureMatrix(){
  const registry=json(SOURCES.registry),language=json(SOURCES.language),safety=json(SOURCES.safety),lifecycle=json(SOURCES.lifecycle),capability=json(SOURCES.capability),consumer=json(SOURCES.consumer),core=loadCore();
  const rows=core.compileMatrix({actions:registry.actions,languages:language.actions,policies:safety.policies,lifecycles:lifecycle.lifecycles,capabilities:capability.actions,projections:consumer.projections}),summary=core.describeCoverage(rows);
  return{$schema:'./luvia-human-ai-parity-failure-matrix.v1.schema.json',contractId:'luvia.human-ai-parity-failure-matrix.v1',version:'1.0.0',generatedAt:'2026-09-01',source:{coreContractId:core.contractId,coreVersion:core.version,documents:Object.fromEntries(Object.entries(SOURCES).map(([name,file])=>[name,{file,sha256:sha256(read(file))}]))},invariants:{oneRowPerSemanticAction:true,newOrChangedActionRequiresMatrixDecision:true,publicE2eRequiredForReleasePass:true,naturalLanguageAloneConfirmsMutation:false,unknownOutcomeBlindRetry:false,blockedActionPresentedAsAvailable:false,rawUserTextStored:false,ownerExecution:false},dimensions:[...core.dimensions],summary,rows};
}
function validateParityFailureMatrix(document){
  assert.equal(document.rows.length,330,'every semantic action needs one matrix row');
  assert.equal(new Set(document.rows.map(row=>row.actionId)).size,330,'matrix action IDs must be unique');
  assert.equal(document.dimensions.length,12,'B0.09 must retain all twelve parity dimensions');
  assert.deepEqual(document.dimensions,['contract','compiler','permission','confirmation','idempotency','receipt','recovery','undo','multilingual','typo','multiIntent','denial']);
  assert.equal(document.summary.catalogActions,330);assert.equal(document.summary.matrixRows,330);assert.equal(document.summary.dimensions,12);assert.equal(document.summary.protectedChanges,124);assert.equal(document.summary.publicE2eProven,7);assert.equal(document.summary.driftGuard,true);assert.equal(document.summary.ownerExecution,false);
  for(const row of document.rows){
    assert.deepEqual(Object.keys(row.dimensions),document.dimensions,`${row.actionId} dimension order or coverage drift`);
    assert.ok(row.failures.some(item=>item.id==='compiler_unresolved'),`${row.actionId} misses compiler failure`);
    assert.ok(row.failures.some(item=>item.id==='owner_unavailable'),`${row.actionId} misses Owner failure`);
    assert.ok(row.failures.some(item=>item.id==='typo_input'),`${row.actionId} misses typo eval`);
    assert.ok(row.failures.some(item=>item.id==='multi_intent'),`${row.actionId} misses multi-intent eval`);
    if(row.dimensions.idempotency.status==='PASS')assert.ok(row.failures.some(item=>item.id==='duplicate_command'),`${row.actionId} misses idempotency eval`);
    if(row.dimensions.confirmation.status==='PASS')assert.ok(row.failures.some(item=>item.id==='confirmation_rejected'),`${row.actionId} misses confirmation denial eval`);
    if(row.release.status==='PUBLIC_E2E_PROVEN')assert.equal(row.release.publicEvidence,'PUBLIC_E2E_PASS',`${row.actionId} public release claim lacks public evidence`);
  }
  return true;
}
const serialize=document=>`${JSON.stringify(document,null,2)}\n`;
function writeParityFailureMatrix(){const document=buildParityFailureMatrix();validateParityFailureMatrix(document);fs.writeFileSync(OUTPUT,serialize(document),'utf8');return document}
if(require.main===module){const document=writeParityFailureMatrix();process.stdout.write(`Human-AI parity/failure matrix: ${document.summary.matrixRows} rows; ${document.summary.generatedFailureCases} failure evals; ${document.summary.publicE2eProven} public E2E passes\n`)}
module.exports={SOURCES,buildParityFailureMatrix,validateParityFailureMatrix,serialize,writeParityFailureMatrix};
