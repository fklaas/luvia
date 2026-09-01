const assert=require('node:assert');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const source=fs.readFileSync(path.resolve(__dirname,'../core/intelligence/intelligence-action-contract-core.js'),'utf8');
const sandbox={};
vm.createContext(sandbox);
vm.runInContext(source,sandbox);
const contract=sandbox.LuviaIntelligenceActionContractCoreV1;

assert.equal(contract.runtimeVersion,'1.9.0-complete-input-enforcement');
for(const prompt of [
  'Plane einen entspannten Tag für mich',
  'Plane uns einen ruhigen Tag am Meer',
  'Wir planen einen abwechslungsreichen Tag',
  'Was können wir heute unternehmen?',
  'Zeige unseren Tagesplan'
])assert.ok(contract.routeIntents(prompt)?.some(route=>route.actionId==='journey.day.read'),`day intent was not routed: ${prompt}`);

assert.equal(contract.routeIntent('Finde ein Restaurant für heute')?.actionId,'places.restaurant.recommend');
assert.equal(contract.routeIntent('Erkläre mir die Reiseversicherung'),null);
assert.match(fs.readFileSync(path.resolve(__dirname,'../core/ai/ai-action-runtime.js'),'utf8'),/const VERSION='1\.13\.0-complete-input-enforcement'/);

console.log('M15.8 Intelligence day intent rich result: PASS');
