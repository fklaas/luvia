import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const clean=(v:unknown)=>String(v??'').trim().toLowerCase();
const KNOWN:Record<string,string[]>= {
 thefork:['THEFORK_CLIENT_ID','THEFORK_CLIENT_SECRET'],
 quandoo:['QUANDOO_AUTH_TOKEN','QUANDOO_AGENT_ID'],
 zenchef:['ZENCHEF_API_CREDENTIALS','ZENCHEF_PARTNER_CONTRACT_VERSION'],
 opentable:['OPENTABLE_CLIENT_ID','OPENTABLE_CLIENT_SECRET','OPENTABLE_PARTNER_CONTRACT_VERSION'],
 sevenrooms:[],resy:[],tock:[]
};
function credentialState(keys:string[]){if(!keys.length)return 'unknown';const count=keys.filter(k=>Boolean(Deno.env.get(k))).length;return count===0?'missing':count===keys.length?'configured':'partial';}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
 try{
  const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const auth=req.headers.get('Authorization')||'';
  const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:userError}=await userClient.auth.getUser();
  if(userError||!user)return json({error:'AUTH_REQUIRED'},401);
  const admin=createClient(url,service,{auth:{persistSession:false}});
  const body=await req.json().catch(()=>({})); const requested=clean(body?.providerId);
  let q=admin.from('booking_provider_capabilities').select('provider_id,display_name,luvia_access_state,booking_mode,supports_availability,supports_create_reservation,supports_status_webhook,supports_status_polling').eq('active',true);
  if(requested)q=q.eq('provider_id',requested);
  const {data:caps,error:capError}=await q; if(capError)throw capError;
  const results=[];
  for(const cap of caps||[]){
    const provider=String(cap.provider_id); const keys=KNOWN[provider]||[]; const creds=credentialState(keys);
    const {data:contracts}=await admin.from('booking_provider_status_contracts').select('transport,contract_version,verification_state,auto_apply,active').eq('provider_id',provider).eq('active',true);
    const verified=(contracts||[]).some((x:any)=>x.verification_state==='verified_public'&&x.auto_apply===true);
    const schemaRequired=(contracts||[]).some((x:any)=>x.verification_state==='partner_schema_required');
    const contractState=verified?'verified_mapping_ready':schemaRequired?'partner_schema_required':'not_connected';
    const connectionState=cap.luvia_access_state==='connected'?'connected':creds==='configured'?'ready_to_connect':'partner_required';
    const statusReturnState=verified?'ready':schemaRequired?'partner_schema_required':'disabled';
    const health={providerId:provider,displayName:cap.display_name,accessState:cap.luvia_access_state,connectionState,credentialState:creds,contractState,statusReturnState,requiredSecretCount:keys.length,configuredSecretCount:keys.filter(k=>Boolean(Deno.env.get(k))).length,contracts:contracts||[],checkedAt:new Date().toISOString()};
    await admin.from('booking_provider_connections').upsert({provider_id:provider,connection_state:connectionState,credential_state:creds,contract_state:contractState,status_return_state:statusReturnState,required_secret_keys:keys,last_health:health,last_checked_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'provider_id'});
    results.push(health);
  }
  if(requested&&!results.length)return json({error:'PROVIDER_NOT_FOUND'},404);
  return json({ok:true,version:'1.0.0',providers:results});
 }catch(error){console.error('[booking-provider-connection-health]',error);return json({error:'PROVIDER_CONNECTION_HEALTH_FAILED',details:error instanceof Error?error.message:String(error)},500);}
});
