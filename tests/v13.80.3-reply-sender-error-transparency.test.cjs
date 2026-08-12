const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const reply=read('supabase/functions/booking-email-reply/index.ts');
const integration=read('core/booking/booking-integration.js');
const version=read('intelligence/kernel/version.js');
const sw=read('sw.js');
function ok(v,m){if(!v)throw new Error(m)}
ok(reply.includes("Deno.env.get('BOOKING_EMAIL_FROM')||Deno.env.get('BOOKING_FROM')"),'reply must prefer BOOKING_EMAIL_FROM');
ok(reply.includes("Luvia Booking <booking@booking.myluvia.app>"),'reply fallback sender must match proven booking sender');
ok(reply.includes("'Idempotency-Key':idempotencyKey"),'Resend reply must send idempotency header');
ok(reply.includes("resendStatus:resendResponse.status"),'provider status must be preserved');
ok(integration.includes('function readableErrorDetail'),'structured errors must be normalized');
ok(integration.includes("JSON.stringify(value)"),'object details must not become [object Object]');
ok(integration.includes('Resend HTTP'),'Resend status must be readable');
ok(version.includes("core:'4.80.3'")&&version.includes("build:'13.80.3'"),'version mismatch');
ok(sw.includes('luvia-shell-v13.80.3'),'service worker cache mismatch');
console.log('LUVIA_V13_80_3_REPLY_SENDER_ERROR_TRANSPARENCY_OK');
