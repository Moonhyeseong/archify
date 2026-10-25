import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { convert } from './convert.mjs';

const dep = (to, extra = {}) => ({ module: to, resolved: to, dependencyTypes: ['local'], coreModule: false, followable: true, couldNotResolve: false, ...extra });
const module = (source, dependencies = []) => ({ source, dependencies, valid: true });
const fixture = () => ({ modules: [
  module('src/a.js', [dep('src/b.js', { circular: true }), dep('src/a.js', { circular: true }), dep('missing', { couldNotResolve: true, followable: false }), dep('node:fs', { coreModule: true, dependencyTypes: ['core'], followable: false }), dep('omitted.js')]),
  module('src/b.js', [dep('src/a.js', { circular: true }), dep('src/types.ts', { typeOnly: true }), dep('src/types.ts', { dynamic: true })]),
  module('src/types.ts'), module('isolated.js')
], summary: { totalCruised: 4 } });

test('all original directed records survive including reverse cycles, self, type-only, dynamic and unknown targets', () => {
  const input = fixture();
  const { spec, receipt } = convert(input, { entry: 'src/a.js', depth: 2, maxNodes: 12 });
  assert.deepEqual(receipt.originalReport, input);
  assert.equal(receipt.edges.length, 8);
  const id = name => receipt.nodes.find(n => n.source === name).id;
  assert.ok(spec.connections.some(e => e.from === id('src/a.js') && e.to === id('src/b.js')));
  assert.ok(spec.connections.some(e => e.from === id('src/b.js') && e.to === id('src/a.js')));
  const self = receipt.edges.find(e => e.from === e.to);
  assert.equal(self.disposition, 'self-dependency-listed');
  assert.ok(spec.cards.some(c => c.items.some(item => item.includes(self.id))));
  assert.equal(receipt.edges.filter(e => e.raw.circular).length, 3);
  assert.equal(receipt.edges.find(e => e.raw.dynamic).disposition, 'parallel-record-listed');
  assert.ok(receipt.edges.find(e => e.raw.typeOnly).raw.typeOnly);
  assert.equal(receipt.nodes.find(n => n.source === 'missing').category, 'unresolved');
  assert.equal(receipt.nodes.find(n => n.source === 'node:fs').category, 'external');
  assert.equal(receipt.nodes.find(n => n.source === 'omitted.js').category, 'missing-record');
});

test('depth/max-node selection accounts for each omitted node and every input edge', () => {
  const { spec, receipt } = convert(fixture(), { entry: 'src/a.js', depth: 1, maxNodes: 2 });
  assert.equal(spec.components.length, 2);
  assert.equal(receipt.nodes.filter(n => n.disposition === 'max-nodes').length, 3);
  assert.equal(receipt.nodes.find(n => n.source === 'isolated.js').disposition, 'outside-entry-depth');
  assert.equal(receipt.nodes.find(n => n.source === 'src/types.ts').disposition, 'outside-entry-depth');
  assert.equal(receipt.edges.length, fixture().modules.reduce((n, m) => n + m.dependencies.length, 0));
  assert.ok(receipt.edges.every(e => ['drawn', 'outside-selected-view', 'self-dependency-listed', 'parallel-record-listed'].includes(e.disposition)));
  assert.ok(spec.cards.some(c => c.items.some(s => s.includes('outside this selected view'))));
});

test('stable node identities and focus choice survive shuffled report order', () => {
  const input = fixture();
  const a = convert(input, { entry: 'src/a.js', depth: 2, maxNodes: 4 });
  input.modules.reverse();
  const b = convert(input, { entry: 'src/a.js', depth: 2, maxNodes: 4 });
  assert.deepEqual(a.receipt.nodes, b.receipt.nodes);
});

test('malformed reports and ambiguous identity fail instead of inventing empty clean graphs', () => {
  for (const input of [{}, { modules: [], summary: {} }, { modules: [module('a'), module('a')], summary: {} }, { modules: [module('a', [{ resolved: 'b' }])], summary: {} }]) assert.throws(() => convert(input));
  const invalid = fixture();
  invalid.modules[0].dependencies[0].typeOnly = 'false';
  assert.throws(() => convert(invalid), /typeOnly/);
  assert.throws(() => convert(fixture(), { entry: 'unknown' }), /entry/);
  for (const options of [{ depth: -1 }, { depth: 0.5 }, { depth: 7 }, { maxNodes: 0 }, { maxNodes: 13 }, { maxNodes: NaN }]) assert.throws(() => convert(fixture(), options));
});

test('official upstream sample imports all 19 records and gives explicit bounded coverage', async () => {
  const input = JSON.parse(await readFile(new URL('./fixtures/official-sample.json', import.meta.url)));
  const { receipt, spec } = convert(input, { entry: 'test/cli/fixtures/cjs/root_one.js', depth: 1, maxNodes: 7 });
  assert.equal(receipt.edges.length, 19);
  assert.equal(spec.components.length, 7);
  assert.equal(spec.connections.length, 6);
  assert.equal(receipt.counts.omittedRecords, 13);
  assert.equal(receipt.nodes.find(n => n.source.endsWith('/somemodule.js')).category, 'external');
});

test('CLI refuses existing output and unknown flags without altering existing files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dependency-map-'));
  try {
    const input = join(root, 'input.json');
    await writeFile(input, JSON.stringify(fixture()));
    const script = fileURLToPath(new URL('./convert.mjs', import.meta.url));
    const run = args => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
    const out = join(root, 'out');
    assert.equal(run(['--input', input, '--out', out, '--depth', '2']).status, 0);
    const previous = await readFile(join(out, 'map.architecture.json'), 'utf8');
    const rejected = run(['--input', input, '--out', out]);
    assert.equal(rejected.status, 1);
    assert.match(rejected.stderr, /existing output is preserved/);
    assert.equal(await readFile(join(out, 'map.architecture.json'), 'utf8'), previous);
    const inputBefore = await readFile(input, 'utf8');
    assert.equal(run(['--input', input, '--out', input]).status, 1);
    assert.equal(await readFile(input, 'utf8'), inputBefore);
    const linked = join(root, 'linked');
    await symlink(out, linked, 'dir');
    assert.equal(run(['--input', input, '--out', linked]).status, 1);
    assert.equal(await readFile(join(out, 'map.architecture.json'), 'utf8'), previous);
    assert.equal(run(['--input', input, '--out', join(root, 'never'), '--force', 'yes']).status, 1);
    assert.equal(run(['--input', input, '--out', join(root, 'never'), '--depth', 'NaN']).status, 1);
  } finally { await rm(root, { recursive: true, force: true }); }
});
