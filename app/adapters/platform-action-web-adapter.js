(()=>{
'use strict';

const CONTRACT_ID='platform.actions.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';
const core=globalThis.LuviaPlatformActionContractCoreV1;
if(!core)throw new Error('Platform Action Contract Core v1 fehlt.');
const port=id=>{const value=globalThis.LuviaPlatformPorts?.get?.(id);if(!value)throw new Error(`PLATFORM_PORT_UNAVAILABLE:${id}`);return value};
const requireGesture=input=>{if(input?.userGesture!==true)throw new Error('PLATFORM_USER_GESTURE_REQUIRED');return input};

async function requestLocation(input={}){
  const request=core.locationRequest(input),location=port('LocationPort');
  if(request.mode==='watch'){
    const positions=[];
    const watchId=location.watch(value=>positions.push(value),()=>{},request);
    return Object.freeze({mode:'watch',watchId,positions});
  }
  return Object.freeze({mode:'once',position:await location.getCurrent(request)});
}
function clearLocation(input={}){
  requireGesture(input);
  if(input.watchId==null)throw new Error('PLATFORM_LOCATION_WATCH_ID_REQUIRED');
  port('LocationPort').clearWatch(input.watchId);
  return Object.freeze({cleared:true,watchId:input.watchId});
}
async function captureMedia(input={}){requireGesture(input);return port('MediaCapturePort').captureImage({facingMode:input.facingMode==='user'?'user':'environment'})}
async function pickFiles(input={}){requireGesture(input);return port('MediaPickerPort').pickImages({multiple:input.multiple!==false,accept:input.accept||undefined})}
async function share(input={}){requireGesture(input);return port('SharingPort').share(core.sharePayload(input))}
async function copyText(input={}){requireGesture(input);const value=String(input.text??'');if(!value)throw new Error('PLATFORM_COPY_TEXT_REQUIRED');return port('SharingPort').copyText(value)}
function openTelephone(input={}){
  requireGesture(input);const phone=core.phoneTarget(input),document=globalThis.document;
  if(!document?.createElement)throw new Error('PLATFORM_TELEPHONE_UNSUPPORTED');
  const anchor=document.createElement('a');anchor.href=`tel:${phone}`;anchor.hidden=true;document.body?.appendChild(anchor);anchor.click();anchor.remove();
  return Object.freeze({opened:true,protocol:'tel:',phone});
}
function download(input={}){
  requireGesture(input);const asset=input.asset||input.url,document=globalThis.document;
  if(!asset||!document?.createElement)throw new Error('PLATFORM_DOWNLOAD_ASSET_REQUIRED');
  let href='',revoke=false;
  if(typeof asset==='string'){
    const parsed=new URL(asset,globalThis.location?.href);if(!['http:','https:','blob:'].includes(parsed.protocol))throw new Error('PLATFORM_DOWNLOAD_URL_INVALID');href=parsed.href;
  }else if(globalThis.Blob&&asset instanceof globalThis.Blob){href=URL.createObjectURL(asset);revoke=true}else throw new Error('PLATFORM_DOWNLOAD_ASSET_INVALID');
  const anchor=document.createElement('a');anchor.href=href;anchor.download=core.filename(input.filename);anchor.hidden=true;document.body?.appendChild(anchor);anchor.click();anchor.remove();if(revoke)setTimeout(()=>URL.revokeObjectURL(href),0);
  return Object.freeze({started:true,filename:anchor.download});
}

const composition=Object.freeze({retryIntent:core.retryIntent,refreshIntent:core.refreshIntent});
const commands=Object.freeze({requestLocation,clearLocation,captureMedia,pickFiles,share,copyText,openTelephone,download});
const api=Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,composition,commands,diagnostics:()=>Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserlessCore:true,ports:Object.freeze(['LocationPort','MediaCapturePort','MediaPickerPort','SharingPort'])})});
globalThis.LuviaPlatformActionContractV1=api;
globalThis.LuviaGlobalContracts?.register?.({id:CONTRACT_ID,version:VERSION,owner:'Platform',api,probe:()=>({available:Boolean(globalThis.LuviaPlatformPorts),detail:'Bounded device and web actions'})});
})();
