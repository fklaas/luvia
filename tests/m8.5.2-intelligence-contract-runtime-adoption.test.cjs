'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=path=>fs.readFileSync(path,'utf8');
const corePath='core/intelligence/intelligence-domain-contract-core.js';
const adapterPath='core/platform/intelligence-contract-adapter.js';
const dashboard=read('core/ai/ai-dashboard-service.js');
const tools=read('core/ai/ai-tool-registry.js');
const memory=read('core/ai/ai-memory-service.js');
const proposals=read('core/ai/ai-command-proposal-service.js');

for(const [label,source] of [
  ['dashboard',dashboard],
  ['tool registry',tools],
  ['memory',memory],
  ['proposal',proposals]
]){
  assert.equal(source.includes('LuviaTripContext'),false,`${label} still reads private Trip context`);
}
assert.equal(tools.includes('LuviaPlaceRuntime'),false,'tool registry still reads private Places runtime');
assert.equal(tools.includes('LuviaUserPreferences'),false,'tool registry still reads private Identity preferences');
assert.equal(memory.includes('LuviaUserPreferences'),false,'memory still mutates private Identity preferences');
assert.equal(memory.includes('window.LuviaAI?.run'),false,'memory still uses transitional AI facade');
assert.equal(/window\.LuviaAI(?:\.|\?\.)/.test(dashboard),false,'dashboard still uses transitional AI facade');
assert.equal(dashboard.includes('data-ai-timeline-check'),false,'dashboard still exposes direct Timeline execution path');
assert.ok(/document\.addEventListener\('click',[\s\S]*?\},true\);/.test(dashboard),'dashboard actions must use capture delegation so shell handlers cannot intercept Intelligence controls');
for(const token of [
  'data-ai-transparency-open',
  'So denkt Luvia',
  'getSystemSnapshot',
  'getMemorySnapshot',
  'Reise, Orte, Tagesplan',
  'openTransparency:transparencyModal'
])assert.ok(dashboard.includes(token),`Intelligence Transparency missing ${token}`);

const registered=[];
const runtimeCalls=[];
const runtimeSubscribers=new Set();
const proposalSubscribers=new Set();
const memorySubscribers=new Set();
let proposalInput=null;

const window={
  LuviaGlobalContracts:{register(definition){registered.push(definition)}},
  LuviaAI:{
    async run(capability,input,options){runtimeCalls.push({method:'run',capability,input,options});return{ok:true,data:{answer:'ok'},meta:{capability}}},
    async ask(message,options){runtimeCalls.push({method:'ask',message,options});return{ok:true,data:{answer:'Hallo'},meta:{capability:'brain.ask'}}},
    async rank(input,options){return{ok:true,data:{rankings:[]},meta:{input,options}}},
    async recommend(input,options){return{ok:true,data:{rankings:[]},meta:{input,options}}},
    async explain(input,options){return{ok:true,data:{answer:'Belegt'},meta:{input,options}}},
    async summarize(text,options){return{ok:true,data:{summary:text},meta:{options}}},
    diagnostics(){return{version:'4.22.1',provider:'openai-via-edge',serverAuthoritativeModels:true,memory:{loaded:true,count:1},proposals:{confirmationRequired:true}}},
    subscribe(listener){runtimeSubscribers.add(listener);return()=>runtimeSubscribers.delete(listener)}
  },
  LuviaAIProposals:{
    async create(input){proposalInput=structuredClone(input);return{id:'proposal-1',...structuredClone(input)}},
    subscribe(listener){proposalSubscribers.add(listener);return()=>proposalSubscribers.delete(listener)}
  },
  LuviaAIMemory:{
    snapshot(){return{loaded:true,revision:2,signals:[{id:'signal-1',signal_key:'quiet',category:'atmosphere',value:{label:'ruhig'},confidence:.8,status:'inferred'}]}},
    subscribe(listener){memorySubscribers.add(listener);return()=>memorySubscribers.delete(listener)}
  }
};

const context={window,console,Object,Array,Map,Set,WeakSet,Error,TypeError,String,Boolean,Number,Math,JSON,Date,structuredClone};
Object.assign(context,window);
vm.createContext(context);
vm.runInContext(read(corePath),context,{filename:corePath});
vm.runInContext(read(adapterPath),context,{filename:adapterPath});

const api=context.LuviaIntelligenceContractV1;
assert.ok(api,'public Intelligence contract missing');
assert.equal(api.contractId,'intelligence.v1');
assert.equal(api.diagnostics().ready,true);
assert.equal(api.getCapabilities().length,9);
assert.equal(api.getTools().length,12);
assert.equal(api.getSystemSnapshot().ownership.foreignDomainMutation,false);
assert.equal(api.getSystemSnapshot().ownership.journeyTimelineOwner,false);
assert.equal(api.getMemorySnapshot().summary.byStatus.inferred,1);

(async()=>{
  const response=await api.run('brain.ask',{message:'Hallo',email:'hidden@example.test'});
  assert.equal(response.data.answer,'ok');
  assert.equal(Object.isFrozen(response),true);
  await api.ask('Hallo');
  assert.equal(runtimeCalls.length,2);

  const proposal=await api.createProposal({
    capability:'timeline.propose',
    tripId:'trip-1',
    payload:{changes:[],token:'hidden'},
    explanation:'Nur ein Entwurf'
  });
  assert.equal(proposal.id,'proposal-1');
  assert.equal(proposalInput.status,'draft');
  assert.equal(proposalInput.requiresConfirmation,true);
  assert.equal(proposalInput.mutationOwner,'journey');
  assert.equal('token' in proposalInput.actionPayload,false);

  const received=[];
  const unsubscribe=api.subscribe(event=>received.push(event));
  for(const listener of runtimeSubscribers)listener({reason:'ready',email:'hidden@example.test'});
  assert.equal(received.length,1);
  assert.equal(received[0].name,'ai.changed');
  assert.equal('email' in received[0].detail,false);
  unsubscribe();
  assert.equal(runtimeSubscribers.size,0);
  assert.equal(proposalSubscribers.size,0);
  assert.equal(memorySubscribers.size,0);

  assert.equal(registered.length,1);
  assert.equal(registered[0].probe().available,true);
  console.log('M8.5.2 Intelligence Contract Runtime Adoption: PASS');
})().catch(error=>{console.error(error);process.exit(1)});
