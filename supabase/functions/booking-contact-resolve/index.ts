import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VERSION='1.5.0';
const FETCH_TIMEOUT_MS=6500;
const MAX_REDIRECTS=6;
const BROWSER_UA='Mozilla/5.0 (compatible; LuviaBooking/1.5; +https://myluvia.app) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151 Safari/537.36';
const corsHeaders={
  'Access-Control-Allow-Origin':'https://myluvia.app',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Vary':'Origin'
};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...corsHeaders,'content-type':'application/json; charset=utf-8'}});
const clean=(v:unknown)=>String(v??'').trim();
const emailRx=/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const validEmail=(v:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const blockedEmail=(v:string)=>/(no-?reply|noreply|example\.|wixpress|sentry|cloudflare)/i.test(v);
const isReservationEmail=(v:string)=>/(reserv|booking|table|restaurant|hotel|room|stay|ticket|event|visit|tour|guest|contact|info)/i.test(v.split('@')[0]||'');
const PROVIDER_HOSTS=['zenchef.com','thefork.com','thefork.fr','thefork.de','lafourchette.com','opentable.com','sevenrooms.com','resy.com','exploretock.com','tockhq.com','quandoo.com','formitable.com','resdiary.com','covermanager.com','simpleerb.com','tablecheck.com','booking.com','bstatic.com','expedia.com','hotels.com','vrbo.com','agoda.com','trip.com','tiqets.com','viator.com','getyourguide.com','ticketmaster.com','eventim.de','reservix.de'];
const hostMatches=(host:string,base:string)=>host===base||host.endsWith('.'+base);
const isProviderHost=(host:string)=>PROVIDER_HOSTS.some(x=>hostMatches(host.toLowerCase(),x));
const emailDomain=(email:string)=>clean(email.split('@')[1]).toLowerCase();
const isProviderEmail=(email:string)=>PROVIDER_HOSTS.some(x=>hostMatches(emailDomain(email),x));
const PLACEHOLDER_DOMAINS=new Set(['example.com','example.org','example.net','domain.com','domain.org','domain.net','domaine.com','domaine.fr','example.fr','example.de']);
const PLACEHOLDER_LOCALS=new Set(['user','username','utilisateur','name','nom','email','e-mail','mail','test','testing','example','exemple','yourname','your.name','votrenom','votre.nom','firstname','lastname','first.last']);
const isPlaceholderEmail=(email:string)=>{const e=clean(email).toLowerCase();const [local='',domain='']=e.split('@');return PLACEHOLDER_DOMAINS.has(domain)||PLACEHOLDER_LOCALS.has(local)||/^(user|username|utilisateur|example|exemple|test|testing)[._+-]?[0-9]*$/i.test(local);};

type FetchDiagnostic={requestedUrl:string,normalizedUrl:string|null,attemptedUrl:string|null,httpStatus:number,errorClass:string|null,reason:string,finalUrl:string|null,redirectChain:{status:number,from:string,to:string}[],contentType:string|null};
type Page={url:string,html:string,diagnostics:FetchDiagnostic};

function safeHttpUrl(value:string){
  try{
    const u=new URL(value);
    if(!['http:','https:'].includes(u.protocol))return null;
    const h=u.hostname.toLowerCase();
    if(h==='localhost'||h==='::1'||h.endsWith('.local')||/^127\./.test(h)||/^10\./.test(h)||/^192\.168\./.test(h)||/^169\.254\./.test(h)||/^172\.(1[6-9]|2\d|3[01])\./.test(h))return null;
    return u;
  }catch{return null;}
}
function normalizeWebsite(value:string){
  let raw=clean(value);
  if(!raw)return null;
  if(raw.startsWith('//'))raw='https:'+raw;
  if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw))raw='https://'+raw;
  const u=safeHttpUrl(raw);if(!u)return null;
  if(u.protocol==='http:')u.protocol='https:';
  return u;
}
function registrableLabel(host:string){const parts=host.toLowerCase().replace(/^www\./,'').split('.').filter(Boolean);if(parts.length<2)return (parts[0]||'').replace(/[^a-z0-9]/g,'');const second=parts.at(-2)||'';const top=parts.at(-1)||'';const countrySecond=new Set(['co','com','org','net','gov','ac']);const label=(top.length===2&&countrySecond.has(second)&&parts.length>=3)?parts.at(-3):second;return clean(label).replace(/[^a-z0-9]/g,'')}
function hostStem(host:string){return registrableLabel(host)}
function venueTokens(name:string){return clean(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>=5)}
function redirectDomainAllowed(initialHost:string,nextHost:string,venueName:string){
  const a=initialHost.toLowerCase().replace(/^www\./,''),b=nextHost.toLowerCase().replace(/^www\./,'');
  if(a===b||a.endsWith('.'+b)||b.endsWith('.'+a))return true;
  const as=hostStem(a),bs=hostStem(b);
  if(as.length>=6&&bs.length>=6&&(as.includes(bs)||bs.includes(as)))return true;
  const tokens=venueTokens(venueName);
  return tokens.some(token=>as.includes(token)&&bs.includes(token));
}
function errorClass(error:unknown){return error instanceof Error?clean(error.name)||'Error':typeof error}

async function fetchPage(url:string,venueName:string,identityHost?:string):Promise<{page:Page|null,diagnostics:FetchDiagnostic}> {
  const normalized=normalizeWebsite(url);
  const baseDiagnostic:FetchDiagnostic={requestedUrl:url,normalizedUrl:normalized?.toString()||null,attemptedUrl:null,httpStatus:0,errorClass:null,reason:normalized?'NOT_STARTED':'INVALID_URL',finalUrl:null,redirectChain:[],contentType:null};
  if(!normalized)return {page:null,diagnostics:baseDiagnostic};
  const original=safeHttpUrl(clean(url));
  const starts=[normalized.toString()];
  if(original?.protocol==='http:'&&!starts.includes(original.toString()))starts.push(original.toString());
  const expectedHost=clean(identityHost)||normalized.hostname;
  let last={...baseDiagnostic};
  for(const start of starts){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),FETCH_TIMEOUT_MS);
    let current=start;
    const redirectChain:{status:number,from:string,to:string}[]=[];
    try{
      for(let hop=0;hop<=MAX_REDIRECTS;hop++){
        const currentUrl=safeHttpUrl(current);
        if(!currentUrl){last={...baseDiagnostic,attemptedUrl:current,reason:'INVALID_REDIRECT_URL',redirectChain};break;}
        const res=await fetch(currentUrl.toString(),{redirect:'manual',signal:controller.signal,headers:{'user-agent':BROWSER_UA,'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','accept-language':'de-DE,de;q=0.9,en;q=0.8,fr;q=0.7','cache-control':'no-cache'}});
        const status=res.status;
        if(status>=300&&status<400){
          const location=res.headers.get('location');
          if(!location){last={...baseDiagnostic,attemptedUrl:start,httpStatus:status,reason:'REDIRECT_LOCATION_MISSING',finalUrl:currentUrl.toString(),redirectChain};break;}
          let next:URL;try{next=new URL(location,currentUrl)}catch{last={...baseDiagnostic,attemptedUrl:start,httpStatus:status,reason:'REDIRECT_LOCATION_INVALID',finalUrl:currentUrl.toString(),redirectChain};break;}
          if(!safeHttpUrl(next.toString())){last={...baseDiagnostic,attemptedUrl:start,httpStatus:status,reason:'REDIRECT_TARGET_UNSAFE',finalUrl:currentUrl.toString(),redirectChain};break;}
          if(!redirectDomainAllowed(expectedHost,next.hostname,venueName)){
            redirectChain.push({status,from:currentUrl.toString(),to:next.toString()});
            last={...baseDiagnostic,attemptedUrl:start,httpStatus:status,reason:'REDIRECT_DOMAIN_IDENTITY_MISMATCH',finalUrl:next.toString(),redirectChain};break;
          }
          redirectChain.push({status,from:currentUrl.toString(),to:next.toString()});
          current=next.toString();
          if(hop===MAX_REDIRECTS)last={...baseDiagnostic,attemptedUrl:start,httpStatus:status,reason:'TOO_MANY_REDIRECTS',finalUrl:current,redirectChain};
          continue;
        }
        const ct=res.headers.get('content-type')||'';
        const finalUrl=res.url||currentUrl.toString();
        if(!res.ok){last={...baseDiagnostic,attemptedUrl:start,httpStatus:status,reason:`HTTP_${status}`,finalUrl,redirectChain,contentType:ct||null};break;}
        if(!ct.toLowerCase().includes('text/html')){last={...baseDiagnostic,attemptedUrl:start,httpStatus:status,reason:'NON_HTML_RESPONSE',finalUrl,redirectChain,contentType:ct||null};break;}
        const html=(await res.text()).slice(0,1_000_000);
        const diagnostics:FetchDiagnostic={...baseDiagnostic,attemptedUrl:start,httpStatus:status,reason:'OK',finalUrl,redirectChain,contentType:ct||null};
        return {page:{url:finalUrl,html,diagnostics},diagnostics};
      }
    }catch(error){last={...baseDiagnostic,attemptedUrl:start,errorClass:errorClass(error),reason:error instanceof DOMException&&error.name==='AbortError'?'FETCH_TIMEOUT':'FETCH_FAILED',finalUrl:current,redirectChain};}
    finally{clearTimeout(timer);}
  }
  return {page:null,diagnostics:last};
}

function decodeCfEmail(value:string){
  try{const hex=clean(value);if(hex.length<4||hex.length%2)return'';const key=parseInt(hex.slice(0,2),16);let out='';for(let i=2;i<hex.length;i+=2)out+=String.fromCharCode(parseInt(hex.slice(i,i+2),16)^key);return out;}catch{return'';}
}
function emailsFrom(html:string){
  let decoded=html.replace(/&#64;|&commat;|\\u0040/gi,'@').replace(/&#46;|&period;|\\u002e/gi,'.').replace(/\\x40/gi,'@').replace(/\\x2e/gi,'.');
  decoded=decoded.replace(/\s*(?:\[at\]|\(at\)|\sat\s)\s*/gi,'@').replace(/\s*(?:\[dot\]|\(dot\)|\sdot\s)\s*/gi,'.');
  decoded=decoded.replace(/data-cfemail=["']([0-9a-f]+)["']/gi,(_,hex)=>decodeCfEmail(hex)||'');
  const values=[...(decoded.match(emailRx)||[])];
  for(const m of decoded.matchAll(/mailto:([^"'?#\s>]+)/gi))values.push(decodeURIComponent(m[1]||''));
  for(const m of decoded.matchAll(/["']email["']\s*:\s*["']([^"']+)["']/gi))values.push(m[1]||'');
  for(const m of decoded.matchAll(/(?:email|contactEmail|contact_email)\s*["']?\s*[:=]\s*["']([^"']+@[^"']+)["']/gi))values.push(m[1]||'');
  return [...new Set(values.map(x=>clean(x).replace(/^mailto:/i,'').replace(/[),.;:]+$/,'').toLowerCase()).filter(x=>validEmail(x)&&!blockedEmail(x)))];
}
function candidateLinks(base:string,html:string){
  const out:string[]=[];const origin=new URL(base).origin;
  for(const m of html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)){
    const href=clean(m[1]);if(!href||href.startsWith('mailto:'))continue;
    try{const u=new URL(href,base);if(u.origin!==origin)continue;if(!/(contact|kontakt|contactez|contacter|nous[-_ ]?contacter|reservation|reserv|réserv|booking|book|restaurants?|locations?|adresses?|impressum|imprint|privacy|legal|mentions|confidentialit|about|propos)/i.test(u.pathname+u.search+href))continue;if(safeHttpUrl(u.toString()))out.push(u.toString());}catch{}
  }
  return [...new Set(out)].slice(0,16);
}
function guessedVenuePages(base:string){
  const origin=new URL(base).origin;
  return ['/contact','/contact/','/contact-us','/contactez-nous','/nous-contacter','/reservation','/reservations','/booking','/book','/restaurants','/restaurants/','/locations','/adresses']
    .map(path=>origin+path).filter(url=>Boolean(safeHttpUrl(url)));
}
function rejectReason(email:string,pageUrl:string){
  const page=safeHttpUrl(pageUrl);
  if(isPlaceholderEmail(email))return 'PLACEHOLDER_EMAIL';
  if(isProviderEmail(email))return 'BOOKING_PROVIDER_EMAIL_DOMAIN';
  if(page&&isProviderHost(page.hostname)&&emailDomain(email)===page.hostname.toLowerCase())return 'BOOKING_PROVIDER_CONTACT';
  return null;
}

Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:corsHeaders});
  try{
    if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
    const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if(!url||!anon||!service)return json({error:'SUPABASE_ENV_MISSING'},500);
    const authorization=req.headers.get('Authorization')||'';if(!authorization)return json({error:'AUTH_REQUIRED'},401);
    const userClient=createClient(url,anon,{global:{headers:{Authorization:authorization}}});
    const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
    const body=await req.json().catch(()=>({}));const bookingId=clean(body.bookingId);if(!bookingId)return json({error:'BOOKING_ID_REQUIRED'},400);
    const {data:booking,error}=await userClient.from('bookings').select('*').eq('id',bookingId).single();if(error||!booking)return json({error:'BOOKING_NOT_FOUND_OR_FORBIDDEN'},404);

    const existing=clean(booking.contact?.email).toLowerCase();
    if(existing&&(isProviderEmail(existing)||isPlaceholderEmail(existing))){
      const sanitizedContact={...(booking.contact||{})};delete sanitizedContact.email;
      await admin.from('bookings').update({contact:sanitizedContact,updated_at:new Date().toISOString()}).eq('id',booking.id);
    }
    const legacyEmail=(existing&&!isProviderEmail(existing)&&!isPlaceholderEmail(existing)&&validEmail(existing))?existing:'';
    const website=clean(booking.contact?.website||booking.request?.website||booking.metadata?.website);
    const official=normalizeWebsite(website);
    if(!official)return json({ok:true,resolved:false,reason:legacyEmail?'LEGACY_CONTACT_REQUIRES_OFFICIAL_VERIFICATION':'OFFICIAL_WEBSITE_MISSING',legacyContactPresent:Boolean(legacyEmail),legacyContactVerified:false,resolverVersion:VERSION,fetchDiagnostics:[]});

    const {data:run,error:runError}=await admin.from('booking_discovery_runs').insert({booking_id:booking.id,trip_id:booking.trip_id,status:'running',resolver_version:VERSION}).select('*').single();
    if(runError)return json({error:'DISCOVERY_RUN_CREATE_FAILED',details:runError.message},500);

    const firstFetch=await fetchPage(official.toString(),clean(booking.title),official.hostname);
    if(!firstFetch.page){
      await admin.from('booking_discovery_runs').update({status:'failed',finished_at:new Date().toISOString(),error:{reason:'OFFICIAL_WEBSITE_FETCH_FAILED',fetch:firstFetch.diagnostics}}).eq('id',run.id);
      return json({ok:true,resolved:false,reason:'OFFICIAL_WEBSITE_FETCH_FAILED',legacyContactPresent:Boolean(legacyEmail),legacyContactVerified:false,resolverVersion:VERSION,fetchDiagnostics:[firstFetch.diagnostics],httpStatus:firstFetch.diagnostics.httpStatus,finalUrl:firstFetch.diagnostics.finalUrl,errorClass:firstFetch.diagnostics.errorClass,reasonDetails:firstFetch.diagnostics.reason});
    }

    const first=firstFetch.page;const pages:Page[]=[first];const fetchDiagnostics:FetchDiagnostic[]=[first.diagnostics];
    const discoveryUrls=[...new Set([...candidateLinks(first.url,first.html),...guessedVenuePages(first.url)])].slice(0,18);
    const extra=await Promise.all(discoveryUrls.map(link=>fetchPage(link,clean(booking.title),new URL(first.url).hostname)));
    const pageSeen=new Set([first.url]);
    for(const item of extra){fetchDiagnostics.push(item.diagnostics);const page=item.page;if(!page||pageSeen.has(page.url))continue;pageSeen.add(page.url);pages.push(page);if(pages.length>=14)break;}

    const seen=new Set<string>();const rejected:{email:string,reason:string,sourceUrl:string}[]=[];
    let legacyContactVerified=false,legacyCandidateId:string|null=null,legacySourceUrl:string|null=null;
    for(const page of pages){
      for(const email of emailsFrom(page.html)){
        if(seen.has(email))continue;seen.add(email);
        const rejection=rejectReason(email,page.url);if(rejection){rejected.push({email,reason:rejection,sourceUrl:page.url});continue;}
        const kind=isReservationEmail(email)?'public_reservation_email':'public_contact_email';const isLegacyMatch=Boolean(legacyEmail)&&email===legacyEmail;
        const {data:candidateId,error:candidateError}=await admin.rpc('luvia_booking_upsert_candidate',{p_booking_id:booking.id,p_discovery_run_id:run.id,p_kind:kind,p_provider:'official_website',p_contact_value:email,p_source_url:page.url,p_is_public:true,p_is_official:true,p_verification_status:'verified',p_confidence:kind==='public_reservation_email'?0.96:0.9,p_evidence:{method:'official_site_html',page:page.url,venueOwnership:'explicitly_published_on_source',legacyContactMatch:isLegacyMatch,redirectChain:page.diagnostics.redirectChain,finalUrl:page.diagnostics.finalUrl},p_metadata:{resolver:'booking-contact-resolve',resolverVersion:VERSION,candidateBridge:isLegacyMatch?'legacy_booking_contact_verified':'discovered_official_contact'}});
        if(candidateError){console.warn('candidate upsert failed',candidateError.message);continue;}
        if(isLegacyMatch){legacyContactVerified=true;legacyCandidateId=clean(candidateId)||null;legacySourceUrl=page.url;}
      }
    }
    const {data:resolution,error:resolveError}=await admin.rpc('luvia_booking_resolve_channel',{p_booking_id:booking.id,p_discovery_run_id:run.id});if(resolveError)return json({error:'CHANNEL_RESOLUTION_FAILED',details:resolveError.message},500);
    const successfulFetches=fetchDiagnostics.filter(x=>x.reason==='OK').length;
    const result={resolution:resolution||null,legacyContactPresent:Boolean(legacyEmail),legacyContactVerified,legacyCandidateId,legacySourceUrl,pagesChecked:pages.length,candidatesFound:seen.size-rejected.length,fetchDiagnostics,successfulFetches,initialUrl:official.toString(),finalUrl:first.url};
    await admin.from('booking_discovery_runs').update({status:(resolution&&resolution.resolved)?'resolved':'unresolved',source_count:pages.length,finished_at:new Date().toISOString(),result}).eq('id',run.id);
    return json({ok:true,...(resolution||{}),website:official.toString(),initialUrl:official.toString(),finalUrl:first.url,redirectChain:first.diagnostics.redirectChain,httpStatus:first.diagnostics.httpStatus,pagesChecked:pages.length,candidatesFound:seen.size-rejected.length,successfulFetches,legacyContactPresent:Boolean(legacyEmail),legacyContactVerified,legacyCandidateId,legacySourceUrl,bridgeReason:legacyEmail?(legacyContactVerified?'LEGACY_CONTACT_VERIFIED_AND_BRIDGED':'LEGACY_CONTACT_NOT_PUBLISHED_ON_OFFICIAL_SOURCE'):null,discoveryStrategy:'official-site-deep-crawl-v3',redirectAware:true,redirectDomainValidation:true,fetchDiagnostics,rejectedEmails:rejected.map(x=>({reason:x.reason,sourceUrl:x.sourceUrl})),resolverVersion:VERSION});
  }catch(error){return json({error:'BOOKING_CONTACT_RESOLVE_UNHANDLED',details:error instanceof Error?error.message:String(error)},500);}
});
