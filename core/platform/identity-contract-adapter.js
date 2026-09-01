(() => {
  'use strict';

  const CONTRACT_ID = 'identity.v1';
  const VERSION = '1';
  const RUNTIME_VERSION = '1.2.0';
  const root = window;

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
    const provider = root.LuviaProfileService;

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
    const provider = root.LuviaUserPreferences;

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

  function domainCore() {
    const core = root.LuviaIdentityDomainContractCoreV1;
    if (!core) throw providerUnavailable('LuviaIdentityDomainContractCoreV1');
    return core;
  }

  function projectViewer(input = {}) {
    return domainCore().projectViewer(input);
  }

  function projectPublic(input = {}) {
    return domainCore().projectPublic(input);
  }

  function projectPreferences(input = {}) {
    return domainCore().projectPreferences(input);
  }

  function sanitizeProfilePatch(patch = {}) {
    return domainCore().sanitizeProfilePatch(patch);
  }

  function sanitizePreferencePatch(patch = {}) {
    return domainCore().sanitizePreferencePatch(patch);
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

  function exportData(scope = 'self') {
    if (scope !== 'self') throw selfOnly();
    return deepFreeze({
      contractId: CONTRACT_ID,
      version: VERSION,
      exportedAt: new Date().toISOString(),
      viewer: clone(getViewerIdentity()),
      preferences: clone(getPreferences('self')),
      excludes: Object.freeze([
        'auth-tokens',
        'passwords',
        'other-users-private-data'
      ])
    });
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

  async function completeOnboarding(input = {}) {
    const provider = profileProvider();

    if (typeof provider.save !== 'function') {
      throw providerUnavailable(
        'LuviaProfileService.save'
      );
    }

    const core = domainCore();
    const requestedProfile = input.profile && typeof input.profile === 'object'
      ? input.profile
      : {};
    const requestedPreferences = input.preferences && typeof input.preferences === 'object'
      ? input.preferences
      : {};
    const profilePatch = Object.fromEntries(
      core.profileWriteFields
        .filter(field => requestedProfile[field] !== undefined)
        .map(field => [field, clone(requestedProfile[field])])
    );
    const preferencePatch = Object.fromEntries(
      core.preferenceFields
        .filter(field => requestedPreferences[field] !== undefined)
        .map(field => [field, clone(requestedPreferences[field])])
    );
    const now = new Date().toISOString();
    const safeProfile = sanitizeProfilePatch(profilePatch);
    const safePreferences = sanitizePreferencePatch({
      ...preferencePatch,
      preferenceSchemaVersion: Number(requestedPreferences.preferenceSchemaVersion || 3) || 3,
      preferencesCompletedAt: requestedPreferences.preferencesCompletedAt || now,
      preferencesUpdatedAt: now
    });
    const saved = await provider.save({
      ...safeProfile,
      ...safePreferences
    });
    const committed = saved || {};

    return deepFreeze({
      identity: projectViewer(committed),
      preferences: projectPreferences(committed),
      completedAt: committed.preferencesCompletedAt || safePreferences.preferencesCompletedAt,
      receipt: {
        owner: 'identity',
        contractId: CONTRACT_ID,
        command: 'completeOnboarding',
        status: 'committed',
        mode: input.mode === 'edit' ? 'edit' : 'first-use'
      }
    });
  }

  async function setTripArchived(tripId, archived = true) {
    const provider = profileProvider();
    if (typeof provider.archiveTrip !== 'function') {
      throw providerUnavailable('LuviaProfileService.archiveTrip');
    }
    const normalizedTripId = String(tripId || '').trim();
    if (!normalizedTripId) {
      throw contractError('IDENTITY_CONTRACT_TRIP_ID_REQUIRED', 'Trip id is required.');
    }
    const saved = await provider.archiveTrip(normalizedTripId, Boolean(archived));
    return deepFreeze({
      tripId: normalizedTripId,
      archived: Boolean(archived),
      identity: projectViewer(saved || currentProfile()),
      receipt: { owner: 'identity', contractId: CONTRACT_ID, command: 'setTripArchived', status: 'committed' }
    });
  }

  async function updateDashboardLayout(items = []) {
    const provider = profileProvider();
    if (typeof provider.saveDashboardLayout !== 'function') {
      throw providerUnavailable('LuviaProfileService.saveDashboardLayout');
    }
    const layout = domainCore().normalizeDashboardLayout(items);
    await provider.saveDashboardLayout(layout);
    return deepFreeze({
      count: layout.length,
      layout,
      receipt: { owner: 'identity', contractId: CONTRACT_ID, command: 'updateDashboardLayout', status: 'committed' }
    });
  }

  function notificationPort() {
    return root.LuviaPlatformPorts?.get?.('NotificationPort') ||
      root.LuviaIdentityPlatformWebPorts?.NotificationPort ||
      null;
  }

  async function requestNotificationPermission() {
    const port = notificationPort();
    if (typeof port?.requestPermission !== 'function') {
      throw providerUnavailable('NotificationPort.requestPermission');
    }
    const permission = await port.requestPermission();
    return deepFreeze({
      permission: String(permission || 'unsupported'),
      status: typeof port.status === 'function' ? port.status() : null,
      receipt: { owner: 'platform', contractId: CONTRACT_ID, command: 'requestNotificationPermission', status: 'completed' }
    });
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

    root.dispatchEvent(
      new CustomEvent(`luvia:${name}`, {
        detail
      })
    );

    root.LuviaEventContractV1?.publish?.(
      name,
      payload,
      {
        source,
        domainContractId: CONTRACT_ID,
        domainVersion: VERSION,
        subject: 'viewer'
      }
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

  root.addEventListener(
    'luvia:profile-changed',
    bridgeProfile
  );

  root.addEventListener(
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

    root.addEventListener(
      'luvia:identity.changed',
      identityHandler
    );

    root.addEventListener(
      'luvia:preferences.changed',
      preferenceHandler
    );

    return () => {
      root.removeEventListener(
        'luvia:identity.changed',
        identityHandler
      );

      root.removeEventListener(
        'luvia:preferences.changed',
        preferenceHandler
      );
    };
  }

  function diagnostics() {
    const providers = deepFreeze({
      profile:
        Boolean(
          root.LuviaProfileService &&
          typeof root.LuviaProfileService.snapshot ===
            'function'
        ),

      preferences:
        Boolean(
          root.LuviaUserPreferences &&
          typeof root.LuviaUserPreferences.get ===
            'function'
        ),

      travelPreferences:
        Boolean(root.LuviaTravelPreferences),

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
      publicIdentityMode: 'self-only',
      browserlessDomainCore: Boolean(root.LuviaIdentityDomainContractCoreV1),
      eventEnvelopeContract: Boolean(root.LuviaEventContractV1),
      platformPorts: ['StoragePort','SecureStoragePort','AuthSessionPort','NotificationPort'].map(id => ({
        id,
        registered: Boolean(root.LuviaPlatformPorts?.has?.(id) || root.LuviaIdentityPlatformWebPorts?.[id])
      }))
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
    exportData,
    subscribe,

    reads: Object.freeze({
      getViewerIdentity,
      getPublicIdentity,
      getPreferences,
      exportData
    }),

    commands: Object.freeze({
      updateProfile,
      updatePreferences,
      completeOnboarding,
      updateDashboardLayout,
      setTripArchived,
      requestNotificationPermission
    }),

    diagnostics
  });

  root.LuviaIdentityContractV1 = api;
  root.LuviaIdentityContract = api;

  if (
    root.LuviaGlobalContracts &&
    typeof root.LuviaGlobalContracts.register ===
      'function'
  ) {
    root.LuviaGlobalContracts.register({
      id: CONTRACT_ID,
      version: VERSION,
      required: false,
      probe: () => ({
        available:
          Boolean(root.LuviaIdentityContractV1),
        detail: 'identity.v1 runtime adapter'
      })
    });
  }
})();
