(function(){
'use strict';
const VERSION='2.1.0-universal-admission';
const ENGINES=Object.freeze([
{id:'opentable',name:'OpenTable',vertical:'dining',hosts:[/(^|\.)opentable\./i]},
{id:'thefork',name:'TheFork',hosts:[/(^|\.)thefork\./i]},
{id:'resy',name:'Resy',hosts:[/(^|\.)resy\.com$/i]},
{id:'sevenrooms',name:'SevenRooms',hosts:[/(^|\.)sevenrooms\.com$/i]},
{id:'quandoo',name:'Quandoo',hosts:[/(^|\.)quandoo\./i]},
{id:'zenchef',name:'Zenchef',hosts:[/(^|\.)zenchef\./i]},
{id:'tock',name:'Tock',hosts:[/(^|\.)exploretock\.com$/i,/(^|\.)tockhq\.com$/i]},
{id:'covermanager',name:'CoverManager',hosts:[/(^|\.)covermanager\.com$/i]},
{id:'resdiary',name:'ResDiary',hosts:[/(^|\.)resdiary\.com$/i]},
{id:'tablecheck',name:'TableCheck',hosts:[/(^|\.)tablecheck\.com$/i]},
{id:'formitable',name:'Formitable',hosts:[/(^|\.)formitable\.com$/i]},
{id:'aleno',name:'aleno',hosts:[/(^|\.)aleno\.me$/i]},
{id:'simpleerb',name:'simpleERB',vertical:'dining',hosts:[/(^|\.)simpleerb\.com$/i]},
{id:'tiqets',name:'Tiqets',vertical:'admission',hosts:[/(^|\.)tiqets\.com$/i]},
{id:'viator',name:'Viator',vertical:'admission',hosts:[/(^|\.)viator\.com$/i]},
{id:'getyourguide',name:'GetYourGuide',vertical:'admission',hosts:[/(^|\.)getyourguide\./i]},
{id:'fareharbor',name:'FareHarbor',vertical:'admission',hosts:[/(^|\.)fareharbor\.com$/i]},
{id:'bokun',name:'Bókun',vertical:'admission',hosts:[/(^|\.)bokun\.io$/i,/(^|\.)bokun\.is$/i]},
{id:'regiondo',name:'Regiondo',vertical:'admission',hosts:[/(^|\.)regiondo\./i]},
{id:'bookingkit',name:'bookingkit',vertical:'admission',hosts:[/(^|\.)bookingkit\./i]},
{id:'xola',name:'Xola',vertical:'admission',hosts:[/(^|\.)xola\.com$/i]},
{id:'checkfront',name:'Checkfront',vertical:'admission',hosts:[/(^|\.)checkfront\.com$/i]},
{id:'eventim',name:'EVENTIM',vertical:'event',hosts:[/(^|\.)eventim\./i]},
{id:'reservix',name:'Reservix',vertical:'event',hosts:[/(^|\.)reservix\./i]},
{id:'ticketmaster',name:'Ticketmaster',vertical:'event',hosts:[/(^|\.)ticketmaster\./i]}
]);
const clean=v=>String(v??'').trim();
function runtimeBase(){if(typeof LuviaOwnerFlowNavigationV1!=='undefined')return LuviaOwnerFlowNavigationV1.current?.().href||'';if(typeof LuviaEnvironment!=='undefined')return LuviaEnvironment.snapshot?.().canonicalUrl||'';return'https://myluvia.app/'}
function safeUrl(value,base){try{const u=new URL(clean(value),base||runtimeBase());return /^https?:$/.test(u.protocol)?u:null}catch{return null}}
function detectUrl(value,base){const u=safeUrl(value,base);if(!u)return null;const host=u.hostname.toLowerCase().replace(/^www\./,'');for(const e of ENGINES)if(e.hosts.some(rx=>rx.test(host)))return Object.freeze({id:e.id,name:e.name,vertical:e.vertical||'dining',url:u.toString(),host});return null;}
function scanDocument(doc=document){const hits=[];const sels=['a[href]','iframe[src]','form[action]','script[src]','[data-booking-url]','[data-reservation-url]','[data-widget-url]'];for(const el of doc.querySelectorAll(sels.join(','))){for(const attr of ['href','src','action','data-booking-url','data-reservation-url','data-widget-url']){const value=el.getAttribute?.(attr);if(!value)continue;const hit=detectUrl(value,doc.baseURI);if(hit)hits.push({...hit,tag:String(el.tagName||'').toLowerCase(),attribute:attr});}}return Object.freeze(hits.filter((v,i,a)=>a.findIndex(x=>x.id===v.id&&x.url===v.url)===i));}
window.LuviaBookingEngineDetection=Object.freeze({version:VERSION,engines:ENGINES,detectUrl,scanDocument});
})();
