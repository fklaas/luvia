var LuviaBookingDraftCoreV1=(()=>{
'use strict';

const VERSION='1.0.0';
const FIELDS=Object.freeze(['date','time','partySize','occasion','note','contact','route']);
const clean=value=>String(value??'').trim();
function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function fail(code,message){throw Object.assign(new Error(message),{code})}
function date(value){const result=clean(value);if(result&&!/^\d{4}-\d{2}-\d{2}$/.test(result))fail('BOOKING_DRAFT_DATE_INVALID','Datum muss im Format JJJJ-MM-TT vorliegen.');return result||null}
function time(value){const result=clean(value);if(result&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(result))fail('BOOKING_DRAFT_TIME_INVALID','Uhrzeit muss im Format HH:MM vorliegen.');return result||null}
function partySize(value){if(value==null||value==='')return null;const result=Number(value);if(!Number.isInteger(result)||result<1||result>1000)fail('BOOKING_DRAFT_PARTY_SIZE_INVALID','Personenzahl muss zwischen 1 und 1000 liegen.');return result}
function shortText(value,max,code,label){const result=clean(value);if(result.length>max)fail(code,`${label} ist zu lang.`);return result||null}
function contact(value){
  if(value==null||value==='')return null;
  const input=typeof value==='string'?{email:value}:value;
  if(!input||typeof input!=='object'||Array.isArray(input))fail('BOOKING_DRAFT_CONTACT_INVALID','Kontaktdaten sind ungültig.');
  const email=clean(input.email).toLowerCase(),phone=clean(input.phone),name=clean(input.name);
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail('BOOKING_DRAFT_CONTACT_INVALID','E-Mail-Adresse ist ungültig.');
  if(!email&&!phone)fail('BOOKING_DRAFT_CONTACT_REQUIRED','E-Mail-Adresse oder Telefonnummer fehlt.');
  return immutable({name:name.slice(0,120),email,phone:phone.slice(0,60)});
}
function route(value){
  if(value==null||value==='')return null;
  const input=typeof value==='string'?{channel:value}:value;
  if(!input||typeof input!=='object'||Array.isArray(input))fail('BOOKING_DRAFT_ROUTE_INVALID','Buchungsweg ist ungültig.');
  const channel=clean(input.channel||input.type),provider=clean(input.provider),url=clean(input.url||input.value);
  if(!channel&&!provider&&!url)fail('BOOKING_DRAFT_ROUTE_REQUIRED','Ein konkreter Buchungsweg fehlt.');
  if(url&&!/^https?:\/\//i.test(url))fail('BOOKING_DRAFT_ROUTE_URL_INVALID','Externer Buchungsweg muss eine sichere Webadresse sein.');
  return immutable({channel:channel.slice(0,80),provider:provider.slice(0,80),url:url.slice(0,2000),providerReference:clean(input.providerReference).slice(0,200)});
}
function normalizeField(field,value){
  if(field==='date')return date(value);
  if(field==='time')return time(value);
  if(field==='partySize')return partySize(value);
  if(field==='occasion')return shortText(value,160,'BOOKING_DRAFT_OCCASION_INVALID','Anlass');
  if(field==='note')return shortText(value,2000,'BOOKING_DRAFT_NOTE_INVALID','Notiz');
  if(field==='contact')return contact(value);
  if(field==='route')return route(value);
  fail('BOOKING_DRAFT_FIELD_INVALID',`Unbekanntes Buchungsfeld: ${field}`);
}
function createDraft(input={}){
  const result={};
  for(const field of FIELDS)result[field]=normalizeField(field,input[field]);
  return immutable(result);
}
function updateDraft(current={},patch={}){
  if(!patch||typeof patch!=='object'||Array.isArray(patch))fail('BOOKING_DRAFT_PATCH_INVALID','Buchungsänderung ist ungültig.');
  const unknown=Object.keys(patch).filter(field=>!FIELDS.includes(field));
  if(unknown.length)fail('BOOKING_DRAFT_FIELD_INVALID',`Unbekannte Buchungsfelder: ${unknown.join(', ')}`);
  const next={...createDraft(current)};
  for(const [field,value] of Object.entries(patch))next[field]=normalizeField(field,value);
  return immutable(next);
}
function validateDraft(input={},required=['date','time','partySize']){
  const draft=createDraft(input),missing=(required||[]).filter(field=>FIELDS.includes(field)&&draft[field]==null);
  return immutable({valid:missing.length===0,missing,draft});
}
function selectRoute(current={},value){return updateDraft(current,{route:value})}
function composeMessageDraft(input={}){
  const bookingId=clean(input.bookingId||input.id),bodyText=clean(input.bodyText||input.message);
  if(!bookingId)fail('BOOKING_MESSAGE_BOOKING_REQUIRED','Booking-ID fehlt.');
  if(!bodyText)fail('BOOKING_MESSAGE_BODY_REQUIRED','Nachricht darf nicht leer sein.');
  if(bodyText.length>4000)fail('BOOKING_MESSAGE_BODY_INVALID','Nachricht ist zu lang.');
  return immutable({bookingId,bodyText,action:clean(input.action)||null,intelligenceId:clean(input.intelligenceId)||null,state:'draft',stateChanging:false});
}
function diagnostics(){return immutable({version:VERSION,browserless:true,fields:FIELDS,messageSending:false});}
return Object.freeze({version:VERSION,fields:FIELDS,createDraft,updateDraft,validateDraft,selectRoute,composeMessageDraft,diagnostics});
})();
