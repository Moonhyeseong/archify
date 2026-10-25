import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { build } from './review-map.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../..');
const raw = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-review-map-evidence-'));
const example = JSON.parse(fs.readFileSync(path.join(directory, 'example.review.json'), 'utf8'));
const outputRoot = path.resolve(process.argv[2] || path.join(directory, 'output'));
fs.mkdirSync(outputRoot); // Fresh output only; never replace an existing directory/alias.
const summary = { version: 1, kind: 'portable-evidence-summary', note: 'A projection of real local command receipts, not an original delivery/browser receipt. Raw receipts remain outside the checkout and contain local paths.',
  baseline: '82c7e0f089a02a4d514714adf37dc2061682da5f', historicalBase: example.base, historicalHead: example.head,
  scope: 'Experiment mapping and actual Archify rendering; no execution of historical project tests; no human acceptance.', runs: [] };
for (const [name, input] of [['complete', 'example.review.json'], ['omitted', 'example-omitted.review.json']]) {
  const output = path.join(outputRoot, name);
  const mapping = build(root, path.join(directory, input), output);
  const runRaw = path.join(raw, name); fs.mkdirSync(runRaw);
  const relative = path.relative(root, output);
  const args = ['archify/bin/archify.mjs', 'finalize', 'explainer', `${relative}/explainer.json`, `${relative}/review.html`, '--browser-check', '--out-dir', runRaw, '--json'];
  const result = spawnSync(process.execPath, args, { cwd: root, env: process.env, encoding: 'utf8', timeout: 180000, maxBuffer: 4 * 1024 * 1024 });
  fs.writeFileSync(path.join(runRaw, 'command-stdout.json'), result.stdout || '');
  fs.writeFileSync(path.join(runRaw, 'command-stderr.txt'), result.stderr || '');
  const receipt = result.stdout ? JSON.parse(result.stdout) : {};
  for (const file of fs.readdirSync(output)) if (/delivery|browser-check|finalize/.test(file)) fs.renameSync(path.join(output, file), path.join(runRaw, file));
  const hashes = Object.fromEntries(['review.html', 'mapping.json', 'explainer.json', 'diagram.json'].filter(file => fs.existsSync(path.join(output, file))).map(file => [file, createHash('sha256').update(fs.readFileSync(path.join(output, file))).digest('hex')]));
  summary.runs.push({ name, input, mappingExitCode: mapping.mappingComplete ? 0 : 1, mapping: mapping.summary,
    renderCommand: 'node archify/bin/archify.mjs finalize explainer <output>/explainer.json <output>/review.html --browser-check --out-dir <private-evidence-dir> --json',
    commandExitCode: result.status, gates: receipt.gates || null, hashes,
    diagnostics: [...new Map((receipt.diagnostics || []).map(d => [d.code, { code: d.code, severity: d.severity, message: d.message }])).values()] });
  console.log(`${name}: mapping=${mapping.mappingComplete ? 'complete' : 'incomplete'}, finalize=${result.status}, gates=${JSON.stringify(receipt.gates)}`);
}
fs.writeFileSync(path.join(outputRoot, 'evidence-summary.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(`Private raw receipts: ${raw}`);
// Keep the real browser failure visible instead of reporting a successful build.
process.exitCode = summary.runs.some(run => run.commandExitCode !== 0) ? 1 : 0;
