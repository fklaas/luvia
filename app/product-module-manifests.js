(()=>{
'use strict';
const r=window.LuviaProductModuleRegistry;if(!r)return;
r.register({id:'consumer',type:'product-surface',version:'1.0.0',title:'Luvia Consumer Experience',status:'existing',defaultEnabled:true,requires:['app.runtime','design.system','auth.session'],optional:['profile.context','trip.context','navigation','events','realtime'],capabilities:['places.discovery','trip.context','media.gallery','booking.lifecycle'],children:['trips','places','memories','profile','collaboration'],globalContracts:['design.system','auth.session','profile.context','trip.context','navigation','events','realtime']});
r.register({id:'developer-console',type:'diagnostics-surface',version:'1.0.0',title:'Luvia Developer Console',status:'existing',defaultEnabled:true,requires:['design.system'],optional:['app.runtime','events'],capabilities:[],children:['system','services','places','booking','platform'],globalContracts:['design.system','events']});
})();
