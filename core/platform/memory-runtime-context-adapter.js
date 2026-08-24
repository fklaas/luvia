(()=>{
'use strict';

const root=globalThis;

function authSessionPort(){
  const registered=root.LuviaPlatformPorts?.get?.('AuthSessionPort');
  return registered||root.LuviaIdentityPlatformWebPorts?.AuthSessionPort||null;
}

async function get(){
  const client=root.LuviaSupabaseService?.getClient?.()||root.LuviaSupabase?.getClient?.()||root.LuviaSupabase?.client?.()||null;
  const tripContract=root.LuviaTripContractV1;
  const activeTrip=tripContract?.getActiveTrip?.()||null;
  const tripContext=tripContract?.getContext?.()||{};
  const tripId=String(activeTrip?.id||activeTrip?.tripId||tripContext.activeTripId||tripContext.tripId||'');
  const auth=authSessionPort()?.snapshot?.()||{};
  const userId=String(auth.user?.id||auth.session?.user?.id||'');
  if(!client)throw new Error('Memory Runtime benötigt eine aktive Datenverbindung.');
  if(!userId)throw new Error('Memory Runtime benötigt eine gültige Anmeldung.');
  if(!tripId)throw new Error('Memory Runtime benötigt eine aktive Reise.');
  return Object.freeze({client,tripId,userId,trip:activeTrip});
}

const diagnostics=()=>Object.freeze({
  contractId:'memory-runtime-context.v1',
  ready:Boolean(root.LuviaSupabaseService&&root.LuviaTripContractV1&&authSessionPort()),
  tripBoundary:'trip.v1',
  authBoundary:'AuthSessionPort',
  mediaBoundary:'media.v1',
  ownsTruth:false
});

root.LuviaMemoryRuntimeContextV1=Object.freeze({version:'1.0.0',get,diagnostics});
})();
