(()=>{
'use strict';

const VERSION='1.9.0';
const cache=new Map();
let activeHandle=null;
let proposalUnsubscribe=null;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const clean=value=>String(value??'').trim();
const providerId=place=>clean(place?.providerPlaceId||place?.id).replace(/^places\//,'');
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
  return value||'places';
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
  if(!Number.isFinite(meters)||meters<=0)return'';
  return meters<1000?`${Math.round(meters)} m entfernt`:`${(meters/1000).toFixed(1).replace('.',',')} km entfernt`;
};
const openingLabel=place=>(place?.openNow??place?.currentOpeningHours?.openNow)===true?'Jetzt geöffnet':(place?.openNow??place?.currentOpeningHours?.openNow)===false?'Aktuell geschlossen':'';
const featureFacts=place=>{
  const features=place?.features||{};
  return[
    features.servesVegetarianFood===true?'Vegetarische Auswahl':'',
    features.servesVeganFood===true?'Vegane Auswahl':'',
    place?.accessibilityOptions?.wheelchairAccessibleEntrance===true?'Rollstuhlgerechter Eingang':'',
    features.goodForChildren===true?'Für Kinder ausgewiesen':''
  ].filter(Boolean).slice(0,3);
};
const placeFacts=place=>[ratings(place),priceLabel(place),distanceLabel(place),openingLabel(place)].filter(Boolean).slice(0,3);
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
const matchLabel=place=>Number.isFinite(Number(place?.groupFit?.score))?`${Math.round(Number(place.groupFit.score))}% Gruppenpassung`:Number.isFinite(Number(place?.preferenceFit?.score))?`${Math.round(Number(place.preferenceFit.score))}% passend`:'';
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
async function sharedPreferenceContext(input){
  const projection=await contracts().context?.sharedGroup?.({trip:input.trip,profilePreferences:input.snapshot?.profilePreferences||{}});
  if(projection?.travelers?.length)return projection;
  const profile=globalThis.LuviaProfileService?.snapshot?.().profile||{},signals=[...new Set(preferenceLabels(input.snapshot?.profilePreferences||{}))].slice(0,24),travelers=[{id:clean(profile.userId||profile.id)||'self',name:clean(profile.displayName||profile.firstName)||'Du',role:'owner',signals}];
  return{travelers,coveredTravelers:signals.length?1:0,totalTravelers:1,source:'identity-self-fallback'};
}
function travelerFit(place,group,input){
  const features=place?.features||{},accessibility=place?.accessibilityOptions||{};
  const providerEvidence=[features.servesVegetarianFood===true?'vegetarian vegetarisch':'',features.servesVeganFood===true?'vegan':'',accessibility.wheelchairAccessibleEntrance===true?'accessible wheelchair barrierefrei rollstuhl':'',features.goodForChildren===true?'family child familienfreundlich kind':''].filter(Boolean);
  const text=[place.name,place.description,place.primaryType,...(place.types||[]),...(place.aiReasons||[]),...providerEvidence].join(' ').toLowerCase();
  const rules=[[/vegetar|vegan|kulinar|genuss|essen|café|cafe/,/restaurant|cafe|bakery|food|meal|vegetar|vegan/,'Genuss'],[/natur|strand|meer|ruhig|entspann|draußen/,/park|beach|garden|nature|hiking|spa/,'Natur und Ruhe'],[/kultur|geschichte|museum|authent|neugier/,/museum|gallery|theater|historic|monument|culture/,'Kultur und lokaler Charakter'],[/famil|kind|abenteuer|aktiv|beweg/,/zoo|aquarium|activity|park|tourist|swimming|bowling/,'gemeinsames Erleben'],[/foto|aussicht|architektur/,/view|photo|landmark|architecture|panoram/,'besondere Perspektiven']];
  const evidenceChecks=[[/vegan/,/vegan/,'vegane Eignung'],[/vegetar/,/vegetar|vegan/,'vegetarische Eignung'],[/barriere|rollstuhl|wheelchair|mobilitätshilfe/,/accessible|wheelchair|barriere|rollstuhl/,'Barrierefreiheit'],[/famil|kind|baby/,/family|famil|child|kind|zoo|aquarium|playground/,'Familieneignung']];
  const matches=[],unresolved=[];
  for(const traveler of group?.travelers||[]){
    const signals=traveler.signals.join(' ').toLowerCase(),rule=rules.find(([preference,placeRule])=>preference.test(signals)&&placeRule.test(text));
    if(rule)matches.push({name:traveler.name,reason:rule[2]});
    const missing=evidenceChecks.find(([preference,evidence])=>preference.test(signals)&&!evidence.test(text));
    if(missing)unresolved.push({name:traveler.name,reason:missing[2]});
  }
  const names=items=>items.slice(0,3).map(item=>item.name).join(items.length>2?', ':items.length===2?' und ':'');
  if(matches.length&&unresolved.length)return`Passt besonders zu ${names(matches)}: ${matches[0].reason}. Für ${names(unresolved)} noch nicht sicher: ${unresolved[0].reason} nicht belegt.`;
  if(matches.length)return`Passt besonders zu ${names(matches)}: ${matches[0].reason}.`;
  if(unresolved.length)return`Für ${names(unresolved)} noch nicht sicher passend: ${unresolved[0].reason} ist nicht belegt.`;
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
  const text=clean(value).replace(/^f(?:ü|u)r\s+[^:]{1,80}:\s*/i,'').replace(/^(?:besonders\s+)?passend:\s*/i,'');
  return text?`${text.charAt(0).toLowerCase()}${text.slice(1)}`:'';
}
async function rankForTravelers(places,group,input){
  const travelers=(group?.travelers||[]).filter(item=>item?.id).slice(0,8),ranker=globalThis.LuviaAI?.rankCandidates;
  if(!travelers.length)return places.map(place=>({...place,travelerInsights:[],groupFit:null,travelerFit:travelerFit(place,group,input)}));
  const rows=await Promise.all(travelers.map(async traveler=>{
    const deterministic=deterministicTravelerRanking(places,traveler,input);let explained=places,ai=false;
    if(typeof ranker==='function')try{
      explained=await ranker({domain:'places',contract:{query:input.query,category:'journey-moment-explanation',destination:destinationOf(input.trip),profileContext:{traveler:{id:traveler.id,name:traveler.name,role:traveler.role,sharedSignals:traveler.signals||[]}},momentContext:{targetDate:input.targetDate,startAt:input.startAt,endAt:input.endAt},instruction:'Erkläre kurz anhand der gelieferten Provider-Fakten. Erfinde keine Attribute und liefere keinen eigenen Prozentwert.'},candidates:places});
      ai=explained.some(place=>place.aiRankingFallback!==true);
    }catch{}
    return{traveler,deterministic,explained,ai};
  }));
  const rankedPlaces=places.map(place=>{
    const id=providerId(place),travelerInsights=rows.map(row=>{
      const scored=row.deterministic.find(item=>providerId(item)===id)||place,explanation=row.explained.find(item=>providerId(item)===id)||place,fit=scored.preferenceFit||null;
      const deterministicReasons=(scored.preferenceReasons||[]).map(reason=>safeReason(reason,place)).filter(Boolean),aiReasons=(explanation.aiReasons||[]).map(reason=>safeReason(reason,place)).filter(Boolean);
      return{id:row.traveler.id,name:row.traveler.name,role:row.traveler.role,score:Number.isFinite(Number(fit?.score))?Math.round(Number(fit.score)):null,coverage:Number.isFinite(Number(fit?.coverage))?Math.round(Number(fit.coverage)):null,eligible:fit?.eligible!==false,reasons:[...new Set([...aiReasons,...deterministicReasons])].slice(0,2),unknowns:[...new Set([...(scored.preferenceWarnings||[]),...(explanation.aiUnknowns||[])].map(clean).filter(Boolean))].slice(0,2),dimensions:fit?.dimensions||[],formula:fit?.formula||'',aiExplanation:row.ai,aiScoreUsed:false};
    });
    const eligible=travelerInsights.filter(item=>item.eligible&&item.score!=null),scores=eligible.map(item=>item.score),coverages=eligible.map(item=>item.coverage).filter(Number.isFinite),groupFit=scores.length?{score:median(scores),lowest:Math.min(...scores),highest:Math.max(...scores),coverage:median(coverages),travelerCount:scores.length,method:'median-of-evidence-weighted-traveler-scores',aiScoreUsed:false}:null;
    const strongest=[...eligible].sort((a,b)=>b.score-a.score)[0],reason=conciseReason(strongest?.reasons?.[0]),summary=strongest?`Passt besonders zu ${strongest.name}: ${reason||'die belegten Ortsmerkmale decken sich mit den freigegebenen Vorlieben.'}`:travelerFit(place,group,input);
    return{...place,travelerInsights,groupFit,preferenceFit:strongest?{score:strongest.score,coverage:strongest.coverage}:null,travelerFit:summary};
  });
  const profile=globalThis.LuviaProfileService?.snapshot?.().profile||{},auth=globalThis.ParisAuth?.getState?.()||{},selfId=clean(profile.userId||profile.id||auth.user?.id||auth.userId),selfName=clean(profile.displayName||profile.firstName);
  const personalScore=place=>{const insight=place.travelerInsights?.find(item=>selfId&&clean(item.id)===selfId)||place.travelerInsights?.find(item=>selfName&&clean(item.name)===selfName)||place.travelerInsights?.find(item=>item.role==='owner');return Number.isFinite(Number(insight?.score))?Number(insight.score):Number(place.groupFit?.score||0)};
  return rankedPlaces.sort((left,right)=>personalScore(right)-personalScore(left)||Number(right.rating||0)-Number(left.rating||0));
}
function currentInput(input={}){
  const {context,journey}=contracts(),snapshot=context?.snapshot?.()||{},trip=input.trip||snapshot.trip||{},graph=journey?.reads?.snapshot?.({trip})||journey?.reads?.snapshot?.()||{};
  const guidance=context?.dayGuidance?.(graph)?.suggestion||{};
  const targetDate=dateValue(input.targetDate||guidance.targetDate||graph.currentDay?.date||trip.startDate||trip.start_date);
  const day=graph.days?.find?.(item=>item.date===targetDate)||graph.currentDay||graph.days?.[0]||null;
  const gap=day?.openGaps?.find?.(item=>!input.startAt||item.startAt===input.startAt)||day?.openGaps?.[0]||null;
  return{
    trip,graph,day,targetDate,
    startAt:input.startAt||guidance.startAt||gap?.startAt||`${targetDate}T10:00:00`,
    endAt:input.endAt||guidance.endAt||gap?.endAt||null,
    query:clean(input.query||guidance.query||'Ein passender gemeinsamer Reisemoment'),
    reasons:[...(input.reasons||guidance.reasons||[])],
     snapshot,weather:input.weather||globalThis.LuviaWeatherContextV1?.current||null,source:clean(input.source)||'timeline-suggestion',requestedCount:Number(input.requestedCount)||null,onSelectionChange:typeof input.onSelectionChange==='function'?input.onSelectionChange:null,excludeProviderPlaceIds:[...(input.excludeProviderPlaceIds||[])].map(clean).filter(Boolean)
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
async function enrich(place){
  const api=contracts().places,id=providerId(place);
  if(!id||!api?.reads?.getCard)return place;
  try{
    const card=await api.reads.getCard(id,{maxWidthPx:960,maxHeightPx:720});
    return{...place,...(card?.place||{}),image:card?.image||place.image||null};
  }catch{return place}
}
function desiredCount(input){if(Number(input.requestedCount)>0)return Math.min(18,Number(input.requestedCount));const entries=input.day?.entries?.length||0,gapMinutes=input.startAt&&input.endAt?Math.max(0,(new Date(input.endAt)-new Date(input.startAt))/60000):0;if(entries===0)return 6;if(gapMinutes>=480)return 5;if(gapMinutes>=240)return 4;return 3}
function diversify(rows=[],count=3){
  const selected=[],groups=new Set(),seen=new Set();
  for(const row of rows){const id=providerId(row);if(!id||seen.has(id))continue;seen.add(id);const group=categoryGroup(row);if(groups.has(group))continue;groups.add(group);selected.push(row);if(selected.length===count)break}
  if(selected.length>=count)return selected.slice(0,count);
  for(const row of rows){const id=providerId(row);if(!id||selected.some(item=>providerId(item)===id))continue;selected.push(row);if(selected.length>=count)break}
  return selected.slice(0,count);
}
async function load(rawInput={},options={}){
  const input=currentInput(rawInput),key=cacheKey(input),existing=cache.get(key);
  if(existing&&!options.force&&Date.now()-existing.loadedAt<180000)return{...existing,input,cached:true};
  const api=contracts().places;
  if(!api?.reads?.recommend)throw Object.assign(new Error('Places ist noch nicht vollständig bereit.'),{code:'PLACES_CONTRACT_UNAVAILABLE'});
  input.groupContext=await sharedPreferenceContext(input);
  const categories=categoryPlan(input),responses=await Promise.allSettled(categories.map(category=>api.reads.recommend({
    tripId:tripId(input.trip),
    text:queryFor(category,input),query:queryFor(category,input),category,
    destination:destinationOf(input.trip),destinationContext:destinationContext(input.trip),
     candidateLimit:36,limit:8,
    profilePreferences:input.snapshot.profilePreferences||{},
    profileContext:{groupTravelers:input.groupContext.travelers.map(item=>({name:item.name,role:item.role,sharedSignals:item.signals})),groupCoverage:{covered:input.groupContext.coveredTravelers,total:input.groupContext.totalTravelers}},
    tripComposition:input.snapshot.tripComposition||{},trip:input.trip,
    momentContext:{kind:'timeline-open-window',targetDate:input.targetDate,startAt:input.startAt,endAt:input.endAt,query:input.query,reasons:input.reasons,weather:input.weather||null}
  })));
  const successful=responses.filter(item=>item.status==='fulfilled').map(item=>item.value),excluded=new Set(input.excludeProviderPlaceIds),rows=successful.flatMap(item=>item?.places||[]).filter(place=>!excluded.has(providerId(place)));
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
   const enriched=await Promise.all(unique.map(enrich));
   const personallyRanked=await rankForTravelers(enriched,input.groupContext,input);
   const choices=diversify(personallyRanked,count);
  const ai={planning:successful.some(item=>item?.plan?.ai&&!item.plan.ai.fallback),ranking:successful.some(item=>item?.aiMeta?.ranking?.used),fallback:successful.every(item=>item?.aiMeta?.ranking?.fallback===true||item?.plan?.ai?.fallback===true)};
   const result={input,choices,ai,count,loadedAt:Date.now(),cached:false,stale:false,warning:'',attempts:responses.length,successfulAttempts:successful.length};
  cache.set(key,result);return result;
}
function reasonFor(place,input){
  const reasons=[...(place?.aiReasons||[]),...(place?.recommendation?.reasons||[]),...(input.reasons||[])].map(reason=>safeReason(reason,place)).filter(Boolean);
  return reasons[0]||'Passt als anderer Moment zu eurem bestätigten Tagesplan und bleibt bis zur Auswahl nur ein Entwurf.';
}
function whyMarkup(place,input){
  const insights=(place.travelerInsights||[]).map(item=>`<li><span><strong>${esc(item.name)}</strong>${item.score!=null?`<b>${esc(item.score)}%</b>`:'<b>offen</b>'}</span><small>${esc(item.reasons[0]||item.unknowns[0]||'Für diese Person fehlen noch eindeutige belegte Merkmale.')}</small></li>`).join('');
  const coverage=Number.isFinite(Number(place.groupFit?.coverage))?` · ${Math.round(Number(place.groupFit.coverage))}% der Gewichtung belegt`:'';
  return`<details class="lvjs-why"><summary>Warum für euch?</summary><p>${esc(place.travelerFit||reasonFor(place,input))}</p>${insights?`<ul>${insights}</ul>`:''}<small>Berechnung: Profil 30 · Anforderungen 25 · Reisegefühl 15 · Tagesbalance 12 · Entfernung 10 · Zeit/Wetter/Öffnung 8${esc(coverage)}. KI formuliert nur die Kurzbegründung; sie setzt keinen Prozentwert.</small></details>`;
}
function cardMarkup(place,index,input){
  const id=providerId(place),visual=visualCategory(place),image=place.image?.url||place.photoUri||place.imageUrl||'',facts=placeFacts(place),match=matchLabel(place),bookable=isBookable(place);
  return`<article class="lvjs-choice" data-suggestion-choice="${esc(id)}" data-choice-index="${index}" data-suggestion-category="${esc(visual)}"><button type="button" class="lvjs-choice-main" data-suggestion-select="${esc(id)}" aria-pressed="false">${image?`<img src="${esc(image)}" alt="${esc(place.name||'Reiseort')}" loading="lazy" decoding="async">`:'<span class="lvjs-choice-placeholder" aria-hidden="true">✦</span>'}<span class="lvjs-choice-copy"><small>${esc(visualIcon(visual))} ${esc(visualLabel(visual))}</small><strong>${esc(place.name||'Unbenannter Ort')}</strong><em>${esc(place.formattedAddress||place.address||'Am Reiseziel')}</em><span class="lvjs-choice-facts">${facts.map(fact=>`<b>${esc(fact)}</b>`).join('')}</span>${match?`<span class="lvjs-choice-match"><b>${esc(match)}</b><small>belegbar gewichtet</small></span>`:''}<span class="lvjs-traveler-fit">${esc(place.travelerFit||reasonFor(place,input))}</span></span><span class="lvjs-choice-check" aria-hidden="true">✓</span></button>${whyMarkup(place,input)}<form class="lvjs-choice-scheduler" data-lvjs-scheduler="${esc(id)}" hidden><div class="lvjs-choice-schedule-fields"><label>Tag<input name="date" type="date" required value="${esc(input.targetDate)}"></label><label>Start<input name="time" type="time" required value="${esc(timeValue(input.startAt))}"></label><label>Dauer<select name="duration"><option value="60">1 Std.</option><option value="75">1:15 Std.</option><option value="90">1:30 Std.</option><option value="120">2 Std.</option><option value="180">3 Std.</option></select></label></div><p data-lvjs-card-plan>Die Zeit wird mit den anderen gewählten Orten abgestimmt.</p><div class="lvjs-choice-actions">${bookable?`<button type="button" data-lvjs-booking="${esc(id)}">Tisch reservieren</button>`:''}<button type="button" data-lvjs-plan="${esc(id)}">Zur Timeline</button></div>${Number(input.requestedCount)>1?`<button class="lvjs-nearby-action" type="button" data-lvjs-nearby="${esc(id)}">Nahe Alternative zeigen</button>`:''}<div class="lvjs-card-state" data-lvjs-card-state aria-live="polite"></div></form></article>`;
}
function shellMarkup(input){
  const destination=destinationOf(input.trip)||'eurem Reiseziel',count=desiredCount(input),placesSearch=input.source==='places-search';
  const title=placesSearch?`${count} passende Orte gefunden.`:`${count} Möglichkeiten für euren freien Moment.`;
  const copy=placesSearch?'Wischt seitlich durch die belegten Treffer. Ein Tipp öffnet Termin und nächste Aktion direkt in der Karte.':'Places belegt die Fakten. Luvia gewichtet Profile, Reisegefühl und euren Tag. Ein Tipp wählt; noch wird nichts verändert.';
  return`<header class="lvjs-header"><div><span>${placesSearch?'Places entdecken':'Luvia'} · ${esc(input.targetDate)}</span><h2>${esc(title)}</h2><p>${esc(copy)}</p></div><button type="button" data-lvjs-close aria-label="${placesSearch?'Zurück zur Places-Suche':'Vorschläge schließen'}">×</button></header><div class="lvjs-status" data-lvjs-status role="status" aria-live="polite"><span class="lvjs-loader" aria-hidden="true"></span><div><strong>Luvia prüft ${esc(destination)} …</strong><small>Orte werden gesucht, fachlich gefiltert und für alle Reisenden belegbar gewichtet.</small></div></div><div class="lvjs-results" data-lvjs-results hidden></div><footer class="lvjs-footer"><span data-lvjs-ai-state>Places belegt · Luvia ordnet · ihr bestätigt</span><button type="button" data-lvjs-retry hidden>Erneut prüfen</button></footer>`;
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
function transferBetween(left,right){const meters=distanceBetween(left,right);if(!Number.isFinite(meters))return{minutes:20,label:'Übergang noch zu prüfen'};const km=meters/1000,minutes=Math.max(8,Math.ceil(km/4.5*60/5)*5);return{minutes,label:`ca. ${km.toFixed(1).replace('.',',')} km Luftlinie · mind. ${minutes} Min.`}}
function nearestAlternative(place,choices=[]){return choices.filter(item=>providerId(item)!==providerId(place)).map(item=>({item,meters:distanceBetween(place,item)})).sort((left,right)=>(Number.isFinite(left.meters)?left.meters:Infinity)-(Number.isFinite(right.meters)?right.meters:Infinity))[0]?.item||null}
function localParts(value){const date=new Date(value);return{date:`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,time:`${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`}}
function initialPlan(place,input){return{date:dateValue(input.targetDate),time:timeValue(input.startAt),duration:durationFor(place),manual:false}}
function weatherReaction(place,input){
  if(dateValue(input.targetDate)!==new Date().toISOString().slice(0,10)||!input.weather)return'';
  const outdoor=['nature','activities','sightseeing','photo'].includes(visualCategory(place)),rain=Number(input.weather.precipitationProbability),code=Number(input.weather.weatherCode);
  if(outdoor&&((Number.isFinite(rain)&&rain>=65)||(Number.isFinite(code)&&code>=51)))return`Wetterreaktion: ${Number.isFinite(rain)?`${rain} % Regenrisiko`:input.weather.condition||'nasses Wetter'} – Zeit oder Indoor-Alternative prüfen.`;
  if(outdoor&&Number.isFinite(rain)&&rain<=30)return`Wetterfenster: nur ${rain} % Regenrisiko für diesen Outdoor-Moment.`;
  return'';
}
function openingAt(place,start,end){
  const periods=place?.regularOpeningHours?.periods||place?.currentOpeningHours?.periods||place?.openingHours?.periods||place?.raw?.regularOpeningHours?.periods||place?.raw?.currentOpeningHours?.periods;
  if(!Array.isArray(periods)||!periods.length)return{known:false,open:null};
  const day=start.getDay(),startMinute=start.getHours()*60+start.getMinutes(),endMinute=end.getHours()*60+end.getMinutes();
  const windows=[];
  for(const period of periods){
    const open=period?.open,close=period?.close;if(!open||Number(open.day)!==day)continue;
    const from=Number(open.hour||0)*60+Number(open.minute||0);let to=1440;
    if(close&&Number(close.day)===day)to=Number(close.hour||0)*60+Number(close.minute||0);
    else if(close&&Number(close.day)!==day)to=1440;
    windows.push([from,to]);
  }
  return{known:true,open:windows.some(([from,to])=>startMinute>=from&&endMinute<=to)};
}
function scheduleFor(places,plans,input){
  const items=[];let previous=null,previousEnd=null;
  for(const place of places){
    const id=providerId(place),plan=plans.get(id)||initialPlan(place,input),transfer=previous?transferBetween(previous,place):{minutes:0,label:''};let start=new Date(`${dateValue(plan.date)}T${clean(plan.time)||timeValue(input.startAt)}:00`),required=previousEnd?new Date(previousEnd.getTime()+transfer.minutes*60000):null;
    if(required&&!plan.manual&&start<required){const parts=localParts(required);plan.date=parts.date;plan.time=parts.time;start=required}
    const durationMinutes=Math.max(30,Number(plan.duration)||durationFor(place)),end=new Date(start.getTime()+durationMinutes*60000),windowStart=input.startAt?new Date(input.startAt):null,windowEnd=input.endAt?new Date(input.endAt):null,overlap=Boolean(required&&start<required),outside=Boolean((windowStart&&!Number.isNaN(windowStart.getTime())&&start<windowStart)||(windowEnd&&!Number.isNaN(windowEnd.getTime())&&end>windowEnd)),opening=openingAt(place,start,end),openingConflict=opening.known&&opening.open===false,fits=!overlap&&!outside&&!openingConflict;
    items.push({place,plannedAt:start.toISOString(),durationMinutes,transferMinutes:transfer.minutes,transferLabel:transfer.label,fits,overlap,outside,openingKnown:opening.known,openingConflict,requiredAt:required?.toISOString()||null,endsAt:end.toISOString()});previous=place;previousEnd=end;
  }
  return items;
}
async function commit(place,form,input,override={}){
  const api=contracts().places,id=providerId(place),tid=tripId(input.trip),type=canonicalPlaceType(place);
  if(!tid||!id)throw new Error('Reise oder Place ist nicht eindeutig.');
  const data=form?new FormData(form):null,date=dateValue(data?.get('date')||input.targetDate),time=clean(data?.get('time'))||timeValue(input.startAt),plannedAt=override.plannedAt||new Date(`${date}T${time}:00`).toISOString();
  let entity;
  try{entity=await api.commands.importPlace(id,{tripId:tid,type,providerPlace:place,tripPlace:{status:'planned'}})}catch(error){throw Object.assign(new Error('Places konnte diesen belegten Ort gerade nicht mit eurer Reise verbinden.'),{code:error?.code||'PLACE_IMPORT_FAILED',cause:error})}
  if(!entity?.tripPlaceId)throw new Error('Places konnte den Ort nicht eindeutig mit der Reise verbinden.');
  const visual=visualCategory(place),menuUrl=clean(place.menuUrl||place.menu_url),menuVerified=Boolean(menuUrl&&(place.menuEvidence?.verified===true||place.menuVerified===true));
  const facts=placeFacts(place),features=featureFacts(place),visualType=visualLabel(visual);
  const fields={planned_at:plannedAt,place_name:place.name,notes:'Von Luvia vorgeschlagen und ausdrücklich bestätigt.',metadata:{
    source:'journey-suggestion-sheet',suggestionVersion:VERSION,visualCategory:visual,accent:visualAccent(visual),imageUrl:clean(place.image?.url||place.photoUri||place.imageUrl)||null,
    providerPlaceId:id,providerFacts:{typeLabel:visualType,rating:Number(place.rating)||null,userRatingCount:Number(place.userRatingCount)||null,priceLevel:clean(place.priceLevel)||null,priceLabel:priceLabel(place)||null,openNow:place.openNow??null,openingLabel:openingLabel(place)||null,distanceLabel:distanceLabel(place)||null,features},
    links:{mapsUrl:clean(place.mapsUrl||place.googleMapsUri)||null,website:clean(place.website||place.websiteUri)||null,menuUrl:menuVerified?menuUrl:null,menuEvidence:menuVerified?'verified-public-source':null},
     travelerFit:clean(place.travelerFit),travelerInsights:place.travelerInsights||[],groupFit:place.groupFit||null,fitMethod:place.groupFit?.method||null,aiScoreUsed:false,durationMinutes:override.durationMinutes||durationFor(place),transferMinutes:override.transferMinutes||0
  }};
  let receipt;
  try{receipt=await api.commands.plan({tripId:tid,placeType:type,tripPlaceId:entity.tripPlaceId,placeId:entity.id,providerPlaceId:id,fields})}catch(error){throw Object.assign(new Error('Der Places-Owner konnte den gewählten Zeitpunkt gerade nicht bestätigen.'),{code:error?.code||'PLACE_PLAN_FAILED',cause:error})}
  await api.commands.updateLifecycle?.(entity.tripPlaceId,'planned',{}, {tripId:tid});
  await contracts().journey?.commands?.hydrate?.(tid);
  const detail={tripId:tid,type,tripPlaceId:entity.tripPlaceId,placeId:entity.id,providerPlaceId:id,lifecycle:'planned',plannedAt,fields,receipt};
  ['luvia:place-plan-changed','luvia:places-lifecycle-changed','luvia:timeline-invalidated','luvia:in-window-data-changed','luvia:dashboard-widget-refresh'].forEach(name=>globalThis.dispatchEvent(new CustomEvent(name,{detail})));
  return{receipt,plannedAt,entity};
}
async function commitOrPropose(item,input,form){
  const collaboration=globalThis.LuviaJourneyPlaceProposals,total=Number(input.groupContext?.totalTravelers||input.groupContext?.travelers?.length||1);
  if(total<=1||!collaboration?.create)return{kind:'planned',value:await commit(item.place,form,input,item)};
  const proposal=await collaboration.create({trip:input.trip,providerPlaceId:providerId(item.place),placeSnapshot:item.place,plannedAt:item.plannedAt,durationMinutes:item.durationMinutes,transferMinutes:item.transferMinutes,members:input.groupContext?.travelers||[]});
  if(proposal.status==='approved')return{kind:'planned',value:await applyApprovedProposal(proposal)};
  return{kind:'proposal',value:proposal};
}
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
  if(result.warning)status.innerHTML=`<span aria-hidden="true">!</span><div><strong>Letzter belegter Vorschlagsstand</strong><small>${esc(result.warning)}</small></div>`;else status.hidden=true;
  results.hidden=false;results.innerHTML=result.choices.map((place,index)=>cardMarkup(place,index,result.input)).join('');
  const selectedIds=new Set(restoredState?.selectedIds||[selectedId].filter(Boolean)),plans=new Map(restoredState?.plans||[]),completed=new Map(restoredState?.completed||[]);
  const selectedPlaces=()=>result.choices.filter(place=>selectedIds.has(providerId(place)));
  const stateSnapshot=()=>({selectedIds:[...selectedIds],plans:[...plans.entries()].map(([id,value])=>[id,{...value}]),completed:[...completed.entries()]});
  const ensurePlan=place=>{const id=providerId(place);if(!plans.has(id))plans.set(id,initialPlan(place,result.input));return plans.get(id)};
  const schedulerFor=id=>[...results.querySelectorAll('[data-lvjs-scheduler]')].find(node=>node.dataset.lvjsScheduler===id)||null;
  const sync=()=>{
    const chosen=selectedPlaces();chosen.forEach(ensurePlan);const schedule=scheduleFor(chosen,plans,result.input),byId=new Map(schedule.map(item=>[providerId(item.place),item]));
    root.querySelectorAll('[data-suggestion-select]').forEach(button=>{const id=button.dataset.suggestionSelect,selected=selectedIds.has(id);button.setAttribute('aria-pressed',String(selected));button.closest('.lvjs-choice')?.classList.toggle('is-selected',selected);const scheduler=schedulerFor(id);if(!scheduler)return;scheduler.hidden=!selected;if(!selected)return;const plan=plans.get(id),item=byId.get(id),date=scheduler.querySelector('[name=date]'),time=scheduler.querySelector('[name=time]'),duration=scheduler.querySelector('[name=duration]');if(document.activeElement!==date)date.value=plan.date;if(document.activeElement!==time)time.value=plan.time;if(document.activeElement!==duration)duration.value=String(plan.duration);const note=scheduler.querySelector('[data-lvjs-card-plan]'),planButton=scheduler.querySelector('[data-lvjs-plan]'),done=completed.get(id),weatherNote=weatherReaction(item?.place||result.choices.find(place=>providerId(place)===id),result.input);if(done){note.textContent=done==='proposal'?'Die Gruppenabstimmung läuft direkt am künftigen Timeline-Eintrag.':'Dieser Ort steht bestätigt in eurer Timeline.';planButton.disabled=true;planButton.textContent=done==='proposal'?'Abstimmung läuft':'In der Timeline';return}if(item?.overlap){const required=new Date(item.requiredAt).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});note.textContent=`Kollision: Nach dem vorherigen Ort und dem Weg ist frühestens ${required} sinnvoll.`}else if(item?.outside)note.textContent='Dieser Termin liegt teilweise außerhalb des geöffneten Zeitfensters.';else if(item?.openingConflict)note.textContent='Öffnungszeiten-Konflikt: Der Provider belegt für diesen Zeitraum keine vollständige Öffnung.';else if(weatherNote)note.textContent=weatherNote;else if(item?.transferLabel)note.textContent=`Danach erreichbar: ${item.transferLabel}.`;else note.textContent='Passt in das aktuell geöffnete Zeitfenster.';planButton.disabled=!item?.fits;planButton.textContent='Zur Timeline'});
    const count=chosen.length,conflicts=schedule.filter(item=>!item.fits).length;footer.textContent=conflicts?`${count} gewählt · ${conflicts} Zeitkonflikt${conflicts===1?'':'e'} lösen`:count?`${count} gewählt · Termine werden je Karte geführt`:result.ai.ranking?'Belegbar berechnet · KI erklärt · ihr bestätigt':'Belegte Orte · ihr bestätigt';
  };
  results.onclick=async event=>{
    const bookingButton=event.target.closest?.('[data-lvjs-booking]'),planButton=event.target.closest?.('[data-lvjs-plan]'),nearbyButton=event.target.closest?.('[data-lvjs-nearby]');
    if(nearbyButton){const current=result.choices.find(item=>providerId(item)===nearbyButton.dataset.lvjsNearby),alternative=nearestAlternative(current,result.choices);if(!alternative)return;const id=providerId(alternative);selectedIds.add(id);ensurePlan(alternative);result.input.onSelectionChange?.(id,alternative);sync();results.querySelector(`[data-suggestion-choice="${CSS.escape(id)}"]`)?.scrollIntoView({behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth',block:'nearest',inline:'center'});return}
    if(bookingButton){const id=bookingButton.dataset.lvjsBooking,place=result.choices.find(item=>providerId(item)===id),form=schedulerFor(id);try{await openBooking(place,bookingButton,form,handle,result,stateSnapshot())}catch(error){const cardState=form?.querySelector('[data-lvjs-card-state]');if(cardState){cardState.className='lvjs-card-state is-error';cardState.textContent=error?.message||'Booking konnte nicht geöffnet werden.'}}return}
    if(planButton){const id=planButton.dataset.lvjsPlan,place=result.choices.find(item=>providerId(item)===id),form=schedulerFor(id),item=scheduleFor(selectedPlaces(),plans,result.input).find(row=>providerId(row.place)===id);if(!place||!item?.fits||!form)return;planButton.disabled=true;planButton.textContent='Wird geprüft …';const cardState=form.querySelector('[data-lvjs-card-state]');try{const outcome=await commitOrPropose(item,result.input,form);completed.set(id,outcome.kind==='proposal'?'proposal':'planned');cardState.className='lvjs-card-state is-success';cardState.innerHTML=outcome.kind==='proposal'?'Vorschlag eingereicht · die zeitabhängige Gruppenentscheidung läuft.':'Bestätigt · der Eintrag ist jetzt in der Timeline. <button type="button" data-lvjs-open-timeline>Timeline öffnen</button>';cardState.querySelector('[data-lvjs-open-timeline]')?.addEventListener('click',()=>{handle.close('planned');globalThis.LuviaApp?.show?.('timeline',{source:'journey-suggestion-receipt'})})}catch(error){planButton.disabled=false;planButton.textContent='Zur Timeline';cardState.className='lvjs-card-state is-error';cardState.textContent=error?.message||'Nichts wurde verändert.'}sync();return}
    if(event.target.closest?.('details,.lvjs-choice-scheduler'))return;const button=event.target.closest?.('[data-suggestion-select]');if(!button)return;const id=button.dataset.suggestionSelect,place=result.choices.find(item=>providerId(item)===id);if(selectedIds.has(id)){selectedIds.delete(id)}else{selectedIds.add(id);ensurePlan(place);result.input.onSelectionChange?.(id,place)}sync();queueMicrotask(()=>schedulerFor(id)?.querySelector('[name=date]')?.focus())
  };
  results.oninput=event=>{const scheduler=event.target.closest?.('[data-lvjs-scheduler]');if(!scheduler)return;const id=scheduler.dataset.lvjsScheduler,plan=plans.get(id)||initialPlan(result.choices.find(place=>providerId(place)===id),result.input);plan.date=dateValue(scheduler.querySelector('[name=date]').value);plan.time=clean(scheduler.querySelector('[name=time]').value)||timeValue(result.input.startAt);plan.duration=Number(scheduler.querySelector('[name=duration]').value)||durationFor(result.choices.find(place=>providerId(place)===id));plan.manual=true;plans.set(id,plan);sync()};
  let scrollFrame=0;results.onscroll=()=>{cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(()=>{const cards=[...results.querySelectorAll('.lvjs-choice')];if(!cards.length)return;const nearest=cards.reduce((best,card)=>Math.abs(card.offsetLeft-results.scrollLeft)<Math.abs(best.offsetLeft-results.scrollLeft)?card:best,cards[0]);cards.forEach(card=>card.classList.toggle('is-current',card===nearest));const id=nearest.dataset.suggestionChoice,place=result.choices.find(item=>providerId(item)===id);result.input.onSelectionChange?.(id,place)})};
  sync();
}
async function hydrate(handle,input,options={}){
  const root=handle.overlay,status=root.querySelector('[data-lvjs-status]'),retry=root.querySelector('[data-lvjs-retry]');
  retry.hidden=true;status.hidden=false;status.className='lvjs-status';status.innerHTML='<span class="lvjs-loader" aria-hidden="true"></span><div><strong>Luvia prüft echte Orte …</strong><small>Places filtert Provider-Fakten; OpenAI ordnet nur die fachlich gültigen Kandidaten.</small></div>';
  root.querySelector('[data-lvjs-results]').hidden=true;
  try{paintResults(handle,await load(input,options))}catch(error){status.className='lvjs-status is-error';status.innerHTML=`<span aria-hidden="true">!</span><div><strong>Die Vorschläge konnten nicht sicher geladen werden.</strong><small>${esc(error?.message||'Unbekannter Places-Fehler')} Die Timeline bleibt unverändert.</small></div>`;retry.hidden=false;retry.onclick=()=>hydrate(handle,input,{force:true})}
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
  try{input.groupContext=await sharedPreferenceContext(input);const enriched=await Promise.all(rawInput.places.map(enrich)),choices=await rankForTravelers(enriched,input.groupContext,input);paintResults(mounted,{input,choices,ai:{ranking:choices.some(place=>place.travelerInsights?.some(item=>item.ai)),fallback:choices.every(place=>!place.travelerInsights?.some(item=>item.ai))},count:choices.length,loadedAt:Date.now(),warning:''},rawInput.selectedId||'')}catch(error){status.className='lvjs-status is-error';status.innerHTML=`<span aria-hidden="true">!</span><div><strong>Die Ergebnisse konnten nicht persönlich eingeordnet werden.</strong><small>${esc(error?.message||'Bitte versucht es erneut.')}</small></div>`}
  return mounted.overlay;
}
function diagnostics(){return Object.freeze({version:VERSION,owner:'consumer-orchestration',domainTruth:false,persistence:'ephemeral-cache-only',sources:['journey.v1','identity.v1','trip.v1','intelligence.v1','places.v1','booking.v1'],writeOwner:'places.v1',bookingOwner:'booking.v1',explicitConfirmation:true,cacheEntries:cache.size})}

function bindProposalSync(){
  proposalUnsubscribe?.();proposalUnsubscribe=null;const api=globalThis.LuviaJourneyPlaceProposals;if(!api?.subscribe)return;
  proposalUnsubscribe=api.subscribe(rows=>{for(const proposal of rows||[]){if(proposal.status==='approved'&&proposal.application_status!=='applied')applyApprovedProposal(proposal).catch(error=>console.warn('[LuviaJourneyProposalApply]',error))}if(globalThis.LuviaApp?.activeView?.()==='timeline')globalThis.LuviaApp.show?.('timeline',{force:true,animate:false,source:'journey-proposal-realtime'})});
}

['luvia:user-preferences-changed','luvia:identity.preferences.changed','luvia:trip.changed','luvia:trip-changed'].forEach(name=>globalThis.addEventListener(name,()=>cache.clear()));
globalThis.addEventListener('luvia:journey-place-proposal-changed',event=>{const proposal=event.detail?.proposal;if(proposal?.status==='approved'&&proposal.application_status!=='applied')applyApprovedProposal(proposal).catch(error=>console.warn('[LuviaJourneyProposalApply]',error))});
['luvia:trip.changed','luvia:trip.active.changed','luvia:auth-ready'].forEach(name=>globalThis.addEventListener(name,()=>{bindProposalSync();reconcileApprovedProposals()}));
globalThis.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{bindProposalSync();reconcileApprovedProposals()},400));
globalThis.LuviaJourneySuggestions=Object.freeze({version:VERSION,load,open,openResults,diagnostics});
})();
