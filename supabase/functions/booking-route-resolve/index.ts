import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VERSION='2.5.1';
const FETCH_TIMEOUT_MS=6500;
const BROWSER_UA='Mozilla/5.0 (compatible; LuviaBooking/2.5; +https://myluvia.app) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151 Safari/537.36';
const DEFAULT_ORIGINS=['https://myluvia.app','https://www.myluvia.app','https://integration-luvia.njwnrvwbv5.workers.dev','https://luvia.njwnrvwbv5.workers.dev','http://localhost:3000','http://localhost:5500','http://127.0.0.1:5500'];
const allowedOrigins=()=>[...new Set([...DEFAULT_ORIGINS,...(Deno.env.get('LUVIA_ALLOWED_ORIGINS')||'').split(',').map(value=>value.trim().replace(/\/$/,'')).filter(Boolean)])];
const resolveOrigin=(value:string|null)=>{
  const origin=clean(value).replace(/\/$/,'');
  if(!origin)return DEFAULT_ORIGINS[0];
  if(allowedOrigins().includes(origin))return origin;
  if(/^https:\/\/[a-z0-9-]+-luvia\.njwnrvwbv5\.workers\.dev$/i.test(origin))return origin;
  if(/^https:\/\/[a-z0-9-]+\.github\.io$/i.test(origin))return origin;
  if(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin))return origin;
  return'';
};
const corsHeaders=(origin:string)=>({
  'Access-Control-Allow-Origin':origin||'null',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Access-Control-Max-Age':'86400',
  'Vary':'Origin'
});
const json=(data:unknown,status=200,origin=DEFAULT_ORIGINS[0])=>new Response(JSON.stringify(data),{status,headers:{...corsHeaders(origin),'content-type':'application/json; charset=utf-8'}});
const clean=(v:unknown)=>String(v??'').trim();
const isGoogleReserve=(value:string)=>{try{const u=new URL(value);return /(^|\.)google\.[a-z.]+$/i.test(u.hostname)&&/^\/maps\/reserve(?:\/|$)/i.test(u.pathname)}catch{return false}};
const emailRx=/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const validEmail=(v:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const blockedEmail=(v:string)=>/(no-?reply|noreply|example\.|wixpress|sentry|cloudflare)/i.test(v);
const PLACEHOLDER_EMAIL=/(^(?:user|username|email|mail|test|testing|example|exemple)[._+-]?[0-9]*@|@(example\.(?:com|org|net)|domain\.(?:com|org|net)|domaine\.(?:com|fr))$)/i;
const isReservationEmail=(v:string)=>/(reserv|booking|table|restaurant)/i.test(v.split('@')[0]||'');
const RESERVATION_HINT=/(reserv|book(?:ing)?|table|tisch|réserv|reserve|availability|disponibilit|prenota|mesa|seat|widget)/i;
const LEGAL_HINT=/(\/|\b)(gtc|terms?|conditions?|privacy|legal|cgu|cgv|mentions[-_ ]?legales|impressum|cookies?|policy)(\/|\b|[?&#=_-])/i;
const BLOCKED_EXTERNAL=/(facebook\.com|instagram\.com|tiktok\.com|youtube\.com|google\.|maps\.|tripadvisor\.|yelp\.|linkedin\.com)/i;
const NAVIGATION_HOST=/(^|\.)(google\.[a-z.]+|maps\.apple\.com|waze\.com|mapbox\.com|bing\.com|openstreetmap\.org)$/i;
const NAVIGATION_PATH=/(\/maps?(?:\/|$)|\/directions?(?:\/|$)|\/route(?:\/|$)|\/navigation(?:\/|$)|\/itineraire(?:\/|$)|\/anfahrt(?:\/|$)|[?&](?:destination|directions?|route|navigate|navigation)=)/i;
const NAVIGATION_TEXT=/^(?:route|navigation|navigieren|anfahrt|anreise|wegbeschreibung|directions?|maps?|karte|itin[ée]raire)$/i;
const NON_BOOKING_CONTENT=/(\/virtual-menu(?:\/|$)|\/menus?(?:\/|$)|\/menu[-_]?digital|\/speisekarte(?:\/|$)|\/carte(?:\/|$)|\/gift[-_]?cards?(?:\/|$)|[?&](?:menu|carte|pdf)=)/i;
const NON_BOOKING_TEXT=/(digitale?n?\s+speisekarte|our\s+menus?|nos\s+menus?|la\s+carte|speisekarte|menu\s+pdf|download\s+menu)/i;
const BOOKING_PAGE_EVIDENCE=/(reserv(?:e|ation|ierung)|réserv(?:er|ation)|book(?:ing|\s+a\s+table)|table\s+booking|choose\s+(?:a\s+)?date|party\s+size|guests?|covers?|personen|uhrzeit|availability|disponibilit)/i;
const BROKEN_HANDOFF_HINT=/(booking|reservation|reservierung|réservation|widget|venue|restaurant)[^<\n]{0,80}(unavailable|not available|not found|disabled|closed|error|failed|temporarily unavailable|indisponible|introuvable|non disponible|nicht verfügbar|nicht verf[uü]gbar|fehlgeschlagen)|404\s*(?:not found)?|page not found|seite nicht gefunden/i;
const PROVIDERS:[RegExp,string][]=[
  [/(^|\.)opentable\./i,'opentable'],[/(^|\.)(?:thefork|lafourchette)\./i,'thefork'],[/(^|\.)resy\.com$/i,'resy'],[/(^|\.)sevenrooms\.com$/i,'sevenrooms'],[/(^|\.)quandoo\./i,'quandoo'],[/(^|\.)zenchef\./i,'zenchef'],
  [/(^|\.)exploretock\.com$/i,'tock'],[/(^|\.)tockhq\.com$/i,'tock'],[/(^|\.)covermanager\.com$/i,'covermanager'],[/(^|\.)resdiary\.com$/i,'resdiary'],[/(^|\.)tablecheck\.com$/i,'tablecheck'],
  [/(^|\.)formitable\.com$/i,'formitable'],[/(^|\.)aleno\.me$/i,'aleno'],[/(^|\.)simpleerb\.com$/i,'simpleerb']
];
const STOP_WORDS=new Set(['restaurant','restaurants','hotel','paris','the','and','und','chez','les','des','der','die','das','le','la','au','aux','de','du','del','di','da','el']);

type Candidate={kind:string,provider:string,contactValue:string,sourceUrl:string,isOfficial:boolean,confidence:number,evidence:Record<string,unknown>,score:number};

function safeHttpUrl(value:string){
  try{const u=new URL(value);if(!['http:','https:'].includes(u.protocol))return null;const h=u.hostname.toLowerCase();if(h==='localhost'||h==='::1'||h.endsWith('.local')||/^127\./.test(h)||/^10\./.test(h)||/^192\.168\./.test(h)||/^169\.254\./.test(h)||/^172\.(1[6-9]|2\d|3[01])\./.test(h))return null;return u;}catch{return null;}
}
function providerFor(url:string){if(isGoogleReserve(url))return 'google_reserve';try{const h=new URL(url).hostname.toLowerCase().replace(/^www\./,'');for(const [rx,name] of PROVIDERS)if(rx.test(h))return name;return null}catch{return null}}
function normalize(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function venueTokens(name:string){return [...new Set(normalize(name).split(/\s+/).filter(v=>v.length>=4&&!STOP_WORDS.has(v)))];}
function venueMatch(name:string,url:string,text=''){const hay=normalize(`${url} ${text}`);const tokens=venueTokens(name);return tokens.some(token=>hay.includes(token));}
function hasVenueIdentifier(url:string){try{const u=new URL(url);const q=u.search.toLowerCase();return /(^|[?&])(rid|venue|venue_id|restaurant|restaurant_id|restid|shop|location|slug|host)=/.test(`?${q.replace(/^\?/,'')}`)||/\/(explore|restaurant|restaurants|venue|venues)\//i.test(u.pathname)}catch{return false}}
function isNonBookingContent(url:string,text=''){try{const u=new URL(url);return NON_BOOKING_CONTENT.test(`${u.pathname}${u.search}${u.hash}`)||NON_BOOKING_TEXT.test(clean(text));}catch{return true}}
function isLegalUrl(url:string){try{const u=new URL(url);return LEGAL_HINT.test(`${u.pathname}${u.search}${u.hash}`)}catch{return true}}
function isNavigationTarget(url:string,text=''){if(isGoogleReserve(url))return false;try{const u=new URL(url);const h=u.hostname.toLowerCase().replace(/^www\./,'');return NAVIGATION_HOST.test(h)||NAVIGATION_PATH.test(`${u.pathname}${u.search}${u.hash}`)||NAVIGATION_TEXT.test(clean(text));}catch{return true}}
function hasReservationIntent(url:string,text=''){return RESERVATION_HINT.test(`${url} ${text}`)}
function acceptableProviderLink(url:string,text:string,venueName:string){if(isLegalUrl(url)||isNavigationTarget(url,text)||isNonBookingContent(url,text))return false;return hasReservationIntent(url,text)||(hasVenueIdentifier(url)&&BOOKING_PAGE_EVIDENCE.test(`${url} ${text}`));}
function normalizeWebsite(value:string){let raw=clean(value);if(!raw)return null;if(raw.startsWith('//'))raw='https:'+raw;if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw))raw='https://'+raw;const u=safeHttpUrl(raw);if(!u)return null;if(u.protocol==='http:')u.protocol='https:';return u;}
function registrableLabel(host:string){const parts=host.toLowerCase().replace(/^www\./,'').split('.').filter(Boolean);if(parts.length<2)return (parts[0]||'').replace(/[^a-z0-9]/g,'');const second=parts.at(-2)||'';const top=parts.at(-1)||'';const countrySecond=new Set(['co','com','org','net','gov','ac']);const label=(top.length===2&&countrySecond.has(second)&&parts.length>=3)?parts.at(-3):second;return clean(label).replace(/[^a-z0-9]/g,'')}
function hostStem(host:string){return registrableLabel(host)}
function redirectDomainAllowed(initialHost:string,nextHost:string,venueName:string){const a=initialHost.toLowerCase().replace(/^www\./,''),b=nextHost.toLowerCase().replace(/^www\./,'');if(a===b||a.endsWith('.'+b)||b.endsWith('.'+a))return true;const as=hostStem(a),bs=hostStem(b);if(as.length>=6&&bs.length>=6&&(as.includes(bs)||bs.includes(as)))return true;return venueTokens(venueName).some(token=>as.includes(token)&&bs.includes(token));}
function isProviderEmail(email:string){const domain=clean(email.split('@')[1]);return Boolean(domain&&providerFor(`https://${domain}`));}
function isPlaceholderEmail(email:string){return PLACEHOLDER_EMAIL.test(clean(email).toLowerCase());}
function errorClass(error:unknown){return error instanceof Error?clean(error.name)||'Error':typeof error}
type FetchDiagnostic={requestedUrl:string,normalizedUrl:string|null,attemptedUrl:string|null,httpStatus:number,errorClass:string|null,reason:string,finalUrl:string|null,redirectChain:{status:number,from:string,to:string}[],contentType:string|null};
async function fetchPage(url:string,venueName:string,identityHost:string,diagnostics:FetchDiagnostic[]){
  const normalized=normalizeWebsite(url);const base:FetchDiagnostic={requestedUrl:url,normalizedUrl:normalized?.toString()||null,attemptedUrl:null,httpStatus:0,errorClass:null,reason:normalized?'NOT_STARTED':'INVALID_URL',finalUrl:null,redirectChain:[],contentType:null};
  if(!normalized){diagnostics.push(base);return null;}
  const original=safeHttpUrl(clean(url));const starts=[normalized.toString()];if(original?.protocol==='http:'&&!starts.includes(original.toString()))starts.push(original.toString());
  const expectedHost=clean(identityHost)||normalized.hostname;let last=base;
  for(const startUrl of starts){
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),FETCH_TIMEOUT_MS);let current=startUrl;const redirectChain:{status:number,from:string,to:string}[]=[];
    try{
      for(let hop=0;hop<=6;hop++){
        const currentUrl=safeHttpUrl(current);if(!currentUrl){last={...base,attemptedUrl:startUrl,reason:'INVALID_REDIRECT_URL',redirectChain};break;}
        const res=await fetch(currentUrl.toString(),{redirect:'manual',signal:controller.signal,headers:{'user-agent':BROWSER_UA,'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','accept-language':'de-DE,de;q=0.9,en;q=0.8,fr;q=0.7','cache-control':'no-cache'}});
        if(res.status>=300&&res.status<400){const location=res.headers.get('location');if(!location){last={...base,attemptedUrl:startUrl,httpStatus:res.status,reason:'REDIRECT_LOCATION_MISSING',finalUrl:currentUrl.toString(),redirectChain};break;}let next:URL;try{next=new URL(location,currentUrl)}catch{last={...base,attemptedUrl:startUrl,httpStatus:res.status,reason:'REDIRECT_LOCATION_INVALID',finalUrl:currentUrl.toString(),redirectChain};break;}if(!safeHttpUrl(next.toString())){last={...base,attemptedUrl:startUrl,httpStatus:res.status,reason:'REDIRECT_TARGET_UNSAFE',finalUrl:next.toString(),redirectChain};break;}redirectChain.push({status:res.status,from:currentUrl.toString(),to:next.toString()});if(!redirectDomainAllowed(expectedHost,next.hostname,venueName)){last={...base,attemptedUrl:startUrl,httpStatus:res.status,reason:'REDIRECT_DOMAIN_IDENTITY_MISMATCH',finalUrl:next.toString(),redirectChain};break;}current=next.toString();if(hop===6)last={...base,attemptedUrl:startUrl,httpStatus:res.status,reason:'TOO_MANY_REDIRECTS',finalUrl:current,redirectChain};continue;}
        const ct=res.headers.get('content-type')||'';const finalUrl=res.url||currentUrl.toString();if(!res.ok){last={...base,attemptedUrl:startUrl,httpStatus:res.status,reason:`HTTP_${res.status}`,finalUrl,redirectChain,contentType:ct||null};break;}if(!ct.toLowerCase().includes('text/html')){last={...base,attemptedUrl:startUrl,httpStatus:res.status,reason:'NON_HTML_RESPONSE',finalUrl,redirectChain,contentType:ct||null};break;}const html=(await res.text()).slice(0,1_000_000);const diag:FetchDiagnostic={...base,attemptedUrl:startUrl,httpStatus:res.status,reason:'OK',finalUrl,redirectChain,contentType:ct||null};diagnostics.push(diag);return {url:finalUrl,html,fetchDiagnostics:diag};
      }
    }catch(error){last={...base,attemptedUrl:startUrl,errorClass:errorClass(error),reason:error instanceof DOMException&&error.name==='AbortError'?'FETCH_TIMEOUT':'FETCH_FAILED',finalUrl:current,redirectChain};}
    finally{clearTimeout(timer);}
  }
  diagnostics.push(last);return null;
}
async function validateHandoff(url:string,venueName:string){
  const u=safeHttpUrl(url);if(!u)return {ok:false,reason:'INVALID_URL',finalUrl:url,status:0};
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);
  try{
    const res=await fetch(u.toString(),{redirect:'follow',signal:controller.signal,headers:{'user-agent':BROWSER_UA,'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','accept-language':'de-DE,de;q=0.9,en;q=0.8,fr;q=0.7'}});
    const finalUrl=res.url||u.toString();
    if([404,410].includes(res.status)||res.status>=500)return {ok:false,reason:`HTTP_${res.status}`,finalUrl,status:res.status};
    if(isLegalUrl(finalUrl))return {ok:false,reason:'LEGAL_REDIRECT',finalUrl,status:res.status};
    if(isNavigationTarget(finalUrl))return {ok:false,reason:'NAVIGATION_REDIRECT',finalUrl,status:res.status};
    if(isNonBookingContent(finalUrl))return {ok:false,reason:'NON_BOOKING_PROVIDER_CONTENT',finalUrl,status:res.status};
    // 401/403/429 can be bot protection while the same URL remains valid in a user's browser.
    if([401,403,429].includes(res.status))return {ok:true,reason:'BOT_PROTECTION_UNVERIFIED',finalUrl,status:res.status};
    if(!res.ok)return {ok:false,reason:`HTTP_${res.status}`,finalUrl,status:res.status};
    const ct=res.headers.get('content-type')||'';
    if(!ct.includes('text/html'))return {ok:true,reason:'REACHABLE_NON_HTML',finalUrl,status:res.status};
    const html=(await res.text()).slice(0,600_000);
    const visible=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
    if(BROKEN_HANDOFF_HINT.test(visible))return {ok:false,reason:'BROKEN_WIDGET_OR_PAGE',finalUrl,status:res.status};
    if(isNonBookingContent(finalUrl,visible))return {ok:false,reason:'NON_BOOKING_PROVIDER_CONTENT',finalUrl,status:res.status};
    const provider=providerFor(finalUrl);
    if(provider==='google_reserve')return {ok:true,reason:'GOOGLE_RESERVE_HANDOFF',finalUrl,status:res.status};
    const providerVenueSpecific=Boolean(provider&&(hasVenueIdentifier(finalUrl)||venueMatch(venueName,finalUrl,visible)));
    if(provider&&!BOOKING_PAGE_EVIDENCE.test(`${finalUrl} ${visible}`)&&!providerVenueSpecific)return {ok:false,reason:'NO_BOOKING_AFFORDANCE',finalUrl,status:res.status};
    if(provider&&!venueMatch(venueName,finalUrl,visible)&&!hasVenueIdentifier(finalUrl)){
      return {ok:false,reason:'VENUE_MISMATCH',finalUrl,status:res.status};
    }
    return {ok:true,reason:'REACHABLE',finalUrl,status:res.status};
  }catch(error){
    // A fetch failure can be provider-side bot blocking. Keep only already venue-specific URLs.
    const venueSpecific=venueMatch(venueName,u.toString())||hasVenueIdentifier(u.toString());
    return {ok:venueSpecific,reason:venueSpecific?'FETCH_UNVERIFIED_VENUE_SPECIFIC':'FETCH_FAILED',finalUrl:u.toString(),status:0};
  }finally{clearTimeout(timer)}
}
function decodeCfEmail(value:string){try{const hex=clean(value);if(hex.length<4||hex.length%2)return'';const key=parseInt(hex.slice(0,2),16);let out='';for(let i=2;i<hex.length;i+=2)out+=String.fromCharCode(parseInt(hex.slice(i,i+2),16)^key);return out}catch{return''}}
function decodedHtml(html:string){
  let value=html.replace(/&#64;|&commat;|\u0040/gi,'@').replace(/&#46;|&period;|\u002e/gi,'.').replace(/\x40/gi,'@').replace(/\x2e/gi,'.');
  value=value.replace(/<a\b[^>]*data-cfemail=["']([0-9a-f]+)["'][^>]*>[\s\S]*?<\/a>/gi,(_,hex)=>decodeCfEmail(hex)||'');
  value=value.replace(/data-cfemail=["']([0-9a-f]+)["']/gi,(_,hex)=>decodeCfEmail(hex)||'');
  return value;
}
function emailsFrom(html:string){
  let decoded=decodedHtml(html);decoded=decoded.replace(/\s*(?:\[at\]|\(at\)|\sat\s)\s*/gi,'@').replace(/\s*(?:\[dot\]|\(dot\)|\sdot\s)\s*/gi,'.');const values=[...(decoded.match(emailRx)||[])];
  for(const m of decoded.matchAll(/mailto:([^"'?#\s>]+)/gi))values.push(decodeURIComponent(m[1]||''));
  for(const m of decoded.matchAll(/(?:data-email|data-contact-email|email)\s*=\s*["']([^"']+@[^^"']+)["']/gi))values.push(m[1]||'');
  for(const m of decoded.matchAll(/["']email["']\s*:\s*["']([^"']+)["']/gi))values.push(m[1]||'');
  return [...new Set(values.map(x=>clean(x).replace(/^mailto:/i,'').replace(/[),.;:]+$/,'').toLowerCase()).filter(x=>validEmail(x)&&!blockedEmail(x)&&!isProviderEmail(x)&&!isPlaceholderEmail(x)))];
}
function resourceLinks(base:string,html:string){
  const out:{url:string,text:string,sameOrigin:boolean,provider:string|null,tag:string}[]=[];const origin=new URL(base).origin;
  const patterns=[
    {tag:'a',rx:/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi},
    {tag:'iframe',rx:/<iframe\b[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi},
    {tag:'form',rx:/<form\b[^>]*action\s*=\s*["']([^"']+)["'][^>]*>/gi}
  ];
  for(const {tag,rx} of patterns){for(const m of html.matchAll(rx)){const href=clean(m[1]);if(!href||href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('#'))continue;try{const u=new URL(href,base);if(!safeHttpUrl(u.toString()))continue;const text=tag==='a'?clean((m[2]||'').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' '):tag;out.push({url:u.toString(),text,sameOrigin:u.origin===origin,provider:providerFor(u.toString()),tag})}catch{}}}
  for(const m of html.matchAll(/<(?:iframe|a|button)\b[^>]*(?:data-src|data-lazy-src|data-href|data-url)\s*=\s*["']([^"']+)["'][^>]*>/gi)){try{const u=new URL(clean(m[1]),base);if(!safeHttpUrl(u.toString()))continue;out.push({url:u.toString(),text:'lazy booking resource',sameOrigin:u.origin===origin,provider:providerFor(u.toString()),tag:'lazy'})}catch{}}
  for(const m of html.matchAll(/(?:window\.open|location(?:\.href)?\s*=)\s*\(?\s*["'](https?:\/\/[^"']+)["']/gi)){try{const u=new URL(clean(m[1]));if(!safeHttpUrl(u.toString()))continue;out.push({url:u.toString(),text:'script booking target',sameOrigin:u.origin===origin,provider:providerFor(u.toString()),tag:'script'})}catch{}}
  for(const m of html.matchAll(/["'](?:target|url)["']\s*:\s*["'](https?:\/\/[^"']+)["']/gi)){try{const u=new URL(clean(m[1]).replace(/\\\//g,'/'));if(!safeHttpUrl(u.toString()))continue;if(!providerFor(u.toString())&&!hasReservationIntent(u.toString()))continue;out.push({url:u.toString(),text:'structured booking action',sameOrigin:u.origin===origin,provider:providerFor(u.toString()),tag:'jsonld'})}catch{}}
  for(const m of html.matchAll(/\b(?:data-booking-url|data-reservation-url|data-widget-url|data-booking|data-reservation|data-url)\s*=\s*["']([^"']+)["']/gi)){try{const u=new URL(clean(m[1]),base);if(!safeHttpUrl(u.toString()))continue;out.push({url:u.toString(),text:'booking widget',sameOrigin:u.origin===origin,provider:providerFor(u.toString()),tag:'data'})}catch{}}
  for(const m of html.matchAll(/(?:bookingUrl|booking_url|reservationUrl|reservation_url|widgetUrl|widget_url|reserveUrl|reserve_url)\s*["']?\s*[:=]\s*["'](https?:\/\/[^"'\s<>]+)["']/gi)){try{const u=new URL(clean(m[1]).replace(/\\\//g,'/'));if(!safeHttpUrl(u.toString()))continue;const provider=providerFor(u.toString());if(!provider&&!hasReservationIntent(u.toString()))continue;out.push({url:u.toString(),text:'embedded booking config',sameOrigin:u.origin===origin,provider,tag:'config'})}catch{}}
  return out.filter((v,i,a)=>a.findIndex(x=>x.url===v.url&&x.tag===v.tag)===i);
}
function crawlLinks(base:string,html:string){return [...new Set(resourceLinks(base,html).filter(x=>x.sameOrigin&&!isNavigationTarget(x.url,x.text)&&(hasReservationIntent(x.url,x.text)||/(contact|kontakt|contactez|contacter|nous[-_ ]?contacter|impressum|imprint|privacy|confidentialit|mentions[-_ ]?legales|legal|about|propos|restaurants?|locations?|adresses?|reservation|réservation)/i.test(`${x.url} ${x.text}`))).map(x=>x.url))].slice(0,12)}
function guessedDiscoveryPages(base:string){const origin=new URL(base).origin;return ['/contact','/contact-us','/contactez-nous','/nous-contacter','/reservation','/reservations','/booking','/book','/restaurants','/locations','/adresses'].map(p=>origin+p)}
function detectedEngines(page:{url:string,html:string}){
  const ids=new Set<string>();
  for(const link of resourceLinks(page.url,page.html)){const p=link.provider||providerFor(link.url);if(p)ids.add(p);}
  for(const m of page.html.matchAll(/<script\b[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi)){try{const u=new URL(clean(m[1]),page.url);const p=providerFor(u.toString());if(p)ids.add(p)}catch{}}
  return [...ids];
}
function candidatesFromPage(page:{url:string,html:string},venueName:string){
  const out:Candidate[]=[];const baseOrigin=new URL(page.url).origin;
  for(const link of resourceLinks(page.url,page.html)){
    if(isLegalUrl(link.url)||isNavigationTarget(link.url,link.text)||isNonBookingContent(link.url,link.text))continue;
    const intent=hasReservationIntent(link.url,link.text);const venueSpecific=venueMatch(venueName,link.url,link.text)||hasVenueIdentifier(link.url);
    if(link.provider&&acceptableProviderLink(link.url,link.text,venueName)){
      const score=100+(venueSpecific?8:0)+(intent?4:0)+(link.tag==='iframe'||link.tag==='data'?2:0);
      out.push({kind:'booking_provider',provider:link.provider,contactValue:link.url,sourceUrl:page.url,isOfficial:false,confidence:Math.min(0.995,0.94+score/2000),score,evidence:{method:'official_site_provider_link',anchorText:link.text,provider:link.provider,venueSpecific,reservationIntent:intent,tag:link.tag}});continue;
    }
    if(link.sameOrigin&&intent){out.push({kind:'reservation_link',provider:'official_website',contactValue:link.url,sourceUrl:page.url,isOfficial:true,confidence:0.95,score:90+(venueSpecific?5:0),evidence:{method:'official_site_reservation_link',anchorText:link.text,venueSpecific,tag:link.tag}});continue;}
    if(!link.sameOrigin&&intent&&(!BLOCKED_EXTERNAL.test(link.url)||isGoogleReserve(link.url))){out.push({kind:'reservation_link',provider:isGoogleReserve(link.url)?'google_reserve':new URL(link.url).hostname.replace(/^www\./,''),contactValue:link.url,sourceUrl:page.url,isOfficial:false,confidence:0.91,score:82+(venueSpecific?5:0),evidence:{method:'official_site_external_booking_link',anchorText:link.text,venueSpecific,tag:link.tag}})}
  }
  return out.filter((v,i,a)=>a.findIndex(x=>x.kind===v.kind&&x.contactValue===v.contactValue)===i&&new URL(v.sourceUrl).origin===baseOrigin);
}
function bestCandidate(candidates:Candidate[]){return [...candidates].sort((a,b)=>b.score-a.score||b.confidence-a.confidence)[0]||null}
async function discoverRoute(input:{name:string,website:string,reservationUrl?:string,placeType?:string,contactEmail?:string}){
  const venueName=clean(input.name);const placeType=clean(input.placeType).toLowerCase();const fetchDiagnostics:FetchDiagnostic[]=[];const existingContact=clean(input.contactEmail).toLowerCase();
  const baseResult={fetchDiagnostics,existingContactPresent:Boolean(existingContact),existingContactVerified:false,googleReserveDetected:false,googlePartnerIdentified:null as string|null,googleExternalBookingLink:null as string|null,googleDirectIntegration:false};
  if(placeType&&placeType!=='restaurant')return {...baseResult,resolved:false,reason:'PLACE_TYPE_NOT_SUPPORTED_YET',pages:[],candidates:[] as Candidate[],rejected:[] as {url:string,reason:string,status:number}[],enginesDetected:[] as string[]};
  const rejected:{url:string,reason:string,status:number}[]=[];const engines=new Set<string>();
  const existing=clean(input.reservationUrl);const direct=normalizeWebsite(existing);
  if(direct&&!isLegalUrl(direct.toString())&&!isNavigationTarget(direct.toString(),'direct reservation url')&&!isNonBookingContent(direct.toString())){
    const initialProvider=providerFor(direct.toString());const intent=hasReservationIntent(direct.toString());
    if((initialProvider&&acceptableProviderLink(direct.toString(),'direct reservation url',venueName))||intent){
      const health=await validateHandoff(direct.toString(),venueName);const finalProvider=providerFor(health.finalUrl)||initialProvider;const googleDetected=initialProvider==='google_reserve'||isGoogleReserve(direct.toString());const partner=googleDetected&&finalProvider&&finalProvider!=='google_reserve'?finalProvider:null;
      if(health.ok)return {...baseResult,resolved:true,channel:'external_link',provider:partner||finalProvider||'official_website',value:health.finalUrl,kind:(partner||finalProvider)?'booking_provider':'reservation_link',reason:googleDetected?'GOOGLE_RESERVE_HANDOFF':'DIRECT_RESERVATION_URL',pages:[],candidates:[] as Candidate[],rejected,enginesDetected:[...new Set([initialProvider,finalProvider].filter(Boolean) as string[])],googleReserveDetected:googleDetected,googlePartnerIdentified:partner,googleExternalBookingLink:googleDetected?health.finalUrl:null};
      rejected.push({url:direct.toString(),reason:health.reason,status:health.status});
    }
  }
  const official=normalizeWebsite(clean(input.website));if(!official)return {...baseResult,resolved:false,reason:'OFFICIAL_WEBSITE_MISSING',pages:[],candidates:[] as Candidate[],rejected,enginesDetected:[] as string[]};
  const first=await fetchPage(official.toString(),venueName,official.hostname,fetchDiagnostics);if(!first)return {...baseResult,resolved:false,reason:'OFFICIAL_WEBSITE_FETCH_FAILED',pages:[],candidates:[] as Candidate[],rejected,enginesDetected:[] as string[],httpStatus:fetchDiagnostics.at(-1)?.httpStatus||0,finalUrl:fetchDiagnostics.at(-1)?.finalUrl||null,errorClass:fetchDiagnostics.at(-1)?.errorClass||null,reasonDetails:fetchDiagnostics.at(-1)?.reason||'FETCH_FAILED'};
  const pages=[first];for(const id of detectedEngines(first))engines.add(id);const candidates:Candidate[]=[];let existingContactVerified=false;
  const collect=(page:{url:string,html:string,fetchDiagnostics?:FetchDiagnostic})=>{
    candidates.push(...candidatesFromPage(page,venueName));
    for(const email of emailsFrom(page.html)){const kind=isReservationEmail(email)?'public_reservation_email':'public_contact_email';const isExisting=Boolean(existingContact)&&email===existingContact;if(isExisting)existingContactVerified=true;candidates.push({kind,provider:'official_website',contactValue:email,sourceUrl:page.url,isOfficial:true,confidence:kind==='public_reservation_email'?0.96:0.9,score:(kind==='public_reservation_email'?60:50)+(isExisting?8:0),evidence:{method:'official_site_html',page:page.url,venueOwnership:'explicitly_published_on_source',existingBookingContactMatch:isExisting,redirectChain:page.fetchDiagnostics?.redirectChain||[]}})};
  };
  const tryExternal=async()=>{const uniqueNow=candidates.filter((v,i,a)=>a.findIndex(x=>x.kind===v.kind&&x.contactValue===v.contactValue)===i);const external=[...uniqueNow].filter(c=>c.kind==='booking_provider'||c.kind==='reservation_link').sort((a,b)=>b.score-a.score||b.confidence-a.confidence);for(const candidate of external){const health=await validateHandoff(candidate.contactValue,venueName);const finalProvider=providerFor(health.finalUrl)||candidate.provider;const googleDetected=candidate.provider==='google_reserve'||isGoogleReserve(candidate.contactValue);const partner=googleDetected&&finalProvider&&finalProvider!=='google_reserve'?finalProvider:null;candidate.evidence={...candidate.evidence,handoffValidation:health.reason,handoffStatus:health.status,finalUrl:health.finalUrl,googleReserveDetected:googleDetected,googlePartnerIdentified:partner,...(googleDetected?{googleReserveUrl:candidate.contactValue}: {})};if(health.ok){if(partner){candidate.provider=partner;candidate.contactValue=health.finalUrl;}return {candidate,health,uniqueNow,googleDetected,partner};}rejected.push({url:candidate.contactValue,reason:health.reason,status:health.status})}return null};
  collect(first);
  const immediate=await tryExternal();if(immediate)return {...baseResult,resolved:true,channel:'external_link',provider:immediate.candidate.provider,value:immediate.health.finalUrl,kind:immediate.candidate.kind,reason:immediate.googleDetected?'GOOGLE_RESERVE_HANDOFF':'VERIFIED_BOOKING_ROUTE_FAST',pages,candidates:immediate.uniqueNow,best:immediate.candidate,rejected,enginesDetected:[...engines],existingContactVerified,googleReserveDetected:immediate.googleDetected||engines.has('google_reserve'),googlePartnerIdentified:immediate.partner,googleExternalBookingLink:immediate.googleDetected?immediate.health.finalUrl:null};
  const crawl=[...new Set([...crawlLinks(first.url,first.html),...guessedDiscoveryPages(first.url)])].slice(0,16);const extra=(await Promise.all(crawl.map(link=>fetchPage(link,venueName,new URL(first.url).hostname,fetchDiagnostics)))).filter(Boolean) as {url:string,html:string,fetchDiagnostics:FetchDiagnostic}[];for(const page of extra){pages.push(page);for(const id of detectedEngines(page))engines.add(id);collect(page)}
  const afterCrawl=await tryExternal();if(afterCrawl)return {...baseResult,resolved:true,channel:'external_link',provider:afterCrawl.candidate.provider,value:afterCrawl.health.finalUrl,kind:afterCrawl.candidate.kind,reason:afterCrawl.googleDetected?'GOOGLE_RESERVE_HANDOFF':'VERIFIED_BOOKING_ROUTE',pages,candidates:afterCrawl.uniqueNow,best:afterCrawl.candidate,rejected,enginesDetected:[...engines],existingContactVerified,googleReserveDetected:afterCrawl.googleDetected||engines.has('google_reserve'),googlePartnerIdentified:afterCrawl.partner,googleExternalBookingLink:afterCrawl.googleDetected?afterCrawl.health.finalUrl:null};
  const unique=candidates.filter((v,i,a)=>a.findIndex(x=>x.kind===v.kind&&x.contactValue===v.contactValue)===i);const emailCandidates=unique.filter(c=>c.kind==='public_reservation_email'||c.kind==='public_contact_email');const bestEmail=bestCandidate(emailCandidates);
  if(bestEmail)return {...baseResult,resolved:true,channel:'email',provider:bestEmail.provider,value:bestEmail.contactValue,kind:bestEmail.kind,reason:'VERIFIED_EMAIL_FALLBACK',pages,candidates:unique,best:bestEmail,rejected,enginesDetected:[...engines],existingContactVerified,googleReserveDetected:engines.has('google_reserve')};
  return {...baseResult,resolved:false,reason:rejected.length?'NO_HEALTHY_BOOKING_ROUTE':'NO_VERIFIED_ROUTE',pages,candidates:unique,rejected,enginesDetected:[...engines],existingContactVerified,googleReserveDetected:engines.has('google_reserve')};
}

Deno.serve(async(req)=>{
  const requestOrigin=resolveOrigin(req.headers.get('Origin'));
  const reply=(data:unknown,status=200)=>json(data,status,requestOrigin);
  if(req.method==='OPTIONS')return new Response(null,{status:requestOrigin?204:403,headers:corsHeaders(requestOrigin)});
  try{
    if(!requestOrigin)return reply({error:'ORIGIN_NOT_ALLOWED'},403);
    if(req.method!=='POST')return reply({error:'METHOD_NOT_ALLOWED'},405);
    const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');if(!url||!anon||!service)return reply({error:'SUPABASE_ENV_MISSING'},500);
    const authorization=req.headers.get('Authorization')||'';if(!authorization)return reply({error:'AUTH_REQUIRED'},401);
    const userClient=createClient(url,anon,{global:{headers:{Authorization:authorization}}});const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
    const body=await req.json().catch(()=>({}));const bookingId=clean(body.bookingId);

    // Preview mode: resolve the route before Luvia shows an e-mail fallback form.
    if(!bookingId){
      const place=body.place||{};const name=clean(place.name);const placeType=clean(place.placeType||place.type);const website=clean(place.website);const reservationUrl=clean(place.reservationUrl||place.bookingUrl||place.googleReserveUrl||place.google_reserve_url||place.googleMapsBookingUrl);
      if(!name)return reply({error:'PLACE_NAME_REQUIRED'},400);
      const discovered:any=await discoverRoute({name,placeType,website,reservationUrl,contactEmail:clean(place.email||place.contactEmail||place.contact_email)});
      return reply({ok:true,resolved:discovered.resolved,channel:(discovered as any).channel||null,provider:(discovered as any).provider||null,value:(discovered as any).value||null,kind:(discovered as any).kind||null,reason:discovered.reason,pagesChecked:discovered.pages.length,candidatesFound:discovered.candidates.length,rejectedRoutes:discovered.rejected?.length||0,enginesDetected:(discovered as any).enginesDetected||[],googleReserveDetected:Boolean((discovered as any).googleReserveDetected),googlePartnerIdentified:(discovered as any).googlePartnerIdentified||null,googleExternalBookingLink:(discovered as any).googleExternalBookingLink||null,googleDirectIntegration:false,existingContactPresent:Boolean((discovered as any).existingContactPresent),existingContactVerified:Boolean((discovered as any).existingContactVerified),fetchDiagnostics:(discovered as any).fetchDiagnostics||[],httpStatus:(discovered as any).httpStatus||((discovered as any).fetchDiagnostics||[])[0]?.httpStatus||0,finalUrl:(discovered as any).finalUrl||((discovered as any).pages||[])[0]?.url||null,errorClass:(discovered as any).errorClass||null,reasonDetails:(discovered as any).reasonDetails||null,resolverVersion:VERSION});
    }

    const {data:booking,error}=await userClient.from('bookings').select('*').eq('id',bookingId).single();if(error||!booking)return reply({error:'BOOKING_NOT_FOUND_OR_FORBIDDEN'},404);
    const existingUrl=clean(booking.contact?.bookingUrl||booking.contact?.booking_url||booking.request?.reservationUrl||booking.request?.googleReserveUrl||booking.metadata?.googleReserveUrl);
    const discovered:any=await discoverRoute({name:clean(booking.title),placeType:clean(booking.request?.sourcePlaceType||booking.booking_type),website:clean(booking.contact?.website||booking.request?.website||booking.metadata?.website),reservationUrl:existingUrl,contactEmail:clean(booking.contact?.email)});

    const {data:run,error:runError}=await admin.from('booking_discovery_runs').insert({booking_id:booking.id,trip_id:booking.trip_id,status:'running',resolver_version:VERSION}).select('*').single();if(runError)return reply({error:'DISCOVERY_RUN_CREATE_FAILED',details:runError.message},500);
    if(!discovered.pages.length&&!discovered.candidates.length){await admin.from('booking_discovery_runs').update({status:discovered.resolved?'completed':'failed',finished_at:new Date().toISOString(),error:discovered.resolved?null:{reason:discovered.reason}}).eq('id',run.id)}
    let candidateCount=0;const seen=new Set<string>();
    const push=async(c:Candidate)=>{const key=`${c.kind}|${c.contactValue}|${c.sourceUrl}`;if(seen.has(key))return;seen.add(key);candidateCount++;const {error:candidateError}=await admin.rpc('luvia_booking_upsert_candidate',{p_booking_id:booking.id,p_discovery_run_id:run.id,p_kind:c.kind,p_provider:c.provider,p_contact_value:c.contactValue,p_source_url:c.sourceUrl,p_is_public:true,p_is_official:c.isOfficial,p_verification_status:'verified',p_confidence:c.confidence,p_evidence:{...c.evidence,venueVerified:true,score:c.score},p_metadata:{resolver:'booking-route-resolve',resolverVersion:VERSION}});if(candidateError)console.warn('candidate upsert failed',candidateError.message)};
    for(const c of discovered.candidates)await push(c);

    // Direct URL candidates may not require a website crawl; persist them explicitly.
    if(discovered.resolved&&discovered.channel==='external_link'&&discovered.value&&!discovered.candidates.some(c=>c.contactValue===discovered.value)){
      await push({kind:discovered.kind||'reservation_link',provider:discovered.provider||'official_website',contactValue:discovered.value,sourceUrl:clean(booking.contact?.website||booking.request?.website||discovered.value),isOfficial:discovered.provider==='official_website',confidence:0.99,score:110,evidence:{method:'direct_reservation_url',venueVerified:true}})
    }
    if(discovered.resolved&&discovered.channel==='email'&&discovered.value&&!discovered.candidates.some(c=>c.contactValue===discovered.value)){
      await push({kind:discovered.kind||'public_contact_email',provider:discovered.provider||'official_website',contactValue:discovered.value,sourceUrl:clean(booking.contact?.website||booking.request?.website||''),isOfficial:true,confidence:0.95,score:55,evidence:{method:'verified_email_fallback'}})
    }

    const {data:resolution,error:resolveError}=await admin.rpc('luvia_booking_resolve_channel',{p_booking_id:booking.id,p_discovery_run_id:run.id});if(resolveError)return reply({error:'CHANNEL_RESOLUTION_FAILED',details:resolveError.message},500);
    return reply({ok:true,...(resolution||{}),pagesChecked:discovered.pages.length,candidatesFound:candidateCount,resolverVersion:VERSION,venueVerified:true,enginesDetected:(discovered as any).enginesDetected||[],googleReserveDetected:Boolean((discovered as any).googleReserveDetected),googlePartnerIdentified:(discovered as any).googlePartnerIdentified||null,googleExternalBookingLink:(discovered as any).googleExternalBookingLink||null,googleDirectIntegration:false,existingContactPresent:Boolean((discovered as any).existingContactPresent),existingContactVerified:Boolean((discovered as any).existingContactVerified),fetchDiagnostics:(discovered as any).fetchDiagnostics||[],httpStatus:(discovered as any).httpStatus||((discovered as any).fetchDiagnostics||[])[0]?.httpStatus||0,finalUrl:(discovered as any).finalUrl||((discovered as any).pages||[])[0]?.url||null,errorClass:(discovered as any).errorClass||null,reasonDetails:(discovered as any).reasonDetails||null});
  }catch(error){return reply({error:'BOOKING_ROUTE_RESOLVE_UNHANDLED',details:error instanceof Error?error.message:String(error)},500)}
});
