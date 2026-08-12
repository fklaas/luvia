const fs=require('fs'),assert=require('assert');
const src=fs.readFileSync('core/booking/booking-integration.js','utf8');
for(const name of ['messages','messageIntelligence','emailThread','conversation']) assert(src.includes(`async function ${name}(`),`missing ${name}`);
assert(src.includes("source:'booking-core',ownsMessageTruth:false"));
assert(src.includes('version:VERSION,init,createForPlace,listForTrip,get,transition'));
assert(src.includes('updateContact,messages,messageIntelligence,emailThread,conversation,sendEmail'));
console.log('LUVIA_V13_79_0_BOOKING_CORE_CONVERSATION_SEAM_OK');
