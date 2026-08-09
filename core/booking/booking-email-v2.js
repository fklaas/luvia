(function(){
'use strict';
const VERSION='1.0.2';
const clean=v=>String(v??'').trim();
async function client(){return window.LuviaSupabaseService?.start?.();}
async function invoke(action,input={}){const c=await client();if(!c)throw new Error('Supabase ist nicht bereit.');const body={action,...input};const {data,error}=await c.functions.invoke('booking-email-runtime',{body});if(error)throw error;return data;}
async function readiness(input={}){const bookingId=clean(input.bookingId||input.booking_id);if(!bookingId)throw new Error('Booking-ID fehlt.');return invoke('readiness',{bookingId});}
async function get(input={}){const bookingId=clean(input.bookingId||input.booking_id);if(!bookingId)throw new Error('Booking-ID fehlt.');return invoke('get',{bookingId});}
async function history(input={}){const bookingId=clean(input.bookingId||input.booking_id);if(!bookingId)throw new Error('Booking-ID fehlt.');return invoke('history',{bookingId});}
async function queue(input={}){return invoke('queue',{tripId:clean(input.tripId||input.trip_id)||undefined});}
async function send(input={}){const bookingId=clean(input.bookingId||input.booking_id);if(!bookingId)throw new Error('Booking-ID fehlt.');const c=await client();if(!c)throw new Error('Supabase ist nicht bereit.');const {data,error}=await c.functions.invoke('booking-email-send',{body:{bookingId,userApproved:true,requesterName:input.requesterName||undefined,note:input.note||undefined,testRecipient:input.testRecipient||undefined,idempotencyKey:input.idempotencyKey||undefined}});if(error)throw error;return data;}
window.LuviaBookingEmailV2=Object.freeze({version:VERSION,readiness,get,history,queue,send});
})();
