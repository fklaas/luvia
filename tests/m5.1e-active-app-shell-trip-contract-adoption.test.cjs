const fs = require('fs');
const assert = require('assert');

const SOURCE = fs.readFileSync('app/app-shell.js', 'utf8');

function count(pattern) {
  return (SOURCE.match(pattern) || []).length;
}

assert(
  SOURCE.includes('window.LuviaTripContractV1||window.LuviaTripContract'),
  'App Shell must resolve Trip Contract v1 with latest alias fallback'
);

assert.strictEqual(
  count(/\bLuviaTripStore\b/g),
  0,
  'Active App Shell must not access LuviaTripStore directly'
);

assert(
  SOURCE.includes('api.listTrips?.()'),
  'App Shell Trip projection must read listTrips() from Trip Contract'
);

assert(
  SOURCE.includes('api.getActiveTrip?.()'),
  'App Shell Trip projection must read getActiveTrip() from Trip Contract'
);

assert(
  SOURCE.includes('api.getContext?.()'),
  'App Shell Trip projection must read getContext() from Trip Contract'
);

assert(
  SOURCE.includes('tripContract()?.subscribe?.('),
  'App Shell Trip switching must subscribe through Trip Contract'
);

assert(
  SOURCE.includes("const active=s?.activeTrip||null,context=s?.context||{}"),
  'Trip Contract subscription must derive active Trip from contract snapshot'
);

assert(
  SOURCE.includes("activeTripId=String(active?.id||active?.tripId||context?.tripId||'')||null"),
  'Trip Contract subscription must derive activeTripId from active Trip/context'
);

for (const required of [
  'window.LuviaProfileService.setActiveTrip(activeTripId)',
  'window.LuviaJourneyContractV1?.commands?.hydrate?.(activeTripId)',
  'window.LuviaDestination?.refresh?.()',
  'window.LuviaCollaboration?.watchTrip?.(activeTripId)',
  'const nextSignature=tripRenderSignature(active)',
  'lastTripRenderSignature=nextSignature',
  'refreshShellHeader()',
  "if(requiresViewRender)await show(activeView,{force:true,animate:false})"
]) {
  assert(
    SOURCE.includes(required),
    `Trip-switch behavior must preserve: ${required}`
  );
}

assert(
  SOURCE.includes('requiresViewRender=lastRenderedTripId!==activeTripId||nextSignature!==lastTripRenderSignature'),
  'Unchanged Trip projections must not remount the active App Shell view'
);

assert(
  SOURCE.includes(
    'return {trips,activeTripId,activeTrip,hasTrips:trips.length>0,hasActiveTrip:Boolean(activeTrip),loaded:true}'
  ),
  'App Shell must preserve its legacy render-state projection without owning Trip truth'
);

assert(
  SOURCE.includes("if(!s.loaded)return bootScreen('Reisen werden geladen …')"),
  'Existing loading behavior must remain present'
);

assert(
  SOURCE.includes('if(!s.hasTrips||!s.hasActiveTrip)return noTrips()'),
  'Existing no-trips / no-active-trip behavior must remain present'
);

assert(
  !SOURCE.includes('core/app/app-shell-v11.js'),
  'M5.1e must not introduce runtime coupling to legacy app-shell-v11'
);

console.log('M5.1e Active App Shell Trip Contract Adoption: PASS');
console.log('- Trip reads use Trip Contract');
console.log('- Trip switch subscription uses Trip Contract');
console.log('- no direct LuviaTripStore access remains');
console.log('- profile/timeline/destination/collaboration/render semantics preserved');
