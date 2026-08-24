'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const css=fs.readFileSync('core/experience/experience-foundation.css','utf8');
const ownership=fs.readFileSync('docs/modularization/FILE-OWNERSHIP.csv','utf8');
const safeRunner=fs.readFileSync('tests/run-m4.3-safe-regression.cjs','utf8');

for(const needle of [
  'max-height:min(92dvh,860px)',
  'grid-template-rows:minmax(0,1fr) auto',
  '.lvx-command-scroll{',
  'min-height:0',
  'overflow-y:auto',
  'overscroll-behavior:contain',
  '.lvx-command-composer-panel{',
  'max(16px,env(safe-area-inset-bottom))',
  '.lvx-command-keyboard kbd{',
  '.lvx-command-message.is-user{',
  '.lvx-command-suggestions button{',
  '.lvx-button-send-mark{',
  'min-height:var(--luvia-layout-touch-minimum)',
  '@media(max-height:780px)',
  '@media(max-height:520px)',
  '@media(prefers-reduced-motion:reduce)'
])assert.ok(css.includes(needle),`Experience Composer missing ${needle}`);

assert.match(css,/@media\(max-width:720px\)[\s\S]*max-height:calc\(100dvh - max\(12px,env\(safe-area-inset-top\)\) - max\(12px,env\(safe-area-inset-bottom\)\)\)/,'mobile dialog must remain inside the dynamic safe-area viewport');
assert.match(css,/\.luv-ai-chat\.lvx-command-surface \.lvx-command-input\{[^}]*margin:0/,'Experience must neutralize the legacy textarea margin without changing the legacy stylesheet');
assert.equal((css.match(/!important/g)||[]).length,27,'M14 Experience may not grow important-declaration debt');

assert.ok(safeRunner.includes('tests/m14.3-ai-composer-viewport-reachability.test.cjs'));
assert.ok(ownership.includes('tests/m14.3-ai-composer-viewport-reachability.test.cjs'));

console.log('M14.3 AI Composer Viewport / Experience Reachability: PASS');
console.log('Desktop / mobile / keyboard viewport containment: PASS');
console.log('Scrollable conversation + fixed composer actions: PASS');
console.log('New !important debt: 0');
