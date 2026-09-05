var LuviaTripPreferenceResolutionCoreV1=(()=>{
'use strict';

const VERSION='1.6.0';
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
function textOf(place={}){return clean([place.name,place.displayName,place.editorialSummary?.text||place.editorialSummary,place.primaryType,place.primaryTypeLabel,place.primary_type,...(place.types||[])].filter(Boolean).join(' ')).toLowerCase()}
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

return Object.freeze({version:VERSION,feelings:FEELINGS,resolve,rankPlaces,composeDayGuidance,normalizeProfile,fitScore});
})();
