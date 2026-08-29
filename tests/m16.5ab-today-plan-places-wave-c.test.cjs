'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n?/g,'\n');
const sandbox={Object,Array,Map,Set,Date,Math,Number,String,Boolean,RegExp,JSON};
vm.createContext(sandbox);
vm.runInContext(read('core/journey/journey-domain-contract-core.js'),sandbox);
vm.runInContext(read('core/intelligence/trip-preference-resolution-core.js'),sandbox);
vm.runInContext(read('app/today/today-composition-core.js'),sandbox);

const journey=sandbox.LuviaJourneyDomainContractCoreV1.compose({
  now:'2027-06-13T09:00:00.000Z',
  trip:{id:'trip-wave-c',title:'Ostseeurlaub',destination:{name:'Scharbeutz'},startDate:'2027-06-13',endDate:'2027-06-13'},
  entries:[{id:'breakfast',title:'Frühstück am Meer',source:'place-data',entityType:'restaurant',startAt:'2027-06-13T09:00:00.000Z',endAt:'2027-06-13T10:00:00.000Z'}]
});
assert.equal(journey.days.length,1);
assert.ok(journey.days[0].openGaps.some(item=>item.durationMinutes>=60),'Journey must derive usable open gaps without owning schedule truth');
assert.equal(journey.days[0].openGaps[0].owner,'journey');

const resolver=sandbox.LuviaTripPreferenceResolutionCoreV1;
const resolution=resolver.resolve({trip:{id:'trip-wave-c'},profilePreferences:{dietaryPreferences:['vegetarian'],travelPace:'relaxed',travelInterests:['culture']},tripComposition:{feelings:['curious','together']}});
const guidance=resolver.composeDayGuidance({resolution,dayGraph:journey});
assert.equal(guidance.owner,'intelligence');
assert.equal(guidance.persisted,false);
assert.equal(guidance.suggestion.requiresConfirmation,true);
assert.equal(guidance.suggestion.route,'places');
assert.equal(guidance.suggestion.targetDate,'2027-06-13');
assert.ok(guidance.suggestion.reasons.length>=2);

const today=sandbox.LuviaTodayCompositionCoreV1.compose({trip:{title:'Ostseeurlaub',destination:'Scharbeutz'},viewer:{displayName:'Fabian'},travel:{phase:'during',tripDay:1},network:{online:true},clock:{hour:9},journey,preferenceGuidance:guidance});
assert.equal(today.suggestion.requiresConfirmation,true);
assert.equal(today.journey.day.date,'2027-06-13');
assert.equal(today.provenance.domainTruth,false);

const places=read('app/places/places-spatial-experience.js');
const todayExperience=read('app/today/today-experience.js');
const appShell=read('app/app-shell.js');
const journeyComposer=read('app/journey/journey-day-composer.js');
const suggestionSheet=read('app/journey/journey-suggestion-sheet.js');
const preferenceAdapter=read('app/adapters/trip-preference-context-adapter.js');
const journeyCss=read('app/journey/journey-day-composer.css');
const todayCss=read('app/today/today-experience.css');
const moduleHubs=read('app/module-hubs.js');
const compassCss=read('app/module-hubs.css');
const index=read('index.html');
const sw=read('sw.js');
assert.match(places,/profilePreferences:context\.profilePreferences/,'productive Places request must receive Identity preferences');
assert.match(places,/tripComposition:context\.tripComposition/,'productive Places request must receive Trip composition');
assert.match(places,/destinationContext:destinationContext\(context\.trip\|\|state\.trip\)/,'productive Places request must carry the canonical trip destination into discovery');
assert.match(places,/Luvia-KI ordnet · Fakten sichern ab/,'Places must disclose successful semantic AI ranking');
assert.match(places,/Regelbasiert abgesichert · KI gerade nicht verfügbar/,'Places must disclose the safe fallback instead of pretending AI ran');
const discovery=read('app/adapters/places-discovery-adapter.js');
assert.match(discovery,/destination:options\.destinationContext\|\|options\.trip\|\|options\.destination\|\|null/,'every provider query must receive an explicit destination context');
assert.match(discovery,/catch\(error\)[\s\S]*attempts\.push/,'a failed query variant must not abort the complete discovery cascade');
assert.match(discovery,/globalProfileSignals:compact\(resolution\?\.profileSignals\)/,'AI ranking must receive the resolved global profile layer');
assert.match(discovery,/tripSignals:compact\(resolution\?\.tripSignals\)/,'AI ranking must receive the trip-only preference layer');
assert.match(todayExperience,/data-today-destination-image/);
assert.match(todayExperience,/lvt-today-focus/,'Today must use the accepted single-screen focus composition');
assert.match(todayExperience,/lvt-weather/,'Today must expose destination weather without blocking boot');
assert.match(todayExperience,/lvt-companions/,'Today must expose companion presence');
assert.match(todayExperience,/lvt-metrics/,'Today must expose countdown and owner-backed travel counts');
assert.match(todayExperience,/LuviaJourneySuggestions/,'Today must resolve concrete owner-backed suggestions instead of rendering raw AI search text');
assert.match(todayExperience,/Places belegt die Fakten · Luvia ordnet · ihr bestätigt/,'the visible suggestion flow must explain its evidence and confirmation boundary');
assert.match(todayExperience,/data-today-suggestion-add/);
assert.match(todayExperience,/data-view="timeline"/,'Today must open the separate Timeline surface');
assert.match(todayExperience,/lvt-briefing-deck/,'Today must consolidate the briefing instead of stacking independent cards over the photograph');
assert.match(todayCss,/\.lvt-today-focus \.lvt-briefing-deck/,'the consolidated Today briefing must have a dedicated responsive composition');
assert.match(journeyComposer,/function renderTimeline\(/,'Journey must render a dedicated productive Timeline');
assert.match(journeyComposer,/data-journey-timeline/);
assert.match(journeyComposer,/data-timeline-date/);
assert.match(journeyComposer,/Luvia Day Pulse/);
assert.match(journeyComposer,/LuviaJourneySuggestions\?\.open/,'Timeline gaps must open the structured suggestion sheet');
assert.doesNotMatch(journeyComposer,/show\?\.\('places'/,'Timeline may no longer redirect a gap to the raw Places search');
assert.match(suggestionSheet,/reads\?\.recommend|reads\.recommend/,'the suggestion sheet must ask Places for real provider candidates');
for(const category of ['nature','culture','activities','food'])assert.match(suggestionSheet,new RegExp(`${category}:1`),`the shared suggestion owner must search the ${category} category instead of collapsing everything into restaurants`);
assert.match(suggestionSheet,/if\(diversified\.length<3\)/,'a sheet promising three choices must reject an incomplete one-card result');
assert.match(suggestionSheet,/if\(selected\.length>=3\)return selected\.slice\(0,3\)/,'diverse category searches must still render exactly three choices');
assert.match(suggestionSheet,/diversified\.map\(enrich\)/,'exactly the diversified three candidates must be enriched and rendered');
assert.match(preferenceAdapter,/async function sharedGroup/,'the preference adapter must expose a trip-scoped group projection');
assert.match(preferenceAdapter,/from\?\.\('trip_preferences'\)/,'shared traveler preferences must come from the trip-member-readable owner table');
assert.match(suggestionSheet,/profileContext:\{groupTravelers:/,'AI ranking must receive the released preference projection for every covered traveler');
assert.match(suggestionSheet,/Passt besonders zu/,'each suggestion must explain which covered traveler it fits');
assert.match(suggestionSheet,/noch nicht sicher passend/,'missing provider evidence must be stated instead of inventing a fit for a traveler');
assert.match(suggestionSheet,/priceLabel\(place\)/,'Google Places price evidence must remain visible on suggestion cards');
assert.match(suggestionSheet,/const canonicalPlaceType=place/,'provider primary types must be mapped into a registered Places owner type before import');
assert.match(suggestionSheet,/journey\?\.commands\?\.hydrate\?\.\(tid\)/,'a confirmed Places write must rehydrate the Timeline owner');
assert.match(suggestionSheet,/const isBookable=place=>\['food','cafe'\]\.includes/,'only gastronomic proposals may expose the Booking Core handoff');
assert.match(suggestionSheet,/commands\.importPlace/,'confirmed suggestions must cross the public Places import command');
assert.match(suggestionSheet,/commands\.plan/,'confirmed suggestions must cross the public Places planning command');
assert.match(suggestionSheet,/explicitConfirmation:true/,'the orchestration boundary must remain explicitly confirmable');
assert.match(suggestionSheet,/persistence:'ephemeral-cache-only'/,'unconfirmed suggestions must remain transient');
assert.doesNotMatch(suggestionSheet,/localStorage|sessionStorage|supabase|\.rpc\(/,'the consumer orchestrator may not create private persistence or backend truth');
assert.doesNotMatch(moduleHubs,/Tagesübersicht/,'Today remains the separate start dashboard; Reise navigation must expose only the accepted Timeline');
assert.match(moduleHubs,/feature\('Timeline','Alle Tage, Momente und offene Zeitfenster'/,'Reise Compass must expose the single accepted Timeline direction');
assert.match(journeyCss,/\.lvjt-day-panel/);
assert.match(journeyCss,/\.lvjs-sheet \.lvjs-header h2[^{]*\{[^}]*color:#112f44/,'the signed-in theme must not wash out the suggestion sheet heading');
assert.match(journeyCss,/max-height:318px/,'mobile suggestion cards must leave the confirmation actions inside the visible sheet');
assert.match(appShell,/view==='timeline'/,'App Shell must route to Timeline without treating Today as Timeline');
assert.doesNotMatch(appShell,/action==='timeline'\)return show\('today'/,'Timeline may no longer route back into Today');
assert.match(compassCss,/is-navigating \.lv-plan-direction\.is-selected \.lv-plan-direction-idle\{animation:none;transform:none\}/,'selected Compass nodes must not freeze mid-float');
assert.match(compassCss,/@keyframes lv-plan-direction-pop-out\{0%,34%\{opacity:1;filter:none;transform:none\}100%\{opacity:0;filter:blur\(5px\);transform:none\}\}/,'Compass exit may fade but must not translate the selected node');
assert.match(appShell,/LuviaJourneySuggestions\?\.open/,'Today suggestions must use the same structured sheet');
assert.doesNotMatch(appShell,/show\('places',\{source:'today-preference-suggestion'/,'Today may no longer route raw AI text into Places');
assert.match(index,/app\/adapters\/trip-preference-context-adapter\.js\?v=/);
assert.match(index,/app\/journey\/journey-suggestion-sheet\.js\?v=/);
assert.match(sw,/trip-preference-context-adapter\.js/);
assert.match(sw,/journey-suggestion-sheet\.js/);
for(const source of [read('app/adapters/trip-preference-context-adapter.js'),read('core/intelligence/trip-preference-resolution-core.js')]){
  for(const forbidden of ['localStorage','sessionStorage','.rpc(','supabase'])assert.equal(source.includes(forbidden),false,`derived Wave C context must stay browserless/read-only: ${forbidden}`);
}

console.log('M16.5AB Today ↔ Planen ↔ Places Wave C vertical flow and design migration: PASS');
