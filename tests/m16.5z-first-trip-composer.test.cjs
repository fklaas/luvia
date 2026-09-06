'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n?/g,'\n');

const composer=read('app/first-trip-composer.js');
const css=read('app/first-trip-composer.css');
const creator=read('core/trips/trip-creator.js');
const draftCore=read('core/trips/trip-draft-core.js');
const adapter=read('core/platform/trip-contract-adapter.js');
const placesAdapter=read('core/platform/places-contract-adapter.js');
const navigation=read('core/runtime/navigation-contract-core.js');
const shell=read('app/app-shell.js');
const index=read('index.html');
const serviceWorker=read('sw.js');
const fixture=read('tests/fixtures/m16.5z-first-trip-composer-browser.html');

assert.match(composer,/\['welcome','identity','feeling','destination','dates','people','modules','accent','ready'\]/);
assert.match(composer,/guided:Object\.freeze\(\[\.\.\.STEPS\]\)/);
assert.match(composer,/quick:Object\.freeze\(\['welcome','destination','dates','accent','ready'\]\)/);
assert.match(composer,/ai:Object\.freeze\(\['welcome','destination','dates','brief','preview','accent','ready'\]\)/);
for(const label of ['Geführt','Schnellstart','Mit Luvia AI','Anfrage bleibt flüchtig','Reisewünsche gelten für diese Reise','Profiländerungen brauchen Bestätigung'])assert.ok(composer.includes(label),`missing composer copy: ${label}`);
assert.match(composer,/data-ftc-entry-mode/);assert.match(composer,/data-ftc-trip-interest/);assert.match(composer,/data-ftc-durable/);
assert.match(composer,/vollständige Planung aus Freitext ist noch in Arbeit/);
assert.match(composer,/owner\.commands\.createFirstTrip/);
assert.match(composer,/Danach Menschen einladen/);
assert.match(composer,/Profil bleibt Basis · Reisegefühl setzt den Schwerpunkt/);
assert.match(composer,/window\.LuviaPlacesContractV1/);
assert.doesNotMatch(composer,/window\.LuviaPlaces\|\|window\.LuviaPlacesGateway/);
assert.match(composer,/if\(!state\.keyHandler\)/,'composer must install exactly one keyboard handler across re-renders');
assert.match(composer,/Bitte einen Vorschlag aus der Suche wählen/);
assert.match(composer,/PLACES_DESTINATION_TIMEOUT/);assert.match(composer,/data-ftc-destination-retry/);assert.match(composer,/Vorschläge bereit/);assert.match(composer,/Zielsuche nicht erreichbar/);
for(const marker of ['composeDayDraft','getActiveDiscovery','reads.recommend','getCard','mountProjection','rehearseDay','LuviaAIActionRuntime','data-ftc-draft-action','data-ftc-draft-swap'])assert.ok(composer.includes(marker),`missing owner-backed AI day-draft marker: ${marker}`);
for(const copy of ['Einplanen','Vormerken','Tauschen','Weglassen','Erst eure Bestätigung übernimmt die Auswahl'])assert.ok(composer.includes(copy),`missing day-draft choice: ${copy}`);
assert.match(placesAdapter,/destination-cache/);assert.match(placesAdapter,/timeoutMs:Number\(options\.timeoutMs\)\|\|7000/);
const accents=composer.slice(composer.indexOf('const ACCENTS='),composer.indexOf('const SCENES='));
assert.equal((accents.match(/\['[a-z]+','#/g)||[]).length,50,'Composer must expose the same 50 journey tones as the Landingpage');
assert.match(composer,/ftc-ready-symbol/);
for(const forbidden of ['localStorage','sessionStorage','trip_members','.rpc('])assert.equal(composer.includes(forbidden),false,`First Trip Composer bypasses an owner via ${forbidden}`);
for(const moduleId of ['places','journey','booking','wallet-documents','memories','move','collaboration'])assert.ok(composer.includes(`['${moduleId}'`),`missing module ${moduleId}`);
assert.match(css,/\.ftc-host/);assert.match(css,/scrollbar-width:none/);assert.match(css,/\.ftc-entry-modes/);assert.match(css,/\.ftc-ai-owner-draft/);assert.match(css,/\.ftc-ai-map/);assert.match(css,/@media\(max-width:560px\)/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(navigation,/id:'first-trip-composer'.*mode:'fullscreen'.*owner:'trip'/);
assert.match(shell,/explicitFirstTrip\|\|window\.LuviaFirstTripComposer\?\.shouldStart/);
assert.ok(shell.indexOf('explicitOnboarding||window.LuviaProfileOnboarding?.shouldStart')<shell.indexOf('explicitFirstTrip||window.LuviaFirstTripComposer?.shouldStart'),'Identity must complete before the first Trip gate');
assert.ok(shell.indexOf('explicitFirstTrip||window.LuviaFirstTripComposer?.shouldStart')<shell.indexOf('if(!s.hasTrips||!s.hasActiveTrip)return noTrips()'),'First Trip Composer must gate before the legacy empty state');
assert.match(index,/app\/first-trip-composer\.css\?v=/);assert.match(index,/app\/first-trip-composer\.js\?v=/);
assert.match(serviceWorker,/'app\/first-trip-composer\.css'/);assert.match(serviceWorker,/'app\/first-trip-composer\.js'/);
assert.match(fixture,/LuviaFirstTripComposer\.mount/);assert.match(fixture,/createFirstTrip:async/);assert.match(fixture,/data-ftc-complete/);assert.match(fixture,/contractId:'places\.v1'/);
assert.match(adapter,/async function createFirstTrip/);assert.match(adapter,/TRIP_FIRST_IDEMPOTENCY_REQUIRED/);assert.match(adapter,/action:'trip\.first\.create'/);assert.match(adapter,/availability:'reserved'/);
assert.match(adapter,/preferenceHandoff:prepared\.durablePreferenceHandoff/);assert.match(adapter,/requestContext:prepared\.requestContext/);
assert.match(adapter,/composeDayDraft\(draft=\{\},sources=\{\}\)/);assert.match(draftCore,/kind:'owner-backed-ai-day-draft'/);assert.match(draftCore,/sourceContracts:\['places\.v1','journey\.v1'\]/);assert.match(draftCore,/automaticMutation:false/);
assert.match(placesAdapter,/async function suggestDestinations/);assert.match(placesAdapter,/async function getDestination/);assert.match(placesAdapter,/owner:'places',contractId:CONTRACT_ID/);
assert.match(creator,/function deterministicCode/);assert.match(creator,/matchingTrip\(idempotencyKey,joinCode\)/);assert.match(creator,/firstTripComposer:/);assert.match(creator,/preferenceScopeVersion:1/);
assert.doesNotMatch(creator,/firstTripComposer:\{[^}]*requestBrief/s,'request-only brief must not enter persisted Trip settings');

const rpcCalls=[];
const state={trips:[],activeTripId:null,activeTrip:null,loaded:true};
const store={
  snapshot:()=>({...state,hasTrips:state.trips.length>0,hasActiveTrip:Boolean(state.activeTrip)}),
  initialize:()=>store.snapshot(),subscribe:()=>()=>{},
  upsert:(trip,options={})=>{const index=state.trips.findIndex(row=>row.id===trip.id);if(index>=0)state.trips[index]=trip;else state.trips.push(trip);if(options.activate){state.activeTripId=trip.id;state.activeTrip=trip;}},
  setActive:id=>{state.activeTripId=id;state.activeTrip=state.trips.find(row=>row.id===id)||null;},
  loadRemote:async()=>store.snapshot()
};
const context={getActiveTrip:()=>state.activeTrip,getSnapshot:()=>({tripId:state.activeTripId,hasActiveTrip:Boolean(state.activeTrip)})};
const client={auth:{getSession:async()=>({data:{session:{user:{id:'viewer-1'}}}})},rpc:async(name,args)=>{rpcCalls.push({name,args});if(name==='create_trip_with_code')return {data:{trip_id:'trip-1'},error:null};return {data:{ok:true},error:null};}};
const window={
  LuviaTripStore:store,LuviaTripStateReaderV1:{snapshot:store.snapshot},LuviaTripContext:context,ParisCloud:{client},ParisAuth:{getState:()=>({profile:{displayName:'Fabian'}})},
  LuviaRuntime:{refresh(){}},LuviaTheme:{apply(){}},LuviaDestination:{register:value=>value,persistActiveDestination(){}},
  addEventListener(){},dispatchEvent(){},LuviaGlobalContracts:{register(){}},console
};
const sandbox={window,document:{},console,crypto:{randomUUID:()=>`local-${Math.random()}`},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},setTimeout,clearTimeout,Object,Map,Set,Date,Promise,Number,String,Boolean,Array,Math,Error,TypeError};
vm.createContext(sandbox);vm.runInContext(draftCore,sandbox,{filename:'trip-draft-core.js'});vm.runInContext(creator,sandbox,{filename:'trip-creator.js'});vm.runInContext(adapter,sandbox,{filename:'trip-contract-adapter.js'});

const input={title:'Unser Kopenhagen',subtitle:'Viel Luft am Wasser',destination:{name:'Kopenhagen',formattedAddress:'Kopenhagen, Dänemark',country:'Dänemark',countryCode:'DK',placeId:'ChIJIz2AXDxTUkYRuGeU5t1-3QQ',latitude:55.6761,longitude:12.5683},symbol:'✦',accent:'#2897aa',startDate:'2027-06-12',endDate:'2027-06-19',scheduleMode:'fixed',feelings:['slow','together'],privacy:'private',participantPlan:'invite-after-creation',modules:['places','journey','memories'],entryMode:'ai',requestBrief:'Viel Wasser, ruhig frühstücken und zwei besondere Abende.',tripPreferences:{budgetLevel:'balanced',pace:'slow',interests:['food','nature']},durablePreferenceProposal:{requested:true,fields:['interests','budgetLevel']}};

const canonicalPlaces=Array.from({length:8},(_,index)=>({providerPlaceId:`provider-place-${index+1}`,name:`Belegter Ort ${index+1}`,primaryType:index%2?'museum':'restaurant',formattedAddress:`Kopenhagen ${index+1}`,coordinates:{latitude:55.67+index*.001,longitude:12.56+index*.001},image:{url:`https://images.example.test/place-${index+1}.jpg`}}));
const ownerDraft=window.LuviaTripContractV1.composition.composeDayDraft(input,{places:canonicalPlaces,generatedAt:'2026-09-06T12:00:00.000Z'});
assert.equal(ownerDraft.owner,'trip');assert.equal(ownerDraft.contractId,'trip.v1');assert.equal(ownerDraft.kind,'owner-backed-ai-day-draft');assert.deepEqual([...ownerDraft.sourceContracts],['places.v1','journey.v1']);assert.equal(ownerDraft.confirmationRequired,true);assert.equal(ownerDraft.automaticMutation,false);assert.equal(ownerDraft.days.length,3);assert.equal(ownerDraft.days.flatMap(day=>day.entries).length,6);assert.equal(ownerDraft.alternatives.length,2);assert.ok(ownerDraft.days.flatMap(day=>day.entries).every(entry=>entry.owner==='places'&&entry.contractId==='places.v1'&&entry.providerPlaceId&&entry.coordinates));

(async()=>{
  const [first,duplicate]=await Promise.all([
    window.LuviaTripContractV1.commands.createFirstTrip(input,{idempotencyKey:'attempt-42'}),
    window.LuviaTripContractV1.commands.createFirstTrip(input,{idempotencyKey:'attempt-42'})
  ]);
  assert.equal(first,duplicate,'in-flight duplicate must share one receipt');
  assert.equal(first.status,'committed');assert.equal(first.owner,'trip');assert.equal(first.tripId,'trip-1');assert.equal(first.activeTripId,'trip-1');
  assert.equal(first.collaborationHandoff.owner,'collaboration');assert.equal(first.collaborationHandoff.availability,'reserved');
  assert.equal(first.requestContext.scope,'request-only');assert.equal(first.requestContext.retention,'receipt-only');assert.equal(first.requestContext.brief,input.requestBrief);
  assert.equal(first.preferenceHandoff.owner,'identity');assert.equal(first.preferenceHandoff.status,'required');assert.equal(first.preferenceHandoff.confirmationRequired,true);
  assert.equal(rpcCalls.filter(call=>call.name==='create_trip_with_code').length,1,'owner create RPC must execute once');
  const moduleCall=rpcCalls.find(call=>call.name==='luvia_set_trip_modules');
  assert.equal(moduleCall.args.p_settings.firstTripComposer.idempotencyKey,'attempt-42');
  assert.equal(moduleCall.args.p_settings.firstTripComposer.collaborationStatus,'handoff-required');
  assert.equal(moduleCall.args.p_settings.firstTripComposer.entryMode,'ai');
  assert.equal(moduleCall.args.p_settings.firstTripComposer.tripPreferences.budgetLevel,'balanced');
  assert.equal(JSON.stringify(moduleCall.args.p_settings).includes(input.requestBrief),false,'request-only brief must not be persisted in RPC settings');
  assert.equal(first.trip.composition.entryMode,'ai');assert.equal(first.trip.composition.tripPreferences.pace,'slow');
  const retry=await window.LuviaTripContractV1.commands.createFirstTrip(input,{idempotencyKey:'attempt-42'});
  assert.equal(retry,first,'completed retry must return the immutable receipt');
  assert.equal(rpcCalls.filter(call=>call.name==='create_trip_with_code').length,1);
  await assert.rejects(()=>window.LuviaTripContractV1.commands.createFirstTrip({...input,destination:{name:'Nur Text'}},{idempotencyKey:'invalid-place'}),error=>error.code==='TRIP_FIRST_CANONICAL_DESTINATION_REQUIRED');
  console.log('M16.5Z First Trip Composer owner boundary, idempotency and recovery: PASS');
})().catch(error=>{console.error(error);process.exitCode=1;});
