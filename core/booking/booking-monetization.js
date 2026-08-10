(() => {
'use strict';
const VERSION='1.1.0';
const COMMERCIAL_STATUSES=Object.freeze(['researching','inquiry_sent','application_pending','partner_required','contracting','active','paused','rejected','unavailable']);
const MODES=Object.freeze(['unknown','none','agent_attribution','affiliate_link','distribution_partner','referral','revenue_share','hybrid']);
const TRACKING_STRATEGIES=Object.freeze(['none','click_id','sub_id','agent_id','source_id','partner_id','mixed','contract_defined']);
const clean=v=>String(v??'').trim();
const boolOrNull=v=>v===true?true:v===false?false:null;
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
function enumValue(value,allowed,fallback){const v=clean(value).toLowerCase();return allowed.includes(v)?v:fallback;}
function normalizeProfile(raw={}){
  const providerId=clean(raw.providerId||raw.provider_id).toLowerCase();
  return Object.freeze({
    providerId:providerId||null,
    displayName:clean(raw.displayName||raw.display_name)||providerId||null,
    commercialStatus:enumValue(raw.commercialStatus||raw.commercial_status,COMMERCIAL_STATUSES,'partner_required'),
    monetizationMode:enumValue(raw.monetizationMode||raw.monetization_mode,MODES,'unknown'),
    trackingStrategy:enumValue(raw.trackingStrategy||raw.tracking_strategy,TRACKING_STRATEGIES,'contract_defined'),
    attributionModel:clean(raw.attributionModel||raw.attribution_model||'contract_defined').toLowerCase(),
    attributionWindowDays:Number.isFinite(Number(raw.attributionWindowDays??raw.attribution_window_days))?Number(raw.attributionWindowDays??raw.attribution_window_days):null,
    supportsDeepLinks:boolOrNull(raw.supportsDeepLinks??raw.supports_deep_links),
    supportsClickId:boolOrNull(raw.supportsClickId??raw.supports_click_id),
    supportsSubIds:boolOrNull(raw.supportsSubIds??raw.supports_sub_ids),
    supportsAgentId:boolOrNull(raw.supportsAgentId??raw.supports_agent_id),
    supportsSourceId:boolOrNull(raw.supportsSourceId??raw.supports_source_id),
    supportsConversionReporting:boolOrNull(raw.supportsConversionReporting??raw.supports_conversion_reporting),
    supportsCommissionReporting:boolOrNull(raw.supportsCommissionReporting??raw.supports_commission_reporting),
    supportsPostback:boolOrNull(raw.supportsPostback??raw.supports_postback),
    supportsWebhook:boolOrNull(raw.supportsWebhook??raw.supports_webhook),
    supportsCancellationReversal:boolOrNull(raw.supportsCancellationReversal??raw.supports_cancellation_reversal),
    termsVerifiedAt:raw.termsVerifiedAt||raw.terms_verified_at||null,
    publicMetadata:Object.freeze(obj(raw.publicMetadata||raw.public_metadata)),
    reservationTruthIndependent:true
  });
}
function normalizeRuntime(raw={}){
  return Object.freeze({
    correlationId:raw.correlationId||raw.correlation_id||null,
    correlationToken:raw.correlationToken||raw.correlation_token||null,
    tripId:raw.tripId||raw.trip_id||null,
    bookingId:raw.bookingId||raw.booking_id||null,
    providerId:clean(raw.providerId||raw.provider_id).toLowerCase()||null,
    venueName:raw.venueName||raw.venue_name||null,
    correlationState:raw.correlationState||raw.correlation_state||raw.state||null,
    commercialStatus:raw.commercialStatus||raw.commercial_status||null,
    monetizationMode:raw.monetizationMode||raw.monetization_mode||null,
    trackingStrategy:raw.trackingStrategy||raw.tracking_strategy||null,
    conversionCount:Number(raw.conversionCount??raw.conversion_count??0)||0,
    reconciliationCount:Number(raw.reconciliationCount??raw.reconciliation_count??0)||0,
    latestConversionState:raw.latestConversionState||raw.latest_conversion_state||null,
    latestCommissionState:raw.latestCommissionState||raw.latest_commission_state||null,
    latestCommissionAmount:raw.latestCommissionAmount??raw.latest_commission_amount??null,
    latestCommissionCurrency:raw.latestCommissionCurrency||raw.latest_commission_currency||null,
    commercialEventCount:Number(raw.commercialEventCount??raw.commercial_event_count??0)||0,
    pendingCommercialEventCount:Number(raw.pendingCommercialEventCount??raw.pending_commercial_event_count??0)||0,
    latestCommercialEventKind:raw.latestCommercialEventKind||raw.latest_commercial_event_kind||null,
    latestCommercialProcessingState:raw.latestCommercialProcessingState||raw.latest_commercial_processing_state||null,
    bookingStatus:raw.bookingStatus||raw.booking_status||null,
    bookingStatusChangedByCommercial:false,
    reservationTruthIndependent:true
  });
}
async function client(){const c=await window.LuviaSupabaseService?.start?.();if(!c)throw new Error('Supabase ist nicht bereit.');return c;}
async function profiles(){const c=await client();const {data,error}=await c.from('booking_monetization_provider_readiness_v1').select('*').order('provider_id');if(error)throw error;return (data||[]).map(normalizeProfile);}
async function provider(providerId){const id=clean(providerId).toLowerCase();if(!id)throw new Error('Provider fehlt.');const c=await client();const {data,error}=await c.from('booking_monetization_provider_readiness_v1').select('*').eq('provider_id',id).maybeSingle();if(error)throw error;return data?normalizeProfile(data):null;}
async function booking(bookingId){if(!clean(bookingId))throw new Error('Booking fehlt.');const c=await client();const {data,error}=await c.from('booking_monetization_runtime_v1').select('*').eq('booking_id',bookingId).order('created_at',{ascending:false});if(error)throw error;return (data||[]).map(normalizeRuntime);}
async function trip(tripId){if(!clean(tripId))throw new Error('Reise fehlt.');const c=await client();const {data,error}=await c.from('booking_monetization_runtime_v1').select('*').eq('trip_id',tripId).order('created_at',{ascending:false});if(error)throw error;return (data||[]).map(normalizeRuntime);}
function semantics(){return Object.freeze({commercialSignalCanConfirmReservation:false,commercialEventCanConfirmReservation:false,commissionCanConfirmReservation:false,conversionCanConfirmReservation:false,handoffCanConfirmReservation:false,commercialWritesAreServerOnly:true});}
window.LuviaBookingMonetization=Object.freeze({version:VERSION,COMMERCIAL_STATUSES,MODES,TRACKING_STRATEGIES,normalizeProfile,normalizeRuntime,profiles,provider,booking,trip,semantics,diagnostics:()=>({version:VERSION,status:'ready',...semantics()})});
})();
