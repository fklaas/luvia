import type { Capability } from '../capabilities/registry.ts';
import { outputSchema } from '../schemas/index.ts';
import { systemPrompt, userInput } from '../prompts/system.ts';

type Tier='fast'|'default'|'deep';
function models(){return{fast:Deno.env.get('LUVIA_AI_MODEL_FAST')||'gpt-5.6-luna',default:Deno.env.get('LUVIA_AI_MODEL_DEFAULT')||'gpt-5.6-terra',deep:Deno.env.get('LUVIA_AI_MODEL_DEEP')||'gpt-5.6-sol'}}
function extractText(response:any){if(typeof response?.output_text==='string')return response.output_text;for(const item of response?.output||[])for(const content of item?.content||[])if(content?.type==='output_text'&&typeof content.text==='string')return content.text;return''}
function recoverable(status:number,body:any){const code=String(body?.error?.code||'');return status===404||status===400&&/model|unsupported|not_found/i.test(`${code} ${body?.error?.message||''}`)}
export function parseStructuredOutput(response:any){
  const incomplete=response?.status==='incomplete'||response?.incomplete_details?.reason;
  if(incomplete){const reason=String(response?.incomplete_details?.reason||'incomplete');throw Object.assign(new Error(reason==='max_output_tokens'?'Der vollständige KI-Entwurf hat sein Ausgabelimit erreicht.':'OpenAI returned incomplete structured output.'),{code:'OPENAI_INCOMPLETE_OUTPUT',status:502,reason})}
  const raw=extractText(response);if(!raw)throw Object.assign(new Error('OpenAI returned no structured output.'),{code:'OPENAI_EMPTY_OUTPUT',status:502});
  try{return JSON.parse(raw)}catch{throw Object.assign(new Error('OpenAI returned invalid structured output.'),{code:'OPENAI_INVALID_JSON',status:502})}
}
export async function runOpenAI(args:{capability:Capability;tier:Tier;input:unknown;context:unknown;safetyId:string}){
  const key=Deno.env.get('OPENAI_API_KEY')||'';if(!key)throw Object.assign(new Error('OPENAI_API_KEY ist nicht gesetzt.'),{code:'AI_NOT_CONFIGURED',status:503});
  const map=models();const primary=map[args.tier]||map.default;const candidates=[primary,...(primary===map.default?[]:[map.default])].filter((value,index,list)=>list.indexOf(value)===index);
  let lastError:any=null;const attempts:any[]=[],startedAll=performance.now(),sumUsage=()=>attempts.reduce((sum,item)=>({inputTokens:sum.inputTokens+item.usage.inputTokens,outputTokens:sum.outputTokens+item.usage.outputTokens,totalTokens:sum.totalTokens+item.usage.totalTokens,cachedTokens:sum.cachedTokens+item.usage.cachedTokens}),{inputTokens:0,outputTokens:0,totalTokens:0,cachedTokens:0});
  for(const model of candidates){
    const started=performance.now();
    const body:any={
      model,
      store:false,
      safety_identifier:args.safetyId,
      input:[{role:'system',content:[{type:'input_text',text:systemPrompt(args.capability)}]},{role:'user',content:[{type:'input_text',text:userInput(args.input,args.context)},...((args.capability.id==='media.describe'&&typeof (args.input as any)?.imageUrl==='string')?[{type:'input_image',image_url:(args.input as any).imageUrl,detail:'low'}]:[]),...(args.capability.id==='memory.compose'&&Array.isArray((args.input as any)?.imageUrls)?(args.input as any).imageUrls.slice(0,3).filter((u:any)=>typeof u==='string'&&u.startsWith('http')).map((u:string)=>({type:'input_image',image_url:u,detail:'low'})):[])]}],
      text:{format:{type:'json_schema',name:`luvia_${args.capability.schema}`,schema:outputSchema(args.capability.schema),strict:true}},
      max_output_tokens:args.capability.maxOutputTokens
    };
    if(model.includes('gpt-5'))body.reasoning={effort:args.capability.id==='trip.compose'&&args.tier==='deep'?'medium':args.capability.reasoningEffort};
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','X-Client-Request-Id':crypto.randomUUID()},body:JSON.stringify(body)});
    const json=await response.json().catch(()=>({})),usage={inputTokens:Number(json.usage?.input_tokens||0),outputTokens:Number(json.usage?.output_tokens||0),totalTokens:Number(json.usage?.total_tokens||0),cachedTokens:Number(json.usage?.input_tokens_details?.cached_tokens||0)},latencyMs=Math.round(performance.now()-started),requestId=json.id||null;
    if(!response.ok){lastError=Object.assign(new Error(json?.error?.message||'OpenAI request failed'),{code:json?.error?.code||'OPENAI_REQUEST_FAILED',status:response.status,body:json});attempts.push({model,requestId,usage,latencyMs,success:false,errorCode:lastError.code});if(recoverable(response.status,json)&&model!==candidates.at(-1))continue;throw Object.assign(lastError,{attempts,usage:sumUsage(),model,latencyMs:Math.round(performance.now()-startedAll)})}
    try{
      const result=parseStructuredOutput(json);attempts.push({model,requestId,usage,latencyMs,success:true,errorCode:null});
      return{result,provider:'openai',model,tier:args.tier,requestId,usage:sumUsage(),latencyMs:Math.round(performance.now()-startedAll),attempts};
    }catch(error){
      const structured=['OPENAI_INCOMPLETE_OUTPUT','OPENAI_INVALID_JSON','OPENAI_EMPTY_OUTPUT'].includes(String((error as any)?.code||''));lastError=error;attempts.push({model,requestId,usage,latencyMs,success:false,errorCode:(error as any)?.code||'OPENAI_STRUCTURED_OUTPUT_FAILED'});if(structured&&model!==candidates.at(-1))continue;throw Object.assign(error as any,{attempts,usage:sumUsage(),model,latencyMs:Math.round(performance.now()-startedAll)});
    }
  }
  throw Object.assign(lastError||new Error('OpenAI request failed'),{attempts,usage:sumUsage(),latencyMs:Math.round(performance.now()-startedAll)});
}
export function modelDiagnostics(){const map=models();return{configured:Boolean(Deno.env.get('OPENAI_API_KEY')),provider:'openai',aliases:{Luna:'fast',Terra:'default',Sol:'deep'},models:map}}
