(()=>{
'use strict';
const VERSION='1.1.0';
const experience=window.LuviaExperienceContractV1||null;
const legacySemanticTokens=Object.freeze(['surface.primary','surface.elevated','text.primary','text.muted','action.primary','border.subtle','radius.card','space.sm','space.md','space.lg','motion.fast']);
const layers=Object.freeze(['primitive','semantic','component','feature']);
function diagnostics(){const source=experience?.diagnostics?.()||{};return Object.freeze({version:VERSION,scope:'global',layers:[...layers],semanticTokenCount:source.tokenCount||legacySemanticTokens.length,inheritsGlobalTheme:true,allowsProductForks:false,sourceContract:'experience.v1',sourceAvailable:Boolean(experience),compatibilityFacade:true})}
function getToken(id){return experience?.getToken?.(id)||null}
function getSystemSnapshot(){return experience?.getSystemSnapshot?.()||Object.freeze({contractId:'experience.v1',available:false,compatibilityFacade:true})}
window.LuviaDesignSystemContract=Object.freeze({version:VERSION,scope:'global',layers,semanticTokens:legacySemanticTokens,inheritsGlobalTheme:true,allowsProductForks:false,sourceContract:'experience.v1',getToken,getSystemSnapshot,diagnostics});
})();
