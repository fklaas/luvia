var LuviaExperienceContractCoreV1=(()=>{
'use strict';

const CONTRACT_ID='experience.v1';
const VERSION='1';
const RUNTIME_VERSION='1.0.0';

function immutable(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return Object.freeze(value.map(immutable));
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])));
}
function copy(value){
  if(value==null||typeof value!=='object')return value;
  if(Array.isArray(value))return value.map(copy);
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,copy(item)]));
}
function text(value,fallback=''){return String(value??fallback).trim()}
function token(category,value,dark,cssVariable,swiftUI,compose){
  return immutable({category,value,dark:dark??value,cssVariable,native:{swiftUI,compose}});
}

const TOKENS=immutable({
  'color.surface.canvas':token('color','#fff8f7','#101820','--luvia-color-surface-canvas','LuviaColor.surfaceCanvas','LuviaTheme.colorScheme.surfaceCanvas'),
  'color.surface.primary':token('color','#fbfcfd','#17232d','--luvia-color-surface-primary','LuviaColor.surfacePrimary','LuviaTheme.colorScheme.surfacePrimary'),
  'color.surface.elevated':token('color','#ffffff','#1d2b36','--luvia-color-surface-elevated','LuviaColor.surfaceElevated','LuviaTheme.colorScheme.surfaceElevated'),
  'color.surface.subtle':token('color','#f3f7f8','#243541','--luvia-color-surface-subtle','LuviaColor.surfaceSubtle','LuviaTheme.colorScheme.surfaceSubtle'),
  'color.surface.scrim':token('color','rgba(31,43,54,.56)','rgba(4,9,13,.72)','--luvia-color-surface-scrim','LuviaColor.surfaceScrim','LuviaTheme.colorScheme.surfaceScrim'),
  'color.text.primary':token('color','#263f54','#f2f6f8','--luvia-color-text-primary','LuviaColor.textPrimary','LuviaTheme.colorScheme.textPrimary'),
  'color.text.muted':token('color','#687b8c','#a9bac5','--luvia-color-text-muted','LuviaColor.textMuted','LuviaTheme.colorScheme.textMuted'),
  'color.text.inverse':token('color','#ffffff','#101820','--luvia-color-text-inverse','LuviaColor.textInverse','LuviaTheme.colorScheme.textInverse'),
  'color.border.subtle':token('color','#dfe6ea','#30434f','--luvia-color-border-subtle','LuviaColor.borderSubtle','LuviaTheme.colorScheme.borderSubtle'),
  'color.border.focus':token('color','#d94f71','#ff9db2','--luvia-color-border-focus','LuviaColor.borderFocus','LuviaTheme.colorScheme.borderFocus'),
  'color.action.primary':token('color','#e96784','#f58da4','--luvia-color-action-primary','LuviaColor.actionPrimary','LuviaTheme.colorScheme.actionPrimary'),
  'color.action.onPrimary':token('color','#ffffff','#17232d','--luvia-color-action-on-primary','LuviaColor.onActionPrimary','LuviaTheme.colorScheme.onActionPrimary'),
  'color.action.primarySoft':token('color','#fff0f4','#4b2e3a','--luvia-color-action-primary-soft','LuviaColor.actionPrimarySoft','LuviaTheme.colorScheme.actionPrimarySoft'),
  'color.status.success':token('color','#2d8a63','#72d7a9','--luvia-color-status-success','LuviaColor.statusSuccess','LuviaTheme.colorScheme.statusSuccess'),
  'color.status.warning':token('color','#a96916','#f2bd66','--luvia-color-status-warning','LuviaColor.statusWarning','LuviaTheme.colorScheme.statusWarning'),
  'color.status.danger':token('color','#b7465a','#ff91a4','--luvia-color-status-danger','LuviaColor.statusDanger','LuviaTheme.colorScheme.statusDanger'),
  'color.status.info':token('color','#4779a8','#86b9e8','--luvia-color-status-info','LuviaColor.statusInfo','LuviaTheme.colorScheme.statusInfo'),
  'font.family.body':token('typography','Manrope, Inter, Avenir Next, Segoe UI, system-ui, sans-serif',null,'--luvia-font-family-body','LuviaTypography.bodyFamily','LuviaTheme.typography.bodyFamily'),
  'font.family.display':token('typography','Manrope, Inter, Avenir Next, Segoe UI, system-ui, sans-serif',null,'--luvia-font-family-display','LuviaTypography.displayFamily','LuviaTheme.typography.displayFamily'),
  'font.family.mono':token('typography','SFMono-Regular, Consolas, Liberation Mono, monospace',null,'--luvia-font-family-mono','LuviaTypography.monoFamily','LuviaTheme.typography.monoFamily'),
  'font.size.label':token('typography','.75rem',null,'--luvia-font-size-label','LuviaTypography.label','LuviaTheme.typography.label'),
  'font.size.body':token('typography','1rem',null,'--luvia-font-size-body','LuviaTypography.body','LuviaTheme.typography.body'),
  'font.size.bodyLarge':token('typography','1.125rem',null,'--luvia-font-size-body-large','LuviaTypography.bodyLarge','LuviaTheme.typography.bodyLarge'),
  'font.size.title':token('typography','1.375rem',null,'--luvia-font-size-title','LuviaTypography.title','LuviaTheme.typography.title'),
  'font.size.titleLarge':token('typography','clamp(1.7rem,3vw,2.25rem)',null,'--luvia-font-size-title-large','LuviaTypography.titleLarge','LuviaTheme.typography.titleLarge'),
  'font.size.display':token('typography','clamp(2.35rem,6vw,4.25rem)',null,'--luvia-font-size-display','LuviaTypography.display','LuviaTheme.typography.display'),
  'font.weight.regular':token('typography','400',null,'--luvia-font-weight-regular','LuviaTypography.regular','LuviaTheme.typography.regular'),
  'font.weight.medium':token('typography','500',null,'--luvia-font-weight-medium','LuviaTypography.medium','LuviaTheme.typography.medium'),
  'font.weight.semibold':token('typography','600',null,'--luvia-font-weight-semibold','LuviaTypography.semibold','LuviaTheme.typography.semibold'),
  'font.weight.bold':token('typography','700',null,'--luvia-font-weight-bold','LuviaTypography.bold','LuviaTheme.typography.bold'),
  'lineHeight.tight':token('typography','1.08',null,'--luvia-line-height-tight','LuviaTypography.tight','LuviaTheme.typography.tight'),
  'lineHeight.heading':token('typography','1.18',null,'--luvia-line-height-heading','LuviaTypography.heading','LuviaTheme.typography.heading'),
  'lineHeight.body':token('typography','1.64',null,'--luvia-line-height-body','LuviaTypography.bodyLeading','LuviaTheme.typography.bodyLeading'),
  'space.1':token('spacing','4px',null,'--luvia-space-1','LuviaSpacing.xs2','LuviaTheme.spacing.xs2'),
  'space.2':token('spacing','8px',null,'--luvia-space-2','LuviaSpacing.xs','LuviaTheme.spacing.xs'),
  'space.3':token('spacing','12px',null,'--luvia-space-3','LuviaSpacing.sm','LuviaTheme.spacing.sm'),
  'space.4':token('spacing','16px',null,'--luvia-space-4','LuviaSpacing.md','LuviaTheme.spacing.md'),
  'space.5':token('spacing','20px',null,'--luvia-space-5','LuviaSpacing.lg','LuviaTheme.spacing.lg'),
  'space.6':token('spacing','24px',null,'--luvia-space-6','LuviaSpacing.xl','LuviaTheme.spacing.xl'),
  'space.8':token('spacing','32px',null,'--luvia-space-8','LuviaSpacing.xl2','LuviaTheme.spacing.xl2'),
  'space.10':token('spacing','40px',null,'--luvia-space-10','LuviaSpacing.xl3','LuviaTheme.spacing.xl3'),
  'space.12':token('spacing','48px',null,'--luvia-space-12','LuviaSpacing.xl4','LuviaTheme.spacing.xl4'),
  'space.16':token('spacing','64px',null,'--luvia-space-16','LuviaSpacing.xl5','LuviaTheme.spacing.xl5'),
  'radius.xs':token('radius','10px',null,'--luvia-radius-xs','LuviaRadius.xs','LuviaTheme.radius.xs'),
  'radius.sm':token('radius','14px',null,'--luvia-radius-sm','LuviaRadius.sm','LuviaTheme.radius.sm'),
  'radius.md':token('radius','18px',null,'--luvia-radius-md','LuviaRadius.md','LuviaTheme.radius.md'),
  'radius.lg':token('radius','24px',null,'--luvia-radius-lg','LuviaRadius.lg','LuviaTheme.radius.lg'),
  'radius.xl':token('radius','30px',null,'--luvia-radius-xl','LuviaRadius.xl','LuviaTheme.radius.xl'),
  'radius.pill':token('radius','999px',null,'--luvia-radius-pill','LuviaRadius.pill','LuviaTheme.radius.pill'),
  'elevation.control':token('elevation','0 6px 18px rgba(41,49,67,.08)','0 8px 22px rgba(0,0,0,.24)','--luvia-elevation-control','LuviaElevation.control','LuviaTheme.elevation.control'),
  'elevation.card':token('elevation','0 16px 44px rgba(41,49,67,.08)','0 18px 50px rgba(0,0,0,.28)','--luvia-elevation-card','LuviaElevation.card','LuviaTheme.elevation.card'),
  'elevation.float':token('elevation','0 30px 100px rgba(31,38,53,.22)','0 32px 110px rgba(0,0,0,.5)','--luvia-elevation-float','LuviaElevation.floating','LuviaTheme.elevation.floating'),
  'motion.duration.instant':token('motion','0ms',null,'--luvia-motion-instant','LuviaMotion.instant','LuviaTheme.motion.instant'),
  'motion.duration.fast':token('motion','140ms',null,'--luvia-motion-fast','LuviaMotion.fast','LuviaTheme.motion.fast'),
  'motion.duration.base':token('motion','220ms',null,'--luvia-motion-base','LuviaMotion.base','LuviaTheme.motion.base'),
  'motion.duration.slow':token('motion','360ms',null,'--luvia-motion-slow','LuviaMotion.slow','LuviaTheme.motion.slow'),
  'motion.easing.standard':token('motion','cubic-bezier(.22,.72,.2,1)',null,'--luvia-ease-standard','LuviaMotion.standard','LuviaTheme.motion.standard'),
  'motion.easing.enter':token('motion','cubic-bezier(.16,1,.3,1)',null,'--luvia-ease-enter','LuviaMotion.enter','LuviaTheme.motion.enter'),
  'motion.easing.exit':token('motion','cubic-bezier(.4,0,1,1)',null,'--luvia-ease-exit','LuviaMotion.exit','LuviaTheme.motion.exit'),
  'layout.content.max':token('layout','1180px',null,'--luvia-layout-content-max','LuviaLayout.contentMax','LuviaTheme.layout.contentMax'),
  'layout.touch.minimum':token('layout','44px',null,'--luvia-layout-touch-minimum','LuviaLayout.minimumTouchTarget','LuviaTheme.layout.minimumTouchTarget'),
  'layout.breakpoint.compact':token('layout','640px',null,'--luvia-breakpoint-compact','LuviaBreakpoint.compact','LuviaTheme.breakpoint.compact'),
  'layout.breakpoint.medium':token('layout','980px',null,'--luvia-breakpoint-medium','LuviaBreakpoint.medium','LuviaTheme.breakpoint.medium'),
  'layout.breakpoint.expanded':token('layout','1440px',null,'--luvia-breakpoint-expanded','LuviaBreakpoint.expanded','LuviaTheme.breakpoint.expanded'),
  'zIndex.content':token('layer','1',null,'--luvia-z-content','LuviaLayer.content','LuviaTheme.layer.content'),
  'zIndex.sticky':token('layer','30',null,'--luvia-z-sticky','LuviaLayer.sticky','LuviaTheme.layer.sticky'),
  'zIndex.dock':token('layer','40',null,'--luvia-z-dock','LuviaLayer.dock','LuviaTheme.layer.dock'),
  'zIndex.overlay':token('layer','2147483000',null,'--luvia-z-overlay','LuviaLayer.overlay','LuviaTheme.layer.overlay'),
  'zIndex.toast':token('layer','2147483600',null,'--luvia-z-toast','LuviaLayer.toast','LuviaTheme.layer.toast')
});

const COMPONENTS=immutable({
  button:{role:'action',variants:['primary','secondary','quiet','destructive'],states:['default','pressed','disabled','loading'],minimumTouchTarget:44,native:{swiftUI:'LuviaButton',compose:'LuviaButton'}},
  iconButton:{role:'action',variants:['standard','accent','quiet'],states:['default','pressed','disabled','loading'],minimumTouchTarget:44,native:{swiftUI:'LuviaIconButton',compose:'LuviaIconButton'}},
  input:{role:'data-entry',variants:['text','search','multiline','select'],states:['default','focus','disabled','error','success'],minimumTouchTarget:44,native:{swiftUI:'LuviaField',compose:'LuviaField'}},
  card:{role:'content-group',variants:['flat','elevated','interactive','attention'],states:['default','pressed','disabled','loading'],native:{swiftUI:'LuviaCard',compose:'LuviaCard'}},
  dialog:{role:'modal-task',variants:['standard','confirmation','destructive'],hostContract:'overlay-host.v1',native:{swiftUI:'LuviaDialogHost',compose:'LuviaDialogHost'}},
  sheet:{role:'modal-task',variants:['compact','adaptive','fullHeight'],hostContract:'overlay-host.v1',native:{swiftUI:'LuviaSheetHost',compose:'LuviaSheetHost'}},
  navigation:{role:'primary-navigation',variants:['dock','rail','bar'],states:['default','selected','disabled'],native:{swiftUI:'LuviaNavigationHost',compose:'LuviaNavigationHost'}},
  tabs:{role:'section-navigation',variants:['standard','compact'],states:['default','selected','disabled'],native:{swiftUI:'LuviaTabs',compose:'LuviaTabs'}},
  chip:{role:'selection',variants:['filter','choice','status'],states:['default','selected','disabled'],minimumTouchTarget:44,native:{swiftUI:'LuviaChip',compose:'LuviaChip'}},
  menu:{role:'action-list',variants:['standard','contextual'],hostContract:'overlay-host.v1',native:{swiftUI:'LuviaMenu',compose:'LuviaMenu'}},
  toast:{role:'transient-feedback',variants:['info','success','warning','error'],native:{swiftUI:'LuviaToastHost',compose:'LuviaToastHost'}},
  banner:{role:'persistent-feedback',variants:['info','success','warning','error','offline'],native:{swiftUI:'LuviaBanner',compose:'LuviaBanner'}},
  commandSurface:{role:'assistant-command',variants:['global','contextual','confirmation'],hostContract:'overlay-host.v1',states:['idle','loading','success','error'],native:{swiftUI:'LuviaCommandSurface',compose:'LuviaCommandSurface'}}
});

const STATES=immutable({
  loading:{tone:'neutral',role:'status',live:'polite',busy:true,blocksInteraction:false},
  empty:{tone:'neutral',role:'status',live:'polite',busy:false,blocksInteraction:false},
  error:{tone:'danger',role:'alert',live:'assertive',busy:false,blocksInteraction:false},
  offline:{tone:'warning',role:'status',live:'polite',busy:false,blocksInteraction:false},
  disabled:{tone:'neutral',role:'status',live:'off',busy:false,blocksInteraction:true},
  permission:{tone:'info',role:'status',live:'polite',busy:false,blocksInteraction:true},
  pending:{tone:'info',role:'status',live:'polite',busy:true,blocksInteraction:false},
  success:{tone:'success',role:'status',live:'polite',busy:false,blocksInteraction:false},
  attention:{tone:'warning',role:'status',live:'polite',busy:false,blocksInteraction:false}
});

const MOTION=immutable({
  enter:{duration:'motion.duration.slow',easing:'motion.easing.enter',reducedDuration:'motion.duration.instant',native:{swiftUI:'LuviaMotion.enter',compose:'LuviaMotion.enter'}},
  exit:{duration:'motion.duration.fast',easing:'motion.easing.exit',reducedDuration:'motion.duration.instant',native:{swiftUI:'LuviaMotion.exit',compose:'LuviaMotion.exit'}},
  feedback:{duration:'motion.duration.base',easing:'motion.easing.standard',reducedDuration:'motion.duration.instant',native:{swiftUI:'LuviaMotion.feedback',compose:'LuviaMotion.feedback'}},
  sharedTransition:{duration:'motion.duration.slow',easing:'motion.easing.enter',reducedDuration:'motion.duration.instant',native:{swiftUI:'LuviaMotion.sharedTransition',compose:'LuviaMotion.sharedTransition'}}
});

const ACCESSIBILITY=immutable({
  minimumTouchTarget:44,
  focusVisible:true,
  focusMustNotRelyOnColorAlone:true,
  keyboardEquivalentForPointerActions:true,
  screenReaderNamesRequired:true,
  dynamicTypeRequired:true,
  reducedMotionRequired:true,
  contrast:{normalText:4.5,largeText:3,uiComponents:3},
  liveRegions:{status:'polite',error:'assertive'},
  native:{swiftUI:'Accessibility and Dynamic Type',compose:'Semantics and scalable typography'}
});

function getToken(id){const value=TOKENS[text(id)];return value||null}
function listTokens(options={}){
  const category=text(options.category);
  return Object.entries(TOKENS).filter(([,definition])=>!category||definition.category===category).map(([id,definition])=>immutable({id,...copy(definition)}));
}
function getComponent(id){return COMPONENTS[text(id)]||null}
function listComponents(){return Object.entries(COMPONENTS).map(([id,definition])=>immutable({id,...copy(definition)}))}
function getState(id){return STATES[text(id)]||null}
function listStates(){return Object.entries(STATES).map(([id,definition])=>immutable({id,...copy(definition)}))}
function getMotion(id){return MOTION[text(id)]||null}
function resolveMotion(id,options={}){
  const definition=getMotion(id);
  if(!definition)return null;
  const durationId=options.reducedMotion?definition.reducedDuration:definition.duration;
  return immutable({id:text(id),durationToken:durationId,duration:getToken(durationId)?.value||'0ms',easingToken:definition.easing,easing:getToken(definition.easing)?.value||'linear',reducedMotion:Boolean(options.reducedMotion),native:copy(definition.native)});
}
function createTheme(options={}){
  const mode=text(options.mode,'light')==='dark'?'dark':'light';
  const values=Object.fromEntries(Object.entries(TOKENS).map(([id,definition])=>[id,mode==='dark'?definition.dark:definition.value]));
  const accent=text(options.accent);
  if(accent)values['color.action.primary']=accent;
  const onAccent=text(options.onAccent);
  if(onAccent)values['color.action.onPrimary']=onAccent;
  const accentSoft=text(options.accentSoft);
  if(accentSoft)values['color.action.primarySoft']=accentSoft;
  return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,mode,values});
}
function getSystemSnapshot(){
  return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,scope:'global',layers:['primitive','semantic','component','feature'],tokens:listTokens(),components:listComponents(),states:listStates(),motion:Object.entries(MOTION).map(([id,definition])=>({id,...copy(definition)})),accessibility:copy(ACCESSIBILITY),nativePlatforms:['swiftui','compose'],inheritsGlobalTheme:true,allowsProductForks:false,domainTruth:false});
}
function diagnostics(){
  return immutable({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,browserless:true,domainTruth:false,tokenCount:Object.keys(TOKENS).length,componentCount:Object.keys(COMPONENTS).length,stateCount:Object.keys(STATES).length,motionPatternCount:Object.keys(MOTION).length,nativePlatforms:['swiftui','compose'],overlayHost:'overlay-host.v1'});
}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,runtimeVersion:RUNTIME_VERSION,getToken,listTokens,getComponent,listComponents,getState,listStates,getMotion,resolveMotion,createTheme,getSystemSnapshot,diagnostics});
})();
