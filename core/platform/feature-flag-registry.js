(()=>{
'use strict';

const VERSION='1.0.0';

const OWNER_IDS=Object.freeze([
  'platform',
  'trip',
  'places',
  'booking',
  'media',
  'identity',
  'intelligence',
  'consumer',
  'social'
]);

const flags=new Map();
const listeners=new Set();

function normalize(def){
  if(!def?.id||!def?.owner){
    throw new Error(
      'LuviaFeatureFlagRegistry: id/owner required'
    );
  }

  const id=String(def.id).trim();
  const owner=String(def.owner).trim();

  if(!OWNER_IDS.includes(owner)){
    throw new Error(
      `LuviaFeatureFlagRegistry: invalid owner ${owner}`
    );
  }

  if(!/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/.test(id)){
    throw new Error(
      `LuviaFeatureFlagRegistry: invalid id ${id}`
    );
  }

  if(!id.startsWith(`${owner}.`)){
    throw new Error(
      `LuviaFeatureFlagRegistry: ${id} must use owner prefix ${owner}.`
    );
  }

  return Object.freeze({
    version:'1.0.0',
    id,
    owner,
    description:def.description==null?'':String(def.description),
    defaultEnabled:Boolean(def.defaultEnabled),
    temporary:def.temporary!==false
  });
}

function sameDefinition(a,b){
  return (
    a.id===b.id &&
    a.owner===b.owner &&
    a.description===b.description &&
    a.defaultEnabled===b.defaultEnabled &&
    a.temporary===b.temporary
  );
}

function notify(type,flag){
  const event=Object.freeze({
    type,
    flagId:flag.id,
    flag,
    at:new Date().toISOString()
  });

  listeners.forEach(fn=>{
    try{
      fn(event);
    }catch{}
  });

  try{
    window.dispatchEvent(
      new CustomEvent(
        'luvia:feature-flag',
        {detail:event}
      )
    );
  }catch{}
}

function register(def){
  const row=normalize(def);
  const existing=flags.get(row.id);

  if(existing){
    if(sameDefinition(existing,row)){
      return existing;
    }

    throw new Error(
      `LuviaFeatureFlagRegistry: conflicting definition for ${row.id}`
    );
  }

  flags.set(row.id,row);
  notify('registered',row);

  return row;
}

function get(id){
  return flags.get(id)||null;
}

function list(){
  return [...flags.values()];
}

function evaluate(id){
  const row=get(id);

  if(!row){
    return Object.freeze({
      id,
      known:false,
      enabled:false,
      owner:null,
      source:'unknown'
    });
  }

  return Object.freeze({
    id:row.id,
    known:true,
    enabled:row.defaultEnabled,
    owner:row.owner,
    source:'default'
  });
}

function isEnabled(id){
  return evaluate(id).enabled;
}

function byOwner(owner){
  return list().filter(
    row=>row.owner===owner
  );
}

function subscribe(fn){
  if(typeof fn!=='function'){
    throw new Error(
      'LuviaFeatureFlagRegistry: subscriber must be a function'
    );
  }

  listeners.add(fn);

  return ()=>{
    listeners.delete(fn);
  };
}

function snapshot(){
  return list().map(row=>Object.freeze({
    id:row.id,
    owner:row.owner,
    description:row.description,
    defaultEnabled:row.defaultEnabled,
    temporary:row.temporary,
    enabled:isEnabled(row.id)
  }));
}

function diagnostics(){
  const items=snapshot();

  return Object.freeze({
    version:VERSION,
    count:items.length,
    enabled:items.filter(
      item=>item.enabled
    ).length,
    disabled:items.filter(
      item=>!item.enabled
    ).length,
    temporary:items.filter(
      item=>item.temporary
    ).length,
    items
  });
}

window.LuviaFeatureFlagRegistry=Object.freeze({
  version:VERSION,
  owners:OWNER_IDS,
  register,
  get,
  list,
  evaluate,
  isEnabled,
  byOwner,
  subscribe,
  snapshot,
  diagnostics
});

})();