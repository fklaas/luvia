var LuviaPlaceStateCoreV1=(()=>{
'use strict';

const VERSION='1';

function create({
  validate=place=>({
    valid:Boolean(place?.id),
    errors:place?.id?[]:['id fehlt']
  }),
  normalize=(place)=>place,
  now=()=>new Date().toISOString()
}={}){
  const records=new Map();

  function assertPlace(place){
    const check=validate(place)||{};

    if(check.valid===false){
      const error=new Error(
        'Ungültiger Place: '+
        (check.errors||[]).join(', ')
      );

      error.code='INVALID_PLACE';
      error.details=check;

      throw error;
    }

    if(!place?.id){
      const error=new Error(
        'Ungültiger Place: id fehlt'
      );

      error.code='INVALID_PLACE';
      error.details={
        valid:false,
        errors:['id fehlt']
      };

      throw error;
    }

    return place;
  }

  function register(place){
    assertPlace(place);

    records.set(
      place.id,
      place
    );

    return place;
  }

  function get(id){
    return records.get(id)||null;
  }

  function list(filters={}){
    return [...records.values()]
      .filter(place=>(
        (!filters.tripId||place.tripId===filters.tripId)&&
        (!filters.primaryType||place.primaryType===filters.primaryType)&&
        (!filters.role||place.roles.includes(filters.role))&&
        (!filters.lifecycle||place.lifecycle===filters.lifecycle)
      ));
  }

  function update(id,patch={}){
    const current=get(id);

    if(!current){
      return null;
    }

    const next=normalize(
      {
        ...current,
        ...patch,
        id,
        createdAt:current.createdAt,
        updatedAt:now()
      },
      {
        primaryType:
          patch.primaryType||
          current.primaryType
      }
    );

    return register(next);
  }

  function remove(id){
    return records.delete(id);
  }

  function size(){
    return records.size;
  }

  function clear(){
    records.clear();
  }

  return Object.freeze({
    version:VERSION,
    register,
    get,
    list,
    update,
    remove,
    size,
    clear
  });
}

return Object.freeze({
  version:VERSION,
  create
});
})();
