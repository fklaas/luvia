import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders={'Access-Control-Allow-Origin':'https://myluvia.app','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...corsHeaders,'content-type':'application/json; charset=utf-8'}});
const clean=(value:unknown)=>String(value??'').trim();
const sha=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');
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
  const body=await req.json();const bookingId=clean(body.bookingId);if(!bookingId)return json({error:'BOOKING_ID_REQUIRED'},400);
  if(body.userApproved!==true)return json({ok:false,expected:true,error:'EMAIL_USER_APPROVAL_REQUIRED'},200);
  const {data:booking,error:bookingError}=await userClient.from('bookings').select('*').eq('id',bookingId).maybeSingle();
  if(bookingError||!booking)return json({error:'BOOKING_NOT_FOUND_OR_FORBIDDEN',details:bookingError?.message??null},404);

  const intendedRecipient=clean(booking.contact?.email);
  const mode=clean(Deno.env.get('BOOKING_MODE')||'test').toLowerCase()==='production'?'production':'test';
  const forcedTestRecipient=clean(Deno.env.get('BOOKING_TEST_RECIPIENT'));
  const actualRecipientCandidate=mode==='production'?intendedRecipient:clean(body.testRecipient||forcedTestRecipient);
  const occasion=clean(body.occasion||booking.request?.occasion);const rawNote=clean(body.note||booking.request?.note||booking.request?.specialRequest);const legacyPrefix=occasion&&occasion!=='Kein besonderer Anlass'?`Anlass: ${occasion}`:'';const note=legacyPrefix&&rawNote.startsWith(legacyPrefix)?clean(rawNote.slice(legacyPrefix.length)):rawNote;
  const fingerprint=await sha(JSON.stringify({bookingId,intendedRecipient,startAt:booking.start_at||null,endAt:booking.end_at||null,partySize:booking.party_size||1,occasion,note,requesterName:clean(body.requesterName||booking.request?.requesterName||'Luvia Reisender')}));
  const idempotencyKey=clean(body.idempotencyKey||`email-v2:${booking.id}:${fingerprint.slice(0,40)}`);

  const {data:existing,error:existingError}=await admin.from('booking_email_requests').select('*').eq('booking_id',booking.id).eq('idempotency_key',idempotencyKey).maybeSingle();
  if(existingError)return json({error:'EMAIL_REQUEST_AUDIT_LOOKUP_FAILED',details:existingError.message},500);
  if(existing){
   if(existing.state==='sent')return json({ok:true,idempotent:true,provider:'resend',providerReference:existing.provider_message_id,requestId:existing.id,status:booking.status,mode,intendedRecipient:existing.intended_recipient,actualRecipient:existing.actual_recipient,replyTo:existing.reply_alias});
   if(existing.state==='blocked')return json({ok:false,expected:true,idempotent:true,error:existing.error_code,requestId:existing.id});
  }

  // v13.68.2: create the outbound audit before recipient verification. This guarantees
  // that expected recipient guards are observable and can never disappear behind a 500.
  let requestRow:any=existing||null;
  if(!requestRow){
   const {data:created,error:createError}=await admin.from('booking_email_requests').insert({
    booking_id:booking.id,
    trip_id:booking.trip_id,
    requested_by:userId,
    contact_candidate_id:null,
    intended_recipient:intendedRecipient||null,
    actual_recipient:null,
    mode,
    idempotency_key:idempotencyKey,
    request_fingerprint:fingerprint,
    state:'received',
    evidence:{core:'4.68.3',build:'13.68.3',phase:'pre_recipient_verification'}
   }).select('*').single();
   if(createError)return json({error:'EMAIL_REQUEST_AUDIT_CREATE_FAILED',details:createError.message},500);
   requestRow=created;
  }

  const block=async(errorCode:string,extra:Record<string,unknown>={})=>{
   const evidence={...(requestRow?.evidence||{}),...extra,blockedAt:new Date().toISOString()};
   const {error:updateError}=await admin.from('booking_email_requests').update({state:'blocked',expected_state:true,error_code:errorCode,actual_recipient:null,evidence,finished_at:new Date().toISOString()}).eq('id',requestRow.id);
   if(updateError)return json({error:'EMAIL_REQUEST_AUDIT_UPDATE_FAILED',details:updateError.message,originalExpectedError:errorCode,requestId:requestRow.id},500);
   return json({ok:false,expected:true,error:errorCode,requestId:requestRow.id,bookingId:booking.id,intendedRecipient:intendedRecipient||null},200);
  };

  const {data:verified,error:verifiedError}=await userClient.rpc('luvia_booking_email_verified_candidate',{p_booking_id:booking.id,p_email:intendedRecipient});
  if(verifiedError){
   await admin.from('booking_email_requests').update({state:'failed',expected_state:false,error_code:'EMAIL_CONTACT_VERIFICATION_FAILED',evidence:{...(requestRow.evidence||{}),verificationError:verifiedError.message},finished_at:new Date().toISOString()}).eq('id',requestRow.id);
   return json({error:'EMAIL_CONTACT_VERIFICATION_FAILED',details:verifiedError.message,requestId:requestRow.id},500);
  }
  if(!verified?.ok)return await block(verified?.reason||'VENUE_EMAIL_NOT_VERIFIED',{contactVerification:verified||null});
  if(!actualRecipientCandidate)return await block('BOOKING_TEST_RECIPIENT_MISSING',{contactVerification:verified});

  // Transport prerequisites are intentionally checked only after all expected business
  // guards, so missing infrastructure can never mask an invalid venue recipient.
  const resendKey=Deno.env.get('RESEND_API_KEY');
  if(!resendKey){
   await admin.from('booking_email_requests').update({state:'failed',expected_state:false,error_code:'RESEND_API_KEY_MISSING',contact_candidate_id:verified.candidateId||null,evidence:{...(requestRow.evidence||{}),contactVerification:verified},finished_at:new Date().toISOString()}).eq('id',requestRow.id);
   return json({error:'RESEND_API_KEY_MISSING',requestId:requestRow.id},500);
  }

  const actualRecipient=actualRecipientCandidate;
  await admin.from('booking_email_requests').update({contact_candidate_id:verified.candidateId,actual_recipient:actualRecipient,evidence:{...(requestRow.evidence||{}),contactVerification:verified,phase:'verified'}}).eq('id',requestRow.id);

  const inboundDomain=clean(Deno.env.get('BOOKING_INBOUND_DOMAIN')||'booking.myluvia.app');const replyAlias=`booking-${booking.id}@${inboundDomain}`;
  const {data:thread,error:threadError}=await admin.from('booking_email_threads').upsert({booking_id:booking.id,trip_id:booking.trip_id,transport_provider:'resend',reply_alias:replyAlias,state:'awaiting_reply',last_activity_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'booking_id'}).select('*').single();
  if(threadError){await admin.from('booking_email_requests').update({state:'failed',error_code:'EMAIL_THREAD_CREATE_FAILED',finished_at:new Date().toISOString()}).eq('id',requestRow.id);return json({error:'EMAIL_THREAD_CREATE_FAILED',details:threadError.message,requestId:requestRow.id},500);}
  await admin.from('booking_email_requests').update({state:'sending',contact_candidate_id:verified.candidateId,reply_alias:replyAlias,attempt_count:(requestRow.attempt_count||1)}).eq('id',requestRow.id);
  const startDate=booking.start_at?new Date(booking.start_at):null;const fDate=(d:Date)=>new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Europe/Berlin'}).format(d);const fTime=(d:Date)=>new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Berlin'}).format(d);
  const requesterName=clean(body.requesterName||booking.request?.requesterName||'Luvia Reisender');
  const lines=['Guten Tag,','',booking.booking_type==='restaurant'?'ich möchte gerne einen Tisch in Ihrem Restaurant reservieren.':booking.booking_type==='hotel'?'ich möchte gerne die Verfügbarkeit für einen Aufenthalt anfragen.':'ich möchte gerne eine Buchung anfragen.','',`Datum: ${startDate?fDate(startDate):'noch offen'}`];if(startDate)lines.push(`Uhrzeit: ${fTime(startDate)}`);if(booking.booking_type==='hotel'&&booking.end_at)lines.push(`Abreise: ${fDate(new Date(booking.end_at))}`);lines.push(`Personen: ${booking.party_size||1}`,`Name: ${requesterName}`);if(occasion&&occasion!=='Kein besonderer Anlass')lines.push(`Anlass: ${occasion}`);if(note)lines.push('',`Hinweis: ${note}`);lines.push('','Bitte bestätigen Sie uns kurz, ob die Buchung möglich ist.','','Vielen Dank und freundliche Grüße','',requesterName,'Buchungsanfrage über Luvia');
  const subject=`Buchungsanfrage · ${booking.title}`;const fromDefault=clean(Deno.env.get('BOOKING_EMAIL_FROM')||'Luvia Booking <booking@booking.myluvia.app>');
  const resendBody:any={from:clean(body.sender||fromDefault),to:[actualRecipient],subject,text:lines.join('\n'),reply_to:replyAlias,tags:[{name:'booking_id',value:booking.id},{name:'email_request_id',value:requestRow.id}]};
  const resendResponse=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${resendKey}`,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(resendBody)});const resendPayload=await resendResponse.json().catch(()=>({}));
  if(!resendResponse.ok){await admin.from('booking_email_requests').update({state:'failed',error_code:'RESEND_SEND_FAILED',evidence:{...(requestRow.evidence||{}),resend:resendPayload},finished_at:new Date().toISOString()}).eq('id',requestRow.id);return json({error:'RESEND_SEND_FAILED',details:resendPayload,requestId:requestRow.id},502);}
  const {data:storedMessage,error:messageError}=await userClient.rpc('luvia_booking_record_message',{p_booking_id:booking.id,p_direction:'outbound',p_channel:'email',p_transport_provider:'resend',p_sender:resendBody.from,p_recipient:actualRecipient,p_intended_recipient:intendedRecipient,p_actual_recipient:actualRecipient,p_subject:subject,p_body_text:resendBody.text,p_template_key:`${booking.booking_type}.request.de.v2`,p_provider_message_id:resendPayload.id,p_provider_thread_id:thread.id,p_delivery_status:'sent',p_idempotency_key:idempotencyKey,p_metadata:{mode,redirected:actualRecipient.toLowerCase()!==intendedRecipient.toLowerCase(),replyTo:replyAlias,verifiedCandidateId:verified.candidateId,emailV2:true},p_raw_payload:{resend:{id:resendPayload.id}}});
  if(messageError){await admin.from('booking_email_requests').update({state:'failed',error_code:'MESSAGE_STORE_FAILED',provider_message_id:resendPayload.id,finished_at:new Date().toISOString()}).eq('id',requestRow.id);return json({error:'MESSAGE_STORE_FAILED',details:messageError.message,providerReference:resendPayload.id,mailWasSent:true,requestId:requestRow.id},500);}
  await admin.from('booking_messages').update({email_thread_id:thread.id,correlation_method:'outbound_thread'}).eq('id',storedMessage.id);
  await admin.from('booking_email_threads').update({state:'awaiting_reply',last_outbound_message_id:storedMessage.id,last_activity_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',thread.id);
  await admin.from('booking_email_requests').update({state:'sent',provider_message_id:resendPayload.id,message_id:storedMessage.id,finished_at:new Date().toISOString(),error_code:null}).eq('id',requestRow.id);
  let finalStatus=booking.status;if(['ready','needs_action'].includes(booking.status)){const {data:transitioned,error:transitionError}=await userClient.rpc('luvia_transition_booking',{p_booking_id:booking.id,p_status:'requested',p_patch:{provider:'resend',provider_reference:resendPayload.id,channel:'email',metadata:{last_mail_provider:'resend',last_mail_provider_reference:resendPayload.id,emailBookingV2:true,emailThreadId:thread.id}}});if(transitionError)return json({error:'BOOKING_TRANSITION_FAILED',details:transitionError.message,mailWasSent:true,messageWasStored:true,requestId:requestRow.id},500);finalStatus=transitioned?.status||'requested';}
  return json({ok:true,version:'2.0.3',build:'13.68.3',core:'4.68.3',provider:'resend',providerReference:resendPayload.id,requestId:requestRow.id,threadId:thread.id,channel:'email',status:finalStatus,mode,intendedRecipient,actualRecipient,replyTo:replyAlias,message:storedMessage});
 }catch(error){return json({error:'BOOKING_EMAIL_SEND_UNHANDLED',details:error instanceof Error?error.message:String(error)},500);}
});
