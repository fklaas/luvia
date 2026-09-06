var LuviaTripDraftCoreV1=(()=>{
'use strict';

const VERSION='1';
const RUNTIME_VERSION='1.3.0-full-period-draft';
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
  if(value.scheduleMode==='fixed'){
    if(!validDate(value.startDate))issues.push(Object.freeze({path:'startDate',code:'valid_date_required'}));
    if(!validDate(value.endDate))issues.push(Object.freeze({path:'endDate',code:'valid_date_required'}));
    if(value.startDate&&value.endDate&&value.endDate<value.startDate)issues.push(Object.freeze({path:'endDate',code:'date_range'}));
  }
  return immutable({valid:issues.length===0,issues,draft:value});
}
function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(text(value))&&!Number.isNaN(Date.parse(`${value}T12:00:00Z`))&&new Date(`${value}T12:00:00Z`).toISOString().slice(0,10)===value;}
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

function canonicalPlace(value={}){
  const providerPlaceId=text(value.providerPlaceId||value.provider_place_id||value.id,240).replace(/^places\//,'');
  const coordinates=value.coordinates||value.location||{};
  const lat=coordinates.latitude??coordinates.lat,lng=coordinates.longitude??coordinates.lng,latitude=Number(lat),longitude=Number(lng);
  if(!providerPlaceId||!text(value.name,200)||lat==null||lng==null||lat===''||lng===''||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)return null;
  const photo=value.image?.url||value.photo?.url||value.photos?.find?.(item=>item?.uri||item?.url)?.uri||value.photos?.find?.(item=>item?.uri||item?.url)?.url||null;
  return immutable({
    owner:'places',contractId:'places.v1',providerPlaceId,name:text(value.name,200),
    primaryType:text(value.primaryType||value.primary_type||value.type,80)||'place',
    category:text(value.requestCategory||value.category,80),
    formattedAddress:text(value.formattedAddress||value.address,280),
    coordinates:{latitude,longitude},imageUrl:text(photo,1000)||null,
    openingState:value.currentOpeningHours?.openNow===true||value.openNow===true?'open':value.currentOpeningHours?.openNow===false||value.openNow===false?'closed':'unknown'
  });
}
function draftDates(input={}){
  if(input.scheduleMode==='flexible')return [null,null,null];
  if(!validDate(input.startDate)||!validDate(input.endDate)||input.endDate<input.startDate)throw new Error('Bitte einen gültigen Reisezeitraum wählen.');
  const start=new Date(`${text(input.startDate)}T12:00:00Z`),end=/^\d{4}-\d{2}-\d{2}$/.test(text(input.endDate))?new Date(`${text(input.endDate)}T12:00:00Z`):start,days=[];
  if((end-start)/86400000>=366)throw new Error('Der Entwurf unterstützt bis zu 366 Reisetage. Bitte einen kürzeren Zeitraum wählen.');
  for(let index=0;index<366;index+=1){const value=new Date(start.getTime()+index*86400000);if(value>end)break;days.push(value.toISOString().slice(0,10));}
  return days.length?days:[text(input.startDate)];
}
function composeDayDraft(input={},sources={}){
  const candidates=(Array.isArray(sources.places)?sources.places:[]).map(canonicalPlace).filter(Boolean),seen=new Set(),places=candidates.filter(place=>{if(seen.has(place.providerPlaceId))return false;seen.add(place.providerPlaceId);return true});
  const brief=sources.brief?.kind==='trip-planning-brief'&&sources.brief?.owner==='intelligence'?sources.brief:null,preferences=brief?.tripPreferences||input.tripPreferences||{},policy=brief?.policy||{},dates=draftDates(input);
  const maximumPerDay=Math.max(1,Math.min(4,Number(policy.maximumPerDay)||(preferences.pace==='slow'?1:preferences.pace==='active'?3:2)));
  const minute=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value||'')?Number(value.slice(0,2))*60+Number(value.slice(3)):null;
  const start=minute(policy.notBefore)??600,end=minute(policy.notAfter)??1260,capacity=Math.max(0,Math.min(maximumPerDay,Math.floor((end-start+120)/240)));
  const reserve=places.length>6?Math.min(2,places.length-1):0,selected=places.slice(0,Math.min(places.length-reserve,dates.length*capacity)),days=dates.map((date,index)=>({id:`day-${index+1}`,date,label:`Tag ${index+1}`,entries:[]}));
  selected.forEach((place,index)=>{
    const dayIndex=Math.floor(index*dates.length/selected.length),day=days[Math.min(dayIndex,days.length-1)],slot=day.entries.length;
    const durationMinutes=place.primaryType==='restaurant'?90:120,minutes=start+slot*240,time=`${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
    day.entries.push({...place,slotId:`${day.id}-slot-${slot+1}`,dayId:day.id,date:day.date,time,durationMinutes,suggestedAction:day.date&&brief?.automaticPlanningAllowed!==false?'planned':'saved',reason:`${place.category?'Aus dem gesuchten Bereich '+({food:'Essen & Trinken',culture:'Kultur',nature:'Natur',nightlife:'Nachtleben',shopping:'Shopping',wellness:'Wellness',activities:'Aktivitäten'}[place.category]||place.category)+'. ':''}Von Places geliefert. ${maximumPerDay===1?'Höchstens ein Vorschlag pro Tag lässt Zeit zum Durchatmen.':'Mit Abstand zum nächsten Vorschlag verteilt.'} Wege, Preise und Öffnung zu diesem Termin sind noch nicht bestätigt.`,confirmationRequired:true,automaticMutation:false});
  });
  const frozenDays=days.map(day=>immutable({...day,open:day.entries.length===0}));
  return immutable({
    kind:'owner-backed-ai-day-draft',owner:'trip',contractId:'trip.v1',sourceContracts:['places.v1','journey.v1'],
    destination:projectDestination(input.destination),days:frozenDays,alternatives:places.slice(selected.length),candidateCount:places.length,periodComplete:input.scheduleMode!=='flexible',coverage:{days:dates.length,daysWithIdeas:days.filter(day=>day.entries.length).length,freeDays:days.filter(day=>!day.entries.length).length},
    unknownFactors:['Wetter zum Reisetermin','Fußwege und Fahrzeiten','Saisonale Events','aktuelle Auslastung','Störungen','Preise und Buchbarkeit','Öffnungszeiten zum geplanten Besuch',...(places.some(place=>!place.imageUrl)?['Bilder einzelner Orte']:[])],
    confirmationRequired:true,automaticMutation:false,generatedAt:text(sources.generatedAt)||null
  });
}

return Object.freeze({
  version:VERSION,runtimeVersion:RUNTIME_VERSION,fields:FIELDS,
  createDraft,updateDraft,deferDraft,resumeDraft,validateDraft,projectScopes,composeDayDraft
});
})();
