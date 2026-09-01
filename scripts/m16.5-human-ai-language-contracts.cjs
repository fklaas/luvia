'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.resolve(__dirname,'..');
const REGISTRY_PATH=path.join(ROOT,'config','luvia-human-ai-action-registry.v1.json');
const OUTPUT_PATH=path.join(ROOT,'config','luvia-human-ai-language-contracts.v1.json');
const CORE_PATH=path.join(ROOT,'core','intelligence','human-ai-language-compiler-core.js');

function loadCompiler(){
  const context={console};vm.createContext(context);vm.runInContext(fs.readFileSync(CORE_PATH,'utf8'),context,{filename:CORE_PATH});
  return context.LuviaHumanAILanguageCompilerCoreV1;
}
function buildLanguageContracts(){
  const registry=JSON.parse(fs.readFileSync(REGISTRY_PATH,'utf8')),compiler=loadCompiler(),rules=compiler.describeRules(),ruleMap=new Map();
  for(const rule of rules){const list=ruleMap.get(rule.actionId)||[];list.push(rule);ruleMap.set(rule.actionId,list)}
  const actions=registry.actions.map(action=>{
    const actionRules=ruleMap.get(action.id)||[],entityHints=[...new Set(actionRules.flatMap(rule=>rule.entityHints||[]))].sort(),locales=[...new Set(actionRules.flatMap(rule=>rule.locales||[]))].sort();
    return{
      actionId:action.id,category:action.category,label:action.label,effect:action.effect,stateChanging:action.lifecycle.stateChanging,
      canonical:{de:[action.label]},curatedRuleCount:actionRules.length,curatedLocales:locales,entityHints,
      coverage:actionRules.length?'MULTILINGUAL_CURATED':'CANONICAL_DE',
      owner:{contract:action.owner.contract,method:action.owner.method,bindingStatus:action.owner.bindingStatus},
      guard:{naturalLanguageConfirmsMutation:false,deterministicValidationRequired:true}
    };
  });
  const coverage=compiler.describeCoverage(registry.actions),counts=actions.reduce((out,item)=>(out[item.coverage]=(out[item.coverage]||0)+1,out),{});
  return{
    $schema:'./luvia-human-ai-language-contracts.v1.schema.json',contractId:'luvia.human-ai-language-contracts.v1',version:'1.0.0',generatedAt:'2026-09-01',
    source:{registryContractId:registry.contractId,registryVersion:registry.version,compilerContractId:compiler.contractId,compilerVersion:compiler.version},
    invariants:{ownerExecution:false,naturalLanguageAloneConfirmsMutation:false,deterministicValidationRequired:true,sourceUtterancePreserved:true,negationPreserved:true,orderingPreserved:true},
    summary:{semanticActions:actions.length,canonicalGermanActions:actions.filter(item=>item.canonical.de.length).length,curatedActionIds:coverage.curatedActionCount,curatedRules:coverage.curatedRuleCount,supportedLocales:coverage.supportedLocales,entityTypes:coverage.entityTypes,coverage:counts},
    actions
  };
}
function validateLanguageContracts(document){
  assert.equal(document.contractId,'luvia.human-ai-language-contracts.v1');assert.equal(document.version,'1.0.0');assert.equal(document.actions.length,329);
  assert.equal(document.summary.semanticActions,329);assert.equal(document.summary.canonicalGermanActions,329);assert.ok(document.summary.curatedActionIds>=100);assert.ok(document.summary.curatedRules>=120);
  assert.equal(new Set(document.actions.map(item=>item.actionId)).size,329);assert.ok(document.actions.every(item=>item.canonical.de.length===1));
  assert.ok(document.actions.every(item=>item.guard.naturalLanguageConfirmsMutation===false&&item.guard.deterministicValidationRequired===true));
  return true;
}
function writeLanguageContracts(){const document=buildLanguageContracts();validateLanguageContracts(document);fs.writeFileSync(OUTPUT_PATH,`${JSON.stringify(document,null,2)}\n`,'utf8');return document}

if(require.main===module){const document=writeLanguageContracts();process.stdout.write(`Human-AI language contracts: ${document.summary.semanticActions} canonical; ${document.summary.curatedActionIds} curated action IDs; ${document.summary.curatedRules} rules\n`)}
module.exports={buildLanguageContracts,validateLanguageContracts,writeLanguageContracts};
