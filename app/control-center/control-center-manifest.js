(()=>{
'use strict';
const VERSION='1.0.0';
const manifest=Object.freeze({
 id:'control-center',type:'product-surface',version:VERSION,title:'Luvia Control Center',status:'foundation',defaultEnabled:true,
 routes:Object.freeze([{id:'control-center.home',path:'/control-center',status:'planned-v13.77'},{id:'control-center.bookings',path:'/control-center/bookings',status:'planned-v13.78'},{id:'control-center.inbox',path:'/control-center/inbox',status:'planned-v13.79'},{id:'control-center.wallet',path:'/control-center/wallet',status:'planned-v13.82'},{id:'control-center.trip-command',path:'/control-center/trip/:tripId',status:'planned-v13.83'}]),
 children:Object.freeze(['home','booking-control-center','booking-inbox','travel-wallet','trip-command-center']),
 requires:Object.freeze(['app.runtime','design.system','auth.session']),optional:Object.freeze(['profile.context','trip.context','navigation','events','realtime']),
 capabilities:Object.freeze(['trip.context','media.gallery','booking.lifecycle','booking.messages','booking.intelligence','notifications.unread','wallet.documents']),
 globalContracts:Object.freeze(['design.system','auth.session','profile.context','trip.context','navigation','events','realtime']),
 principles:Object.freeze({ownsDomainTruth:false,inheritsGlobalDesign:true,inheritsGlobalAuth:true,inheritsGlobalTripContext:true,independentlyEnableable:true,consumerAppMustSurviveDisable:true}),
 lifecycle:Object.freeze({mount:(target,context)=>window.LuviaControlCenterShell?.mount?.(target,context),unmount:(target,context)=>window.LuviaControlCenterShell?.unmount?.(target,context),activate:context=>window.LuviaControlCenterShell?.activate?.(context),deactivate:context=>window.LuviaControlCenterShell?.deactivate?.(context)})
});
window.LuviaControlCenterManifest=manifest;
window.LuviaProductModuleRegistry?.register?.(manifest);
})();
