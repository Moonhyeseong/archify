import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const base='experiments/migration-plan';
const output=`${base}/run-${randomUUID()}`;
const raw=fs.mkdtempSync(path.join(os.tmpdir(),'archify-migration-plan-'));
const commands=[];
function run(args,name) {
  const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});
  fs.writeFileSync(path.join(raw,`${name}.stdout`),r.stdout??'',{flag:'wx'});
  fs.writeFileSync(path.join(raw,`${name}.stderr`),r.stderr??'',{flag:'wx'});
  commands.push({command:['node',...args.map(v=>v===raw?'<temporary-receipt-directory>':v)],exitCode:r.status});
  if(r.status!==0) throw new Error(`${name} failed; local original receipts/logs: ${raw}`);
  return r.stdout;
}
try {
  run([`${base}/adapter.mjs`,`${base}/fixtures/synthetic.plan.json`,'synthetic',output],'adapter');
  run(['archify/bin/archify.mjs','render','workflow',`${output}/plan.workflow.json`,`${output}/plan.html`,'--quality','standard'],'render');
  const summary=JSON.parse(run(['archify/bin/archify.mjs','finalize','explainer',`${output}/plan.explainer.json`,`${output}/explainer.html`,'--out-dir',raw,'--json'],'finalize'));
  const files=['plan.workflow.json','plan.explainer.json','evidence.json','plan.html','explainer.html'];
  fs.writeFileSync(path.join(root,output,'portable-validation.json'),JSON.stringify({recordType:'Portable validation summary; not an original Archify receipt',baseRevision:'82c7e0f0',fixture:'Original synthetic plan; no database, SQL or planner executed',commands,gates:summary.gates,visualReview:summary.visualReview,artifacts:Object.fromEntries(files.map(file=>[file,{sha256:createHash('sha256').update(fs.readFileSync(path.join(root,output,file))).digest('hex')}]))},null,2)+'\n',{flag:'wx'});
  for(const name of fs.readdirSync(path.join(root,output))) if(/\.delivery\.json$/.test(name)) fs.renameSync(path.join(root,output,name),path.join(raw,name));
  console.log(JSON.stringify({ok:summary.ok,output,rawReceipts:raw}));
} catch(error){console.error(error.message);process.exitCode=1;}
