'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const GALLERY_PATH = path.join(ROOT, 'app', 'gallery-view.js');
const SOURCE = fs.readFileSync(GALLERY_PATH, 'utf8');

function instrumentGallery() {
  const closingIife = /\r?\n\}\)\(\);\s*$/;

  assert.match(
    SOURCE,
    closingIife,
    'Gallery source must keep its closing IIFE boundary'
  );

  return SOURCE.replace(
    closingIife,
    `
  window.__LuviaM51bGalleryTripTest = Object.freeze({
    tripContract,
    activeTrip,
    placeContextFor,
    galleryDownloadLabel
  });
})();`
  );
}

function evaluateGallery() {
  const sandbox = {
    window: {
      CSS: {
        escape: value => String(value)
      }
    },
    location: {
      search: ''
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    console: {
      info: () => {},
      warn: () => {},
      error: () => {},
      log: () => {}
    },
    TextEncoder,
    setTimeout,
    clearTimeout
  };

  for (const legacyGlobal of [
    'LuviaTripStore',
    'LuviaTripContext',
    'LuviaAppState'
  ]) {
    Object.defineProperty(
      sandbox.window,
      legacyGlobal,
      {
        configurable: true,
        get() {
          throw new Error(
            `Gallery attempted forbidden legacy access: ${legacyGlobal}`
          );
        }
      }
    );
  }

  vm.createContext(sandbox);
  vm.runInContext(
    instrumentGallery(),
    sandbox,
    { filename: 'app/gallery-view.js' }
  );

  return sandbox;
}

test('Gallery has no direct Trip truth, DB or legacy-event access', () => {
  const forbiddenReferences = [
    /\bLuviaTripStore\b/,
    /\bLuviaTripContext\b/,
    /\bLuviaAppState\b/,
    /luvia:trips-changed/,
    /luvia:trip-changed/,
    /luvia:trip-context-changed/,
    /\.from\s*\(/,
    /\.rpc\s*\(/
  ];

  for (const reference of forbiddenReferences) {
    assert.equal(
      reference.test(SOURCE),
      false,
      `Forbidden Trip boundary reference remains: ${reference}`
    );
  }

  assert.equal(
    /\.(?:selectActiveTrip|createTrip|updateTrip|joinTrip)\s*\(/.test(SOURCE),
    false,
    'Gallery must not issue Trip commands'
  );
});

test('both Gallery call sites use one lazy trip.v1 active-Trip projection', () => {
  assert.ok(
    /\bwindow\.LuviaTripContractV1\b/.test(SOURCE),
    'Gallery must prefer the versioned trip.v1 runtime surface'
  );
  assert.ok(
    /\bwindow\.LuviaTripContract\b/.test(SOURCE),
    'Gallery may use only the supported latest-major contract alias'
  );
  assert.ok(
    /\bgetActiveTrip(?:\?\.)?\s*\(/.test(SOURCE),
    'Gallery must read the active Trip through the public contract'
  );

  const activeTripCalls = SOURCE.match(/\bactiveTrip\s*\(\s*\)/g) || [];
  const activeTripReferences = SOURCE.match(/\bactiveTrip\b/g) || [];
  const contractReads = SOURCE.match(
    /\bgetActiveTrip(?:\?\.)?\s*\(/g
  ) || [];
  const versionedContracts = SOURCE.match(
    /\bwindow\.LuviaTripContractV1\b/g
  ) || [];
  const contractAliases = SOURCE.match(
    /\bwindow\.LuviaTripContract\b/g
  ) || [];
  const downloadLabelReferences = SOURCE.match(
    /\bgalleryDownloadLabel\s*\(\s*\)/g
  ) || [];

  assert.equal(
    activeTripCalls.length,
    2,
    'Exactly the place context and download label must read the active Trip'
  );
  assert.equal(
    activeTripReferences.length,
    3,
    'The active-Trip helper must have one definition and two call sites'
  );
  assert.equal(
    contractReads.length,
    1,
    'The public contract read must be centralized in one lazy accessor'
  );
  assert.equal(versionedContracts.length, 1);
  assert.equal(contractAliases.length, 1);
  assert.equal(
    downloadLabelReferences.length,
    2,
    'The download-label helper must have one definition and one click-handler call'
  );
  assert.ok(
    /function\s+placeContextFor\s*\([^)]*\)\s*\{[^}]*\bactiveTrip\s*\(\s*\)/.test(SOURCE),
    'Photo/place context must use the shared active-Trip accessor'
  );
  assert.ok(
    /function\s+galleryDownloadLabel\s*\([^)]*\)\s*\{[^}]*\bactiveTrip\s*\(\s*\)/.test(SOURCE),
    'Gallery download naming must use the shared active-Trip accessor'
  );
  assert.ok(
    /data-gallery-download[^\n]*downloadCollection\([^\n]*galleryDownloadLabel\s*\(\s*\)/.test(SOURCE),
    'The productive Gallery download handler must use the tested label helper'
  );
});

test('lazy contract lookup follows Trip changes and preserves Gallery fallbacks', () => {
  const sandbox = evaluateGallery();
  const hooks = sandbox.window.__LuviaM51bGalleryTripTest;

  assert.ok(hooks, 'M5.1b Gallery Trip test hooks must be available');
  assert.deepEqual(
    Object.keys(sandbox.window.LuviaGalleryView).sort(),
    [
      'build',
      'diagnostics',
      'downloadCollection',
      'downloadPhoto',
      'hydrateVisuals',
      'locationName',
      'mount',
      'openEditor',
      'openPhoto',
      'refresh',
      'renderVisual',
      'shareCollection',
      'unmount',
      'version'
    ].sort(),
    'M5.1b must not change the public Gallery API'
  );

  const aliasTrip = {
    id: 'trip-alias',
    title: 'Alias Journey',
    destinationName: 'Lisbon',
    destination: {
      name: 'Lisbon',
      latitude: 38.7223,
      longitude: -9.1393
    }
  };

  sandbox.window.LuviaTripContract = {
    getActiveTrip: () => aliasTrip
  };

  assert.equal(
    hooks.activeTrip().id,
    'trip-alias',
    'The latest-major alias must work when it appears after script evaluation'
  );

  let currentTrip = {
    id: 'trip-paris',
    title: 'Paris Escape',
    destinationName: 'Paris',
    destination: {
      name: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522
    }
  };

  sandbox.window.LuviaTripContractV1 = {
    getActiveTrip: () => currentTrip
  };

  assert.equal(
    hooks.activeTrip().id,
    'trip-paris',
    'The versioned contract must take precedence over its alias'
  );

  let place = hooks.placeContextFor({});

  assert.equal(place.destinationName, 'Paris');
  assert.equal(place.destinationLatitude, 48.8566);
  assert.equal(place.destinationLongitude, 2.3522);
  assert.equal(hooks.galleryDownloadLabel(), 'Paris Escape Galerie');

  currentTrip = {
    id: 'trip-berlin',
    title: 'Berlin Weekend',
    destinationName: 'Berlin',
    destination: {
      name: 'Berlin',
      latitude: 52.52,
      longitude: 13.405
    }
  };

  place = hooks.placeContextFor({});

  assert.equal(
    hooks.activeTrip().id,
    'trip-berlin',
    'A later call must observe the current Trip instead of a Gallery cache'
  );
  assert.equal(place.destinationName, 'Berlin');
  assert.equal(place.destinationLatitude, 52.52);
  assert.equal(place.destinationLongitude, 13.405);
  assert.equal(hooks.galleryDownloadLabel(), 'Berlin Weekend Galerie');

  currentTrip = null;
  place = hooks.placeContextFor({});

  assert.equal(hooks.galleryDownloadLabel(), 'Luvia Galerie');
  assert.equal(place.destinationName, null);
  assert.equal(place.destinationLatitude, null);
  assert.equal(place.destinationLongitude, null);
});
