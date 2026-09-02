const assert=require('node:assert');
const fs=require('node:fs');
const path=require('node:path');

const source=fs.readFileSync(path.resolve(__dirname,'../supabase/functions/booking-route-resolve/index.ts'),'utf8');

assert.match(source,/const VERSION='2\.7\.0-venue-property-identity'/);
for(const origin of [
  'https://myluvia.app',
  'https://www.myluvia.app',
  'https://integration-luvia.njwnrvwbv5.workers.dev',
  'https://luvia.njwnrvwbv5.workers.dev'
])assert.ok(source.includes(origin),`missing mandatory Booking origin ${origin}`);

assert.ok(source.includes("Deno.env.get('LUVIA_ALLOWED_ORIGINS')"),'configured origins are not supported');
assert.match(source,/\[a-z0-9-\]\+-luvia\\\.njwnrvwbv5\\\.workers\\\.dev/,'immutable Cloudflare Preview origins are not constrained to the Luvia account');
assert.ok(source.includes("'Access-Control-Allow-Origin':origin||'null'"),'untrusted origins must never be reflected');
assert.ok(source.includes('status:requestOrigin?204:403'),'disallowed preflights must be rejected');
assert.ok(source.includes("reply({error:'ORIGIN_NOT_ALLOWED'},403)"),'disallowed POST origins must be rejected');
assert.ok(!source.includes("'Access-Control-Allow-Origin':'*'"),'Booking resolver must not use wildcard CORS');

const handler=source.slice(source.indexOf('Deno.serve'));
assert.ok(!/return\s+json\(/.test(handler),'handler responses must retain their request-scoped CORS origin');
assert.match(handler,/const reply=.*json\(data,status,requestOrigin\)/);

console.log('M15.7 Booking route CORS acceptance: PASS');
