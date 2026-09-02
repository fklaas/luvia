'use strict';

const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module');

const edgeSource=fs.readFileSync('supabase/functions/booking-route-resolve/index.ts','utf8');
const uiSource=fs.readFileSync('core/booking/booking-ui.js','utf8');
const integrationSource=fs.readFileSync('core/booking/booking-integration.js','utf8');

function loadEdge(){
  let source=edgeSource.replace(/^import[^\n]+\n/,'').split('Deno.serve')[0];
  source+='\n;globalThis.__bookingRouteTest={discoverRoute,validateHandoff,venueIdentity,routeIdentityEvidence,venueMatch,hasVenueIdentifier,identityKey};';
  const context={console,URL,AbortController,DOMException,setTimeout,clearTimeout,fetch:null};
  context.globalThis=context;
  vm.runInNewContext(stripTypeScriptTypes(source,{mode:'transform'}),context,{filename:'booking-route-resolve.identity-test.js'});
  return context;
}

function response(url,{status=200,html='',contentType='text/html; charset=utf-8'}={}){
  return {
    status,
    ok:status>=200&&status<300,
    url,
    headers:{get(name){return String(name).toLowerCase()==='content-type'?contentType:null}},
    async text(){return html}
  };
}

function fetchMap(context,entries={}){
  const calls=[];
  context.fetch=async raw=>{
    const url=String(raw);calls.push(url);
    const found=entries[url];
    if(typeof found==='function')return found(url);
    return response(url,found||{status:404,html:'<title>Nicht gefunden</title>'});
  };
  return calls;
}

const edge=loadEdge();
const api=edge.__bookingRouteTest;

assert.equal(api.venueMatch('Beach Lounge','https://arosahotels.de/hotels/straubinger-grand-hotel','Straubinger Grand Hotel Bad Gastein'),false);
assert.equal(api.venueMatch('Grand SPA Resort A-ROSA Travemünde','https://arosahotels.de/hotels/straubinger-grand-hotel','Straubinger Grand Hotel Bad Gastein'),false);
assert.equal(api.venueMatch('Radisson Blu Senator Hotel Lübeck','https://www.booking.com/hotel/de/radisson-blu-senator-lubeck.html',''),true);
assert.equal(api.hasVenueIdentifier('https://booking.evil.example/book?id=42'),false,'a generic id query on an unknown domain is not venue identity');
assert.equal(api.hasVenueIdentifier('https://www.opentable.com/r/das-leo-scharbeutz'),true);
assert.equal(api.hasVenueIdentifier('https://www.booking.com/'),false,'a provider homepage is not a property route');

(async()=>{
  let calls=fetchMap(edge,{
    'https://arosahotels.de/beach-lounge':{html:'<title>Beach Lounge Scharbeutz</title><h1>Beach Lounge</h1><a href="https://arosahotels.de/hotels/straubinger-grand-hotel/zimmer">Reservierung prüfen</a>'},
    'https://arosahotels.de/hotels/straubinger-grand-hotel/zimmer':{html:'<title>Zimmer & Suiten im Straubinger Grand Hotel</title><h1>Straubinger Grand Hotel Bad Gastein</h1><p>Hotelzimmer buchen</p>'}
  });
  const wrongLounge=await api.discoverRoute({
    name:'Beach Lounge',placeType:'night_club',address:'Strandallee 130 (Seebrücke), 23683 Scharbeutz',providerPlaceId:'places/beach-lounge',website:'https://arosahotels.de/beach-lounge'
  });
  assert.equal(wrongLounge.resolved,false,'Beach Lounge must never inherit another A-ROSA property');
  assert(wrongLounge.rejected.some(item=>item.reason==='CONFLICTING_TARGET_PROPERTY'));
  assert(calls.includes('https://arosahotels.de/hotels/straubinger-grand-hotel/zimmer'));

  fetchMap(edge,{
    'https://arosahotels.de/travemuende':{html:'<title>Grand SPA Resort A-ROSA Travemünde</title><h1>A-ROSA Travemünde</h1><a href="https://arosahotels.de/hotels/straubinger-grand-hotel/zimmer">Zimmer buchen</a>'},
    'https://arosahotels.de/hotels/straubinger-grand-hotel/zimmer':{html:'<title>Straubinger Grand Hotel Bad Gastein</title><h1>Zimmer im Straubinger Grand Hotel</h1>'}
  });
  const wrongHotel=await api.discoverRoute({name:'Grand SPA Resort A-ROSA Travemünde',placeType:'hotel',address:'Außenallee 10, 23570 Travemünde',providerPlaceId:'places/arosa-travemuende',website:'https://arosahotels.de/travemuende'});
  assert.equal(wrongHotel.resolved,false,'one hotel property must not route to a sibling hotel');
  assert(wrongHotel.rejected.some(item=>item.reason==='CONFLICTING_TARGET_PROPERTY'));

  fetchMap(edge,{
    'https://arosahotels.de/travemuende':{html:'<title>Grand SPA Resort A-ROSA Travemünde</title><h1>A-ROSA Travemünde</h1><a href="https://arosahotels.de/travemuende/zimmer-buchen?property=travemuende">Zimmer und Preise</a>'},
    'https://arosahotels.de/travemuende/zimmer-buchen?property=travemuende':{html:'<title>A-ROSA Travemünde – Zimmer buchen</title><h1>Aufenthalt im A-ROSA Travemünde</h1><p>Check-in, Check-out und Preise</p>'}
  });
  const correctHotel=await api.discoverRoute({name:'Grand SPA Resort A-ROSA Travemünde',placeType:'hotel',address:'Außenallee 10, 23570 Travemünde',providerPlaceId:'places/arosa-travemuende',website:'https://arosahotels.de/travemuende'});
  assert.equal(correctHotel.resolved,true);
  assert.equal(correctHotel.identityVerified,true);
  assert.equal(correctHotel.value,'https://arosahotels.de/travemuende/zimmer-buchen?property=travemuende');

  fetchMap(edge,{
    'https://www.opentable.com/r/das-leo-scharbeutz':{status:403,html:''},
    'https://www.opentable.com/restref/client/?rid=123':{status:403,html:''},
    'https://www.thefork.de/restaurant/das-leo-r912345':{status:403,html:''},
    'https://www.booking.com/hotel/de/radisson-blu-senator-lubeck.html':{status:403,html:''},
    'https://www.eventim.de/event/tonfink-live-luebeck-12345':{status:403,html:''},
    'https://www.google.com/maps/reserve/v/dine/c/opaque-venue':{status:403,html:''},
    'https://www.booking.com/':{status:403,html:''},
    'https://www.booking.com/hotel/at/straubinger-grand-hotel-bad-gastein.html':{status:403,html:''},
    'https://booking.evil.example/book?id=42':{status:403,html:''}
  });
  const directCases=[
    [{name:'DAS LEO',placeType:'restaurant',providerPlaceId:'places/das-leo',reservationUrl:'https://www.opentable.com/r/das-leo-scharbeutz',reservationSource:'provider_place_details'},true,'opentable'],
    [{name:'DAS LEO',placeType:'restaurant',providerPlaceId:'places/das-leo',reservationUrl:'https://www.opentable.com/restref/client/?rid=123',reservationSource:'provider_place_details'},true,'opentable'],
    [{name:'DAS LEO',placeType:'restaurant',providerPlaceId:'places/das-leo',reservationUrl:'https://www.thefork.de/restaurant/das-leo-r912345',reservationSource:'provider_place_details'},true,'thefork'],
    [{name:'Radisson Blu Senator Hotel Lübeck',placeType:'hotel',providerPlaceId:'places/radisson-lubeck',reservationUrl:'https://www.booking.com/hotel/de/radisson-blu-senator-lubeck.html',reservationSource:'provider_place_details'},true,'bookingcom_affiliate'],
    [{name:'Tonfink Live',placeType:'nightlife',providerPlaceId:'places/tonfink',reservationUrl:'https://www.eventim.de/event/tonfink-live-luebeck-12345',reservationSource:'provider_place_details'},true,'eventim'],
    [{name:'DAS LEO',placeType:'restaurant',providerPlaceId:'places/das-leo',reservationUrl:'https://www.google.com/maps/reserve/v/dine/c/opaque-venue',reservationSource:'google_place_details'},true,'google_reserve'],
    [{name:'Radisson Blu Senator Hotel Lübeck',placeType:'hotel',providerPlaceId:'places/radisson-lubeck',reservationUrl:'https://www.booking.com/',reservationSource:'provider_place_details'},false,null],
    [{name:'Grand SPA Resort A-ROSA Travemünde',placeType:'hotel',providerPlaceId:'places/arosa-travemuende',reservationUrl:'https://www.booking.com/hotel/at/straubinger-grand-hotel-bad-gastein.html',reservationSource:'provider_place_details'},false,null],
    [{name:'Beach Lounge',placeType:'nightlife',providerPlaceId:'places/beach-lounge',reservationUrl:'https://booking.evil.example/book?id=42',reservationSource:'provider_place_details'},false,null]
  ];
  for(const [input,expected,provider] of directCases){
    const result=await api.discoverRoute(input);
    assert.equal(result.resolved,expected,`${input.name}: ${input.reservationUrl}`);
    assert.equal(result.identityVerified,expected,`${input.name}: identity proof`);
    if(provider)assert.equal(result.provider,provider);
  }

  fetchMap(edge,{'https://tonfink.de/':{html:'<title>Tonfink Lübeck</title><h1>Tonfink</h1><a href="mailto:reservierung@tonfink.de">Reservierung</a>'}});
  const email=await api.discoverRoute({name:'Tonfink',placeType:'night_club',address:'Große Burgstr. 46, 23552 Lübeck',providerPlaceId:'places/tonfink',website:'https://tonfink.de/'});
  assert.equal(email.resolved,true);
  assert.equal(email.channel,'email');
  assert.equal(email.value,'reservierung@tonfink.de');
  assert.equal(email.identityVerified,true);

  fetchMap(edge,{'https://arosahotels.de/':{html:'<title>A-ROSA Hotels & Resorts</title><h1>Unsere Hotels</h1><a href="mailto:booking@arosahotels.de">Booking</a>'}});
  const foreignEmail=await api.discoverRoute({name:'Beach Lounge',placeType:'nightlife',providerPlaceId:'places/beach-lounge',website:'https://arosahotels.de/'});
  assert.equal(foreignEmail.resolved,false);
  assert.equal(foreignEmail.reason,'OFFICIAL_WEBSITE_IDENTITY_MISMATCH');

  fetchMap(edge,{'https://www.opentable.com/r/custom-place':{status:403,html:''}});
  const custom=await api.discoverRoute({name:'Custom Place',placeType:'custom',providerPlaceId:'places/custom',reservationUrl:'https://www.opentable.com/r/custom-place',reservationSource:'provider_place_details'});
  assert.equal(custom.resolved,false);
  assert.equal(custom.reason,'PLACE_TYPE_NOT_BOOKABLE');

  assert.match(integrationSource,/providerPlaceId,/);
  assert.match(integrationSource,/reservationSource:/);
  assert.match(integrationSource,/address:clean\(place\.formattedAddress/);
  assert.match(edgeSource,/OFFICIAL_WEBSITE_IDENTITY_MISMATCH/);
  assert.match(edgeSource,/CONFLICTING_TARGET_PROPERTY/);
  assert.match(edgeSource,/ROUTE_PLACE_IDENTITY_MISMATCH|placeIdentityKey/);

  class Element {}
  const opened=[];
  const routeCalls=[];
  const document={documentElement:{},addEventListener(){},querySelectorAll(){return[]}};
  const key=place=>[
    String(place.providerPlaceId||place.id||'').replace(/^places\//,''),
    String(place.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(),
    String(place.address||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(),
    String(place.type||'').toLowerCase()
  ].join('|');
  const uiContext={
    console,URL,Element,document,setTimeout,clearTimeout,
    MutationObserver:class{observe(){}},queueMicrotask:fn=>fn(),
    LuviaOwnerFlowNavigationV1:{reserveBookingHandoff(){return{closed:false,close(){this.closed=true}}},openBooking(url){opened.push(url);return true}},
    LuviaBookingAdmissionCore:{resolve(){return{routes:[{kind:'official_link',value:'https://arosahotels.de/wrong',verified:true}]}}},
    LuviaBooking:{
      async resolvePlaceRoute(place){
        routeCalls.push({...place});
        if(place.name==='Legacy Route')return{resolved:true,channel:'external_link',provider:'opentable',value:'https://www.opentable.com/r/legacy'};
        if(place.name==='Wrong Identity')return{resolved:true,channel:'external_link',provider:'opentable',value:'https://www.opentable.com/r/other',identityVerified:true,placeIdentityKey:'another|venue||restaurant'};
        if(place.name==='Admission Only')return{resolved:false,reason:'NO_VERIFIED_ROUTE'};
        return{resolved:true,channel:'external_link',provider:'opentable',value:`https://www.opentable.com/r/${encodeURIComponent(place.name)}`,identityVerified:true,placeIdentityKey:key(place),reason:'VERIFIED_BOOKING_ROUTE'};
      },
      async recordPlaceHandoff(){}
    }
  };
  uiContext.window=uiContext;uiContext.globalThis=uiContext;
  vm.runInNewContext(uiSource,uiContext,{filename:'booking-ui.identity-test.js'});

  const exact={id:'exact',providerPlaceId:'exact',type:'restaurant',name:'Exact Venue',address:'Promenade 1, Lübeck'};
  let deferred=null;
  const deferredResult=await uiContext.LuviaBookingUI.openForPlace(exact,{reserveExternalWindow:false,deferExternalOpen:true,onExternalReady:value=>{deferred=value}});
  assert.equal(deferredResult.channel,'external_ready');
  assert.equal(deferredResult.opened,false);
  assert.equal(opened.length,0,'route resolution must not open a blank or provider tab by itself');
  assert.equal(typeof deferred?.open,'function');
  assert.equal((await deferred.open()).opened,true,'the deliberate provider-button action opens the exact route');
  assert.equal((await uiContext.LuviaBookingUI.openForPlace(exact,{reserveExternalWindow:true})).opened,true);
  assert.equal((await uiContext.LuviaBookingUI.openForPlace(exact,{reserveExternalWindow:true})).opened,true);
  assert.equal(routeCalls.filter(item=>item.name==='Exact Venue').length,1,'identical identity should reuse the short-lived cache');

  const changed={...exact,name:'Changed Venue'};
  assert.equal((await uiContext.LuviaBookingUI.openForPlace(changed,{reserveExternalWindow:true})).opened,true);
  assert.equal(routeCalls.filter(item=>item.providerPlaceId==='exact').length,2,'changed facts for one provider id must invalidate the old cache family');

  const nightlife=await uiContext.LuviaBookingUI.openForPlace({id:'tonfink',providerPlaceId:'tonfink',type:'bar',name:'Tonfink',address:'Große Burgstr. 46, Lübeck'},{reserveExternalWindow:true});
  assert.equal(nightlife.opened,true);
  assert.equal(routeCalls.find(item=>item.name==='Tonfink').type,'activity','nightlife must use the DB-supported activity booking type, never restaurant');

  const openedBefore=opened.length;
  for(const name of ['Legacy Route','Wrong Identity','Admission Only']){
    const result=await uiContext.LuviaBookingUI.openForPlace({id:name,providerPlaceId:name,type:'restaurant',name,address:'Testweg 1'},{reserveExternalWindow:true});
    assert.equal(result.opened,false,name);
  }
  assert.equal(opened.length,openedBefore,'legacy, mismatched and admission-only routes must stay closed');
  assert.equal(routeCalls.some(item=>item.name==='Admission Only'),true,'local admission links must still pass through Edge identity resolution');

  assert.match(uiSource,/ROUTE_CACHE_TTL_MS=5\*60\*1000/);
  assert.match(uiSource,/routeIdentityMatchesPlace/);
  assert.match(uiSource,/ROUTE_PLACE_IDENTITY_MISMATCH/);
  assert.match(uiSource,/typeof options\.onSubmitted==='function'/,'the Booking canvas must expose a post-submit owner receipt hook');
  assert.match(uiSource,/await window\.LuviaBooking\.sendEmail[\s\S]*options\.onSubmitted/,'Timeline projection must run only after the reservation request was sent');
  assert.doesNotMatch(uiSource,/localEmail\?/,'email admission must not bypass Edge identity resolution');

  console.log('M16.5 BLOCK 1 BOOKING ROUTE VENUE IDENTITY: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
