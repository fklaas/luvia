const fs=require('fs'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const integration=read('core/booking/booking-integration.js');
const reply=read('supabase/functions/booking-email-reply/index.ts');
const contact=read('supabase/functions/booking-contact-resolve/index.ts');
const route=read('supabase/functions/booking-route-resolve/index.ts');
const bcc=read('app/control-center/booking-control-center.js');
const css=read('app/control-center/booking-control-center.css');
const kernel=read('intelligence/kernel/version.js');
const sw=read('sw.js');
const index=read('index.html');

assert(kernel.includes("core:'4.81.4'")&&kernel.includes("build:'13.81.4'"));
assert(sw.includes("luvia-shell-v13.81.4"));
assert(index.includes('app/control-center/booking-control-center.js?v=13.81.4'));
assert(index.includes('core/booking/booking-integration.js?v=13.81.4'));

// Core-only mutation fallback preparation: existing thread first, then verified contact, then resolver.
assert(integration.includes("const VERSION='1.18.0'"));
assert(integration.includes('async function prepareMutationEmailFallback'));
assert(integration.includes("client.functions.invoke('booking-contact-resolve'"));
assert(integration.includes("client.rpc('luvia_booking_email_verified_candidate'"));
assert(integration.includes("transport:'email_thread_bootstrap'"));
assert(integration.includes("transport:'email_thread'"));
assert(integration.includes('mutationLifecycleState:\'pending\''));
assert(integration.includes('awaitingProviderReply:true'));
assert(integration.includes('providerOutcomeKnown:false'));
assert(integration.includes('bookingStatusChanged:false'));

// Only modify/cancel may bootstrap a missing thread and only after candidate verification.
assert(reply.includes("const VERSION='1.2.0'"));
assert(reply.includes("const threadBootstrapAllowed=!thread&&['modify','cancel'].includes(action)"));
assert(reply.indexOf("luvia_booking_email_verified_candidate") < reply.indexOf("admin.from('booking_email_threads').upsert"));
assert(reply.includes("replyAlias=`booking-${booking.id}@${inboundDomain}`"));
assert(reply.includes("correlation_method:mutationThreadBootstrap?'outbound_mutation_thread_bootstrap':'outbound_thread_reply'"));
assert(reply.includes("state:'delivery_failed'"));
assert(!reply.includes('threadId:thread.id,threadBootstrapped}'));
assert(reply.includes("const fingerprint=await sha(JSON.stringify({bookingId,bodyText,action,intelligenceId,threadId:thread.id}))"));
assert(reply.includes("mutationThreadBootstrap=Boolean(['modify','cancel'].includes(action)&&!clean(thread.last_outbound_message_id))"));
assert(reply.includes("state:'awaiting_reply'"));
assert(!reply.includes("p_status:'cancelled'"));
assert(!reply.includes("p_status:'confirmed'"));

// Mobile mutation is a true full-screen surface; the global nav is removed while active.
assert(bcc.includes("const VERSION='2.1.0'"));
assert(bcc.includes('function mobileMutationSurface'));
assert(bcc.includes('bcc-mobile-mutation-surface'));
assert(bcc.includes("classList.toggle('luvia-booking-mobile-mutation-open',mobileMutation)"));
assert(bcc.includes('mobileMutationFullscreenSurface:true'));
assert(bcc.includes('mutationThreadBootstrapAware:true'));
assert(css.includes('body.luvia-booking-mobile-mutation-open .luvia-shell-nav'));
assert(css.includes('body.luvia-booking-mobile-mutation-open .lv-dock-wrap'));
assert(css.includes('display:none!important'));
assert(css.includes('.bcc-mobile-mutation-surface{position:fixed;inset:0;z-index:60000;height:100dvh'));
assert(css.includes('grid-template-rows:auto minmax(0,1fr) auto'));
assert(css.includes('env(safe-area-inset-bottom)'));

// Both discovery functions expose redirect/fetch diagnostics and keep provider-email protection.
assert(contact.includes("const VERSION='1.5.0'"));
assert(contact.includes("redirect:'manual'"));
assert(contact.includes("'accept-language'"));
assert(contact.includes('redirectDomainAllowed'));
assert(contact.includes('fetchDiagnostics'));
assert(contact.includes("discoveryStrategy:'official-site-deep-crawl-v3'"));
assert(contact.includes("'BOOKING_PROVIDER_EMAIL_DOMAIN'"));
assert(contact.includes("venueOwnership:'explicitly_published_on_source'"));

assert(route.includes("const VERSION='2.5.0'"));
assert(route.includes("redirect:'manual'"));
assert(route.includes("'accept-language'"));
assert(route.includes('redirectDomainAllowed'));
assert(route.includes('fetchDiagnostics'));
assert(route.includes('contactEmail?:string'));
assert(route.includes('existingContactVerified'));
assert(route.includes('googleReserveDetected'));
assert(route.includes('googlePartnerIdentified'));
assert(route.includes('googleExternalBookingLink'));
assert(route.includes('googleDirectIntegration:false'));
assert(!route.includes('googleDirectIntegration:true'));
assert(!route.includes('CONTACT_ALREADY_PRESENT'));

console.log('LUVIA_V13_81_4_MUTATION_THREAD_BOOTSTRAP_MOBILE_SURFACE_FETCH_HARDENING_OK');
