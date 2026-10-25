import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, symlinkSync, existsSync, rmSync, mkdirSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { compare, generate, documents } from './compare.mjs';
const base = (before, after, extra = {}) => ({ caller: 'Client', callee: 'API', operation: 'GET /demo', arrayMode: 'index', before, after, ...extra });

test('preserves missing/null and scalar types, including root replacement', () => {
  const { changes } = compare(base({ n: null, count: '2' }, { added: null, count: 2 }));
  assert.deepEqual(changes.map(x => [x.kind, x.beforePointer, x.afterPointer]), [['added', null, '/added'], ['modified', '/count', '/count'], ['removed', '/n', null]]);
  assert.deepEqual(changes[0].before, { present: false });
  assert.deepEqual(changes[0].after, { present: true, type: 'null', value: null });
  assert.equal(changes[1].before.type, 'string'); assert.equal(changes[1].after.type, 'number');
  assert.equal(compare(base(null, false)).changes[0].afterPointer, '');
});
test('escapes JSON Pointer keys and treats prototype-like keys as ordinary own data', () => {
  const before = JSON.parse('{"__proto__":1,"a/b~c":0}');
  const after = JSON.parse('{"__proto__":2,"a/b~c":1}');
  assert.deepEqual(compare(base(before, after)).changes.map(c => c.afterPointer), ['/__proto__', '/a~1b~0c']);
  assert.equal({}.polluted, undefined);
});
test('explicit id strategy follows reordered rows, preserves pointers and records order', () => {
  const b = [{ id: 'a', x: 1 }, { id: 'b', x: 2 }], a = [{ id: 'b', x: 3 }, { id: 'a', x: 1 }];
  const d = compare(base(b, a, { arrayMode: 'id', idKey: 'id' }));
  assert.equal(d.changes.length, 2); assert.match(d.changes[0].note, /order/);
  assert.deepEqual([d.changes[1].beforePointer, d.changes[1].afterPointer, d.changes[1].before.value, d.changes[1].after.value], ['/1/x', '/0/x', 2, 3]);
  assert.equal(compare(base(b, a)).changes.length, 4);
});
test('id matching handles additions and removals; numeric and string ids remain distinct', () => {
  const d = compare(base([{ id: 1 }, { id: '1' }], [{ id: '1' }, { id: 2 }], { arrayMode: 'id', idKey: 'id' }));
  assert.deepEqual(d.changes.map(c => c.kind), ['modified', 'removed', 'added']);
});
test('rejects duplicate/missing identity even if arrays are unchanged; never guesses', () => {
  for (const a of [[{ id: 1 }, { id: 1 }], [{ x: 1 }], [1], [{ id: null }]]) assert.throws(() => compare(base(a, a, { arrayMode: 'id', idKey: 'id' })), /idKey/);
  assert.throws(() => compare(base([], [], { arrayMode: 'id' })), /idKey/);
  assert.throws(() => compare(base([], [], { idKey: 'id' })), /idKey/);
});
test('ignores object key order, empty containers compare correctly, explicit index policy required', () => {
  assert.equal(compare(base({ a: 1, b: [] }, { b: [], a: 1 })).changes.length, 0);
  assert.equal(compare(base([], [null])).changes[0].kind, 'added');
  assert.throws(() => compare(base(1, 2, { arrayMode: undefined })), /arrayMode/);
});
test('rejects excessive depth, arrays, strings, unsafe numbers and metadata injection', () => {
  let deep = 1; for (let i = 0; i < 15; i++) deep = { a: deep };
  for (const v of [deep, Array(101).fill(1), 'x'.repeat(1001), Infinity, 9007199254740992]) assert.throws(() => compare(base(v, null)));
  assert.throws(() => compare(base(1, 2, { caller: 'x\n@diagram' })), /caller/);
  assert.throws(() => compare({ ...base(1, 2), extra: true }), /field/);
});
test('escapes hostile strings in Markdown and retains complete original typed values in JSON', () => {
  const i = base({ a: '<script>|`\n@diagram' }, {}), d = compare(i), docs = documents(i, d);
  assert.equal(JSON.parse(docs['delta.json']).changes[0].before.value, i.before.a);
  assert.match(docs['review.archify.md'], /`string: /);
  assert.equal(JSON.parse(docs['delta.json']).changes[0].beforePointer, '/a');
  assert.match(docs['call.sequence.json'], /arrays: index/);
});
test('fresh outputs refuse existing destinations and symlinks without modifying victims', () => {
  const root = mkdtempSync(path.join(realpathSync(tmpdir()), 'payload-test-'));
  try {
    const input = path.join(root, 'input.json'), victim = path.join(root, 'victim'); mkdirSync(victim); writeFileSync(path.join(victim, 'delta.json'), 'precious'); writeFileSync(input, JSON.stringify(base(1, 2)));
    const out = path.join(root, 'out'); generate(input, out); assert.equal(JSON.parse(readFileSync(path.join(out, 'delta.json'))).changes[0].after.value, 2);
    assert.throws(() => generate(input, out));
    symlinkSync(victim, path.join(root, 'link')); assert.throws(() => generate(input, path.join(root, 'link'))); assert.throws(() => generate(input, path.join(root, 'link', 'child')), /ancestors/);
    symlinkSync(input, path.join(root, 'input-link')); assert.throws(() => generate(path.join(root, 'input-link'), path.join(root, 'new')));
    assert.equal(readFileSync(path.join(victim, 'delta.json'), 'utf8'), 'precious'); assert.equal(existsSync(path.join(victim, 'child')), false);
    writeFileSync(input, 'x'.repeat(65537)); assert.throws(() => generate(input, path.join(root, 'oversized')), /64 KiB/); assert.equal(existsSync(path.join(root, 'oversized')), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('public renderer keeps payload syntax and pointer controls literal; unencoded controls fail or link', () => {
  const root = mkdtempSync(path.join(realpathSync(tmpdir()), 'payload-public-'));
  const cli = fileURLToPath(new URL('../../archify/bin/archify.mjs', import.meta.url));
  const run = (input, output) => spawnSync(process.execPath, [cli, 'render', 'explainer', input, output], { encoding: 'utf8', timeout: 60000, maxBuffer: 2 * 1024 * 1024 });
  try {
    const values = ['[evidence](https://example.invalid/not-source)', '![probe](https://example.invalid/x.png)', '[run](javascript:alert(1))', '`tick`|pipe\nnext', '**strong** ~~strike~~', 'back\\slash', '<script>'];
    const before = Object.fromEntries(values.map((v, index) => [v + index, v]));
    before['a\nb\rc\td\u0000e'] = 'controls';
    before['a\\nb'] = 'literal-backslash-n';
    const i = base(before, {}), d = compare(i), docs = documents(i, d);
    for (const [name, data] of Object.entries(docs)) writeFileSync(path.join(root, name), data);
    const rendered = run(path.join(root, 'review.archify.md'), path.join(root, 'literal.html'));
    assert.equal(rendered.status, 0, rendered.stderr);
    const html = readFileSync(path.join(root, 'literal.html'), 'utf8'), table = html.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0];
    assert.ok(table); assert.doesNotMatch(table, /<(?:a|img|script|strong|em)\b/);
    for (const value of ['[evidence](https://example.invalid/not-source)', '![probe](https://example.invalid/x.png)', '[run](javascript:alert(1))']) assert.ok(table.includes(value), value);
    assert.ok(table.includes('/a\\nb\\rc\\td\\u0000e'));
    assert.ok(table.includes('/a\\\\nb'));
    assert.ok(table.includes('\\u0060tick\\u0060|pipe'));
    assert.equal(JSON.parse(docs['delta.json']).changes.find(c => c.before.value === 'controls').beforePointer, '/a\nb\rc\td\u0000e');
    // Negative controls demonstrate why plain cell text is not a literal encoding.
    const plain = '# Control\n\nA synthetic negative control.\n\n## Values\n\n| Record | Value |\n| --- | --- |\n| c1 | REPLACE |\n';
    writeFileSync(path.join(root, 'plain-link.md'), plain.replace('REPLACE', values[0]));
    const link = run(path.join(root, 'plain-link.md'), path.join(root, 'plain-link.html'));
    assert.equal(link.status, 0, link.stderr);
    assert.match(readFileSync(path.join(root, 'plain-link.html'), 'utf8'), /<a href="https:\/\/example\.invalid\/not-source"/);
    for (const [index, value] of [values[1], values[2]].entries()) {
      const file = path.join(root, `plain-${index}.md`); writeFileSync(file, plain.replace('REPLACE', value));
      const result = run(file, path.join(root, `plain-${index}.html`));
      assert.notEqual(result.status, 0); assert.match(result.stderr, /inline-(?:image|target)/);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});
