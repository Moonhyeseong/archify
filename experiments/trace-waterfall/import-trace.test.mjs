import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { convertTrace, readTrace, writeFreshOutputs, LIMITS } from './import-trace.mjs';

const sample = (fields = {}) => ({ ph: 'X', name: 'Synthetic interval', pid: 1, tid: 0, ts: 1000, dur: 25, ...fields });
const convert = events => convertTrace(events, { evidence: 'illustrative' });

test('common origin preserves duration, overlap, zero-length intervals and independent groups', () => {
  const { diagram, report } = convert([
    sample({ ts: 1030, dur: 100, pid: 2 }), sample({ ts: 1010, dur: 20 }),
    sample({ ts: 1020, dur: 0, tid: 1 }), sample({ ts: 1000, dur: 100 }),
  ]);
  assert.deepEqual(diagram.spans.map(s => [s.start, s.duration]), [[0, 100], [10, 20], [20, 0], [30, 100]]);
  assert.equal(diagram.meta.unit, 'us');
  assert.equal(report.originUs, 1000);
  assert.equal(new Set(diagram.spans.map(s => s.service)).size, 3);
  assert.ok(diagram.spans.every(s => !('parent' in s)));
});

test('unsupported phases remain visible in report, metadata only labels groups', () => {
  const { diagram, report } = convertTrace({ traceEvents: [
    sample(), { ph: 'M', name: 'thread_name', pid: 1, tid: 0, args: { name: 'Main' } },
    { ph: 'B' }, { ph: 'E' }, { ph: 'C' }, { ph: 'B' },
  ] }, { evidence: 'illustrative' });
  assert.deepEqual(report.unsupportedPhases, { B: 2, C: 1, E: 1, M: 1 });
  assert.match(diagram.spans[0].service, /Main/);
  assert.equal(report.inputEvents, 6);
  assert.equal(report.convertedSpans, 1);
});

test('invalid timing is refused rather than guessed or clipped', () => {
  for (const fields of [{ ts: undefined }, { dur: undefined }, { ts: -1 }, { dur: -1 }, { ts: Infinity }, { dur: NaN }, { ts: '1000' }, { ts: Number.MAX_SAFE_INTEGER, dur: 10 }]) {
    assert.throws(() => convert([sample(fields)]), /invalid ts\/dur|safe numeric range/);
  }
});

test('invalid structure and identity fail with the offending boundary', () => {
  for (const value of [null, {}, { traceEvents: 'bad' }]) assert.throws(() => convertTrace(value, { evidence: 'illustrative' }), /Expected/);
  for (const fields of [{ pid: null }, { tid: '' }, { name: '' }, { ph: '' }]) assert.throws(() => convert([sample(fields)]), /pid\/tid|missing name|missing phase/);
  assert.throws(() => convert([null]), /missing phase/);
  assert.throws(() => convert([{ ph: 'B' }]), /No complete X.*B/);
});

test('evidence must be chosen explicitly; arbitrary JSON cannot self-certify', () => {
  assert.throws(() => convertTrace({ collector: { evidence: 'measured' }, traceEvents: [sample()] }), /Choose evidence/);
  assert.equal(convert([sample()]).diagram.meta.evidence, 'illustrative');
  assert.equal(convertTrace([sample()], { evidence: 'measured' }).diagram.meta.evidence, 'measured');
});

test('event and span limits refuse whole input with no silent truncation', () => {
  assert.throws(() => convert(Array.from({ length: LIMITS.events + 1 }, () => ({ ph: 'I' }))), /Event limit/);
  assert.throws(() => convert(Array.from({ length: LIMITS.spans + 1 }, () => sample())), /Span limit/);
  assert.equal(convert(Array.from({ length: LIMITS.spans }, () => sample())).diagram.spans.length, LIMITS.spans);
});

test('file reader limits bytes and reports digest of exactly the parsed bytes', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'trace-import-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const source = path.join(directory, 'input.json');
  fs.writeFileSync(source, JSON.stringify([sample()]));
  const result = readTrace(source);
  assert.deepEqual(result.input, [sample()]);
  assert.match(result.sha256, /^[a-f0-9]{64}$/);
  assert.equal(result.bytes, fs.statSync(source).size);
  fs.writeFileSync(source, Buffer.alloc(LIMITS.bytes + 1, 32));
  assert.throws(() => readTrace(source), /File limit/);
});

test('CLI rejects invalid input without creating outputs and preserves existing destinations', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'trace-import-cli-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const source = path.join(directory, 'input.json');
  const output = path.join(directory, 'output.json');
  const cli = fileURLToPath(new URL('./import-trace.mjs', import.meta.url));
  fs.writeFileSync(source, JSON.stringify([sample({ dur: -1 })]));
  const bad = spawnSync(process.execPath, [cli, source, output, 'illustrative'], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.equal(fs.existsSync(output), false);
  assert.equal(fs.existsSync(`${output}.import-report.json`), false);
  fs.writeFileSync(source, JSON.stringify([sample()]));
  const good = spawnSync(process.execPath, [cli, source, output, 'illustrative'], { encoding: 'utf8' });
  assert.equal(good.status, 0, good.stderr);
  const before = fs.readFileSync(output, 'utf8');
  const again = spawnSync(process.execPath, [cli, source, output, 'measured'], { encoding: 'utf8' });
  assert.equal(again.status, 1);
  assert.equal(fs.readFileSync(output, 'utf8'), before);
});

test('fresh outputs protect real victims, dangling symlinks, input aliases and partial-write cleanup', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'trace-import-victim-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const victim = path.join(directory, 'victim.json');
  const report = path.join(directory, 'report.json');
  const output = path.join(directory, 'output.json');
  const absent = path.join(directory, 'must-not-be-created.json');
  fs.writeFileSync(victim, 'unrelated bytes');
  fs.symlinkSync(victim, output);
  const collector = fileURLToPath(new URL('./collect-workload.mjs', import.meta.url));
  const collection = spawnSync(process.execPath, [collector, output], { encoding: 'utf8' });
  assert.equal(collection.status, 1);
  assert.equal(fs.readFileSync(victim, 'utf8'), 'unrelated bytes');
  assert.throws(() => writeFreshOutputs([[report, {}], [output, {}]]), /EEXIST/);
  assert.equal(fs.readFileSync(victim, 'utf8'), 'unrelated bytes');
  assert.equal(fs.existsSync(report), false);
  assert.ok(fs.lstatSync(output).isSymbolicLink());
  fs.unlinkSync(output);
  fs.symlinkSync(absent, output);
  assert.throws(() => writeFreshOutputs([[report, {}], [output, {}]]), /EEXIST/);
  assert.equal(fs.existsSync(absent), false);
  assert.equal(fs.existsSync(report), false);
  assert.ok(fs.lstatSync(output).isSymbolicLink());
  assert.throws(() => writeFreshOutputs([[victim, {}]]), /EEXIST/);
  assert.equal(fs.readFileSync(victim, 'utf8'), 'unrelated bytes');
  const input = path.join(directory, 'raw.json');
  const original = JSON.stringify([sample()]);
  fs.writeFileSync(input, original);
  const cli = fileURLToPath(new URL('./import-trace.mjs', import.meta.url));
  const alias = spawnSync(process.execPath, [cli, input, input, 'illustrative'], { encoding: 'utf8' });
  assert.equal(alias.status, 1);
  assert.equal(fs.readFileSync(input, 'utf8'), original);
  assert.equal(fs.existsSync(`${input}.import-report.json`), false);
});
