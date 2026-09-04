const BUILD = '13.82.168.46';
const ASSET_REVISION = `${BUILD}-local-recovery`;

function loadClassic(relativeUrl) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL(relativeUrl, import.meta.url).href;
    script.async = false;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Luvia Runtime konnte ${relativeUrl} nicht laden.`));
    document.head.appendChild(script);
  });
}

// Identity Web ports must exist before the physical port registry is created.
await loadClassic(`./adapters/identity-platform-web-adapter.js?v=${ASSET_REVISION}`);
await import(`./adapters/platform-port-adapters.mjs?v=${ASSET_REVISION}`);
await import(`./adapters/media-storage-web-adapter.mjs?v=${ASSET_REVISION}`);

// Supabase remains its own vendor asset. The Trip web binding has one hard
// ordering boundary: state/store first, binding second, every consumer third.
await loadClassic(`../vendor/supabase/supabase-2.112.4.js?v=${ASSET_REVISION}`);
await loadClassic(`./luvia-runtime-precontext-13.82.168.bundle.js?v=${ASSET_REVISION}`);
await import(`../luvia-trip-context.js?v=${ASSET_REVISION}`);
if (!globalThis.LuviaTripContext) {
  throw new Error('Luvia Runtime: Trip Context Binding wurde nicht initialisiert.');
}
await loadClassic(`./luvia-runtime-postcontext-13.82.168.bundle.js?v=${ASSET_REVISION}`);
