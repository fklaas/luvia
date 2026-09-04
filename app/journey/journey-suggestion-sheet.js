(()=>{
'use strict';

const VERSION='1.24.1-budget-cascade-default';
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
const displayDate=value=>{const match=clean(value).match(/^(\d{4})-(\d{2})-(\d{2})/);return match?`${match[3]}.${match[2]}.${match[1]}`:clean(value)};
const dateValue=value=>clean(value).slice(0,10)||new Date().toISOString().slice(0,10);
const destinationOf=trip=>trip?.destination?.name||trip?.destination?.formattedAddress||trip?.destinationName||trip?.destination||'';
const destinationContext=trip=>{
  const destination=trip?.destination&&typeof trip.destination==='object'?trip.destination:{};
  const center=destination.location||destination.center||destination.coordinates||{};
  const latitude=Number(center.latitude??center.lat??destination.latitude??destination.lat??trip?.destinationLat);
  const longitude=Number(center.longitude??center.lng??destination.longitude??destination.lng??trip?.destinationLng);
  const location=Number.isFinite(latitude)&&Number.isFinite(longitude)?{latitude,longitude}:null;
  return{
    name:clean(destination.name||trip?.destinationName),
    displayName:clean(destination.displayName||destination.name||trip?.destinationName),
    formattedAddress:clean(destination.formattedAddress||destination.address||trip?.destinationName),
    placeId:clean(destination.placeId||destination.providerPlaceId||trip?.destinationPlaceId),
    countryCode:clean(destination.countryCode||trip?.countryCode),
    latitude:location?location.latitude:null,
    longitude:location?location.longitude:null,
    location,
    center:location,
    coordinates:location,
    viewport:destination.viewport||null,
    searchRadiusMeters:Number(destination.searchRadiusMeters)||20000
  };
};
const isGenericPlaceName=value=>!clean(value)||/^(unbenannter ort|unbekannter ort|unknown place|ort|\[object object\])$/i.test(clean(value));
const placeDisplayName=place=>{
  const candidates=[place?.name,place?.displayName?.text,place?.displayName,place?.shortAddress,place?.address,place?.formattedAddress,place?.primaryTypeLabel];
  for(const candidate of candidates){const title=clean(candidate);if(title&&!isGenericPlaceName(title))return title}
  return clean(place?.name)||'Unbenannter Ort';
};
const providerTypeText=place=>[place?.primaryType,place?.primary_type,place?.type,place?.category,...(place?.types||[]),...(place?.providerNativeTypes||[])].map(value=>clean(value).toLowerCase()).filter(Boolean).join(' ');
const dominantTypeText=place=>{
  const primary=clean(place?.primaryType||place?.primary_type||place?.type).toLowerCase();
  return !primary||/^(?:custom|place|point_of_interest|establishment|\d+)$/.test(primary)?providerTypeText(place):primary;
};
const categoryGroup=place=>{
  const value=dominantTypeText(place);
  if(/hotel|lodging|hostel|motel|campground|accommodation/.test(value))return'accommodation';
  if(/night_club|nightclub|nightlife|dance_club|discoth|disco|cocktail_bar|wine_bar|lounge|pub|concert_hall|music_venue|(^|\s)bar(\s|$)/.test(value))return'nightlife';
  if(/restaurant|cafe|bakery|food|meal|bistro|brasserie/.test(value))return'food';
  if(/park|beach|garden|natural|hiking|spa/.test(value))return'nature';
  if(/photo|viewpoint|observation/.test(value))return'photo';
  if(/landmark|monument|tourist_attraction|sight/.test(value))return'sightseeing';
  if(/museum|gallery|theater|concert|culture/.test(value))return'culture';
  if(/shopping|store|market|mall/.test(value))return'shopping';
  if(/casino/.test(value))return'nightlife';
  if(/activity|zoo|aquarium|stadium|bowling|escape|swimming/.test(value))return'activities';
  return value||clean(place?.requestedCategory).toLowerCase()||'places';
};
const categoryLabel=group=>({food:'Genuss',accommodation:'Unterkunft',nature:'Draußen',photo:'Fotospot',sightseeing:'Sehenswert',culture:'Kultur',shopping:'Shopping',nightlife:'Nachtleben',activities:'Erleben',places:'Entdecken'}[group]||'Entdecken');
const categoryIcon=group=>({food:'◌',accommodation:'⌂',nature:'≈',photo:'◉',sightseeing:'⌖',culture:'◇',shopping:'□',nightlife:'✺',activities:'↝',places:'✦'}[group]||'✦');
const visualCategory=place=>{
  const value=dominantTypeText(place);
  if(/hotel|lodging|hostel|motel|resort|accommodation|guest_house|bed_and_breakfast|campground/.test(value))return'accommodation';
  if(/night_club|nightclub|nightlife|dance_club|discoth|disco|cocktail_bar|wine_bar|lounge|pub|concert_hall|music_venue|(^|\s)bar(\s|$)/.test(value))return'nightlife';
  if(/cafe|bakery/.test(value))return'cafe';
  if(/restaurant|food|meal/.test(value))return'food';
  if(/park|beach|garden|natural|hiking/.test(value))return'nature';
  if(/spa|wellness/.test(value))return'wellness';
  if(/museum|gallery|theater|concert/.test(value))return'culture';
  if(/landmark|monument|tourist_attraction/.test(value))return'sightseeing';
  if(/shop|store|market/.test(value))return'shopping';
  if(/activity|zoo|aquarium|stadium|bowling|escape|swimming/.test(value))return'activities';
  return'places';
};
const visualLabel=group=>({food:'Restaurant',cafe:'Café',accommodation:'Unterkunft',nightlife:'Nachtleben',nature:'Draußen',wellness:'Wellness',culture:'Kultur',sightseeing:'Sehenswert',shopping:'Entdecken',activities:'Erleben',places:'Ort'}[group]||'Ort');
const visualIcon=group=>({food:'◌',cafe:'☕',accommodation:'⌂',nightlife:'◐',nature:'≈',wellness:'⌁',culture:'◇',sightseeing:'⌖',shopping:'✦',activities:'↝',places:'•'}[group]||'•');
const visualAccent=group=>({food:'#ef6659',cafe:'#f08a4b',accommodation:'#2f8c83',sightseeing:'#e3b63e',culture:'#c15e87',nature:'#2f9478',activities:'#2b8eb8',wellness:'#39a99c',nightlife:'#745eb8',shopping:'#ad609c',places:'#438ea5'}[group]||'#438ea5');
const admissionFor=place=>{try{return contracts().booking?.reads?.resolveAdmission?.(place)||globalThis.LuviaBookingAdmissionCore?.resolve?.(place)||null}catch{return null}};
const ratings=place=>{
  const rating=Number(place?.rating||0),count=Number(place?.userRatingCount||place?.user_rating_count||0);
  return[rating?`${rating.toFixed(1).replace('.',',')} ★`:'',count?`${count.toLocaleString('de-DE')} Erfahrungen`:''].filter(Boolean).join(' · ');
};
const canonicalPlaceType=place=>{
  const visual=visualCategory(place);
  if(visual==='accommodation')return'accommodation';
  if(['food','cafe'].includes(visual))return'restaurant';
  if(['nightlife','activities','wellness'].includes(visual))return'activity';
  if(['culture','sightseeing'].includes(visual))return'attraction';
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
  if(/strikten Kategorie- und Qualitätsvertrag/i.test(value))return'';
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
      return{id:row.traveler.id,name:row.traveler.name,role:row.traveler.role,score,coverage,personalCoverage,isCurrent,reliable,match:scored.preferenceDiscoveryMatch===true,eligible:fit?.eligible!==false,reasons:[...new Set([...aiReasons,...deterministicReasons])].slice(0,2),unknowns:[...new Set([...(scored.preferenceWarnings||[]),...(explanation.aiUnknowns||[])].map(clean).filter(Boolean))].slice(0,2),dimensions:fit?.dimensions||[],formula:fit?.formula||'',aiExplanation:row.ai,aiScoreUsed:false};
    });
    const eligible=travelerInsights.filter(item=>item.reliable),scores=eligible.map(item=>item.score),coverages=eligible.map(item=>item.coverage).filter(Number.isFinite),allTravelersCovered=travelers.length>0&&eligible.length===travelers.length,groupFit={score:allTravelersCovered?median(scores):null,lowest:scores.length?Math.min(...scores):null,highest:scores.length?Math.max(...scores):null,coverage:coverages.length?median(coverages):null,coveredTravelerCount:eligible.length,travelerCount:travelers.length,reliable:allTravelersCovered,method:'median-of-evidence-weighted-traveler-scores',aiScoreUsed:false};
    const strongest=eligible.find(item=>item.isCurrent)||[...eligible].sort((a,b)=>b.score-a.score)[0],reason=conciseReason(strongest?.reasons?.[0]),summary=strongest?`Für ${strongest.isCurrent?'dich':strongest.name}: ${reason||'Die belegten Ortsmerkmale decken sich mit den freigegebenen Vorlieben.'}`:travelerFit(place,group,input);
    return{...place,travelerInsights,groupFit,preferenceFit:strongest?{score:strongest.score,coverage:strongest.coverage}:null,travelerFit:summary};
  });
  const personalScore=place=>{const insight=place.travelerInsights?.find(item=>selfId&&clean(item.id)===selfId)||place.travelerInsights?.find(item=>selfName&&clean(item.name)===selfName)||place.travelerInsights?.find(item=>item.role==='owner');return Number.isFinite(Number(insight?.score))?Number(insight.score):Number(place.groupFit?.score||0)};
  return rankedPlaces.sort((left,right)=>personalScore(right)-personalScore(left)||Number(right.rating||0)-Number(left.rating||0));
}
function planningDay(input,trip,guidance,graph){
  const start=clean(trip.startDate||trip.start_date).slice(0,10),end=clean(trip.endDate||trip.end_date).slice(0,10);
  const suggested=clean(input.targetDate||guidance.targetDate||graph.currentDay?.date).slice(0,10);
  return dateValue(suggested&&(!start||suggested>=start)&&(!end||suggested<=end)?suggested:start);
}
function currentInput(input={}){
  const {context,journey}=contracts(),snapshot=context?.snapshot?.()||{},trip=input.trip||snapshot.trip||{},graph=journey?.reads?.snapshot?.({trip})||journey?.reads?.snapshot?.()||{};
  const dayGuidance=context?.dayGuidance?.(graph)||{},guidance=dayGuidance.suggestion||{};
  const targetDate=planningDay(input,trip,guidance,graph);
  const day=graph.days?.find?.(item=>item.date===targetDate)||null;
  const gap=day?.openGaps?.find?.(item=>!input.startAt||item.startAt===input.startAt)||day?.openGaps?.[0]||null;
  const travelSnapshot=globalThis.LuviaTravelContext?.snapshot?.()||{},rawPosition=input.positionContext||travelSnapshot.location||null,contextGate=globalThis.LuviaTravelOrchestrationCoreV1?.gateContext?.({
    purpose:'timeline-suggestion',context:{coordinates:rawPosition,observedAt:rawPosition?.updatedAt||rawPosition?.timestamp,source:input.positionContext?'explicit-sheet-input':'device'},
    grant:input.contextGrant||{granted:Boolean(input.positionContext||travelSnapshot.permission==='granted'),precision:'precise'}
  }),positionContext=contextGate?(contextGate.allowed?{latitude:contextGate.context?.coordinates?.lat,longitude:contextGate.context?.coordinates?.lng,observedAt:contextGate.context?.observedAt,source:contextGate.context?.source}:null):rawPosition;
  return{
    trip,graph,day,targetDate,disruptionRecovery:contracts().journey?.reads?.disruptionRecovery?.({entries:day?.entries||[],disruptions:input.disruptions||snapshot.disruptions||[]})||null,
    boundedWindow:Boolean(input.startAt||input.endAt),
    startAt:input.startAt||(dateValue(guidance.startAt)===targetDate?guidance.startAt:null)||gap?.startAt||`${targetDate}T10:00:00`,
    endAt:input.endAt||(dateValue(guidance.endAt)===targetDate?guidance.endAt:null)||gap?.endAt||null,
    query:clean(input.query||guidance.query||'Ein passender gemeinsamer Reisemoment'),
    reasons:[...(input.reasons||guidance.reasons||[])],
     snapshot,planningPolicy:{...(dayGuidance.policy||{}),...(input.planningPolicy||{})},weather:input.weather||globalThis.LuviaWeatherContextV1?.current||null,positionContext,contextGate:contextGate||null,source:clean(input.source)||'timeline-suggestion',requestedCount:Number(input.requestedCount)||null,stayDecision:input.stayDecision||null,onSelectionChange:typeof input.onSelectionChange==='function'?input.onSelectionChange:null,onNavigate:typeof input.onNavigate==='function'?input.onNavigate:null,navigation:input.navigation&&Number(input.navigation.count)>1?{index:Math.max(0,Number(input.navigation.index)||0),count:Math.max(1,Number(input.navigation.count)||1)}:null,excludeProviderPlaceIds:[...(input.excludeProviderPlaceIds||[])].map(clean).filter(Boolean)
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
const imageUrl=place=>safeHttpUrl(place?.image?.url||place?.photoUri||place?.imageUrl||place?.photos?.[0]?.uri)||'';
function imageAttribution(place){
  const image=place?.image||{},credit=clean(image.credit||image.attribution||place?.photoCredit),license=clean(image.license||place?.photoLicense),sourceUrl=clean(image.attributionUrl||image.sourceUrl||place?.photoSourceUrl);
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
    const card=await api.reads.getCard(id,{maxWidthPx:960,maxHeightPx:720,source:place});
    const merged={...place,...(card?.place||{}),image:card?.image||place.image||null};
    if(isGenericPlaceName(merged.name)&&!isGenericPlaceName(place.name))merged.name=place.name;
    else merged.name=placeDisplayName(merged);
    if(isGenericPlaceName(merged.address)&&clean(place.address||place.formattedAddress))merged.address=place.address||place.formattedAddress;
    return merged;
  }catch{return{...place,name:placeDisplayName(place)}}
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
  const geography=destinationContext(input.trip),requestDescriptors=categoryPlan(input).map(category=>({category,promise:api.reads.recommend({
    tripId:tripId(input.trip),
    text:queryFor(category,input),query:queryFor(category,input),category,
    destination:geography.location?geography:destinationOf(input.trip),destinationContext:geography,
     candidateLimit:fast?36:48,limit:fast?12:16,fastPath:fast,providers:['auto'],
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
const hotelIdentity=value=>clean(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' und ').replace(/\b(?:hotel|resort|spa|grand|garni)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
function stayHotelFor(place,input){
  if(input.source!=='hotel-map')return null;const name=hotelIdentity(place?.name);if(!name)return null;
  return(input.stayDecision?.hotels||[]).find(hotel=>hotelIdentity(hotel?.propertyName)===name)||null;
}
function stayPriceMarkup(place,input){
  const hotel=stayHotelFor(place,input),offer=hotel?.bestAvailableTotal,total=Number(offer?.price?.total),currency=clean(offer?.price?.currency);
  if(!hotel||!Number.isFinite(total)||!/^[A-Z]{3}$/.test(currency))return'';
  const amount=new Intl.NumberFormat('de-DE',{style:'currency',currency,maximumFractionDigits:2}).format(total),provider=({duffel_stays:'Duffel Stays',hotelbeds:'Hotelbeds',amadeus_hotels:'Amadeus'})[clean(offer.providerId)]||clean(offer.providerId)||'Livequelle';
  return`<span class="lvjs-stay-price"><strong>${esc(amount)} gesamt</strong><small>${esc(provider)} · Livepreis für ${esc(displayDate(input.stayDecision?.query?.checkIn||input.targetDate))} bis ${esc(displayDate(input.stayDecision?.query?.checkOut||'Check-out'))} · finale Quote vor Buchung</small></span>`;
}
const safeHttpUrl=value=>{const raw=clean(value);if(!/^https?:\/\//i.test(raw))return'';try{const url=new URL(raw);return /^https?:$/.test(url.protocol)?url.toString():''}catch{return''}};
const cuisineLabels=place=>{
  const labels={italian:'Italienisch',german:'Deutsch',mediterranean:'Mediterran',greek:'Griechisch',french:'Französisch',spanish:'Spanisch',indian:'Indisch',chinese:'Chinesisch',japanese:'Japanisch',thai:'Thailändisch',vietnamese:'Vietnamesisch',korean:'Koreanisch',mexican:'Mexikanisch',middle_eastern:'Nahöstlich',lebanese:'Libanesisch',turkish:'Türkisch',vegetarian:'Vegetarisch',vegan:'Vegan',seafood:'Fisch und Meeresfrüchte',pizza:'Pizza',sushi:'Sushi'};
  return [...new Set([...(place.cuisineTypes||[]),...(place.types||[])].map(type=>labels[clean(type).toLowerCase().replace(/_restaurant$/,'')]).filter(Boolean))].join(' · ');
};
const openingDescriptions=place=>{const value=place.currentOpeningHours?.weekdayDescriptions||place.regularOpeningHours?.weekdayDescriptions||place.openingHours?.weekdayDescriptions||place.opening_hours?.weekday_text;return Array.isArray(value)?value.filter(Boolean).join('\n'):''};
function providerDetailRows(place,input){
  const visual=visualCategory(place),features=place?.features||{},access=place?.accessibilityOptions||{},payment=place?.paymentOptions||{},admission=admissionFor(place),rows=[];
  const add=(label,value)=>{const text=clean(value);if(text)rows.push([label,text])};
  add('Kategorie',visualLabel(visual));
  if(['food','cafe'].includes(visual)){add('Küche',cuisineLabels(place));add('Ernährung',[features.servesVegetarianFood===true?'Vegetarische Gerichte verfügbar':'',features.servesVeganFood===true?'Vegane Gerichte verfügbar':''].filter(Boolean).join(' · '));}
  add('Über diesen Ort',place.editorialSummary?.text||place.editorialSummary);
  add('Preisniveau',priceLabel(place));add('Bewertung',ratings(place));add('Jetzt',openingLabel(place,input));add('Öffnungszeiten',openingDescriptions(place));
  if(admission?.relevant)add(visual==='accommodation'?'Buchung':'Reservierung / Eintritt',[admission.notice?.label,admission.notice?.detail].filter(Boolean).join(' · '));
  const services=[features.dineIn===true||place.dineIn===true?'Vor Ort':'',features.takeout===true||place.takeout===true?'Außer Haus':'',features.delivery===true||place.delivery===true?'Lieferung':'',features.outdoorSeating===true||place.outdoorSeating===true?'Außensitzplätze':''].filter(Boolean);add('Angebot',services.join(' · '));
  const payments=[payment.acceptsCreditCards===true?'Kreditkarte':'',payment.acceptsDebitCards===true?'EC-/Debitkarte':'',payment.acceptsCashOnly===true?'Nur Bargeld':'',payment.acceptsNfc===true?'Kontaktlos':''].filter(Boolean);add('Zahlung',payments.join(' · '));
  const accessFacts=[access.wheelchairAccessibleEntrance===true?'Rollstuhlgerechter Eingang':'',access.wheelchairAccessibleParking===true?'Rollstuhlparkplatz':'',access.wheelchairAccessibleRestroom===true?'Rollstuhl-WC':'',access.wheelchairAccessibleSeating===true?'Rollstuhlgerechte Sitzplätze':''].filter(Boolean);add('Barrierefreiheit',accessFacts.join(' · '));
  add('Noch zu prüfen',(place.preferenceWarnings||[]).map(text=>text.replace(/^stroller:/,'Kinderwagen:').replace(/^vegetarian:/,'Vegetarisches Angebot:')).join(' '));
  add('Adresse',place.formattedAddress||place.address);add('Telefon',place.nationalPhoneNumber||place.internationalPhoneNumber||place.phoneNumber||place.phone);
  return rows;
}
function openProviderDetails(place,input){
  const ui=globalThis.LuviaUI;if(!ui?.mount)return null;const rows=providerDetailRows(place,input),website=safeHttpUrl(place.websiteUri||place.website),mapsRoute=safeHttpUrl(place.googleMapsUri||place.mapsUrl),route=mapsRoute||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([place.name,place.formattedAddress||place.address].filter(Boolean).join(' '))}`,menu=safeHttpUrl(place.menuUrl||place.menu_url),content=document.createElement('section');
  content.className='lvjs-provider-detail-sheet';content.innerHTML=`<header><div><small>${esc(visualLabel(visualCategory(place)))} · Gut zu wissen</small><h2>${esc(placeDisplayName(place))}</h2><p>Hier findest du die verfügbaren Informationen für deinen Besuch.</p></div><button type="button" data-lvjs-detail-close aria-label="Details schließen">×</button></header><div class="lvjs-provider-detail-body">${rows.length?`<dl>${rows.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`:'<p class="lvjs-provider-detail-empty">Die Ortsquelle liefert für diesen Ort aktuell keine weiteren belegten Details.</p>'}${whyMarkup(place,input)}</div>${website||route||menu?`<nav aria-label="Externe Informationen">${route?`<a href="${esc(route)}" target="_blank" rel="noopener noreferrer">Route</a>`:''}${website?`<a href="${esc(website)}" target="_blank" rel="noopener noreferrer">Website</a>`:''}${menu?`<a href="${esc(menu)}" target="_blank" rel="noopener noreferrer">Speisekarte</a>`:''}</nav>`:''}`;
  return ui.mount({name:'places.provider-details',kind:'sheet',content,className:'lvjs-provider-detail-overlay',closeSelector:'[data-lvjs-detail-close]',initialFocus:'[data-lvjs-detail-close]',label:`Details zu ${place.name||'Ort'}`}).overlay;
}
function cardMarkup(place,index,input,choices=[]){
  const id=providerId(place),visual=visualCategory(place),image=imageUrl(place),attribution=imageAttribution(place),facts=placeFacts(place,input),match=matchLabel(place),admission=admissionFor(place),alternative=Number(input.requestedCount)>1?nearestAlternative(place,choices):null;
  const credit=attribution?`<span class="lvjs-photo-credit">${esc(attribution.credit)}${attribution.license?` · ${esc(attribution.license)}`:''}</span>`:'';
  const bookingLabel=visual==='accommodation'?'Buchung prüfen':admission?.action?.available?admission.action.label:'Reservierung prüfen';
  return`<article class="lvjs-choice" data-suggestion-choice="${esc(id)}" data-choice-index="${index}" data-suggestion-category="${esc(visual)}"><button type="button" class="lvjs-choice-main" data-suggestion-select="${esc(id)}" aria-pressed="false">${image?`<img data-lvjs-image src="${esc(image)}" alt="${esc(place.name||'Reiseort')}" loading="eager" fetchpriority="high" decoding="async">`:(globalThis.LuviaPlacesSpatialExperience?.categoryPlaceholder?.(visual)?.replace('<span ','<span data-lvjs-image ')||'<span class="lvjs-choice-placeholder" role="img" aria-label="Kategorieillustration"></span>')}<span class="lvjs-choice-copy"><small>${esc(visualIcon(visual))} ${esc(visualLabel(visual))}</small><strong>${esc(placeDisplayName(place))}</strong><em>${esc(place.formattedAddress||place.address||'Am Reiseziel')}</em><span class="lvjs-choice-facts" data-lvjs-facts>${facts.map(fact=>`<b>${esc(fact)}</b>`).join('')}</span>${stayPriceMarkup(place,input)}${match?`<span class="lvjs-choice-match" data-lvjs-match><b>${esc(match)}</b><small>belegt</small></span>`:''}<span class="lvjs-traveler-fit" data-lvjs-fit>${esc(displayReason(place,input))}</span>${credit}</span><span class="lvjs-choice-check" aria-hidden="true">✓</span></button><div class="lvjs-staged-actions" data-lvjs-staged-actions hidden><button type="button" data-lvjs-details="${esc(id)}">Details</button>${admission?.action?.available?`<button type="button" class="is-booking" data-lvjs-booking="${esc(id)}">${esc(bookingLabel)}</button>`:''}<button type="button" class="is-primary" data-lvjs-plan="${esc(id)}">Zur Timeline</button><p class="lvjs-action-state" data-lvjs-action-state role="status" aria-live="polite" hidden></p></div><form class="lvjs-choice-scheduler" data-lvjs-scheduler="${esc(id)}" hidden><div class="lvjs-choice-schedule-fields"><label>Reisetag<input name="date" type="date" required min="${esc(clean(input.trip?.startDate||input.trip?.start_date).slice(0,10))}" max="${esc(clean(input.trip?.endDate||input.trip?.end_date).slice(0,10))}" value="${esc(input.targetDate)}"></label><label>Uhrzeit<input name="time" type="time" required value="${esc(timeValue(input.startAt))}"></label><label>Dauer in Minuten<input name="duration" type="number" min="30" max="1440" step="15" value="${esc(durationFor(place))}"></label></div><button type="button" class="is-primary" data-lvjs-plan="${esc(id)}">Termin bestätigen</button><p data-lvjs-card-plan>Die Standardzeit wird gegen euren Reisetag geprüft.</p>${alternative?`<button class="lvjs-nearby-action" type="button" data-lvjs-nearby="${esc(id)}">Alternative · ${esc(alternativeCause(place,alternative))}</button>`:''}<div class="lvjs-card-state" data-lvjs-card-state aria-live="polite"></div></form></article>`;
}
function shellMarkup(input){
  const destination=destinationOf(input.trip)||'eurem Reiseziel',count=desiredCount(input),placesSearch=input.source==='places-search',hotelMap=input.source==='hotel-map',mapResults=placesSearch||hotelMap;
  const title=hotelMap?`${count} passende Unterkünfte gefunden.`:placesSearch?`${count} ${count===1?'passender Ort':'passende Orte'} gefunden.`:'Möglichkeiten für euren freien Moment.';
  const copy=hotelMap?'Wischt durch die belegten Hotels. Ein Tipp zeigt Verfügbarkeit, Buchungsweg und Planung für genau diese Unterkunft.':placesSearch?'Wischt seitlich durch die belegten Treffer. Ein Tipp öffnet Termin und nächste Aktion direkt in der Karte.':'Places belegt die Fakten. Luvia gewichtet Profile, Reisegefühl und euren Tag. Ein Tipp wählt; noch wird nichts verändert.';
  const navigation=mapResults&&input.navigation?`<nav class="lvjs-pin-navigation" aria-label="Schnellnavigation zwischen Karten-Pins"><button type="button" data-lvjs-navigate="previous" aria-label="Vorheriger Pin">←</button><span><b>${input.navigation.index+1}</b> / ${input.navigation.count}</span><button type="button" data-lvjs-navigate="next" aria-label="Nächster Pin">→</button></nav>`:'';
  return`<header class="lvjs-header"><div><span>${hotelMap?'Hotels':placesSearch?'Places entdecken':'Luvia'} · ${esc(displayDate(input.targetDate))}</span><h2 data-lvjs-heading>${esc(title)}</h2><p>${esc(copy)}</p></div>${navigation}<button type="button" data-lvjs-close aria-label="${mapResults?'Zurück zur Karte':'Vorschläge schließen'}">×</button></header><div class="lvjs-status" data-lvjs-status role="status" aria-live="polite"><span class="lvjs-loader" aria-hidden="true"></span><div><strong>Luvia prüft ${esc(destination)} …</strong><small>Orte werden gesucht, fachlich gefiltert und für alle Reisenden belegbar gewichtet.</small></div></div><div class="lvjs-results" data-lvjs-results hidden></div><footer class="lvjs-footer"><span data-lvjs-ai-state>Places belegt · Luvia ordnet · ihr bestätigt</span><button type="button" class="lvjs-footer-plan" data-lvjs-plan-selected hidden>Zur Timeline hinzufügen</button><button type="button" data-lvjs-spectrum>Alle Richtungen entdecken</button><button type="button" data-lvjs-retry hidden>Erneut prüfen</button></footer>`;
}
async function openBooking(place,button,form,handle,result,viewState,actionState){
  const booking=contracts().booking;
  if(!booking?.commands?.openPlaceBooking)throw new Error('Booking ist gerade noch nicht bereit.');
  button.disabled=true;const label=button.textContent;button.textContent='Booking Core prüft …';
  try{
    const data=new FormData(form),sheetHost=handle.overlay.querySelector('[data-journey-suggestion-sheet]')||handle.overlay;
    const selectedId=providerId(place);
    const restore=()=>{sheetHost.className='lvjs-sheet';sheetHost.dataset.journeySuggestionSheet='true';sheetHost.innerHTML=shellMarkup(result.input);paintResults(handle,result,selectedId,viewState);queueMicrotask(()=>sheetHost.querySelector(`[data-lvjs-booking="${CSS.escape(selectedId)}"]`)?.focus())};
    const showRouteState=(kind,headline,copy)=>{const status=actionState||handle.overlay.querySelector('[data-lvjs-status]');if(!status)return null;status.hidden=false;status.className=`lvjs-status ${actionState?'lvjs-action-state ':''}${kind}`;status.innerHTML=`<span aria-hidden="true">${kind==='is-success'?'↗':'!'}</span><div><strong>${esc(headline)}</strong><small>${esc(copy)}</small></div>`;status.scrollIntoView?.({block:'nearest',behavior:'auto'});return status};
    const providerLabel=route=>({official_website:'der Website des Ortes',opentable:'OpenTable',quandoo:'Quandoo',thefork:'TheFork',resmio:'resmio',google_reserve:'Google Reservierungen'}[clean(route?.provider)]||clean(route?.provider).replaceAll('_',' ')||'dem Buchungsanbieter');
    const showExternalReady=({route,open})=>{
      const official=route?.provider==='official_website',provider=providerLabel(route),status=showRouteState('is-success',official?`Reservierungsseite von ${place.name} gefunden.`:`Buchungsweg bei ${provider} gefunden.`,'Öffnet die Reservierungsseite und prüft dort freie Zeiten. Eine Reservierung wurde noch nicht angefragt.');
      if(!status||typeof open!=='function')return;
      const action=document.createElement('button');action.type='button';action.className='lvjs-provider-handoff';action.dataset.lvjsProviderHandoff='true';action.textContent=official?'Reservierungsseite öffnen ↗':`Bei ${provider} reservieren ↗`;
      action.addEventListener('click',async()=>{if(action.disabled)return;action.disabled=true;const actionLabel=action.textContent;action.textContent='Anbieter wird geöffnet …';try{await open()}catch(error){action.disabled=false;action.textContent=actionLabel;const failure=showRouteState('is-error','Anbieter konnte nicht geöffnet werden.',error?.message||'Bitte versucht es erneut.');failure?.querySelector('div')?.append(action)}});
      status.querySelector('div')?.append(action);
      action.focus?.({preventScroll:true});
      action.scrollIntoView?.({block:'nearest',behavior:'auto'});
    };
    const opened=await booking.commands.openPlaceBooking(place,{
      source:'consumer.journey-suggestions',host:sheetHost,onBack:restore,
      deferExternalOpen:true,
      onExternalReady:showExternalReady,
      onExternal:()=>showRouteState('is-success','Reservierungsseite geöffnet.', 'Die Reservierungsdaten gebt ihr direkt dort ein. Freie Zeiten und Bestätigung kommen vom Anbieter.'),
      onUnavailable:({route})=>{const technical=route?.reason==='ROUTE_PREVIEW_UNAVAILABLE'||/FETCH_FAILED|TIMEOUT/.test(route?.reason||'');return showRouteState('is-error',technical?'Buchungsweg gerade nicht prüfbar.':'Bitte direkt beim Ort anfragen.',technical?'Die Prüfung konnte nicht abgeschlossen werden. Versucht „Reservierung prüfen“ erneut oder kontaktiert den Ort direkt. Es wurde nichts versendet.':`Für ${place.name} wurde weder ein nutzbarer Reservierungslink noch eine verifizierte öffentliche E-Mail-Adresse gefunden. Bitte fragt telefonisch oder vor Ort an.${place.address||place.formattedAddress?' Adresse: '+(place.address||place.formattedAddress):''} Es wurde nichts versendet.`)},
      onSubmitted:async({booking:submittedBooking,request})=>{
        const outcome=await commit(place,form,result.input,{plannedAt:request?.startAt||null,bookingStatus:'requested',bookingId:submittedBooking?.id||null});
        viewState.completed=[...new Map([...(viewState.completed||[]),[selectedId,'booking-requested']])];
        globalThis.dispatchEvent(new CustomEvent('luvia:booking-timeline-linked',{detail:{bookingId:submittedBooking?.id||null,providerPlaceId:selectedId,tripPlaceId:outcome?.entity?.tripPlaceId||null}}));
        return outcome;
      },
      date:dateValue(data.get('date')),time:clean(data.get('time'))||timeValue(result.input.startAt),reserveExternalWindow:false
    });
    if(opened?.opened!==true&&!['unavailable','external_ready'].includes(opened?.channel))throw new Error('Für diesen Ort ist gerade kein bestätigter Buchungsweg verfügbar.');
    return opened;
  }finally{button.disabled=false;button.textContent=label}
}
function durationFor(place){return({food:90,cafe:60,accommodation:1440,nightlife:120,nature:90,wellness:120,culture:120,sightseeing:90,shopping:75,activities:120,places:75}[visualCategory(place)]||75)}
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
    const durationMinutes=Math.max(30,Number(plan.duration)||durationFor(place)),end=new Date(start.getTime()+durationMinutes*60000),windowStart=input.boundedWindow!==false&&input.startAt?new Date(input.startAt):null,windowEnd=input.boundedWindow!==false&&input.endAt?new Date(input.endAt):null,overlap=Boolean(required&&start<required),outside=Boolean((input.trip?.startDate&&plan.date<input.trip.startDate.slice(0,10))||(input.trip?.endDate&&plan.date>input.trip.endDate.slice(0,10))||(windowStart&&!Number.isNaN(windowStart.getTime())&&start<windowStart)||(windowEnd&&!Number.isNaN(windowEnd.getTime())&&end>windowEnd)),opening=openingAt(place,start,end),openingConflict=opening.known&&opening.open===false,timelineConflict=exactTimelineConflict(place,start,end,input),fits=!overlap&&!outside&&!openingConflict&&!timelineConflict;
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
  const bookingPending=Boolean(override.bookingStatus),fields={planned_at:plannedAt,place_name:place.name,notes:bookingPending?'Reservierungsanfrage abgesendet; Bestätigung des Anbieters steht noch aus.':'Von Luvia vorgeschlagen und ausdrücklich bestätigt.',metadata:{
    source:'journey-suggestion-sheet',suggestionVersion:VERSION,visualCategory:visual,accent:visualAccent(visual),imageUrl:clean(place.image?.url||place.photoUri||place.imageUrl||place.photos?.[0]?.uri)||null,imageAttribution:imageAttribution(place),
    providerPlaceId:id,providerFacts:{typeLabel:visualType,rating:Number(place.rating)||null,userRatingCount:Number(place.userRatingCount)||null,priceLevel:clean(place.priceLevel)||null,priceLabel:priceLabel(place)||null,openNow:place.openNow??null,openingLabel:openingLabel(place,input)||null,distanceLabel:distanceLabel(place)||null,distanceReference:place.distanceReference==='device'?'current-device-location':null,features,observedAt:freshness.observedAt,fresh:freshness.fresh,cached:freshness.cached},
    links:{mapsUrl:clean(place.mapsUrl||place.googleMapsUri)||null,website:clean(place.website||place.websiteUri)||null,menuUrl:menuVerified?menuUrl:null,menuEvidence:menuVerified?'verified-public-source':null},
     address:clean(place.formattedAddress||place.address)||null,coordinates:Number.isFinite(coords.lat)&&Number.isFinite(coords.lng)?{latitude:coords.lat,longitude:coords.lng}:null,planTrust:bookingPending?'requested':'confirmed',bookingStatus:bookingPending?clean(override.bookingStatus):null,bookingId:bookingPending?clean(override.bookingId)||null:null,bookingStatusSource:bookingPending?'booking_request_submitted':'none',bookingSchedulingStatus:bookingPending?'submitted':'scheduled',bookingSchedulingConflict:null,travelerFit:clean(place.travelerFit),travelerInsights:place.travelerInsights||[],groupFit:place.groupFit||null,fitMethod:place.groupFit?.method||null,aiScoreUsed:false,durationMinutes:override.durationMinutes||durationFor(place),transferMinutes:override.transferMinutes||0,transferLabel:clean(override.transferLabel)||null,transferDistanceMeters:Number.isFinite(Number(override.transferDistanceMeters))?Math.round(Number(override.transferDistanceMeters)):null,transferDistanceReference:clean(override.transferDistanceReference)||null,routeBufferMinutes:override.routeBufferMinutes||routeBuffer(input),routeUncertainty:override.routeUncertainty||null,planningTrace:globalThis.LuviaTravelOrchestrationCoreV1?.planningTrace?.({message:input.query,evidence:[{id:`place:${id}`,source:'places',kind:'provider-place',observedAt:freshness.observedAt,verified:Boolean(freshness.observedAt)}],decisions:[{owner:'places',action:'plan',reasonCodes:['explicit-user-selection'],evidenceIds:[`place:${id}`],requiresConfirmation:true,status:'confirmed'}]})||null
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
function bindPhotoFallbacks(results){
  results.querySelectorAll('img[data-lvjs-image]').forEach(img=>{img.onerror=()=>{const card=img.closest('[data-suggestion-choice]'),template=document.createElement('template');template.innerHTML=globalThis.LuviaPlacesSpatialExperience?.categoryPlaceholder?.(card?.dataset.suggestionCategory)?.replace('<span ','<span data-lvjs-image ')||'<span data-lvjs-image>Ortsfoto nicht verfügbar</span>';img.replaceWith(template.content.firstElementChild);card?.querySelector('.lvjs-photo-credit')?.remove()};if(img.complete&&img.naturalWidth===0)img.onerror()});
}
function paintResults(handle,result,selectedId='',restoredState=null){
  const root=handle.overlay,status=root.querySelector('[data-lvjs-status]'),results=root.querySelector('[data-lvjs-results]'),footer=root.querySelector('[data-lvjs-ai-state]');
  const heading=root.querySelector('[data-lvjs-heading]'),placesSearch=result.input.source==='places-search',hotelMap=result.input.source==='hotel-map',mapResults=placesSearch||hotelMap,actualCount=result.choices.length;
  if(heading)heading.textContent=hotelMap?`${actualCount} passende ${actualCount===1?'Unterkunft':'Unterkünfte'} gefunden.`:placesSearch?`${actualCount} ${actualCount===1?'passender Ort':'passende Orte'} gefunden.`:`${actualCount} ${actualCount===1?'Möglichkeit':'Möglichkeiten'} für euren freien Moment.`;
  const spectrum=root.querySelector('[data-lvjs-spectrum]');
  if(spectrum){spectrum.hidden=mapResults;spectrum.onclick=()=>{const detail={source:'journey-spectrum',targetDate:result.input.targetDate,startAt:result.input.startAt,endAt:result.input.endAt,destination:destinationOf(result.input.trip),categories:['Essen','Cafés','Bars','Kultur','Sehenswürdigkeiten','Natur','Wellness','Sport','Shopping','Nachtleben','Fotospots','Familie','Events']};globalThis.dispatchEvent(new CustomEvent('luvia:places-discovery-requested',{detail}));if(globalThis.LuviaApp?.show){handle.close('open-places-spectrum');globalThis.LuviaApp.show('places',{payload:detail,source:'journey-spectrum'})}else{spectrum.textContent='Gesamtes Spektrum in Places';spectrum.dataset.requested='true'}}}
  if(result.warning)status.innerHTML=`<span aria-hidden="true">!</span><div><strong>Letzter belegter Vorschlagsstand</strong><small>${esc(result.warning)}</small></div>`;else status.hidden=true;
  results.hidden=false;results.innerHTML=result.choices.map((place,index)=>cardMarkup(place,index,result.input,result.choices)).join('');
  bindPhotoFallbacks(results);
  const routeCandidate=result.choices.find(place=>providerId(place)===selectedId)||result.choices[0];
  if(routeCandidate&&mapResults)Promise.resolve(contracts().booking?.reads?.preparePlaceBooking?.(routeCandidate)).catch(()=>{});
  setTimeout(()=>{if(!handle.overlay?.isConnected)return;results.querySelectorAll('[data-lvjs-staged-actions]').forEach((actions,index)=>{actions.hidden=false;setTimeout(()=>actions.classList.add('is-visible'),Math.min(index,4)*80)})},700);
  const selectedIds=new Set(restoredState?.selectedIds||[selectedId].filter(Boolean)),plans=new Map(restoredState?.plans||[]),completed=new Map(restoredState?.completed||[]),alternativeHistory=new Map((restoredState?.alternativeHistory||[]).map(([id,values])=>[id,new Set(values)]));
  const selectedPlaces=()=>result.choices.filter(place=>selectedIds.has(providerId(place)));
  const stateSnapshot=()=>({selectedIds:[...selectedIds],plans:[...plans.entries()].map(([id,value])=>[id,{...value}]),completed:[...completed.entries()],alternativeHistory:[...alternativeHistory.entries()].map(([id,values])=>[id,[...values]])});
  handleState.set(handle,stateSnapshot);
  const ensurePlan=place=>{const id=providerId(place);if(!plans.has(id))plans.set(id,initialPlan(place,result.input));return plans.get(id)};
  const schedulerFor=id=>[...results.querySelectorAll('[data-lvjs-scheduler]')].find(node=>node.dataset.lvjsScheduler===id)||null;
  const groupDecision=Number(result.input.groupContext?.totalTravelers||result.input.groupContext?.travelers?.length||1)>1;
  const sync=()=>{
    const chosen=selectedPlaces();chosen.forEach(ensurePlan);const schedule=scheduleFor(chosen,plans,result.input),byId=new Map(schedule.map(item=>[providerId(item.place),item]));
    root.querySelectorAll('[data-suggestion-select]').forEach(button=>{
      const id=button.dataset.suggestionSelect,selected=selectedIds.has(id),scheduler=schedulerFor(id),done=completed.get(id);
      button.setAttribute('aria-pressed',String(selected));button.closest('.lvjs-choice')?.classList.toggle('is-selected',selected);
      if(!scheduler)return;scheduler.hidden=!selected||(!done&&!plans.get(id)?.reviewing);if(!selected)return;
      const plan=plans.get(id),item=byId.get(id),date=scheduler.querySelector('[name=date]'),time=scheduler.querySelector('[name=time]'),duration=scheduler.querySelector('[name=duration]');
      if(document.activeElement!==date)date.value=plan.date;if(document.activeElement!==time)time.value=plan.time;if(document.activeElement!==duration)duration.value=String(plan.duration);
      const note=scheduler.querySelector('[data-lvjs-card-plan]'),planButton=scheduler.querySelector('[data-lvjs-plan]'),weatherNote=weatherReaction(item?.place||result.choices.find(place=>providerId(place)===id),result.input,item?.plannedAt);
      if(done){note.textContent=done==='proposal'?'Die Gruppenabstimmung läuft direkt am künftigen Timeline-Eintrag.':done==='booking-pending'?'In der Timeline · Buchung oder Reservierung wartet auf Bestätigung.':'Dieser Ort steht bestätigt in eurer Timeline.';if(planButton){planButton.disabled=true;planButton.textContent=done==='proposal'?'Abstimmung läuft':'In der Timeline'}return}
      if(item?.timelineConflict)note.textContent=item.timelineConflict.message;else if(item?.overlap){const required=new Date(item.requiredAt).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});note.textContent=`Kollision: Nach dem zuvor gewählten Ort und dem Weg ist frühestens ${required} sinnvoll.`}else if(item?.outside)note.textContent='Konflikt: Der Termin liegt außerhalb des ausgewählten freien Zeitfensters.';else if(item?.openingConflict)note.textContent=`Konflikt: Die zuletzt belegten Öffnungszeiten decken ${plan.time} Uhr nicht ab.`;else if(item?.openingStale)note.textContent='Öffnungszeiten sind veraltet oder widersprüchlich und werden deshalb nicht als sicher behauptet.';else if(weatherNote)note.textContent=weatherNote;else if(item?.transferLabel)note.textContent=`Danach erreichbar: ${item.transferLabel}.`;else note.textContent=`Passt zum bestätigten Tagesstand · ${routeBuffer(result.input)} Min. Ankunftspuffer bleiben berücksichtigt.`;
      if(planButton){planButton.disabled=false;planButton.textContent=groupDecision?'Abstimmung starten':'Termin bestätigen'}
    });
    const count=chosen.length,conflicts=schedule.filter(item=>!item.fits).length,balance=liveDayBalance(schedule,result.input),footerPlan=root.querySelector('[data-lvjs-plan-selected]'),actionable=schedule.filter(item=>item.fits&&!completed.has(providerId(item.place)));if(footerPlan){const item=actionable.length===1?actionable[0]:null;footerPlan.hidden=mapResults||!item||Boolean(plans.get(providerId(item?.place))?.reviewing);footerPlan.disabled=!item;footerPlan.dataset.lvjsPlanSelected=item?providerId(item.place):'';footerPlan.textContent=groupDecision?'Abstimmung starten':'Zur Timeline hinzufügen'}if(spectrum)spectrum.hidden=mapResults||Boolean(actionable.length);footer.textContent=conflicts?`${count} gewählt · ${conflicts} Zeitkonflikt${conflicts===1?'':'e'} lösen`:balance||count?balance||`${count} gewählt · Termine werden je Karte live aufeinander abgestimmt`:result.ai.ranking?'Belegbar berechnet · KI erklärt · ihr bestätigt':'Belegte Orte · ihr bestätigt';
  };
  handleControllers.get(handle)?.abort?.();
  const eventController=new AbortController();
  handleControllers.set(handle,eventController);
  root.querySelectorAll('[data-lvjs-navigate]').forEach(button=>button.addEventListener('click',()=>{
    const direction=button.dataset.lvjsNavigate;
    handle.close('pin-navigation');
    result.input.onNavigate?.(direction);
  },{signal:eventController.signal}));
  const commitPlan=async(id,trigger)=>{
    const place=result.choices.find(item=>providerId(item)===id),form=schedulerFor(id),item=scheduleFor(selectedPlaces(),plans,result.input).find(row=>providerId(row.place)===id),actionState=trigger?.closest?.('[data-lvjs-staged-actions]')?.querySelector?.('[data-lvjs-action-state]'),visibleState=actionState||form?.querySelector('[data-lvjs-card-state]');
    if(!place||!form||!trigger){
      if(visibleState){visibleState.hidden=false;visibleState.className='lvjs-action-state is-error';visibleState.textContent='Dieser Ort ist nicht mehr eindeutig verfügbar. Bitte öffnet den Pin erneut.'}
      return;
    }
    const plan=ensurePlan(place);
    if(!plan.reviewing){plan.reviewing=true;sync();form.scrollIntoView?.({block:'nearest'});return;}
    if(form.reportValidity&&!form.reportValidity())return;
    if(!item?.fits){
      const conflictMessage=item?.timelineConflict?.message
        ||(item?.overlap?'Der vorgeschlagene Zeitpunkt überschneidet sich mit einem bestehenden Timeline-Eintrag.':'')
        ||(item?.openingConflict?'Die belegten Öffnungszeiten passen nicht zum vorgeschlagenen Zeitpunkt.':'')
        ||(item?.outside?'Der vorgeschlagene Zeitpunkt liegt außerhalb des ausgewählten Reisezeitraums.':'')
        ||'Der Timeline-Eintrag kann mit dem aktuellen Tagesstand noch nicht angelegt werden.';
      visibleState.hidden=false;visibleState.className='lvjs-action-state is-error';visibleState.textContent=`${conflictMessage} Öffnet den Timeline-Planer für eine freie Zeit.`;
      return;
    }
    trigger.disabled=true;trigger.textContent='Wird geprüft …';
    try{
      const outcome=await commitOrPropose(item,result.input,form);
      completed.set(id,outcome.kind==='proposal'?'proposal':'planned');
      visibleState.hidden=false;visibleState.className='lvjs-action-state is-success';visibleState.innerHTML=outcome.kind==='proposal'?'Vorschlag eingereicht · die zeitabhängige Gruppenentscheidung läuft.':'Bestätigt · der Eintrag ist jetzt in der Timeline. <button type="button" data-lvjs-open-timeline>Timeline öffnen</button>';
      visibleState.querySelector('[data-lvjs-open-timeline]')?.addEventListener('click',()=>{handle.close('planned');globalThis.LuviaApp?.show?.('timeline',{source:'journey-suggestion-receipt'})});
      offerPlanUndo(visibleState,outcome,result.input);
    }catch(error){
      trigger.disabled=false;trigger.textContent=groupDecision?'Abstimmung starten':'Termin bestätigen';visibleState.hidden=false;visibleState.className='lvjs-action-state is-error';visibleState.textContent=error?.message||'Nichts wurde verändert.';
    }
    sync();
  };
  root.addEventListener('click',event=>{const footerPlan=event.target.closest?.('[data-lvjs-plan-selected]');if(!footerPlan||footerPlan.disabled)return;event.preventDefault();commitPlan(footerPlan.dataset.lvjsPlanSelected,footerPlan)},{signal:eventController.signal});
  results.addEventListener('click',async event=>{
    const detailButton=event.target.closest?.('[data-lvjs-details]'),bookingButton=event.target.closest?.('[data-lvjs-booking]'),planButton=event.target.closest?.('[data-lvjs-plan]'),nearbyButton=event.target.closest?.('[data-lvjs-nearby]');
    if(detailButton){const place=result.choices.find(item=>providerId(item)===detailButton.dataset.lvjsDetails);if(place)openProviderDetails(place,result.input);return}
    if(nearbyButton){const sourceId=nearbyButton.dataset.lvjsNearby,current=result.choices.find(item=>providerId(item)===sourceId),history=alternativeHistory.get(sourceId)||new Set(),blocked=new Set([...history,...selectedIds]);let alternative=nearestAlternative(current,result.choices,blocked);if(!alternative){history.clear();alternative=nearestAlternative(current,result.choices,selectedIds)}if(!alternative){nearbyButton.disabled=true;nearbyButton.textContent='Keine weitere belegte Alternative';return}const id=providerId(alternative);history.add(id);alternativeHistory.set(sourceId,history);selectedIds.add(id);ensurePlan(alternative);result.input.onSelectionChange?.(id,alternative);const next=nearestAlternative(current,result.choices,new Set([...history,...selectedIds]));nearbyButton.textContent=next?`Alternative · ${alternativeCause(current,next)}`:'Alle nahen Alternativen gezeigt';nearbyButton.disabled=!next;sync();results.querySelector(`[data-suggestion-choice="${CSS.escape(id)}"]`)?.scrollIntoView({behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth',block:'nearest',inline:'center'});return}
    if(bookingButton){const id=bookingButton.dataset.lvjsBooking,place=result.choices.find(item=>providerId(item)===id),form=schedulerFor(id),actionState=bookingButton.closest('[data-lvjs-staged-actions]')?.querySelector('[data-lvjs-action-state]'),cardState=form?.querySelector('[data-lvjs-card-state]');try{if(!place||!form)throw new Error('Der ausgewählte Ort ist für Booking nicht eindeutig.');bookingButton.disabled=true;if(actionState){actionState.hidden=false;actionState.className='lvjs-action-state is-working';actionState.textContent='Reservierungsweg wird geprüft … Die Timeline bleibt unverändert.'}await openBooking(place,bookingButton,form,handle,result,stateSnapshot(),actionState)}catch(error){const message=error?.message||'Booking konnte nicht geöffnet werden.';if(cardState){cardState.hidden=false;cardState.className='lvjs-card-state is-error';cardState.textContent=message}if(actionState){actionState.hidden=false;actionState.className='lvjs-action-state is-error';actionState.textContent=message}bookingButton.disabled=false}return}
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
    const attribution=imageAttribution(place);card.querySelector('.lvjs-photo-credit')?.remove();
    if(nextImage&&attribution)card.querySelector('.lvjs-choice-copy')?.insertAdjacentHTML('beforeend',`<span class="lvjs-photo-credit">${esc(attribution.credit)}${attribution.license?` · ${esc(attribution.license)}`:''}</span>`);
    bindPhotoFallbacks(card);
    const facts=card.querySelector('[data-lvjs-facts]');if(facts)facts.innerHTML=placeFacts(place,currentResult.input).map(fact=>`<b>${esc(fact)}</b>`).join('');
    const fit=card.querySelector('[data-lvjs-fit]');if(fit)fit.textContent=displayReason(place,currentResult.input);
    const match=matchLabel(place),matchHost=card.querySelector('[data-lvjs-match]');
    if(matchHost){matchHost.querySelector('b').textContent=match;matchHost.hidden=!match}else if(match){fit?.insertAdjacentHTML('beforebegin',`<span class="lvjs-choice-match" data-lvjs-match><b>${esc(match)}</b><small>belegt</small></span>`)}
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
function openResults(rawInput={}){
  const input=currentInput({...rawInput,source:rawInput.source||'places-search',requestedCount:(rawInput.places||[]).length}),ui=globalThis.LuviaUI;
  if(!ui?.mount)throw new Error('Overlay Host v1 ist noch nicht bereit.');if(!Array.isArray(rawInput.places)||!rawInput.places.length)throw new Error('Es liegen keine belegten Places-Ergebnisse vor.');
  const routeCandidate=rawInput.places.find(place=>providerId(place)===rawInput.selectedId)||rawInput.places[0];
  // Route discovery starts before preference and photo hydration. The selected
  // provider handoff is therefore usually ready by the time its delayed action
  // enters, while a click still remains the only operation that opens it.
  if(routeCandidate)Promise.resolve(contracts().booking?.reads?.preparePlaceBooking?.(routeCandidate)).catch(()=>{});
  activeHandle?.close?.('replace');const content=document.createElement('section');content.className='lvjs-sheet';content.dataset.journeySuggestionSheet='true';content.innerHTML=shellMarkup(input);let mounted=null;
  mounted=ui.mount({name:'places.search-results',kind:'sheet',content,className:'lvjs-overlay',closeSelector:'[data-lvjs-close]',initialFocus:'[data-lvjs-close]',label:'Places Suchergebnisse',onClose:()=>{if(activeHandle?.id===mounted.id)activeHandle=null}});activeHandle=mounted;
  const status=mounted.overlay.querySelector('[data-lvjs-status]');status.innerHTML='<span class="lvjs-loader" aria-hidden="true"></span><div><strong>Ergebnisse werden für alle Reisenden eingeordnet …</strong><small>Google- und Provider-Fakten bleiben die einzige Ortswahrheit.</small></div>';
  (async()=>{try{
    input.groupContext=await sharedPreferenceContext(input,{fast:true});
    const photoReady=await Promise.all(rawInput.places.map(place=>within(enrich(place),350,place)));
    const firstChoices=await rankForTravelers(photoReady,input.groupContext,input,{useAI:false});
    const first={input,choices:firstChoices,ai:{ranking:false,fallback:true},count:firstChoices.length,loadedAt:Date.now(),phase:'provider-facts',warning:''};
    if(!mounted.overlay?.isConnected)return;paintResults(mounted,first,rawInput.selectedId||'');
    Promise.all([sharedPreferenceContext(input),Promise.all(photoReady.map(enrich))]).then(async([groupContext,enriched])=>{
      if(!mounted.overlay?.isConnected)return;
      input.groupContext=groupContext;
      const choices=await rankForTravelers(enriched,groupContext,input,{useAI:true});
      if(!mounted.overlay?.isConnected)return;
      patchEnrichedResults(mounted,first,{input,choices,ai:{ranking:choices.some(place=>place.travelerInsights?.some(item=>item.aiExplanation)),fallback:choices.every(place=>!place.travelerInsights?.some(item=>item.aiExplanation))},count:choices.length,loadedAt:Date.now(),phase:'ai-enriched',warning:''});
    }).catch(error=>console.warn('[LuviaPlacesResultEnrichment]',error));
  }catch(error){if(!mounted.overlay?.isConnected)return;status.className='lvjs-status is-error';status.innerHTML=`<span aria-hidden="true">!</span><div><strong>Die Ergebnisse konnten nicht persönlich eingeordnet werden.</strong><small>${esc(error?.message||'Bitte versucht es erneut.')}</small></div>`}})();
  return mounted.overlay;
}
function openResultsInteractive(rawInput={}){
  const overlay=openResults(rawInput),handle=activeHandle;if(!overlay||!handle)return null;
  let settled=false,progress=0;overlay.dataset.lvjsInteractive='true';overlay.style.setProperty('--lvjs-sheet-progress','0');
  const origin=rawInput.interactiveOrigin,source=origin?.source,map=origin?.map,viewport=origin?.viewport;
  let morph=null;
  if(source&&map&&Number(source.width)>0&&Number(source.height)>0&&Number(map.width)>0&&Number(map.height)>0){
    const viewportHeight=Number(viewport?.height)||innerHeight,targetLeft=Number(map.left),targetWidth=Number(map.width),targetHeight=Math.min(Math.max(Number(source.height),Number(map.height)),viewportHeight),targetBottom=Math.min(Math.max(0,viewportHeight-Number(map.bottom)),viewportHeight-targetHeight),originBottom=Math.max(0,viewportHeight-Number(source.bottom));
    overlay.dataset.lvjsOriginMorph='true';
    morph={left:Number(source.left),bottom:originBottom,width:Number(source.width),height:Number(source.height),deltaLeft:targetLeft-Number(source.left),deltaBottom:targetBottom-originBottom,deltaWidth:targetWidth-Number(source.width),deltaHeight:targetHeight-Number(source.height)};
  }
  const paint=value=>{const p=Math.max(0,Math.min(1,Number(value)||0));overlay.style.setProperty('--lvjs-sheet-progress',String(p));overlay.style.setProperty('--lvjs-backdrop-alpha',String(.3*p));overlay.style.setProperty('--lvjs-backdrop-blur',`${12*p}px`);if(morph){overlay.style.setProperty('--lvjs-sheet-left',`${morph.left+morph.deltaLeft*p}px`);overlay.style.setProperty('--lvjs-sheet-bottom',`${morph.bottom+morph.deltaBottom*p}px`);overlay.style.setProperty('--lvjs-sheet-width',`${morph.width+morph.deltaWidth*p}px`);overlay.style.setProperty('--lvjs-sheet-height',`${morph.height+morph.deltaHeight*p}px`);overlay.style.setProperty('--lvjs-sheet-radius-top',`${18+8*p}px`);overlay.style.setProperty('--lvjs-sheet-radius-bottom',`${18*(1-p)}px`);overlay.style.setProperty('--lvjs-surface-mix',`${p*100}%`);overlay.style.setProperty('--lvjs-content-opacity',String(Math.max(0,Math.min(1,(p-.08)*4))));overlay.style.setProperty('--lvjs-shadow-y',`${-26*p}px`);overlay.style.setProperty('--lvjs-shadow-blur',`${80*p}px`);overlay.style.setProperty('--lvjs-shadow-alpha',String(.2*p))}};
  paint(0);
  const update=value=>{if(settled||!overlay.isConnected)return;progress=Math.max(0,Math.min(1,Number(value)||0));paint(progress)};
  const settle=open=>{if(settled)return;settled=true;overlay.dataset.lvjsInteractiveSettling=open?'open':'closed';paint(open?1:0);if(open){setTimeout(()=>{if(!overlay.isConnected)return;overlay.dataset.lvjsInteractive='settled';delete overlay.dataset.lvjsInteractiveSettling;if(overlay.dataset.lvjsOriginMorph!=='true')overlay.style.removeProperty('--lvjs-sheet-progress')},360)}else setTimeout(()=>handle.close('gesture-cancel'),260)};
  return Object.freeze({overlay,update,settle,cancel:()=>settle(false),get progress(){return progress}});
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
async function assessGroup(places,{trip,targetDate}={}){
  const snapshot=contracts().context?.snapshot?.()||{},input={trip,snapshot,targetDate,query:'Gemeinsame Ortsvorlieben'};
  const group=await sharedPreferenceContext(input);
  const ranked=await rankForTravelers(places,group,input,{useAI:false});
  const total=Math.max(Number(group.totalTravelers)||0,(group.travelers||[]).length);
  return ranked.map(place=>({...place,groupFit:{...place.groupFit,travelerCount:total,reliable:place.groupFit?.reliable===true&&place.travelerInsights.length===total}}));
}
globalThis.LuviaJourneySuggestions=Object.freeze({version:VERSION,load,open,openResults,openResultsInteractive,assessGroup,diagnostics});
})();
