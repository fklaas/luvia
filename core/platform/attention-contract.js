(()=>{
'use strict';
const VERSION='1.0.0';
const LEVELS=Object.freeze(['info','attention','action_required','warning','blocked','resolved']);
const SOURCES=Object.freeze(['booking','trip','wallet','message','collaboration','system']);
const EVENT_KINDS=Object.freeze(['event','notification','unread','attention','action_required']);
function normalize(input={}){const level=LEVELS.includes(input.level)?input.level:'info';const source=SOURCES.includes(input.source)?input.source:'system';return Object.freeze({id:String(input.id||''),source,level,title:String(input.title||''),message:String(input.message||''),action:input.action||null,resolved:level==='resolved'||Boolean(input.resolved),createdAt:input.createdAt||new Date().toISOString()});}
window.LuviaAttentionContract=Object.freeze({version:VERSION,levels:LEVELS,sources:SOURCES,eventKinds:EVENT_KINDS,normalize,diagnostics:()=>({version:VERSION,levels:[...LEVELS],sources:[...SOURCES],eventKinds:[...EVENT_KINDS],separatesUnreadFromActionRequired:true})});
})();
