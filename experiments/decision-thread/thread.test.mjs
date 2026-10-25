import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { compileThread,writeBundle } from './thread-to-archify.mjs';
const fixture=()=>JSON.parse(fs.readFileSync(new URL('./fixtures/fictional.json',import.meta.url)));
const expectFailure=(mutate,code)=>{const v=fixture();mutate(v);assert.throws(()=>compileThread(v),e=>e.code===code);};
test('exact events, references and immutable history survive in ordinal sequence and evidence',()=>{
 const input=fixture(); input.events.reverse(); const out=compileThread(input);
 assert.deepEqual(out.sequence.messages.map(e=>e.id),['m1','m2','m3','m4','m5','m6','m7']);
 assert.deepEqual(out.receipt.unresolvedObjections,['m4']); assert.deepEqual(out.receipt.recordedDecisionEvents,['m6']);
 assert.equal(out.receipt.agreement,'not inferred');
 for(const e of input.events){assert.ok(out.markdown.includes(JSON.stringify(e,null,2)));assert.ok(out.markdown.includes(`{#event-${e.id}}`));const m=out.receipt.events.find(x=>x.id===e.id);assert.equal(input.events[m.originalIndex].id,e.id);assert.deepEqual(m.references,e.references);}
 assert.ok(out.markdown.includes('m2: objection'));assert.ok(out.markdown.includes('m5: withdrawal'));
});
test('timestamp-only input sorts deterministically but never claims duration',()=>{
 const v=fixture();for(const e of v.events){e.timestamp=`2026-10-25T00:00:0${e.order}.000Z`;delete e.order;}v.events.reverse();
 const out=compileThread(v);assert.equal(out.sequence.messages[0].id,'m1');assert.equal(out.receipt.orderMode,'timestamp-order');assert.match(out.receipt.timingMeaning,/no duration/);
});
test('missing context, duplicate identity and invalid participants cannot become invented agreement',()=>{
 expectFailure(v=>v.events[2].references.push('missing'),'thread/missing-reference');
 expectFailure(v=>v.events[2].id='m1','thread/duplicate-id');
 expectFailure(v=>v.events[1].to='nobody','thread/unknown-participant');
 expectFailure(v=>v.events[0].references=['m7'],'thread/forward-reference');
 expectFailure(v=>delete v.events[3].objectionStatus,'thread/objection-status');
 expectFailure(v=>delete v.events[2].references,'thread/references');
});
test('order, timestamp conflicts and malformed dates fail explicitly',()=>{
 expectFailure(v=>v.events[1].order=1,'thread/order-conflict');
 expectFailure(v=>delete v.events[0].order,'thread/mixed-order');
 expectFailure(v=>v.events[0].timestamp='2026-10-25T00:00:00.000Z','thread/mixed-time');
 expectFailure(v=>{for(const e of v.events)e.timestamp='2026-10-25T00:00:00.000Z';},'thread/timestamp-conflict');
 expectFailure(v=>v.events[0].timestamp='2026-02-30T00:00:00.000Z','thread/timestamp');
 expectFailure(v=>{for(const e of v.events)e.timestamp=`2026-10-25T00:00:0${8-e.order}.000Z`;},'thread/timestamp-conflict');
});
test('privacy declaration and unknown hidden-content fields are rejected; snippets remain literal',()=>{
 expectFailure(v=>delete v.declaration,'thread/declaration');
 expectFailure(v=>v.events[0].reasoning='hidden content','thread/unsupported-field');
 const v=fixture();v.events[0].text='Literal ``` and <script>alert(1)</script> should remain evidence.';
 const out=compileThread(v);assert.ok(out.markdown.includes('````json'));assert.ok(out.markdown.includes(JSON.stringify(v.events[0],null,2)));
});
test('CLI and writer protect real victims, existing directories, symlinks and input aliases',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-decision-victim-'));
 try{
  const input=path.join(dir,'input.json');fs.writeFileSync(input,JSON.stringify(fixture()));
  const bytes=fs.readFileSync(input);assert.throws(()=>writeBundle(input,input));assert.deepEqual(fs.readFileSync(input),bytes);
  const victim=path.join(dir,'victim');fs.mkdirSync(victim);fs.writeFileSync(path.join(victim,'keep.txt'),'preserve');
  assert.throws(()=>writeBundle(input,victim));const link=path.join(dir,'link');fs.symlinkSync(victim,link);assert.throws(()=>writeBundle(input,link));assert.equal(fs.readFileSync(path.join(victim,'keep.txt'),'utf8'),'preserve');
  const fresh=path.join(dir,'fresh');assert.equal(writeBundle(input,fresh).eventCount,7);assert.equal(JSON.parse(fs.readFileSync(path.join(fresh,'thread.input.json'))).events.length,7);
  const invalid=path.join(dir,'invalid.json');fs.writeFileSync(invalid,'{"version":1}');
  const run=spawnSync(process.execPath,[new URL('./thread-to-archify.mjs',import.meta.url).pathname,invalid,path.join(dir,'must-not-exist')],{encoding:'utf8'});
  assert.equal(run.status,1);assert.equal(fs.existsSync(path.join(dir,'must-not-exist')),false);assert.equal(JSON.parse(run.stderr).ok,false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('a later output collision only cleans files created by this invocation',context=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-decision-rollback-'));
 try{
  const input=path.join(dir,'input.json'),victim=path.join(dir,'victim.txt'),output=path.join(dir,'fresh');
  fs.writeFileSync(input,JSON.stringify(fixture()));fs.writeFileSync(victim,'keep unrelated bytes');
  const originalOpen=fs.openSync;
  context.mock.method(fs,'openSync',function(file,...args){
   if(String(file)===path.join(output,'thread.receipt.json')&&!fs.existsSync(file))fs.symlinkSync(victim,file);
   return originalOpen.call(fs,file,...args);
  });
  assert.throws(()=>writeBundle(input,output),e=>e.code==='EEXIST');
  assert.equal(fs.readFileSync(victim,'utf8'),'keep unrelated bytes');
  assert.ok(fs.lstatSync(path.join(output,'thread.receipt.json')).isSymbolicLink());
  assert.equal(fs.existsSync(path.join(output,'thread.sequence.json')),false);
  assert.equal(fs.existsSync(path.join(output,'thread.input.json')),false);
 }finally{context.mock.restoreAll();fs.rmSync(dir,{recursive:true,force:true});}
});

test('visual keys have explicit event-kind legends rather than protocol-domain claims',()=>{
 const out=compileThread(fixture());
 const entries=out.sequence.meta.legend.entries;
 assert.deepEqual(entries,{default:{label:'Message'},security:{label:'Objection'},emphasis:{label:'Decision'},return:{label:'Withdrawal'}});
 const expected={objection:'Objection',decision:'Decision',withdrawal:'Withdrawal',proposal:'Message',revision:'Message',message:'Message'};
 for(const e of fixture().events){const message=out.sequence.messages.find(m=>m.id===e.id);assert.equal(entries[message.variant].label,expected[e.kind]);assert.equal(message.label,`${e.id}: ${e.kind}`);}
});
