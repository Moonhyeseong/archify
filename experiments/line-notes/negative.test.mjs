import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCandidate} from './build-candidate.mjs';
const read = name => fs.readFileSync(new URL(name,import.meta.url),'utf8');
const baseline=read('baseline.html'),source=read('source/revision.mjs'),notes=JSON.parse(read('input/notes.json'));

for (const [name,mutate,invalidIds] of [
  ['line zero',s=>s.notes[0].originalLine=0,['text']],
  ['line beyond full blob',s=>s.notes[0].originalLine=21,['text']],
  ['wrong source digest',s=>s.notes[0].sourceSha256='0'.repeat(64),['text']],
  ['duplicate note identifier',s=>s.notes[1].noteId='text',['text']],
  ['duplicate block line',s=>s.notes[1].originalLine=6,['text','excerpt']],
]) test(name,()=>{
  const sidecar=structuredClone(notes);mutate(sidecar);
  const {html,audit}=buildCandidate(baseline,sidecar,source);
  for(const note of audit.notes.filter(n=>invalidIds.includes(n.noteId))) assert.equal(note.status,'invalid');
  for(const note of sidecar.notes.filter(n=>invalidIds.includes(n.noteId))){
    assert.ok(html.includes(note.text),'authored explanation remains');
    assert.ok(!html.includes(`href="#expnote-${note.blockId}-note-${note.noteId}"`),'invalid note has no source link');
    assert.ok(!html.includes(`href="#expnote-${note.blockId}-line-${note.originalLine}"`),'invalid binding has no return link');
  }
  assert.match(html,/引用无效/);
});
