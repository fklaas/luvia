(function(){
'use strict';
const VERSION='1.2.0';
const clean=v=>String(v??'').trim();
async function client(){return window.LuviaSupabaseService?.start?.();}
function normalizeModifyInput(input={}){
  const bookingId=clean(input.bookingId||input.booking_id);
  const date=clean(input.date||input.requestedDate);
  const time=clean(input.time||input.requestedTime);
  const rawParty=input.partySize??input.party_size;
  const partySize=rawParty==null||rawParty===''?null:Number(rawParty);
  if(!bookingId)throw new Error('Booking-ID fehlt.');
  if(!date&&!time&&partySize==null)throw new Error('Mindestens eine Änderung ist erforderlich.');
  if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Datum ist ungültig.');
  if(time&&!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time))throw new Error('Uhrzeit ist ungültig.');
  if(partySize!=null&&(!Number.isInteger(partySize)||partySize<1||partySize>1000))throw new Error('Personenzahl ist ungültig.');
  return {action:'modify',bookingId,date:date||null,time:time||null,partySize,timezone:clean(input.timezone)||null,notes:clean(input.notes)||null,idempotencyKey:clean(input.idempotencyKey||input.idempotency_key)||null};
}
function normalizeCancelInput(input={}){
  const bookingId=clean(input.bookingId||input.booking_id);
  if(!bookingId)throw new Error('Booking-ID fehlt.');
  return {action:'cancel',bookingId,reason:clean(input.reason)||null,idempotencyKey:clean(input.idempotencyKey||input.idempotency_key)||null};
}
async function invoke(body){
  const c=await client();if(!c)throw new Error('Supabase ist nicht bereit.');
  const {data,error}=await c.functions.invoke('booking-provider-reservation-mutation',{body});
  if(error){
    try{const payload=error.context&&typeof error.context.json==='function'?await error.context.json():null;if(payload?.expected===true)return payload;if(payload?.error){const e=new Error(payload.error);e.code=payload.error;e.details=payload.details||null;throw e}}catch(parsed){if(parsed instanceof Error&&parsed!==error)throw parsed}
    throw error;
  }
  return data;
}
async function modify(input){return invoke(normalizeModifyInput(input));}
async function cancel(input){return invoke(normalizeCancelInput(input));}
async function readiness(providerId=null,action='modify'){
  const c=await client();if(!c)throw new Error('Supabase ist nicht bereit.');
  const mode=clean(action).toLowerCase()==='cancel'?'cancel':'modify';
  const view=mode==='cancel'?'booking_provider_reservation_cancel_readiness_v1':'booking_provider_reservation_modify_readiness_v1';
  let q=c.from(view).select('*').order('provider_id');
  if(clean(providerId))q=q.eq('provider_id',clean(providerId).toLowerCase());
  const {data,error}=await q;if(error)throw error;return data||[];
}
window.LuviaBookingReservationMutation=Object.freeze({version:VERSION,modify,cancel,readiness,normalizeModifyInput,normalizeCancelInput});
})();
