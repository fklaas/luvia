(()=>{
'use strict';
const VERSION='1.0.0';
const normalize=x=>window.LuviaAttentionContract?.normalize?.(x)||x;
const state={items:[],loading:false,error:null,updatedAt:null};
const listeners=new Set();
function bookingNeedsAction(row={}){const s=String(row.status||row.booking_status||'').toLowerCase();return ['requires_action','review_required','alternative_proposed','blocked','failed'].includes(s)||Boolean(row.review_required||row.requires_action);}
async function refresh(){
 state.loading=true;state.error=null;emit();const items=[];const identity=window.LuviaControlCenterTravelIdentity?.snapshot?.();
 if(!identity?.hasActiveTrip)items.push(normalize({id:'trip.none',source:'trip',level:'attention',title:'Keine aktive Reise',message:'Wähle eine Reise aus, damit das Control Center ihren Status bündeln kann.',action:{view:'more'}}));
 else if(identity.phase==='before')items.push(normalize({id:'trip.upcoming',source:'trip',level:'info',title:'Reise in Vorbereitung',message:`${identity.activeTrip.title} ist noch in der Vorbereitungsphase.`,action:{view:'plan'}}));
 try{
   const api=window.LuviaBookingIntegration;const tripId=identity?.activeTrip?.id;
   if(api?.listForTrip&&tripId){const rows=await api.listForTrip(tripId);rows.filter(bookingNeedsAction).slice(0,5).forEach(row=>items.push(normalize({id:`booking.${row.id}`,source:'booking',level:'action_required',title:row.title||'Buchung braucht Aufmerksamkeit',message:'Bei dieser Buchung ist eine Entscheidung oder Prüfung erforderlich.',action:{view:'bookings',bookingId:row.id}})));}
 }catch(error){state.error=error?.message||String(error);}
 state.items=items;state.loading=false;state.updatedAt=new Date().toISOString();emit();return snapshot();
}
function snapshot(){return Object.freeze({version:VERSION,items:[...state.items],count:state.items.length,actionRequired:state.items.filter(x=>x.level==='action_required').length,loading:state.loading,error:state.error,updatedAt:state.updatedAt,ownsDomainTruth:false});}
function emit(){const s=snapshot();listeners.forEach(fn=>{try{fn(s)}catch{}});try{window.dispatchEvent(new CustomEvent('luvia:control-center-attention-changed',{detail:s}))}catch{}return s;}
window.addEventListener('luvia:booking-changed',()=>refresh().catch(()=>{}));window.addEventListener('luvia:control-center-travel-identity-changed',()=>refresh().catch(()=>{}));
window.LuviaControlCenterAttention=Object.freeze({version:VERSION,refresh,snapshot,subscribe(fn){listeners.add(fn);fn(snapshot());return()=>listeners.delete(fn)},diagnostics:()=>snapshot()});
})();
