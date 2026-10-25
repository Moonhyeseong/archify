import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { convert, parseCsv } from './adapter.mjs';
const base = 'entity,coupled,degree,average-revs';
const full = base + ',first-entity-revisions,second-entity-revisions,shared-revisions';
const meta = { kind: 'synthetic' };

test('quoted comma, escaped quote, BOM and CRLF preserve exact CSV values', () => {
  assert.deepEqual(parseCsv('\uFEFFa,b\r\n"src/a,""b"".mjs",x\r\n'), [['a','b'], ['src/a,"b".mjs','x']]);
  const { evidence } = convert(base + '\n"src/a,""b"".mjs",x,50,10\n', meta);
  assert.equal(evidence.pairs[0].a, 'src/a,"b".mjs');
});
test('reversing endpoints and counts leaves symmetric evidence unchanged', () => {
  const a = convert(full + '\na,b,50,10,12,8,5', meta);
  const b = convert(full + '\nb,a,50,10,8,12,5', meta);
  assert.deepEqual(a.evidence.pairs, b.evidence.pairs);
  assert.deepEqual(a.graph, b.graph);
  assert.equal(a.evidence.pairs[0].counts.shared, 5);
  for (const edge of a.graph.connections) assert.equal(edge.from, 'pair-1');
});
test('default output preserves unknown counts, not reconstructed zeroes', () => {
  const r = convert(base + '\na,b,50,10', meta);
  assert.equal(r.evidence.pairs[0].counts, null);
  assert.match(r.markdown, /unknown \/ unknown/);
  assert.match(r.graph.components[1].sublabel, /unknown/);
});
test('identical reversed duplicate collapses; conflicting duplicate fails', () => {
  const r = convert(full + '\na,b,50,10,12,8,5\nb,a,50,10,8,12,5', meta);
  assert.equal(r.evidence.duplicatesCollapsed, 1);
  assert.equal(r.evidence.pairs.length, 1);
  assert.throws(() => convert(base + '\na,b,50,10\nb,a,51,10', meta), /conflicting/);
});
test('empty data reports no supplied pairs, never zero coupling', () => {
  const r = convert(base + '\n', meta);
  assert.deepEqual(r.evidence.pairs, []);
  assert.match(r.graph.components[0].sublabel, /unknown/);
  assert.match(r.markdown, /empty report proves no absence/);
});
test('score is integer symmetric average formula, not conditional probability', () => {
  const r = convert(full + '\na,b,44,5,7,2,2', meta);
  assert.equal(r.evidence.pairs[0].degree, 44);
  assert.equal(r.evidence.pairs[0].average, 5);
  assert.throws(() => convert(full + '\na,b,28,5,7,2,2', meta), /inconsistent/);
  assert.throws(() => convert(full + '\na,b,44,4,7,2,2', meta), /inconsistent/);
});
test('invalid values, inconsistent counts and schema ambiguity fail closed', () => {
  for (const score of ['NaN','Infinity','-1','101','1e2','','1.5']) assert.throws(() => convert(base + `\na,b,${score},10`, meta), /invalid degree/);
  for (const input of [full + '\na,b,50,10,1,2,5', base + '\na,a,50,10', base + '\na,b,50,0', base + ',shared-revisions\na,b,50,10,5', base + ',degree\na,b,50,10,50', base + '\na,b,50']) assert.throws(() => convert(input, meta));
});
test('malformed CSV is rejected, quoted newlines parse but paths reject controls', () => {
  for (const csv of ['a,b\n"x,y','a,b\nx"y,z','a,b\n"x"oops,z']) assert.throws(() => parseCsv(csv));
  assert.deepEqual(parseCsv('a\n"x\ny"'), [['a'],['x\ny']]);
  assert.throws(() => convert(base + '\n"a\nb",c,50,10', meta), /unsupported path/);
});
test('size limits are explicit and do not silently truncate a graph', () => {
  assert.throws(() => parseCsv('a'.repeat(200001)), /bytes/);
  assert.throws(() => convert(base + '\n' + Array.from({length:7},(_,i)=>`a${i},b${i},50,10`).join('\n'), meta), /6 unique/);
  assert.throws(() => convert(base + '\n' + Array(31).fill('a,b,50,10').join('\n'), meta), /30 data/);
});
test('CLI parsing failure preserves prior output and returns nonzero JSON error', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coupling-test-'));
  try {
    fs.writeFileSync(path.join(dir, 'bad.csv'), base+'\na,b,101,10');
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta));
    fs.mkdirSync(path.join(dir, 'out')); fs.writeFileSync(path.join(dir, 'out/evidence.json'), 'previous');
    const run = spawnSync(process.execPath, ['experiments/change-coupling/adapter.mjs', path.join(dir,'bad.csv'), path.join(dir,'meta.json'), path.join(dir,'out')], { encoding:'utf8' });
    assert.equal(run.status,1); assert.match(JSON.parse(run.stderr).error,/degree/);
    assert.equal(fs.readFileSync(path.join(dir,'out/evidence.json'),'utf8'),'previous');
  } finally { fs.rmSync(dir, {recursive:true,force:true}); }
});
test('unquoted path whitespace is original identity, not a trim alias', () => {
  const r = convert(base + '\n a,b ,50,10', meta);
  assert.equal(r.evidence.pairs[0].a, ' a');
  assert.equal(r.evidence.pairs[0].b, 'b ');
});
test('valid input refuses existing output symlink and preserves victim bytes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coupling-victim-'));
  try {
    fs.writeFileSync(path.join(dir,'input.csv'),base+'\na,b,50,10');
    fs.writeFileSync(path.join(dir,'meta.json'),JSON.stringify(meta));
    fs.mkdirSync(path.join(dir,'out'));
    fs.writeFileSync(path.join(dir,'victim'),'unrelated bytes');
    fs.symlinkSync(path.join(dir,'victim'),path.join(dir,'out/evidence.json'));
    const run = spawnSync(process.execPath,['experiments/change-coupling/adapter.mjs',path.join(dir,'input.csv'),path.join(dir,'meta.json'),path.join(dir,'out')],{encoding:'utf8'});
    assert.equal(run.status,1);
    assert.match(JSON.parse(run.stderr).error,/EEXIST/);
    assert.equal(fs.readFileSync(path.join(dir,'victim'),'utf8'),'unrelated bytes');
    assert.deepEqual(fs.readdirSync(path.join(dir,'out')),['evidence.json']);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
test('empty-report unknown state passes the real public renderer', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coupling-empty-'));
  try {
    fs.writeFileSync(path.join(dir,'empty.json'),JSON.stringify(convert(base,meta).graph));
    const run = spawnSync(process.execPath,['archify/bin/archify.mjs','render','architecture',path.join(dir,'empty.json'),path.join(dir,'empty.html'),'--quality','standard'],{encoding:'utf8'});
    assert.equal(run.status,0,run.stderr);
    assert.match(fs.readFileSync(path.join(dir,'empty.html'),'utf8'),/No supplied pairs/);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
