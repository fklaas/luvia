(function(){
'use strict';
const VERSION='1.1.0';
const clean=v=>String(v??'').trim().toLowerCase();
async function client(){return window.LuviaSupabaseService?.start?.();}
async function health(providerId=null){const c=await client();if(!c)throw new Error('Supabase ist nicht bereit.');const body=providerId?{providerId:clean(providerId)}:{action:'all'};const {data,error}=await c.functions.invoke('booking-provider-connection-health',{body});if(error)throw error;return data;}
async function readiness(){const c=await client();if(!c)throw new Error('Supabase ist nicht bereit.');const {data,error}=await c.from('booking_provider_connection_readiness_v3').select('*').order('provider_id');if(error)throw error;return data||[];}
window.LuviaBookingProviderConnections=Object.freeze({version:VERSION,health,readiness});
})();
