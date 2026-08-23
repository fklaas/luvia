/* M8.5 – dashboard Intelligence Contract adoption and transparency */
const fs=require('fs'),assert=require('assert');
const dashboard=fs.readFileSync('core/ai/ai-dashboard-service.js','utf8');
const core=fs.readFileSync('core/ai/ai-core.js','utf8');
const domainCore=fs.readFileSync('core/intelligence/intelligence-domain-contract-core.js','utf8');
const app=fs.readFileSync('app/app-shell.js','utf8');
for(const token of ["id:'aiBrain'",'dashboard.brief','data-ai-transparency-open','data-ai-ask-open','So denkt Luvia'])assert(dashboard.includes(token),`dashboard Intelligence missing ${token}`);
for(const method of ['ask','recommend','rank','explain','summarize','proposeAction','learnFromEvent','subscribe'])assert(core.includes(method),`transitional LuviaAI facade missing ${method}`);
for(const capability of ['brain.ask','discovery.plan','discovery.rank','dashboard.brief','timeline.propose','memory.extract','text.summarize'])assert(domainCore.includes(capability),`owner capability missing ${capability}`);
assert(app.includes('luvia:dashboard-widget-refresh'),'app shell does not refresh Intelligence widget');
assert(app.includes('lv-ai-global-trigger')&&app.includes('data-ai-ask-open'),'global Luvia Intelligence trigger is not available across app views');
assert(dashboard.includes('openChat:askModal'),'global chat is not exported by the Intelligence service');
assert(dashboard.includes('openTransparency:transparencyModal'),'Intelligence Transparency is not exported');
assert(!dashboard.includes('data-ai-timeline-check'),'dashboard must not expose private Timeline execution');
assert(!dashboard.includes('LuviaTripContext'),'dashboard must read Trip through trip.v1');
console.log('Dashboard Intelligence Contract and Transparency: OK');
