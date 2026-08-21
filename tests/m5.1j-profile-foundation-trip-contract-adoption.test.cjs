'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const profilePath = path.join(root, 'core/profiles/profile-foundation.js');
const adapterPath = path.join(root, 'core/platform/trip-contract-adapter.js');

const profile = fs.readFileSync(profilePath, 'utf8');
const adapter = fs.readFileSync(adapterPath, 'utf8');

assert(
  adapter.includes('reads:Object.freeze({listTrips,getTrip,getActiveTrip,getContext,subscribe})'),
  'existing Trip Contract read namespace must expose listTrips/getActiveTrip/getContext'
);

assert(
  /commands\s*:\s*Object\.freeze\(\{[^}]*\bselectActiveTrip\b[^}]*\}\)/.test(adapter),
  'existing Trip Contract command namespace must expose selectActiveTrip'
);

assert(
  adapter.includes('store().setActive(id||null);'),
  'selectActiveTrip must remain the public command bridge to the private Trip Store owner'
);

assert(
  !/\bLuviaTripStore\b/.test(profile),
  'profile-foundation must not read or mutate LuviaTripStore directly'
);

assert(
  /\bLuviaTripContract(?:V1)?\b/.test(profile),
  'profile-foundation must consume the public Trip Contract'
);

assert(
  /\.listTrips(?:\?\.)?\s*\(/.test(profile),
  'profile-foundation must obtain the trip collection via listTrips()'
);

assert(
  /\.getActiveTrip(?:\?\.)?\s*\(/.test(profile),
  'profile-foundation must obtain the active trip via getActiveTrip()'
);

assert(
  /\.getContext(?:\?\.)?\s*\(/.test(profile),
  'profile-foundation must obtain activeTripId/tripId via getContext()'
);

assert(
  /\.selectActiveTrip(?:\?\.)?\s*\(/.test(profile),
  'profile-foundation must activate trips through selectActiveTrip(id)'
);

assert(
  !/LuviaTripStore\s*(?:\.|\?\.)\s*snapshot\s*\(/.test(profile),
  'private Trip Store snapshot access must be removed'
);

assert(
  !/LuviaTripStore\s*(?:\.|\?\.)\s*setActive\s*\(/.test(profile),
  'private Trip Store setActive mutation must be removed'
);

console.log('M5.1j Profile Foundation Trip Contract Adoption: PASS');
