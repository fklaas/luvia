var LuviaTripDraftCoreV1=(()=>{
'use strict';

const VERSION='1';
const RUNTIME_VERSION='1.1.0';
const FIELDS=Object.freeze([
  'title','subtitle','symbol','feelings','destination','scheduleMode','startDate','endDate',
  'flexibility','participantPlan','privacy','modules','accent','deferred','entryMode',
  'requestBrief','tripPreferences','durablePreferenceProposal'
]);
const DEFAULTS=Object.freeze({
  title:'',subtitle:'',symbol:'✦',feelings:Object.freeze([]),destination:null,
  scheduleMode:'fixed',startDate:null,endDate:null,flexibility:'',participantPlan:'solo-first',
  privacy:'private',modules:Object.freeze([]),accent:'#ec6555',deferred:false,entryMode:'guided',
  requestBrief:'',tripPreferences:Object.freeze({}),durablePreferenceProposal:Object.freeze({requested:false,fields:Object.freeze([])})
});

function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function text(value,maxLength=0){
  const result=value==null?'':String(value).trim();
  return maxLength?result.slice(0,maxLength):result;
}
function uniqueStrings(values,limit=Infinity){
  return [...new Set((Array.isArray(values)?values:[]).map(value=>text(value)).filter(Boolean))].slice(0,limit);
}
function projectDestination(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const coordinate=input=>input==null||input===''?null:(Number.isFinite(Number(input))?Number(input):null);
  return immutable({
    name:text(value.name||value.displayName,120),
    formattedAddress:text(value.formattedAddress,240),
    country:text(value.country,80),
    countryCode:text(value.countryCode,8).toUpperCase(),
    placeId:text(value.placeId,240),
    latitude:coordinate(value.latitude),
    longitude:coordinate(value.longitude),
    timezone:text(value.timezone,80)
  });
}
function projectTripPreferences(value={}){
  const input=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  const budget=['economy','balanced','generous','open'].includes(input.budgetLevel)?input.budgetLevel:'open';
  const pace=['slow','balanced','active','open'].includes(input.pace)?input.pace:'open';
  return immutable({
    budgetLevel:budget,
    pace,
    interests:uniqueStrings(input.interests,12),
    food:uniqueStrings(input.food,12),
    accessibility:uniqueStrings(input.accessibility,12),
    mobility:uniqueStrings(input.mobility,8),
    notes:text(input.notes,280)
  });
}
function projectDurablePreferenceProposal(value={}){
  const input=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  const requested=Boolean(input.requested);
  return immutable({
    requested,
    fields:requested?uniqueStrings(input.fields,12):[],
    status:requested?'confirmation-required':'not-requested'
  });
}
function normalize(input={}){
  const value=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
  const scheduleMode=value.scheduleMode==='flexible'?'flexible':'fixed';
  return immutable({
    title:text(value.title,80),
    subtitle:text(value.subtitle,120),
    symbol:text(value.symbol,12)||DEFAULTS.symbol,
    feelings:uniqueStrings(value.feelings,3),
    destination:projectDestination(value.destination),
    scheduleMode,
    startDate:scheduleMode==='flexible'?null:(text(value.startDate,10)||null),
    endDate:scheduleMode==='flexible'?null:(text(value.endDate,10)||null),
    flexibility:text(value.flexibility,120),
    participantPlan:value.participantPlan==='invite-after-creation'?'invite-after-creation':'solo-first',
    privacy:value.privacy==='invite-only'?'invite-only':'private',
    modules:uniqueStrings(value.modules),
    accent:text(value.accent,32)||DEFAULTS.accent,
    deferred:Boolean(value.deferred),
    entryMode:['guided','quick','ai'].includes(value.entryMode)?value.entryMode:'guided',
    requestBrief:text(value.requestBrief,1200),
    tripPreferences:projectTripPreferences(value.tripPreferences),
    durablePreferenceProposal:projectDurablePreferenceProposal(value.durablePreferenceProposal)
  });
}
function createDraft(input={}){return normalize({...DEFAULTS,...input})}
function updateDraft(draft={},patch={}){
  if(!patch||typeof patch!=='object'||Array.isArray(patch))throw new TypeError('Trip draft patch must be an object.');
  for(const field of Object.keys(patch))if(!FIELDS.includes(field)){
    const error=new Error(`Trip draft field not allowed: ${field}`);
    error.code='TRIP_DRAFT_FIELD_NOT_ALLOWED';
    error.field=field;
    throw error;
  }
  return normalize({...draft,...patch});
}
function deferDraft(draft={}){return updateDraft(draft,{deferred:true})}
function resumeDraft(draft={}){return updateDraft(draft,{deferred:false})}
function validateDraft(draft={}){
  const value=normalize(draft),issues=[];
  if(!value.title)issues.push(Object.freeze({path:'title',code:'required'}));
  if(!value.destination?.placeId)issues.push(Object.freeze({path:'destination.placeId',code:'canonical_destination_required'}));
  if(!value.modules.length)issues.push(Object.freeze({path:'modules',code:'at_least_one_required'}));
  if(value.startDate&&value.endDate&&value.endDate<value.startDate)issues.push(Object.freeze({path:'endDate',code:'date_range'}));
  return immutable({valid:issues.length===0,issues,draft:value});
}
function projectScopes(draft={}){
  const value=normalize(draft);
  const {requestBrief,durablePreferenceProposal,...tripInput}=value;
  return immutable({
    tripInput,
    requestContext:{scope:'request-only',retention:'receipt-only',brief:requestBrief},
    durablePreferenceHandoff:{
      owner:'identity',contractId:'identity.v1',scope:'durable',
      status:durablePreferenceProposal.requested?'required':'not-requested',
      confirmationRequired:durablePreferenceProposal.requested,
      fields:durablePreferenceProposal.fields
    }
  });
}

return Object.freeze({
  version:VERSION,runtimeVersion:RUNTIME_VERSION,fields:FIELDS,
  createDraft,updateDraft,deferDraft,resumeDraft,validateDraft,projectScopes
});
})();
