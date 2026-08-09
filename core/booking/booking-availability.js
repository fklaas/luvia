(function(){
'use strict';
const VERSION='1.0.0';
const clean=v=>String(v??'').trim();
async function client(){return window.LuviaSupabaseService?.start?.();}
function normalizeInput(input={}){
  const providerId=clean(input.providerId||input.provider_id).toLowerCase();
  const venueReference=clean(input.venueReference||input.venue_reference);
  const date=clean(input.date||input.requestedDate);
  const time=clean(input.time||input.requestedTime);
  const partySize=Number(input.partySize||input.party_size);
  if(!providerId)throw new Error('Provider fehlt.');
  if(!venueReference)throw new Error('Venue-Referenz fehlt.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Gültiges Datum fehlt.');
  if(!Number.isInteger(partySize)||partySize<1)throw new Error('Personenzahl ist ungültig.');
  return {providerId,venueReference,date,time:time||null,partySize,timezone:clean(input.timezone)||null,tripId:clean(input.tripId||input.trip_id)||null,bookingId:clean(input.bookingId||input.booking_id)||null};
}
async function check(input){
  const c=await client();if(!c)throw new Error('Supabase ist nicht bereit.');
  const body=normalizeInput(input);
  const {data,error}=await c.functions.invoke('booking-provider-availability',{body});
  if(error)throw error;
  return data;
}
async function readiness(providerId=null){
  const c=await client();if(!c)throw new Error('Supabase ist nicht bereit.');
  let q=c.from('booking_provider_availability_readiness_v1').select('*').order('provider_id');
  if(clean(providerId))q=q.eq('provider_id',clean(providerId).toLowerCase());
  const {data,error}=await q;if(error)throw error;return data||[];
}
window.LuviaBookingAvailability=Object.freeze({version:VERSION,check,readiness,normalizeInput});
})();
