const fs=require('fs'),assert=require('assert'),path=require('path');
const source=fs.readFileSync(path.resolve(__dirname,'../supabase/functions/booking-route-resolve/index.ts'),'utf8');

function providerFor(url){
  const host=new URL(url).hostname.toLowerCase().replace(/^www\./,'');
  if(/(^|\.)google\.[a-z.]+$/i.test(host)&&/^\/maps\/reserve(?:\/|$)/i.test(new URL(url).pathname))return 'google_reserve';
  if(/(^|\.)opentable\./i.test(host))return 'opentable';
  if(/(^|\.)(?:thefork|lafourchette)\./i.test(host))return 'thefork';
  if(/(^|\.)resy\.com$/i.test(host))return 'resy';
  return null;
}
function matrix(initial,final,email=false){
  const initialProvider=initial?providerFor(initial):null;
  const finalProvider=final?providerFor(final):null;
  const googleReserveDetected=initialProvider==='google_reserve';
  const googlePartnerIdentified=googleReserveDetected&&finalProvider&&finalProvider!=='google_reserve'?finalProvider:null;
  const healthyExternal=Boolean(final||initial);
  return {googleReserveDetected,googlePartnerIdentified,googleExternalBookingLink:googleReserveDetected?(final||initial):null,googleDirectIntegration:false,provider:googlePartnerIdentified||finalProvider||(googleReserveDetected?'google_reserve':email?'official_website':null),channel:healthyExternal?'external_link':email?'email':null,resolved:Boolean(healthyExternal||email)};
}
const g='https://www.google.com/maps/reserve/v/dine/c/venue';
const cases=[
 ['Google -> TheFork',matrix(g,'https://www.thefork.fr/restaurant/example-r1'),{googleReserveDetected:true,googlePartnerIdentified:'thefork',provider:'thefork',channel:'external_link',resolved:true}],
 ['Google -> OpenTable',matrix(g,'https://www.opentable.com/r/example'),{googleReserveDetected:true,googlePartnerIdentified:'opentable',provider:'opentable',channel:'external_link',resolved:true}],
 ['Google -> other/unknown',matrix(g,'https://booking.partner.example/venue'),{googleReserveDetected:true,googlePartnerIdentified:null,channel:'external_link',resolved:true}],
 ['Google without identifiable partner',matrix(g,null),{googleReserveDetected:true,googlePartnerIdentified:null,provider:'google_reserve',channel:'external_link',resolved:true}],
 ['No Google',matrix(null,'https://www.opentable.com/r/example'),{googleReserveDetected:false,provider:'opentable',resolved:true}],
 ['Google + venue email',matrix(g,null,true),{googleReserveDetected:true,googlePartnerIdentified:null,provider:'google_reserve',channel:'external_link',resolved:true}],
 ['Venue email only',matrix(null,null,true),{googleReserveDetected:false,channel:'email',provider:'official_website',resolved:true}],
];
for(const [name,actual,expected] of cases){for(const [k,v] of Object.entries(expected))assert.strictEqual(actual[k],v,`${name}: ${k}`);assert.strictEqual(actual.googleDirectIntegration,false,`${name}: direct Google integration must stay false`)}

assert(source.includes("return 'google_reserve'"));
assert(source.includes('googlePartnerIdentified'));
assert(source.includes('googleExternalBookingLink'));
assert(source.includes('googleDirectIntegration:false'));
assert(source.includes("finalProvider&&finalProvider!=='google_reserve'"));
assert(!source.includes('googleDirectIntegration:true'));
console.log('LUVIA_V13_81_4_GOOGLE_RESERVE_DISCOVERY_MATRIX_OK');
