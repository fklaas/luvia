'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const files = [
  'core/recommendations/cross-module-recommendation-service.js',
  'core/recommendations/live-day-companion-service.js',
  'core/recommendations/recommendation-service.js',
  'core/recommendations/restaurant-intelligence-service.js',
  'core/recommendations/schedule-intelligence-service.js',
  'core/recommendations/today-intelligence-service.js'
];

const contractPath = 'core/platform/trip-contract-adapter.js';
const contractText = fs.readFileSync(path.join(root, contractPath), 'utf8');

for (const capability of ['getActiveTrip', 'getContext', 'listTrips', 'selectActiveTrip']) {
  const pattern = new RegExp('\\b' + capability + '\\b');
  if (!pattern.test(contractText)) {
    console.error('CONTRACT_CAPABILITY_MISSING: ' + capability);
    process.exit(2);
  }
}

const privateStorePattern = /\bLuviaTripStore\b/g;
const publicContractPattern = /\b(?:LuviaTripContractV1|LuviaTripContract)\b/;
const privateMutationPattern = /\bLuviaTripStore(?:\?\.|\.)\s*(?:setActive|loadRemote|initialize|upsert|create|update|remove|delete|save|replace|setTrips|hydrate|reset)\b/g;

const violations = [];

for (const file of files) {
  const absolute = path.join(root, file);
  const text = fs.readFileSync(absolute, 'utf8');

  const privateMatches = text.match(privateStorePattern) || [];
  const mutationMatches = text.match(privateMutationPattern) || [];

  if (mutationMatches.length > 0) {
    violations.push('PRIVATE_TRIP_STORE_MUTATION: ' + file + ' count=' + mutationMatches.length);
  }

  if (privateMatches.length > 0) {
    violations.push('PRIVATE_TRIP_STORE: ' + file + ' count=' + privateMatches.length);
  }

  if (!publicContractPattern.test(text)) {
    violations.push('PUBLIC_TRIP_CONTRACT_MISSING: ' + file);
  }
}

if (violations.length > 0) {
  console.error('M5.1k Recommendations Trip Contract Adoption: FAIL');
  for (const violation of violations) {
    console.error(violation);
  }
  process.exit(1);
}

console.log('M5.1k Recommendations Trip Contract Adoption: PASS');
console.log('Recommendations runtime files: 6 / 6');
console.log('Private LuviaTripStore references: 0');
console.log('Public Trip Contract adoption: 6 / 6');
console.log('Trip Contract extension: NONE');
