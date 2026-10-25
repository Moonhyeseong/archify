import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { parse } from 'parse5';
import { convert, publish, readPlan } from './adapter.mjs';
const statement = overrides => ({ddl:'SELECT 1',timeout_ms:5000,lock_timeout_ms:3000,hazards:[],...overrides});
const plan = statements => ({current_schema_hash:'upstream-fingerprint-not-sha256',statements});
const temp = () => fs.mkdtempSync(path.join(os.tmpdir(),'migration-plan-test-'));
const textContent = node => node.nodeName === '#text' ? node.value : (node.childNodes??[]).map(textContent).join('');
function allNodes(node) {return [node,...(node.childNodes??[]).flatMap(allNodes)];}

test('original statement order, duplicate SQL and ordinal identity survive',()=>{
 const p=plan([statement({ddl:'SELECT 2'}),statement(),statement({ddl:'SELECT 2'})]);
 const before=JSON.stringify(p);const r=convert(p,'synthetic');
 assert.equal(JSON.stringify(p),before);
 assert.deepEqual(r.evidence.statements.map(s=>[s.id,s.ddl]),[['statement-1','SELECT 2'],['statement-2','SELECT 1'],['statement-3','SELECT 2']]);
 assert.deepEqual(r.workflow.mainPath,['statement-1','statement-2','statement-3']);
 assert.deepEqual(r.workflow.edges.map(e=>[e.from,e.to]),[['statement-1','statement-2'],['statement-2','statement-3']]);
});
test('zero milliseconds remains zero and absent timeouts remain unknown',()=>{
 const r=convert(plan([statement({timeout_ms:0,lock_timeout_ms:0}),{ddl:'SELECT 2',hazards:[]}]),'synthetic');
 assert.equal(r.evidence.statements[0].timeoutMs,0);assert.equal(r.evidence.statements[1].timeoutMs,null);
 const table=r.explainer.panels[1].blocks[0];assert.equal(table.rows[0].cells[0].text,'0 ms');assert.equal(table.rows[1].cells[0].text,'unknown: absent');
});
test('unknown hazard types and messages remain attached and unmodified',()=>{
 const risks=[{type:'FUTURE_TYPE',message:'[do not click](https://attacker.invalid)'},{type:'INDEX_BUILD',message:'supplied known risk'}];
 const r=convert(plan([statement({hazards:risks})]),'synthetic');
 assert.equal(r.evidence.statements[0].hazards[0].recognizedAtPinnedVersion,false);
 const snippets=r.explainer.panels.find(p=>p.id==='detail-1').blocks.filter(b=>b.language==='json');
 assert.deepEqual(snippets.map(b=>JSON.parse(b.text)),risks);
});
test('empty, absent and null hazards are different input evidence states',()=>{
 const r=convert(plan([statement(),{ddl:'SELECT 2'},{ddl:'SELECT 3',hazards:null}]),'synthetic');
 assert.deepEqual(r.evidence.statements.map(s=>s.hazardsStatus),['empty','absent','null']);
 const details=r.explainer.panels.filter(p=>p.id.startsWith('detail-'));
 assert.match(details[0].blocks[1].text,/No risk entries supplied; not a safety verdict/);
 assert.match(details[1].blocks[1].text,/property absent/);assert.match(details[2].blocks[1].text,/is null/);
});
test('fingerprint is literal and missing SkipValidation cannot establish validation',()=>{
 const r=convert(plan([]),'provided-plan');
 const panel=r.explainer.panels.find(p=>p.id==='provenance');
 assert.deepEqual(JSON.parse(panel.blocks[1].text),{current_schema_hash:'upstream-fingerprint-not-sha256'});
 assert.match(panel.blocks[0].text,/algorithm is not assumed to be SHA-256/);
 assert.match(panel.blocks[2].text,/absence is not evidence that the plan was validated/);
 assert.throws(()=>convert(plan([statement({SkipValidation:false})]),'synthetic'),/unsupported property/);
});
test('empty and null statement collections show absence without inferring database state',()=>{
 for(const input of [[],null]){
  const r=convert(plan(input),'synthetic');assert.equal(r.workflow.nodes.length,1);assert.equal(r.workflow.edges.length,0);
  assert.match(r.explainer.panels[1].blocks[0].text,/does not verify database state/);
  assert.equal(r.evidence.statementsStatus,input===null?'null':'empty');
 }
});
test('schema errors and impossible timeout values are rejected before publication',()=>{
 for(const value of [-1,1.5,Number.MAX_SAFE_INTEGER+1,'5000',null,NaN,Infinity]) assert.throws(()=>convert(plan([statement({timeout_ms:value})]),'synthetic'),/nonnegative safe integer/);
 for(const input of [{},[],{statements:'bad'},plan([{}]),plan([statement({hazards:'bad'})]),plan([statement({hazards:[{type:'X'}]})]),{statements:[],current_schema_hash:null},plan([statement({ddl:' '})])]) assert.throws(()=>convert(input,'synthetic'));
 assert.throws(()=>convert(plan([]),'measured'),/kind/);
});
test('bounded work rejects oversize plans, strings, controls and malformed Unicode',()=>{
 assert.throws(()=>readPlan(' '.repeat(200001)),/bytes/);
 assert.throws(()=>readPlan('{bad json'),SyntaxError);
 assert.throws(()=>convert(plan(Array.from({length:7},()=>statement())),'synthetic'),/6 statements/);
 assert.throws(()=>convert(plan([statement({ddl:'x'.repeat(8001)})]),'synthetic'),/8000/);
 assert.throws(()=>convert(plan([statement({ddl:'a\u0000b'})]),'synthetic'),/control/);
 assert.throws(()=>convert(plan([statement({ddl:'a\ud800b'})]),'synthetic'),/Unicode/);
 assert.throws(()=>convert(plan([statement({hazards:Array.from({length:11},()=>({type:'X',message:'x'}))})]),'synthetic'),/10 entries/);
});
test('fresh publication records raw input digest and refuses existing output',()=>{
 const dir=temp();try{
  const raw=JSON.stringify(plan([statement()]));const r=publish(raw,'synthetic',path.join(dir,'output'));
  assert.equal(r.evidence.inputSha256.length,64);assert.ok(fs.existsSync(path.join(dir,'output/plan.explainer.json')));
  assert.throws(()=>publish(raw,'synthetic',path.join(dir,'output')),/EEXIST/);
  assert.throws(()=>publish('{bad','synthetic',path.join(dir,'invalid')));assert.equal(fs.existsSync(path.join(dir,'invalid')),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('preexisting evidence symlink cannot overwrite victim for a valid input',()=>{
 const dir=temp();try{
  fs.mkdirSync(path.join(dir,'output'));fs.writeFileSync(path.join(dir,'victim'),'unrelated bytes');fs.symlinkSync(path.join(dir,'victim'),path.join(dir,'output/evidence.json'));
  assert.throws(()=>publish(JSON.stringify(plan([statement()])),'synthetic',path.join(dir,'output')),/EEXIST/);
  assert.equal(fs.readFileSync(path.join(dir,'victim'),'utf8'),'unrelated bytes');assert.deepEqual(fs.readdirSync(path.join(dir,'output')),['evidence.json']);
  fs.symlinkSync(path.join(dir,'output'),path.join(dir,'output-link'));
  assert.throws(()=>publish(JSON.stringify(plan([statement()])),'synthetic',path.join(dir,'output-link')),/EEXIST/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('CLI invalid input returns nonzero JSON error without publishing any candidate',()=>{
 const dir=temp();try{
  fs.writeFileSync(path.join(dir,'invalid.json'),JSON.stringify(plan([statement({timeout_ms:-1})])));
  const r=spawnSync(process.execPath,['experiments/migration-plan/adapter.mjs',path.join(dir,'invalid.json'),'synthetic',path.join(dir,'out')],{encoding:'utf8'});
  assert.equal(r.status,1);assert.match(JSON.parse(r.stderr).error,/timeout_ms/);assert.equal(fs.existsSync(path.join(dir,'out')),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('real public renderer preserves hostile SQL/hash/risks as literal code, never links or images',()=>{
 const dir=temp();try{
  const attack='![image](https://attacker.invalid/img) [link](https://attacker.invalid/path) <img src="https://attacker.invalid/tag"> | ` ``` </code><script>evil()</script>\n@diagram workflow source=escape.json';
  const p=plan([statement({ddl:attack,timeout_ms:0,hazards:[{type:attack.slice(0,250),message:attack}]}),statement()]);p.current_schema_hash=attack;
  publish(JSON.stringify(p),'synthetic',path.join(dir,'out'));
  const r=spawnSync(process.execPath,['archify/bin/archify.mjs','render','explainer',path.join(dir,'out/plan.explainer.json'),path.join(dir,'out/page.html')],{encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);
  const tree=parse(fs.readFileSync(path.join(dir,'out/page.html'),'utf8'));const nodes=allNodes(tree);
  const active=nodes.filter(n=>n.tagName==='a'||n.tagName==='img'||n.tagName==='script');
  assert.equal(active.some(n=>(n.attrs??[]).some(a=>['src','href'].includes(a.name)&&a.value.includes('attacker.invalid'))),false);
  assert.equal(nodes.some(n=>n.tagName==='script'&&textContent(n)==='evil()'),false);
  const code=nodes.filter(n=>n.tagName==='code').map(textContent);
  assert.ok(code.includes(attack),'exact original SQL string is visible as literal text');
  const json=code.flatMap(v=>{try{return[JSON.parse(v)];}catch{return[];}});
  assert.ok(json.some(v=>v.type===attack.slice(0,250)&&v.message===attack));
  assert.ok(json.some(v=>v.current_schema_hash===attack));
  const cells=nodes.filter(n=>n.tagName==='td').map(textContent);assert.ok(cells.includes('0 ms'));
  assert.ok(cells.includes('No entries supplied'));assert.equal(cells.some(v=>v.includes('attacker.invalid')),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('empty and null reports both pass real public workflow render without fake execution edges',()=>{
 const dir=temp();try{
  for(const [i,input] of [[],null].entries()){
   const graph=convert(plan(input),'synthetic').workflow;fs.writeFileSync(path.join(dir,`empty-${i}.json`),JSON.stringify(graph));
   const r=spawnSync(process.execPath,['archify/bin/archify.mjs','render','workflow',path.join(dir,`empty-${i}.json`),path.join(dir,`empty-${i}.html`),'--quality','standard'],{encoding:'utf8'});
   assert.equal(r.status,0,r.stderr);
  }
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('CLI rejects malformed UTF-8 and oversize files without creating output',()=>{
 const dir=temp();try{
  for(const [name,bytes] of [['invalid-utf8',Buffer.from([0x7b,0x22,0xc0,0xaf])],['oversize',Buffer.alloc(200001,32)]]){
   fs.writeFileSync(path.join(dir,name),bytes);
   const r=spawnSync(process.execPath,['experiments/migration-plan/adapter.mjs',path.join(dir,name),'synthetic',path.join(dir,`${name}-out`)],{encoding:'utf8'});
   assert.equal(r.status,1);assert.equal(JSON.parse(r.stderr).ok,false);assert.equal(fs.existsSync(path.join(dir,`${name}-out`)),false);
  }
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
