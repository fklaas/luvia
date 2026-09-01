((root)=>{
'use strict';

const CONTRACT_ID='booking.admission.v1';
const VERSION='1.0.0';
const KINDS=Object.freeze(['dining','lodging','attraction','culture','activity','event','transport','rental','other']);
const REQUIREMENTS=Object.freeze(['free','not_required','reservation_supported','reservation_recommended','reservation_required','ticket_available','ticket_required','timed_entry_required','unknown']);
const CERTAINTY=Object.freeze(['verified','provider_supported','unknown']);
const clean=value=>String(value??'').trim();
const bool=value=>value===true||String(value).toLowerCase()==='true';
const immutable=value=>{
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
};
const safeUrl=value=>{try{const url=new URL(clean(value));return url.protocol==='https:'?url.toString():null}catch{return null}};
const safeEmail=value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value))?clean(value):null;
const tokens=place=>[
  place?.type,place?.primaryType,place?.primary_type,place?.canonicalType,place?.canonical_type,place?.category,place?.requestCategory,
  ...(Array.isArray(place?.types)?place.types:[]),...(Array.isArray(place?.categories)?place.categories.map(item=>item?.name||item):[])
].map(value=>clean(value).toLowerCase()).filter(Boolean);

function classify(place={}){
  const haystack=tokens(place).join(' ');
  if(/restaurant|cafe|café|bakery|food|meal|bar|bistro|brasserie/.test(haystack))return'dining';
  if(/hotel|lodging|hostel|motel|resort|accommodation|guest.house|bed.and.breakfast/.test(haystack))return'lodging';
  if(/event|concert|festival|performance|show|cinema|movie|theatre_event|theater_event/.test(haystack))return'event';
  if(/museum|gallery|theat|opera|cultur|historic|heritage|exhibition|planetarium/.test(haystack))return'culture';
  if(/attraction|aquarium|zoo|amusement|theme.park|water.park|observation|landmark|monument|sightseeing/.test(haystack))return'attraction';
  if(/activity|miniature.golf|minigolf|golf|sport|fitness|climbing|escape.room|tour|cruise|boat|surf|kayak|adventure/.test(haystack))return'activity';
  if(/transport|ferry|train|rail|bus|flight|airport|taxi|transfer/.test(haystack))return'transport';
  if(/rental|hire|bike.rental|car.rental|boat.rental/.test(haystack))return'rental';
  return'other';
}

function explicitRequirement(place={}){
  const raw=clean(place.admissionRequirement||place.admission_requirement||place.bookingRequirement||place.booking_requirement||place.ticketRequirement||place.ticket_requirement).toLowerCase().replace(/[ -]+/g,'_');
  const aliases={
    free:'free',free_entry:'free',no_ticket:'not_required',not_required:'not_required',none:'not_required',
    reservable:'reservation_supported',reservation_available:'reservation_supported',reservation_supported:'reservation_supported',
    reservation_recommended:'reservation_recommended',recommended:'reservation_recommended',
    reservation_required:'reservation_required',booking_required:'reservation_required',
    ticket_available:'ticket_available',tickets_available:'ticket_available',
    ticket_required:'ticket_required',tickets_required:'ticket_required',required:'ticket_required',
    timed_entry:'timed_entry_required',timed_entry_required:'timed_entry_required'
  };
  if(aliases[raw])return aliases[raw];
  if(bool(place.admissionFree??place.admission_free))return'free';
  if(bool(place.timedEntryRequired??place.timed_entry_required))return'timed_entry_required';
  if(bool(place.ticketRequired??place.ticket_required??place.requiresTicket??place.requires_ticket))return'ticket_required';
  if(bool(place.reservationRequired??place.reservation_required??place.requiresReservation??place.requires_reservation))return'reservation_required';
  if(bool(place.reservationRecommended??place.reservation_recommended))return'reservation_recommended';
  return null;
}

function routeCandidates(place={}){
  const candidates=[];
  const add=(kind,value,provider,source,verified=true)=>{const url=kind==='email'?null:safeUrl(value),email=kind==='email'?safeEmail(value):null;if(!(url||email))return;candidates.push({kind,value:url||email,provider:clean(provider)||null,source:clean(source)||null,verified:Boolean(verified)});};
  const provider=clean(place.bookingProvider||place.booking_provider||place.ticketProvider||place.ticket_provider);
  const connection=clean(place.bookingProviderAccessState||place.booking_provider_access_state||place.providerAccessState||place.provider_access_state).toLowerCase();
  const apiUrl=safeUrl(place.bookingProviderApiUrl||place.booking_provider_api_url||place.ticketProviderApiUrl||place.ticket_provider_api_url);
  if(apiUrl&&connection==='connected')add('provider_api',apiUrl,provider,'connected-provider',true);
  add('official_link',place.ticketUrl||place.ticket_url||place.officialTicketUrl||place.official_ticket_url,provider||'official','official-ticket-link',true);
  add('official_link',place.reservationUrl||place.reservation_url||place.bookingUrl||place.booking_url,provider||'official','official-booking-link',true);
  add('provider_link',place.providerBookingUrl||place.provider_booking_url||place.providerTicketUrl||place.provider_ticket_url,provider,'provider-handoff',true);
  const verifiedEmail=bool(place.bookingEmailVerified??place.booking_email_verified)&&bool(place.bookingEmailPublic??place.booking_email_public)&&safeUrl(place.bookingEmailSourceUrl||place.booking_email_source_url);
  if(verifiedEmail)add('email',place.bookingEmail||place.booking_email,provider||'official',place.bookingEmailSourceUrl||place.booking_email_source_url,true);
  const order={provider_api:100,official_link:90,provider_link:80,email:70};
  return immutable(candidates.sort((left,right)=>order[right.kind]-order[left.kind]));
}

function requirementFor(place={},kind=classify(place),routes=routeCandidates(place)){
  const explicit=explicitRequirement(place);
  if(explicit)return{requirement:explicit,certainty:'verified',evidenceKind:'explicit-provider-fact'};
  if(bool(place.reservable??place.isReservable??place.is_reservable))return{requirement:'reservation_supported',certainty:'provider_supported',evidenceKind:'provider-reservable-capability'};
  if(routes.some(route=>/ticket/.test(route.source||'')))return{requirement:'ticket_available',certainty:'provider_supported',evidenceKind:'verified-ticket-route'};
  if(routes.length)return{requirement:kind==='dining'?'reservation_supported':'ticket_available',certainty:'provider_supported',evidenceKind:'verified-booking-route'};
  return{requirement:'unknown',certainty:'unknown',evidenceKind:kind==='other'?'not-applicable-by-current-evidence':'category-only'};
}

function presentation(kind,requirement,routes){
  const hasRoute=routes.length>0;
  const table={
    free:['Freier Eintritt belegt','Kein Ticket nötig','neutral'],
    not_required:['Keine Reservierung nötig','Ohne Vorab-Buchung','neutral'],
    reservation_supported:['Reservierung möglich',hasRoute?'Reservierung öffnen':'Reservierungsweg prüfen','info'],
    reservation_recommended:['Reservierung empfohlen',hasRoute?'Reservierung öffnen':'Reservierungsweg prüfen','attention'],
    reservation_required:['Reservierung erforderlich',hasRoute?'Reservierung öffnen':'Reservierungsweg prüfen','required'],
    ticket_available:['Tickets verfügbar',hasRoute?'Tickets öffnen':'Ticketweg prüfen','info'],
    ticket_required:['Ticket erforderlich',hasRoute?'Tickets öffnen':'Ticketweg prüfen','required'],
    timed_entry_required:['Zeitfenster erforderlich',hasRoute?'Zeitfenster wählen':'Ticketweg prüfen','required'],
    unknown:[kind==='dining'?'Reservierung noch ungeklärt':'Eintritt noch ungeklärt',kind==='dining'?'Reservierung prüfen':'Tickets prüfen','quiet']
  };
  const [label,actionLabel,tone]=table[requirement]||table.unknown;
  return{label,actionLabel,tone};
}

function resolve(place={}){
  const kind=classify(place),routes=routeCandidates(place),fact=requirementFor(place,kind,routes),copy=presentation(kind,fact.requirement,routes);
  const relevant=kind!=='other'||Boolean(explicitRequirement(place)||routes.length);
  const actionAvailable=relevant&&!['free','not_required'].includes(fact.requirement);
  return immutable({
    contractId:CONTRACT_ID,version:VERSION,kind,relevant,requirement:fact.requirement,certainty:fact.certainty,
    notice:{label:copy.label,tone:copy.tone,detail:fact.certainty==='unknown'?'Vor dem Besuch kurz prüfen.':fact.requirement==='reservation_supported'?'Der Anbieter unterstützt Reservierungen; eine Pflicht ist nicht belegt.':'Durch Anbieter- oder Ortsangaben belegt.'},
    action:{available:actionAvailable,label:copy.actionLabel,command:'booking.v1.commands.openPlaceBooking'},
    route:routes[0]||null,routes,evidence:{kind:fact.evidenceKind,explicit:fact.certainty==='verified',providerSupported:fact.certainty==='provider_supported'},
    invariants:{placeTypeNeverProvesRequirement:true,reservableNeverMeansRequired:true,routeNeverMeansRequired:true,verifiedEmailOnly:true,noAutomaticMutation:true}
  });
}

function providerCatalog(){
  const providers=root.LuviaBookingProviderCapabilities?.list?.()||[];
  return immutable(providers.map(provider=>({id:provider.id,name:provider.name,verticals:provider.verticals||['dining'],bookingMode:provider.bookingMode,accessState:provider.luviaAccessState,platform:provider.platform,commercialAccess:provider.commercialAccess})));
}

root.LuviaBookingAdmissionCore=Object.freeze({contractId:CONTRACT_ID,version:VERSION,KINDS,REQUIREMENTS,CERTAINTY,classify,routeCandidates,resolve,providerCatalog});
})(this);
