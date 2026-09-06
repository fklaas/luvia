'use strict';

const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');

const root=path.resolve(__dirname,'..');
const args=Object.fromEntries(process.argv.slice(2).map(value=>value.split('=',2)).filter(parts=>parts.length===2));
const from=String(args['--from']||''),to=String(args['--to']||''),coreFrom=String(args['--core-from']||''),coreTo=String(args['--core-to']||'');
if(!/^\d+(?:\.\d+){2,3}$/.test(from)||!/^\d+(?:\.\d+){2,3}$/.test(to)||!/^\d+\.\d+\.\d+$/.test(coreFrom)||!/^\d+\.\d+\.\d+$/.test(coreTo))throw new Error('Usage: node scripts/bump-runtime-release.cjs --from=x.y.z[.n] --to=x.y.z[.n] --core-from=x.y.z --core-to=x.y.z');
if(from===to||coreFrom===coreTo)throw new Error('Source and target versions must differ.');

const textExtensions=new Set(['.cjs','.css','.html','.js','.json','.md','.mjs','.ts']);
const escaped=value=>value.replaceAll('.',String.raw`\.`);
const tracked=cp.execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const changed=[];
for(const relative of tracked){
  // Release notes and status plans are historical evidence. A runtime cache-key
  // bump must never rewrite an accepted older release inside those documents.
  if(relative.endsWith('.md')||relative==='docs/planning/status-plan.v1.json'||relative.includes(`luvia-runtime-${from}.bundle.js`)||relative.includes(`luvia-runtime-precontext-${from}.bundle.js`)||relative.includes(`luvia-runtime-postcontext-${from}.bundle.js`)||!textExtensions.has(path.extname(relative)))continue;
  const absolute=path.join(root,relative),source=fs.readFileSync(absolute,'utf8'),next=source.replaceAll(from,to).replaceAll(coreFrom,coreTo).replaceAll(escaped(from),escaped(to)).replaceAll(escaped(coreFrom),escaped(coreTo)).replaceAll(`luvia-shell-v${from}`,`luvia-shell-v${to}`);
  if(next===source)continue;
  fs.writeFileSync(absolute,next,'utf8');changed.push(relative);
}
process.stdout.write(`Runtime release bump ${from} -> ${to}, Core ${coreFrom} -> ${coreTo}: ${changed.length} tracked text files\n${changed.join('\n')}\n`);
