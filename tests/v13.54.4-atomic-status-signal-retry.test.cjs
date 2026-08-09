const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const m=read('supabase/migrations/20260808215500_core_v4_54_4_atomic_status_signal_retry_fix.sql');
const checks=[
 ['no illegal received state', !/resolution_state\s*=\s*'received'/.test(m)],
 ['atomic retry evidence', m.includes("'atomicRetry',true")],
 ['retry only unapplied ignored/failed', m.includes("existing.resolution_state in ('ignored','failed')") && m.includes('existing.applied_status_update_id is null')],
 ['same signal reused', m.includes('where id=existing.id')],
 ['final applied state', m.includes("resolution_state='applied'")],
 ['applied remains idempotent', m.includes("existing.applied_status_update_id is not null or existing.resolution_state='applied'")],
 ['provider sources only', m.includes("v_source in ('provider_webhook','provider_api','provider_polling')")],
 ['trusted contract required', m.includes('p_trusted_provider_contract')],
 ['internal core revoked', /revoke all on function public\.luvia_booking_ingest_status_signal_internal[\s\S]*from public,anon,authenticated,service_role/.test(m)],
 ['core version', m.includes('4.54.4')]
];
let bad=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)bad++;}
if(bad) process.exit(1);
console.log('LUVIA_V13_54_4_ATOMIC_STATUS_SIGNAL_RETRY_FIX_OK');
