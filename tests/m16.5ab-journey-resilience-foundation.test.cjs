const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../core/journey/journey-resilience-core.js'),'utf8');
const context={Date,Math,Object,Array,Map,Set,JSON,Number,String,TypeError};
vm.createContext(context);vm.runInContext(source,context);
const core=context.LuviaJourneyResilienceCoreV1;
assert.equal(core.contractId,'journey.resilience.v1');

const route=core.routeUncertainty({baseMinutes:24,travelSpeed:'calm',weatherRisk:.4,providerConfidence:.7,evidence:[{source:'route-provider',kind:'duration',observedAt:'2026-08-30T10:00:00Z'}]});
assert.ok(route.percentiles.p95>route.percentiles.p80);
assert.ok(route.percentiles.p80>route.percentiles.p50);
assert.equal(route.probabilityClaim,false);
assert.equal(route.evidenceCoverage,100);

const recovery=core.disruptionRecovery({entries:[{id:'lunch',startAt:'2027-06-12T13:00:00Z'}],disruptions:[{verified:false,entryIds:['lunch'],reason:'Gerücht',observedAt:'2027-06-12T10:00:00Z'},{verified:true,entryIds:['lunch'],reason:'Provider meldet Schließung',observedAt:'2027-06-12T10:05:00Z'}]});
assert.equal(recovery.proposals.length,1);
assert.equal(recovery.proposals[0].automaticMutation,false);
assert.equal(recovery.proposals[0].options[0].requiresConfirmation,true);

const rehearsal=core.rehearseDay({travelSpeed:'calm',entries:[{id:'a',startAt:'2027-06-12T10:00:00Z',endAt:'2027-06-12T11:00:00Z'},{id:'b',startAt:'2027-06-12T11:05:00Z',endAt:'2027-06-12T12:00:00Z',transferMinutes:25,routeConfidence:.5}]});
assert.equal(rehearsal.status,'blocked');
assert.ok(rehearsal.issues.some(item=>item.kind==='route-risk'));
assert.equal(rehearsal.successProbability,null);

const twin=core.destinationTwin({generatedAt:'2026-08-30T10:00:00Z',places:[{providerPlaceId:'p1',type:'museum',coordinates:{latitude:54.0,longitude:10.7},observedAt:'2026-08-30T09:00:00Z'}],entries:[{id:'e1',owner:'journey',placeId:'p1',startAt:'2027-06-12T10:00:00Z'}]});
assert.equal(twin.nodes.length,2);
assert.equal(twin.edges.length,1);
assert.equal(twin.provenance.persistence,false);

const alpha=core.createReplica({replicaId:'alpha'}),beta=core.createReplica({replicaId:'beta'});
alpha.set('entry-1',{title:'A',startAt:'2027-06-12T10:00:00Z'});
beta.set('entry-1',{title:'B',startAt:'2027-06-12T11:00:00Z'});
alpha.merge(beta.operations());beta.merge(alpha.operations());
assert.deepEqual(JSON.parse(JSON.stringify(alpha.snapshot())),JSON.parse(JSON.stringify(beta.snapshot())));
alpha.remove('entry-1');beta.merge(alpha.operations());
assert.equal(beta.snapshot().length,0);
assert.equal(alpha.diagnostics().requiresOwnerSync,true);

console.log('m16.5ab journey resilience foundation: ok');
