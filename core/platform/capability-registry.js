(()=>{
'use strict';
const VERSION='1.0.0';
const rows=new Map();
function register(def){if(!def?.id||!def?.domain)throw new Error('LuviaCapabilityRegistry: id/domain required');const row=Object.freeze({status:'available',consumers:[],...def,consumers:Object.freeze([...(def.consumers||[])])});rows.set(row.id,row);return row;}
const get=id=>rows.get(id)||null;
const list=()=>[...rows.values()];
function probe(id){const c=get(id);if(!c)return {id,available:false,state:'unknown'};let available=c.status!=='planned';let detail=null;try{if(typeof c.probe==='function'){const result=c.probe();available=typeof result==='object'?Boolean(result.available):Boolean(result);detail=typeof result==='object'?result.detail??null:null;}}catch(error){available=false;detail=error?.message||String(error);}return {id:c.id,domain:c.domain,provider:c.provider||null,consumers:[...c.consumers],available,state:available?'ready':c.status==='planned'?'planned':'unavailable',detail};}
function consumers(id){return get(id)?.consumers||[];}
function byConsumer(moduleId){return list().filter(x=>x.consumers.includes(moduleId));}
function diagnostics(){const probes=list().map(x=>probe(x.id));return {version:VERSION,count:probes.length,ready:probes.filter(x=>x.available).length,planned:probes.filter(x=>x.state==='planned').length,probes};}
register({id:'places.discovery',domain:'places',provider:'LuviaPlaceCore',consumers:['consumer'],probe:()=>Boolean(window.LuviaPlaceCore)});
register({id:'trip.context',domain:'trips',provider:'LuviaTripContext',consumers:['consumer','control-center'],probe:()=>Boolean(window.LuviaTripContext||window.LuviaTravelContext)});
register({id:'media.gallery',domain:'media',provider:'LuviaMediaCore',consumers:['consumer','control-center'],probe:()=>Boolean(window.LuviaMediaCore)});
register({id:'booking.lifecycle',domain:'booking',provider:'LuviaBooking',consumers:['consumer','control-center'],probe:()=>Boolean(window.LuviaBooking||window.LuviaBookingIntegration)});
register({id:'booking.messages',domain:'booking',provider:'Booking Core communication',consumers:['control-center'],probe:()=>Boolean(window.LuviaBookingCommunication||window.LuviaBookingEmailV2)});
register({id:'booking.intelligence',domain:'booking',provider:'Booking Core intelligence',consumers:['control-center'],probe:()=>Boolean(window.LuviaBookingCoreDiagnostics||window.LuviaBookingOrchestration)});
register({id:'booking.actions',domain:'booking',provider:'Booking Core message action/reply transport',consumers:['control-center'],probe:()=>Boolean(window.LuviaBooking?.reply&&window.LuviaBooking?.performIntelligenceAction)});
register({id:'booking.timeline',domain:'booking',provider:'Booking Core lifecycle timeline',consumers:['control-center'],probe:()=>Boolean(window.LuviaBooking?.bookingTimeline)});
register({id:'booking.mutations',domain:'booking',provider:'Booking Core reservation mutation orchestration',consumers:['control-center'],probe:()=>Boolean(window.LuviaBooking?.modifyBooking&&window.LuviaBooking?.cancelBooking)});
register({id:'booking.conversation.lifecycle',domain:'booking',provider:'Booking conversation preferences',consumers:['control-center'],probe:()=>Boolean(window.LuviaBooking?.setConversationPreference)});
register({id:'notifications.unread',domain:'notifications',provider:'future global notification service',status:'planned',consumers:['control-center']});
register({id:'wallet.documents',domain:'wallet',provider:'future wallet service',status:'planned',consumers:['control-center']});
window.LuviaCapabilityRegistry=Object.freeze({version:VERSION,register,get,list,probe,consumers,byConsumer,diagnostics});
})();
