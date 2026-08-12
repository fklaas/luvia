(()=>{
'use strict';
const VERSION='1.0.0';let mountedTarget=null;let active=false;
function context(){return Object.freeze({auth:window.LuviaAuthSession||window.LuviaAuth||window.LuviaSession||null,profile:window.LuviaProfileService||window.LuviaProfiles||null,trip:window.LuviaTripContext||window.LuviaTravelContext||null,navigation:window.LuviaNavigationRegistry||null,events:window.LuviaKernelEvents||window.LuviaEvents||null,design:window.LuviaDesignSystemContract||null,capabilities:window.LuviaCapabilityRegistry||null});}
function mount(target){if(!target)throw new Error('Control Center shell target required');mountedTarget=target;target.setAttribute('data-luvia-product-module','control-center');target.setAttribute('data-luvia-design-scope','global');active=true;return snapshot();}
function unmount(target=mountedTarget){target?.removeAttribute?.('data-luvia-product-module');target?.removeAttribute?.('data-luvia-design-scope');mountedTarget=null;active=false;return snapshot();}
function activate(){active=true;return snapshot();}
function deactivate(){active=false;return snapshot();}
function snapshot(){return Object.freeze({version:VERSION,active,mounted:Boolean(mountedTarget),inheritsGlobalDesign:true,ownsDomainTruth:false,context:{auth:Boolean(context().auth),profile:Boolean(context().profile),trip:Boolean(context().trip),navigation:Boolean(context().navigation),events:Boolean(context().events),design:Boolean(context().design)}});}
window.LuviaControlCenterShell=Object.freeze({version:VERSION,context,mount,unmount,activate,deactivate,snapshot,diagnostics:snapshot});
})();
