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
  const sixNeeds=['activities','nightlife','food','water','shopping','culture','nature'].map((category,index)=>({category,query:`Konkreter Wunsch ${index+1}`}));
  check(()=>assert.deepEqual(web.researchInput({...input,needs:sixNeeds}).needs,sixNeeds.slice(0,6),'Every semantic need up to the discovery-plan contract limit reaches one bounded research run'));
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
  // The public Valencia response included these wishes after the eighth goal.
  // Exercise the real contract boundary, not an already-normalized fixture.
  const goal=(type,label,key='category',value=type)=>({type,label,hardConstraints:[{key,value,label}],softPreferences:[],timeWindow:null,source:'request'});
  const rawBrief={goals:[...Array.from({length:8},(_,i)=>goal('destination',`Rahmen ${i+1}`,'destination','Valencia')),goal('nightlife','Bars und Nachtleben'),goal('active','Escape Room oder Bowling','experienceWish','Escape Room oder Bowling'),...Array.from({length:11},(_,i)=>goal('accommodation',`Unterkunftswunsch ${i+1}`,'accommodation',`Wunsch ${i+1}`)),goal('food','Vegetarisch essen','dietary','vegetarian')],softPreferences:[{key:'movementStyle',value:'city_transit',label:'Bus und Bahn sind okay'}],conflictAssessment:{status:'none',summary:'Keine wesentliche Spannung.',tensions:[]}};
  const semantic=h.sandbox.LuviaIntelligenceDomainContractCoreV1.validateOutput('planning_dialogue',rawBrief);
  check(()=>assert.equal(semantic.goals.length,22,'No goal shortlist may replace the full travel order'));
  const projected=h.sandbox.LuviaTripPreferenceResolutionCoreV1.projectTripBrief(h.state.data,{ok:true,meta:{fallback:false},data:semantic});
  check(()=>assert.ok(projected.travelOrder.categories.some(x=>x.category==='nightlife')));
  check(()=>assert.ok(projected.travelOrder.categories.some(x=>x.category==='active')));
  check(()=>assert.ok(projected.travelOrder.categories.some(x=>x.category==='food'),'Requirements beyond goal twenty also survive'));
  check(()=>assert.ok(projected.travelOrder.experiences.wishes.includes('Escape Room oder Bowling')));
  h.state.aiDraft.brief=projected;
  h.sandbox.LuviaGlobalPlaceContracts={filterIntent:(value,category)=>category==='water'&&/Hafen/i.test(value)?{explicit:true,includedTypes:['marina']}:{explicit:false,includedTypes:[]}};
  const structuredAnchors=h.api.deterministicTripAnchorPlans(h.state,{...projected,travelOrder:{...projected.travelOrder,categories:[...projected.travelOrder.categories,{category:'water',label:'Meer',importance:'required'},{category:'shopping',label:'Shopping',importance:'preferred'}],mustDo:['Ein langer Strandtag','Hafen','Vegetarische Restaurants','Lebendige Bars'],experiences:{wishes:['Shopping in Einkaufszentren']}}});
  check(()=>assert.ok(structuredAnchors.some(item=>item.category==='water'&&item.includedTypes.includes('marina')),'A structured harbour promise survives an AI search-plan timeout'));
  check(()=>assert.deepEqual(copy(h.api.tripWebResearchNeeds(h.state,[])).map(x=>x.category),['nightlife','activities','food','culture'],'Every missing requested category reaches the bounded research plan; later wishes are not truncated'));
  const conflicted=h.sandbox.LuviaIntelligenceDomainContractCoreV1.validateOutput('planning_dialogue',{...rawBrief,conflictAssessment:{status:'tradeoff',summary:'Zwei unterschiedliche Schwerpunkte.',tensions:[{id:'radius',label:'Welche Wege passen?',reason:'Strand und Nachtleben liegen auseinander.',decisionNeeded:true,variants:[{id:'beach',label:'Am Strand',preserves:'Strandnähe',relaxes:'Kurze Abendwege',effect:'Abends mit der Bahn'},{id:'city',label:'In der Stadt',preserves:'Kurze Abendwege',relaxes:'Strand vor der Tür',effect:'Tagsüber mit der Bahn'}]}]}});
  check(()=>assert.equal(h.sandbox.LuviaTripPreferenceResolutionCoreV1.projectTripBrief(h.state.data,{ok:true,meta:{fallback:false},data:conflicted}).question?.kind,'conflict','A real conflict must reach the user before research'));
  const projectBudget=(key,value)=>h.sandbox.LuviaTripPreferenceResolutionCoreV1.projectTripBrief(h.state.data,{ok:true,meta:{fallback:false},data:h.sandbox.LuviaIntelligenceDomainContractCoreV1.validateOutput('planning_dialogue',{...rawBrief,goals:rawBrief.goals.slice(8,10),hardConstraints:[{key,value,label:value}]})});
  check(()=>assert.equal(projectBudget('tripBudget','mittleres Budget').automaticPlanningAllowed,true,'A qualitative budget is not an unverified spending ceiling'));
  check(()=>assert.equal(projectBudget('tripBudget','mittleres Budget').travelOrder.budget.tripTotal,''));
  for(const key of ['tripBudget','dailyBudget'])check(()=>assert.equal(projectBudget(key,'maximal 1500 EUR').automaticPlanningAllowed,false,'A real hard amount is never relaxed'));
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
  const legacyResolution=copy(first.webResearch);delete legacyResolution.resolutionVersion;legacyResolution.complete=true;legacyResolution.checkedSources=[offer.sourceUrl+'|Bowling am Meer'];legacyResolution.matchedCount=0;
  const recovered=await h.api.readTripWebPlaces(h.state,h.state.aiDraft.brief,merged.places,legacyResolution);
  check(()=>assert.equal(searches,1,'An older zero-match report is resolved again without another paid web request'));
  check(()=>assert.equal(recovered.places.length,1,'Already paid source leads are no longer stranded by an obsolete resolution result'));
  const park={...bowling,primaryType:'park',types:['park'],profileFit:{state:'blocked'},recommendation:{constraintState:'satisfied'}};
  h.sandbox.LuviaPlacesContractV1={...h.sandbox.LuviaPlacesContractV1,reads:{...h.sandbox.LuviaPlacesContractV1.reads,recommend:async()=>({places:[park]})}};
  const sourced=await h.api.readTripWebPlaces(h.state,h.state.aiDraft.brief,[park],{});
  check(()=>assert.equal(sourced.places.length,1,'An exact source-bound Place identity is not discarded merely because it has no previous profile evidence'));
  check(()=>assert.equal(h.sandbox.LuviaIntelligenceContractV1.reads.tripPlaceExperienceFit({place:sourced.places[0],brief:h.state.aiDraft.brief,tripPreferences:h.state.aiDraft.brief.tripPreferences}).eligible,true));
  const unrelated={...park,name:'City Park'};h.sandbox.LuviaPlacesContractV1={...h.sandbox.LuviaPlacesContractV1,reads:{...h.sandbox.LuviaPlacesContractV1.reads,recommend:async()=>({places:[unrelated]})}};
  const wrong=await h.api.readTripWebPlaces(h.state,h.state.aiDraft.brief,[unrelated],{});
  check(()=>assert.equal(wrong.places.length,0,'A sourced experience never attaches to a different Place name'));
  const migration=read('supabase/migrations/20260909223000_intelligence_web_research_budget.sql'),jobs=read('supabase/functions/luvia-intelligence/jobs/trip-plan.ts');
  check(()=>assert.match(migration,/pg_advisory_xact_lock/));check(()=>assert.match(migration,/unique index[\s\S]*\(workflow_id\)/));
  check(()=>assert.match(migration,/new.attempt_count > 1/));check(()=>assert.match(migration,/>= 100/));check(()=>assert.match(migration,/>= 5/));
  check(()=>assert.match(jobs,/!research&&prior.status==='failed'/));
  console.log(`P17 bounded web research, sources, costs and recovery: ${checks}/${checks} PASS`);
})().catch(error=>{console.error(error);process.exitCode=1;});
