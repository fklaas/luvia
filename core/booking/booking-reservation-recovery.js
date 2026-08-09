(function(){
'use strict';
const VERSION='1.0.0';
const clean=v=>String(v??'').trim();
async function client(){return window.LuviaSupabaseService?.start?.();}
function mutation(input={},mode='get'){
  const action=clean(input.action).toLowerCase(); const requestId=clean(input.requestId||input.request_id);
  if(action!=='modify'&&action!=='cancel')throw new Error('Mutation-Action muss modify oder cancel sein.');
  if(!requestId)throw new Error('Mutation Request-ID fehlt.');
  return {mode,action,requestId,limit:mode==='history'?Math.min(Math.max(Number(input.limit)||25,1),100):undefined};
}
async function invoke(body){const c=await client();if(!c)throw new Error('Supabase ist nicht bereit.');const {data,error}=await c.functions.invoke('booking-provider-reservation-reconcile',{body});if(error)throw error;return data;}
async function get(input){return invoke(mutation(input,'get'));}
async function reconcile(input){return invoke(mutation(input,'reconcile'));}
async function history(input){return invoke(mutation(input,'history'));}
async function list(input={}){const action=clean(input.action).toLowerCase();return invoke({mode:'list',action:action==='modify'||action==='cancel'?action:undefined,limit:Math.min(Math.max(Number(input.limit)||25,1),100)});}
window.LuviaBookingReservationRecovery=Object.freeze({version:VERSION,get,list,reconcile,history});
})();
