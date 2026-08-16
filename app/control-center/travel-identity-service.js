(()=>{
'use strict';
const VERSION='1.1.0';
const clean=v=>String(v??'').trim();
const dateValue=v=>{if(!v)return null;const d=new Date(`${v}T00:00:00`);return Number.isNaN(d.getTime())?null:d};
const tripContract=()=>window.LuviaTripContractV1||window.LuviaTripContract||null;
function summarizeTrip(t){if(!t)return null;return Object.freeze({id:clean(t.id||t.tripId),title:clean(t.title||t.tripName)||'Unsere Reise',destination:clean(t.destination?.name||t.destinationName),startDate:t.startDate||t.start_date||null,endDate:t.endDate||t.end_date||null,symbol:t.symbol||'✦',accent:t.accent||null,role:t.role||null,isOwner:Boolean(t.isOwner||['owner','admin'].includes(t.role))});}
function snapshot(){
 const trip=tripContract();
 const trips=trip?.listTrips?.()||[];
 const travel=window.LuviaTravelContext?.snapshot?.()||{};
 const active=summarizeTrip(trip?.getActiveTrip?.());
 const now=new Date();
 const upcoming=trips.filter(t=>clean(t.id||t.tripId)!==active?.id).map(summarizeTrip).filter(Boolean).filter(t=>{const d=dateValue(t.startDate);return d&&d>=new Date(now.getFullYear(),now.getMonth(),now.getDate())}).sort((a,b)=>dateValue(a.startDate)-dateValue(b.startDate))[0]||null;
 return Object.freeze({version:VERSION,activeTrip:active,upcomingTrip:upcoming,phase:travel.phase||'planning',tripDay:travel.tripDay||null,hasActiveTrip:Boolean(active),hasUpcomingTrip:Boolean(upcoming),source:'global-trip-context',ownsTripTruth:false});
}
const listeners=new Set();
function emit(){const s=snapshot();listeners.forEach(fn=>{try{fn(s)}catch{}});try{window.dispatchEvent(new CustomEvent('luvia:control-center-travel-identity-changed',{detail:s}))}catch{}return s;}
window.addEventListener('luvia:trip.changed',emit);window.addEventListener('luvia:travel-context-changed',emit);
window.LuviaControlCenterTravelIdentity=Object.freeze({version:VERSION,snapshot,refresh:emit,subscribe(fn){listeners.add(fn);fn(snapshot());return()=>listeners.delete(fn)},diagnostics:()=>snapshot()});
})();
