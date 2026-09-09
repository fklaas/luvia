'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const read=file=>fs.readFileSync(file,'utf8'),copy=value=>JSON.parse(JSON.stringify(value));
const harness=new Function('require',read('tests/trip-composer-recovery.test.cjs').split('\n(async()=>{\n  let checks=0;')[0]+'\nreturn harness;')(require);
let checks=0;const check=fn=>{fn();checks++};
(async()=>{
  globalThis.Deno={env:{get:name=>name==='OPENAI_API_KEY'?'fixture':undefined}};
  const load=file=>import(pathToFileURL(path.resolve('supabase/functions/luvia-intelligence/'+file)));
  const web=await load('providers/web-research.ts'),provider=await load('providers/openai.ts'),{capability}=await load('capabilities/registry.ts');
  const input={destination:{name:'Valencia',countryCode:'ES',privateAddress:'hidden'},needs:[{category:'activities',query:'Escape Room zum Mitmachen'}],profile:{health:'hidden'},maxToolCalls:100};
  check(()=>assert.deepEqual(web.researchInput(input),{destination:{name:'Valencia',countryCode:'ES'},needs:[{category:'activities',query:'Escape Room zum Mitmachen'}]}));
  check(()=>assert.throws(()=>web.researchInput({}),{code:'WEB_RESEARCH_INPUT_REQUIRED'}));
  for(const url of ['javascript:alert(1)','file:///private','http://localhost/x','https://127.0.0.1/x','https://user:pass@example.com/x'])check(()=>assert.equal(web.publicSourceUrl(url),''));
  check(()=>assert.equal(web.researchEnabled('https://x/functions/v1/luvia-intelligence'),false));
  check(()=>assert.equal(web.researchEnabled('https://x/functions/v1/luvia-intelligence-integration'),true));
  const offer={name:'Escape Valencia',category:'activities',description:'Ein Rätsel gemeinsam lösen.',address:'Valencia',sourceUrl:'https://example.org/escape'};
  const json={status:'completed',id:'response-fixture',usage:{input_tokens:8000,output_tokens:2000,total_tokens:10000},output:[
    {type:'message',phase:'commentary',content:[{type:'output_text',text:'Ich recherchiere.'}]},
    {type:'web_search_call',status:'completed',action:{type:'search',sources:[{url:offer.sourceUrl,title:'Escape Angebot'}]}},
    {type:'web_search_call',status:'completed',action:{type:'open_page',url:offer.sourceUrl}},
    {type:'message',phase:'final_answer',content:[{type:'output_text',text:JSON.stringify({offers:[offer,{...offer,name:'Erfunden',sourceUrl:'https://example.org/not-retrieved'},{...offer,name:'Park',category:'nature'}]})}]}
  ]};
  let requests=[];globalThis.fetch=async(_url,init)=>{requests.push(JSON.parse(init.body));return new Response(JSON.stringify(json),{status:200});};
  const args={capability:capability(web.WEB_RESEARCH_CAPABILITY),tier:'deep',input,context:{privateProfile:'hidden'},safetyId:'fixture'};
  const response=await provider.runOpenAI(args),body=requests[0];
  check(()=>assert.equal(requests.length,1));check(()=>assert.equal(body.model,'gpt-5.6-luna'));
  check(()=>assert.equal(body.max_tool_calls,2));check(()=>assert.equal(body.max_output_tokens,2400));
  check(()=>assert.equal(body.tools[0].return_token_budget,'default'));check(()=>assert.equal(body.tools[0].search_context_size,'low'));
  check(()=>assert.equal(body.store,false));check(()=>assert.equal(body.tool_choice,'required'));
  check(()=>assert.deepEqual(body.include,['web_search_call.action.sources']));
  check(()=>assert.doesNotMatch(JSON.stringify(body.input),/privateProfile|privateAddress|hidden|maxToolCalls/));
  check(()=>assert.equal(response.result.offers.length,1,'Only consulted URLs and requested categories are admitted'));
  check(()=>assert.equal(response.result.offers[0].placeVerified,false));check(()=>assert.equal(response.result.offers[0].source.url,offer.sourceUrl));
  check(()=>assert.equal(response.usage.webSearchCalls,2));check(()=>assert.equal(response.usage.webToolCostUsd,0.02));
  requests=[];globalThis.fetch=async(_url,init)=>{requests.push(JSON.parse(init.body));return new Response(JSON.stringify({error:{code:'unsupported_model',message:'Unsupported model'}}),{status:400});};
  await assert.rejects(provider.runOpenAI(args),{code:'unsupported_model'});checks++;
  check(()=>assert.equal(requests.length,1,'Paid web research never escalates models automatically'));
  globalThis.fetch=async()=>{throw Error('connection lost')};let lost;try{await provider.runOpenAI(args)}catch(error){lost=error;}
  check(()=>assert.equal(lost.code,'OPENAI_NETWORK_ERROR'));check(()=>assert.equal(lost.usage.webUsageKnown,false,'Transport failure does not prove zero billing'));
  const h=harness();h.sandbox.URL=URL;h.sandbox.location={hostname:'integration-luvia.fixture'};h.state.workflowId='11111111-1111-4111-8111-111111111111';
  h.state.data.tripPreferences.interests=['active'];h.state.aiDraft.brief={travelOrder:{categories:[{category:'activities'}]},tripPreferences:copy(h.state.data.tripPreferences)};
  let searches=0;h.sandbox.LuviaAI={...h.sandbox.LuviaAI,run:async(id,request)=>{assert.equal(id,web.WEB_RESEARCH_CAPABILITY);searches++;return {ok:true,meta:{fallback:false},data:{...response.result,offers:[{...response.result.offers[0],name:'Bowling am Meer'}]}};}};
  const bowling={...h.candidate('activities',101),name:'Bowling am Meer',primaryType:'bowling_alley',types:['bowling_alley']};
  const candidates=[bowling],snapshot=copy(candidates);
  const first=await h.api.readTripWebPlaces(h.state,h.state.aiDraft.brief,candidates,{});
  check(()=>assert.equal(searches,1));check(()=>assert.equal(first.places.length,1));
  check(()=>assert.deepEqual(candidates,snapshot,'Research does not mutate the existing pool'));
  const merged=h.api.mergeAiPlaceResults(h.state,{places:candidates},first);
  check(()=>assert.equal(merged.places.length,1));check(()=>assert.equal(merged.places[0].tripWebResearch.source.url,offer.sourceUrl));
  check(()=>assert.equal(h.api.retainedPoolCandidate(merged.places[0]).tripWebResearch.availability,'unverified'));
  h.state.aiDraft.places=merged.places;
  check(()=>assert.match(h.api.routeResearchSource(h.state,{providerPlaceId:bowling.providerPlaceId,name:bowling.name}),/Angebot ansehen/));
  await h.api.readTripWebPlaces(h.state,h.state.aiDraft.brief,merged.places,first.webResearch);
  check(()=>assert.equal(searches,1,'Completed web research survives resume without a new paid request'));
  const park={...bowling,primaryType:'park',types:['park']};
  h.sandbox.LuviaPlacesContractV1={...h.sandbox.LuviaPlacesContractV1,reads:{...h.sandbox.LuviaPlacesContractV1.reads,recommend:async()=>({places:[park]})}};
  const wrong=await h.api.readTripWebPlaces(h.state,h.state.aiDraft.brief,[park],{});
  check(()=>assert.equal(wrong.places.length,0,'A researched name does not turn a park into a participatory activity'));
  const migration=read('supabase/migrations/20260909223000_intelligence_web_research_budget.sql'),jobs=read('supabase/functions/luvia-intelligence/jobs/trip-plan.ts');
  check(()=>assert.match(migration,/pg_advisory_xact_lock/));check(()=>assert.match(migration,/unique index[\s\S]*\(workflow_id\)/));
  check(()=>assert.match(migration,/new.attempt_count > 1/));check(()=>assert.match(migration,/>= 100/));check(()=>assert.match(migration,/>= 5/));
  check(()=>assert.match(jobs,/!research&&prior.status==='failed'/));
  console.log(`P17 bounded web research, sources, costs and recovery: ${checks}/${checks} PASS`);
})().catch(error=>{console.error(error);process.exitCode=1;});
