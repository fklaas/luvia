var LuviaNavigationContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='navigation.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const DEFAULT_ROUTE='today';

function clone(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clone(item)]));
}
function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function definition(value){return immutable(clone(value))}
function text(value,fallback=''){return String(value??fallback).trim()}
function decode(value){try{return decodeURIComponent(String(value||'').replace(/\+/g,' '))}catch{return String(value||'')}}
function encode(value){return encodeURIComponent(String(value??''))}
function parsePairs(value){
  return Object.fromEntries(text(value).replace(/^[?#]/,'').split('&').filter(Boolean).map(part=>{
    const index=part.indexOf('=');
    return index<0?[decode(part),'']:[decode(part.slice(0,index)),decode(part.slice(index+1))];
  }));
}
function sanitizeParams(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return Object.freeze({});
  const entries=Object.entries(value).filter(([key,item])=>key&&item!=null&&['string','number','boolean'].includes(typeof item)).slice(0,30);
  return immutable(Object.fromEntries(entries.map(([key,item])=>[text(key).slice(0,80),typeof item==='string'?item.slice(0,500):item])));
}

const ROUTES=Object.freeze([
  {id:'today',label:'Heute',icon:'🏠',description:'Tagesbriefing und das Wichtigste für heute.',surface:'dashboard',topLevel:true,mount:{mode:'inline',key:'dashboard'}},
  {id:'plan',label:'Planen',icon:'✨',description:'Orte, Timeline, Checklisten und Reisevorbereitung.',surface:'planning',topLevel:true,mount:{mode:'hub',key:'plan'}},
  {id:'trip',label:'Reise',icon:'🧳',description:'Tagesverlauf, Teilnehmer und besuchte Orte.',surface:'trip',topLevel:true,mount:{mode:'hub',key:'trip'}},
  {id:'memories',label:'Erinnerungen',icon:'📸',description:'Fotos, Alben, Reisebuch und Revue.',surface:'memories',topLevel:true,mount:{mode:'hub',key:'memories'}},
  {id:'more',label:'Mehr',icon:'•••',description:'Profil, Reisekompass und Einstellungen.',surface:'more',topLevel:true,mount:{mode:'hub',key:'more'}},
  {id:'places',label:'Places',surface:'places',mount:{mode:'module',key:'places',targetId:'places-module',owner:'places'}},
  {id:'places-lifecycle',label:'Meine Orte',surface:'places',mount:{mode:'module',key:'places-lifecycle',targetId:'places-lifecycle-module',owner:'places'}},
  {id:'routes',label:'Routen',surface:'routing',mount:{mode:'inline',key:'routes',owner:'consumer'}},
  {id:'gallery',label:'Fotogalerie',surface:'media',mount:{mode:'module',key:'gallery',targetId:'gallery-module',owner:'media'}},
  {id:'albums',label:'Memory Albums',surface:'memories',mount:{mode:'module',key:'albums',targetId:'albums-module',owner:'media'}},
  {id:'bookings',label:'Buchungen',surface:'booking',mount:{mode:'module',key:'bookings',targetId:'bookings-module',owner:'booking'}},
  {id:'control-center',label:'Control Center',surface:'control-center',mount:{mode:'module',key:'control-center',targetId:'control-center-home',owner:'consumer'}},
  {id:'control-center-identity',label:'Identität & Datenschutz',surface:'identity',mount:{mode:'module',key:'control-center-identity',targetId:'identity-center',owner:'identity'}},
  {id:'control-center-bookings',label:'Booking Control Center',surface:'booking',mount:{mode:'module',key:'control-center-bookings',targetId:'booking-control-center',owner:'booking'}},
  {id:'control-center-inbox',label:'Booking Inbox',surface:'booking',mount:{mode:'module',key:'control-center-inbox',targetId:'booking-inbox',owner:'booking'}},
  {id:'profile-onboarding',label:'Dein Reisekompass',surface:'identity',mount:{mode:'fullscreen',key:'profile-onboarding',owner:'identity'}},
  {id:'first-trip-composer',label:'Erste Reise',surface:'trip',mount:{mode:'fullscreen',key:'first-trip-composer',owner:'trip'}}
].map(definition));

const ROUTE_MAP=Object.freeze(Object.fromEntries(ROUTES.map(route=>[route.id,route])));
const ALIASES=Object.freeze({
  dashboard:'today',home:'today',move:'plan',mobility:'plan',journey:'trip',photos:'gallery',
  identity:'control-center-identity','booking-control':'control-center-bookings','booking-inbox':'control-center-inbox'
});

function routeToken(input){
  if(input&&typeof input==='object')input=input.route??input.view??input.screen??input.id;
  let value=text(input).toLowerCase();
  if(!value)return'';
  value=value.replace(/^luvia:\/\//,'').replace(/^https?:\/\/[^/]+/,'');
  if(value.includes('?')||value.includes('#'))return'';
  value=value.replace(/^\/+|\/+$/g,'').replace(/^app\//,'').replace(/^screen\//,'');
  return decode(value);
}
function normalize(input,fallback=DEFAULT_ROUTE){
  const token=routeToken(input);
  const candidate=ALIASES[token]||token;
  if(ROUTE_MAP[candidate])return candidate;
  const safeFallback=ALIASES[text(fallback).toLowerCase()]||text(fallback).toLowerCase();
  return ROUTE_MAP[safeFallback]?safeFallback:DEFAULT_ROUTE;
}
function get(input){
  const token=routeToken(input);
  return ROUTE_MAP[ALIASES[token]||token]||null;
}
function listRoutes(){return immutable(ROUTES.map(clone))}
function items(){return immutable(ROUTES.filter(route=>route.topLevel).map(route=>({id:route.id,label:route.label,icon:route.icon,description:route.description})))}
function createIntent(input,options={}){
  const route=normalize(input,options.fallback);
  return immutable({
    kind:'screen.navigate',
    contractId:CONTRACT_ID,
    version:VERSION,
    route,
    surface:ROUTE_MAP[route].surface,
    params:sanitizeParams(options.params),
    source:text(options.source,'app').slice(0,80),
    replace:Boolean(options.replace),
    requiresDomainCommand:false
  });
}
function fromUrl(input,options={}){
  const raw=text(input);
  const hashIndex=raw.indexOf('#');
  const queryIndex=raw.indexOf('?');
  const queryEnd=hashIndex>=0?hashIndex:raw.length;
  const query=queryIndex>=0?parsePairs(raw.slice(queryIndex+1,queryEnd)):{};
  const hash=hashIndex>=0?parsePairs(raw.slice(hashIndex+1)):{};
  const path=raw.slice(0,Math.min(...[queryIndex,hashIndex].filter(index=>index>=0).concat(raw.length)));
  const pathToken=path.replace(/^https?:\/\/[^/]+/,'').split('/').filter(Boolean).pop()||'';
  const candidate=query.screen||query.view||query.route||hash.screen||hash.view||hash.route||hash.module||pathToken;
  const params={...query,...hash};
  delete params.screen;delete params.view;delete params.route;delete params.module;
  return createIntent(candidate,{...options,params:{...params,...(options.params||{})},source:options.source||'deep-link'});
}
function resolve(input,options={}){
  if(typeof input==='string'&&(/[?#]/.test(input)||/^https?:\/\//i.test(input)||/^luvia:\/\//i.test(input)))return fromUrl(input,options);
  if(input&&typeof input==='object')return createIntent(input,{...options,params:{...(input.params||{}),...(options.params||{})},source:options.source||input.source,replace:options.replace??input.replace});
  return createIntent(input,options);
}
function toDeepLink(input,options={}){
  const intent=resolve(input,options);
  const query=Object.entries(intent.params).map(([key,value])=>`${encode(key)}=${encode(value)}`);
  return `luvia://screen/${encode(intent.route)}${query.length?`?${query.join('&')}`:''}`;
}
function diagnostics(){
  return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,defaultRoute:DEFAULT_ROUTE,routes:ROUTES.map(route=>route.id),topLevel:items().map(item=>item.id),aliases:{...ALIASES},browserless:true,domainTruth:false});
}

return Object.freeze({
  contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,defaultRoute:DEFAULT_ROUTE,
  normalize,get,listRoutes,items,createIntent,fromUrl,resolve,toDeepLink,diagnostics
});
})();
