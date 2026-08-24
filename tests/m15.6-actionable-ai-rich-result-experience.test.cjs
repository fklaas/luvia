'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const css=fs.readFileSync('core/experience/experience-foundation.css','utf8');

for(const needle of [
  '/* M15 actionable Intelligence',
  '.lvx-rich-result{',
  '.lvx-place-grid{',
  '.lvx-place-card{',
  '.lvx-place-card figure img{',
  '.lvx-rich-action{',
  'min-height:var(--luvia-layout-touch-minimum)',
  '.lvx-day-grid{',
  '.lvx-day-card{',
  '.lvx-command-receipt{',
  '.lvx-command-receipt.is-failed{',
  '@keyframes lvx-rich-result-enter',
  'scroll-snap-type:x mandatory',
  '.lvx-rich-action{min-height:48px}',
  '@media(prefers-reduced-motion:reduce)',
  '.lvx-rich-result,.lvx-command-receipt,.lvx-place-card figure img,.lvx-rich-action'
])assert.ok(css.includes(needle),`Rich Result Experience missing ${needle}`);

assert.equal((css.match(/!important/g)||[]).length,27,'M15 rich results may not grow important-declaration debt');
assert.match(css,/\.lvx-rich-action\{[^}]*var\(--luvia-color-action-primary\)/,'owner actions must inherit the active Trip accent token');
assert.match(css,/\.lvx-rich-result\{[^}]*var\(--luvia-color-action-primary-soft\)/,'rich result surface must inherit the active Trip accent soft token');
assert.match(css,/\.lvx-place-grid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'desktop cards must use a bounded two-column layout');
assert.match(css,/@media\(max-width:720px\)[\s\S]*\.lvx-place-card\{flex:0 0 min\(82vw,310px\);scroll-snap-align:start\}/,'mobile cards must remain reachable through horizontal snap scrolling');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*\.lvx-rich-action:hover\{transform:none\}/,'rich result motion must have a reduced-motion equivalent');

console.log('M15.6 Actionable AI Rich Result Experience: PASS');
console.log('Trip accent token inheritance: PASS');
console.log('Desktop/mobile/touch/reduced-motion: PASS');
console.log('New !important debt: 0');
