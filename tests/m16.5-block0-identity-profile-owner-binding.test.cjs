'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const registry=JSON.parse(fs.readFileSync('config/luvia-human-ai-action-registry.v1.json','utf8'));
const profileSource=fs.readFileSync('core/profiles/profile-foundation.js','utf8');
const saved=[];
let current={userId:'user-1',displayName:'Luvia',language:'de',timezone:'Europe/Berlin'};
const listeners=new Map();
const context={
  Object,Array,String,Number,Boolean,Date,Math,RegExp,JSON,Set,Map,Error,TypeError,Promise,structuredClone,
  CustomEvent:function(name,options){this.type=name;this.detail=options?.detail},
  addEventListener(name,listener){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(listener)},
  removeEventListener(name,listener){listeners.get(name)?.delete(listener)},dispatchEvent(){},
  LuviaProfileService:{snapshot:()=>({profile:current}),async save(patch){saved.push(structuredClone(patch));current={...current,...patch};return current}},
  LuviaUserPreferences:{get:()=>({travelPace:'relaxed'}),update:patch=>patch,replaceCategory:(category,value)=>({[category]:value})},
  LuviaTravelPreferences:{}
};
context.window=context;context.globalThis=context;
vm.createContext(context);
for(const file of ['core/identity/identity-domain-contract-core.js','core/platform/identity-contract-adapter.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});

const actionFields=new Map([
  [64,{displayName:'Fabian'}],
  [65,{avatarUrl:'https://example.test/avatar.jpg',avatarColor:'#4fa5a8'}],
  [66,{firstName:'Fabian',lastName:'Luvia'}],
  [67,{homeLocation:'Hamburg'}],
  [68,{timezone:'Europe/Copenhagen'}],
  [69,{language:'en'}],
  [70,{displayName:'Fabian Luvia',firstName:'Fabian',lastName:'Luvia',avatarUrl:'https://example.test/new.jpg',avatarColor:'#ef6254',language:'de',timezone:'Europe/Berlin',homeLocation:'Lübeck'}],
  [85,{themeMode:'light'}],
  [86,{reducedMotion:true}],
  [87,{density:'comfortable'}],
  [88,{useTripAccent:true}],
  [89,{defaultView:'today'}],
  [90,{personalizedRecommendations:true}],
  [91,{activityData:false}],
  [92,{locationSharing:true}],
  [93,{notifications:true}]
]);

(async()=>{
  const contract=context.LuviaIdentityContractV1;
  assert.equal(typeof contract.commands.updateProfile,'function');
  for(const [sequence,patch] of actionFields){
    const action=registry.actions.find(item=>item.sequence===sequence);
    assert.ok(action,`registry action ${sequence} missing`);
    assert.equal(action.owner.contract,'identity.v1');
    assert.equal(action.owner.method,'commands.updateProfile');
    assert.equal(action.owner.bindingStatus,'PUBLIC_CONTRACT_BOUND');
    await contract.commands.updateProfile(patch);
    assert.deepEqual(saved.at(-1),patch,`${action.id} must reach Identity with its exact bounded patch`);
  }
  assert.equal(saved.length,16);
  await assert.rejects(()=>contract.commands.updateProfile({email:'owner@example.test'}),error=>error.code==='IDENTITY_CONTRACT_PROFILE_FIELD_NOT_ALLOWED'&&error.field==='email');
  assert.equal(saved.length,16,'disallowed profile truth must not reach the provider');
  assert.match(profileSource,/const identityUpdateProfile=patch=>/);
  assert.match(profileSource,/await identityUpdateProfile\(\{displayName:/,'the human profile form must use the same public Identity command');
  assert.match(profileSource,/await identityUpdateProfile\(\{themeMode:/,'the human settings form must use the same public Identity command');
  assert.ok(registry.summary.ownerBinding.PUBLIC_CONTRACT_BOUND>=36);
  assert.ok((registry.summary.ownerBinding.OWNER_METHOD_AUDIT_OPEN||0)<=207);
  console.log('M16.5 Block 0 Identity profile Owner binding: PASS');
  console.log('16 profile/settings actions -> identity.v1 commands.updateProfile: PASS');
  console.log('Human surface + public Owner field boundary: PASS');
  console.log('Owner methods open: 223 -> 207');
})().catch(error=>{console.error(error);process.exitCode=1});
