const BUILD = '13.82.168.88';
const ASSET_REVISION = `${BUILD}-local-recovery`;
const CLASSIC_LOAD_ATTEMPTS = 2;
const CLASSIC_RETRY_DELAY_MS = 250;
const MODULE_LOAD_ATTEMPTS = 2;
const MODULE_RETRY_DELAY_MS = 250;

const wait = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs));

async function loadClassic(relativeUrl) {
  let lastError = null;
  for (let attempt = 1; attempt <= CLASSIC_LOAD_ATTEMPTS; attempt += 1) {
    try {
      return await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const source = new URL(relativeUrl, import.meta.url);
        if (attempt > 1) source.searchParams.set('runtimeAttempt', String(attempt));
        script.src = source.href;
        script.async = false;
        script.onload = () => resolve(script);
        script.onerror = () => {
          script.remove();
          reject(new Error(`Luvia Runtime konnte ${relativeUrl} nicht laden.`));
        };
        document.head.appendChild(script);
      });
    } catch (error) {
      lastError = error;
      if (attempt < CLASSIC_LOAD_ATTEMPTS) await wait(CLASSIC_RETRY_DELAY_MS);
    }
  }
  throw lastError;
}

async function importModule(relativeUrl) {
  let lastError = null;
  for (let attempt = 1; attempt <= MODULE_LOAD_ATTEMPTS; attempt += 1) {
    const source = new URL(relativeUrl, import.meta.url);
    if (attempt > 1) source.searchParams.set('runtimeAttempt', String(attempt));
    try {
      return await import(source.href);
    } catch (error) {
      lastError = error;
      if (attempt < MODULE_LOAD_ATTEMPTS) await wait(MODULE_RETRY_DELAY_MS);
    }
  }
  throw lastError;
}

function showRuntimeFailure(error) {
  globalThis.LuviaRuntimeLoadFailure = Object.freeze({
    build: BUILD,
    message: error?.message || String(error),
    failedAt: new Date().toISOString()
  });
  const root = document.documentElement;
  root.classList.remove('lv-boot-warm', 'lv-boot-revealing');
  root.classList.add('lv-booting');
  const splash = document.getElementById('luviaBootSplash');
  const inner = splash?.querySelector('.lv-start-splash__inner');
  if (!splash || !inner) return;
  splash.style.display = 'grid';
  splash.setAttribute('role', 'alert');
  splash.setAttribute('aria-live', 'assertive');
  inner.replaceChildren();
  const logo = document.createElement('img');
  logo.src = new URL('../luvia-logo.svg', import.meta.url).href;
  logo.alt = '';
  logo.className = 'lv-start-splash__logo';
  const title = document.createElement('strong');
  title.textContent = 'Luvia konnte nicht vollständig starten.';
  const copy = document.createElement('span');
  copy.textContent = 'Ein App-Baustein konnte nicht geladen werden. Bitte lade Luvia erneut.';
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = 'Luvia neu laden';
  retry.style.cssText = 'margin-top:22px;border:1px solid rgba(38,63,84,.18);border-radius:999px;padding:12px 20px;background:#fff;color:#263f54;font:700 14px/1.2 Manrope,system-ui,sans-serif;box-shadow:0 10px 28px rgba(38,63,84,.12);cursor:pointer';
  retry.addEventListener('click', () => globalThis.location.reload());
  inner.append(logo, title, copy, retry);
}

async function bootRuntime() {
  // Identity Web ports must exist before the physical port registry is created.
  await loadClassic(`./adapters/identity-platform-web-adapter.js?v=${ASSET_REVISION}`);
  await importModule(`./adapters/platform-port-adapters.mjs?v=${ASSET_REVISION}`);
  await importModule(`./adapters/media-storage-web-adapter.mjs?v=${ASSET_REVISION}`);

  // Supabase remains its own vendor asset. The Trip web binding has one hard
  // ordering boundary: state/store first, binding second, every consumer third.
  await loadClassic(`../vendor/supabase/supabase-2.112.4.js?v=${ASSET_REVISION}`);
  await loadClassic(`./luvia-runtime-precontext-13.82.168.bundle.js?v=${ASSET_REVISION}`);
  await importModule(`../luvia-trip-context.js?v=${ASSET_REVISION}`);
  if (!globalThis.LuviaTripContext) {
    throw new Error('Luvia Runtime: Trip Context Binding wurde nicht initialisiert.');
  }
  await loadClassic(`./luvia-runtime-postcontext-13.82.168.bundle.js?v=${ASSET_REVISION}`);
}

try {
  await bootRuntime();
} catch (error) {
  showRuntimeFailure(error);
  throw error;
}
