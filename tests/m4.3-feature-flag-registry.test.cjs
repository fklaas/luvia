'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');

const source = fs.readFileSync(
  path.join(
    ROOT,
    'core/platform/feature-flag-registry.js'
  ),
  'utf8'
);

class CustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

const dispatched = [];

const context = {
  console,
  Map,
  Set,
  Date,
  Object,
  Boolean,
  String,
  Error,
  CustomEvent,
  window: {
    dispatchEvent(event) {
      dispatched.push(event);
      return true;
    }
  }
};

vm.createContext(context);
vm.runInContext(source, context);

const registry =
  context.window.LuviaFeatureFlagRegistry;

assert(
  registry,
  'LuviaFeatureFlagRegistry must be exposed'
);

assert.equal(registry.version, '1.0.0');

assert.deepEqual(
  Array.from(registry.owners),
  [
    'platform',
    'trip',
    'places',
    'booking',
    'media',
    'identity',
    'intelligence',
    'consumer',
    'social'
  ]
);

/* -------------------------------------------------------------------------- */
/* Feature flags are rollout gates only                                        */
/* -------------------------------------------------------------------------- */

for (const forbiddenApi of [
  'enable',
  'disable',
  'setEnabled',
  'setOverride',
  'override',
  'activate',
  'deactivate',
  'mount',
  'unmount'
]) {
  assert.equal(
    typeof registry[forbiddenApi],
    'undefined',
    `Feature Flag Registry must not expose ${forbiddenApi}`
  );
}

/* -------------------------------------------------------------------------- */
/* Unknown flags fail closed                                                   */
/* -------------------------------------------------------------------------- */

assert.equal(
  registry.isEnabled('booking.unknown-feature'),
  false
);

assert.deepEqual(
  {
    ...registry.evaluate(
      'booking.unknown-feature'
    )
  },
  {
    id:'booking.unknown-feature',
    known:false,
    enabled:false,
    owner:null,
    source:'unknown'
  }
);

/* -------------------------------------------------------------------------- */
/* Registration and default evaluation                                         */
/* -------------------------------------------------------------------------- */

const bookingFlag = registry.register({
  id:'booking.parallel-proof',
  owner:'booking',
  description:'Harmless M4.3 registry proof',
  defaultEnabled:false,
  version:'evil',
  secretConfig:'must-not-survive'
});

assert.equal(
  bookingFlag.id,
  'booking.parallel-proof'
);

assert.equal(bookingFlag.owner, 'booking');
assert.equal(bookingFlag.version, '1.0.0');
assert.equal(bookingFlag.defaultEnabled, false);
assert.equal(bookingFlag.temporary, true);
assert.equal(
  Object.prototype.hasOwnProperty.call(
    bookingFlag,
    'secretConfig'
  ),
  false,
  'unknown definition fields must not survive normalization'
);

assert.equal(
  registry.isEnabled(
    'booking.parallel-proof'
  ),
  false
);

assert.deepEqual(
  {
    ...registry.evaluate(
      'booking.parallel-proof'
    )
  },
  {
    id:'booking.parallel-proof',
    known:true,
    enabled:false,
    owner:'booking',
    source:'default'
  }
);

const consumerFlag = registry.register({
  id:'consumer.preview-surface',
  owner:'consumer',
  description:'Preview-only surface proof',
  defaultEnabled:true,
  temporary:true
});

assert.equal(
  registry.isEnabled(
    'consumer.preview-surface'
  ),
  true
);

assert.equal(
  registry.byOwner('booking').length,
  1
);

assert.equal(
  registry.byOwner('consumer').length,
  1
);

/* -------------------------------------------------------------------------- */
/* Registration is idempotent but conflicting definitions are forbidden        */
/* -------------------------------------------------------------------------- */

const repeated = registry.register({
  id:'booking.parallel-proof',
  owner:'booking',
  description:'Harmless M4.3 registry proof',
  defaultEnabled:false
});

assert.strictEqual(
  repeated,
  bookingFlag,
  'identical registration must be idempotent'
);

assert.throws(
  () => registry.register({
    id:'booking.parallel-proof',
    owner:'booking',
    description:'Conflicting definition',
    defaultEnabled:true
  }),
  /conflicting definition/
);

/* -------------------------------------------------------------------------- */
/* Naming and ownership guardrails                                              */
/* -------------------------------------------------------------------------- */

assert.throws(
  () => registry.register({
    id:'booking',
    owner:'booking'
  }),
  /invalid id/
);

assert.throws(
  () => registry.register({
    id:'Booking.bad-case',
    owner:'booking'
  }),
  /invalid id/
);

assert.throws(
  () => registry.register({
    id:'consumer.booking-feature',
    owner:'booking'
  }),
  /must use owner prefix/
);

assert.throws(
  () => registry.register({
    id:'unknown.feature',
    owner:'unknown'
  }),
  /invalid owner/
);

/* -------------------------------------------------------------------------- */
/* Subscription and diagnostics                                                */
/* -------------------------------------------------------------------------- */

const observed = [];

const unsubscribe = registry.subscribe(
  event => observed.push(event)
);

registry.register({
  id:'platform.integration-proof',
  owner:'platform',
  description:'Integration proof flag',
  defaultEnabled:false,
  temporary:true
});

assert.equal(observed.length, 1);
assert.equal(
  observed[0].type,
  'registered'
);
assert.equal(
  observed[0].flagId,
  'platform.integration-proof'
);

unsubscribe();

registry.register({
  id:'social.foundation-preview',
  owner:'social',
  description:'Future Social foundation preview',
  defaultEnabled:false,
  temporary:true
});

assert.equal(
  observed.length,
  1,
  'unsubscribe must stop notifications'
);

assert(
  dispatched.some(
    event =>
      event.type === 'luvia:feature-flag'
  ),
  'registration must publish platform event'
);

const diagnostics =
  registry.diagnostics();

assert.equal(diagnostics.version, '1.0.0');
assert.equal(diagnostics.count, 4);
assert.equal(diagnostics.enabled, 1);
assert.equal(diagnostics.disabled, 3);
assert.equal(diagnostics.temporary, 4);

assert.equal(
  registry.snapshot().length,
  4
);

console.log(
  'M4.3 Feature Flag Registry: OK'
);