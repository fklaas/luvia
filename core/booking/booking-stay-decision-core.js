(function(root){
'use strict';

const VERSION='1.1.0-property-offer-identity';
const clean=value=>String(value??'').trim();
const numberOrNull=value=>Number.isFinite(Number(value))?Number(value):null;
const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,Number(value)||0));
const freezeList=list=>Object.freeze(list.map(item=>Object.freeze(item)));
const isoDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(clean(value))?clean(value):null;
const norm=value=>clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const safeHttps=value=>{const url=clean(value);return /^https:\/\/[^\s/?#]+(?:[/?#]|$)/i.test(url)?url:null};
const nullableScore=value=>value===null||value===undefined||value===''?null:clamp(value);
function fingerprint(value){const source=clean(value);let hash=2166136261;for(let index=0;index<source.length;index++){hash^=source.charCodeAt(index);hash=Math.imul(hash,16777619)}return`fnv1a-${(hash>>>0).toString(16).padStart(8,'0')}`}

function sumKnown(values){
  return values.every(value=>value!==null)?values.reduce((sum,value)=>sum+value,0):null;
}

function normalizePrice(raw={}){
  const currency=clean(raw.currency||'EUR').toUpperCase();
  const reportedTotal=numberOrNull(raw.totalPrice??raw.total_price??raw.total);
  const base=numberOrNull(raw.basePrice??raw.base_price);
  const taxes=numberOrNull(raw.taxes);
  const fees=numberOrNull(raw.mandatoryFees??raw.mandatory_fees??raw.fees);
  const propertyCharges=numberOrNull(raw.mandatoryAtProperty??raw.mandatory_at_property);
  const calculated=sumKnown([base,taxes,fees,propertyCharges]);
  const total=reportedTotal!==null?reportedTotal:calculated;
  const completeness=reportedTotal!==null&&raw.totalIncludesMandatoryCharges===true
    ?'all_in_verified'
    :(calculated!==null?'calculated_complete':'incomplete');
  return Object.freeze({currency,total,reportedTotal,base,taxes,fees,propertyCharges,completeness,comparable:total!==null&&total>=0&&completeness!=='incomplete'});
}

function normalizeCancellation(raw={}){
  const refundable=raw.refundable===true?true:raw.refundable===false?false:null;
  const freeUntil=isoDate(raw.freeCancellationUntil??raw.free_cancellation_until);
  const penalty=numberOrNull(raw.penaltyAmount??raw.penalty_amount);
  const prepaymentRequired=raw.prepaymentRequired===true?true:raw.prepaymentRequired===false?false:null;
  const score=(refundable===true?0.55:0)+(freeUntil?0.25:0)+(prepaymentRequired===false?0.2:0);
  return Object.freeze({refundable,freeUntil,penalty,prepaymentRequired,flexibility:clamp(score)});
}

function propertyIdentity(raw={}){
  const existing=raw.propertyIdentity||raw.property_identity;if(existing?.key)return Object.freeze({...existing,key:clean(existing.key).toLowerCase()});
  const explicit=clean(raw.canonicalPropertyId||raw.canonical_property_id);
  if(explicit)return Object.freeze({key:`canonical:${explicit.toLowerCase()}`,method:'canonical_property_id',confidence:'verified',crossProvider:true,canonicalPropertyId:explicit.toLowerCase()});
  const name=norm(raw.propertyName||raw.property_name||raw.hotelName||raw.hotel_name);
  const address=norm(raw.address||raw.formattedAddress||raw.formatted_address);
  const lat=numberOrNull(raw.latitude??raw.lat),lng=numberOrNull(raw.longitude??raw.lng);
  const geo=lat!==null&&lng!==null?`${lat.toFixed(4)},${lng.toFixed(4)}`:'';
  if(name&&address)return Object.freeze({key:`address:${name}|${address}`,method:'exact_name_address',confidence:'high',crossProvider:true,canonicalPropertyId:null});
  if(name&&geo)return Object.freeze({key:`geo:${name}|${geo}`,method:'exact_name_geo',confidence:'high',crossProvider:true,canonicalPropertyId:null});
  const providerId=clean(raw.providerId||raw.provider_id).toLowerCase(),providerHotelId=clean(raw.providerHotelId||raw.provider_hotel_id||raw.propertyId||raw.property_id);
  if(providerId&&providerHotelId)return Object.freeze({key:`provider:${providerId}:${providerHotelId.toLowerCase()}`,method:'provider_property_id',confidence:'provider_scoped',crossProvider:false,canonicalPropertyId:null});
  return Object.freeze({key:null,method:'unresolved',confidence:'none',crossProvider:false,canonicalPropertyId:null});
}
function propertyKey(raw={}){return propertyIdentity(raw).key}

function normalizeOffer(raw={},query={}){
  const price=normalizePrice(raw.price||raw);
  const cancellation=normalizeCancellation(raw.cancellation||raw);
  const checkIn=isoDate(raw.checkIn??raw.check_in??query.checkIn??query.check_in);
  const checkOut=isoDate(raw.checkOut??raw.check_out??query.checkOut??query.check_out);
  const adults=Math.max(0,Number(raw.adults??query.adults??0)||0);
  const children=Math.max(0,Number(raw.children??query.children??0)||0);
  const rooms=Math.max(0,Number(raw.rooms??query.rooms??0)||0);
  const exactStay=Boolean(checkIn&&checkOut&&checkIn===isoDate(query.checkIn??query.check_in)&&checkOut===isoDate(query.checkOut??query.check_out));
  const exactParty=adults===Number(query.adults||0)&&children===Number(query.children||0)&&rooms===Number(query.rooms||0);
  const exactCurrency=price.currency===clean(query.currency||price.currency).toUpperCase();
  const identity=propertyIdentity(raw),key=identity.key;
  const rateSignature=clean(raw.rateSignature||raw.rate_signature)||[
    norm(raw.roomCode||raw.room_code||raw.roomName||raw.room_name||'room-unspecified'),
    norm(raw.board||raw.mealPlan||raw.meal_plan||'board-unspecified'),
    norm(raw.bedConfiguration||raw.bed_configuration||'bed-unspecified'),
    `${adults}a-${children}c-${rooms}r`,
  ].join('|');
  const freshnessMinutes=numberOrNull(raw.freshnessMinutes??raw.freshness_minutes);
  const stale=freshnessMinutes===null?null:freshnessMinutes>15;
  const source=clean(raw.source).toLowerCase(),isLive=raw.isLive===true&&source==='provider_api';
  const fit=Object.freeze({
    preference:nullableScore(raw.preferenceFit??raw.preference_fit),
    locationFit:nullableScore(raw.locationFit??raw.location_fit),
    amenities:nullableScore(raw.amenitiesFit??raw.amenities_fit),
    accessibility:nullableScore(raw.accessibilityFit??raw.accessibility_fit),
    reliability:nullableScore(raw.providerReliability??raw.provider_reliability),
  });
  const fitValues=[fit.preference,fit.locationFit,fit.amenities,fit.accessibility].filter(value=>value!==null),fitEvidenceCount=fitValues.length;
  const fitAverage=fitEvidenceCount?fitValues.reduce((sum,value)=>sum+value,0)/fitEvidenceCount:null;
  const comparable=Boolean(key&&price.comparable&&exactStay&&exactParty&&exactCurrency&&stale!==true&&isLive);
  return Object.freeze({
    offerId:clean(raw.offerId||raw.offer_id)||null,
    providerId:clean(raw.providerId||raw.provider_id).toLowerCase()||null,
    providerHotelId:clean(raw.providerHotelId||raw.provider_hotel_id||raw.propertyId||raw.property_id)||null,
    providerOfferId:clean(raw.providerOfferId||raw.provider_offer_id)||null,
    canonicalPropertyId:identity.canonicalPropertyId,propertyKey:key,propertyIdentity:identity,
    propertyName:clean(raw.propertyName||raw.property_name||raw.hotelName||raw.hotel_name)||'Unterkunft',
    roomName:clean(raw.roomName||raw.room_name)||null,rateSignature,
    board:clean(raw.board||raw.mealPlan||raw.meal_plan)||null,
    checkIn,checkOut,adults,children,rooms,price,cancellation,fit,fitAverage,fitEvidenceCount,
    freshnessMinutes,stale,available:raw.available===true,comparable,isLive,source,
    providerRateKey:clean(raw.providerRateKey||raw.provider_rate_key)||null,bookingAuthority:clean(raw.bookingAuthority||raw.booking_authority)||null,
    quotedAt:clean(raw.quotedAt||raw.quoted_at)||null,quoteExpiresAt:clean(raw.quoteExpiresAt||raw.quote_expires_at)||null,
    bookingUrlVerified:raw.bookingUrlVerified===true||raw.booking_url_verified===true,
    bookingUrlPropertyId:clean(raw.bookingUrlPropertyId||raw.booking_url_property_id)||null,
    deepLink:safeHttps(raw.deepLink||raw.deep_link||raw.bookingUrl||raw.booking_url),
    commission:raw.commission??raw.affiliateCommission??null,
    rejectionReasons:Object.freeze([
      !key?'PROPERTY_IDENTITY_MISSING':null,
      !price.comparable?'TOTAL_PRICE_INCOMPLETE':null,
      !exactStay?'STAY_NOT_IDENTICAL':null,
      !exactParty?'OCCUPANCY_NOT_IDENTICAL':null,
      !exactCurrency?'CURRENCY_NOT_IDENTICAL':null,
      stale===true?'QUOTE_STALE':null,
      !isLive?'LIVE_PROVIDER_EVIDENCE_MISSING':null,
    ].filter(Boolean)),
  });
}

function byTotal(a,b){return a.price.total-b.price.total||b.fit.reliability-a.fit.reliability;}
function byFlexibility(a,b){return b.cancellation.flexibility-a.cancellation.flexibility||byTotal(a,b);}
function byFit(a,b){return (b.fitAverage??-1)-(a.fitAverage??-1)||byTotal(a,b);}

function createOfferHandoff(rawOffer={},query={}){
  const offer=normalizeOffer(rawOffer,query),issues=[];
  if(!offer.available||!offer.comparable)issues.push(...(!offer.available?['OFFER_NOT_AVAILABLE']:offer.rejectionReasons));
  if(!offer.providerId)issues.push('PROVIDER_ID_MISSING');
  if(!offer.providerHotelId)issues.push('PROVIDER_PROPERTY_ID_MISSING');
  if(!offer.offerId)issues.push('OFFER_ID_MISSING');
  if(!offer.providerRateKey&&!offer.providerOfferId)issues.push('PROVIDER_RATE_ID_MISSING');
  if(!offer.deepLink)issues.push('BOOKING_URL_MISSING');
  if(!offer.bookingUrlVerified)issues.push('BOOKING_URL_IDENTITY_UNVERIFIED');
  if(offer.bookingUrlPropertyId!==offer.providerHotelId)issues.push('BOOKING_URL_PROPERTY_MISMATCH');
  const valid=issues.length===0,quoteFingerprint=valid?fingerprint([offer.providerId,offer.providerHotelId,offer.offerId,offer.providerRateKey||offer.providerOfferId,offer.propertyKey,offer.checkIn,offer.checkOut,offer.adults,offer.children,offer.rooms,offer.price.currency,offer.price.total,offer.quotedAt||''].join('|')):null;
  return Object.freeze({
    contractId:'booking.stay-offer-handoff.v1',valid,issues:Object.freeze([...new Set(issues)]),
    payload:valid?Object.freeze({tripId:clean(query.tripId)||null,propertyKey:offer.propertyKey,canonicalPropertyId:offer.canonicalPropertyId,propertyName:offer.propertyName,propertyIdentity:offer.propertyIdentity,providerId:offer.providerId,providerHotelId:offer.providerHotelId,offerId:offer.offerId,providerOfferId:offer.providerOfferId,providerRateKey:offer.providerRateKey,quoteFingerprint,quotedAt:offer.quotedAt,quoteExpiresAt:offer.quoteExpiresAt,checkIn:offer.checkIn,checkOut:offer.checkOut,adults:offer.adults,children:offer.children,rooms:offer.rooms,roomName:offer.roomName,board:offer.board,totalPrice:offer.price.total,currency:offer.price.currency,totalIncludesMandatoryCharges:offer.price.completeness!=='incomplete',bookingUrl:offer.deepLink,bookingAuthority:offer.bookingAuthority||'provider_api'}):null,
    userConfirmationRequired:true,commissionExcludedFromSelection:true
  });
}

function buildDecision(rawOffers=[],query={},providerRun={}){
  const offers=(Array.isArray(rawOffers)?rawOffers:[]).map(offer=>normalizeOffer(offer,query));
  const comparable=offers.filter(offer=>offer.available&&offer.comparable);
  const groups=new Map();
  for(const offer of comparable){
    if(!groups.has(offer.propertyKey))groups.set(offer.propertyKey,[]);
    groups.get(offer.propertyKey).push(offer);
  }
  const hotels=[...groups.entries()].map(([key,items])=>{
    const prices=[...items].sort(byTotal);
    const flexible=[...items].sort(byFlexibility);
    const rateMap=new Map();
    for(const item of items){if(!rateMap.has(item.rateSignature))rateMap.set(item.rateSignature,[]);rateMap.get(item.rateSignature).push(item);}
    const comparableProviderRates=[...rateMap.entries()].map(([rateSignature,rates])=>Object.freeze({
      rateSignature,
      offers:Object.freeze([...rates].sort(byTotal)),
      providerCount:new Set(rates.map(rate=>rate.providerId).filter(Boolean)).size,
      cheapest:[...rates].sort(byTotal)[0],
    })).filter(group=>group.providerCount>1);
    return Object.freeze({propertyKey:key,propertyName:items[0].propertyName,offerCount:items.length,bestAvailableTotal:prices[0],bestFlexibleOffer:flexible[0],comparableProviderRates:Object.freeze(comparableProviderRates),providers:Object.freeze([...new Set(items.map(item=>item.providerId).filter(Boolean))])});
  }).sort((a,b)=>byTotal(a.bestAvailableTotal,b.bestAvailableTotal));
  const cheapest=[...comparable].sort(byTotal)[0]||null;
  const flexible=[...comparable].filter(offer=>offer.cancellation.refundable===true).sort(byFlexibility)[0]||null;
  const fitting=[...comparable].filter(offer=>offer.fitEvidenceCount>0).sort(byFit)[0]||null;
  const attempted=[...new Set((providerRun.attempted||[]).map(clean).filter(Boolean))];
  const succeeded=[...new Set((providerRun.succeeded||[]).map(clean).filter(Boolean))];
  const failed=[...new Set((providerRun.failed||[]).map(clean).filter(Boolean))];
  const liveProviders=[...new Set(comparable.map(offer=>offer.providerId).filter(Boolean))];
  const productMode=comparable.length===0?'fit_only':(liveProviders.length===1?'single_source_live_prices':'cross_source_live_prices');
  return Object.freeze({
    version:VERSION,
    productMode,
    query:Object.freeze({...query}),
    hotels:freezeList(hotels),
    recommendations:Object.freeze({cheapestComparable:cheapest,bestFlexible:flexible,bestPersonalFit:fitting}),
    excluded:freezeList(offers.filter(offer=>!offer.comparable||!offer.available).map(offer=>({offerId:offer.offerId,providerId:offer.providerId,reasons:offer.available?offer.rejectionReasons:['NOT_AVAILABLE']}))),
    coverage:Object.freeze({attempted:Object.freeze(attempted),succeeded:Object.freeze(succeeded),failed:Object.freeze(failed),claim:'CONNECTED_AUTHORIZED_SOURCES_ONLY',allMarketPriceGuarantee:false}),
    claims:Object.freeze({priceRankingAvailable:comparable.length>0,crossSourcePriceComparisonAvailable:liveProviders.length>1,bestMarketPrice:false,liveProviderCount:liveProviders.length}),
    explanation:Object.freeze({
      cheapestComparable:'Niedrigster vollständiger Gesamtpreis für exakt dieselben Reisedaten und dieselbe Belegung.',
      bestFlexible:'Beste belegte Stornierbarkeit; bei Gleichstand entscheidet der vollständige Gesamtpreis.',
      bestPersonalFit:fitting?'Beste belegte Passung aus Profil, Lage, Ausstattung und Barrierefreiheit; Provisionen zählen nicht.':'Eine persönliche Empfehlung wird erst mit belegten Profil-, Lage-, Ausstattungs- oder Barrierefreiheitsmerkmalen angezeigt.',
    }),
    invariants:Object.freeze({livePriceRequiredForPriceRanking:true,affiliateLinkAloneCannotRankPrice:true,likeForLikeProviderPriceOnly:true,mandatoryChargesIncluded:true,commissionExcludedFromRanking:true,oneHotelCanContainManyProviderOffers:true,noAllMarketGuarantee:true,bookingTruthRemainsWithProvider:true,userConfirmationRequired:true,personalFitRequiresEvidence:true,selectedOfferIdentityRequired:true}),
  });
}

function diagnostics(){
  const decision=buildDecision([
    {offerId:'a',providerId:'broad-a',canonicalPropertyId:'hotel-1',propertyName:'Seehotel',checkIn:'2027-06-12',checkOut:'2027-06-14',adults:2,children:0,rooms:1,totalPrice:300,currency:'EUR',totalIncludesMandatoryCharges:true,available:true,isLive:true,source:'provider_api',refundable:false,providerReliability:.9},
    {offerId:'b',providerId:'broad-b',canonicalPropertyId:'hotel-1',propertyName:'Seehotel',checkIn:'2027-06-12',checkOut:'2027-06-14',adults:2,children:0,rooms:1,totalPrice:320,currency:'EUR',totalIncludesMandatoryCharges:true,available:true,isLive:true,source:'provider_api',refundable:true,freeCancellationUntil:'2027-06-10',prepaymentRequired:false,providerReliability:.9},
  ],{checkIn:'2027-06-12',checkOut:'2027-06-14',adults:2,children:0,rooms:1},{attempted:['broad-a','broad-b'],succeeded:['broad-a','broad-b']});
  return Object.freeze({version:VERSION,status:'ready',hotelCards:decision.hotels.length,offers:decision.hotels[0]?.offerCount||0,cheapest:decision.recommendations.cheapestComparable?.offerId,flexible:decision.recommendations.bestFlexible?.offerId,invariants:decision.invariants});
}

root.LuviaBookingStayDecisionCore=Object.freeze({version:VERSION,normalizePrice,normalizeCancellation,propertyIdentity,propertyKey,normalizeOffer,createOfferHandoff,buildDecision,diagnostics});
})(this);
