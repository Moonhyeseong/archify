import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash}from'node:crypto';
import {spawnSync}from'node:child_process';
import {compileSnapshot,gate,matrixReading,writeBundle}from'./ci-reader.mjs';
const fixture=()=>JSON.parse(fs.readFileSync(new URL('./fixtures/release.snapshot.json',import.meta.url)));
const bad=(mutate,code)=>{const v=fixture();mutate(v);assert.throws(()=>compileSnapshot(v),e=>e.code===code);};
test('real fixed source and curated snapshot agree on identities, ranges, needs and exact if',()=>{
 const v=fixture(),raw=fs.readFileSync(new URL('./fixtures/release.yml',import.meta.url));assert.equal(createHash('sha256').update(raw).digest('hex'),v.source.sha256);
 const lines=raw.toString().split('\n');for(const j of v.jobs){assert.equal(lines[j.sourceLines[0]-1],`  ${j.id}:`);const block=lines.slice(j.sourceLines[0]-1,j.sourceLines[1]);const actual=block.find(line=>line.startsWith('    if: '));assert.equal(actual?.slice(8),j.condition.raw);const need=block.find(line=>line.startsWith('    needs: '));assert.deepEqual(need?[need.slice(11)]:[],j.needs);}
 const out=compileSnapshot(v);assert.deepEqual(out.architecture.connections.map(e=>[e.from,e.to]),[['quality','package'],['package','publish']]);assert.equal(out.receipt.jobs[0].matrix.combinations,3);assert.equal(out.receipt.jobs[1].matrix.kind,'none');assert.ok(out.receipt.jobs.every(j=>j.runOutcome.startsWith('unknown')));
});
test('missing if means default success only when source absence is explicit, never unconditional',()=>{
 assert.match(gate({availability:'verified-absent'}),/implicit success/);assert.match(gate({availability:'unavailable'}),/unknown/);
 assert.match(gate({availability:'provided',raw:"github.ref == 'main'"}),/implicit success/);
 assert.match(gate({availability:'provided',raw:'${{ always() }}'}),/explicit status/);
 assert.match(gate({availability:'provided',raw:"contains(github.ref, 'always()')"}),/unknown/);
 assert.match(gate({availability:'provided',raw:"github.ref == 'always()'"}),/implicit success/);
 bad(v=>delete v.jobs[0].condition,'ci/shape');bad(v=>v.kind='gha-graph-report','ci/snapshot');
});
test('dynamic matrices and include/exclude stay unknown rather than zero or invented combinations',()=>{
 assert.equal(matrixReading({kind:'dynamic',raw:'${{ fromJSON(needs.build.outputs.matrix) }}'}).combinations,null);
 assert.equal(matrixReading({kind:'literal',axes:{node:[20,22]},modifiers:['exclude']}).combinations,null);
 assert.equal(matrixReading({kind:'unknown'}).combinations,null);
 assert.throws(()=>matrixReading({kind:'literal',axes:{node:['${{ inputs.node }}']},modifiers:[]}),e=>e.code==='ci/literal-expression');
});
test('missing needs, cycles, duplicate ids and absent coverage cannot become a successful DAG',()=>{
 bad(v=>v.jobs[2].needs=['missing'],'ci/missing-needs');bad(v=>v.jobs[0].needs=['publish'],'ci/cycle');bad(v=>v.jobs[1].id='quality','ci/job-id');bad(v=>delete v.coverage.outputs,'ci/coverage');bad(v=>v.coverage.outputs='not-run','ci/coverage');
});
test('dangerous literals remain JSON snippets and are never evaluated or used as commands',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ci-literal-'));try{
  const marker=path.join(dir,'must-not-exist'),v=fixture();v.source.classification='synthetic';v.jobs[2].condition.raw=`<script>throw 1</script> $(touch ${marker})`;
  v.jobs[0].matrix.axes.node=[`$(touch ${marker})`,'<img src=x onerror=alert(1)>'];
  const out=compileSnapshot(v);assert.equal(out.receipt.jobs[0].matrix.combinations,2);assert.match(out.receipt.jobs[2].statusGate,/unknown/);const blocks=[...out.markdown.matchAll(/```json\n([\s\S]*?)\n```/gu)].map(m=>JSON.parse(m[1]));assert.deepEqual(blocks.find(b=>b.id==='publish').condition,v.jobs[2].condition);const input=path.join(dir,'snapshot.json'),bundle=path.join(dir,'bundle');fs.writeFileSync(input,JSON.stringify(v));writeBundle(input,bundle);const rendered=spawnSync(process.execPath,[new URL('../../archify/bin/archify.mjs',import.meta.url).pathname,'render','explainer',path.join(bundle,'conditions.archify.md'),path.join(bundle,'out.html')],{encoding:'utf8'});assert.equal(rendered.status,0,rendered.stderr);const html=fs.readFileSync(path.join(bundle,'out.html'),'utf8');assert.equal(html.includes('<script>throw 1</script>'),false);assert.equal(html.includes('<img src=x onerror=alert(1)>'),false);assert.equal(fs.existsSync(marker),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('fresh exclusive bundles preserve real directory and symlink victims; later conflict only cleans owned files',context=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ci-victim-'));try{
  const input=path.join(dir,'input.json');fs.writeFileSync(input,JSON.stringify(fixture()));const bytes=fs.readFileSync(input);assert.throws(()=>writeBundle(input,input));assert.deepEqual(fs.readFileSync(input),bytes);
  const victim=path.join(dir,'victim');fs.mkdirSync(victim);fs.writeFileSync(path.join(victim,'keep'),'sentinel');const link=path.join(dir,'link');fs.symlinkSync(victim,link);assert.throws(()=>writeBundle(input,victim));assert.throws(()=>writeBundle(input,link));
  const fresh=path.join(dir,'fresh'),original=fs.openSync;context.mock.method(fs,'openSync',function(file,...args){if(String(file)===path.join(fresh,'reading.receipt.json')&&!fs.existsSync(file))fs.symlinkSync(path.join(victim,'keep'),file);return original.call(fs,file,...args);});
  assert.throws(()=>writeBundle(input,fresh),e=>e.code==='EEXIST');assert.equal(fs.readFileSync(path.join(victim,'keep'),'utf8'),'sentinel');assert.equal(fs.existsSync(path.join(fresh,'needs.json')),false);assert.ok(fs.lstatSync(path.join(fresh,'reading.receipt.json')).isSymbolicLink());
 }finally{context.mock.restoreAll();fs.rmSync(dir,{recursive:true,force:true});}
});
test('CLI fails missing dependency without creating an output directory',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ci-failure-'));try{const v=fixture();v.jobs[1].needs=['missing'];const input=path.join(dir,'bad.json');fs.writeFileSync(input,JSON.stringify(v));const out=path.join(dir,'out');const r=spawnSync(process.execPath,[new URL('./ci-reader.mjs',import.meta.url).pathname,input,out],{encoding:'utf8'});assert.equal(r.status,1);assert.equal(JSON.parse(r.stderr).code,'ci/missing-needs');assert.equal(fs.existsSync(out),false);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('job IDs reject absent, null and boolean values instead of JS regex coercion',()=>{
 for(const value of [undefined,null,true,false,42])bad(v=>{v.jobs[0].id=value;},'ci/job-id');
});
test('matrix counts never return rounded integers beyond the safe exact limit',()=>{
 const axes=Object.fromEntries(Array.from({length:10},(_,i)=>[`axis${i}`,Array.from({length:97},(_,n)=>n)]));
 assert.throws(()=>matrixReading({kind:'literal',axes,modifiers:[]}),e=>e.code==='ci/matrix-overflow');
 assert.equal(matrixReading({kind:'literal',axes:{one:[1,2],two:[3,4]},modifiers:[]}).combinations,4);
});
test('overview exposes condition availability and matrix counts without interpreting raw literals',()=>{
 const v=fixture(),out=compileSnapshot(v);assert.ok(out.markdown.includes('| Job | Raw if or availability | Status gate | Declared matrix |'));assert.ok(out.markdown.includes('3 declared combinations'));assert.ok(out.markdown.includes('`'+v.jobs[2].condition.raw+'`'));
 v.jobs[2].condition.raw='literal `backtick` | <img src=x>\nsecond line';const changed=compileSnapshot(v);assert.ok(changed.markdown.includes('raw text retained in job evidence below'));const blocks=[...changed.markdown.matchAll(/```json\n([\s\S]*?)\n```/gu)].map(m=>JSON.parse(m[1]));assert.equal(blocks.find(b=>b.id==='publish').condition.raw,v.jobs[2].condition.raw);
});
