(() => {
  'use strict';
  const redirectUrl = window.LuviaEnvironment?.authRedirectUrl?.('index.html') || `${location.origin}${location.pathname}`;
  const config = Object.freeze({
    url: 'https://yiadkcxgyzdgyadnhyqe.supabase.co',
    publishableKey: 'sb_publishable_RMrTCl-8az9LV2y8OAGPEw_dy3ioVOs',
    redirectUrl
  });
  // Canonical Luvia namespace. Paris* remains a read-compatible alias during migration phase 1.
  window.LuviaSupabaseConfig = config;
  window.ParisSupabaseConfig = config;
  window.LUVIA_AUTH_CONFIG = Object.freeze({
    supabaseUrl: config.url,
    publishableKey: config.publishableKey,
    redirectUrl
  });
})();
