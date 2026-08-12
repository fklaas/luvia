(()=>{
'use strict';
const VERSION='1.0.0';
const semanticTokens=Object.freeze(['surface.primary','surface.elevated','text.primary','text.muted','action.primary','border.subtle','radius.card','space.sm','space.md','space.lg','motion.fast']);
const layers=Object.freeze(['primitive','semantic','component','feature']);
window.LuviaDesignSystemContract=Object.freeze({version:VERSION,scope:'global',layers,semanticTokens,inheritsGlobalTheme:true,allowsProductForks:false,diagnostics:()=>({version:VERSION,scope:'global',layers:[...layers],semanticTokenCount:semanticTokens.length,inheritsGlobalTheme:true,allowsProductForks:false})});
})();
