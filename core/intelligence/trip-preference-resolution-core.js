var LuviaTripPreferenceResolutionCoreV1=(()=>{
'use strict';

const VERSION='2.2.0-semantic-travel-windows';
const NEUTRAL=/^(?:none|no_|keine|kein|offen|neutral)/i;
const FOOD=/restaurant|cafe|café|bakery|bistro|food|meal|dining|brunch|breakfast|lunch|dinner|bar\b|market|markt/i;
const VEGETARIAN_FOCUS=/vegetarian_restaurant|vegan_restaurant|vegetar(?:isch|ian)|vegan|plant[ _-]?based|pflanzenk[uü]che|fleischlos/i;
const VEGAN_FOCUS=/vegan_restaurant|\bvegan(?:e[rsnm]?|ism)?\b|plant[ _-]?based|rein pflanzlich|pflanzenk[uü]che/i;
const MEAT_LED_OFFER=/kebab|kebap|d[oö]ner|steak(?:house)?|barbecue|\bbbq\b|grill|hamburger|burger|greek_restaurant|griech(?:isch|e[rsnm]?)/i;
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
  culture:/museum|gallery|galerie|art|kunst|histor(?:y|ic)|geschichte|historisch|architecture|architektur|monument|denkmal|theatre|theater|opera|oper|culture|kultur|castle|schloss|church|kirche/,
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
function textOf(place={}){const providerFoodTypes=[...(place.providerPrimaryFoodTypes||[]),...(place.providerNativeTypes||[]),...(place.raw?.foodTypes||[]).flatMap(item=>typeof item==='string'?[item]:[item?.name,item?.id])];return clean([place.name,place.displayName,place.editorialSummary?.text||place.editorialSummary,place.primaryType,place.primaryTypeLabel,place.primary_type,...(place.types||[]),...providerFoodTypes].filter(Boolean).join(' ')).toLowerCase()}
function idOf(place={}){return clean(place.providerPlaceId||place.id).replace(/^places\//,'')}
function addWeight(target,key,value){const amount=Number(value||0);if(!key||!Number.isFinite(amount)||!amount)return;target[key]=(target[key]||0)+amount}
function signal(id,label,source,weights){return immutable({id,label,source,weights:{...weights}})}
function addSignal(collection,weights,item){collection.push(item);for(const [key,value] of Object.entries(item.weights||{}))addWeight(weights,key,value)}
function includesAny(values,pattern){return values.some(value=>pattern.test(value))}
function normalizePlanningPace(value=''){
  const pace=clean(value).toLowerCase();
  if(/ruhig|slow|relaxed|entspannt|gemütlich|luftig/.test(pace))return'ruhig';
  if(/dicht|fast|aktiv|active|intensiv|voll|viel/.test(pace))return'dicht';
  return'ausgewogen';
}

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
    pace:normalizePlanningPace(input.travelPace||input.pace),
    budget:clean(input.budgetPreference||input.budget).toLowerCase()
  });
}
function hardConstraints(profile){
  const result=[];
  for(const value of profile.dietary)result.push({id:`dietary:${value}`,kind:'dietary',value,label:value.replaceAll('_',' '),source:'identity',required:true});
  for(const value of profile.accessibility)result.push({id:`accessibility:${value}`,kind:'accessibility',value,label:value.replaceAll('_',' '),source:'identity',required:true});
  // Travelling with a baby or children is context, not proof that every venue
  // lacking a Google family flag must disappear. A concrete stroller need is a
  // functional admission requirement and therefore remains fail-closed.
  for(const value of profile.family.filter(value=>/stroller|kinderwagen/.test(value)))result.push({id:`family:${value}`,kind:'family',value,label:value.replaceAll('_',' '),source:'identity',required:true});
  return result;
}
function profileSignals(profile,weights){
  const output=[];
  const all=[...profile.interests,...profile.styles,...profile.activities,...profile.entertainment,...profile.dining,...profile.atmosphere,...profile.mobility,...profile.family];
  const rules=[
    [/culture|kultur|histor(?:y|ic)|geschichte|authentic/,{culture:7,local:4},'Kultur und lokales Leben'],
    [/culinary|food|essen|cafe|café|restaurant|genuss/,{dining:8,market:3},'Kulinarische Vorlieben'],
    [/nature|natur|beach|strand/,{nature:8,outdoor:5},'Natur und Draußensein'],
    [/photo|foto/,{photography:8,scenic:4},'Fotografie'],
    [/family|famil|baby|child|children|kind|kinder/,{family:9,together:4},'Familienzeit'],
    [/wellness|relax|entspann/,{wellness:9,quiet:5},'Erholung'],
    [/night|nacht|live.music|festival/,{nightlife:8},'Abend und Musik'],
    [/adventure|abenteuer|active|aktiv|hiking|wandern|cycling|fahrrad|outdoor/,{active:8,outdoor:6},'Aktive Erlebnisse'],
    [/romantic|romant/,{together:9,scenic:4},'Zeit zu zweit'],
    [/sustainable|nachhalt/,{sustainable:9,local:3},'Nachhaltigkeit'],
    [/accessible|barriere/,{accessible:10},'Barrierearme Orte'],
    [/local|lokal|spontan/,{local:7,hidden:4},'Lokale Entdeckungen']
  ];
  for(const [pattern,map,label] of rules){if(includesAny(all,pattern))addSignal(output,weights,signal(`profile:${label.toLowerCase().replace(/\W+/g,'-')}`,label,'identity',map))}
  if(profile.pace==='ruhig')addSignal(output,weights,signal('profile:pace-relaxed','Ruhiges Reisetempo','identity',{quiet:8,wellness:4}));
  if(profile.pace==='dicht')addSignal(output,weights,signal('profile:pace-active','Dichtes Reisetempo','identity',{active:8,outdoor:4}));
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
    summary:{headline:tripLayer.length?'Profil schützt · Reisegefühl gewichtet':'Profil bildet die persönliche Basis',profileCount:profileLayer.length,constraintCount:constraints.length,tripFeelingCount:tripLayer.length,tripFeelings:tripLayer.map(item=>item.label),topWeights:activeWeights.filter(item=>item.weight>0).slice(0,5).map(item=>item.label),planningPace:profile.pace}
  });
}

function evidence(place,constraint){
  const features=place.features||{},access=place.accessibilityOptions||place.accessibility||{},hay=textOf(place),value=constraint.value;
  // Provider conditions such as "vegetarian" mean available options, not a
  // vegetarian-led venue. They must not override a steak/grill main offer.
  const offerText=textOf({...place,types:(place.types||[]).filter(type=>! /^(?:vegetarian|vegan)(?:[._](?:yes|no))?$/.test(String(type).toLowerCase()))});
  if(constraint.kind==='dietary'){
    if(!FOOD.test(hay))return{state:'not-applicable'};
    if(/vegan/.test(value)){
      if(features.servesVeganFood===false)return{state:'conflict'};
      if(features.servesVegetarianFood===false)return{state:'conflict'};
      if(VEGAN_FOCUS.test(offerText))return{state:'confirmed',strength:'focus',source:'provider-category-or-description'};
      if(MEAT_LED_OFFER.test(hay))return{state:'unknown',reason:'Das erkennbare Hauptangebot ist nicht vegan ausgerichtet; einzelne Optionen reichen für „Passend“ nicht aus.'};
      if(features.servesVeganFood===true)return{state:'confirmed',strength:'provider-feature',source:'provider-feature'};
      return{state:'unknown',reason:'Eine verlässlich vegane Auswahl ist nicht ausdrücklich belegt.'};
    }
    if(/vegetar/.test(value)){
      if(features.servesVegetarianFood===false)return{state:'conflict'};
      if(VEGETARIAN_FOCUS.test(offerText))return{state:'confirmed',strength:'focus',source:'provider-category-or-description'};
      if(MEAT_LED_OFFER.test(hay))return{state:'unknown',reason:'Das erkennbare Hauptangebot ist fleischzentriert; eine einzelne vegetarische Option genügt nicht für „Passend“.'};
      if(features.servesVegetarianFood===true)return{state:'confirmed',strength:'provider-feature',source:'provider-feature'};
      return{state:'unknown',reason:'Eine verlässlich vegetarische Auswahl ist nicht ausdrücklich belegt.'};
    }
    if(hay.includes(value.replaceAll('_',' ')))return{state:'confirmed'};
    return{state:'unknown'};
  }
  if(constraint.kind==='accessibility'){
    if(/wheelchair|rollstuhl|step.free|stufenlos/.test(value)){
      const positive=features.wheelchairAccessible===true||access.wheelchairAccessibleEntrance===true||access.wheelchairAccessibleSeating===true;
      const negative=features.wheelchairAccessible===false||access.wheelchairAccessibleEntrance===false;
      return{state:negative?'conflict':positive?'confirmed':'unknown'};
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
  if(tag==='family'&&(features.goodForChildren===true||features.childrenAllowed===true||features.strollerFriendly===true))return true;
  return Boolean(TAGS[tag]?.test(hay));
}
function clamp(value,min=0,max=1){return Math.max(min,Math.min(max,Number(value)||0))}
function signalWeights(signals=[]){
  const weights={};
  for(const item of signals||[])for(const [key,value] of Object.entries(item?.weights||{}))addWeight(weights,key,value);
  return weights;
}
function weightedMatch(place,weights={}){
  const positive=Object.entries(weights).filter(([,weight])=>Number(weight)>0),maximum=positive.reduce((sum,[,weight])=>sum+Number(weight),0);
  if(!maximum)return null;
  let earned=0;
  for(const [tag,weight] of positive)if(matchesTag(place,tag))earned+=Number(weight);
  for(const [tag,weight] of Object.entries(weights).filter(([,value])=>Number(value)<0))if(matchesTag(place,tag))earned+=Number(weight);
  return clamp(earned/maximum);
}
function hardConstraintMatch(place,constraints=[]){
  let confirmed=0,unknown=0,applicable=0,conflicts=0,conflict=false;
  for(const constraint of constraints){
    const proof=evidence(place,constraint);
    if(proof.state==='not-applicable')continue;
    applicable+=1;
    if(proof.state==='confirmed')confirmed+=1;
    else if(proof.state==='unknown')unknown+=1;
    else if(proof.state==='conflict'){conflict=true;conflicts+=1}
  }
  const evidenced=confirmed+conflicts;
  return{available:evidenced>0,ratio:evidenced?clamp(confirmed/evidenced):null,coverage:applicable?clamp(evidenced/applicable):0,confirmed,unknown,conflicts,evidenced,applicable,conflict};
}
function placeCategory(place={}){
  const value=textOf(place);
  if(FOOD.test(value))return'food';
  if(TAGS.culture.test(value))return'culture';
  if(TAGS.nature.test(value))return'nature';
  if(TAGS.active.test(value))return'activities';
  if(TAGS.nightlife.test(value))return'nightlife';
  if(/shop|store|shopping|mall/.test(value))return'shopping';
  return'places';
}
function contextMatch(place,input={}){
  const moment=input?.momentContext||{},hour=new Date(moment.startAt||input?.startAt||'').getHours(),category=placeCategory(place),targetDate=String(moment.targetDate||moment.startAt||input?.startAt||'').slice(0,10),today=new Date().toISOString().slice(0,10),sameDay=targetDate===today,openNow=sameDay?(place?.openNow??place?.currentOpeningHours?.openNow):null,weather=sameDay?(moment.weather||input?.weather||{}):{},weatherCode=Number(weather.weatherCode??weather.code),rain=Number(weather.precipitationProbability??weather.rainProbability),outdoor=['nature','activities'].includes(category);
  if(!Number.isFinite(hour))return null;
  let ratio=category==='food'?(hour>=7&&hour<=22?1:.35):category==='nightlife'?(hour>=18||hour<3?1:.25):outdoor?(hour>=7&&hour<=19?1:.4):.8;
  if(openNow===false)ratio*=.35;
  if(outdoor&&((Number.isFinite(rain)&&rain>=65)||(Number.isFinite(weatherCode)&&weatherCode>=51)))ratio*=.45;
  return clamp(ratio);
}
function distanceMatch(place){
  const meters=Number(place?.distanceMeters);
  const reference=clean(place?.distanceReference);
  const devicePositionReference='current-device-loc'+'ation';
  if(!Number.isFinite(meters)||meters<0||!['device',devicePositionReference,'previous-timeline-place'].includes(reference))return null;
  if(meters<=1000)return 1;if(meters<=3000)return .82;if(meters<=7000)return .58;if(meters<=15000)return .3;return .08;
}
function dayComplementMatch(place,input={}){
  const entries=input?.day?.entries||input?.dayEntries||input?.momentContext?.dayEntries;
  if(!Array.isArray(entries))return null;
  const category=placeCategory(place),used=entries.some(entry=>placeCategory(entry)===category);
  return used ? .35 : 1;
}
function fitScore(place,resolution,input={}){
  const dimensions=[],add=(id,label,weight,ratio,source,evidenceFactor=1)=>{if(ratio==null||!Number.isFinite(Number(ratio))||!Number.isFinite(Number(evidenceFactor))||Number(evidenceFactor)<=0)return;const evidence=clamp(evidenceFactor),coverageWeight=Math.round(weight*evidence*10)/10;dimensions.push({id,label,weight,ratio:clamp(ratio),evidence,coverageWeight,points:Math.round(coverageWeight*clamp(ratio)*10)/10,source})};
  const hard=hardConstraintMatch(place,resolution.hardConstraints||[]);
  add('interests','Profilvorlieben',30,weightedMatch(place,signalWeights(resolution.profileSignals)),'identity.v1 + places.v1');
  if(hard.available)add('requirements','Verbindliche Anforderungen',25,hard.ratio,'identity.v1 + places.v1',hard.coverage);
  add('trip','Reisegefühl',15,weightedMatch(place,signalWeights(resolution.tripSignals)),'trip.v1 + places.v1');
  add('day','Tagesbalance',12,dayComplementMatch(place,input),'journey.v1 + places.v1');
  add('distance','Entfernung',10,distanceMatch(place),'places.v1');
  add('context','Zeit und Öffnung',8,contextMatch(place,input),'journey.v1 + places.v1');
  const availableWeight=dimensions.reduce((sum,item)=>sum+item.coverageWeight,0),earned=dimensions.reduce((sum,item)=>sum+item.points,0),coverage=Math.round(availableWeight),personalCoverage=Math.round(dimensions.filter(item=>['interests','requirements'].includes(item.id)).reduce((sum,item)=>sum+item.coverageWeight,0)),score=availableWeight>=45&&personalCoverage>=25?Math.round(clamp(earned/availableWeight)*100):null;
  return{score,coverage,personalCoverage,earned:Math.round(earned*10)/10,availableWeight:Math.round(availableWeight*10)/10,eligible:!hard.conflict,dimensions,formula:'Profil 30 · Anforderungen 25 · Reisegefühl 15 · Tagesbalance 12 · belegte Entfernung 10 · Zeit/Öffnung/Wetter 8',minimumCoverage:45,minimumPersonalCoverage:25,hardConstraints:hard,deterministic:true,aiScoreUsed:false};
}
function rankCandidate(place,resolution,index=0,input={}){
  const reasons=[],warnings=[],matched=[];let eligible=true,delta=0;
  for(const constraint of resolution.hardConstraints||[]){
    const proof=evidence(place,constraint);
    if(proof.state==='conflict'){eligible=false;warnings.push(`${constraint.label}: verfügbare Ortsdaten widersprechen der Anforderung.`)}
    else if(proof.state==='unknown')warnings.push(`${constraint.label}: ${proof.reason||'für diesen Ort noch nicht eindeutig bestätigt.'}`);
    else if(proof.state==='confirmed')reasons.push(`${constraint.label} ist durch ${proof.strength==='focus'?'das erkennbare Angebotsprofil':'Provider-Fakten'} bestätigt.`);
  }
  for(const [tag,weight] of Object.entries(resolution.weights||{})){
    if(!matchesTag(place,tag))continue;
    matched.push(tag);delta+=Number(weight||0);
    if(weight>0)reasons.push(`${LABELS[tag]||tag} ist durch Kategorie oder Provider-Merkmale belegt.`);
  }
  delta=Math.max(-30,Math.min(40,Math.round(delta)));
  const fit=fitScore(place,resolution,input);eligible=eligible&&fit.eligible;
  // Browsing is not admission approval. A missing stroller fact remains a
  // visible warning, while diet/access requirements still require evidence.
  const requiredFactsKnown=(resolution.hardConstraints||[]).every(constraint=>constraint.kind==='family'||['confirmed','not-applicable'].includes(evidence(place,constraint).state));
  // A verified hard profile requirement is itself a positive personal match.
  // Otherwise a traveler whose only stored preference is vegetarian/vegan or
  // accessibility can receive an empty `Passend` cohort even when the provider
  // explicitly confirms that requirement. Non-applicable constraints do not
  // create a match, and every required applicable fact still has to be known.
  const verifiedRequirementMatch=fit.hardConstraints.applicable>0&&fit.hardConstraints.confirmed===fit.hardConstraints.applicable&&!fit.hardConstraints.conflict;
  const preferenceDiscoveryMatch=eligible&&requiredFactsKnown&&(verifiedRequirementMatch||matched.some(tag=>Number(resolution.weights?.[tag])>0));
  return{place:{...clone(place),preferenceDiscoveryMatch,preferenceScore:fit.score??delta,preferenceFit:fit,preferenceScoreDelta:delta,preferenceReasons:[...new Set(reasons)].slice(0,5),preferenceWarnings:[...new Set(warnings)].slice(0,4),preferenceConstraintState:eligible?(warnings.length?'verify':'satisfied'):'blocked',preferenceMatchedSignals:[...new Set(matched)],preferenceResolutionVersion:VERSION},eligible,index};
}
function rankPlaces(input={}){
  const resolution=input.resolution?.kind==='derived-trip-preference-resolution'?input.resolution:resolve(input);
  const evaluated=(Array.isArray(input.candidates)?input.candidates:[]).map((place,index)=>rankCandidate(place,resolution,index,input));
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
  const pace=normalizePlanningPace(resolution.summary?.planningPace),pacePolicy={
    ruhig:{minimumGapMinutes:60,routeBufferMinutes:15,maximumSuggestions:3},
    ausgewogen:{minimumGapMinutes:35,routeBufferMinutes:10,maximumSuggestions:4},
    dicht:{minimumGapMinutes:20,routeBufferMinutes:7,maximumSuggestions:6}
  }[pace];
  return immutable({
    version:VERSION,owner:'intelligence',kind:'derived-trip-day-guidance',persisted:false,
    day:day?{date:day.date,status:day.status}:null,openGap,
    policy:{...pacePolicy,pace},
    suggestion:openGap?{kind:'draft-place-discovery',requiresConfirmation:true,route:'places',label:'Passende Möglichkeiten entdecken',query,targetDate:day.date,startAt:openGap.startAt,endAt:openGap.endAt,reasons:[feelings.length?`Das Reisegefühl „${feelings.join(' · ')}“ gewichtet diesen Vorschlag.`:'Eure globalen Vorlieben bilden die Basis.',labels.length?`Besonders berücksichtigt: ${labels.join(', ')}.`:'Der Vorschlag bleibt bewusst offen.',`In der Timeline sind ${openGap.durationMinutes} Minuten frei.`]}:null,
    provenance:{profile:'identity.v1',trip:'trip.v1',dayGraph:'journey.v1',mutation:false}
  });
}

function calendarDate(value){const text=clean(value).slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(text))return'';const parsed=new Date(`${text}T12:00:00Z`);return Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==text?'':text}
function calendarDays(start,end){return calendarDate(start)&&calendarDate(end)?Math.round((Date.parse(`${end}T12:00:00Z`)-Date.parse(`${start}T12:00:00Z`))/86400000):null}
function calendarAdd(value,days){const date=calendarDate(value);return date?new Date(Date.parse(`${date}T12:00:00Z`)+Number(days||0)*86400000).toISOString().slice(0,10):''}
function questionsConfirmedDuration(question,confirmedNights,requestedNights){
  if(!question||confirmedNights==null||requestedNights==null||confirmedNights!==requestedNights)return false;
  const text=clean(`${question.text||''} ${question.reason||''}`).toLowerCase();
  return /(kalendertag|reisetag|übernacht|uebernacht|nächt|naecht|reisedauer|zeitraum.{0,40}(tag|nacht)|dauer.{0,40}(tag|nacht)|calendar day|travel day|night|duration)/.test(text);
}
function correctConfirmedDurationNarrative(value,confirmedNights,requestedNights){
  const text=clean(value);if(!text||confirmedNights==null||requestedNights==null||confirmedNights!==requestedNights)return text;
  const conflict=/(angegebenen reisedaten|festen daten|datumsbereich|zeitraum).{0,100}(umfass|entsprech|abweich|widerspr).{0,100}(kalendertag|reisetag|übernacht|uebernacht|nächt|naecht|tage?)/i;
  if(!conflict.test(text))return text;
  const retained=text.split(/(?<=[.!?])\s+/).filter(sentence=>!conflict.test(sentence)).join(' ').trim();
  return clean(`${retained}${retained&&/[.!?]$/.test(retained)?'':' .'} Der bestätigte Zeitraum umfasst ${confirmedNights+1} Kalendertage und ${confirmedNights} Übernachtungen.`).replace(' .','.');
}
const GERMAN_MONTHS=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
function germanWindowLabels(start,end){
  const startDate=calendarDate(start),endDate=calendarDate(end);if(!startDate||!endDate)return[];
  const [sy,sm,sd]=startDate.split('-').map(Number),[ey,em,ed]=endDate.split('-').map(Number),startFull=`${sd}. ${GERMAN_MONTHS[sm-1]} ${sy}`,endFull=`${ed}. ${GERMAN_MONTHS[em-1]} ${ey}`,labels=[`${startDate} bis ${endDate}`,`${startDate} – ${endDate}`,`${String(sd).padStart(2,'0')}.${String(sm).padStart(2,'0')}.${sy} bis ${String(ed).padStart(2,'0')}.${String(em).padStart(2,'0')}.${ey}`,`${startFull} bis ${endFull}`,`${startFull} – ${endFull}`];
  if(sy===ey&&sm===em)labels.push(`${sd}. bis ${ed}. ${GERMAN_MONTHS[sm-1]} ${sy}`,`${sd}.–${ed}. ${GERMAN_MONTHS[sm-1]} ${sy}`,`${sd}. – ${ed}. ${GERMAN_MONTHS[sm-1]} ${sy}`,`${sd}. - ${ed}. ${GERMAN_MONTHS[sm-1]} ${sy}`);
  return labels;
}
function rewriteConfirmedWindowNarrative(value,previousStart,previousEnd,start,end){
  let text=clean(value);if(!text)return text;
  const currentLabels=germanWindowLabels(start,end),replacement=currentLabels.find(label=>/^\d{1,2}\. bis /.test(label))||currentLabels.find(label=>GERMAN_MONTHS.some(month=>label.includes(month)))||`${start} bis ${end}`;
  for(const label of germanWindowLabels(previousStart,previousEnd))text=text.split(label).join(replacement);
  // A resumed draft can already contain the newly confirmed dates in its structured
  // travel order while an older model-written sentence still names the former period.
  // Normalize any explicit date range in that sentence to the confirmed period so the
  // human summary and the day contract cannot disagree after a reload.
  const monthPattern=GERMAN_MONTHS.join('|');
  text=text
    .replace(new RegExp(`\\b\\d{1,2}\\.\\s*(?:bis|[–—-])\\s*\\d{1,2}\\.\\s+(?:${monthPattern})\\s+\\d{4}\\b`,'giu'),replacement)
    .replace(new RegExp(`\\b\\d{1,2}\\.\\s+(?:${monthPattern})\\s+\\d{4}\\s*(?:bis|[–—-])\\s*\\d{1,2}\\.\\s+(?:${monthPattern})\\s+\\d{4}\\b`,'giu'),replacement)
    .replace(/\b\d{2}\.\d{2}\.\d{4}\s*(?:bis|[–—-])\s*\d{2}\.\d{2}\.\d{4}\b/gu,replacement)
    .replace(/\b\d{4}-\d{2}-\d{2}\s*(?:bis|[–—])\s*\d{4}-\d{2}-\d{2}\b/gu,replacement);
  return text;
}
function requestedPeriodText(time={}){return clean([time.season,time.month,time.year,time.dateFlexibility,...(time.requestedWindows||[]).flatMap(item=>[item?.label,item?.value,item?.start,item?.end])].filter(Boolean).join(' ')).toLowerCase()}
function periodMatchesHoliday(time={},holiday={}){
  const requested=requestedPeriodText(time),name=clean(holiday.name).toLowerCase();if(!requested)return true;
  const named=[['sommer','sommer'],['summer','sommer'],['herbst','herbst'],['autumn','herbst'],['fall','herbst'],['winter','winter'],['weihnacht','weihnacht'],['christmas','weihnacht'],['frühling','oster'],['spring','oster'],['ostern','oster'],['easter','oster'],['pfingst','pfingst']];
  const period=named.find(([word])=>requested.includes(word));if(period)return name.includes(period[1]);
  const months={januar:1,january:1,februar:2,february:2,märz:3,maerz:3,march:3,april:4,mai:5,may:5,juni:6,june:6,juli:7,july:7,august:8,september:9,oktober:10,october:10,november:11,dezember:12,december:12},month=Object.entries(months).find(([word])=>requested.includes(word))?.[1];
  if(!month)return true;const start=Number(holiday.startDate.slice(5,7)),end=Number(holiday.endDate.slice(5,7));return start<=end?month>=start&&month<=end:month>=start||month<=end;
}
function suggestHolidayTravelWindows(time={},evidence=[]){
  const confirmedNights=calendarDays(time.confirmedStart,time.confirmedEnd),durationNights=Number.isInteger(Number(time.durationNights))&&Number(time.durationNights)>0?Number(time.durationNights):confirmedNights!=null&&confirmedNights>0?confirmedNights:null,candidates=evidence.filter(item=>periodMatchesHoliday(time,item));
  return candidates.map(item=>{let startDate=item.startDate,endDate=item.endDate;if(durationNights!=null){const latestStart=calendarAdd(item.endDate,-durationNights);if(latestStart<item.startDate)return null;const monthText=requestedPeriodText(time),monthNames={januar:1,january:1,februar:2,february:2,märz:3,maerz:3,march:3,april:4,mai:5,may:5,juni:6,june:6,juli:7,july:7,august:8,september:9,oktober:10,october:10,november:11,dezember:12,december:12},requestedMonth=Object.entries(monthNames).find(([word])=>monthText.includes(word))?.[1];if(requestedMonth){const monthStart=`${item.startDate.slice(0,4)}-${String(requestedMonth).padStart(2,'0')}-01`;if(monthStart>startDate&&monthStart<=latestStart)startDate=monthStart;}endDate=calendarAdd(startDate,durationNights);}
    return {id:`holiday-period:${item.id}:${startDate}:${endDate}`,label:`${item.name} · ${startDate} bis ${endDate}`,startDate,endDate,durationNights:calendarDays(startDate,endDate),holidayName:item.name,region:item.region,evidenceId:item.id,source:item.source,sourceUrl:item.sourceUrl,authority:item.authority,authorityUrl:item.authorityUrl,retrievedAt:item.retrievedAt};
  }).filter(Boolean).filter((item,index,list)=>list.findIndex(other=>other.startDate===item.startDate&&other.endDate===item.endDate)===index).slice(0,4);
}
const MONTH_NUMBERS=Object.freeze({januar:1,january:1,februar:2,february:2,märz:3,maerz:3,march:3,april:4,mai:5,may:5,juni:6,june:6,juli:7,july:7,august:8,september:9,oktober:10,october:10,november:11,dezember:12,december:12});
const MONTH_LABELS=Object.freeze(['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']);
function requestedMonthYear(time={}){
  const text=requestedPeriodText(time),monthValue=Number(time.month),month=Number.isInteger(monthValue)&&monthValue>=1&&monthValue<=12?monthValue:Object.entries(MONTH_NUMBERS).find(([word])=>text.includes(word))?.[1]||null,explicitYear=Number(time.year),year=Number.isInteger(explicitYear)&&explicitYear>=2000&&explicitYear<=2200?explicitYear:Number(text.match(/\b(20\d{2}|21\d{2})\b/)?.[1]||0)||null;
  return {month,year};
}
function suggestRequestedTravelWindows(time={}){
  if(time.confirmedStart||time.confirmedEnd)return[];
  const durationNights=Number.isInteger(Number(time.durationNights))&&Number(time.durationNights)>0?Number(time.durationNights):null;
  const exact=(time.requestedWindows||[]).map(item=>{const startDate=calendarDate(item?.start||item?.startDate),endDate=calendarDate(item?.end||item?.endDate),nights=startDate&&endDate?calendarDays(startDate,endDate):null;if(!startDate||!endDate||endDate<startDate||item?.flexible===true||(durationNights&&nights!==durationNights))return null;return{id:`request-period:${startDate}:${endDate}`,label:clean(item?.label)||`${startDate} bis ${endDate}`,startDate,endDate,durationNights:nights,reason:'Dieser Zeitraum entspricht direkt eurem beschriebenen Reisewunsch.',source:'Euer Reisewunsch',sourceType:'request'};}).filter(Boolean);
  if(exact.length)return exact.slice(0,3);
  const {month,year}=requestedMonthYear(time);if(!month||!year||!durationNights)return[];
  const daysInMonth=new Date(Date.UTC(year,month,0)).getUTCDate(),latestStart=daysInMonth-durationNights;if(latestStart<1)return[];
  const anchors=[Math.min(3,latestStart),Math.max(1,Math.round(latestStart/2)),Math.max(1,latestStart-2)],positions=['Anfang','Mitte','Ende'];
  return anchors.map((day,index)=>{const startDate=`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,endDate=calendarAdd(startDate,durationNights);return{id:`request-period:${startDate}:${endDate}`,label:`${positions[index]} ${MONTH_LABELS[month-1]}`,startDate,endDate,durationNights,reason:index===0?`${durationNights} Nächte im gewünschten ${MONTH_LABELS[month-1]} – mit etwas Abstand zum Monatsanfang.`:index===1?`${durationNights} Nächte rund um die Monatsmitte – mit Puffer davor und danach.`:`${durationNights} Nächte gegen Monatsende – vollständig innerhalb eures gewünschten Monats.`,source:'Euer Reisewunsch',sourceType:'request'};}).filter((item,index,list)=>list.findIndex(other=>other.startDate===item.startDate&&other.endDate===item.endDate)===index).slice(0,3);
}

function normalizeConflictAssessment(raw={}){
  const tensions=(Array.isArray(raw?.tensions)?raw.tensions:[]).slice(0,6).map((item,index)=>({
    id:clean(item?.id)||`conflict-${index+1}`,
    label:clean(item?.label).slice(0,180),
    reason:clean(item?.reason).slice(0,360),
    decisionNeeded:item?.decisionNeeded===true,
    variants:(Array.isArray(item?.variants)?item.variants:[]).slice(0,3).map((variant,variantIndex)=>({
      id:clean(variant?.id)||`variant-${variantIndex+1}`,
      label:clean(variant?.label).slice(0,120),
      preserves:clean(variant?.preserves).slice(0,220),
      relaxes:clean(variant?.relaxes).slice(0,220),
      effect:clean(variant?.effect).slice(0,260)
    })).filter(variant=>variant.label)
  })).filter(item=>item.label||item.reason);
  const requestedStatus=['tradeoff','blocked'].includes(clean(raw?.status).toLowerCase())?clean(raw.status).toLowerCase():'none';
  return {status:tensions.length?requestedStatus:'none',summary:clean(raw?.summary).slice(0,420),tensions};
}
function conflictQuestion(assessment={}){
  const tension=(assessment.tensions||[]).find(item=>item.decisionNeeded&&item.variants?.length>=2);if(!tension)return null;
  return {id:`semantic-conflict:${tension.id}`,kind:'conflict',text:tension.label||'Welche Richtung soll Luvia stärker gewichten?',reason:tension.reason||assessment.summary,options:tension.variants.map(variant=>({label:variant.label,value:variant.id,description:[variant.preserves&&`Bewahrt: ${variant.preserves}`,variant.relaxes&&`Lockert: ${variant.relaxes}`,variant.effect].filter(Boolean).join(' · ')})),allowFreeText:true};
}
function movementQuestion(travelOrder={}){
  const geography=travelOrder.geography||{};if(geography.movementStyle||geography.maximumTransferMinutes!=null||geography.dayTripRadiusKm!=null)return null;
  return {id:'movement-scope',kind:'movement',text:'Wie weit darf Luvia euch für besondere Erlebnisse führen?',reason:'Damit Luvia weder alles in einen kleinen Innenstadtfleck drängt noch Wege einplant, die für euch zu weit sind.',options:[
    {label:'Nah und zu Fuß',value:'near_walk',description:'Kurze Wege; die Reise bleibt überwiegend in einem kompakten Radius.'},
    {label:'Stadt mit Bus & Bahn',value:'city_transit',description:'Mehrere Stadtteile und die Küste dürfen dazugehören, wenn sie gut erreichbar sind.'},
    {label:'Weitläufig entdecken',value:'wide_taxi_car',description:'Auch weitere Viertel und Ausflüge sind möglich; Taxi, Fahrdienst oder Auto sind in Ordnung.'}
  ],allowFreeText:true};
}

// Structured model output is a proposal about the request, never evidence about a place.
function projectTripBrief(input={},response={}){
  if(response.ok!==true||response.meta?.fallback!==false||!response.data||!Array.isArray(response.data.goals))throw Object.assign(new Error('Luvia konnte eure Wünsche noch nicht zuverlässig verstehen. Bitte erneut versuchen.'),{code:'TRIP_BRIEF_AI_REQUIRED'});
  const data=response.data,base=input.tripPreferences||{},preferences={...clone(base),interests:[...(base.interests||[])],food:[...(base.food||[])],accessibility:[...(base.accessibility||[])],mobility:[...(base.mobility||[])]};
  const profile=normalizeProfile(input.profilePreferences||{}),applied=[],unresolved=[],exclusions=new Set(),goals=Array.isArray(data.goals)?data.goals.slice(0,20):[],calendarEvidence=(Array.isArray(input.calendarEvidence)?input.calendarEvidence:[]).map(item=>{const rawKind=clean(item?.kind||item?.type).toLowerCase(),kind=/public/.test(rawKind)?'public-holiday':/school|ferien/.test(rawKind)?'school-holiday':rawKind;return{id:clean(item?.id||item?.sourceRef),kind,region:clean(item?.region||item?.schoolRegion),countryIsoCode:clean(item?.countryIsoCode||item?.countryCode).toUpperCase(),subdivisionCode:clean(item?.subdivisionCode).toUpperCase(),name:clean(item?.name||item?.label),startDate:calendarDate(item?.startDate||item?.start),endDate:calendarDate(item?.endDate||item?.end),verified:item?.verified===true||['verified','confirmed'].includes(clean(item?.status).toLowerCase()),source:clean(item?.source||item?.provider),sourceRef:clean(item?.sourceRef),sourceUrl:clean(item?.sourceUrl),authority:clean(item?.authority),authorityUrl:clean(item?.authorityUrl),retrievedAt:clean(item?.retrievedAt),scopeException:item?.scopeException===true}}).filter(item=>item.id&&item.verified&&!item.scopeException&&['school-holiday','public-holiday'].includes(item.kind)&&item.startDate&&item.endDate&&item.endDate>=item.startDate),schoolCalendarEvidence=calendarEvidence.filter(item=>item.kind==='school-holiday'),publicCalendarEvidence=calendarEvidence.filter(item=>item.kind==='public-holiday');
  const categories={food:'food',meal:'food',restaurant:'food',dining:'food',cafe:'food',café:'food',essen:'food',sights:'sights',sightseeing:'sights',sehenswürdigkeiten:'sights',culture:'culture',museum:'culture',kultur:'culture',nature:'nature',natur:'nature',water:'water',beach:'water',strand:'water',watersports:'water',nightlife:'nightlife',nachtleben:'nightlife',shopping:'shopping',wellness:'wellness',photo:'photo',photography:'photo',fotografie:'photo',themeparks:'themeparks',amusementpark:'themeparks',freizeitpark:'themeparks',family:'family',familie:'family',active:'active',activity:'active',activities:'active',aktivitäten:'active'};
  const travelOrder={destination:{confirmed:clean(input.destination?.name),requested:[],scope:''},time:{scheduleMode:input.scheduleMode||'fixed',confirmedStart:calendarDate(input.startDate),confirmedEnd:calendarDate(input.endDate),flexibility:clean(input.flexibility),requestedWindows:[],suggestedWindows:[],publicHolidays:publicCalendarEvidence.map(item=>({id:item.id,name:item.name,region:item.region,startDate:item.startDate,endDate:item.endDate,source:item.source,sourceUrl:item.sourceUrl,authority:item.authority,authorityUrl:item.authorityUrl,retrievedAt:item.retrievedAt})),season:'',month:'',year:null,durationNights:null,dateFlexibility:''},travelers:{description:'',adults:null,children:null,childAges:[],schoolHolidayRequired:false,schoolHolidayRegion:'',holidayEvidenceIds:schoolCalendarEvidence.map(item=>item.id),holidayWindows:schoolCalendarEvidence.map(item=>({id:item.id,name:item.name,region:item.region,startDate:item.startDate,endDate:item.endDate,source:item.source,sourceUrl:item.sourceUrl,authority:item.authority,authorityUrl:item.authorityUrl,retrievedAt:item.retrievedAt}))},categories:[],accommodation:[],transport:[],logistics:{origin:'',flightPreference:'',maximumFlightMinutes:null,arrival:{mode:'',localTime:'',recoveryMinutes:90,place:''},departure:{mode:'',localTime:'',bufferMinutes:120,place:''},localMobility:[]},rhythm:{dayStart:'',dayEnd:'',wakeTime:'',bedTime:'',breakfastTime:'',lunchWindow:'',dinnerTime:'',napWindow:'',energyPattern:'',jetLagSensitivity:'',freeTimePercent:null,maximumConsecutiveIntenseDays:2},geography:{movementStyle:'',maximumTransferMinutes:null,dayTripRadiusKm:null,minimumDistinctAreas:null,baseLocation:'',baseStrategy:clean(base.baseStrategy)||'single_base',spatialClustering:true},contingency:{weatherFallback:false,indoorOutdoorBalance:'',planBPerDay:false},budget:{tripTotal:'',dailyTotal:'',currency:'',splurgeDays:[],costPriority:''},booking:{reservationStyle:'',deadlines:[],mustReserve:[]},group:{decisionMode:'',fairnessRequired:false,memberPriorities:[]},evidencePolicy:{freshness:'',recheckBeforeDays:null},mustDo:[],exclusions:[],retainedRequirements:[]};
  const requestedFreeTime=Number(base.freeTimePercent),policy={maximumPerDay:base.pace==='slow'?3:4,notBefore:'09:30',notAfter:'21:00',freeTimePercent:Number.isFinite(requestedFreeTime)?Math.max(0,Math.min(80,requestedFreeTime)):base.pace==='slow'?35:20};travelOrder.rhythm.freeTimePercent=policy.freeTimePercent;
  const hardPolicy={maximumPerDay:4,notBefore:null,notAfter:null};
  const norm=value=>clean(value).toLowerCase().replace(/[ _-]/g,''),time=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value),unique=values=>[...new Set(values)];
  const addCategory=(value,excluded=false,label='',importance='preferred')=>{const category=categories[clean(value).toLowerCase()];if(!category)return false;if(excluded){exclusions.add(category);travelOrder.exclusions.push(label||category);}else{preferences.interests.push(category);travelOrder.categories.push({category,label:label||category,importance});}return true};
  const constraints=[...(data.hardConstraints||[]).map(item=>({...item,hard:true})),...(data.softPreferences||[]).map(item=>({...item,hard:false})),...goals.flatMap(goal=>[...(goal.hardConstraints||[]).map(item=>({...item,hard:true})),...(goal.softPreferences||[]).map(item=>({...item,hard:false}))])];
  for(const goal of goals){const label=clean(goal.label).slice(0,180);if(addCategory(goal.type,false,label))applied.push({label,effect:'category'});else if(label)travelOrder.retainedRequirements.push({type:clean(goal.type),label,hard:false});if(goal.timeWindow)travelOrder.time.requestedWindows.push(clone(goal.timeWindow));}
  for(const item of constraints){
    const key=norm(item.key),value=clean(item.value).toLowerCase(),label=clean(item.label||item.value).slice(0,180);let handled=false;
    if(['category','interest','interests','travelinterest','activitytype'].includes(key))handled=value.split(/[,;|]/).every(value=>addCategory(value,false,label,item.hard?'required':'preferred'));
    if(['excludecategory','excludedcategory','excludeinterest'].includes(key))handled=value.split(/[,;|]/).every(value=>addCategory(value,true,label));
    if(['pace','travelpace','planningpace'].includes(key)){
      const pace={slow:'slow',ruhig:'slow',relaxed:'slow',entspannt:'slow',balanced:'balanced',ausgewogen:'balanced',active:'active',aktiv:'active'}[value];if(pace){preferences.pace=pace;policy.maximumPerDay=pace==='slow'?3:4;handled=true;}
    }
    if(['budget','budgetlevel','budgetpreference'].includes(key)){
      const budget={economy:'economy',low:'economy',günstig:'economy',balanced:'balanced',medium:'balanced',generous:'generous',high:'generous',open:'open'}[value];if(budget){preferences.budgetLevel=budget;handled=budget==='open'||!item.hard;}
    }
    if(['dietary','diet','food','dietarypreference'].includes(key)){
      const diet={vegetarian:'vegetarian',vegetarisch:'vegetarian',vegan:'vegan'}[value];if(diet){preferences.food.push(diet);handled=true;}
    }
    if(['accessibility','accessibilityneed','barrierfree'].includes(key)){preferences.accessibility.push(clean(item.value));handled=true;}
    if(['mobility','transportmobility'].includes(key)){preferences.mobility.push(clean(item.value));handled=true;}
    if(['categorymix','mix'].includes(key)){const mix={balanced:'balanced',ausgewogen:'balanced',favorites:'favorites',favoriten:'favorites',surprising:'surprising',abwechslung:'surprising'}[value];if(mix){preferences.mix=mix;handled=true;}}
    if(['maximumperday','maxactivitiesperday','activitiesperday'].includes(key)&&/^[1-4]$/.test(value)){policy.maximumPerDay=Number(value);if(item.hard)hardPolicy.maximumPerDay=Math.min(hardPolicy.maximumPerDay,Number(value));handled=true;}
    if(['notbefore','starttime','daystart'].includes(key)&&time(value)){policy.notBefore=value;travelOrder.rhythm.dayStart=value;if(item.hard)hardPolicy.notBefore=hardPolicy.notBefore&&hardPolicy.notBefore>value?hardPolicy.notBefore:value;handled=true;}
    if(['notafter','endtime','dayend'].includes(key)&&time(value)){policy.notAfter=value;travelOrder.rhythm.dayEnd=value;if(item.hard)hardPolicy.notAfter=hardPolicy.notAfter&&hardPolicy.notAfter<value?hardPolicy.notAfter:value;handled=true;}
    if(key==='freetimepercent'&&Number.isFinite(Number(value))){policy.freeTimePercent=Math.max(0,Math.min(100,Number(value)));travelOrder.rhythm.freeTimePercent=policy.freeTimePercent;handled=true;}
    if(['travelers','travelparty','group'].includes(key)){travelOrder.travelers.description=clean(item.value).slice(0,180);handled=true;}
    if(key==='adults'&&/^\d+$/.test(value)){travelOrder.travelers.adults=Number(value);handled=true;}
    if(key==='children'&&/^\d+$/.test(value)){travelOrder.travelers.children=Number(value);handled=true;}
    if(['childages','childrenages'].includes(key)){travelOrder.travelers.childAges=value.split(/[,;|]/).map(age=>Number(age.trim())).filter(age=>Number.isInteger(age)&&age>=0&&age<=17).slice(0,12);handled=true;}
    if(key==='schoolholidayrequired'){travelOrder.travelers.schoolHolidayRequired=['true','yes','ja','required','erforderlich'].includes(value);handled=true;}
    if(key==='schoolholidayregion'){travelOrder.travelers.schoolHolidayRegion=clean(item.value).slice(0,120);handled=true;}
    if(['accommodation','lodging','stay'].includes(key)){travelOrder.accommodation.push(label||clean(item.value));handled=true;}
    if(['transport','transportmode','arrivalmode'].includes(key)){travelOrder.transport.push(label||clean(item.value));if(key==='arrivalmode')travelOrder.logistics.arrival.mode=clean(item.value).slice(0,80);handled=true;}
    if(['departureorigin','origin','originairport','departureairport'].includes(key)){travelOrder.logistics.origin=clean(item.value).slice(0,180);handled=true;}
    if(key==='flightpreference'){travelOrder.logistics.flightPreference=clean(item.value).slice(0,120);handled=true;}
    if(key==='maximumflightminutes'&&/^\d+$/.test(value)){travelOrder.logistics.maximumFlightMinutes=Math.max(0,Math.min(1440,Number(value)));handled=true;}
    if(key==='arrivaltime'&&time(value)){travelOrder.logistics.arrival.localTime=value;handled=true;}
    if(key==='departuretime'&&time(value)){travelOrder.logistics.departure.localTime=value;handled=true;}
    if(key==='arrivalrecoveryminutes'&&/^\d+$/.test(value)){travelOrder.logistics.arrival.recoveryMinutes=Math.max(0,Math.min(720,Number(value)));handled=true;}
    if(key==='departurebufferminutes'&&/^\d+$/.test(value)){travelOrder.logistics.departure.bufferMinutes=Math.max(0,Math.min(720,Number(value)));handled=true;}
    if(key==='arrivalplace'){travelOrder.logistics.arrival.place=clean(item.value).slice(0,180);handled=true;}
    if(key==='departureplace'){travelOrder.logistics.departure.place=clean(item.value).slice(0,180);handled=true;}
    if(key==='localmobility'){travelOrder.logistics.localMobility.push(label||clean(item.value));handled=true;}
    if(key==='waketime'&&time(value)){travelOrder.rhythm.wakeTime=value;handled=true;}
    if(key==='bedtime'&&time(value)){travelOrder.rhythm.bedTime=value;handled=true;}
    if(key==='breakfasttime'&&time(value)){travelOrder.rhythm.breakfastTime=value;handled=true;}
    if(key==='lunchwindow'){travelOrder.rhythm.lunchWindow=clean(item.value).slice(0,120);handled=true;}
    if(key==='dinnertime'&&time(value)){travelOrder.rhythm.dinnerTime=value;handled=true;}
    if(key==='napwindow'){travelOrder.rhythm.napWindow=clean(item.value).slice(0,120);handled=true;}
    if(key==='energypattern'){travelOrder.rhythm.energyPattern=clean(item.value).slice(0,120);handled=true;}
    if(key==='jetlagsensitivity'){travelOrder.rhythm.jetLagSensitivity=clean(item.value).slice(0,80);handled=true;}
    if(['maximumconsecutiveintensedays','maxconsecutiveintensedays'].includes(key)&&/^\d+$/.test(value)){travelOrder.rhythm.maximumConsecutiveIntenseDays=Math.max(1,Math.min(4,Number(value)));handled=true;}
    if(['movementstyle','movementscope','explorationstyle','localmobilityscope'].includes(key)){
      const style={nearwalk:'near_walk',near_walk:'near_walk',compact:'near_walk',walking:'near_walk',zufuß:'near_walk',fuss:'near_walk',citytransit:'city_transit',city_transit:'city_transit',transit:'city_transit',publictransport:'city_transit',busbahn:'city_transit',widetaxicar:'wide_taxi_car',wide_taxi_car:'wide_taxi_car',wide:'wide_taxi_car',taxi:'wide_taxi_car',car:'wide_taxi_car',auto:'wide_taxi_car'}[norm(value)];
      if(style){travelOrder.geography.movementStyle=style;handled=true;}
    }
    if(key==='maximumtransferminutes'&&/^\d+$/.test(value)){travelOrder.geography.maximumTransferMinutes=Math.max(0,Math.min(360,Number(value)));handled=true;}
    if(key==='daytripradiuskm'&&/^\d+$/.test(value)){travelOrder.geography.dayTripRadiusKm=Math.max(0,Math.min(1000,Number(value)));handled=true;}
    if(key==='minimumdistinctareas'&&/^\d+$/.test(value)){travelOrder.geography.minimumDistinctAreas=Math.max(1,Math.min(12,Number(value)));handled=true;}
    if(key==='baselocation'){travelOrder.geography.baseLocation=clean(item.value).slice(0,180);handled=true;}
    if(['basestrategy','accommodationstrategy'].includes(key)){const strategy={single:'single_base',singlebase:'single_base',single_base:'single_base',onebase:'single_base',einebasis:'single_base',split:'split_stay',splitstay:'split_stay',split_stay:'split_stay',multiple:'split_stay',mehrere:'split_stay'}[norm(value)];if(strategy){travelOrder.geography.baseStrategy=strategy;handled=true;}}
    if(key==='spatialclustering'){travelOrder.geography.spatialClustering=!['false','no','nein','0'].includes(value);handled=true;}
    if(key==='weatherfallback'){travelOrder.contingency.weatherFallback=['true','yes','ja','required','erforderlich'].includes(value);handled=true;}
    if(key==='indooroutdoorbalance'){travelOrder.contingency.indoorOutdoorBalance=clean(item.value).slice(0,160);handled=true;}
    if(key==='planbperday'){travelOrder.contingency.planBPerDay=['true','yes','ja','required','erforderlich'].includes(value);handled=true;}
    if(key==='tripbudget'){travelOrder.budget.tripTotal=clean(item.value).slice(0,100);handled=!item.hard;}
    if(key==='dailybudget'){travelOrder.budget.dailyTotal=clean(item.value).slice(0,100);handled=!item.hard;}
    if(key==='currency'){travelOrder.budget.currency=clean(item.value).slice(0,30).toUpperCase();handled=true;}
    if(key==='splurgeday'){travelOrder.budget.splurgeDays.push(label||clean(item.value));handled=true;}
    if(key==='costpriority'){travelOrder.budget.costPriority=clean(item.value).slice(0,160);handled=true;}
    if(key==='reservationstyle'){travelOrder.booking.reservationStyle=clean(item.value).slice(0,120);handled=true;}
    if(key==='bookingdeadline'){travelOrder.booking.deadlines.push(label||clean(item.value));handled=true;}
    if(key==='mustreserve'){travelOrder.booking.mustReserve.push(label||clean(item.value));handled=true;}
    if(key==='groupdecisionmode'){travelOrder.group.decisionMode=clean(item.value).slice(0,120);handled=true;}
    if(key==='fairnessrequired'){travelOrder.group.fairnessRequired=['true','yes','ja','required','erforderlich'].includes(value);handled=true;}
    if(key==='memberpriority'){travelOrder.group.memberPriorities.push(label||clean(item.value));handled=true;}
    if(key==='evidencefreshness'){travelOrder.evidencePolicy.freshness=clean(item.value).slice(0,160);handled=true;}
    if(key==='recheckbeforedays'&&/^\d+$/.test(value)){travelOrder.evidencePolicy.recheckBeforeDays=Math.max(0,Math.min(365,Number(value)));handled=true;}
    if(['mustdo','specificwish'].includes(key)){travelOrder.mustDo.push(label||clean(item.value));handled=true;}
    if(['exclude','avoid'].includes(key)){travelOrder.exclusions.push(label||clean(item.value));handled=true;}
    if(key==='season'){travelOrder.time.season=clean(item.value);handled=true;}
    if(key==='month'){travelOrder.time.month=clean(item.value);handled=true;}
    if(key==='year'&&/^20\d{2}$|^21\d{2}$/.test(value)){travelOrder.time.year=Number(value);handled=true;}
    if(key==='durationnights'&&/^\d+$/.test(value)){travelOrder.time.durationNights=Number(value);handled=true;}
    if(key==='durationdays'&&/^\d+$/.test(value)){travelOrder.time.durationNights=Math.max(1,Number(value)-1);handled=true;}
    if(key==='dateflexibility'){travelOrder.time.dateFlexibility=clean(item.value);handled=true;}
    if(key==='timewindow'){travelOrder.time.requestedWindows.push({label:label||clean(item.value),start:'',end:'',flexible:true});handled=true;}
    // Destinations/dates are already explicit owner-confirmed input; the model may not replace them.
    if(['destination','location','destinationscope','countrypreference'].includes(key)){
      if(key==='destinationscope')travelOrder.destination.scope=clean(item.value);else travelOrder.destination.requested.push(clean(item.value));
      const expected=clean(input.destination?.name);handled=key==='destinationscope'||key==='countrypreference'||!expected||norm(value)===norm(expected)||norm(expected).includes(norm(value))||norm(value).includes(norm(expected));
    }
    if(['startdate','enddate','timezone'].includes(key)){const expected=key==='timezone'?input.destination?.timezone:input[key==='startdate'?'startDate':'endDate'];handled=norm(value)===norm(expected);}
    if(handled)applied.push({label,effect:key});else if(label){unresolved.push({label,hard:Boolean(item.hard)});travelOrder.retainedRequirements.push({type:key||'other',label,hard:Boolean(item.hard)});}
  }
  preferences.interests=unique(preferences.interests).filter(id=>!exclusions.has(id));preferences.food=unique(preferences.food);preferences.accessibility=unique(preferences.accessibility);preferences.mobility=unique(preferences.mobility);
  if((preferences.interests.includes('nightlife')||travelOrder.mustDo.some(item=>/nachtleben|nightlife/i.test(item)))&&!constraints.some(item=>['notafter','endtime','dayend'].includes(norm(item.key))))policy.notAfter='23:59';
  policy.maximumPerDay=Math.min(policy.maximumPerDay,hardPolicy.maximumPerDay);if(hardPolicy.notBefore)policy.notBefore=hardPolicy.notBefore;if(hardPolicy.notAfter)policy.notAfter=hardPolicy.notAfter;
  travelOrder.rhythm.dayStart=travelOrder.rhythm.dayStart||policy.notBefore;travelOrder.rhythm.dayEnd=travelOrder.rhythm.dayEnd||policy.notAfter;travelOrder.rhythm.freeTimePercent=policy.freeTimePercent;
  travelOrder.budget.level=preferences.budgetLevel||'open';
  if(base.movementStyle)travelOrder.geography.movementStyle=base.movementStyle;
  const movementDefaults={near_walk:{maximumTransferMinutes:20,dayTripRadiusKm:4,minimumDistinctAreas:1,localMobility:'Zu Fuß'},city_transit:{maximumTransferMinutes:45,dayTripRadiusKm:20,minimumDistinctAreas:3,localMobility:'Bus und Bahn'},wide_taxi_car:{maximumTransferMinutes:90,dayTripRadiusKm:80,minimumDistinctAreas:3,localMobility:'Taxi, Fahrdienst oder Auto'}}[travelOrder.geography.movementStyle];
  if(movementDefaults){travelOrder.geography.maximumTransferMinutes??=movementDefaults.maximumTransferMinutes;travelOrder.geography.dayTripRadiusKm??=movementDefaults.dayTripRadiusKm;travelOrder.geography.minimumDistinctAreas??=movementDefaults.minimumDistinctAreas;travelOrder.logistics.localMobility=unique([...travelOrder.logistics.localMobility,movementDefaults.localMobility]);}
  if(policy.notAfter<=policy.notBefore)unresolved.push({label:'Beginn und Ende des gewünschten Tages widersprechen sich.',hard:true});
  if(!preferences.interests.length)unresolved.push({label:'Noch kein eindeutiger Suchschwerpunkt: bitte unter Wünsche mindestens einen Bereich auswählen.',hard:true});
  const holidayRegion=norm(travelOrder.travelers.schoolHolidayRegion),matchingHolidayEvidence=holidayRegion?schoolCalendarEvidence.filter(item=>{const evidenceRegion=norm(item.region);return evidenceRegion&&(evidenceRegion===holidayRegion||evidenceRegion.includes(holidayRegion)||holidayRegion.includes(evidenceRegion));}):[];
  const confirmedHolidayCovered=matchingHolidayEvidence.some(item=>travelOrder.time.confirmedStart&&travelOrder.time.confirmedEnd&&item.startDate<=travelOrder.time.confirmedStart&&item.endDate>=travelOrder.time.confirmedEnd);
  if(holidayRegion){travelOrder.travelers.holidayEvidenceIds=matchingHolidayEvidence.map(item=>item.id);travelOrder.travelers.holidayWindows=matchingHolidayEvidence.map(item=>({id:item.id,name:item.name,region:item.region,startDate:item.startDate,endDate:item.endDate,source:item.source,sourceUrl:item.sourceUrl,authority:item.authority,authorityUrl:item.authorityUrl,retrievedAt:item.retrievedAt}));}
  const holidayWindows=suggestHolidayTravelWindows(travelOrder.time,matchingHolidayEvidence);travelOrder.time.suggestedWindows=holidayWindows.length?holidayWindows:suggestRequestedTravelWindows(travelOrder.time);
  if(travelOrder.travelers.schoolHolidayRequired&&!travelOrder.travelers.schoolHolidayRegion)unresolved.push({label:'Für die Ferienplanung fehlt das Bundesland oder die zuständige Schulregion.',hard:true});
  if(travelOrder.travelers.schoolHolidayRequired&&travelOrder.travelers.schoolHolidayRegion&&!matchingHolidayEvidence.length)unresolved.push({label:`Die Schulferien für ${travelOrder.travelers.schoolHolidayRegion} müssen noch aus einer verlässlichen Kalenderquelle bestätigt werden.`,hard:true});
  if(travelOrder.travelers.schoolHolidayRequired&&matchingHolidayEvidence.length&&(!travelOrder.time.confirmedStart||!travelOrder.time.confirmedEnd))unresolved.push({label:'Für die Ferienplanung muss eines der bestätigten Reisezeitfenster gewählt werden.',hard:true});
  if(travelOrder.travelers.schoolHolidayRequired&&travelOrder.travelers.schoolHolidayRegion&&matchingHolidayEvidence.length&&travelOrder.time.confirmedStart&&travelOrder.time.confirmedEnd&&!confirmedHolidayCovered)unresolved.push({label:`Der gewählte Zeitraum ${travelOrder.time.confirmedStart} bis ${travelOrder.time.confirmedEnd} liegt nicht vollständig in den bestätigten Schulferien für ${travelOrder.travelers.schoolHolidayRegion}.`,hard:true});
  const needsRequestedWindow=!travelOrder.travelers.schoolHolidayRequired&&!travelOrder.time.confirmedStart&&!travelOrder.time.confirmedEnd&&travelOrder.time.suggestedWindows.some(item=>item.sourceType==='request');if(needsRequestedWindow)unresolved.push({label:'Wählt eines der aus eurem Reisewunsch abgeleiteten Zeitfenster.',hard:true});
  const confirmedNights=calendarDays(travelOrder.time.confirmedStart,travelOrder.time.confirmedEnd),requestedNights=travelOrder.time.durationNights;
  if(confirmedNights!=null&&confirmedNights>=0&&travelOrder.time.durationNights==null)travelOrder.time.durationNights=confirmedNights;
  const requestPreferences={...clone(input.profilePreferences||{}),dietaryPreferences:unique([...profile.dietary,...preferences.food]),accessibilityNeeds:unique([...profile.accessibility,...preferences.accessibility])};
  const uniqueLabels=values=>values.filter((item,index)=>item.label&&values.findIndex(other=>other.label===item.label&&other.hard===item.hard)===index);
  travelOrder.destination.requested=unique(travelOrder.destination.requested);travelOrder.categories=travelOrder.categories.reduce((items,item)=>{const found=items.find(other=>other.category===item.category);if(!found)items.push(item);else if(item.importance==='required')found.importance='required';return items;},[]);travelOrder.accommodation=unique(travelOrder.accommodation);travelOrder.transport=unique(travelOrder.transport);travelOrder.logistics.localMobility=unique(travelOrder.logistics.localMobility);travelOrder.budget.splurgeDays=unique(travelOrder.budget.splurgeDays);travelOrder.booking.deadlines=unique(travelOrder.booking.deadlines);travelOrder.booking.mustReserve=unique(travelOrder.booking.mustReserve);travelOrder.group.memberPriorities=unique(travelOrder.group.memberPriorities);travelOrder.mustDo=unique(travelOrder.mustDo);travelOrder.exclusions=unique(travelOrder.exclusions);
  const conflictAssessment=normalizeConflictAssessment(data.conflictAssessment),semanticConflictQuestion=conflictQuestion(conflictAssessment),semanticMovementQuestion=unresolved.some(item=>item.hard)?null:movementQuestion(travelOrder);
  const needsHolidayWindow=travelOrder.travelers.schoolHolidayRequired&&matchingHolidayEvidence.length&&!confirmedHolidayCovered,holidayQuestion=travelOrder.travelers.schoolHolidayRequired&&!travelOrder.travelers.schoolHolidayRegion?{id:'school-holiday-region',kind:'calendar',text:'Für welches Bundesland oder welche Schulregion gelten eure Ferien?',reason:'Nur damit kann Luvia einen groben Zeitraum mit echten Ferienterminen abgleichen.',options:[],allowFreeText:true}:needsHolidayWindow?{id:'school-holiday-period',kind:'calendar',text:travelOrder.time.suggestedWindows.length?'Welcher bestätigte Ferienzeitraum passt für euch?':'Für den genannten groben Zeitraum wurde noch kein passendes bestätigtes Ferienfenster gefunden.',reason:travelOrder.time.confirmedStart?'Der bisher gewählte Zeitraum liegt nicht vollständig in den bestätigten Schulferien.':'Luvia plant erst weiter, wenn ihr ein belegtes Zeitfenster gewählt habt.',options:travelOrder.time.suggestedWindows,allowFreeText:false}:null,requestedQuestion=needsRequestedWindow?{id:'requested-travel-period',kind:'calendar',text:`Welcher Zeitraum im ${MONTH_LABELS[requestedMonthYear(travelOrder.time).month-1]||'gewünschten Zeitraum'} passt für euch?`,reason:'Alle Optionen folgen eurem genannten Monat und eurer Reisedauer. Wetter, Flugpreise und Verfügbarkeit werden erst mit echten Quellen bewertet.',options:travelOrder.time.suggestedWindows,allowFreeText:false}:null,modelQuestion=data.followUpQuestion?.text&&!questionsConfirmedDuration(data.followUpQuestion,confirmedNights,requestedNights)?{id:'model-follow-up',kind:'model',text:clean(data.followUpQuestion.text).slice(0,300),reason:clean(data.followUpQuestion.reason).slice(0,300),options:(data.followUpQuestion.options||[]).slice(0,4).map(item=>({label:clean(item.label).slice(0,120),value:clean(item.value).slice(0,120),description:''})),allowFreeText:data.followUpQuestion.allowFreeText!==false}:null,question=holidayQuestion||requestedQuestion||semanticConflictQuestion||modelQuestion||semanticMovementQuestion;
  const explicitKeys=new Set(constraints.map(item=>norm(item.key))),planningAssumptions=[
    {id:'day-rhythm',label:'Tagesrhythmus',value:preferences.pace||'balanced',source:[...explicitKeys].some(key=>['pace','travelpace','planningpace'].includes(key))?'trip-input':'luvia-default',editable:true},
    {id:'free-time',label:'Bewusster Freiraum',value:`${policy.freeTimePercent}%`,source:explicitKeys.has('freetimepercent')?'trip-input':'luvia-default',editable:true},
    {id:'accommodation-base',label:'Unterkunftsbasis',value:travelOrder.geography.baseStrategy,source:[...explicitKeys].some(key=>['basestrategy','accommodationstrategy'].includes(key))?'trip-input':'luvia-default',editable:true},
    {id:'energy-balance',label:'Anstrengende Tage in Folge',value:`maximal ${travelOrder.rhythm.maximumConsecutiveIntenseDays}`,source:'luvia-safety-rule',editable:false}
  ],deferredChecks=['Öffnungszeiten','Wetter','Preise','Buchbarkeit','Veranstaltungen','Einreisebedingungen','aktuelle Verkehrsverbindungen'];
  return immutable({owner:'intelligence',contractId:'intelligence.v1',kind:'trip-planning-brief',source:'ai',understanding:correctConfirmedDurationNarrative(data.understanding,confirmedNights,requestedNights).slice(0,1200),goals:goals.map(goal=>({type:clean(goal.type),label:clean(goal.label).slice(0,180)})),travelOrder,calendarEvidence,conflictAssessment,followUpQuestion:modelQuestion,planningAssumptions,deferredChecks,applied:uniqueLabels(applied),unresolved:uniqueLabels(unresolved),unknowns:(data.unknowns||[]).slice(0,20).map(item=>clean(item).slice(0,180)),question,tripPreferences:preferences,requestPreferences,policy,modelConfidence:Math.max(0,Math.min(1,Number(data.confidence)||0)),automaticPlanningAllowed:!unresolved.some(item=>item.hard),confirmationRequired:true,automaticMutation:false});
}

function confirmTripBriefWindow(brief={},selection={}){
  if(brief?.kind!=='trip-planning-brief'||brief?.owner!=='intelligence')throw Object.assign(new Error('Der semantische Reiseauftrag fehlt.'),{code:'TRIP_BRIEF_REQUIRED'});
  const startDate=calendarDate(selection.startDate),endDate=calendarDate(selection.endDate);if(!startDate||!endDate||endDate<startDate)throw Object.assign(new Error('Das gewählte Reisezeitfenster ist ungültig.'),{code:'TRAVEL_WINDOW_INVALID'});
  const next=clone(brief),time=next.travelOrder.time,travelers=next.travelOrder.travelers||{},previousStart=time.confirmedStart,previousEnd=time.confirmedEnd;time.confirmedStart=startDate;time.confirmedEnd=endDate;time.scheduleMode='fixed';time.durationNights=calendarDays(startDate,endDate);next.understanding=rewriteConfirmedWindowNarrative(next.understanding,previousStart,previousEnd,startDate,endDate);
  const matching=(travelers.holidayWindows||[]).filter(item=>item.startDate<=startDate&&item.endDate>=endDate),holidayRequired=travelers.schoolHolidayRequired===true;
  const removable=item=>/aus eurem Reisewunsch abgeleiteten Zeitfenster|Für die Ferienplanung muss eines der bestätigten Reisezeitfenster|liegt nicht vollständig in den bestätigten Schulferien/.test(clean(item?.label));
  next.unresolved=(next.unresolved||[]).filter(item=>!removable(item));
  if(holidayRequired&&!matching.length)next.unresolved.push({label:`Der gewählte Zeitraum ${startDate} bis ${endDate} liegt nicht vollständig in den bestätigten Schulferien für ${travelers.schoolHolidayRegion||'eure Schulregion'}.`,hard:true});
  if(selection.destinationName)next.travelOrder.destination.confirmed=clean(selection.destinationName);
  if(['school-holiday-period','requested-travel-period'].includes(next.question?.id))next.question=conflictQuestion(next.conflictAssessment)||next.followUpQuestion||movementQuestion(next.travelOrder);
  next.automaticPlanningAllowed=!next.unresolved.some(item=>item.hard);return immutable(next);
}

return Object.freeze({version:VERSION,feelings:FEELINGS,resolve,rankPlaces,composeDayGuidance,normalizeProfile,fitScore,projectTripBrief,confirmTripBriefWindow,suggestRequestedTravelWindows});
})();
