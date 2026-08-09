(function(){
'use strict';
const VERSION='3.0.0';
const clean=v=>String(v??'').trim().toLowerCase();
async function client(){return window.LuviaSupabaseService?.start?.();}
async function invoke(action,providerId=null,extra={}){const c=await client();if(!c)throw new Error('Supabase ist nicht bereit.');const body={action,...extra};if(providerId)body.providerId=clean(providerId);const {data,error}=await c.functions.invoke('booking-provider-connection-health',{body});if(error)throw error;return data;}
async function health(providerId=null){return invoke('health',providerId);}
async function probe(providerId){if(!clean(providerId))throw new Error('Provider fehlt.');return invoke('probe',providerId);}
async function activate(providerId,{confirmActivation=false}={}){if(!clean(providerId))throw new Error('Provider fehlt.');return invoke('activate',providerId,{confirmActivation:Boolean(confirmActivation)});}
async function orchestrate(providerId,{forceProbe=false,allowActivation=false,confirmActivation=false}={}){if(!clean(providerId))throw new Error('Provider fehlt.');return invoke('orchestrate',providerId,{forceProbe:Boolean(forceProbe),allowActivation:Boolean(allowActivation),confirmActivation:Boolean(confirmActivation)});}
async function readiness(){const c=await client();if(!c)throw new Error('Supabase ist nicht bereit.');const {data,error}=await c.from('booking_provider_connection_readiness_v5').select('*').order('provider_id');if(error)throw error;return data||[];}
window.LuviaBookingProviderConnections=Object.freeze({version:VERSION,health,probe,activate,orchestrate,readiness});
})();
