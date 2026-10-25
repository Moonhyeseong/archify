import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const base = 'experiments/change-coupling';
// Every run owns a newly-created directory; existing results are preserved.
const out = `${base}/run-${randomUUID()}`;
const raw = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-change-coupling-'));
const records = [];
function run(args, name) {
  const r = spawnSync(process.execPath, args, {cwd:root,encoding:'utf8'});
  fs.writeFileSync(path.join(raw, `${name}.stdout`), r.stdout ?? '');
  fs.writeFileSync(path.join(raw, `${name}.stderr`), r.stderr ?? '');
  records.push({command:['node', ...args.map(v=>v === raw ? '<temporary-receipt-directory>' : v)], exitCode:r.status});
  if (r.status !== 0) throw new Error(`${name} failed; inspect local receipts at ${raw}`);
  return r.stdout;
}
try {
  run([`${base}/adapter.mjs`, `${base}/fixtures/synthetic.csv`, `${base}/fixtures/synthetic.metadata.json`,out], 'adapter');
  run(['archify/bin/archify.mjs','render','architecture',`${out}/coupling.architecture.json`,`${out}/coupling.html`,'--quality','standard'],'render');
  const summary = JSON.parse(run(['archify/bin/archify.mjs','finalize','explainer',`${out}/coupling.archify.md`,`${out}/explainer.html`,'--out-dir',raw,'--json'],'finalize'));
  const digest = file => createHash('sha256').update(fs.readFileSync(path.join(root,out,file))).digest('hex');
  fs.writeFileSync(path.join(root,out,'portable-validation.json'), JSON.stringify({
    recordType:'Portable validation summary, not an original Archify receipt',
    baseRevision:'82c7e0f0', fixture:'synthetic; no repository measured; no Code Maat process executed',
    commands:records, gates:summary.gates, visualReview:summary.visualReview,
    artifacts:Object.fromEntries(['coupling.architecture.json','coupling.html','coupling.archify.md','explainer.html','evidence.json'].map(file=>[file,{sha256:digest(file)}])),
    historicalFailures:[{stage:'render',reason:'First draft omitted meta.output.'},{stage:'finalize',reason:'First draft native node label overflow; fixed by explicit node size.'}],
    rawReceiptPolicy:'Original local receipts retained outside checkout. This summary selects phase results and hashes without rewriting original receipts.',
  },null,2)+'\n');
  for (const name of fs.readdirSync(path.join(root,out))) {
    if (/\.delivery\.json$|\.finalize(-summary)?\.json$|^finalize\./.test(name)) fs.renameSync(path.join(root,out,name), path.join(raw,name));
  }
  console.log(JSON.stringify({portableSummary:`${out}/portable-validation.json`,rawReceipts:raw,ok:summary.ok}));
} catch(error) { console.error(error.message); process.exitCode=1; }
