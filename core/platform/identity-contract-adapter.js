(() => {
  'use strict';

  const CONTRACT_ID = 'identity.v1';
  const VERSION = '1';
  const RUNTIME_VERSION = '1.0.0';

  const EVENTS = Object.freeze([
    'identity.changed',
    'preferences.changed'
  ]);

  const VIEWER_FIELDS = Object.freeze([
    'userId',
    'displayName',
    'firstName',
    'lastName',
    'avatarUrl',
    'avatarColor',
    'language',
    'timezone',
    'homeLocation',
    'themeMode',
    'density',
    'reducedMotion',
    'useTripAccent',
    'defaultView',
    'showArchivedTrips',
    'personalizedRecommendations',
    'activityData',
    'locationSharing',
    'notifications'
  ]);

  const PROFILE_WRITE_FIELDS = Object.freeze([
    'displayName',
    'firstName',
    'lastName',
    'avatarUrl',
    'avatarColor',
    'language',
    'timezone',
    'homeLocation',
    'themeMode',
    'density',
    'reducedMotion',
    'useTripAccent',
    'defaultView',
    'showArchivedTrips',
    'personalizedRecommendations',
    'activityData',
    'locationSharing',
    'notifications'
  ]);

  const PREFERENCE_FIELDS = Object.freeze([
    'dietaryPreferences',
    'travelInterests',
    'travelStyles',
    'activityPreferences',
    'entertainmentPreferences',
    'diningPreferences',
    'mobilityPreferences',
    'atmospherePreferences',
    'travelPace',
    'budgetPreference',
    'familyPreferences',
    'accessibilityPreferences',
    'accessibilityNeeds',
    'preferenceSchemaVersion',
    'preferencesCompletedAt',
    'preferencesUpdatedAt'
  ]);

  function contractError(code, message, extra = {}) {
    const error = new Error(message);
    error.code = code;
    Object.assign(error, extra);
    return error;
  }

  function providerUnavailable(provider) {
    return contractError(
      'IDENTITY_CONTRACT_PROVIDER_UNAVAILABLE',
      `Identity provider unavailable: ${provider}`,
      { provider }
    );
  }

  function selfOnly() {
    return contractError(
      'IDENTITY_CONTRACT_SELF_ONLY',
      'Identity preferences are self-only.'
    );
  }

  function profileFieldNotAllowed(field) {
    return contractError(
      'IDENTITY_CONTRACT_PROFILE_FIELD_NOT_ALLOWED',
      `Identity profile field not allowed: ${field}`,
      { field }
    );
  }

  function deepFreeze(value) {
    if (value === null || value === undefined) return value;

    if (Array.isArray(value)) {
      value.forEach(deepFreeze);
      return Object.freeze(value);
    }

    if (typeof value === 'object') {
      Object.values(value).forEach(deepFreeze);
      return Object.freeze(value);
    }

    return value;
  }

  function clone(value) {
    if (value === null || value === undefined) return value;
    return structuredClone(value);
  }

  function profileProvider() {
    const provider = window.LuviaProfileService;

    if (
      !provider ||
      typeof provider.snapshot !== 'function'
    ) {
      throw providerUnavailable(
        'LuviaProfileService.snapshot'
      );
    }

    return provider;
  }

  function preferencesProvider() {
    const provider = window.LuviaUserPreferences;

    if (
      !provider ||
      typeof provider.get !== 'function'
    ) {
      throw providerUnavailable(
        'LuviaUserPreferences.get'
      );
    }

    return provider;
  }

  function currentProfile() {
    return profileProvider().snapshot()?.profile || {};
  }

  function projectViewer(input = {}) {
    const output = {};

    for (const field of VIEWER_FIELDS) {
      output[field] =
        input[field] === undefined
          ? null
          : clone(input[field]);
    }

    return deepFreeze(output);
  }

  function projectPublic(input = {}) {
    return deepFreeze({
      userId:
        input.userId === undefined
          ? null
          : clone(input.userId),

      displayName:
        input.displayName === undefined
          ? null
          : clone(input.displayName),

      avatarUrl:
        input.avatarUrl === undefined
          ? null
          : clone(input.avatarUrl),

      avatarColor:
        input.avatarColor === undefined
          ? null
          : clone(input.avatarColor)
    });
  }

  function projectPreferences(input = {}) {
    const output = {};

    for (const field of PREFERENCE_FIELDS) {
      output[field] =
        input[field] === undefined
          ? null
          : clone(input[field]);
    }

    return deepFreeze(output);
  }

  function sanitizeProfilePatch(patch = {}) {
    if (
      !patch ||
      typeof patch !== 'object' ||
      Array.isArray(patch)
    ) {
      throw contractError(
        'IDENTITY_CONTRACT_PROFILE_PATCH_REQUIRED',
        'Identity profile patch must be an object.'
      );
    }

    const allowed = new Set(PROFILE_WRITE_FIELDS);
    const output = {};

    for (const [field, value] of Object.entries(patch)) {
      if (!allowed.has(field)) {
        throw profileFieldNotAllowed(field);
      }

      output[field] = clone(value);
    }

    return output;
  }

  function sanitizePreferencePatch(patch = {}) {
    if (
      !patch ||
      typeof patch !== 'object' ||
      Array.isArray(patch)
    ) {
      throw contractError(
        'IDENTITY_CONTRACT_PREFERENCE_PATCH_REQUIRED',
        'Identity preference patch must be an object.'
      );
    }

    const allowed = new Set(PREFERENCE_FIELDS);
    const output = {};

    for (const [field, value] of Object.entries(patch)) {
      if (!allowed.has(field)) {
        throw contractError(
          'IDENTITY_CONTRACT_PREFERENCE_FIELD_NOT_ALLOWED',
          `Identity preference field not allowed: ${field}`,
          { field }
        );
      }

      output[field] = clone(value);
    }

    return output;
  }

  function getViewerIdentity() {
    return projectViewer(currentProfile());
  }

  function getPublicIdentity(userId = null) {
    const profile = currentProfile();
    const viewerId = profile.userId || null;

    if (
      userId !== null &&
      userId !== undefined &&
      String(userId) !== String(viewerId)
    ) {
      throw providerUnavailable(
        'publicIdentityLookup'
      );
    }

    return projectPublic(profile);
  }

  function getPreferences(scope = 'self') {
    if (scope !== 'self') {
      throw selfOnly();
    }

    return projectPreferences(
      preferencesProvider().get()
    );
  }

  async function updateProfile(patch = {}) {
    const provider = profileProvider();

    if (typeof provider.save !== 'function') {
      throw providerUnavailable(
        'LuviaProfileService.save'
      );
    }

    const safePatch = sanitizeProfilePatch(patch);
    const saved = await provider.save(safePatch);

    return projectViewer(saved || {});
  }

  async function updatePreferences(
    patchOrCategory = {},
    categoryValue
  ) {
    const provider = preferencesProvider();

    if (typeof patchOrCategory === 'string') {
      if (
        typeof provider.replaceCategory !== 'function'
      ) {
        throw providerUnavailable(
          'LuviaUserPreferences.replaceCategory'
        );
      }

      const result = await provider.replaceCategory(
        patchOrCategory,
        clone(categoryValue)
      );

      return projectPreferences(result || {});
    }

    if (typeof provider.update !== 'function') {
      throw providerUnavailable(
        'LuviaUserPreferences.update'
      );
    }

    const safePatch =
      sanitizePreferencePatch(patchOrCategory);

    const result = await provider.update(safePatch);

    return projectPreferences(result || {});
  }

  function identityPayload(detail = {}) {
    const profile =
      detail.profile ||
      currentProfile();

    return deepFreeze({
      reason: detail.reason || 'changed',
      identity: projectPublic(profile)
    });
  }

  function preferencesPayload(detail = {}) {
    const snapshot = detail.snapshot || {};

    return deepFreeze({
      reason: detail.reason || 'changed',
      revision:
        snapshot.revision === undefined
          ? null
          : snapshot.revision,
      loaded:
        snapshot.loaded === undefined
          ? null
          : Boolean(snapshot.loaded),
      syncing:
        snapshot.syncing === undefined
          ? null
          : Boolean(snapshot.syncing)
    });
  }

  function envelope(
    source,
    sourceEvent,
    payload
  ) {
    return deepFreeze({
      contractId: CONTRACT_ID,
      version: VERSION,
      source,
      sourceEvent,
      payload
    });
  }

  function dispatchContractEvent(
    name,
    source,
    sourceEvent,
    payload
  ) {
    const detail = envelope(
      source,
      sourceEvent,
      payload
    );

    window.dispatchEvent(
      new CustomEvent(`luvia:${name}`, {
        detail
      })
    );

    return detail;
  }

  function bridgeProfile(event) {
    dispatchContractEvent(
      'identity.changed',
      'identity',
      'luvia:profile-changed',
      identityPayload(event?.detail || {})
    );
  }

  function bridgePreferences(event) {
    dispatchContractEvent(
      'preferences.changed',
      'preferences',
      'luvia:user-preferences-changed',
      preferencesPayload(event?.detail || {})
    );
  }

  window.addEventListener(
    'luvia:profile-changed',
    bridgeProfile
  );

  window.addEventListener(
    'luvia:user-preferences-changed',
    bridgePreferences
  );

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw contractError(
        'IDENTITY_CONTRACT_LISTENER_REQUIRED',
        'Identity contract listener required.'
      );
    }

    const identityHandler = event =>
      listener(event.detail);

    const preferenceHandler = event =>
      listener(event.detail);

    window.addEventListener(
      'luvia:identity.changed',
      identityHandler
    );

    window.addEventListener(
      'luvia:preferences.changed',
      preferenceHandler
    );

    return () => {
      window.removeEventListener(
        'luvia:identity.changed',
        identityHandler
      );

      window.removeEventListener(
        'luvia:preferences.changed',
        preferenceHandler
      );
    };
  }

  function diagnostics() {
    const providers = deepFreeze({
      profile:
        Boolean(
          window.LuviaProfileService &&
          typeof window.LuviaProfileService.snapshot ===
            'function'
        ),

      preferences:
        Boolean(
          window.LuviaUserPreferences &&
          typeof window.LuviaUserPreferences.get ===
            'function'
        ),

      travelPreferences:
        Boolean(window.LuviaTravelPreferences),

      publicIdentityLookup: false
    });

    return deepFreeze({
      contractId: CONTRACT_ID,
      version: VERSION,
      runtimeVersion: RUNTIME_VERSION,
      ready:
        providers.profile &&
        providers.preferences &&
        providers.travelPreferences,
      providers,
      publicIdentityMode: 'self-only'
    });
  }

  const api = Object.freeze({
    contractId: CONTRACT_ID,
    version: VERSION,
    runtimeVersion: RUNTIME_VERSION,
    events: EVENTS,

    getViewerIdentity,
    getPublicIdentity,
    getPreferences,
    subscribe,

    commands: Object.freeze({
      updateProfile,
      updatePreferences
    }),

    diagnostics
  });

  window.LuviaIdentityContractV1 = api;
  window.LuviaIdentityContract = api;

  if (
    window.LuviaGlobalContracts &&
    typeof window.LuviaGlobalContracts.register ===
      'function'
  ) {
    window.LuviaGlobalContracts.register({
      id: CONTRACT_ID,
      version: VERSION,
      required: false,
      probe: () => ({
        available:
          Boolean(window.LuviaIdentityContractV1),
        detail: 'identity.v1 runtime adapter'
      })
    });
  }
})();