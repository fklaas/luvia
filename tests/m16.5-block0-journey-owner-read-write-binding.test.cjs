'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=file=>fs.readFileSync(file,'utf8');
const registry=JSON.parse(read('config/luvia-human-ai-action-registry.v1.json'));
const removed=[],cleared=[];
const context={
  Object,Array,String,Number,Boolean,Date,Intl,Math,RegExp,JSON,Set,Map,Error,TypeError,Promise,
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},dispatchEvent(){},
  LuviaTimelineCore:{
    snapshot:()=>({entries:[
      {id:'entry-1',source:'schedule',tripId:'trip-1',title:'Frühstück',entityType:'restaurant',startAt:'2026-09-01T08:00:00.000Z',durationMinutes:60,metadata:{planTrust:'confirmed',providerFacts:{observedAt:'2026-08-31T12:00:00.000Z'}}},
      {id:'entry-2',source:'schedule',tripId:'trip-1',title:'Museum',entityType:'attraction',startAt:'2026-09-01T08:30:00.000Z',durationMinutes:90,metadata:{planTrust:'pending'}}
    ]}),
    subscribe:()=>()=>{},diagnostics:()=>({cloudAuthoritative:true,realtime:false,metrics:{}}),
    async removeEntry(value,options){removed.push({value,options});return true},
    async clearEntries(options){cleared.push(options);return true}
  },
  LuviaTripContractV1:{getActiveTrip:()=>({id:'trip-1',title:'Scharbeutz',startDate:'2026-09-01',endDate:'2026-09-02'})},
  LuviaFeatureFlagRegistry:{register(){}},LuviaGlobalContracts:{register(){}}
};
context.window=context;context.globalThis=context;
vm.createContext(context);
for(const file of ['core/journey/journey-domain-contract-core.js','core/journey/journey-resilience-core.js','core/platform/journey-contract-adapter.js'])vm.runInContext(read(file),context,{filename:file});

(async()=>{
  const contract=context.LuviaJourneyContractV1;
  const bindings=new Map([
    [175,['reads.getDay','date']],[176,['reads.getEntry','entryId']],[177,['reads.listConflicts','trip']],
    [178,['reads.routeUncertainty','route']],[179,['reads.rehearseDay','day']],[180,['reads.disruptionRecovery','disruptions']],
    [181,['reads.destinationTwin','destination']],[182,['reads.planTrust','entryId']],
    [192,['commands.removeEntry','entryId']],[193,['commands.clearEntries','scope']]
  ]);
  for(const [sequence,[method,operationKey]] of bindings){
    const action=registry.actions.find(item=>item.sequence===sequence),[namespace,name]=method.split('.');
    assert.ok(action,`registry action ${sequence} missing`);
    assert.equal(action.owner.contract,'journey.v1');
    assert.equal(action.owner.method,method);
    assert.equal(action.owner.operationKey,operationKey);
    assert.equal(action.owner.bindingStatus,'PUBLIC_CONTRACT_BOUND');
    assert.equal(typeof contract[namespace][name],'function');
  }

  assert.equal(contract.reads.getDay('2026-09-01').entries.length,2);
  assert.equal(contract.reads.getEntry('entry-2').title,'Museum');
  assert.equal(contract.reads.listConflicts().length,1);
  assert.equal(contract.reads.planTrust('entry-1').label,'bestätigt');
  assert.equal(contract.reads.planTrust('entry-2').label,'wartet auf Antwort');
  assert.equal(contract.reads.routeUncertainty({baseMinutes:20,evidence:[]}).kind,'route-uncertainty');
  assert.equal(contract.reads.rehearseDay({entries:contract.reads.list()}).kind,'day-rehearsal');
  assert.equal(contract.reads.disruptionRecovery({entries:[],disruptions:[]}).kind,'live-disruption-recovery');
  assert.equal(contract.reads.destinationTwin({entries:[],places:[]}).kind,'destination-digital-twin');
  await contract.commands.removeEntry('entry-1',{tripId:'trip-1'});
  await contract.commands.clearEntries({tripId:'trip-1',entityType:'restaurant'});
  assert.equal(removed.length,1);
  assert.equal(cleared.length,1);

  const composer=read('app/journey/journey-day-composer.js'),suggestions=read('app/journey/journey-suggestion-sheet.js');
  assert.match(composer,/contract\(\)\.reads\.planTrust\(entry\)/,'visible plan trust must use journey.v1');
  assert.equal(suggestions.includes('LuviaJourneyResilienceCoreV1'),false,'visible suggestions must not bypass journey.v1');
  for(const method of ['disruptionRecovery','destinationTwin','routeUncertainty','rehearseDay'])assert.ok(suggestions.includes(`contracts().journey?.reads?.${method}`),`human Journey surface bypasses ${method}`);
  assert.ok(registry.summary.ownerBinding.PUBLIC_CONTRACT_BOUND>=46);
  assert.ok((registry.summary.ownerBinding.OWNER_METHOD_AUDIT_OPEN||0)<=197);
  console.log('M16.5 Block 0 Journey public Owner bundle: PASS');
  console.log('10 Journey actions -> journey.v1 read/write methods: PASS');
  console.log('Human Journey surface + AI use the same resilience reads: PASS');
  console.log('Owner methods open: 207 -> 197');
})().catch(error=>{console.error(error);process.exitCode=1});
