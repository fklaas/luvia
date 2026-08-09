const fs=require('fs');const assert=require('assert');
const shell=fs.readFileSync('core/places/place-experience-shell.js','utf8');
assert(!shell.includes('stopImmediatePropagation()'),'global quick-filter capture must not block module roots');
assert(shell.includes("categoryInteractionMode:'module-root-delegation'"));
for(const f of ['modules/restaurants-v2/restaurant-module.js','modules/accommodations/accommodation-module.js','modules/attractions/attraction-module.js','modules/photo-spots/photo-spot-module.js','modules/shopping/shopping-module.js','modules/nature/nature-module.js','modules/mobility/mobility-module.js']){const s=fs.readFileSync(f,'utf8');assert(s.includes('data-place-query'),f+' missing quick filter routing');}
const migration=fs.readFileSync('supabase/migrations/20260809071500_core_v4_56_0_provider_connection_runtime_places_category_reliability.sql','utf8');
assert(migration.includes('booking_provider_connections'));assert(migration.includes('booking_provider_connection_readiness_v2'));
const edge=fs.readFileSync('supabase/functions/booking-provider-connection-health/index.ts','utf8');
assert(edge.includes('configuredSecretCount'));assert(!edge.includes('secretValue'));
const index=fs.readFileSync('index.html','utf8');assert(index.includes('booking-provider-connections.js?v=13.56.0'));
console.log('LUVIA_V13_56_0_PROVIDER_CONNECTION_PLACES_CATEGORY_RELIABILITY_OK');
