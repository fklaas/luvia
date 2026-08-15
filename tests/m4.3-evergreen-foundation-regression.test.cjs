'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function includes(source, expected, message) {
  assert(
    source.includes(expected),
    message || `Expected source invariant missing: ${expected}`
  );
}

/*
 * M4.3 Evergreen Foundation Regression
 *
 * Purpose:
 * Preserve still-valid architectural/runtime invariants that were originally
 * protected only by historical release-specific regression tests.
 *
 * This test deliberately does NOT assert App/Core/build version numbers.
 * Historical v13.x regression tests remain untouched as release evidence.
 */

/* -------------------------------------------------------------------------- */
/* App bootstrap / render guarantees                                           */
/* -------------------------------------------------------------------------- */

const shell = read('app/app-shell.js');

includes(
  shell,
  "document.readyState==='loading'",
  'App shell must retain the document-ready bootstrap guard'
);

includes(
  shell,
  "startShell('document-already-ready')",
  'App shell must retain the already-ready bootstrap path'
);

includes(
  shell,
  'shellStartPromise',
  'App shell start must remain idempotent'
);

includes(
  shell,
  'guaranteeInitialRender',
  'App shell must retain its initial render guarantee'
);

includes(
  shell,
  "guaranteeInitialRender('startup-watchdog')",
  'App shell must retain the startup render watchdog'
);

includes(
  shell,
  'window.LuviaBootDiagnostics=bootDiagnostics',
  'App shell must expose boot diagnostics'
);

includes(
  shell,
  "markBoot('auth-ready'",
  'App shell must retain auth-ready boot diagnostics'
);

includes(
  shell,
  "await guaranteeInitialRender('post-bootstrap')",
  'App shell must retain the post-bootstrap render guarantee'
);

/* -------------------------------------------------------------------------- */
/* Product-module architecture invariants                                      */
/* -------------------------------------------------------------------------- */

const productModuleDiagnostics = read(
  'core/diagnostics/product-module-diagnostics.js'
);

includes(
  productModuleDiagnostics,
  'productModulesAboveDomainModules',
  'Product modules must remain composition surfaces above domain modules'
);

includes(
  productModuleDiagnostics,
  'domainTruthRemainsInCores',
  'Domain truth must remain in domain cores'
);

/* -------------------------------------------------------------------------- */
/* Booking mutation fallback invariants                                        */
/* -------------------------------------------------------------------------- */

const integration = read('core/booking/booking-integration.js');

includes(
  integration,
  'async function prepareMutationEmailFallback',
  'Booking mutation email fallback preparation must remain available'
);

includes(
  integration,
  "client.functions.invoke('booking-contact-resolve'",
  'Mutation fallback must retain contact resolution'
);

includes(
  integration,
  "client.rpc('luvia_booking_email_verified_candidate'",
  'Mutation fallback must retain verified-recipient lookup'
);

includes(
  integration,
  "transport:'email_thread_bootstrap'",
  'Mutation fallback must retain email-thread bootstrap transport'
);

includes(
  integration,
  "transport:'email_thread'",
  'Mutation fallback must retain existing email-thread transport'
);

includes(
  integration,
  "mutationLifecycleState:'pending'",
  'Mutation fallback must remain lifecycle-pending until provider evidence'
);

includes(
  integration,
  'awaitingProviderReply:true',
  'Email mutation fallback must remain awaiting-provider-reply aware'
);

includes(
  integration,
  'providerOutcomeKnown:false',
  'Email mutation fallback must not claim provider outcome prematurely'
);

includes(
  integration,
  'bookingStatusChanged:false',
  'Email mutation fallback must not falsely finalize booking status'
);

/* -------------------------------------------------------------------------- */
/* Booking email thread bootstrap invariants                                   */
/* -------------------------------------------------------------------------- */

const reply = read(
  'supabase/functions/booking-email-reply/index.ts'
);

includes(
  reply,
  "const threadBootstrapAllowed=!thread&&['modify','cancel'].includes(action)",
  'Only modify/cancel may bootstrap a missing booking email thread'
);

const verifiedCandidateIndex = reply.indexOf(
  "luvia_booking_email_verified_candidate"
);

const threadUpsertIndex = reply.indexOf(
  "admin.from('booking_email_threads').upsert"
);

assert(
  verifiedCandidateIndex >= 0 &&
    threadUpsertIndex >= 0 &&
    verifiedCandidateIndex < threadUpsertIndex,
  'Recipient verification must occur before booking email thread bootstrap'
);

includes(
  reply,
  'replyAlias=`booking-${booking.id}@${inboundDomain}`',
  'Booking reply alias generation must remain intact'
);

includes(
  reply,
  "correlation_method:mutationThreadBootstrap?'outbound_mutation_thread_bootstrap':'outbound_thread_reply'",
  'Mutation thread bootstrap correlation must remain explicit'
);

includes(
  reply,
  "state:'delivery_failed'",
  'Booking email reply flow must retain delivery-failed state'
);

includes(
  reply,
  "const fingerprint=await sha(JSON.stringify({bookingId,bodyText,action,intelligenceId,threadId:thread.id}))",
  'Booking email reply idempotency fingerprint must retain thread identity'
);

includes(
  reply,
  "mutationThreadBootstrap=Boolean(['modify','cancel'].includes(action)&&!clean(thread.last_outbound_message_id))",
  'Mutation thread bootstrap detection must remain modify/cancel constrained'
);

includes(
  reply,
  "state:'awaiting_reply'",
  'Successful mutation email delivery must retain awaiting-reply state'
);

assert(
  !reply.includes("p_status:'cancelled'"),
  'Email mutation fallback must not directly finalize booking as cancelled'
);

assert(
  !reply.includes("p_status:'confirmed'"),
  'Email mutation fallback must not directly finalize booking as confirmed'
);

/* -------------------------------------------------------------------------- */
/* Mobile Booking mutation surface invariants                                 */
/* -------------------------------------------------------------------------- */

const bookingControlCenter = read(
  'app/control-center/booking-control-center.js'
);

const bookingControlCenterCss = read(
  'app/control-center/booking-control-center.css'
);

includes(
  bookingControlCenter,
  'function mobileMutationSurface',
  'Booking Control Center must retain mobile mutation surface'
);

includes(
  bookingControlCenter,
  'bcc-mobile-mutation-surface',
  'Booking Control Center must retain the dedicated mobile mutation surface'
);

includes(
  bookingControlCenter,
  "classList.toggle('luvia-booking-mobile-mutation-open',mobileMutation)",
  'Booking Control Center must retain global mobile-mutation state toggle'
);

includes(
  bookingControlCenter,
  'mobileMutationFullscreenSurface:true',
  'Booking diagnostics must retain fullscreen mobile mutation capability'
);

includes(
  bookingControlCenter,
  'mutationThreadBootstrapAware:true',
  'Booking diagnostics must retain mutation thread bootstrap awareness'
);

includes(
  bookingControlCenterCss,
  'body.luvia-booking-mobile-mutation-open .luvia-shell-nav',
  'Global shell navigation must remain hideable during mobile mutation'
);

includes(
  bookingControlCenterCss,
  'body.luvia-booking-mobile-mutation-open .lv-dock-wrap',
  'Global dock must remain hideable during mobile mutation'
);

includes(
  bookingControlCenterCss,
  'display:none!important',
  'Mobile mutation fullscreen mode must retain navigation hiding rule'
);

includes(
  bookingControlCenterCss,
  '.bcc-mobile-mutation-surface{position:fixed;inset:0;z-index:60000;height:100dvh',
  'Mobile mutation surface must remain true viewport fullscreen'
);

includes(
  bookingControlCenterCss,
  'grid-template-rows:auto minmax(0,1fr) auto',
  'Mobile mutation surface must retain header/content/footer layout'
);

includes(
  bookingControlCenterCss,
  'env(safe-area-inset-bottom)',
  'Mobile mutation actions must retain safe-area support'
);

/* -------------------------------------------------------------------------- */
/* Contact / reservation discovery safety invariants                          */
/* -------------------------------------------------------------------------- */

const contactResolver = read(
  'supabase/functions/booking-contact-resolve/index.ts'
);

const routeResolver = read(
  'supabase/functions/booking-route-resolve/index.ts'
);

includes(
  contactResolver,
  "redirect:'manual'",
  'Contact resolver must retain controlled redirect handling'
);

includes(
  contactResolver,
  "'accept-language'",
  'Contact resolver must retain Accept-Language support'
);

includes(
  contactResolver,
  'redirectDomainAllowed',
  'Contact resolver must retain redirect-domain validation'
);

includes(
  contactResolver,
  'fetchDiagnostics',
  'Contact resolver must retain fetch diagnostics'
);

includes(
  contactResolver,
  "discoveryStrategy:'official-site-deep-crawl-v3'",
  'Contact resolver must retain official-site discovery strategy'
);

includes(
  contactResolver,
  "'BOOKING_PROVIDER_EMAIL_DOMAIN'",
  'Contact resolver must retain provider-email-domain protection'
);

includes(
  contactResolver,
  "venueOwnership:'explicitly_published_on_source'",
  'Contact resolver must retain venue-specific ownership evidence'
);

includes(
  routeResolver,
  "redirect:'manual'",
  'Route resolver must retain controlled redirect handling'
);

includes(
  routeResolver,
  "'accept-language'",
  'Route resolver must retain Accept-Language support'
);

includes(
  routeResolver,
  'redirectDomainAllowed',
  'Route resolver must retain redirect-domain validation'
);

includes(
  routeResolver,
  'fetchDiagnostics',
  'Route resolver must retain fetch diagnostics'
);

includes(
  routeResolver,
  'contactEmail?:string',
  'Route resolver must retain contact-email input'
);

includes(
  routeResolver,
  'existingContactVerified',
  'Route resolver must retain verified existing-contact handling'
);

includes(
  routeResolver,
  'googleReserveDetected',
  'Route resolver must retain Google Reserve detection'
);

includes(
  routeResolver,
  'googlePartnerIdentified',
  'Route resolver must retain Google booking partner identification'
);

includes(
  routeResolver,
  'googleExternalBookingLink',
  'Route resolver must retain Google external booking link evidence'
);

includes(
  routeResolver,
  'googleDirectIntegration:false',
  'Google Reserve must not be falsely represented as direct integration'
);

assert(
  !routeResolver.includes('googleDirectIntegration:true'),
  'Route resolver must not claim unsupported Google direct integration'
);

assert(
  !routeResolver.includes('CONTACT_ALREADY_PRESENT'),
  'Route resolver must not regress to the obsolete CONTACT_ALREADY_PRESENT block'
);

console.log('M4.3 evergreen foundation regression: OK');