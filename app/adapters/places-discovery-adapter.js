(()=>{
'use strict';
const VERSION='1.3.0';
const clean=value=>String(value??'').trim();
const providerId=place=>clean(place?.providerPlaceId||place?.id).replace(/^places\//,'');
const uniquePlaces=items=>{
  const seen=new Set(),result=[];
  for(const place of items||[]){const id=providerId(place);if(!id||seen.has(id))continue;seen.add(id);result.push(place)}
  return result;
};
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
        destination:options.destination||'',
        includedTypes:discoveryRoute.includedTypes,
        labels:{category:discoveryRoute.label},
        profileContext:aiPreferenceContext(options,resolution),
        semanticSignals:window.LuviaGlobalPlaceContracts?.semanticSignals?.(options.text||options.query)||{},
        positionContext:options.positionContext||null
      }
    },{fallback:true});
    const planned=(response?.data?.searchPlans||[]).map(item=>clean(item.query)).filter(Boolean).map(query=>`${query} ${options.destination||''}`.trim());
    return{
      queries:[...new Set([...(queries||[]),...planned])].slice(0,14),
      ai:{fallback:Boolean(response?.meta?.fallback),summary:response?.data?.reasoningSummary||'',preferredSignals:response?.data?.preferredSignals||[],mustHave:response?.data?.mustHave||[],excludedSignals:response?.data?.excludedSignals||[]}
    };
  }catch(error){
    return{queries,ai:{fallback:true,error:error?.code||error?.message||'AI_UNAVAILABLE'}};
  }
}
function deterministicAssessment(place,options,discoveryRoute){
  let score=Math.min(25,Number(place.rating||0)*5);
  const reviews=Number(place.userRatingCount||0);
  score+=Math.min(15,Math.log10(Math.max(1,reviews))*5);
  if(place.currentOpeningHours?.openNow===true||place.openNow===true)score+=10;
  if(place.formattedAddress||place.address)score+=5;
  const relevance=window.LuviaGlobalPlaceContracts?.relevance?.(place,options.text||options.query||'',discoveryRoute.category,options.preferences||{})||{score:0,reasons:[]};
  return{
    score:score+Number(relevance.score||0)+Number(place.preferenceScoreDelta||0)+(Number.isFinite(Number(place.aiMatchScore))?Math.max(-10,Math.min(25,(Number(place.aiMatchScore)-50)/2)):0),
    reasons:[...new Set([...(place.aiReasons||[]),...(relevance.reasons||[])])]
  };
}
async function recommend(options={}){
  const discoveryRoute=route(options);
  const resolvedPreferences=preferenceResolution(options);
  const goal={text:clean(options.text||options.query)||discoveryRoute.query,category:discoveryRoute.category};
  const deterministic=window.LuviaGlobalPlaceContracts?.queryCascade?.(goal,options.destination||'',options.preferences||{})||[`${goal.text} ${options.destination||''}`.trim()];
  const plan=await aiPlan(options,discoveryRoute,deterministic,resolvedPreferences);
  const rejected=new Set((options.rejectedProviderPlaceIds||[]).map(value=>clean(value).replace(/^places\//,'')));
  const intent=window.LuviaGlobalPlaceContracts?.intentFor?.(goal.text,goal.category)||{};
  const candidates=[];
  const candidateLimit=Math.min(60,Math.max(20,Number(options.candidateLimit||20)));
  const queryLimit=candidateLimit>20?5:3;
  const requestedLimit=Math.min(20,Math.max(1,Number(options.limit||5)));
  const hasEnoughCandidates=()=>uniquePlaces(candidates).length>=requestedLimit;
  const attempts=[];
  let lastError=null;
  for(const query of plan.queries.slice(0,queryLimit)){
    for(const strictDestination of (intent.niche?[true,false]:[true])){
      try{
        const response=await window.LuviaPlaceEntities.searchPlaces({
          tripId:options.tripId,
          type:discoveryRoute.primaryType,
          includedType:intent.niche?'':discoveryRoute.includedType,
          query,
          destination:options.destinationContext||options.trip||options.destination||null,
          maxResultCount:Math.min(20,Math.max(5,requestedLimit)),
          strictDestination,
          providers:options.providers||['google','foursquare'],
          profileContext:options.profileContext||{},
          intentContext:{text:goal.text,category:goal.category,niche:Boolean(intent.niche),variants:plan.queries,aiPlan:plan.ai||null},
          positionContext:options.positionContext||null
        });
        const places=(response?.data?.places||[]).filter(place=>!rejected.has(providerId(place)));
        candidates.push(...places);
        attempts.push({query,strictDestination,ok:true,count:places.length});
      }catch(error){
        lastError=error;
        attempts.push({query,strictDestination,ok:false,code:error?.code||'PLACES_QUERY_FAILED'});
      }
      if(hasEnoughCandidates())break;
    }
    if(hasEnoughCandidates())break;
  }
  if(!candidates.length&&lastError){
    lastError.discoveryAttempts=attempts;
    throw lastError;
  }
  const accepts=place=>window.LuviaGlobalPlaceContracts?.accepts?.(place,discoveryRoute.category,goal.text,options.preferences||{})!==false;
  let ranked=uniquePlaces(candidates).filter(accepts);
  let aiRanking={available:Boolean(window.LuviaAI?.rankCandidates),used:false,fallback:null,error:null};
  if(window.LuviaAI?.rankCandidates&&ranked.length){
    try{
      ranked=await window.LuviaAI.rankCandidates({domain:'places',contract:{query:goal.text,category:goal.category,destination:options.destination||'',profileContext:aiPreferenceContext(options,resolvedPreferences),semanticSignals:window.LuviaGlobalPlaceContracts?.semanticSignals?.(goal.text)||{},aiSearchPlan:plan.ai||null,positionContext:options.positionContext||null},candidates:ranked});
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
    return{place:{...place,aiReasons:assessment.reasons},score:assessment.score};
  }).sort((left,right)=>right.score-left.score).map(entry=>entry.place);
  return{places:ranked.slice(0,requestedLimit).map(place=>({...place,coordinates:place.coordinates||place.location||null})),plan:{...plan,route:discoveryRoute,attempts},aiMeta:{planning:{available:Boolean(window.LuviaAI?.interpretDiscovery),used:Boolean(plan.ai),fallback:plan.ai?.fallback??null},ranking:aiRanking},preferenceResolution:resolvedPreferences,preferenceMeta};
}
function diagnostics(){return{version:VERSION,status:'ready',categoryRegistryVersion:LuviaPlacesDomainContractCoreV1.version,aiPlanning:Boolean(window.LuviaAI?.interpretDiscovery),aiRanking:Boolean(window.LuviaAI?.rankCandidates),preferenceResolution:Boolean(intelligence()?.reads?.resolveTripPreferences),maxCandidateLimit:60,breadthUsesUniquePlaces:true,maxQueryVariants:5,deviceLocationSource:'injected-context-only'}}
window.LuviaPlacesDiscoveryService=Object.freeze({version:VERSION,listSaved,recommend,diagnostics});
})();
