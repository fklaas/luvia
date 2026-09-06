var LuviaIntelligenceActionContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='intelligence.actions.v1';
const VERSION='1';
const RUNTIME_VERSION='1.16.0-visit-owner-commands';
const EFFECTS=Object.freeze({READ:'READ',DRAFT:'DRAFT',WRITE:'WRITE',EXTERNAL:'EXTERNAL',NAVIGATION:'NAVIGATION'});
const CONFIRMATION=Object.freeze({NEVER:'NEVER',USER_GESTURE:'USER_GESTURE',EXPLICIT:'EXPLICIT'});
const RISK=Object.freeze({R0:'R0',R1:'R1',R2:'R2',R3:'R3',R4:'R4'});
const RESULT_KINDS=Object.freeze({
  MESSAGE:'message',PLACE_COLLECTION:'place_collection',EVENT_COLLECTION:'event_collection',DAY_PLAN:'day_plan',TRIP_COLLECTION:'trip_collection',BOOKING_COLLECTION:'booking_collection',
  MEMORY_COLLECTION:'memory_collection',PREFERENCE_SUMMARY:'preference_summary',CONFIRMATION:'confirmation',RECEIPT:'receipt',CLARIFICATION:'clarification',ERROR:'error'
});
const RECEIPT_STATUSES=Object.freeze(['prepared','confirmed','completed','opened','cancelled','failed','outcome_unknown','compensated']);
const BLOCKED_KEYS=/^(email|phone|telephone|password|token|access_token|refresh_token|authorization|apikey|api_key|booking_number|reservation_number|payment|card|iban|address_exact)$/i;
const LIMITS=Object.freeze({maxDepth:7,maxArray:40,maxString:1000,maxItems:12,maxActions:6,maxPermissions:8});
const ACTION_ALIASES=Object.freeze({'booking.restaurant.open':'booking.place.open'});
const INPUT_CONTRACTS=Object.freeze({
  'navigation.route.open':Object.freeze({schemaId:'luvia.ai-input.navigation.route.open.v1',enforcement:'RUNTIME_ENFORCED'}),
  'places.place.favorite':Object.freeze({schemaId:'luvia.ai-input.places.place.favorite.v1',enforcement:'RUNTIME_ENFORCED'}),
  'places.place.unfavorite':Object.freeze({schemaId:'luvia.ai-input.places.place.unfavorite.v1',enforcement:'RUNTIME_ENFORCED'}),
  'places.place.plan':Object.freeze({schemaId:'luvia.ai-input.places.place.plan.v1',enforcement:'RUNTIME_ENFORCED'}),
  'places.place.unplan':Object.freeze({schemaId:'luvia.ai-input.places.place.unplan.v1',enforcement:'RUNTIME_ENFORCED'}),
  'booking.place.open':Object.freeze({schemaId:'luvia.ai-input.booking.place.open.v1',enforcement:'RUNTIME_ENFORCED'}),
  'booking.stay.search':Object.freeze({schemaId:'luvia.ai-input.booking.stay.search.v1',enforcement:'RUNTIME_ENFORCED'}),
  'booking.stay.offer.open':Object.freeze({schemaId:'luvia.ai-input.booking.stay.offer.open.v1',enforcement:'RUNTIME_ENFORCED'}),
  'booking.trip.read':Object.freeze({schemaId:'luvia.ai-input.booking.trip.read.v1',enforcement:'RUNTIME_ENFORCED'}),
  'booking.reservation.create':Object.freeze({schemaId:'luvia.ai-input.booking.reservation.create.v1',enforcement:'RUNTIME_ENFORCED'}),
  'booking.reservation.modify':Object.freeze({schemaId:'luvia.ai-input.booking.reservation.modify.v1',enforcement:'RUNTIME_ENFORCED'}),
  'booking.reservation.cancel':Object.freeze({schemaId:'luvia.ai-input.booking.reservation.cancel.v1',enforcement:'RUNTIME_ENFORCED'}),
  'journey.day.read':Object.freeze({schemaId:'luvia.ai-input.journey.day.read.v1',enforcement:'RUNTIME_ENFORCED'}),
  'journey.day.open':Object.freeze({schemaId:'luvia.ai-input.journey.day.open.v1',enforcement:'RUNTIME_ENFORCED'}),
  'journey.entry.schedule':Object.freeze({schemaId:'luvia.ai-input.journey.entry.schedule.v1',enforcement:'RUNTIME_ENFORCED'}),
  'journey.entry.remove':Object.freeze({schemaId:'luvia.ai-input.journey.entry.remove.v1',enforcement:'RUNTIME_ENFORCED'}),
  'journey.entry.restore':Object.freeze({schemaId:'luvia.ai-input.journey.entry.restore.v1',enforcement:'RUNTIME_ENFORCED'}),
  'journey.visit.update':Object.freeze({schemaId:'luvia.ai-input.journey.visit.update.v1',enforcement:'RUNTIME_ENFORCED'}),
  'journey.visit.remove':Object.freeze({schemaId:'luvia.ai-input.journey.visit.remove.v1',enforcement:'RUNTIME_ENFORCED'}),
  'journey.visit.restore':Object.freeze({schemaId:'luvia.ai-input.journey.visit.restore.v1',enforcement:'RUNTIME_ENFORCED'}),
  'trip.active.list':Object.freeze({schemaId:'luvia.ai-input.trip.active.list.v1',enforcement:'RUNTIME_ENFORCED'}),
  'trip.active.select':Object.freeze({schemaId:'luvia.ai-input.trip.active.select.v1',enforcement:'RUNTIME_ENFORCED'}),
  'trip.update.details':Object.freeze({schemaId:'luvia.ai-input.trip.update.details.v1',enforcement:'RUNTIME_ENFORCED'}),
  'places.restaurant.recommend':Object.freeze({schemaId:'luvia.ai-input.places.restaurant.recommend.v1',enforcement:'RUNTIME_ENFORCED'}),
  'places.discovery.recommend':Object.freeze({schemaId:'luvia.ai-input.places.discovery.recommend.v1',enforcement:'RUNTIME_ENFORCED'}),
  'events.verified.read':Object.freeze({schemaId:'luvia.ai-input.events.verified.read.v1',enforcement:'RUNTIME_ENFORCED'}),
  'memory.library.read':Object.freeze({schemaId:'luvia.ai-input.memory.library.read.v1',enforcement:'RUNTIME_ENFORCED'}),
  'memory.story.save':Object.freeze({schemaId:'luvia.ai-input.memory.story.save.v1',enforcement:'RUNTIME_ENFORCED'}),
  'identity.preferences.read':Object.freeze({schemaId:'luvia.ai-input.identity.preferences.read.v1',enforcement:'RUNTIME_ENFORCED'}),
  'identity.preferences.update':Object.freeze({schemaId:'luvia.ai-input.identity.preferences.update.v1',enforcement:'RUNTIME_ENFORCED'})
});

function clone(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clone(item)]));
}
function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function text(value,fallback=''){return String(value??fallback).trim()}
function finite(value,min,max,fallback=null){const parsed=Number(value);return Number.isFinite(parsed)?Math.max(min,Math.min(max,parsed)):fallback}
function unique(value,max=20){return[...new Set((Array.isArray(value)?value:[]).map(item=>text(item)).filter(Boolean))].slice(0,max)}
function sanitize(value,depth=0,seen=new WeakSet()){
  if(value==null||typeof value==='boolean'||typeof value==='number')return value;
  if(typeof value==='string')return value.slice(0,LIMITS.maxString);
  if(depth>=LIMITS.maxDepth)return'[redacted-depth]';
  if(Array.isArray(value))return value.slice(0,LIMITS.maxArray).map(item=>sanitize(item,depth+1,seen));
  if(typeof value==='object'){
    if(seen.has(value))return'[circular]';
    seen.add(value);
    const result={};
    for(const [key,item] of Object.entries(value)){
      if(BLOCKED_KEYS.test(key))continue;
      const safe=sanitize(item,depth+1,seen);
      if(safe!==undefined)result[key]=safe;
    }
    return result;
  }
  return undefined;
}
function contractError(code,message,extra={}){const error=new Error(message);error.code=code;Object.assign(error,extra);return error}

function validCalendarDate(value){
  const match=text(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!match)return false;
  const date=new Date(Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3])));
  return date.getUTCFullYear()===Number(match[1])&&date.getUTCMonth()===Number(match[2])-1&&date.getUTCDate()===Number(match[3]);
}
function validClockTime(value){return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(text(value))}
function plainObject(value){return Boolean(value&&typeof value==='object'&&!Array.isArray(value))}
function absoluteDateTime(value){const source=text(value);return Boolean(source&&/(?:z|[+-]\d{2}:?\d{2})$/i.test(source)&&!Number.isNaN(Date.parse(source)))}
function zonedParts(value,timeZone){
  const date=value instanceof Date?value:new Date(value);if(Number.isNaN(date.getTime()))return null;
  try{
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).map(part=>[part.type,part.value]));
    return{year:Number(parts.year),month:Number(parts.month),day:Number(parts.day),hour:Number(parts.hour),minute:Number(parts.minute),second:Number(parts.second)};
  }catch{return null}
}
function timeZoneOffset(value,timeZone){
  const date=value instanceof Date?value:new Date(value),parts=zonedParts(date,timeZone);if(!parts)return null;
  return Date.UTC(parts.year,parts.month-1,parts.day,parts.hour,parts.minute,parts.second)-Math.trunc(date.getTime()/1000)*1000;
}
function zonedDateTimeToIso(dateValue,timeValue,timeZone){
  const date=text(dateValue),time=text(timeValue),zone=text(timeZone);if(!validCalendarDate(date)||!validClockTime(time)||!zone)return null;
  const [year,month,day]=date.split('-').map(Number),[hour,minute]=time.split(':').map(Number),localEpoch=Date.UTC(year,month-1,day,hour,minute,0);
  let offset=timeZoneOffset(new Date(localEpoch),zone);if(offset==null)return null;
  let instant=new Date(localEpoch-offset);const corrected=timeZoneOffset(instant,zone);if(corrected==null)return null;if(corrected!==offset)instant=new Date(localEpoch-corrected);
  const parts=zonedParts(instant,zone);if(!parts||parts.year!==year||parts.month!==month||parts.day!==day||parts.hour!==hour||parts.minute!==minute)return null;
  const sameLocal=other=>{const candidate=zonedParts(other,zone);return candidate&&candidate.year===year&&candidate.month===month&&candidate.day===day&&candidate.hour===hour&&candidate.minute===minute};
  if([30,60,90,120].some(minutes=>sameLocal(new Date(instant.getTime()+minutes*60000))||sameLocal(new Date(instant.getTime()-minutes*60000))))return null;
  return instant.toISOString();
}
function validateActionInput(actionId,input={},context={}){
  const action=getAction(actionId);if(!action)throw contractError('INTELLIGENCE_ACTION_UNKNOWN','Action is not registered.',{actionId:text(actionId)});
  const contract=INPUT_CONTRACTS[action.id];if(!contract)return immutable({valid:true,enforced:false,actionId:action.id,schemaId:null,issues:[],normalized:null});
  const issues=[],value=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
  const issue=(code,path,message)=>issues.push({code,path,message});
  const finish=normalized=>immutable({valid:issues.length===0,enforced:true,actionId:action.id,schemaId:contract.schemaId,enforcement:contract.enforcement,issues,normalized:issues.length?null:normalized});
  if(action.id==='navigation.route.open'){
    const allowed=['today','plan','trip','memories','more','places','hotels','places-lifecycle','timeline','routes','gallery','albums','bookings','control-center','control-center-identity','control-center-bookings','control-center-inbox','profile-onboarding','first-trip-composer'],route=text(value.route);
    if(!route)issue('required','route','Der zu öffnende Bereich fehlt.');else if(!allowed.includes(route))issue('enum','route','Dieser App-Bereich ist nicht als sichere Route registriert.');
    if(value.source!=null&&(!text(value.source)||text(value.source).length>120))issue('format','source','Die Navigationsquelle ist ungültig.');
    if(value.query!=null&&text(value.query).length>1000)issue('limit','query','Der Navigationswunsch ist zu lang.');
    return finish({route,source:text(value.source)||'global-chat'});
  }
  if(['booking.place.open','booking.restaurant.open'].includes(action.id)){
    if(!text(value.providerPlaceId))issue('required','providerPlaceId','Eine verifizierte Provider-ID des Orts fehlt.');
    if(value.tripId!=null&&!text(value.tripId))issue('format','tripId','Die Reise-ID ist ungültig.');
    return finish({tripId:text(value.tripId)||text(context.tripId)||null,providerPlaceId:text(value.providerPlaceId),placeId:text(value.placeId)||null});
  }
  if(action.id==='booking.stay.search'){
    if(!validCalendarDate(value.checkIn))issue('required','checkIn','Ein gültiges Check-in-Datum fehlt.');
    if(!validCalendarDate(value.checkOut))issue('required','checkOut','Ein gültiges Check-out-Datum fehlt.');
    if(validCalendarDate(value.checkIn)&&validCalendarDate(value.checkOut)&&value.checkOut<=value.checkIn)issue('conflict','checkOut','Check-out muss nach dem Check-in liegen.');
    const adults=Number(value.adults??1),children=Number(value.children??0),rooms=Number(value.rooms??1),childAges=Array.isArray(value.childAges)?value.childAges.map(Number):[];
    if(!Number.isInteger(adults)||adults<1||adults>100)issue('range','adults','Die Zahl der Erwachsenen ist ungültig.');
    if(!Number.isInteger(children)||children<0||children>30)issue('range','children','Die Zahl der Kinder ist ungültig.');
    if(children!==childAges.length||childAges.some(age=>!Number.isInteger(age)||age<0||age>17))issue('required','childAges','Für jedes Kind wird ein gültiges Alter benötigt.');
    if(!Number.isInteger(rooms)||rooms<1||rooms>30)issue('range','rooms','Die Zimmerzahl ist ungültig.');
    const latitude=Number(value.latitude??value.location?.latitude),longitude=Number(value.longitude??value.location?.longitude),providerDestinationIds=plainObject(value.providerDestinationIds)?value.providerDestinationIds:{};
    const hasDestination=Boolean(text(value.cityCode)||text(providerDestinationIds.hotelbeds)||(Number.isFinite(latitude)&&latitude>=-90&&latitude<=90&&Number.isFinite(longitude)&&longitude>=-180&&longitude<=180)||(plainObject(value.providerHotelIds)&&Object.keys(value.providerHotelIds).length));
    if(!hasDestination)issue('required','destination','Für Livepreise fehlt eine belegte Zielkoordinate oder Provider-Zielkennung.');
    if(value.currency!=null&&!/^[A-Za-z]{3}$/.test(text(value.currency)))issue('format','currency','Der Währungscode ist ungültig.');
    return finish({tripId:text(value.tripId)||text(context.tripId)||null,destination:text(value.destination)||null,cityCode:text(value.cityCode).toUpperCase()||null,latitude:Number.isFinite(latitude)?latitude:null,longitude:Number.isFinite(longitude)?longitude:null,providerDestinationIds:clone(providerDestinationIds),providerHotelIds:plainObject(value.providerHotelIds)?clone(value.providerHotelIds):{},checkIn:text(value.checkIn),checkOut:text(value.checkOut),adults,children,childAges,rooms,currency:text(value.currency).toUpperCase()||'EUR',providers:Array.isArray(value.providers)?unique(value.providers,4):[]});
  }
  if(action.id==='booking.stay.offer.open'){
    const offer=plainObject(value.offer)?value.offer:{},query=plainObject(value.query)?value.query:{};
    if(!plainObject(value.offer))issue('required','offer','Das konkret ausgewählte Hotelangebot fehlt.');
    for(const [field,message] of [['providerId','Der Preis-Provider fehlt.'],['providerHotelId','Die Provider-ID des Hotels fehlt.'],['offerId','Die Angebots-ID fehlt.']])if(!text(offer[field]))issue('required',`offer.${field}`,message);
    if(!text(offer.providerRateKey)&&!text(offer.providerOfferId))issue('required','offer.providerRateKey|offer.providerOfferId','Die Rate-ID des Angebots fehlt.');
    if(!/^https:\/\/[^\s/?#]+(?:[/?#]|$)/i.test(text(offer.deepLink||offer.bookingUrl)))issue('format','offer.bookingUrl','Der belegte HTTPS-Buchungslink fehlt.');
    if(offer.bookingUrlVerified!==true)issue('evidence','offer.bookingUrlVerified','Der Buchungslink ist noch nicht für dieses Hotel verifiziert.');
    if(!text(offer.bookingUrlPropertyId)||text(offer.bookingUrlPropertyId)!==text(offer.providerHotelId))issue('conflict','offer.bookingUrlPropertyId','Buchungslink und ausgewähltes Hotel stimmen nicht überein.');
    if(!validCalendarDate(offer.checkIn)||!validCalendarDate(offer.checkOut)||offer.checkOut<=offer.checkIn)issue('conflict','offer.checkIn|offer.checkOut','Die Angebotsdaten enthalten keinen gültigen Aufenthalt.');
    if(!Number.isFinite(Number(offer.price?.total??offer.totalPrice))||Number(offer.price?.total??offer.totalPrice)<0)issue('required','offer.totalPrice','Der belegte Gesamtpreis fehlt.');
    if(offer.available!==true||offer.isLive!==true||text(offer.source)!=='provider_api')issue('evidence','offer','Das Angebot ist nicht als verfügbares Live-Provider-Angebot belegt.');
    return finish({tripId:text(value.tripId)||text(query.tripId)||text(context.tripId)||null,offer:clone(offer),query:clone(query)});
  }
  if(action.id==='booking.trip.read'){
    const activeTripId=text(context.tripId);
    if(!activeTripId)issue('required','context.tripId','Es ist keine aktive Reise ausgewählt.');
    if(value.query!=null&&!text(value.query))issue('format','query','Die Buchungssuche ist leer.');
    if(value.query!=null&&text(value.query).length>1000)issue('limit','query','Die Buchungssuche ist zu lang.');
    if(value.intent!=null&&!['list','prerequisite-read','modify','cancel'].includes(text(value.intent)))issue('enum','intent','Der gewünschte Buchungsvorgang ist unbekannt.');
    return finish({tripId:activeTripId,query:text(value.query)||null,intent:text(value.intent)||'list'});
  }
  if(action.id==='booking.reservation.create'){
    if(!text(value.tripId))issue('required','tripId','Die aktive Reise fehlt.');
    if(!plainObject(value.place))issue('required','place','Der verifizierte buchbare Ort fehlt.');
    else if(!text(value.place.providerPlaceId))issue('required','place.providerPlaceId','Eine verifizierte Provider-ID des Orts fehlt.');
    if(!text(value.startAt))issue('required','startAt','Der Reservierungs- oder Besuchszeitpunkt fehlt.');
    else if(!absoluteDateTime(value.startAt))issue('format','startAt','Der Reservierungszeitpunkt braucht einen eindeutigen UTC-Offset.');
    if(value.endAt!=null&&!absoluteDateTime(value.endAt))issue('format','endAt','Das Reservierungsende braucht einen eindeutigen UTC-Offset.');
    if(absoluteDateTime(value.startAt)&&absoluteDateTime(value.endAt)&&Date.parse(value.endAt)<=Date.parse(value.startAt))issue('conflict','endAt','Das Reservierungsende muss nach dem Beginn liegen.');
    if(value.partySize==null)issue('required','partySize','Die Personenzahl fehlt.');
    else if(!Number.isInteger(value.partySize)||value.partySize<1||value.partySize>100)issue('range','partySize','Die Personenzahl muss zwischen 1 und 100 liegen.');
    if(value.email!=null&&text(value.email).length>320)issue('limit','email','Die E-Mail-Adresse ist zu lang.');
    return finish({tripId:text(value.tripId),providerPlaceId:text(value.place?.providerPlaceId),startAt:text(value.startAt)||null,endAt:text(value.endAt)||null,partySize:value.partySize??null});
  }
  if(action.id==='booking.reservation.modify'){
    if(!text(value.bookingId))issue('required','bookingId','Die Booking-ID fehlt.');
    if(!plainObject(value.patch)||!Object.keys(value.patch).length)issue('required','patch','Die gewünschte Änderung fehlt.');
    else if(Object.keys(value.patch).length>40)issue('limit','patch','Die Buchungsänderung enthält zu viele Felder.');
    return finish({bookingId:text(value.bookingId),tripId:text(value.tripId)||text(context.tripId)||null,patch:plainObject(value.patch)?clone(value.patch):null});
  }
  if(action.id==='booking.reservation.cancel'){
    if(!text(value.bookingId))issue('required','bookingId','Die Booking-ID fehlt.');
    if(value.reason!=null&&text(value.reason).length>2000)issue('limit','reason','Der Stornierungsgrund ist zu lang.');
    return finish({bookingId:text(value.bookingId),tripId:text(value.tripId)||text(context.tripId)||null,reason:text(value.reason)||null});
  }
  if(action.id==='journey.day.read'){
    const activeTripId=text(context.tripId);
    if(!activeTripId)issue('required','context.tripId','Es ist keine aktive Reise ausgewählt.');
    if(value.query!=null&&!text(value.query))issue('format','query','Die Tagesplan-Anfrage ist leer.');
    if(value.query!=null&&text(value.query).length>1000)issue('limit','query','Die Tagesplan-Anfrage ist zu lang.');
    if(value.date!=null&&value.date!==''&&!validCalendarDate(value.date))issue('format','date','Das Tagesplan-Datum ist ungültig.');
    if(value.includePlanningDetails!=null&&typeof value.includePlanningDetails!=='boolean')issue('type','includePlanningDetails','Die Detailauswahl ist ungültig.');
    return finish({tripId:activeTripId,date:text(value.date)||null,includePlanningDetails:value.includePlanningDetails===true});
  }
  if(action.id==='journey.day.open'){
    if(!text(value.tripId))issue('required','tripId','Die aktive Reise fehlt.');
    if(value.date!=null&&!validCalendarDate(value.date))issue('format','date','Das zu öffnende Tagesplan-Datum ist ungültig.');
    if(value.mode!=null&&!['schedule','edit','create'].includes(text(value.mode)))issue('enum','mode','Der gewünschte Bearbeitungsmodus ist unbekannt.');
    return finish({tripId:text(value.tripId),date:text(value.date)||null,mode:text(value.mode)||'schedule'});
  }
  if(action.id==='journey.entry.schedule'){
    if(!text(value.entryId))issue('required','entryId','Der Timeline-Moment fehlt.');
    if(!absoluteDateTime(value.startAt))issue('format','startAt','Der neue Zeitpunkt braucht einen eindeutigen UTC-Offset.');
    const durationMinutes=Number(value.durationMinutes);if(!Number.isInteger(durationMinutes)||durationMinutes<15||durationMinutes>1440)issue('range','durationMinutes','Die Dauer muss zwischen 15 und 1440 Minuten liegen.');
    if(!text(value.expectedRevision))issue('required','expectedRevision','Der geprüfte Owner-Stand fehlt.');
    return finish({tripId:text(value.tripId)||text(context.tripId)||null,entryId:text(value.entryId),startAt:text(value.startAt),durationMinutes,expectedRevision:text(value.expectedRevision),expectedConflictSignature:value.expectedConflictSignature==null?null:text(value.expectedConflictSignature),conflictsAccepted:value.conflictsAccepted===true});
  }
  if(action.id==='journey.entry.remove'){
    if(!text(value.entryId))issue('required','entryId','Der Timeline-Moment fehlt.');if(!text(value.expectedRevision))issue('required','expectedRevision','Der geprüfte Owner-Stand fehlt.');
    return finish({tripId:text(value.tripId)||text(context.tripId)||null,entryId:text(value.entryId),expectedRevision:text(value.expectedRevision)});
  }
  if(action.id==='journey.entry.restore'){
    if(!text(value.recoveryId))issue('required','recoveryId','Der Wiederherstellungsbeleg fehlt.');if(!text(value.expectedRevision))issue('required','expectedRevision','Der geprüfte Owner-Stand fehlt.');
    return finish({tripId:text(value.tripId)||text(context.tripId)||null,recoveryId:text(value.recoveryId),expectedRevision:text(value.expectedRevision),expectedConflictSignature:value.expectedConflictSignature==null?null:text(value.expectedConflictSignature),conflictsAccepted:value.conflictsAccepted===true});
  }
  if(action.id==='journey.visit.update'){
    if(!text(value.visitId))issue('required','visitId','Der bestätigte Besuch fehlt.');
    if(!absoluteDateTime(value.startAt))issue('required','startAt','Der neue Besuchsbeginn braucht einen eindeutigen UTC-Offset.');
    const durationMinutes=Number(value.durationMinutes);
    if(!Number.isInteger(durationMinutes)||durationMinutes<5||durationMinutes>1440)issue('range','durationMinutes','Die Besuchsdauer muss zwischen 5 und 1440 Minuten liegen.');
    if(!text(value.expectedRevision))issue('required','expectedRevision','Der geprüfte Places-Owner-Stand fehlt.');
    return finish({tripId:text(value.tripId)||text(context.tripId)||null,visitId:text(value.visitId),placeId:text(value.placeId)||null,name:text(value.name)||null,startAt:text(value.startAt)||null,durationMinutes,expectedRevision:text(value.expectedRevision)});
  }
  if(action.id==='journey.visit.remove'){
    if(!text(value.visitId))issue('required','visitId','Der bestätigte Besuch fehlt.');
    if(!text(value.expectedRevision))issue('required','expectedRevision','Der geprüfte Places-Owner-Stand fehlt.');
    return finish({tripId:text(value.tripId)||text(context.tripId)||null,visitId:text(value.visitId),placeId:text(value.placeId)||null,name:text(value.name)||null,expectedRevision:text(value.expectedRevision)});
  }
  if(action.id==='journey.visit.restore'){
    if(!text(value.recoveryId))issue('required','recoveryId','Der Wiederherstellungsbeleg des Besuchs fehlt.');
    if(!text(value.expectedRevision))issue('required','expectedRevision','Der geprüfte Places-Owner-Stand fehlt.');
    return finish({tripId:text(value.tripId)||text(context.tripId)||null,recoveryId:text(value.recoveryId),visitId:text(value.visitId)||null,placeId:text(value.placeId)||null,name:text(value.name)||null,expectedRevision:text(value.expectedRevision)});
  }
  if(action.id==='trip.active.list'){
    if(value.query!=null&&!text(value.query))issue('format','query','Die Reise-Anfrage ist leer.');
    if(value.query!=null&&text(value.query).length>1000)issue('limit','query','Die Reise-Anfrage ist zu lang.');
    return finish({query:text(value.query)||null});
  }
  if(action.id==='trip.active.select'){
    if(!text(value.tripId))issue('required','tripId','Die Zielreise fehlt.');
    if(value.previousTripId!=null&&!text(value.previousTripId))issue('format','previousTripId','Die vorherige Reise-ID ist ungültig.');
    return finish({tripId:text(value.tripId),previousTripId:text(value.previousTripId)||text(context.tripId)||null});
  }
  if(action.id==='trip.update.details'){
    if(!text(value.tripId))issue('required','tripId','Die zu ändernde Reise fehlt.');
    if(!plainObject(value.patch)||!Object.keys(value.patch).length)issue('required','patch','Die gewünschte Reiseänderung fehlt.');
    else{
      if(Object.keys(value.patch).length>40)issue('limit','patch','Die Reiseänderung enthält zu viele Felder.');
      if(value.patch.startDate!=null&&!validCalendarDate(value.patch.startDate))issue('format','patch.startDate','Das Startdatum ist ungültig.');
      if(value.patch.endDate!=null&&!validCalendarDate(value.patch.endDate))issue('format','patch.endDate','Das Enddatum ist ungültig.');
      if(validCalendarDate(value.patch.startDate)&&validCalendarDate(value.patch.endDate)&&value.patch.endDate<value.patch.startDate)issue('conflict','patch.endDate','Das Reiseende muss am oder nach dem Start liegen.');
    }
    return finish({tripId:text(value.tripId),patch:plainObject(value.patch)?clone(value.patch):null});
  }
  if(['places.restaurant.recommend','places.discovery.recommend'].includes(action.id)){
    const query=text(value.query);
    if(!query)issue('required','query','Der Suchwunsch fehlt.');else if(query.length>1000)issue('limit','query','Der Suchwunsch ist zu lang.');
    if(value.category!=null&&(typeof value.category!=='string'||!text(value.category)||text(value.category).length>80))issue('format','category','Die Ortskategorie ist ungültig.');
    if(value.categories!=null){
      if(!Array.isArray(value.categories))issue('type','categories','Die Ortskategorien müssen als Liste angegeben werden.');
      else{
        if(value.categories.length>8)issue('limit','categories','Es können höchstens acht Ortskategorien gleichzeitig gesucht werden.');
        if(value.categories.some(item=>typeof item!=='string'||!text(item)||text(item).length>80))issue('format','categories','Mindestens eine Ortskategorie ist ungültig.');
        if(new Set(value.categories.map(item=>text(item))).size!==value.categories.length)issue('unique','categories','Ortskategorien dürfen nicht doppelt vorkommen.');
      }
    }
    if(value.limit!=null&&(!Number.isInteger(value.limit)||value.limit<1||value.limit>12))issue('range','limit','Die Trefferzahl muss zwischen 1 und 12 liegen.');
    if(value.explicitPreferencePatch!=null&&(!plainObject(value.explicitPreferencePatch)||Object.keys(value.explicitPreferencePatch).length>30))issue('type','explicitPreferencePatch','Die ausdrücklich genannten Vorlieben sind ungültig oder zu umfangreich.');
    if(value.spatialConstraints!=null&&!plainObject(value.spatialConstraints))issue('type','spatialConstraints','Die räumliche Einschränkung ist ungültig.');
    if(value.strictPlaceType!=null&&(typeof value.strictPlaceType!=='string'||text(value.strictPlaceType).length>80))issue('format','strictPlaceType','Der gewünschte Ortstyp ist ungültig.');
    if(value.mutationHints!=null&&(!plainObject(value.mutationHints)||Object.keys(value.mutationHints).length>6))issue('type','mutationHints','Die Aktionshinweise sind ungültig oder zu umfangreich.');
    return finish({query,category:text(value.category)||null,categories:Array.isArray(value.categories)?value.categories.map(text):[],limit:value.limit??null,explicitPreferencePatch:plainObject(value.explicitPreferencePatch)?clone(value.explicitPreferencePatch):{},spatialConstraints:plainObject(value.spatialConstraints)?clone(value.spatialConstraints):null,strictPlaceType:text(value.strictPlaceType)||null,mutationHints:plainObject(value.mutationHints)?clone(value.mutationHints):{}});
  }
  if(action.id==='events.verified.read'){
    if(value.query!=null&&!text(value.query))issue('format','query','Die Event-Suche ist leer.');
    if(value.query!=null&&text(value.query).length>1000)issue('limit','query','Die Event-Suche ist zu lang.');
    if(value.from!=null&&!absoluteDateTime(value.from))issue('format','from','Der Beginn des Event-Zeitraums braucht einen eindeutigen UTC-Offset.');
    if(value.to!=null&&!absoluteDateTime(value.to))issue('format','to','Das Ende des Event-Zeitraums braucht einen eindeutigen UTC-Offset.');
    if(absoluteDateTime(value.from)&&absoluteDateTime(value.to)&&Date.parse(value.to)<Date.parse(value.from))issue('conflict','to','Das Ende des Event-Zeitraums muss nach dem Beginn liegen.');
    if(value.limit!=null&&(!Number.isInteger(value.limit)||value.limit<1||value.limit>50))issue('range','limit','Die Event-Trefferzahl muss zwischen 1 und 50 liegen.');
    return finish({query:text(value.query)||null,from:text(value.from)||null,to:text(value.to)||null,limit:value.limit??null});
  }
  if(action.id==='memory.library.read'){
    if(value.query!=null&&!text(value.query))issue('format','query','Die Erinnerungssuche ist leer.');
    if(value.query!=null&&text(value.query).length>1000)issue('limit','query','Die Erinnerungssuche ist zu lang.');
    return finish({query:text(value.query)||null});
  }
  if(action.id==='memory.story.save'){
    if(value.storyId!=null&&(!text(value.storyId)||text(value.storyId).length>240))issue('format','storyId','Die Story-ID ist ungültig.');
    if(!plainObject(value.story)||!Object.keys(value.story).length)issue('required','story','Die zu speichernde Geschichte fehlt.');
    else{
      if(value.story.id!=null&&(!text(value.story.id)||text(value.story.id).length>240))issue('format','story.id','Die Story-ID ist ungültig.');
      if(value.story.title!=null&&(typeof value.story.title!=='string'||!text(value.story.title)||text(value.story.title).length>240))issue('format','story.title','Der Story-Titel ist ungültig.');
      if(value.story.description!=null&&(typeof value.story.description!=='string'||value.story.description.length>10000))issue('limit','story.description','Der Storytext ist ungültig oder zu lang.');
      if(value.story.status!=null&&!['draft','published','archived'].includes(text(value.story.status)))issue('enum','story.status','Der Story-Status ist unbekannt.');
      if(value.story.mediaIds!=null){
        if(!Array.isArray(value.story.mediaIds))issue('type','story.mediaIds','Die ausgewählten Medien müssen als Liste angegeben werden.');
        else{
          if(value.story.mediaIds.length>240)issue('limit','story.mediaIds','Es können höchstens 240 Medien verknüpft werden.');
          if(value.story.mediaIds.some(item=>!text(item)||text(item).length>240))issue('format','story.mediaIds','Mindestens eine Medien-ID ist ungültig.');
          if(new Set(value.story.mediaIds.map(text)).size!==value.story.mediaIds.length)issue('unique','story.mediaIds','Medien dürfen nicht doppelt verknüpft werden.');
        }
      }
    }
    return finish({storyId:text(value.storyId)||text(value.story?.id)||null,story:plainObject(value.story)?clone(value.story):null});
  }
  if(action.id==='identity.preferences.read'){
    if(value.query!=null&&!text(value.query))issue('format','query','Die Vorlieben-Anfrage ist leer.');
    if(value.query!=null&&text(value.query).length>1000)issue('limit','query','Die Vorlieben-Anfrage ist zu lang.');
    if(value.scope!=null&&value.scope!=='self')issue('enum','scope','Vorlieben dürfen hier nur für das eigene Profil gelesen werden.');
    return finish({query:text(value.query)||null,scope:'self'});
  }
  if(action.id==='identity.preferences.update'){
    if(!plainObject(value.patch)||!Object.keys(value.patch).length)issue('required','patch','Die gewünschte Profiländerung fehlt.');
    else if(Object.keys(value.patch).length>40)issue('limit','patch','Die Profiländerung enthält zu viele Felder.');
    if(value.source!=null&&(typeof value.source!=='string'||!text(value.source)||text(value.source).length>120))issue('format','source','Die Quelle der Profiländerung ist ungültig.');
    if(value.evidenceId!=null&&(!text(value.evidenceId)||text(value.evidenceId).length>240))issue('format','evidenceId','Der Beleg der Profiländerung ist ungültig.');
    return finish({patch:plainObject(value.patch)?clone(value.patch):null,source:text(value.source)||null,evidenceId:text(value.evidenceId)||null});
  }
  if(!text(value.tripId))issue('required','tripId','Die aktive Reise fehlt.');
  if(['places.place.favorite','places.place.unfavorite'].includes(action.id)){
    if(!text(value.providerPlaceId))issue('required','providerPlaceId','Eine verifizierte Provider-ID des Orts fehlt.');
    return finish({tripId:text(value.tripId),providerPlaceId:text(value.providerPlaceId),tripPlaceId:text(value.tripPlaceId)||null});
  }
  if(action.id==='places.place.unplan'){
    if(!text(value.tripPlaceId))issue('required','tripPlaceId','Die Places-eigene Reiseort-ID fehlt.');
    if(value.fields!=null&&!Array.isArray(value.fields)&&(typeof value.fields!=='object'||value.fields===null))issue('type','fields','Die zu entfernenden Planfelder sind ungültig.');
    return finish({tripId:text(value.tripId),tripPlaceId:text(value.tripPlaceId),providerPlaceId:text(value.providerPlaceId)||null});
  }
  if(!text(value.providerPlaceId)&&!text(value.tripPlaceId))issue('required','providerPlaceId|tripPlaceId','Eine verifizierte Owner-ID des Orts fehlt.');
  const date=text(value.date),time=text(value.time),plannedAt=text(value.fields?.planned_at),timeZone=text(context.timeZone);
  if(!date)issue('required','date','Das Datum fehlt.');else if(!validCalendarDate(date))issue('format','date','Das Datum ist ungültig.');
  if(!time)issue('required','time','Die Uhrzeit fehlt.');else if(!validClockTime(time))issue('format','time','Die Uhrzeit ist ungültig.');
  if(!plannedAt)issue('required','fields.planned_at','Der Owner-Zeitpunkt fehlt.');else if(!/(?:z|[+-]\d{2}:?\d{2})$/i.test(plannedAt)||Number.isNaN(Date.parse(plannedAt)))issue('format','fields.planned_at','Der Owner-Zeitpunkt braucht einen eindeutigen UTC-Offset.');
  if(!timeZone)issue('required','context.timeZone','Die Reise-Zeitzone fehlt.');else if(!zonedParts(new Date(0),timeZone))issue('format','context.timeZone','Die Reise-Zeitzone ist ungültig.');
  const canResolve=!issues.some(entry=>['date','time','context.timeZone'].includes(entry.path)),expected=canResolve?zonedDateTimeToIso(date,time,timeZone):null;
  if(canResolve&&!expected)issue('ambiguous','time','Die lokale Uhrzeit ist in dieser Reise-Zeitzone nicht eindeutig oder existiert nicht.');
  if(expected&&plannedAt&&Date.parse(expected)!==Date.parse(plannedAt))issue('conflict','fields.planned_at','Bestätigte Uhrzeit und Owner-Zeitpunkt widersprechen sich.');
  return finish({tripId:text(value.tripId),date,time,timeZone,plannedAt:expected});
}

const ACTIONS=Object.freeze([
  {id:'navigation.route.open',owner:'navigation',ownerContract:'navigation.v1',ownerMethod:'createIntent',effect:'NAVIGATION',risk:'R0',confirmation:'USER_GESTURE',resultKind:'receipt',autoRun:true,reversible:false,idempotency:'OPTIONAL',permissions:['navigation.read'],label:'Bereich öffnen',description:'Öffnet ausschließlich eine im Navigation Owner registrierte Luvia-Route.',consequence:'Wechselt die sichtbare App-Ansicht; verändert keine Reise-, Profil-, Places- oder Buchungsdaten.'},
  {id:'places.restaurant.recommend',owner:'places',ownerContract:'places.v1',ownerMethod:'reads.recommend',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'place_collection',autoRun:true,reversible:false,idempotency:'NONE',permissions:['places.read'],label:'Restaurants finden',description:'Findet und ordnet echte Restaurantkandidaten im aktiven Reisekontext.',consequence:'Liest freigegebene Places-Projektionen; verändert keinen Ort.'},
  {id:'places.discovery.recommend',owner:'places',ownerContract:'places.v1',ownerMethod:'reads.recommend',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'place_collection',autoRun:true,reversible:false,idempotency:'NONE',permissions:['places.read'],label:'Passende Orte finden',description:'Findet kategorienübergreifend echte Places-Kandidaten und lässt sie im Reisekontext persönlich ordnen.',consequence:'Liest freigegebene Places-Projektionen; verändert keinen Ort und löst keine Buchung aus.'},
  {id:'events.verified.read',owner:'intelligence',ownerContract:'intelligence.verified-events.v1',ownerMethod:'reads.listVerified',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'event_collection',autoRun:true,reversible:false,idempotency:'NONE',permissions:['events.read'],label:'Verifizierte Events zeigen',description:'Liest ausschließlich quellverifizierte, frische Event Claims und ihre Places-eigenen Venue-Projektionen.',consequence:'Zeigt belegte Events auf Zeitstrahl und Karte; verändert weder Journey, Booking, Places noch Memory.'},
  {id:'places.place.favorite',owner:'places',ownerContract:'places.v1',ownerMethod:'commands.favorite',effect:'WRITE',risk:'R1',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'places.place.unfavorite',permissions:['places.write'],label:'Als Favorit merken',description:'Delegiert das Merken eines Orts an den Places Owner.',consequence:'Der Ort erscheint nach einer sichtbaren Vorschau und deiner ausdrücklichen Bestätigung als Favorit der aktiven Reise.'},
  {id:'places.place.unfavorite',owner:'places',ownerContract:'places.v1',ownerMethod:'commands.unfavorite',effect:'WRITE',risk:'R1',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'places.place.favorite',permissions:['places.write'],label:'Favorit entfernen',description:'Entfernt einen Favoriten ausschließlich über Places v1.',consequence:'Der Ort bleibt erhalten und wird nach einer sichtbaren Vorschau und deiner ausdrücklichen Bestätigung nicht mehr als Favorit geführt.'},
  {id:'places.place.plan',owner:'places',ownerContract:'places.v1',ownerMethod:'commands.plan',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'places.place.unplan',permissions:['places.write','trip.member'],label:'Zur Timeline hinzufügen',description:'Delegiert die Place-Auswahl an den Places Owner und die Zeitplanung anschließend an Journey.',consequence:'Der bestätigte Ort wird als Reisemoment in die Timeline der aktiven Reise aufgenommen.'},
  {id:'places.place.unplan',owner:'places',ownerContract:'places.v1',ownerMethod:'commands.unplan',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'places.place.plan',permissions:['places.write','trip.member'],label:'Aus Planung entfernen',description:'Entfernt die Place-Planung ausschließlich über Places v1.',consequence:'Der Ort bleibt gespeichert, wird aber aus der Reiseplanung entfernt.'},
  {id:'booking.place.open',owner:'booking',ownerContract:'booking.v1',ownerMethod:'commands.openPlaceBooking',effect:'EXTERNAL',risk:'R1',confirmation:'USER_GESTURE',resultKind:'receipt',reversible:false,idempotency:'OPTIONAL',permissions:['booking.read'],label:'Buchungsweg prüfen',description:'Öffnet den allgemeinen Booking-Owner-Flow für Restaurant, Aktivität, Kultur, Sehenswürdigkeit, Attraktion oder Event.',consequence:'Prüft und öffnet einen belegten Ticket-, Reservierungs- oder Anfrageweg; kauft, reserviert und sendet noch nichts.'},
  {id:'booking.stay.search',owner:'booking',ownerContract:'booking.v1',ownerMethod:'reads.searchStayOffers',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'booking_collection',autoRun:true,reversible:false,idempotency:'NONE',permissions:['booking.read'],label:'Hotels mit Livepreisen vergleichen',description:'Liest Hotelangebote ausschließlich über verbundene Booking-Provider und vergleicht nur vollständige, frische Gesamtpreise für identische Reisedaten.',consequence:'Zeigt belegte Hoteloptionen; verändert keine Reise und löst keine Buchung aus.'},
  {id:'booking.stay.offer.open',owner:'booking',ownerContract:'booking.v1',ownerMethod:'commands.openStayOffer',effect:'EXTERNAL',risk:'R1',confirmation:'USER_GESTURE',resultKind:'receipt',reversible:false,idempotency:'OPTIONAL',permissions:['booking.read'],label:'Ausgewähltes Hotelangebot öffnen',description:'Öffnet ausschließlich den belegten Buchungslink des sichtbar ausgewählten Live-Angebots.',consequence:'Übergibt genau Hotel, Provider, Rate, Reisedaten und Gesamtpreis dieses Angebots an den Booking Owner; bucht und bezahlt noch nichts.'},
  {id:'booking.trip.read',owner:'booking',ownerContract:'booking.v1',ownerMethod:'reads.listForTrip',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'booking_collection',autoRun:true,reversible:false,idempotency:'NONE',permissions:['booking.read'],label:'Buchungen zeigen',description:'Liest Buchungen der aktiven Reise ausschließlich über Booking v1.',consequence:'Zeigt Booking-Projektionen ohne Provideraktion.'},
  {id:'booking.reservation.create',owner:'booking',ownerContract:'booking.v1',ownerMethod:'commands.submitReservation',effect:'EXTERNAL',risk:'R3',confirmation:'EXPLICIT',resultKind:'receipt',reversible:false,idempotency:'REQUIRED',compensation:'booking.owner-recovery',permissions:['booking.write','trip.member'],label:'Buchungsanfrage bestätigen',description:'Übermittelt eine bestätigte Reservierungs- oder Ticketanfrage ausschließlich über den belegten Booking-Owner-Transport.',consequence:'Kann eine Provider-Anfrage oder verifizierte Anbieter-E-Mail auslösen; ein externer Buchungsweg bleibt als erforderlicher Nutzerschritt sichtbar.'},
  {id:'booking.reservation.modify',owner:'booking',ownerContract:'booking.v1',ownerMethod:'commands.modifyBooking',effect:'EXTERNAL',risk:'R3',confirmation:'EXPLICIT',resultKind:'receipt',reversible:false,idempotency:'REQUIRED',compensation:'booking.owner-recovery',permissions:['booking.write','trip.member'],label:'Buchungsänderung bestätigen',description:'Delegiert eine bestätigte Änderung an den Booking Owner.',consequence:'Kann eine bestehende Reservierung bei einem externen Provider ändern.'},
  {id:'booking.reservation.cancel',owner:'booking',ownerContract:'booking.v1',ownerMethod:'commands.cancelBooking',effect:'EXTERNAL',risk:'R3',confirmation:'EXPLICIT',resultKind:'receipt',reversible:false,idempotency:'REQUIRED',compensation:'booking.owner-recovery',permissions:['booking.cancel','trip.member'],label:'Stornierung bestätigen',description:'Delegiert eine bestätigte Stornierung an den Booking Owner.',consequence:'Kann eine bestehende Reservierung extern stornieren; Bedingungen und Folgen müssen sichtbar sein.'},
  {id:'journey.day.read',owner:'journey',ownerContract:'journey.v1',ownerMethod:'reads.snapshot',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'day_plan',autoRun:true,reversible:false,idempotency:'NONE',permissions:['journey.read'],label:'Tagesplan zeigen',description:'Liest den abgeleiteten Day Graph ausschließlich über Journey v1.',consequence:'Zeigt den Journey Day Graph und verändert keine Reiseplanung.'},
  {id:'journey.day.open',owner:'journey',ownerContract:'journey.v1',ownerMethod:'commands.openPlanningEditor',effect:'DRAFT',risk:'R1',confirmation:'USER_GESTURE',resultKind:'receipt',reversible:false,idempotency:'OPTIONAL',permissions:['journey.read'],label:'Tag bearbeiten',description:'Öffnet den Journey-eigenen Planungseditor ohne Intelligence-Mutationsownership.',consequence:'Öffnet einen Entwurf; Änderungen werden erst durch Journey Owner Commands wirksam.'},
  {id:'journey.entry.schedule',owner:'journey',ownerContract:'journey.v1',ownerMethod:'commands.editEntry',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'journey.entry.schedule',permissions:['journey.write','trip.member'],label:'Zeitänderung bestätigen',description:'Ändert einen revisionsgeprüften Timeline-Moment über den zuständigen Journey- oder Places-Owner.',consequence:'Ändert Zeitpunkt und Dauer erst nach Vorschau, Konfliktprüfung und ausdrücklicher Bestätigung.'},
  {id:'journey.entry.remove',owner:'journey',ownerContract:'journey.v1',ownerMethod:'commands.removeEntry',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'journey.entry.restore',permissions:['journey.write','trip.member'],label:'Entfernen bestätigen',description:'Entfernt einen freigegebenen Timeline-Moment über seinen Owner und erzeugt einen dauerhaften Recovery-Beleg.',consequence:'Blendet den Moment aus dem Tagesplan aus; fremde Place-, Booking- und Media-Daten bleiben erhalten.'},
  {id:'journey.entry.restore',owner:'journey',ownerContract:'journey.v1',ownerMethod:'commands.restoreRemovedEntry',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:false,idempotency:'REQUIRED',permissions:['journey.write','trip.member'],label:'Wiederherstellung bestätigen',description:'Stellt einen entfernten Timeline-Moment aus seinem revisionsgeprüften Owner-Beleg wieder her.',consequence:'Schreibt den ursprünglichen Zeitpunkt erst nach erneuter Konfliktprüfung zurück.'},
  {id:'journey.visit.update',owner:'places',ownerContract:'places.v1',ownerMethod:'commands.updateVisit',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'journey.visit.update',permissions:['places.write','trip.member'],label:'Besuchskorrektur bestätigen',description:'Korrigiert Beginn und Dauer eines bestätigten Besuchs ausschließlich über den Places Visit Owner.',consequence:'Ändert den bestätigten Besuch erst nach Vorher/Neu-Vorschau und Prüfung der aktuellen Owner-Revision.'},
  {id:'journey.visit.remove',owner:'places',ownerContract:'places.v1',ownerMethod:'commands.removeVisit',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'journey.visit.restore',permissions:['places.write','trip.member'],label:'Besuch entfernen bestätigen',description:'Entfernt einen bestätigten Besuch über den Places Visit Owner und bewahrt einen dauerhaften Recovery-Beleg.',consequence:'Entfernt nur den Besuch aus der Timeline; Place, Buchungen, Fotos, Memories und Ortsfakten bleiben erhalten.'},
  {id:'journey.visit.restore',owner:'places',ownerContract:'places.v1',ownerMethod:'commands.restoreVisit',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:false,idempotency:'REQUIRED',permissions:['places.write','trip.member'],label:'Besuch wiederherstellen bestätigen',description:'Stellt einen entfernten bestätigten Besuch aus seinem revisionsgeprüften Places-Owner-Beleg wieder her.',consequence:'Ordnet den ursprünglichen bestätigten Besuch erst nach erneuter Owner-Prüfung wieder in die Timeline ein.'},
  {id:'trip.active.list',owner:'trip',ownerContract:'trip.v1',ownerMethod:'reads.listTrips',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'trip_collection',autoRun:true,reversible:false,idempotency:'NONE',permissions:['trip.read'],label:'Reisen zeigen',description:'Liest die freigegebenen Reisen und den aktiven Reisekontext über Trip v1.',consequence:'Zeigt Reisekontext; verändert die aktive Reise nicht.'},
  {id:'trip.active.select',owner:'trip',ownerContract:'trip.v1',ownerMethod:'commands.selectActiveTrip',effect:'WRITE',risk:'R1',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'trip.active.select',permissions:['trip.read'],label:'Reise aktivieren',description:'Wechselt den aktiven Reisekontext ausschließlich über Trip v1.',consequence:'Nach einer sichtbaren Vorschau und deiner ausdrücklichen Bestätigung zeigt die App Daten und Akzentfarbe der gewählten Reise.'},
  {id:'trip.update.details',owner:'trip',ownerContract:'trip.v1',ownerMethod:'commands.updateTrip',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'trip.owner-recovery',permissions:['trip.write','trip.owner'],label:'Reiseänderung bestätigen',description:'Aktualisiert bestätigte Reisedetails ausschließlich über den Trip Owner.',consequence:'Ändert freigegebene Reisedetails für alle berechtigten Mitglieder.'},
  {id:'memory.library.read',owner:'memory',ownerContract:'memory.v1',ownerMethod:'reads.listStories',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'memory_collection',autoRun:true,reversible:false,idempotency:'NONE',permissions:['memory.read'],label:'Erinnerungen zeigen',description:'Liest kuratierte Story-Projektionen ausschließlich über Memory v1.',consequence:'Zeigt Memory-Projektionen; Media Assets bleiben Media-owned.'},
  {id:'memory.story.save',owner:'memory',ownerContract:'memory.v1',ownerMethod:'commands.stories.save',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'memory.owner-recovery',permissions:['memory.write','trip.member'],label:'Geschichte speichern',description:'Speichert eine bestätigte Story über den Memory Owner.',consequence:'Erstellt oder ändert eine kuratierte Reisegeschichte.'},
  {id:'identity.preferences.read',owner:'identity',ownerContract:'identity.v1',ownerMethod:'getPreferences',effect:'READ',risk:'R0',confirmation:'NEVER',resultKind:'preference_summary',autoRun:true,reversible:false,idempotency:'NONE',permissions:['identity.self.read'],label:'Vorlieben zeigen',description:'Liest ausschließlich die bestätigten eigenen Präferenzen über Identity v1.',consequence:'Zeigt eine zusammengefasste Self-only-Projektion.'},
  {id:'identity.preferences.update',owner:'identity',ownerContract:'identity.v1',ownerMethod:'commands.updatePreferences',effect:'WRITE',risk:'R2',confirmation:'EXPLICIT',resultKind:'receipt',reversible:true,idempotency:'REQUIRED',compensation:'identity.owner-recovery',permissions:['identity.self.write'],label:'Vorlieben aktualisieren',description:'Aktualisiert explizit bestätigte eigene Präferenzen über Identity v1.',consequence:'Ändert die bestätigten persönlichen Präferenzen des aktuellen Kontos.'}
].map(definition=>immutable(definition)));

function normalizeAction(definition={}){
  const id=text(definition.id);
  if(!id)throw contractError('INTELLIGENCE_ACTION_ID_REQUIRED','Action id is required.');
  const effect=Object.values(EFFECTS).includes(definition.effect)?definition.effect:EFFECTS.READ;
  const confirmation=Object.values(CONFIRMATION).includes(definition.confirmation)?definition.confirmation:(effect===EFFECTS.READ?CONFIRMATION.NEVER:CONFIRMATION.EXPLICIT);
  const resultKind=Object.values(RESULT_KINDS).includes(definition.resultKind)?definition.resultKind:RESULT_KINDS.MESSAGE;
  const risk=Object.values(RISK).includes(definition.risk)?definition.risk:(effect===EFFECTS.READ?RISK.R0:RISK.R2);
  const permissions=unique(definition.permissions,LIMITS.maxPermissions);
  const idempotency=['NONE','OPTIONAL','REQUIRED'].includes(definition.idempotency)?definition.idempotency:(effect===EFFECTS.READ?'NONE':'REQUIRED');
  return immutable({
    id,owner:text(definition.owner),ownerContract:text(definition.ownerContract),ownerMethod:text(definition.ownerMethod),effect,risk,confirmation,resultKind,
    autoRun:definition.autoRun===true&&risk===RISK.R0&&((effect===EFFECTS.READ&&confirmation===CONFIRMATION.NEVER)||(effect===EFFECTS.NAVIGATION&&confirmation===CONFIRMATION.USER_GESTURE)),
    reversible:definition.reversible===true,idempotency,compensation:text(definition.compensation)||null,permissions,
    label:text(definition.label,id),description:text(definition.description),consequence:text(definition.consequence)
  });
}
function createActionRegistry(initial=ACTIONS){
  const entries=new Map();
  function register(definition={}){const action=normalizeAction(definition);entries.set(action.id,action);return action}
  initial.forEach(register);
  function get(id){const action=entries.get(text(id));return action?immutable(clone(action)):null}
  function list(){return immutable([...entries.values()].map(clone))}
  function diagnostics(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,count:entries.size,actions:list()})}
  return Object.freeze({register,get,list,diagnostics});
}
const registry=createActionRegistry();
function getAction(id){const requested=text(id);return registry.get(ACTION_ALIASES[requested]||requested)}
function listActions(){return registry.list()}
function canAutoRun(action){const definition=typeof action==='string'?getAction(action):normalizeAction(action);return Boolean(definition?.autoRun&&definition.risk===RISK.R0&&((definition.effect===EFFECTS.READ&&definition.confirmation===CONFIRMATION.NEVER)||(definition.effect===EFFECTS.NAVIGATION&&definition.confirmation===CONFIRMATION.USER_GESTURE)))}
function assertExecution(action,{userGesture=false,confirmed=false,ownerCommand=false}={}){
  const definition=typeof action==='string'?getAction(action):normalizeAction(action);
  if(!definition)throw contractError('INTELLIGENCE_ACTION_UNKNOWN','Action is not registered.',{actionId:text(action)});
  if(definition.effect===EFFECTS.READ)return definition;
  if(definition.confirmation===CONFIRMATION.USER_GESTURE&&!userGesture)throw contractError('INTELLIGENCE_USER_GESTURE_REQUIRED','Action requires a direct user gesture.',{actionId:definition.id});
  if(definition.confirmation===CONFIRMATION.EXPLICIT&&!confirmed)throw contractError('INTELLIGENCE_CONFIRMATION_REQUIRED','Action requires explicit confirmation.',{actionId:definition.id});
  if(!ownerCommand)throw contractError('INTELLIGENCE_OWNER_COMMAND_REQUIRED','Action must execute through its owner contract.',{actionId:definition.id,owner:definition.owner});
  return definition;
}

function normalizeActionOffer(value={}){
  const action=getAction(value.actionId||value.id);
  if(!action)return null;
  return immutable({
    actionId:action.id,label:text(value.label,action.label),owner:action.owner,effect:action.effect,risk:action.risk,confirmation:action.confirmation,
    reversible:action.reversible,permissions:action.permissions,consequence:action.consequence,payload:sanitize(value.payload||{}),
    disabled:value.disabled===true,disabledReason:text(value.disabledReason)||null
  });
}
function normalizeImage(value={}){
  const safeUrl=input=>{const url=text(input);return /^https:\/\//i.test(url)?url:null},url=safeUrl(value.url||value.uri||value.imageUrl);
  return url?immutable({url,attribution:text(value.attribution)||null,alt:text(value.alt)||null,provider:text(value.provider)||null,sourceUrl:safeUrl(value.sourceUrl),attributionUrl:safeUrl(value.attributionUrl),transient:value.transient===true}):null;
}
function normalizeProviderRefs(value={}){return Object.fromEntries(Object.entries(value&&typeof value==='object'?value:{}).slice(0,6).map(([provider,id])=>[text(provider).toLowerCase().slice(0,40),text(id).replace(/^places\//,'').slice(0,180)]).filter(([provider,id])=>provider&&id))}
function normalizeProviderEvidence(value=[]){return(Array.isArray(value)?value:[]).slice(0,8).map(item=>({provider:text(item?.provider,'unknown').toLowerCase().slice(0,40),kind:text(item?.kind,'place-fact').toLowerCase().slice(0,80)}))}
function normalizeCoordinates(value={}){
  const source=value?.coordinates||value?.location||value||{},latitude=Number(source.latitude??source.lat),longitude=Number(source.longitude??source.lng);
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude < -90||latitude > 90||longitude < -180||longitude > 180)return null;
  return immutable({latitude,longitude});
}
function normalizeSpatialConstraint(value={}){
  const state=['not-requested','confirmed','contradicted','unknown'].includes(text(value.state))?text(value.state):'not-requested',requested=value.requested&&typeof value.requested==='object'?{explicit:value.requested.explicit===true,prefer:unique(value.requested.prefer,4),avoid:unique(value.requested.avoid,4),source:text(value.requested.source)||null,verifiedBy:text(value.requested.verifiedBy)||null}:null;
  if(state==='not-requested'&&!requested?.explicit)return null;
  return immutable({state,requested,evidence:unique(value.evidence,6),scoreDelta:finite(value.scoreDelta,-200,200,0),reasons:unique(value.reasons,3)});
}
function normalizeAdmission(value={}){
  if(!value||typeof value!=='object'||value.relevant!==true)return null;
  const notice=value.notice&&typeof value.notice==='object'?value.notice:{},action=value.action&&typeof value.action==='object'?value.action:{};
  return immutable({
    kind:text(value.kind)||'other',requirement:text(value.requirement)||'unknown',certainty:text(value.certainty)||'unknown',
    notice:{label:text(notice.label)||'Buchungsweg noch ungeklärt',tone:text(notice.tone)||'quiet',detail:text(notice.detail)||null},
    action:{available:action.available===true,label:text(action.label)||null}
  });
}
function normalizePlace(value={}){
  const providerPlaceId=text(value.providerPlaceId||value.provider_place_id||value.id).replace(/^places\//,'');
  if(!providerPlaceId)return null;
  const actions=(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean);
  return immutable({
    id:text(value.id,providerPlaceId),providerPlaceId,name:text(value.name,'Unbenannter Ort'),description:text(value.description),address:text(value.address||value.formattedAddress),
    primaryType:text(value.primaryType||value.primary_type,'restaurant'),rating:finite(value.rating,0,5),userRatingCount:finite(value.userRatingCount||value.user_rating_count,0,Number.MAX_SAFE_INTEGER,0),
    priceLevel:text(value.priceLevel||value.price_level)||null,openNow:typeof value.openNow==='boolean'?value.openNow:null,coordinates:normalizeCoordinates(value),image:normalizeImage(value.image||{}),spatialConstraint:normalizeSpatialConstraint(value.spatialConstraint||{}),admission:normalizeAdmission(value.admission||{}),
    provider:text(value.provider||value.source).toLowerCase()||null,providerRefs:normalizeProviderRefs(value.providerRefs),providerEvidence:normalizeProviderEvidence(value.providerEvidence||value.evidence),providerObservedAt:text(value.providerObservedAt)||null,ownerObservedAt:text(value.ownerObservedAt)||null,providerFactsCached:value.providerFactsCached===true,providerReadiness:text(value.providerReadiness)||null,distanceMeters:finite(value.distanceMeters,0,1000000),distanceSource:text(value.distanceSource)||null,types:unique(value.types,50),providerNativeTypes:unique(value.providerNativeTypes,50),requestCategory:text(value.requestCategory)||null,
    reasons:unique(value.reasons||value.aiReasons,4),unknowns:unique(value.unknowns||value.aiUnknowns,3),actions
  });
}
function normalizeEvent(value={}){
  const id=text(value.eventClaimId||value.id);if(!id)return null;
  const venue=value.venue&&typeof value.venue==='object'?value.venue:{},coordinates=normalizeCoordinates(venue.coordinates||value.coordinates||{}),sourceRef=text(value.sourceRef);
  return immutable({
    id,eventClaimId:id,title:text(value.title,'Event'),description:text(value.description),category:text(value.category,'event'),startAt:text(value.startAt)||null,endAt:text(value.endAt)||null,timeZone:text(value.timeZone)||null,status:text(value.status,'unknown'),
    venue:{placeId:text(venue.placeId||venue.providerPlaceId)||null,name:text(venue.name)||null,pending:venue.pending===true,coordinates},sourceRef:/^https:\/\//i.test(sourceRef)?sourceRef:null,sourceClass:text(value.sourceClass)||null,sourceNativeId:text(value.sourceNativeId)||null,retrievalReceiptId:text(value.retrievalReceiptId)||null,observedAt:text(value.observedAt)||null,freshUntil:text(value.freshUntil)||null,freshness:text(value.freshness)||null,verificationStatus:text(value.verificationStatus)||null,mapVisibility:coordinates?'visible':'hidden',
    actions:(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean)
  });
}
function normalizeDay(value={}){
  const entries=(Array.isArray(value.entries)?value.entries:[]).slice(0,20).map(entry=>({id:text(entry.id),title:text(entry.title,'Reisemoment'),startAt:text(entry.startAt)||null,endAt:text(entry.endAt)||null,entityType:text(entry.entityType,'place'),owner:text(entry.provenance?.owner||entry.owner,'journey'),actions:(Array.isArray(entry.actions)?entry.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean)}));
  return immutable({date:text(value.date)||null,label:text(value.label||value.date,'Reisetag'),entries,conflictCount:finite(value.conflictCount||value.conflicts?.length,0,100,0)});
}
function normalizeTrip(value={}){
  const id=text(value.id||value.tripId);if(!id)return null;
  return immutable({
    id,title:text(value.title||value.tripName,'Unsere Reise'),destination:text(value.destination?.name||value.destinationName),startDate:text(value.startDate)||null,endDate:text(value.endDate)||null,
    symbol:text(value.symbol,'✦'),accent:text(value.accent,'#ee6f83'),active:value.active===true,isOwner:value.isOwner===true,
    actions:(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean)
  });
}
function normalizeBooking(value={}){
  const id=text(value.id||value.bookingId||value.booking_id);if(!id)return null;
  const place=value.place&&typeof value.place==='object'?value.place:{};
  return immutable({
    id,tripId:text(value.tripId||value.trip_id)||null,title:text(value.title||value.venueName||value.restaurantName||place.name,'Buchung'),status:text(value.status||value.bookingStatus,'unknown'),
    date:text(value.date||value.reservationDate||value.reservation_date)||null,time:text(value.time||value.reservationTime||value.reservation_time)||null,partySize:finite(value.partySize||value.party_size,1,100),
    provider:text(value.provider||value.providerId||value.provider_id)||null,channel:text(value.channel)||null,
    propertyKey:text(value.propertyKey||value.canonicalPropertyId)||null,offerCount:finite(value.offerCount,0,1000,0),totalPrice:finite(value.totalPrice??value.bestAvailableTotal?.price?.total,0,100000000),currency:text(value.currency||value.bestAvailableTotal?.price?.currency).toUpperCase()||null,refundable:value.refundable===true||value.bestFlexibleOffer?.cancellation?.refundable===true,priceSource:text(value.priceSource||value.bestAvailableTotal?.source)||null,
    actions:(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean)
  });
}
function normalizeMemory(value={}){
  const id=text(value.id||value.storyId);if(!id)return null;
  return immutable({id,title:text(value.title||value.name,'Reisegeschichte'),status:text(value.status,'draft'),summary:text(value.summary||value.description),coverImage:normalizeImage(value.coverImage||value.image||{}),updatedAt:text(value.updatedAt||value.updated_at)||null,actions:(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean)});
}
function normalizePreferenceSummary(value={}){
  const categories=(Array.isArray(value.categories)?value.categories:Object.entries(value).map(([id,item])=>({id,count:Array.isArray(item)?item.length:(item==null||item===''?0:1)}))).slice(0,20).map(category=>immutable({id:text(category.id||category.key),label:text(category.label||category.id||category.key),count:finite(category.count,0,1000,0),configured:category.configured===true||Number(category.count)>0})).filter(category=>category.id);
  return immutable({categories,configuredCount:categories.filter(category=>category.configured).length,scope:'self',actions:(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean)});
}
function normalizeResult(value={}){
  const kind=Object.values(RESULT_KINDS).includes(value.kind)?value.kind:RESULT_KINDS.MESSAGE;
  const raw=(Array.isArray(value.items)?value.items:[]).slice(0,LIMITS.maxItems);
  const items=kind===RESULT_KINDS.PLACE_COLLECTION?raw.map(normalizePlace).filter(Boolean):kind===RESULT_KINDS.EVENT_COLLECTION?raw.map(normalizeEvent).filter(Boolean):kind===RESULT_KINDS.DAY_PLAN?raw.map(normalizeDay):kind===RESULT_KINDS.TRIP_COLLECTION?raw.map(normalizeTrip).filter(Boolean):kind===RESULT_KINDS.BOOKING_COLLECTION?raw.map(normalizeBooking).filter(Boolean):kind===RESULT_KINDS.MEMORY_COLLECTION?raw.map(normalizeMemory).filter(Boolean):[];
  const actions=(Array.isArray(value.actions)?value.actions:[]).slice(0,LIMITS.maxActions).map(normalizeActionOffer).filter(Boolean);
  const summary=kind===RESULT_KINDS.PREFERENCE_SUMMARY?normalizePreferenceSummary(value.summary||value.data||{}):null;
  return immutable({id:text(value.id)||null,kind,owner:text(value.owner,'intelligence'),contractId:text(value.contractId,CONTRACT_ID),title:text(value.title),message:text(value.message),items,summary,actions,evidence:sanitize(value.evidence||{}),meta:sanitize(value.meta||{})});
}
function createActionRequest(actionId,input={},context={}){
  const action=getAction(actionId);
  if(!action)throw contractError('INTELLIGENCE_ACTION_UNKNOWN','Action is not registered.',{actionId});
  return immutable({contractId:CONTRACT_ID,version:VERSION,actionId:action.id,owner:action.owner,ownerContract:action.ownerContract,ownerMethod:action.ownerMethod,effect:action.effect,risk:action.risk,confirmation:action.confirmation,reversible:action.reversible,idempotency:action.idempotency,permissions:action.permissions,input:sanitize(input||{}),context:sanitize(context||{})});
}
function createExecutionEnvelope(actionId,input={},context={},options={}){
  const request=createActionRequest(actionId,input,context),idempotencyKey=text(options.idempotencyKey),correlationId=text(options.correlationId);
  if(request.idempotency==='REQUIRED'&&!idempotencyKey)throw contractError('INTELLIGENCE_ACTION_IDEMPOTENCY_REQUIRED','Action requires an idempotency key.',{actionId:request.actionId});
  if(!correlationId)throw contractError('INTELLIGENCE_ACTION_CORRELATION_REQUIRED','Action requires a correlation id.',{actionId:request.actionId});
  return immutable({...request,idempotencyKey:idempotencyKey||null,correlationId,requestedAt:text(options.requestedAt)||null,source:text(options.source||context.surface,'global-chat')});
}
function createConfirmation(input={}){
  const action=getAction(input.actionId);
  if(!action)throw contractError('INTELLIGENCE_ACTION_UNKNOWN','Confirmation action is not registered.',{actionId:input.actionId});
  if(action.confirmation!==CONFIRMATION.EXPLICIT)throw contractError('INTELLIGENCE_ACTION_CONFIRMATION_NOT_REQUIRED','Action does not require explicit confirmation.',{actionId:action.id});
  return normalizeResult({
    id:text(input.id)||null,kind:RESULT_KINDS.CONFIRMATION,owner:action.owner,contractId:action.ownerContract,
    title:text(input.title,action.label),message:text(input.message,action.consequence),
    evidence:{actionId:action.id,effect:action.effect,risk:action.risk,reversible:action.reversible,permissions:action.permissions,consequence:action.consequence,ledgerId:text(input.ledgerId),correlationId:text(input.correlationId),idempotencyKey:text(input.idempotencyKey),expiresAt:text(input.expiresAt)||null,preview:sanitize(input.preview||{})},
    meta:{requiresConfirmation:true,actionId:action.id,ledgerId:text(input.ledgerId)}
  });
}
function createReceipt(input={}){
  const action=getAction(input.actionId);
  if(!action)throw contractError('INTELLIGENCE_ACTION_UNKNOWN','Receipt action is not registered.',{actionId:input.actionId});
  const status=RECEIPT_STATUSES.includes(input.status)?input.status:'completed';
  return normalizeResult({id:text(input.id)||null,kind:RESULT_KINDS.RECEIPT,owner:action.owner,contractId:action.ownerContract,title:text(input.title,action.label),message:text(input.message),actions:input.actions||[],evidence:{status,actionId:action.id,effect:action.effect,risk:action.risk,reversible:action.reversible,ownerCommand:input.ownerCommand===true,occurredAt:text(input.occurredAt)||null,ledgerId:text(input.ledgerId)||null,correlationId:text(input.correlationId)||null,idempotencyKey:text(input.idempotencyKey)||null,retryable:input.retryable===true,outcomeUnknown:input.outcomeUnknown===true,compensationStatus:text(input.compensationStatus)||null,reference:sanitize(input.reference||{})},meta:input.meta||{}});
}
function createCapabilitySnapshot(availability={}){
  const actions=listActions().map(action=>{
    const state=availability[action.id]??availability[action.ownerContract]??false;
    const available=state===true||state?.available===true;
    return immutable({actionId:action.id,owner:action.owner,ownerContract:action.ownerContract,ownerMethod:action.ownerMethod,effect:action.effect,risk:action.risk,confirmation:action.confirmation,permissions:action.permissions,reversible:action.reversible,idempotency:action.idempotency,available,reason:available?null:text(state?.reason,'owner-binding-unavailable')});
  });
  return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,count:actions.length,available:actions.filter(action=>action.available).length,actions});
}
function routeIntents(message=''){
  const request=text(message);if(!request)return null;
  const routes=[],push=(actionId,input={})=>{if(!routes.some(route=>route.actionId===actionId))routes.push({actionId,input:{query:request,...input}})};
  const navigation=(()=>{if(/\b(?:meine|unsere)\s+reise\s+wechseln\b/i.test(request))return null;if(!/(?:^|[\s,.;!?])(?:öffne|oeffne|offne|gehe?|wechsel|navigier|zeige\s+(?:mir\s+)?(?:den|die|das)\s+(?:bereich|seite|ansicht))\w*(?:\s|$)/i.test(request))return null;const patterns=[['hotels',/\b(?:hotels?|stays?|unterk[uü]nfte?|accommodations?)\b/i],['control-center-bookings',/\b(?:booking\s*control\s*center|buchungszentrale)\b/i],['control-center-inbox',/\b(?:booking\s*inbox|buchungsnachrichten|anbieter(?:nachrichten|chat))\b/i],['bookings',/\b(?:buchungen?|reservierungen?)\b/i],['timeline',/\b(?:timeline|tagesplan|reiseplan)\b/i],['places-lifecycle',/\b(?:meine\s+orte|orteleben|places?\s*lebenszyklus)\b/i],['places',/\b(?:places?|orte|entdecken)\b/i],['gallery',/\b(?:galerie|fotos?)\b/i],['albums',/\b(?:alben|albums?|stories)\b/i],['memories',/\b(?:erinnerungen?|memories)\b/i],['trip',/\b(?:reise(?:ansicht|bereich)?)\b/i],['routes',/\b(?:routen?|wege)\b/i],['plan',/\b(?:planen|planung)\b/i],['today',/\b(?:heute|dashboard|startseite)\b/i],['more',/\b(?:mehr|einstellungen)\b/i],['control-center-identity',/\b(?:identit[aä]t|datenschutz)\b/i],['profile-onboarding',/\b(?:profilkompass|reisekompass|profil\s*onboarding)\b/i],['first-trip-composer',/\b(?:reise\s+erstellen|neue\s+reise)\b/i],['control-center',/\b(?:control\s*center|kontrollzentrum)\b/i]];return patterns.find(([,pattern])=>pattern.test(request))?.[0]||null})();
  if(navigation){push('navigation.route.open',{route:navigation,source:'global-chat'});return immutable(routes)}
  const food=/\b(restaurant|restaurants|essen|abendessen|mittagessen|frühstück|café|cafe|bistro|pizzeria|pizza|sushi|tisch|kulinar\w*|genuss)\b/i.test(request);
  const categories=[];
  const eventRequest=/\b(event|events|veranstaltung(?:en)?|festival|konzert(?:e)?|live[- ]?musik|wochenmarkt|aufführung|auffuehrung|spielplan|eventkalender)\b/i.test(request);
  const staySearch=/\b(hotel|hotels|unterkunft|unterkünfte|unterkuenfte|hostel|pension|resort|übernachten|uebernachten)\b/i.test(request)&&/\b(find\w*|such\w*|vergleich\w*|preis\w*|günstig\w*|guenstig\w*|buchbar\w*|verfügbar\w*|verfuegbar\w*|empfiehl\w*|zeig\w*)\b/i.test(request);
  if(staySearch)push('booking.stay.search');
  if(eventRequest)push('events.verified.read',{limit:12});
  if(food)categories.push('food');
  if(/\b(strand|meer|natur|park|garten|wandern|erholung|draußen)\b/i.test(request))categories.push('nature');
  if(/\b(museum|kultur|geschichte|galerie|theater|konzert|sehenswürdig\w*|attraktion)\b/i.test(request))categories.push('culture');
  if(/\b(aktivität|aktivitaet|erlebnis|schwimmbad|zoo|aquarium|sport|abenteuer)\b/i.test(request))categories.push('activities');
  if(/\b(shopping|einkaufen|markt|boutique|geschäft)\b/i.test(request))categories.push('shopping');
  if(/\b(nachtleben|club|bar|tanzen|live.?musik)\b/i.test(request))categories.push('nightlife');
  if(!staySearch&&/\b(buchung(?:en)?|reservierung(?:en)?|stornier\w*|umbuch\w*|booking)\b/i.test(request))push('booking.trip.read',{intent:/stornier/i.test(request)?'cancel':/umbuch|änder/i.test(request)?'modify':'list'});
  if(/\b(meine\s+reisen|reisen\s+zeigen|reise\s+wechseln|wechs(?:le|eln?)\s+(?:die|zur)\s+reise|aktive\s+reise)\b/i.test(request))push('trip.active.list');
  if(/\b(erinnerung(?:en)?|reisegeschicht(?:e|en)|story|stories|album|alben)\b/i.test(request))push('memory.library.read');
  if(/\b(vorlieb(?:e|en)|präferenz(?:en)?|reisesti(?:l|le)|interessen)\b/i.test(request))push('identity.preferences.read');
  if(categories.length&&(!eventRequest||categories.some(category=>category!=='culture'&&category!=='nightlife')))push(categories.length===1&&categories[0]==='food'?'places.restaurant.recommend':'places.discovery.recommend',{category:categories[0]||'places',categories:[...new Set(categories)],limit:Math.min(8,Math.max(4,categories.length*2))});
  if(/\b(tagesplan|timeline|tag\s+planen|plan(?:e|t|en)?\b.{0,64}\btag|heute\s+(?:machen|unternehmen)|vorschl\w*\s+(?:für\s+)?(?:den\s+)?tag|\b(?:um|gegen)\s+\d{1,2}(?::\d{2})?\s*uhr)\b/i.test(request))push('journey.day.read');
  return immutable(routes);
}
function routeIntent(message=''){
  return routeIntents(message)?.[0]||null;
}
function policySnapshot(){return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,effects:EFFECTS,risk:RISK,confirmation:CONFIRMATION,actionCount:ACTIONS.length,autoRun:'registered-read-or-user-navigation-only',autoRunRisk:'R0-only',writeExecution:'every-write-preview-plus-explicit-confirmation-plus-owner-command-plus-receipt',explicitConfirmation:'natural-language-alone-is-never-confirmation',idempotency:'required-for-owner-mutations',inputEnforcement:{runtimeEnforced:Object.keys(INPUT_CONTRACTS),remaining:ACTIONS.length-Object.keys(INPUT_CONTRACTS).length},unknownExternalOutcome:'owner-reconciliation-before-retry',undo:'registered-owner-compensation-only',foreignDomainMutation:false,journeyTimelineOwner:false,limits:LIMITS})}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,effects:EFFECTS,risk:RISK,confirmation:CONFIRMATION,resultKinds:RESULT_KINDS,immutable,sanitize,normalizeAction,createActionRegistry,getAction,listActions,canAutoRun,assertExecution,validateActionInput,zonedDateTimeToIso,normalizeActionOffer,normalizeCoordinates,normalizePlace,normalizeEvent,normalizeDay,normalizeTrip,normalizeBooking,normalizeMemory,normalizePreferenceSummary,normalizeResult,createActionRequest,createExecutionEnvelope,createConfirmation,createReceipt,createCapabilitySnapshot,routeIntent,routeIntents,policySnapshot});
})();
