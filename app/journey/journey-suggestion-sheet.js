(()=>{
'use strict';

const VERSION='1.17.0-journey-owner-reads';
const cache=new Map();
const handleState=new WeakMap();
const handleControllers=new WeakMap();
let activeHandle=null;
let proposalUnsubscribe=null;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const clean=value=>String(value??'').trim();
const providerId=place=>clean(place?.providerPlaceId||place?.id).replace(/^places\//,'');
const uniquePlaces=items=>{const seen=new Set();return(items||[]).filter(place=>{const id=providerId(place);if(!id||seen.has(id))return false;seen.add(id);return true})};
const tripId=trip=>clean(trip?.id||trip?.tripId);
const contracts=()=>({
  places:globalThis.LuviaPlacesContractV1,
  journey:globalThis.LuviaJourneyContractV1,
  trip:globalThis.LuviaTripContractV1,
  context:globalThis.LuviaTripPreferenceContextV1,
  booking:globalThis.LuviaBookingContractV1
});
const timeValue=value=>{
  const date=value?new Date(value):null;
  return date&&!Number.isNaN(date.getTime())?date.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):'10:00';
};
const dateValue=value=>clean(value).slice(0,10)||new Date().toISOString().slice(0,10);
const destinationOf=trip=>trip?.destination?.name||trip?.destination?.formattedAddress||trip?.destinationName||trip?.destination||'';
const destinationContext=trip=>{
  const destination=trip?.destination||{};
  return{
    name:clean(destination.name||trip?.destinationName),
    formattedAddress:clean(destination.formattedAddress||destination.address||trip?.destinationName),
    placeId:clean(destination.placeId||destination.providerPlaceId||trip?.destinationPlaceId),
    latitude:Number.isFinite(Number(destination.latitude??destination.lat))?Number(destination.latitude??destination.lat):null,
    longitude:Number.isFinite(Number(destination.longitude??destination.lng))?Number(destination.longitude??destination.lng):null
  };
};
const categoryGroup=place=>{
  const value=clean(place?.primaryType||place?.primary_type||place?.types?.[0]).toLowerCase();
  if(/restaurant|cafe|bakery|bar|food|meal/.test(value))return'food';
  if(/hotel|lodging|hostel|motel|campground|accommodation/.test(value))return'accommodation';
  if(/park|beach|garden|natural|hiking|spa/.test(value))return'nature';
  if(/photo|viewpoint|observation/.test(value))return'photo';
  if(/landmark|monument|tourist_attraction|sight/.test(value))return'sightseeing';
  if(/museum|gallery|theater|concert|culture/.test(value))return'culture';
  if(/shopping|store|market|mall/.test(value))return'shopping';
  if(/night_club|nightlife|casino/.test(value))return'nightlife';
  if(/activity|zoo|aquarium|stadium|bowling|escape|swimming/.test(value))return'activities';
  return value||clean(place?.requestedCategory).toLowerCase()||'places';
};
const categoryLabel=group=>({food:'Genuss',accommodation:'Unterkunft',nature:'Draußen',photo:'Fotospot',sightseeing:'Sehenswert',culture:'Kultur',shopping:'Shopping',nightlife:'Nachtleben',activities:'Erleben',places:'Entdecken'}[group]||'Entdecken');
const categoryIcon=group=>({food:'◌',accommodation:'⌂',nature:'≈',photo:'◉',sightseeing:'⌖',culture:'◇',shopping:'□',nightlife:'✺',activities:'↝',places:'✦'}[group]||'✦');
const visualCategory=place=>{
  const value=clean(place?.primaryType||place?.primary_type||place?.types?.[0]).toLowerCase();
  if(/cafe|bakery/.test(value))return'cafe';
  if(/restaurant|food|meal/.test(value))return'food';
  if(/bar|night_club|nightlife/.test(value))return'nightlife';
  if(/park|beach|garden|natural|hiking/.test(value))return'nature';
  if(/spa|wellness/.test(value))return'wellness';
  if(/museum|gallery|theater|concert/.test(value))return'culture';
  if(/landmark|monument|tourist_attraction/.test(value))return'sightseeing';
  if(/shop|store|market/.test(value))return'shopping';
  if(/activity|zoo|aquarium|stadium|bowling|escape|swimming/.test(value))return'activities';
  return'places';
};
const visualLabel=group=>({food:'Restaurant',cafe:'Café',nightlife:'Abend',nature:'Draußen',wellness:'Wellness',culture:'Kultur',sightseeing:'Sehenswert',shopping:'Entdecken',activities:'Erleben',places:'Ort'}[group]||'Ort');
const visualIcon=group=>({food:'◌',cafe:'☕',nightlife:'◐',nature:'≈',wellness:'⌁',culture:'◇',sightseeing:'⌖',shopping:'✦',activities:'↝',places:'•'}[group]||'•');
const visualAccent=group=>({food:'#ef6659',cafe:'#f08a4b',sightseeing:'#e3b63e',culture:'#c15e87',nature:'#2f9478',activities:'#2b8eb8',wellness:'#39a99c',nightlife:'#745eb8',shopping:'#ad609c',places:'#438ea5'}[group]||'#438ea5');
const isBookable=place=>['food','cafe'].includes(visualCategory(place));
const ratings=place=>{
  const rating=Number(place?.rating||0),count=Number(place?.userRatingCount||place?.user_rating_count||0);
  return[rating?`${rating.toFixed(1).replace('.',',')} ★`:'',count?`${count.toLocaleString('de-DE')} Erfahrungen`:''].filter(Boolean).join(' · ');
};
const canonicalPlaceType=place=>{
  const visual=visualCategory(place);
  if(['food','cafe','nightlife'].includes(visual))return'restaurant';
  if(['culture','sightseeing','activities','wellness'].includes(visual))return'attraction';
  if(visual==='nature')return'nature';
  if(visual==='shopping')return'shopping';
  return'attraction';
};
const priceLabel=place=>({PRICE_LEVEL_FREE:'Kostenlos',PRICE_LEVEL_INEXPENSIVE:'€',PRICE_LEVEL_MODERATE:'€€',PRICE_LEVEL_EXPENSIVE:'€€€',PRICE_LEVEL_VERY_EXPENSIVE:'€€€€','0':'Kostenlos','1':'€','2':'€€','3':'€€€','4':'€€€€'}[clean(place?.priceLevel)]||'');
const distanceLabel=place=>{
  const meters=Number(place?.distanceMeters||0);
  if(!Number.isFinite(meters)||meters<=0||place?.distanceReference!=='device')return'';
  return meters<1000?`${Math.round(meters)} m vom aktuellen Standort`:`${(meters/1000).toFixed(1).replace('.',',')} km vom aktuellen Standort`;
};
const observedAt=place=>clean(place?.providerObservedAt||place?.factsObservedAt||place?.fetchedAt||place?.providerFacts?.observedAt);
function factFreshness(place,maxAgeMs=7*86400000){const stamp=observedAt(place),time=stamp?Date.parse(stamp):NaN,ageMs=Number.isFinite(time)?Math.max(0,Date.now()-time):null;return{observedAt:stamp||null,ageMs,fresh:ageMs!=null&&ageMs<=maxAgeMs,cached:Boolean(place?.providerFactsCached)}}
function openingLabel(place,input={}){const target=dateValue(input.targetDate),today=new Date().toISOString().slice(0,10),fresh=factFreshness(place,2*3600000);if(target!==today||!fresh.fresh)return'';return(place?.openNow??place?.currentOpeningHours?.openNow)===true?'Jetzt geöffnet':(place?.openNow??place?.currentOpeningHours?.openNow)===false?'Aktuell geschlossen':''}
const featureFacts=place=>{
  const features=place?.features||{};
  return[
    features.servesVegetarianFood===true?'Vegetarische Auswahl':'',
    features.servesVeganFood===true?'Vegane Auswahl':'',
    place?.accessibilityOptions?.wheelchairAccessibleEntrance===true?'Rollstuhlgerechter Eingang':'',
    features.goodForChildren===true?'Für Kinder ausgewiesen':''
  ].filter(Boolean).slice(0,3);
};
const placeFacts=(place,input)=>[ratings(place),priceLabel(place),distanceLabel(place),openingLabel(place,input)].filter(Boolean).slice(0,3);
const sensitiveEvidence=place=>({
  vegetarian:place?.features?.servesVegetarianFood===true,
  vegan:place?.features?.servesVeganFood===true,
  accessible:place?.accessibilityOptions?.wheelchairAccessibleEntrance===true,
  family:place?.features?.goodForChildren===true
});
function safeReason(reason,place){
  const value=clean(reason),truth=sensitiveEvidence(place),lower=value.toLowerCase();
  if(!value)return'';
  if(/vegan/.test(lower)&&!truth.vegan)return'';
  if(/vegetar/.test(lower)&&!truth.vegetarian&&!truth.vegan)return'';
  if(/barriere|rollstuhl|wheelchair/.test(lower)&&!truth.accessible)return'';
  if(/familienfreund|kinderfreund|für kinder/.test(lower)&&!truth.family)return'';
  return value;
}
const matchLabel=place=>{
  const group=place?.groupFit;
  if(group?.reliable===true&&Number(group.travelerCount)>1&&Number.isFinite(Number(group.score))&&Number(group.coverage)>=45)return`Für euch · ${Math.round(Number(group.score))} %`;
  const personal=(place?.travelerInsights||[]).find(item=>item.isCurrent&&item.reliable)||(place?.travelerInsights||[]).find(item=>item.reliable);
  return personal?`Für ${personal.isCurrent?'dich':personal.name} · ${Math.round(Number(personal.score))} %`:'';
};
const preferenceLabels=value=>{
  if(value==null)return[];
  if(Array.isArray(value))return value.flatMap(preferenceLabels);
  if(typeof value==='object')return Object.entries(value).flatMap(([key,item])=>{
    if(item===false||item==null)return[];
    if(item===true)return[key];
    if(typeof item==='object'&&clean(item.label))return[clean(item.label)];
    return preferenceLabels(item);
  });
  return clean(value)?[clean(value)]:[];
};
async function sharedPreferenceContext(input,{fast=false}={}){
  const projection=await contracts().context?.sharedGroup?.({trip:input.trip,profilePreferences:input.snapshot?.profilePreferences||{},fast,maxWaitMs:420});
  if(projection?.travelers?.length)return projection;
  const profile=globalThis.LuviaProfileService?.snapshot?.().profile||{},signals=[...new Set(preferenceLabels(input.snapshot?.profilePreferences||{}))].slice(0,24),travelers=[{id:clean(profile.userId||profile.id)||'self',name:clean(profile.displayName||profile.firstName)||'Du',role:'owner',signals}];
  return{travelers,coveredTravelers:signals.length?1:0,totalTravelers:1,source:'identity-self-fallback'};
}
function travelerFit(place,group,input){
  const features=place?.features||{},accessibility=place?.accessibilityOptions||{};
  const foodPlace=['food','cafe'].includes(visualCategory(place));
  const providerEvidence=[features.servesVegetarianFood===true?'vegetarian vegetarisch':'',features.servesVeganFood===true?'vegan':'',accessibility.wheelchairAccessibleEntrance===true?'accessible wheelchair barrierefrei rollstuhl':'',features.goodForChildren===true?'family child familienfreundlich kind':''].filter(Boolean);
  const text=[place.name,place.description,place.primaryType,...(place.types||[]),...(place.aiReasons||[]),...providerEvidence].join(' ').toLowerCase();
  const rules=[[/vegetar|vegan|kulinar|genuss|essen|café|cafe/,/restaurant|cafe|bakery|food|meal|vegetar|vegan/,'Genuss'],[/natur|strand|meer|ruhig|entspann|draußen/,/park|beach|garden|nature|hiking|spa/,'Natur und Ruhe'],[/kultur|geschichte|museum|authent|neugier/,/museum|gallery|theater|historic|monument|culture/,'Kultur und lokaler Charakter'],[/famil|kind|abenteuer|aktiv|beweg/,/zoo|aquarium|activity|park|tourist|swimming|bowling/,'gemeinsames Erleben'],[/foto|aussicht|architektur/,/view|photo|landmark|architecture|panoram/,'besondere Perspektiven']];
  const evidenceChecks=[
    [/vegan/,/vegan/,'vegane Eignung',foodPlace],
    [/vegetar/,/vegetar|vegan/,'vegetarische Eignung',foodPlace],
    [/barriere|rollstuhl|wheelchair|mobilitätshilfe/,/accessible|wheelchair|barriere|rollstuhl/,'Barrierefreiheit',true],
    [/famil|kind|baby/,/family|famil|child|kind|zoo|aquarium|playground/,'Familieneignung',true]
  ];
  const matches=[],unresolved=[];
  for(const traveler of group?.travelers||[]){
    const signals=traveler.signals.join(' ').toLowerCase(),rule=rules.find(([preference,placeRule])=>preference.test(signals)&&placeRule.test(text));
    if(rule)matches.push({name:traveler.name,reason:rule[2]});
    const missing=evidenceChecks.find(([preference,evidence,,applicable])=>applicable&&preference.test(signals)&&!evidence.test(text));
    if(missing)unresolved.push({name:traveler.name,reason:missing[2]});
  }
  const names=items=>items.slice(0,3).map(item=>item.name).join(items.length>2?', ':items.length===2?' und ':'');
  if(matches.length&&unresolved.length)return`Für ${names(matches)} sprechen belegte Merkmale für ${matches[0].reason}. Für ${names(unresolved)} fehlt noch der Nachweis zur ${unresolved[0].reason}.`;
  if(matches.length)return`Für ${names(matches)} sprechen belegte Merkmale für ${matches[0].reason}.`;
  if(unresolved.length)return`Für ${names(unresolved)} fehlt noch der Nachweis zur ${unresolved[0].reason}.`;
  const evidence=clean(place?.aiReasons?.[0]||place?.recommendation?.reasons?.[0]||input.reasons?.[0]);
  if(!(group?.travelers||[]).some(traveler=>traveler.signals?.length))return'Noch ohne persönliche Gewichtung: Reisepräferenzen fehlen oder wurden für diese Reise nicht freigegeben.';
  return evidence||'Gemeinsam passend eingeordnet; für eine personengenaue Begründung fehlt noch eindeutige Places-Evidenz.';
}
function travelerPreferences(traveler={}){
  const signals=[...new Set((traveler.signals||[]).map(clean).filter(Boolean))],text=signals.join(' ').toLowerCase();
  return{
    travelInterests:signals,
    dietaryPreferences:[/vegan/.test(text)?'vegan':'',/vegetar/.test(text)?'vegetarian':''].filter(Boolean),
    accessibilityNeeds:[/rollstuhl|wheelchair|barriere|stufenlos/.test(text)?'wheelchair':''].filter(Boolean),
    familyPreferences:[/baby|kinderwagen|stroller/.test(text)?'stroller':''].filter(Boolean)
  };
}
function deterministicTravelerRanking(places,traveler,input){
  const resolver=globalThis.LuviaTripPreferenceResolutionCoreV1,api=globalThis.LuviaIntelligenceContractV1?.reads;
  const payload={trip:input.trip,profilePreferences:travelerPreferences(traveler),tripComposition:input.snapshot?.tripComposition||{},candidates:places,day:input.day,momentContext:{targetDate:input.targetDate,startAt:input.startAt,endAt:input.endAt,dayEntries:input.day?.entries||[],weather:input.weather||null}};
  try{
    const resolution=api?.resolveTripPreferences?.(payload)||resolver?.resolve?.(payload),ranked=api?.rankPlaceCandidates?.({...payload,resolution})||resolver?.rankPlaces?.({...payload,resolution});
    const byId=new Map((ranked?.places||[]).map(place=>[providerId(place),place]));
    return places.map(place=>byId.get(providerId(place))||{...place,preferenceFit:{score:0,coverage:100,eligible:false,deterministic:true,aiScoreUsed:false,dimensions:[]},preferenceWarnings:['Verfügbare Ortsdaten widersprechen einer verbindlichen Anforderung.']});
  }catch{return places.map(place=>({...place,preferenceFit:null,preferenceWarnings:['Die belegbare Passung konnte gerade nicht vollständig berechnet werden.']}))}
}
function median(values=[]){const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);if(!sorted.length)return null;const middle=Math.floor(sorted.length/2);return sorted.length%2?sorted[middle]:Math.round((sorted[middle-1]+sorted[middle])/2)}
function conciseReason(value=''){
  return clean(value).replace(/^f(?:ü|u)r\s+[^:]{1,80}:\s*/i,'').replace(/^(?:besonders\s+)?passend:\s*/i,'').replace(/^passt\s+zu\s+eurem\s+schwerpunkt\s+auf\s+/i,'').replace(/\s+/g,' ');
}
function genericEvidenceReason(value=''){
  return /(?:ist|sind)\s+durch\s+(?:die\s+)?kategorie\s+oder\s+provider-merkmale\s+belegt/i.test(clean(value));
}
async function rankForTravelers(places,group,input,{useAI=true}={}){
  const travelers=(group?.travelers||[]).filter(item=>item?.id).slice(0,8),ranker=globalThis.LuviaAI?.rankCandidates,profile=globalThis.LuviaProfileService?.snapshot?.().profile||{},auth=globalThis.ParisAuth?.getState?.()||{},selfId=clean(profile.userId||profile.id||auth.user?.id||auth.userId),selfName=clean(profile.displayName||profile.firstName);
  if(!travelers.length)return places.map(place=>({...place,travelerInsights:[],groupFit:null,travelerFit:travelerFit(place,group,input)}));
  const rows=await Promise.all(travelers.map(async traveler=>{
    const deterministic=deterministicTravelerRanking(places,traveler,input);let explained=places,ai=false;
    if(useAI&&typeof ranker==='function')try{
      explained=await ranker({domain:'places',contract:{query:input.query,category:'journey-moment-explanation',destination:destinationOf(input.trip),profileContext:{traveler:{id:traveler.id,name:traveler.name,role:traveler.role,sharedSignals:traveler.signals||[]}},momentContext:{targetDate:input.targetDate,startAt:input.startAt,endAt:input.endAt},instruction:'Erkläre kurz anhand der gelieferten Provider-Fakten. Erfinde keine Attribute und liefere keinen eigenen Prozentwert.'},candidates:places});
      ai=explained.some(place=>place.aiRankingFallback!==true);
    }catch{}
    return{traveler,deterministic,explained,ai};
  }));
  const rankedPlaces=places.map(place=>{
    const id=providerId(place),travelerInsights=rows.map(row=>{
      const scored=row.deterministic.find(item=>providerId(item)===id)||place,explanation=row.explained.find(item=>providerId(item)===id)||place,fit=scored.preferenceFit||null;
      const deterministicReasons=(scored.preferenceReasons||[]).map(reason=>safeReason(reason,place)).filter(Boolean),aiReasons=(explanation.aiReasons||[]).map(reason=>safeReason(reason,place)).filter(Boolean);
      const score=Number.isFinite(Number(fit?.score))?Math.round(Number(fit.score)):null,coverage=Number.isFinite(Number(fit?.coverage))?Math.round(Number(fit.coverage)):null,personalCoverage=Number.isFinite(Number(fit?.personalCoverage))?Math.round(Number(fit.personalCoverage)):0,isCurrent=Boolean(selfId&&clean(row.traveler.id)===selfId||selfName&&clean(row.traveler.name)===selfName||!selfId&&!selfName&&row.traveler.role==='owner'),reliable=fit?.eligible!==false&&score!=null&&coverage>=45&&personalCoverage>=25;
      return{id:row.traveler.id,name:row.traveler.name,role:row.traveler.role,score,coverage,personalCoverage,isCurrent,reliable,eligible:fit?.eligible!==false,reasons:[...new Set([...aiReasons,...deterministicReasons])].slice(0,2),unknowns:[...new Set([...(scored.preferenceWarnings||[]),...(explanation.aiUnknowns||[])].map(clean).filter(Boolean))].slice(0,2),dimensions:fit?.dimensions||[],formula:fit?.formula||'',aiExplanation:row.ai,aiScoreUsed:false};
    });
    const eligible=travelerInsights.filter(item=>item.reliable),scores=eligible.map(item=>item.score),coverages=eligible.map(item=>item.coverage).filter(Number.isFinite),allTravelersCovered=travelers.length>0&&eligible.length===travelers.length,groupFit={score:allTravelersCovered?median(scores):null,lowest:scores.length?Math.min(...scores):null,highest:scores.length?Math.max(...scores):null,coverage:coverages.length?median(coverages):null,coveredTravelerCount:eligible.length,travelerCount:travelers.length,reliable:allTravelersCovered,method:'median-of-evidence-weighted-traveler-scores',aiScoreUsed:false};
    const strongest=eligible.find(item=>item.isCurrent)||[...eligible].sort((a,b)=>b.score-a.score)[0],reason=conciseReason(strongest?.reasons?.[0]),summary=strongest?`Für ${strongest.isCurrent?'dich':strongest.name}: ${reason||'Die belegten Ortsmerkmale decken sich mit den freigegebenen Vorlieben.'}`:travelerFit(place,group,input);
    return{...place,travelerInsights,groupFit,preferenceFit:strongest?{score:strongest.score,coverage:strongest.coverage}:null,travelerFit:summary};
  });
  const personalScore=place=>{const insight=place.travelerInsights?.find(item=>selfId&&clean(item.id)===selfId)||place.travelerInsights?.find(item=>selfName&&clean(item.name)===selfName)||place.travelerInsights?.find(item=>item.role==='owner');return Number.isFinite(Number(insight?.score))?Number(insight.score):Number(place.groupFit?.score||0)};
  return rankedPlaces.sort((left,right)=>personalScore(right)-personalScore(left)||Number(right.rating||0)-Number(left.rating||0));
}
function currentInput(input={}){
  const {context,journey}=contracts(),snapshot=context?.snapshot?.()||{},trip=input.trip||snapshot.trip||{},graph=journey?.reads?.snapshot?.({trip})||journey?.reads?.snapshot?.()||{};
  const dayGuidance=context?.dayGuidance?.(graph)||{},guidance=dayGuidance.suggestion||{};
  const targetDate=dateValue(input.targetDate||guidance.targetDate||graph.currentDay?.date||trip.startDate||trip.start_date);
  const day=graph.days?.find?.(item=>item.date===targetDate)||graph.currentDay||graph.days?.[0]||null;
  const gap=day?.openGaps?.find?.(item=>!input.startAt||item.startAt===input.startAt)||day?.openGaps?.[0]||null;
  const travelSnapshot=globalThis.LuviaTravelContext?.snapshot?.()||{},rawPosition=input.positionContext||travelSnapshot.location||null,contextGate=globalThis.LuviaTravelOrchestrationCoreV1?.gateContext?.({
    purpose:'timeline-suggestion',context:{coordinates:rawPosition,observedAt:rawPosition?.updatedAt||rawPosition?.timestamp,source:input.positionContext?'explicit-sheet-input':'device'},
    grant:input.contextGrant||{granted:Boolean(input.positionContext||travelSnapshot.permission==='granted'),precision:'precise'}
  }),positionContext=contextGate?(contextGate.allowed?{latitude:contextGate.context?.coordinates?.lat,longitude:contextGate.context?.coordinates?.lng,observedAt:contextGate.context?.observedAt,source:contextGate.context?.source}:null):rawPosition;
  return{
    trip,graph,day,targetDate,disruptionRecovery:contracts().journey?.reads?.disruptionRecovery?.({entries:day?.entries||[],disruptions:input.disruptions||snapshot.disruptions||[]})||null,
    startAt:input.startAt||guidance.startAt||gap?.startAt||`${targetDate}T10:00:00`,
    endAt:input.endAt||guidance.endAt||gap?.endAt||null,
    query:clean(input.query||guidance.query||'Ein passender gemeinsamer Reisemoment'),
    reasons:[...(input.reasons||guidance.reasons||[])],
     snapshot,planningPolicy:{...(dayGuidance.policy||{}),...(input.planningPolicy||{})},weather:input.weather||globalThis.LuviaWeatherContextV1?.current||null,positionContext,contextGate:contextGate||null,source:clean(input.source)||'timeline-suggestion',requestedCount:Number(input.requestedCount)||null,onSelectionChange:typeof input.onSelectionChange==='function'?input.onSelectionChange:null,excludeProviderPlaceIds:[...(input.excludeProviderPlaceIds||[])].map(clean).filter(Boolean)
  };
}
function categoryPlan(input){
  const resolution=input.snapshot?.resolution||{},groupLabels=(input.groupContext?.travelers||[]).flatMap(item=>item.signals||[]),labels=[...(resolution.summary?.tripFeelings||[]),...(resolution.summary?.profileHighlights||[]),...groupLabels,...input.reasons,input.query].join(' ').toLowerCase();
  const scheduled=(input.day?.entries||[]).map(categoryGroup),weights={nature:2,culture:2,activities:2,food:2,sightseeing:1.8,photo:1.4,shopping:1,nightlife:.8,accommodation:.4};
  const boost=(category,value)=>{weights[category]+=value};
  if(/ruhig|luft|entspann|natur|strand|meer/.test(labels))boost('nature',5);
  if(/kultur|geschichte|neugier|authent/.test(labels))boost('culture',5);
  if(/beweg|aktiv|famil|abenteuer|spann/.test(labels))boost('activities',5);
  if(/genuss|kulinar|vegetar|vegan/.test(labels))boost('food',5);
  if(/foto|aussicht|perspektive|sonnenuntergang/.test(labels))boost('photo',5);
  if(/sehensw|wahrzeichen|highlight|entdecken/.test(labels))boost('sightseeing',4);
  if(/shopping|markt|boutique|einkauf/.test(labels))boost('shopping',5);
  if(/nacht|club|bar|tanzen|live.?musik/.test(labels))boost('nightlife',5);
  if(/unterkunft|hotel|camping|übernacht/.test(labels))boost('accommodation',6);
  if(!scheduled.includes('food'))boost('food',3);
  const startHour=new Date(input.startAt||'').getHours(),endHour=input.endAt?new Date(input.endAt).getHours():23;
  if(Number.isFinite(startHour)&&Number.isFinite(endHour)&&((startHour<14&&endHour>=11)||(startHour<21&&endHour>=18)))boost('food',3);
  if(Number.isFinite(startHour)&&startHour>=18)boost('nightlife',3);
  return Object.keys(weights).sort((left,right)=>weights[right]-weights[left]).slice(0,6);
}
function queryFor(category,input){
  const destination=destinationOf(input.trip);
  const feeling=input.snapshot?.resolution?.summary?.tripFeelings?.slice?.(0,2)?.join(' und ')||'';
  const base={
    nature:'Ein besonderer ruhiger Ort draußen',
    culture:'Lokales Leben, Kultur und Geschichten',
    activities:'Ein gemeinsames Erlebnis mit Charakter',
    food:'Ein passender Genussmoment mit lokaler Küche',
    sightseeing:'Eine besondere Sehenswürdigkeit mit lokalem Charakter',
    photo:'Ein eindrucksvoller Fotospot mit passender Lichtstimmung',
    shopping:'Ein besonderer Markt oder lokaler Laden',
    nightlife:'Ein passender Abendort mit Musik oder Nachtleben',
    accommodation:'Eine passende Unterkunft für diese Reise'
  }[category]||input.query;
  return[base,feeling?`für ${feeling}`:'',destination?`in ${destination}`:''].filter(Boolean).join(' ');
}
function cacheKey(input){return[tripId(input.trip),input.targetDate,clean(input.startAt),input.query,...input.excludeProviderPlaceIds].join('|')}
const imageUrl=place=>clean(place?.image?.url||place?.photoUri||place?.imageUrl);
function imageAttribution(place){
  const image=place?.image||{},credit=clean(image.credit||place?.photoCredit),license=clean(image.license||place?.photoLicense),sourceUrl=clean(image.sourceUrl||place?.photoSourceUrl);
  if(!credit&&!license&&!sourceUrl)return null;
  return{credit:credit||'Fotoquelle',license,sourceUrl};
}
async function within(promise,timeoutMs,fallback){
  let timer=0;
  try{return await Promise.race([Promise.resolve(promise),new Promise(resolve=>{timer=setTimeout(()=>resolve(fallback),timeoutMs)})])}
  finally{clearTimeout(timer)}
}
async function enrich(place){
  const api=contracts().places,id=providerId(place);
  if(!id||!api?.reads?.getCard)return place;
  try{
    const card=await api.reads.getCard(id,{maxWidthPx:960,maxHeightPx:720});
    return{...place,...(card?.place||{}),image:card?.image||place.image||null};
  }catch{return place}
}
function desiredCount(input){
  if(Number(input.requestedCount)>0)return Math.min(18,Number(input.requestedCount));
  const entries=input.day?.entries?.length||0,gapMinutes=input.startAt&&input.endAt?Math.max(0,(new Date(input.endAt)-new Date(input.startAt))/60000):0,travelSpeed=clean(input.planningPolicy?.travelSpeed||'balanced').toLowerCase(),defaultMaximum=travelSpeed==='calm'?5:travelSpeed==='dense'?8:6,paceMaximum=Math.max(3,Math.min(8,Number(input.planningPolicy?.maximumSuggestions)||defaultMaximum));
  if(entries===0)return Math.min(6,paceMaximum);
  if(gapMinutes>=480)return Math.min(6,paceMaximum);
  if(gapMinutes>=240)return Math.min(5,paceMaximum);
  if(gapMinutes>=120)return Math.min(4,paceMaximum);
  return Math.min(3,paceMaximum);
}
function diversify(rows=[],count=3){
  const selected=[],groups=new Set(),seen=new Set();
  for(const row of rows){const id=providerId(row);if(!id||seen.has(id))continue;seen.add(id);const group=categoryGroup(row);if(groups.has(group))continue;groups.add(group);selected.push(row);if(selected.length===count)break}
  if(selected.length>=count)return selected.slice(0,count);
  for(const row of rows){const id=providerId(row);if(!id||selected.some(item=>providerId(item)===id))continue;selected.push(row);if(selected.length>=count)break}
  return selected.slice(0,count);
}
async function load(rawInput={},options={}){
  const input=currentInput(rawInput),fast=options.fast!==false,key=`${cacheKey(input)}|${fast?'provider':'enriched'}`,existing=cache.get(key);
  if(existing&&!options.force&&Date.now()-existing.loadedAt<180000)return{...existing,input,cached:true};
  const api=contracts().places;
  if(!api?.reads?.recommend)throw Object.assign(new Error('Places ist noch nicht vollständig bereit.'),{code:'PLACES_CONTRACT_UNAVAILABLE'});
  input.groupContext=await sharedPreferenceContext(input,{fast});
  const categories=categoryPlan(input),requestDescriptors=categories.map(category=>({category,promise:api.reads.recommend({
    tripId:tripId(input.trip),
    text:queryFor(category,input),query:queryFor(category,input),category,
    destination:destinationOf(input.trip),destinationContext:destinationContext(input.trip),
     candidateLimit:fast?24:36,limit:fast?6:8,fastPath:fast,
    profilePreferences:input.snapshot.profilePreferences||{},
    profileContext:{groupTravelers:input.groupContext.travelers.map(item=>({name:item.name,role:item.role,sharedSignals:item.signals})),groupCoverage:{covered:input.groupContext.coveredTravelers,total:input.groupContext.totalTravelers}},
    tripComposition:input.snapshot.tripComposition||{},trip:input.trip,
    momentContext:{kind:'timeline-open-window',targetDate:input.targetDate,startAt:input.startAt,endAt:input.endAt,query:input.query,reasons:input.reasons,weather:input.weather||null},positionContext:input.positionContext||null
  })})),requests=requestDescriptors.map(item=>item.promise);
  let responses;
  if(fast){
    responses=await new Promise(resolve=>{
      const settled=[];let completed=0,finished=false;
      const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);resolve(settled.slice())};
      const timer=setTimeout(finish,2800);
      requestDescriptors.forEach(({category,promise})=>Promise.resolve(promise).then(value=>{
        settled.push({status:'fulfilled',value,category});completed++;
        const successful=settled.filter(item=>item.status==='fulfilled'&&item.value?.places?.length),places=uniquePlaces(successful.flatMap(item=>(item.value?.places||[]).map(place=>({...place,requestedCategory:item.category})))),groups=new Set(places.map(categoryGroup)),minimumResponses=Math.min(4,requestDescriptors.length),minimumGroups=Math.min(4,desiredCount(input));
        if((successful.length>=minimumResponses&&groups.size>=minimumGroups&&places.length>=desiredCount(input))||completed===requestDescriptors.length)finish();
      },reason=>{settled.push({status:'rejected',reason,category});completed++;if(completed===requestDescriptors.length)finish()}));
    });
  }else responses=await Promise.all(requestDescriptors.map(async({category,promise})=>{try{return{status:'fulfilled',value:await promise,category}}catch(reason){return{status:'rejected',reason,category}}}));
  const successfulResponses=responses.filter(item=>item.status==='fulfilled'),successful=successfulResponses.map(item=>item.value),excluded=new Set(input.excludeProviderPlaceIds),rows=successfulResponses.flatMap(item=>(item.value?.places||[]).map(place=>({...place,requestedCategory:item.category||place.requestedCategory}))).filter(place=>!excluded.has(providerId(place))).map(place=>({...place,distanceReference:input.positionContext&&Number.isFinite(Number(place.distanceMeters))?'device':null}));
  if(!rows.length){
    const prior=existing||[...cache.values()].find(item=>item.input?.trip&&tripId(item.input.trip)===tripId(input.trip));
    if(prior)return{...prior,input,cached:true,stale:true,warning:'Die Live-Suche ist gerade nicht erreichbar. Ihr seht den letzten erfolgreichen, noch nicht bestätigten Vorschlagsstand.'};
    const failed=responses.find(item=>item.status==='rejected');
    throw Object.assign(new Error(failed?.reason?.publicMessage||failed?.reason?.message||'Luvia konnte gerade keine belegbaren Vorschläge laden.'),{code:failed?.reason?.code||'JOURNEY_SUGGESTIONS_UNAVAILABLE'});
  }
   const count=desiredCount(input),unique=[],seen=new Set();
   for(const row of rows){const id=providerId(row);if(!id||seen.has(id))continue;seen.add(id);unique.push(row);if(unique.length>=18)break}
   if(unique.length<Math.min(3,count)){
    const failed=responses.find(item=>item.status==='rejected');
    throw Object.assign(new Error(`Luvia konnte gerade nur ${unique.length} von 3 fachlich belegbaren Möglichkeiten zusammenstellen. Bitte versucht es erneut.`),{code:failed?.reason?.code||'JOURNEY_SUGGESTIONS_INCOMPLETE'});
  }
   const firstCandidates=fast?diversify(unique,Math.min(unique.length,Math.max(count,6))):unique;
   const enriched=fast?await within(Promise.all(firstCandidates.map(enrich)),1600,firstCandidates):await Promise.all(unique.map(enrich));
   const personallyRanked=await rankForTravelers(enriched,input.groupContext,input,{useAI:!fast});
   const choices=diversify(personallyRanked,count);
  const ai={planning:successful.some(item=>item?.plan?.ai&&!item.plan.ai.fallback),ranking:successful.some(item=>item?.aiMeta?.ranking?.used),fallback:successful.every(item=>item?.aiMeta?.ranking?.fallback===true||item?.plan?.ai?.fallback===true)};
   const digitalTwin=contracts().journey?.reads?.destinationTwin?.({generatedAt:new Date().toISOString(),places:choices,entries:input.day?.entries||[],weather:input.weather||null})||null;
   const result={input,choices,ai,digitalTwin,count,loadedAt:Date.now(),cached:false,stale:false,phase:fast?'provider-facts':'ai-enriched',warning:'',attempts:responses.length,successfulAttempts:successful.length};
  cache.set(key,result);return result;
}
function reasonFor(place,input){
  const reasons=[...(place?.aiReasons||[]),...(place?.recommendation?.reasons||[]),...(input.reasons||[])].map(reason=>safeReason(reason,place)).filter(reason=>reason&&!genericEvidenceReason(reason));
  if(reasons[0])return conciseReason(reasons[0]);
  const facts=[visualLabel(visualCategory(place))],rating=Number(place?.rating),count=Number(place?.userRatingCount||place?.user_rating_count),features=featureFacts(place);
  if(Number.isFinite(rating)&&rating>0)facts.push(`${rating.toFixed(1).replace('.',',')} Sterne${count?` aus ${count.toLocaleString('de-DE')} Bewertungen`:''}`);
  if(features[0])facts.push(features[0].toLowerCase());
  if(openingLabel(place,input))facts.push(openingLabel(place,input).toLowerCase());
  return facts.length?`Belegt sind ${facts.slice(0,2).join(' und ')}. Eine persönliche Passung wird erst mit ausreichend freigegebenen Präferenzdaten behauptet.`:'Für diesen Ort liegen noch nicht genug belegte Merkmale für eine persönliche Kurzbegründung vor.';
}
function displayReason(place,input){
  const insights=place?.travelerInsights||[],current=insights.find(item=>item.isCurrent)||insights[0];
  if(current&&!current.reliable){
    const unknown=clean(current.unknowns?.[0]);
    if(unknown)return`Für ${current.isCurrent?'dich':current.name} noch nicht belegt: ${unknown.replace(/^[^:]{1,60}:\s*/,'')}`;
  }
  const value=clean(place?.travelerFit),weak=/^(?:gemeinsam passend|passt als anderer moment|die belegten ortsmerkmale|verfügbare ortsdaten|noch ohne persönliche gewichtung)/i.test(value);
  return!value||weak||genericEvidenceReason(value)?reasonFor(place,input):value;
}
function whyMarkup(place,input){
  const travelerCount=Math.max(0,Number(place.groupFit?.travelerCount||(place.travelerInsights||[]).length));
  const isGroup=travelerCount>1;
  const insights=(place.travelerInsights||[]).map(item=>{
    const dimensions=(item.dimensions||[]).map(dimension=>`${clean(dimension.label)} ${Number(dimension.points).toFixed(1).replace('.',',')}/${Number(dimension.coverageWeight??dimension.weight).toFixed(1).replace('.',',')}`).join(' · ');
    return`<li><span><strong>${esc(item.name)}</strong>${item.reliable?`<b>${esc(item.score)}%</b>`:'<b>noch nicht belastbar</b>'}</span><small>${esc(item.reasons[0]||item.unknowns[0]||'Für diese Person fehlen noch eindeutige belegte Merkmale.')}</small>${dimensions?`<em>${esc(dimensions)}</em>`:''}</li>`;
  }).join('');
  const group=place.groupFit||{},coverage=group.reliable?`${Math.round(Number(group.coverage))}% der möglichen Gewichtung ist mit echten Daten belegt.`:`Für ${Number(group.coveredTravelerCount||0)} von ${Number(group.travelerCount||0)} Reisenden reicht die belegte persönliche Grundlage für eine Prozentangabe.`;
  const formula=(place.travelerInsights||[]).find(item=>item.formula)?.formula||'Profil 30 · Anforderungen 25 · Reisegefühl 15 · Tagesbalance 12 · belegte Entfernung 10 · Zeit/Öffnung/Wetter 8';
  const scoreMethod=group.reliable?(isGroup?'Gemeinsamer Wert: Median der vollständig belegbaren persönlichen Werte. ':'Persönlicher Wert: Summe der belegbaren gewichteten Merkmale. '):'';
  return`<details class="lvjs-why" data-lvjs-why="${esc(providerId(place))}"><summary>${isGroup?'Warum für euch?':'Warum für dich?'}</summary><p>${esc(displayReason(place,input))}</p>${insights?`<ul>${insights}</ul>`:''}<small>${esc(coverage)} ${scoreMethod}Rechnung: ${esc(formula)}. KI formuliert nur die Kurzbegründung und verändert weder Fakten noch Prozentwerte.</small></details>`;
}
function cardMarkup(place,index,input,choices=[]){
  const id=providerId(place),visual=visualCategory(place),image=imageUrl(place),attribution=imageAttribution(place),facts=placeFacts(place,input),match=matchLabel(place),bookable=isBookable(place),alternative=Number(input.requestedCount)>1?nearestAlternative(place,choices):null;
  const credit=attribution?`<span class="lvjs-photo-credit">${esc(attribution.credit)}${attribution.license?` · ${esc(attribution.license)}`:''}</span>`:'';
  return`<article class="lvjs-choice" data-suggestion-choice="${esc(id)}" data-choice-index="${index}" data-suggestion-category="${esc(visual)}"><button type="button" class="lvjs-choice-main" data-suggestion-select="${esc(id)}" aria-pressed="false">${image?`<img data-lvjs-image src="${esc(image)}" alt="${esc(place.name||'Reiseort')}" loading="${index<2?'eager':'lazy'}" decoding="async">`:'<span class="lvjs-choice-placeholder" data-lvjs-image aria-hidden="true">✦</span>'}<span class="lvjs-choice-copy"><small>${esc(visualIcon(visual))} ${esc(visualLabel(visual))}</small><strong>${esc(place.name||'Unbenannter Ort')}</strong><em>${esc(place.formattedAddress||place.address||'Am Reiseziel')}</em><span class="lvjs-choice-facts" data-lvjs-facts>${facts.map(fact=>`<b>${esc(fact)}</b>`).join('')}</span>${match?`<span class="lvjs-choice-match" data-lvjs-match><b>${esc(match)}</b><small>aus belegten Merkmalen</small></span>`:''}<span class="lvjs-traveler-fit" data-lvjs-fit>${esc(displayReason(place,input))}</span>${credit}</span><span class="lvjs-choice-check" aria-hidden="true">✓</span></button>${whyMarkup(place,input)}<form class="lvjs-choice-scheduler" data-lvjs-scheduler="${esc(id)}" hidden><div class="lvjs-choice-schedule-fields"><label>Tag<input name="date" type="date" required value="${esc(input.targetDate)}"></label><label>Start<input name="time" type="time" required value="${esc(timeValue(input.startAt))}"></label><label>Dauer<select name="duration"><option value="60">1 Std.</option><option value="75">1:15 Std.</option><option value="90">1:30 Std.</option><option value="120">2 Std.</option><option value="180">3 Std.</option></select></label></div><p data-lvjs-card-plan>Die Zeit wird mit den anderen gewählten Orten abgestimmt.</p><div class="lvjs-choice-actions">${bookable?`<button type="button" data-lvjs-booking="${esc(id)}">Tisch reservieren</button>`:''}<button type="button" data-lvjs-plan="${esc(id)}">Zur Timeline</button></div>${alternative?`<button class="lvjs-nearby-action" type="button" data-lvjs-nearby="${esc(id)}">Alternative · ${esc(alternativeCause(place,alternative))}</button>`:''}<div class="lvjs-card-state" data-lvjs-card-state aria-live="polite"></div></form></article>`;
}
function shellMarkup(input){
  const destination=destinationOf(input.trip)||'eurem Reiseziel',count=desiredCount(input),placesSearch=input.source==='places-search';
  const title=placesSearch?`${count} passende Orte gefunden.`:'Möglichkeiten für euren freien Moment.';
  const copy=placesSearch?'Wischt seitlich durch die belegten Treffer. Ein Tipp öffnet Termin und nächste Aktion direkt in der Karte.':'Places belegt die Fakten. Luvia gewichtet Profile, Reisegefühl und euren Tag. Ein Tipp wählt; noch wird nichts verändert.';
  return`<header class="lvjs-header"><div><span>${placesSearch?'Places entdecken':'Luvia'} · ${esc(input.targetDate)}</span><h2 data-lvjs-heading>${esc(title)}</h2><p>${esc(copy)}</p></div><button type="button" data-lvjs-close aria-label="${placesSearch?'Zurück zur Places-Suche':'Vorschläge schließen'}">×</button></header><div class="lvjs-status" data-lvjs-status role="status" aria-live="polite"><span class="lvjs-loader" aria-hidden="true"></span><div><strong>Luvia prüft ${esc(destination)} …</strong><small>Orte werden gesucht, fachlich gefiltert und für alle Reisenden belegbar gewichtet.</small></div></div><div class="lvjs-results" data-lvjs-results hidden></div><footer class="lvjs-footer"><span data-lvjs-ai-state>Places belegt · Luvia ordnet · ihr bestätigt</span><button type="button" class="lvjs-footer-plan" data-lvjs-plan-selected hidden>Zur Timeline hinzufügen</button><button type="button" data-lvjs-spectrum>Alle Richtungen entdecken</button><button type="button" data-lvjs-retry hidden>Erneut prüfen</button></footer>`;
}
async function openBooking(place,button,form,handle,result,viewState){
  const booking=contracts().booking;
  if(!booking?.commands?.openPlaceBooking)throw new Error('Booking ist gerade noch nicht bereit.');
  button.disabled=true;const label=button.textContent;button.textContent='Booking Core prüft …';
  try{
    const data=new FormData(form),sheetHost=handle.overlay.querySelector('[data-journey-suggestion-sheet]')||handle.overlay;
    const selectedId=providerId(place);
    const restore=()=>{sheetHost.className='lvjs-sheet';sheetHost.dataset.journeySuggestionSheet='true';sheetHost.innerHTML=shellMarkup(result.input);paintResults(handle,result,selectedId,viewState);queueMicrotask(()=>sheetHost.querySelector(`[data-lvjs-booking="${CSS.escape(selectedId)}"]`)?.focus())};
    const showRouteState=(kind,headline,copy)=>{const status=handle.overlay.querySelector('[data-lvjs-status]');if(!status)return;status.hidden=false;status.className=`lvjs-status ${kind}`;status.innerHTML=`<span aria-hidden="true">${kind==='is-success'?'↗':'!'}</span><div><strong>${esc(headline)}</strong><small>${esc(copy)}</small></div>`};
    const opened=await booking.commands.openPlaceBooking(place,{
      source:'consumer.journey-suggestions',host:sheetHost,onBack:restore,
      onExternal:({route})=>showRouteState('is-success',`${route.provider||'Buchungsanbieter'} wurde geöffnet.`, 'Der Booking Core hat den belegten Providerweg gewählt. Die Reservierungsdaten gebt ihr direkt dort ein.'),
      onUnavailable:({route})=>showRouteState('is-error','Kein belegter Buchungsweg gefunden.',route?.reason==='ROUTE_PREVIEW_UNAVAILABLE'?'Die Prüfung war technisch nicht erreichbar. Es wurde nichts geöffnet oder versendet.':'Weder ein belastbarer Providerlink noch eine verifizierte öffentliche Buchungs-E-Mail wurden gefunden.'),
      date:dateValue(data.get('date')),time:clean(data.get('time'))||timeValue(result.input.startAt),reserveExternalWindow:true
    });
    if(opened?.opened!==true&&opened?.channel!=='unavailable')throw new Error('Für diesen Ort ist gerade kein bestätigter Buchungsweg verfügbar.');
    return opened;
  }finally{button.disabled=false;button.textContent=label}
}
function durationFor(place){return({food:90,cafe:60,nightlife:120,nature:90,wellness:120,culture:120,sightseeing:90,shopping:75,activities:120,places:75}[visualCategory(place)]||75)}
function coordinates(place){const value=place?.coordinates||place?.location||{};return{lat:Number(value.latitude??value.lat),lng:Number(value.longitude??value.lng)}}
function distanceBetween(left,right){const a=coordinates(left),b=coordinates(right);if(![a.lat,a.lng,b.lat,b.lng].every(Number.isFinite))return null;const rad=value=>value*Math.PI/180,dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng),x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;return 6371000*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
function routeBuffer(input={}){return Math.max(5,Math.min(20,Number(input.planningPolicy?.routeBufferMinutes)||10))}
function transferBetween(left,right,input={},reference='timeline'){
  const meters=distanceBetween(left,right),fallbackBuffer=routeBuffer(input),origin=clean(left?.name||left?.title),distanceReference=reference==='selection'?'previous-selected-place':'previous-timeline-place',prefix=origin?`Von „${origin}“`:(reference==='selection'?'Vom zuvor gewählten Ort':'Vom vorherigen Timeline-Ort');
  const travelMinutes=Number.isFinite(meters)?Math.max(8,Math.ceil((meters/1000)/4.5*60/5)*5):20,weatherRisk=Number(input.weather?.precipitationProbability??input.weather?.rainProbability??0)/100;
  const uncertainty=contracts().journey?.reads?.routeUncertainty?.({baseMinutes:travelMinutes,travelSpeed:clean(input.planningPolicy?.travelSpeed)||'balanced',orientationMinutes:fallbackBuffer,weatherRisk:Number.isFinite(weatherRisk)?weatherRisk:0,disruptionRisk:Number(input.disruptionRisk)||0,providerConfidence:Number.isFinite(meters)?.68:.3,evidence:Number.isFinite(meters)?[{source:'places.coordinates',kind:'air-distance',observedAt:new Date().toISOString()}]:[]})||null;
  const rawBuffer=Math.max(fallbackBuffer,uncertainty?.recommendedBufferMinutes||0),buffer=Math.min(20,rawBuffer),minutes=travelMinutes+buffer;
  if(!Number.isFinite(meters))return{minutes,travelMinutes,bufferMinutes:buffer,distanceMeters:null,distanceReference,label:`${prefix}: Weg noch zu prüfen · ${buffer} Min. realistischer Ankunfts-/Orientierungspuffer`,verified:false,uncertainty};
  const km=meters/1000;return{minutes,travelMinutes,bufferMinutes:buffer,distanceMeters:Math.round(meters),distanceReference,label:`${prefix}: ${km.toFixed(1).replace('.',',')} km Luftlinie · ${travelMinutes} Min. Wegeansatz + ${buffer} Min. belastbarer Puffer`,verified:true,uncertainty};
}
function priceRank(place){return{PRICE_LEVEL_FREE:0,PRICE_LEVEL_INEXPENSIVE:1,PRICE_LEVEL_MODERATE:2,PRICE_LEVEL_EXPENSIVE:3,PRICE_LEVEL_VERY_EXPENSIVE:4,'0':0,'1':1,'2':2,'3':3,'4':4}[clean(place?.priceLevel)]}
function alternativeCause(current,candidate){
  if(current?.openNow===false&&candidate?.openNow===true)return'jetzt geöffnet';
  const currentPrice=priceRank(current),candidatePrice=priceRank(candidate);if(Number.isFinite(currentPrice)&&Number.isFinite(candidatePrice)&&candidatePrice<currentPrice)return'günstiger belegt';
  if(candidate?.features?.servesVegetarianFood===true&&current?.features?.servesVegetarianFood!==true)return'vegetarisch belegt';
  if(Number(candidate?.rating)>Number(current?.rating))return'besser bewertet';
  const meters=distanceBetween(current,candidate);if(Number.isFinite(meters))return meters<1000?`${Math.max(10,Math.round(meters/10)*10)} m entfernt`:`${(meters/1000).toFixed(1).replace('.',',')} km entfernt`;
  return visualCategory(candidate)!==visualCategory(current)?'andere belegte Kategorie':'weitere belegte Option';
}
function nearestAlternative(place,choices=[],excluded=[]){const blocked=new Set([providerId(place),...excluded]);return choices.filter(item=>!blocked.has(providerId(item))).map(item=>({item,meters:distanceBetween(place,item)})).sort((left,right)=>(Number.isFinite(left.meters)?left.meters:Infinity)-(Number.isFinite(right.meters)?right.meters:Infinity))[0]?.item||null}
function localParts(value){const date=new Date(value);return{date:`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,time:`${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`}}
function initialPlan(place,input){return{date:dateValue(input.targetDate),time:timeValue(input.startAt),duration:durationFor(place),manual:false}}
function weatherForDate(input,date){
  const source=input.weather;if(!source)return null;
  const target=dateValue(date),daily=[...(Array.isArray(source.daily)?source.daily:[]),...(Array.isArray(source.forecast)?source.forecast:[]),...(Array.isArray(source.days)?source.days:[])];
  const forecast=daily.find(item=>dateValue(item.date||item.day||item.validAt)===target);if(forecast)return{...forecast,forecast:true};
  return target===new Date().toISOString().slice(0,10)?source:null;
}
function weatherReaction(place,input,plannedAt=input.targetDate){
  const weather=weatherForDate(input,plannedAt);if(!weather)return'';
  const outdoor=['nature','activities','sightseeing','photo'].includes(visualCategory(place)),rain=Number(weather.precipitationProbability??weather.rainProbability),code=Number(weather.weatherCode??weather.code);
  if(outdoor&&((Number.isFinite(rain)&&rain>=65)||(Number.isFinite(code)&&code>=51)))return`Wetterreaktion: ${Number.isFinite(rain)?`${rain} % Regenrisiko`:weather.condition||'nasses Wetter'} – Zeit oder Indoor-Alternative prüfen.`;
  if(outdoor&&Number.isFinite(rain)&&rain<=30)return`Wetterfenster: nur ${rain} % Regenrisiko für diesen Outdoor-Moment.`;
  return'';
}
function openingAt(place,start,end){
  const freshness=factFreshness(place);if(!freshness.fresh)return{known:false,open:null,stale:Boolean(freshness.observedAt),observedAt:freshness.observedAt};
  const periods=place?.regularOpeningHours?.periods||place?.currentOpeningHours?.periods||place?.openingHours?.periods||place?.raw?.regularOpeningHours?.periods||place?.raw?.currentOpeningHours?.periods;
  if(!Array.isArray(periods)||!periods.length)return{known:false,open:null,stale:false,observedAt:freshness.observedAt};
  const day=start.getDay(),startMinute=start.getHours()*60+start.getMinutes(),endMinute=end.getHours()*60+end.getMinutes();
  const windows=[];
  for(const period of periods){
    const open=period?.open,close=period?.close;if(!open||Number(open.day)!==day)continue;
    const from=Number(open.hour||0)*60+Number(open.minute||0);let to=1440;
    if(close&&Number(close.day)===day)to=Number(close.hour||0)*60+Number(close.minute||0);
    else if(close&&Number(close.day)!==day)to=1440;
    windows.push([from,to]);
  }
  return{known:true,open:windows.some(([from,to])=>startMinute>=from&&endMinute<=to),stale:false,observedAt:freshness.observedAt};
}
function entryPlace(entry={}){const metadata=entry.metadata||{},coordinates=metadata.coordinates||metadata.providerFacts?.coordinates||{};return{name:entry.title,coordinates,location:coordinates,providerPlaceId:clean(entry.providerPlaceId||entry.place?.providerPlaceId||metadata.providerPlaceId).replace(/^places\//,'')}}
function existingDayFor(date,input){return contracts().journey?.reads?.getDay?.(date)||((input.day?.date===date)?input.day:null)||{entries:[]}}
function previousTimelineEntry(start,input){
  const day=existingDayFor(localParts(start).date,input),entries=(day?.entries||[]).filter(entry=>entry.startAt).map(entry=>{const endAt=entry.endAt||new Date(Date.parse(entry.startAt)+(Number(entry.durationMinutes)||60)*60000).toISOString();return{...entry,endAt}}).filter(entry=>new Date(entry.endAt)<=start).sort((left,right)=>Date.parse(left.endAt)-Date.parse(right.endAt));
  return entries.at(-1)||null;
}
function exactTimelineConflict(place,start,end,input){const day=existingDayFor(localParts(start).date,input),entries=(day?.entries||[]).filter(entry=>entry.startAt&&entry.endAt).sort((a,b)=>Date.parse(a.startAt)-Date.parse(b.startAt));for(const entry of entries){const entryStart=new Date(entry.startAt),entryEnd=new Date(entry.endAt);if(start<entryEnd&&end>entryStart)return{kind:'entry-overlap',entryId:entry.id,title:entry.title,requiredAt:entryEnd.toISOString(),message:`Kollision mit „${entry.title}“ (${timeValue(entry.startAt)}–${timeValue(entry.endAt)}).`}}
  const previous=[...entries].reverse().find(entry=>new Date(entry.endAt)<=start),next=entries.find(entry=>new Date(entry.startAt)>=end);if(previous){const transfer=transferBetween(entryPlace(previous),place,input),required=new Date(Date.parse(previous.endAt)+transfer.minutes*60000);if(start<required)return{kind:'route-after',entryId:previous.id,title:previous.title,requiredAt:required.toISOString(),message:`Nach „${previous.title}“ reichen Weg und ${transfer.bufferMinutes} Min. Ankunftspuffer nicht; frühestens ${timeValue(required)}.`}}
  if(next){const transfer=transferBetween(place,entryPlace(next),input),latest=new Date(Date.parse(next.startAt)-transfer.minutes*60000);if(end>latest)return{kind:'route-before',entryId:next.id,title:next.title,requiredAt:next.startAt,message:`Vor „${next.title}“ bleiben für Weg und ${transfer.bufferMinutes} Min. Ankunftspuffer nicht genug Minuten.`}}
  return null}
function scheduleFor(places,plans,input){
  const items=[];let previous=null,previousEnd=null;
  const ordered=[...places].sort((left,right)=>{const a=plans.get(providerId(left))||initialPlan(left,input),b=plans.get(providerId(right))||initialPlan(right,input),ak=`${dateValue(a.date)}T${clean(a.time)||timeValue(input.startAt)}`,bk=`${dateValue(b.date)}T${clean(b.time)||timeValue(input.startAt)}`;return ak.localeCompare(bk)});
  for(const place of ordered){
    const id=providerId(place),plan=plans.get(id)||initialPlan(place,input);let start=new Date(`${dateValue(plan.date)}T${clean(plan.time)||timeValue(input.startAt)}:00`);const timelinePrevious=previous?null:previousTimelineEntry(start,input),transfer=previous?transferBetween(previous,place,input,'selection'):timelinePrevious?transferBetween(entryPlace(timelinePrevious),place,input,'timeline'):{minutes:0,label:'',bufferMinutes:routeBuffer(input),distanceMeters:null,distanceReference:null};const transferStart=previousEnd||(timelinePrevious?new Date(timelinePrevious.endAt):null),required=transferStart?new Date(transferStart.getTime()+transfer.minutes*60000):null;
    if(!plan.manual){const windowStart=input.startAt?new Date(input.startAt):start,nextStart=required&&required>windowStart?required:windowStart;if(!Number.isNaN(nextStart.getTime())){const parts=localParts(nextStart);plan.date=parts.date;plan.time=parts.time;start=nextStart}}
    const durationMinutes=Math.max(30,Number(plan.duration)||durationFor(place)),end=new Date(start.getTime()+durationMinutes*60000),windowStart=input.startAt?new Date(input.startAt):null,windowEnd=input.endAt?new Date(input.endAt):null,overlap=Boolean(required&&start<required),outside=Boolean((windowStart&&!Number.isNaN(windowStart.getTime())&&start<windowStart)||(windowEnd&&!Number.isNaN(windowEnd.getTime())&&end>windowEnd)),opening=openingAt(place,start,end),openingConflict=opening.known&&opening.open===false,timelineConflict=exactTimelineConflict(place,start,end,input),fits=!overlap&&!outside&&!openingConflict&&!timelineConflict;
    items.push({place,plannedAt:start.toISOString(),durationMinutes,transferMinutes:transfer.minutes,routeBufferMinutes:transfer.bufferMinutes||routeBuffer(input),routeUncertainty:transfer.uncertainty||null,transferLabel:transfer.label,transferDistanceMeters:transfer.distanceMeters,transferDistanceReference:transfer.distanceReference,fits,overlap,outside,openingKnown:opening.known,openingStale:opening.stale,openingObservedAt:opening.observedAt,openingConflict,timelineConflict,requiredAt:timelineConflict?.requiredAt||required?.toISOString()||null,endsAt:end.toISOString()});previous=place;previousEnd=end;
  }
  return items;
}
function liveDayBalance(schedule,input){
  const existing=input.day?.entries||[],selected=schedule.map(item=>({entityType:visualCategory(item.place),durationMinutes:item.durationMinutes,metadata:{transferMinutes:item.transferMinutes}})),all=[...existing,...selected];
  const food=all.filter(entry=>['food','cafe','restaurant'].includes(String(entry.entityType))).length,active=all.filter(entry=>['activities','activity','sightseeing','shopping'].includes(String(entry.entityType))).reduce((sum,entry)=>sum+(Number(entry.durationMinutes)||60),0),rest=all.filter(entry=>['nature','wellness','cafe'].includes(String(entry.entityType))).reduce((sum,entry)=>sum+(Number(entry.durationMinutes)||60),0),route=schedule.reduce((sum,item)=>sum+Number(item.transferMinutes||0),0),planned=all.reduce((sum,entry)=>sum+(Number(entry.durationMinutes)||60),0);
  if(route>120)return`Tagesbalance: ${route} Minuten Wegeansatz – eine nähere Alternative wäre die einzige sinnvolle Korrektur.`;
  if(food>2)return`Tagesbalance: ${food} Genussmomente – Luvia würde höchstens einen davon durch Abwechslung ersetzen.`;
  if(active>360&&rest<90)return'Tagesbalance: mehr als sechs aktive Stunden – ein einziger ruhiger Moment würde den Tag ausgleichen.';
  if(planned>600)return`Tagesbalance: ${Math.round(planned/60*10)/10} Stunden Programm – der Tag ist für ein entspanntes Reisetempo zu dicht.`;
  const rehearsal=contracts().journey?.reads?.rehearseDay?.({travelSpeed:clean(input.planningPolicy?.travelSpeed)||'balanced',weatherRisk:Number(input.weather?.precipitationProbability??0)/100,entries:[...existing,...schedule.map(item=>({id:providerId(item.place),startAt:item.plannedAt,endAt:item.endsAt,durationMinutes:item.durationMinutes,transferMinutes:item.transferMinutes,routeConfidence:item.routeUncertainty?.confidence!=null?item.routeUncertainty.confidence/100:null,routeEvidence:item.routeUncertainty?.evidence||[]}))]});
  if(rehearsal?.status==='blocked')return'Tagesbalance: Die Generalprobe erkennt einen Zeit- oder Wegkonflikt – zuerst diesen einen Engpass lösen.';
  return'';
}
async function commit(place,form,input,override={}){
  const api=contracts().places,id=providerId(place),tid=tripId(input.trip),type=canonicalPlaceType(place);
  if(!tid||!id)throw new Error('Reise oder Place ist nicht eindeutig.');
  const data=form?new FormData(form):null,date=dateValue(data?.get('date')||input.targetDate),time=clean(data?.get('time'))||timeValue(input.startAt),plannedAt=override.plannedAt||new Date(`${date}T${time}:00`).toISOString();
  let entity;
  try{entity=await api.commands.importPlace(id,{tripId:tid,type,providerPlace:place,tripPlace:{status:'planned'}})}catch(error){throw Object.assign(new Error('Places konnte diesen belegten Ort gerade nicht mit eurer Reise verbinden.'),{code:error?.code||'PLACE_IMPORT_FAILED',cause:error})}
  if(!entity?.tripPlaceId)throw new Error('Places konnte den Ort nicht eindeutig mit der Reise verbinden.');
  const visual=visualCategory(place),menuUrl=clean(place.menuUrl||place.menu_url),menuVerified=Boolean(menuUrl&&(place.menuEvidence?.verified===true||place.menuVerified===true));
  const facts=placeFacts(place,input),features=featureFacts(place),visualType=visualLabel(visual),freshness=factFreshness(place),coords=coordinates(place);
  const fields={planned_at:plannedAt,place_name:place.name,notes:'Von Luvia vorgeschlagen und ausdrücklich bestätigt.',metadata:{
    source:'journey-suggestion-sheet',suggestionVersion:VERSION,visualCategory:visual,accent:visualAccent(visual),imageUrl:clean(place.image?.url||place.photoUri||place.imageUrl)||null,imageAttribution:imageAttribution(place),
    providerPlaceId:id,providerFacts:{typeLabel:visualType,rating:Number(place.rating)||null,userRatingCount:Number(place.userRatingCount)||null,priceLevel:clean(place.priceLevel)||null,priceLabel:priceLabel(place)||null,openNow:place.openNow??null,openingLabel:openingLabel(place,input)||null,distanceLabel:distanceLabel(place)||null,distanceReference:place.distanceReference==='device'?'current-device-location':null,features,observedAt:freshness.observedAt,fresh:freshness.fresh,cached:freshness.cached},
    links:{mapsUrl:clean(place.mapsUrl||place.googleMapsUri)||null,website:clean(place.website||place.websiteUri)||null,menuUrl:menuVerified?menuUrl:null,menuEvidence:menuVerified?'verified-public-source':null},
     address:clean(place.formattedAddress||place.address)||null,coordinates:Number.isFinite(coords.lat)&&Number.isFinite(coords.lng)?{latitude:coords.lat,longitude:coords.lng}:null,planTrust:'confirmed',travelerFit:clean(place.travelerFit),travelerInsights:place.travelerInsights||[],groupFit:place.groupFit||null,fitMethod:place.groupFit?.method||null,aiScoreUsed:false,durationMinutes:override.durationMinutes||durationFor(place),transferMinutes:override.transferMinutes||0,transferLabel:clean(override.transferLabel)||null,transferDistanceMeters:Number.isFinite(Number(override.transferDistanceMeters))?Math.round(Number(override.transferDistanceMeters)):null,transferDistanceReference:clean(override.transferDistanceReference)||null,routeBufferMinutes:override.routeBufferMinutes||routeBuffer(input),routeUncertainty:override.routeUncertainty||null,planningTrace:globalThis.LuviaTravelOrchestrationCoreV1?.planningTrace?.({message:input.query,evidence:[{id:`place:${id}`,source:'places',kind:'provider-place',observedAt:freshness.observedAt,verified:Boolean(freshness.observedAt)}],decisions:[{owner:'places',action:'plan',reasonCodes:['explicit-user-selection'],evidenceIds:[`place:${id}`],requiresConfirmation:true,status:'confirmed'}]})||null
  }};
  let receipt;
  try{receipt=await api.commands.plan({tripId:tid,placeType:type,tripPlaceId:entity.tripPlaceId,placeId:entity.id,providerPlaceId:id,fields})}catch(error){throw Object.assign(new Error('Der Places-Owner konnte den gewählten Zeitpunkt gerade nicht bestätigen.'),{code:error?.code||'PLACE_PLAN_FAILED',cause:error})}
  const detail={tripId:tid,type,tripPlaceId:entity.tripPlaceId,placeId:entity.id,providerPlaceId:id,lifecycle:'planned',plannedAt,fields,receipt};
  ['luvia:place-plan-changed','luvia:places-lifecycle-changed','luvia:timeline-invalidated','luvia:in-window-data-changed','luvia:dashboard-widget-refresh'].forEach(name=>globalThis.dispatchEvent(new CustomEvent(name,{detail})));
  api.commands.updateLifecycle?.(entity.tripPlaceId,'planned',{}, {tripId:tid}).catch?.(error=>console.warn('[LuviaJourneySuggestionLifecycle]',error));
  return{receipt,plannedAt,entity};
}
async function commitOrPropose(item,input,form){
  const collaboration=globalThis.LuviaJourneyPlaceProposals,total=Number(input.groupContext?.totalTravelers||input.groupContext?.travelers?.length||1);
  if(total<=1)return{kind:'planned',value:await commit(item.place,form,input,item)};
  if(!collaboration?.create)throw Object.assign(new Error('Die Gruppenentscheidung ist gerade noch nicht bereit. Es wurde nichts in die Timeline eingetragen.'),{code:'GROUP_DECISION_OWNER_UNAVAILABLE'});
  const proposal=await collaboration.create({trip:input.trip,providerPlaceId:providerId(item.place),placeSnapshot:item.place,plannedAt:item.plannedAt,durationMinutes:item.durationMinutes,transferMinutes:item.transferMinutes,members:input.groupContext?.travelers||[]});
  if(proposal.status==='approved')return{kind:'planned',value:await applyApprovedProposal(proposal)};
  return{kind:'proposal',value:proposal};
}
function offerPlanUndo(host,outcome,input){const value=outcome?.value;if(outcome?.kind!=='planned'||!value?.entity?.tripPlaceId||!host)return;let remaining=8;host.insertAdjacentHTML('beforeend',` <button type="button" data-lvjs-undo-plan>Rückgängig · ${remaining}s</button>`);const button=host.querySelector('[data-lvjs-undo-plan]'),tick=setInterval(()=>{remaining-=1;if(remaining>0&&button?.isConnected)button.textContent=`Rückgängig · ${remaining}s`},1000),expire=setTimeout(()=>{clearInterval(tick);button?.remove()},8000);button?.addEventListener('click',async()=>{clearInterval(tick);clearTimeout(expire);button.disabled=true;button.textContent='Wird zurückgenommen …';try{await contracts().places.commands.unplan({tripId:tripId(input.trip),placeType:canonicalPlaceType(value.entity),tripPlaceId:value.entity.tripPlaceId,placeId:value.entity.id,providerPlaceId:value.entity.providerPlaceId,fields:['planned_at','notes']});globalThis.dispatchEvent(new CustomEvent('luvia:timeline-invalidated',{detail:{tripId:tripId(input.trip),tripPlaceId:value.entity.tripPlaceId,reason:'undo-plan'}}));host.className='lvjs-card-state is-success';host.textContent='Hinzufügen rückgängig gemacht.';globalThis.LuviaApp?.activeView?.()==='timeline'&&globalThis.LuviaApp.show?.('timeline',{force:true,animate:false,source:'journey-plan-undone'})}catch(error){button.disabled=false;button.textContent=error?.message||'Rückgängig nicht möglich'}})}
async function applyApprovedProposal(proposal){
  const collaboration=globalThis.LuviaJourneyPlaceProposals;if(!collaboration||proposal?.application_status==='applied')return null;
  const claimed=proposal.application_status==='applying'?proposal:await collaboration.claim(proposal.id);if(!claimed)return null;
  try{
    const activeTrip=contracts().trip?.reads?.getActiveTrip?.()||contracts().trip?.reads?.getContext?.(),place=claimed.place_snapshot||claimed.placeSnapshot;
    const receipt=await commit(place,null,currentInput({trip:activeTrip,targetDate:dateValue(claimed.planned_at),startAt:claimed.planned_at,source:'approved-group-proposal'}),{plannedAt:claimed.planned_at,durationMinutes:claimed.duration_minutes,transferMinutes:claimed.transfer_minutes});
    await collaboration.finish(claimed.id,receipt.entity.tripPlaceId,true);return receipt;
  }catch(error){await collaboration.finish(claimed.id,null,false).catch(()=>{});throw error}
}
async function reconcileApprovedProposals(){
  const collaboration=globalThis.LuviaJourneyPlaceProposals;if(!collaboration?.list)return;
  const proposals=await collaboration.list(undefined,{openOnly:true}).catch(()=>[]);for(const proposal of proposals.filter(row=>row.status==='approved'&&row.application_status!=='applied'))await applyApprovedProposal(proposal).catch(error=>console.warn('[LuviaJourneyProposalApply]',error));
}
function paintResults(handle,result,selectedId='',restoredState=null){
  const root=handle.overlay,status=root.querySelector('[data-lvjs-status]'),results=root.querySelector('[data-lvjs-results]'),footer=root.querySelector('[data-lvjs-ai-state]');
  const heading=root.querySelector('[data-lvjs-heading]'),placesSearch=result.input.source==='places-search',actualCount=result.choices.length;
  if(heading)heading.textContent=placesSearch?`${actualCount} passende ${actualCount===1?'Ort':'Orte'} gefunden.`:`${actualCount} ${actualCount===1?'Möglichkeit':'Möglichkeiten'} für euren freien Moment.`;
  const spectrum=root.querySelector('[data-lvjs-spectrum]');
  if(spectrum){spectrum.hidden=placesSearch;spectrum.onclick=()=>{const detail={source:'journey-spectrum',targetDate:result.input.targetDate,startAt:result.input.startAt,endAt:result.input.endAt,destination:destinationOf(result.input.trip),categories:['Essen','Cafés','Bars','Kultur','Sehenswürdigkeiten','Natur','Wellness','Sport','Shopping','Nachtleben','Fotospots','Familie','Events']};globalThis.dispatchEvent(new CustomEvent('luvia:places-discovery-requested',{detail}));if(globalThis.LuviaApp?.show){handle.close('open-places-spectrum');globalThis.LuviaApp.show('places',{payload:detail,source:'journey-spectrum'})}else{spectrum.textContent='Gesamtes Spektrum in Places';spectrum.dataset.requested='true'}}}
  if(result.warning)status.innerHTML=`<span aria-hidden="true">!</span><div><strong>Letzter belegter Vorschlagsstand</strong><small>${esc(result.warning)}</small></div>`;else status.hidden=true;
  results.hidden=false;results.innerHTML=result.choices.map((place,index)=>cardMarkup(place,index,result.input,result.choices)).join('');
  const selectedIds=new Set(restoredState?.selectedIds||[selectedId].filter(Boolean)),plans=new Map(restoredState?.plans||[]),completed=new Map(restoredState?.completed||[]),alternativeHistory=new Map((restoredState?.alternativeHistory||[]).map(([id,values])=>[id,new Set(values)]));
  const selectedPlaces=()=>result.choices.filter(place=>selectedIds.has(providerId(place)));
  const stateSnapshot=()=>({selectedIds:[...selectedIds],plans:[...plans.entries()].map(([id,value])=>[id,{...value}]),completed:[...completed.entries()],alternativeHistory:[...alternativeHistory.entries()].map(([id,values])=>[id,[...values]])});
  handleState.set(handle,stateSnapshot);
  const ensurePlan=place=>{const id=providerId(place);if(!plans.has(id))plans.set(id,initialPlan(place,result.input));return plans.get(id)};
  const schedulerFor=id=>[...results.querySelectorAll('[data-lvjs-scheduler]')].find(node=>node.dataset.lvjsScheduler===id)||null;
  const groupDecision=Number(result.input.groupContext?.totalTravelers||result.input.groupContext?.travelers?.length||1)>1;
  const sync=()=>{
    const chosen=selectedPlaces();chosen.forEach(ensurePlan);const schedule=scheduleFor(chosen,plans,result.input),byId=new Map(schedule.map(item=>[providerId(item.place),item]));
    root.querySelectorAll('[data-suggestion-select]').forEach(button=>{const id=button.dataset.suggestionSelect,selected=selectedIds.has(id);button.setAttribute('aria-pressed',String(selected));button.closest('.lvjs-choice')?.classList.toggle('is-selected',selected);const scheduler=schedulerFor(id);if(!scheduler)return;scheduler.hidden=!selected;if(!selected)return;const plan=plans.get(id),item=byId.get(id),date=scheduler.querySelector('[name=date]'),time=scheduler.querySelector('[name=time]'),duration=scheduler.querySelector('[name=duration]');if(document.activeElement!==date)date.value=plan.date;if(document.activeElement!==time)time.value=plan.time;if(document.activeElement!==duration)duration.value=String(plan.duration);const note=scheduler.querySelector('[data-lvjs-card-plan]'),planButton=scheduler.querySelector('[data-lvjs-plan]'),done=completed.get(id),weatherNote=weatherReaction(item?.place||result.choices.find(place=>providerId(place)===id),result.input,item?.plannedAt);if(done){note.textContent=done==='proposal'?'Die Gruppenabstimmung läuft direkt am künftigen Timeline-Eintrag.':'Dieser Ort steht bestätigt in eurer Timeline.';planButton.disabled=true;planButton.textContent=done==='proposal'?'Abstimmung läuft':'In der Timeline';return}if(item?.timelineConflict)note.textContent=item.timelineConflict.message;else if(item?.overlap){const required=new Date(item.requiredAt).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});note.textContent=`Kollision: Nach dem zuvor gewählten Ort und dem Weg ist frühestens ${required} sinnvoll.`}else if(item?.outside)note.textContent='Konflikt: Der Termin liegt außerhalb des ausgewählten freien Zeitfensters.';else if(item?.openingConflict)note.textContent=`Konflikt: Die zuletzt belegten Öffnungszeiten decken ${plan.time} Uhr nicht ab.`;else if(item?.openingStale)note.textContent='Öffnungszeiten sind veraltet oder widersprüchlich und werden deshalb nicht als sicher behauptet.';else if(weatherNote)note.textContent=weatherNote;else if(item?.transferLabel)note.textContent=`Danach erreichbar: ${item.transferLabel}.`;else note.textContent=`Passt zum bestätigten Tagesstand · ${routeBuffer(result.input)} Min. Ankunftspuffer bleiben berücksichtigt.`;planButton.disabled=!item?.fits;planButton.textContent=groupDecision?'Abstimmung starten':'Zur Timeline'});
    const count=chosen.length,conflicts=schedule.filter(item=>!item.fits).length,balance=liveDayBalance(schedule,result.input),footerPlan=root.querySelector('[data-lvjs-plan-selected]'),actionable=schedule.filter(item=>item.fits&&!completed.has(providerId(item.place)));if(footerPlan){const item=actionable.length===1?actionable[0]:null;footerPlan.hidden=!item;footerPlan.disabled=!item;footerPlan.dataset.lvjsPlanSelected=item?providerId(item.place):'';footerPlan.textContent=groupDecision?'Abstimmung starten':'Zur Timeline hinzufügen'}if(spectrum)spectrum.hidden=placesSearch||Boolean(actionable.length);footer.textContent=conflicts?`${count} gewählt · ${conflicts} Zeitkonflikt${conflicts===1?'':'e'} lösen`:balance||count?balance||`${count} gewählt · Termine werden je Karte live aufeinander abgestimmt`:result.ai.ranking?'Belegbar berechnet · KI erklärt · ihr bestätigt':'Belegte Orte · ihr bestätigt';
  };
  handleControllers.get(handle)?.abort?.();
  const eventController=new AbortController();
  handleControllers.set(handle,eventController);
  const commitPlan=async(id,trigger)=>{const place=result.choices.find(item=>providerId(item)===id),form=schedulerFor(id),item=scheduleFor(selectedPlaces(),plans,result.input).find(row=>providerId(row.place)===id);if(!place||!item?.fits||!form||!trigger)return;trigger.disabled=true;trigger.textContent='Wird geprüft …';const cardButton=form.querySelector('[data-lvjs-plan]');if(cardButton&&cardButton!==trigger){cardButton.disabled=true;cardButton.textContent='Wird geprüft …'}const cardState=form.querySelector('[data-lvjs-card-state]');try{const outcome=await commitOrPropose(item,result.input,form);completed.set(id,outcome.kind==='proposal'?'proposal':'planned');cardState.className='lvjs-card-state is-success';cardState.innerHTML=outcome.kind==='proposal'?'Vorschlag eingereicht · die zeitabhängige Gruppenentscheidung läuft.':'Bestätigt · der Eintrag ist jetzt in der Timeline. <button type="button" data-lvjs-open-timeline>Timeline öffnen</button>';cardState.querySelector('[data-lvjs-open-timeline]')?.addEventListener('click',()=>{handle.close('planned');globalThis.LuviaApp?.show?.('timeline',{source:'journey-suggestion-receipt'})});offerPlanUndo(cardState,outcome,result.input)}catch(error){trigger.disabled=false;trigger.textContent=groupDecision?'Abstimmung starten':'Zur Timeline hinzufügen';if(cardButton&&cardButton!==trigger){cardButton.disabled=false;cardButton.textContent=groupDecision?'Abstimmung starten':'Zur Timeline'}cardState.className='lvjs-card-state is-error';cardState.textContent=error?.message||'Nichts wurde verändert.'}sync()};
  root.addEventListener('click',event=>{const footerPlan=event.target.closest?.('[data-lvjs-plan-selected]');if(!footerPlan||footerPlan.disabled)return;event.preventDefault();commitPlan(footerPlan.dataset.lvjsPlanSelected,footerPlan)},{signal:eventController.signal});
  results.addEventListener('click',async event=>{
    const bookingButton=event.target.closest?.('[data-lvjs-booking]'),planButton=event.target.closest?.('[data-lvjs-plan]'),nearbyButton=event.target.closest?.('[data-lvjs-nearby]');
    if(nearbyButton){const sourceId=nearbyButton.dataset.lvjsNearby,current=result.choices.find(item=>providerId(item)===sourceId),history=alternativeHistory.get(sourceId)||new Set(),blocked=new Set([...history,...selectedIds]);let alternative=nearestAlternative(current,result.choices,blocked);if(!alternative){history.clear();alternative=nearestAlternative(current,result.choices,selectedIds)}if(!alternative){nearbyButton.disabled=true;nearbyButton.textContent='Keine weitere belegte Alternative';return}const id=providerId(alternative);history.add(id);alternativeHistory.set(sourceId,history);selectedIds.add(id);ensurePlan(alternative);result.input.onSelectionChange?.(id,alternative);const next=nearestAlternative(current,result.choices,new Set([...history,...selectedIds]));nearbyButton.textContent=next?`Alternative · ${alternativeCause(current,next)}`:'Alle nahen Alternativen gezeigt';nearbyButton.disabled=!next;sync();results.querySelector(`[data-suggestion-choice="${CSS.escape(id)}"]`)?.scrollIntoView({behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth',block:'nearest',inline:'center'});return}
    if(bookingButton){const id=bookingButton.dataset.lvjsBooking,place=result.choices.find(item=>providerId(item)===id),form=schedulerFor(id);try{await openBooking(place,bookingButton,form,handle,result,stateSnapshot())}catch(error){const cardState=form?.querySelector('[data-lvjs-card-state]');if(cardState){cardState.className='lvjs-card-state is-error';cardState.textContent=error?.message||'Booking konnte nicht geöffnet werden.'}}return}
    if(planButton){await commitPlan(planButton.dataset.lvjsPlan,planButton);return}
    if(event.target.closest?.('details,.lvjs-choice-scheduler'))return;const button=event.target.closest?.('[data-suggestion-select]');if(!button)return;const id=button.dataset.suggestionSelect,place=result.choices.find(item=>providerId(item)===id);if(selectedIds.has(id)){selectedIds.delete(id)}else{selectedIds.add(id);ensurePlan(place);result.input.onSelectionChange?.(id,place)}sync();queueMicrotask(()=>schedulerFor(id)?.querySelector('[name=date]')?.focus())
  },{signal:eventController.signal});
  results.addEventListener('input',event=>{const scheduler=event.target.closest?.('[data-lvjs-scheduler]');if(!scheduler)return;const id=scheduler.dataset.lvjsScheduler,plan=plans.get(id)||initialPlan(result.choices.find(place=>providerId(place)===id),result.input);plan.date=dateValue(scheduler.querySelector('[name=date]').value);plan.time=clean(scheduler.querySelector('[name=time]').value)||timeValue(result.input.startAt);plan.duration=Number(scheduler.querySelector('[name=duration]').value)||durationFor(result.choices.find(place=>providerId(place)===id));plan.manual=true;plans.set(id,plan);sync()},{signal:eventController.signal});
  let scrollFrame=0;results.addEventListener('scroll',()=>{cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(()=>{const cards=[...results.querySelectorAll('.lvjs-choice')];if(!cards.length)return;const nearest=cards.reduce((best,card)=>Math.abs(card.offsetLeft-results.scrollLeft)<Math.abs(best.offsetLeft-results.scrollLeft)?card:best,cards[0]);cards.forEach(card=>card.classList.toggle('is-current',card===nearest));const id=nearest.dataset.suggestionChoice,place=result.choices.find(item=>providerId(item)===id);result.input.onSelectionChange?.(id,place)})},{signal:eventController.signal,passive:true});
  sync();
}
function patchEnrichedResults(handle,currentResult,enrichedResult){
  if(!handle?.overlay?.isConnected)return currentResult;
  const results=handle.overlay.querySelector('[data-lvjs-results]'),footer=handle.overlay.querySelector('[data-lvjs-ai-state]');
  if(!results)return currentResult;
  const byId=new Map((enrichedResult.choices||[]).map(place=>[providerId(place),place]));
  currentResult.choices=currentResult.choices.map(place=>byId.has(providerId(place))?{...place,...byId.get(providerId(place))}:place);
  currentResult.ai=enrichedResult.ai||currentResult.ai;
  currentResult.phase='ai-enriched';
  currentResult.loadedAt=enrichedResult.loadedAt||Date.now();
  for(const place of currentResult.choices){
    const id=providerId(place),card=results.querySelector(`[data-suggestion-choice="${CSS.escape(id)}"]`);if(!card)continue;
    const nextImage=imageUrl(place),image=card.querySelector('[data-lvjs-image]');
    if(nextImage&&image?.tagName!=='IMG'){
      const node=document.createElement('img');node.dataset.lvjsImage='true';node.src=nextImage;node.alt=place.name||'Reiseort';node.loading='eager';node.decoding='async';node.className='lvjs-image-reveal';image.replaceWith(node);
    }else if(nextImage&&image?.tagName==='IMG'&&image.getAttribute('src')!==nextImage)image.setAttribute('src',nextImage);
    const facts=card.querySelector('[data-lvjs-facts]');if(facts)facts.innerHTML=placeFacts(place,currentResult.input).map(fact=>`<b>${esc(fact)}</b>`).join('');
    const fit=card.querySelector('[data-lvjs-fit]');if(fit)fit.textContent=displayReason(place,currentResult.input);
    const match=matchLabel(place),matchHost=card.querySelector('[data-lvjs-match]');
    if(matchHost){matchHost.querySelector('b').textContent=match;matchHost.hidden=!match}else if(match){fit?.insertAdjacentHTML('beforebegin',`<span class="lvjs-choice-match" data-lvjs-match><b>${esc(match)}</b><small>aus belegten Merkmalen</small></span>`)}
    const why=card.querySelector('[data-lvjs-why]'),template=document.createElement('template');template.innerHTML=whyMarkup(place,currentResult.input);if(why)why.replaceWith(template.content.firstElementChild);
  }
  if(footer)footer.textContent=currentResult.ai?.ranking?'Belegbar berechnet · KI erklärt · ihr bestätigt':'Provider-Fakten belegt · persönliche Begründung nur bei ausreichender Evidenz';
  return currentResult;
}
async function hydrate(handle,input,options={}){
  const root=handle.overlay,status=root.querySelector('[data-lvjs-status]'),retry=root.querySelector('[data-lvjs-retry]');
  retry.hidden=true;status.hidden=false;status.className='lvjs-status';status.innerHTML='<span class="lvjs-loader" aria-hidden="true"></span><div><strong>Luvia prüft echte Orte …</strong><small>Places filtert Provider-Fakten; OpenAI ordnet nur die fachlich gültigen Kandidaten.</small></div>';
  root.querySelector('[data-lvjs-results]').hidden=true;
  try{
    const first=await load(input,{...options,fast:true});paintResults(handle,first);
    load(input,{force:true,fast:false}).then(enriched=>patchEnrichedResults(handle,first,enriched)).catch(error=>console.warn('[LuviaJourneySuggestionEnrichment]',error));
  }catch(error){status.className='lvjs-status is-error';status.innerHTML=`<span aria-hidden="true">!</span><div><strong>Die Vorschläge konnten nicht sicher geladen werden.</strong><small>${esc(error?.message||'Unbekannter Places-Fehler')} Die Timeline bleibt unverändert.</small></div>`;retry.hidden=false;retry.onclick=()=>hydrate(handle,input,{force:true})}
}
function open(rawInput={}){
  const input=currentInput(rawInput),ui=globalThis.LuviaUI;
  if(!ui?.mount)throw new Error('Overlay Host v1 ist noch nicht bereit.');
  activeHandle?.close?.('replace');
  const content=document.createElement('section');content.className='lvjs-sheet';content.dataset.journeySuggestionSheet='true';content.innerHTML=shellMarkup(input);
  let mounted=null;mounted=ui.mount({name:'journey.suggestions',kind:'sheet',content,className:'lvjs-overlay',closeOnEscape:false,closeSelector:'[data-lvjs-close]',initialFocus:'[data-lvjs-close]',label:'Luvia Vorschläge für den Reisetag',onClose:()=>{if(activeHandle?.id===mounted.id)activeHandle=null}});mounted.overlay.addEventListener('keydown',event=>{if(event.key!=='Escape')return;event.preventDefault();event.stopPropagation();const bookingBack=mounted.overlay.querySelector('[data-booking-close][aria-label="Zurück zu den Vorschlägen"]');bookingBack?bookingBack.click():mounted.close('escape')},true);activeHandle=mounted;hydrate(mounted,input);return mounted.overlay;
}
async function openResults(rawInput={}){
  const input=currentInput({...rawInput,source:rawInput.source||'places-search',requestedCount:(rawInput.places||[]).length}),ui=globalThis.LuviaUI;
  if(!ui?.mount)throw new Error('Overlay Host v1 ist noch nicht bereit.');if(!Array.isArray(rawInput.places)||!rawInput.places.length)throw new Error('Es liegen keine belegten Places-Ergebnisse vor.');
  activeHandle?.close?.('replace');const content=document.createElement('section');content.className='lvjs-sheet';content.dataset.journeySuggestionSheet='true';content.innerHTML=shellMarkup(input);let mounted=null;
  mounted=ui.mount({name:'places.search-results',kind:'sheet',content,className:'lvjs-overlay',closeSelector:'[data-lvjs-close]',initialFocus:'[data-lvjs-close]',label:'Places Suchergebnisse',onClose:()=>{if(activeHandle?.id===mounted.id)activeHandle=null}});activeHandle=mounted;
  const status=mounted.overlay.querySelector('[data-lvjs-status]');status.innerHTML='<span class="lvjs-loader" aria-hidden="true"></span><div><strong>Ergebnisse werden für alle Reisenden eingeordnet …</strong><small>Google- und Provider-Fakten bleiben die einzige Ortswahrheit.</small></div>';
  try{
    input.groupContext=await sharedPreferenceContext(input,{fast:true});
    const firstChoices=await rankForTravelers(rawInput.places,input.groupContext,input,{useAI:false});
    const first={input,choices:firstChoices,ai:{ranking:false,fallback:true},count:firstChoices.length,loadedAt:Date.now(),phase:'provider-facts',warning:''};
    paintResults(mounted,first,rawInput.selectedId||'');
    Promise.all([sharedPreferenceContext(input),Promise.all(rawInput.places.map(enrich))]).then(async([groupContext,enriched])=>{
      if(!mounted.overlay?.isConnected)return;
      input.groupContext=groupContext;
      const choices=await rankForTravelers(enriched,groupContext,input,{useAI:true});
      if(!mounted.overlay?.isConnected)return;
      patchEnrichedResults(mounted,first,{input,choices,ai:{ranking:choices.some(place=>place.travelerInsights?.some(item=>item.aiExplanation)),fallback:choices.every(place=>!place.travelerInsights?.some(item=>item.aiExplanation))},count:choices.length,loadedAt:Date.now(),phase:'ai-enriched',warning:''});
    }).catch(error=>console.warn('[LuviaPlacesResultEnrichment]',error));
  }catch(error){status.className='lvjs-status is-error';status.innerHTML=`<span aria-hidden="true">!</span><div><strong>Die Ergebnisse konnten nicht persönlich eingeordnet werden.</strong><small>${esc(error?.message||'Bitte versucht es erneut.')}</small></div>`}
  return mounted.overlay;
}
function diagnostics(){return Object.freeze({version:VERSION,owner:'consumer-orchestration',domainTruth:false,persistence:'ephemeral-cache-only',sources:['journey.v1','identity.v1','trip.v1','intelligence.v1','places.v1','booking.v1'],writeOwner:'places.v1',bookingOwner:'booking.v1',explicitConfirmation:true,cacheEntries:cache.size})}

function bindProposalSync(){
  proposalUnsubscribe?.();proposalUnsubscribe=null;const api=globalThis.LuviaJourneyPlaceProposals;if(!api?.subscribe)return;
  proposalUnsubscribe=api.subscribe(rows=>{for(const proposal of rows||[]){if(proposal.status==='approved'&&proposal.application_status!=='applied')applyApprovedProposal(proposal).catch(error=>console.warn('[LuviaJourneyProposalApply]',error))}if(globalThis.LuviaApp?.activeView?.()==='timeline')globalThis.LuviaApp.show?.('timeline',{force:true,animate:false,source:'journey-proposal-realtime'})});
}

['luvia:user-preferences-changed','luvia:identity.preferences.changed','luvia:trip.changed','luvia:trip-changed'].forEach(name=>globalThis.addEventListener(name,()=>cache.clear()));
globalThis.addEventListener('luvia:journey-place-proposal-changed',event=>{const proposal=event.detail?.proposal;if(proposal?.status==='approved'&&proposal.application_status!=='applied')applyApprovedProposal(proposal).catch(error=>console.warn('[LuviaJourneyProposalApply]',error));if(globalThis.LuviaApp?.activeView?.()==='timeline'||globalThis.LuviaApp?.activeView==null)queueMicrotask(()=>globalThis.LuviaApp?.show?.('timeline',{force:true,animate:false,source:'journey-proposal-local-projection'}))});
['luvia:trip.changed','luvia:trip.active.changed','luvia:auth-ready'].forEach(name=>globalThis.addEventListener(name,()=>{bindProposalSync();reconcileApprovedProposals()}));
globalThis.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{bindProposalSync();reconcileApprovedProposals()},400));
globalThis.LuviaJourneySuggestions=Object.freeze({version:VERSION,load,open,openResults,diagnostics});
})();
