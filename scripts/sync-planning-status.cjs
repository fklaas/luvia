'use strict';
// Documentation tooling only: the JSON plan owns the current status and next step.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const START = '<!-- LUVIA-CURRENT-STATUS:START -->';
const END = '<!-- LUVIA-CURRENT-STATUS:END -->';
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n?/g, '\n');

function renderCurrentStatus(plan) {
  const work = plan.currentWork;
  if (!work?.stage || !work.nextStep?.title || !work.nextStep.acceptance?.length) {
    throw new Error('Current stage and one concrete next step with acceptance are required.');
  }
  return [START, '## Aktueller Stand und nächster Schritt', '',
    `**Stand ${plan.snapshot}:** Integration **${plan.app}**, Core **${plan.core}**. ${work.stage}`, '',
    `**Zuletzt geliefert:** ${work.delivered}`, '',
    `**Nächster Schritt (${work.nextStep.status}): ${work.nextStep.title}.** ${work.nextStep.reason}`, '',
    '**Abnahme dieses Schritts:**', '',
    ...work.nextStep.acceptance.map(item => `- ${item}`), '',
    `**Danach:** ${work.after}`, '',
    `**Weiter offen:** ${work.open}`, '',
    'Aktuelle Paketstände und nächste Abschlussnachweise: docs/planning/status-plan.v1.json. Nach jedem Arbeitsabschnitt Stand, Beleg, Restumfang und genau einen nächsten Schritt gemeinsam fortschreiben.',
    END].join('\n');
}

function projectDocument(file, source, plan) {
  const block = renderCurrentStatus(plan);
  const start = source.indexOf(START), end = source.indexOf(END);
  if (start < 0 && end < 0) {
    if (!/^# .+\n/.test(source)) throw new Error(`${file}: missing document title`);
    source = source.replace(/^(# .+\n)\n*/, `$1\n${block}\n\n`);
  } else {
    if (start < 0 || end < start || source.indexOf(START, start + 1) >= 0 || source.indexOf(END, end + 1) >= 0) {
      throw new Error(`${file}: invalid current status markers`);
    }
    source = source.slice(0, start) + block + source.slice(end + END.length);
  }
  if (['docs/planning/MASTERFAHRPLAN-v6.md', 'docs/planning/STATUSPLAN-2026-09-04.md'].includes(file)) {
    for (const row of plan.packages) {
      const heading = new RegExp(`^### ${row.id} [^\\n]+\\n\\n\\*\\*Stand:\\*\\* [^\\n]+\\n\\n[^\\n]+\\n\\n\\*\\*Nächster Abschlussnachweis:\\*\\* [^\\n]+\\n\\n\\*\\*Erhaltener technischer Umfang:\\*\\* [^\\n]+`, 'm');
      if (!heading.test(source)) throw new Error(`${file}: missing or malformed ${row.id}`);
      source = source.replace(heading, () => [
        `### ${row.id} ${row.title}`, '',
        `**Stand:** ${row.status.replaceAll('_', ' ')}. **Zuständig:** ${row.owner}. **Einordnung:** ${row.roadmap}.`, '',
        row.evidence, '', `**Nächster Abschlussnachweis:** ${row.nextAcceptance}`, '',
        `**Erhaltener technischer Umfang:** ${row.scope}`
      ].join('\n'));
      const tableRow = new RegExp(`^\\| ${row.id} \\|[^\\n]+`, 'm');
      source = source.replace(tableRow, () => `| ${row.id} | ${row.block} | ${row.status.replaceAll('_', ' ')} | ${row.title} |`);
    }
  }
  return source;
}

function sync(write = false) {
  const plan = JSON.parse(read('docs/planning/status-plan.v1.json'));
  const files = plan.currentDocuments;
  if (!files?.length || new Set(files).size !== files.length) throw new Error('Active documents must be unique.');
  const pending = [];
  for (const file of files) {
    if (!file.endsWith('.md') || file.includes('..') || file.includes('archive/') || path.isAbsolute(file)) {
      throw new Error(`Not an active repository document: ${file}`);
    }
    const before = read(file), after = projectDocument(file, before, plan);
    if (before !== after) pending.push({ file, after });
  }
  // Validate all projections before writing any file.
  if (write) for (const { file, after } of pending) fs.writeFileSync(path.join(root, file), after);
  return { total: files.length, changed: pending.map(item => item.file) };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !['--write', '--check'].includes(args[0])) {
    throw new Error('Usage: node scripts/sync-planning-status.cjs --write|--check');
  }
  const result = sync(args[0] === '--write');
  if (args[0] === '--check' && result.changed.length) {
    console.error(`Stale planning documents: ${result.changed.join(', ')}`);
    process.exitCode = 1;
  } else console.log(`Planning status: ${result.total} active documents, ${result.changed.length} updated, PASS`);
}

module.exports = { renderCurrentStatus, projectDocument, sync };
