import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, mkdirSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { buildContract, ContractError, literalMarkdown, writeFreshResults } from './state-contract.mjs';

const fixture = () => JSON.parse(readFileSync(new URL('./fixtures/toggle.export.json', import.meta.url), 'utf8'));
const sidecar = () => ({ initialState: 11, expectedEvents: ['toggle', 'reset'] });
const rejectCode = (dag, side, code) => assert.throws(() => buildContract(dag, side), e => e instanceof ContractError && e.code === code);
const root = new URL('../../', import.meta.url).pathname;
const cli = new URL('./state-contract.mjs', import.meta.url).pathname;

test('toggle cycle remains two directed transitions and reset is undeclared in BOTH states', () => {
  const result = buildContract(fixture(), sidecar());
  assert.deepEqual(result.lifecycle.transitions.map(e => [e.from, e.to, e.label]), [
    ['state-11', 'state-27', 'toggle'], ['state-27', 'state-11', 'toggle'],
  ]);
  assert.deepEqual(result.matrix.rows.map(row => row.cells.map(cell => cell.status)), [['declared', 'undeclared'], ['declared', 'undeclared']]);
  assert.deepEqual(result.matrix.totals, { declared: 2, undeclared: 2 });
  assert.deepEqual(result.matrix.rows[1].cells[0].transitions, [{ edgeIndex: 1, to: 11 }]);
});

test('initial marker comes from sidecar numeric ID, independently of input order or labels', () => {
  const result = buildContract(fixture(), { initialState: 27, expectedEvents: ['toggle'] });
  assert.equal(result.lifecycle.mainPath[0], 'state-27');
  assert.equal(result.lifecycle.states.find(s => s.type === 'start').id, 'state-27');
  assert.equal(result.lifecycle.states.find(s => s.id === 'state-11').type, 'neutral');
  assert.equal(result.lifecycle.states.some(s => ['success', 'failure'].includes(s.type)), false);
  assert.match(result.explainer, /reading order does not identify a business success path/);
});

test('retains self loops, repeated state-event alternatives and unlisted declared events', () => {
  const dag = fixture();
  dag.edges.push({ from: 11, to: 11, kind: 'event', label: 'reset' });
  dag.edges.push({ from: 11, to: 11, kind: 'event', label: 'toggle' });
  dag.edges.push({ from: 27, to: 27, kind: 'event', label: 'inspect' });
  const result = buildContract(dag, sidecar());
  assert.equal(result.lifecycle.transitions.length, 5);
  assert.deepEqual(result.matrix.rows[0].cells[0].transitions, [{ edgeIndex: 0, to: 27 }, { edgeIndex: 3, to: 11 }]);
  assert.deepEqual(result.matrix.eventsOutsideExpected, ['inspect']);
  assert.equal(result.matrix.rows[1].cells[1].status, 'undeclared');
  assert.match(result.explainer, /Runtime reachability, handler behavior, guard outcomes and business success are not established/);
});

test('explicit readingPath can only use supplied real edges, without decorative gap filling', () => {
  const dag = fixture();
  dag.nodes.push({ id: 42, kind: 'state', label: 'Paused' });
  dag.edges.push({ from: 27, to: 42, kind: 'event', label: 'pause' });
  const result = buildContract(dag, { ...sidecar(), readingPath: [11, 27, 42] });
  assert.deepEqual(result.lifecycle.mainPath, ['state-11', 'state-27', 'state-42']);
  assert.equal(result.lifecycle.transitions.length, 3);
  rejectCode(dag, { ...sidecar(), readingPath: [11, 42] }, 'state/reading-gap');
});

test('rejects all rich-machine semantics rather than dropping them', async t => {
  for (const kind of ['guard', 'reduce', 'action', 'invoke-machine', 'invoke-promise', 'nested']) await t.test(`node ${kind}`, () => {
    const dag = fixture(); dag.nodes[1].kind = kind;
    rejectCode(dag, sidecar(), 'state/unsupported-node');
  });
  for (const kind of ['immediate', 'side-effect']) await t.test(`edge ${kind}`, () => {
    const dag = fixture(); dag.edges[0].kind = kind;
    rejectCode(dag, sidecar(), 'state/unsupported-edge');
  });
  for (const field of ['delegate', 'guards', 'reducers', 'invoke', 'children']) await t.test(`hidden field ${field}`, () => {
    const dag = fixture(); dag.nodes[0][field] = {};
    rejectCode(dag, sidecar(), 'state/unsupported-field');
  });
});

test('rejects missing initial/events, invalid identities, endpoints and unlayoutable islands', async t => {
  await t.test('initial absent', () => rejectCode(fixture(), { expectedEvents: ['toggle'] }, 'state/id'));
  await t.test('initial unknown', () => rejectCode(fixture(), { ...sidecar(), initialState: 99 }, 'state/unknown-initial'));
  await t.test('events absent', () => rejectCode(fixture(), { initialState: 11 }, 'state/event-count'));
  await t.test('events duplicate', () => rejectCode(fixture(), { initialState: 11, expectedEvents: ['toggle', 'toggle'] }, 'state/duplicate-event'));
  await t.test('readingPath null', () => rejectCode(fixture(), { ...sidecar(), readingPath: null }, 'state/reading-path'));
  await t.test('duplicate ID', () => { const d = fixture(); d.nodes[1].id = 11; rejectCode(d, sidecar(), 'state/duplicate-id'); });
  await t.test('unknown target', () => { const d = fixture(); d.edges[0].to = 99; rejectCode(d, sidecar(), 'state/unknown-endpoint'); });
  await t.test('missing event name', () => { const d = fixture(); delete d.edges[0].label; rejectCode(d, sidecar(), 'state/text'); });
  await t.test('island', () => { const d = fixture(); d.nodes.push({ id: 99, label: 'Island', kind: 'state' }); rejectCode(d, sidecar(), 'state/disconnected-layout'); });
  await t.test('initial has no outgoing non-self edge', () => { const d = fixture(); d.edges = [d.edges[1]]; rejectCode(d, sidecar(), 'state/reading-path'); });
});

test('literal Markdown retains JSON values including pipes, backticks, directives and link-shaped text', () => {
  for (const label of ['[jump](https://evil.test)', '` | <x> & **bold**', '@diagram lifecycle source=other.json', 'line\nnext', '中文 \\ "quoted"']) {
    const literal = literalMarkdown(label);
    assert.equal(JSON.parse(literal.slice(1, -1)), label);
    assert.equal(literal.slice(1, -1).includes('`'), false);
    assert.equal(literal.slice(1, -1).includes('|'), false);
    assert.equal(literal.slice(1, -1).includes('['), false);
  }
});

test('fresh output boundary preserves existing regular targets, directories, symlink victims and input paths', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'state-contract-files-'));
  const input = join(dir, 'export.json'), side = join(dir, 'sidecar.json');
  writeFileSync(input, JSON.stringify(fixture())); writeFileSync(side, JSON.stringify(sidecar()));
  const run = output => spawnSync(process.execPath, [cli, input, side, output], { encoding: 'utf8' });
  try {
    await t.test('fresh path', () => {
      const output = join(dir, 'fresh'); assert.equal(run(output).status, 0);
      assert.equal(JSON.parse(readFileSync(join(output, 'state-contract.matrix.json'))).totals.undeclared, 2);
    });
    await t.test('regular target', () => {
      const output = join(dir, 'existing'); writeFileSync(output, 'user work');
      assert.equal(run(output).status, 1); assert.equal(readFileSync(output, 'utf8'), 'user work');
    });
    await t.test('existing directory contents', () => {
      const output = join(dir, 'directory'); mkdirSync(output); writeFileSync(join(output, 'state-contract.matrix.json'), 'previous');
      assert.equal(run(output).status, 1); assert.equal(readFileSync(join(output, 'state-contract.matrix.json'), 'utf8'), 'previous');
    });
    await t.test('symlink directory victim', () => {
      const victim = join(dir, 'victim'), output = join(dir, 'symlink'); mkdirSync(victim); writeFileSync(join(victim, 'state-contract.lifecycle.json'), 'precious'); symlinkSync(victim, output);
      assert.equal(run(output).status, 1); assert.equal(readFileSync(join(victim, 'state-contract.lifecycle.json'), 'utf8'), 'precious');
    });
    await t.test('input path alias', () => { assert.equal(run(input).status, 1); assert.deepEqual(JSON.parse(readFileSync(input)), fixture()); });
    await t.test('rejected rich export makes no output directory', () => {
      const d = fixture(); d.nodes[0].kind = 'guard'; writeFileSync(input, JSON.stringify(d));
      const output = join(dir, 'invalid'); assert.equal(run(output).status, 1); assert.equal(existsSync(output), false);
    });
    await t.test('machine JS is never executed', () => {
      const marker = join(dir, 'executed'); writeFileSync(input, `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'executed')`);
      assert.equal(run(join(dir, 'js-output')).status, 1); assert.equal(existsSync(marker), false);
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('multi-output failure removes owned files while preserving unrelated files', () => {
  const dir = mkdtempSync(join(tmpdir(), 'state-contract-cleanup-')), output = join(dir, 'run');
  const result = buildContract(fixture(), sidecar());
  // Simulate an unrelated writer after fresh directory creation and a later write failure.
  Object.defineProperty(result, 'explainer', { get() { writeFileSync(join(output, 'unrelated.txt'), 'preserve me'); return undefined; } });
  try {
    assert.throws(() => writeFreshResults(output, result));
    assert.equal(existsSync(join(output, 'state-contract.lifecycle.json')), false);
    assert.equal(existsSync(join(output, 'state-contract.matrix.json')), false);
    assert.equal(readFileSync(join(output, 'unrelated.txt'), 'utf8'), 'preserve me');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('public render preserves semantic edges and literal character boundaries without creating links', () => {
  const dir = mkdtempSync(join(tmpdir(), 'state-contract-render-'));
  try {
    const dag = fixture();
    dag.nodes[0].label = 'Off <&> ` |';
    dag.edges[0].label = '[jump](https://evil.test)';
    const result = buildContract(dag, { initialState: 11, expectedEvents: ['[jump](https://evil.test)', 'toggle', 'reset'] });
    const output = join(dir, 'run'); writeFreshResults(output, result);
    for (const [type, input, artifact] of [
      ['lifecycle', 'state-contract.lifecycle.json', 'lifecycle.html'],
      ['explainer', 'state-contract.archify.md', 'contract.html'],
    ]) {
      const rendered = spawnSync(process.execPath, ['archify/bin/archify.mjs', 'render', type, join(output, input), join(output, artifact), '--quality', 'showcase'], { cwd: root, encoding: 'utf8' });
      assert.equal(rendered.status, 0, `${rendered.stdout}\n${rendered.stderr}`);
    }
    const lifecycle = readFileSync(join(output, 'lifecycle.html'), 'utf8');
    const semanticPaths = [...lifecycle.matchAll(/<path\s[^>]*data-edge-from="([^"]+)"\s+data-edge-to="([^"]+)"[^>]*>/g)].map(match => [match[1], match[2]]);
    assert.deepEqual(semanticPaths, [['state-11', 'state-27'], ['state-27', 'state-11']]);
    const html = readFileSync(join(output, 'contract.html'), 'utf8');
    assert.equal(html.includes('href="https://evil.test"'), false);
    assert.match(html, /\\u005bjump\\u005d/);
    assert.match(html, /undeclared/);
    assert.match(lifecycle, /Off &lt;&amp;&gt;/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
