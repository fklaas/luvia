const BUILD='13.82.168.49';
const CACHE='luvia-shell-v13.82.168.49-local-recovery';
const SCOPE=new URL(self.registration.scope);
const scoped=path=>new URL(path.replace(/^\/+/,''),SCOPE).toString();
const OFFLINE=scoped('offline.html');
const PRECACHE_CONCURRENCY=4;
let shellCachePromise=null;
const shellCache=()=>shellCachePromise||(shellCachePromise=caches.open(CACHE));
const APP_SHELL=['','index.html','offline.html','manifest.webmanifest','icon-192.png','icon-512.png','favicon.svg','favicon.ico','luvia-logo.svg','app/app-shell.css','app/app-shell.js','app/today/today-composition-core.js','app/today/today-experience.js','app/today/today-experience.css','app/places/places-spatial-composition-core.js','app/places/places-spatial-experience.js','app/places/places-spatial-experience.css','core/design/product-module-foundation.css','app/demo/living-compass-browser.html','app/control-center/control-center-home.css','app/control-center/identity-center.css','app/control-center/booking-control-center.css','app/control-center/booking-inbox.css','app/control-center/control-center-shell.js','app/control-center/control-center-manifest.js','app/control-center/travel-identity-service.js','app/control-center/control-center-attention-service.js','app/control-center/control-center-home.js','app/control-center/identity-center.js','app/control-center/booking-control-center.js','app/control-center/booking-inbox.js','core/platform/global-contracts.js','app/adapters/event-contract-web-adapter.js','core/platform/capability-registry.js','core/platform/feature-flag-registry.js','core/platform/attention-contract.js','core/platform/product-module-registry.js','app/product-module-manifests.js','app/gallery-view.css','app/gallery-view.js','app/albums-view.css','app/albums-view.js','app/memory-worlds-v3.css','app/memory-render-engine.js','app/memory-export-engine.js','app/memory-worlds-v3.js','app/navigation-registry.js','app/module-hubs.js','app/module-hubs.css','app/public-entry.css','app/public-entry.js','app/public-landing.html','app/public-landing.css','app/public-landing-motion.js','app/public-landing-experience-motion.css','app/public-landing-experience-motion.js','assets/public-landing/luvia-compass-brand.svg','assets/public-landing/luvia-compass-face.svg','assets/public-landing/luvia-compass-hub.svg','assets/public-landing/luvia-compass-needle.svg','assets/public-landing/prototype-coast-bike.png','assets/public-landing/prototype-coast-morning.png','assets/public-landing/prototype-harbor-lunch.png','assets/public-landing/prototype-memory-sunset.png','assets/public-landing/prototype-restaurant.png','assets/public-landing/travel-warnemuende.webp','assets/public-landing/travel-pragser-wildsee.webp','assets/public-landing/travel-lisbon.webp','assets/public-landing/travel-rural-japan.webp','assets/public-landing/travel-copenhagen.webp','assets/public-landing/travel-photo-sources.json','assets/public-landing/reel-video-sources.json','assets/public-landing/reel-couple-market.mp4','assets/public-landing/reel-family-planning.mp4','assets/public-landing/reel-friends-beach.mp4','assets/public-landing/reel-beach-sunrise.mp4','assets/public-landing/reel-poster-couple-market.webp','assets/public-landing/reel-poster-family-planning.webp','assets/public-landing/reel-poster-friends-beach.webp','assets/public-landing/reel-poster-beach-sunrise.webp','assets/public-landing/book-photo-sources.json','assets/public-landing/book-jungle-waterfall.jpg','assets/public-landing/book-family-departure.jpg','assets/public-landing/book-city-night.jpg','assets/public-landing/book-family-beach.jpg','assets/public-landing/book-sahara-dunes.jpg','assets/public-landing/book-romantic-highlands.jpg','assets/public-landing/book-roadtrip-car.jpg','assets/public-landing/book-alpine-hike.jpg','core/design/design-system-v3.css','core/experience/experience-foundation.css','core/experience/experience-contract-core.js','app/adapters/experience-web-adapter.js','core/ui/ui-kit.js','app/adapters/identity-platform-web-adapter.js','auth/config.js','auth/session.js','auth/ui.js','core/services/supabase-service.js','core/services/theme-service.js','core/storage/storage.js','core/identity/identity-domain-contract-core.js','core/events/event-contract-core.js','core/media/media-domain-contract-core.js','core/memory/memory-domain-contract-core.js','core/platform/memory-runtime-context-adapter.js','core/media/media-metadata.js','core/media/media-core.js','core/media/memory-albums.js','core/media/memory-journeys.js','core/media/memory-cards.js','core/legacy/paris-migrator.js','legacy/paris/cloud-adapter.js','core/trips/trip-state-core.js','core/trips/trip-store.js','core/trips/active-trip-context.mjs','luvia-trip-context.js','core/trips/trip-creator.js','core/trips/trip-experience.js','core/runtime/runtime.js','core/modules/module-registry.js','core/dashboard/dashboard-widget-registry.js','core/collaboration/collaboration-service.js','core/context/travel-context-service.js','core/ai/ai-brain.css','core/planning/product-focus-reset.js','core/planning/planning-dialogue-service.js','core/planning/planning-candidate-research.js',
  'app/profile-onboarding.css',
  'app/profile-onboarding.js',
  'app/first-trip-composer.css',
  'app/first-trip-composer.js',
  'core/journey/journey-domain-contract-core.js',
  'core/platform/journey-contract-adapter.js',
  'app/journey/journey-day-composer.js',
  'app/journey/journey-suggestion-sheet.js',
  'core/booking/booking-admission-core.js',
  'core/booking/booking-lifecycle-policy-core.js',
  'app/journey/journey-day-composer.css',
  'app/memories/premium-memories-experience.js',
  'app/memories/premium-memories-experience.css',
  'core/places/place-state-core.js',
  'core/places/place-runtime-projection-core.js',
  'core/places/places-domain-contract-core.js',
  'app/adapters/places-discovery-adapter.js',
  'core/platform/native/platform-port-registry.mjs',
  'app/adapters/platform-port-adapters.mjs',
  'core/runtime/owner-flow-navigation-policy-core.js',
  'core/runtime/overlay-host-contract-core.js',
  'core/ui/ui-manager.js',
  'app/adapters/owner-flow-navigation-web-adapter.js',
  'app/adapters/media-storage-web-adapter.mjs',
  'core/planning/planning-foundation.js','core/planning/planning-tool-registry.js','core/planning/planning-session.js','core/planning/planning-foundation.css','core/intelligence/trip-preference-resolution-core.js','core/intelligence/intelligence-domain-contract-core.js','core/intelligence/travel-orchestration-core.js','core/intelligence/verified-event-intelligence-core.js','core/intelligence/intelligence-action-contract-core.js','core/intelligence/intelligence-action-ledger-core.js','core/ai/ai-evidence-store.js','core/ai/ai-domain-registry.js','core/ai/ai-capability-registry.js','core/ai/ai-model-router.js','core/ai/ai-policy-service.js','core/ai/ai-output-validator.js','core/ai/ai-tool-registry.js','core/ai/ai-context-service.js','core/ai/providers/openai-provider.js','core/ai/ai-memory-service.js','core/ai/ai-command-proposal-service.js','core/ai/ai-core.js','core/platform/intelligence-contract-adapter.js','core/platform/verified-event-intelligence-contract-adapter.js','core/ai/ai-action-runtime.js','core/ai/ai-dashboard-service.js','core/preferences/preference-schema.js','core/preferences/user-preferences-service.js','core/preferences/discovery-contract-service.js','core/preferences/guided-discovery-sequence.js','core/preferences/guided-discovery-sequence.css','core/preferences/travel-preferences-service.js','core/recommendations/recommendation-service.js','core/recommendations/restaurant-recommendation-adapter.js','core/recommendations/schedule-intelligence-service.js','core/recommendations/restaurant-intelligence-service.js','core/profiles/profile-service.js','core/profiles/profile-foundation.js','core/profiles/profile-foundation.css','core/trips/join-flow.js','core/platform/trip-contract-adapter.js','core/platform/places-contract-adapter.js','core/platform/booking-contract-adapter.js','core/platform/media-contract-adapter.js','core/platform/memory-contract-adapter.js','core/platform/identity-contract-adapter.js','modules/restaurants-v2/restaurant-module.css','modules/restaurants-v2/restaurant-module.js','modules/accommodations/accommodation-module.css','modules/accommodations/accommodation-module.js','modules/attractions/attraction-module.css','modules/attractions/attraction-module.js','modules/photo-spots/photo-spot-module.css','modules/photo-spots/photo-spot-module.js','modules/shopping/shopping-module.css','modules/shopping/shopping-module.js','modules/nature/nature-module.css','modules/nature/nature-module.js','modules/mobility/mobility-module.css','modules/mobility/mobility-module.js','modules/move-shell.css','modules/move-shell.js','intelligence/environment.js','intelligence/destination-service.js','intelligence/destination-context.js','intelligence/backend-service.js','intelligence/places-service.js','core/places/place-domain.js','intelligence/place-entity-service.js','core/places/place-type-contract.js','core/places/place-type-definitions.js','core/places/global-place-contracts.js','core/places/place-registry.js','core/places/place-adapters.js','core/places/place-core.js','core/places/place-runtime-store.js','core/places/trip-place-data-service.js','core/places/place-collection-service.js','core/places/place-command-service.js','core/places/timeline-core.js','core/places/presence-visit-core.js','core/places/place-lifecycle-service.js','core/places/place-lifecycle-hub.js','core/places/place-lifecycle-hub.css','core/places/place-ui-contract.js','core/places/place-provider-fields.js','core/places/place-ui-actions.js','core/places/place-ui-states.js','core/places/place-ui.js','core/places/place-experience-shell.js','core/places/photo-spot-intelligence-service.js','core/places/shopping-intelligence-service.js','core/places/nature-intelligence-service.js','core/places/transport-intelligence-service.js','core/places/place-intelligence-service.js','core/places/place-detail-service.js','core/places/place-conformance-service.js','core/places/places-final-foundation.js','core/places/places-final-foundation.css','core/booking/booking-status-attribution-v2.js','core/booking/booking-availability.js','core/booking/booking-reservation-create.js','core/booking/booking-reservation-mutation.js','core/booking/booking-reservation-mutation-status.js','core/booking/booking-reservation-recovery.js','core/booking/booking-email-v2.js','modules/places-shell.js','modules/places-shell.css','core/places/place-ui.css','intelligence/restaurant-service.js','intelligence/pwa-service.js'].map(scoped);

APP_SHELL.push(scoped('core/trips/trip-draft-core.js'));
APP_SHELL.push(scoped('core/intelligence/human-ai-language-compiler-core.js'));
APP_SHELL.push(scoped('core/intelligence/human-ai-safety-policy-core.js'));
APP_SHELL.push(scoped('core/intelligence/human-ai-action-lifecycle-core.js'));
APP_SHELL.push(scoped('core/intelligence/human-ai-capability-discovery-core.js'));
APP_SHELL.push(scoped('core/intelligence/human-ai-consumer-projection-core.js'));
APP_SHELL.push(scoped('core/intelligence/human-ai-parity-failure-matrix-core.js'));
APP_SHELL.push(scoped('app/adapters/trip-preference-context-adapter.js'));
APP_SHELL.push(scoped('intelligence/kernel/version.js'));
APP_SHELL.push(scoped('app/booking/booking-management-sheet.css'));
APP_SHELL.push(scoped('app/booking/booking-management-sheet.js'));
APP_SHELL.push(scoped('core/booking/providers/admission-partner-adapter-factory.js'));
APP_SHELL.push(scoped('core/booking/providers/tiqets-adapter.js'));
APP_SHELL.push(scoped('core/booking/providers/viator-adapter.js'));
APP_SHELL.push(scoped('app/journey/journey-offline-pack.js'));
APP_SHELL.push(scoped('app/collaboration/journey-place-proposals.js'));
APP_SHELL.push(scoped('core/runtime/auth-command-contract-core.js'));
APP_SHELL.push(scoped('core/platform/auth-contract-adapter.js'));
APP_SHELL.push(scoped('core/booking/booking-draft-core.js'));
APP_SHELL.push(scoped('core/collaboration/collaboration-interaction-contract-core.js'));
APP_SHELL.push(scoped('core/platform/collaboration-contract-adapter.js'));
APP_SHELL.push(scoped('core/runtime/platform-action-contract-core.js'));
APP_SHELL.push(scoped('app/adapters/platform-action-web-adapter.js'));
APP_SHELL.push(scoped('vendor/supabase/supabase-2.112.4.js'));
APP_SHELL.push(scoped('vendor/maplibre/maplibre-gl-5.12.0.js'));
APP_SHELL.push(scoped('vendor/maplibre/maplibre-gl-5.12.0.css'));
APP_SHELL.push(scoped('app/luvia-runtime-precontext-13.82.168.bundle.js'));
APP_SHELL.push(scoped('app/luvia-runtime-postcontext-13.82.168.bundle.js'));
APP_SHELL.push(scoped('app/luvia-runtime-loader.mjs'));
const CRITICAL_SHELL_PATTERN=/\/(?:index\.html|offline\.html|manifest\.webmanifest|intelligence\/(?:pwa-service|kernel\/version)\.js)$/;
const CRITICAL_SHELL=APP_SHELL.filter(url=>url===SCOPE||CRITICAL_SHELL_PATTERN.test(new URL(url).pathname));
// Runtime bundles contain the individual modules. Marketing reels and source
// copies must not compete with the active map on a mobile connection.
const WARM_SHELL=APP_SHELL.filter(value=>{const path=new URL(value).pathname;return CRITICAL_SHELL.includes(value)||(/\.css$/.test(path)&&!path.includes('public-landing'))||/\/(?:luvia-runtime-(?:precontext|postcontext)-13\.82\.168\.bundle\.js|luvia-runtime-loader\.mjs|identity-platform-web-adapter\.js|platform-port-adapters\.mjs|platform-port-registry\.mjs|media-storage-web-adapter\.mjs|luvia-trip-context\.js|active-trip-context\.mjs|supabase-2\.112\.4\.js|maplibre-gl-5\.12\.0\.js)$/.test(path)});
let warmShellPromise=null;

async function precacheShell(cache,urls=APP_SHELL){
  let cursor=0;
  const fetchNext=async()=>{
    while(cursor<urls.length){
      const url=urls[cursor++];
      try{
        if(await cache.match(url,{ignoreSearch:true}))continue;
        const response=await fetch(url,{cache:'reload'});
        if(response.ok)await cache.put(url,response);
      }catch{}
    }
  };
  await Promise.all(Array.from({length:Math.min(PRECACHE_CONCURRENCY,urls.length)},fetchNext));
}

function warmAppShell(){return warmShellPromise||(warmShellPromise=shellCache().then(cache=>precacheShell(cache,WARM_SHELL)).finally(()=>{warmShellPromise=null}))}

self.addEventListener('install',event=>{
  event.waitUntil(shellCache().then(cache=>precacheShell(cache,CRITICAL_SHELL)));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('luvia-')&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
  if(event.data?.type==='WARM_APP_SHELL')event.waitUntil(warmAppShell());
  if(event.data?.type==='CLEAR_LUVIA_CACHES')event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('luvia-')).map(key=>caches.delete(key)))));
});

function bypass(url){
  return url.origin!==self.location.origin||url.hostname.includes('supabase.co')||url.pathname.includes('/rest/v1/')||url.pathname.includes('/auth/v1/')||url.pathname.includes('/functions/v1/');
}
const currentBuildAsset=url=>{
  const token=url.searchParams.get('v')||'';
  return token===BUILD||token.startsWith(`${BUILD}-`);
};
function canCache(request,response){return !request.headers.has('range')&&response.status===200&&response.type!=='opaque'}
async function store(request,response){if(!canCache(request,response))return;const copy=response.clone();const cache=await shellCache();await cache.put(request,copy)}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||request.headers.has('range'))return;
  const url=new URL(request.url);
  if(bypass(url))return;

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      const activeCache=await shellCache();
      try{
        const response=await fetch(request,{cache:'no-store'});
        event.waitUntil(store(request,response));
        return response;
      }catch{
        return await activeCache.match(request,{ignoreSearch:true})||await activeCache.match(scoped('index.html'))||await activeCache.match(OFFLINE);
      }
    })());
    return;
  }

  if(/\.(?:m?js|css|json|webmanifest|svg|png|webp|ico|html)$/i.test(url.pathname)){
    event.respondWith((async()=>{
      const activeCache=await shellCache();
      const cached=await activeCache.match(request,{ignoreSearch:true});
      if(cached&&currentBuildAsset(url))return cached;
      try{
        const response=await fetch(request,{cache:'no-store'});
        if(response.ok){event.waitUntil(store(request,response));return response;}
        return cached||response;
      }catch{return cached||new Response('',{status:503,statusText:'Offline'})}
    })());
    return;
  }

  event.respondWith((async()=>{const activeCache=await shellCache(),hit=await activeCache.match(request,{ignoreSearch:true});if(hit)return hit;try{const response=await fetch(request);event.waitUntil(store(request,response));return response}catch{return new Response('',{status:503,statusText:'Offline'})}})());
});
