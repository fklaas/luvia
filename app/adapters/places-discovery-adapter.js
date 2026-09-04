(()=>{
'use strict';
const VERSION='1.14.2-provider-answer-truth';
const PROVIDER_CACHE_MS=180000;
const PROVIDER_RECOVERY_MS=15*60*1000;
const providerCache=new Map(),providerFlights=new Map();
const clean=value=>String(value??'').trim();
const providerId=place=>clean(place?.providerPlaceId||place?.id).replace(/^places\//,'');
const providerName=value=>{const name=clean(value).toLowerCase();return name.startsWith('google')?'google':name.startsWith('foursquare')?'foursquare':name==='multi'?'multi':name||'unknown'};
const safeProviderMeta=(value={},places=[])=>{
  const requested=[...new Set((value.requested||[]).map(providerName).filter(name=>name!=='unknown'))],attempted=[...new Set((value.attempted||[]).map(providerName).filter(name=>name!=='unknown'))],answered=[...new Set((value.answered||[]).map(providerName).filter(name=>name!=='unknown'))],used=[...new Set((value.used||places.flatMap(place=>Object.keys(place.providerRefs||{}))).map(providerName).filter(name=>name!=='unknown'))],errors=(value.errors||[]).slice(0,4).map(error=>({provider:providerName(error?.provider),code:clean(error?.code||'PROVIDER_ERROR').slice(0,80)})),status=clean(value.status)||(places.length?(errors.length?'partial':'ready'):(answered.length?'empty':errors.length?'unavailable':'empty'));
  return{requested,attempted,answered,used,errors,status,degraded:errors.length>0};
};
const destinationLabel=value=>value&&typeof value==='object'?clean(value.name||value.displayName||value.destinationName||value.formattedAddress):clean(value);
const destinationFingerprint=value=>{const source=value&&typeof value==='object'?value:{name:value},coordinates=source?.center||source?.location||source?.coordinates||{};return{id:clean(source?.id||source?.placeId),name:clean(source?.name||source?.displayName),countryCode:clean(source?.countryCode),radius:Number(source?.searchRadiusMeters)||null,viewport:source?.viewport||null,latitude:Number.isFinite(Number(coordinates.latitude??coordinates.lat))?Number(coordinates.latitude??coordinates.lat):null,longitude:Number.isFinite(Number(coordinates.longitude??coordinates.lng))?Number(coordinates.longitude??coordinates.lng):null}};
const hasGeography=value=>{if(!value||typeof value!=='object')return false;const source=value.center||value.location||value.coordinates||{},latitude=Number(source.latitude??source.lat??value.destinationLat??value.latitude),longitude=Number(source.longitude??source.lng??value.destinationLng??value.longitude),viewport=value.viewport;return Number.isFinite(latitude)&&Number.isFinite(longitude)||Boolean(viewport&&[viewport.south,viewport.west,viewport.north,viewport.east].every(item=>Number.isFinite(Number(item))))};
const hasDestinationIdentity=value=>Boolean(value&&typeof value==='object'&&clean(value.id||value.placeId||value.name||value.displayName||value.destinationName||value.city||value.countryCode));
function providerDestination(options={}){
  const tripDestination=options.trip?.destination&&typeof options.trip.destination==='object'?options.trip.destination:null;
  const explicitDestination=options.destination&&typeof options.destination==='object'?options.destination:null;
  const active=window.LuviaPlaces?.activeDestination?.()||null;
  const candidates=[options.destinationContext,tripDestination,options.trip,explicitDestination,active];
  return candidates.find(hasGeography)||candidates.find(hasDestinationIdentity)||options.destination||active||null;
}
const cacheFingerprint=(options,route,query,strictDestination)=>JSON.stringify({type:route.primaryType,includedType:route.includedType,includedTypes:options.includedTypes||[],strictPlaceType:clean(options.strictPlaceType)||null,vegetarianOnly:options.vegetarianOnly===true,accessibleOnly:options.accessibleOnly===true,reservableOnly:options.reservableOnly===true,priceLevels:options.priceLevels||[],minUserRatingCount:options.minUserRatingCount||0,query,candidateLimit:Number(options.candidateLimit)||20,limit:Number(options.limit)||5,destination:destinationFingerprint(providerDestination(options)),strictDestination,providers:(options.providers||['auto']).map(providerName),languageCode:clean(options.languageCode||globalThis.document?.documentElement?.lang||'de'),regionCode:clean(options.regionCode||''),openNow:options.openNow===true,minRating:Number(options.minRating)||null,maxDistanceMeters:Number(options.maxDistanceMeters)||null,sortBy:clean(options.sortBy||'relevance'),spatialConstraints:options.spatialConstraints||null,positionShared:options.positionContext?.providerShareApproved===true||options.positionContext?.shareWithProvider===true});
function providerRequestTimeout(options={}){
  const requested=(options.providers||['auto']).map(providerName),configured=Math.max(0,Number(options.providerTimeoutMs)||0),fallback=options.fastPath===true?2400:12000;
  // `auto` can legally walk Geoapify -> TomTom -> HERE. Each provider owns a
  // bounded server timeout, so the browser must not abort the gateway before
  // the final free provider can answer.
  return requested.includes('auto')?Math.max(24000,configured):configured||fallback;
}
function aggregateProviderDiagnostics(attempts=[]){
  const requested=new Set(),attemptedProviders=new Set(),answered=new Set(),used=new Set(),errors=[];let successfulAttempts=0,cachedAttempts=0;
  for(const attempt of attempts){for(const provider of attempt.providers?.requested||[])requested.add(provider);for(const provider of attempt.providers?.attempted||[])attemptedProviders.add(provider);for(const provider of attempt.providers?.answered||[])answered.add(provider);for(const provider of attempt.providers?.used||[])used.add(provider);for(const error of attempt.providers?.errors||[])errors.push(error);if(attempt.ok)successfulAttempts++;if(attempt.cached)cachedAttempts++}
  const uniqueErrors=[...new Map(errors.map(error=>[`${error.provider}:${error.code}`,error])).values()].slice(0,8),status=used.size?(uniqueErrors.length?'partial':'ready'):(answered.size?'empty':uniqueErrors.length?'unavailable':successfulAttempts?'empty':'unknown');
  return{requested:[...requested],attempted:[...attemptedProviders],answered:[...answered],used:[...used],errors:uniqueErrors,status,degraded:uniqueErrors.length>0,successfulAttempts,cachedAttempts,attemptCount:attempts.length};
}
const uniquePlaces=items=>{
  const byId=new Map(),result=[];
  for(const place of items||[]){
    const id=providerId(place);if(!id)continue;
    const existing=byId.get(id);
    if(existing){existing.discoveryQueries=[...new Set([...(existing.discoveryQueries||[]),...(place.discoveryQueries||[])])];continue}
    const next={...place,discoveryQueries:[...new Set(place.discoveryQueries||[])]};byId.set(id,next);result.push(next);
  }
  return result;
};
const restaurantEvidence=place=>{const values=[place?.primaryTypeLabel,place?.primary_type_label,...(place?.types||[]),...(place?.providerNativeTypes||[])].map(value=>clean(value).toLowerCase()).filter(Boolean);return values.some(value=>/(?:^|[_\s-])restaurant(?:$|[_\s-])|ristorante|restaurante|restaurang|restauracja|restoran|restaurace|restauracja|ресторан|مطعم|餐厅|餐館|レストラン/.test(value))};
function diverseOrder(items,queries=[],enabled=true){
  if(!enabled||items.length<3||queries.length<2)return items;
  const leader=items[0],remaining=items.slice(1),ordered=[leader],queryOrder=[...new Set(queries.map(clean).filter(Boolean))];
  while(remaining.length){
    let added=false;
    for(const query of queryOrder){
      const index=remaining.findIndex(place=>(place.discoveryQueries||[])[0]===query);
      if(index<0)continue;
      ordered.push(remaining.splice(index,1)[0]);added=true;
    }
    if(!added)break;
  }
  return ordered.concat(remaining);
}
const route=input=>LuviaPlacesDomainContractCoreV1.routeDiscovery(input);
const intelligence=()=>window.LuviaIntelligenceContractV1||window.LuviaIntelligenceContract||null;

function preferenceResolution(options={}){
  if(options.preferenceResolution?.kind==='derived-trip-preference-resolution')return options.preferenceResolution;
  const resolver=intelligence()?.reads?.resolveTripPreferences||intelligence()?.resolveTripPreferences;
  if(typeof resolver!=='function')return null;
  return resolver({profilePreferences:options.preferences||options.profilePreferences||{},tripComposition:options.tripComposition||options.composition||{},trip:options.trip||{id:options.tripId||null}});
}

async function listSaved(options={}){
  const response=await window.LuviaPlaceEntities?.list?.(options,options.requestOptions||{});
  return response?.data?.entities||[];
}
function aiPreferenceContext(options,resolution){
  const compact=list=>(list||[]).slice(0,12).map(item=>({key:item.key||item.id||null,label:item.label||item.value||'',weight:Number(item.weight||0)||0,kind:item.kind||null}));
  return{
    ...(options.profileContext||{}),
    hardConstraints:compact(resolution?.hardConstraints),
    globalProfileSignals:compact(resolution?.profileSignals),
    tripSignals:compact(resolution?.tripSignals),
    activeWeights:compact(resolution?.activeWeights),
    tripFeelings:(resolution?.summary?.tripFeelings||[]).slice(0,6),
    currentMoment:options.momentContext?{query:options.momentContext.query||'',targetDate:options.momentContext.targetDate||null,startAt:options.momentContext.startAt||null,reasons:(options.momentContext.reasons||[]).slice(0,4)}:null
  };
}
async function aiPlan(options,discoveryRoute,queries,resolution){
  if(!window.LuviaAI?.interpretDiscovery)return{queries,ai:null};
  try{
    const response=await window.LuviaAI.interpretDiscovery({
      domain:'places',
      freeText:options.text||options.query||discoveryRoute.query,
      contract:{
        domain:'places',
        query:options.text||options.query||discoveryRoute.query,
        category:discoveryRoute.category,
        destination:destinationLabel(options.destination),
        includedTypes:discoveryRoute.includedTypes,
        labels:{category:discoveryRoute.label},
        profileContext:aiPreferenceContext(options,resolution),
        semanticSignals:window.LuviaGlobalPlaceContracts?.semanticSignals?.(options.text||options.query)||{},
        spatialConstraints:options.spatialConstraints||window.LuviaGlobalPlaceContracts?.spatialIntent?.(options.text||options.query)||null,
        positionContext:options.positionContext||null
      }
    },{fallback:true});
    const searchPlans=(response?.data?.searchPlans||[]).map(item=>({query:clean(item?.query),includedTypes:[...(item?.includedTypes||[])].map(clean).filter(Boolean).slice(0,12),weight:Number(item?.weight)||0})).filter(item=>item.query),planned=searchPlans.map(item=>`${item.query} ${destinationLabel(options.destination)}`.trim());
    return{
      queries:[...new Set([(queries||[])[0],...planned,...(queries||[]).slice(1)].filter(Boolean))].slice(0,14),
      ai:{fallback:Boolean(response?.meta?.fallback),summary:response?.data?.reasoningSummary||'',preferredSignals:response?.data?.preferredSignals||[],mustHave:response?.data?.mustHave||[],excludedSignals:response?.data?.excludedSignals||[],searchPlans}
    };
  }catch(error){
    return{queries,ai:{fallback:true,error:error?.code||error?.message||'AI_UNAVAILABLE'}};
  }
}
function preferenceQueryVariants(goal,discoveryRoute,resolution,destination=''){
  if(discoveryRoute.category!=='food')return[];
  const suffix=clean(typeof destination==='object'?(destination.name||destination.displayName||destination.destinationName):destination),queries=[];
  const add=value=>queries.push(`${value}${suffix?` ${suffix}`:''}`);
  const constraints=resolution?.hardConstraints||[],weights=resolution?.weights||{};
  if(constraints.some(item=>item.kind==='dietary'&&/vegan/.test(clean(item.value).toLowerCase())))add('Veganes Restaurant');
  else if(constraints.some(item=>item.kind==='dietary'&&/vegetar/.test(clean(item.value).toLowerCase())))add('Vegetarisches Restaurant');
  if(constraints.some(item=>item.kind==='accessibility'))add('Barrierefreies Restaurant');
  if(constraints.some(item=>item.kind==='family'))add('Familienfreundliches Restaurant');
  if(Number(weights.quiet)>0)add('Ruhiges Restaurant');
  if(Number(weights.local)>0)add('Restaurant regionale Küche');
  if(Number(weights.scenic)>0)add('Restaurant mit Aussicht');
  return[...new Set(queries)].filter(query=>query!==goal.text).slice(0,4);
}
function deterministicAssessment(place,options,discoveryRoute){
  let score=Math.min(25,Number(place.rating||0)*5);
  const reviews=Number(place.userRatingCount||0);
  score+=Math.min(15,Math.log10(Math.max(1,reviews))*5);
  if(place.currentOpeningHours?.openNow===true||place.openNow===true)score+=10;
  if(place.formattedAddress||place.address)score+=5;
  const relevance=window.LuviaGlobalPlaceContracts?.relevance?.(place,options.text||options.query||'',discoveryRoute.category,options.preferences||options.profilePreferences||{})||{score:0,reasons:[]};
  const distance=Number(place.distanceMeters),distanceReasons=[];
  if(Number.isFinite(distance)&&distance>=0){
    score+=distance<=500?38:distance<=1500?30:distance<=5000?12:distance<=12000?3:-Math.min(24,Math.round((distance-12000)/2500));
    if(distance<=1500)distanceReasons.push(`Der Ort liegt mit ${Math.max(1,Math.round(distance))} Metern besonders nah am gewählten Reiseziel.`);
  }
  return{
    score:score+Number(relevance.score||0)+Number(place.preferenceScoreDelta||0)+(Number.isFinite(Number(place.aiMatchScore))?Math.max(-8,Math.min(10,(Number(place.aiMatchScore)-50)/4)):0),
    reasons:[...new Set([...(place.aiReasons||[]),...(relevance.reasons||[]),...distanceReasons])],
    spatial:relevance.spatial||null
  };
}
async function recommend(options={}){
  options={...options};
  const geography=providerDestination(options);
  if(hasGeography(geography)&&typeof LuviaPlacesDomainContractCoreV1.localSearchRadius==='function')options.destinationContext={...geography,searchRadiusMeters:LuviaPlacesDomainContractCoreV1.localSearchRadius(geography,options.maxDistanceMeters)};
  const requestedRoute=route(options);
  const resolvedPreferences=preferenceResolution(options);
  const goal={text:clean(options.text||options.query)||requestedRoute.query,category:requestedRoute.category};
  // Category browse queries are provider taxonomy routes. Only an explicit user
  // subject (subjectText / userQuery) may activate the open-vocabulary evidence gate.
  const subjectText=Object.prototype.hasOwnProperty.call(options,'subjectText')
    ?clean(options.subjectText)
    :(Object.prototype.hasOwnProperty.call(options,'userQuery')?clean(options.userQuery):goal.text);
  const intent=window.LuviaGlobalPlaceContracts?.intentFor?.(subjectText||goal.text,goal.category)||{};
  const discoveryRoute=intent.category&&intent.category!==goal.category?route({...options,category:intent.category,text:goal.text,query:goal.text}):requestedRoute;
  const searchDestination=destinationLabel(options.destination);
  const baseQueries=window.LuviaGlobalPlaceContracts?.queryCascade?.(goal,searchDestination,options.preferences||options.profilePreferences||{},{strictPlaceType:options.strictPlaceType||null})||[`${goal.text} ${searchDestination}`.trim()];
  const deterministic=[...new Set([baseQueries[0],...preferenceQueryVariants(goal,discoveryRoute,resolvedPreferences,searchDestination),...baseQueries.slice(1)].filter(Boolean))];
  const plan=options.fastPath===true?{queries:deterministic,ai:null}:await aiPlan(options,discoveryRoute,deterministic,resolvedPreferences);
  const rejected=new Set((options.rejectedProviderPlaceIds||[]).map(value=>clean(value).replace(/^places\//,'')));
  const specificEvidence=window.LuviaGlobalPlaceContracts?.evidenceContract?.(subjectText,goal.category,plan.ai||{},searchDestination)||null;
  const candidates=[];
  const candidateLimit=Math.min(60,Math.max(20,Number(options.candidateLimit||20)));
  const queryLimit=options.fastPath===true?Math.min(3,Math.max(1,Number(options.fastQueryLimit||1))):options.queryVariantLimit?Math.min(5,Math.max(1,Number(options.queryVariantLimit))):(candidateLimit>20?5:3);
  const requestedLimit=Math.min(60,Math.max(1,Number(options.limit||5)));
  const diversity=options.diversity&&typeof options.diversity==='object'?options.diversity:{},minimumQueryVariants=Math.min(queryLimit,Math.max(1,Number(diversity.minimumQueryVariants||3))),diversityTarget=Math.min(candidateLimit,Math.max(requestedLimit,Number(diversity.targetCandidates)||Math.max(requestedLimit*3,requestedLimit+6)));
  const dietary=options.requirePreferenceEvidence===true?window.LuviaGlobalPlaceContracts?.profileSignals?.(options.preferences||options.profilePreferences||{}):null;
  const accepts=place=>{if(discoveryRoute.category==='food'&&(dietary?.vegan||dietary?.vegetarian)&&window.LuviaGlobalPlaceContracts?.accepts?.(place,'food',dietary.vegan?'Veganes Restaurant':'Vegetarisches Restaurant',options.preferences||{})===false)return false;const strictRestaurant=options.strictPlaceType==='restaurant';if(strictRestaurant&&!restaurantEvidence(place))return false;const assessmentPlace=strictRestaurant?{...place,types:[...(place.types||[]),'restaurant']}:place;return window.LuviaGlobalPlaceContracts?.accepts?.(assessmentPlace,discoveryRoute.category,subjectText,options.preferences||options.profilePreferences||{},{evidenceContract:specificEvidence,plan:plan.ai||{},destination:searchDestination})!==false};
  const eligibleCandidates=()=>uniquePlaces(candidates).filter(accepts);
  const hasEnoughCandidates=()=>eligibleCandidates().length>=diversityTarget;
  const providerCandidateWindow=Math.min(50,Math.max(20,Number(options.candidateLimit||options.limit||20)));
  const attempts=[];
  let lastError=null;
  const providerRequest=async(query,strictDestination)=>{
    const cacheKey=cacheFingerprint(options,discoveryRoute,query,strictDestination);
    const cached=providerCache.get(cacheKey);
    if(cached&&Date.now()-cached.loadedAt<PROVIDER_CACHE_MS){
      const places=cached.places.filter(place=>!rejected.has(providerId(place))).map(place=>({...place,discoveryQueries:[query],ownerObservedAt:place.ownerObservedAt||new Date(cached.loadedAt).toISOString(),providerFactsCached:true}));
      return{places,attempt:{query,strictDestination,ok:true,count:places.length,cached:true,ownerObservedAt:new Date(cached.loadedAt).toISOString(),providers:cached.providers}};
    }
    try{
      const selectedTypes=(Array.isArray(options.includedTypes)?options.includedTypes:[]).map(clean).filter(Boolean);
      const includedTypes=selectedTypes.length?selectedTypes:(discoveryRoute.includedTypes||[]);
      let flight=providerFlights.get(cacheKey);
      if(!flight){flight=Promise.resolve().then(()=>window.LuviaPlaceEntities.searchPlaces({
        tripId:options.tripId,
        type:discoveryRoute.primaryType,
        includedType:intent.niche?'':(selectedTypes.length===1?selectedTypes[0]:(selectedTypes.length?'':discoveryRoute.includedType)),
        includedTypes,
        category:discoveryRoute.category,
        strictTypeFiltering:selectedTypes.length>0||options.strictPlaceType==='restaurant',
        query,
        userQuery:options.userQuery,
        destination:providerDestination(options),
        maxResultCount:providerCandidateWindow,
        strictDestination,
        providers:options.providers||['auto'],
        languageCode:options.languageCode||globalThis.document?.documentElement?.lang||'de',
        regionCode:options.regionCode||'',
        openNow:options.openNow===true,
        minRating:options.minRating,
        minUserRatingCount:options.minUserRatingCount||0,
        priceLevels:options.priceLevels||[],
        vegetarianOnly:options.vegetarianOnly===true,
        accessibleOnly:options.accessibleOnly===true,
        reservableOnly:options.reservableOnly===true,
        maxDistanceMeters:options.maxDistanceMeters,
        sortBy:options.sortBy||'relevance',
        profileContext:options.profileContext||{},
        intentContext:{text:goal.text,category:goal.category,niche:Boolean(intent.niche),variants:plan.queries,aiPlan:plan.ai||null},
        spatialConstraints:options.spatialConstraints||window.LuviaGlobalPlaceContracts?.spatialIntent?.(goal.text)||null,
        positionContext:options.positionContext||null,
        requestOptions:{timeoutMs:providerRequestTimeout(options)}
      })).finally(()=>providerFlights.delete(cacheKey));providerFlights.set(cacheKey,flight)}
      const response=await flight;
      const ownerObservedAt=new Date().toISOString(),backendCached=Boolean(response?.meta?.cache?.hit||response?.cache?.hit),providers=safeProviderMeta(response?.data?.providers||{},response?.data?.places||[]);
      if(!(response?.data?.places||[]).length&&providers.status==='unavailable')throw Object.assign(new Error('Places lieferte keinen belastbaren Treffer, während keine Ortsquelle belastbar geantwortet hat.'),{code:'PLACES_PROVIDER_READ_UNAVAILABLE',providerDiagnostics:providers});
      const rawPlaces=(response?.data?.places||[]).map(place=>({...place,ownerObservedAt,providerObservedAt:place.providerObservedAt||null,providerFactsCached:backendCached,providerReadiness:providers.status}));
      if(rawPlaces.length)providerCache.set(cacheKey,{places:rawPlaces,providers,loadedAt:Date.now()});else providerCache.delete(cacheKey);
      const places=rawPlaces.filter(place=>!rejected.has(providerId(place))).map(place=>({...place,discoveryQueries:[query]}));
      return{places,attempt:{query,strictDestination,ok:true,count:places.length,cached:backendCached,ownerObservedAt,providers}};
    }catch(error){
      const age=cached?Date.now()-cached.loadedAt:Infinity;
      // A temporary network failure must not erase a previously verified cohort.
      // Reuse only this exact query/filter/area and only bounded Geoapify data;
      // never claim a stale opening-hours result is currently open.
      if(cached&&age>=0&&age<PROVIDER_RECOVERY_MS&&!options.openNow&&cached.places.length&&cached.places.every(place=>/^(?:geoapify|tomtom|here):/.test(providerId(place)))){
        const places=cached.places.filter(place=>!rejected.has(providerId(place))).map(place=>({...place,discoveryQueries:[query],ownerObservedAt:place.ownerObservedAt||new Date(cached.loadedAt).toISOString(),providerFactsCached:true,providerReadiness:'stale'}));
        const providers={...cached.providers,status:'partial',degraded:true,errors:[...(cached.providers.errors||[]),{provider:'auto',code:clean(error?.code||'PLACES_QUERY_FAILED').slice(0,80)}]};
        return{places,attempt:{query,strictDestination,ok:true,count:places.length,cached:true,stale:true,ownerObservedAt:new Date(cached.loadedAt).toISOString(),providers}};
      }
      return{places:[],error,attempt:{query,strictDestination,ok:false,code:error?.code||'PLACES_QUERY_FAILED',cached:false,providers:safeProviderMeta(error?.providerDiagnostics||{})}};
    }
  };
  const selectedQueries=plan.queries.slice(0,queryLimit);
  if(options.fastPath===true&&options.parallelFastQueries===true){
    const settled=await Promise.all(selectedQueries.map(query=>providerRequest(query,true)));
    for(const result of settled){candidates.push(...result.places);attempts.push(result.attempt);if(result.error)lastError=result.error}
  }else{
    for(const [queryIndex,query] of selectedQueries.entries()){
      for(const strictDestination of (intent.niche?[true,false]:[true])){
        const result=await providerRequest(query,strictDestination);
        candidates.push(...result.places);attempts.push(result.attempt);if(result.error)lastError=result.error;
        if(hasEnoughCandidates())break;
      }
      if(queryIndex+1>=minimumQueryVariants&&hasEnoughCandidates())break;
    }
  }
  if(!candidates.length&&lastError){
    lastError.discoveryAttempts=attempts;
    throw lastError;
  }
  let ranked=uniquePlaces(candidates).filter(accepts);
  let aiRanking={available:Boolean(window.LuviaAI?.rankCandidates),used:false,fallback:null,error:null};
  if(options.fastPath!==true&&window.LuviaAI?.rankCandidates&&ranked.length){
    try{
      ranked=await window.LuviaAI.rankCandidates({domain:'places',contract:{query:goal.text,category:goal.category,destination:searchDestination,profileContext:aiPreferenceContext(options,resolvedPreferences),semanticSignals:window.LuviaGlobalPlaceContracts?.semanticSignals?.(goal.text)||{},spatialConstraints:options.spatialConstraints||window.LuviaGlobalPlaceContracts?.spatialIntent?.(goal.text)||null,aiSearchPlan:plan.ai||null,positionContext:options.positionContext||null},candidates:ranked});
      aiRanking={available:true,used:ranked.some(place=>place.aiMatchScore!=null),fallback:ranked.some(place=>place.aiRankingFallback===true),error:null};
    }catch(error){aiRanking={available:true,used:false,fallback:true,error:error?.code||'AI_RANKING_FAILED'}}
  }
  let preferenceMeta={candidateCount:ranked.length,eligibleCount:ranked.length,blockedCount:0,deterministic:true,providerFactsPreserved:true};
  const ranker=intelligence()?.reads?.rankPlaceCandidates||intelligence()?.rankPlaceCandidates;
  if(resolvedPreferences&&typeof ranker==='function'&&ranked.length){
    const resolved=ranker({resolution:resolvedPreferences,candidates:ranked,query:goal.text,category:goal.category});
    ranked=resolved.places||ranked;preferenceMeta=resolved.meta||preferenceMeta;
  }
  ranked=ranked.filter(accepts).map(place=>{
    const assessment=deterministicAssessment(place,options,discoveryRoute);
    return{place:{...place,aiReasons:assessment.reasons,spatialConstraint:assessment.spatial},score:assessment.score};
  }).sort((left,right)=>right.score-left.score).map(entry=>entry.place);
  ranked=diverseOrder(ranked,selectedQueries,diversity.rotateAcrossQueries!==false);
  const places=ranked.slice(0,requestedLimit).map(place=>({...place,coordinates:place.coordinates||place.location||null})),providerDiagnostics=aggregateProviderDiagnostics(attempts);
  return{places,searchScope:{destination:searchDestination,radiusMeters:options.destinationContext?.searchRadiusMeters||null},selectionMeta:{rawCandidateCount:uniquePlaces(candidates).length,eligibleCandidateCount:eligibleCandidates().length,rankedCandidateCount:ranked.length,returnedCount:places.length},plan:{...plan,route:discoveryRoute,attempts},evidenceContract:specificEvidence,aiMeta:{planning:{available:Boolean(window.LuviaAI?.interpretDiscovery),used:Boolean(plan.ai),fallback:plan.ai?.fallback??null},ranking:aiRanking},preferenceResolution:resolvedPreferences,preferenceMeta,providerDiagnostics,diversityMeta:{candidateCount:ranked.length,eligibleCandidateCount:eligibleCandidates().length,returnedCount:places.length,providerCandidateWindow,minimumQueryVariants,queriedVariants:attempts.filter(attempt=>attempt.ok).length,rotationAcrossQueries:diversity.rotateAcrossQueries!==false,rejectedProviderPlaceIds:rejected.size,providerStatus:providerDiagnostics.status}};
}
  function diagnostics(){return{version:VERSION,status:'ready',categoryRegistryVersion:LuviaPlacesDomainContractCoreV1.version,aiPlanning:Boolean(window.LuviaAI?.interpretDiscovery),aiRanking:Boolean(window.LuviaAI?.rankCandidates),preferenceResolution:Boolean(intelligence()?.reads?.resolveTripPreferences),fastProviderFirstPath:true,fastQueryVariants:3,parallelFastQueries:true,fastProviderTimeoutMs:2400,providerCacheTtlMs:PROVIDER_CACHE_MS,providerCacheEntries:providerCache.size,maxCandidateLimit:60,providerCandidateWindow:'12-20',breadthUsesUniquePlaces:true,breadthUsesEligiblePlaces:true,minDeepQueryVariants:3,chatQueryVariants:3,rotatesAcrossQueryVariants:true,spatialConstraints:true,maxQueryVariants:5,providerTruth:true,strictRestaurantEvidence:true,openVocabularyEvidenceGate:true,canonicalCategoryEvidenceGate:true,accommodationNameFallback:false,nightlifeMultiTypePostFilter:true,inventoryClaimsFromPlaceMetadata:false,providerFailureCache:false,deviceLocationSource:'explicit-provider-share-only'}}
window.LuviaPlacesDiscoveryService=Object.freeze({version:VERSION,listSaved,recommend,diagnostics});
})();
