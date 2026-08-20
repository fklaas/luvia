import {
  ACTIVE_TRIP_CONTEXT_VERSION,
  createActiveTripContext,
} from './core/trips/active-trip-context.mjs?v=13.82.11';

const web =
  globalThis.window;

if (!web) {
  throw new Error(
    'LuviaTripContext Web Binding requires a browser window.'
  );
}

const tripStore =
  web.LuviaTripStore;

if (
  !tripStore ||
  typeof tripStore.snapshot !==
    'function' ||
  typeof tripStore.subscribe !==
    'function'
) {
  throw new Error(
    'LuviaTripContext Web Binding requires LuviaTripStore before initialization.'
  );
}

const coreContext =
  createActiveTripContext({
    readTripState:
      () =>
        tripStore.snapshot(),

    subscribeTripState:
      (listener) =>
        tripStore.subscribe(
          listener
        ),
  });

function refresh() {
  tripStore
    .reconcileLegacy
    ?.();

  return coreContext
    .getSnapshot();
}

const api =
  Object.freeze({
    getActiveTrip:
      coreContext
        .getActiveTrip,

    getDestination:
      coreContext
        .getDestination,

    getDestinationName:
      coreContext
        .getDestinationName,

    getTripName:
      coreContext
        .getTripName,

    getAccent:
      coreContext
        .getAccent,

    getDates:
      coreContext
        .getDates,

    getSnapshot:
      coreContext
        .getSnapshot,

    refresh,

    subscribe:
      coreContext
        .subscribe,

    diagnostics:
      () =>
        Object.freeze({
          binding:
            'web-runtime-compatibility',

          coreVersion:
            ACTIVE_TRIP_CONTEXT_VERSION,

          provider:
            'LuviaTripStore',

          ready:
            true,
        }),
  });

web.LuviaTripContext =
  api;
