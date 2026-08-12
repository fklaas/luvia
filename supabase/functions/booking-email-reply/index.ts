import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders={'Access-Control-Allow-Origin':'https://myluvia.app','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...corsHeaders,'content-type':'application/json; charset=utf-8'}});
const clean=(v:unknown)=>String(v??'').trim();
const sha=async(v:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))).map(b=>b.toString(16).padStart(2,'0')).join('');
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:corsHeaders});
 try{
  if(req.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
  const supabaseUrl=Deno.env.get('SUPABASE_URL'),anonKey=Deno.env.get('SUPABASE_ANON_KEY'),serviceRoleKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!supabaseUrl||!anonKey||!serviceRoleKey)return json({error:'SUPABASE_ENV_MISSING'},500);
  const authorization=req.headers.get('Authorization')||'';if(!authorization)return json({error:'AUTH_REQUIRED'},401);
  const userClient=createClient(supabaseUrl,anonKey,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
  const admin=createClient(supabaseUrl,serviceRoleKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userData}=await userClient.auth.getUser();const userId=userData?.user?.id||null;if(!userId)return json({error:'AUTH_REQUIRED'},401);
  const body=await req.json();
  const bookingId=clean(body.bookingId),bodyText=clean(body.bodyText),action=clean(body.action).toLowerCase(),intelligenceId=clean(body.intelligenceId);
  if(!bookingId)return json({error:'BOOKING_ID_REQUIRED'},400);
  if(!bodyText)return json({error:'REPLY_BODY_REQUIRED'},400);
  if(body.userApproved!==true)return json({ok:false,expected:true,error:'REPLY_USER_APPROVAL_REQUIRED'},200);
  const {data:booking,error:bookingError}=await userClient.from('bookings').select('*').eq('id',bookingId).maybeSingle();
  if(bookingError||!booking)return json({error:'BOOKING_NOT_FOUND_OR_FORBIDDEN',details:bookingError?.message??null},404);
  const {data:thread,error:threadError}=await userClient.from('booking_email_threads').select('*').eq('booking_id',bookingId).maybeSingle();
  if(threadError)return json({error:'EMAIL_THREAD_LOOKUP_FAILED',details:threadError.message},500);
  if(!thread)return json({ok:false,expected:true,error:'EMAIL_THREAD_REQUIRED'},200);
  const intendedRecipient=clean(booking.contact?.email);
  if(!intendedRecipient)return json({ok:false,expected:true,error:'EMAIL_RECIPIENT_REQUIRED'},200);
  const {data:verified,error:verifiedError}=await userClient.rpc('luvia_booking_email_verified_candidate',{p_booking_id:booking.id,p_email:intendedRecipient});
  if(verifiedError)return json({error:'EMAIL_VERIFICATION_FAILED',details:verifiedError.message},500);
  if(!verified?.ok)return json({ok:false,expected:true,error:'EMAIL_RECIPIENT_NOT_VERIFIED',reason:verified?.reason||'VENUE_EMAIL_NOT_VERIFIED'},200);
  const mode=clean(Deno.env.get('BOOKING_MODE')||'test').toLowerCase()==='production'?'production':'test';
  const testRecipient=clean(body.testRecipient||Deno.env.get('BOOKING_TEST_RECIPIENT'));
  const actualRecipient=mode==='production'?intendedRecipient:testRecipient;
  if(!actualRecipient)return json({ok:false,expected:true,error:'BOOKING_TEST_RECIPIENT_REQUIRED'},200);
  const fromDefault=clean(Deno.env.get('BOOKING_EMAIL_FROM')||Deno.env.get('BOOKING_FROM')||'Luvia Booking <booking@booking.myluvia.app>');
  const resendKey=Deno.env.get('RESEND_API_KEY');if(!resendKey)return json({error:'RESEND_API_KEY_MISSING'},500);
  const {data:lastMessage}=await admin.from('booking_messages').select('*').eq('booking_id',bookingId).order('created_at',{ascending:false}).limit(1).maybeSingle();
  const baseSubject=clean(lastMessage?.subject)||`Reservierung · ${clean(booking.title)||'Luvia'}`;
  const subject=/^re:/i.test(baseSubject)?baseSubject:`Re: ${baseSubject}`;
  const fingerprint=await sha(JSON.stringify({bookingId,bodyText,action,intelligenceId,threadId:thread.id}));
  const idempotencyKey=clean(body.idempotencyKey||`email-reply-v1:${bookingId}:${fingerprint.slice(0,40)}`);
  const {data:existing}=await admin.from('booking_messages').select('*').eq('idempotency_key',idempotencyKey).maybeSingle();
  if(existing)return json({ok:true,idempotent:true,message:existing,bookingId,threadId:thread.id,mode});
  const headers:Record<string,string>={};
  if(clean(lastMessage?.message_id_header))headers['In-Reply-To']=clean(lastMessage.message_id_header);
  if(clean(lastMessage?.references_header))headers['References']=clean(lastMessage.references_header);
  else if(clean(lastMessage?.message_id_header))headers['References']=clean(lastMessage.message_id_header);
  const resendBody:any={from:fromDefault,to:[actualRecipient],subject,text:bodyText,reply_to:thread.reply_alias,tags:[{name:'booking_id',value:booking.id},{name:'booking_thread_id',value:thread.id}]};
  if(Object.keys(headers).length)resendBody.headers=headers;
  const resendResponse=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${resendKey}`,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(resendBody)});
  const resendPayload=await resendResponse.json().catch(()=>({}));
  if(!resendResponse.ok)return json({error:'RESEND_REPLY_FAILED',message:'Der E-Mail-Anbieter hat die Antwort abgelehnt.',details:resendPayload,resendStatus:resendResponse.status,from:fromDefault,intendedRecipient,actualRecipient},502);
  const {data:storedMessage,error:messageError}=await userClient.rpc('luvia_booking_record_message',{p_booking_id:booking.id,p_direction:'outbound',p_channel:'email',p_transport_provider:'resend',p_sender:fromDefault,p_recipient:actualRecipient,p_intended_recipient:intendedRecipient,p_actual_recipient:actualRecipient,p_subject:subject,p_body_text:bodyText,p_template_key:'booking.thread.reply.v1',p_provider_message_id:resendPayload.id,p_provider_thread_id:thread.id,p_delivery_status:'sent',p_idempotency_key:idempotencyKey,p_metadata:{mode,replyTo:thread.reply_alias,emailReplyV1:true,action:action||null,intelligenceId:intelligenceId||null},p_raw_payload:{resend:{id:resendPayload.id}}});
  if(messageError)return json({error:'REPLY_MESSAGE_RECORD_FAILED',details:messageError.message,providerReference:resendPayload.id},500);
  await admin.from('booking_messages').update({email_thread_id:thread.id,correlation_method:'outbound_thread_reply'}).eq('id',storedMessage.id);
  await admin.from('booking_email_threads').update({state:'awaiting_reply',last_outbound_message_id:storedMessage.id,last_activity_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',thread.id);
  let intelligence:any=null;
  if(intelligenceId&&action){
   const resolved=await userClient.rpc('luvia_booking_resolve_message_intelligence',{p_intelligence_id:intelligenceId,p_action:action,p_payload:{replyMessageId:storedMessage.id,bodyText}});
   if(resolved.error)return json({error:'REPLY_SENT_INTELLIGENCE_RESOLUTION_FAILED',details:resolved.error.message,message:storedMessage,providerReference:resendPayload.id},500);
   intelligence=resolved.data;
  }
  let bookingAfter=booking;
  if(['alternative_proposed','needs_action'].includes(clean(booking.status).toLowerCase())){
   const transitioned=await userClient.rpc('luvia_transition_booking',{p_booking_id:booking.id,p_status:'awaiting_reply',p_patch:{statusSource:'user_confirmation',statusSourceRef:storedMessage.id,metadata:{lastUserReplyAt:new Date().toISOString(),lastUserReplyAction:action||'answer'}}});
   if(!transitioned.error)bookingAfter=transitioned.data;
  }
  return json({ok:true,provider:'resend',providerReference:resendPayload.id,message:storedMessage,intelligence,booking:bookingAfter,threadId:thread.id,mode,intendedRecipient,actualRecipient});
 }catch(error){return json({error:'BOOKING_EMAIL_REPLY_UNEXPECTED',details:error instanceof Error?error.message:String(error)},500)}
});
