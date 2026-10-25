import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {parse} from 'parse5';
import {convert,publish} from './adapter.mjs';
const originalReport=JSON.parse(fs.readFileSync('experiments/test-context-map/fixtures/synthetic.coverage.json','utf8'));
const originalSidecar=JSON.parse(fs.readFileSync('experiments/test-context-map/fixtures/synthetic.selection.json','utf8'));
const clone=value=>structuredClone(value);
const bytes=value=>JSON.stringify(value,null,2)+'\n';
const sha=raw=>createHash('sha256').update(raw).digest('hex');
const fresh=()=>({report:clone(originalReport),sidecar:clone(originalSidecar)});
function bound(report,sidecar){const raw=bytes(report);const hash=sha(raw);sidecar.reportBinding.sha256=hash;sidecar.selectionBinding.reportSha256=hash;return {raw,hash};}
function result(report,sidecar){const{hash}=bound(report,sidecar);return convert(report,sidecar,hash);}
const temp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'context-map-test-'));
const walk=node=>[node,...(node.childNodes??[]).flatMap(walk)];
const content=node=>node.nodeName==='#text'?node.value:(node.childNodes??[]).map(content).join('');
function renderPage(report,sidecar,dir){const{raw}=bound(report,sidecar);const out=path.join(dir,'output');publish(raw,bytes(sidecar),out);const r=spawnSync(process.execPath,['archify/bin/archify.mjs','render','explainer',path.join(out,'matrix.explainer.json'),path.join(out,'matrix.html')],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return {out,html:fs.readFileSync(path.join(out,'matrix.html'),'utf8')};}

test('selected rows retain all six states and unavailable file/line distinctions',()=>{
 const{report,sidecar}=fresh();const r=result(report,sidecar);
 assert.deepEqual(r.projection.rows.map(row=>row.states),[['mapped'],['unattributed'],['unknown'],['missing'],['excluded'],['mapped'],['unavailable'],['unavailable']]);
 assert.match(r.projection.rows[6].reason,/line not classified/);assert.match(r.projection.rows[7].reason,/file not present/);
 assert.equal(r.projection.rows[1].unattributedEmpty,true);assert.equal(r.projection.rows[2].unattributedEmpty,false);
});
test('parameterized pipe test ID and static+dynamic full labels use exact mapping, not splitting',()=>{
 const{report,sidecar}=fresh();const r=result(report,sidecar);
 assert.equal(r.projection.contextGroups[0].testId,'tests/test_orders.py::test_total[a|b]');
 assert.equal(r.projection.contextGroups[0].phase,'run');assert.equal(r.projection.contextGroups[0].contexts.length,2);
 assert.equal(r.projection.rows[0].mapped.length,1,'same test/phase gets one column for two exact labels');
 assert.equal(r.projection.contextGroups[1].phase,'setup');
});
test('empty context and unmapped nonempty labels never gain guessed identities',()=>{
 const{report,sidecar}=fresh();sidecar.contextMap=[];const r=result(report,sidecar);
 assert.equal(r.projection.contextGroups.length,0);assert.deepEqual(r.projection.rows[0].states,['unknown']);assert.deepEqual(r.projection.rows[1].states,['unattributed']);
 assert.equal(r.projection.rows[2].unknownLabels[0],'opaque-worker-context|not-a-known-test');
});
test('mixed observed labels keep mapped, empty and unknown attributions together',()=>{
 const{report,sidecar}=fresh();report.files['src/orders.py'].contexts['12'].push('','unmapped-label');
 const r=result(report,sidecar);assert.deepEqual(r.projection.rows[0].states,['mapped','unattributed','unknown']);assert.equal(r.projection.rows[0].unknownLabels[0],'unmapped-label');
});
test('excluded raw contexts do not count as mapped test execution',()=>{
 const{report,sidecar}=fresh();report.files['src/orders.py'].contexts['16']=[sidecar.contextMap[0].context];
 const r=result(report,sidecar);assert.deepEqual(r.projection.rows[4].states,['excluded']);assert.deepEqual(r.projection.rows[4].mapped,[]);
});
test('report digest, selection digest, claimed revision/run and exporter mismatches refuse publication',()=>{
 const{report,sidecar}=fresh();const{raw,hash}=bound(report,sidecar);
 for(const mutate of [s=>s.reportBinding.sha256='0'.repeat(64),s=>s.selectionBinding.reportSha256='0'.repeat(64),s=>s.selectionBinding.sourceRevision='b'.repeat(40),s=>s.selectionBinding.runId='other-run',s=>s.reportBinding.exporterVersion='other-version',s=>s.reportBinding.sourceRevision=['a'.repeat(40)]]){const s=clone(sidecar);mutate(s);assert.throws(()=>convert(report,s,hash),/binding|revision/);}
 const dir=temp();try{const s=clone(sidecar);s.reportBinding.sha256='0'.repeat(64);assert.throws(()=>publish(raw,bytes(s),path.join(dir,'out')),/mismatch/);assert.equal(fs.existsSync(path.join(dir,'out')),false);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('show_contexts and file/executed-line contexts are mandatory, never zero attribution',()=>{
 for(const mutate of [r=>r.meta.format=2,r=>r.meta.show_contexts=false,r=>delete r.meta.show_contexts,r=>delete r.files['src/orders.py'].contexts,r=>delete r.files['src/orders.py'].contexts['12'],r=>r.files['src/orders.py'].contexts['12']=[]]){const{report,sidecar}=fresh();mutate(report);assert.throws(()=>result(report,sidecar));}
});
test('contradictory sets, duplicate lines and observed contexts on missing lines fail',()=>{
 for(const mutate of [d=>d.missing_lines.push(12),d=>d.excluded_lines.push(15),d=>d.executed_lines.push(12),d=>d.contexts['15']=['observed-label'],d=>d.contexts['01']=['x'],d=>d.contexts['12'].push(d.contexts['12'][0])]){const{report,sidecar}=fresh();mutate(report.files['src/orders.py']);assert.throws(()=>result(report,sidecar));}
});
test('duplicate/conflicting path and exact context-map entries refuse instead of merging',()=>{
 for(const mutate of [s=>s.fileMap.push(clone(s.fileMap[0])),s=>s.fileMap.push({...s.fileMap[0],sourcePath:'other.py'}),s=>s.selections.push(clone(s.selections[0])),s=>s.selections[0].lines.push(12),s=>s.contextMap.push(clone(s.contextMap[0])),s=>s.contextMap[0].phase='call',s=>s.contextMap[0].context='']){const{report,sidecar}=fresh();mutate(sidecar);assert.throws(()=>result(report,sidecar));}
});
test('selection order is preserved and undeclared source mapping is refused',()=>{
 const{report,sidecar}=fresh();sidecar.selections[0].lines=[17,12,13];const r=result(report,sidecar);assert.deepEqual(r.projection.rows.slice(0,3).map(row=>row.line),[17,12,13]);
 sidecar.selections[0].sourcePath='unmapped.py';assert.throws(()=>result(report,sidecar),/unmapped/);
});
test('report field pointer preserves exact file key and source is never promoted to verified',()=>{
 const{report,sidecar}=fresh();const r=result(report,sidecar);assert.deepEqual(r.projection.rows[0].provenance.contextLookupPath,['files','src/orders.py','contexts','12']);assert.equal(r.projection.rows[0].provenance.contextLookupPointer,'/files/src~1orders.py/contexts/12');
 assert.equal(r.projection.sourceStatus,'not-verified');assert.ok(r.projection.rows.every(row=>row.sourceStatus==='not-verified'));assert.match(r.projection.testResults,/not-consumed/);
});
test('explicit input limits refuse oversized selections, context counts and invalid line numbers',()=>{
 const{report,sidecar}=fresh();sidecar.selections[0].lines=Array.from({length:20},(_,i)=>i+1);assert.throws(()=>result(report,sidecar),/20 selected/);
 for(const n of [0,-1,1.5,NaN,Number.MAX_SAFE_INTEGER]){const f=fresh();f.sidecar.selections[0].lines=[n];assert.throws(()=>result(f.report,f.sidecar),/line number/);}
 const f=fresh();f.report.files['src/orders.py'].contexts['12']=Array.from({length:11},(_,i)=>`context-${i}`);assert.throws(()=>result(f.report,f.sidecar),/10 distinct/);
});
test('converter/publication cannot read source files or fetch paths/URLs from report/sidecar',()=>{
 const{report,sidecar}=fresh();const{raw}=bound(report,sidecar);const dir=temp();const read=fs.readFileSync;const fetch=globalThis.fetch;
 try{fs.readFileSync=()=>{throw new Error('Unexpected external file read');};globalThis.fetch=()=>{throw new Error('Unexpected external URL access');};publish(raw,bytes(sidecar),path.join(dir,'out'));}
 finally{fs.readFileSync=read;globalThis.fetch=fetch;fs.rmSync(dir,{recursive:true,force:true});}
 for(const unsafe of ['/tmp/never-read.py','../never-read.py','https://attacker.invalid/code.py','C:\\private.py','src//alias.py']){const f=fresh();f.sidecar.fileMap[0].sourcePath=unsafe;f.sidecar.selections[0].sourcePath=unsafe;assert.throws(()=>result(f.report,f.sidecar),/relative path/);}
});
test('real renderer treats hostile test IDs, contexts and paths as literals with no active links/images',()=>{
 const{report,sidecar}=fresh();const attack='![x](https://attacker.invalid/i) [x](https://attacker.invalid/p) <img src="https://attacker.invalid/tag"> ` | * ** ~~ \\ </code><script>evil()</script>';
 const hostilePath='src/<img src=x>.py';report.files[hostilePath]=report.files['src/orders.py'];delete report.files['src/orders.py'];sidecar.fileMap[0]={sourcePath:hostilePath,reportPath:hostilePath};sidecar.selections[0].sourcePath=hostilePath;
 const old=sidecar.contextMap[0].context;sidecar.contextMap[0].context=attack;sidecar.contextMap[0].testId=attack;report.files[hostilePath].contexts['12']=[attack];sidecar.contextMap=sidecar.contextMap.filter((entry,i)=>i===0||entry.context!==old);
 report.files[hostilePath].contexts['14']=[attack+'unknown'];const dir=temp();try{
  const{html}=renderPage(report,sidecar,dir);const nodes=walk(parse(html));const cells=nodes.filter(n=>n.tagName==='td').map(content);
  assert.ok(cells.includes(hostilePath),'source path remains exact literal text, not an image');
  assert.ok(cells.includes(attack),'test ID remains exact text in final cell');assert.ok(cells.includes(JSON.stringify([attack+'unknown'])));
  assert.equal(nodes.some(n=>(n.attrs??[]).some(a=>['src','href'].includes(a.name)&&a.value.includes('attacker.invalid'))),false);
  assert.equal(nodes.some(n=>n.tagName==='script'&&content(n)==='evil()'),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('no mapped or unknown labels still render a valid matrix without empty comparison rows',()=>{
 for(const lines of [[13],[15,16,99]]){const{report,sidecar}=fresh();sidecar.contextMap=[];sidecar.selections=[{sourcePath:'src/orders.py',lines}];const dir=temp();try{const{html}=renderPage(report,sidecar,dir);assert.ok(html.includes('not verified'));}finally{fs.rmSync(dir,{recursive:true,force:true});}}
});
test('fresh destination rejects existing directory and symlink, preserving unrelated victim',()=>{
 const{report,sidecar}=fresh();const{raw}=bound(report,sidecar);const dir=temp();try{
  fs.mkdirSync(path.join(dir,'out'));fs.writeFileSync(path.join(dir,'victim'),'unrelated bytes');fs.symlinkSync(path.join(dir,'victim'),path.join(dir,'out/projection.json'));
  assert.throws(()=>publish(raw,bytes(sidecar),path.join(dir,'out')),/EEXIST/);assert.equal(fs.readFileSync(path.join(dir,'victim'),'utf8'),'unrelated bytes');assert.deepEqual(fs.readdirSync(path.join(dir,'out')),['projection.json']);
  fs.symlinkSync(path.join(dir,'out'),path.join(dir,'linked-out'));assert.throws(()=>publish(raw,bytes(sidecar),path.join(dir,'linked-out')),/EEXIST/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('CLI invalid input and malformed UTF-8 return nonzero without publishing',()=>{
 const dir=temp();try{for(const[name,data]of[['invalid',Buffer.from('{bad json')],['utf8',Buffer.from([0xc0,0xaf])],['large',Buffer.alloc(500001,32)]]){
  fs.writeFileSync(path.join(dir,name),data);const r=spawnSync(process.execPath,['experiments/test-context-map/adapter.mjs',path.join(dir,name),'experiments/test-context-map/fixtures/synthetic.selection.json',path.join(dir,`${name}-out`)],{encoding:'utf8'});assert.equal(r.status,1);assert.equal(JSON.parse(r.stderr).ok,false);assert.equal(fs.existsSync(path.join(dir,`${name}-out`)),false);
 }}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('missing/excluded/unavailable provenance never pretends absent context lookup is existing evidence',()=>{
 const{report,sidecar}=fresh();const rows=result(report,sidecar).projection.rows;
 assert.equal(rows[3].provenance.contextLookupPresent,false);
 assert.deepEqual(rows[3].provenance.classificationEvidence,[{pointer:'/files/src~1orders.py/missing_lines/0',value:15}]);
 assert.deepEqual(rows[4].provenance.classificationEvidence,[{pointer:'/files/src~1orders.py/excluded_lines/0',value:16}]);
 assert.equal(rows[6].provenance.classificationEvidence.length,3);assert.ok(rows[6].provenance.classificationEvidence.every(e=>e.containsSelectedLine===false));
 assert.deepEqual(rows[7].provenance.classificationEvidence,[{lookupPointer:'/files/src~1absent.py',present:false}]);
});
