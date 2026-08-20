export const PLATFORM_PORT_IDS = Object.freeze([
  'StoragePort',
  'SecureStoragePort',
  'AuthSessionPort',
  'LocationPort',
  'MediaPickerPort',
  'MediaCapturePort',
  'MediaStoragePort',
  'NotificationPort',
  'NetworkPort',
  'LifecyclePort',
  'SharingPort',
  'DeepLinkPort',
  'ExternalNavigationPort',
  'DevicePort',
  'PermissionPort',
  'OfflineCachePort',
]);

export function createPlatformPortRegistry(seed = {}) {
  const ports = new Map();

  function assertId(id) {
    if (!PLATFORM_PORT_IDS.includes(id)) {
      throw new Error(
        'Unknown platform port: ' + id
      );
    }
  }

  function register(id, implementation) {
    assertId(id);

    if (
      !implementation ||
      (
        typeof implementation !== 'object' &&
        typeof implementation !== 'function'
      )
    ) {
      throw new TypeError(
        'Platform port implementation required: ' + id
      );
    }

    ports.set(
      id,
      implementation
    );

    return api;
  }

  function get(id) {
    assertId(id);

    return (
      ports.get(id) ||
      null
    );
  }

  function requirePort(id) {
    const implementation =
      get(id);

    if (!implementation) {
      throw new Error(
        'Platform port not registered: ' + id
      );
    }

    return implementation;
  }

  function has(id) {
    assertId(id);

    return ports.has(id);
  }

  function list() {
    return PLATFORM_PORT_IDS.map(
      (id) => ({
        id,
        registered:
          ports.has(id),
      })
    );
  }

  const api = Object.freeze({
    register,
    get,
    require: requirePort,
    has,
    list,
  });

  for (
    const [id, implementation]
    of Object.entries(seed)
  ) {
    register(
      id,
      implementation
    );
  }

  return api;
}
