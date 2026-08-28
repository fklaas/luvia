const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const source=read('core/experience/experience-contract-core.js');
const context={};
vm.createContext(context);
vm.runInContext(source,context,{filename:'experience-contract-core.js'});
const experience=context.LuviaExperienceContractCoreV1;

assert.ok(experience,'experience contract must load browserlessly');
assert.equal(experience.resolveCompassDirectionTone(0).color,'#ef6254','north must use the official coral stop');
assert.equal(experience.resolveCompassDirectionTone(90).color,'#f4b34c','east must use the official orange stop');
assert.equal(experience.resolveCompassDirectionTone(180).color,'#2c93a9','south must use the official blue stop');
assert.equal(experience.resolveCompassDirectionTone(-90).color,'#2f8c73','west must use the official green stop');
const midpoint=experience.resolveCompassDirectionTone(-45);
assert.equal(midpoint.source,'official-compass-ring-angle');
assert.notEqual(midpoint.color,'#ef6254','intermediate angles must not snap back to coral');
assert.notEqual(midpoint.color,'#2f8c73','intermediate angles must not snap back to green');
assert.equal(midpoint.cssVariables['--lv-compass-direction-color'],midpoint.color);
assert.ok(Object.isFrozen(midpoint),'resolved direction tones must be immutable');
assert.equal(experience.diagnostics().compassOrbitLines,4);

const hubs=read('app/module-hubs.js');
const shell=read('app/app-shell.js');
const hubsCss=read('app/module-hubs.css');
const landingMotion=read('app/public-landing-motion.js');
const landingCss=read('app/public-landing.css');

assert.match(hubs,/data-compass-navigation="direction-ring"/,'signed-in Compass must declare the shared direction-ring grammar');
assert.equal((hubs.match(/lv-plan-orbit lv-plan-orbit-[a-d]/g)||[]).length,4,'signed-in Compass must render exactly four thin orbit lines');
assert.match(shell,/resolveCompassDirectionTone\?\.\(targetAngle\)/,'signed-in selection must resolve its tone from the target needle angle');
assert.match(shell,/compassSelectionSettleDuration=\(\)=>compassMotionReduced\(\)\?0:620/,'signed-in selection must remain visibly settled before the accepted exit');
assert.match(shell,/stage\.classList\.add\('is-direction-settled'\)/,'signed-in selection must expose a settled state');
assert.match(hubsCss,/var\(--lv-compass-direction-color\)/,'signed-in node, rings and ambient veil must share the resolved tone');
assert.match(hubsCss,/\.lv-plan-orbit-d/,'the fourth signed-in orbit must be styled');
assert.match(landingMotion,/applyCompassDirectionTone\(gate, sourceButton, target\)/,'Landing Compass choices must use the shared target-angle tone');
assert.match(landingMotion,/applyCompassDirectionTone\(orbit, step, detail\.angle\)/,'Journey Compass points must use the same target-angle tone');
assert.match(landingMotion,/const directionSettle = \(\) => delay\(620\)/,'public Compass navigation must retain the visible selection before departure');
assert.match(landingCss,/\.landing-compass-home\.has-direction-selection \.ring-four/,'Landing Compass must color all four visible rings');
assert.match(landingCss,/\.journey-orbit\.has-direction-selection \.journey-path::after/,'Journey Compass must synchronize its outer line layers');
assert.match(landingCss,/\.journey-moment\.is-active\.is-direction-selected/,'the clicked Journey box must visibly receive the angle-derived color');

console.log('M16.5AA shared direction-derived Compass activation: PASS');
