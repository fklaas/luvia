(() => {
  'use strict';

  const VERSION = '13.82.93';
  const TEMPLATE_URL = `app/public-landing.html?v=${VERSION}`;
  const AUTH_HASHES = Object.freeze({ login: '#anmelden', register: '#registrieren' });
  let activeContainer = null;
  let activeRoot = null;
  let lifecycle = null;
  let motionCleanup = null;
  let experienceCleanup = null;
  let previousFocus = null;
  let authReturnSnapshot = null;
  let authCloseTimer = 0;
  let templatePromise = null;

  const authApi = () => window.LuviaAuth || window.ParisAuth;
  const authUi = () => window.LuviaAuthUI || window.ParisAuthUI;
  const recoveryRequested = () => new URLSearchParams(window.location.search).get('auth') === 'recovery';
  const landingMotionReduced = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    try { return localStorage.getItem('luvia-public-motion') === 'reduced'; } catch (_) { return false; }
  };

  function setLandingAssets(active) {
    document.querySelectorAll('link[data-luvia-public-landing-style]').forEach(link => { link.disabled = !active; });
    document.documentElement.classList.toggle('lv-public-entry-active', active);
    document.body.classList.toggle('lv-public-entry-active', active);
    const reduceMotion = active && landingMotionReduced();
    document.documentElement.classList.toggle('lv-public-motion-reduced', reduceMotion);
    document.body.classList.toggle('lv-public-motion-reduced', reduceMotion);
    if (!active) document.body.classList.remove('lv-public-auth-open', 'is-cinematic-enter', 'is-cinematic-leaving');
  }

  async function landingMarkup() {
    if (!templatePromise) {
      templatePromise = fetch(TEMPLATE_URL, { cache: 'no-store', credentials: 'same-origin' })
        .then(response => {
          if (!response.ok) throw new Error(`LUVIA_PUBLIC_LANDING_HTTP_${response.status}`);
          return response.text();
        })
        .then(source => {
          const parsed = new DOMParser().parseFromString(source, 'text/html');
          const entry = parsed.querySelector('[data-entry-root]');
          if (!entry) throw new Error('LUVIA_PUBLIC_LANDING_TEMPLATE_INVALID');
          entry.querySelectorAll('script').forEach(script => script.remove());
          return entry.outerHTML;
        })
        .catch(error => {
          templatePromise = null;
          throw error;
        });
    }
    return templatePromise;
  }

  function authModeFromLocation() {
    if (recoveryRequested()) return 'recovery';
    if (window.location.hash === AUTH_HASHES.register) return 'register';
    if (window.location.hash === AUTH_HASHES.login) return 'login';
    return null;
  }

  function cleanRecoveryLocation() {
    const url = new URL(window.location.href);
    url.searchParams.delete('auth');
    if (url.hash === AUTH_HASHES.login || url.hash === AUTH_HASHES.register) url.hash = '';
    history.replaceState({ luviaPublicAuth: null }, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function authPanelMarkup() {
    return `<section class="lv-public-auth-layer" data-public-auth-layer hidden aria-hidden="true">
      <button class="lv-public-auth-backdrop" type="button" data-public-auth-close aria-label="Anmeldung schließen"></button>
      <div class="lv-public-auth-panel" role="dialog" aria-modal="true" aria-labelledby="lvPublicAuthTitle" tabindex="-1">
        <header class="lv-public-auth-head">
          <a class="lv-public-auth-brand" href="#top" data-public-auth-close aria-label="Zurück zur Luvia Startseite"><img src="assets/public-landing/luvia-compass-brand.svg" alt=""><span><b>LUVIA</b><small>Reisen, die mit dir leben.</small></span></a>
          <button class="lv-public-auth-close" type="button" data-public-auth-close aria-label="Anmeldung schließen">×</button>
        </header>
        <div class="lv-public-auth-compass-guide" aria-label="Der Living Compass begleitet deine ersten Schritte">
          <div class="lv-public-auth-compass-character" aria-hidden="true"><i></i><i></i><img src="assets/public-landing/luvia-compass-brand.svg" alt=""></div>
          <div><span>Living Compass · Kapitel 1</span><strong>Erst sicher ankommen. Dann entdecken wir, wie du reisen möchtest.</strong><p>Nach der E-Mail-Bestätigung führt dich der Compass beim ersten Anmelden spielerisch durch deine Reisewelt.</p><div class="lv-public-auth-preference-preview" aria-hidden="true"><b>Ernährung</b><b>Rhythmus</b><b>Mobilität</b><b>Menschen</b></div></div>
        </div>
        <div class="lv-public-auth-copy"><span data-public-auth-kicker>Willkommen zurück</span><h2 id="lvPublicAuthTitle" data-public-auth-title>Anmelden</h2><p data-public-auth-description>Öffne deine Reisen dort, wo du aufgehört hast.</p></div>
        <div class="lv-public-auth-host" data-public-auth-host></div>
        <p class="lv-public-auth-trust">Private Reisen · klare Kontrolle · nachvollziehbare Wirkungen</p>
      </div>
    </section>`;
  }

  function updateAuthCopy(layer, mode) {
    const copy = {
      login: ['Willkommen zurück', 'Anmelden', 'Öffne deine Reisen dort, wo du aufgehört hast.'],
      register: ['Deine Reise beginnt hier', 'Lass uns losreisen', 'Heute legst du nur deinen sicheren Zugang an. Nach der E-Mail-Bestätigung übernimmt der Living Compass und lernt mit dir deine Reisewelt kennen.'],
      recovery: ['Sicher zurück zu deiner Reise', 'Neues Passwort festlegen', 'Lege ein neues Passwort für dein bestehendes Luvia-Konto fest.']
    }[mode] || [];
    layer.querySelector('[data-public-auth-kicker]').textContent = copy[0] || '';
    layer.querySelector('[data-public-auth-title]').textContent = copy[1] || '';
    layer.querySelector('[data-public-auth-description]').textContent = copy[2] || '';
    const closeLabel = mode === 'register'
      ? 'Registrierung schließen'
      : mode === 'recovery'
        ? 'Passwort-Dialog schließen'
        : 'Anmeldung schließen';
    layer.querySelector('.lv-public-auth-backdrop')?.setAttribute('aria-label', closeLabel);
    layer.querySelector('.lv-public-auth-close')?.setAttribute('aria-label', closeLabel);
  }

  function historyForAuth(mode, replace = false) {
    if (mode === 'recovery') return;
    const url = new URL(window.location.href);
    url.hash = AUTH_HASHES[mode] || '';
    history[replace ? 'replaceState' : 'pushState']({ luviaPublicAuth: mode }, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function closeAuth({ updateHistory = true, restoreFocus = true } = {}) {
    const layer = activeRoot?.querySelector('[data-public-auth-layer]');
    if (!layer || layer.hidden) return;
    window.clearTimeout(authCloseTimer);
    layer.classList.add('is-closing');
    if (updateHistory && !recoveryRequested() && Object.values(AUTH_HASHES).includes(window.location.hash)) {
      const url = new URL(window.location.href);
      url.hash = '#compass-gate';
      history.replaceState({ luviaPublicAuth: null, luviaCompassOpen: true }, '', `${url.pathname}${url.search}${url.hash}`);
    }
    const focusTarget = restoreFocus && previousFocus?.isConnected ? previousFocus : null;
    const snapshot = authReturnSnapshot;
    authCloseTimer = window.setTimeout(() => {
      layer.hidden = true;
      layer.setAttribute('aria-hidden', 'true');
      layer.removeAttribute('data-auth-mode');
      layer.classList.remove('is-closing');
      document.body.classList.remove('lv-public-auth-open');
      window.LuviaPublicLandingMotion?.restoreAfterAuth?.(snapshot);
      requestAnimationFrame(() => focusTarget?.focus?.({ preventScroll: true }));
      previousFocus = null;
      authReturnSnapshot = null;
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 380);
  }

  function renderRecovery(host) {
    const complete = async () => {
      cleanRecoveryLocation();
      document.dispatchEvent(new CustomEvent('reisezeit:login-success', { detail: authApi()?.getState?.() }));
      window.LuviaOwnerFlowNavigationV1?.authLoginSuccess?.();
      await window.LuviaApp?.render?.();
    };
    if (authUi()?.renderRecoveryForm) authUi().renderRecoveryForm(host, { onComplete: complete });
    else host.innerHTML = '<div class="pa-status error">Der sichere Recovery-Dialog konnte nicht geladen werden.</div>';
  }

  function openAuth(mode = 'login', { updateHistory = true, replaceHistory = false, focus = true } = {}) {
    const layer = activeRoot?.querySelector('[data-public-auth-layer]');
    const host = layer?.querySelector('[data-public-auth-host]');
    if (!layer || !host) return;
    if (mode !== 'recovery' && !AUTH_HASHES[mode]) mode = 'login';
    window.clearTimeout(authCloseTimer);
    layer.classList.remove('is-closing');
    if (layer.hidden) {
      previousFocus = document.activeElement;
      authReturnSnapshot = window.LuviaPublicLandingMotion?.captureState?.() || null;
    }
    updateAuthCopy(layer, mode);
    layer.hidden = false;
    layer.setAttribute('aria-hidden', 'false');
    layer.dataset.authMode = mode;
    document.body.classList.add('lv-public-auth-open');
    if (mode === 'recovery') renderRecovery(host);
    else authUi()?.renderAuthForm?.(host, mode);
    if (updateHistory) historyForAuth(mode, replaceHistory);
    if (focus) requestAnimationFrame(() => host.querySelector('input,button')?.focus?.({ preventScroll: true }) || layer.querySelector('.lv-public-auth-panel')?.focus?.({ preventScroll: true }));
  }

  function syncAuthToLocation() {
    const mode = authModeFromLocation();
    const layer = activeRoot?.querySelector('[data-public-auth-layer]');
    if (mode) openAuth(mode, { updateHistory: false, focus: Boolean(layer?.hidden) });
    else closeAuth({ updateHistory: false, restoreFocus: false });
  }

  function bind(root) {
    lifecycle?.abort();
    lifecycle = new AbortController();
    const options = { signal: lifecycle.signal };
    root.insertAdjacentHTML('beforeend', authPanelMarkup());
    root.addEventListener('click', event => {
      const trigger = event.target.closest('[data-public-auth]');
      if (trigger) {
        event.preventDefault();
        openAuth(trigger.dataset.publicAuth || 'login');
        return;
      }
      const close = event.target.closest('[data-public-auth-close]');
      if (close) {
        event.preventDefault();
        closeAuth();
      }
    }, options);
    root.addEventListener('luvia:auth-mode-rendered', event => {
      const mode = event.detail?.mode;
      const layer = root.querySelector('[data-public-auth-layer]');
      if (!layer) return;
      if (mode === 'recovery-request') {
        layer.querySelector('[data-public-auth-kicker]').textContent = 'Sicher zurück zu Luvia';
        layer.querySelector('[data-public-auth-title]').textContent = 'Passwort zurücksetzen';
        layer.querySelector('[data-public-auth-description]').textContent = 'Fordere einen sicheren Link für dein bestehendes Konto an.';
      } else if (mode === 'login' || mode === 'register') {
        layer.dataset.authMode = mode;
        updateAuthCopy(layer, mode);
      }
    }, options);
    root.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !root.querySelector('[data-public-auth-layer]')?.hidden && !recoveryRequested()) {
        event.preventDefault();
        closeAuth();
      }
    }, options);
    window.addEventListener('popstate', syncAuthToLocation, options);
    window.addEventListener('hashchange', syncAuthToLocation, options);
    motionCleanup?.();
    experienceCleanup?.();
    motionCleanup = window.LuviaPublicLandingMotion?.mount?.(root) || null;
    experienceCleanup = window.LuviaPublicLandingExperience?.mount?.(root) || null;
    syncAuthToLocation();
  }

  async function render(container, options = {}) {
    const target = container || document.getElementById('app');
    if (!target || typeof target.querySelector !== 'function') throw new Error('LUVIA_PUBLIC_ENTRY_TARGET_MISSING');
    deactivate({ clear: false });
    activeContainer = target;
    setLandingAssets(true);
    target.setAttribute('aria-busy', 'true');
    target.innerHTML = '<main class="lv-public-entry-loading" data-entry-root><img src="assets/public-landing/luvia-compass-brand.svg" alt=""><strong>Luvia wird geöffnet …</strong></main>';
    const markup = await landingMarkup();
    if (activeContainer !== target) return null;
    target.innerHTML = markup;
    activeRoot = target.querySelector('[data-entry-root]');
    if (!activeRoot) throw new Error('LUVIA_PUBLIC_ENTRY_MOUNT_FAILED');
    bind(activeRoot);
    target.setAttribute('aria-busy', 'false');
    if (options.authMode) openAuth(options.authMode, { updateHistory: false });
    document.dispatchEvent(new CustomEvent('luvia:guided-entry-state', { detail: { version: VERSION, screen: 'landing', authMode: authModeFromLocation() } }));
    return activeRoot;
  }

  function deactivate({ clear = false } = {}) {
    window.clearTimeout(authCloseTimer);
    authCloseTimer = 0;
    lifecycle?.abort();
    lifecycle = null;
    motionCleanup?.();
    experienceCleanup?.();
    motionCleanup = null;
    experienceCleanup = null;
    if (clear && activeContainer) activeContainer.innerHTML = '';
    activeContainer = null;
    activeRoot = null;
    previousFocus = null;
    authReturnSnapshot = null;
    setLandingAssets(false);
  }

  window.LuviaGuidedJourneyEntry = Object.freeze({
    version: VERSION,
    render,
    deactivate,
    openAuth,
    getState: () => ({ version: VERSION, screen: 'landing', authMode: authModeFromLocation(), active: Boolean(activeRoot?.isConnected) })
  });
})();
