var LuviaBookingDraftCoreV1=(()=>{
'use strict';

const VERSION='1.1.0-universal-stay';
const FIELDS=Object.freeze(['bookingType','date','time','partySize','occasion','note','contact','route','checkIn','checkOut','rooms','adults','children','childAges','roomType','board','flexibleDates','currency','maxTotalPrice','cancellationPreference','paymentPreference','amenities','accessibility']);
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
function boundedInteger(value,{min=0,max=100,nullable=true,label='Wert',code='BOOKING_DRAFT_NUMBER_INVALID'}={}){if(value==null||value==='')return nullable?null:min;const result=Number(value);if(!Number.isInteger(result)||result<min||result>max)fail(code,`${label} muss zwischen ${min} und ${max} liegen.`);return result}
function bookingType(value){const result=clean(value).toLowerCase();if(!result)return null;const aliases={accommodation:'hotel',lodging:'hotel',stay:'hotel',restaurant:'restaurant',dining:'restaurant',attraction:'activity',culture:'activity',event:'event',rental:'rental',transport:'transport'};return aliases[result]||result.slice(0,40)}
function list(value,max=40){if(value==null||value==='')return Object.freeze([]);const values=Array.isArray(value)?value:[value];return immutable([...new Set(values.map(clean).filter(Boolean).map(item=>item.slice(0,120)))].slice(0,max))}
function childAges(value){const values=Array.isArray(value)?value:[];return immutable(values.map(Number).filter(age=>Number.isInteger(age)&&age>=0&&age<=17).slice(0,30))}
function currency(value){const result=clean(value).toUpperCase();if(result&&!/^[A-Z]{3}$/.test(result))fail('BOOKING_DRAFT_CURRENCY_INVALID','Währung muss als dreistelliger ISO-Code vorliegen.');return result||null}
function amount(value){if(value==null||value==='')return null;const result=Number(value);if(!Number.isFinite(result)||result<=0||result>10000000)fail('BOOKING_DRAFT_PRICE_INVALID','Der maximale Gesamtpreis ist ungültig.');return Math.round(result*100)/100}
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
  if(field==='bookingType')return bookingType(value);
  if(field==='date')return date(value);
  if(field==='time')return time(value);
  if(field==='partySize')return partySize(value);
  if(field==='occasion')return shortText(value,160,'BOOKING_DRAFT_OCCASION_INVALID','Anlass');
  if(field==='note')return shortText(value,2000,'BOOKING_DRAFT_NOTE_INVALID','Notiz');
  if(field==='contact')return contact(value);
  if(field==='route')return route(value);
  if(field==='checkIn'||field==='checkOut')return date(value);
  if(field==='rooms')return boundedInteger(value,{min:1,max:30,label:'Zimmeranzahl',code:'BOOKING_DRAFT_ROOMS_INVALID'});
  if(field==='adults')return boundedInteger(value,{min:1,max:100,label:'Anzahl Erwachsene',code:'BOOKING_DRAFT_ADULTS_INVALID'});
  if(field==='children')return boundedInteger(value,{min:0,max:30,nullable:false,label:'Anzahl Kinder',code:'BOOKING_DRAFT_CHILDREN_INVALID'});
  if(field==='childAges')return childAges(value);
  if(field==='roomType')return shortText(value,160,'BOOKING_DRAFT_ROOM_TYPE_INVALID','Zimmertyp');
  if(field==='board')return shortText(value,160,'BOOKING_DRAFT_BOARD_INVALID','Verpflegung');
  if(field==='flexibleDates')return value===true;
  if(field==='currency')return currency(value);
  if(field==='maxTotalPrice')return amount(value);
  if(field==='cancellationPreference')return shortText(value,200,'BOOKING_DRAFT_CANCELLATION_INVALID','Stornopräferenz');
  if(field==='paymentPreference')return shortText(value,200,'BOOKING_DRAFT_PAYMENT_INVALID','Zahlungspräferenz');
  if(field==='amenities'||field==='accessibility')return list(value);
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
function validateDraft(input={},required){
  const draft=createDraft(input),isHotel=draft.bookingType==='hotel';
  required=required|| (isHotel?['checkIn','checkOut','rooms','adults']:['date','time','partySize']);
  const missing=(required||[]).filter(field=>FIELDS.includes(field)&&(draft[field]==null||(Array.isArray(draft[field])&&!draft[field].length)));
  const issues=[];
  if(isHotel&&draft.checkIn&&draft.checkOut&&draft.checkOut<=draft.checkIn)issues.push({code:'BOOKING_DRAFT_STAY_RANGE_INVALID',field:'checkOut',message:'Check-out muss nach dem Check-in liegen.'});
  if(isHotel&&draft.children>(draft.childAges?.length||0))issues.push({code:'BOOKING_DRAFT_CHILD_AGES_REQUIRED',field:'childAges',message:'Für jedes Kind wird das Alter benötigt.'});
  return immutable({valid:missing.length===0&&issues.length===0,missing,issues,draft});
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
