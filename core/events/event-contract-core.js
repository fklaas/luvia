var LuviaEventContractCoreV1=(()=>{
'use strict';

const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const CONTRACT_ID='events.v1';
const ENVELOPE_VERSION='1';
const DEFINITIONS=Object.freeze({
  'identity.changed':Object.freeze({owner:'identity',notification:false}),
  'preferences.changed':Object.freeze({owner:'identity',notification:false}),
  'booking.confirmed':Object.freeze({owner:'booking',notification:true}),
  'place.saved':Object.freeze({owner:'places',notification:false}),
  'trip.completed':Object.freeze({owner:'trip',notification:true}),
  'memory.created':Object.freeze({owner:'media',notification:true}),
  'notification.intent.created':Object.freeze({owner:'platform',notification:false})
});

function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
const text=value=>value==null?null:String(value);
function definition(name){return DEFINITIONS[String(name)]||null}
function createEnvelope(name,payload={},meta={},providers={}){
  const eventName=String(name||'').trim();
  if(!eventName||!eventName.includes('.'))throw new TypeError('Versioned event name required.');
  const now=typeof providers.now==='function'?providers.now():new Date().toISOString();
  const id=typeof providers.id==='function'?providers.id():`evt-${String(now).replace(/[^0-9A-Za-z]/g,'')}-${Math.random().toString(36).slice(2,10)}`;
  const registered=definition(eventName);
  return immutable({
    contractId:CONTRACT_ID,envelopeVersion:ENVELOPE_VERSION,id:text(id),name:eventName,occurredAt:text(now),
    source:text(meta.source||registered?.owner||'unknown'),owner:text(meta.owner||registered?.owner||null),
    subject:text(meta.subject),actorId:text(meta.actorId),correlationId:text(meta.correlationId),causationId:text(meta.causationId),
    domainContractId:text(meta.domainContractId),domainVersion:text(meta.domainVersion),notificationEligible:Boolean(registered?.notification),
    payload:payload&&typeof payload==='object'?payload:{value:payload}
  });
}
function validateEnvelope(envelope){
  const errors=[];
  if(envelope?.contractId!==CONTRACT_ID)errors.push('contractId');
  if(envelope?.envelopeVersion!==ENVELOPE_VERSION)errors.push('envelopeVersion');
  for(const field of ['id','name','occurredAt','source'])if(!envelope?.[field])errors.push(field);
  return Object.freeze({valid:errors.length===0,errors:Object.freeze(errors)});
}
function createNotificationIntent(envelope,presentation={}){
  const validation=validateEnvelope(envelope);
  if(!validation.valid)throw new TypeError(`Invalid source event envelope: ${validation.errors.join(', ')}`);
  return createEnvelope('notification.intent.created',{
    sourceEventId:envelope.id,sourceEventName:envelope.name,title:text(presentation.title),body:text(presentation.body),
    deepLink:presentation.deepLink&&typeof presentation.deepLink==='object'?presentation.deepLink:null
  },{source:'platform',owner:'platform',correlationId:envelope.correlationId,causationId:envelope.id},presentation.providers||{});
}

return Object.freeze({
  contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,envelopeVersion:ENVELOPE_VERSION,
  definitions:DEFINITIONS,definition,createEnvelope,validateEnvelope,createNotificationIntent,
  deliveryPolicy:'explicit-notification-port-only'
});
})();
