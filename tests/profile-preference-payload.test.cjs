/* Build 13.17.0 – dynamic Supabase payload and rollback test */
const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
async function main(){
 const storage=new Map(); let fail=false; let lastRpc=null; let savedPayload=null; let staleReads=0; let cloudPayload=null;
 const user={id:'11111111-1111-1111-1111-111111111111',email:'fabian@example.test',user_metadata:{display_name:'Fabian'}};
 const client={async rpc(name,payload){if(name!=='luvia_get_my_profile'){lastRpc={name,payload};savedPayload=payload;cloudPayload=payload}if(fail&&name!=='luvia_get_my_profile')return{data:null,error:new Error('rpc failed')};const value=name==='luvia_get_my_profile'&&staleReads>0?(staleReads--,{...cloudPayload,p_travel_interests:[]}):(payload||cloudPayload||savedPayload||{});const completedAt=name==='luvia_get_my_profile'&&value.p_preferences_completed_at?String(value.p_preferences_completed_at).replace(/\.000Z$/,'+00:00'):value.p_preferences_completed_at;return{error:null,data:{user_id:user.id,display_name:value.p_display_name,dietary_preferences:value.p_dietary_preferences,travel_interests:value.p_travel_interests,travel_styles:value.p_travel_styles,activity_preferences:value.p_activity_preferences,entertainment_preferences:value.p_entertainment_preferences,dining_preferences:value.p_dining_preferences,mobility_preferences:value.p_mobility_preferences,atmosphere_preferences:value.p_atmosphere_preferences,travel_pace:value.p_travel_pace,budget_preference:value.p_budget_preference,family_preferences:value.p_family_preferences?{travelingWithChildren:true,needs:value.p_family_preferences.needs,stroller:false}:value.p_family_preferences,accessibility_preferences:value.p_accessibility_preferences,preference_schema_version:value.p_preference_schema_version,preferences_completed_at:completedAt,preferences_updated_at:value.p_preferences_updated_at,settings:value.p_settings,theme_mode:value.p_theme_mode}}}};
 const window={dispatchEvent(){},ParisAuth:{getState(){return{authenticated:true,user,session:{user}}}},LuviaSupabaseService:{async start(){return client}}};
 const context=vm.createContext({window,console,Date,Math,Object,Array,Set,Map,JSON,String,Number,Boolean,Intl,structuredClone,setTimeout,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail}}});
 vm.runInContext(fs.readFileSync('core/identity/identity-domain-contract-core.js','utf8'),context);
 window.LuviaIdentityDomainContractCoreV1=context.LuviaIdentityDomainContractCoreV1;
 window.LuviaIdentityPlatformWebPorts={
  StoragePort:{get:(key,fallback=null)=>storage.has(key)?storage.get(key):fallback,set:(key,value)=>storage.set(key,value),remove:key=>storage.delete(key)},
  AuthSessionPort:{snapshot:()=>window.ParisAuth.getState(),requireSession:async()=>({user})}
 };
 vm.runInContext(fs.readFileSync('core/preferences/preference-schema.js','utf8'),context);
 vm.runInContext(fs.readFileSync('core/profiles/profile-service.js','utf8'),context);
 const api=window.LuviaProfileService;
 const completed='2026-08-03T12:00:00.000Z';
 staleReads=2;
 await api.save({displayName:'Fabian',dietaryPreferences:['vegetarian'],travelInterests:['culture'],travelStyles:['romantic'],activityPreferences:['outdoor'],entertainmentPreferences:['live_music'],diningPreferences:['cafe'],mobilityPreferences:['rail'],atmospherePreferences:['relaxed'],travelPace:'relaxed',budgetPreference:'medium',familyPreferences:{needs:['baby']},accessibilityPreferences:{needs:['step_free']},preferenceSchemaVersion:3,preferencesCompletedAt:completed});
 assert.strictEqual(lastRpc.name,'luvia_upsert_my_profile_v2');
 const payload=lastRpc.payload;
 for(const key of ['p_dietary_preferences','p_travel_interests','p_travel_styles','p_activity_preferences','p_entertainment_preferences','p_dining_preferences','p_mobility_preferences','p_atmosphere_preferences','p_travel_pace','p_budget_preference','p_family_preferences','p_accessibility_preferences','p_preference_schema_version','p_preferences_completed_at','p_preferences_updated_at'])assert(Object.prototype.hasOwnProperty.call(payload,key),`RPC payload missing ${key}`);
 assert.deepStrictEqual(Array.from(payload.p_dietary_preferences),['vegetarian']);
 assert.strictEqual(payload.p_preference_schema_version,3);
 assert.strictEqual(staleReads,0,'bounded cloud verification must retry a briefly stale read');
 assert.strictEqual(api.snapshot().error,null,'equivalent PostgreSQL timestamp and JSONB key serialization must pass the durable roundtrip check');
 const beforeMismatch=api.snapshot().profile; staleReads=10;
 await assert.rejects(()=>api.save({travelInterests:['nature']}),/PROFILE_CLOUD_ROUNDTRIP_MISMATCH/);
 assert.deepStrictEqual(Array.from(api.snapshot().profile.travelInterests),Array.from(beforeMismatch.travelInterests),'a persistent cloud mismatch must still roll the profile back');
 const before=api.snapshot().profile; fail=true;
 await assert.rejects(()=>api.save({dietaryPreferences:['vegan']}),/rpc failed/);
 assert.deepStrictEqual(Array.from(api.snapshot().profile.dietaryPreferences),Array.from(before.dietaryPreferences),'profile cache did not roll back after RPC failure');
 console.log('Profile Supabase payload and rollback: OK');
}
main().catch(error=>{console.error(error);process.exit(1)});
