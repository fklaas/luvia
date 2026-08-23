var LuviaIdentityDomainContractCoreV1=(()=>{
'use strict';

const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const VIEWER_FIELDS=Object.freeze([
  'userId','displayName','firstName','lastName','avatarUrl','avatarColor','language','timezone','homeLocation',
  'themeMode','density','reducedMotion','useTripAccent','defaultView','showArchivedTrips',
  'personalizedRecommendations','activityData','locationSharing','notifications'
]);
const PUBLIC_FIELDS=Object.freeze(['userId','displayName','avatarUrl','avatarColor']);
const PROFILE_WRITE_FIELDS=Object.freeze(VIEWER_FIELDS.filter(field=>field!=='userId'));
const PREFERENCE_FIELDS=Object.freeze([
  'dietaryPreferences','travelInterests','travelStyles','activityPreferences','entertainmentPreferences',
  'diningPreferences','mobilityPreferences','atmospherePreferences','travelPace','budgetPreference',
  'familyPreferences','accessibilityPreferences','accessibilityNeeds','preferenceSchemaVersion',
  'preferencesCompletedAt','preferencesUpdatedAt'
]);
const PREFERENCE_LAYERS=Object.freeze({
  explicit:Object.freeze({owner:'identity',persistence:'profile-preferences',requiresConfirmation:false}),
  observed:Object.freeze({owner:'intelligence',persistence:'intelligence-memory',requiresConfirmation:true})
});
const STATE_DEFAULTS=Object.freeze({profile:null,loaded:false,syncing:false,error:null,lastSyncedAt:null});

function clone(value){
  if(value==null||typeof value!=='object')return value;
  if(value instanceof Error)return value;
  if(Array.isArray(value))return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clone(item)]));
}
function immutable(value){
  if(value==null||typeof value!=='object'||value instanceof Error)return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function contractError(code,message,extra={}){
  const error=new Error(message);
  error.code=code;
  Object.assign(error,extra);
  return error;
}
function project(input,fields){
  const source=input&&typeof input==='object'?input:{};
  return immutable(Object.fromEntries(fields.map(field=>[field,source[field]===undefined?null:clone(source[field])])));
}
function sanitize(patch,fields,kind){
  if(!patch||typeof patch!=='object'||Array.isArray(patch)){
    throw contractError(`IDENTITY_CONTRACT_${kind}_PATCH_REQUIRED`,`${kind} patch must be an object.`);
  }
  const allowed=new Set(fields);
  const output={};
  for(const [field,value] of Object.entries(patch)){
    if(!allowed.has(field))throw contractError(`IDENTITY_CONTRACT_${kind}_FIELD_NOT_ALLOWED`,`${kind} field not allowed: ${field}`,{field});
    output[field]=clone(value);
  }
  return output;
}
function projectViewer(input={}){return project(input,VIEWER_FIELDS)}
function projectPublic(input={}){return project(input,PUBLIC_FIELDS)}
function projectPreferences(input={}){return project(input,PREFERENCE_FIELDS)}
function sanitizeProfilePatch(patch={}){return sanitize(patch,PROFILE_WRITE_FIELDS,'PROFILE')}
function sanitizePreferencePatch(patch={}){return sanitize(patch,PREFERENCE_FIELDS,'PREFERENCE')}
function classifyPreferenceLayer(input={}){
  const source=String(input.source||input.provenance||'').toLowerCase();
  const status=String(input.status||'').toLowerCase();
  const observed=Boolean(input.observed===true||['observed','inferred','learned','signal'].some(token=>source.includes(token))||status==='inferred');
  return observed?'observed':'explicit';
}
function preferenceSummary(input={}){
  const value=input&&typeof input==='object'?input:{};
  const collections=['dietaryPreferences','travelInterests','travelStyles','activityPreferences','entertainmentPreferences','diningPreferences','mobilityPreferences','atmospherePreferences','accessibilityNeeds'];
  const selected=collections.reduce((total,field)=>total+(Array.isArray(value[field])?value[field].length:0),0);
  return Object.freeze({layer:'explicit',selected,completed:Boolean(value.preferencesCompletedAt),schemaVersion:Number(value.preferenceSchemaVersion||0)||null});
}
function completion(input={}){
  const value=input&&typeof input==='object'?input:{};
  const fields=[value.displayName,value.homeLocation,value.timezone,(value.dietaryPreferences||[]).length||1,(value.travelInterests||[]).length,(value.travelStyles||[]).length,(value.activityPreferences||[]).length,value.travelPace,value.budgetPreference];
  return Math.round(fields.filter(Boolean).length/fields.length*100);
}
function createIdentityState(initial={}){
  let state={...STATE_DEFAULTS,...clone(initial)};
  function normalize(next){
    return {...STATE_DEFAULTS,...clone(next),profile:next?.profile==null?null:clone(next.profile),error:next?.error||null};
  }
  function snapshot(){return immutable({...state,profile:state.profile==null?null:clone(state.profile)})}
  function replace(next={}){state=normalize(next);return snapshot()}
  function patch(next={}){state=normalize({...state,...next});return snapshot()}
  return Object.freeze({snapshot,replace,patch});
}

return Object.freeze({
  version:VERSION,runtimeVersion:RUNTIME_VERSION,viewerFields:VIEWER_FIELDS,publicFields:PUBLIC_FIELDS,
  profileWriteFields:PROFILE_WRITE_FIELDS,preferenceFields:PREFERENCE_FIELDS,preferenceLayers:PREFERENCE_LAYERS,
  projectViewer,projectPublic,projectPreferences,sanitizeProfilePatch,sanitizePreferencePatch,
  classifyPreferenceLayer,preferenceSummary,completion,createIdentityState
});
})();
