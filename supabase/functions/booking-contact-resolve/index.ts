import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VERSION='1.4.0';
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
const isReservationEmail=(v:string)=>/(reserv|booking|table|restaurant|contact|info)/i.test(v.split('@')[0]||'');
const PROVIDER_HOSTS=['zenchef.com','thefork.com','thefork.fr','thefork.de','lafourchette.com','opentable.com','sevenrooms.com','resy.com','exploretock.com','tockhq.com','quandoo.com','formitable.com','resdiary.com','covermanager.com','simpleerb.com','tablecheck.com'];
const hostMatches=(host:string,base:string)=>host===base||host.endsWith('.'+base);
const isProviderHost=(host:string)=>PROVIDER_HOSTS.some(x=>hostMatches(host.toLowerCase(),x));
const emailDomain=(email:string)=>clean(email.split('@')[1]).toLowerCase();
const isProviderEmail=(email:string)=>PROVIDER_HOSTS.some(x=>hostMatches(emailDomain(email),x));
const PLACEHOLDER_DOMAINS=new Set(['example.com','example.org','example.net','domain.com','domain.org','domain.net','domaine.com','domaine.fr','example.fr','example.de']);
const PLACEHOLDER_LOCALS=new Set(['user','username','utilisateur','name','nom','email','e-mail','mail','test','testing','example','exemple','yourname','your.name','votrenom','votre.nom','firstname','lastname','first.last']);
const isPlaceholderEmail=(email:string)=>{const e=clean(email).toLowerCase();const [local='',domain='']=e.split('@');return PLACEHOLDER_DOMAINS.has(domain)||PLACEHOLDER_LOCALS.has(local)||/^(user|username|utilisateur|example|exemple|test|testing)[._+-]?[0-9]*$/i.test(local);};

function safeHttpUrl(value:string){
  try{
    const u=new URL(value);
    if(!['http:','https:'].includes(u.protocol))return null;
    const h=u.hostname.toLowerCase();
    if(h==='localhost'||h==='::1'||h.endsWith('.local')||/^127\./.test(h)||/^10\./.test(h)||/^192\.168\./.test(h)||/^169\.254\./.test(h)||/^172\.(1[6-9]|2\d|3[01])\./.test(h))return null;
    return u;
  }catch{return null;}
}

async function fetchPage(url:string){
  const u=safeHttpUrl(url);
  if(!u)return null;
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),3500);
  try{
    const res=await fetch(u.toString(),{redirect:'follow',signal:controller.signal,headers:{'user-agent':`LuviaBooking/${VERSION} (+https://myluvia.app)`,'accept':'text/html,application/xhtml+xml'}});
    if(!res.ok)return null;
    const ct=res.headers.get('content-type')||'';
    if(!ct.includes('text/html'))return null;
    return {url:res.url||u.toString(),html:(await res.text()).slice(0,1_000_000)};
  }catch{return null;}finally{clearTimeout(timer);}
}

function decodeCfEmail(value:string){
  try{
    const hex=clean(value);
    if(hex.length<4||hex.length%2)return'';
    const key=parseInt(hex.slice(0,2),16);
    let out='';
    for(let i=2;i<hex.length;i+=2)out+=String.fromCharCode(parseInt(hex.slice(i,i+2),16)^key);
    return out;
  }catch{return'';}
}

function emailsFrom(html:string){
  let decoded=html.replace(/&#64;|&commat;|\u0040/gi,'@').replace(/&#46;|&period;|\u002e/gi,'.').replace(/\x40/gi,'@').replace(/\x2e/gi,'.');
  decoded=decoded.replace(/\s*(?:\[at\]|\(at\)|\sat\s)\s*/gi,'@').replace(/\s*(?:\[dot\]|\(dot\)|\sdot\s)\s*/gi,'.');
  decoded=decoded.replace(/data-cfemail=["']([0-9a-f]+)["']/gi,(_,hex)=>decodeCfEmail(hex)||'');
  const values=[...(decoded.match(emailRx)||[])];
  for(const m of decoded.matchAll(/mailto:([^"'?#\s>]+)/gi))values.push(decodeURIComponent(m[1]||''));
  for(const m of decoded.matchAll(/["']email["']\s*:\s*["']([^"']+)["']/gi))values.push(m[1]||'');
  for(const m of decoded.matchAll(/(?:email|contactEmail|contact_email)\s*["']?\s*[:=]\s*["']([^"']+@[^"']+)["']/gi))values.push(m[1]||'');
  return [...new Set(values.map(x=>clean(x).replace(/^mailto:/i,'').replace(/[),.;:]+$/,'').toLowerCase()).filter(x=>validEmail(x)&&!blockedEmail(x)))];
}

function candidateLinks(base:string,html:string){
  const out:string[]=[];
  const origin=new URL(base).origin;
  for(const m of html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)){
    const href=clean(m[1]);
    if(!href||href.startsWith('mailto:'))continue;
    try{
      const u=new URL(href,base);
      if(u.origin!==origin)continue;
      if(!/(contact|kontakt|contactez|contacter|nous[-_ ]?contacter|reservation|reserv|réserv|booking|book|restaurants?|locations?|adresses?|impressum|imprint|privacy|legal|mentions|confidentialit|about|propos)/i.test(u.pathname+u.search+href))continue;
      if(safeHttpUrl(u.toString()))out.push(u.toString());
    }catch{}
  }
  return [...new Set(out)].slice(0,14);
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
    const authorization=req.headers.get('Authorization')||'';
    if(!authorization)return json({error:'AUTH_REQUIRED'},401);

    const userClient=createClient(url,anon,{global:{headers:{Authorization:authorization}}});
    const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
    const body=await req.json().catch(()=>({}));
    const bookingId=clean(body.bookingId);
    if(!bookingId)return json({error:'BOOKING_ID_REQUIRED'},400);

    const {data:booking,error}=await userClient.from('bookings').select('*').eq('id',bookingId).single();
    if(error||!booking)return json({error:'BOOKING_NOT_FOUND_OR_FORBIDDEN'},404);

    const existing=clean(booking.contact?.email).toLowerCase();
    if(existing&&isProviderEmail(existing)){
      const sanitizedContact={...(booking.contact||{})};
      delete sanitizedContact.email;
      await admin.from('bookings').update({contact:sanitizedContact,updated_at:new Date().toISOString()}).eq('id',booking.id);
    }

    // v1.3: A legacy booking.contact.email is not proof of venue ownership. It must be
    // rediscovered on an official public venue page and bridged into booking_contact_candidates.
    const legacyEmail=(existing&&!isProviderEmail(existing)&&validEmail(existing))?existing:'';
    const website=clean(booking.contact?.website||booking.request?.website||booking.metadata?.website);
    const official=safeHttpUrl(website);
    if(!official){
      return json({
        ok:true,
        resolved:false,
        reason:legacyEmail?'LEGACY_CONTACT_REQUIRES_OFFICIAL_VERIFICATION':'OFFICIAL_WEBSITE_MISSING',
        legacyContactPresent:Boolean(legacyEmail),
        legacyContactVerified:false
      });
    }

    const {data:run,error:runError}=await admin.from('booking_discovery_runs').insert({
      booking_id:booking.id,
      trip_id:booking.trip_id,
      status:'running',
      resolver_version:VERSION
    }).select('*').single();
    if(runError)return json({error:'DISCOVERY_RUN_CREATE_FAILED',details:runError.message},500);

    const first=await fetchPage(official.toString());
    if(!first){
      await admin.from('booking_discovery_runs').update({status:'failed',finished_at:new Date().toISOString(),error:{reason:'OFFICIAL_WEBSITE_FETCH_FAILED'}}).eq('id',run.id);
      return json({ok:true,resolved:false,reason:'OFFICIAL_WEBSITE_FETCH_FAILED',legacyContactPresent:Boolean(legacyEmail),legacyContactVerified:false});
    }

    const pages=[first];
    const discoveryUrls=[...new Set([...candidateLinks(first.url,first.html),...guessedVenuePages(first.url)])].slice(0,18);
    const extra=(await Promise.all(discoveryUrls.map(link=>fetchPage(link)))).filter(Boolean) as {url:string,html:string}[];
    const pageSeen=new Set([first.url]);
    for(const page of extra){if(pageSeen.has(page.url))continue;pageSeen.add(page.url);pages.push(page);if(pages.length>=14)break;}

    const seen=new Set<string>();
    const rejected:{email:string,reason:string,sourceUrl:string}[]=[];
    let legacyContactVerified=false;
    let legacyCandidateId:string|null=null;
    let legacySourceUrl:string|null=null;

    for(const page of pages){
      for(const email of emailsFrom(page.html)){
        if(seen.has(email))continue;
        seen.add(email);
        const rejection=rejectReason(email,page.url);
        if(rejection){
          rejected.push({email,reason:rejection,sourceUrl:page.url});
          continue;
        }
        const kind=isReservationEmail(email)?'public_reservation_email':'public_contact_email';
        const isLegacyMatch=Boolean(legacyEmail)&&email===legacyEmail;
        const {data:candidateId,error:candidateError}=await admin.rpc('luvia_booking_upsert_candidate',{
          p_booking_id:booking.id,
          p_discovery_run_id:run.id,
          p_kind:kind,
          p_provider:'official_website',
          p_contact_value:email,
          p_source_url:page.url,
          p_is_public:true,
          p_is_official:true,
          p_verification_status:'verified',
          p_confidence:kind==='public_reservation_email'?0.96:0.9,
          p_evidence:{
            method:'official_site_html',
            page:page.url,
            venueOwnership:'explicitly_published_on_source',
            legacyContactMatch:isLegacyMatch
          },
          p_metadata:{
            resolver:'booking-contact-resolve',
            resolverVersion:VERSION,
            candidateBridge:isLegacyMatch?'legacy_booking_contact_verified':'discovered_official_contact'
          }
        });
        if(candidateError){
          console.warn('candidate upsert failed',candidateError.message);
          continue;
        }
        if(isLegacyMatch){
          legacyContactVerified=true;
          legacyCandidateId=clean(candidateId)||null;
          legacySourceUrl=page.url;
        }
      }
    }

    const {data:resolution,error:resolveError}=await admin.rpc('luvia_booking_resolve_channel',{p_booking_id:booking.id,p_discovery_run_id:run.id});
    if(resolveError)return json({error:'CHANNEL_RESOLUTION_FAILED',details:resolveError.message},500);

    await admin.from('booking_discovery_runs').update({
      status:(resolution&&resolution.resolved)?'resolved':'unresolved',
      source_count:pages.length,
      finished_at:new Date().toISOString(),
      result:{
        resolution:resolution||null,
        legacyContactPresent:Boolean(legacyEmail),
        legacyContactVerified,
        legacyCandidateId,
        legacySourceUrl,
        pagesChecked:pages.length,
        candidatesFound:seen.size-rejected.length
      }
    }).eq('id',run.id);

    return json({
      ok:true,
      ...(resolution||{}),
      website:official.toString(),
      pagesChecked:pages.length,
      candidatesFound:seen.size-rejected.length,
      legacyContactPresent:Boolean(legacyEmail),
      legacyContactVerified,
      legacyCandidateId,
      legacySourceUrl,
      bridgeReason:legacyEmail?(legacyContactVerified?'LEGACY_CONTACT_VERIFIED_AND_BRIDGED':'LEGACY_CONTACT_NOT_PUBLISHED_ON_OFFICIAL_SOURCE'):null,
      discoveryStrategy:'official-site-deep-crawl-v2',
      redirectAware:true,
      rejectedEmails:rejected.map(x=>({reason:x.reason,sourceUrl:x.sourceUrl}))
    });
  }catch(error){
    return json({error:'BOOKING_CONTACT_RESOLVE_UNHANDLED',details:error instanceof Error?error.message:String(error)},500);
  }
});
