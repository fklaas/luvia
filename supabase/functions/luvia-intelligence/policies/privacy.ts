const blocked=/^(email|phone|telephone|password|token|access_token|refresh_token|authorization|apikey|api_key|booking_number|reservation_number|payment|card|iban|address_exact)$/i;
export function sanitize(value:unknown,depth=0):unknown{
  if(value==null||typeof value==='boolean'||typeof value==='number')return value;
  if(typeof value==='string')return value.slice(0,1500);
  if(depth>=8)return '[redacted-depth]';
  if(Array.isArray(value))return value.slice(0,60).map(item=>sanitize(item,depth+1));
  if(typeof value==='object'){const result:Record<string,unknown>={};for(const [key,item] of Object.entries(value as Record<string,unknown>)){if(blocked.test(key))continue;result[key]=sanitize(item,depth+1)}return result}
  return undefined;
}
export function byteLength(value:unknown){return new TextEncoder().encode(JSON.stringify(value)).byteLength}
export async function safetyIdentifier(userId:string){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`luvia:${userId}`));return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('').slice(0,64)}

// Full workflow reserves and bounded model sections use a lossless array contract.
export function sanitizeTripPayload(value:unknown,depth=0):unknown{
  if(value==null||typeof value==='boolean'||typeof value==='number')return value;
  if(typeof value==='string')return value.slice(0,4000);
  if(depth>18)throw Object.assign(new Error('Reiseanfrage zu tief verschachtelt.'),{code:'AI_PAYLOAD_DEPTH_EXCEEDED',status:413});
  if(Array.isArray(value)){
    if(value.length>4000)throw Object.assign(new Error('Reiseabschnitt zu groß.'),{code:'AI_PAYLOAD_ARRAY_EXCEEDED',status:413});
    return value.map(item=>sanitizeTripPayload(item,depth+1));
  }
  if(typeof value==='object'){const result:Record<string,unknown>={};for(const [key,item] of Object.entries(value as Record<string,unknown>)){if(blocked.test(key)||/^(raw|html|embedding|base64|knowledgeGraph|journeyGraph)$/.test(key))continue;result[key]=sanitizeTripPayload(item,depth+1)}return result}
  return undefined;
}
