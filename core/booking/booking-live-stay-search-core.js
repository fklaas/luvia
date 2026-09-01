(function(root){
'use strict';

const VERSION='1.0.0-fail-closed-live-stay-search';
const PROVIDERS=Object.freeze(['amadeus_hotels','hotelbeds']);
const clean=value=>String(value??'').trim();
const validDate=value=>{const match=clean(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!match)return false;const date=new Date(Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3])));return date.getUTCFullYear()===Number(match[1])&&date.getUTCMonth()===Number(match[2])-1&&date.getUTCDate()===Number(match[3])};
const boundedInteger=(value,min,max,fallback)=>{const number=Number(value);return Number.isInteger(number)&&number>=min&&number<=max?number:fallback};
function immutable(value){if(value==null||typeof value!=='object')return value;if(Array.isArray(value))return Object.freeze(value.map(immutable));return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])))}
function error(code,message,extra={}){return Object.assign(new Error(message),{code,...extra})}

function normalizeQuery(input={}){
  const profile=root.LuviaBookingAccommodationCore?.normalizeProfile?.(input)||input;
  const providerDestinationIds=input.providerDestinationIds&&typeof input.providerDestinationIds==='object'?input.providerDestinationIds:{};
  const latitude=Number(input.latitude??input.location?.latitude),longitude=Number(input.longitude??input.location?.longitude);
  return immutable({
    bookingType:'hotel',
    tripId:clean(input.tripId)||null,
    destination:clean(input.destination||input.destinationName)||null,
    cityCode:clean(input.cityCode).toUpperCase()||null,
    latitude:Number.isFinite(latitude)&&latitude>=-90&&latitude<=90?latitude:null,
    longitude:Number.isFinite(longitude)&&longitude>=-180&&longitude<=180?longitude:null,
    providerDestinationIds:immutable(Object.fromEntries(Object.entries(providerDestinationIds).map(([key,value])=>[clean(key).toLowerCase(),clean(value)]).filter(([key,value])=>key&&value))),
    providerHotelIds:immutable(input.providerHotelIds&&typeof input.providerHotelIds==='object'?input.providerHotelIds:{}),
    checkIn:clean(profile.checkIn),checkOut:clean(profile.checkOut),
    adults:boundedInteger(profile.adults,1,100,1),children:boundedInteger(profile.children,0,30,0),rooms:boundedInteger(profile.rooms,1,30,1),
    childAges:immutable((profile.childAges||[]).map(Number).filter(age=>Number.isInteger(age)&&age>=0&&age<=17).slice(0,boundedInteger(profile.children,0,30,0))),
    currency:clean(profile.currency||input.currency).toUpperCase().slice(0,3)||'EUR',
    roomType:clean(profile.roomType)||null,board:clean(profile.board)||null,
    cancellationPreference:clean(profile.cancellationPreference)||null,paymentPreference:clean(profile.paymentPreference)||null,
    amenities:immutable([...(profile.amenities||[])].map(clean).filter(Boolean).slice(0,40)),
    accessibility:immutable([...(profile.accessibility||[])].map(clean).filter(Boolean).slice(0,40)),
    providers:immutable([...(input.providers||PROVIDERS)].map(value=>clean(value).toLowerCase()).filter(value=>PROVIDERS.includes(value)).filter((value,index,list)=>list.indexOf(value)===index)),
  });
}

function validateQuery(input={}){
  const query=normalizeQuery(input),issues=[];
  if(!validDate(query.checkIn))issues.push({code:'required',path:'checkIn',message:'Ein gültiges Check-in-Datum fehlt.'});
  if(!validDate(query.checkOut))issues.push({code:'required',path:'checkOut',message:'Ein gültiges Check-out-Datum fehlt.'});
  if(validDate(query.checkIn)&&validDate(query.checkOut)&&query.checkOut<=query.checkIn)issues.push({code:'conflict',path:'checkOut',message:'Check-out muss nach dem Check-in liegen.'});
  if(query.children!==query.childAges.length)issues.push({code:'required',path:'childAges',message:'Für jedes Kind wird ein Alter benötigt.'});
  if(!query.cityCode&&query.latitude==null&&!query.providerDestinationIds.hotelbeds&&!Object.keys(query.providerHotelIds||{}).length)issues.push({code:'required',path:'destination',message:'Für Livepreise fehlt eine Provider-Zielkennung oder eine belegte Zielkoordinate.'});
  if(!query.providers.length)issues.push({code:'required',path:'providers',message:'Es wurde kein unterstützter Livepreis-Provider ausgewählt.'});
  return immutable({valid:issues.length===0,query,issues});
}

function safeProviderResult(raw={}){
  const providerId=clean(raw.providerId||raw.provider).toLowerCase();
  const state=clean(raw.state||(raw.ok===true?'succeeded':'failed')).toLowerCase();
  const offers=Array.isArray(raw.offers)?raw.offers:[];
  const trusted=PROVIDERS.includes(providerId)&&raw.ok===true&&raw.source==='provider_api'&&raw.live===true;
  return immutable({providerId:PROVIDERS.includes(providerId)?providerId:null,ok:trusted,state:trusted?'succeeded':state||'failed',expected:raw.expected===true,error:trusted?null:(clean(raw.error)||'PROVIDER_RESULT_NOT_LIVE'),offers:trusted?offers.map(offer=>({...offer,providerId,isLive:true,source:'provider_api'})):[],observedAt:clean(raw.observedAt||raw.quotedAt)||null,latencyMs:Number.isFinite(Number(raw.latencyMs))?Number(raw.latencyMs):null});
}

function buildResult(input={},providerResults=[]){
  const validation=validateQuery(input);
  if(!validation.valid)throw error('BOOKING_STAY_SEARCH_INPUT_INVALID','Für den Hotelpreisvergleich fehlen eindeutige Reisedaten.',{issues:validation.issues});
  const results=(Array.isArray(providerResults)?providerResults:[]).map(safeProviderResult).filter(result=>result.providerId);
  const attempted=[...new Set(results.map(result=>result.providerId))],succeeded=results.filter(result=>result.ok).map(result=>result.providerId),failed=results.filter(result=>!result.ok).map(result=>result.providerId);
  const offers=results.flatMap(result=>result.offers);
  const decisionCore=root.LuviaBookingStayDecisionCore;
  if(typeof decisionCore?.buildDecision!=='function')throw error('BOOKING_STAY_DECISION_CORE_UNAVAILABLE','Der Booking-Entscheidungs-Core ist nicht verfügbar.');
  const decision=decisionCore.buildDecision(offers,validation.query,{attempted,succeeded,failed});
  const unavailable=results.filter(result=>!result.ok).map(result=>({providerId:result.providerId,expected:result.expected,error:result.error}));
  return immutable({...decision,search:{version:VERSION,status:succeeded.length?'live':'fit_only',requestedProviders:validation.query.providers,attempted,succeeded,failed,unavailable,observedAt:results.map(result=>result.observedAt).filter(Boolean).sort().at(-1)||null},invariants:{...decision.invariants,providerEnvelopeMustBeAuthenticatedGatewayOutput:true,unconnectedProviderCannotContributeOffers:true,providerFailureCannotBecomeEmptyMarketClaim:true}});
}

async function search(input={},transport){
  const validation=validateQuery(input);
  if(!validation.valid)throw error('BOOKING_STAY_SEARCH_INPUT_INVALID','Für den Hotelpreisvergleich fehlen eindeutige Reisedaten.',{issues:validation.issues});
  if(typeof transport!=='function')throw error('BOOKING_STAY_SEARCH_TRANSPORT_UNAVAILABLE','Das öffentliche Hotelpreis-Gateway ist nicht verbunden.');
  const response=await transport(validation.query);
  const providerResults=Array.isArray(response?.providerResults)?response.providerResults:[];
  return buildResult(validation.query,providerResults);
}

function diagnostics(){
  const fitOnly=buildResult({checkIn:'2027-06-12',checkOut:'2027-06-14',adults:2,children:0,rooms:1,currency:'EUR',cityCode:'BER',providers:['amadeus_hotels','hotelbeds']},[
    {providerId:'amadeus_hotels',ok:false,expected:true,error:'PARTNER_REQUIRED',offers:[]},
    {providerId:'hotelbeds',ok:false,expected:true,error:'PARTNER_REQUIRED',offers:[]},
  ]);
  return immutable({version:VERSION,status:'ready',browserless:true,providers:PROVIDERS,failClosed:fitOnly.productMode==='fit_only'&&!fitOnly.claims.priceRankingAvailable});
}

root.LuviaBookingLiveStaySearchCore=Object.freeze({version:VERSION,providers:PROVIDERS,normalizeQuery,validateQuery,safeProviderResult,buildResult,search,diagnostics});
})(this);
