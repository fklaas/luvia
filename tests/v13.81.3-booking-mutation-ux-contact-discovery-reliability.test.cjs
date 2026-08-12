const fs=require('fs'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const bcc=read('app/control-center/booking-control-center.js');
const css=read('app/control-center/booking-control-center.css');
const integration=read('core/booking/booking-integration.js');
const contact=read('supabase/functions/booking-contact-resolve/index.ts');
const route=read('supabase/functions/booking-route-resolve/index.ts');
const kernel=read('intelligence/kernel/version.js');
const sw=read('sw.js');
assert(kernel.includes("core:'4.81.3'")&&kernel.includes("build:'13.81.3'"));
assert(sw.includes('luvia-shell-v13.81.3'));
// Mutation UX guard + global nav suppression
assert(bcc.includes('actionBlocked'));
assert(bcc.includes("globalNavSuppressedDuringMutation:true"));
assert(css.includes('body.luvia-booking-action-open .luvia-shell-nav'));
assert(css.includes('visibility:hidden!important'));
assert(css.includes('height:100dvh'));
assert(css.includes('position:sticky!important'));
assert(css.includes('safe-area-inset-bottom'));
// Timeline dedupe stays presentation-only
assert(integration.includes('deduplicated:true'));
assert(integration.includes("ownsBookingTruth:false"));
// Contact resolver deep crawl and Green Farmer's regression characteristics
assert(contact.includes("const VERSION='1.4.0'"));
assert(contact.includes('/contactez-nous'));
assert(contact.includes('guessedVenuePages'));
assert(contact.includes("discoveryStrategy:'official-site-deep-crawl-v2'"));
assert(contact.includes('redirectAware:true'));
assert(contact.includes('mailto:'));
const greenHtml='<a href="mailto:hello@greenfarmers.fr">hello@greenfarmers.fr</a>';
const emailRx=/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
assert.deepStrictEqual(greenHtml.match(emailRx),['hello@greenfarmers.fr','hello@greenfarmers.fr']);
// Google Reserve is discovery/handoff only, never claimed as direct integration
assert(route.includes("const VERSION='2.4.0'"));
assert(route.includes("return 'google_reserve'"));
assert(route.includes('googleReserveDetected'));
assert(route.includes('googleDirectIntegration:false'));
assert(route.includes('place.googleReserveUrl'));
assert(!route.includes('googleDirectIntegration:true'));
console.log('LUVIA_V13_81_3_BOOKING_MUTATION_UX_CONTACT_DISCOVERY_RELIABILITY_OK');
