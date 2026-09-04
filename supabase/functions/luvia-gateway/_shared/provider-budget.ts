// Platform transport for Places-owned provider accounting. Secrets never cross this boundary.
export async function budgetRpc(name:string,args:Record<string,unknown>={}){
  const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!key)throw Object.assign(new Error('Anbieterbudget derzeit nicht verfügbar.'),{code:'PROVIDER_BUDGET_UNAVAILABLE',status:503});
  const response=await fetch(`${url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(4000)});
  if(!response.ok)throw Object.assign(new Error('Anbieterbudget konnte nicht reserviert werden.'),{code:'PROVIDER_BUDGET_UNAVAILABLE',status:503});
  return response.status===204?null:response.json();
}
export async function providerFetch(provider:string,operation:string,units:number,url:string,init:RequestInit={}){
  const reservation=await budgetRpc('luvia_reserve_provider_budget',{p_provider:provider,p_operation:operation,p_units:Math.max(1,Math.ceil(units))});
  if(reservation?.allowed!==true)throw Object.assign(new Error('Für diese Quelle ist derzeit kein freigegebenes Gratis-Kontingent verfügbar.'),{code:'PROVIDER_BUDGET_DENIED',status:503,provider,reason:reservation?.reason});
  let response:Response;
  try{response=await fetch(url,{...init,signal:init.signal||AbortSignal.timeout(6000),redirect:'error'})}
  catch{await budgetRpc('luvia_provider_outcome',{p_provider:provider,p_operation:operation,p_status:0}).catch(()=>{});throw Object.assign(new Error('Die Ortsquelle antwortet gerade nicht.'),{code:'PROVIDER_TRANSPORT_ERROR',status:502,provider})}
  if(!response.ok)await budgetRpc('luvia_provider_outcome',{p_provider:provider,p_operation:operation,p_status:response.status}).catch(()=>{});
  return response;
}
export async function providerStatus(){return{policy:'free-only',accounting:'atomic-server-reservations',providers:await budgetRpc('luvia_provider_budget_status'),note:'Lokale Reservierungen; außerhalb Luvias verbrauchtes Kontingent wird nicht automatisch vom Anbieterkonto gelesen.'}}
