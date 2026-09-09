/* M8.5 – dashboard Intelligence Contract adoption and transparency */
const fs=require('fs'),assert=require('assert');
const dashboard=fs.readFileSync('core/ai/ai-dashboard-service.js','utf8');
const core=fs.readFileSync('core/ai/ai-core.js','utf8');
const domainCore=fs.readFileSync('core/intelligence/intelligence-domain-contract-core.js','utf8');
const app=fs.readFileSync('app/app-shell.js','utf8');
for(const token of ["id:'aiBrain'",'dashboard.brief','data-ai-transparency-open','data-ai-ask-open','So denkt Luvia'])assert(dashboard.includes(token),`dashboard Intelligence missing ${token}`);
for(const method of ['ask','recommend','rank','explain','summarize','proposeAction','learnFromEvent','subscribe'])assert(core.includes(method),`transitional LuviaAI facade missing ${method}`);
for(const capability of ['brain.ask','discovery.plan','discovery.rank','dashboard.brief','timeline.propose','memory.extract','text.summarize'])assert(domainCore.includes(capability),`owner capability missing ${capability}`);
assert(app.includes('luvia:dashboard-widget-refresh'),'app shell does not refresh Intelligence widget');
assert(app.includes('lv-ai-global-trigger')&&app.includes('data-ai-ask-open'),'global Luvia Intelligence trigger is not available across app views');
assert(dashboard.includes('openChat:askModal'),'global chat is not exported by the Intelligence service');
assert(dashboard.includes('openTransparency:transparencyModal'),'Intelligence Transparency is not exported');
assert(!dashboard.includes('data-ai-timeline-check'),'dashboard must not expose private Timeline execution');
assert(!dashboard.includes('LuviaTripContext'),'dashboard must read Trip through trip.v1');
console.log('Dashboard Intelligence Contract and Transparency: OK');

(async()=>{
  const vm=require('node:vm'),events=new Map(),documentEvents=new Map(),queued=[];
  let visible=false,calls=0;
  const trip={id:'test-trip'},node={dataset:{aiBriefTripId:trip.id},getClientRects:()=>visible?[{}]:[],closest:()=>null};
  const sandbox={console,Map,Date,Promise,Array,Set,Intl,URL,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}},queueMicrotask:fn=>queued.push(fn),document:{visibilityState:'visible',querySelectorAll:()=>[node],addEventListener:(type,fn)=>documentEvents.set(type,fn)},addEventListener:(type,fn)=>events.set(type,fn),dispatchEvent:event=>events.get(event.type)?.(event)};
  sandbox.window=sandbox;sandbox.globalThis=sandbox;
  sandbox.LuviaTripContractV1={reads:{getActiveTrip:()=>trip}};
  sandbox.LuviaIntelligenceContractV1={run:async()=>{calls++;return{data:{headline:'Guter Tag',message:'Euer Plan',highlights:[]},meta:{}}}};
  sandbox.LuviaJourneyKnowledgeGraph={load:async()=>{events.get('luvia:journey-context-changed')?.({detail:{reason:'loaded'}});return{plannedVisits:[]}}};
  vm.createContext(sandbox);vm.runInContext(dashboard,sandbox);
  sandbox.LuviaAIDashboard.setBriefVisibilityReader(id=>sandbox.document.visibilityState!=='hidden'&&visible&&id===trip.id);
  const settle=async()=>{while(queued.length)await queued.shift()();await new Promise(setImmediate)};
  events.get('luvia:journey-context-changed')({detail:{reason:'invalidated'}});sandbox.LuviaAIDashboard.render({trip});await settle();
  assert.equal(calls,0,'No paid dashboard briefing when its widget is not visible, including Composer background renders');
  visible=true;sandbox.LuviaAIDashboard.render({trip});await settle();assert.equal(calls,1);
  for(let i=0;i<12;i++)sandbox.LuviaAIDashboard.render({trip});await settle();assert.equal(calls,1,'Repeated renders and graph load events reuse the visible briefing');
  sandbox.document.visibilityState='hidden';events.get('luvia:journey-context-changed')({detail:{reason:'invalidated'}});await settle();assert.equal(calls,1,'Lock/app switch defers automatic billing');
  sandbox.document.visibilityState='visible';await sandbox.LuviaAIDashboard.refresh(trip,{automatic:true});await settle();assert.equal(calls,2,'Changed briefing refreshes once when the actual widget becomes visible');
  await sandbox.LuviaAIDashboard.refresh(trip,{force:true});assert.equal(calls,3,'An explicit user refresh remains available');
  console.log('Dashboard visible-only automatic billing: 5 behavioral checks PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
