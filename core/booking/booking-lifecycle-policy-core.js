((root)=>{
'use strict';

const CONTRACT_ID='booking.lifecycle-policy.v1';
const VERSION='1.0.0';
const TERMINAL=new Set(['cancelled','declined','completed']);
const clean=value=>String(value??'').trim();
const immutable=value=>{
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
};
const safeUrl=value=>{try{const url=new URL(clean(value));return url.protocol==='https:'?url.toString():null}catch{return null}};
const allowed=(available,transport,reason,label)=>Object.freeze({available:Boolean(available),transport:available?transport:null,reason,label});

function externalUrl(booking={},route={}){
  const handoff=booking?.metadata?.handoff||booking?.metadata?.externalHandoff||{};
  return safeUrl(route?.url||route?.value||handoff.url||handoff.externalUrl||handoff.external_url||booking?.request?.reservationUrl||booking?.request?.reservation_url);
}

function assess(input={}){
  const booking=input.booking||{};
  const capability=input.capability||{};
  const platform=capability.platform||{};
  const status=clean(booking.status).toLowerCase()||'draft';
  const provider=clean(booking.provider||capability.id||input.provider)||null;
  const connected=capability.luviaAccessState==='connected';
  const terminal=TERMINAL.has(status);
  const thread=input.thread||null;
  const hasThread=Boolean(thread&&(thread.id||thread.thread_id||thread.provider_thread_id||thread.status));
  const verifiedContact=Boolean(input.verifiedContact===true);
  const canResolveVerifiedContact=Boolean(input.canResolveVerifiedContact===true&&!terminal);
  const url=externalUrl(booking,input.route||{});
  const apiModify=!terminal&&connected&&platform.modifyReservation===true;
  const apiCancel=!terminal&&connected&&platform.cancelReservation===true;
  const emailMutation=!terminal&&(hasThread||verifiedContact||canResolveVerifiedContact);
  const modify=allowed(apiModify||emailMutation,apiModify?'provider_api':hasThread?'email_thread':'verified_email_resolution',terminal?'BOOKING_TERMINAL':apiModify?'CONNECTED_PROVIDER_API':hasThread?'EXISTING_VERIFIED_THREAD':verifiedContact?'VERIFIED_CONTACT':'VERIFIED_CONTACT_RESOLUTION_REQUIRED',apiModify?'Direkt ändern':'Änderung anfragen');
  const cancel=allowed(apiCancel||emailMutation,apiCancel?'provider_api':hasThread?'email_thread':'verified_email_resolution',terminal?'BOOKING_TERMINAL':apiCancel?'CONNECTED_PROVIDER_API':hasThread?'EXISTING_VERIFIED_THREAD':verifiedContact?'VERIFIED_CONTACT':'VERIFIED_CONTACT_RESOLUTION_REQUIRED',apiCancel?'Direkt stornieren':'Stornierung anfragen');
  const message=allowed(!terminal&&hasThread,'email_thread',terminal?'BOOKING_TERMINAL':hasThread?'EXISTING_VERIFIED_THREAD':'THREAD_REQUIRED','Anbieter schreiben');
  const manageExternal=allowed(!terminal&&Boolean(url),'external_link',terminal?'BOOKING_TERMINAL':url?'VERIFIED_EXTERNAL_HANDOFF':'EXTERNAL_URL_REQUIRED','Beim Anbieter verwalten');
  const refreshStatus=allowed(!terminal&&connected&&(platform.statusWebhook===true||platform.statusPolling===true),'provider_api',terminal?'BOOKING_TERMINAL':connected?'PROVIDER_STATUS_UNSUPPORTED':'PROVIDER_NOT_CONNECTED','Status aktualisieren');
  const externallyUnconfirmed=Boolean(url&&['ready','forwarded','requested','awaiting_reply','needs_action'].includes(status));
  const summary=terminal
    ?'Dieser Vorgang ist abgeschlossen. Es werden keine weiteren Änderungen angeboten.'
    :externallyUnconfirmed
      ?'Beim Anbieter geöffnet. Abschluss und aktueller Status sind in Luvia noch nicht bestätigt.'
      :hasThread
        ?'Der verifizierte Anbieter-Thread ist verfügbar. Antworten bleiben im Booking Center nachvollziehbar.'
        :connected
          ?'Der verbundene Provider kann die belegten Aktionen direkt ausführen.'
          :'Aktuell ist kein belastbarer direkter Verwaltungsweg belegt.';
  return immutable({
    contractId:CONTRACT_ID,version:VERSION,status,provider,terminal,connected,hasThread,verifiedContact,
    external:{url,unconfirmed:externallyUnconfirmed},summary,
    actions:{modify,cancel,message,manageExternal,refreshStatus},
    invariants:{noInventedProviderCapability:true,noMessageWithoutThread:true,noTerminalMutation:true,externalStatusNeedsEvidence:true}
  });
}

root.LuviaBookingLifecyclePolicyCore=Object.freeze({contractId:CONTRACT_ID,version:VERSION,TERMINAL,assess,externalUrl});
})(this);
