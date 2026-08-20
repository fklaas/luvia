export const ACTIVE_TRIP_CONTEXT_VERSION =
  '1.0.0';

const DEFAULT_SYMBOL =
  '❤️';

const DEFAULT_ACCENT =
  '#ee6f83';

function clean(value) {
  const text =
    String(
      value ?? ''
    ).trim();

  return (
    text ||
    null
  );
}

function cloneDestination(value) {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return null;
  }

  return Object.freeze({
    ...value,
  });
}

function cloneParticipants(value) {
  if (
    !Array.isArray(value)
  ) {
    return value;
  }

  return Object.freeze(
    value.map(
      (participant) => {
        if (
          participant &&
          typeof participant === 'object'
        ) {
          return Object.freeze({
            ...participant,
          });
        }

        return participant;
      }
    )
  );
}

function cloneTrip(value) {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return null;
  }

  const destination =
    cloneDestination(
      value.destination
    );

  const participants =
    cloneParticipants(
      value.participants
    );

  return Object.freeze({
    ...value,

    destination,

    ...(participants !== undefined
      ? {
          participants,
        }
      : {}),
  });
}

function sourceActiveTrip(source) {
  if (
    !source ||
    typeof source !== 'object'
  ) {
    return null;
  }

  if (
    source.activeTrip &&
    typeof source.activeTrip === 'object'
  ) {
    return source.activeTrip;
  }

  const activeTripId =
    clean(
      source.activeTripId
    );

  if (
    !activeTripId ||
    !Array.isArray(
      source.trips
    )
  ) {
    return null;
  }

  return (
    source.trips.find(
      (trip) =>
        clean(
          trip?.id ??
          trip?.tripId ??
          trip?.trip_id
        ) ===
        activeTripId
    ) ||
    null
  );
}

export function projectActiveTripSnapshot(
  source
) {
  const rawTrip =
    sourceActiveTrip(
      source
    );

  const trip =
    cloneTrip(
      rawTrip
    );

  if (!trip) {
    return Object.freeze({
      trip: null,
      tripId: null,
      hasActiveTrip: false,
      tripName: 'Unsere Reise',
      destination: null,
      destinationName: '',
      symbol: DEFAULT_SYMBOL,
      accent: DEFAULT_ACCENT,
      startDate: null,
      endDate: null,
      role: null,
      isOwner: false,
    });
  }

  const tripId =
    clean(
      trip.id ??
      trip.tripId ??
      trip.trip_id
    );

  const role =
    clean(
      trip.role
    );

  const normalizedRole =
    String(
      role ?? ''
    ).toLowerCase();

  const destination =
    trip.destination &&
    typeof trip.destination === 'object'
      ? trip.destination
      : null;

  return Object.freeze({
    trip,
    tripId,
    hasActiveTrip:
      Boolean(
        tripId ||
        trip
      ),

    tripName:
      clean(
        trip.title ??
        trip.name
      ) ||
      'Unsere Reise',

    destination,

    destinationName:
      clean(
        destination?.name ??
        trip.destinationName ??
        trip.destination_name
      ) ||
      '',

    symbol:
      clean(
        trip.symbol
      ) ||
      DEFAULT_SYMBOL,

    accent:
      clean(
        trip.accent
      ) ||
      DEFAULT_ACCENT,

    startDate:
      clean(
        trip.startDate ??
        trip.start_date
      ),

    endDate:
      clean(
        trip.endDate ??
        trip.end_date
      ),

    role,

    isOwner:
      Boolean(
        trip.isOwner ||
        normalizedRole ===
          'owner' ||
        normalizedRole ===
          'admin'
      ),
  });
}

export function createActiveTripContext({
  readTripState,
  subscribeTripState = null,
} = {}) {
  if (
    typeof readTripState !==
    'function'
  ) {
    throw new TypeError(
      'Active Trip Context: readTripState must be a function.'
    );
  }

  if (
    subscribeTripState !== null &&
    typeof subscribeTripState !==
      'function'
  ) {
    throw new TypeError(
      'Active Trip Context: subscribeTripState must be a function or null.'
    );
  }

  const getSnapshot =
    () =>
      projectActiveTripSnapshot(
        readTripState()
      );

  const getActiveTrip =
    () =>
      getSnapshot().trip;

  const getDestination =
    () =>
      getSnapshot().destination;

  const getDestinationName =
    () =>
      getSnapshot()
        .destinationName;

  const getTripName =
    () =>
      getSnapshot().tripName;

  const getAccent =
    () =>
      getSnapshot().accent;

  const getDates =
    () => {
      const snapshot =
        getSnapshot();

      return Object.freeze({
        startDate:
          snapshot.startDate,

        endDate:
          snapshot.endDate,
      });
    };

  const subscribe =
    (listener) => {
      if (
        typeof listener !==
        'function'
      ) {
        throw new TypeError(
          'Active Trip Context: listener must be a function.'
        );
      }

      let active = true;
      let delivered = false;
      let unsubscribeSource =
        () => {};

      const deliver =
        (source) => {
          if (!active) {
            return;
          }

          delivered = true;

          listener(
            projectActiveTripSnapshot(
              source ??
              readTripState()
            )
          );
        };

      if (
        subscribeTripState
      ) {
        const returned =
          subscribeTripState(
            deliver
          );

        if (
          typeof returned ===
          'function'
        ) {
          unsubscribeSource =
            returned;
        }
      }

      if (!delivered) {
        deliver(
          readTripState()
        );
      }

      return () => {
        if (!active) {
          return;
        }

        active = false;

        unsubscribeSource();
      };
    };

  return Object.freeze({
    version:
      ACTIVE_TRIP_CONTEXT_VERSION,

    getSnapshot,
    getActiveTrip,
    getDestination,
    getDestinationName,
    getTripName,
    getAccent,
    getDates,
    subscribe,
  });
}
