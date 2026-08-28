var LuviaTripPreferenceResolutionCoreV1=(()=>{
'use strict';

const VERSION='1.1.0';
const NEUTRAL=/^(?:none|no_|keine|kein|offen|neutral)/i;
const FOOD=/restaurant|cafe|café|bakery|bistro|food|meal|dining|brunch|breakfast|lunch|dinner|bar\b|market|markt/i;
const TAGS=Object.freeze({
  quiet:/quiet|calm|ruhig|still|garden|garten|park|spa|wellness|library|bibliothek|courtyard|hof|retreat|beach|strand/,
  nature:/nature|natur|park|garden|garten|forest|wald|beach|strand|coast|küste|lake|see\b|river|fluss|scenic|aussicht/,
  wellness:/spa|wellness|massage|thermal|sauna|retreat|relax|entspann/,
  scenic:/view|aussicht|panorama|rooftop|terrace|sunset|sunrise|coast|küste|lake|waterfront|ufer/,
  nightlife:/night|nacht|club|bar\b|party|festival|live music|livemusik|concert|konzert/,
  local:/local|lokal|neighbou?rhood|viertel|quartier|artisan|independent|family run|familiengeführt|workshop|atelier/,
  hidden:/hidden|geheim|insider|unknown|unbekannt|passage|courtyard|hof|small|klein|boutique/,
  market:/market|markt|food hall|markthalle|bazaar|basar|farmers/,
  together:/romantic|romant|date|couple|zu zweit|shared|gemeinsam|group|gruppe|reservable|reservier/,
  dining:FOOD,
  active:/hike|wander|cycling|fahrrad|bike|sport|climb|kletter|kayak|paddel|surf|tour|trail|adventure|abenteuer|activity|aktivität/,
  outdoor:/outdoor|draußen|park|garden|garten|beach|strand|forest|wald|trail|hike|wander|cycling|fahrrad|water|wasser/,
  culture:/museum|gallery|galerie|art|kunst|history|geschichte|historic|historisch|architecture|architektur|monument|denkmal|theatre|theater|opera|oper|culture|kultur|castle|schloss|church|kirche/,
  photography:/photo|foto|view|aussicht|panorama|architecture|architektur|street|straße|bridge|brücke|sunset|sunrise/,
  family:/family|famil|children|kinder|playground|spielplatz|zoo|aquarium|amusement|freizeitpark/,
  accessible:/accessible|barriere|wheelchair|rollstuhl|step.free|stufenlos|elevator|aufzug/,
  sustainable:/sustain|nachhalt|organic|bio\b|regional|local|lokal|train|bahn|cycling|fahrrad/
});
const FEELINGS=Object.freeze({
  slow:Object.freeze({label:'Viel Luft',weights:{quiet:14,nature:7,wellness:9,scenic:5,nightlife:-8}}),
  curious:Object.freeze({label:'Neugierig',weights:{local:12,hidden:10,market:6,culture:5}}),
  together:Object.freeze({label:'Zeit füreinander',weights:{together:13,dining:7,scenic:5,quiet:4}}),
  active:Object.freeze({label:'In Bewegung',weights:{active:15,outdoor:10,nature:5,quiet:-3}}),
  culture:Object.freeze({label:'Kultur nah erleben',weights:{culture:16,local:7,market:4}}),
  indulgent:Object.freeze({label:'Genussvoll',weights:{dining:16,market:7,together:4,nightlife:3}})
});
const LABELS=Object.freeze({quiet:'ruhigere Atmosphäre',nature:'Natur und Freiraum',wellness:'Entspannung',scenic:'schöne Ausblicke',nightlife:'Abendleben',local:'lokalen Charakter',hidden:'kleine Entdeckungen',market:'Märkte und Regionales',together:'gemeinsame Zeit',dining:'Genuss',active:'aktive Erlebnisse',outdoor:'Zeit draußen',culture:'Kultur und Geschichte',photography:'Fotomotive',family:'Familienzeit',accessible:'Barrierefreiheit',sustainable:'nachhaltige Wege'});

function clone(value){if(value==null||typeof value!=='object')return value;if(Array.isArray(value))return value.map(clone);return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clone(item)]))}
function immutable(value){if(value==null||typeof value!=='object')return value;if(Array.isArray(value))return Object.freeze(value.map(immutable));return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])))}
function clean(value){return String(value??'').trim()}
function list(value,max=30){return[...new Set((Array.isArray(value)?value:[]).map(item=>clean(item).toLowerCase()).filter(item=>item&&!NEUTRAL.test(item)))].slice(0,max)}
function nestedNeeds(value){if(Array.isArray(value))return value;if(value&&typeof value==='object')return value.needs||value.selected||[];return[]}
function textOf(place={}){return clean([place.name,place.displayName,place.editorialSummary?.text||place.editorialSummary,place.primaryType,place.primaryTypeLabel,place.primary_type,...(place.types||[])].filter(Boolean).join(' ')).toLowerCase()}
function idOf(place={}){return clean(place.providerPlaceId||place.id).replace(/^places\//,'')}
function addWeight(target,key,value){const amount=Number(value||0);if(!key||!Number.isFinite(amount)||!amount)return;target[key]=(target[key]||0)+amount}
function signal(id,label,source,weights){return immutable({id,label,source,weights:{...weights}})}
function addSignal(collection,weights,item){collection.push(item);for(const [key,value] of Object.entries(item.weights||{}))addWeight(weights,key,value)}
function includesAny(values,pattern){return values.some(value=>pattern.test(value))}

function normalizeProfile(input={}){
  const accessibilityNeeds=nestedNeeds(input.accessibilityPreferences),familyNeeds=nestedNeeds(input.familyPreferences);
  return immutable({
    dietary:list(input.dietaryPreferences||input.dietary),
    accessibility:list(input.accessibilityNeeds||(accessibilityNeeds.length?accessibilityNeeds:input.accessibility)),
    family:list(familyNeeds.length?familyNeeds:input.family),
    mobility:list(input.mobilityPreferences||input.mobility),
    interests:list(input.travelInterests||input.interests),
    styles:list(input.travelStyles||input.styles),
    activities:list(input.activityPreferences||input.activities),
    entertainment:list(input.entertainmentPreferences||input.entertainment),
    dining:list(input.diningPreferences||input.dining),
    atmosphere:list(input.atmospherePreferences||input.atmosphere),
    pace:clean(input.travelPace||input.pace).toLowerCase(),
    budget:clean(input.budgetPreference||input.budget).toLowerCase()
  });
}
function hardConstraints(profile){
  const result=[];
  for(const value of profile.dietary)result.push({id:`dietary:${value}`,kind:'dietary',value,label:value.replaceAll('_',' '),source:'identity',required:true});
  for(const value of profile.accessibility)result.push({id:`accessibility:${value}`,kind:'accessibility',value,label:value.replaceAll('_',' '),source:'identity',required:true});
  for(const value of profile.family.filter(value=>/baby|stroller|kinderwagen|child|children/.test(value)))result.push({id:`family:${value}`,kind:'family',value,label:value.replaceAll('_',' '),source:'identity',required:true});
  return result;
}
function profileSignals(profile,weights){
  const output=[];
  const all=[...profile.interests,...profile.styles,...profile.activities,...profile.entertainment,...profile.dining,...profile.atmosphere,...profile.mobility];
  const rules=[
    [/culture|kultur|history|geschichte|authentic/,{culture:7,local:4},'Kultur und lokales Leben'],
    [/culinary|food|essen|cafe|café|restaurant|genuss/,{dining:8,market:3},'Kulinarische Vorlieben'],
    [/nature|natur|beach|strand/,{nature:8,outdoor:5},'Natur und Draußensein'],
    [/photo|foto/,{photography:8,scenic:4},'Fotografie'],
    [/family|famil/,{family:9,together:4},'Familienzeit'],
    [/wellness|relax|entspann/,{wellness:9,quiet:5},'Erholung'],
    [/night|nacht|live.music|festival/,{nightlife:8},'Abend und Musik'],
    [/adventure|abenteuer|active|aktiv|hiking|wandern|cycling|fahrrad|outdoor/,{active:8,outdoor:6},'Aktive Erlebnisse'],
    [/romantic|romant/,{together:9,scenic:4},'Zeit zu zweit'],
    [/sustainable|nachhalt/,{sustainable:9,local:3},'Nachhaltigkeit'],
    [/accessible|barriere/,{accessible:10},'Barrierearme Orte'],
    [/local|lokal|spontan/,{local:7,hidden:4},'Lokale Entdeckungen']
  ];
  for(const [pattern,map,label] of rules){if(includesAny(all,pattern))addSignal(output,weights,signal(`profile:${label.toLowerCase().replace(/\W+/g,'-')}`,label,'identity',map))}
  if(/relaxed|ruhig|slow|entspannt/.test(profile.pace))addSignal(output,weights,signal('profile:pace-relaxed','Entspanntes Reisetempo','identity',{quiet:8,wellness:4}));
  if(/active|aktiv|fast|lebendig/.test(profile.pace))addSignal(output,weights,signal('profile:pace-active','Aktives Reisetempo','identity',{active:8,outdoor:4}));
  return output;
}
function tripSignals(composition={},weights={}){
  const output=[];
  for(const id of list(composition.feelings,3)){
    const definition=FEELINGS[id];if(!definition)continue;
    addSignal(output,weights,signal(`trip:${id}`,definition.label,'trip',definition.weights));
  }
  return output;
}
function resolve(input={}){
  const profile=normalizeProfile(input.profilePreferences||input.profile||{}),weights={};
  const profileLayer=profileSignals(profile,weights),tripLayer=tripSignals(input.tripComposition||input.composition||{},weights),constraints=hardConstraints(profile);
  const activeWeights=Object.entries(weights).filter(([,value])=>value!==0).sort((left,right)=>Math.abs(right[1])-Math.abs(left[1])).map(([id,weight])=>({id,label:LABELS[id]||id,weight}));
  return immutable({
    version:VERSION,owner:'intelligence',kind:'derived-trip-preference-resolution',persisted:false,
    provenance:{profile:'identity.v1',trip:'trip.v1',places:'places.v1'},tripId:clean(input.trip?.id||input.trip?.tripId)||null,
    hardConstraints:constraints,profileSignals:profileLayer,tripSignals:tripLayer,weights,activeWeights,
    summary:{headline:tripLayer.length?'Profil schützt · Reisegefühl gewichtet':'Profil bildet die persönliche Basis',profileCount:profileLayer.length,constraintCount:constraints.length,tripFeelingCount:tripLayer.length,tripFeelings:tripLayer.map(item=>item.label),topWeights:activeWeights.filter(item=>item.weight>0).slice(0,5).map(item=>item.label)}
  });
}

function evidence(place,constraint){
  const features=place.features||{},access=place.accessibilityOptions||place.accessibility||{},hay=textOf(place),value=constraint.value;
  if(constraint.kind==='dietary'){
    if(!FOOD.test(hay))return{state:'not-applicable'};
    if(/vegan/.test(value)){
      if(features.servesVeganFood===true||/vegan/.test(hay))return{state:'confirmed'};
      if(features.servesVeganFood===false)return{state:'conflict'};
      if(features.servesVegetarianFood===false)return{state:'conflict'};
      return{state:'unknown'};
    }
    if(/vegetar/.test(value)){
      if(features.servesVegetarianFood===true||/vegetar|vegan/.test(hay))return{state:'confirmed'};
      if(features.servesVegetarianFood===false)return{state:'conflict'};
      return{state:'unknown'};
    }
    if(hay.includes(value.replaceAll('_',' ')))return{state:'confirmed'};
    return{state:'unknown'};
  }
  if(constraint.kind==='accessibility'){
    if(/wheelchair|rollstuhl|step.free|stufenlos/.test(value)){
      const positive=features.wheelchairAccessible===true||access.wheelchairAccessibleEntrance===true||access.wheelchairAccessibleSeating===true||TAGS.accessible.test(hay);
      const negative=features.wheelchairAccessible===false||access.wheelchairAccessibleEntrance===false;
      return{state:positive?'confirmed':negative?'conflict':'unknown'};
    }
    if(/quiet|ruhig/.test(value))return{state:TAGS.quiet.test(hay)?'confirmed':'unknown'};
    return{state:TAGS.accessible.test(hay)?'confirmed':'unknown'};
  }
  if(constraint.kind==='family'&&/stroller|kinderwagen/.test(value)){
    const positive=features.strollerAccessible===true||features.strollerFriendly===true||access.strollerAccessible===true;
    const negative=features.strollerAccessible===false||features.strollerFriendly===false;
    return{state:positive?'confirmed':negative?'conflict':'unknown'};
  }
  return{state:'unknown'};
}
function matchesTag(place,tag){
  const hay=textOf(place),features=place.features||{};
  if(tag==='together'&&features.goodForGroups===true)return true;
  if(tag==='dining'&&FOOD.test(hay))return true;
  if(tag==='outdoor'&&features.outdoorSeating===true)return true;
  if(tag==='nightlife'&&(features.liveMusic===true||features.servesCocktails===true))return true;
  if(tag==='accessible'&&(features.wheelchairAccessible===true||place.accessibilityOptions?.wheelchairAccessibleEntrance===true))return true;
  return Boolean(TAGS[tag]?.test(hay));
}
function rankCandidate(place,resolution,index=0){
  const reasons=[],warnings=[],matched=[];let eligible=true,delta=0;
  for(const constraint of resolution.hardConstraints||[]){
    const proof=evidence(place,constraint);
    if(proof.state==='conflict'){eligible=false;warnings.push(`${constraint.label}: verfügbare Ortsdaten widersprechen der Anforderung.`)}
    else if(proof.state==='unknown')warnings.push(`${constraint.label}: für diesen Ort noch nicht eindeutig bestätigt.`);
    else if(proof.state==='confirmed')reasons.push(`${constraint.label}: durch verfügbare Ortsdaten bestätigt.`);
  }
  for(const [tag,weight] of Object.entries(resolution.weights||{})){
    if(!matchesTag(place,tag))continue;
    matched.push(tag);delta+=Number(weight||0);
    if(weight>0)reasons.push(`Passt zu eurem Schwerpunkt auf ${LABELS[tag]||tag}.`);
  }
  delta=Math.max(-30,Math.min(40,Math.round(delta)));
  const base=Number(place.aiMatchScore??place.discoveryScore??place.matchScore??0)||0;
  return{place:{...clone(place),preferenceScore:base+delta,preferenceScoreDelta:delta,preferenceReasons:[...new Set(reasons)].slice(0,5),preferenceWarnings:[...new Set(warnings)].slice(0,4),preferenceConstraintState:eligible?(warnings.length?'verify':'satisfied'):'blocked',preferenceMatchedSignals:[...new Set(matched)],preferenceResolutionVersion:VERSION},eligible,index};
}
function rankPlaces(input={}){
  const resolution=input.resolution?.kind==='derived-trip-preference-resolution'?input.resolution:resolve(input);
  const evaluated=(Array.isArray(input.candidates)?input.candidates:[]).map((place,index)=>rankCandidate(place,resolution,index));
  const blocked=evaluated.filter(item=>!item.eligible);
  const places=evaluated.filter(item=>item.eligible).sort((left,right)=>Number(right.place.preferenceScore)-Number(left.place.preferenceScore)||left.index-right.index).map(item=>item.place);
  return immutable({version:VERSION,owner:'intelligence',resolution,places,meta:{candidateCount:evaluated.length,eligibleCount:places.length,blockedCount:blocked.length,blockedProviderPlaceIds:blocked.map(item=>idOf(item.place)).filter(Boolean),deterministic:true,providerFactsPreserved:true}});
}

function composeDayGuidance(input={}){
  const resolution=input.resolution?.kind==='derived-trip-preference-resolution'?input.resolution:resolve(input);
  const graph=input.dayGraph||{},days=Array.isArray(graph.days)?graph.days:[];
  const day=graph.currentDay||days.find(item=>Array.isArray(item.openGaps)&&item.openGaps.length)||days[0]||null;
  const openGap=day?.openGaps?.slice?.().sort((a,b)=>Number(b.durationMinutes)-Number(a.durationMinutes))[0]||null;
  const positives=(resolution.activeWeights||[]).filter(item=>item.weight>0).slice(0,3);
  const labels=positives.map(item=>item.label);
  const feelings=resolution.summary?.tripFeelings||[];
  const query=[feelings[0],...labels].filter(Boolean).slice(0,3).join(' · ')||'Ein Ort, der zu dieser Reise passt';
  const minimumGapMinutes=(resolution.weights?.quiet||0)>0?45:(resolution.weights?.active||0)>8?20:30;
  return immutable({
    version:VERSION,owner:'intelligence',kind:'derived-trip-day-guidance',persisted:false,
    day:day?{date:day.date,status:day.status}:null,openGap,
    policy:{minimumGapMinutes,pace:(resolution.weights?.quiet||0)>=(resolution.weights?.active||0)?'ruhig':'lebendig',maximumSuggestions:3},
    suggestion:openGap?{kind:'draft-place-discovery',requiresConfirmation:true,route:'places',label:'Passenden Ort entdecken',query,targetDate:day.date,startAt:openGap.startAt,endAt:openGap.endAt,reasons:[feelings.length?`Das Reisegefühl „${feelings.join(' · ')}“ gewichtet diesen Vorschlag.`:'Eure globalen Vorlieben bilden die Basis.',labels.length?`Besonders berücksichtigt: ${labels.join(', ')}.`:'Der Vorschlag bleibt bewusst offen.',`Im Tagesbogen sind ${openGap.durationMinutes} Minuten frei.`]}:null,
    provenance:{profile:'identity.v1',trip:'trip.v1',dayGraph:'journey.v1',mutation:false}
  });
}

return Object.freeze({version:VERSION,feelings:FEELINGS,resolve,rankPlaces,composeDayGuidance,normalizeProfile});
})();
