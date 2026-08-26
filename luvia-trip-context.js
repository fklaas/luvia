import {
  ACTIVE_TRIP_CONTEXT_VERSION,
  createActiveTripContext,
} from './core/trips/active-trip-context.mjs?v=13.82.79';

const web =
  globalThis.window;

if (!web) {
  throw new Error(
    'LuviaTripContext Web Binding requires a browser window.'
  );
}

const tripStateReader =
  web.LuviaTripStateReaderV1;

if (
  !tripStateReader ||
  typeof tripStateReader.snapshot !==
    'function' ||
  typeof tripStateReader.subscribe !==
    'function'
) {
  throw new Error(
    'LuviaTripContext Web Binding requires LuviaTripStateReaderV1 before initialization.'
  );
}

const coreContext =
  createActiveTripContext({
    readTripState:
      () =>
        tripStateReader.snapshot(),

    subscribeTripState:
      (listener) =>
        tripStateReader.subscribe(
          listener
        ),
  });

function refresh() {
  tripStateReader
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
            'LuviaTripStateReaderV1',

          ready:
            true,
        }),
  });

web.LuviaTripContext =
  api;
