(() => {
  'use strict';
  const VERSION='4.19.1';
  const ownerCore=window.LuviaIntelligenceDomainContractCoreV1;
  if(!ownerCore)throw new Error('INTELLIGENCE_DOMAIN_CORE_REQUIRED');
  const tools=new Map();
  const clone=value=>{try{return value==null?value:JSON.parse(JSON.stringify(value))}catch{return null}};
  function register(definition={}){
    if(!definition.name||typeof definition.read!=='function')throw new Error('AI_TOOL_INVALID');
    const canonical=ownerCore.getTool(definition.name)||{};
    const tool=Object.freeze({...canonical,...definition,mode:canonical.mode||definition.mode||'READ',domain:canonical.domain||definition.domain||'global',inputSchema:definition.inputSchema||{type:'object',additionalProperties:true},trust:canonical.trust||definition.trust||'core'});
    tools.set(tool.name,tool);return tool;
  }
  register({name:'trip.current',read:()=>window.LuviaTripContractV1?.getActiveTrip?.()||null});
  register({name:'preferences.current',read:()=>window.LuviaIdentityContractV1?.getPreferences?.('self')||{}});
  register({name:'travel.context',read:()=>window.LuviaTravelContext?.snapshot?.()||{}});
  register({name:'places.saved',read:()=>window.LuviaPlacesContractV1?.snapshot?.()||{places:[]}});
  register({name:'schedule.current',read:()=>window.LuviaScheduleIntelligence?.snapshot?.()||{}});
  register({name:'today.current',read:()=>window.LuviaTodayIntelligence?.snapshot?.()||{}});
  register({name:'recommendations.current',read:()=>window.LuviaRecommendations?.snapshot?.()||{}});
  register({name:'journey.context',read:args=>window.LuviaJourneyKnowledgeGraph?.load?.({force:Boolean(args?.force)})||{}});
  register({name:'journey.events',read:async args=>(await window.LuviaJourneyKnowledgeGraph?.load?.({force:Boolean(args?.force)}))?.events||[]});
  register({name:'journey.reservations',read:async args=>(await window.LuviaJourneyKnowledgeGraph?.load?.({force:Boolean(args?.force)}))?.reservations||[]});
  register({name:'journey.evidence',read:async args=>(await window.LuviaJourneyKnowledgeGraph?.load?.({force:Boolean(args?.force)}))?.evidence||[]});
  register({name:'memory.signals',read:async()=>{await window.LuviaAIMemory?.load?.();return window.LuviaAIMemory?.snapshot?.()||{signals:[]}}});
  async function invoke(name,args={}){const tool=tools.get(name);if(!tool)throw new Error(`AI_TOOL_NOT_FOUND:${name}`);return clone(await tool.read(args))}
  async function collect(names=[],args={}){const result={};for(const name of names){try{result[name]=await invoke(name,args)}catch(error){result[name]={unavailable:true,reason:error?.message||String(error)}}}return result}
  function list(){return[...tools.values()].map(({read,...definition})=>definition)}
  function diagnostics(){return{version:VERSION,count:tools.size,tools:list(),ownerCore:ownerCore.runtimeVersion}}
  window.LuviaAITools=Object.freeze({version:VERSION,register,invoke,collect,list,diagnostics});
})();
