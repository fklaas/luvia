'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const corePath='core/intelligence/intelligence-domain-contract-core.js';
const source=fs.readFileSync(corePath,'utf8');

for(const [label,pattern] of [
  ['global runtime',/\bwindow\b|\bglobalThis\b/],
  ['DOM',/\bdocument\b|\bCustomEvent\b|\bdispatchEvent\b/],
  ['device API',/\bnavigator\b/],
  ['browser storage',/\blocalStorage\b|\bsessionStorage\b/],
  ['network',/\bfetch\s*\(|\bXMLHttpRequest\b/],
  ['provider SDK',/\bSupabase\b/i],
  ['direct DB',/\.from\s*\(|\.rpc\s*\(/]
]){
  assert.equal((source.match(pattern)||[]).length,0,`physical Intelligence Core must be browserless: ${label}`);
}

const context={console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON};
vm.createContext(context);
vm.runInContext(source,context,{filename:corePath});

const core=context.LuviaIntelligenceDomainContractCoreV1;
assert.ok(core,'physical Intelligence Core missing');
assert.equal(core.contractId,'intelligence.v1');
assert.equal(core.version,'1');
assert.equal(core.runtimeVersion,'1.0.0');
assert.equal(Object.isFrozen(core),true);

const capabilities=core.listCapabilities();
assert.equal(capabilities.length,9);
assert.equal(core.getCapability('brain.ask').mode,'READ');
assert.equal(core.getCapability('timeline.propose').mode,'DRAFT');
assert.equal(core.getCapability('timeline.propose').tier,'deep');
assert.equal(Object.isFrozen(capabilities),true);
assert.equal(Object.isFrozen(capabilities[0]),true);

const domains=core.listDomains();
assert.equal(domains.length,5);
assert.equal(core.getDomain('journey').contracts.owner,'journey');
assert.equal(core.getDomain('journey').contracts.mutationDelegated,true);
assert.equal(core.getDomain('timeline').contracts.writesRequireConfirmation,true);

const tools=core.listTools();
assert.equal(tools.length,12);
assert.equal(core.getTool('trip.current').sourceContract,'trip.v1');
assert.equal(core.getTool('preferences.current').sourceContract,'identity.v1');
assert.equal(core.getTool('places.saved').sourceContract,'places.v1');
assert.equal(core.getTool('journey.context').owner,'journey');

assert.equal(core.resolveModelTier('memory.extract').alias,'Luna');
assert.equal(core.resolveModelTier('timeline.propose').alias,'Sol');
assert.equal(core.resolveModelTier('brain.ask').alias,'Terra');
assert.equal(core.canRunCapability('brain.ask'),true);
assert.equal(core.canExecuteProposal({actionType:'timeline.add',status:'draft'},{confirmed:false}),false);
assert.equal(core.canExecuteProposal({actionType:'timeline.add',status:'draft'},{confirmed:true}),true);

const safe=core.sanitize({
  email:'hidden@example.test',
  token:'secret',
  nested:{safe:'visible',phone:'hidden'},
  list:Array.from({length:70},(_,index)=>index)
});
assert.deepEqual(JSON.parse(JSON.stringify(safe)),{
  nested:{safe:'visible'},
  list:Array.from({length:50},(_,index)=>index)
});

const envelope=core.createContextEnvelope({
  capability:'brain.ask',
  createdAt:'2026-08-23T12:00:00.000Z',
  projections:[
    {contractId:'trip.v1',owner:'trip',revision:'7',data:{id:'trip-1',email:'hidden@example.test'}},
    {contractId:'places.v1',owner:'places',data:{count:4}}
  ],
  currentMoment:{surface:'dashboard',access_token:'hidden'}
});
assert.equal(envelope.projections.length,2);
assert.equal(envelope.projections[0].data.id,'trip-1');
assert.equal('email' in envelope.projections[0].data,false);
assert.equal('access_token' in envelope.currentMoment,false);

const ranking=core.validateOutput('candidate_ranking',{
  rankings:[{entityId:'p-1',score:120,confidence:2,reasons:['Passend','Passend'],unknowns:[]}]
});
assert.equal(ranking.rankings[0].score,100);
assert.equal(ranking.rankings[0].confidence,1);
assert.deepEqual([...ranking.rankings[0].reasons],['Passend']);
assert.equal(Object.isFrozen(ranking),true);

const signal=core.normalizeSignal({
  id:'signal-1',
  signal_key:'quiet-cafes',
  category:'atmosphere',
  value:{label:'ruhig'},
  confidence:.84,
  status:'inferred'
});
assert.equal(signal.signalKey,'quiet-cafes');
assert.equal(core.transitionSignal(signal,'confirmed').status,'confirmed');
assert.throws(
  ()=>core.transitionSignal(signal,'executed'),
  error=>error?.code==='INTELLIGENCE_SIGNAL_TRANSITION_DENIED'
);

const memory=core.projectMemorySnapshot({
  loaded:true,
  revision:3,
  signals:[signal,{signal_key:'terrace',status:'dismissed',category:'dining',value:{label:'Terrasse'}}]
});
assert.equal(memory.summary.total,2);
assert.equal(memory.summary.byStatus.inferred,1);
assert.equal(memory.summary.byStatus.dismissed,1);

const proposal=core.createProposalIntent({
  capability:'timeline.propose',
  tripId:'trip-1',
  payload:{changes:[{action:'add',title:'Museum'}],authorization:'hidden'},
  explanation:'Ein Entwurf'
});
assert.equal(proposal.status,'draft');
assert.equal(proposal.requiresConfirmation,true);
assert.equal(proposal.mutationOwner,'journey');
assert.equal('authorization' in proposal.actionPayload,false);
assert.throws(
  ()=>core.transitionProposal(proposal,'accepted'),
  error=>error?.code==='INTELLIGENCE_CONFIRMATION_REQUIRED'
);
const accepted=core.transitionProposal(proposal,'accepted',{confirmed:true});
assert.throws(
  ()=>core.transitionProposal(accepted,'executed'),
  error=>error?.code==='INTELLIGENCE_OWNER_COMMAND_REQUIRED'
);
assert.equal(core.transitionProposal(accepted,'executed',{ownerCommand:true}).status,'executed');

const evidence=core.createEvidenceState({now:()=> '2026-08-23T12:00:00.000Z'});
assert.equal(evidence.put([{id:'e-1',kind:'provider-fact',value:'open',email:'hidden'}],{capability:'brain.ask'}),1);
assert.equal(evidence.get('e-1').value,'open');
assert.equal('email' in evidence.get('e-1'),false);
assert.equal(evidence.diagnostics().byKind['provider-fact'],1);
evidence.clear();
assert.equal(evidence.diagnostics().count,0);

const system=core.createSystemSnapshot({
  status:'ready',
  provider:'edge-provider',
  serverAuthoritativeModels:true,
  runtimeVersion:'4.22.1'
});
assert.equal(system.ownership.truth,'intelligence-specific-state-only');
assert.equal(system.ownership.foreignDomainMutation,false);
assert.equal(system.ownership.journeyTimelineOwner,false);
assert.equal(system.ownership.experienceOwnership,false);
assert.deepEqual([...system.sourceContracts].sort(),[
  'identity.v1','intelligence.v1','journey.projection','places.v1','trip.context.v1','trip.v1'
].sort());

console.log('M8.5.1 Intelligence Domain Contract Core: PASS');
