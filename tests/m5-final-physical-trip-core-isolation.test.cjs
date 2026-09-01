'use strict';

const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const read=f=>
  fs.readFileSync(
    f,
    'utf8'
  );

const core=
  read(
    'core/trips/trip-state-core.js'
  );

const adapter=
  read(
    'core/trips/trip-store.js'
  );

const html=
  read(
    'index.html'
  );

const sw=
  read(
    'sw.js'
  );

for(const [label,re] of [
  ['window',/\bwindow\b/],
  ['document',/\bdocument\b/],
  ['localStorage',/\blocalStorage\b/],
  ['sessionStorage',/\bsessionStorage\b/],
  ['navigator',/\bnavigator\b/],
  ['CustomEvent',/\bCustomEvent\b/],
  ['dispatchEvent',/\bdispatchEvent\b/],
  ['fetch',/\bfetch\s*\(/],
  ['supabase',/\bsupabase\b/i]
]){
  assert.strictEqual(
    (core.match(re)||[]).length,
    0,
    'Physical Trip State Core must be browserless: '+
    label
  );
}

for(const token of [
  'let state=',
  'function snapshot()',
  'function initialize(',
  'function reconcileLegacy(',
  'function upsert(',
  'function setActive(',
  'function replaceRemote(',
  'function mergeRemote(',
  'function mergeTrip(',
  'function subscribe('
]){
  assert(
    core.includes(token),
    'Physical core missing '+
    token
  );
}

assert(
  adapter.includes(
    'LuviaTripStateCoreV1'
  )
);

assert(
  !/let\s+state\s*=/.test(
    adapter
  ),
  'Web adapter owns Trip state'
);

assert(
  !adapter.includes(
    'function mergeTrip('
  )
);

for(const token of [
  'window.LuviaTripStore=Object.freeze',
  'web.LuviaTripStateReaderV1=Object.freeze',
  'LuviaStorage',
  'LuviaLegacyParisMigrator',
  'LuviaLegacyParisCloud',
  'CustomEvent'
]){
  assert(
    adapter.includes(token),
    'Adapter missing '+
    token
  );
}

const c={
  console
};

vm.createContext(c);

vm.runInContext(
  core,
  c
);

const api=
  c.LuviaTripStateCoreV1;

const state=
  api.create({
    now:
      ()=>
        '2026-08-22T05:00:00.000Z'
  });

state.initialize({
  trips:[
    {
      id:'a',
      title:'A',
      destination:{
        name:'Paris',
        country:'FR'
      }
    },
    {
      id:'b',
      title:'B',
      destination:{
        name:'Berlin',
        country:'DE'
      }
    }
  ],
  activeTripId:'a'
});

state.upsert({
  id:'a',
  title:'A2',
  destination:{
    name:''
  }
});

assert.strictEqual(
  state.snapshot()
    .activeTrip
    .destination
    .name,
  'Paris'
);

state.setActive(
  'b',
  {
    touch:false
  }
);

assert.strictEqual(
  state.snapshot().activeTripId,
  'b'
);

state.replaceRemote([
  {
    id:'a',
    title:'Cloud',
    destination:{
      name:'Paris',
      country:'FR'
    }
  }
]);

assert.strictEqual(
  state.snapshot().trips.length,
  1
);

const log=[];

const storageState={
  trips:[
    {
      id:'local',
      title:'Local',
      destination:{
        name:'Hamburg',
        country:'DE'
      }
    }
  ],
  activeTripId:'local',
  migration:null
};

const storage={
  keys:{
    trips:'trips',
    activeTripId:'activeTripId',
    migration:'migration'
  },

  get(k,f){
    return k===this.keys.trips
      ?storageState.trips
      :f;
  },

  set(k,v){
    if(k===this.keys.trips){
      storageState.trips=v;
    }

    if(k===this.keys.migration){
      storageState.migration=v;
    }
  },

  getText(k,f){
    return k===this.keys.activeTripId
      ?storageState.activeTripId
      :f;
  },

  setText(k,v){
    if(k===this.keys.activeTripId){
      storageState.activeTripId=v;
    }
  },

  remove(k){
    if(k===this.keys.activeTripId){
      storageState.activeTripId=null;
    }
  }
};

class CE{
  constructor(
    type,
    o={}
  ){
    this.type=type;
    this.detail=o.detail;
  }
}

const web={
  LuviaStorage:storage,

  LuviaLegacyParisMigrator:{
    readLegacy(){
      return{
        trips:[],
        activeTripId:null
      };
    },

    normalize:
      x=>({...x}),

    mirror(){},

    toLegacy:
      x=>({...x})
  },

  LuviaLegacyParisCloud:{
    async listTrips(){
      return[
        {
          id:'cloud',
          title:'Cloud',
          destination:{
            name:'Kiel',
            country:'DE'
          }
        }
      ];
    },

    async saveProfile(){}
  },

  dispatchEvent:
    e=>log.push(
      'window:'+
      e.type
    )
};

const ctx={
  console,
  window:web,

  document:{
    dispatchEvent:
      e=>log.push(
        'document:'+
        e.type
      )
  },

  CustomEvent:CE
};

vm.createContext(ctx);

vm.runInContext(
  core,
  ctx
);

vm.runInContext(
  adapter,
  ctx
);

web.LuviaTripStore.initialize({
  silent:true
});

assert.strictEqual(
  web.LuviaTripStore
    .snapshot()
    .activeTripId,
  'local'
);

assert(
  storageState.migration?.source===
  'legacy/paris'
);

assert.deepStrictEqual(
  Object.keys(
    web.LuviaTripStateReaderV1
  ).sort(),
  [
    'snapshot',
    'subscribe'
  ]
);

(async()=>{
  await web
    .LuviaTripStore
    .loadRemote({});

  assert.strictEqual(
    web.LuviaTripStore
      .snapshot()
      .activeTripId,
    'cloud'
  );

  assert(
    log.includes(
      'window:luvia:trips-changed'
    )
  );

  assert(
    log.includes(
      'document:luvia:trip-context-changed'
    )
  );

  const a=
    html.indexOf(
      'core/trips/trip-state-core.js?v=13.82.128'
    );

  const b=
    html.indexOf(
      'core/trips/trip-store.js?v=13.82.128'
    );

  assert(
    a>=0&&
    a<b
  );

  assert(
    sw.includes(
      "'core/trips/trip-state-core.js'"
    )
  );

  console.log(
    'M5 Final Physical Trip Core Isolation: PASS'
  );

  console.log(
    'Physical Trip State Core browser tokens: 0'
  );

  console.log(
    'Web adapter owns Trip state: NO'
  );

  console.log(
    'TripStateReaderV1: READ-ONLY'
  );
})()
.catch(
  e=>{
    console.error(e);
    process.exitCode=1;
  }
);
