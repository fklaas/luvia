const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const m=read('supabase/migrations/20260808214500_core_v4_54_3_failed_status_signal_recovery_idempotent_retry_fix.sql');
const transition=read('supabase/migrations/20260808213000_core_v4_54_2_verified_provider_transition_fix.sql');
const index=read('index.html');
const checks=[
 ['retry only unapplied ignored/failed',/existing\.resolution_state in \('ignored','failed'\)[\s\S]*existing\.applied_status_update_id is null/.test(m)],
 ['trusted provider retry only',/p_trusted_provider_contract[\s\S]*provider_webhook[\s\S]*provider_api[\s\S]*provider_polling/.test(m)],
 ['same booking and target guard',/existing\.booking_id=p_booking_id[\s\S]*existing\.proposed_luvia_status=v_status/.test(m)],
 ['reuses existing signal',/where id=existing\.id[\s\S]*returning \* into s/.test(m)],
 ['applied signal remains idempotent',/existing\.applied_status_update_id is not null or existing\.resolution_state='applied'/.test(m)],
 ['receipt retries ignored failed signal',/v_retry_signal:=existing_signal\.resolution_state in \('ignored','failed'\)/.test(m)],
 ['receipt already applied short circuit',/SIGNAL_ALREADY_APPLIED/.test(m)],
 ['retry audit evidence',/retryingPreviouslyUnappliedSignal/.test(m)&&/retryRecovered/.test(m)],
 ['trusted ready transition retained',/v_trusted_ready_confirmation/.test(transition)],
 ['internal functions revoked',/revoke all on function public\.luvia_booking_ingest_status_signal_internal[\s\S]*service_role/.test(m)&&/revoke all on function public\.luvia_booking_reprocess_provider_status_receipt_internal[\s\S]*service_role/.test(m)],
 ['build version',/13\.54\.3/.test(index)&&/luvia-shell-v13\.54\.3/.test(read('sw.js'))],
 ['core version',/core:'4\.54\.3'/.test(read('intelligence/kernel/version.js'))],
 ['release name',/Failed Status Signal Recovery & Idempotent Retry Fix/.test(read('intelligence/kernel/version.js'))]
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}
if(fail)process.exit(1);
console.log('LUVIA_V13_54_3_FAILED_STATUS_SIGNAL_RECOVERY_IDEMPOTENT_RETRY_OK');
