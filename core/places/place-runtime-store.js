(()=>{
'use strict';

const VERSION='4.19.1';
const state=LuviaPlaceRuntimeProjectionCoreV1.create({
  onChange:detail=>{
    window.dispatchEvent(
      new CustomEvent('luvia:place-runtime-changed',{detail})
    );
  },
  onSubscriberError:error=>{
    console.error('[Luvia Place Runtime] subscriber failed',error);
  }
});

window.addEventListener('luvia:trip-changed',event=>{
  const id=event.detail?.tripId||event.detail?.trip?.tripId;
  if(id)state.setActiveTrip(id);
});

window.LuviaPlaceRuntime=Object.freeze({
  version:VERSION,
  setActiveTrip:state.setActiveTrip,
  ingest:state.ingest,
  upsert:state.upsert,
  patch:state.patch,
  find:state.find,
  records:state.records,
  favorites:state.favorites,
  setData:state.setData,
  getData:state.getData,
  clearTrip:state.clearTrip,
  snapshot:state.snapshot,
  subscribe:state.subscribe,
  normalizeEntity:state.normalizeEntity,
  diagnostics:()=>({
    ...state.diagnostics(),
    version:VERSION,
    projectionCoreVersion:state.version,
    singleSnapshot:true,
    browserlessState:true
  })
});
})();
