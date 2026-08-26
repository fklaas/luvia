'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const shell=fs.readFileSync(path.join(ROOT,'app/app-shell.js'),'utf8');
const css=fs.readFileSync(path.join(ROOT,'app/app-shell.css'),'utf8');

const transitionHost=shell.slice(shell.indexOf('function transitionHost'),shell.indexOf('function routeHelper'));
const showBlock=shell.slice(shell.indexOf("async function show(view='today'"),shell.indexOf('function refreshDashboardGrid'));

assert.match(transitionHost,/lv-route-entering/,'the target route must use the single-cycle route transition');
assert.match(transitionHost,/aria-busy="true"/,'the target must expose its mounting state accessibly');
assert.doesNotMatch(transitionHost,/lv-module-intro|role="status"/,'navigation must not render a second full-field module splash');
assert.doesNotMatch(shell,/function transitionMeta\(/,'obsolete presentation-only route metadata must be removed');

assert.match(showBlock,/const previousHost=stage\.querySelector\(':scope > \.lv-view-host'\)/,'the committed surface must be retained while the target mounts');
assert.match(showBlock,/stage\.insertAdjacentHTML\('afterbegin',wrap\(view,content\)\)/,'the target must mount ahead of the retained surface');
assert.match(showBlock,/previousHost\.classList\.add\('lv-route-previous'\)/,'the retained surface needs an explicit transition role');
assert.match(transitionHost,/previousHost\?\.classList\.add\('is-exiting'\)/,'the previous surface must only exit when the target is ready');

const mountIndex=showBlock.indexOf("await appRuntime().run('modules-ready'");
const commitIndex=showBlock.lastIndexOf('commitScreenIntent(intent,options)');
const transitionIndex=showBlock.indexOf('completeTransition(stage,host,previousHost)');
assert.ok(commitIndex>=0&&commitIndex<mountIndex&&mountIndex<transitionIndex,'history commit, asynchronous mount and visible transition must happen in one deterministic order');

assert.match(css,/\.lv-route-previous\{position:absolute/,'the previous surface must not shift target layout');
assert.match(css,/\.lv-route-entering\.is-ready \.lv-view-content/,'the fully mounted target needs one visible enter transition');
assert.match(css,/\.lv-route-previous\.is-exiting/,'the previous surface needs one coordinated exit transition');
assert.match(css,/prefers-reduced-motion:reduce/,'the transition must respect system reduced-motion preference');

console.log('M16.5c single-cycle navigation transition: PASS');
