// Intelligence owns research evidence; only Places may resolve a lead to a Place.
export const WEB_RESEARCH_CAPABILITY='discovery.web-research';
export const WEB_RESEARCH_POLICY=Object.freeze({maxToolCalls:2,maxOffers:6,maxOutputTokens:2400,timeoutMs:30000,maxResearchPerWorkflow:1,maxResearchPerUserDay:5,maxResearchPerDay:100,toolUsdPerCall:0.01,pricingCheckedAt:'2026-09-09'});
const clean=(value:unknown,max=180)=>String(value||'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max);
const categories=new Set(['food','sights','culture','nature','water','activities','themeparks','shopping','nightlife','wellness','photo']);

export function researchEnabled(requestUrl:string){
  return Deno.env.get('LUVIA_WEB_RESEARCH_ENABLED')!=='false'&&new URL(requestUrl).pathname.split('/').includes('luvia-intelligence-integration');
}

export function researchInput(value:any){
  const destination={name:clean(value?.destination?.name,120),countryCode:clean(value?.destination?.countryCode,2).toUpperCase()};
  const needs=(Array.isArray(value?.needs)?value.needs:[]).slice(0,2).map((item:any)=>({category:clean(item.category,24),query:clean(item.query,200)})).filter((item:any)=>categories.has(item.category)&&item.query);
  if(!destination.name||!needs.length)throw Object.assign(new Error('Für die Recherche fehlt ein konkretes Reiseziel oder ein offener Erlebniswunsch.'),{code:'WEB_RESEARCH_INPUT_REQUIRED',status:400});
  // Do not forward profile, companions, bookings, raw request or client tool settings.
  return {destination,needs};
}

export function publicSourceUrl(value:unknown){
  try{
    const url=new URL(String(value||'')),host=url.hostname.toLowerCase();
    if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.port||!host.includes('.')||host.endsWith('.local')||host.endsWith('.localhost')||host.endsWith('.internal')||host==='localhost'||/^[\d.]+$/.test(host)||host.includes(':'))return '';
    url.hash='';return url.href;
  }catch{return '';}
}

export function webResearchUsage(response:any){
  const calls=(response?.output||[]).filter((item:any)=>item?.type==='web_search_call').length;
  return {webSearchCalls:calls,webToolCostUsd:Math.round(calls*WEB_RESEARCH_POLICY.toolUsdPerCall*1000000)/1000000,webUsageKnown:true};
}

export function bindResearchSources(value:any,response:any,input:any){
  const sources=new Map<string,string>();
  const searched=(response?.output||[]).some((item:any)=>item.type==='web_search_call');
  for(const item of response?.output||[]){
    if(item.type==='web_search_call')for(const source of item.action?.sources||[]){const url=publicSourceUrl(source.url);if(url)sources.set(url,clean(source.title,160));}
    if(searched)for(const content of item.content||[])for(const annotation of content.annotations||[]){const citation=annotation.type==='url_citation'?(annotation.url_citation||annotation):null,url=publicSourceUrl(citation?.url);if(url)sources.set(url,clean(citation?.title,160));}
  }
  const requested=new Set(researchInput(input).needs.map((item:any)=>item.category)),seen=new Set<string>(),retrievedAt=new Date().toISOString();
  const offers=(Array.isArray(value?.offers)?value.offers:[]).slice(0,WEB_RESEARCH_POLICY.maxOffers).flatMap((offer:any)=>{
    const url=publicSourceUrl(offer.sourceUrl),name=clean(offer.name,120),category=clean(offer.category,24),key=name.toLocaleLowerCase();
    if(!url||!sources.has(url)||!name||!requested.has(category)||seen.has(key))return [];
    seen.add(key);
    return [{name,category,description:clean(offer.description,220),address:clean(offer.address,200),source:{url,title:sources.get(url)||new URL(url).hostname,retrievedAt},unknowns:['Öffnung, Preis und Buchbarkeit für eure Reise noch prüfen.'],state:'research-lead',placeVerified:false}];
  });
  return {offers,retrievedAt,unresolvedCategories:[...requested].filter(category=>!offers.some((offer:any)=>offer.category===category)),sourceCount:sources.size};
}
