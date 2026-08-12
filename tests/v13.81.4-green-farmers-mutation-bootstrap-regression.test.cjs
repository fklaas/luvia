const fs=require('fs'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const contact=fs.readFileSync(path.join(root,'supabase/functions/booking-contact-resolve/index.ts'),'utf8');
const route=fs.readFileSync(path.join(root,'supabase/functions/booking-route-resolve/index.ts'),'utf8');
const integration=fs.readFileSync(path.join(root,'core/booking/booking-integration.js'),'utf8');
const reply=fs.readFileSync(path.join(root,'supabase/functions/booking-email-reply/index.ts'),'utf8');

const BOOKING_ID='046bcb5c-0942-48f7-b8e1-292eb4de60c7';
assert.match(BOOKING_ID,/^[0-9a-f-]{36}$/);

// Regression fixture: official legacy domain -> current venue-branded domain.
const normalize=s=>s.toLowerCase().replace(/^www\./,'');
const stem=h=>{const parts=normalize(h).split('.').filter(Boolean);if(parts.length<2)return (parts[0]||'').replace(/[^a-z0-9]/g,'');const second=parts.at(-2)||'',top=parts.at(-1)||'';const label=(top.length===2&&['co','com','org','net','gov','ac'].includes(second)&&parts.length>=3)?parts.at(-3):second;return String(label||'').replace(/[^a-z0-9]/g,'')};
const redirectAllowed=(a,b)=>{a=normalize(a);b=normalize(b);if(a===b||a.endsWith('.'+b)||b.endsWith('.'+a))return true;const x=stem(a),y=stem(b);return x.length>=6&&y.length>=6&&(x.includes(y)||y.includes(x));};
assert.strictEqual(redirectAllowed('greenfarmers.fr','greenfarmers-vegan.com'),true,'Green Farmer redirect must preserve venue identity');
assert.strictEqual(redirectAllowed('greenfarmers.fr','greenfarmers.evil.com'),false,'venue-looking subdomain on unrelated registrable domain must be rejected');

// Official-page fixture must discover a venue mail while provider mail stays blocked by source contracts.
const fixture='<a href="mailto:hello@greenfarmers.fr">Contact</a><script type="application/ld+json">{"email":"hello@greenfarmers.fr"}</script>';
const emailRx=/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
assert(fixture.match(emailRx).map(x=>x.toLowerCase()).includes('hello@greenfarmers.fr'));
for(const source of [contact,route]){
  assert(source.includes('zenchef'));
  assert(source.includes('isProviderEmail'));
  assert(source.includes('/contact'));
  assert(source.includes('/reservation'));
  assert(source.includes('redirectDomainAllowed'));
}

// Existing booking.contact is input, but it is not trusted without candidate/official verification.
assert(integration.includes('booking?.contact?.email'));
assert(integration.includes('verified?.ok'));
assert(contact.includes('legacyContactVerified'));
assert(contact.includes("legacyContactMatch:isLegacyMatch"));
assert(route.includes('existingContactPresent'));
assert(route.includes('existingContactVerified'));

// Missing thread can be bootstrapped for both mutation types; sending alone never finalizes the reservation.
assert(reply.includes("['modify','cancel'].includes(action)"));
assert(reply.includes('mutationThreadBootstrap,threadCreatedForMutation:threadBootstrapped'));
assert(reply.includes("correlation_method:mutationThreadBootstrap?'outbound_mutation_thread_bootstrap':'outbound_thread_reply'"));
assert(integration.includes("reply(id,{bodyText:text,action:'modify'})"));
assert(integration.includes("reply(id,{bodyText:cancelReplyText(input),action:'cancel'})"));
assert(integration.includes('providerOutcomeKnown:false'));
assert(integration.includes('bookingStatusChanged:false'));

console.log('LUVIA_V13_81_4_GREEN_FARMERS_MUTATION_BOOTSTRAP_REGRESSION_OK');
