const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const version=fs.readFileSync(path.join(root,'intelligence/kernel/version.js'),'utf8');
const build=(version.match(/build:'([^']+)'/)||[])[1],core=(version.match(/core:'([^']+)'/)||[])[1],name=(version.match(/name:'([^']+)'/)||[])[1],channel=(version.match(/channel:'([^']+)'/)||[])[1],builtAt=(version.match(/builtAt:'([^']+)'/)||[])[1];
if(!build||!core||!name||!channel||!builtAt)throw new Error('kernel version is incomplete');
if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(builtAt))throw new Error('kernel builtAt is not a UTC release timestamp');
const checks={
 'sw.js':[`luvia-shell-v${build}`],
 'index.html':[build,'core/media/media-metadata.js','core/media/media-core.js'],
 'force-update.html':[build],
 'core/diagnostics/media-readiness.js':[build,core],
 'CURRENT-BUILD.md':[build,core,name,channel]
};
for(const [file,needles] of Object.entries(checks)){const text=fs.readFileSync(path.join(root,file),'utf8');for(const needle of needles)if(!text.includes(needle))throw new Error(`${file} missing ${needle}`)}
console.log(`Build ${build} / Core ${core} release consistency: OK`);
