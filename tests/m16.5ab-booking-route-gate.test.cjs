const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

const read=file=>fs.readFileSync(file,'utf8');
const ui=read('core/booking/booking-ui.js');
const sheet=read('app/journey/journey-suggestion-sheet.js');
const css=read('app/journey/journey-day-composer.css');
const uiManager=read('core/ui/ui-manager.js');
const bookingCss=read('core/booking/booking-ui.css');
const integration=read('core/booking/booking-integration.js');
const email=read('core/booking/booking-email-v2.js');
const communication=read('core/booking/booking-communication-contract.js');
const edge=read('supabase/functions/booking-email-send/index.ts');

assert.match(ui,/function externalTarget\(route\)/);
assert.match(ui,/\['external_link','affiliate'\]\.includes\(route\.channel\)/);
assert.match(ui,/if\(target\)\{[\s\S]*openBooking\(target,\{reserved\}\)[\s\S]*channel:'external_link'/);
assert.match(ui,/if\(route\.resolved&&route\.channel==='email'&&route\.value\)\{[\s\S]*await open\(place,route,options\)[\s\S]*channel:'email_canvas'/);
assert.match(ui,/Der E-Mail-Canvas darf nur für einen verifizierten E-Mail-Fallback geöffnet werden/);
assert.doesNotMatch(ui,/(?:window|document)\.addEventListener\('keydown'/,'Booking must not become a second global keyboard owner');
assert.doesNotMatch(ui,/owner_canvas_fallback/);
assert.match(ui,/channel:'unavailable'/);
assert.ok(ui.indexOf('const target=externalTarget(route)')<ui.indexOf("route.resolved&&route.channel==='email'"),'Provider gate must precede email canvas gate');

assert.match(sheet,/admission\.action\.label/);
assert.match(sheet,/const admissionFor=/,'all admission notices must come from the Booking Owner');
assert.doesNotMatch(sheet,/const isBookable=place=>\['food','cafe'\]\.includes/,'the consumer must not keep restaurant-only booking policy');
assert.match(sheet,/reserveExternalWindow:false/);
assert.match(sheet,/deferExternalOpen:true/);
assert.match(sheet,/onExternalReady:showExternalReady/);
assert.match(sheet,/sheetHost=handle\.overlay\.querySelector\('\[data-journey-suggestion-sheet\]'\)/);
assert.match(sheet,/host:sheetHost,onBack:restore/);
assert.match(sheet,/closeOnEscape:false/);
assert.match(sheet,/mounted\.overlay\.addEventListener\('keydown'[\s\S]*Zurück zu den Vorschlägen/);
assert.match(sheet,/paintResults\(handle,result,selectedId,viewState\)/);
assert.match(sheet,/data-lvjs-booking=.*?\.focus\(\)/);
assert.match(sheet,/onExternal:/);
assert.match(sheet,/onUnavailable:/);
for(const category of ['food','cafe','sightseeing','culture','nature','activities','wellness','nightlife','shopping','places'])assert.ok(css.includes(`data-suggestion-category="${category}"`),`missing Compass spectrum category ${category}`);
assert.match(uiManager,/@keyframes luvia-living-sheet-enter/);
assert.match(uiManager,/animation:luvia-living-sheet-enter \.62s cubic-bezier\(\.16,1,\.3,1\)/);
assert.match(bookingCss,/Verified-email fallback canvas/);
assert.match(bookingCss,/@keyframes lv-booking-inline-in/);
assert.match(bookingCss,/\.lv-booking-canvas\{display:block;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;padding-bottom:72px\}/);
assert.match(bookingCss,/\.lv-booking-dialog\.is-inline \.lv-booking-actions\{position:absolute;left:16px;right:16px;bottom:/);

assert.match(integration,/occasion:clean\(input\.occasion\)/);
assert.match(integration,/legacyNote=.*Anlass:/);
assert.match(email,/legacyNote=.*Anlass:/);
assert.match(edge,/legacyPrefix=.*Anlass:/);
assert.match(edge,/rawNote\.startsWith\(legacyPrefix\)/);

class Element {}
const routeCalls=[];
const opened=[];
const handoffs=[];
const reserved=[];
const document={documentElement:{},addEventListener(){},querySelectorAll(){return[]}};
const context={
  console,URL,Element,document,
  MutationObserver:class{observe(){}},
  queueMicrotask:fn=>fn(),
  setTimeout,clearTimeout,
  LuviaOwnerFlowNavigationV1:{
    reserveBookingHandoff(){const handle={closed:false,close(){this.closed=true}};reserved.push(handle);return handle},
    openBooking(url,{reserved:handle}={}){opened.push({url,handle});return true}
  },
  LuviaBooking:{
    async resolvePlaceRoute(place){routeCalls.push(place);if(place.id==='provider')return{resolved:true,channel:'external_link',provider:'opentable',value:'https://www.opentable.com/r/provider-venue',reason:'VERIFIED_BOOKING_ROUTE',identityVerified:true,placeIdentityKey:'provider|provider venue||restaurant'};return{resolved:false,channel:null,value:null,reason:'NO_VERIFIED_ROUTE'}},
    async recordPlaceHandoff(place,route){handoffs.push({place,route})}
  }
};
context.window=context;context.globalThis=context;
vm.runInNewContext(ui,context,{filename:'booking-ui.js'});

const communicationContext={console};
communicationContext.window=communicationContext;communicationContext.globalThis=communicationContext;
vm.runInNewContext(communication,communicationContext,{filename:'booking-communication-contract.js'});
const composed=communicationContext.LuviaBookingCommunicationContract.compose({
  title:'Café Beispiel',type:'restaurant',partySize:3,startAt:'2026-08-24T13:30:00.000Z',
  request:{requesterName:'Luvia Testperson',occasion:'Geburtstag',note:'Ruhiger Tisch am Fenster.'}
});
assert.equal((composed.bodyText.match(/Anlass: Geburtstag/g)||[]).length,1,'occasion must appear exactly once in the booking email');
assert.match(composed.bodyText,/Hinweis: Ruhiger Tisch am Fenster\./);
const legacyComposed=communicationContext.LuviaBookingCommunicationContract.compose({
  title:'Café Beispiel',type:'restaurant',partySize:3,startAt:'2026-08-24T13:30:00.000Z',
  request:{requesterName:'Luvia Testperson',occasion:'Geburtstag',note:'Anlass: Geburtstag\nRuhiger Tisch am Fenster.'}
});
assert.equal((legacyComposed.bodyText.match(/Anlass: Geburtstag/g)||[]).length,1,'legacy compatibility must not duplicate the occasion');

(async()=>{
  const provider=await context.LuviaBookingUI.openForPlace({id:'provider',providerPlaceId:'provider',type:'restaurant',name:'Provider Venue'},{reserveExternalWindow:true});
  assert.equal(provider.opened,true);
  assert.equal(provider.channel,'external_link');
  assert.equal(provider.provider,'opentable');
  assert.equal(opened.length,1);
  assert.equal(opened[0].url,'https://www.opentable.com/r/provider-venue');
  assert.equal(handoffs.length,1);
  assert.equal(reserved[0].closed,false,'reserved provider handoff must be consumed, not closed before navigation');

  let unavailableState=null;
  const unavailable=await context.LuviaBookingUI.openForPlace({id:'none',providerPlaceId:'none',type:'restaurant',name:'No Route Venue'},{reserveExternalWindow:true,onUnavailable:value=>{unavailableState=value}});
  assert.equal(unavailable.opened,false);
  assert.equal(unavailable.channel,'unavailable');
  assert.equal(unavailable.reason,'NO_VERIFIED_ROUTE');
  assert.equal(reserved[1].closed,true,'unused placeholder must close when no provider route exists');
  assert.equal(unavailableState.route.reason,'NO_VERIFIED_ROUTE');
  assert.equal(opened.length,1,'unavailable route must not open a destination');
  assert.equal(routeCalls.length,2);
  console.log('M16.5AB BOOKING ROUTE GATE: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
