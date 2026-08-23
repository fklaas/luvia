var LuviaTodayCompositionCoreV1=(()=>{
'use strict';

const CONTRACT_ID='consumer.today-composition.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const PHASES=Object.freeze({
  planning:Object.freeze({label:'Reise gestalten',tone:'planning'}),
  before:Object.freeze({label:'Vorfreude',tone:'upcoming'}),
  during:Object.freeze({label:'Unterwegs',tone:'live'}),
  after:Object.freeze({label:'Erinnerungen',tone:'complete'})
});
const LEVEL_PRIORITY=Object.freeze({blocked:0,action_required:1,warning:2,attention:3,info:4,resolved:5});
const ALLOWED_ROUTES=Object.freeze(new Set(['plan','places','control-center','control-center-bookings','control-center-inbox','more']));

function text(value,fallback=''){return String(value??fallback).trim()}
function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function hourOf(clock={}){
  const explicit=Number(clock.hour);
  if(Number.isFinite(explicit))return Math.max(0,Math.min(23,Math.trunc(explicit)));
  const parsed=new Date(clock.now||Date.now());
  return Number.isNaN(parsed.getTime())?12:parsed.getHours();
}
function greeting(hour){if(hour<5)return'Gute Nacht';if(hour<11)return'Guten Morgen';if(hour<18)return'Guten Tag';return'Guten Abend'}
function firstName(viewer={}){return text(viewer.displayName||viewer.name).split(/\s+/).filter(Boolean)[0]||''}
function phaseCopy(phase,trip){
  const destination=text(trip.destination,'eure Reise');
  if(phase==='before')return`${destination} rückt näher.`;
  if(phase==='during')return`${destination} gehört heute euch.`;
  if(phase==='after')return`${destination} bleibt bei euch.`;
  return destination==='eure Reise'?'Eure Reise nimmt Form an.':`${destination} nimmt Form an.`;
}
function normalizeAction(action){
  const route=text(action?.view||action?.route);
  return ALLOWED_ROUTES.has(route)?immutable({kind:'navigate',route,label:text(action?.label,'Öffnen')}):null;
}
function normalizeAttention(items=[]){
  return (Array.isArray(items)?items:[])
    .map((item,index)=>({
      id:text(item?.id,`attention-${index+1}`),
      source:text(item?.source,'system'),
      level:Object.hasOwn(LEVEL_PRIORITY,text(item?.level))?text(item.level):'info',
      title:text(item?.title,'Hinweis'),
      message:text(item?.message),
      action:normalizeAction(item?.action)
    }))
    .filter(item=>item.level!=='resolved')
    .sort((a,b)=>LEVEL_PRIORITY[a.level]-LEVEL_PRIORITY[b.level]||a.title.localeCompare(b.title,'de'))
    .slice(0,3)
    .map(immutable);
}
function quickActions(phase){
  const first=phase==='during'
    ?{id:'discover-now',kind:'navigate',route:'places',label:'Orte für jetzt'}
    :{id:'shape-plan',kind:'navigate',route:'plan',label:'Reise weiterplanen'};
  return immutable([
    first,
    {id:'open-attention',kind:'navigate',route:'control-center',label:'Alles im Blick'},
    {id:'ask-luvia',kind:'assistant',label:'Mit Luvia planen',prompt:'Hilf mir beim besten nächsten Schritt für diese Reise.'}
  ]);
}
function compose(input={}){
  const trip=input.trip||{};
  const travel=input.travel||{};
  const viewer=input.viewer||{};
  const phase=PHASES[text(travel.phase)]?text(travel.phase):'planning';
  const phaseDefinition=PHASES[phase];
  const name=firstName(viewer);
  const attention=normalizeAttention(input.attention?.items);
  const actionRequired=attention.filter(item=>['blocked','action_required','warning'].includes(item.level)).length;
  const online=input.network?.online!==false;
  const tripDay=Number.isFinite(Number(travel.tripDay))&&Number(travel.tripDay)>0?Math.trunc(Number(travel.tripDay)):null;
  const state=!online?'offline':actionRequired?'attention':'ready';
  const status=actionRequired
    ?`${actionRequired} ${actionRequired===1?'Punkt braucht':'Punkte brauchen'} eure Aufmerksamkeit.`
    :online?'Luvia hat eure wichtigsten Reisebereiche im Blick.':'Offline bereit – gespeicherte Reiseansichten bleiben verfügbar.';
  const phaseLabel=phase==='during'&&tripDay?`Reisetag ${tripDay}`:phaseDefinition.label;
  return immutable({
    contractId:CONTRACT_ID,
    version:VERSION,
    runtimeVersion:RUNTIME_VERSION,
    state,
    greeting:`${greeting(hourOf(input.clock))}${name?`, ${name}`:''}.`,
    headline:phaseCopy(phase,trip),
    summary:text(trip.dateRange)||'Zeitraum noch offen',
    context:Object.freeze({phase,tone:phaseDefinition.tone,label:phaseLabel,tripTitle:text(trip.title,'Unsere Reise'),destination:text(trip.destination,'Reiseziel offen'),symbol:text(trip.symbol,'✦')}),
    status:Object.freeze({online,actionRequired,totalAttention:attention.length,message:status}),
    attention,
    quickActions:quickActions(phase),
    provenance:Object.freeze({trip:'trip.v1 read-only projection',attention:'consumer attention read model',journeyTimeline:'reserved read-only projection outside this composition',domainTruth:false})
  });
}
function diagnostics(){return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserless:true,domainTruth:false,journeyTimelineOwner:false,allowedNavigationRoutes:[...ALLOWED_ROUTES]})}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,compose,diagnostics});
})();
